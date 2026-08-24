#!/usr/bin/env python3
"""Standalone local web server for TradingAgents.

Everything in this file lives under web_ui/ and imports the existing package as
a library. The original CLI and framework files are not modified.
"""

from __future__ import annotations

import json
import mimetypes
import os
import re
import sys
import threading
import time
import urllib.error
import urllib.request
import uuid
from datetime import date, datetime
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
WEB_ROOT = Path(__file__).resolve().parent
DIST_DIR = WEB_ROOT / "dist"
DATA_DIR = WEB_ROOT / "data"
HISTORY_FILE = DATA_DIR / "history.json"
REPORTS_DIR = DATA_DIR / "reports"

sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(ROOT / ".env")

from langchain_core.callbacks import BaseCallbackHandler  # noqa: E402
from tradingagents.dataflows.market_data_validator import (  # noqa: E402
    build_verified_market_snapshot,
)
from tradingagents.default_config import DEFAULT_CONFIG  # noqa: E402
from tradingagents.graph.trading_graph import TradingAgentsGraph  # noqa: E402

HOST = "127.0.0.1"
PORT = int(os.environ.get("TRADINGAGENTS_WEB_PORT", "8787"))
OLLAMA_API = "http://127.0.0.1:11434"
MODEL = "qwen3:8b"
ALLOWED_ANALYSTS = {"market", "news", "social", "fundamentals"}
OUTPUT_TOKEN_BUDGETS = {1: 600, 2: 1000, 3: 1600}

JOBS: dict[str, dict] = {}
LOCK = threading.RLock()

STAGE_DEFS = [
    (
        "data",
        "Données",
        "Contrôle préalable du marché uniquement — Yahoo Finance : téléchargement ou lecture du cache local de 5 ans d’OHLCV quotidiens ajustés (ouverture, plus haut, plus bas, clôture, volume). Vérifications : aucune ligne après la date d’analyse, rejet si la dernière séance date de plus de 10 jours, sélection des 30 dernières clôtures et calcul local de 11 indicateurs (EMA/SMA, RSI, bandes de Bollinger, MACD, ATR).",
    ),
    ("analysts", "Analystes", "Les analystes sélectionnés produisent leurs rapports."),
    ("debate", "Débat", "Les chercheurs confrontent les scénarios haussier et baissier."),
    ("trader", "Trader", "Le trader transforme les signaux en proposition."),
    ("risks", "Risques", "Trois profils évaluent les scénarios de risque."),
    ("portfolio", "Portefeuille", "Le gestionnaire consolide la décision finale."),
]


def stages(active_index: int = -1, *, error: bool = False) -> list[dict]:
    values = []
    for index, (stage_id, label, detail) in enumerate(STAGE_DEFS):
        if index < active_index:
            status = "complete"
        elif index == active_index:
            status = "error" if error else "active"
        else:
            status = "pending"
        values.append({"id": stage_id, "label": label, "detail": detail, "status": status})
    return values


def elapsed(started_at: float | None) -> str:
    if not started_at:
        return "00:00"
    seconds = max(0, int(time.time() - started_at))
    return f"{seconds // 60:02d}:{seconds % 60:02d}"


def parse_snapshot(snapshot: str) -> dict:
    def value(field: str) -> str | None:
        match = re.search(rf"\|\s*{re.escape(field)}\s*\|\s*([^|]+)\|", snapshot, re.I)
        return match.group(1).strip() if match else None

    latest_match = re.search(r"Latest trading row used:\s*([0-9-]+)", snapshot)
    close_text = value("Close")
    try:
        close = float(close_text.replace(",", "")) if close_text else None
    except ValueError:
        close = None
    return {
        "latest_date": latest_match.group(1) if latest_match else None,
        "close": close,
        "open": value("Open"),
        "high": value("High"),
        "low": value("Low"),
        "volume": value("Volume"),
        "raw": snapshot,
    }


