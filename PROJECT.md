# Project: TradingAgents Light & Dark Theme Harmonization

## Architecture
TradingAgents is a React + Vite frontend (`web_ui`) powered by a Python backend.
Theme switching is managed in `src/App.jsx` by toggling `document.documentElement.setAttribute("data-theme", theme)` ("light" | "dark") and persisting preference in `localStorage.getItem("tradingagents_theme")`.

### Styling & Token Hierarchy
1. **Design Tokens (`web_ui/src/styles.css`)**:
   - `:root`: Defines default dark mode theme tokens (`--bg`, `--surface`, `--surface-2`, `--surface-3`, `--text`, `--text-secondary`, `--muted`, `--line`, `--line-soft`, `--font-mono`, `--heading-gradient`, `--brand-gradient`, `--shadow-card`, etc.).
   - `[data-theme="light"]`: Overrides variables with clean, high-contrast light mode values (Linear/Stripe aesthetic: crisp white surfaces `#ffffff`, subtle slate borders, dark slate text `#0f172a`, and WCAG AA compliant signal inks).
2. **Scanner Stylesheet (`web_ui/src/scanner.css`)**:
   - Dedicated styling for `ScannerPage.jsx`, fully refactored to consume semantic CSS custom properties with light theme support.
3. **Component Scoped Styles (`web_ui/src/styles.css`)**:
   - Organized by views and components, refactored to eliminate hardcoded dark colors (`#060a0f`, `#05080e`, `#080d14`, `#090e15`, `rgba(0,0,0,...)`) and ensure high specificity light theme overrides for composite classes.

## Code Layout
- `web_ui/src/styles.css`: Global design tokens, layout, navigation, shared UI components, and views 2-8 styles.
- `web_ui/src/scanner.css`: Market Scanner view styles.
- `web_ui/src/App.jsx`: Root component, theme state, and data-theme attribution.
- `web_ui/src/components/layout/Sidebar.jsx`: Main navigation sidebar, brand logo, and theme switcher.
- `web_ui/src/components/layout/Topbar.jsx`: Mobile header with brand logo.
- `web_ui/src/components/layout/PipelineGuidePopover.jsx`: Methodology guide popover modal.
- `web_ui/src/components/layout/GlobalDisclaimerPopup.jsx`: Global disclaimer floating banner.
- `web_ui/src/components/ui/ExportDropdown.jsx`: Export & share dropdown menu.
- `web_ui/src/StockSearchInput.jsx`: Autocomplete ticker search and dropdown.
- `web_ui/src/ScannerPage.jsx`: Scanner view component.
- `web_ui/src/AnalysisPage.jsx`: Analysis launcher and workflow view.
- `web_ui/src/AnalysisForm.jsx`: Analysis parameters form and analyst cards.
- `web_ui/src/Workflow.jsx`: Multi-agent pipeline status and progress.
- `web_ui/src/ResultPage.jsx`: Analysis result view.
- `web_ui/src/DecisionHero.jsx`: Main decision banner.
- `web_ui/src/FinancialBento.jsx`: Bento grid financial analysis cards.
- `web_ui/src/ActionPlanPanel.jsx`: Action plan and order execution cards.
- `web_ui/src/ExecutionLevelsCard.jsx`: Trade framing and position size calculator.
- `web_ui/src/AgentPolarityBoard.jsx`: Agent polarity columns and cards.
- `web_ui/src/ComparePage.jsx`: Multi-asset comparator view.
- `web_ui/src/WatchlistPage.jsx`: Watchlist and KPI table/grid view.
- `web_ui/src/PerformancePage.jsx`: Portfolio simulator and trade audit view.
- `web_ui/src/pages/HistoryPage.jsx`: Historical analyses and version timeline drawer.
- `web_ui/src/pages/SettingsPage.jsx`: Settings, LLM configuration, and theme toggles.
- `web_ui/src/DecisionBadge.jsx`: Multi-tier decision pill badges.
- `web_ui/src/Sparkline.jsx`: Trend micro-charts.
- `web_ui/tests/`: Vitest / Node test runner suite.

