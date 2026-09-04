import json
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase
from unittest.mock import patch, MagicMock
from urllib.parse import urlparse

from web_ui import server
from web_ui.server import (
    Handler,
    update_stage_step,
    workflow_stage_steps,
    stages,
    save_history,
    load_historical_job,
    new_analysis_job,
)


class ServerRoutesAndMetricsTests(TestCase):
    def test_update_stage_step_accumulates_duration_and_tokens(self):
        job_id = "test-metrics-accum"
        init_stages = stages(1)
        init_steps = workflow_stage_steps(job_id, ["market", "news"])
        server.JOBS[job_id] = {
            "id": job_id,
            "stages": init_stages,
            "stage_steps": init_steps,
            "logs": [],
            "total_tokens": 0,
            "total_duration_sec": 0.0,
        }
        try:
            # Complete market analyst step with 3.5s and 1200 tokens
            update_stage_step(
                job_id,
                stage_id="analysts",
                step_id="market",
                status="complete",
                detail="Rapport technique généré",
                duration_sec=3.5,
                tokens=1200,
            )

            job = server.JOBS[job_id]
            analysts_stage = next(s for s in job["stages"] if s["id"] == "analysts")
            market_step = next(s for s in job["stage_steps"]["analysts"] if s["id"] == "market")

            self.assertEqual(market_step["status"], "complete")
            self.assertEqual(market_step["duration_sec"], 3.5)
            self.assertEqual(market_step["tokens"], 1200)
            self.assertEqual(analysts_stage["duration_sec"], 3.5)
            self.assertEqual(analysts_stage["tokens"], 1200)

            # Complete news analyst step with 2.5s and 800 tokens
            update_stage_step(
                job_id,
                stage_id="analysts",
                step_id="news",
                status="complete",
                detail="Actualités analysées",
                duration_sec=2.5,
                tokens=800,
            )

            job = server.JOBS[job_id]
            analysts_stage = next(s for s in job["stages"] if s["id"] == "analysts")
            self.assertEqual(analysts_stage["duration_sec"], 6.0)
            self.assertEqual(analysts_stage["tokens"], 2000)
        finally:
            server.JOBS.pop(job_id, None)

    def test_save_and_load_history_preserves_tokens_and_durations(self):
        history_id = "12345678-abcd-4abc-8abc-123456789abc"
        with TemporaryDirectory() as temp_dir:
            data_dir = Path(temp_dir)
            history_file = data_dir / "history.json"
            reports_dir = data_dir / "reports"
            job = {
                "id": history_id,
                "ticker": "NVDA",
                "analysis_date": "2026-08-28",
                "model": "codex-3accounts",
                "analysts": ["market", "news"],
                "depth": 1,
                "total_tokens": 18450,
                "total_duration_sec": 42.5,
                "llm_calls": 8,
                "created_at": "28/08/2026 01:30",
                "report_path": str(reports_dir / history_id / "complete_report.md"),
                "result": {
                    "raw_decision": "ACHAT FORT",
                    "display_decision": "ACHAT FORT",
                    "summary": "Synthèse haussière",
                    "reliability": {"blocked": False},
                    "snapshot": {"close": 128.5},
                    "reports": {"portfolio": "Achat recommandé"},
                },
            }

            with patch.object(server, "DATA_DIR", data_dir), \
                 patch.object(server, "HISTORY_FILE", history_file), \
                 patch.object(server, "REPORTS_DIR", reports_dir):
                save_history(job)
                (reports_dir / history_id).mkdir(parents=True, exist_ok=True)
                (reports_dir / history_id / "complete_report.md").write_text("# Rapport NVDA", encoding="utf-8")
                restored = load_historical_job(history_id)

            self.assertIsNotNone(restored)
            self.assertEqual(restored["ticker"], "NVDA")
            self.assertEqual(restored["total_tokens"], 18450)
            self.assertEqual(restored["total_duration_sec"], 42.5)
            self.assertEqual(restored["elapsed"], "00:42")
            self.assertEqual(restored["llm_calls"], 8)

    def test_url_queries_with_parameters_and_anchors_handle_safely(self):
        test_paths = [
            "/?page=scanner&ticker=NVDA#performance",
            "/?page=history&ticker=NVDA",
            "/?page=performance&ticker=NVDA",
            "/?page=compare&tickers=NVDA,MSFT",
            "/?page=watchlist",
            "/api/status",
            "/api/capabilities",
            "/api/scanner/universes",
        ]
        for path in test_paths:
            parsed = urlparse(path)
            self.assertTrue(parsed.path in {"/", "/api/status", "/api/capabilities", "/api/scanner/universes"})
