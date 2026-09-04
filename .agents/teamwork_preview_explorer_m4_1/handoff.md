# Handoff Report — Explorer 1 (Milestone 4: Decision Hero & Financial Bento Grid)

## 1. Observation

Direct code inspection of `web_ui/src/pages/ResultPage.jsx`, `web_ui/src/components/results/DecisionHero.jsx`, `web_ui/src/components/results/AgentPolarityBoard.jsx`, `web_ui/src/components/results/PolarityCard.jsx`, `web_ui/src/components/results/FinancialBento.jsx`, `web_ui/src/components/ui/BentoInsight.jsx`, `web_ui/src/ExecutionLevelsCard.jsx`, `web_ui/src/components/results/ActionPlanPanel.jsx`, and `web_ui/src/styles.css` revealed the following specific defects:

### A. Decision Hero Banner Specificity & Contrast Bugs
1. **Specificity Override Failure in Day Mode (`styles.css:147` vs `styles.css:2514-2562`)**:
   - `[data-theme="light"] .decision-hero` at line 147 has specificity `(0, 2, 0)`.
   - `.decision-hero.tone-positive.tier-strong` at line 2519 has specificity `(0, 3, 0)`.
   - `.decision-hero.tone-negative.tier-strong` at line 2544 has specificity `(0, 3, 0)`.
   - `.decision-hero.blocked` at line 2559 has specificity `(0, 2, 0)`.
   - Because `(0, 3, 0) > (0, 2, 0)`, the dark backgrounds (`rgba(6, 24, 18, 0.95)`, `rgba(28, 8, 12, 0.95)`, etc.) win in Day mode whenever a decision tone and tier class is applied.
2. **Decision Typography & Gradient Bleed (`styles.css:2565-2618`)**:
   - `.decision-main span` (line 2565): `color: #94a3b8;` gives 2.9:1 contrast ratio against white card surface (fails WCAG AA 4.5:1).
   - `.decision-text.positive.tier-strong` (line 2576): uses `linear-gradient(180deg, #6ee7b7 0%, #059669 100%)` with neon drop-shadow `filter: drop-shadow(0 0 24px rgba(16, 185, 129, 0.6))`. `#6ee7b7` has a 1.6:1 contrast against white.
   - `.decision-text.neutral` (line 2595): uses `linear-gradient(180deg, #fef08a 0%, #f59e0b 100%)`. `#fef08a` has 1.2:1 contrast against white (completely illegible).
   - `.decision-text.negative.tier-strong` (line 2602): uses `linear-gradient(180deg, #fca5a5 0%, #dc2626 100%)`. `#fca5a5` has 1.8:1 contrast against white.
3. **Decision Strength Sub-Pill Contrast (`styles.css:2621-2680`)**:
   - `.strength-desc` (line 2640): hardcoded `color: #cbd5e1;` (1.4:1 contrast on light surface).
   - `.decision-strength-pill.positive` (line 2648): `color: #a7f3d0;` (1.5:1 contrast).
   - `.decision-strength-pill.neutral` (line 2664): `color: #fde047;` (1.3:1 contrast).
   - `.decision-strength-pill.negative` (line 2669): `color: #fca5a5;` (1.8:1 contrast).
4. **Agent Polarity Board (`styles.css:4073-4302`)**:
   - `.polarity-column` (line 4123): `background: rgba(10, 20, 30, 0.55);` renders as a dark translucent box on white in Day mode.
   - Column titles (lines 4164-4166): `.negative { color: #fda4af; }`, `.neutral { color: #fde047; }`, `.positive { color: #6ee7b7; }` (all < 2:1 contrast on light mode).
   - `.polarity-card` (line 4193): `background: rgba(15, 27, 40, 0.8);` is a hardcoded dark background.
   - `.polarity-agent-name` (line 4244): `color: #f1f5f9;` (1.1:1 contrast on white).
   - `.polarity-card-summary` (line 4293): `color: #cbd5e1;` (1.4:1 contrast on white).

