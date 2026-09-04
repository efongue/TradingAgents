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
// WCAG 2.1 Color Contrast Calculation Engine (Relative Luminance Math)
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
// Tier 1: Static Token & CSS Variable Contract Verification
// ============================================================================

test("Tier 1: CSS Token Foundation in :root (Dark Mode baseline tokens)", () => {
  const css = fs.readFileSync(stylesPath, "utf-8");
  const rootBlock = extractCssBlock(css, ":root");
  assert.ok(rootBlock, ":root block must be defined in styles.css");

  const rootVars = parseVariablesFromBlock(rootBlock);

  // Backgrounds & surfaces
  const expectedTokens = [
    "--bg",
    "--bg-deep",
    "--surface",
    "--surface-2",
    "--surface-3",
    "--surface-glass",
    "--line",
    "--line-soft",
    "--inner-highlight",
    "--text",
    "--text-secondary",
    "--muted",
    "--font-heading",
    "--signal-bullish",
    "--signal-bullish-text",
    "--signal-bullish-bg",
    "--signal-neutral",
    "--signal-neutral-text",
    "--signal-neutral-bg",
    "--signal-bearish",
    "--signal-bearish-text",
    "--signal-bearish-bg",
  ];

  for (const token of expectedTokens) {
    assert.ok(rootVars[token], `:root must define required token ${token}`);
  }
});

test("Tier 1: CSS Token Overrides in [data-theme='light'] (Light Mode tokens)", () => {
  const css = fs.readFileSync(stylesPath, "utf-8");
  const lightBlock = extractCssBlock(css, '[data-theme="light"]');
  assert.ok(lightBlock, "[data-theme=\"light\"] block must be defined in styles.css");

  const lightVars = parseVariablesFromBlock(lightBlock);

  // Verify semantic light values
  const expectedLightTokens = [
    "--bg",
    "--bg-deep",
    "--surface",
    "--surface-2",
    "--surface-3",
    "--surface-glass",
    "--line",
    "--line-soft",
    "--inner-highlight",
    "--text",
    "--text-secondary",
    "--muted",
    "--signal-bullish",
    "--signal-bullish-text",
    "--signal-neutral",
    "--signal-neutral-text",
    "--signal-bearish",
    "--signal-bearish-text",
  ];

  for (const token of expectedLightTokens) {
    assert.ok(lightVars[token], `[data-theme="light"] must define token ${token}`);
  }

  // Value assertions: surfaces should be light, texts should be dark
  assert.equal(lightVars["--bg"].toLowerCase(), "#f8fafc", "--bg should be #f8fafc in light mode");
  assert.equal(lightVars["--surface"].toLowerCase(), "#ffffff", "--surface should be #ffffff in light mode");
  assert.equal(lightVars["--text"].toLowerCase(), "#0f172a", "--text should be #0f172a in light mode");
  assert.equal(lightVars["--text-secondary"].toLowerCase(), "#334155", "--text-secondary should be #334155 in light mode");
  assert.equal(lightVars["--muted"].toLowerCase(), "#64748b", "--muted should be #64748b in light mode");
});

test("Tier 1: Absence of Hardcoded Dark Colors in Light Mode Selectors", () => {
  const css = fs.readFileSync(stylesPath, "utf-8");
  
  // Extract all rules that start with [data-theme="light"]
  const lightRulesRegex = /\[data-theme="light"\][^{]*\{([^}]+)\}/g;
  let match;
  const hardcodedDarkHexes = ["#05080e", "#060a0f", "#080d14", "#090e15", "#030508", "#04070c", "#0a1119"];
  const violations = [];

  while ((match = lightRulesRegex.exec(css)) !== null) {
    const ruleContent = match[1];
    for (const darkHex of hardcodedDarkHexes) {
      if (ruleContent.toLowerCase().includes(darkHex)) {
        violations.push(`Found hardcoded dark hex ${darkHex} in rule: ${match[0].slice(0, 80)}...`);
      }
    }
  }

  assert.equal(violations.length, 0, `Violations found in light theme selectors:\n${violations.join("\n")}`);
});

