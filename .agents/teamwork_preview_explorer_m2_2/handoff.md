# Handoff Report — Explorer 2 (Milestone 2: Scanner Inputs, Tabs & Action Buttons)

## 1. Observation

### 1.1 Hardcoded Dark Colors & Specificity in `web_ui/src/scanner.css`
Direct examination of `web_ui/src/scanner.css` reveals the following hardcoded dark properties:

- **Lines 18–33 (`.scanner-symbols-field textarea`)**:
  ```css
  18: .scanner-symbols-field { grid-column: 1 / -1; }
  19: .scanner-symbols-field textarea {
  20:   width: 100%;
  21:   min-height: 72px;
  22:   resize: vertical;
  23:   border: 1px solid rgba(255, 255, 255, 0.1);
  24:   border-radius: var(--radius-sm);
  25:   padding: 12px 14px;
  26:   color: var(--text);
  27:   background: #060a0f;
  28:   font: inherit;
  29:   font-size: 13px;
  30:   line-height: 1.5;
  31:   transition: all 150ms ease;
  32:   box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.4);
  33: }
  ```
  - **Issue**: `background: #060a0f;` and `border: 1px solid rgba(255, 255, 255, 0.1);` are hardcoded dark colors. Due to stylesheet cascade ordering, `.scanner-symbols-field textarea` overrides `[data-theme="light"] textarea` in `styles.css`.
  - **Issue**: In light mode, `rgba(255, 255, 255, 0.1)` border is invisible on white backgrounds, and `#060a0f` makes the textarea a black rectangle.

- **Lines 107–109 (`.scanner-report-button`)**:
  ```css
  107: .scanner-report-button { display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 7px 11px; color: var(--text); background: #0a1119; font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: all 140ms ease; }
  108: .scanner-report-button:hover { border-color: var(--sky, #38bdf8); color: var(--sky, #38bdf8); background: rgba(56, 189, 248, 0.08); transform: translateY(-1px); }
  109: .scanner-report-button:disabled { cursor: not-allowed; opacity: 0.45; }
  ```
  - **Issue**: `background: #0a1119;` is hardcoded dark black/navy. In light mode, the button remains a dark block on light table rows.

- **Lines 197–242 (`.scanner-parallel-tab`, `.tab-tokens-badge`)**:
  ```css
  197: .scanner-parallel-tab {
  198:   display: inline-flex;
  199:   align-items: center;
  200:   gap: 7px;
  201:   padding: 6px 12px;
  202:   border-radius: var(--radius-pill);
  203:   background: rgba(255, 255, 255, 0.03);
  204:   border: 1px solid var(--line);
  205:   color: #cbd5e1;
  206:   font-size: 12px;
  207:   font-weight: 600;
  208:   cursor: pointer;
  209:   transition: all 140ms ease;
  210: }
  211: 
  212: .scanner-parallel-tab:hover {
  213:   background: rgba(56, 189, 248, 0.08);
  214:   border-color: rgba(56, 189, 248, 0.4);
  215:   color: #fff;
  216: }
  217: 
  218: .scanner-parallel-tab.active {
  219:   background: rgba(56, 189, 248, 0.16);
  220:   border-color: var(--sky, #38bdf8);
  221:   color: #fff;
  222:   box-shadow: 0 0 12px rgba(56, 189, 248, 0.25);
  223: }
  224: 
  225: .scanner-parallel-tab small {
  226:   font-size: 10px;
  227:   color: var(--muted);
  228:   font-weight: 500;
  229: }
  230: 
  231: .scanner-parallel-tab.active small {
  232:   color: #7dd3fc;
  233: }
  234: 
  235: .tab-tokens-badge {
  236:   font-size: 10px;
  237:   padding: 1px 5px;
  238:   border-radius: 6px;
  239:   background: rgba(0, 0, 0, 0.35);
  240:   color: #94a3b8;
  241:   font-variant-numeric: tabular-nums;
  242: }
  ```
  - **Issue**: `.scanner-parallel-tab.active` defines `color: #fff;` and `.scanner-parallel-tab.active small` defines `color: #7dd3fc;`. In light mode, `#ffffff` and `#7dd3fc` against pale blue `rgba(56, 189, 248, 0.16)` fail WCAG AA contrast dramatically (< 1.5:1).
  - **Issue**: `.tab-tokens-badge` uses `background: rgba(0, 0, 0, 0.35); color: #94a3b8;`, which renders as an unreadable dark patch in light mode.

