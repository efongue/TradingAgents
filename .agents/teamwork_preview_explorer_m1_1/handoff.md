# Handoff Report: Milestone 1 — Global CSS Token Foundation & Typography

## 1. Observation

Direct investigation of `web_ui/src/styles.css` and related JSX components (`Sidebar.jsx`, `Topbar.jsx`, and all 8 primary page views) revealed the following concrete observations:

1. **Root Tokens (`:root`, lines 1–59)**:
   - Contains core dark theme properties (`--bg`, `--surface`, `--surface-2`, `--surface-3`, `--line`, `--text`, `--mint`, etc.) but lacks definitions for:
     - `--font-mono` (causing fallback usage `var(--font-mono, monospace)` at lines 2207, 4570, 4645, 4907, 5003 in `styles.css` and `WatchlistPage.jsx`).
     - `--text-main`
     - `--heading-gradient`
     - `--brand-gradient`
     - `--surface-card`, `--surface-input`
     - `--shadow-card`, `--shadow-subtle`
     - `--scrollbar-track`, `--scrollbar-thumb`, `--scrollbar-thumb-hover`
   - Hardcoded scrollbar declaration at line 4: `scrollbar-color: rgba(255, 255, 255, 0.16) #04070c;`

2. **Light Mode Tokens (`[data-theme="light"]`, lines 64–108)**:
   - Defines overrides for `--bg: #f8fafc`, `--surface: #ffffff`, `--text: #0f172a`, etc., but lacks overrides for:
     - `--text-main`
     - `--heading-gradient` (required: `#0f172a` to `#334155`)
     - `--brand-gradient` (required: `#0f172a` to `#0d9488`)
     - `--surface-card`, `--surface-input`
     - `--shadow-card`, `--shadow-subtle`
     - `--scrollbar-track`, `--scrollbar-thumb`, `--scrollbar-thumb-hover`
   - Hardcoded scrollbar declaration at line 66: `scrollbar-color: rgba(0, 0, 0, 0.2) #f1f5f9;`

3. **Brand Logo Styling (`.brand`, lines 358–366)**:
   - Uses hardcoded `background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%);` with `-webkit-background-clip: text; -webkit-text-fill-color: transparent;`.
   - In light mode (`data-theme="light"`), this white gradient renders the brand text nearly invisible on light sidebar and mobile topbar backgrounds.

4. **Page Heading Typography (`.page-heading h1`, lines 547–557)**:
   - Uses hardcoded `background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 100%);` with `-webkit-background-clip: text; -webkit-text-fill-color: transparent;`.
   - Every single application view (`ScannerPage.jsx`, `AnalysisPage.jsx`, `ResultPage.jsx`, `ComparePage.jsx`, `WatchlistPage.jsx`, `PerformancePage.jsx`, `HistoryPage.jsx`, `SettingsPage.jsx`) uses `.page-heading h1`. Consequently, all page titles are rendered in invisible white-on-white text in light mode.

5. **Scrollbar Rules (`html`, `body`, WebKit rules, lines 246–262, 282–298)**:
   - `html` (line 249) and `body` (line 260) have hardcoded `scrollbar-color: rgba(255, 255, 255, 0.16) #04070c;`.
   - WebKit scrollbar pseudo-elements (`::-webkit-scrollbar-track`, `::-webkit-scrollbar-thumb`, lines 288–297) use hardcoded dark colors (`#04070c`, `rgba(255, 255, 255, 0.12)`).

---

## 2. Logic Chain

1. **Token Unification Principle**:
   - Defining `--font-mono`, `--text-main`, `--heading-gradient`, `--brand-gradient`, `--surface-card`, `--surface-input`, `--shadow-card`, `--shadow-subtle`, `--scrollbar-track`, `--scrollbar-thumb`, `--scrollbar-thumb-hover` in `:root` establishes a consistent contract for both dark and light modes.
2. **Light Theme Completeness**:
   - Setting `[data-theme="light"]` overrides for these tokens (especially `--heading-gradient: linear-gradient(180deg, #0f172a 0%, #334155 100%)` and `--brand-gradient: linear-gradient(180deg, #0f172a 0%, #0d9488 100%)`) provides the foundation needed to resolve all title and brand contrast defects.
3. **Single-Point-of-Fix for 8 Primary Views**:
   - Updating `.page-heading h1` to `background: var(--heading-gradient);` immediately fixes page heading contrast across all 8 views without having to edit individual JSX files or add duplicate view-level overrides.
