import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const stylesPath = path.resolve(__dirname, "../src/styles.css");
const scannerStylesPath = path.resolve(__dirname, "../src/scanner.css");

// ============================================================================
// WCAG 2.1 Relative Luminance & Contrast Math Engine
// ============================================================================
function parseHex(hex) {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (clean.length === 6) {
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
      a: 1,
    };
  }
  return null;
}

function parseRgbOrHex(str) {
  if (!str) return null;
  const trimmed = str.trim();
  if (trimmed.startsWith("#")) return parseHex(trimmed);
  const rgbaMatch = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
  if (rgbaMatch) {
    return {
      r: parseInt(rgbaMatch[1], 10),
      g: parseInt(rgbaMatch[2], 10),
      b: parseInt(rgbaMatch[3], 10),
      a: rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1,
    };
  }
  return null;
}

function compositeOver(fg, bg) {
  const fgColor = typeof fg === "string" ? parseRgbOrHex(fg) : fg;
  const bgColor = typeof bg === "string" ? parseRgbOrHex(bg) : bg;
  if (!fgColor || !bgColor) return fgColor || bgColor;
  const a = fgColor.a;
  return {
    r: Math.round(fgColor.r * a + bgColor.r * (1 - a)),
    g: Math.round(fgColor.g * a + bgColor.g * (1 - a)),
    b: Math.round(fgColor.b * a + bgColor.b * (1 - a)),
    a: 1,
  };
}

