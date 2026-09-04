# Milestone 3 Exploration Report: Analysis Launcher & Autocomplete

## 1. Observation

### 1.1 File Locations and Component Hierarchy
- **Analysis Page**: `web_ui/src/pages/AnalysisPage.jsx` renders `AnalysisForm` (`web_ui/src/components/analysis/AnalysisForm.jsx`) and optionally `Workflow` (`web_ui/src/Workflow.jsx`) and `ReliabilityRail` (`web_ui/src/components/analysis/ReliabilityRail.jsx`).
- **Stock Search & Autocomplete**: `web_ui/src/StockSearchInput.jsx` is consumed by `AnalysisForm.jsx` (class `launcher-search-wrapper`), `ComparePage.jsx` (class `compare-search-wrapper`), and `WatchlistPage.jsx` (class `watchlist-search-wrapper`).
- **Analyst Toggles**: `web_ui/src/components/analysis/AnalystToggle.jsx` renders individual analyst toggle cards.
- **Styles**: `web_ui/src/styles.css` contains all design tokens, light theme overrides (lines 75-480), launcher & form styles (lines 987-1460), workflow & reliability styles (lines 1499-1750), and quick presets & skeleton preview styles (lines 2141-2220).

### 1.2 Identified Defects and Missing Light Theme Styles

#### A. Analysis Launcher Card (`.analysis-launcher-card`)
- **Location**: `web_ui/src/styles.css:987-996`
- **Observed Dark Style**:
  ```css
  .analysis-launcher-card {
    border: 1px solid var(--line);
    border-radius: var(--radius-md);
    padding: 24px;
    background: rgba(9, 14, 21, 0.85);
    -webkit-backdrop-filter: blur(16px);
    backdrop-filter: blur(16px);
    box-shadow: var(--inner-highlight), 0 12px 36px rgba(0, 0, 0, 0.35);
    margin-bottom: 24px;
  }
  ```
- **Observed Defect**: `.analysis-launcher-card` is completely absent from `[data-theme="light"]` selectors (lines 144-165). In Light mode, it renders as a dark translucent box (`rgba(9, 14, 21, 0.85)`), creating a severe residual dark container defect on the Day mode page.

#### B. Search Input Specificity & Inset Dark Shadow
- **Location**: `web_ui/src/styles.css:1214-1225` and `web_ui/src/styles.css:167-176`
- **Observed Rules**:
  ```css
  /* styles.css:172 */
  [data-theme="light"] .stock-search-input-group input {
    background: #ffffff;
    border-color: rgba(15, 23, 42, 0.14);
    color: #0f172a;
  }
  /* styles.css:1214 */
  .launcher-search-wrapper .stock-search-input-group input {
    height: 52px;
    padding: 0 16px 0 46px;
    font-family: var(--font-heading);
    font-size: 17px;
    font-weight: 650;
    letter-spacing: 0.04em;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
  }
  .launcher-search-wrapper .stock-search-input-group input:focus {
    box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.2), inset 0 2px 4px rgba(0, 0, 0, 0.5);
  }
  ```
- **Observed Defect**: `.launcher-search-wrapper .stock-search-input-group input` has higher specificity (0,3,1) than `[data-theme="light"] .stock-search-input-group input` (0,2,1). As a result, the input in Day mode inherits the dark inset shadow `box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5)` and neon focus ring `rgba(45, 212, 191, 0.2)` instead of crisp Linear/Stripe styling.

#### C. Primary Action Button Disabled State (`.primary-button:disabled`)
- **Location**: `web_ui/src/styles.css:1418-1425`
- **Observed Style**:
  ```css
  .primary-button:disabled {
    border-color: #334155;
    background: #1e293b;
    color: var(--muted);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  ```
- **Observed Defect**: When disabled (input empty or job submitting), the button renders as a dark `#1e293b` container in Light mode. With `var(--muted)` (`#64748b` in light mode), the text contrast ratio on `#1e293b` is only **2.94:1** (fails WCAG AA 4.5:1).