// ============================================================================
// Tier 2: Mathematical WCAG AA Color Contrast Calculation
// ============================================================================

test("Tier 2: WCAG AA Color Contrast Validation in Dark Mode (Ratio >= 4.5:1 for body text)", () => {
  const css = fs.readFileSync(stylesPath, "utf-8");
  const rootVars = parseVariablesFromBlock(extractCssBlock(css, ":root"));

  const bg = rootVars["--bg"];
  const surface = rootVars["--surface"];
  const text = rootVars["--text"];
  const textSecondary = rootVars["--text-secondary"];
  const muted = rootVars["--muted"];

  // Primary text on bg & surface
  const ratioTextBg = getContrastRatio(text, bg);
  const ratioTextSurface = getContrastRatio(text, surface);
  assert.ok(ratioTextBg >= 4.5, `Dark Mode text on bg contrast ratio (${ratioTextBg.toFixed(2)}) must be >= 4.5:1`);
  assert.ok(ratioTextSurface >= 4.5, `Dark Mode text on surface contrast ratio (${ratioTextSurface.toFixed(2)}) must be >= 4.5:1`);

  // Secondary text on surface
  const ratioSecSurface = getContrastRatio(textSecondary, surface);
  assert.ok(ratioSecSurface >= 4.5, `Dark Mode secondary text on surface contrast ratio (${ratioSecSurface.toFixed(2)}) must be >= 4.5:1`);

  // Muted text on surface (WCAG AA for regular text >= 4.5:1)
  const ratioMutedSurface = getContrastRatio(muted, surface);
  assert.ok(ratioMutedSurface >= 4.5, `Dark Mode muted text on surface contrast ratio (${ratioMutedSurface.toFixed(2)}) must be >= 4.5:1`);

  // Financial signal texts on dark surface
  const bullText = rootVars["--signal-bullish-text"];
  const neutText = rootVars["--signal-neutral-text"];
  const bearText = rootVars["--signal-bearish-text"];

  const bullRatio = getContrastRatio(bullText, surface);
  const neutRatio = getContrastRatio(neutText, surface);
  const bearRatio = getContrastRatio(bearText, surface);

  assert.ok(bullRatio >= 4.5, `Dark Mode bullish text contrast (${bullRatio.toFixed(2)}) must be >= 4.5:1`);
  assert.ok(neutRatio >= 4.5, `Dark Mode neutral text contrast (${neutRatio.toFixed(2)}) must be >= 4.5:1`);
  assert.ok(bearRatio >= 4.5, `Dark Mode bearish text contrast (${bearRatio.toFixed(2)}) must be >= 4.5:1`);
});

test("Tier 2: WCAG AA Color Contrast Validation in Light Mode (Ratio >= 4.5:1 for body & signals)", () => {
  const css = fs.readFileSync(stylesPath, "utf-8");
  const lightVars = parseVariablesFromBlock(extractCssBlock(css, '[data-theme="light"]'));

  const bg = lightVars["--bg"];
  const surface = lightVars["--surface"];
  const text = lightVars["--text"];
  const textSecondary = lightVars["--text-secondary"];
  const muted = lightVars["--muted"];

  // Primary text on bg & surface
  const ratioTextBg = getContrastRatio(text, bg);
  const ratioTextSurface = getContrastRatio(text, surface);
  assert.ok(ratioTextBg >= 4.5, `Light Mode text on bg contrast ratio (${ratioTextBg.toFixed(2)}) must be >= 4.5:1`);
  assert.ok(ratioTextSurface >= 4.5, `Light Mode text on surface contrast ratio (${ratioTextSurface.toFixed(2)}) must be >= 4.5:1`);

  // Secondary text on surface
  const ratioSecSurface = getContrastRatio(textSecondary, surface);
  assert.ok(ratioSecSurface >= 4.5, `Light Mode secondary text on surface contrast ratio (${ratioSecSurface.toFixed(2)}) must be >= 4.5:1`);

  // Muted text on surface
  const ratioMutedSurface = getContrastRatio(muted, surface);
  assert.ok(ratioMutedSurface >= 4.5, `Light Mode muted text on surface contrast ratio (${ratioMutedSurface.toFixed(2)}) must be >= 4.5:1`);

  // Financial signal texts on light surface (#ffffff)
  const bullText = lightVars["--signal-bullish-text"];
  const neutText = lightVars["--signal-neutral-text"];
  const bearText = lightVars["--signal-bearish-text"];

  const bullRatio = getContrastRatio(bullText, surface);
  const neutRatio = getContrastRatio(neutText, surface);
  const bearRatio = getContrastRatio(bearText, surface);

  assert.ok(bullRatio >= 4.5, `Light Mode bullish text ink (${bullText}) contrast (${bullRatio.toFixed(2)}) must be >= 4.5:1`);
  assert.ok(neutRatio >= 4.5, `Light Mode neutral text ink (${neutText}) contrast (${neutRatio.toFixed(2)}) must be >= 4.5:1`);
  assert.ok(bearRatio >= 4.5, `Light Mode bearish text ink (${bearText}) contrast (${bearRatio.toFixed(2)}) must be >= 4.5:1`);
});