### B. Financial Bento Grid Hardcoded Backgrounds & Duplication Bugs
1. **Container Background (`styles.css:2848`)**:
   - `.financial-bento { background: #05080e; }` — hardcoded dark hex directly on the bento container.
2. **Card Base & Card-Specific Hardcoded Backgrounds (`styles.css:2850-2922`)**:
   - `.bento-card` (line 2856): `background: #090e15;`
   - `.bento-thesis-hero` (line 2875): `background: radial-gradient(...), linear-gradient(145deg, #09131d 0%, #060b11 100%);`
   - `.bento-quality` (line 2896): `background: #081514;`, `.bento-quality.blocked`: `background: #190e10;`
   - `.bento-range` (line 2903): `background: linear-gradient(160deg, #0e151f, #080d13);`
   - `.bento-market` (line 2916): `background: #0c131a;`
   - `.bento-fundamentals` (line 2917): `background: #0c131b;`
   - `.bento-news` (line 2918): `background: #13140e;`
   - `.bento-debate` (line 2920): `background: linear-gradient(145deg, #111119, #0a0e14);`
   - `.bento-risk` (line 2921): `background: #160e10;`
3. **Dead / Conflicting Bento Duplicate Block (`styles.css:2932-2965`)**:
   - Lines 2932 to 2965 re-declare `.bento-quality`, `.bento-range`, `.bento-insight`, `.bento-market`, `.bento-fundamentals`, `.bento-news`, `.bento-debate`, `.bento-risk` with conflicting column spans (`span 5` instead of `span 8`, `span 7` instead of `span 4`) and dark backgrounds (`#111820`, `#10171d`, etc.), disrupting the 12-column grid alignment and layout calculations.
4. **Bento Range Track Pin (`styles.css:2905`)**:
   - `.bento-range-track i`: `border: 3px solid #060a0f; background: #fff;` — needs white border and dark fill in Day mode (`border: 3px solid #ffffff; background: #0f172a;`).

### C. Execution Levels Card & Interactive Calculator (`styles.css:5611-6231`)
1. `.execution-levels-card` (line 5613): `background: #080d14;`
2. `.execution-metric-box` (line 5921): `background: #05080c;`
3. `.order-ticket-dropdown-menu` (line 5743): `background: #090e17;`
4. `.calc-number-input` (line 6113): `background: rgba(0, 0, 0, 0.35); color: #fff;`
5. `.calc-result-card` (line 6184): `background: rgba(0, 0, 0, 0.25);`

### D. Action Plan Panel (`styles.css:8179-8496`)
1. `.action-plan-hero-card` (line 8187): `background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.75) 100%);`
2. `.action-plan-hero-left h2` (line 8218): `color: #fff;`
3. `.action-profile-card` (line 8320): `background: var(--surface-2, #0d1926);`
4. `.action-profile-badge` (line 8360): `color: #fff;`
5. `.action-profile-summary` (line 8390): `color: #cbd5e1;`
6. `.action-order-box` (line 8439): `background: rgba(0, 0, 0, 0.3);`
7. `.order-val` (line 8470): `color: #fff;`

---

## 2. Logic Chain

1. **Root cause of dark Decision Hero in Day mode**:
   - `styles.css` has `[data-theme="light"] .decision-hero` at line 147.
   - However, `DecisionHero.jsx` renders `<section className="decision-hero tone-positive tier-strong">`.
   - The dark mode rule `.decision-hero.tone-positive.tier-strong` has a CSS specificity of `(0, 3, 0)`, which overrides `[data-theme="light"] .decision-hero` `(0, 2, 0)` due to standard CSS cascade rules.
   - Therefore, Day mode requires explicit `[data-theme="light"] .decision-hero.tone-*` rules with equal or higher specificity (e.g. `[data-theme="light"] .decision-hero.tone-positive.tier-strong` or `[data-theme="light"] .decision-hero.tone-positive`) or refactoring the base classes to consume custom properties `--hero-bg`, `--hero-border`, `--hero-glow`.

