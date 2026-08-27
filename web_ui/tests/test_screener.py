from unittest import TestCase
from unittest.mock import patch

import pandas as pd

from web_ui import server
from web_ui.screener import (
    combine_with_agent_score,
    resolve_symbols,
    score_symbol,
    screen_universe,
    universe_catalog,
)


def market_frame(start: float, end: float, *, rows: int = 90, volume: float = 2_000_000) -> pd.DataFrame:
    dates = pd.date_range("2026-04-01", periods=rows, freq="B")
    step = (end - start) / (rows - 1)
    closes = [start + step * index for index in range(rows)]
    return pd.DataFrame({
        "Date": dates,
        "Open": closes,
        "High": [value * 1.01 for value in closes],
        "Low": [value * 0.99 for value in closes],
        "Close": closes,
        "Volume": [volume] * rows,
    })


class ScreenerTests(TestCase):
    def test_catalog_exposes_presets_without_symbol_payloads(self):
        catalog = universe_catalog()

        self.assertEqual(catalog[0]["id"], "us-large")
        self.assertGreater(catalog[0]["count"], 20)
        self.assertNotIn("symbols", catalog[0])

    def test_custom_symbols_are_normalized_and_deduplicated(self):
        symbols = resolve_symbols("custom", "aapl, MSFT; aapl\nmc.pa")

        self.assertEqual(symbols, ["AAPL", "MSFT", "MC.PA"])

    def test_custom_symbols_reject_unsafe_values(self):
        with self.assertRaisesRegex(ValueError, "invalide"):
            resolve_symbols("custom", "AAPL, ../../tmp")

    def test_positive_trend_scores_above_negative_trend(self):
        frames = {
            "UP": market_frame(100, 150),
            "DOWN": market_frame(150, 100),
        }

        def loader(symbol, _analysis_date):
            return frames[symbol]

        up = score_symbol("UP", "2026-08-27", loader=loader)
        down = score_symbol("DOWN", "2026-08-27", loader=loader)

        self.assertGreater(up["prefilter_score"], down["prefilter_score"])
        self.assertGreater(up["momentum_20d"], 0)
        self.assertLess(down["momentum_20d"], 0)

    def test_screening_isolates_one_bad_symbol(self):
        def loader(symbol, _analysis_date):
            if symbol == "BAD":
                raise RuntimeError("vendor unavailable")
            return market_frame(100, 120 if symbol == "GOOD" else 110)

        candidates, errors = screen_universe(
            ["GOOD", "BAD", "OK"],
            "2026-08-27",
            loader=loader,
            max_workers=1,
        )

        self.assertEqual([item["symbol"] for item in candidates], ["GOOD", "OK"])
        self.assertEqual(errors, [{"symbol": "BAD", "error": "vendor unavailable"}])
        self.assertEqual([item["prefilter_rank"] for item in candidates], [1, 2])

    def test_agent_score_is_weighted_more_than_prefilter(self):
        self.assertEqual(combine_with_agent_score(80, "Buy"), 91.0)
        self.assertEqual(combine_with_agent_score(80, "Sell"), 36.0)
        self.assertIsNone(combine_with_agent_score(80, "Buy", blocked=True))

    def test_scan_orchestration_produces_final_ranking(self):
        scan_id = "scan-test"
        server.SCAN_JOBS[scan_id] = {
            "id": scan_id,
            "status": "queued",
            "started_at": None,
            "logs": [],
        }
        screened = [
            {"symbol": "AAA", "prefilter_score": 82.0, "prefilter_rank": 1},
            {"symbol": "BBB", "prefilter_score": 76.0, "prefilter_rank": 2},
        ]

        def fake_analysis(job_id, payload):
            decision = "BUY" if payload["ticker"] == "AAA" else "HOLD"
            server.JOBS[job_id].update({
                "status": "complete",
                "error": None,
                "result": {
                    "raw_decision": decision,
                    "display_decision": "ACHETER" if decision == "BUY" else "ATTENDRE",
                    "confidence": "Confiance modérée",
                    "reliability": {"blocked": False},
                },
            })

        payload = {
            "symbols": ["AAA", "BBB"],
            "date": "2026-08-27",
            "prefilter_limit": 2,
            "analysis_limit": 2,
            "analysts": ["market"],
            "depth": 1,
        }
        try:
            with (
                patch.object(server, "screen_universe", return_value=(screened, [])),
                patch.object(server, "run_analysis", side_effect=fake_analysis),
                patch.object(server, "llm_runtime_info", return_value={}),
            ):
                server.run_scan(scan_id, payload)

            scan = server.SCAN_JOBS[scan_id]
            self.assertEqual(scan["status"], "complete")
            self.assertEqual([item["symbol"] for item in scan["ranking"]], ["AAA", "BBB"])
            self.assertEqual(scan["ranking"][0]["final_rank"], 1)
            self.assertGreater(scan["ranking"][0]["final_score"], scan["ranking"][1]["final_score"])
        finally:
            server.SCAN_JOBS.pop(scan_id, None)
            for job_id in [job_id for job_id, job in server.JOBS.items() if job.get("parent_scan_id") == scan_id]:
                server.JOBS.pop(job_id, None)