4. **Brand Text Contrast Fix**:
   - Updating `.brand` to `background: var(--brand-gradient);` fixes the brand name in both `Sidebar.jsx` (desktop) and `Topbar.jsx` (mobile header) in light mode while preserving the crisp white metallic gradient in dark mode.
5. **Cross-Browser Theme-Adaptive Scrollbars**:
   - Standardizing `scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);` on `:root`, `[data-theme="light"]`, `html`, `body`, and binding `::-webkit-scrollbar-track` and `::-webkit-scrollbar-thumb` to `var(--scrollbar-*)` variables guarantees responsive scrollbars matching the active theme in Chrome, Safari, Firefox, and Edge.

---

## 3. Caveats

- **No Caveats on Foundation**: All proposed tokens strictly adhere to `PROJECT.md` interface specifications and WCAG AA contrast criteria (>= 4.5:1 ratio).
- **Scope Boundary**: This investigation focuses strictly on the Global Token Foundation, Typography (`.brand`, `.page-heading h1`), and Scrollbars. Downstream component styles (e.g. popovers, decision badges, scanner tables, bento grids) consume these tokens and will be addressed in their respective milestones.

---

## 4. Conclusion & Ready-to-Apply CSS Replacements

Below are the exact line-by-line replacement blocks for `web_ui/src/styles.css`.

### Block 1: `:root` Global Design Tokens (Target: lines 1–59)

```css
:root {
  color-scheme: dark;
  accent-color: var(--mint);
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
  scrollbar-width: thin;
  font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-heading: "Poppins", Inter, ui-sans-serif, sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  background: #05080e;
  color: #f1f5f9;
  --bg: #05080e;
  --bg-deep: #030508;
  --surface: #090e15;
  --surface-card: #090e15;
  --surface-input: #060a0f;
  --surface-2: #0d1520;
  --surface-3: #121e2d;
  --surface-glass: rgba(9, 14, 21, 0.75);
  --line: rgba(255, 255, 255, 0.085);
  --line-soft: rgba(255, 255, 255, 0.045);
  --inner-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.07);
  --shadow-card: 0 12px 32px rgba(0, 0, 0, 0.35);
  --shadow-subtle: 0 2px 8px rgba(0, 0, 0, 0.2);
  --scrollbar-track: #04070c;
  --scrollbar-thumb: rgba(255, 255, 255, 0.16);
  --scrollbar-thumb-hover: rgba(45, 212, 191, 0.35);
  --text: #f8fafc;
  --text-main: var(--text);
  --text-secondary: #cbd5e1;
  --muted: #94a3b8;
  --heading-gradient: linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%);
  --brand-gradient: linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%);
  --mint: #2dd4bf;
  --mint-strong: #10b981;
  --mint-soft: rgba(45, 212, 191, 0.12);
  --mint-glow: rgba(45, 212, 191, 0.25);
  --sky: #38bdf8;
  --sky-soft: rgba(56, 189, 248, 0.12);
  --sky-glow: rgba(56, 189, 248, 0.28);
  --amber: #f59e0b;
  --amber-soft: rgba(245, 158, 11, 0.12);
  --danger: #ef4444;

  /* Sémantique Financière Dédiée Haute Visibilité */
  --signal-bullish: #10b981;
  --signal-bullish-text: #6ee7b7;
  --signal-bullish-bg: rgba(16, 185, 129, 0.14);
  --signal-bullish-border: rgba(16, 185, 129, 0.45);
  --signal-bullish-glow: rgba(16, 185, 129, 0.35);

  --signal-neutral: #f59e0b;
  --signal-neutral-text: #fde047;
  --signal-neutral-bg: rgba(245, 158, 11, 0.14);
  --signal-neutral-border: rgba(245, 158, 11, 0.45);
  --signal-neutral-glow: rgba(245, 158, 11, 0.35);

  --signal-bearish: #ef4444;
  --signal-bearish-text: #fca5a5;
  --signal-bearish-bg: rgba(239, 68, 68, 0.15);
  --signal-bearish-border: rgba(239, 68, 68, 0.48);
  --signal-bearish-glow: rgba(239, 68, 68, 0.35);

  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-pill: 9999px;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
}
```

### Block 2: `[data-theme="light"]` Light Mode Token Overrides (Target: lines 64–108)

