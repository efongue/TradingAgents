# Graph Report - TradingAgents  (2026-08-25)

## Corpus Check
- 166 files · ~236,473 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2077 nodes · 3956 edges · 119 communities (110 shown, 9 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 209 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Test Reddit Fallback
- Trading Agents Multi Agent Trading
- Test Checkpoint Resume
- Stockstats Utils
- Route To Vendor
- App
- Get Capabilities
- Test Ollama Base Url
- Interface
- Sentiment Analyst
- Test Memory Log
- Trading Agents Graph
- Parse Rating
- Normalize Symbol
- Base Llmclient
- Trading Agents Architecture Diagram
- Agent Utils
- Market Data Validator
- Reliability Tests
- Make Log
- Test Deferred Reflection
- Conditional Logic
- Package
- Server
- Utils
- Get User Selections
- Main
- Get Stockstats Indicators Report Online
- Yfinance News
- Safe Ticker Component
- Build Analyst Execution Plan
- Test Api Key Env
- Trading Memory Log
- Test Env Overrides
- Test Structured Agents
- Trader Proposal
- SPY News Analysis Report For
- Refined Investment Plan
- Open Aiclient
- Test Vendor Errors
- Deep Seek Chat Open AI
- Fred Formatting Tests
- Test Openrouter Model Select
- Openai Client
- Google Client
- Test Llm Max Retries
- Resolve Entry
- Test Minimax Structured Output Dispatch
- Test Polymarket
- Vendor Routing Tests
- Trading Analyst Dashboard
- Stats Callback Handler
- Propagator
- Test Reporting
- Ohlcv
- Test Provider Kwargs Temperature
- Progress Callback
- Buy Recommendation For Apple
- Test Effort Gate
- Buy Apple Shares Decision
- Provider Default Url
- Build Instrument Context
- Make Api Request
- Value Error
- Analysis Limits
- Anthropic Client
- Select Model
- Create Llm Client
- .do GET
- Test Alpha Vantage Hardening
- Test Deepseek Reasoning
- Test Structured Output Capability Dispatch
- Test Ohlcv Cache Freshness
- Test Structured Agent Prompts
- Stale Guard Unit Tests
- Azure Open Aiclient
- Message Buffer
- Bearish Researcher
- Normalize Ticker Symbol
- Test Bedrock Provider
- . Fetch Returns
- Test Legacy Removal
- Alpha Vantage Fundamentals
- Build Run Config
- Resolve Instrument Identity
- Trader
- Test Stocktwits Resilience
- Alpha Vantage
- Polymarket
- Seed Completed
- Dummy Llmclient
- Test Openai Reasoning Effort
- Trading Agents CLI
- Conftest
- Test Load Ohlcv No Poison
- Normalized Chat Google Generative AI
- Display Announcements
- Smoke Structured Output
- Context Anchored Placeholder Tests
- Router Handles Base Types Tests
- . Resolve Pending Entries
- .warn If Unknown Model
- Research Team
- Tauric Research Brand
- Test Cli No Console
- . Init
- . Get Request Payload
- Select Llm Provider
- . Init
- .get Llm
- .test Full Cycle Store Resolve
- Init
- Init
- Tradingagents

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
- `Verified Data-access Contract` --semantically_similar_to--> `Verified Market-data Grounding`  [INFERRED] [semantically similar]
  CHANGELOG.md → README.md
- `LLM Provider Registry` --semantically_similar_to--> `Multi-provider LLM Support`  [INFERRED] [semantically similar]
  CHANGELOG.md → README.md
- `Persistent Decision Log` --semantically_similar_to--> `Persistent Decision Log`  [INFERRED] [semantically similar]
  CHANGELOG.md → README.md
- `LangGraph Checkpoint Resume` --semantically_similar_to--> `Checkpoint Resume`  [INFERRED] [semantically similar]
  CHANGELOG.md → README.md
- `Deterministic Last-price Guard` --semantically_similar_to--> `Verified Market-data Grounding`  [INFERRED] [semantically similar]
  web_ui/README.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Multi-agent Trading Decision Pipeline** — readme_analyst_team, readme_researcher_team, readme_trader_agent, readme_risk_management_team, readme_portfolio_manager [EXTRACTED 1.00]
- **Release Reliability and Correctness Program** — changelog_verified_data_access_contract, changelog_checkpoint_resume, changelog_ticker_path_traversal_hardening, changelog_ci_gate [INFERRED 0.85]
- **TradingAgents Access and Deployment Surfaces** — cli_static_welcome_tradingagents_ascii_brand, docker_compose_tradingagents_service, web_ui_readme_isolated_web_interface, readme_tradingagents_framework [INFERRED 0.75]
- **Multi-Perspective Market Analysis** — assets_analyst_market_analyst, assets_analyst_social_media_analyst, assets_analyst_news_analyst, assets_analyst_fundamentals_analyst [INFERRED 0.95]
- **Integrated Technical, Sentiment, Macro, and Fundamental Evidence** — assets_analyst_tech_sector_growth, assets_analyst_aapl_social_sentiment_nov_2024, assets_analyst_global_economic_and_sector_insights, assets_analyst_apple_inc_financial_analysis [INFERRED 0.85]
- **Trading Workflow Stages** — assets_cli_cli_init_trading_workflow, assets_cli_cli_init_analyst_team, assets_cli_cli_init_research_team, assets_cli_cli_init_trader, assets_cli_cli_init_risk_management, assets_cli_cli_init_portfolio_management [EXTRACTED 1.00]
- **Analyst Team Phase** — assets_cli_cli_news_market_analyst, assets_cli_cli_news_social_analyst, assets_cli_cli_news_news_analyst, assets_cli_cli_news_fundamentals_analyst [EXTRACTED 1.00]
- **Stock, Global, and Google News Sourcing** — assets_cli_cli_news_get_stock_news_openai, assets_cli_cli_news_get_global_news_openai, assets_cli_cli_news_get_google_news, assets_cli_cli_news_spy_news_analysis_report [INFERRED 0.95]
- **Macroeconomic, Market, Geopolitical, and Sector Evidence** — assets_cli_cli_news_macroeconomic_environment, assets_cli_cli_news_global_stock_market_performance, assets_cli_cli_news_trade_and_geopolitical_developments, assets_cli_cli_news_sector_and_company_news [EXTRACTED 1.00]
- **Multi-Agent Workflow Teams** — assets_cli_cli_technical_multi_agent_trading_workflow, assets_cli_cli_technical_analyst_team, assets_cli_cli_technical_research_team, assets_cli_cli_technical_trading_team, assets_cli_cli_technical_risk_management_team, assets_cli_cli_technical_portfolio_management_team [EXTRACTED 1.00]
- **Selected Technical Indicators** — assets_cli_cli_technical_spy_market_analysis_report, assets_cli_cli_technical_moving_averages, assets_cli_cli_technical_macd, assets_cli_cli_technical_rsi, assets_cli_cli_technical_bollinger_bands, assets_cli_cli_technical_atr, assets_cli_cli_technical_vwma [EXTRACTED 1.00]
- **Bullish, Bearish, and Balanced Risk Debate** — assets_cli_cli_transaction_risky_analyst, assets_cli_cli_transaction_safe_analyst, assets_cli_cli_transaction_neutral_analyst [EXTRACTED 1.00]
- **Risk-Adjusted Portfolio Decision Synthesis** — assets_cli_cli_transaction_bullish_case, assets_cli_cli_transaction_bearish_case, assets_cli_cli_transaction_balanced_case, assets_cli_cli_transaction_sell_trim_recommendation [EXTRACTED 1.00]
- **Defensive Proceeds Allocation** — assets_cli_cli_transaction_treasury_and_corporate_bond_allocation, assets_cli_cli_transaction_cash_allocation, assets_cli_cli_transaction_put_spread_hedge [EXTRACTED 1.00]
- **Opposing Apple Investment Theses** — assets_researcher_bullish_researcher, assets_researcher_bearish_researcher, assets_researcher_investment_debate, assets_researcher_apple_inc [EXTRACTED 1.00]
- **Multi-Perspective Risk Assessment** — assets_risk_risky_analyst, assets_risk_neutral_analyst, assets_risk_safe_analyst, assets_risk_risk_perspective_report [EXTRACTED 1.00]
- **Risk Report to Manager Recommendation Flow** — assets_risk_risk_perspective_report, assets_risk_risk_manager, assets_risk_apple_buy_recommendation [EXTRACTED 1.00]
- **Apple Buy Recommendation Evidence** — assets_risk_strong_fundamentals, assets_risk_earnings_growth_and_market_capitalization, assets_risk_innovation_leadership, assets_risk_resilience_to_risks [EXTRACTED 1.00]
- **Multi-source Market Analysis Inputs** — assets_schema_market_data, assets_schema_social_media_data, assets_schema_news_data, assets_schema_fundamental_data, assets_schema_researcher_team [EXTRACTED 1.00]
- **Trading Decision Pipeline** — assets_schema_researcher_team, assets_schema_trader, assets_schema_risk_management_team, assets_schema_manager, assets_schema_trade_execution [EXTRACTED 1.00]
- **Financial Strength Factors** — assets_trader_strong_financials, assets_trader_high_profitability, assets_trader_strong_cash_flow, assets_trader_robust_margins [EXTRACTED 1.00]

## Communities (119 total, 9 thin omitted)

### Community 0 - "Test Reddit Fallback"
Cohesion: 0.06
Nodes (34): HTTPError, _atom_resp(), unit, _raise(), Tests for the RSS-first Reddit fetcher, its 429 backoff, the opt-in JSON path's…, The opt-in JSON path still degrades to RSS on a 403 (kept for #862)., IncompleteRead/RemoteDisconnected come from http.client and are NOT OSErrors,…, A crypto pair (BTC-USD) barely matches Reddit text; search the base (#1113). (+26 more)

### Community 1 - "Trading Agents Multi Agent Trading"
Cohesion: 0.05
Nodes (50): GitHub Actions CI Workflow, Clean-install Import Smoke Test, Python 3.10-3.13 Test Matrix, Strict Full-repository Ruff Lint, LangGraph Checkpoint Resume, Continuous Integration Gate, Grounded Sentiment Analyst, Persistent Decision Log (+42 more)

### Community 2 - "Test Checkpoint Resume"
Cohesion: 0.09
Nodes (31): SqliteSaver, StateGraph, _build_graph(), _node_a(), _node_b(), TypedDict, Test checkpoint resume: crash mid-analysis, re-run resumes from last node., A different date must NOT resume from an existing checkpoint. (+23 more)

### Community 3 - "Stockstats Utils"
Cohesion: 0.09
Nodes (38): Series, unit, yfinance treats ``end`` as exclusive; we must request one extra day so the…, test_get_yfin_requests_inclusive_end(), test_load_ohlcv_requests_inclusive_end(), NoMarketDataError, A vendor returned no usable rows for a symbol (empty result or stale data).…, _assert_ohlcv_not_stale() (+30 more)

### Community 4 - "Route To Vendor"
Cohesion: 0.07
Nodes (36): unit, Guard the news analyst prompt against tool-signature drift (#1116). The prompt…, test_get_news_takes_ticker_not_query(), test_news_prompt_matches_get_news_signature(), get_stock_data(), tool, Retrieve stock price data (OHLCV) for a given ticker symbol. Uses the…, get_balance_sheet() (+28 more)

### Community 5 - "App"
Cohesion: 0.07
Nodes (22): AnalysisFailure(), AnalysisParametersPanel(), ANALYST_ICONS, api(), App(), BentoInsight(), cleanReportText(), ContextLimitCard() (+14 more)

### Community 6 - "Get Capabilities"
Cohesion: 0.08
Nodes (17): unit, Unit tests for the LLM capability table., deepseek-chat must NOT match the v\\d regex., Capability rows are immutable so they can be safely shared., Forward-compat regex patterns catch unknown DeepSeek and MiniMax variants., MiniMax M2.x models reject langchain's function-spec dict tool_choice (official…, Unknown / non-DeepSeek models get the permissive default., test_capabilities_dataclass_is_frozen() (+9 more)

### Community 7 - "Test Ollama Base Url"
Cohesion: 0.07
Nodes (39): ModelOption, cli_utils(), fixture, Import cli.utils with a fresh environment so module-level state is consistent., _base_url(), fixture, Tests for OLLAMA_BASE_URL env-var override across CLI and client paths., The Ollama entry in the CLI dropdown must reflect OLLAMA_BASE_URL. (+31 more)

### Community 8 - "Interface"
Cohesion: 0.08
Nodes (21): DataflowsConfigIsolationTests, unit, Config isolation: get/set must not leak nested-dict references., FredRoutingTests, FRED macro vendor: alias resolution, configuration errors, output formatting,…, parametrize, unit, test_report_agent_applies_language_instruction() (+13 more)

### Community 9 - "Sentiment Analyst"
Cohesion: 0.09
Nodes (25): _make_sentiment_state(), MagicMock LLM whose structured binding captures the prompt and returns a real…, _structured_sentiment_llm(), TestRenderSentimentReport, TestSentimentAnalystAgent, _build_system_message(), create_sentiment_analyst(), create_social_media_analyst() (+17 more)

### Community 10 - "Test Memory Log"
Cohesion: 0.11
Nodes (26): field_validator, _make_pm_state(), Tests for TradingMemoryLog — storage, deferred reflection, PM injection, legacy…, Minimal AgentState dict for portfolio_manager_node., PM prompt omits the lessons section entirely when past_context is empty., The structured PortfolioDecision is rendered to markdown that downstream…, If a provider does not support with_structured_output, the agent falls back to…, Build a MagicMock LLM whose with_structured_output binding captures the prompt… (+18 more)

### Community 11 - "Trading Agents Graph"
Cohesion: 0.10
Nodes (20): unit, The market analyst is bound (and prompt-instructed) to call…, test_market_toolnode_can_execute_verified_snapshot(), Symbol normalization must apply on every yfinance path, not just price fetch.…, test_fetch_returns_normalizes_symbol(), test_identity_lookup_normalizes_symbol(), test_news_lookup_normalizes_symbol(), Single reflection call on the final trade decision with outcome context. Used… (+12 more)

### Community 12 - "Parse Rating"
Cohesion: 0.10
Nodes (14): unit, Tests for the shared rating heuristic and the SignalProcessor adapter. The…, SignalProcessor must not invoke the LLM it was constructed with — the rating is…, TestParseRating, TestSignalProcessor, Append-only markdown decision log for TradingAgents., parse_rating(), Shared 5-tier rating vocabulary and a deterministic heuristic parser. The same… (+6 more)

### Community 13 - "Normalize Symbol"
Cohesion: 0.11
Nodes (15): unit, Tests for symbol normalization and the no-data routing sentinel., TestCryptoBase, TestIsYahooSafe, TestNoMarketDataError, TestNormalizeSymbol, crypto_base(), is_yahoo_safe() (+7 more)

### Community 14 - "Base Llmclient"
Cohesion: 0.12
Nodes (18): ABC, BaseLLMClient, normalize_content(), Abstract base class for LLM clients., Normalize LLM response content to a plain string. Multiple providers (OpenAI…, _bedrock_class(), BedrockClient, Any (+10 more)

### Community 15 - "Trading Agents Architecture Diagram"
Cohesion: 0.09
Nodes (31): Aggressive Risk View, Bearish Researcher, Bloomberg, Bullish Researcher, Buy Evidence, Company Profile, Conservative Risk View, EODHD APIs (+23 more)

### Community 16 - "Agent Utils"
Cohesion: 0.21
Nodes (18): Every report-producing agent must apply the configured output language…, create_fundamentals_analyst(), create_market_analyst(), create_news_analyst(), create_bear_researcher(), create_bull_researcher(), create_aggressive_debator(), create_conservative_debator() (+10 more)

### Community 17 - "Market Data Validator"
Cohesion: 0.10
Nodes (19): MarketDataProgress, DataFrame, unit, Tests for the deterministic market-data verification snapshot (#830/#881)., _sample_ohlcv(), TestTool, TestVerifiedSnapshot, get_verified_market_snapshot() (+11 more)

### Community 18 - "Reliability Tests"
Cohesion: 0.11
Nodes (15): TestCase, apply_output_budget(), data_progress_detail(), data_steps(), fail_active_data_step(), parse_snapshot(), Keep local generations bounded while preserving deeper report options., Expose the analyst registry used by the actual TradingAgents graph. (+7 more)

### Community 19 - "Make Log"
Cohesion: 0.11
Nodes (10): make_log(), Calling store_decision twice with same (ticker, date) stores only one entry., batch_update_with_outcomes resolves multiple pending entries in one write., Rating: X' label wins even when an opposing rating word appears earlier in…, LLM decision containing '---' must not corrupt the entry., **Rating**: Buy — markdown bold around the label must not prevent parsing., Rating: **Sell** — markdown bold around the value must not prevent parsing., Rating: **Sell** must win even when prose contains a conflicting rating word. (+2 more)

### Community 20 - "Test Deferred Reflection"
Cohesion: 0.08
Nodes (14): Only the matching entry is modified; all other entries remain unchanged., A pre-existing .tmp file is overwritten; the log is correctly updated., All fields intact and blank line between tag and DECISION preserved after…, Return figures are present in the human message sent to the LLM., config['benchmark_ticker'] wins for every ticker., Known suffixes route to their regional index., A-share tickers route to their exchange composite (uses the real default…, US tickers (no dotted suffix) take the empty-suffix entry. (+6 more)

### Community 21 - "Conditional Logic"
Cohesion: 0.12
Nodes (21): MessagesState, _debate_state(), parametrize, unit, Shared-router / path_map completeness (#1088). Both…, _state(), test_debate_path_map_covers_full_router_range(), test_debate_router_return_always_routable() (+13 more)

### Community 22 - "Package"
Cohesion: 0.07
Nodes (27): @fontsource/poppins, lucide-react, react, react-dom, react-markdown, remark-gfm, vite, @vitejs/plugin-react (+19 more)

### Community 23 - "Server"
Cohesion: 0.13
Nodes (23): analysis_parameters(), context_from_model_details(), graph_node_report(), legacy_analysis_parameters(), load_historical_job(), load_history_items(), news_requests(), ollama_json() (+15 more)

### Community 24 - "Utils"
Cohesion: 0.16
Nodes (19): AnalystType, AssetType, Enum, str, detect_asset_type(), filter_analysts_for_asset_type(), get_analysis_date(), is_valid_ticker_input() (+11 more)

### Community 25 - "Get User Selections"
Cohesion: 0.08
Nodes (26): get_analysis_date(), get_user_selections(), Get all user selections before starting the analysis display., Get the analysis date from user input., ask_anthropic_effort(), ask_gemini_thinking_config(), ask_glm_region(), ask_minimax_region() (+18 more)

### Community 26 - "Main"
Cohesion: 0.12
Nodes (24): analyze(), classify_message_type(), create_layout(), display_complete_report(), extract_content_string(), format_tokens(), format_tool_args(), Path (+16 more)

### Community 27 - "Get Stockstats Indicators Report Online"
Cohesion: 0.11
Nodes (24): Analyst Team, Average True Range, ATR-Based Stop-Loss Recommendation, Bollinger Bands, Bullish Bias with Room for Further Gains, Bullish Trend Assessment, get_stockstats_indicators_report_online, MACD (+16 more)

### Community 28 - "Yfinance News"
Cohesion: 0.17
Nodes (21): _epoch(), unit, yfinance news must not leak future-dated (or undated, in a backtest) articles…, Epoch seconds for UTC midnight of ``date_str`` (host-timezone independent)., test_flat_article_publish_time_is_parsed(), test_global_news_empty_after_filter_is_informative(), test_global_news_future_flat_article_excluded(), test_offset_aware_timestamp_is_converted_not_truncated() (+13 more)

### Community 29 - "Safe Ticker Component"
Cohesion: 0.13
Nodes (9): SavePathType, unit, Tests for the ticker path-component validator that blocks directory traversal., Sanity: sanitized values stay within base when joined., TestSafeTickerComponent, DataFrame, Validate ``value`` is safe to interpolate into a filesystem path. Tickers come…, safe_ticker_component() (+1 more)

### Community 30 - "Build Analyst Execution Plan"
Cohesion: 0.18
Nodes (8): AnalystExecutionPlanTests, AnalystWallTimeTrackerTests, AnalystExecutionPlan, AnalystNodeSpec, AnalystWallTimeTracker, build_analyst_execution_plan(), get_initial_analyst_node(), sync_analyst_tracker_from_chunk()

### Community 31 - "Test Api Key Env"
Cohesion: 0.11
Nodes (17): parametrize, Tests for the canonical provider->env-var mapping and the CLI key-prompt helper., When key is missing, user-pasted value must be written to .env AND os.environ., Empty prompt response (user cancelled) must not write to .env., An existing .env with other keys must be preserved on writeback., select_llm_provider() must not present a provider the mapping doesn't know…, test_case_insensitive_lookup(), test_ensure_api_key_prompts_and_writes_to_env() (+9 more)

### Community 32 - "Trading Memory Log"
Cohesion: 0.12
Nodes (9): Append-only markdown log of trading decisions and reflections., Replace pending tag and append REFLECTION section using atomic write. Finds the…, Apply multiple outcome updates in a single read + atomic write. Each element of…, Drop oldest resolved blocks when their count exceeds max_entries. Pending…, Append pending entry at end of propagate(). No LLM call., Parse all entries from log. Returns list of dicts., Return entries with outcome:pending (for Phase B)., Return formatted past context string for agent prompt injection. (+1 more)

### Community 33 - "Test Env Overrides"
Cohesion: 0.14
Nodes (20): parametrize, Tests for TRADINGAGENTS_* env-var overlay onto DEFAULT_CONFIG., Garbage int values should surface a ValueError at import, not silently…, A misspelled boolean must fail loudly (like ints) instead of silently False., Env vars outside _ENV_OVERRIDES must not bleed into DEFAULT_CONFIG., Set/clear env vars then reload default_config to re-evaluate DEFAULT_CONFIG., The provider reasoning/thinking knobs are env-configurable (non-interactive…, Unset reasoning/thinking knobs stay None so each provider uses its own default. (+12 more)

### Community 34 - "Test Structured Agents"
Cohesion: 0.20
Nodes (14): _make_rm_state(), unit, Tests for structured-output agents (Trader, Research Manager, Sentiment…, The RM prompt must list all five tiers so the schema enum matches user…, _structured_rm_llm(), test_invoke_structured_falls_back_when_result_is_none(), TestRenderResearchPlan, TestResearchManagerAgent (+6 more)

### Community 35 - "Trader Proposal"
Cohesion: 0.17
Nodes (12): _make_trader_state(), Build a MagicMock LLM whose with_structured_output binding captures the prompt…, A weak LLM may write "None"/"N/A" into an optional float field (#1058); coerce…, _structured_trader_llm(), TestNullishFloatCoercion, TestRenderTraderProposal, TestTraderAgent, Structured transaction proposal produced by the Trader. The trader reads the… (+4 more)

### Community 36 - "SPY News Analysis Report For"
Cohesion: 0.12
Nodes (20): Analyst Team, TradingAgents CLI News Analysis Dashboard, Trade, Tariff, and Geopolitical Downside Risks, Research, Trading, Risk, and Portfolio Teams, Disinflation, Rate-Cut Expectations, and Technical Strength, Fundamentals Analyst, get_global_news_openai, get_google_news (+12 more)

### Community 37 - "Refined Investment Plan"
Cohesion: 0.12
Nodes (20): Balanced Moderate-Trim Case, Valuation, Slowdown, and Geopolitical Risk Case, Bullish Technical and Macro Case, 20-25 Percent Cash or Stable-Value Allocation, TradingAgents CLI Portfolio Decision Dashboard, Limit-Order Sale of SPY Holdings, Neutral Analyst, Portfolio Management Decision (+12 more)

### Community 38 - "Open Aiclient"
Cohesion: 0.14
Nodes (11): NativeBaseUrlTests, unit, The Responses API only exists on native OpenAI; a custom base_url on the openai…, ResponsesApiSelectionTests, _is_native_openai_base_url(), OpenAIClient, Any, True when ``base_url`` is unset or points at api.openai.com. The Responses API… (+3 more)

### Community 39 - "Test Vendor Errors"
Cohesion: 0.16
Nodes (14): HierarchyTests, The vendor data-error hierarchy: every "vendor couldn't return usable data"…, AlphaVantageRateLimitError, Raised when the Alpha Vantage API rate limit is exceeded., Exception, Vendor data-error taxonomy. A single hierarchy so the routing layer reacts by…, Base for any condition where a vendor could not return usable data., A vendor throttled the request; the router skips to the next vendor. (+6 more)

### Community 40 - "Deep Seek Chat Open AI"
Cohesion: 0.12
Nodes (13): integration, skipif, _Pick, BaseModel, Gemini bot review note: non-list inputs (ChatPromptValue) must also propagate…, End-to-end: a real DeepSeek V4-flash call returns a typed instance. Verifies…, When the response carries reasoning_content, it lands on the AIMessage's…, When an outgoing AIMessage carries reasoning_content, the request payload… (+5 more)

### Community 41 - "Fred Formatting Tests"
Cohesion: 0.13
Nodes (6): FredConfigTests, FredFormattingTests, FredResolutionTests, unit, Build a _request replacement that dispatches on the endpoint path., _request_stub()

### Community 42 - "Test Openrouter Model Select"
Cohesion: 0.16
Nodes (9): _asks(), parametrize, unit, OpenRouter model selection: prompts are labeled by mode (#1000); required…, TestCancelExitsCleanly, TestLanguageDefaultsToEnglish, TestMainstreamFilter, TestOpenRouterLatestFirst (+1 more)

### Community 43 - "Openai Client"
Cohesion: 0.15
Nodes (15): ChatOpenAI, parametrize, unit, The OpenAI-compatible provider registry is the single source of truth for the…, test_key_optionality(), test_registry_membership(), test_registry_spec(), is_openai_compatible() (+7 more)

### Community 44 - "Google Client"
Cohesion: 0.16
Nodes (13): unit, Verify GoogleClient accepts unified api_key parameter., TestGoogleApiKeyStandardization, _captured_kwargs(), parametrize, Gemini thinking_level forwarding (Gemini 3.x). The catalog is Gemini 3.x only,…, test_flash_passes_thinking_level_through(), test_no_thinking_level_is_omitted() (+5 more)

### Community 45 - "Test Llm Max Retries"
Cohesion: 0.27
Nodes (17): _bare_graph(), parametrize, unit, Configurable LLM SDK retry budget (#1090/#1091). A single transient 429 burst…, _reload_with_env(), test_coerce_accepts_non_negative_ints_and_numeric_strings(), test_coerce_rejects_booleans(), test_coerce_rejects_negative() (+9 more)

### Community 46 - "Resolve Entry"
Cohesion: 0.11
Nodes (10): Without max_entries, all resolved entries are kept., When max_entries is set and exceeded, oldest resolved entries are pruned., Pending entries (unresolved) are kept regardless of the cap., No rotation when resolved count <= max_entries., Store a decision then immediately resolve it via the API., Same-ticker entries in same-ticker section; cross-ticker entries in cross-…, Cross-ticker entries show only the REFLECTION text, not the full DECISION., More than 5 same-ticker completed entries → only 5 injected. (+2 more)

### Community 47 - "Test Minimax Structured Output Dispatch"
Cohesion: 0.18
Nodes (11): _client(), _Pick, BaseModel, unit, Tests for MinimaxChatOpenAI quirks. Verifies the subclass injects…, Coding Plan / MiniMax-Text-01 / any non-M2-prefixed model must NOT receive…, M2.x models route through the capability table — tool_choice is suppressed but…, TestMinimaxReasoningSplit (+3 more)

### Community 48 - "Test Polymarket"
Cohesion: 0.13
Nodes (6): PolymarketFilterTests, PolymarketFormatTests, PolymarketResilienceTests, PolymarketRoutingTests, unit, Polymarket prediction-market vendor: forward-looking filtering, volume ranking,…

### Community 49 - "Vendor Routing Tests"
Cohesion: 0.23
Nodes (7): _no_data(), unit, _raises(), Vendor router must respect the configured chain and never silently hide a…, _reset_config(), _returns(), VendorRoutingTests

### Community 50 - "Trading Analyst Dashboard"
Cohesion: 0.13
Nodes (17): AAPL Social Sentiment (Nov 4-19, 2024), Apple Inc. Financial Analysis, Company Financial Analysis, Trading Analyst Dashboard, Fundamentals Analyst, Global Economic Trends and Sector Insights, Global Economic Trend Analysis, US Policy, AI Growth, and Semiconductor Drivers (+9 more)

### Community 51 - "Stats Callback Handler"
Cohesion: 0.15
Nodes (10): Any, BaseCallbackHandler, Callback handler that tracks LLM calls, tool calls, and token usage., Increment LLM call counter when an LLM starts., Increment LLM call counter when a chat model starts., Extract token usage from LLM response., Increment tool call counter when a tool starts., Return current statistics. (+2 more)

### Community 52 - "Propagator"
Cohesion: 0.18
Nodes (9): InvestDebateState, TypedDict, RiskDebateState, Propagator, Any, Handles state initialization and propagation through the graph., Initialize with configuration parameters., Create the initial state for the agent graph. ``instrument_context`` is the… (+1 more)

### Community 53 - "Test Reporting"
Cohesion: 0.18
Nodes (13): unit, Report parity: the shared writer produces the report tree for the CLI and the…, _state(), test_save_reports_defaults_under_results_dir(), test_save_reports_explicit_path(), test_write_report_tree_creates_files(), Path, Write the markdown report tree for a completed run, like the CLI does.… (+5 more)

### Community 54 - "Ohlcv"
Cohesion: 0.17
Nodes (9): _ohlcv(), DataFrame, unit, Tests for tolerating a non-`Date` index column in stockstats_utils (#890).…, OHLCV frame whose date column is named `date_col`., A frame with `index` instead of `Date` must still clean to a usable, date-…, stockstats must compute indicators on a frame whose date column arrived as…, TestCleanDataframeAcrossVersions (+1 more)

### Community 55 - "Test Provider Kwargs Temperature"
Cohesion: 0.16
Nodes (7): parametrize, unit, Tests for the configurable sampling temperature (#178/#168). Temperature is a…, _get_provider_kwargs float-coerces and forwards temperature, or omits it., TestProviderKwargsTemperature, TestTemperatureEnvOverlay, TestTemperatureForwarding

### Community 56 - "Progress Callback"
Cohesion: 0.15
Nodes (7): estimate_prompt_tokens(), news_count_from_output(), parse_tool_input(), ProgressCallback, BaseCallbackHandler, Return a clearly labelled approximation when no Qwen tokenizer is loaded., source_for_tool()

### Community 57 - "Buy Recommendation For Apple"
Cohesion: 0.15
Nodes (16): Apple, Buy Recommendation for Apple, Balanced Perspective on Apple Investment, Conservative Investment Strategy with Risk Mitigation, Robust Earnings Growth and Market Capitalization, High-Reward, High-Risk Investment Strategy, Innovation Leadership, Market Analysis (+8 more)

### Community 58 - "Test Effort Gate"
Cohesion: 0.21
Nodes (8): _capture_kwargs(), parametrize, unit, Tests for Anthropic effort-parameter gating (#831). Haiku (any version) and…, Forward-compat: new Opus/Sonnet versions don't need a code change., Default is conservative — unknown models don't get effort to avoid 400s., Skipping effort must not break other passthrough kwargs., TestEffortGate

### Community 59 - "Buy Apple Shares Decision"
Cohesion: 0.17
Nodes (15): Apple Inc., Buy Apple Shares Decision, Financial Strength Outweighs Risks, Growth Prospects, High Profitability, Liquidity Risk, Long-Term Growth Horizon, Market Opportunity Decision-Making (+7 more)

### Community 60 - "Provider Default Url"
Cohesion: 0.19
Nodes (8): provider_default_url(), Return the default backend URL for a provider key, or None if unknown., unit, Tests for env-driven CLI behavior (#897, #873). The config-layer override…, TestCliSkipsPromptsFromEnv, TestProviderDefaultUrl, TestReasoningEffortSkippedFromEnv, TestResearchDepthSkippedFromEnv

### Community 61 - "Build Instrument Context"
Cohesion: 0.17
Nodes (7): BuildInstrumentContextTests, GetInstrumentContextFromStateTests, unit, Tests for deterministic instrument-identity resolution (#814) and the context-…, build_instrument_context(), Describe the exact instrument so agents preserve identity and ticker. When…, Resolve ticker identity once and return the full instrument context.…

### Community 62 - "Make Api Request"
Cohesion: 0.24
Nodes (12): AlphaVantageNotConfiguredError, _filter_csv_by_date_range(), get_api_key(), _make_api_request(), Filter CSV data to include only rows within the specified date range. Args:…, Raised when Alpha Vantage is selected but no API key is configured. A…, Retrieve the API key for Alpha Vantage from environment variables., Helper function to make API requests and handle responses. Raises:… (+4 more)

### Community 63 - "Value Error"
Cohesion: 0.18
Nodes (14): get_api_key(), get_macro_data(), FRED (Federal Reserve Economic Data) macro vendor. Fetches macroeconomic time…, GET a FRED endpoint, surfacing FRED's JSON error body on a bad request., Fetch a FRED macroeconomic series as a formatted markdown report. Args:…, Retrieve the FRED API key from the environment., Map a friendly alias to a FRED series ID, or pass a raw ID through. Raises…, _request() (+6 more)

### Community 64 - "Analysis Limits"
Cohesion: 0.16
Nodes (10): analysis_limits(), context_usage(), describe_analysis_error(), format_token_count(), Exception, Describe the model budget exposed to the local interface., Return the exact TradingAgents configuration used by the web runner., Update a copy of the public context diagnostic for one model request. (+2 more)

### Community 65 - "Anthropic Client"
Cohesion: 0.14
Nodes (10): ChatAnthropic, AnthropicClient, NormalizedChatAnthropic, Any, Whether Anthropic accepts the ``effort`` parameter for this model., ChatAnthropic with normalized content output. Claude models with extended…, Client for Anthropic Claude models., Return configured ChatAnthropic instance. (+2 more)

### Community 66 - "Select Model"
Cohesion: 0.16
Nodes (14): _fetch_openrouter_models(), _prompt_custom_model_id(), Fetch available models from the OpenRouter API., Prompt for a required value; exit cleanly if the user cancels.…, Select an OpenRouter model from the newest available, or enter a custom ID.…, Prompt user to type a custom model ID., Select a model for the given provider and mode (quick/deep)., Select shallow thinking llm engine using an interactive selection. (+6 more)

### Community 67 - "Create Llm Client"
Cohesion: 0.27
Nodes (13): Resolve the backend URL with the correct precedence. An explicit env override…, resolve_backend_url(), unit, Generic OpenAI-compatible provider (vLLM / LM Studio / llama.cpp / relays).…, test_any_model_accepted_no_forced_key(), test_base_url_required(), test_env_backend_url_precedence(), test_factory_routes_to_openai_client() (+5 more)

### Community 68 - ".do GET"
Cohesion: 0.26
Nodes (8): BaseHTTPRequestHandler, elapsed(), Handler, historical_report_path(), persist_report_section(), public_job(), Path, report_section_path()

### Community 69 - "Test Alpha Vantage Hardening"
Cohesion: 0.26
Nodes (10): _FakeResponse, _patched_get(), unit, Alpha Vantage request hardening. Regressions for #990 (no request timeout ->…, test_fundamentals_look_ahead_filter_runs_on_json_string(), test_fundamentals_no_curr_date_passes_through(), test_fundamentals_non_json_body_unchanged(), test_invalid_key_not_mislabeled_as_rate_limit() (+2 more)

### Community 70 - "Test Deepseek Reasoning"
Cohesion: 0.21
Nodes (7): unit, Tests for DeepSeekChatOpenAI thinking-mode behaviour. Two pieces verified: 1.…, The general-purpose NormalizedChatOpenAI must not carry DeepSeek-specific…, TestBaseClassIsolation, TestInputToMessages, _input_to_messages(), Normalise a langchain LLM input to a list of message objects. Accepts a list of…

### Community 71 - "Test Structured Output Capability Dispatch"
Cohesion: 0.29
Nodes (6): _bound_kwargs(), Extract bind() kwargs from a with_structured_output result., DeepSeek V4 and reasoner reject the tool_choice parameter (official guide: api-…, Forward-compat: unknown deepseek-v\\d-* IDs inherit V4 quirks., tool_choice is suppressed, but the schema is still bound as a tool — exactly…, TestStructuredOutputCapabilityDispatch

### Community 72 - "Test Ohlcv Cache Freshness"
Cohesion: 0.31
Nodes (12): unit, Same-day OHLCV cache must not serve a stale snapshot all day (#1150). The cache…, End-to-end: the helper is actually wired into load_ohlcv's cache branch.…, test_current_day_cache_past_ttl_is_refreshed(), test_historical_request_always_uses_cache(), test_load_ohlcv_refetches_stale_same_day_cache(), test_load_ohlcv_reuses_fresh_same_day_cache(), test_partial_current_day_bar_is_still_refreshed() (+4 more)

### Community 73 - "Test Structured Agent Prompts"
Cohesion: 0.32
Nodes (12): _capturing_llm(), _prompt_text(), unit, Agents on the schema-only structured-output path must not invite tool calls…, LLM whose structured binding records the prompt it was handed., Flatten a captured prompt (str, message list, or objects) to text., test_constraint_text_is_unambiguous(), test_portfolio_manager_prompt_states_constraint() (+4 more)

### Community 74 - "Stale Guard Unit Tests"
Cohesion: 0.18
Nodes (5): _frame(), unit, StaleGuardPropagationTests, StaleGuardRoutingTests, StaleGuardUnitTests

### Community 75 - "Azure Open Aiclient"
Cohesion: 0.17
Nodes (8): AzureChatOpenAI, AzureOpenAIClient, NormalizedAzureChatOpenAI, Any, AzureChatOpenAI with normalized content output., Client for Azure OpenAI deployments. Requires environment variables:…, Return configured AzureChatOpenAI instance., Azure accepts any deployed model name.

### Community 76 - "Message Buffer"
Cohesion: 0.20
Nodes (3): MessageBuffer, Initialize agent status and report sections based on selected analysts. Args:…, Count reports that are finalized (their finalizing agent is completed). A…

### Community 77 - "Bearish Researcher"
Cohesion: 0.24
Nodes (11): AI-powered Smart-home Growth Potential, Apple Inc., Apple Investment Outlook, Apple Investment Risks, Bearish Researcher, Bullish-Bearish Investment Research Diagram, Bullish Researcher, Geopolitical, Valuation, and Liquidity Risks (+3 more)

### Community 78 - "Normalize Ticker Symbol"
Cohesion: 0.20
Nodes (7): get_ticker(), normalize_ticker_symbol(), Prompt the user to enter a ticker symbol, preserving exchange suffixes. Uses…, Resolve user input to its canonical Yahoo symbol (single source of truth).…, test_cli_normalize_delegates_to_data_layer(), unit, TickerSymbolHandlingTests

### Community 79 - "Test Bedrock Provider"
Cohesion: 0.31
Nodes (10): _capture_kwargs(), unit, Amazon Bedrock — first-class native client via the optional langchain-aws…, Stub _bedrock_class so the constructor kwargs are testable without the optional…, test_bearer_token_passed_as_api_key(), test_bedrock_any_model_and_no_key_env(), test_construction_when_extra_installed(), test_factory_routes_bedrock() (+2 more)

### Community 80 - ". Fetch Returns"
Cohesion: 0.18
Nodes (6): _price_df(), Only 1 data point available → returns (None, None, None), no crash., Empty DataFrame → returns (None, None, None), no crash., SPY having fewer rows than the stock must not raise IndexError., Minimal DataFrame matching yfinance .history() output shape., Fetch raw and alpha return for ticker over holding_days from trade_date.…

### Community 81 - "Test Legacy Removal"
Cohesion: 0.18
Nodes (6): FinancialSituationMemory must not be importable from the memory module., rank_bm25 must not be present in the memory module namespace., TradingAgentsGraph must not expose reflect_and_remember., create_portfolio_manager accepts only llm; passing memory= raises TypeError., propagate() completes and stores the decision after the redesign., TestLegacyRemoval

### Community 82 - "Alpha Vantage Fundamentals"
Cohesion: 0.24
Nodes (10): _filter_reports_by_date(), get_balance_sheet(), get_cashflow(), get_fundamentals(), get_income_statement(), Retrieve comprehensive fundamental data for a given ticker symbol using Alpha…, Retrieve balance sheet data for a given ticker symbol using Alpha Vantage., Retrieve cash flow statement data for a given ticker symbol using Alpha Vantage. (+2 more)

### Community 83 - "Build Run Config"
Cohesion: 0.29
Nodes (9): _build_run_config(), Assemble the run config from interactive selections, honoring env precedence.…, parametrize, CLI config precedence (#976, #977). An explicit environment override for the…, test_checkpoint_flag_overrides_env(), test_checkpoint_none_preserves_env_default(), test_env_round_counts_win_over_selection(), test_partial_env_only_overrides_that_count() (+1 more)

### Community 84 - "Resolve Instrument Identity"
Cohesion: 0.38
Nodes (4): patch, ResolveInstrumentIdentityTests, Resolve deterministic identity metadata (company name, sector, …) for a ticker.…, resolve_instrument_identity()

### Community 85 - "Trader"
Cohesion: 0.29
Nodes (8): T, Trader: turns the Research Manager's investment plan into a concrete…, bind_structured(), invoke_structured_or_freetext(), Any, Shared helpers for invoking an agent with structured output and a graceful…, Return ``llm.with_structured_output(schema)`` or ``None`` if unsupported. Logs…, Run the structured call and render to markdown; fall back to free-text on any…

### Community 86 - "Test Stocktwits Resilience"
Cohesion: 0.27
Nodes (6): parametrize, unit, _raise(), StockTwits fetch: transport-error resilience (#1024) and crypto symbol mapping…, TestStockTwitsCryptoSymbols, TestStockTwitsResilience

### Community 87 - "Alpha Vantage"
Cohesion: 0.31
Nodes (8): format_datetime_for_api(), Convert various date formats to YYYYMMDDTHHMM format required by Alpha Vantage…, get_global_news(), get_insider_transactions(), get_news(), Returns global market news & sentiment data without ticker-specific filtering.…, Returns live and historical market news & sentiment data from premier news…, Returns latest and historical insider transactions by key stakeholders. Covers…

### Community 88 - "Polymarket"
Cohesion: 0.31
Nodes (9): get_prediction_markets(), _is_forward_looking(), _parse_json_list(), datetime, Polymarket prediction-market vendor. Surfaces live, market-implied…, Gamma encodes ``outcomes``/``outcomePrices`` as JSON-string arrays., Keep only open markets that resolve in the future. ``closed`` is the reliable…, Return live prediction-market probabilities for an event topic. Args: topic:… (+1 more)

### Community 89 - "Seed Completed"
Cohesion: 0.22
Nodes (4): Only the n_same most recent same-ticker entries are included., Only the n_cross most recent cross-ticker entries are included., Write a completed entry directly to file, bypassing the API., _seed_completed()

### Community 90 - "Dummy Llmclient"
Cohesion: 0.28
Nodes (3): DummyLLMClient, ModelValidationTests, unit

### Community 91 - "Test Openai Reasoning Effort"
Cohesion: 0.31
Nodes (8): _effort_on(), parametrize, OpenAI ``reasoning_effort`` is gated to reasoning models. Non-reasoning OpenAI…, test_non_reasoning_model_drops_effort(), test_reasoning_model_receives_effort(), test_supports_reasoning_effort(), Whether the (native OpenAI) model accepts ``reasoning_effort``., _supports_reasoning_effort()

### Community 92 - "Trading Agents CLI"
Cohesion: 0.25
Nodes (8): TradingAgents CLI Initialization Screen, cli.main Module, Multi-Agents LLM Financial Trading Framework, SPY Default Ticker, Tauric Research, Ticker Symbol Input, Trading Workflow, TradingAgents CLI

### Community 93 - "Conftest"
Cohesion: 0.32
Nodes (6): _dummy_api_keys(), _isolate_config(), mock_llm_client(), fixture, Shared pytest fixtures that prevent CI hangs when API keys are absent., Reset the global dataflows config before and after each test. ``set_config``…

### Community 94 - "Test Load Ohlcv No Poison"
Cohesion: 0.25
Nodes (3): unit, TestLoadOhlcvNoPoison, TestRouteToVendorSentinel

### Community 95 - "Normalized Chat Google Generative AI"
Cohesion: 0.29
Nodes (5): ChatGoogleGenerativeAI, NormalizedChatGoogleGenerativeAI, Any, ChatGoogleGenerativeAI with normalized content output. Gemini 3 models return…, Return configured ChatGoogleGenerativeAI instance.

### Community 96 - "Display Announcements"
Cohesion: 0.29
Nodes (5): display_announcements(), fetch_announcements(), Fetch announcements from endpoint. Returns dict with announcements and settings., Display announcements panel. Prompts for Enter if require_attention is True., Console

### Community 97 - "Smoke Structured Output"
Cohesion: 0.48
Nodes (6): main(), _make_pm_state(), _make_rm_state(), _make_trader_state(), _print_section(), End-to-end smoke for structured-output agents against a real LLM provider. Runs…

### Community 100 - ". Resolve Pending Entries"
Cohesion: 0.33
Nodes (3): Pending AAPL entry is not resolved when the run is for NVDA., After resolve, get_pending_entries() is empty and the entry has a REFLECTION., Resolve pending log entries for ticker at the start of a new run. Fetches…

### Community 101 - ".warn If Unknown Model"
Cohesion: 0.33
Nodes (3): Return the provider name used in warning messages., Warn when the model is outside the known list for the provider., Validate that the model is supported by this client.

### Community 102 - "Research Team"
Cohesion: 0.40
Nodes (5): Analyst Team, Portfolio Management, Research Team, Risk Management, Trader

### Community 103 - "Tauric Research Brand"
Cohesion: 0.60
Nodes (5): Bull Motif, Dot-Matrix Bull Emblem, Tauric Research Brand, Tauric Research Logo, Tauric Research Wordmark

### Community 105 - ". Init"
Cohesion: 0.40
Nodes (3): Any, Initialize the reflector with an LLM., Concise prompt for reflect_on_final_decision (Phase B log entries). Produces…

### Community 107 - "Select Llm Provider"
Cohesion: 0.50
Nodes (4): _llm_provider_table(), (display_name, provider_key, base_url) for every supported provider. Shared by…, Select the LLM provider and its API endpoint., select_llm_provider()

### Community 108 - ". Init"
Cohesion: 0.50
Nodes (3): Any, ToolNode, Initialize with required components.

## Ambiguous Edges - Review These
- `Trader` → `OpenAI o1 Deep Thinking`  [AMBIGUOUS]
  assets/schema.png · relation: conceptually_related_to

## Knowledge Gaps
- **100 isolated node(s):** `tradingagents`, `AnalystNodeSpec`, `name`, `private`, `version` (+95 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Trader` and `OpenAI o1 Deep Thinking`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `create_llm_client()` connect `Create Llm Client` to `Smoke Structured Output`, `Anthropic Client`, `Open Aiclient`, `Trading Agents Graph`, `Azure Open Aiclient`, `Google Client`, `Base Llmclient`, `Test Bedrock Provider`, `Openai Client`, `Test Provider Kwargs Temperature`, `Value Error`?**
  _High betweenness centrality (0.156) - this node is a cross-community bridge._
- **Why does `TradingAgentsGraph` connect `Trading Agents Graph` to `Trading Memory Log`, `Test Checkpoint Resume`, `. Resolve Pending Entries`, `Test Memory Log`, `Parse Rating`, `Test Llm Max Retries`, `. Fetch Returns`, `Test Legacy Removal`, `Reliability Tests`, `Test Deferred Reflection`, `Test Reporting`, `Conditional Logic`, `Test Provider Kwargs Temperature`, `Propagator`, `Server`, `Main`, `Build Instrument Context`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Why does `normalize_symbol()` connect `Normalize Symbol` to `Stockstats Utils`, `Interface`, `Trading Agents Graph`, `Normalize Ticker Symbol`, `Agent Utils`, `. Fetch Returns`, `Resolve Instrument Identity`, `Utils`, `Yfinance News`?**
  _High betweenness centrality (0.088) - this node is a cross-community bridge._
- **Are the 16 inferred relationships involving `TradingAgentsGraph` (e.g. with `TestCheckpointSignature` and `_bare_graph()`) actually correct?**
  _`TradingAgentsGraph` has 16 INFERRED edges - model-reasoned connections that need verification._
- **What connects `tradingagents`, `AnalystNodeSpec`, `name` to the rest of the system?**
  _100 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Test Reddit Fallback` be split into smaller, more focused modules?**
  _Cohesion score 0.0573025856044724 - nodes in this community are weakly interconnected._