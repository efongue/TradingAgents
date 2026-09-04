# TradingAgents Test Infrastructure & Theme Harmonization Specification

## 1. Test Philosophy & Core Principles

The TradingAgents Test Suite is designed with an **opaque-box, requirement-driven, and multi-tier verification methodology**. Testing focuses on observable behavior, interface contracts, DOM mutations, computed styles, and accessibility standards without coupling to internal component implementations.

### 1.1 Opaque-Box & Requirement-Driven Testing
- Tests evaluate the system against explicit requirements defined in `ORIGINAL_REQUEST.md` and interface contracts in `PROJECT.md`.
- No mock facades or trivial passing assertions: every test performs real computations (AST analysis, relative luminance calculation, DOM queries, or live headless browser evaluations).

### 1.2 WCAG 2.1 Level AA Accessibility Standards
- All text and interactive elements must satisfy WCAG 2.1 Level AA contrast requirements:
  - **Normal Text (< 18pt or < 14pt bold)**: Minimum contrast ratio of **4.5:1**.
  - **Large Text / Headings (>= 18pt or >= 14pt bold)**: Minimum contrast ratio of **3.0:1**.
  - **UI Components & Graphical Objects**: Minimum contrast ratio of **3.0:1**.
- The test suite implements the W3C relative luminance formula:
  $$L = 0.2126 \times R + 0.7152 \times G + 0.0722 \times B$$
  $$\text{Contrast Ratio} = \frac{L_1 + 0.05}{L_2 + 0.05} \quad (\text{where } L_1 \ge L_2)$$

### 1.3 Zero Hardcoded Color Leakage in Light Mode
- The system prohibits un-themed dark background colors (e.g., `#060a0f`, `#05080e`, `#080d14`, `#090e15`, `#030508`, `rgba(0,0,0,...)`) in light mode rules.
- All containers, inputs, tables, cards, and text must resolve to semantic CSS custom properties (`--bg`, `--surface`, `--surface-2`, `--surface-3`, `--text`, `--text-secondary`, `--muted`, `--line`, `--signal-*`).

### 1.4 Instantaneous Theme Switching & Persistence
- Theme state toggles between `"light"` and `"dark"` via root attribute `document.documentElement.setAttribute("data-theme", theme)` and updates `document.documentElement.style.colorScheme`.
- Theme selection is persisted in `localStorage` under `"tradingagents_theme"` and faithfully restored upon page reload or initial mount.

---

## 2. Multi-Tier Test Architecture

```
+-----------------------------------------------------------------------------------+
|                        TradingAgents 4-Tier Test Suite                            |
+-----------------------------------------------------------------------------------+
| Tier 1: Static Token & Variable Contract Verification                             |
|   - AST analysis of styles.css & scanner.css                                      |
|   - Completeness of :root and [data-theme="light"] tokens                         |
|   - Absence of hardcoded dark colors in light mode component selectors            |
+-----------------------------------------------------------------------------------+
| Tier 2: Mathematical WCAG AA Color Contrast Engine                                |
|   - Relative luminance calculation across all light & dark token pairs            |
|   - Verification of body text, secondary text, muted text, headers, and borders   |
|   - Financial signal ink validation (bullish #065f46, neutral #92400e, bearish)   |
+-----------------------------------------------------------------------------------+
| Tier 3: Component & State Logic Verification                                      |
|   - Theme state toggle & localStorage sync                                        |
|   - DecisionBadge tone & tier CSS class resolution                                |
|   - Sparkline stroke & fill contrast tokens                                       |
|   - Sidebar & SettingsPage theme toggle button synchronicity                      |
+-----------------------------------------------------------------------------------+
| Tier 4: E2E Browser & Multi-View Rendering (Puppeteer)                            |
|   - Live mounting of all 8 application views in both Light and Dark modes         |
|   - Computed style inspection: body background (>200 light / <30 dark)            |
|   - Form inputs, cards, headings, and tables contrast checks                      |
|   - Zero runtime console errors across all view transitions                       |
+-----------------------------------------------------------------------------------+
```

---

## 3. Test Runner Commands

### 3.1 JavaScript Frontend Test Suite
Run the full Node.js test runner suite (includes JSX integrity, decision utils, formatting, routing, and theme harmonization):
```bash
cd web_ui && npm test
```

Run only the Theme Harmonization & Contrast test suite:
```bash
cd web_ui && node --test tests/themeHarmonization.test.js
```

### 3.2 Python Backend Test Suite
Run the Python pytest suite (31 tests covering screener, reliability, server routes):
```bash
./.venv/bin/pytest web_ui/tests
```

### 3.3 Production Vite Build Verification
Verify clean build compilation with 0 errors:
```bash
cd web_ui && npm run build
```

---

## 4. Feature Coverage Mapping Matrix (22 Features)

