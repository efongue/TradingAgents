import json
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest import TestCase
from unittest.mock import patch

from web_ui import server
from web_ui.server import (
    ProgressCallback,
    analysis_parameters,
    analysis_limits,
    apply_output_budget,
    context_usage,
    data_steps,
    describe_analysis_error,
    fail_active_data_step,
    load_historical_job,
    parse_snapshot,
    record_graph_node_complete,
    record_graph_node_start,
    record_data_progress,
    reliability_checks,
    stages,
    tradingagents_capabilities,
    web_analysis_config,
    workflow_stage_steps,
)


SNAPSHOT = """
Latest trading row used: 2026-08-21

| Field | Value |
| Open | 742.20 |
| High | 756.10 |
| Low | 738.30 |
| Close | 750.00 |
| Volume | 14500000 |
"""

OLLAMA_RUNTIME = {
    "context_window_tokens": 4096,
    "context_source": "Contexte du modèle actuellement chargé dans Ollama",
    "model_capacity_tokens": 40960,
}


class ReliabilityTests(TestCase):
    def test_capabilities_follow_the_engine_analyst_registry(self):
        capabilities = tradingagents_capabilities()
        analyst_ids = [analyst["id"] for analyst in capabilities["analysts"]]

        self.assertEqual(analyst_ids, list(server.ANALYST_NODE_SPECS))
        self.assertEqual(set(analyst_ids), set(server.ALLOWED_ANALYSTS))
        self.assertTrue(all(analyst["description"] for analyst in capabilities["analysts"]))
        sentiment = next(analyst for analyst in capabilities["analysts"] if analyst["id"] == "social")
        self.assertEqual(sentiment["name"], "Sentiment du marché")
        self.assertEqual(
            sentiment["description"],
            "Perception des investisseurs et réseaux spécialisés.",
        )
        self.assertEqual(sentiment["engine_name"], "Sentiment Analyst")
        self.assertEqual(len(capabilities["data_steps"]), 6)
        self.assertTrue(all(step["status"] == "pending" for step in capabilities["data_steps"]))

    def test_data_progress_advances_real_substeps(self):
        job_id = "data-progress-test"
        server.JOBS[job_id] = {"data_steps": data_steps(0), "logs": []}
        try:
            record_data_progress(
                job_id,
                "ohlcv_loaded",
                {"rows": 252, "latest_date": "2026-08-24"},
            )
            current = server.JOBS[job_id]["data_steps"]
            self.assertEqual(current[0]["status"], "complete")
            self.assertEqual(current[1]["status"], "active")
            self.assertIn("252 séances", current[0]["detail"])

            record_data_progress(
                job_id,
                "indicators_calculated",
                {"available": 10, "total": 11},
            )
            current = server.JOBS[job_id]["data_steps"]
            self.assertEqual(current[4]["status"], "warning")
            self.assertEqual(current[5]["status"], "active")
        finally:
            server.JOBS.pop(job_id, None)

    def test_active_data_error_identifies_the_failing_substep(self):
        failed = fail_active_data_step(
            data_steps(0),
            "No OHLCV data available for INVALIDZZZZZ.",
        )

        self.assertEqual(failed[0]["status"], "error")
        self.assertIn("INVALIDZZZZZ", failed[0]["detail"])
        self.assertTrue(all(step["status"] == "pending" for step in failed[1:]))

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

    def test_context_usage_exposes_prompt_output_and_limit(self):
        limits = analysis_limits(depth=3, analyst_count=4, runtime=OLLAMA_RUNTIME)

        usage = context_usage(limits, prompt_tokens=4007)

        self.assertEqual(usage["context_window_tokens"], 4096)
        self.assertEqual(usage["max_output_tokens"], 1600)
        self.assertEqual(usage["estimated_request_tokens"], 5607)
        self.assertEqual(usage["state"], "critical")

    def test_ollama_context_is_read_from_the_running_model(self):
        def fake_ollama(path, payload=None, timeout=3):
            if path == "/api/tags":
                return {"models": [{"name": server.MODEL, "size": 8_000_000_000}]}
            if path == "/api/ps":
                return {"models": [{"name": server.MODEL, "context_length": 32768}]}
            if path == "/api/show":
                return {"model_info": {"qwen3.context_length": 40960}}
            return {}

        with patch.object(server, "ollama_json", side_effect=fake_ollama):
            runtime = server.ollama_runtime_info()

        self.assertEqual(runtime["context_window_tokens"], 32768)
        self.assertEqual(runtime["model_capacity_tokens"], 40960)
        self.assertIn("actuellement chargé", runtime["context_source"])

    def test_model_capacity_is_not_reported_as_an_active_context(self):
        def fake_ollama(path, payload=None, timeout=3):
            if path == "/api/tags":
                return {"models": [{"name": server.MODEL, "size": 8_000_000_000}]}
            if path == "/api/ps":
                return {"models": []}
            if path == "/api/show":
                return {"model_info": {"qwen3.context_length": 40960}}
            return {}

        with patch.object(server, "ollama_json", side_effect=fake_ollama):
            runtime = server.ollama_runtime_info()

        self.assertIsNone(runtime["context_window_tokens"])
        self.assertEqual(runtime["model_capacity_tokens"], 40960)

    def test_effective_parameters_expose_sources_news_memory_and_resume(self):
        config = web_analysis_config(3)
        events = [
            {
                "source": "Yahoo Finance",
                "label": "Cours OHLCV et contrôle préalable",
                "tool": "build_verified_market_snapshot",
                "status": "ok",
                "inputs": {},
            },
            {
                "source": "Yahoo Finance",
                "label": "Actualités de l’entreprise",
                "tool": "get_news",
                "status": "ok",
                "inputs": {"start_date": "2026-08-17", "end_date": "2026-08-24"},
                "articles_returned": 4,
            },
        ]

        parameters = analysis_parameters(
            ticker="AAPL",
            analysts=["market", "news", "social", "fundamentals"],
            depth=3,
            config=config,
            limits=analysis_limits(3, 4, OLLAMA_RUNTIME),
            events=events,
            completed_calls=25,
            llm_errors=0,
            memory_used=True,
            resumed_from_step=7,
        )

        self.assertEqual(parameters["debates"]["investment"], 3)
        self.assertEqual(parameters["calls"]["estimated"], 27)
        self.assertEqual(parameters["output_tokens_per_call"], 1600)
        self.assertEqual(parameters["sources"][0]["name"], "Yahoo Finance")
        self.assertEqual(parameters["news"]["requests"][0]["articles_returned"], 4)
        self.assertEqual(parameters["benchmark"], "SPY")
        self.assertTrue(parameters["memory"]["used"])
        self.assertTrue(parameters["attempts"]["resumed"])

    def test_progress_callback_records_actual_news_tool_use(self):
        job_id = "parameter-test"
        server.JOBS[job_id] = {
            "llm_calls": 0,
            "llm_errors": 0,
            "tool_calls": 0,
            "logs": [],
            "limits": analysis_limits(1, 1, OLLAMA_RUNTIME),
            "source_events": [],
        }
        try:
            callback = ProgressCallback(job_id, 10, web_analysis_config(1))
            callback.on_tool_start(
                {"name": "get_news"},
                '{"ticker":"AAPL","start_date":"2026-08-17","end_date":"2026-08-24"}',
                run_id="news-run",
            )
            callback.on_tool_end("### Article un\nTexte\n\n### Article deux\nTexte", run_id="news-run")

            event = server.JOBS[job_id]["source_events"][0]
            self.assertEqual(event["source"], "Yahoo Finance")
            self.assertEqual(event["status"], "ok")
            self.assertEqual(event["articles_returned"], 2)
        finally:
            server.JOBS.pop(job_id, None)

    def test_graph_nodes_drive_real_analyst_and_debate_substeps(self):
        job_id = "graph-progress-test"
        with TemporaryDirectory() as temp_dir, patch.object(server, "REPORTS_DIR", Path(temp_dir)):
            server.JOBS[job_id] = {
                "stages": stages(1),
                "stage_steps": workflow_stage_steps(job_id, ["market"]),
                "logs": [],
            }
            try:
                record_graph_node_start(job_id, "Market Analyst")
                analyst_step = server.JOBS[job_id]["stage_steps"]["analysts"][0]
                self.assertEqual(analyst_step["status"], "active")

                record_graph_node_complete(
                    job_id,
                    "Market Analyst",
                    {"market_report": "# Rapport marché"},
                )
                analyst_step = server.JOBS[job_id]["stage_steps"]["analysts"][0]
                self.assertEqual(analyst_step["status"], "complete")
                self.assertEqual(
                    analyst_step["report_url"],
                    f"/api/jobs/{job_id}/reports/market.md",
                )
                self.assertTrue((Path(temp_dir) / job_id / "1_analysts" / "market.md").is_file())

                record_graph_node_start(job_id, "Bull Researcher")
                bull_step = server.JOBS[job_id]["stage_steps"]["debate"][0]
                self.assertEqual(bull_step["status"], "active")
                self.assertEqual(server.JOBS[job_id]["stages"][2]["status"], "active")

                record_graph_node_complete(
                    job_id,
                    "Bull Researcher",
                    {"investment_debate_state": {"bull_history": "Argument haussier"}},
                )
                bull_step = server.JOBS[job_id]["stage_steps"]["debate"][0]
                self.assertEqual(bull_step["status"], "complete")
                self.assertTrue((Path(temp_dir) / job_id / "2_research" / "bull.md").is_file())
            finally:
                server.JOBS.pop(job_id, None)

    def test_progress_callback_uses_langgraph_node_lifecycle(self):
        job_id = "callback-node-test"
        with TemporaryDirectory() as temp_dir, patch.object(server, "REPORTS_DIR", Path(temp_dir)):
            server.JOBS[job_id] = {
                "stages": stages(1),
                "stage_steps": workflow_stage_steps(job_id, ["market"]),
                "logs": [],
                "llm_calls": 0,
                "limits": analysis_limits(1, 1, OLLAMA_RUNTIME),
            }
            try:
                callback = ProgressCallback(job_id, 8, web_analysis_config(1))
                callback.on_chain_start(
                    {},
                    {},
                    run_id="market-node-run",
                    name="Market Analyst",
                    metadata={"langgraph_node": "Market Analyst"},
                )
                callback.on_chain_end(
                    {"market_report": "Rapport observé"},
                    run_id="market-node-run",
                )

                step = server.JOBS[job_id]["stage_steps"]["analysts"][0]
                self.assertEqual(step["status"], "complete")
                self.assertIsNotNone(step["report_url"])
            finally:
                server.JOBS.pop(job_id, None)

    def test_ollama_500_under_context_pressure_gets_clear_diagnostic(self):
        job = {"limits": context_usage(analysis_limits(3, 4, OLLAMA_RUNTIME), 4007)}

        failure = describe_analysis_error(RuntimeError("Error code: 500 - Internal Server Error"), job)

        self.assertEqual(failure["code"], "context_limit")
        self.assertIn("4 007 tokens", failure["message"])
        self.assertIn("4 096", failure["message"])
        self.assertIn("OLLAMA_NUM_CTX", failure["recommendation"])

    def test_generic_error_is_not_mislabeled_as_context_limit(self):
        job = {"limits": analysis_limits(1, 1, OLLAMA_RUNTIME)}

        failure = describe_analysis_error(ValueError("Cours indisponible"), job)

        self.assertEqual(failure["code"], "analysis_error")
        self.assertIn("ValueError", failure["technical"])

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
        manager_step = next(
            step for step in job["stage_steps"]["debate"]
            if step["id"] == "research_manager"
        )
        self.assertEqual(manager_step["status"], "complete")
        self.assertIsNone(manager_step["report_url"])
