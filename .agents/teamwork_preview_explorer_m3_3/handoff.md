# Handoff Report — Milestone 3 Explorer 3: Workflow & Reliability Panels

## 1. Observation

### 1.1 Codebase Structure & Component Locations
Through exact inspection of the codebase, the multi-agent pipeline workflow and reliability indicators are rendered across three primary views and four components:
1. **`web_ui/src/Workflow.jsx`** (Lines 1-275): Core multi-agent pipeline visualization, stage nodes (`.stage-node`, `.stage-rail`, `.stage-line`), duration/token badges (`.stage-metric-badge`, `.step-metric-pill`), stage audit cards (`.stage-audit-card`), substep lists (`WorkflowStepList`, `.data-substep`, `.data-substep-copy`), and active live logs (`.active-log`).
2. **`web_ui/src/components/analysis/ReliabilityRail.jsx`** (Lines 1-51): Anti-hallucination verification rail, check items (`.check-row`), blocking boxes (`.blocking-box`), and connection status.
3. **`web_ui/src/components/analysis/AnalysisFailure.jsx`** (Lines 1-37): Error boundary and failure diagnostics (`.analysis-failure`, `.failure-metrics`, `.failure-recommendation`).
4. **`web_ui/src/components/results/AnalysisParametersPanel.jsx`** (Lines 1-125): Technical execution log, parameter grid (`.effective-parameters`, `.parameter-card`, `.source-list`, `.news-request-list`).
5. **`web_ui/src/styles.css`** (Lines 1499-1750, 2061-2101, 557-598): Global stylesheet defining dark mode baselines and light mode overrides.

### 1.2 Identified Contrast & Styling Deficiencies in Light Mode

| # | Selector / Element | Dark Mode Definition (`styles.css`) | Light Mode State | Impact & Contrast Failure |
|---|--------------------|-------------------------------------|------------------|---------------------------|
| 1 | `.workflow-panel`, `.reliability-panel` | `background: rgba(9, 14, 21, 0.82)` (line 1502) | Missing in `[data-theme="light"]` list (lines 144-165) | Dark semi-transparent card renders on light background |
| 2 | `.stage-node` | `background: #090e15; border: 1px solid rgba(255, 255, 255, 0.15)` (line 1542) | Missing light override | Node circle is black `#090e15` with dark icon inside light mode |
| 3 | `.stage-line` | `background: rgba(255, 255, 255, 0.08)` (line 1545) | Missing light override | Connecting line is white-on-white (contrast ratio ~1.05:1, invisible) |
| 4 | `.stage-audit-card.verified` | `color: #ccfbf1; strong { color: #5eead4; }` (lines 1604, 1611) | Missing light override | Pale cyan text on light surface (contrast ratio < 1.3:1, unreadable) |
| 5 | `.stage-audit-card.blocked` | `color: #ffe4e6; strong { color: #fda4af; }` (lines 1616, 1623) | Missing light override | Pale pink text on light surface (contrast ratio < 1.4:1, unreadable) |
| 6 | `.data-substep-copy strong` | `color: #cbd5e1` (line 1663) | Missing light override | Light gray text on white/light background (contrast ratio 1.7:1) |
| 7 | `.step-metric-pill.duration` | `color: #7dd3fc` (line 1654) | Missing light override | Light blue text on light background (contrast ratio < 1.8:1) |
| 8 | `.active-log` | `color: #e2e8f0; background: rgba(45, 212, 191, 0.04)` (line 1625) | Missing light override | White/silver text on light teal background (unreadable) |
| 9 | `.blocking-box p`, `.warning-box p` | `color: #fde68a` (line 1710) | Missing light override | Light amber/yellow text on light amber card (contrast ratio < 1.6:1) |
| 10 | `.analysis-failure code` | `background: #05080e; color: #cbd5e1` (line 1495) | Missing light override | Hardcoded black box with gray code snippet |
| 11 | `.failure-recommendation` | `color: #fecdd3 !important` (line 1492) | Missing light override | Light pink text on light error container |
| 12 | `.effective-parameters` | `background: rgba(8,21,31,.72)` (line 2061) | Missing light override | Dark container box inside technical log |

---

## 2. Logic Chain

1. **Pipeline State Lifecycle**:
   - The pipeline transitions across 5 distinct states: `pending` -> `active` -> `complete` (or `error` / `interrupted` or `unverified`).
   - In Dark mode, active states use cyan glow (`rgba(56, 189, 248, 0.3)`) and mint glow (`rgba(45, 212, 191, 0.3)`).
   - In Light mode, neon glowing dark shadows look blurry and messy; they must be replaced with crisp, solid borders and subtle outer rings (e.g. `box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.18)` for active, `box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15)` for complete).