PRICE_PATTERN = re.compile(
    r"(?:prix\s+d['’]entrée|entry\s+price|achat\s+(?:de\s+\w+\s+)?à|buy\s+at|cours\s+cible|target\s+price|stop(?:\s+loss)?\s+à)"
    r"[^0-9]{0,28}([0-9]{1,5}(?:[.,][0-9]{1,4})?)",
    re.I,
)


def reliability_checks(snapshot: dict, final_decision: str, analyst_count: int) -> dict:
    verified_close = snapshot.get("close")
    candidates = []
    for match in PRICE_PATTERN.finditer(final_decision or ""):
        try:
            candidates.append(float(match.group(1).replace(",", ".")))
        except ValueError:
            continue

    mismatches = []
    if verified_close and verified_close > 0:
        mismatches = [price for price in candidates if price > 1 and abs(price - verified_close) / verified_close > 0.22]

    blocked = verified_close is None or bool(mismatches)
    if verified_close is None:
        reason = "Le dernier cours n’a pas pu être vérifié de manière déterministe."
    elif mismatches:
        shown = ", ".join(f"{price:.2f}" for price in mismatches[:3])
        reason = f"Le prix proposé ({shown}) ne correspond pas au dernier cours vérifié ({verified_close:.2f})."
    else:
        reason = "Aucune incohérence critique de prix détectée."

    return {
        "blocked": blocked,
        "block_reason": reason,
        "verified_close": verified_close,
        "latest_date": snapshot.get("latest_date"),
        "price_candidates": candidates,
        "checks": [
            {
                "label": "Cours vérifié",
                "status": "ok" if verified_close else "blocked",
                "detail": f"Dernier cours : {verified_close:.2f}" if verified_close else "Cours indisponible",
            },
            {
                "label": "Données datées",
                "status": "ok" if snapshot.get("latest_date") else "blocked",
                "detail": f"Dernière séance : {snapshot.get('latest_date')}" if snapshot.get("latest_date") else "Date indisponible",
            },
            {
                "label": "Incohérences bloquantes",
                "status": "blocked" if blocked else "ok",
                "detail": reason,
            },
            {
                "label": "Couverture analystes",
                "status": "ok" if analyst_count >= 2 else "blocked",
                "detail": f"{analyst_count} analyste(s) sélectionné(s)",
            },
        ],
    }


def report_sections(state: dict) -> dict:
    investment = state.get("investment_debate_state") or {}
    risk = state.get("risk_debate_state") or {}
    return {
        "market": state.get("market_report") or "",
        "news": state.get("news_report") or "",
        "social": state.get("sentiment_report") or "",
        "fundamentals": state.get("fundamentals_report") or "",
        "bull": investment.get("bull_history") or "",
        "bear": investment.get("bear_history") or "",
        "research_manager": investment.get("judge_decision") or "",
        "trader": state.get("trader_investment_plan") or "",
        "aggressive": risk.get("aggressive_history") or "",
        "conservative": risk.get("conservative_history") or "",
        "neutral": risk.get("neutral_history") or "",
        "portfolio": state.get("final_trade_decision") or risk.get("judge_decision") or "",
    }


REPORT_SECTION_FILES = {
    "market": "1_analysts/market.md",
    "news": "1_analysts/news.md",
    "social": "1_analysts/sentiment.md",
    "fundamentals": "1_analysts/fundamentals.md",
    "bull": "2_research/bull.md",
    "bear": "2_research/bear.md",
    "research_manager": "2_research/manager.md",
    "trader": "3_trading/trader.md",
    "aggressive": "4_risk/aggressive.md",
    "conservative": "4_risk/conservative.md",
    "neutral": "4_risk/neutral.md",
    "portfolio": "5_portfolio/decision.md",
}