2. **Root cause of low-contrast text in Day mode**:
   - The original dark mode theme utilized high-luminance neon pastels (`#6ee7b7`, `#fef08a`, `#fca5a5`, `#cbd5e1`, `#94a3b8`) for maximum visibility against dark surfaces (`#05080e`, `#090e15`).
   - When rendered over white `#ffffff` cards in Day mode, high-luminance pastels result in poor contrast ratios (1.2:1 to 2.9:1), violating WCAG AA (>= 4.5:1).
   - Therefore, Day mode rules must use dark contrasting signal inks (`--signal-bullish-text: #065f46`, `--signal-neutral-text: #92400e`, `--signal-bearish-text: #991b1b`, `--text: #0f172a`, `--text-secondary: #334155`, `--muted: #64748b`).

3. **Root cause of bento grid layout and theme issues**:
   - `.financial-bento` container has hardcoded `background: #05080e;` at line 2848.
   - Child bento cards have hardcoded dark backgrounds (`#081514`, `#0c131a`, `#13140e`, `#160e10`).
   - Conflicting duplicate bento rules at lines 2932-2965 override 12-column grid spans with obsolete 5/7 column declarations.
   - Removing the duplicate block and converting the bento cards to semantic white card surfaces with subtle slate borders and pastel badge accents provides the clean Linear/Stripe aesthetic in Day mode while preserving the luminescent neon styling in Dark mode.

---

## 3. Caveats

- `PrintableMemo.jsx` uses its own print media query stylesheet (`@media print` at line 7680 of `styles.css`) where screen elements like `.decision-hero` and `.result-grid` are deliberately hidden (`display: none !important;`). This must remain intact.
- Both JS (63 tests) and Python (31 tests) currently pass 100%. Refactoring must not break any existing test assertions or DOM selectors.
- No changes should be made to Python server backend or websocket/polling logic.

---

## 4. Conclusion & Proposed Implementation Specification

### A. Proposed CSS Refactorings for `styles.css`

