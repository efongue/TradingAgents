#!/usr/bin/env python3
"""Standalone local web server for TradingAgents.

Everything in this file lives under web_ui/ and imports the existing package as
a library. The original CLI and framework files are not modified.
"""

from __future__ import annotations

import ast
import json
import mimetypes
import os
import re
import shutil
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
SCANS_FILE = DATA_DIR / "scans.json"
REPORTS_DIR = DATA_DIR / "reports"

sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv  # noqa: E402
from openai import DEFAULT_MAX_RETRIES  # noqa: E402

load_dotenv(ROOT / ".env")

from langchain_core.callbacks import BaseCallbackHandler  # noqa: E402
from tradingagents.dataflows.market_data_validator import (  # noqa: E402
    build_verified_market_snapshot,
)
from tradingagents.default_config import DEFAULT_CONFIG  # noqa: E402
from tradingagents.graph.analyst_execution import ANALYST_NODE_SPECS  # noqa: E402
from tradingagents.graph.checkpointer import checkpoint_step  # noqa: E402
from tradingagents.graph.trading_graph import TradingAgentsGraph  # noqa: E402
from web_ui.screener import (  # noqa: E402
    DECISION_SCORES,
    combine_with_agent_score,
    resolve_symbols,
    screen_universe,
    universe_catalog,
)

HOST = "127.0.0.1"
PORT = int(os.environ.get("TRADINGAGENTS_WEB_PORT", "8787"))
LLM_PROVIDER = DEFAULT_CONFIG["llm_provider"]
LLM_ENDPOINT = str(DEFAULT_CONFIG.get("backend_url") or "").rstrip("/")
MODEL = DEFAULT_CONFIG["quick_think_llm"]
_raw_temp = os.environ.get("TRADINGAGENTS_TEMPERATURE")
WEB_TEMPERATURE = float(_raw_temp) if _raw_temp not in {None, ""} else None
OUTPUT_TOKEN_BUDGETS = {1: 600, 2: 1000, 3: 1600}

ANALYST_PRESENTATION = {
    "market": {
        "name": "Marché",
        "description": "Prix, tendances et indicateurs techniques.",
    },
    "social": {
        "name": "Sentiment du marché",
        "description": "Perception des investisseurs et réseaux spécialisés.",
    },
    "news": {
        "name": "Actualités",
        "description": "Événements récents et contexte macroéconomique.",
    },
    "fundamentals": {
        "name": "Fondamentaux",
        "description": "Résultats, bilan, revenus et valorisation.",
    },
}
ALLOWED_ANALYSTS = frozenset(ANALYST_NODE_SPECS)

TOOL_CATEGORIES = {
    "get_stock_data": "core_stock_apis",
    "get_indicators": "technical_indicators",
    "get_fundamentals": "fundamental_data",
    "get_balance_sheet": "fundamental_data",
    "get_cashflow": "fundamental_data",
    "get_income_statement": "fundamental_data",
    "get_news": "news_data",
    "get_global_news": "news_data",
    "get_insider_transactions": "news_data",
    "get_macro_indicators": "macro_data",
    "get_prediction_markets": "prediction_markets",
}
TOOL_LABELS = {
    "get_stock_data": "Cours OHLCV",
    "get_indicators": "Indicateurs techniques",
    "get_verified_market_snapshot": "Cours vérifié",
    "get_fundamentals": "Données fondamentales",
    "get_balance_sheet": "Bilan",
    "get_cashflow": "Flux de trésorerie",
    "get_income_statement": "Compte de résultat",
    "get_news": "Actualités de l’entreprise",
    "get_global_news": "Actualités macroéconomiques",
    "get_insider_transactions": "Transactions d’initiés",
    "get_macro_indicators": "Indicateurs macroéconomiques",
    "get_prediction_markets": "Marchés de prévision",
}
VENDOR_LABELS = {
    "yfinance": "Yahoo Finance",
    "alpha_vantage": "Alpha Vantage",
    "fred": "FRED",
    "polymarket": "Polymarket",
}

def load_scans_cache() -> dict[str, dict]:
    try:
        if SCANS_FILE.exists():
            payload = json.loads(SCANS_FILE.read_text(encoding="utf-8"))
            if isinstance(payload, dict):
                modified = False
                for scan in payload.values():
                    if scan.get("status") in {"queued", "running"}:
                        scan["status"] = "error"
                        scan["stage"] = "interrupted"
                        scan["stage_label"] = "Scan interrompu"
                        scan["error"] = "Le serveur Python a été redémarré pendant l'exécution du scan."
                        scan["active_symbol"] = None
                        scan["active_analysis_job_id"] = None
                        for candidate in scan.get("candidates", []):
                            if candidate.get("analysis_status") in {"queued", "running"}:
                                candidate["analysis_status"] = "error"
                        modified = True
                if modified:
                    SCANS_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
                return payload
    except (OSError, json.JSONDecodeError):
        pass
    return {}


def save_scans_cache() -> None:
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        with LOCK:
            snapshot = {
                k: {prop: val for prop, val in v.items() if prop != "started_at"}
                for k, v in SCAN_JOBS.items()
            }
        SCANS_FILE.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2), encoding="utf-8")
    except (OSError, TypeError):
        pass


JOBS: dict[str, dict] = {}
SCAN_JOBS: dict[str, dict] = load_scans_cache()
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

DATA_STEP_DEFS = [
    ("ohlcv_loaded", "Historique OHLCV", "Téléchargement ou lecture du cache Yahoo Finance."),
    ("date_cutoff_verified", "Période de données", "Exclusion de toute séance après la date d’analyse."),
    ("freshness_verified", "Fraîcheur de la dernière séance", "Rejet des données de plus de 10 jours."),
    ("recent_closes_selected", "Fenêtre des clôtures", "Sélection des 30 dernières clôtures."),
    ("indicators_calculated", "Indicateurs techniques", "Calcul EMA/SMA, RSI, Bollinger, MACD et ATR."),
    ("latest_price_verified", "Dernier cours", "Validation du dernier cours exploitable."),
]

DEBATE_STEP_DEFS = [
    ("bull", "Analyste haussier", "Construction du scénario favorable.", "bull"),
    ("bear", "Analyste baissier", "Construction du scénario défavorable.", "bear"),
    (
        "research_manager",
        "Arbitrage du responsable de recherche",
        "Synthèse du débat et production du plan d’investissement.",
        "research_manager",
    ),
]

ANALYST_NODE_TO_KEY = {
    spec.agent_node: key for key, spec in ANALYST_NODE_SPECS.items()
}
DEBATE_NODE_TO_KEY = {
    "Bull Researcher": "bull",
    "Bear Researcher": "bear",
    "Research Manager": "research_manager",
}
GRAPH_NODE_STAGE_INDEX = {
    **{node: 1 for node in ANALYST_NODE_TO_KEY},
    **{node: 2 for node in DEBATE_NODE_TO_KEY},
    "Trader": 3,
    "Aggressive Analyst": 4,
    "Conservative Analyst": 4,
    "Neutral Analyst": 4,
    "Portfolio Manager": 5,
}
LINKABLE_STAGE_REPORT_KEYS = frozenset({*ANALYST_NODE_SPECS, "bull", "bear"})


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