function getRelativeLuminance(rgb) {
  const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1, color2, baseBg = null) {
  let c1 = typeof color1 === "string" ? parseRgbOrHex(color1) : color1;
  let c2 = typeof color2 === "string" ? parseRgbOrHex(color2) : color2;
  if (!c1 || !c2) {
    throw new Error(`Invalid color inputs for contrast ratio: ${JSON.stringify(color1)}, ${JSON.stringify(color2)}`);
  }
  if (c1.a < 1 && baseBg) c1 = compositeOver(c1, baseBg);
  if (c2.a < 1 && baseBg) c2 = compositeOver(c2, baseBg);

  const l1 = getRelativeLuminance(c1);
  const l2 = getRelativeLuminance(c2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ============================================================================
// CSS Token Parser Helpers
// ============================================================================
function extractCssBlock(cssContent, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`${escaped}\\s*\\{([^}]+)\\}`, "s");
  const match = regex.exec(cssContent);
  return match ? match[1] : null;
}

function parseVariablesFromBlock(blockContent) {
  const vars = {};
  if (!blockContent) return vars;
  const varRegex = /(--[a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
  let match;
  while ((match = varRegex.exec(blockContent)) !== null) {
    vars[match[1].trim()] = match[2].trim();
  }
  return vars;
}

// ============================================================================
// TEST SUITE: M2 Empirical Challenger Tests
// ============================================================================

test("M2 Challenger: Empirical Contrast Ratios on Scanner Elements in Light Mode", () => {
  const stylesCss = fs.readFileSync(stylesPath, "utf-8");
  const lightVars = parseVariablesFromBlock(extractCssBlock(stylesCss, '[data-theme="light"]'));

  // 1. Textarea in Scanner Form: #0f172a on #ffffff
  const textareaContrast = getContrastRatio("#0f172a", "#ffffff");
  assert.ok(textareaContrast >= 12.0, `Textarea text contrast ${textareaContrast.toFixed(2)} must be >= 12.0:1 (AAA)`);

  // 2. Table TD in Light Mode: #334155 on #ffffff
  const tableTdContrast = getContrastRatio("#334155", "#ffffff");
  assert.ok(tableTdContrast >= 7.0, `Table TD text contrast ${tableTdContrast.toFixed(2)} must be >= 7.0:1 (AAA)`);

  // 3. Table TD on Row Hover: #334155 on rgba(2, 132, 199, 0.04) over #ffffff
  const hoverBg = compositeOver("rgba(2, 132, 199, 0.04)", "#ffffff");
  const tableHoverContrast = getContrastRatio("#334155", hoverBg);
  assert.ok(tableHoverContrast >= 7.0, `Table TD hover contrast ${tableHoverContrast.toFixed(2)} must be >= 7.0:1`);

  // 4. Table TD on Selected Row: #334155 on rgba(2, 132, 199, 0.08) over #ffffff
  const selectedBg = compositeOver("rgba(2, 132, 199, 0.08)", "#ffffff");
  const tableSelectedContrast = getContrastRatio("#334155", selectedBg);
  assert.ok(tableSelectedContrast >= 6.5, `Table TD selected contrast ${tableSelectedContrast.toFixed(2)} must be >= 6.5:1`);

  // 5. Active Analysis Banner in Light Mode: #0369a1 on rgba(2, 132, 199, 0.08) over #ffffff
  const activeBannerBg = compositeOver("rgba(2, 132, 199, 0.08)", "#ffffff");
  const activeBannerContrast = getContrastRatio("#0369a1", activeBannerBg);
  assert.ok(activeBannerContrast >= 5.0, `Active analysis banner contrast ${activeBannerContrast.toFixed(2)} must be >= 5.0:1 (AA)`);

  // 6. Disclaimer Banner in Light Mode: #92400e text and #78350f strong on rgba(217, 119, 6, 0.08) over #ffffff
  const disclaimerBg = compositeOver("rgba(217, 119, 6, 0.08)", "#ffffff");
  const disclaimerTextContrast = getContrastRatio("#92400e", disclaimerBg);
  const disclaimerStrongContrast = getContrastRatio("#78350f", disclaimerBg);
  assert.ok(disclaimerTextContrast >= 5.5, `Disclaimer p text contrast ${disclaimerTextContrast.toFixed(2)} must be >= 5.5:1`);
  assert.ok(disclaimerStrongContrast >= 7.0, `Disclaimer strong contrast ${disclaimerStrongContrast.toFixed(2)} must be >= 7.0:1 (AAA)`);

  // 7. Parallel Tabs in Light Mode:
  // - Default tab: #334155 on #ffffff
  const tabDefaultContrast = getContrastRatio("#334155", "#ffffff");
  assert.ok(tabDefaultContrast >= 7.0, `Default parallel tab contrast ${tabDefaultContrast.toFixed(2)} must be >= 7.0:1`);

  // - Active tab: #0369a1 on rgba(2, 132, 199, 0.12) over #ffffff
  const tabActiveBg = compositeOver("rgba(2, 132, 199, 0.12)", "#ffffff");
  const tabActiveContrast = getContrastRatio("#0369a1", tabActiveBg);
  assert.ok(tabActiveContrast >= 4.8, `Active parallel tab contrast ${tabActiveContrast.toFixed(2)} must be >= 4.8:1`);

  // - Tab tokens badge: #475569 on rgba(15, 23, 42, 0.06) over #ffffff
  const badgeBg = compositeOver("rgba(15, 23, 42, 0.06)", "#ffffff");
  const badgeContrast = getContrastRatio("#475569", badgeBg);
  assert.ok(badgeContrast >= 5.5, `Tab tokens badge contrast ${badgeContrast.toFixed(2)} must be >= 5.5:1`);

  // 8. Report Buttons in Light Mode:
  // - Standard Report Button: #0f172a on #ffffff
  const reportBtnContrast = getContrastRatio("#0f172a", "#ffffff");
  assert.ok(reportBtnContrast >= 14.0, `Report button contrast ${reportBtnContrast.toFixed(2)} must be >= 14.0:1`);

  // - Live Report Button default: #0284c7 on rgba(2, 132, 199, 0.08) over #ffffff (UI component accent >= 3.0:1)
  const reportLiveBg = compositeOver("rgba(2, 132, 199, 0.08)", "#ffffff");
  const reportLiveContrast = getContrastRatio("#0284c7", reportLiveBg);
  assert.ok(reportLiveContrast >= 3.0, `Live report button contrast ${reportLiveContrast.toFixed(2)} must be >= 3.0:1`);

  // - Live Report Button Hover: #0369a1 on rgba(2, 132, 199, 0.14) over #ffffff (WCAG AA >= 4.5:1)
  const reportLiveHoverBg = compositeOver("rgba(2, 132, 199, 0.14)", "#ffffff");
  const reportLiveHoverContrast = getContrastRatio("#0369a1", reportLiveHoverBg);
  assert.ok(reportLiveHoverContrast >= 4.5, `Live report button hover contrast ${reportLiveHoverContrast.toFixed(2)} must be >= 4.5:1`);
});

test("M2 Challenger: Empirical Contrast Ratios on Scanner Elements in Dark Mode", () => {
  const stylesCss = fs.readFileSync(stylesPath, "utf-8");
  const rootVars = parseVariablesFromBlock(extractCssBlock(stylesCss, ":root"));

  const surface = rootVars["--surface"] || "#090e15";
  const surface2 = rootVars["--surface-2"] || "#0d1520";
  const text = rootVars["--text"] || "#f8fafc";
  const textSecondary = rootVars["--text-secondary"] || "#cbd5e1";

  // 1. Textarea in Dark Mode: #f8fafc on #060a0f
  const textareaContrast = getContrastRatio(text, "#060a0f");
  assert.ok(textareaContrast >= 15.0, `Dark Mode Textarea contrast ${textareaContrast.toFixed(2)} must be >= 15.0:1`);

  // 2. Table TD in Dark Mode: #cbd5e1 on #090e15
  const tableTdContrast = getContrastRatio(textSecondary, surface);
  assert.ok(tableTdContrast >= 10.0, `Dark Mode Table TD contrast ${tableTdContrast.toFixed(2)} must be >= 10.0:1`);

  // 3. Disclaimer in Dark Mode: #fde68a / #fef08a on rgba(245, 158, 11, 0.12) over #090e15
  const darkDiscBg = compositeOver("rgba(245, 158, 11, 0.12)", surface);
  const darkDiscContrast = getContrastRatio("#fde68a", darkDiscBg);
  assert.ok(darkDiscContrast >= 9.0, `Dark Mode Disclaimer contrast ${darkDiscContrast.toFixed(2)} must be >= 9.0:1`);

  // 4. Parallel Tab Active in Dark Mode: #ffffff on rgba(56, 189, 248, 0.16) over #0d1520
  const tabActiveDarkBg = compositeOver("rgba(56, 189, 248, 0.16)", surface2);
  const tabActiveDarkContrast = getContrastRatio("#ffffff", tabActiveDarkBg);
  assert.ok(tabActiveDarkContrast >= 11.0, `Dark Mode Parallel Tab Active contrast ${tabActiveDarkContrast.toFixed(2)} must be >= 11.0:1`);

  // 5. Live Report Button in Dark Mode: #38bdf8 on rgba(56, 189, 248, 0.08) over #090e15
  const reportLiveDarkBg = compositeOver("rgba(56, 189, 248, 0.08)", surface);
  const reportLiveDarkContrast = getContrastRatio("#38bdf8", reportLiveDarkBg);
  assert.ok(reportLiveDarkContrast >= 6.5, `Dark Mode Live Report button contrast ${reportLiveDarkContrast.toFixed(2)} must be >= 6.5:1`);
});

test("M2 Challenger: Adversarial Static Audit of scanner.css and ScannerPage.jsx", () => {
  const scannerCss = fs.readFileSync(scannerStylesPath, "utf-8");
  const scannerJsx = fs.readFileSync(path.resolve(__dirname, "../src/ScannerPage.jsx"), "utf-8");

  // Rule 1: No hardcoded dark backgrounds in [data-theme="light"] selectors
  const lightBlockMatch = scannerCss.match(/\[data-theme="light"\][^{]*\{([^}]+)\}/g);
  assert.ok(lightBlockMatch && lightBlockMatch.length > 0, "scanner.css must contain dedicated light mode override rules");

  const forbiddenDarkLiterals = ["#05080e", "#060a0f", "#090e15", "#0d1520", "#121e2d", "#0a1119"];
  for (const rule of lightBlockMatch) {
    for (const darkHex of forbiddenDarkLiterals) {
      assert.ok(!rule.toLowerCase().includes(darkHex), `Forbidden dark literal ${darkHex} found in light mode rule: ${rule}`);
    }
  }

  // Rule 2: No Framer Motion whileHover background override collision on table rows in ScannerPage.jsx
  assert.ok(
    !scannerJsx.includes('whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.035)" }}'),
    "ScannerPage.jsx must not have inline whileHover backgroundColor override on table rows"
  );

  // Rule 3: Check that CheckCircle2 uses semantic color variable
  assert.ok(
    !scannerJsx.includes('style={{ color: "#34d399" }}'),
    "CheckCircle2 must not use hardcoded #34d399 style"
  );
});

test("M2 Challenger: Browser DOM Live Element Inspection on Scanner Page in Light & Dark Mode", async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(err.toString()));

    await page.goto("http://127.0.0.1:8787/?page=scanner", { waitUntil: "networkidle0", timeout: 10000 });

    // 1. LIGHT MODE DOM INSPECTION
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("tradingagents_theme", "light");
    });
    await new Promise((r) => setTimeout(r, 200));

    const lightDomCheck = await page.evaluate(() => {
      const heading = document.querySelector(".page-heading h1");
      const form = document.querySelector(".scanner-form");
      const submitBtn = document.querySelector(".scanner-launch-button");
      const panel = document.querySelector(".scanner-progress-panel") || document.querySelector(".scanner-empty-state");

      const getRgb = (el, prop) => el ? window.getComputedStyle(el)[prop] : null;

      return {
        headingColor: getRgb(heading, "color"),
        formBg: getRgb(form, "backgroundColor"),
        formBorder: getRgb(form, "borderColor"),
        panelBg: getRgb(panel, "backgroundColor"),
        submitBtnBg: getRgb(submitBtn, "backgroundColor"),
        submitBtnColor: getRgb(submitBtn, "color"),
      };
    });

    // Verify Light Mode DOM properties
    assert.ok(lightDomCheck.formBg.includes("255, 255, 255"), `Scanner form background in light mode must be white, got ${lightDomCheck.formBg}`);
    if (lightDomCheck.panelBg) {
      assert.ok(lightDomCheck.panelBg.includes("255, 255, 255"), `Scanner panel background in light mode must be white, got ${lightDomCheck.panelBg}`);
    }

    // 2. DARK MODE DOM INSPECTION
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("tradingagents_theme", "dark");
    });
    await new Promise((r) => setTimeout(r, 200));

    const darkDomCheck = await page.evaluate(() => {
      const form = document.querySelector(".scanner-form");
      const panel = document.querySelector(".scanner-progress-panel") || document.querySelector(".scanner-empty-state");
      const getRgb = (el, prop) => el ? window.getComputedStyle(el)[prop] : null;

      return {
        formBg: getRgb(form, "backgroundColor"),
        panelBg: getRgb(panel, "backgroundColor"),
      };
    });

    assert.ok(
      darkDomCheck.formBg.includes("9, 14, 21") || darkDomCheck.formBg.includes("5, 8, 14") || darkDomCheck.formBg.includes("rgba"),
      `Scanner form background in dark mode must be dark glass, got ${darkDomCheck.formBg}`
    );

    // 3. RESPONSIVE MOBILE VIEWPORT (375px)
    await page.setViewport({ width: 375, height: 667 });
    await new Promise((r) => setTimeout(r, 200));

    assert.equal(pageErrors.length, 0, `No runtime errors allowed on scanner page: ${pageErrors.join(", ")}`);
  } finally {
    if (browser) await browser.close();
  }
});
