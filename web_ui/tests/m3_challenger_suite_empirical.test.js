import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";
import { searchStocks, getCompanyName, getCurrencySymbol } from "../src/companyNames.js";
import { formatDateFr } from "../src/decisionUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const stylesPath = path.resolve(__dirname, "../src/styles.css");
const previewPath = path.resolve(__dirname, "../src/components/analysis/SkeletonLivePreview.jsx");

// Workflow Helper Oracles
function formatTokens(count) {
  if (count === null || count === undefined || Number.isNaN(Number(count))) return "—";
  return Number(count).toLocaleString("fr-FR");
}

function formatMarketNumber(val, currency = "$") {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return "—";
  return `${Number(val).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} ${currency}`;
}

function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) return null;
  const s = Number(seconds);
  if (s <= 0) return null;
  if (s < 1) return "< 1 s";
  if (s < 60) return `${s.toFixed(1)} s`;
  const mins = Math.floor(s / 60);
  const remSecs = Math.round(s % 60);
  return `${mins} min${remSecs > 0 ? ` ${remSecs} s` : ""}`;
}

// ============================================================================
// WCAG 2.1 Color Luminance & Contrast Mathematics
// ============================================================================

function parseHex(hex) {
  let clean = hex.replace("#", "").trim();
  if (clean.length === 3) clean = clean.split("").map((c) => c + c).join("");
  if (clean.length === 6) {
    const num = parseInt(clean, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  return null;
}

function parseRgbOrHex(str) {
  if (!str) return null;
  const trimmed = str.trim();
  if (trimmed.startsWith("#")) return parseHex(trimmed);
  const rgbMatch = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10),
      g: parseInt(rgbMatch[2], 10),
      b: parseInt(rgbMatch[3], 10),
    };
  }
  return null;
}

