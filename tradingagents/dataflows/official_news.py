"""Official regulatory-news sources: SEC EDGAR (US) and Euronext (Europe).

The functions in this module return normalized article dictionaries so they can be
merged with vendor news before the LLM sees them. Network failures are intentionally
raised here and handled by the multi-source aggregator, which logs and degrades
without blocking an analysis.
"""

from __future__ import annotations

import logging
import threading
import time
from datetime import datetime, timedelta, timezone
from functools import lru_cache
from urllib.parse import urljoin

import requests
import yfinance as yf
from dateutil import parser as date_parser
from parsel import Selector

from .config import get_config
from .stockstats_utils import yf_retry
from .symbol_utils import normalize_symbol
from .yfinance_news import _in_news_window

logger = logging.getLogger(__name__)

_SEC_TICKERS_URL = "https://www.sec.gov/files/company_tickers.json"
_SEC_SUBMISSIONS_URL = "https://data.sec.gov/submissions/CIK{cik:010d}.json"
_SEC_ARCHIVES_BASE = "https://www.sec.gov/Archives/edgar/data"
_SEC_RELEVANT_FORMS = frozenset(
    {
        "8-K",
        "8-K/A",
        "10-Q",
        "10-Q/A",
        "10-K",
        "10-K/A",
        "4",
        "4/A",
        "SC 13D",
        "SC 13D/A",
        "SC 13G",
        "SC 13G/A",
    }
)

_EURONEXT_BASE = "https://live.euronext.com"
_EURONEXT_PRESS_RELEASES = (
    "https://live.euronext.com/en/listview/company-press-release/{isin}"
)
_EURONEXT_SUFFIXES = frozenset({".PA", ".AS", ".BR", ".LS", ".MI", ".OL", ".IR"})
_CEST = timezone(timedelta(hours=2))
_CET = timezone(timedelta(hours=1))

_sec_lock = threading.Lock()
_sec_last_request = 0.0


def _date_bounds(start_date: str, end_date: str) -> tuple[datetime, datetime]:
    return (
        datetime.strptime(start_date, "%Y-%m-%d"),
        datetime.strptime(end_date, "%Y-%m-%d"),
    )


def _request_json(url: str) -> dict:
    """GET SEC JSON with a declared User-Agent and conservative throttling."""
    config = get_config()
    user_agent = config.get(
        "sec_edgar_user_agent",
        "TradingAgents/0.3.1 (automated market research)",
    )
    min_interval = float(config.get("sec_edgar_min_request_interval", 0.12))
    retries = int(config.get("official_news_http_retries", 2))
    timeout = float(config.get("official_news_http_timeout", 8.0))
    headers = {
        "User-Agent": user_agent,
        "Accept-Encoding": "gzip, deflate",
        "Accept": "application/json",
    }

    global _sec_last_request
    for attempt in range(retries + 1):
        with _sec_lock:
            wait_for = min_interval - (time.monotonic() - _sec_last_request)
            if wait_for > 0:
                time.sleep(wait_for)
            response = requests.get(url, headers=headers, timeout=timeout)
            _sec_last_request = time.monotonic()

        if response.status_code == 429 or response.status_code >= 500:
            if attempt < retries:
                time.sleep(min(0.5 * (2**attempt), 2.0))
                continue
        response.raise_for_status()
        payload = response.json()
        if not isinstance(payload, dict):
            raise ValueError(f"SEC returned non-object JSON for {url}")
        return payload

    raise RuntimeError(f"SEC request failed after retries: {url}")


@lru_cache(maxsize=1)
def _sec_ticker_map() -> dict[str, int]:
    payload = _request_json(_SEC_TICKERS_URL)
    mapping: dict[str, int] = {}
    for row in payload.values():
        if not isinstance(row, dict):
            continue
        ticker = str(row.get("ticker") or "").upper().strip()
        cik = row.get("cik_str")
        if ticker and cik is not None:
            mapping[ticker] = int(cik)
    return mapping


def _resolve_sec_cik(ticker: str) -> int | None:
    canonical = normalize_symbol(ticker).upper()
    if _is_euronext_symbol(canonical) or any(
        marker in canonical for marker in ("=X", "=F", "-USD", "^")
    ):
        return None

    candidates = (
        canonical,
        canonical.replace(".", "-"),
        canonical.replace("-", "."),
    )
    mapping = _sec_ticker_map()
    for candidate in candidates:
        if candidate in mapping:
            return mapping[candidate]
    return None