#### D. Advanced Options Toggle Button (`.advanced-toggle-button`)
- **Location**: `web_ui/src/styles.css:1270-1288`
- **Observed Style**:
  ```css
  .advanced-toggle-button {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    border: 1px solid var(--line);
    border-radius: var(--radius-pill);
    padding: 6px 14px;
    background: rgba(255, 255, 255, 0.025);
    color: #94a3b8;
    font-size: 12px;
    font-weight: 550;
    cursor: pointer;
    transition: all 150ms ease;
  }
  ```
- **Observed Defect**: No `[data-theme="light"]` override exists. The hardcoded `color: #94a3b8` on a white background has a contrast ratio of **2.97:1** (fails WCAG AA 4.5:1).

#### E. Form Field Labels & Legends (`.field > span`, `.analyst-field legend`)
- **Location**: `web_ui/src/styles.css:1319-1324`
- **Observed Style**:
  ```css
  .field > span, .analyst-field legend {
    color: #cbd5e1;
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: 0.01em;
  }
  ```
- **Observed Defect**: No `[data-theme="light"]` override exists. The hardcoded `color: #cbd5e1` on white `#ffffff` has a contrast ratio of only **1.56:1**, rendering "Date de marché", "Profondeur de recherche", and "Analystes IA déployés" virtually invisible.

#### F. Analyst Toggles (`.analyst-toggle` & `.analyst-toggle.selected`)
- **Location**: `web_ui/src/styles.css:1349-1392`
- **Observed Style**:
  ```css
  .analyst-toggle {
    color: #cbd5e1;
    background: rgba(255, 255, 255, 0.02);
  }
  .analyst-toggle.selected {
    border-color: var(--mint);
    color: #f0fdfa;
    background: var(--mint-soft);
  }
  .analyst-toggle.selected .analyst-card-copy small {
    color: #99f6e4;
  }
  ```
- **Observed Defect**:
  - Unselected toggle: `color: #cbd5e1` on white produces **1.56:1** contrast.
  - Selected toggle: `color: #f0fdfa` (near-white) on `var(--mint-soft)` (`rgba(13, 148, 136, 0.1)` pale mint wash) produces **1.09:1** contrast (100% invisible white-on-white text).
  - Selected description: `color: #99f6e4` on pale mint produces **1.33:1** contrast (100% invisible).

#### G. Autocomplete Dropdown Ticker and Market Inks
- **Location**: `web_ui/src/styles.css:415-430`
- **Observed Style**:
  - `[data-theme="light"] .autocomplete-item.highlighted .autocomplete-ticker-tag` has `color: #0d9488` on `rgba(13, 148, 136, 0.14)` (contrast ratio **3.88:1** < 4.5:1).
  - `[data-theme="light"] .autocomplete-market-tag` has `color: #0284c7` on `rgba(2, 132, 199, 0.08)` (contrast ratio **3.86:1** < 4.5:1).

#### H. Live Workflow Stages, Nodes & Reliability Panel
- **Location**: `web_ui/src/styles.css:1532-1710`
- **Observed Styles**:
  - `.stage-node` has hardcoded `background: #090e15; border: 1px solid rgba(255, 255, 255, 0.15);` -> Renders as a pitch-black circle on Day mode.
  - `.stage-line` has `background: rgba(255, 255, 255, 0.08);` -> Invisible on Day mode.
  - `.stage-audit-card.verified` has `color: #ccfbf1; strong { color: #5eead4; }` -> Contrast on pale mint is **1.1:1** in Day mode.
  - `.stage-audit-card.blocked` has `color: #ffe4e6; strong { color: #fda4af; }` -> Contrast on pale red is **1.1:1** in Day mode.
  - `.data-substep-copy strong` has `color: #cbd5e1;` -> Contrast on white is **1.56:1**.
  - `.warning-box p, .blocking-box p` has `color: #fde68a;` -> Contrast on amber is **1.2:1**.

#### I. Skeleton Live Preview Inline Styles
- **Location**: `web_ui/src/components/analysis/SkeletonLivePreview.jsx:16-20`
- **Observed Code**:
  `<div className="skeleton-shimmer" style={{ ... background: "rgba(255,255,255,0.06)" }} />`
- **Observed Defect**: Inline hardcoded `rgba(255,255,255,0.06)` is invisible on a white background.

---

## 2. Logic Chain