#### 1. Decision Hero Day & Night Rules
```css
/* Dark Mode Base & Tone Variants */
.decision-hero {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 26px 30px;
  background: rgba(9, 14, 21, 0.88);
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  box-shadow: var(--inner-highlight), 0 12px 36px rgba(0, 0, 0, 0.35);
  transition: all 220ms ease;
}
.decision-hero.tone-positive {
  border-color: var(--signal-bullish-border);
  background: radial-gradient(ellipse 70% 60% at top left, rgba(16, 185, 129, 0.18), transparent 70%), rgba(8, 20, 16, 0.92);
  box-shadow: 0 0 32px rgba(16, 185, 129, 0.15), var(--inner-highlight), 0 12px 36px rgba(0, 0, 0, 0.35);
}
.decision-hero.tone-neutral {
  border-color: var(--signal-neutral-border);
  background: radial-gradient(ellipse 70% 60% at top left, rgba(245, 158, 11, 0.18), transparent 70%), rgba(20, 16, 8, 0.92);
  box-shadow: 0 0 32px rgba(245, 158, 11, 0.15), var(--inner-highlight), 0 12px 36px rgba(0, 0, 0, 0.35);
}
.decision-hero.tone-negative {
  border-color: var(--signal-bearish-border);
  background: radial-gradient(ellipse 70% 60% at top left, rgba(239, 68, 68, 0.22), transparent 70%), rgba(24, 10, 14, 0.92);
  box-shadow: 0 0 32px rgba(239, 68, 68, 0.18), var(--inner-highlight), 0 12px 36px rgba(0, 0, 0, 0.35);
}

/* Light Mode Overrides with High Specificity */
[data-theme="light"] .decision-hero {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.1);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
}
[data-theme="light"] .decision-hero.tone-positive,
[data-theme="light"] .decision-hero.tone-positive.tier-strong,
[data-theme="light"] .decision-hero.tone-positive.tier-strategic,
[data-theme="light"] .decision-hero.tone-positive.tier-moderate {
  background: linear-gradient(180deg, #ffffff 0%, rgba(240, 253, 244, 0.7) 100%);
  border-color: rgba(5, 150, 105, 0.3);
  box-shadow: 0 0 24px rgba(5, 150, 105, 0.06), 0 4px 20px rgba(0, 0, 0, 0.04);
}
[data-theme="light"] .decision-hero.tone-neutral {
  background: linear-gradient(180deg, #ffffff 0%, rgba(254, 252, 232, 0.7) 100%);
  border-color: rgba(217, 119, 6, 0.3);
  box-shadow: 0 0 24px rgba(217, 119, 6, 0.06), 0 4px 20px rgba(0, 0, 0, 0.04);
}
[data-theme="light"] .decision-hero.tone-negative,
[data-theme="light"] .decision-hero.tone-negative.tier-strong,
[data-theme="light"] .decision-hero.tone-negative.tier-strategic,
[data-theme="light"] .decision-hero.tone-negative.tier-moderate {
  background: linear-gradient(180deg, #ffffff 0%, rgba(254, 242, 242, 0.7) 100%);
  border-color: rgba(220, 38, 38, 0.3);
  box-shadow: 0 0 24px rgba(220, 38, 38, 0.06), 0 4px 20px rgba(0, 0, 0, 0.04);
}
[data-theme="light"] .decision-hero.blocked {
  background: linear-gradient(180deg, #ffffff 0%, rgba(254, 242, 242, 0.8) 100%);
  border-color: rgba(220, 38, 38, 0.4);
  box-shadow: 0 0 24px rgba(220, 38, 38, 0.08), 0 4px 20px rgba(0, 0, 0, 0.04);
}

/* Day Mode Decision Typography */
[data-theme="light"] .decision-main span {
  color: var(--muted);
}
[data-theme="light"] .decision-text.positive,
[data-theme="light"] .decision-text.positive.tier-strong,
[data-theme="light"] .decision-text.positive.tier-strategic,
[data-theme="light"] .decision-text.positive.tier-moderate {
  background: linear-gradient(180deg, #059669 0%, #065f46 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: none;
}
[data-theme="light"] .decision-text.neutral {
  background: linear-gradient(180deg, #b45309 0%, #78350f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: none;
}
[data-theme="light"] .decision-text.negative,
[data-theme="light"] .decision-text.negative.tier-strong,
[data-theme="light"] .decision-text.negative.tier-strategic,
[data-theme="light"] .decision-text.negative.tier-moderate {
  background: linear-gradient(180deg, #dc2626 0%, #991b1b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: none;
}

/* Day Mode Strength Sub-Pill */
[data-theme="light"] .decision-strength-pill.positive,
[data-theme="light"] .decision-strength-pill.positive.tier-strong,
[data-theme="light"] .decision-strength-pill.positive.tier-strategic,
[data-theme="light"] .decision-strength-pill.positive.tier-moderate {
  background: rgba(5, 150, 105, 0.1);
  border-color: rgba(5, 150, 105, 0.3);
  color: #065f46;
  box-shadow: none;
}
[data-theme="light"] .decision-strength-pill.neutral {
  background: rgba(217, 119, 6, 0.1);
  border-color: rgba(217, 119, 6, 0.3);
  color: #92400e;
}
[data-theme="light"] .decision-strength-pill.negative,
[data-theme="light"] .decision-strength-pill.negative.tier-strong,
[data-theme="light"] .decision-strength-pill.negative.tier-strategic,
[data-theme="light"] .decision-strength-pill.negative.tier-moderate {
  background: rgba(220, 38, 38, 0.1);
  border-color: rgba(220, 38, 38, 0.3);
  color: #991b1b;
  box-shadow: none;
}
[data-theme="light"] .decision-strength-pill .strength-desc {
  color: inherit;
  opacity: 0.85;
}
[data-theme="light"] .decision-strength-pill .strength-bars .bar.active {
  background: currentColor;
}
```

