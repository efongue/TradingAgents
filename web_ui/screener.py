"""Deterministic market prefilter used by the local web scanner.

The prefilter is intentionally inexpensive: it ranks a bounded universe from
cached/daily OHLCV data before the costly TradingAgents graph is run on the
best candidates.  It does not use an LLM and it never places orders.
"""

from __future__ import annotations

import math
import re
from collections.abc import Callable, Iterable
from concurrent.futures import ThreadPoolExecutor, as_completed

import pandas as pd

from tradingagents.dataflows.stockstats_utils import load_ohlcv

MAX_UNIVERSE_SIZE = 50
TICKER_RE = re.compile(r"[A-Z0-9.\-^=]{1,20}")

UNIVERSES: dict[str, dict] = {
    "us-large": {
        "label": "Grandes capitalisations US",
        "description": "24 actions américaines liquides pour démarrer rapidement.",
        "symbols": (
            "AAPL", "MSFT", "NVDA", "AMZN", "GOOGL", "META", "BRK-B", "LLY",
            "AVGO", "JPM", "TSLA", "UNH", "V", "XOM", "MA", "COST", "WMT",
            "PG", "JNJ", "HD", "ORCL", "NFLX", "CRM", "AMD",
        ),
    },
    "fr-large": {
        "label": "Grandes capitalisations françaises",
        "description": "20 grandes valeurs cotées à Paris, via leurs symboles Yahoo Finance.",
        "symbols": (
            "MC.PA", "OR.PA", "SAN.PA", "AIR.PA", "SU.PA", "TTE.PA", "BNP.PA",
            "SAF.PA", "AI.PA", "EL.PA", "CS.PA", "DG.PA", "RI.PA", "EN.PA",
            "DSY.PA", "CAP.PA", "HO.PA", "KER.PA", "VIE.PA", "ORA.PA",
        ),
    },
    "custom": {
        "label": "Liste personnalisée",
        "description": f"Jusqu’à {MAX_UNIVERSE_SIZE} symboles séparés par des virgules.",
        "symbols": (),
    },
}

DECISION_SCORES = {
    "BUY": 100.0,
    "OVERWEIGHT": 80.0,
    "HOLD": 50.0,
    "UNDERWEIGHT": 20.0,
    "SELL": 0.0,
}


def universe_catalog() -> list[dict]:
    """Return the universe metadata safe to expose through the API."""
    return [
        {
            "id": universe_id,
            "label": definition["label"],
            "description": definition["description"],
            "count": len(definition["symbols"]) or None,
        }
        for universe_id, definition in UNIVERSES.items()
    ]


def resolve_symbols(universe_id: str, custom_symbols: str | Iterable[str] | None = None) -> list[str]:
    """Resolve, validate, deduplicate and bound one requested universe."""
    if universe_id not in UNIVERSES:
        raise ValueError("Univers d’actions inconnu")

    if universe_id == "custom":
        if isinstance(custom_symbols, str):
            raw_symbols = re.split(r"[,;\s]+", custom_symbols.strip())
        else:
            raw_symbols = list(custom_symbols or [])
    else:
        raw_symbols = list(UNIVERSES[universe_id]["symbols"])

    symbols: list[str] = []
    invalid: list[str] = []
    for value in raw_symbols:
        symbol = str(value or "").strip().upper()
        if not symbol:
            continue
        if not TICKER_RE.fullmatch(symbol):
            invalid.append(symbol)
            continue
        if symbol not in symbols:
            symbols.append(symbol)

    if invalid:
        raise ValueError(f"Symbole(s) invalide(s) : {', '.join(invalid[:3])}")
    if not symbols:
        raise ValueError("Ajoutez au moins un symbole à l’univers")
    if len(symbols) > MAX_UNIVERSE_SIZE:
        raise ValueError(f"L’univers est limité à {MAX_UNIVERSE_SIZE} symboles")
    return symbols


def _bounded(value: float, low: float, high: float) -> float:
    if high <= low:
        return 0.0
    return max(0.0, min(1.0, (value - low) / (high - low)))


def _change(close: pd.Series, sessions: int) -> float | None:
    if len(close) <= sessions:
        return None
    previous = float(close.iloc[-sessions - 1])
    return None if previous == 0 else (float(close.iloc[-1]) / previous - 1.0) * 100.0