def _sec_filing_url(cik: int, accession: str, primary_document: str) -> str:
    accession_path = accession.replace("-", "")
    return f"{_SEC_ARCHIVES_BASE}/{cik}/{accession_path}/{primary_document}"


def _parse_sec_datetime(value: str | None, fallback_date: str | None) -> datetime | None:
    if value:
        try:
            parsed = date_parser.isoparse(value)
            return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)
        except (TypeError, ValueError):
            pass
    if fallback_date:
        try:
            return datetime.strptime(fallback_date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except ValueError:
            pass
    return None


def _recent_field(recent: dict, name: str, index: int, default=""):
    values = recent.get(name) or []
    return values[index] if index < len(values) else default


def get_sec_edgar_articles(
    ticker: str,
    start_date: str,
    end_date: str,
    *,
    limit: int | None = None,
) -> list[dict]:
    """Return recent material SEC filings for a US-listed ticker."""
    config = get_config()
    if not config.get("sec_edgar_news_enabled", True):
        return []

    cik = _resolve_sec_cik(ticker)
    if cik is None:
        return []

    if limit is None:
        limit = int(config.get("regulatory_news_article_limit", 12))

    payload = _request_json(_SEC_SUBMISSIONS_URL.format(cik=cik))
    recent = payload.get("filings", {}).get("recent", {})
    if not isinstance(recent, dict):
        return []

    forms = recent.get("form") or []
    start_dt, end_dt = _date_bounds(start_date, end_date)
    articles: list[dict] = []

    for index, form in enumerate(forms):
        if form not in _SEC_RELEVANT_FORMS:
            continue

        pub_date = _parse_sec_datetime(
            _recent_field(recent, "acceptanceDateTime", index, None),
            _recent_field(recent, "filingDate", index, None),
        )
        if not _in_news_window(pub_date, start_dt, end_dt):
            continue

        accession = str(_recent_field(recent, "accessionNumber", index))
        primary_document = str(_recent_field(recent, "primaryDocument", index))
        items = str(_recent_field(recent, "items", index)).strip()
        report_date = str(_recent_field(recent, "reportDate", index)).strip()
        filing_date = str(_recent_field(recent, "filingDate", index)).strip()

        detail_bits = []
        if items:
            detail_bits.append(f"Items {items}")
        if report_date:
            detail_bits.append(f"report date {report_date}")
        detail = " — " + "; ".join(detail_bits) if detail_bits else ""

        title = f"SEC {form} filing{detail}"
        summary = (
            f"Official SEC EDGAR filing by {payload.get('name') or ticker}. "
            f"Filed {filing_date}."
        )
        link = (
            _sec_filing_url(cik, accession, primary_document)
            if accession and primary_document
            else f"https://www.sec.gov/edgar/browse/?CIK={cik}"
        )

        articles.append(
            {
                "ticker": ticker,
                "title": title,
                "summary": summary,
                "publisher": "SEC EDGAR",
                "source": "SEC EDGAR",
                "provider": "sec_edgar",
                "link": link,
                "pub_date": pub_date,
                "event_type": form,
                "metadata": {
                    "cik": cik,
                    "accession_number": accession,
                    "form": form,
                    "items": items,
                    "report_date": report_date,
                    "official": True,
                },
            }
        )
        if len(articles) >= limit:
            break

    return articles


def _is_euronext_symbol(ticker: str) -> bool:
    upper = ticker.upper()
    return any(upper.endswith(suffix) for suffix in _EURONEXT_SUFFIXES)


def _resolve_euronext_isin(ticker: str) -> str | None:
    canonical = normalize_symbol(ticker).upper()
    if not _is_euronext_symbol(canonical):
        return None

    config = get_config()
    overrides = config.get("euronext_isin_overrides", {})
    if isinstance(overrides, dict):
        isin = overrides.get(canonical) or overrides.get(ticker.upper())
        if isin:
            return str(isin).upper().strip()

    # Euronext's former public ticker search is protected by JS/anti-scraping.
    # yfinance is used only for the ticker->ISIN lookup; the regulatory content
    # itself is fetched from Euronext Live.
    try:
        resolved = yf_retry(lambda: yf.Ticker(canonical).isin)
    except Exception as exc:
        logger.info("Could not resolve Euronext ISIN for %s: %s", ticker, exc)
        return None
    if not resolved or resolved == "-":
        return None
    return str(resolved).upper().strip()


def _parse_euronext_datetime(value: str) -> datetime | None:
    cleaned = " ".join(value.split())
    try:
        parsed = date_parser.parse(cleaned, tzinfos={"CEST": _CEST, "CET": _CET})
    except (TypeError, ValueError, OverflowError):
        return None
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def _clean_cell(cell) -> str:
    return " ".join(part.strip() for part in cell.xpath(".//text()").getall() if part.strip())


def _parse_euronext_page(
    html: str,
    *,
    ticker: str,
    list_url: str,
    start_date: str,
    end_date: str,
) -> list[dict]:
    selector = Selector(text=html)
    start_dt, end_dt = _date_bounds(start_date, end_date)
    articles: list[dict] = []

    for row in selector.css("table tbody tr"):
        cells = row.css("td")
        if len(cells) < 3:
            continue
        values = [_clean_cell(cell) for cell in cells]
        released = _parse_euronext_datetime(values[0])
        if not _in_news_window(released, start_dt, end_dt):
            continue

        company = values[1] if len(values) > 1 else ""
        title = values[2] if len(values) > 2 else ""
        industry = values[3] if len(values) > 3 else ""
        topic = values[4] if len(values) > 4 else ""
        if not title:
            continue

        href = cells[2].css("a::attr(href)").get() or row.css("a::attr(href)").get()
        link = urljoin(_EURONEXT_BASE, href) if href else list_url
        summary_parts = [part for part in (topic, industry) if part]
        summary = " | ".join(summary_parts)

        articles.append(
            {
                "ticker": ticker,
                "title": title,
                "summary": summary,
                "publisher": "Euronext",
                "source": "Euronext",
                "provider": "euronext",
                "link": link,
                "pub_date": released,
                "event_type": topic or "Company press release",
                "metadata": {
                    "company": company,
                    "industry": industry,
                    "topic": topic,
                    "official": True,
                },
            }
        )

    return articles


def get_euronext_articles(
    ticker: str,
    start_date: str,
    end_date: str,
    *,
    limit: int | None = None,
) -> list[dict]:
    """Return Euronext company press releases for a Euronext-listed ticker."""
    config = get_config()
    if not config.get("euronext_news_enabled", True):
        return []

    isin = _resolve_euronext_isin(ticker)
    if not isin:
        return []

    if limit is None:
        limit = int(config.get("regulatory_news_article_limit", 12))
    max_pages = int(config.get("euronext_news_max_pages", 3))
    timeout = float(config.get("official_news_http_timeout", 8.0))
    retries = int(config.get("official_news_http_retries", 2))
    base_url = _EURONEXT_PRESS_RELEASES.format(isin=isin)
    headers = {
        "User-Agent": (
            "Mozilla/5.0 (compatible; TradingAgents/0.3.1; "
            "+https://github.com/TauricResearch/TradingAgents)"
        ),
        "Accept": "text/html,application/xhtml+xml",
    }

    articles: list[dict] = []
    for page in range(max_pages):
        url = f"{base_url}?page={page}"
        response = None
        for attempt in range(retries + 1):
            response = requests.get(url, headers=headers, timeout=timeout)
            if response.status_code == 429 or response.status_code >= 500:
                if attempt < retries:
                    time.sleep(min(0.5 * (2**attempt), 2.0))
                    continue
            response.raise_for_status()
            break

        if response is None:
            break
        page_articles = _parse_euronext_page(
            response.text,
            ticker=ticker,
            list_url=url,
            start_date=start_date,
            end_date=end_date,
        )
        articles.extend(page_articles)
        if len(articles) >= limit:
            break

        # If this page has no rows in-range and it is not the first page, older
        # pages cannot become relevant for the usual reverse-chronological list.
        if page > 0 and not page_articles:
            break

    articles.sort(
        key=lambda article: article.get("pub_date") or datetime.min.replace(tzinfo=timezone.utc),
        reverse=True,
    )
    return articles[:limit]