- **Lines 147–157 (`.live-pill`)**:
  ```css
  147: .live-pill {
  148:   font-size: 10px;
  149:   font-weight: 700;
  150:   text-transform: uppercase;
  151:   letter-spacing: 0.05em;
  152:   padding: 2px 7px;
  153:   border-radius: var(--radius-md);
  154:   background: rgba(56, 189, 248, 0.14);
  155:   color: #7dd3fc;
  156:   border: 1px solid rgba(56, 189, 248, 0.35);
  157: }
  ```
  - **Issue**: `color: #7dd3fc;` on `background: rgba(56, 189, 248, 0.14)` is illegible in light mode (~1.4:1 contrast).

### 1.2 Inline Styles and Framer Motion Conflicts in `web_ui/src/ScannerPage.jsx`
- **Line 209**:
  ```jsx
  209: {isComplete ? <CheckCircle2 size={12} style={{ color: "#34d399" }} /> : null}
  ```
  - **Issue**: Hardcoded `#34d399` has poor contrast on light backgrounds. Should use `var(--signal-bullish)`.
- **Line 313**:
  ```jsx
  313: whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.035)" }}
  ```
  - **Issue**: In Framer Motion, inline `whileHover` overrides CSS `:hover` specificity! In light mode, hovering over a table row injects `rgba(255, 255, 255, 0.035)` which washes out rows.
- **Line 390**:
  ```jsx
  390: style={{ color: "var(--sky, #38bdf8)", borderColor: "rgba(56, 189, 248, 0.4)" }}
  ```
  - **Issue**: Hardcoded cyan border in inline style. Should be extracted to `.scanner-report-button.live` CSS class.

---

## 2. Logic Chain

1. **Design Token Foundation Compliance**:
   - `web_ui/src/styles.css` defines `:root` (dark mode) and `[data-theme="light"]` (light mode) semantic variables:
     - `--surface-input`: `#060a0f` (dark) / `#ffffff` (light)
     - `--surface-2`: `#0d1520` (dark) / `#f8fafc` (light)
     - `--text`: `#f8fafc` (dark) / `#0f172a` (light)
     - `--text-secondary`: `#cbd5e1` (dark) / `#334155` (light)
     - `--muted`: `#94a3b8` (dark) / `#64748b` (light)
     - `--line`: `rgba(255, 255, 255, 0.085)` (dark) / `rgba(15, 23, 42, 0.09)` (light)
     - `--sky`: `#38bdf8` (dark) / `#0284c7` (light)
     - `--sky-soft`: `rgba(56, 189, 248, 0.12)` (dark) / `rgba(2, 132, 199, 0.1)` (light)
     - `--signal-bullish`: `#10b981` (dark) / `#059669` (light)
2. **Replacing Hardcoded Colors in Base CSS**:
   - In `scanner.css`, `.scanner-symbols-field textarea` should use `background: var(--surface-input);`, `color: var(--text);`, and `border: 1px solid var(--line);`.
   - In `scanner.css`, `.scanner-report-button` should use `background: var(--surface-2);`, `color: var(--text);`, and `border: 1px solid var(--line);`.
   - In `scanner.css`, `.scanner-parallel-tab` should use `color: var(--text-secondary);` and `border: 1px solid var(--line);`.
3. **Explicit Light Mode Theme Overrides (`[data-theme="light"]`)**:
   - Textarea: crisp white surface `#ffffff`, slate border `rgba(15, 23, 42, 0.14)`, dark slate text `#0f172a` (contrast 15.6:1), sky blue focus ring `#0284c7`.
   - Launch button when disabled: clean muted surface `#f1f5f9`, border `rgba(15, 23, 42, 0.12)`, text `#94a3b8`.
   - Report button: crisp white `#ffffff`, slate border `rgba(15, 23, 42, 0.12)`, dark text `#0f172a`, hover tint `rgba(2, 132, 199, 0.08)`.
   - Parallel switcher tabs:
     - Inactive: background `#ffffff`, border `rgba(15, 23, 42, 0.12)`, text `#334155` (contrast 9.5:1), subtitle `#64748b` (contrast 4.6:1).
     - Active: background `rgba(2, 132, 199, 0.12)`, border `#0284c7`, text `#0369a1` (contrast 5.8:1), subtitle `#0284c7` (contrast 4.6:1).
     - Token badge: background `rgba(15, 23, 42, 0.06)`, text `#475569` (contrast 7.2:1); active badge background `rgba(2, 132, 199, 0.16)`, text `#0369a1` (contrast 5.4:1).
   - Live Pill: background `rgba(2, 132, 199, 0.1)`, text `#0284c7`, border `rgba(2, 132, 199, 0.3)`.