def load_history_items() -> list[dict]:
    try:
        payload = json.loads(HISTORY_FILE.read_text()) if HISTORY_FILE.exists() else []
    except (OSError, json.JSONDecodeError):
        return []
    return payload if isinstance(payload, list) else []


def historical_report_path(history_id: str) -> Path | None:
    if not re.fullmatch(r"[a-f0-9-]+", history_id):
        return None
    report_path = (REPORTS_DIR / history_id / "complete_report.md").resolve()
    if REPORTS_DIR.resolve() not in report_path.parents or not report_path.is_file():
        return None
    return report_path


def load_historical_job(history_id: str) -> dict | None:
    item = next((entry for entry in load_history_items() if entry.get("id") == history_id), None)
    report_path = historical_report_path(history_id)
    if not item or not report_path:
        return None

    report_dir = report_path.parent
    result_path = report_dir / "result.json"
    try:
        result = json.loads(result_path.read_text()) if result_path.is_file() else None
    except (OSError, json.JSONDecodeError):
        result = None

    if not isinstance(result, dict):
        reports = {}
        for key, relative in REPORT_SECTION_FILES.items():
            candidate = report_dir / relative
            reports[key] = candidate.read_text(encoding="utf-8") if candidate.is_file() else ""
        blocked = bool(item.get("blocked", True))
        reliability = {
            "blocked": blocked,
            "block_reason": "Cette analyse avait été marquée comme bloquée lors de son enregistrement." if blocked else "Aucune incohérence critique n’avait été enregistrée.",
            "verified_close": None,
            "latest_date": item.get("analysis_date"),
            "price_candidates": [],
            "checks": [
                {
                    "label": "Statut enregistré",
                    "status": "blocked" if blocked else "ok",
                    "detail": "Analyse bloquée" if blocked else "Analyse contrôlée",
                },
                {
                    "label": "Détails historiques",
                    "status": "info",
                    "detail": "Le rapport complet et ses sections ont été restaurés depuis le disque.",
                },
            ],
        }
        result = {
            "raw_decision": item.get("display_decision") or "HOLD",
            "display_decision": item.get("display_decision") or "ATTENDRE",
            "confidence": "Analyse historique",
            "summary": "\n\n".join(filter(None, [reports.get("portfolio"), reports.get("research_manager")])),
            "reports": reports,
            "complete_report": report_path.read_text(encoding="utf-8"),
            "reliability": reliability,
            "snapshot": {},
        }

    return {
        "id": item["id"],
        "ticker": item.get("ticker", "—"),
        "analysis_date": item.get("analysis_date", "—"),
        "model": item.get("model", MODEL),
        "analysts": item.get("analysts", []),
        "depth": item.get("depth", 1),
        "status": "complete",
        "created_at": item.get("created_at", ""),
        "stages": stages(6),
        "logs": ["Analyse restaurée depuis l’historique local."],
        "llm_calls": 0,
        "tool_calls": 0,
        "reliability": result.get("reliability", {}),
        "result": result,
        "error": None,
        "source": "history",
        "elapsed": "—",
    }


def public_job(job: dict) -> dict:
    result = dict(job)
    result.pop("started_at", None)
    result.pop("report_path", None)
    result["elapsed"] = elapsed(job.get("started_at"))
    return result


def update_job(job_id: str, **changes) -> None:
    with LOCK:
        JOBS[job_id].update(changes)


def apply_output_budget(graph: TradingAgentsGraph, depth: int) -> int:
    """Keep local generations bounded while preserving deeper report options."""
    budget = OUTPUT_TOKEN_BUDGETS[depth]
    graph.quick_thinking_llm.max_tokens = budget
    graph.deep_thinking_llm.max_tokens = budget
    return budget


