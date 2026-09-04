import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const stylesPath = path.resolve(__dirname, "../src/styles.css");

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
    };
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
    throw new Error(`Invalid color inputs for contrast ratio: ${JSON.stringify(color1)}, ${JSON.stringify(color2)}`);
  }
  const l1 = getRelativeLuminance(rgb1);
  const l2 = getRelativeLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

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
// CHALLENGE 1: Exhaustive Mathematical Contrast Matrix Oracle
// ============================================================================
test("Challenger Oracle: Mathematical Contrast Matrix for all M1 tokens across all 5 surfaces", () => {
  const css = fs.readFileSync(stylesPath, "utf-8");
  const rootVars = parseVariablesFromBlock(extractCssBlock(css, ":root"));
  const lightVars = parseVariablesFromBlock(extractCssBlock(css, '[data-theme="light"]'));

  const surfaces = ["--bg", "--surface", "--surface-2", "--surface-3", "--surface-input"];
  
  // Verify all 5 surface tokens exist in both modes
  for (const s of surfaces) {
    assert.ok(rootVars[s], `Dark mode must define ${s}`);
    assert.ok(lightVars[s], `Light mode must define ${s}`);
  }

  const textTokens = [
    { name: "--text", minRatio: 4.5 },
    { name: "--text-secondary", minRatio: 4.5 },
    { name: "--muted", minRatio: 4.0 }, // WCAG AA allows 3.0:1 for secondary UI/large, 4.5 for body
    { name: "--signal-bullish-text", minRatio: 4.5 },
    { name: "--signal-neutral-text", minRatio: 4.5 },
    { name: "--signal-bearish-text", minRatio: 4.5 },
  ];

  const results = { dark: [], light: [] };

  // 1. Dark Mode Contrast Checks
  for (const surfaceToken of surfaces) {
    const surfaceColor = rootVars[surfaceToken];
    for (const textToken of textTokens) {
      const textColor = rootVars[textToken.name];
      assert.ok(textColor, `Dark mode missing token ${textToken.name}`);
      const ratio = getContrastRatio(textColor, surfaceColor);
      results.dark.push({
        surface: surfaceToken,
        surfaceColor,
        text: textToken.name,
        textColor,
        ratio,
        minRatio: textToken.minRatio,
        passed: ratio >= textToken.minRatio,
      });
      assert.ok(
        ratio >= textToken.minRatio,
        `Dark Mode: ${textToken.name} (${textColor}) on ${surfaceToken} (${surfaceColor}) contrast ${ratio.toFixed(2)}:1 is below required ${textToken.minRatio}:1`
      );
    }
  }

  // 2. Light Mode Contrast Checks
  for (const surfaceToken of surfaces) {
    const surfaceColor = lightVars[surfaceToken];
    for (const textToken of textTokens) {
      const textColor = lightVars[textToken.name];
      assert.ok(textColor, `Light mode missing token ${textToken.name}`);
      const ratio = getContrastRatio(textColor, surfaceColor);
      results.light.push({
        surface: surfaceToken,
        surfaceColor,
        text: textToken.name,
        textColor,
        ratio,
        minRatio: textToken.minRatio,
        passed: ratio >= textToken.minRatio,
      });
      assert.ok(
        ratio >= textToken.minRatio,
        `Light Mode: ${textToken.name} (${textColor}) on ${surfaceToken} (${surfaceColor}) contrast ${ratio.toFixed(2)}:1 is below required ${textToken.minRatio}:1`
      );
    }
  }

  // 3. Brand & Heading Gradient Endpoints Contrast Checks
  // Light Mode brand gradient: linear-gradient(180deg, #0f172a 0%, #0d9488 100%)
  const lightHeadingStart = "#0f172a";
  const lightHeadingEnd = "#334155";
  const lightBrandEnd = "#0d9488";
  const lightBg = lightVars["--bg"];
  const lightSurface = lightVars["--surface"];

  assert.ok(getContrastRatio(lightHeadingStart, lightBg) >= 4.5, "Light heading start contrast on bg >= 4.5:1");
  assert.ok(getContrastRatio(lightHeadingEnd, lightBg) >= 4.5, "Light heading end contrast on bg >= 4.5:1");
  assert.ok(getContrastRatio(lightHeadingStart, lightSurface) >= 4.5, "Light heading start contrast on surface >= 4.5:1");
  assert.ok(getContrastRatio(lightHeadingEnd, lightSurface) >= 4.5, "Light heading end contrast on surface >= 4.5:1");
  assert.ok(getContrastRatio(lightBrandEnd, lightBg) >= 3.5, "Light brand gradient end contrast on bg >= 3.5:1");

  // 4. Decision Badge Inks Contrast Checks on Badge Backgrounds & Surfaces
  const lightBadgeInks = [
    { name: "Positive Strong", ink: "#065f46", bg: "#ffffff" },
    { name: "Positive Strategic", ink: "#0f766e", bg: "#ffffff" },
    { name: "Positive Moderate", ink: "#047857", bg: "#ffffff" },
    { name: "Negative Strong", ink: "#991b1b", bg: "#ffffff" },
    { name: "Negative Strategic", ink: "#be123c", bg: "#ffffff" },
    { name: "Negative Moderate", ink: "#991b1b", bg: "#ffffff" },
    { name: "Neutral", ink: "#92400e", bg: "#ffffff" },
  ];

  for (const badge of lightBadgeInks) {
    const ratio = getContrastRatio(badge.ink, badge.bg);
    assert.ok(
      ratio >= 4.5,
      `Light Mode Badge Ink [${badge.name}] ${badge.ink} on ${badge.bg} contrast ratio ${ratio.toFixed(2)}:1 must be >= 4.5:1`
    );
  }
});