1. **Card Container Isolation**: Because `.analysis-launcher-card` has a default `background: rgba(9, 14, 21, 0.85)` in `:root` and lacks a `[data-theme="light"]` rule, any child elements inherit a dark ambient box. Overriding `.analysis-launcher-card` with `#ffffff` and subtle border `rgba(15, 23, 42, 0.08)` restores the SaaS card presentation in Day mode.
2. **CSS Specificity Hierarchy**: The compound selector `.launcher-search-wrapper .stock-search-input-group input` has higher specificity than a general theme attribute on a single class. Therefore, an explicit `[data-theme="light"] .launcher-search-wrapper .stock-search-input-group input` rule is required to reset `box-shadow` and focus glow.
3. **Contrast Mathematics**:
   - For light mode inputs, `#0f172a` on `#ffffff` delivers a **19.8:1** contrast ratio (WCAG AAA).
   - For light mode field labels, replacing `#cbd5e1` with `#334155` delivers a **9.5:1** contrast ratio.
   - For selected analyst toggle text, replacing `#f0fdfa` with `#0f172a` delivers a **15.4:1** contrast ratio, and replacing `#99f6e4` with `#0f766e` delivers **5.8:1** contrast ratio (WCAG AA).
   - For autocomplete highlighted ticker tags, replacing `#0d9488` with `#0f766e` increases contrast from 3.88:1 to **5.1:1** (WCAG AA).
   - For autocomplete market tags, replacing `#0284c7` with `#0369a1` increases contrast from 3.86:1 to **5.25:1** (WCAG AA).
4. **Dark Mode Preservation**: Keeping the `:root` and dark mode selectors intact ensures the dark mode continues to provide its luminous neon accents (`--mint: #2dd4bf`, `--sky: #38bdf8`, dark glass surfaces `rgba(9, 14, 21, 0.85)`).

---

## 3. Caveats
- No caveats on core Milestone 3 components (`AnalysisPage.jsx`, `AnalysisForm.jsx`, `StockSearchInput.jsx`, `AnalystToggle.jsx`, `Workflow.jsx`, `ReliabilityRail.jsx`, `SkeletonLivePreview.jsx`).
- Downstream Result Page (`ResultPage.jsx`, `FinancialBento.jsx`, `ActionPlanPanel.jsx`, etc.) will be covered in Milestone 4.

---

## 4. Conclusion & Proposed Implementation Blueprint

### 4.1 CSS Implementation (`web_ui/src/styles.css`)