class ProgressCallback(BaseCallbackHandler):
    def __init__(self, job_id: str, expected_calls: int):
        self.job_id = job_id
        self.expected_calls = max(8, expected_calls)

    def _advance(self, message: str) -> None:
        with LOCK:
            job = JOBS[self.job_id]
            job["llm_calls"] += 1
            call = job["llm_calls"]
            ratio = min(0.999, call / self.expected_calls)
            active = min(5, 1 + int(ratio * 5))
            job["stages"] = stages(active)
            job["logs"] = (job["logs"] + [message])[-8:]

    def on_llm_start(self, serialized, prompts, **kwargs):  # noqa: ANN001
        self._advance("Un agent local prépare sa réponse.")

    def on_tool_start(self, serialized, input_str, **kwargs):  # noqa: ANN001
        with LOCK:
            job = JOBS[self.job_id]
            job["tool_calls"] += 1
            job["logs"] = (job["logs"] + ["Une source de données est interrogée."])[-8:]


def save_history(job: dict) -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    current = load_history_items()
    result = job.get("result") or {}
    result_path = REPORTS_DIR / job["id"] / "result.json"
    result_path.parent.mkdir(parents=True, exist_ok=True)
    result_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    item = {
        "id": job["id"],
        "ticker": job["ticker"],
        "analysis_date": job["analysis_date"],
        "model": job.get("model", MODEL),
        "analysts": job.get("analysts", []),
        "depth": job.get("depth", 1),
        "display_decision": result.get("display_decision"),
        "blocked": (result.get("reliability") or {}).get("blocked", True),
        "created_at": job["created_at"],
        "report_path": str(job.get("report_path") or ""),
    }
    current = [item] + [entry for entry in current if entry.get("id") != item["id"]]
    HISTORY_FILE.write_text(json.dumps(current[:100], ensure_ascii=False, indent=2))


def run_analysis(job_id: str, payload: dict) -> None:
    ticker = payload["ticker"]
    analysis_date = payload["date"]
    analysts = payload["analysts"]
    depth = payload["depth"]
    try:
        update_job(
            job_id,
            status="running",
            started_at=time.time(),
            stages=stages(0),
            logs=["Yahoo Finance : chargement des OHLCV ajustés et contrôle anti-données futures."],
        )
        snapshot_text = build_verified_market_snapshot(ticker, analysis_date, look_back_days=30)
        snapshot = parse_snapshot(snapshot_text)
        partial_reliability = {
            "checks": [
                {"label": "Cours vérifié", "status": "ok" if snapshot.get("close") else "blocked", "detail": f"Dernier cours : {snapshot.get('close'):.2f}" if snapshot.get("close") else "Cours indisponible"},
                {"label": "Données datées", "status": "ok" if snapshot.get("latest_date") else "blocked", "detail": f"Dernière séance : {snapshot.get('latest_date')}" if snapshot.get("latest_date") else "Date indisponible"},
                {"label": "Incohérences bloquantes", "status": "pending", "detail": "Contrôle après génération"},
            ]
        }
        update_job(
            job_id,
            reliability=partial_reliability,
            stages=stages(1),
            logs=["Dernière séance, 30 clôtures et 11 indicateurs vérifiés. Démarrage des analystes."],
        )

        config = DEFAULT_CONFIG.copy()
        config.update({
            "llm_provider": "ollama",
            "backend_url": "http://localhost:11434/v1",
            "quick_think_llm": MODEL,
            "deep_think_llm": MODEL,
            "max_debate_rounds": depth,
            "max_risk_discuss_rounds": depth,
            "output_language": "French",
            "temperature": 0.1,
            "checkpoint_enabled": True,
            "results_dir": str(DATA_DIR / "runtime"),
        })
        expected_calls = len(analysts) * 2 + 9 + max(0, depth - 1) * 5
        callback = ProgressCallback(job_id, expected_calls)
        graph = TradingAgentsGraph(selected_analysts=analysts, debug=False, config=config, callbacks=[callback])
        output_token_budget = apply_output_budget(graph, depth)
        update_job(job_id, output_token_budget=output_token_budget)
        final_state, raw_decision = graph.propagate(ticker, analysis_date, asset_type="stock")
        reports = report_sections(final_state)
        final_decision = reports["portfolio"]
        reliability = reliability_checks(snapshot, final_decision, len(analysts))

        raw_label = str(raw_decision or "HOLD").upper()
        translations = {"BUY": "ACHETER", "SELL": "VENDRE", "HOLD": "ATTENDRE"}
        display = "ATTENDRE" if reliability["blocked"] else translations.get(raw_label, raw_label)
        confidence = "Confiance limitée" if reliability["blocked"] else "Confiance modérée"

        report_dir = REPORTS_DIR / job_id
        report_path = graph.save_reports(final_state, ticker, report_dir)
        complete_report = report_path.read_text(encoding="utf-8") if report_path.exists() else final_decision
        summary = "\n\n".join(filter(None, [reports.get("portfolio"), reports.get("research_manager")]))
        result = {
            "raw_decision": raw_label,
            "display_decision": display,
            "confidence": confidence,
            "summary": summary,
            "reports": reports,
            "complete_report": complete_report,
            "reliability": reliability,
            "snapshot": {key: value for key, value in snapshot.items() if key != "raw"},
        }
        update_job(job_id, status="complete", stages=stages(6), result=result, report_path=str(report_path), reliability=reliability, logs=["Rapport terminé et contrôlé."])
        with LOCK:
            save_history(JOBS[job_id])
    except Exception as exc:  # noqa: BLE001
        with LOCK:
            current = JOBS[job_id]
            active = next((i for i, stage in enumerate(current["stages"]) if stage["status"] == "active"), 0)
        update_job(job_id, status="error", error=f"{type(exc).__name__}: {exc}", stages=stages(active, error=True), logs=["L’analyse s’est arrêtée avec une erreur."])


