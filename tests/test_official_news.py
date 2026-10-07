"""Unit coverage for official SEC EDGAR and Euronext ticker-news sources."""

from datetime import datetime, timezone

import pytest

import tradingagents.dataflows.multi_source_news as multi_news
import tradingagents.dataflows.official_news as official_news


@pytest.mark.unit
def test_sec_edgar_filters_forms_and_dates(monkeypatch):
    monkeypatch.setattr(official_news, "_resolve_sec_cik", lambda ticker: 1045810)
    monkeypatch.setattr(
        official_news,
        "_request_json",
        lambda url: {
            "name": "NVIDIA CORP",
            "filings": {
                "recent": {
                    "form": ["8-K", "144", "10-Q", "SC 13G/A"],
                    "filingDate": ["2026-10-06", "2026-10-06", "2026-09-01", "2026-10-07"],
                    "acceptanceDateTime": [
                        "2026-10-06T16:01:00-04:00",
                        "2026-10-06T15:00:00-04:00",
                        "2026-09-01T08:00:00-04:00",
                        "2026-10-07T09:00:00-04:00",
                    ],
                    "accessionNumber": [
                        "0001045810-26-000001",
                        "0001045810-26-000002",
                        "0001045810-26-000003",
                        "0001045810-26-000004",
                    ],
                    "primaryDocument": ["nvda-8k.htm", "xsl144.xml", "nvda-10q.htm", "sc13g.htm"],
                    "items": ["2.02,9.01", "", "", ""],
                    "reportDate": ["2026-10-06", "", "2026-08-31", ""],
                }
            },
        },
    )

    articles = official_news.get_sec_edgar_articles("NVDA", "2026-10-05", "2026-10-07")

    assert [article["event_type"] for article in articles] == ["8-K", "SC 13G/A"]
    assert articles[0]["provider"] == "sec_edgar"
    assert articles[0]["metadata"]["official"] is True
    assert "000104581026000001" in articles[0]["link"]
    assert articles[0]["link"].endswith("/nvda-8k.htm")


@pytest.mark.unit
def test_euronext_page_parser_extracts_press_release():
    html = """
    <table><tbody>
      <tr>
        <td>05 Oct 2026<br>18:30 CEST</td>
        <td>SCHNEIDER ELECTRIC SE</td>
        <td><a href="/en/node/123456">Schneider Electric announces a transaction</a></td>
        <td>50202010 Electrical Components</td>
        <td>Mergers, Acquisitions, Transfers</td>
      </tr>
      <tr>
        <td>01 Sep 2026<br>17:45 CEST</td>
        <td>SCHNEIDER ELECTRIC SE</td>
        <td><a href="/en/node/old">Old release</a></td>
        <td>50202010 Electrical Components</td>
        <td>Other subject</td>
      </tr>
    </tbody></table>
    """

    articles = official_news._parse_euronext_page(
        html,
        ticker="SU.PA",
        list_url="https://live.euronext.com/en/listview/company-press-release/FR0000121972?page=0",
        start_date="2026-10-05",
        end_date="2026-10-07",
    )

    assert len(articles) == 1
    article = articles[0]
    assert article["provider"] == "euronext"
    assert article["source"] == "Euronext"
    assert article["event_type"] == "Mergers, Acquisitions, Transfers"
    assert article["link"] == "https://live.euronext.com/en/node/123456"
    assert article["metadata"]["official"] is True


@pytest.mark.unit
def test_dedupe_prefers_official_source_over_yahoo_copy():
    published = datetime(2026, 10, 6, tzinfo=timezone.utc)
    yahoo = {
        "title": "Company announces acquisition of Example Corp",
        "provider": "yahoo",
        "link": "https://example.com/story?utm_source=yahoo",
        "pub_date": published,
    }
    official = {
        "title": "Company announces acquisition of Example Corp",
        "provider": "sec_edgar",
        "link": "https://www.sec.gov/filing.htm",
        "pub_date": published,
    }

    result = multi_news._dedupe_articles([yahoo, official])

    assert len(result) == 1
    assert result[0]["provider"] == "sec_edgar"


@pytest.mark.unit
def test_multisource_survives_yahoo_failure_when_sec_has_data(monkeypatch):
    monkeypatch.setattr(
        multi_news,
        "_get_yahoo_articles",
        lambda *args, **kwargs: (_ for _ in ()).throw(RuntimeError("Yahoo 429")),
    )
    monkeypatch.setattr(
        multi_news,
        "get_sec_edgar_articles",
        lambda *args, **kwargs: [
            {
                "ticker": "NVDA",
                "title": "SEC 8-K filing — Items 2.02,9.01",
                "summary": "Official filing.",
                "publisher": "SEC EDGAR",
                "source": "SEC EDGAR",
                "provider": "sec_edgar",
                "link": "https://www.sec.gov/example",
                "pub_date": datetime(2026, 10, 6, tzinfo=timezone.utc),
                "event_type": "8-K",
                "metadata": {"official": True},
            }
        ],
    )
    monkeypatch.setattr(multi_news, "get_euronext_articles", lambda *args, **kwargs: [])

    output = multi_news.get_news_multisource("NVDA", "2026-10-05", "2026-10-07")

    assert "Yahoo=unavailable" in output
    assert "SEC=1" in output
    assert "SEC 8-K filing" in output
    assert "source: SEC EDGAR" in output