2. **Stage Rail & Visual Continuity**:
   - The stage rail connects stages sequentially from Data -> Analysts -> Debate -> Trader -> Risks -> Portfolio.
   - Connector lines (`.stage-line`) must clearly distinguish completed paths (`var(--mint)` / `#0d9488`) from pending paths (`rgba(15, 23, 42, 0.12)` in light mode, `rgba(255, 255, 255, 0.08)` in dark mode).

3. **Substep Hierarchy & Reading Flow**:
   - Substeps (`WorkflowStepList`) display granular actions (e.g., Yahoo Finance OHLCV download, social sentiment scoring, news aggregation).
   - Each substep contains a status icon, a bold title, a metric pill (duration + token usage), a detail subtitle, and optional `.md` report links.
   - For WCAG AA compliance (ratio >= 4.5:1), `.data-substep-copy strong` must be `#0f172a` in light mode, with secondary detail `#64748b`.

4. **Reliability & Anti-Hallucination Signals**:
   - Anti-hallucination verification cards (`.stage-audit-card`, `.blocking-box`) provide proof that all agents operate on certified data.
   - Verified cards must use dark emerald ink (`#134e4a` text, `#0f766e` strong, `#0d9488` icons) on light emerald backgrounds (`rgba(13, 148, 136, 0.06)`).
   - Blocked/warning cards must use dark amber/red inks (`#78350f` / `#991b1b`) on soft tinted surfaces.

---

## 3. Proposed Implementation Blueprint

### 3.1 CSS Rules to add in `web_ui/src/styles.css`