#### 2. Agent Polarity Board Day Mode Overrides
```css
[data-theme="light"] .polarity-board-title {
  color: var(--muted);
}
[data-theme="light"] .polarity-board-count {
  color: var(--mint);
  background: var(--mint-soft);
  border-color: rgba(13, 148, 136, 0.25);
}
[data-theme="light"] .polarity-column {
  background: var(--surface-2);
  border-color: rgba(15, 23, 42, 0.08);
}
[data-theme="light"] .polarity-column.negative {
  background: rgba(220, 38, 38, 0.04);
  border-color: rgba(220, 38, 38, 0.2);
}
[data-theme="light"] .polarity-column.neutral {
  background: rgba(217, 119, 6, 0.04);
  border-color: rgba(217, 119, 6, 0.2);
}
[data-theme="light"] .polarity-column.positive {
  background: rgba(5, 150, 105, 0.04);
  border-color: rgba(5, 150, 105, 0.2);
}
[data-theme="light"] .polarity-col-header {
  border-bottom: 1px solid var(--line-soft);
}
[data-theme="light"] .polarity-column.negative .polarity-col-title {
  color: var(--signal-bearish-text);
}
[data-theme="light"] .polarity-column.neutral .polarity-col-title {
  color: var(--signal-neutral-text);
}
[data-theme="light"] .polarity-column.positive .polarity-col-title {
  color: var(--signal-bullish-text);
}
[data-theme="light"] .polarity-col-count {
  background: var(--surface-3);
  color: var(--text-secondary);
}
[data-theme="light"] .polarity-card {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.08);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
[data-theme="light"] .polarity-card:hover {
  border-color: rgba(15, 23, 42, 0.16);
  background: #f8fafc;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
}
[data-theme="light"] .polarity-card-header {
  color: var(--text);
}
[data-theme="light"] .polarity-agent-name {
  color: var(--text);
}
[data-theme="light"] .polarity-card.positive .polarity-mini-tag {
  color: var(--signal-bullish-text);
  background: var(--signal-bullish-bg);
  border-color: rgba(5, 150, 105, 0.25);
}
[data-theme="light"] .polarity-card.neutral .polarity-mini-tag {
  color: var(--signal-neutral-text);
  background: var(--signal-neutral-bg);
  border-color: rgba(217, 119, 6, 0.25);
}
[data-theme="light"] .polarity-card.negative .polarity-mini-tag {
  color: var(--signal-bearish-text);
  background: var(--signal-bearish-bg);
  border-color: rgba(220, 38, 38, 0.25);
}
[data-theme="light"] .polarity-card-body {
  border-top: 1px solid var(--line-soft);
}
[data-theme="light"] .polarity-card-summary {
  color: var(--text-secondary);
}
```

#### 3. Financial Bento Grid Day Mode Rules
```css
/* Container */
.financial-bento {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  grid-auto-flow: dense;
  gap: 12px;
  max-height: 650px;
  overflow: auto;
  padding: 16px;
  background: var(--surface-2);
  border-radius: var(--radius-lg);
  border: 1px solid var(--line-soft);
}

[data-theme="light"] .financial-bento {
  background: #f8fafc;
  border-color: rgba(15, 23, 42, 0.08);
}

[data-theme="light"] .bento-card {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.08);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03), 0 4px 12px rgba(0, 0, 0, 0.02);
}
[data-theme="light"] .bento-card:hover {
  border-color: rgba(13, 148, 136, 0.3);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.06);
}
[data-theme="light"] .bento-card-title {
  color: var(--text);
}
[data-theme="light"] .bento-thesis-hero {
  background: radial-gradient(circle at 95% 10%, rgba(13, 148, 136, 0.06), transparent 45%), linear-gradient(145deg, #ffffff 0%, #f0fdfa 100%);
  border-color: rgba(13, 148, 136, 0.22);
  box-shadow: 0 4px 16px rgba(13, 148, 136, 0.05);
}
[data-theme="light"] .bento-thesis-list {
  color: var(--text-secondary);
}
[data-theme="light"] .bento-range {
  background: #ffffff;
}
[data-theme="light"] .bento-range dd {
  color: var(--text);
}
[data-theme="light"] .bento-range dt {
  color: var(--muted);
}
[data-theme="light"] .bento-range-track i {
  border: 3px solid #ffffff;
  background: var(--text);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
}
[data-theme="light"] .bento-quality {
  background: rgba(5, 150, 105, 0.06);
  border-color: rgba(5, 150, 105, 0.2);
}
[data-theme="light"] .bento-quality strong {
  color: var(--signal-bullish-text);
}
[data-theme="light"] .bento-quality p {
  color: #047857;
}
[data-theme="light"] .bento-quality.blocked {
  background: rgba(220, 38, 38, 0.06);
  border-color: rgba(220, 38, 38, 0.2);
}
[data-theme="light"] .bento-quality.blocked strong {
  color: var(--signal-bearish-text);
}
[data-theme="light"] .bento-quality.blocked p {
  color: #b91c1c;
}
[data-theme="light"] .bento-insight li {
  color: var(--text-secondary);
}
[data-theme="light"] .bento-empty {
  color: var(--muted);
}
```