4. **Eliminating Inline Style & Motion Overrides in JSX**:
   - Remove `whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.035)" }}` on `<motion.tr>`. Let CSS handle `:hover` in both themes.
   - Replace inline `style={{ color: "#34d399" }}` on `<CheckCircle2>` with `style={{ color: "var(--signal-bullish, #10b981)" }}`.
   - Replace inline styles on the live button with `className="scanner-report-button live"`.

---

## 3. Caveats

- Form container cards (`.scanner-form`, `.scanner-progress-panel`, `.scanner-results-panel`, `.scanner-empty-state`) are investigated by Explorer 1.
- Table cells, progress bars, and disclaimers are investigated by Explorer 3.
- All proposals here are strictly scoped to Scanner inputs, tabs, action buttons, live pill badges, and conflicting JSX motion/inline styles.

---

## 4. Conclusion & Ready-to-Apply Snippets

### 4.1 Changes in `web_ui/src/scanner.css`

#### Patch A: Base Style Refactorings (Lines 18–39, 107–109, 147–157, 197–242)

**Replace lines 18–38:**
```css
.scanner-symbols-field { grid-column: 1 / -1; }
.scanner-symbols-field textarea {
  width: 100%;
  min-height: 72px;
  resize: vertical;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  color: var(--text);
  background: var(--surface-input);
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
  transition: all 150ms ease;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
}
.scanner-symbols-field textarea:hover {
  border-color: rgba(255, 255, 255, 0.2);
}
.scanner-symbols-field textarea:focus-visible {
  outline: 2px solid var(--sky, #38bdf8);
  outline-offset: 2px;
  border-color: var(--sky, #38bdf8);
  box-shadow: 0 0 0 3px var(--sky-soft);
}
```

**Replace lines 107–109:**
```css
.scanner-report-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 7px 11px;
  color: var(--text);
  background: var(--surface-2);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 140ms ease;
}
.scanner-report-button:hover {
  border-color: var(--sky, #38bdf8);
  color: var(--sky, #38bdf8);
  background: var(--sky-soft);
  transform: translateY(-1px);
}
.scanner-report-button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.scanner-report-button.live {
  color: var(--sky, #38bdf8);
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(56, 189, 248, 0.08);
}
.scanner-report-button.live:hover {
  background: rgba(56, 189, 248, 0.16);
  border-color: var(--sky, #38bdf8);
}
```

**Replace lines 197–242:**
```css
.scanner-parallel-tab {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--line);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 140ms ease;
}

.scanner-parallel-tab:hover {
  background: rgba(56, 189, 248, 0.08);
  border-color: rgba(56, 189, 248, 0.4);
  color: var(--text);
}

.scanner-parallel-tab.active {
  background: rgba(56, 189, 248, 0.16);
  border-color: var(--sky, #38bdf8);
  color: #ffffff;
  box-shadow: 0 0 12px rgba(56, 189, 248, 0.25);
}

.scanner-parallel-tab small {
  font-size: 10px;
  color: var(--muted);
  font-weight: 500;
}

.scanner-parallel-tab.active small {
  color: #7dd3fc;
}

.tab-tokens-badge {
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.35);
  color: #94a3b8;
  font-variant-numeric: tabular-nums;
}
```