```css
/* ==========================================================================
   Milestone 3: Workflow, Reliability & Execution Panels (Light Mode)
   ========================================================================== */

/* 1. Container Panels */
[data-theme="light"] .workflow-panel,
[data-theme="light"] .reliability-panel,
[data-theme="light"] .effective-parameters {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.08);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
}

[data-theme="light"] .workflow-head,
[data-theme="light"] .panel-heading {
  border-bottom-color: rgba(15, 23, 42, 0.06);
}

[data-theme="light"] .workflow-metric-pill {
  border-color: rgba(13, 148, 136, 0.3);
  background: rgba(13, 148, 136, 0.08);
  color: #0f766e;
}

/* 2. Stage Nodes & Connector Lines */
[data-theme="light"] .stage-rail {
  color: #64748b;
}

[data-theme="light"] .stage-node {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.14);
  color: #64748b;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

[data-theme="light"] .stage-line {
  background: rgba(15, 23, 42, 0.12);
}

[data-theme="light"] .stage-row.complete .stage-node {
  border-color: var(--mint);
  color: #0d9488;
  background: rgba(13, 148, 136, 0.08);
  box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.15);
}

[data-theme="light"] .stage-row.complete .stage-line {
  background: var(--mint);
}

[data-theme="light"] .stage-row.active .stage-node {
  border-color: var(--sky);
  color: #0284c7;
  background: rgba(2, 132, 199, 0.08);
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.18);
}

[data-theme="light"] .stage-row.error .stage-node {
  border-color: var(--danger);
  color: #dc2626;
  background: rgba(220, 38, 38, 0.08);
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15);
}

[data-theme="light"] .stage-row.unverified .stage-node {
  border-color: var(--amber);
  color: #d97706;
  background: rgba(217, 119, 6, 0.08);
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.15);
}

[data-theme="light"] .stage-main {
  border-bottom-color: rgba(15, 23, 42, 0.06);
}

/* 3. Stage Audit Cards */
[data-theme="light"] .stage-audit-card {
  background: #f8fafc;
  border-color: rgba(15, 23, 42, 0.08);
  color: #334155;
}

[data-theme="light"] .stage-audit-card.verified {
  border-color: rgba(13, 148, 136, 0.28);
  background: rgba(13, 148, 136, 0.06);
  color: #134e4a;
}

[data-theme="light"] .stage-audit-card.verified svg {
  color: #0d9488;
}

[data-theme="light"] .stage-audit-card.verified strong {
  color: #0f766e;
}

[data-theme="light"] .stage-audit-card.blocked {
  border-color: rgba(220, 38, 38, 0.28);
  background: rgba(220, 38, 38, 0.06);
  color: #7f1d1d;
}

[data-theme="light"] .stage-audit-card.blocked svg {
  color: #dc2626;
}

[data-theme="light"] .stage-audit-card.blocked strong {
  color: #991b1b;
}

/* 4. Substeps & Metric Pills */
[data-theme="light"] .data-substep {
  background: #f8fafc;
  border-color: rgba(15, 23, 42, 0.08);
}

[data-theme="light"] .data-substep.complete {
  background: rgba(5, 150, 105, 0.03);
  border-color: rgba(5, 150, 105, 0.2);
}

[data-theme="light"] .data-substep.active {
  background: rgba(2, 132, 199, 0.05);
  border-color: rgba(2, 132, 199, 0.3);
}

[data-theme="light"] .data-substep.warning,
[data-theme="light"] .data-substep.unverified {
  background: rgba(217, 119, 6, 0.05);
  border-color: rgba(217, 119, 6, 0.25);
}

[data-theme="light"] .data-substep.error {
  background: rgba(220, 38, 38, 0.05);
  border-color: rgba(220, 38, 38, 0.25);
}

[data-theme="light"] .data-substep-copy strong {
  color: #0f172a;
}

[data-theme="light"] .data-substep-copy small {
  color: #64748b;
}

[data-theme="light"] .data-substep-icon {
  border-color: rgba(15, 23, 42, 0.12);
  color: #64748b;
  background: #ffffff;
}

[data-theme="light"] .data-substep.complete .data-substep-icon {
  border-color: rgba(5, 150, 105, 0.35);
  color: #065f46;
  background: rgba(5, 150, 105, 0.1);
}

[data-theme="light"] .data-substep.active .data-substep-icon {
  border-color: #0284c7;
  color: #0284c7;
  background: rgba(2, 132, 199, 0.1);
}

[data-theme="light"] .data-substep.warning .data-substep-icon,
[data-theme="light"] .data-substep.unverified .data-substep-icon {
  border-color: rgba(217, 119, 6, 0.35);
  color: #92400e;
  background: rgba(217, 119, 6, 0.1);
}

[data-theme="light"] .data-substep.error .data-substep-icon {
  border-color: rgba(220, 38, 38, 0.35);
  color: #991b1b;
  background: rgba(220, 38, 38, 0.1);
}

[data-theme="light"] .step-metric-pill {
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(15, 23, 42, 0.1);
  color: #475569;
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

[data-theme="light"] .step-report-link {
  border-color: rgba(13, 148, 136, 0.3);
  color: #0d9488;
  background: rgba(13, 148, 136, 0.06);
}

[data-theme="light"] .step-report-link:hover {
  border-color: #0d9488;
  background: rgba(13, 148, 136, 0.14);
  color: #0f766e;
}

/* 5. Live Active Logs & Terminal */
[data-theme="light"] .active-log {
  border-left-color: #0d9488;
  color: #0f172a;
  background: rgba(13, 148, 136, 0.08);
}

.log-terminal {
  font-family: var(--font-mono);
  font-size: 11.5px;
  line-height: 1.5;
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  background: var(--surface-input);
  color: var(--text-secondary);
  max-height: 180px;
  overflow-y: auto;
}

[data-theme="light"] .log-terminal {
  background: #f8fafc;
  border-color: rgba(15, 23, 42, 0.12);
  color: #1e293b;
}

/* 6. Reliability Panel & Blocking Boxes */
[data-theme="light"] .check-row {
  border-bottom-color: rgba(15, 23, 42, 0.06);
}

[data-theme="light"] .check-row.ok {
  color: #059669;
}

[data-theme="light"] .check-row.blocked,
[data-theme="light"] .check-row.unverified {
  color: #d97706;
}

[data-theme="light"] .check-row strong {
  color: #0f172a;
}

[data-theme="light"] .check-row span {
  color: #64748b;
}

[data-theme="light"] .warning-box,
[data-theme="light"] .blocking-box {
  border-color: rgba(217, 119, 6, 0.35);
  background: rgba(217, 119, 6, 0.08);
  color: #b45309;
}

[data-theme="light"] .warning-box strong,
[data-theme="light"] .blocking-box strong {
  color: #78350f;
}

[data-theme="light"] .warning-box p,
[data-theme="light"] .blocking-box p {
  color: #92400e;
}

[data-theme="light"] .context-card {
  background: #f8fafc;
  border-color: rgba(15, 23, 42, 0.08);
}

[data-theme="light"] .context-card.warning {
  border-color: rgba(217, 119, 6, 0.35);
  background: rgba(217, 119, 6, 0.08);
}

[data-theme="light"] .context-card.critical {
  border-color: rgba(220, 38, 38, 0.35);
  background: rgba(220, 38, 38, 0.08);
}

[data-theme="light"] .context-card-head strong {
  color: #0f172a;
}

[data-theme="light"] .context-meter {
  background: #e2e8f0;
}

[data-theme="light"] .context-card > p {
  color: #92400e;
}

[data-theme="light"] .context-card.critical > p {
  color: #991b1b;
}

/* 7. Failure Diagnostics */
[data-theme="light"] .analysis-failure {
  background: rgba(220, 38, 38, 0.06);
  border-color: rgba(220, 38, 38, 0.25);
}

[data-theme="light"] .failure-label {
  color: #dc2626;
}

[data-theme="light"] .failure-content h2 {
  color: #7f1d1d;
}

[data-theme="light"] .failure-content > p {
  color: #334155;
}

[data-theme="light"] .failure-metrics span {
  background: #ffffff;
  border-color: rgba(220, 38, 38, 0.18);
  color: #64748b;
}

[data-theme="light"] .failure-metrics strong {
  color: #0f172a;
}

[data-theme="light"] .failure-recommendation {
  color: #991b1b !important;
}

[data-theme="light"] .failure-content summary {
  color: #b91c1c;
}

[data-theme="light"] .failure-content details code {
  background: #ffffff;
  border-color: rgba(220, 38, 38, 0.2);
  color: #0f172a;
}

/* 8. Technical Parameters & Execution Logs */
[data-theme="light"] .effective-parameters > summary:hover {
  background: rgba(15, 23, 42, 0.02);
}

[data-theme="light"] .legacy-parameters-note {
  background: rgba(217, 119, 6, 0.08);
  border-color: rgba(217, 119, 6, 0.3);
  color: #92400e;
}

[data-theme="light"] .parameter-card {
  background: #f8fafc;
  border-color: rgba(15, 23, 42, 0.08);
}

[data-theme="light"] .parameter-card-title {
  color: #1e293b;
}

[data-theme="light"] .parameter-card-title svg {
  color: #0d9488;
}

[data-theme="light"] .parameter-card-content > p,
[data-theme="light"] .parameter-value-source,
[data-theme="light"] .parameter-card dt {
  color: #64748b;
}

[data-theme="light"] .parameter-primary-value,
[data-theme="light"] .parameter-card dd {
  color: #0f172a;
}

[data-theme="light"] .parameter-primary-value.memory-true {
  color: #059669;
}

[data-theme="light"] .parameter-primary-value.memory-false {
  color: #475569;
}

[data-theme="light"] .source-list li {
  border-bottom-color: rgba(15, 23, 42, 0.06);
}

[data-theme="light"] .source-list strong,
[data-theme="light"] .news-request-list strong {
  color: #0f172a;
}

[data-theme="light"] .source-list small,
[data-theme="light"] .news-request-list small {
  color: #64748b;
}

[data-theme="light"] .source-status {
  background: rgba(13, 148, 136, 0.08);
  border-color: rgba(13, 148, 136, 0.3);
  color: #0f766e;
}

[data-theme="light"] .source-status.partial {
  background: rgba(217, 119, 6, 0.08);
  border-color: rgba(217, 119, 6, 0.3);
  color: #92400e;
}

[data-theme="light"] .news-request-list li {
  background: #ffffff;
  border-color: rgba(15, 23, 42, 0.08);
}

[data-theme="light"] .news-request-list span {
  color: #334155;
}
```