## Feature Inventory
| # | Feature / View | Description | Milestone | Source |
|---|----------------|-------------|-----------|--------|
| 1 | CSS Token Foundation & Typography | Define `--font-mono`, `--text-main`, `--heading-gradient`, `--brand-gradient`, `--surface-card`, `--surface-input`, `--scrollbar-*` in `:root` and `[data-theme="light"]` | M1 | survey |
| 2 | Brand Logo & Page Headings | Fix `.brand` and `.page-heading h1` invisible gradient text in light mode | M1 | survey |
| 3 | Navigation & Sidebar | Harmonize `.sidebar`, `.sidebar-footer`, `.mobile-topbar`, and navigation active/hover states | M1 | survey |
| 4 | Shared Controls, Popovers & Modals | Refactor `.pipeline-guide-popover`, `.disclaimer-floating-popup`, `.export-dropdown-menu`, `.launcher-autocomplete-dropdown`, tooltips, scrollbars | M1 | survey |
| 5 | Shared Badges & Sparklines | Adapt `.decision-pill-badge.positive/.negative/.neutral` tiers and `.sparkline-badge` with dark semantic inks in light mode | M1 | survey |
| 6 | Scanner Layout & Containers | Refactor `.scanner-form`, `.scanner-progress-panel`, `.scanner-results-panel`, `.scanner-empty-state` to use semantic variables | M2 | survey |
| 7 | Scanner Inputs & Actions | Adapt `.scanner-symbols-field textarea`, `.scanner-report-button`, `.scanner-parallel-tab`, `.tab-tokens-badge` | M2 | survey |
| 8 | Scanner Table & Progress | Fix contrast in `.scanner-table td`, `.scanner-progress-grid`, `.scanner-progress-track`, `.scanner-active-analysis`, `.scanner-disclaimer` | M2 | survey |
| 9 | Analysis Launcher & Autocomplete | Harmonize `.analysis-launcher-card`, `.launcher-input-group input`, `.stock-search-input-group input`, `.launcher-autocomplete-dropdown` | M3 | survey |
| 10 | Analysis Form & Analyst Cards | Harmonize `.analysis-form`, `.field input/select`, `.analyst-toggle`, `.advanced-toggle-button`, validation warnings | M3 | survey |
| 11 | Workflow & Reliability Panels | Harmonize `.workflow-panel`, `.reliability-panel`, `.stage-node`, `.stage-audit-card`, `.data-substep-copy` | M3 | survey |
| 12 | Decision Hero Banners | Fix `.decision-hero.tone-*.tier-*` specificity override in light mode and ensure high-contrast typography | M4 | survey |
| 13 | Financial Bento Grid | Refactor `.financial-bento`, `.bento-card`, `.bento-thesis-hero`, `.bento-quality`, `.bento-range`, `.bento-market`, `.bento-fundamentals`, `.bento-news`, `.bento-debate`, `.bento-risk` | M4 | survey |
| 14 | Execution Levels & Calculator | Harmonize `.execution-levels-card`, `.execution-metric-box`, `.order-ticket-dropdown-menu`, `.calc-number-input`, `.calc-result-card` | M4 | survey |
| 15 | Action Plan Panel | Fix `.action-plan-hero-card`, `.action-plan-hero-left h2`, `.action-profile-badge`, `.action-steps-list`, `.action-order-box`, `.order-val` | M4 | survey |
| 16 | Agent Polarity Board | Harmonize `.polarity-column`, `.polarity-card`, column headers in light mode | M4 | survey |
| 17 | Multi-Asset Comparator | Refactor `.compare-selector-panel`, `.compare-input-form input`, `.compare-card.positive/.neutral/.negative`, `.compare-thesis-box`, `.compare-risk-box` | M5 | survey |
| 18 | Watchlist Grid & Pro Table | Harmonize `.watchlist-kpi-box`, `.watchlist-controls-panel`, `.watchlist-input-wrapper input`, `.view-toggle-group`, `.watchlist-table-panel`, `.watchlist-table td`, `.watchlist-card` | M5 | survey |
| 19 | Portfolio Simulator & Performance | Harmonize `.portfolio-simulator-panel`, `.simulator-title-group h2`, `.capital-input-wrap`, `.sim-kpi-box`, `.performance-toolbar`, `.performance-table-panel`, `.performance-table-row` | M5 | survey |
| 20 | History & Version Timeline | Harmonize `.history-kpi-box`, `.history-toolbar`, `.history-table-panel`, `.history-table-row`, `.history-group-subrows`, `.history-evolution-banner`, `.version-timeline-card` | M5 | survey |
| 21 | Settings Page & AI Models | Harmonize `.settings-panel`, `.setting-row`, `.model-list-panel`, `.connection-strip`, `.model-row` in light mode | M5 | survey |
| 22 | E2E Regression & Contrast Test Suite | Automated verification across Tiers 1-4 of light/dark contrast, theme switching, component rendering, 34 JS tests, 31 Python tests, Vite build | M6 | survey |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | M1: Global Theme Foundation & Shared Components | CSS custom properties, `--brand-gradient`, `--heading-gradient`, `--font-mono`, `--text-main`, `.brand`, `.page-heading h1`, `.sidebar`, `.sidebar-footer`, `.mobile-topbar`, popovers, modals, dropdowns, scrollbars, decision badges, sparklines | none | DONE |
| 2 | M2: Scanner Page Harmonization | Complete refactor of `web_ui/src/scanner.css` and `ScannerPage.jsx` light/dark theme support | M1 | DONE |
| 3 | M3: Analysis Launcher & Workflow Views | `AnalysisPage.jsx`, `AnalysisForm.jsx`, `StockSearchInput.jsx`, `Workflow.jsx` and related styles in `styles.css` | M1 | DONE |
| 4 | M4: Results, Bento & Action Plan | `ResultPage.jsx`, `DecisionHero.jsx`, `FinancialBento.jsx`, `ActionPlanPanel.jsx`, `ExecutionLevelsCard.jsx`, `AgentPolarityBoard.jsx` | M1 | IN_PROGRESS |
| 5 | M5: Auxiliary Views (Compare, Watchlist, Perf, History, Settings) | `ComparePage.jsx`, `WatchlistPage.jsx`, `PerformancePage.jsx`, `HistoryPage.jsx`, `SettingsPage.jsx` | M1 | PLANNED |
| 6 | M6: E2E Testing Track & Final Verification | E2E test suite (Tiers 1-4), adversarial hardening (Tier 5), 100% tests passing (46 JS, 31 Python), 0 build errors | M1, M2, M3, M4, M5 | PLANNED |