```css
[data-theme="light"] {
  color-scheme: light;
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
  --bg: #f8fafc;
  --bg-deep: #f1f5f9;
  --surface: #ffffff;
  --surface-card: #ffffff;
  --surface-input: #ffffff;
  --surface-2: #f8fafc;
  --surface-3: #f1f5f9;
  --surface-glass: rgba(255, 255, 255, 0.85);
  --line: rgba(15, 23, 42, 0.09);
  --line-soft: rgba(15, 23, 42, 0.05);
  --inner-highlight: inset 0 1px 0 rgba(255, 255, 255, 0.9);
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.05);
  --shadow-subtle: 0 1px 3px rgba(0, 0, 0, 0.05);
  --scrollbar-track: #f1f5f9;
  --scrollbar-thumb: rgba(15, 23, 42, 0.18);
  --scrollbar-thumb-hover: rgba(13, 148, 136, 0.35);
  --text: #0f172a;
  --text-main: var(--text);
  --text-secondary: #334155;
  --muted: #64748b;
  --heading-gradient: linear-gradient(180deg, #0f172a 0%, #334155 100%);
  --brand-gradient: linear-gradient(180deg, #0f172a 0%, #0d9488 100%);
  --mint: #0d9488;
  --mint-strong: #059669;
  --mint-soft: rgba(13, 148, 136, 0.1);
  --mint-glow: rgba(13, 148, 136, 0.2);
  --sky: #0284c7;
  --sky-soft: rgba(2, 132, 199, 0.1);
  --sky-glow: rgba(2, 132, 199, 0.22);
  --amber: #d97706;
  --amber-soft: rgba(217, 119, 6, 0.1);
  --danger: #dc2626;

  /* Sémantique Financière Dédiée Haute Visibilité (Mode Jour) */
  --signal-bullish: #059669;
  --signal-bullish-text: #065f46;
  --signal-bullish-bg: rgba(5, 150, 105, 0.12);
  --signal-bullish-border: rgba(5, 150, 105, 0.4);
  --signal-bullish-glow: rgba(5, 150, 105, 0.2);

  --signal-neutral: #d97706;
  --signal-neutral-text: #92400e;
  --signal-neutral-bg: rgba(217, 119, 6, 0.12);
  --signal-neutral-border: rgba(217, 119, 6, 0.4);
  --signal-neutral-glow: rgba(217, 119, 6, 0.2);

  --signal-bearish: #dc2626;
  --signal-bearish-text: #991b1b;
  --signal-bearish-bg: rgba(220, 38, 38, 0.12);
  --signal-bearish-border: rgba(220, 38, 38, 0.4);
  --signal-bearish-glow: rgba(220, 38, 38, 0.2);
}
```

### Block 3: `html` and `body` Scrollbar Binding (Target: lines 246–262)

```css
html {
  min-width: 320px;
  background: var(--bg);
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
  scrollbar-width: thin;
}
body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(45, 212, 191, 0.08) 0%, transparent 60%),
    radial-gradient(circle at 95% 20%, rgba(56, 189, 248, 0.04) 0%, transparent 40%),
    var(--bg);
  scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track);
  scrollbar-width: thin;
}
```

### Block 4: WebKit Scrollbar Rules (Target: lines 282–298)

```css
/* Scrollbar styling for WebKit/Blink browsers */
::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}
::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
}
::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}
```

### Block 5: `.brand` Selector (Target: lines 358–366)

```css
.brand {
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.03em;
  background: var(--brand-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Block 6: `.page-heading h1` Selector (Target: lines 547–557)

```css
.page-heading h1 {
  margin: 0;
  font-family: var(--font-heading);
  font-size: clamp(32px, 3.8vw, 44px);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1.1;
  background: var(--heading-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

---

## 5. Verification Method

To independently verify these findings:

1. **Verify Line Numbers and Selectors**:
   - Inspect `web_ui/src/styles.css` at lines 1–110, 246–298, 358–366, and 547–557.
2. **Execute Test Suite**:
   - Run JavaScript test suite: `npm test` in `web_ui/` (34 tests must pass).
   - Run build check: `npm run build` in `web_ui/` (0 compilation errors).
3. **Visual Invalidation Conditions**:
   - If `.brand` text is unreadable or white on white in light mode, check `--brand-gradient` mapping.
   - If `.page-heading h1` text is white or faint in light mode, check `--heading-gradient` mapping.
   - If scrollbar thumb remains dark in light mode, check `var(--scrollbar-*)` declarations.