```css
/* ==========================================================================
   Milestone 3: Analysis Launcher, Form, Autocomplete & Workflow Light Mode
   ========================================================================== */

/* 1. Panel & Launcher Card */
[data-theme="light"] .analysis-launcher-card {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
}

/* 2. Stock Search & Launcher Input */
[data-theme="light"] .stock-search-input-group input {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.16);
  color: #0f172a;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

[data-theme="light"] .stock-search-input-group input::placeholder {
  color: #94a3b8;
}

[data-theme="light"] .stock-search-input-group input:focus {
  border-color: var(--mint);
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.18), 0 1px 2px rgba(15, 23, 42, 0.04);
}

[data-theme="light"] .launcher-search-wrapper .stock-search-input-group input {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.16);
  color: #0f172a;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
}

[data-theme="light"] .launcher-search-wrapper .stock-search-input-group input:focus {
  border-color: var(--mint);
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.18), 0 1px 3px rgba(15, 23, 42, 0.05);
}

/* 3. Primary Button Disabled State */
[data-theme="light"] .primary-button:disabled {
  border-color: rgba(15, 23, 42, 0.1);
  background: #f1f5f9;
  color: #94a3b8;
  box-shadow: none;
}

/* 4. Launcher Footer, Presets & Advanced Toggle */
.launcher-footer .quick-preset-chips {
  margin-top: 0;
}

[data-theme="light"] .advanced-toggle-button {
  background: rgba(15, 23, 42, 0.03);
  border-color: rgba(15, 23, 42, 0.12);
  color: #475569;
}

[data-theme="light"] .advanced-toggle-button:hover {
  background: rgba(13, 148, 136, 0.08);
  border-color: rgba(13, 148, 136, 0.35);
  color: #0f172a;
}

/* 5. Advanced Form Fields */
[data-theme="light"] .field > span,
[data-theme="light"] .analyst-field legend {
  color: #334155;
}

[data-theme="light"] .field input,
[data-theme="light"] .field select {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.16);
  color: #0f172a;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

[data-theme="light"] .field input:hover,
[data-theme="light"] .field select:hover {
  border-color: rgba(15, 23, 42, 0.3);
}

[data-theme="light"] .field input:focus,
[data-theme="light"] .field select:focus {
  border-color: var(--mint);
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.18), 0 1px 2px rgba(15, 23, 42, 0.04);
}

[data-theme="light"] .analyst-options-status {
  color: #64748b;
}

/* 6. Analyst Toggle Cards */
[data-theme="light"] .analyst-toggle {
  background: #f8fafc;
  border-color: rgba(15, 23, 42, 0.1);
  color: #334155;
}

[data-theme="light"] .analyst-toggle:hover {
  background: rgba(13, 148, 136, 0.06);
  border-color: rgba(13, 148, 136, 0.35);
  color: #0f172a;
}

[data-theme="light"] .analyst-card-icon {
  background: rgba(15, 23, 42, 0.05);
  color: #64748b;
}

[data-theme="light"] .analyst-toggle:hover .analyst-card-icon {
  color: var(--mint);
  background: rgba(13, 148, 136, 0.12);
}

[data-theme="light"] .analyst-toggle.selected {
  background: rgba(13, 148, 136, 0.1);
  border-color: var(--mint);
  color: #0f172a;
  box-shadow: 0 0 0 1px rgba(13, 148, 136, 0.25), 0 2px 8px rgba(13, 148, 136, 0.1);
}

[data-theme="light"] .analyst-toggle.selected .analyst-card-icon {
  background: rgba(13, 148, 136, 0.2);
  color: #0f766e;
}

[data-theme="light"] .analyst-toggle.selected .analyst-card-copy strong {
  color: #0f172a;
}

[data-theme="light"] .analyst-toggle.selected .analyst-card-copy small {
  color: #0f766e;
}

/* 7. Autocomplete Inks Tuning */
[data-theme="light"] .autocomplete-item.highlighted .autocomplete-ticker-tag {
  background: rgba(13, 148, 136, 0.14);
  border-color: rgba(13, 148, 136, 0.4);
  color: #0f766e;
}

[data-theme="light"] .autocomplete-market-tag {
  color: #0369a1;
  background: rgba(2, 132, 199, 0.08);
  border-color: rgba(2, 132, 199, 0.25);
}

[data-theme="light"] .autocomplete-ticker-tag.raw {
  background: rgba(13, 148, 136, 0.12);
  border-color: rgba(13, 148, 136, 0.35);
  color: #0f766e;
}

[data-theme="light"] .autocomplete-market-tag.raw {
  color: #0f766e;
  background: rgba(13, 148, 136, 0.08);
  border-color: rgba(13, 148, 136, 0.25);
}

/* 8. Workflow & Reliability Panel */
[data-theme="light"] .stage-node {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.14);
  color: #64748b;
}

[data-theme="light"] .stage-line {
  background: rgba(15, 23, 42, 0.1);
}

[data-theme="light"] .stage-row.complete .stage-node,
[data-theme="light"] .stage-row.active .stage-node {
  border-color: var(--mint);
  color: var(--mint);
  box-shadow: 0 0 10px rgba(13, 148, 136, 0.2);
}

[data-theme="light"] .stage-row.complete .stage-line {
  background: var(--mint);
}

[data-theme="light"] .stage-row.error .stage-node {
  border-color: var(--danger);
  color: var(--danger);
  box-shadow: 0 0 10px rgba(220, 38, 38, 0.2);
}

[data-theme="light"] .stage-row.unverified .stage-node {
  border-color: var(--amber);
  color: var(--amber);
}

[data-theme="light"] .stage-audit-card.verified {
  border-color: rgba(5, 150, 105, 0.35);
  background: rgba(5, 150, 105, 0.08);
  color: #065f46;
}

[data-theme="light"] .stage-audit-card.verified strong {
  color: #042f24;
}

[data-theme="light"] .stage-audit-card.blocked {
  border-color: rgba(220, 38, 38, 0.35);
  background: rgba(220, 38, 38, 0.08);
  color: #991b1b;
}

[data-theme="light"] .stage-audit-card.blocked strong {
  color: #7f1d1d;
}

[data-theme="light"] .stage-row.error .stage-status {
  border-color: rgba(220, 38, 38, 0.4);
  color: #991b1b;
  background: rgba(220, 38, 38, 0.1);
}

[data-theme="light"] .stage-row.unverified .stage-status {
  border-color: rgba(217, 119, 6, 0.4);
  color: #92400e;
  background: rgba(217, 119, 6, 0.1);
}

[data-theme="light"] .data-substep {
  background: #f8fafc;
  border-color: rgba(15, 23, 42, 0.08);
}

[data-theme="light"] .data-substep-icon {
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(15, 23, 42, 0.12);
  color: #64748b;
}

[data-theme="light"] .data-substep-copy strong {
  color: #0f172a;
}

[data-theme="light"] .data-substep-copy small {
  color: #64748b;
}

[data-theme="light"] .step-metric-pill.duration {
  color: #0369a1;
  border-color: rgba(2, 132, 199, 0.25);
  background: rgba(2, 132, 199, 0.08);
}

[data-theme="light"] .step-metric-pill.tokens {
  color: #0f766e;
  border-color: rgba(13, 148, 136, 0.25);
  background: rgba(13, 148, 136, 0.08);
}

[data-theme="light"] .warning-box,
[data-theme="light"] .blocking-box {
  border-color: rgba(217, 119, 6, 0.4);
  color: #92400e;
  background: rgba(217, 119, 6, 0.1);
}

[data-theme="light"] .warning-box p,
[data-theme="light"] .blocking-box p {
  color: #78350f;
}

[data-theme="light"] .connection-error {
  color: #991b1b;
  background: rgba(220, 38, 38, 0.08);
  border-color: rgba(220, 38, 38, 0.35);
}

[data-theme="light"] .connection-warning {
  color: #92400e;
  background: rgba(217, 119, 6, 0.08);
  border-color: rgba(217, 119, 6, 0.35);
}

/* 9. Skeleton Shimmer */
[data-theme="light"] .skeleton-hero-box,
[data-theme="light"] .skeleton-card {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.08);
}

[data-theme="light"] .skeleton-shimmer-bar {
  background: rgba(15, 23, 42, 0.07);
}
```