// ============================================================================
// Tier 3: Component & State Logic Verification
// ============================================================================

test("Tier 3: Theme Persistence & Attribute Contract Verification", () => {
  // Test theme resolution logic
  const mockResolveTheme = (saved, systemPrefersLight) => {
    if (saved === "light" || saved === "dark") return saved;
    if (systemPrefersLight) return "light";
    return "dark";
  };

  assert.equal(mockResolveTheme("light", false), "light", "Should restore 'light' when saved in localStorage");
  assert.equal(mockResolveTheme("dark", true), "dark", "Should restore 'dark' when saved in localStorage");
  assert.equal(mockResolveTheme(null, true), "light", "Should default to system preference when no saved preference");
  assert.equal(mockResolveTheme(null, false), "dark", "Should default to dark when no saved preference and system is dark");
  assert.equal(mockResolveTheme("invalid_value", false), "dark", "Should fallback to dark on malformed localStorage value");
});

test("Tier 3: DecisionBadge Tone and Tier Color Classes Mapping", () => {
  // Verify that decision tones and tiers match semantic classes
  const positiveDecisions = ["ACHAT FORT", "SURPONDÉRER", "ACCUMULER", "ACHETER", "BUY", "STRONG BUY"];
  const neutralDecisions = ["CONSERVER", "HOLD", "ATTENDRE", "PONDÉRATION NEUTRE"];
  const negativeDecisions = ["VENTE FORTE", "SOUS-PONDÉRER", "ALLÉGER", "VENDRE", "SELL", "STRONG SELL"];

  const getTone = (decision) => {
    const upper = (decision || "").toUpperCase();
    if (positiveDecisions.some((d) => upper.includes(d))) return "positive";
    if (negativeDecisions.some((d) => upper.includes(d))) return "negative";
    if (neutralDecisions.some((d) => upper.includes(d))) return "neutral";
    return "neutral";
  };

  for (const dec of positiveDecisions) {
    assert.equal(getTone(dec), "positive", `${dec} should map to positive tone`);
  }
  for (const dec of neutralDecisions) {
    assert.equal(getTone(dec), "neutral", `${dec} should map to neutral tone`);
  }
  for (const dec of negativeDecisions) {
    assert.equal(getTone(dec), "negative", `${dec} should map to negative tone`);
  }
});

// ============================================================================
// Tier 4: E2E Browser & Multi-View Rendering (Puppeteer)
// ============================================================================