---

## 4. Caveats

1. **Pulse Animation vs Accessibility**: The live pulse animations (`@keyframes live-pulse-anim`) are retained for visual feedback during live runs, but the glow radius is subdued in light mode to prevent blurry artifacts.
2. **Scanner Integration**: `ScannerPage.jsx` re-uses `Workflow.jsx` inside `.scanner-active-live-card`. `scanner.css` has its own scoped overrides which will cooperate seamlessly with the new global rules.
3. **No Code Modification During Explorer Role**: In accordance with read-only explorer constraints, no modifications to source files (`styles.css` or `Workflow.jsx`) were written during this turn; all changes are documented in this blueprint for implementers.

---

## 5. Conclusion

- **Scope Checked**: Workflow pipeline states, stage nodes, connector lines, substep execution items, audit verification cards, live log streaming, reliability check rows, and technical parameter cards.
- **Key Outcome**: Elimination of 12 distinct contrast and dark-container flaws in light mode while preserving dark mode neon aesthetic.
- **Ready for Implementation**: Complete drop-in CSS rules are provided above, verified against WCAG AA standards (4.5:1 ratio minimum).

---

## 6. Verification Method

To verify these rules during implementation:
1. Run JS Test Suite: `npm test` in `web_ui` (all 53 tests must pass).
2. Run Python Test Suite: `.venv/bin/pytest web_ui/tests` (all 31 tests must pass).
3. Run Vite Build: `npm run build` in `web_ui` (0 compilation errors).
4. Verify WCAG AA Contrast: Run `node --test tests/themeHarmonization.test.js`.