def score_symbol(
    symbol: str,
    analysis_date: str,
    *,
    loader: Callable[[str, str], pd.DataFrame] = load_ohlcv,
) -> dict:
    """Score one symbol from momentum, trend, liquidity and realised risk."""
    frame = loader(symbol, analysis_date)
    if frame is None or frame.empty or "Close" not in frame.columns:
        raise ValueError("Aucune donnée OHLCV exploitable")

    close = pd.to_numeric(frame["Close"], errors="coerce").dropna()
    if len(close) < 22:
        raise ValueError("Historique insuffisant : 22 séances minimum")

    volume = pd.to_numeric(frame.get("Volume", pd.Series(index=frame.index, dtype=float)), errors="coerce")
    latest_close = float(close.iloc[-1])
    momentum_20d = _change(close, 20)
    momentum_60d = _change(close, 60)
    sma_window = min(50, len(close))
    sma_50 = float(close.tail(sma_window).mean())
    trend_vs_sma = 0.0 if sma_50 == 0 else (latest_close / sma_50 - 1.0) * 100.0
    daily_returns = close.pct_change().dropna().tail(60)
    volatility = float(daily_returns.std(ddof=0) * math.sqrt(252) * 100.0) if not daily_returns.empty else 100.0

    aligned_volume = volume.reindex(close.index).tail(20)
    aligned_close = close.tail(20)
    dollar_volume_series = aligned_close * aligned_volume
    dollar_volume = float(dollar_volume_series.dropna().mean()) if dollar_volume_series.notna().any() else 0.0
    log_liquidity = math.log10(max(dollar_volume, 1.0))

    components = {
        "momentum_20d": _bounded(momentum_20d or 0.0, -15.0, 20.0) * 35.0,
        "momentum_60d": _bounded(momentum_60d or 0.0, -25.0, 35.0) * 30.0,
        "trend": _bounded(trend_vs_sma, -10.0, 10.0) * 20.0,
        "liquidity": _bounded(log_liquidity, 6.0, 10.0) * 10.0,
        "stability": (1.0 - _bounded(volatility, 15.0, 80.0)) * 5.0,
    }
    score = round(sum(components.values()), 1)

    dates = pd.to_datetime(frame.get("Date"), errors="coerce") if "Date" in frame.columns else pd.to_datetime(frame.index, errors="coerce")
    valid_dates = dates.dropna()
    latest_date = valid_dates.max().strftime("%Y-%m-%d") if len(valid_dates) else analysis_date

    signals: list[str] = []
    signals.append("Momentum 20 j positif" if (momentum_20d or 0) > 0 else "Momentum 20 j négatif")
    signals.append("Cours au-dessus de sa moyenne" if trend_vs_sma >= 0 else "Cours sous sa moyenne")
    if volatility >= 50:
        signals.append("Volatilité élevée")
    elif dollar_volume > 0:
        signals.append("Liquidité mesurée")

    sparkline_series = close.dropna().tail(20)
    sparkline = [round(float(v), 2) for v in sparkline_series.tolist()] if not sparkline_series.empty else []

    return {
        "symbol": symbol,
        "prefilter_score": score,
        "latest_close": round(latest_close, 4),
        "latest_date": latest_date,
        "momentum_20d": round(momentum_20d, 2) if momentum_20d is not None else None,
        "momentum_60d": round(momentum_60d, 2) if momentum_60d is not None else None,
        "trend_vs_sma": round(trend_vs_sma, 2),
        "volatility": round(volatility, 2),
        "average_dollar_volume": round(dollar_volume, 2) if dollar_volume else None,
        "score_components": {key: round(value, 1) for key, value in components.items()},
        "signals": signals,
        "sparkline": sparkline,
    }


def screen_universe(
    symbols: Iterable[str],
    analysis_date: str,
    *,
    loader: Callable[[str, str], pd.DataFrame] = load_ohlcv,
    max_workers: int = 4,
    progress: Callable[[int, int, str, bool], None] | None = None,
) -> tuple[list[dict], list[dict]]:
    """Rank a symbol universe while isolating per-symbol market-data failures."""
    symbol_list = list(symbols)
    candidates: list[dict] = []
    errors: list[dict] = []
    workers = max(1, min(max_workers, len(symbol_list), 8))
    completed = 0

    with ThreadPoolExecutor(max_workers=workers, thread_name_prefix="scanner") as executor:
        futures = {
            executor.submit(score_symbol, symbol, analysis_date, loader=loader): symbol
            for symbol in symbol_list
        }
        for future in as_completed(futures):
            symbol = futures[future]
            success = False
            try:
                candidates.append(future.result())
                success = True
            except Exception as exc:  # noqa: BLE001 - a bad ticker must not stop the universe
                errors.append({"symbol": symbol, "error": str(exc) or type(exc).__name__})
            completed += 1
            if progress:
                progress(completed, len(symbol_list), symbol, success)

    candidates.sort(key=lambda item: (-item["prefilter_score"], item["symbol"]))
    for rank, candidate in enumerate(candidates, start=1):
        candidate["prefilter_rank"] = rank
    errors.sort(key=lambda item: item["symbol"])
    return candidates, errors


def combine_with_agent_score(prefilter_score: float, decision: str, *, blocked: bool = False) -> float | None:
    """Blend deterministic prefiltering with the final five-tier agent rating."""
    if blocked:
        return None
    agent_score = DECISION_SCORES.get(str(decision or "HOLD").upper())
    if agent_score is None:
        return None
    return round(float(prefilter_score) * 0.45 + agent_score * 0.55, 1)