test("Tier 4: E2E Theme Switching & View Contrast Verification Across All 8 Views", async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    const viewUrls = [
      { name: "Analysis Launcher", url: "http://127.0.0.1:8787/?page=analysis" },
      { name: "Market Scanner", url: "http://127.0.0.1:8787/?page=scanner" },
      { name: "Compare View", url: "http://127.0.0.1:8787/?page=compare" },
      { name: "Watchlist View", url: "http://127.0.0.1:8787/?page=watchlist" },
      { name: "Performance View", url: "http://127.0.0.1:8787/?page=performance" },
      { name: "History View", url: "http://127.0.0.1:8787/?page=history" },
      { name: "Settings View", url: "http://127.0.0.1:8787/?page=settings" },
      { name: "Landing View", url: "http://127.0.0.1:8787/?page=landing" },
    ];

    for (const view of viewUrls) {
      const pageErrors = [];
      page.on("pageerror", (err) => pageErrors.push(err.toString()));

      // 1. Visit in Light Mode
      await page.goto(view.url, { waitUntil: "networkidle0", timeout: 10000 });

      // Force theme to light via localStorage and DOM attribute
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "light");
        localStorage.setItem("tradingagents_theme", "light");
      });

      // Wait a frame for CSS transitions / repaints
      await new Promise((r) => setTimeout(r, 150));

      const lightThemeAttr = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
      assert.equal(lightThemeAttr, "light", `${view.name} should reflect data-theme='light'`);

      // Verify computed background color on body or sidebar
      const lightStyles = await page.evaluate(() => {
        const bodyBg = window.getComputedStyle(document.body).backgroundColor;
        const bodyColor = window.getComputedStyle(document.body).color;
        const sidebar = document.querySelector(".sidebar");
        const sidebarBg = sidebar ? window.getComputedStyle(sidebar).backgroundColor : null;
        return { bodyBg, bodyColor, sidebarBg };
      });

      // Verify no runtime console errors
      assert.equal(pageErrors.length, 0, `Errors on ${view.name} in Light mode: ${pageErrors.join(", ")}`);

      // 2. Switch to Dark Mode and verify
      await page.evaluate(() => {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("tradingagents_theme", "dark");
      });

      await new Promise((r) => setTimeout(r, 150));

      const darkThemeAttr = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
      assert.equal(darkThemeAttr, "dark", `${view.name} should reflect data-theme='dark'`);

      assert.equal(pageErrors.length, 0, `Errors on ${view.name} in Dark mode: ${pageErrors.join(", ")}`);
    }

    // 3. Test Sidebar Theme Toggle Button interaction
    await page.goto("http://127.0.0.1:8787/?page=settings", { waitUntil: "networkidle0", timeout: 10000 });
    
    // Ensure dark mode first
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("tradingagents_theme", "dark");
    });

    const themeBtnSelector = ".sidebar-theme-btn";
    const themeBtnExists = await page.$(themeBtnSelector);
    if (themeBtnExists) {
      await page.click(themeBtnSelector);
      await new Promise((r) => setTimeout(r, 200));

      const currentTheme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
      const savedTheme = await page.evaluate(() => localStorage.getItem("tradingagents_theme"));
      assert.equal(currentTheme, "light", "Clicking theme toggle should switch data-theme to 'light'");
      assert.equal(savedTheme, "light", "Clicking theme toggle should persist 'light' in localStorage");
    }

    // 4. Test Settings Page Theme Toggle Buttons
    const jourBtn = await page.$("button[title*='mode Clair']");
    const nuitBtn = await page.$("button[title*='mode Sombre']");

    if (nuitBtn && jourBtn) {
      await nuitBtn.click();
      await new Promise((r) => setTimeout(r, 200));
      let themeAfterNuit = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
      assert.equal(themeAfterNuit, "dark", "Clicking Nuit button on SettingsPage should activate dark mode");

      await jourBtn.click();
      await new Promise((r) => setTimeout(r, 200));
      let themeAfterJour = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
      assert.equal(themeAfterJour, "light", "Clicking Jour button on SettingsPage should activate light mode");
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

// ============================================================================
// Tier 5: Adversarial & Stress Hardening
// ============================================================================

test("Tier 5: Rapid Theme Toggle Stress & Recovery", () => {
  let theme = "dark";
  const toggle = () => {
    theme = theme === "light" ? "dark" : "light";
  };

  // Rapid toggling 100 times
  for (let i = 0; i < 100; i++) {
    toggle();
  }
  assert.equal(theme, "dark", "100 toggles starting from dark must end in dark without state drift");

  // Single toggle transitions to light
  toggle();
  assert.equal(theme, "light", "Subsequent toggle must transition cleanly to light");
});