#### 4. Execution Levels Card & Action Plan Day Mode Rules
```css
/* Execution Levels Card */
[data-theme="light"] .execution-levels-card {
  background: #ffffff;
  border-color: rgba(13, 148, 136, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}
[data-theme="light"] .execution-title-group h3 {
  color: var(--text);
}
[data-theme="light"] .execution-metric-box {
  background: var(--surface-2);
  border-color: var(--line);
}
[data-theme="light"] .metric-value {
  color: var(--text);
}
[data-theme="light"] .order-ticket-dropdown-menu {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.12);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}
[data-theme="light"] .order-ticket-menu-item {
  color: var(--text);
}
[data-theme="light"] .order-ticket-menu-item strong {
  color: var(--text);
}
[data-theme="light"] .execution-calculator-title {
  color: var(--text);
}
[data-theme="light"] .execution-calc-controls {
  background: var(--surface-2);
  border-color: var(--line);
}
[data-theme="light"] .calc-number-input {
  background: #ffffff;
  border-color: var(--line);
  color: var(--text);
}
[data-theme="light"] .calc-result-card {
  background: #ffffff;
  border-color: var(--line);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
[data-theme="light"] .calc-result-value {
  color: var(--text);
}

/* Action Plan Panel */
[data-theme="light"] .action-plan-hero-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-color: var(--line);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}
[data-theme="light"] .action-plan-hero-left h2 {
  color: var(--text);
}
[data-theme="light"] .action-profile-card {
  background: #ffffff;
  border-color: var(--line);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}
[data-theme="light"] .action-profile-badge {
  color: var(--text);
}
[data-theme="light"] .action-profile-summary {
  background: var(--surface-2);
  border-color: var(--line-soft);
  color: var(--text-secondary);
}
[data-theme="light"] .action-steps-list li {
  color: var(--text-secondary);
}
[data-theme="light"] .action-order-box {
  background: var(--surface-2);
  border-color: var(--line-soft);
}
[data-theme="light"] .order-val {
  color: var(--text);
}
```

---

## 5. Verification Method

To independently verify all findings and validate future code edits:

1. **Automated Unit & E2E Test Suite**:
   ```bash
   cd /Users/etienne/Documents/ChatGPT/TradingAgents/web_ui && npm test
   ```
   Ensures all 63 test suites pass, including Tier 1-5 theme contrast and browser smoke tests.

2. **Python Backend Reliability & Screener Suite**:
   ```bash
   cd /Users/etienne/Documents/ChatGPT/TradingAgents && ./.venv/bin/pytest web_ui/tests
   ```
   Ensures all 31 backend and screener tests pass.

3. **Vite Production Build Compilation**:
   ```bash
   cd /Users/etienne/Documents/ChatGPT/TradingAgents/web_ui && npm run build
   ```
   Ensures zero syntax or bundling errors.

4. **Visual & Contrast Verification**:
   - Inspect `.decision-hero`, `.financial-bento`, `.bento-card`, `.execution-levels-card`, `.action-plan-hero-card` in both `[data-theme="light"]` and `[data-theme="dark"]`.
   - Verify that all body text, headings, badges, and card borders maintain >= 4.5:1 WCAG AA contrast ratio.