def data_steps(active_index: int | None = None) -> list[dict]:
    values = []
    for index, (step_id, label, detail) in enumerate(DATA_STEP_DEFS):
        if active_index is None:
            status = "pending"
        elif index < active_index:
            status = "complete"
        elif index == active_index:
            status = "active"
        else:
            status = "pending"
        values.append({"id": step_id, "label": label, "detail": detail, "status": status})
    return values


def report_url(job_id: str, report_key: str) -> str:
    return f"/api/jobs/{job_id}/reports/{report_key}.md"


def workflow_stage_steps(job_id: str, analysts: list[str] | tuple[str, ...]) -> dict[str, list[dict]]:
    analyst_values = []
    for analyst_key in analysts:
        spec = ANALYST_NODE_SPECS.get(analyst_key)
        if not spec:
            continue
        presentation = ANALYST_PRESENTATION.get(analyst_key, {})
        label = presentation.get("name", spec.agent_node)
        analyst_values.append({
            "id": analyst_key,
            "label": label,
            "detail": f"{label} prépare son rapport Markdown.",
            "status": "pending",
            "report_key": analyst_key,
            "report_url": None,
        })
    debate_values = [
        {
            "id": step_id,
            "label": label,
            "detail": detail,
            "status": "pending",
            "report_key": report_key,
            "report_url": None,
        }
        for step_id, label, detail, report_key in DEBATE_STEP_DEFS
    ]
    return {"analysts": analyst_values, "debate": debate_values}


def restore_stage_steps(
    job_id: str,
    analysts: list[str] | tuple[str, ...],
    reports: dict,
) -> dict[str, list[dict]]:
    values = workflow_stage_steps(job_id, analysts)
    for stage_values in values.values():
        for step in stage_values:
            report_key = step["report_key"]
            if reports.get(report_key):
                step["status"] = "complete"
                if report_key in LINKABLE_STAGE_REPORT_KEYS:
                    step["report_url"] = report_url(job_id, report_key)
    return values


def data_progress_detail(step_id: str, details: dict) -> tuple[str, str]:
    if step_id == "ohlcv_loaded":
        return f"{details.get('rows', 0)} séances chargées jusqu’au {details.get('latest_date', '—')}.", "complete"
    if step_id == "date_cutoff_verified":
        return f"Aucune séance postérieure au {details.get('analysis_date', '—')}.", "complete"
    if step_id == "freshness_verified":
        return f"Dernière séance validée : {details.get('latest_date', '—')}.", "complete"
    if step_id == "recent_closes_selected":
        return f"{details.get('count', 0)} clôtures retenues.", "complete"
    if step_id == "indicators_calculated":
        available = int(details.get("available", 0) or 0)
        total = int(details.get("total", 0) or 0)
        status = "complete" if total and available == total else "warning"
        return f"{available}/{total} indicateurs calculés.", status
    if step_id == "latest_price_verified":
        close = details.get("close")
        if close is None:
            return "Dernier cours indisponible.", "warning"
        return f"Dernier cours vérifié : {float(close):.2f}.", "complete"
    return "Contrôle terminé.", "complete"


def record_data_progress(job_id: str, step_id: str, details: dict) -> None:
    step_ids = [definition[0] for definition in DATA_STEP_DEFS]
    if step_id not in step_ids:
        return
    completed_index = step_ids.index(step_id)
    detail, completed_status = data_progress_detail(step_id, details)
    with LOCK:
        current_steps = [dict(step) for step in JOBS[job_id].get("data_steps", data_steps(0))]
        for index, step in enumerate(current_steps):
            if index < completed_index and step["status"] in {"pending", "active"}:
                step["status"] = "complete"
            elif index == completed_index:
                step.update(status=completed_status, detail=detail)
            elif index == completed_index + 1:
                step["status"] = "active"
        JOBS[job_id].update(data_steps=current_steps, logs=[f"{current_steps[completed_index]['label']} : {detail}"])


def fail_active_data_step(current_steps: list[dict], message: str) -> list[dict]:
    failed = [dict(step) for step in current_steps]
    active = next((step for step in failed if step.get("status") == "active"), None)
    if active:
        concise = " ".join(str(message).split())
        if len(concise) > 240:
            concise = f"{concise[:237].rstrip()}…"
        active.update(status="error", detail=concise)
    return failed


def elapsed(started_at: float | None) -> str:
    if not started_at:
        return "00:00"
    seconds = max(0, int(time.time() - started_at))
    return f"{seconds // 60:02d}:{seconds % 60:02d}"


def llm_json(path: str, timeout: float = 3) -> dict:
    api_key = os.getenv("OPENAI_COMPATIBLE_API_KEY") or os.getenv("OPENAI_API_KEY") or "EMPTY"
    request = urllib.request.Request(
        f"{LLM_ENDPOINT}{path}",
        headers={"Authorization": f"Bearer {api_key}"},
    )
    with urllib.request.urlopen(request, timeout=timeout) as response:
        parsed = json.loads(response.read())
    return parsed if isinstance(parsed, dict) else {}


def positive_int(value) -> int | None:  # noqa: ANN001
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return None
    return parsed if parsed > 0 else None


def llm_runtime_info() -> dict:
    configured_retries = DEFAULT_CONFIG.get("llm_max_retries")
    base = {
        "online": False,
        "models": [],
        "provider": LLM_PROVIDER,
        "provider_name": "OmniRoute" if ":20128" in LLM_ENDPOINT else LLM_PROVIDER,
        "endpoint": LLM_ENDPOINT,
        "openai_endpoint": LLM_ENDPOINT,
        "active_model": MODEL,
        "capabilities": {
            "max_input_tokens": None,
            "max_output_tokens": None,
            "tool_calling": None,
            "reasoning": None,
        },
        "tradingagents": {
            "provider": LLM_PROVIDER,
            "endpoint": LLM_ENDPOINT,
            "quick_model": DEFAULT_CONFIG["quick_think_llm"],
            "deep_model": DEFAULT_CONFIG["deep_think_llm"],
            "temperature": WEB_TEMPERATURE,
            "max_retries_per_call": DEFAULT_MAX_RETRIES if configured_retries in {None, ""} else int(configured_retries),
            "checkpoint_enabled": True,
            "output_language": "French",
            "price_consistency_check": True,
            "output_token_budgets": OUTPUT_TOKEN_BUDGETS,
        },
        "analysis": None,
    }
    if not LLM_ENDPOINT:
        return base
    try:
        response = llm_json("/models")
    except (OSError, urllib.error.URLError, json.JSONDecodeError):
        return base

    active = next((item for item in response.get("data", []) if item.get("id") == MODEL), None)
    if active:
        max_input = positive_int(active.get("max_input_tokens") or active.get("context_length"))
        max_output = positive_int(active.get("max_output_tokens"))
        capabilities = active.get("capabilities") or {}
        base.update({
            "online": True,
            "models": [{"name": MODEL, "provider": active.get("owned_by") or LLM_PROVIDER}],
        })
        base["capabilities"].update({
            "max_input_tokens": max_input,
            "max_output_tokens": max_output,
            "tool_calling": capabilities.get("tool_calling"),
            "reasoning": capabilities.get("reasoning"),
        })
    return base


