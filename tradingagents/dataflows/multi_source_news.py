"""Multi-source ticker news aggregation.

Yahoo Finance remains the broad news source. Official regulatory sources are
added when applicable:
- SEC EDGAR for US issuers
- Euronext company press releases for Euronext-listed tickers

All sources are normalized, filtered to the requested date window, and
conservatively deduplicated before the News Analyst sees them.
"""

from __future__ import annotations

import logging
import re
from datetime import datetime, timezone
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import yfinance as yf

from .config import get_config
from .official_news import get_euronext_articles, get_sec_edgar_articles
from .stockstats_utils import yf_retry
from .symbol_utils import normalize_symbol
from .yfinance_news import _extract_article_data, _in_news_window

logger = logging.getLogger(__name__)

_TRACKING_QUERY_PREFIXES = ("utm_",)
_TRACKING_QUERY_KEYS = {
    "campaign",
    "cmpid",
    "guccounter",
    "ncid",
    "ref",
    "referrer",
    "source",
}


def _canonical_url(url: str) -> str:
    if not url:
        return ""
    try:
        parts = urlsplit(url.strip())
        query = []
        for key, value in parse_qsl(parts.query, keep_blank_values=True):
            lowered = key.lower()
            if lowered.startswith(_TRACKING_QUERY_PREFIXES) or lowered in _TRACKING_QUERY_KEYS:
                continue
            query.append((key, value))
        path = parts.path.rstrip("/") or parts.path
        return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), path, urlencode(query), ""))
    except Exception:
        return url.strip()


def _normalized_title(title: str) -> str:
    text = re.sub(r"[^a-z0-9]+", " ", (title or "").lower())
    return " ".join(text.split())


def _title_tokens(title: str) -> set[str]:
    return {token for token in _normalized_title(title).split() if len(token) > 2}


def _titles_near_duplicate(left: str, right: str) -> bool:
    left_norm = _normalized_title(left)
    right_norm = _normalized_title(right)
    if not left_norm or not right_norm:
        return False
    if left_norm == right_norm:
        return True

    left_tokens = _title_tokens(left)
    right_tokens = _title_tokens(right)
    if not left_tokens or not right_tokens:
        return False
    overlap = len(left_tokens & right_tokens) / max(1, len(left_tokens | right_tokens))
    return overlap >= 0.86


def _dedupe_articles(articles: list[dict]) -> list[dict]:
    """Remove URL duplicates and very-close title duplicates.

    Exact/canonical URL matching is preferred. Title dedupe is deliberately
    conservative so two different developments about the same event survive.
    When duplicates collide, official regulatory sources win over aggregators.
    """
    source_priority = {"sec_edgar": 3, "euronext": 3, "yahoo": 1}
    ordered = sorted(
        articles,
        key=lambda article: (
            source_priority.get(str(article.get("provider")), 0),
            article.get("pub_date") or datetime.min.replace(tzinfo=timezone.utc),
        ),
        reverse=True,
    )

    kept: list[dict] = []
    seen_urls: set[str] = set()
    for article in ordered:
        canonical_url = _canonical_url(str(article.get("link") or ""))
        if canonical_url and canonical_url in seen_urls:
            continue

        title = str(article.get("title") or "")
        if any(_titles_near_duplicate(title, str(existing.get("title") or "")) for existing in kept):
            continue

        kept.append(article)
        if canonical_url:
            seen_urls.add(canonical_url)

    kept.sort(
        key=lambda article: article.get("pub_date") or datetime.min.replace(tzinfo=timezone.utc),
        reverse=True,
    )
    return kept


def _get_yahoo_articles(ticker: str, start_date: str, end_date: str) -> list[dict]:
    config = get_config()
    article_limit = int(config.get("news_article_limit", 20))
    canonical = normalize_symbol(ticker)
    stock = yf.Ticker(canonical)
    news = yf_retry(lambda: stock.get_news(count=article_limit)) or []
    start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    end_dt = datetime.strptime(end_date, "%Y-%m-%d")

    articles: list[dict] = []
    for raw_article in news:
        data = _extract_article_data(raw_article)
        if not _in_news_window(data["pub_date"], start_dt, end_dt):
            continue
        articles.append(
            {
                "ticker": ticker,
                "title": data["title"],
                "summary": data["summary"],
                "publisher": data["publisher"],
                "source": data["publisher"],
                "provider": "yahoo",
                "link": data["link"],
                "pub_date": data["pub_date"],
                "event_type": "news",
                "metadata": {"official": False},
            }
        )
    return articles


def _safe_collect(name: str, collector, *args) -> list[dict]:
    try:
        return collector(*args)
    except Exception as exc:
        logger.warning("Official news source %s failed: %s", name, exc)
        return []


def _format_article(article: dict) -> str:
    source = article.get("source") or article.get("publisher") or article.get("provider") or "Unknown"
    event_type = article.get("event_type")
    title = article.get("title") or "No title"
    lines = [f"### {title} (source: {source})"]
    if event_type and event_type not in {"news", "Company press release"}:
        lines.append(f"Type: {event_type}")
    pub_date = article.get("pub_date")
    if isinstance(pub_date, datetime):
        if pub_date.tzinfo is None:
            pub_date = pub_date.replace(tzinfo=timezone.utc)
        lines.append(f"Published: {pub_date.astimezone(timezone.utc).isoformat()}")
    summary = str(article.get("summary") or "").strip()
    if summary:
        lines.append(summary)
    link = str(article.get("link") or "").strip()
    if link:
        lines.append(f"Link: {link}")
    return "\n".join(lines)


def get_news_multisource(ticker: str, start_date: str, end_date: str) -> str:
    """Merge Yahoo + applicable official regulatory sources for one ticker."""
    config = get_config()
    all_articles: list[dict] = []
    source_status: list[str] = []

    try:
        yahoo_articles = _get_yahoo_articles(ticker, start_date, end_date)
        all_articles.extend(yahoo_articles)
        source_status.append(f"Yahoo={len(yahoo_articles)}")
    except Exception as exc:
        # Unlike the former yfinance-only implementation, a Yahoo outage no
        # longer prevents official filings from reaching the analyst.
        logger.warning("Yahoo news failed for %s: %s", ticker, exc)
        source_status.append("Yahoo=unavailable")

    sec_articles = _safe_collect("SEC EDGAR", get_sec_edgar_articles, ticker, start_date, end_date)
    euronext_articles = _safe_collect("Euronext", get_euronext_articles, ticker, start_date, end_date)
    all_articles.extend(sec_articles)
    all_articles.extend(euronext_articles)
    source_status.append(f"SEC={len(sec_articles)}")
    source_status.append(f"Euronext={len(euronext_articles)}")

    deduped = _dedupe_articles(all_articles)
    limit = int(config.get("news_merged_article_limit", config.get("news_article_limit", 20)))
    deduped = deduped[:limit]

    canonical = normalize_symbol(ticker)
    resolved = "" if canonical == ticker else f" (resolved to {canonical})"
    if not deduped:
        return (
            f"No news found for {ticker}{resolved} between {start_date} and {end_date}. "
            f"Sources checked: {', '.join(source_status)}"
        )

    body = "\n\n".join(_format_article(article) for article in deduped)
    return (
        f"## {ticker}{resolved} News, from {start_date} to {end_date}\n"
        f"Sources: {', '.join(source_status)}; merged={len(deduped)} after deduplication\n\n"
        f"{body}"
    )