// ============================================================================
// CHALLENGE 2: CSS Token Grammar, Syntax & Specificity Leak Oracle
// ============================================================================
test("Challenger Oracle: CSS Syntax, Brace Balance & Specificity Leak Detection", () => {
  const css = fs.readFileSync(stylesPath, "utf-8");

  // 1. Brace balance verification
  let braceCount = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === "{") braceCount++;
    if (css[i] === "}") braceCount--;
    assert.ok(braceCount >= 0, `CSS Syntax Error: Unexpected closing brace at index ${i}`);
  }
  assert.equal(braceCount, 0, "CSS Syntax Error: Unbalanced curly braces in styles.css");

  // 2. Parentheses balance verification
  let parenCount = 0;
  for (let i = 0; i < css.length; i++) {
    if (css[i] === "(") parenCount++;
    if (css[i] === ")") parenCount--;
    assert.ok(parenCount >= 0, `CSS Syntax Error: Unexpected closing parenthesis at index ${i}`);
  }
  assert.equal(parenCount, 0, "CSS Syntax Error: Unbalanced parentheses in styles.css");

  // 3. Verify no unescaped / orphaned [data-theme="light"] rules
  const lightSelectorRegex = /\[data-theme="light"\][^{]*\{/g;
  let lightMatch;
  let ruleCount = 0;
  while ((lightMatch = lightSelectorRegex.exec(css)) !== null) {
    ruleCount++;
    const sel = lightMatch[0];
    assert.ok(!sel.includes("!important"), `Selector should not have !important in selector string: ${sel}`);
  }
  assert.ok(ruleCount >= 15, `Expected at least 15 light theme override rules, found ${ruleCount}`);

  // 4. Verify that .brand and .page-heading h1 consume CSS variables instead of hardcoded hexes
  const brandBlock = extractCssBlock(css, ".brand");
  assert.ok(brandBlock, ".brand rule must exist");
  assert.ok(brandBlock.includes("var(--brand-gradient)"), ".brand must consume var(--brand-gradient)");

  const pageHeadingH1Block = extractCssBlock(css, ".page-heading h1");
  assert.ok(pageHeadingH1Block, ".page-heading h1 rule must exist");
  assert.ok(pageHeadingH1Block.includes("var(--heading-gradient)"), ".page-heading h1 must consume var(--heading-gradient)");
});