| # | Feature / View | Milestone | Scope / Target File | Test File & Tier | Verified Acceptance Criteria |
|---|----------------|-----------|---------------------|------------------|------------------------------|
| 1 | CSS Token Foundation & Typography | M1 | `styles.css` (`:root`, `[data-theme="light"]`) | `themeHarmonization.test.js` (T1, T2) | All background, surface, text, line, and gradient tokens defined and compliant |
| 2 | Brand Logo & Page Headings | M1 | `.brand`, `.page-heading h1`, `LogoMark.jsx` | `themeHarmonization.test.js` (T1, T4) | Gradient text and titles visible with high contrast (> 4.5:1) in both modes |
| 3 | Navigation & Sidebar | M1 | `Sidebar.jsx`, `.sidebar`, `.nav-item` | `themeHarmonization.test.js` (T3, T4) | Sidebar surfaces `#ffffff` in light mode, active nav highlights, zero dark bleed |
| 4 | Shared Controls, Popovers & Modals | M1 | `PipelineGuidePopover.jsx`, `GlobalDisclaimerPopup.jsx` | `themeHarmonization.test.js` (T1, T4) | Floating popovers and modal surfaces adapt cleanly without unreadable text |
| 5 | Shared Badges & Sparklines | M1 | `DecisionBadge.jsx`, `Sparkline.jsx` | `themeHarmonization.test.js` (T2, T3) | High contrast text inks (`--signal-*-text`) in light mode meeting WCAG AA |
| 6 | Scanner Layout & Containers | M2 | `scanner.css`, `ScannerPage.jsx` | `themeHarmonization.test.js` (T1, T4) | `.scanner-progress-panel`, `.scanner-table-panel` on clean light surface |
| 7 | Scanner Inputs & Actions | M2 | `ScannerPage.jsx`, `.scanner-symbols-field` | `themeHarmonization.test.js` (T1, T4) | Textarea and inputs have `#ffffff` background and dark text `#0f172a` |
| 8 | Scanner Table & Progress | M2 | `.scanner-table`, `.scanner-progress-track` | `themeHarmonization.test.js` (T2, T4) | Table row hover, score badges, status pills, and progress bars legible |
| 9 | Analysis Launcher & Autocomplete | M3 | `AnalysisPage.jsx`, `StockSearchInput.jsx` | `themeHarmonization.test.js` (T1, T4) | Autocomplete dropdown and ticker input fully themed for light mode |
| 10 | Analysis Form & Analyst Cards | M3 | `AnalysisForm.jsx`, `.analyst-toggle` | `themeHarmonization.test.js` (T1, T4) | Analyst selection chips and depth radios properly contrasted |
| 11 | Workflow & Reliability Panels | M3 | `Workflow.jsx`, `.workflow-panel` | `themeHarmonization.test.js` (T1, T4) | Multi-agent execution steps, logs, and token badges rendered with high contrast |
| 12 | Decision Hero Banners | M4 | `DecisionHero.jsx`, `.decision-hero` | `themeHarmonization.test.js` (T1, T4) | Tone tiers (strong, moderate, strategic) maintain legible typography on light mode |
| 13 | Financial Bento Grid | M4 | `FinancialBento.jsx`, `.bento-cell` | `themeHarmonization.test.js` (T1, T4) | All bento cells render `#ffffff` card surfaces with soft slate borders |
| 14 | Execution Levels & Calculator | M4 | `ExecutionLevelsCard.jsx` | `themeHarmonization.test.js` (T1, T4) | Entry, Stop, Target, Risk/Reward metrics and order ticket dropdowns readable |
| 15 | Action Plan Panel | M4 | `ActionPlanPanel.jsx` | `themeHarmonization.test.js` (T1, T4) | Trade order execution boxes and allocation metrics have high contrast |
| 16 | Agent Polarity Board | M4 | `AgentPolarityBoard.jsx` | `themeHarmonization.test.js` (T1, T4) | Bullish/Bearish columns and quote cards properly balanced in light mode |
| 17 | Multi-Asset Comparator | M5 | `ComparePage.jsx`, `.compare-card` | `themeHarmonization.test.js` (T1, T4) | Side-by-side asset comparison cards and thesis containers clearly styled |
| 18 | Watchlist Grid & Pro Table | M5 | `WatchlistPage.jsx`, `.watchlist-card` | `themeHarmonization.test.js` (T1, T4) | KPI boxes, table rows, and alert indicators styled for light mode |
| 19 | Portfolio Simulator & Performance | M5 | `PerformancePage.jsx`, `.sim-kpi-box` | `themeHarmonization.test.js` (T1, T4) | Capital inputs, simulator overview cards, and trade audit rows harmonized |
| 20 | History & Version Timeline | M5 | `HistoryPage.jsx`, `.history-table-panel` | `themeHarmonization.test.js` (T1, T4) | Multi-run tickers, date formatters, and report selection drawers legible |
| 21 | Settings Page & AI Models | M5 | `SettingsPage.jsx`, `.settings-panel` | `themeHarmonization.test.js` (T3, T4) | Theme switcher buttons, LLM status strips, and audio toggles visible |
| 22 | E2E Regression & Contrast Test Suite | M6 | Full Suite (`web_ui/tests/`) | `themeHarmonization.test.js` (T1-T5) | 100% automated test execution passing across all views and tokens |