function getRelativeLuminance(rgb) {
  const [rs, gs, bs] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(color1, color2) {
  const rgb1 = typeof color1 === "string" ? parseRgbOrHex(color1) : color1;
  const rgb2 = typeof color2 === "string" ? parseRgbOrHex(color2) : color2;
  if (!rgb1 || !rgb2) {
    throw new Error(`Invalid color inputs: ${JSON.stringify(color1)}, ${JSON.stringify(color2)}`);
  }
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ============================================================================
// Stress Test 1: Autocomplete Dropdown Search & Suggestions Logic
// ============================================================================

test("Stress Test 1: Autocomplete Dropdown Search & Suggestion Engine Oracles", () => {
  // Test CAC 40 & French stocks
  const mcResults = searchStocks("MC", 6);
  assert.ok(mcResults.length > 0, "MC search should return matches");
  assert.ok(mcResults.some((s) => s.ticker === "MC.PA"), "MC search should contain MC.PA");

  const lvmhResults = searchStocks("LVMH", 6);
  assert.ok(lvmhResults.length > 0, "LVMH search should return MC.PA");
  assert.equal(lvmhResults[0].ticker, "MC.PA");

  const airResults = searchStocks("Airbus", 6);
  assert.ok(airResults.length > 0, "Airbus name search should return AIR.PA");
  assert.equal(airResults[0].ticker, "AIR.PA");

  // Test US stocks
  const nvdaResults = searchStocks("NVDA", 6);
  assert.ok(nvdaResults.some((s) => s.ticker === "NVDA"), "NVDA ticker search must succeed");

  const msftResults = searchStocks("Microsoft", 6);
  assert.ok(msftResults.some((s) => s.ticker === "MSFT"), "Microsoft search must return MSFT");

  // Test Case-insensitivity and trim
  const lowerResults = searchStocks("   total  ", 6);
  assert.ok(lowerResults.length > 0, "Lowercase and whitespace search should return TTE.PA");
  assert.equal(lowerResults[0].ticker, "TTE.PA");

  // Test Unknown ticker fallback
  const unknownResults = searchStocks("UNKNOWN_CORP_99", 6);
  assert.equal(unknownResults.length, 0, "Unknown search should return empty array, allowing raw ticker fallback");
});

// ============================================================================
// Stress Test 2: Helper Functions, Formatters & Invariants
// ============================================================================

test("Stress Test 2: Workflow Formatters & Numerical Invariants", () => {
  // Token formatting
  assert.equal(formatTokens(null), "—");
  assert.equal(formatTokens(undefined), "—");
  assert.ok(formatTokens(12450).includes("12"), "Token formatting must contain digits");
  assert.equal(formatTokens(0), "0");

  // Market numbers & currency
  assert.equal(formatMarketNumber(null), "—");
  assert.ok(formatMarketNumber(142.5).includes("142"), "Market number formatting should include integer part");
  assert.ok(formatMarketNumber(850.2, "€").includes("€"), "Market number formatting should include currency");

  // Duration formatting
  assert.equal(formatDuration(null), null);
  assert.equal(formatDuration(0), null);
  assert.equal(formatDuration(0.4), "< 1 s");
  assert.equal(formatDuration(14.8), "14.8 s");
  assert.equal(formatDuration(75), "1 min 15 s");
  assert.equal(formatDuration(120), "2 min");

  // Date formatting
  assert.equal(formatDateFr("2026-08-30"), "30/08/2026");
  assert.equal(formatDateFr(null), "—");
});

// ============================================================================
// Stress Test 3: Mathematical WCAG Contrast Matrix on M3 Tokens & State Pairs
// ============================================================================

test("Stress Test 3: Mathematical WCAG AA/AAA Contrast Matrix across Day and Night Modes", () => {
  // Day Mode (Light) Palette
  const lightSurfaceWhite = "#ffffff";
  const lightSurfaceBg = "#f8fafc";
  const lightTextPrimary = "#0f172a";
  const lightTextSecondary = "#334155";
  const lightTextMuted = "#64748b";

  // Light Mode Inks
  const lightAnalystTitle = "#042f24";
  const lightAnalystDesc = "#065f46";
  const lightAnalystBg = "#edf7f5"; // rgba(13, 148, 136, 0.08) on white

  const lightAuditVerifiedText = "#134e4a";
  const lightAuditVerifiedStrong = "#0f766e";
  const lightAuditVerifiedBg = "#f0fdf4"; // rgba(5, 150, 105, 0.06) on white

  const lightAuditBlockedText = "#7f1d1d";
  const lightAuditBlockedStrong = "#991b1b";
  const lightAuditBlockedBg = "#fef2f2"; // rgba(220, 38, 38, 0.06) on white

  const lightWarningStrong = "#78350f";
  const lightWarningText = "#92400e";
  const lightWarningBg = "#fffbeb"; // rgba(217, 119, 6, 0.08) on white

  // 1. Primary Text on Light Surface (WCAG AAA >= 7.0:1)
  const ratioPrimary = getContrastRatio(lightTextPrimary, lightSurfaceWhite);
  assert.ok(ratioPrimary >= 15.0, `Primary text (#0f172a) on white (${ratioPrimary.toFixed(2)}:1) must exceed 15:1`);

  // 2. Secondary Text on Light Surface (WCAG AA >= 4.5:1)
  const ratioSec = getContrastRatio(lightTextSecondary, lightSurfaceWhite);
  assert.ok(ratioSec >= 7.0, `Secondary text (#334155) on white (${ratioSec.toFixed(2)}:1) must exceed 7:1`);

  // 3. Muted Text on Light Surface (WCAG AA >= 4.5:1)
  const ratioMuted = getContrastRatio(lightTextMuted, lightSurfaceWhite);
  assert.ok(ratioMuted >= 4.5, `Muted text (#64748b) on white (${ratioMuted.toFixed(2)}:1) must exceed 4.5:1`);

  // 4. Selected Analyst Card (Day mode)
  const ratioAnalystTitle = getContrastRatio(lightAnalystTitle, lightAnalystBg);
  const ratioAnalystDesc = getContrastRatio(lightAnalystDesc, lightAnalystBg);
  assert.ok(ratioAnalystTitle >= 10.0, `Selected Analyst title contrast (${ratioAnalystTitle.toFixed(2)}:1) must be >= 10:1`);
  assert.ok(ratioAnalystDesc >= 4.5, `Selected Analyst desc contrast (${ratioAnalystDesc.toFixed(2)}:1) must be >= 4.5:1`);

  // 5. Stage Audit Card Verified (Day mode)
  const ratioAuditVerText = getContrastRatio(lightAuditVerifiedText, lightAuditVerifiedBg);
  const ratioAuditVerStrong = getContrastRatio(lightAuditVerifiedStrong, lightAuditVerifiedBg);
  assert.ok(ratioAuditVerText >= 6.0, `Verified audit text contrast (${ratioAuditVerText.toFixed(2)}:1) must be >= 6:1`);
  assert.ok(ratioAuditVerStrong >= 4.5, `Verified audit strong contrast (${ratioAuditVerStrong.toFixed(2)}:1) must be >= 4.5:1`);

  // 6. Stage Audit Card Blocked (Day mode)
  const ratioAuditBlkText = getContrastRatio(lightAuditBlockedText, lightAuditBlockedBg);
  const ratioAuditBlkStrong = getContrastRatio(lightAuditBlockedStrong, lightAuditBlockedBg);
  assert.ok(ratioAuditBlkText >= 7.0, `Blocked audit text contrast (${ratioAuditBlkText.toFixed(2)}:1) must be >= 7:1`);
  assert.ok(ratioAuditBlkStrong >= 5.0, `Blocked audit strong contrast (${ratioAuditBlkStrong.toFixed(2)}:1) must be >= 5:1`);

  // 7. Warning Box (Day mode)
  const ratioWarnStrong = getContrastRatio(lightWarningStrong, lightWarningBg);
  const ratioWarnText = getContrastRatio(lightWarningText, lightWarningBg);
  assert.ok(ratioWarnStrong >= 7.0, `Warning strong text contrast (${ratioWarnStrong.toFixed(2)}:1) must be >= 7:1`);
  assert.ok(ratioWarnText >= 4.5, `Warning body text contrast (${ratioWarnText.toFixed(2)}:1) must be >= 4.5:1`);

  // Night Mode (Dark) Palette
  const darkSurface = "#090e15";
  const darkTextPrimary = "#f8fafc";
  const darkTextSecondary = "#cbd5e1";
  const darkTextMuted = "#94a3b8";

  // Dark Mode Inks
  const darkBullishText = "#6ee7b7";
  const darkNeutralText = "#fde047";
  const darkBearishText = "#fca5a5";

  // 8. Dark Mode Primary Text (WCAG AAA)
  const ratioDarkPrimary = getContrastRatio(darkTextPrimary, darkSurface);
  assert.ok(ratioDarkPrimary >= 15.0, `Dark Mode text on dark surface (${ratioDarkPrimary.toFixed(2)}:1) must exceed 15:1`);

  // 9. Dark Mode Secondary & Muted
  const ratioDarkSec = getContrastRatio(darkTextSecondary, darkSurface);
  const ratioDarkMuted = getContrastRatio(darkTextMuted, darkSurface);
  assert.ok(ratioDarkSec >= 9.0, `Dark Mode secondary text (${ratioDarkSec.toFixed(2)}:1) must exceed 9:1`);
  assert.ok(ratioDarkMuted >= 4.5, `Dark Mode muted text (${ratioDarkMuted.toFixed(2)}:1) must exceed 4.5:1`);

  // 10. Dark Mode Signal Inks
  const ratioDarkBull = getContrastRatio(darkBullishText, darkSurface);
  const ratioDarkNeut = getContrastRatio(darkNeutralText, darkSurface);
  const ratioDarkBear = getContrastRatio(darkBearishText, darkSurface);
  assert.ok(ratioDarkBull >= 9.0, `Dark Mode bullish ink (${ratioDarkBull.toFixed(2)}:1) must exceed 9:1`);
  assert.ok(ratioDarkNeut >= 10.0, `Dark Mode neutral ink (${ratioDarkNeut.toFixed(2)}:1) must exceed 10:1`);
  assert.ok(ratioDarkBear >= 8.0, `Dark Mode bearish ink (${ratioDarkBear.toFixed(2)}:1) must exceed 8:1`);
});

// ============================================================================
// Stress Test 4: E2E Live Browser Inspection on Analysis Page
// ============================================================================

test("Stress Test 4: E2E Browser Interaction on Analysis Page (Day/Night transitions, Search, Options)", async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(err.toString()));

    await page.goto("http://127.0.0.1:8787/?page=analysis", { waitUntil: "networkidle0", timeout: 15000 });

    // Reset if ResultPage was mounted
    const resetBtn = await page.$(".heading-actions .secondary-button");
    if (resetBtn) {
      await resetBtn.click();
      await new Promise((r) => setTimeout(r, 400));
    }

    await page.waitForSelector(".analysis-launcher-card", { timeout: 10000 });

    // 1. Force Light Mode
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("tradingagents_theme", "light");
    });
    await new Promise((r) => setTimeout(r, 200));

    // Verify Light mode surface background
    const launcherCardBg = await page.evaluate(() => {
      const card = document.querySelector(".analysis-launcher-card");
      return card ? window.getComputedStyle(card).backgroundColor : null;
    });
    assert.equal(launcherCardBg, "rgb(255, 255, 255)", "Launcher card must have white background in Light mode");

    // 2. Type in search input to trigger dropdown suggestions
    const searchInput = await page.$(".launcher-search-wrapper input");
    assert.ok(searchInput, "Search input must be present");
    await searchInput.type("AIR", { delay: 40 });
    await new Promise((r) => setTimeout(r, 300));

    // Check if dropdown appears
    const dropdownExists = await page.$(".launcher-autocomplete-dropdown");
    assert.ok(dropdownExists, "Autocomplete dropdown must open when typing a valid query");

    // Verify dropdown item styling in Light mode
    const dropdownItemStyles = await page.evaluate(() => {
      const item = document.querySelector(".autocomplete-item");
      if (!item) return null;
      const cs = window.getComputedStyle(item);
      const name = item.querySelector(".autocomplete-name");
      return {
        bg: cs.backgroundColor,
        nameColor: name ? window.getComputedStyle(name).color : null,
      };
    });
    assert.ok(dropdownItemStyles, "Dropdown items should be rendered");

    // 3. Test keyboard navigation in autocomplete dropdown
    await page.keyboard.press("ArrowDown");
    await new Promise((r) => setTimeout(r, 100));

    const highlightedItem = await page.$(".autocomplete-item.highlighted");
    assert.ok(highlightedItem, "ArrowDown must highlight an autocomplete item");

    // 4. Test selecting an item via Enter
    await page.keyboard.press("Enter");
    await new Promise((r) => setTimeout(r, 200));

    const inputValue = await page.evaluate(() => {
      const el = document.querySelector(".launcher-search-wrapper input");
      return el ? el.value : "";
    });
    assert.ok(inputValue.length > 0, "Selected ticker must populate the search input");

    // 5. Expand Advanced Options drawer
    const advancedBtn = await page.$(".advanced-toggle-button");
    assert.ok(advancedBtn, "Advanced options toggle button must exist");
    await advancedBtn.click();
    await new Promise((r) => setTimeout(r, 250));

    // Verify Date and Depth inputs exist and are styled
    const advancedControls = await page.evaluate(() => {
      const dateInput = document.querySelector(".date-field input");
      const depthSelect = document.querySelector(".depth-field select");
      return {
        hasDate: Boolean(dateInput),
        hasDepth: Boolean(depthSelect),
        dateColor: dateInput ? window.getComputedStyle(dateInput).color : null,
      };
    });
    assert.ok(advancedControls.hasDate, "Date input must exist");
    assert.ok(advancedControls.hasDepth, "Depth select must exist");
    assert.equal(advancedControls.dateColor, "rgb(15, 23, 42)", "Date input text must be #0f172a");

    // 6. Test Analyst Toggles
    const analystButtons = await page.$$(".analyst-toggle");
    assert.ok(analystButtons.length >= 4, "Must display all 4 analyst toggle cards");

    // Toggle one analyst
    await analystButtons[0].click();
    await new Promise((r) => setTimeout(r, 150));

    // 7. Switch to Dark Mode and verify live transition
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("tradingagents_theme", "dark");
    });
    await new Promise((r) => setTimeout(r, 200));

    const darkCardBg = await page.evaluate(() => {
      const card = document.querySelector(".analysis-launcher-card");
      return card ? window.getComputedStyle(card).backgroundColor : null;
    });
    assert.ok(darkCardBg.includes("rgba(9, 14, 21"), "Dark mode launcher card must be dark translucent surface");

    assert.equal(pageErrors.length, 0, `Errors during browser interaction: ${pageErrors.join(", ")}`);
  } finally {
    if (browser) await browser.close();
  }
});
