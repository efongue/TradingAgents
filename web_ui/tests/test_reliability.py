import json
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase
from unittest.mock import patch

from web_ui import server
from web_ui.server import apply_output_budget, load_historical_job, parse_snapshot, reliability_checks, stages


SNAPSHOT = """
Latest trading row used: 2026-08-21

| Field | Value |
| Open | 742.20 |
| High | 756.10 |
| Low | 738.30 |
| Close | 750.00 |
| Volume | 14500000 |
"""


class ReliabilityTests(TestCase):
    def test_data_stage_describes_the_verified_collection(self):
        detail = stages(0)[0]["detail"]

        self.assertIn("Yahoo Finance", detail)
        self.assertIn("OHLCV", detail)
        self.assertIn("30 dernières clôtures", detail)
        self.assertIn("calcul local de 11 indicateurs", detail)

    def test_snapshot_extracts_verified_close_and_date(self):
        snapshot = parse_snapshot(SNAPSHOT)

        self.assertEqual(snapshot["latest_date"], "2026-08-21")
        self.assertEqual(snapshot["close"], 750.0)

    def test_inconsistent_price_blocks_decision(self):
        snapshot = parse_snapshot(SNAPSHOT)

        result = reliability_checks(snapshot, "Prix d’entrée à 515.00", 4)

        self.assertTrue(result["blocked"])
        self.assertIn(515.0, result["price_candidates"])

    def test_consistent_price_keeps_decision_available(self):
        snapshot = parse_snapshot(SNAPSHOT)

        result = reliability_checks(snapshot, "Prix d’entrée à 745.00", 4)

        self.assertFalse(result["blocked"])

    def test_missing_verified_price_blocks_decision(self):
        result = reliability_checks({"close": None, "latest_date": None}, "ACHETER", 4)

        self.assertTrue(result["blocked"])

    def test_depth_applies_bounded_local_output_budget(self):
        class Llm:
            max_tokens = None

        class Graph:
            quick_thinking_llm = Llm()
            deep_thinking_llm = Llm()

        graph = Graph()

        budget = apply_output_budget(graph, 2)

        self.assertEqual(budget, 1000)
        self.assertEqual(graph.quick_thinking_llm.max_tokens, 1000)
        self.assertEqual(graph.deep_thinking_llm.max_tokens, 1000)

    def test_legacy_history_restores_saved_report_sections(self):
        history_id = "12345678-abcd-4abc-8abc-123456789abc"
        with TemporaryDirectory() as temp_dir:
            data_dir = Path(temp_dir)
            history_file = data_dir / "history.json"
            reports_dir = data_dir / "reports"
            report_dir = reports_dir / history_id
            (report_dir / "2_research").mkdir(parents=True)
            (report_dir / "5_portfolio").mkdir(parents=True)
            (report_dir / "complete_report.md").write_text("# Rapport AAPL", encoding="utf-8")
            (report_dir / "2_research" / "manager.md").write_text("Synthèse recherche", encoding="utf-8")
            (report_dir / "5_portfolio" / "decision.md").write_text("Décision portefeuille", encoding="utf-8")
            history_file.write_text(json.dumps([{
                "id": history_id,
                "ticker": "AAPL",
                "analysis_date": "2026-08-24",
                "display_decision": "ATTENDRE",
                "blocked": False,
                "created_at": "24/08/2026 20:28",
            }]), encoding="utf-8")

            with patch.object(server, "HISTORY_FILE", history_file), patch.object(server, "REPORTS_DIR", reports_dir):
                job = load_historical_job(history_id)

        self.assertIsNotNone(job)
        self.assertEqual(job["ticker"], "AAPL")
        self.assertEqual(job["result"]["reports"]["portfolio"], "Décision portefeuille")
        self.assertIn("# Rapport AAPL", job["result"]["complete_report"])
        self.assertFalse(job["result"]["reliability"]["blocked"])
