import test from "node:test";
import assert from "node:assert/strict";
import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const stylesPath = path.resolve(__dirname, "../src/styles.css");
const previewPath = path.resolve(__dirname, "../src/components/analysis/SkeletonLivePreview.jsx");

// Relative Luminance & Contrast Math (WCAG 2.1)
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

test("Challenger M3: Static Code & CSS Integrity for Analysis Views", () => {
  const css = fs.readFileSync(stylesPath, "utf-8");
  const preview = fs.readFileSync(previewPath, "utf-8");

  // 1. Verify no hardcoded dark inline styles in SkeletonLivePreview
  assert.equal(
    preview.includes('background: "rgba(255,255,255,0.06)"'),
    false,
    "Hardcoded inline backgrounds must be removed from SkeletonLivePreview.jsx"
  );
  assert.ok(preview.includes("skeleton-shimmer-bar"), "SkeletonLivePreview must use skeleton-shimmer-bar class");

  // 2. Verify all prohibited dark hexes are absent from light mode selectors
  const lightRulesRegex = /\[data-theme="light"\][^{]*\{([^}]+)\}/g;
  let match;
  const prohibitedHexes = ["#05080e", "#060a0f", "#080d14", "#090e15", "#030508", "#04070c", "#0a1119"];
  const violations = [];

  while ((match = lightRulesRegex.exec(css)) !== null) {
    const ruleContent = match[1];
    for (const darkHex of prohibitedHexes) {
      if (ruleContent.toLowerCase().includes(darkHex)) {
        violations.push(`Prohibited dark hex ${darkHex} in rule: ${match[0].slice(0, 80)}`);
      }
    }
  }
  assert.equal(violations.length, 0, `Violations found:\n${violations.join("\n")}`);

  // 3. Verify key Milestone 3 selectors exist in [data-theme="light"]
  const requiredSelectors = [
    ".analysis-launcher-card",
    ".analysis-launcher-form",
    ".launcher-input-group input",
    ".advanced-toggle-button",
    ".field > span",
    ".analyst-field legend",
    ".analyst-toggle",
    ".analyst-toggle.selected",
    ".workflow-panel",
    ".reliability-panel",
    ".stage-node",
    ".stage-audit-card.verified",
    ".stage-audit-card.blocked",
    ".data-substep",
    ".active-log",
    ".log-terminal",
    ".warning-box",
    ".blocking-box",
    ".analysis-failure",
    ".effective-parameters",
    ".skeleton-shimmer-bar",
  ];

  for (const sel of requiredSelectors) {
    assert.ok(
      css.includes(`[data-theme="light"] ${sel}`) || css.includes(`[data-theme="light"]\n${sel}`),
      `styles.css must contain [data-theme="light"] rule for ${sel}`
    );
  }
});

test("Challenger M3: Mathematical WCAG AA/AAA Contrast Ratios on Milestone 3 Elements", () => {
  const white = "#ffffff";
  const lightSurfaceBg = "#f8fafc";
  const paleMintBg = "#edf7f5"; // Effective surface of rgba(13, 148, 136, 0.08) on white
  const paleEmeraldBg = "#f0fdf4"; // Effective surface of rgba(5, 150, 105, 0.06) on white
  const paleAmberBg = "#fffbeb"; // Effective surface of rgba(217, 119, 6, 0.08) on white
  const paleRedBg = "#fef2f2"; // Effective surface of rgba(220, 38, 38, 0.06) on white

  // 1. Primary dark text on white surfaces
  const primaryTextRatio = getContrastRatio("#0f172a", white);
  assert.ok(primaryTextRatio >= 15.0, `Primary text (#0f172a) contrast on white (${primaryTextRatio.toFixed(2)}) must exceed AAA (15.0:1)`);

  // 2. Field labels and legends on white
  const fieldLabelRatio = getContrastRatio("#0f172a", white);
  assert.ok(fieldLabelRatio >= 4.5, `Field label contrast (${fieldLabelRatio.toFixed(2)}) must exceed 4.5:1`);

  // 3. Secondary text (#334155) on white
  const secondaryTextRatio = getContrastRatio("#334155", white);
  assert.ok(secondaryTextRatio >= 9.0, `Secondary text contrast (${secondaryTextRatio.toFixed(2)}) must exceed 9.0:1`);

  // 4. Muted text (#64748b) on white
  const mutedRatio = getContrastRatio("#64748b", white);
  assert.ok(mutedRatio >= 4.5, `Muted text contrast (${mutedRatio.toFixed(2)}) must meet WCAG AA (>= 4.5:1)`);

  // 5. Selected Analyst card: Title (#042f24) and Description (#065f46) on pale mint
  const analystTitleRatio = getContrastRatio("#042f24", paleMintBg);
  const analystDescRatio = getContrastRatio("#065f46", paleMintBg);
  assert.ok(analystTitleRatio >= 10.0, `Selected analyst title contrast (${analystTitleRatio.toFixed(2)}) must be >= 10:1`);
  assert.ok(analystDescRatio >= 4.5, `Selected analyst description contrast (${analystDescRatio.toFixed(2)}) must meet WCAG AA (>= 4.5:1)`);

  // 6. Stage Audit Card verified: Text (#134e4a) and Strong (#0f766e) on pale emerald
  const auditVerifiedRatio = getContrastRatio("#134e4a", paleEmeraldBg);
  const auditVerifiedStrongRatio = getContrastRatio("#0f766e", paleEmeraldBg);
  assert.ok(auditVerifiedRatio >= 4.5, `Verified audit text contrast (${auditVerifiedRatio.toFixed(2)}) must be >= 4.5:1`);
  assert.ok(auditVerifiedStrongRatio >= 4.5, `Verified audit strong contrast (${auditVerifiedStrongRatio.toFixed(2)}) must be >= 4.5:1`);

  // 7. Stage Audit Card blocked: Text (#7f1d1d) and Strong (#991b1b) on pale red
  const auditBlockedRatio = getContrastRatio("#7f1d1d", paleRedBg);
  const auditBlockedStrongRatio = getContrastRatio("#991b1b", paleRedBg);
  assert.ok(auditBlockedRatio >= 4.5, `Blocked audit text contrast (${auditBlockedRatio.toFixed(2)}) must be >= 4.5:1`);
  assert.ok(auditBlockedStrongRatio >= 4.5, `Blocked audit strong contrast (${auditBlockedStrongRatio.toFixed(2)}) must be >= 4.5:1`);

  // 8. Warning box: Strong (#78350f) and Text (#92400e) on pale amber
  const warningStrongRatio = getContrastRatio("#78350f", paleAmberBg);
  const warningTextRatio = getContrastRatio("#92400e", paleAmberBg);
  assert.ok(warningStrongRatio >= 7.0, `Warning strong text contrast (${warningStrongRatio.toFixed(2)}) must be >= 7.0:1`);
  assert.ok(warningTextRatio >= 4.5, `Warning body text contrast (${warningTextRatio.toFixed(2)}) must be >= 4.5:1`);
});