def current_analysis_config() -> dict | None:
    with LOCK:
        job = next(
            (job for job in JOBS.values() if job.get("status") in {"queued", "running"}),
            None,
        )
        if not job:
            return None
        depth = int(job["depth"])
        return {
            "ticker": job["ticker"],
            "analysis_date": job["analysis_date"],
            "status": job["status"],
            "depth": depth,
            "analysts": list(job["analysts"]),
            "debate_rounds": depth,
            "risk_rounds": depth,
            "output_tokens_per_call": OUTPUT_TOKEN_BUDGETS[depth],
            "estimated_model_calls": (job.get("limits") or {}).get("expected_model_calls"),
        }


def analysis_limits(depth: int, analyst_count: int, runtime: dict | None = None) -> dict:
    """Describe the model budget exposed to the local interface."""
    output_budget = OUTPUT_TOKEN_BUDGETS[depth]
    expected_calls = analyst_count * 2 + 9 + max(0, depth - 1) * 5
    runtime = runtime or {}
    model_capacity = positive_int((runtime.get("capabilities") or {}).get("max_input_tokens"))
    return {
        # OmniRoute exposes model capacity, not a per-request active window.
        "context_window_tokens": None,
        "context_source": None,
        "model_capacity_tokens": model_capacity,
        "max_output_tokens": output_budget,
        "safe_prompt_tokens": None,
        "expected_model_calls": expected_calls,
        "last_prompt_estimated_tokens": None,
        "estimated_request_tokens": None,
        "usage_percent": None,
        "state": "waiting",
    }


def web_analysis_config(depth: int) -> dict:
    """Return the exact TradingAgents configuration used by the web runner."""
    config = DEFAULT_CONFIG.copy()
    config.update({
        "max_debate_rounds": depth,
        "max_risk_discuss_rounds": depth,
        "output_language": "French",
        "checkpoint_enabled": True,
        "results_dir": str(DATA_DIR / "runtime"),
    })
    if WEB_TEMPERATURE is not None:
        config["temperature"] = WEB_TEMPERATURE
    return config


def resolve_benchmark(ticker: str, config: dict) -> str:
    explicit = config.get("benchmark_ticker")
    if explicit:
        return str(explicit)
    benchmark_map = config.get("benchmark_map", {})
    ticker_upper = ticker.upper()
    for suffix, benchmark in benchmark_map.items():
        if suffix and ticker_upper.endswith(suffix.upper()):
            return benchmark
    return benchmark_map.get("", "SPY")


def run_signature(analysts: list[str], depth: int, asset_type: str = "stock") -> str:
    return "|".join([
        "analysts=" + ",".join(analysts),
        f"debate={depth}",
        f"risk={depth}",
        f"asset={asset_type}",
    ])


def source_for_tool(tool_name: str, config: dict) -> str | None:
    if tool_name == "get_verified_market_snapshot":
        return "Yahoo Finance"
    category = TOOL_CATEGORIES.get(tool_name)
    if not category:
        return None
    vendor = (config.get("tool_vendors") or {}).get(tool_name)
    if not vendor:
        vendor = (config.get("data_vendors") or {}).get(category)
    if not vendor:
        return None
    labels = [VENDOR_LABELS.get(item.strip(), item.strip()) for item in str(vendor).split(",") if item.strip()]
    return " → ".join(labels) or None


def parse_tool_input(value) -> dict:  # noqa: ANN001
    if isinstance(value, dict):
        return value
    if not isinstance(value, str) or not value.strip():
        return {}
    for parser in (json.loads, ast.literal_eval):
        try:
            parsed = parser(value)
            if isinstance(parsed, dict):
                return parsed
        except (ValueError, SyntaxError, json.JSONDecodeError):
            continue
    return {}


def news_count_from_output(output) -> int | None:  # noqa: ANN001
    content = getattr(output, "content", output)
    if isinstance(content, dict):
        articles = content.get("feed") or content.get("articles") or content.get("news")
        return len(articles) if isinstance(articles, list) else None
    text = str(content or "")
    count = len(re.findall(r"(?m)^###\s+", text))
    return count or (0 if re.search(r"(?i)no (?:global )?news found", text) else None)


def source_summaries(events: list[dict]) -> list[dict]:
    grouped: dict[str, dict] = {}
    for event in events:
        source = event.get("source")
        if not source:
            continue
        entry = grouped.setdefault(source, {"name": source, "details": [], "status": "ok"})
        detail = event.get("label")
        if detail and detail not in entry["details"]:
            entry["details"].append(detail)
        if event.get("status") in {"error", "unavailable"} and entry["status"] == "ok":
            entry["status"] = "partial"
    return list(grouped.values())


def news_requests(events: list[dict], config: dict) -> list[dict]:
    requests = []
    for event in events:
        tool_name = event.get("tool")
        inputs = event.get("inputs") or {}
        if tool_name == "get_news":
            requests.append({
                "kind": "Entreprise",
                "start_date": inputs.get("start_date"),
                "end_date": inputs.get("end_date"),
                "article_limit": config.get("news_article_limit"),
                "articles_returned": event.get("articles_returned"),
                "status": event.get("status"),
            })
        elif tool_name == "get_global_news":
            requests.append({
                "kind": "Macro",
                "end_date": inputs.get("curr_date"),
                "lookback_days": inputs.get("look_back_days") or config.get("global_news_lookback_days"),
                "article_limit": inputs.get("limit") or config.get("global_news_article_limit"),
                "articles_returned": event.get("articles_returned"),
                "status": event.get("status"),
            })
    unique = []
    seen = set()
    for request in requests:
        key = tuple((name, str(value)) for name, value in request.items() if name != "articles_returned")
        if key not in seen:
            seen.add(key)
            unique.append(request)
    return unique


def analysis_parameters(
    *,
    ticker: str,
    analysts: list[str],
    depth: int,
    config: dict,
    limits: dict,
    events: list[dict],
    completed_calls: int,
    llm_errors: int,
    memory_used: bool | None,
    resumed_from_step: int | None,
) -> dict:
    configured_retries = config.get("llm_max_retries")
    retry_budget = DEFAULT_MAX_RETRIES if configured_retries in {None, ""} else int(configured_retries)
    return {
        "debates": {"investment": depth, "risk": depth},
        "calls": {"estimated": limits["expected_model_calls"], "completed": completed_calls},
        "output_tokens_per_call": limits["max_output_tokens"],
        "model": {
            "name": config.get("quick_think_llm"),
            "temperature": config.get("temperature"),
            "context_window_tokens": limits.get("context_window_tokens"),
            "context_source": limits.get("context_source"),
            "model_capacity_tokens": limits.get("model_capacity_tokens"),
            "endpoint": config.get("backend_url"),
        },
        "sources": source_summaries(events),
        "news": {
            "requests": news_requests(events, config),
            "company_article_limit": config.get("news_article_limit"),
            "global_article_limit": config.get("global_news_article_limit"),
            "global_lookback_days": config.get("global_news_lookback_days"),
        },
        "benchmark": resolve_benchmark(ticker, config),
        "memory": {"used": memory_used},
        "attempts": {
            "analysis": 1,
            "max_retries_per_call": retry_budget,
            "model_errors": llm_errors,
            "resumed": resumed_from_step is not None,
            "resume_step": resumed_from_step,
        },
        "complete": True,
    }