## Interface Contracts
### CSS Custom Property Contract
- Backgrounds:
  - `--bg`: base page background (`#05080e` dark / `#f8fafc` light)
  - `--bg-deep`: deep background (`#030508` dark / `#f1f5f9` light)
  - `--surface`: primary card background (`#090e15` dark / `#ffffff` light)
  - `--surface-2`: elevated card background (`#0d1520` dark / `#f8fafc` light)
  - `--surface-3`: modal / active element background (`#121e2d` dark / `#f1f5f9` light)
  - `--surface-glass`: translucent backdrop (`rgba(9, 14, 21, 0.75)` dark / `rgba(255, 255, 255, 0.85)` light)
  - `--surface-input`: input background (`#060a0f` dark / `#ffffff` light)
- Lines & Highlights:
  - `--line`: standard border (`rgba(255, 255, 255, 0.085)` dark / `rgba(15, 23, 42, 0.09)` light)
  - `--line-soft`: soft border (`rgba(255, 255, 255, 0.045)` dark / `rgba(15, 23, 42, 0.05)` light)
  - `--inner-highlight`: card top bevel highlight (`inset 0 1px 0 rgba(255, 255, 255, 0.07)` dark / `inset 0 1px 0 rgba(255, 255, 255, 0.9)` light)
- Typography:
  - `--text`: primary text (`#f8fafc` dark / `#0f172a` light)
  - `--text-secondary`: secondary text (`#cbd5e1` dark / `#334155` light)
  - `--muted`: muted text (`#94a3b8` dark / `#64748b` light)
  - `--text-main`: alias for `--text`
  - `--font-mono`: monospace font stack (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`)
  - `--heading-gradient`: title gradient (`linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)` dark / `linear-gradient(180deg, #0f172a 0%, #334155 100%)` light)
  - `--brand-gradient`: brand gradient (`linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)` dark / `linear-gradient(180deg, #0f172a 0%, #0d9488 100%)` light)
- Financial Signals (WCAG AA Compliance):
  - `--signal-bullish`: `#10b981` dark / `#059669` light
  - `--signal-bullish-text`: `#6ee7b7` dark / `#065f46` light (contrasting ink)
  - `--signal-bullish-bg`: `rgba(16, 185, 129, 0.14)` dark / `rgba(5, 150, 105, 0.12)` light
  - `--signal-neutral`: `#f59e0b` dark / `#d97706` light
  - `--signal-neutral-text`: `#fde047` dark / `#92400e` light (contrasting ink)
  - `--signal-neutral-bg`: `rgba(245, 158, 11, 0.14)` dark / `rgba(217, 119, 6, 0.12)` light
  - `--signal-bearish`: `#ef4444` dark / `#dc2626` light
  - `--signal-bearish-text`: `#fca5a5` dark / `#991b1b` light (contrasting ink)
  - `--signal-bearish-bg`: `rgba(239, 68, 68, 0.15)` dark / `rgba(220, 38, 38, 0.12)` light

### Acceptance Verification Rules
1. Zero hardcoded dark backgrounds in light mode.
2. Minimum contrast ratio 4.5:1 (WCAG AA) for all body text, headings, badges, table cells, and form inputs.
3. 46 JavaScript tests in `web_ui` pass 100%.
4. 31 Python tests in `web_ui/tests` pass 100%.
5. Vite build compiles with 0 errors.