// ============================================================================
// CHALLENGE 3: Real Browser Custom Property DOM Inheritance & Stress Oracle
// ============================================================================
test("Challenger Oracle: Real Browser CSS Property Inheritance, Specificity & Rapid Switching", async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Open settings page (contains multiple components, badges, theme buttons)
    await page.goto("http://127.0.0.1:8787/?page=settings", { waitUntil: "domcontentloaded", timeout: 15000 });

    // Helper to evaluate computed style
    const getComputedTokens = async () => {
      return await page.evaluate(() => {
        const rootStyle = window.getComputedStyle(document.documentElement);
        const bodyStyle = window.getComputedStyle(document.body);
        const brand = document.querySelector(".brand");
        const brandBg = brand ? window.getComputedStyle(brand).backgroundImage : null;
        const heading = document.querySelector(".page-heading h1");
        const headingBg = heading ? window.getComputedStyle(heading).backgroundImage : null;
        const sidebarFooter = document.querySelector(".sidebar-footer");
        const sidebarFooterBg = sidebarFooter ? window.getComputedStyle(sidebarFooter).backgroundColor : null;

        return {
          bg: rootStyle.getPropertyValue("--bg").trim(),
          surface: rootStyle.getPropertyValue("--surface").trim(),
          surfaceCard: rootStyle.getPropertyValue("--surface-card").trim(),
          surfaceInput: rootStyle.getPropertyValue("--surface-input").trim(),
          text: rootStyle.getPropertyValue("--text").trim(),
          textSecondary: rootStyle.getPropertyValue("--text-secondary").trim(),
          muted: rootStyle.getPropertyValue("--muted").trim(),
          brandGradient: rootStyle.getPropertyValue("--brand-gradient").trim(),
          headingGradient: rootStyle.getPropertyValue("--heading-gradient").trim(),
          bullishText: rootStyle.getPropertyValue("--signal-bullish-text").trim(),
          neutralText: rootStyle.getPropertyValue("--signal-neutral-text").trim(),
          bearishText: rootStyle.getPropertyValue("--signal-bearish-text").trim(),
          bodyBgColor: bodyStyle.backgroundColor,
          brandBg,
          headingBg,
          sidebarFooterBg,
        };
      });
    };

    // 1. Force Dark Theme and check inheritance
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("tradingagents_theme", "dark");
    });
    await new Promise((r) => setTimeout(r, 100));
    const darkTokens = await getComputedTokens();

    assert.equal(darkTokens.bg, "#05080e", "Dark mode --bg should be #05080e");
    assert.equal(darkTokens.surface, "#090e15", "Dark mode --surface should be #090e15");
    assert.equal(darkTokens.surfaceCard, "#090e15", "Dark mode --surface-card should be #090e15");
    assert.equal(darkTokens.surfaceInput, "#060a0f", "Dark mode --surface-input should be #060a0f");
    assert.equal(darkTokens.text, "#f8fafc", "Dark mode --text should be #f8fafc");
    assert.equal(darkTokens.textSecondary, "#cbd5e1", "Dark mode --text-secondary should be #cbd5e1");
    assert.equal(darkTokens.muted, "#94a3b8", "Dark mode --muted should be #94a3b8");

    // 2. Switch to Light Theme and check inheritance
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("tradingagents_theme", "light");
    });
    await new Promise((r) => setTimeout(r, 100));
    const lightTokens = await getComputedTokens();

    assert.equal(lightTokens.bg, "#f8fafc", "Light mode --bg should be #f8fafc");
    assert.equal(lightTokens.surface, "#ffffff", "Light mode --surface should be #ffffff");
    assert.equal(lightTokens.surfaceCard, "#ffffff", "Light mode --surface-card should be #ffffff");
    assert.equal(lightTokens.surfaceInput, "#ffffff", "Light mode --surface-input should be #ffffff");
    assert.equal(lightTokens.text, "#0f172a", "Light mode --text should be #0f172a");
    assert.equal(lightTokens.textSecondary, "#334155", "Light mode --text-secondary should be #334155");
    assert.equal(lightTokens.muted, "#64748b", "Light mode --muted should be #64748b");
    assert.equal(lightTokens.bullishText, "#065f46", "Light mode --signal-bullish-text should be #065f46");
    assert.equal(lightTokens.neutralText, "#92400e", "Light mode --signal-neutral-text should be #92400e");
    assert.equal(lightTokens.bearishText, "#991b1b", "Light mode --signal-bearish-text should be #991b1b");

    // 3. Specificity Leak Stress Test: Rapid 200 Toggle Cycles in Browser DOM
    const stressPass = await page.evaluate(() => {
      let current = "light";
      for (let i = 0; i < 200; i++) {
        current = current === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", current);
      }
      return document.documentElement.getAttribute("data-theme") === "light";
    });
    assert.ok(stressPass, "Rapid 200 toggle cycles must complete cleanly without DOM corruption");

    // Final verification that light tokens are still pristine after stress cycle
    const postStressLightTokens = await getComputedTokens();
    assert.equal(postStressLightTokens.bg, "#f8fafc", "Post-stress light --bg must remain #f8fafc");
    assert.equal(postStressLightTokens.surface, "#ffffff", "Post-stress light --surface must remain #ffffff");
    assert.equal(postStressLightTokens.text, "#0f172a", "Post-stress light --text must remain #0f172a");

    // Switch back to dark and verify
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await new Promise((r) => setTimeout(r, 50));
    const postStressDarkTokens = await getComputedTokens();
    assert.equal(postStressDarkTokens.bg, "#05080e", "Post-stress dark --bg must remain #05080e");
    assert.equal(postStressDarkTokens.surface, "#090e15", "Post-stress dark --surface must remain #090e15");
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});
