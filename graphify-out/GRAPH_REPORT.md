# Graph Report - TradingAgents  (2026-08-26)

## Corpus Check
- 154 files · ~236,758 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2086 nodes · 3962 edges · 97 communities (91 shown, 6 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 209 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a7eba534`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- test_reddit_fallback.py
- TradingAgents Multi-agent Trading Framework
- test_checkpoint_resume.py
- stockstats_utils.py
- interface.py
- App.jsx
- get_capabilities
- test_ollama_base_url.py
- set_config
- sentiment_analyst.py
- Propagator
- ._fetch_returns
- parse_rating
- normalize_symbol
- BaseLLMClient
- TradingAgents Architecture Diagram
- agent_utils.py
- market_data_validator.py
- ReliabilityTests
- make_log
- TradingMemoryLog
- ConditionalLogic
- package.json
- server.py
- cli/utils.py
- get_user_selections
- cli/main.py
- get_stockstats_indicators_report_online
- yfinance_news.py
- safe_ticker_component
- build_analyst_execution_plan
- test_api_key_env.py
- test_reporting.py
- test_env_overrides.py
- ResearchPlan
- test_structured_agents.py
- SPY News Analysis Report for Week Ending June 5, 2025
- Refined Investment Plan
- OpenAIClient
- NoMarketDataError
- DeepSeekChatOpenAI
- FredFormattingTests
- test_openrouter_model_select.py
- openai_client.py
- GoogleClient
- test_llm_max_retries.py
- test_reliability.py
- TestMinimaxStructuredOutputDispatch
- test_polymarket.py
- VendorRoutingTests
- Trading Analyst Dashboard
- StatsCallbackHandler
- trading_graph.py
- TradingAgentsGraph
- _ohlcv
- TestProviderKwargsTemperature
- ProgressCallback
- Buy Recommendation for Apple
- TestEffortGate
- Buy Apple Shares Decision
- provider_default_url
- resolve_instrument_identity
- parse_snapshot
- AnthropicClient
- _select_model
- create_llm_client
- .do_GET
- test_news_analyst_prompt.py
- test_ohlcv_cache_freshness.py
- test_structured_agent_prompts.py
- test_yfinance_stale_ohlcv_guard.py
- MessageBuffer
- Bearish Researcher
- test_cli_symbol_handling.py
- TestLegacyRemoval
- _make_api_request
- _build_run_config
- create_portfolio_manager
- test_stocktwits_resilience.py
- polymarket.py
- validators.py
- TradingAgents CLI
- display_announcements
- Q: Cela dépend si Trading Agent permet de modifier la Base URL. ?
- Research Team
- Tauric Research Brand
- test_cli_no_console.py
- AGENTS.md
- TestPortfolioManagerInjection
- web_ui/__init__.py
- web_ui/tests/__init__.py
- tradingagents

## God Nodes (most connected - your core abstractions)
1. `TradingAgentsGraph` - 44 edges
2. `make_log()` - 40 edges
3. `set_config()` - 36 edges
4. `normalize_symbol()` - 33 edges
5. `TestTradingMemoryLogCore` - 32 edges
6. `get_instrument_context_from_state()` - 32 edges
7. `get_language_instruction()` - 30 edges
8. `create_llm_client()` - 30 edges
9. `get_capabilities()` - 29 edges
10. `TradingMemoryLog` - 27 edges

## Surprising Connections (you probably didn't know these)
- `LangGraph Checkpoint Resume` --semantically_similar_to--> `Checkpoint Resume`  [INFERRED] [semantically similar]
  CHANGELOG.md → README.md
- `Persistent Decision Log` --semantically_similar_to--> `Persistent Decision Log`  [INFERRED] [semantically similar]
  CHANGELOG.md → README.md
- `LLM Provider Registry` --semantically_similar_to--> `Multi-provider LLM Support`  [INFERRED] [semantically similar]
  CHANGELOG.md → README.md
- `Verified Data-access Contract` --semantically_similar_to--> `Verified Market-data Grounding`  [INFERRED] [semantically similar]
  CHANGELOG.md → README.md
- `Deterministic Last-price Guard` --semantically_similar_to--> `Verified Market-data Grounding`  [INFERRED] [semantically similar]
  web_ui/README.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trading Workflow Stages** — assets_cli_cli_init_trading_workflow, assets_cli_cli_init_analyst_team, assets_cli_cli_init_research_team, assets_cli_cli_init_trader, assets_cli_cli_init_risk_management, assets_cli_cli_init_portfolio_management [EXTRACTED 1.00]
- **Analyst Team Phase** — assets_cli_cli_news_market_analyst, assets_cli_cli_news_social_analyst, assets_cli_cli_news_news_analyst, assets_cli_cli_news_fundamentals_analyst [EXTRACTED 1.00]
- **Macroeconomic, Market, Geopolitical, and Sector Evidence** — assets_cli_cli_news_macroeconomic_environment, assets_cli_cli_news_global_stock_market_performance, assets_cli_cli_news_trade_and_geopolitical_developments, assets_cli_cli_news_sector_and_company_news [EXTRACTED 1.00]
- **Multi-Agent Workflow Teams** — assets_cli_cli_technical_multi_agent_trading_workflow, assets_cli_cli_technical_analyst_team, assets_cli_cli_technical_research_team, assets_cli_cli_technical_trading_team, assets_cli_cli_technical_risk_management_team, assets_cli_cli_technical_portfolio_management_team [EXTRACTED 1.00]
- **Selected Technical Indicators** — assets_cli_cli_technical_spy_market_analysis_report, assets_cli_cli_technical_moving_averages, assets_cli_cli_technical_macd, assets_cli_cli_technical_rsi, assets_cli_cli_technical_bollinger_bands, assets_cli_cli_technical_atr, assets_cli_cli_technical_vwma [EXTRACTED 1.00]
- **Risk-Adjusted Portfolio Decision Synthesis** — assets_cli_cli_transaction_bullish_case, assets_cli_cli_transaction_bearish_case, assets_cli_cli_transaction_balanced_case, assets_cli_cli_transaction_sell_trim_recommendation [EXTRACTED 1.00]
- **Defensive Proceeds Allocation** — assets_cli_cli_transaction_treasury_and_corporate_bond_allocation, assets_cli_cli_transaction_cash_allocation, assets_cli_cli_transaction_put_spread_hedge [EXTRACTED 1.00]
- **Bullish, Bearish, and Balanced Risk Debate** — assets_cli_cli_transaction_risky_analyst, assets_cli_cli_transaction_safe_analyst, assets_cli_cli_transaction_neutral_analyst [EXTRACTED 1.00]
- **Opposing Apple Investment Theses** — assets_researcher_bullish_researcher, assets_researcher_bearish_researcher, assets_researcher_investment_debate, assets_researcher_apple_inc [EXTRACTED 1.00]
- **Apple Buy Recommendation Evidence** — assets_risk_strong_fundamentals, assets_risk_earnings_growth_and_market_capitalization, assets_risk_innovation_leadership, assets_risk_resilience_to_risks [EXTRACTED 1.00]
- **Risk Report to Manager Recommendation Flow** — assets_risk_risk_perspective_report, assets_risk_risk_manager, assets_risk_apple_buy_recommendation [EXTRACTED 1.00]
- **Multi-Perspective Risk Assessment** — assets_risk_risky_analyst, assets_risk_neutral_analyst, assets_risk_safe_analyst, assets_risk_risk_perspective_report [EXTRACTED 1.00]
- **Multi-source Market Analysis Inputs** — assets_schema_market_data, assets_schema_social_media_data, assets_schema_news_data, assets_schema_fundamental_data, assets_schema_researcher_team [EXTRACTED 1.00]
- **Trading Decision Pipeline** — assets_schema_researcher_team, assets_schema_trader, assets_schema_risk_management_team, assets_schema_manager, assets_schema_trade_execution [EXTRACTED 1.00]
- **Financial Strength Factors** — assets_trader_strong_financials, assets_trader_high_profitability, assets_trader_strong_cash_flow, assets_trader_robust_margins [EXTRACTED 1.00]
- **Multi-agent Trading Decision Pipeline** — readme_analyst_team, readme_researcher_team, readme_trader_agent, readme_risk_management_team, readme_portfolio_manager [EXTRACTED 1.00]
- **TradingAgents Access and Deployment Surfaces** — cli_static_welcome_tradingagents_ascii_brand, docker_compose_tradingagents_service, web_ui_readme_isolated_web_interface, readme_tradingagents_framework [INFERRED 0.75]
- **Integrated Technical, Sentiment, Macro, and Fundamental Evidence** — assets_analyst_tech_sector_growth, assets_analyst_aapl_social_sentiment_nov_2024, assets_analyst_global_economic_and_sector_insights, assets_analyst_apple_inc_financial_analysis [INFERRED 0.85]
- **Release Reliability and Correctness Program** — changelog_verified_data_access_contract, changelog_checkpoint_resume, changelog_ticker_path_traversal_hardening, changelog_ci_gate [INFERRED 0.85]
- **Multi-Perspective Market Analysis** — assets_analyst_market_analyst, assets_analyst_social_media_analyst, assets_analyst_news_analyst, assets_analyst_fundamentals_analyst [INFERRED 0.95]
- **Stock, Global, and Google News Sourcing** — assets_cli_cli_news_get_stock_news_openai, assets_cli_cli_news_get_global_news_openai, assets_cli_cli_news_get_google_news, assets_cli_cli_news_spy_news_analysis_report [INFERRED 0.95]

## Communities (97 total, 6 thin omitted)

### Community 0 - "test_reddit_fallback.py"
Cohesion: 0.06
Nodes (36): HTTPError, _atom_resp(), unit, _raise(), Tests for the RSS-first Reddit fetcher, its 429 backoff, the opt-in JSON path's…, The opt-in JSON path still degrades to RSS on a 403 (kept for #862)., IncompleteRead/RemoteDisconnected come from http.client and are NOT OSErrors,…, A crypto pair (BTC-USD) barely matches Reddit text; search the base (#1113). (+28 more)

### Community 1 - "TradingAgents Multi-agent Trading Framework"
Cohesion: 0.05
Nodes (50): GitHub Actions CI Workflow, Clean-install Import Smoke Test, Python 3.10-3.13 Test Matrix, Strict Full-repository Ruff Lint, LangGraph Checkpoint Resume, Continuous Integration Gate, Grounded Sentiment Analyst, Persistent Decision Log (+42 more)

### Community 2 - "test_checkpoint_resume.py"
Cohesion: 0.10
Nodes (30): SqliteSaver, StateGraph, _build_graph(), _node_a(), _node_b(), TypedDict, Test checkpoint resume: crash mid-analysis, re-run resumes from last node., A different date must NOT resume from an existing checkpoint. (+22 more)

### Community 3 - "stockstats_utils.py"
Cohesion: 0.09
Nodes (34): Series, unit, yfinance treats ``end`` as exclusive; we must request one extra day so the…, test_get_yfin_requests_inclusive_end(), test_load_ohlcv_requests_inclusive_end(), _clean_dataframe(), _coerce_ohlcv_dates(), _ensure_date_column() (+26 more)

### Community 4 - "interface.py"
Cohesion: 0.06
Nodes (51): get_stock_data(), tool, Retrieve stock price data (OHLCV) for a given ticker symbol. Uses the…, get_balance_sheet(), get_cashflow(), get_fundamentals(), get_income_statement(), tool (+43 more)

### Community 5 - "App.jsx"
Cohesion: 0.07
Nodes (22): AnalysisFailure(), AnalysisParametersPanel(), ANALYST_ICONS, api(), App(), BentoInsight(), cleanReportText(), ContextLimitCard() (+14 more)

### Community 6 - "get_capabilities"
Cohesion: 0.08
Nodes (17): unit, Unit tests for the LLM capability table., deepseek-chat must NOT match the v\\d regex., Capability rows are immutable so they can be safely shared., Forward-compat regex patterns catch unknown DeepSeek and MiniMax variants., MiniMax M2.x models reject langchain's function-spec dict tool_choice (official…, Unknown / non-DeepSeek models get the permissive default., test_capabilities_dataclass_is_frozen() (+9 more)

### Community 7 - "test_ollama_base_url.py"
Cohesion: 0.07
Nodes (39): ModelOption, cli_utils(), fixture, Import cli.utils with a fresh environment so module-level state is consistent., _base_url(), fixture, Tests for OLLAMA_BASE_URL env-var override across CLI and client paths., The Ollama entry in the CLI dropdown must reflect OLLAMA_BASE_URL. (+31 more)

### Community 8 - "set_config"
Cohesion: 0.07
Nodes (21): DataflowsConfigIsolationTests, unit, Config isolation: get/set must not leak nested-dict references., FredRoutingTests, FRED macro vendor: alias resolution, configuration errors, output formatting,…, unit, Tests that empty vendor results never become fabricated data. Covers two…, TestLoadOhlcvNoPoison (+13 more)

### Community 9 - "sentiment_analyst.py"
Cohesion: 0.10
Nodes (22): _make_sentiment_state(), MagicMock LLM whose structured binding captures the prompt and returns a real…, _structured_sentiment_llm(), TestRenderSentimentReport, TestSentimentAnalystAgent, _build_system_message(), create_sentiment_analyst(), create_social_media_analyst() (+14 more)

### Community 10 - "Propagator"
Cohesion: 0.11
Nodes (15): MessagesState, AgentState, InvestDebateState, TypedDict, RiskDebateState, Determine if market analysis should continue., Determine if sentiment-analyst tool round should continue. Method name keeps…, Determine if fundamentals analysis should continue. (+7 more)

### Community 11 - "._fetch_returns"
Cohesion: 0.12
Nodes (9): _price_df(), Only 1 data point available → returns (None, None, None), no crash., Empty DataFrame → returns (None, None, None), no crash., SPY having fewer rows than the stock must not raise IndexError., Minimal DataFrame matching yfinance .history() output shape., Pending AAPL entry is not resolved when the run is for NVDA., After resolve, get_pending_entries() is empty and the entry has a REFLECTION., Fetch raw and alpha return for ticker over holding_days from trade_date.… (+1 more)

### Community 12 - "parse_rating"
Cohesion: 0.11
Nodes (13): unit, Tests for the shared rating heuristic and the SignalProcessor adapter. The…, SignalProcessor must not invoke the LLM it was constructed with — the rating is…, TestParseRating, TestSignalProcessor, parse_rating(), Shared 5-tier rating vocabulary and a deterministic heuristic parser. The same…, Heuristically extract a 5-tier rating from prose text. Two-pass strategy: 1.… (+5 more)

### Community 13 - "normalize_symbol"
Cohesion: 0.12
Nodes (14): unit, Tests for symbol normalization and the no-data routing sentinel., TestCryptoBase, TestIsYahooSafe, TestNormalizeSymbol, crypto_base(), is_yahoo_safe(), _normalize_crypto() (+6 more)

### Community 14 - "BaseLLMClient"
Cohesion: 0.07
Nodes (25): ABC, AzureChatOpenAI, AzureOpenAIClient, NormalizedAzureChatOpenAI, Any, AzureChatOpenAI with normalized content output., Client for Azure OpenAI deployments. Requires environment variables:…, Return configured AzureChatOpenAI instance. (+17 more)

### Community 15 - "TradingAgents Architecture Diagram"
Cohesion: 0.09
Nodes (31): Aggressive Risk View, Bearish Researcher, Bloomberg, Bullish Researcher, Buy Evidence, Company Profile, Conservative Risk View, EODHD APIs (+23 more)

### Community 16 - "agent_utils.py"
Cohesion: 0.15
Nodes (24): parametrize, unit, Every report-producing agent must apply the configured output language…, test_report_agent_applies_language_instruction(), TestLanguageInstruction, create_fundamentals_analyst(), create_market_analyst(), create_news_analyst() (+16 more)

### Community 17 - "market_data_validator.py"
Cohesion: 0.10
Nodes (19): MarketDataProgress, DataFrame, unit, Tests for the deterministic market-data verification snapshot (#830/#881)., _sample_ohlcv(), TestTool, TestVerifiedSnapshot, get_verified_market_snapshot() (+11 more)

### Community 18 - "ReliabilityTests"
Cohesion: 0.11
Nodes (14): TestCase, analysis_limits(), context_usage(), describe_analysis_error(), format_token_count(), Exception, Describe the model budget exposed to the local interface., Return the exact TradingAgents configuration used by the web runner. (+6 more)

### Community 19 - "make_log"
Cohesion: 0.05
Nodes (25): make_log(), Calling store_decision twice with same (ticker, date) stores only one entry., batch_update_with_outcomes resolves multiple pending entries in one write., Rating: X' label wins even when an opposing rating word appears earlier in…, LLM decision containing '---' must not corrupt the entry., Only the n_same most recent same-ticker entries are included., Only the n_cross most recent cross-ticker entries are included., Without max_entries, all resolved entries are kept. (+17 more)

### Community 20 - "TradingMemoryLog"
Cohesion: 0.05
Nodes (22): Only the matching entry is modified; all other entries remain unchanged., A pre-existing .tmp file is overwritten; the log is correctly updated., All fields intact and blank line between tag and DECISION preserved after…, Return figures are present in the human message sent to the LLM., config['benchmark_ticker'] wins for every ticker., Known suffixes route to their regional index., A-share tickers route to their exchange composite (uses the real default…, US tickers (no dotted suffix) take the empty-suffix entry. (+14 more)

### Community 21 - "ConditionalLogic"
Cohesion: 0.15
Nodes (18): _debate_state(), parametrize, unit, Shared-router / path_map completeness (#1088). Both…, _state(), test_debate_path_map_covers_full_router_range(), test_debate_router_return_always_routable(), test_path_map_covers_full_router_range() (+10 more)

### Community 22 - "package.json"
Cohesion: 0.07
Nodes (27): @fontsource/poppins, lucide-react, react, react-dom, react-markdown, remark-gfm, vite, @vitejs/plugin-react (+19 more)

### Community 23 - "server.py"
Cohesion: 0.13
Nodes (24): analysis_parameters(), current_analysis_config(), graph_node_report(), legacy_analysis_parameters(), llm_json(), llm_runtime_info(), llm_status(), load_historical_job() (+16 more)

### Community 24 - "cli/utils.py"
Cohesion: 0.17
Nodes (16): AnalystType, AssetType, Enum, str, detect_asset_type(), filter_analysts_for_asset_type(), get_analysis_date(), _llm_provider_table() (+8 more)

### Community 25 - "get_user_selections"
Cohesion: 0.07
Nodes (28): get_analysis_date(), get_user_selections(), Get all user selections before starting the analysis display., Get the analysis date from user input., ask_anthropic_effort(), ask_gemini_thinking_config(), ask_glm_region(), ask_minimax_region() (+20 more)

### Community 26 - "cli/main.py"
Cohesion: 0.13
Nodes (22): analyze(), classify_message_type(), create_layout(), display_complete_report(), extract_content_string(), format_tokens(), format_tool_args(), Path (+14 more)

### Community 27 - "get_stockstats_indicators_report_online"
Cohesion: 0.11
Nodes (24): Analyst Team, Average True Range, ATR-Based Stop-Loss Recommendation, Bollinger Bands, Bullish Bias with Room for Further Gains, Bullish Trend Assessment, get_stockstats_indicators_report_online, MACD (+16 more)

### Community 28 - "yfinance_news.py"
Cohesion: 0.12
Nodes (27): _epoch(), unit, yfinance news must not leak future-dated (or undated, in a backtest) articles…, Epoch seconds for UTC midnight of ``date_str`` (host-timezone independent)., test_flat_article_publish_time_is_parsed(), test_global_news_empty_after_filter_is_informative(), test_global_news_future_flat_article_excluded(), test_offset_aware_timestamp_is_converted_not_truncated() (+19 more)

### Community 29 - "safe_ticker_component"
Cohesion: 0.13
Nodes (9): SavePathType, unit, Tests for the ticker path-component validator that blocks directory traversal., Sanity: sanitized values stay within base when joined., TestSafeTickerComponent, DataFrame, Validate ``value`` is safe to interpolate into a filesystem path. Tickers come…, safe_ticker_component() (+1 more)

### Community 30 - "build_analyst_execution_plan"
Cohesion: 0.18
Nodes (8): AnalystExecutionPlanTests, AnalystWallTimeTrackerTests, AnalystExecutionPlan, AnalystNodeSpec, AnalystWallTimeTracker, build_analyst_execution_plan(), get_initial_analyst_node(), sync_analyst_tracker_from_chunk()

### Community 31 - "test_api_key_env.py"
Cohesion: 0.11
Nodes (17): parametrize, Tests for the canonical provider->env-var mapping and the CLI key-prompt helper., When key is missing, user-pasted value must be written to .env AND os.environ., Empty prompt response (user cancelled) must not write to .env., An existing .env with other keys must be preserved on writeback., select_llm_provider() must not present a provider the mapping doesn't know…, test_case_insensitive_lookup(), test_ensure_api_key_prompts_and_writes_to_env() (+9 more)

### Community 32 - "test_reporting.py"
Cohesion: 0.24
Nodes (11): unit, Report parity: the shared writer produces the report tree for the CLI and the…, _state(), test_save_reports_defaults_under_results_dir(), test_save_reports_explicit_path(), test_write_report_tree_creates_files(), Write the markdown report tree for a completed run, like the CLI does.…, Path (+3 more)

### Community 33 - "test_env_overrides.py"
Cohesion: 0.14
Nodes (20): parametrize, Tests for TRADINGAGENTS_* env-var overlay onto DEFAULT_CONFIG., Garbage int values should surface a ValueError at import, not silently…, A misspelled boolean must fail loudly (like ints) instead of silently False., Env vars outside _ENV_OVERRIDES must not bleed into DEFAULT_CONFIG., Set/clear env vars then reload default_config to re-evaluate DEFAULT_CONFIG., The provider reasoning/thinking knobs are env-configurable (non-interactive…, Unset reasoning/thinking knobs stay None so each provider uses its own default. (+12 more)

### Community 34 - "ResearchPlan"
Cohesion: 0.22
Nodes (10): _make_rm_state(), The RM prompt must list all five tiers so the schema enum matches user…, _structured_rm_llm(), TestRenderResearchPlan, TestResearchManagerAgent, BaseModel, Render a ResearchPlan to markdown for storage and the trader's prompt context., Structured investment plan produced by the Research Manager. Hand-off to the… (+2 more)

### Community 35 - "test_structured_agents.py"
Cohesion: 0.11
Nodes (20): field_validator, _make_trader_state(), unit, Tests for structured-output agents (Trader, Research Manager, Sentiment…, Build a MagicMock LLM whose with_structured_output binding captures the prompt…, A weak LLM may write "None"/"N/A" into an optional float field (#1058); coerce…, _structured_trader_llm(), test_invoke_structured_falls_back_when_result_is_none() (+12 more)

### Community 36 - "SPY News Analysis Report for Week Ending June 5, 2025"
Cohesion: 0.12
Nodes (20): Analyst Team, TradingAgents CLI News Analysis Dashboard, Trade, Tariff, and Geopolitical Downside Risks, Research, Trading, Risk, and Portfolio Teams, Disinflation, Rate-Cut Expectations, and Technical Strength, Fundamentals Analyst, get_global_news_openai, get_google_news (+12 more)

### Community 37 - "Refined Investment Plan"
Cohesion: 0.12
Nodes (20): Balanced Moderate-Trim Case, Valuation, Slowdown, and Geopolitical Risk Case, Bullish Technical and Macro Case, 20-25 Percent Cash or Stable-Value Allocation, TradingAgents CLI Portfolio Decision Dashboard, Limit-Order Sale of SPY Holdings, Neutral Analyst, Portfolio Management Decision (+12 more)

### Community 38 - "OpenAIClient"
Cohesion: 0.10
Nodes (19): _effort_on(), parametrize, OpenAI ``reasoning_effort`` is gated to reasoning models. Non-reasoning OpenAI…, test_non_reasoning_model_drops_effort(), test_reasoning_model_receives_effort(), test_supports_reasoning_effort(), NativeBaseUrlTests, unit (+11 more)

### Community 39 - "NoMarketDataError"
Cohesion: 0.15
Nodes (8): TestNoMarketDataError, HierarchyTests, unit, NoMarketDataError, Exception, Base for any condition where a vendor could not return usable data., A vendor returned no usable rows for a symbol (empty result or stale data).…, VendorError

### Community 40 - "DeepSeekChatOpenAI"
Cohesion: 0.07
Nodes (26): integration, skipif, _bound_kwargs(), _Pick, BaseModel, unit, Tests for DeepSeekChatOpenAI thinking-mode behaviour. Two pieces verified: 1.…, Gemini bot review note: non-list inputs (ChatPromptValue) must also propagate… (+18 more)

### Community 41 - "FredFormattingTests"
Cohesion: 0.13
Nodes (6): FredConfigTests, FredFormattingTests, FredResolutionTests, unit, Build a _request replacement that dispatches on the endpoint path., _request_stub()

### Community 42 - "test_openrouter_model_select.py"
Cohesion: 0.16
Nodes (9): _asks(), parametrize, unit, OpenRouter model selection: prompts are labeled by mode (#1000); required…, TestCancelExitsCleanly, TestLanguageDefaultsToEnglish, TestMainstreamFilter, TestOpenRouterLatestFirst (+1 more)

### Community 43 - "openai_client.py"
Cohesion: 0.13
Nodes (17): ChatOpenAI, parametrize, unit, The OpenAI-compatible provider registry is the single source of truth for the…, test_key_optionality(), test_registry_membership(), test_registry_spec(), is_openai_compatible() (+9 more)

### Community 44 - "GoogleClient"
Cohesion: 0.11
Nodes (18): ChatGoogleGenerativeAI, unit, Verify GoogleClient accepts unified api_key parameter., TestGoogleApiKeyStandardization, _captured_kwargs(), parametrize, Gemini thinking_level forwarding (Gemini 3.x). The catalog is Gemini 3.x only,…, test_flash_passes_thinking_level_through() (+10 more)

### Community 45 - "test_llm_max_retries.py"
Cohesion: 0.27
Nodes (17): _bare_graph(), parametrize, unit, Configurable LLM SDK retry budget (#1090/#1091). A single transient 429 burst…, _reload_with_env(), test_coerce_accepts_non_negative_ints_and_numeric_strings(), test_coerce_rejects_booleans(), test_coerce_rejects_negative() (+9 more)

### Community 46 - "test_reliability.py"
Cohesion: 0.21
Nodes (8): apply_output_budget(), data_progress_detail(), data_steps(), fail_active_data_step(), Keep local generations bounded while preserving deeper report options., Expose the analyst registry used by the actual TradingAgents graph., record_data_progress(), tradingagents_capabilities()

### Community 47 - "TestMinimaxStructuredOutputDispatch"
Cohesion: 0.18
Nodes (11): _client(), _Pick, BaseModel, unit, Tests for MinimaxChatOpenAI quirks. Verifies the subclass injects…, Coding Plan / MiniMax-Text-01 / any non-M2-prefixed model must NOT receive…, M2.x models route through the capability table — tool_choice is suppressed but…, TestMinimaxReasoningSplit (+3 more)

### Community 48 - "test_polymarket.py"
Cohesion: 0.13
Nodes (6): PolymarketFilterTests, PolymarketFormatTests, PolymarketResilienceTests, PolymarketRoutingTests, unit, Polymarket prediction-market vendor: forward-looking filtering, volume ranking,…

### Community 49 - "VendorRoutingTests"
Cohesion: 0.21
Nodes (7): _no_data(), unit, _raises(), Vendor router must respect the configured chain and never silently hide a…, _reset_config(), _returns(), VendorRoutingTests

### Community 50 - "Trading Analyst Dashboard"
Cohesion: 0.13
Nodes (17): AAPL Social Sentiment (Nov 4-19, 2024), Apple Inc. Financial Analysis, Company Financial Analysis, Trading Analyst Dashboard, Fundamentals Analyst, Global Economic Trends and Sector Insights, Global Economic Trend Analysis, US Policy, AI Growth, and Semiconductor Drivers (+9 more)

### Community 51 - "StatsCallbackHandler"
Cohesion: 0.15
Nodes (10): Any, BaseCallbackHandler, Callback handler that tracks LLM calls, tool calls, and token usage., Increment LLM call counter when an LLM starts., Increment LLM call counter when a chat model starts., Extract token usage from LLM response., Increment tool call counter when a tool starts., Return current statistics. (+2 more)

### Community 52 - "trading_graph.py"
Cohesion: 0.14
Nodes (11): Tests for TradingMemoryLog — storage, deferred reflection, PM injection, legacy…, Default benchmark_name keeps the SPY label for legacy callers., Append-only markdown decision log for TradingAgents., Any, Initialize the reflector with an LLM., Concise prompt for reflect_on_final_decision (Phase B log entries). Produces…, Single reflection call on the final trade decision with outcome context. Used…, Handles reflection on trading decisions. (+3 more)

### Community 53 - "TradingAgentsGraph"
Cohesion: 0.10
Nodes (17): unit, The market analyst is bound (and prompt-instructed) to call…, test_market_toolnode_can_execute_verified_snapshot(), Any, Path, ToolNode, Get provider-specific kwargs for LLM client creation., Create tool nodes for different data sources using abstract methods. (+9 more)

### Community 54 - "_ohlcv"
Cohesion: 0.17
Nodes (9): _ohlcv(), DataFrame, unit, Tests for tolerating a non-`Date` index column in stockstats_utils (#890).…, OHLCV frame whose date column is named `date_col`., A frame with `index` instead of `Date` must still clean to a usable, date-…, stockstats must compute indicators on a frame whose date column arrived as…, TestCleanDataframeAcrossVersions (+1 more)

### Community 55 - "TestProviderKwargsTemperature"
Cohesion: 0.16
Nodes (7): parametrize, unit, Tests for the configurable sampling temperature (#178/#168). Temperature is a…, _get_provider_kwargs float-coerces and forwards temperature, or omits it., TestProviderKwargsTemperature, TestTemperatureEnvOverlay, TestTemperatureForwarding

### Community 56 - "ProgressCallback"
Cohesion: 0.15
Nodes (7): estimate_prompt_tokens(), news_count_from_output(), parse_tool_input(), ProgressCallback, BaseCallbackHandler, Return a clearly labelled approximation when no Qwen tokenizer is loaded., source_for_tool()

### Community 57 - "Buy Recommendation for Apple"
Cohesion: 0.15
Nodes (16): Apple, Buy Recommendation for Apple, Balanced Perspective on Apple Investment, Conservative Investment Strategy with Risk Mitigation, Robust Earnings Growth and Market Capitalization, High-Reward, High-Risk Investment Strategy, Innovation Leadership, Market Analysis (+8 more)

### Community 58 - "TestEffortGate"
Cohesion: 0.21
Nodes (8): _capture_kwargs(), parametrize, unit, Tests for Anthropic effort-parameter gating (#831). Haiku (any version) and…, Forward-compat: new Opus/Sonnet versions don't need a code change., Default is conservative — unknown models don't get effort to avoid 400s., Skipping effort must not break other passthrough kwargs., TestEffortGate

### Community 59 - "Buy Apple Shares Decision"
Cohesion: 0.17
Nodes (15): Apple Inc., Buy Apple Shares Decision, Financial Strength Outweighs Risks, Growth Prospects, High Profitability, Liquidity Risk, Long-Term Growth Horizon, Market Opportunity Decision-Making (+7 more)

### Community 60 - "provider_default_url"
Cohesion: 0.19
Nodes (8): provider_default_url(), Return the default backend URL for a provider key, or None if unknown., unit, Tests for env-driven CLI behavior (#897, #873). The config-layer override…, TestCliSkipsPromptsFromEnv, TestProviderDefaultUrl, TestReasoningEffortSkippedFromEnv, TestResearchDepthSkippedFromEnv

### Community 61 - "resolve_instrument_identity"
Cohesion: 0.08
Nodes (18): patch, _dummy_api_keys(), _isolate_config(), mock_llm_client(), fixture, Shared pytest fixtures that prevent CI hangs when API keys are absent., Reset the global dataflows config before and after each test. ``set_config``…, BuildInstrumentContextTests (+10 more)

### Community 65 - "AnthropicClient"
Cohesion: 0.14
Nodes (10): ChatAnthropic, AnthropicClient, NormalizedChatAnthropic, Any, Whether Anthropic accepts the ``effort`` parameter for this model., ChatAnthropic with normalized content output. Claude models with extended…, Client for Anthropic Claude models., Return configured ChatAnthropic instance. (+2 more)

### Community 66 - "_select_model"
Cohesion: 0.16
Nodes (14): _fetch_openrouter_models(), _prompt_custom_model_id(), Fetch available models from the OpenRouter API., Prompt for a required value; exit cleanly if the user cancels.…, Select an OpenRouter model from the newest available, or enter a custom ID.…, Prompt user to type a custom model ID., Select a model for the given provider and mode (quick/deep)., Select shallow thinking llm engine using an interactive selection. (+6 more)

### Community 67 - "create_llm_client"
Cohesion: 0.18
Nodes (21): _capture_kwargs(), unit, Amazon Bedrock — first-class native client via the optional langchain-aws…, Stub _bedrock_class so the constructor kwargs are testable without the optional…, test_bearer_token_passed_as_api_key(), test_bedrock_any_model_and_no_key_env(), test_construction_when_extra_installed(), test_factory_routes_bedrock() (+13 more)

### Community 68 - ".do_GET"
Cohesion: 0.26
Nodes (8): BaseHTTPRequestHandler, elapsed(), Handler, historical_report_path(), persist_report_section(), public_job(), Path, report_section_path()

### Community 71 - "test_news_analyst_prompt.py"
Cohesion: 0.50
Nodes (4): unit, Guard the news analyst prompt against tool-signature drift (#1116). The prompt…, test_get_news_takes_ticker_not_query(), test_news_prompt_matches_get_news_signature()

### Community 72 - "test_ohlcv_cache_freshness.py"
Cohesion: 0.31
Nodes (12): unit, Same-day OHLCV cache must not serve a stale snapshot all day (#1150). The cache…, End-to-end: the helper is actually wired into load_ohlcv's cache branch.…, test_current_day_cache_past_ttl_is_refreshed(), test_historical_request_always_uses_cache(), test_load_ohlcv_refetches_stale_same_day_cache(), test_load_ohlcv_reuses_fresh_same_day_cache(), test_partial_current_day_bar_is_still_refreshed() (+4 more)

### Community 73 - "test_structured_agent_prompts.py"
Cohesion: 0.18
Nodes (21): _capturing_llm(), _prompt_text(), unit, Agents on the schema-only structured-output path must not invite tool calls…, LLM whose structured binding records the prompt it was handed., Flatten a captured prompt (str, message list, or objects) to text., test_constraint_text_is_unambiguous(), test_portfolio_manager_prompt_states_constraint() (+13 more)

### Community 74 - "test_yfinance_stale_ohlcv_guard.py"
Cohesion: 0.18
Nodes (8): _frame(), unit, Stale OHLCV guard (#1021): a vendor returning a year-old partial frame must be…, StaleGuardPropagationTests, StaleGuardRoutingTests, StaleGuardUnitTests, _assert_ohlcv_not_stale(), Reject OHLCV whose latest row is far older than curr_date. Raises…

### Community 76 - "MessageBuffer"
Cohesion: 0.20
Nodes (3): MessageBuffer, Initialize agent status and report sections based on selected analysts. Args:…, Count reports that are finalized (their finalizing agent is completed). A…

### Community 77 - "Bearish Researcher"
Cohesion: 0.24
Nodes (11): AI-powered Smart-home Growth Potential, Apple Inc., Apple Investment Outlook, Apple Investment Risks, Bearish Researcher, Bullish-Bearish Investment Research Diagram, Bullish Researcher, Geopolitical, Valuation, and Liquidity Risks (+3 more)

### Community 78 - "test_cli_symbol_handling.py"
Cohesion: 0.14
Nodes (14): get_ticker(), is_valid_ticker_input(), normalize_ticker_symbol(), Whether a ticker entry is acceptable (charset + length). Allows the characters…, Prompt the user to enter a ticker symbol, preserving exchange suffixes. Uses…, Resolve user input to its canonical Yahoo symbol (single source of truth).…, parametrize, CLI symbol validation/classification must agree with the data path. Regressions… (+6 more)

### Community 81 - "TestLegacyRemoval"
Cohesion: 0.18
Nodes (6): FinancialSituationMemory must not be importable from the memory module., rank_bm25 must not be present in the memory module namespace., TradingAgentsGraph must not expose reflect_and_remember., create_portfolio_manager accepts only llm; passing memory= raises TypeError., propagate() completes and stores the decision after the redesign., TestLegacyRemoval

### Community 82 - "_make_api_request"
Cohesion: 0.08
Nodes (42): _FakeResponse, _patched_get(), unit, Alpha Vantage request hardening. Regressions for #990 (no request timeout ->…, test_fundamentals_look_ahead_filter_runs_on_json_string(), test_fundamentals_no_curr_date_passes_through(), test_fundamentals_non_json_body_unchanged(), test_invalid_key_not_mislabeled_as_rate_limit() (+34 more)

### Community 83 - "_build_run_config"
Cohesion: 0.29
Nodes (9): _build_run_config(), Assemble the run config from interactive selections, honoring env precedence.…, parametrize, CLI config precedence (#976, #977). An explicit environment override for the…, test_checkpoint_flag_overrides_env(), test_checkpoint_none_preserves_env_default(), test_env_round_counts_win_over_selection(), test_partial_env_only_overrides_that_count() (+1 more)

### Community 85 - "create_portfolio_manager"
Cohesion: 0.19
Nodes (17): main(), _make_pm_state(), _make_rm_state(), _make_trader_state(), _print_section(), End-to-end smoke for structured-output agents against a real LLM provider. Runs…, T, create_portfolio_manager() (+9 more)

### Community 86 - "test_stocktwits_resilience.py"
Cohesion: 0.27
Nodes (6): parametrize, unit, _raise(), StockTwits fetch: transport-error resilience (#1024) and crypto symbol mapping…, TestStockTwitsCryptoSymbols, TestStockTwitsResilience

### Community 88 - "polymarket.py"
Cohesion: 0.31
Nodes (9): get_prediction_markets(), _is_forward_looking(), _parse_json_list(), datetime, Polymarket prediction-market vendor. Surfaces live, market-implied…, Gamma encodes ``outcomes``/``outcomePrices`` as JSON-string arrays., Keep only open markets that resolve in the future. ``closed`` is the reliable…, Return live prediction-market probabilities for an event topic. Args: topic:… (+1 more)

### Community 90 - "validators.py"
Cohesion: 0.16
Nodes (9): DummyLLMClient, ModelValidationTests, unit, get_known_models(), Shared model catalog for CLI selections and validation., Build known model names from the shared CLI catalog., Model name validators for each provider., Check if model name is valid for the given provider. For ollama, openrouter,… (+1 more)

### Community 92 - "TradingAgents CLI"
Cohesion: 0.25
Nodes (8): TradingAgents CLI Initialization Screen, cli.main Module, Multi-Agents LLM Financial Trading Framework, SPY Default Ticker, Tauric Research, Ticker Symbol Input, Trading Workflow, TradingAgents CLI

### Community 96 - "display_announcements"
Cohesion: 0.29
Nodes (5): display_announcements(), fetch_announcements(), Fetch announcements from endpoint. Returns dict with announcements and settings., Display announcements panel. Prompts for Enter if require_attention is True., Console

### Community 99 - "Q: Cela dépend si Trading Agent permet de modifier la Base URL. ?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Cela dépend si Trading Agent permet de modifier la Base URL. ?, Source Nodes

### Community 102 - "Research Team"
Cohesion: 0.40
Nodes (5): Analyst Team, Portfolio Management, Research Team, Risk Management, Trader

### Community 103 - "Tauric Research Brand"
Cohesion: 0.60
Nodes (5): Bull Motif, Dot-Matrix Bull Emblem, Tauric Research Brand, Tauric Research Logo, Tauric Research Wordmark

### Community 110 - "TestPortfolioManagerInjection"
Cohesion: 0.20
Nodes (8): _make_pm_state(), Minimal AgentState dict for portfolio_manager_node., PM prompt omits the lessons section entirely when past_context is empty., The structured PortfolioDecision is rendered to markdown that downstream…, If a provider does not support with_structured_output, the agent falls back to…, Build a MagicMock LLM whose with_structured_output binding captures the prompt…, _structured_pm_llm(), TestPortfolioManagerInjection

## Ambiguous Edges - Review These
- `OpenAI o1 Deep Thinking` → `Trader`  [AMBIGUOUS]
  assets/schema.png · relation: conceptually_related_to

## Knowledge Gaps
- **104 isolated node(s):** `tradingagents`, `AnalystNodeSpec`, `name`, `private`, `version` (+99 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `OpenAI o1 Deep Thinking` and `Trader`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `create_llm_client()` connect `create_llm_client` to `AnthropicClient`, `interface.py`, `OpenAIClient`, `openai_client.py`, `GoogleClient`, `BaseLLMClient`, `trading_graph.py`, `TradingAgentsGraph`, `create_portfolio_manager`, `TestProviderKwargsTemperature`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._
- **Why does `TradingAgentsGraph` connect `TradingAgentsGraph` to `test_reporting.py`, `test_checkpoint_resume.py`, `Propagator`, `._fetch_returns`, `parse_rating`, `test_llm_max_retries.py`, `test_reliability.py`, `TestLegacyRemoval`, `TradingMemoryLog`, `trading_graph.py`, `ConditionalLogic`, `TestProviderKwargsTemperature`, `server.py`, `cli/main.py`, `yfinance_news.py`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `normalize_symbol()` connect `normalize_symbol` to `stockstats_utils.py`, `._fetch_returns`, `test_cli_symbol_handling.py`, `agent_utils.py`, `trading_graph.py`, `cli/utils.py`, `yfinance_news.py`, `resolve_instrument_identity`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Are the 16 inferred relationships involving `TradingAgentsGraph` (e.g. with `TestCheckpointSignature` and `_bare_graph()`) actually correct?**
  _`TradingAgentsGraph` has 16 INFERRED edges - model-reasoned connections that need verification._
- **What connects `tradingagents`, `AnalystNodeSpec`, `name` to the rest of the system?**
  _104 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `test_reddit_fallback.py` be split into smaller, more focused modules?**
  _Cohesion score 0.05519480519480519 - nodes in this community are weakly interconnected._