### 4.2 JSX Minor Refactoring (`SkeletonLivePreview.jsx`)
Replace hardcoded inline background colors in `SkeletonLivePreview.jsx` with `.skeleton-shimmer-bar` class to support theme transitions natively.

---

## 5. Verification Method

To independently verify all findings and validate the implementation:
1. **JavaScript Test Suite**:
   ```bash
   cd /Users/etienne/Documents/ChatGPT/TradingAgents/web_ui && npm test
   ```
   Ensures all 53 JS unit, integration, and Puppeteer contrast tests pass with 0 failures.
2. **Python Test Suite**:
   ```bash
   uv run pytest web_ui/tests
   ```
   Ensures all 31 Python reliability and screener backend tests pass.
3. **Vite Production Build**:
   ```bash
   cd /Users/etienne/Documents/ChatGPT/TradingAgents/web_ui && npm run build
   ```
   Ensures 0 syntax errors, 0 broken CSS modules, and 100% clean compilation.
4. **Contrast Verification**:
   Verify every light mode text color meets WCAG AA (>= 4.5:1):
   - Strong text (`#0f172a` on `#ffffff` = 19.8:1)
   - Secondary text (`#334155` on `#ffffff` = 9.5:1)
   - Muted text (`#64748b` on `#ffffff` = 4.63:1)
   - Selected analyst text (`#0f172a` on `rgba(13, 148, 136, 0.1)` = 15.4:1)
   - Selected analyst small (`#0f766e` on `rgba(13, 148, 136, 0.1)` = 5.8:1)
   - Verified badge text (`#065f46` on `rgba(5, 150, 105, 0.08)` = 6.8:1)