#### Patch B: Light Theme Overrides Section (Append to `scanner.css`)
```css
/* ==========================================================================
   Mode Jour / Light Theme Overrides
   ========================================================================== */
[data-theme="light"] .scanner-form .field > span {
  color: #334155;
}

[data-theme="light"] .scanner-symbols-field textarea {
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.14);
  color: #0f172a;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
}

[data-theme="light"] .scanner-symbols-field textarea:hover {
  border-color: rgba(15, 23, 42, 0.25);
}

[data-theme="light"] .scanner-symbols-field textarea:focus-visible {
  outline: 2px solid var(--sky);
  outline-offset: 2px;
  border-color: var(--sky);
  box-shadow: 0 0 0 3px var(--sky-soft);
}

[data-theme="light"] .scanner-launch-button:disabled {
  background: #f1f5f9;
  border-color: rgba(15, 23, 42, 0.12);
  color: #94a3b8;
  box-shadow: none;
}

[data-theme="light"] .scanner-report-button {
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.12);
  color: #0f172a;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

[data-theme="light"] .scanner-report-button:hover {
  border-color: var(--sky);
  color: var(--sky);
  background: var(--sky-soft);
  box-shadow: 0 2px 6px rgba(2, 132, 199, 0.12);
}

[data-theme="light"] .scanner-report-button.live {
  color: #0284c7;
  border-color: rgba(2, 132, 199, 0.4);
  background: rgba(2, 132, 199, 0.08);
}

[data-theme="light"] .scanner-report-button.live:hover {
  color: #0369a1;
  background: rgba(2, 132, 199, 0.14);
  border-color: #0284c7;
}

[data-theme="light"] .live-pill {
  background: rgba(2, 132, 199, 0.1);
  color: #0284c7;
  border-color: rgba(2, 132, 199, 0.3);
}

[data-theme="light"] .scanner-parallel-tabs-label {
  color: #64748b;
}

[data-theme="light"] .scanner-parallel-tab {
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.12);
  color: #334155;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

[data-theme="light"] .scanner-parallel-tab:hover {
  background: rgba(2, 132, 199, 0.06);
  border-color: rgba(2, 132, 199, 0.35);
  color: #0f172a;
}

[data-theme="light"] .scanner-parallel-tab.active {
  background: rgba(2, 132, 199, 0.12);
  border-color: #0284c7;
  color: #0369a1;
  box-shadow: 0 0 0 1px rgba(2, 132, 199, 0.2), 0 2px 6px rgba(2, 132, 199, 0.12);
}

[data-theme="light"] .scanner-parallel-tab small {
  color: #64748b;
}

[data-theme="light"] .scanner-parallel-tab.active small {
  color: #0284c7;
}

[data-theme="light"] .tab-tokens-badge {
  background: rgba(15, 23, 42, 0.06);
  color: #475569;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

[data-theme="light"] .scanner-parallel-tab.active .tab-tokens-badge {
  background: rgba(2, 132, 199, 0.16);
  color: #0369a1;
  border-color: rgba(2, 132, 199, 0.25);
}
```

---

### 4.2 Changes in `web_ui/src/ScannerPage.jsx`

#### Item 1: Line 209 (CheckCircle2 icon color in tab)
**Before (line 209):**
```jsx
{isComplete ? <CheckCircle2 size={12} style={{ color: "#34d399" }} /> : null}
```
**After:**
```jsx
{isComplete ? <CheckCircle2 size={12} style={{ color: "var(--signal-bullish, #10b981)" }} /> : null}
```

#### Item 2: Lines 306–314 (Eliminate motion whileHover background clash on table rows)
**Before (lines 306–314):**
```jsx
<motion.tr
  key={candidate.symbol}
  className={`${candidate.blocked ? "blocked-row" : ""} ${isSelected ? "selected-row" : ""}`}
  variants={{
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
  }}
  whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.035)" }}
>
```
**After:**
```jsx
<motion.tr
  key={candidate.symbol}
  className={`${candidate.blocked ? "blocked-row" : ""} ${isSelected ? "selected-row" : ""}`}
  variants={{
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
  }}
>
```

#### Item 3: Lines 387–397 (Refactor live button to use CSS class)
**Before (lines 387–397):**
```jsx
) : isRunning ? (
  <motion.button
    type="button"
    className="scanner-report-button"
    style={{ color: "var(--sky, #38bdf8)", borderColor: "rgba(56, 189, 248, 0.4)" }}
    onClick={() => onSelectTicker && onSelectTicker(candidate.symbol)}
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.96 }}
  >
    <Zap size={13} /> Direct
  </motion.button>
) : null}
```
**After:**
```jsx
) : isRunning ? (
  <motion.button
    type="button"
    className="scanner-report-button live"
    onClick={() => onSelectTicker && onSelectTicker(candidate.symbol)}
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.96 }}
  >
    <Zap size={13} /> Direct
  </motion.button>
) : null}
```

---

## 5. Verification Method

To verify these changes independently:

1. **Unit & E2E Test Suite**:
   ```bash
   cd /Users/etienne/Documents/ChatGPT/TradingAgents/web_ui
   npm test
   ```
   Must pass 46/46 tests (100%), including:
   - `Tier 1: Absence of Hardcoded Dark Colors in Light Mode Selectors`
   - `Tier 2: WCAG AA Color Contrast Validation in Light Mode`
   - `Tier 4: E2E Theme Switching & View Contrast Verification Across All 8 Views`

2. **Production Build**:
   ```bash
   cd /Users/etienne/Documents/ChatGPT/TradingAgents/web_ui
   npm run build
   ```
   Must compile 0 errors and produce clean chunks.

3. **Visual Inspection**:
   - Toggle theme to light mode in `ScannerPage`.
   - Verify textarea has crisp `#ffffff` background with dark text `#0f172a` and subtle slate border.
   - Verify parallel analysis tabs show distinct active state with high-contrast text (`#0369a1`) and token pill.
   - Verify report buttons have crisp white background and clear hover/active states.
   - Verify table row hovering doesn't flash white artifacts.