def legacy_analysis_parameters(item: dict) -> dict:
    depth = item.get("depth")
    analysts = item.get("analysts")
    valid_depth = depth if depth in {1, 2, 3} else None
    analyst_count = len(analysts) if isinstance(analysts, list) and analysts else None
    estimated_calls = analysis_limits(valid_depth, analyst_count)["expected_model_calls"] if valid_depth and analyst_count else None
    return {
        "debates": {"investment": valid_depth, "risk": valid_depth},
        "calls": {"estimated": estimated_calls, "completed": None},
        "output_tokens_per_call": OUTPUT_TOKEN_BUDGETS.get(valid_depth),
        "model": {
            "name": item.get("model"),
            "temperature": None,
            "context_window_tokens": None,
            "context_source": None,
            "model_capacity_tokens": None,
            "endpoint": None,
        },
        "sources": [],
        "news": {"requests": []},
        "benchmark": None,
        "memory": {"used": None},
        "attempts": {
            "analysis": None,
            "max_retries_per_call": None,
            "model_errors": None,
            "resumed": None,
            "resume_step": None,
        },
        "complete": False,
    }


def estimate_prompt_tokens(prompts) -> int | None:  # noqa: ANN001
    """Return a clearly labelled approximation when no Qwen tokenizer is loaded."""
    if not prompts:
        return None
    texts = [str(prompt) for prompt in prompts if prompt is not None]
    if not texts:
        return None
    return max(1, (max(len(text) for text in texts) + 3) // 4)


def context_usage(limits: dict, prompt_tokens: int | None) -> dict:
    """Update a copy of the public context diagnostic for one model request."""
    result = dict(limits)
    if prompt_tokens is None:
        return result
    window = positive_int(result.get("context_window_tokens"))
    requested = prompt_tokens + int(result["max_output_tokens"])
    usage = round(requested / window * 100) if window else None
    state = "critical" if window and requested > window else "warning" if usage and usage >= 85 else "ok" if window else "unknown"
    result.update({
        "last_prompt_estimated_tokens": prompt_tokens,
        "estimated_request_tokens": requested,
        "usage_percent": usage,
        "state": state,
    })
    return result


def format_token_count(value: int) -> str:
    return f"{int(value):,}".replace(",", " ")


def describe_analysis_error(exc: Exception, job: dict) -> dict:
    """Turn a provider exception into a useful, non-secret UI diagnostic."""
    technical = f"{type(exc).__name__}: {exc}".strip()
    technical = re.sub(
        r"(?i)((?:authorization|api[_-]?key)\s*[:=]\s*)\S+",
        r"\1[masqué]",
        technical,
    )[:1200]
    lower = technical.lower()
    limits = dict(job.get("limits") or {})
    window = limits.get("context_window_tokens")
    prompt_tokens = limits.get("last_prompt_estimated_tokens")
    requested = limits.get("estimated_request_tokens")
    context_markers = (
        "context length",
        "context window",
        "maximum context",
        "too many tokens",
        "num_ctx",
        "prompt is too long",
    )
    context_pressure = bool(
        window
        and (
            (requested and requested >= window)
            or (prompt_tokens and prompt_tokens >= window * 0.9)
        )
    )

    if any(marker in lower for marker in context_markers) or ("500" in lower and context_pressure):
        prompt_copy = f"environ {format_token_count(prompt_tokens)} tokens" if prompt_tokens else "presque toute la fenêtre disponible"
        window_copy = f"la fenêtre détectée de {format_token_count(window)} tokens" if window else "la fenêtre communiquée par la passerelle"
        return {
            "code": "context_limit",
            "title": "Limite de contexte du modèle atteinte",
            "message": (
                f"Le dernier prompt utilisait {prompt_copy}. Avec la réponse demandée, "
                f"{window_copy} n’était plus suffisante."
            ),
            "recommendation": "Réduisez la profondeur ou le nombre d’analystes avant de relancer.",
            "technical": technical,
            "context": limits,
        }

    if any(marker in lower for marker in ("connection refused", "connecterror", "connection error", "timed out", "timeout")):
        return {
            "code": "llm_unavailable",
            "title": "Connexion à la passerelle IA interrompue",
            "message": "Le modèle ne répondait plus pendant la génération.",
            "recommendation": "Vérifiez qu’OmniRoute est actif, puis relancez l’analyse.",
            "technical": technical,
            "context": limits,
        }

    return {
        "code": "analysis_error",
        "title": "L’analyse s’est arrêtée",
        "message": "Une étape n’a pas pu se terminer. Le détail technique ci-dessous permet d’identifier la cause.",
        "recommendation": "Vous pouvez corriger la cause indiquée, puis relancer la même analyse.",
        "technical": technical,
        "context": limits,
    }


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

    recent_closes = []
    closes_match = re.search(r"### Recent verified closes[^\n]*\n\n\| Date \| Close \|\n\|---\|---:\|\n([\s\S]*?)(?:\n\n|\Z)", snapshot)
    if closes_match:
        for line in closes_match.group(1).strip().splitlines():
            row_match = re.search(r"\|\s*([0-9-]+)\s*\|\s*([0-9.,]+)\s*\|", line)
            if row_match:
                try:
                    price = float(row_match.group(2).replace(",", ""))
                    recent_closes.append(price)
                except ValueError:
                    pass

    return {
        "latest_date": latest_match.group(1) if latest_match else None,
        "close": close,
        "open": value("Open"),
        "high": value("High"),
        "low": value("Low"),
        "volume": value("Volume"),
        "sparkline": recent_closes,
        "recent_closes": recent_closes,
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


def report_section_path(job_id: str, report_key: str) -> Path | None:
    relative = REPORT_SECTION_FILES.get(report_key)
    if not relative:
        return None
    candidate = (REPORTS_DIR / job_id / relative).resolve()
    if REPORTS_DIR.resolve() not in candidate.parents:
        return None
    return candidate


def persist_report_section(job_id: str, report_key: str, content: str) -> Path | None:
    report_path = report_section_path(job_id, report_key)
    if not report_path or not str(content or "").strip():
        return None
    report_path.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = report_path.with_suffix(f"{report_path.suffix}.tmp")
    temporary_path.write_text(str(content), encoding="utf-8")
    temporary_path.replace(report_path)
    return report_path


def update_stage_step(
    job_id: str,
    stage_id: str,
    step_id: str,
    status: str,
    *,
    detail: str | None = None,
    report_key: str | None = None,
) -> None:
    with LOCK:
        job = JOBS.get(job_id)
        if not job:
            return
        stage_steps = {
            key: [dict(step) for step in values]
            for key, values in (job.get("stage_steps") or {}).items()
        }
        step = next(
            (item for item in stage_steps.get(stage_id, []) if item.get("id") == step_id),
            None,
        )
        if not step:
            return
        step["status"] = status
        if detail:
            step["detail"] = detail
        if report_key in LINKABLE_STAGE_REPORT_KEYS and status == "complete":
            step["report_url"] = report_url(job_id, report_key)
        job["stage_steps"] = stage_steps


def graph_node_report(node_name: str, outputs) -> tuple[str | None, str | None, str | None]:  # noqa: ANN001
    if not isinstance(outputs, dict):
        return None, None, None
    analyst_key = ANALYST_NODE_TO_KEY.get(node_name)
    if analyst_key:
        report_key = ANALYST_NODE_SPECS[analyst_key].report_key
        return "analysts", analyst_key, outputs.get(report_key)
    debate_key = DEBATE_NODE_TO_KEY.get(node_name)
    if not debate_key:
        return None, None, None
    debate_state = outputs.get("investment_debate_state") or {}
    content_key = {
        "bull": "bull_history",
        "bear": "bear_history",
        "research_manager": "judge_decision",
    }[debate_key]
    return "debate", debate_key, debate_state.get(content_key)


def record_graph_node_start(job_id: str, node_name: str) -> None:
    active_index = GRAPH_NODE_STAGE_INDEX.get(node_name)
    if active_index is None:
        return
    with LOCK:
        job = JOBS.get(job_id)
        if not job:
            return
        job["stages"] = stages(active_index)
        job["logs"] = (job.get("logs", []) + [f"{node_name} : traitement en cours."])[-8:]
    if node_name in ANALYST_NODE_TO_KEY:
        update_stage_step(job_id, "analysts", ANALYST_NODE_TO_KEY[node_name], "active")
    elif node_name in DEBATE_NODE_TO_KEY:
        update_stage_step(job_id, "debate", DEBATE_NODE_TO_KEY[node_name], "active")


def record_graph_node_complete(job_id: str, node_name: str, outputs) -> None:  # noqa: ANN001
    stage_id, step_id, content = graph_node_report(node_name, outputs)
    if not stage_id or not step_id or not content:
        return
    report_key = step_id
    persisted = persist_report_section(job_id, report_key, content)
    if not persisted:
        return
    update_stage_step(
        job_id,
        stage_id,
        step_id,
        "complete",
        detail="Rapport terminé et disponible en Markdown.",
        report_key=report_key,
    )


def record_graph_node_error(job_id: str, node_name: str, error) -> None:  # noqa: ANN001
    if node_name in ANALYST_NODE_TO_KEY:
        update_stage_step(
            job_id,
            "analysts",
            ANALYST_NODE_TO_KEY[node_name],
            "error",
            detail=f"Échec : {' '.join(str(error).split())[:180]}",
        )
    elif node_name in DEBATE_NODE_TO_KEY:
        update_stage_step(
            job_id,
            "debate",
            DEBATE_NODE_TO_KEY[node_name],
            "error",
            detail=f"Échec : {' '.join(str(error).split())[:180]}",
        )


def load_history_items() -> list[dict]:
    try:
        payload = json.loads(HISTORY_FILE.read_text(encoding="utf-8")) if HISTORY_FILE.exists() else []
    except (OSError, json.JSONDecodeError):
        return []
    if not isinstance(payload, list):
        return []
    enriched = []
    for item in payload:
        if not isinstance(item, dict):
            continue
        if "close" not in item or "sparkline" not in item:
            item_id = item.get("id")
            if item_id:
                res_file = REPORTS_DIR / item_id / "result.json"
                if res_file.is_file():
                    try:
                        r = json.loads(res_file.read_text(encoding="utf-8"))
                        snap = r.get("snapshot") or {}
                        item.setdefault("close", snap.get("close"))
                        item.setdefault("sparkline", snap.get("sparkline"))
                    except (OSError, json.JSONDecodeError):
                        pass
        enriched.append(item)
    return enriched


def delete_history_item(history_id: str) -> bool:
    if not re.fullmatch(r"[a-f0-9-]+", history_id):
        return False
    try:
        items = load_history_items()
        updated = [item for item in items if item.get("id") != history_id]
        HISTORY_FILE.write_text(json.dumps(updated, ensure_ascii=False, indent=2), encoding="utf-8")
        report_dir = REPORTS_DIR / history_id
        if report_dir.is_dir():
            shutil.rmtree(report_dir, ignore_errors=True)
        return True
    except OSError:
        return False


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

    if not isinstance(result.get("analysis_parameters"), dict):
        result["analysis_parameters"] = legacy_analysis_parameters(item)

    reports = result.get("reports") if isinstance(result.get("reports"), dict) else {}
    restored_analysts = item.get("analysts", []) or [
        key for key in ANALYST_NODE_SPECS if reports.get(key)
    ]

    return {
        "id": item["id"],
        "ticker": item.get("ticker", "—"),
        "analysis_date": item.get("analysis_date", "—"),
        "model": item.get("model") or "Non enregistré",
        "analysts": restored_analysts,
        "depth": item.get("depth", 1),
        "status": "complete",
        "created_at": item.get("created_at", ""),
        "stages": stages(6),
        "stage_steps": restore_stage_steps(history_id, restored_analysts, reports),
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


def new_analysis_job(
    ticker: str,
    analysis_date: str,
    analysts: list[str],
    depth: int,
    runtime: dict | None = None,
    *,
    parent_scan_id: str | None = None,
) -> tuple[str, dict]:
    """Build the canonical job shape shared by manual and scanner analyses."""
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
        "data_steps": data_steps(0),
        "stage_steps": workflow_stage_steps(job_id, analysts),
        "logs": ["Analyse placée dans la file locale."],
        "llm_calls": 0,
        "tool_calls": 0,
        "llm_errors": 0,
        "source_events": [],
        "reliability": {},
        "limits": analysis_limits(depth, len(analysts), runtime),
        "result": None,
        "error": None,
    }
    if parent_scan_id:
        job["parent_scan_id"] = parent_scan_id
    return job_id, job


def active_work_exists() -> bool:
    """Whether one manual analysis or market scan currently owns the runner."""
    return any(job.get("status") in {"queued", "running"} for job in JOBS.values()) or any(
        job.get("status") in {"queued", "running"} for job in SCAN_JOBS.values()
    )


def update_scan(job_id: str, **changes) -> None:
    with LOCK:
        if job_id in SCAN_JOBS:
            SCAN_JOBS[job_id].update(changes)
    save_scans_cache()


def public_scan(job: dict) -> dict:
    """Return a JSON-safe scan snapshot plus the active child analysis state."""
    result = dict(job)
    result.pop("started_at", None)
    result["elapsed"] = elapsed(job.get("started_at"))
    active_job_id = job.get("active_analysis_job_id")
    active_job = JOBS.get(active_job_id) if active_job_id else None
    result["active_analysis"] = public_job(active_job) if active_job else None
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
    def __init__(self, job_id: str, expected_calls: int, config: dict):
        self.job_id = job_id
        self.expected_calls = max(8, expected_calls)
        self.config = config
        self._last_prompt_fingerprint = None
        self._last_prompt_at = 0.0
        self._tool_runs: dict[str, str] = {}
        self._graph_node_runs: dict[str, str] = {}

    def _advance(self, message: str, prompts=None) -> None:  # noqa: ANN001
        prompt_tokens = estimate_prompt_tokens(prompts)
        fingerprint = hash(tuple(str(prompt) for prompt in prompts or []))
        now = time.monotonic()
        if fingerprint == self._last_prompt_fingerprint and now - self._last_prompt_at < 1:
            return
        self._last_prompt_fingerprint = fingerprint
        self._last_prompt_at = now
        with LOCK:
            job = JOBS[self.job_id]
            job["llm_calls"] += 1
            job["logs"] = (job["logs"] + [message])[-8:]
            job["limits"] = context_usage(job["limits"], prompt_tokens)

    def on_chain_start(self, serialized, inputs, **kwargs):  # noqa: ANN001
        metadata = kwargs.get("metadata") or {}
        node_name = metadata.get("langgraph_node")
        if not node_name or kwargs.get("name") != node_name:
            return
        run_key = str(kwargs.get("run_id") or f"{node_name}-{time.monotonic_ns()}")
        self._graph_node_runs[run_key] = node_name
        record_graph_node_start(self.job_id, node_name)

    def on_chain_end(self, outputs, **kwargs):  # noqa: ANN001
        node_name = self._graph_node_runs.pop(str(kwargs.get("run_id") or ""), None)
        if node_name:
            record_graph_node_complete(self.job_id, node_name, outputs)

    def on_chain_error(self, error, **kwargs):  # noqa: ANN001
        node_name = self._graph_node_runs.pop(str(kwargs.get("run_id") or ""), None)
        if node_name:
            record_graph_node_error(self.job_id, node_name, error)

    def on_llm_start(self, serialized, prompts, **kwargs):  # noqa: ANN001
        self._advance("Un agent IA prépare sa réponse.", prompts)

    def on_chat_model_start(self, serialized, messages, **kwargs):  # noqa: ANN001
        prompts = [
            "\n".join(str(getattr(message, "content", message)) for message in batch)
            for batch in messages
        ]
        self._advance("Un agent IA prépare sa réponse.", prompts)

    def on_llm_error(self, error, **kwargs):  # noqa: ANN001
        with LOCK:
            job = JOBS[self.job_id]
            job["llm_errors"] = job.get("llm_errors", 0) + 1

    def on_llm_end(self, response, **kwargs):  # noqa: ANN001
        return

    def on_tool_start(self, serialized, input_str, **kwargs):  # noqa: ANN001
        serialized = serialized or {}
        identity = serialized.get("id") or []
        tool_name = serialized.get("name") or (identity[-1] if identity else "")
        run_key = str(kwargs.get("run_id") or f"{tool_name}-{time.monotonic_ns()}")
        event_id = str(uuid.uuid4())
        event = {
            "id": event_id,
            "tool": tool_name,
            "label": TOOL_LABELS.get(tool_name, tool_name or "Source de données"),
            "source": source_for_tool(tool_name, self.config),
            "status": "requested",
            "inputs": parse_tool_input(input_str),
        }
        self._tool_runs[run_key] = event_id
        with LOCK:
            job = JOBS[self.job_id]
            job["tool_calls"] += 1
            job.setdefault("source_events", []).append(event)
            source = event["source"] or "Une source de données"
            job["logs"] = (job["logs"] + [f"{source} : {event['label'].lower()}."])[-8:]

    def _finish_tool(self, status: str, output=None, **kwargs) -> None:  # noqa: ANN001
        run_key = str(kwargs.get("run_id") or "")
        event_id = self._tool_runs.pop(run_key, None)
        if not event_id:
            return
        with LOCK:
            events = JOBS[self.job_id].get("source_events", [])
            event = next((item for item in events if item.get("id") == event_id), None)
            if not event:
                return
            event["status"] = status
            if event.get("tool") in {"get_news", "get_global_news"} and output is not None:
                event["articles_returned"] = news_count_from_output(output)

    def on_tool_end(self, output, **kwargs):  # noqa: ANN001
        content = str(getattr(output, "content", output) or "").lower()
        unavailable = any(marker in content for marker in (
            "data_unavailable", "no_data_available", "error fetching", "no news found"
        ))
        self._finish_tool("unavailable" if unavailable else "ok", output, **kwargs)

    def on_tool_error(self, error, **kwargs):  # noqa: ANN001
        self._finish_tool("error", **kwargs)


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
    config = web_analysis_config(depth)
    try:
        update_job(
            job_id,
            status="running",
            started_at=time.time(),
            stages=stages(0),
            data_steps=data_steps(0),
            logs=["Yahoo Finance : chargement des OHLCV ajustés et contrôle anti-données futures."],
        )
        snapshot_text = build_verified_market_snapshot(
            ticker,
            analysis_date,
            look_back_days=30,
            progress=lambda step_id, details: record_data_progress(job_id, step_id, details),
        )
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
            source_events=[{
                "id": "verified-market-precheck",
                "tool": "build_verified_market_snapshot",
                "label": "Cours OHLCV et contrôle préalable",
                "source": "Yahoo Finance",
                "status": "ok",
                "inputs": {"ticker": ticker, "end_date": analysis_date, "lookback_days": 30},
            }],
        )

        with LOCK:
            limits = dict(JOBS[job_id].get("limits") or analysis_limits(depth, len(analysts)))
        expected_calls = limits["expected_model_calls"]
        resume_step = checkpoint_step(
            config["data_cache_dir"], ticker, analysis_date,
            run_signature(analysts, depth),
        )
        callback = ProgressCallback(job_id, expected_calls, config)
        graph = TradingAgentsGraph(selected_analysts=analysts, debug=False, config=config, callbacks=[callback])
        output_token_budget = apply_output_budget(graph, depth)
        update_job(job_id, output_token_budget=output_token_budget, limits=limits)
        final_state, raw_decision = graph.propagate(ticker, analysis_date, asset_type="stock")
        reports = report_sections(final_state)
        final_decision = reports["portfolio"]
        reliability = reliability_checks(snapshot, final_decision, len(analysts))

        raw_label = str(raw_decision or "HOLD").upper().strip()
        translations = {
            "BUY": "ACHETER",
            "STRONG BUY": "ACHAT FORT",
            "ACHAT FORT": "ACHAT FORT",
            "ACHETER FORT": "ACHAT FORT",
            "OVERWEIGHT": "SURPONDÉRER",
            "SURPONDÉRER": "SURPONDÉRER",
            "SURPONDERER": "SURPONDÉRER",
            "OUTPERFORM": "SURPERFORMER",
            "ACCUMULATE": "ACCUMULER",
            "ACCUMULER": "ACCUMULER",
            "SELL": "VENDRE",
            "STRONG SELL": "VENTE FORTE",
            "VENTE FORTE": "VENTE FORTE",
            "VENDRE FORT": "VENTE FORTE",
            "UNDERWEIGHT": "SOUS-PONDÉRER",
            "SOUS-PONDÉRER": "SOUS-PONDÉRER",
            "SOUSPONDERER": "SOUS-PONDÉRER",
            "UNDERPERFORM": "SOUS-PERFORMER",
            "REDUCE": "ALLÉGER",
            "ALLÉGER": "ALLÉGER",
            "ALLEGER": "ALLÉGER",
            "HOLD": "CONSERVER",
            "CONSERVER": "CONSERVER",
            "WAIT": "ATTENDRE",
            "ATTENDRE": "ATTENDRE",
            "EQUAL-WEIGHT": "PONDÉRATION NEUTRE",
            "NEUTRAL": "NEUTRE",
            "NEUTRE": "NEUTRE",
        }
        display = "ATTENDRE" if reliability["blocked"] else translations.get(raw_label, raw_label)
        confidence = "Confiance limitée" if reliability["blocked"] else "Confiance modérée"

        report_dir = REPORTS_DIR / job_id
        report_path = graph.save_reports(final_state, ticker, report_dir)
        complete_report = report_path.read_text(encoding="utf-8") if report_path.exists() else final_decision
        summary = "\n\n".join(filter(None, [reports.get("portfolio"), reports.get("research_manager")]))
        memory_used = bool(graph.memory_log.get_past_context(ticker))
        with LOCK:
            current_job = JOBS[job_id]
            parameters = analysis_parameters(
                ticker=ticker,
                analysts=analysts,
                depth=depth,
                config=config,
                limits=current_job.get("limits") or limits,
                events=list(current_job.get("source_events", [])),
                completed_calls=current_job.get("llm_calls", 0),
                llm_errors=current_job.get("llm_errors", 0),
                memory_used=memory_used,
                resumed_from_step=resume_step,
            )
        result = {
            "raw_decision": raw_label,
            "display_decision": display,
            "confidence": confidence,
            "summary": summary,
            "reports": reports,
            "complete_report": complete_report,
            "reliability": reliability,
            "snapshot": {key: value for key, value in snapshot.items() if key != "raw"},
            "analysis_parameters": parameters,
        }
        update_job(
            job_id,
            status="complete",
            stages=stages(6),
            stage_steps=restore_stage_steps(job_id, analysts, reports),
            result=result,
            report_path=str(report_path),
            reliability=reliability,
            logs=["Rapport terminé et contrôlé."],
        )
        with LOCK:
            save_history(JOBS[job_id])
    except Exception as exc:  # noqa: BLE001
        with LOCK:
            current = JOBS[job_id]
            active = next((i for i, stage in enumerate(current["stages"]) if stage["status"] == "active"), 0)
            failure = describe_analysis_error(exc, current)
            failed_data_steps = fail_active_data_step(current.get("data_steps", []), str(exc) or failure["message"]) if active == 0 else current.get("data_steps", [])
        update_job(job_id, status="error", error=failure["message"], failure=failure, stages=stages(active, error=True), data_steps=failed_data_steps, logs=[failure["title"]])


def run_scan(scan_id: str, payload: dict) -> None:
    """Prefilter one universe, run TradingAgents sequentially, then re-rank."""
    symbols = payload["symbols"]
    analysis_date = payload["date"]
    prefilter_limit = payload["prefilter_limit"]
    analysis_limit = payload["analysis_limit"]
    analysts = payload["analysts"]
    depth = payload["depth"]

    try:
        update_scan(
            scan_id,
            status="running",
            stage="screening",
            stage_label="Préfiltrage quantitatif",
            started_at=time.time(),
            logs=["Chargement des historiques OHLCV de l’univers."],
        )

        def record_screen_progress(completed: int, total: int, symbol: str, success: bool) -> None:
            update_scan(
                scan_id,
                screen_progress={"completed": completed, "total": total},
                logs=[
                    f"{symbol} : {'score calculé' if success else 'données indisponibles'} "
                    f"({completed}/{total})."
                ],
            )

        screened, data_errors = screen_universe(
            symbols,
            analysis_date,
            progress=record_screen_progress,
        )
        candidates = [dict(candidate) for candidate in screened[:prefilter_limit]]
        if not candidates:
            raise ValueError("Aucun titre de l’univers ne dispose de données suffisantes")

        target_count = min(analysis_limit, len(candidates))
        for index, candidate in enumerate(candidates):
            candidate["analysis_status"] = "queued" if index < target_count else "prefiltered"

        update_scan(
            scan_id,
            stage="analysis",
            stage_label="Analyses TradingAgents",
            candidates=candidates,
            data_errors=data_errors,
            analysis_progress={"completed": 0, "total": target_count},
            logs=[f"{len(screened)} titres classés ; {target_count} transmis aux agents."],
        )

        runtime = llm_runtime_info()
        for index in range(target_count):
            candidate = candidates[index]
            ticker = candidate["symbol"]
            child_id, child_job = new_analysis_job(
                ticker,
                analysis_date,
                analysts,
                depth,
                runtime,
                parent_scan_id=scan_id,
            )
            with LOCK:
                JOBS[child_id] = child_job
            candidate.update({"analysis_status": "running", "analysis_job_id": child_id})
            update_scan(
                scan_id,
                active_symbol=ticker,
                active_analysis_job_id=child_id,
                candidates=candidates,
                logs=[f"TradingAgents analyse {ticker} ({index + 1}/{target_count})."],
            )

            run_analysis(
                child_id,
                {"ticker": ticker, "date": analysis_date, "analysts": analysts, "depth": depth},
            )
            with LOCK:
                completed_job = dict(JOBS[child_id])

            if completed_job.get("status") == "complete":
                result = completed_job.get("result") or {}
                reliability = result.get("reliability") or {}
                raw_decision = str(result.get("raw_decision") or "HOLD").upper()
                blocked = bool(reliability.get("blocked", True))
                candidate.update({
                    "analysis_status": "blocked" if blocked else "complete",
                    "raw_decision": raw_decision,
                    "display_decision": result.get("display_decision") or raw_decision,
                    "confidence": result.get("confidence"),
                    "blocked": blocked,
                    "agent_score": DECISION_SCORES.get(raw_decision),
                    "final_score": combine_with_agent_score(
                        candidate["prefilter_score"], raw_decision, blocked=blocked,
                    ),
                })
            else:
                candidate.update({
                    "analysis_status": "error",
                    "analysis_error": completed_job.get("error") or "Analyse interrompue",
                    "blocked": True,
                    "final_score": None,
                })

            update_scan(
                scan_id,
                candidates=candidates,
                analysis_progress={"completed": index + 1, "total": target_count},
                logs=[f"Analyse de {ticker} terminée ({index + 1}/{target_count})."],
            )

        final_ranking = sorted(
            [candidate for candidate in candidates if candidate["analysis_status"] in {"complete", "blocked"}],
            key=lambda item: (
                item.get("final_score") is None,
                -(item.get("final_score") or 0),
                item["symbol"],
            ),
        )
        rank = 1
        for candidate in final_ranking:
            if candidate.get("final_score") is not None:
                candidate["final_rank"] = rank
                rank += 1
            else:
                candidate["final_rank"] = None

        update_scan(
            scan_id,
            status="complete",
            stage="complete",
            stage_label="Classement terminé",
            active_symbol=None,
            active_analysis_job_id=None,
            candidates=candidates,
            ranking=final_ranking,
            logs=["Préfiltrage et analyses terminés."],
        )
    except Exception as exc:  # noqa: BLE001
        update_scan(
            scan_id,
            status="error",
            stage="error",
            stage_label="Scanner interrompu",
            active_symbol=None,
            active_analysis_job_id=None,
            error=str(exc) or type(exc).__name__,
            logs=["Le scanner s’est arrêté avant le classement final."],
        )


def llm_status() -> dict:
    status = llm_runtime_info()
    status["analysis"] = current_analysis_config()
    return status


def tradingagents_capabilities() -> dict:
    """Expose the analyst registry used by the actual TradingAgents graph."""
    return {
        "analysts": [
            {
                "id": key,
                "name": ANALYST_PRESENTATION.get(key, {}).get("name", spec.agent_node),
                "description": ANALYST_PRESENTATION.get(key, {}).get(
                    "description", "Analyste disponible dans TradingAgents."
                ),
                "engine_name": spec.agent_node,
                "report_key": spec.report_key,
            }
            for key, spec in ANALYST_NODE_SPECS.items()
        ],
        "data_steps": data_steps(),
    }


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
        if path == "/api/capabilities":
            self.send_json(tradingagents_capabilities())
            return
        if path == "/api/scanner/universes":
            self.send_json({
                "universes": universe_catalog(),
                "defaults": {"universe": "us-large", "prefilter_limit": 8, "analysis_limit": 3},
            })
            return
        if path == "/api/status":
            self.send_json(llm_status())
            return
        if path == "/api/active":
            with LOCK:
                active_job = next((public_job(j) for j in JOBS.values() if j.get("status") in {"queued", "running"}), None)
                latest_job = public_job(list(JOBS.values())[-1]) if JOBS and not active_job else None
                active_scan = next((public_scan(s) for s in SCAN_JOBS.values() if s.get("status") in {"queued", "running"}), None)
                latest_scan = public_scan(list(SCAN_JOBS.values())[-1]) if SCAN_JOBS and not active_scan else None
            self.send_json({
                "active_job": active_job,
                "latest_job": latest_job,
                "active_scan": active_scan,
                "latest_scan": latest_scan,
            })
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
        scan_match = re.fullmatch(r"/api/scans/([a-f0-9-]+)", path)
        if scan_match:
            with LOCK:
                scan = SCAN_JOBS.get(scan_match.group(1))
                payload = public_scan(scan) if scan else None
            if payload:
                self.send_json(payload)
            else:
                self.send_json({"error": "Scan introuvable"}, HTTPStatus.NOT_FOUND)
            return
        section_match = re.fullmatch(
            r"/api/jobs/([a-f0-9-]+)/reports/([a-z_]+)\.md",
            path,
        )
        if section_match:
            report_path = report_section_path(section_match.group(1), section_match.group(2))
            if not report_path or not report_path.is_file():
                self.send_json({"error": "Rapport Markdown introuvable"}, HTTPStatus.NOT_FOUND)
                return
            body = report_path.read_bytes()
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/markdown; charset=utf-8")
            self.send_header("Content-Disposition", f'inline; filename="{report_path.name}"')
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
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
        if path not in {"/api/analyze", "/api/scans"}:
            self.send_json({"error": "Route inconnue"}, HTTPStatus.NOT_FOUND)
            return
        try:
            length = min(int(self.headers.get("Content-Length", "0")), 1_000_000)
            payload = json.loads(self.rfile.read(length))
        except (ValueError, TypeError, json.JSONDecodeError) as exc:
            self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
            return

        if path == "/api/scans":
            try:
                universe_id = str(payload.get("universe", "us-large"))
                symbols = resolve_symbols(universe_id, payload.get("symbols"))
                analysis_date = str(payload.get("date", ""))
                parsed_date = date.fromisoformat(analysis_date)
                if parsed_date > date.today():
                    raise ValueError("La date ne peut pas être dans le futur")
                prefilter_limit = int(payload.get("prefilter_limit", 8))
                analysis_limit = int(payload.get("analysis_limit", 3))
                if not 1 <= prefilter_limit <= 20:
                    raise ValueError("Le préfiltre doit conserver entre 1 et 20 titres")
                if not 1 <= analysis_limit <= min(5, prefilter_limit):
                    raise ValueError("TradingAgents peut analyser entre 1 et 5 titres du préfiltre")
            except (ValueError, TypeError) as exc:
                self.send_json({"error": str(exc)}, HTTPStatus.BAD_REQUEST)
                return

            analysts = list(ANALYST_NODE_SPECS)
            depth = 1
            catalog = {item["id"]: item for item in universe_catalog()}
            with LOCK:
                if active_work_exists():
                    self.send_json({"error": "Une analyse ou un scan est déjà en cours"}, HTTPStatus.CONFLICT)
                    return
                scan_id = str(uuid.uuid4())
                scan = {
                    "id": scan_id,
                    "universe": universe_id,
                    "universe_label": catalog[universe_id]["label"],
                    "symbols": symbols,
                    "analysis_date": analysis_date,
                    "prefilter_limit": prefilter_limit,
                    "analysis_limit": analysis_limit,
                    "analysts": analysts,
                    "depth": depth,
                    "status": "queued",
                    "stage": "queued",
                    "stage_label": "Scan en attente",
                    "created_at": datetime.now().strftime("%d/%m/%Y %H:%M"),
                    "started_at": None,
                    "screen_progress": {"completed": 0, "total": len(symbols)},
                    "analysis_progress": {"completed": 0, "total": analysis_limit},
                    "active_symbol": None,
                    "active_analysis_job_id": None,
                    "candidates": [],
                    "ranking": [],
                    "data_errors": [],
                    "logs": ["Scan placé dans la file locale."],
                    "error": None,
                }
                SCAN_JOBS[scan_id] = scan
            save_scans_cache()
            clean_payload = {
                "symbols": symbols,
                "date": analysis_date,
                "prefilter_limit": prefilter_limit,
                "analysis_limit": analysis_limit,
                "analysts": analysts,
                "depth": depth,
            }
            threading.Thread(target=run_scan, args=(scan_id, clean_payload), daemon=True).start()
            self.send_json(public_scan(scan), HTTPStatus.ACCEPTED)
            return

        try:
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

        runtime = llm_runtime_info()
        with LOCK:
            if active_work_exists():
                self.send_json({"error": "Une analyse ou un scan est déjà en cours"}, HTTPStatus.CONFLICT)
                return
            job_id, job = new_analysis_job(ticker, analysis_date, analysts, depth, runtime)
            JOBS[job_id] = job
        clean_payload = {"ticker": ticker, "date": analysis_date, "analysts": analysts, "depth": depth}
        threading.Thread(target=run_analysis, args=(job_id, clean_payload), daemon=True).start()
        self.send_json(public_job(job), HTTPStatus.ACCEPTED)

    def do_DELETE(self):  # noqa: N802
        path = urlparse(self.path).path
        history_match = re.fullmatch(r"/api/history/([a-f0-9-]+)", path)
        if history_match:
            history_id = history_match.group(1)
            success = delete_history_item(history_id)
            if success:
                self.send_json({"ok": True, "deleted_id": history_id})
            else:
                self.send_json({"error": "Impossible de supprimer l'élément d'historique"}, HTTPStatus.NOT_FOUND)
            return
        self.send_json({"error": "Route inconnue"}, HTTPStatus.NOT_FOUND)

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