def ollama_status() -> dict:
    try:
        with urllib.request.urlopen(f"{OLLAMA_API}/api/tags", timeout=3) as response:
            payload = json.loads(response.read())
        models = []
        for item in payload.get("models", []):
            size = item.get("size") or 0
            models.append({"name": item.get("name", "inconnu"), "size": f"{size / 1_000_000_000:.1f} Go"})
        return {"online": True, "models": models, "endpoint": OLLAMA_API}
    except (OSError, urllib.error.URLError, json.JSONDecodeError):
        return {"online": False, "models": [], "endpoint": OLLAMA_API}


class Handler(BaseHTTPRequestHandler):
    server_version = "TradingAgentsWeb/1.0"

    def log_message(self, format, *args):  # noqa: A002
        print(f"[web] {self.address_string()} - {format % args}")

    def send_json(self, payload, status=HTTPStatus.OK):
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):  # noqa: N802
        path = urlparse(self.path).path
        if path == "/api/status":
            self.send_json(ollama_status())
            return
        if path == "/api/history":
            items = load_history_items()
            self.send_json({"items": items})
            return
        history_match = re.fullmatch(r"/api/history/([a-f0-9-]+)", path)
        if history_match:
            payload = load_historical_job(history_match.group(1))
            if payload:
                self.send_json(payload)
            else:
                self.send_json({"error": "Analyse historique introuvable"}, HTTPStatus.NOT_FOUND)
            return
        match = re.fullmatch(r"/api/jobs/([a-f0-9-]+)", path)
        if match:
            with LOCK:
                job = JOBS.get(match.group(1))
                payload = public_job(job) if job else None
            if payload:
                self.send_json(payload)
            else:
                self.send_json({"error": "Analyse introuvable"}, HTTPStatus.NOT_FOUND)
            return
        report_match = re.fullmatch(r"/api/jobs/([a-f0-9-]+)/report", path)
        if report_match:
            with LOCK:
                job = JOBS.get(report_match.group(1))
                report_path = Path(job.get("report_path", "")) if job else None
            if not report_path or not report_path.is_file():
                report_path = historical_report_path(report_match.group(1))
            if not report_path or not report_path.is_file() or REPORTS_DIR not in report_path.parents:
                self.send_json({"error": "Rapport introuvable"}, HTTPStatus.NOT_FOUND)
                return
            body = report_path.read_bytes()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/markdown; charset=utf-8")
            self.send_header("Content-Disposition", f'inline; filename="{report_path.name}"')
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        self.serve_static(path)

    def do_POST(self):  # noqa: N802
        path = urlparse(self.path).path
        if path != "/api/analyze":
            self.send_json({"error": "Route inconnue"}, HTTPStatus.NOT_FOUND)
            return
        try:
            length = min(int(self.headers.get("Content-Length", "0")), 1_000_000)
            payload = json.loads(self.rfile.read(length))
            ticker = str(payload.get("ticker", "")).strip().upper()
            analysis_date = str(payload.get("date", ""))
            analysts = [str(item) for item in payload.get("analysts", []) if str(item) in ALLOWED_ANALYSTS]
            depth = int(payload.get("depth", 1))
            if not re.fullmatch(r"[A-Z0-9.\-^=]{1,20}", ticker):
                raise ValueError("Symbole boursier invalide")
            parsed_date = date.fromisoformat(analysis_date)
            if parsed_date > date.today():
                raise ValueError("La date ne peut pas être dans le futur")
            if not analysts:
                raise ValueError("Sélectionnez au moins un analyste")
            if depth not in {1, 2, 3}:
                raise ValueError("Profondeur invalide")
        except (ValueError, TypeError, json.JSONDecodeError) as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
            return

        with LOCK:
            if any(job.get("status") in {"queued", "running"} for job in JOBS.values()):
                self.send_json({"error": "Une analyse locale est déjà en cours"}, HTTPStatus.CONFLICT)
                return
            job_id = str(uuid.uuid4())
            job = {
                "id": job_id,
                "ticker": ticker,
                "analysis_date": analysis_date,
                "model": MODEL,
                "analysts": analysts,
                "depth": depth,
                "status": "queued",
                "created_at": datetime.now().strftime("%d/%m/%Y %H:%M"),
                "started_at": None,
                "stages": stages(0),
                "logs": ["Analyse placée dans la file locale."],
                "llm_calls": 0,
                "tool_calls": 0,
                "reliability": {},
                "result": None,
                "error": None,
            }
            JOBS[job_id] = job
        clean_payload = {"ticker": ticker, "date": analysis_date, "analysts": analysts, "depth": depth}
        threading.Thread(target=run_analysis, args=(job_id, clean_payload), daemon=True).start()
        self.send_json(public_job(job), HTTPStatus.ACCEPTED)

    def serve_static(self, path: str):
        if not DIST_DIR.exists():
            self.send_json({"error": "Interface non construite. Lancez npm run build dans web_ui/."}, HTTPStatus.SERVICE_UNAVAILABLE)
            return
        relative = path.lstrip("/") or "index.html"
        candidate = (DIST_DIR / relative).resolve()
        if DIST_DIR.resolve() not in candidate.parents and candidate != DIST_DIR.resolve():
            self.send_error(HTTPStatus.FORBIDDEN)
            return
        if not candidate.is_file():
            candidate = DIST_DIR / "index.html"
        body = candidate.read_bytes()
        mime = mimetypes.guess_type(candidate.name)[0] or "application/octet-stream"
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", f"{mime}; charset=utf-8" if mime.startswith("text/") or mime in {"application/javascript", "application/json"} else mime)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-cache" if candidate.name == "index.html" else "public, max-age=31536000, immutable")
        self.end_headers()
        self.wfile.write(body)


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not DIST_DIR.exists():
        raise SystemExit("Interface non construite : exécutez `npm install && npm run build` dans web_ui/.")
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"TradingAgents Web : http://{HOST}:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