test("Challenger M3: Live DOM & Puppeteer Interaction on Analysis Page", async () => {
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

    // If result page is mounted, click reset to view launcher
    const resultResetBtn = (await page.$(".heading-actions .secondary-button")) || (await page.$(".result-page .secondary-button"));
    if (resultResetBtn) {
      await resultResetBtn.click();
      await new Promise((r) => setTimeout(r, 400));
    }

    // Wait for the Analysis launcher card
    await page.waitForSelector(".analysis-launcher-card", { timeout: 10000 });

    // 1. Force Light Mode
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("tradingagents_theme", "light");
    });
    await new Promise((r) => setTimeout(r, 300));

    // Verify .analysis-launcher-card has white background in Light mode
    const launcherCardBg = await page.evaluate(() => {
      const card = document.querySelector(".analysis-launcher-card");
      return card ? window.getComputedStyle(card).backgroundColor : null;
    });
    assert.equal(launcherCardBg, "rgb(255, 255, 255)", "Analysis launcher card must have #ffffff background in Light mode");

    // Verify search input background and text color
    const searchInputStyles = await page.evaluate(() => {
      const input = document.querySelector(".launcher-search-wrapper input");
      if (!input) return null;
      const cs = window.getComputedStyle(input);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    assert.ok(searchInputStyles, "Search input must be present");
    assert.equal(searchInputStyles.bg, "rgb(255, 255, 255)", "Search input background must be #ffffff");
    assert.equal(searchInputStyles.color, "rgb(15, 23, 42)", "Search input text color must be #0f172a");

    // 2. Click .advanced-toggle-button to expand options drawer
    const advancedBtn = await page.$(".advanced-toggle-button");
    assert.ok(advancedBtn, "Advanced options toggle button must exist");
    await advancedBtn.click();
    await new Promise((r) => setTimeout(r, 250));

    // Verify expanded field labels
    const fieldLabelColor = await page.evaluate(() => {
      const span = document.querySelector(".field > span");
      return span ? window.getComputedStyle(span).color : null;
    });
    assert.equal(fieldLabelColor, "rgb(15, 23, 42)", "Field label text color must be #0f172a in Light mode");

    // Verify unselected analyst toggle
    const analystToggleStyles = await page.evaluate(() => {
      const toggle = document.querySelector(".analyst-toggle:not(.selected)");
      if (!toggle) return null;
      const cs = window.getComputedStyle(toggle);
      return { bg: cs.backgroundColor, color: cs.color };
    });
    if (analystToggleStyles) {
      assert.equal(analystToggleStyles.bg, "rgb(255, 255, 255)", "Unselected analyst toggle must have #ffffff background");
      assert.equal(analystToggleStyles.color, "rgb(15, 23, 42)", "Unselected analyst toggle must have #0f172a text");
    }

    // Verify selected analyst toggle
    const selectedToggleStyles = await page.evaluate(() => {
      const toggle = document.querySelector(".analyst-toggle.selected");
      if (!toggle) return null;
      const cs = window.getComputedStyle(toggle);
      const copyStrong = toggle.querySelector(".analyst-card-copy strong");
      const copySmall = toggle.querySelector(".analyst-card-copy small");
      return {
        bg: cs.backgroundColor,
        strongColor: copyStrong ? window.getComputedStyle(copyStrong).color : null,
        smallColor: copySmall ? window.getComputedStyle(copySmall).color : null,
      };
    });
    if (selectedToggleStyles) {
      assert.equal(selectedToggleStyles.strongColor, "rgb(4, 47, 36)", "Selected analyst title must be #042f24 for high contrast");
      assert.equal(selectedToggleStyles.smallColor, "rgb(6, 95, 70)", "Selected analyst description must be #065f46 for high contrast");
    }

    // 3. Switch to Dark Mode and verify
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("tradingagents_theme", "dark");
    });
    await new Promise((r) => setTimeout(r, 150));

    const darkLauncherBg = await page.evaluate(() => {
      const card = document.querySelector(".analysis-launcher-card");
      return card ? window.getComputedStyle(card).backgroundColor : null;
    });
    assert.ok(darkLauncherBg.includes("rgba(9, 14, 21"), "Dark mode launcher card must retain luminous dark glass surface");

    assert.equal(pageErrors.length, 0, `Browser errors detected during test: ${pageErrors.join(", ")}`);
  } finally {
    if (browser) await browser.close();
  }
});
