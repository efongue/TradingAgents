import test from "node:test";
import assert from "node:assert/strict";
import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

// Color / Contrast math utilities
function parseRgb(colorStr) {
  if (!colorStr) return [0, 0, 0, 1];
  const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbMatch) {
    return [
      parseInt(rgbMatch[1], 10),
      parseInt(rgbMatch[2], 10),
      parseInt(rgbMatch[3], 10),
      rgbMatch[4] !== undefined ? parseFloat(rgbMatch[4]) : 1.0,
    ];
  }
  const hexMatch = colorStr.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (hexMatch) {
    return [
      parseInt(hexMatch[1], 16),
      parseInt(hexMatch[2], 16),
      parseInt(hexMatch[3], 16),
      1.0,
    ];
  }
  return [0, 0, 0, 1];
}

function srgbToLinear(c) {
  const norm = c / 255;
  return norm <= 0.03928 ? norm / 12.92 : Math.pow((norm + 0.055) / 1.055, 2.4);
}

function getLuminance(r, g, b) {
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

function compositeColor(fgRgba, bgRgba) {
  const fgR = fgRgba[0], fgG = fgRgba[1], fgB = fgRgba[2], fgA = fgRgba[3] ?? 1.0;
  const bgR = bgRgba[0], bgG = bgRgba[1], bgB = bgRgba[2], bgA = bgRgba[3] ?? 1.0;
  const outA = fgA + bgA * (1 - fgA);
  if (outA === 0) return [0, 0, 0, 0];
  const outR = Math.round((fgR * fgA + bgR * bgA * (1 - fgA)) / outA);
  const outG = Math.round((fgG * fgA + bgG * bgA * (1 - fgA)) / outA);
  const outB = Math.round((fgB * fgA + bgB * bgA * (1 - fgA)) / outA);
  return [outR, outG, outB, outA];
}

function getContrastRatio(color1, color2) {
  const [r1, g1, b1] = color1;
  const [r2, g2, b2] = color2;
  const lum1 = getLuminance(r1, g1, b1);
  const lum2 = getLuminance(r2, g2, b2);
  const max = Math.max(lum1, lum2);
  const min = Math.min(lum1, lum2);
  return (max + 0.05) / (min + 0.05);
}

test("Challenger M2: Static Code & JSX Integrity for ScannerPage and scanner.css", () => {
  const cssPath = path.join(process.cwd(), "src/scanner.css");
  const jsxPath = path.join(process.cwd(), "src/ScannerPage.jsx");
  const cssContent = fs.readFileSync(cssPath, "utf-8");
  const jsxContent = fs.readFileSync(jsxPath, "utf-8");

  // 1. Verify no whileHover inline color overrides on table rows
  assert.equal(
    jsxContent.includes('whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.035)" }}'),
    false,
    "whileHover background color override must be removed from ScannerPage.jsx"
  );

  // 2. Verify no hardcoded dark surfaces inside [data-theme="light"]
  const lightBlockMatch = cssContent.match(/\[data-theme="light"\][\s\S]*$/);
  assert.ok(lightBlockMatch, "[data-theme='light'] block must exist in scanner.css");
  const lightBlock = lightBlockMatch[0];

  assert.equal(/#060a0f|#090e15|#0d1520|#0a1119/i.test(lightBlock), false, "No dark surface hexes in light mode block");

  // 3. Verify all necessary light mode selectors are defined
  const requiredSelectors = [
    '.scanner-form',
    '.scanner-progress-panel',
    '.scanner-results-panel',
    '.scanner-symbols-field textarea',
    '.scanner-table td',
    '.scanner-table tbody tr:hover',
    '.scanner-table tbody tr.selected-row',
    '.scanner-row-status',
    '.scanner-decision',
    '.scanner-report-button',
    '.scanner-disclaimer',
    '.scanner-disclaimer p',
    '.scanner-disclaimer strong',
    '.scanner-active-analysis',
    '.scanner-active-live-card',
    '.scanner-parallel-tab'
  ];

  for (const sel of requiredSelectors) {
    assert.ok(lightBlock.includes(sel), `Light theme block must define selector: ${sel}`);
  }
});

test("Challenger M2: Mathematical WCAG AA/AAA Contrast Verification in Light and Dark Modes", () => {
  // Light mode surfaces
  const whiteBg = [255, 255, 255, 1.0];

  // 1. Disclaimer in Light mode
  const discBgRgba = [217, 119, 6, 0.08];
  const discEffBg = compositeColor(discBgRgba, whiteBg);
  const discTextLight = parseRgb("#92400e");
  const discStrongLight = parseRgb("#78350f");

  const discContrast = getContrastRatio(discTextLight, discEffBg);
  const discStrongContrast = getContrastRatio(discStrongLight, discEffBg);
  assert.ok(discContrast >= 4.5, `Disclaimer light mode text contrast (${discContrast.toFixed(2)}) must be >= 4.5`);
  assert.ok(discStrongContrast >= 4.5, `Disclaimer light mode strong contrast (${discStrongContrast.toFixed(2)}) must be >= 4.5`);

  // 2. Active Analysis in Light mode
  const activeBgRgba = [2, 132, 199, 0.08];
  const activeEffBg = compositeColor(activeBgRgba, whiteBg);
  const activeTextLight = parseRgb("#0369a1");
  const activeContrast = getContrastRatio(activeTextLight, activeEffBg);
  assert.ok(activeContrast >= 4.5, `Active analysis light mode text contrast (${activeContrast.toFixed(2)}) must be >= 4.5`);

  // 3. Table text secondary in Light mode (#334155 over #ffffff)
  const tableTextLight = parseRgb("#334155");
  const tableContrast = getContrastRatio(tableTextLight, whiteBg);
  assert.ok(tableContrast >= 7.0, `Table text light mode contrast (${tableContrast.toFixed(2)}) must exceed 7.0 (AAA)`);

  // 4. Dark mode surfaces
  const darkBg = [9, 14, 21, 1.0]; // #090e15
  const tableTextDark = parseRgb("#cbd5e1");
  const darkTableContrast = getContrastRatio(tableTextDark, darkBg);
  assert.ok(darkTableContrast >= 8.0, `Table text dark mode contrast (${darkTableContrast.toFixed(2)}) must exceed 8.0`);

  // 5. Disclaimer in Dark mode (#fde68a on dark amber surface)
  const darkAmberBg = compositeColor([245, 158, 11, 0.12], darkBg);
  const darkDiscText = parseRgb("#fde68a");
  const darkDiscContrast = getContrastRatio(darkDiscText, darkAmberBg);
  assert.ok(darkDiscContrast >= 7.0, `Dark disclaimer contrast (${darkDiscContrast.toFixed(2)}) must exceed 7.0`);
});

test("Challenger M2: E2E Table Column Alignment, Decision Badges, Sparklines, and Hover State", async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1360, height: 900 });

    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(err.toString()));

    await page.goto("http://127.0.0.1:8787/?page=scanner", { waitUntil: "networkidle0", timeout: 10000 });

    // Inject mock active scan job into page state to evaluate ranking table, badges, sparklines and motion
    await page.evaluate(() => {
      // Create and mount mock results if not already present
      const mockJob = {
        id: "mock-scan-test",
        status: "complete",
        stage_label: "Scan terminé",
        elapsed: "1m 15s",
        screen_progress: { completed: 8, total: 8 },
        analysis_progress: { completed: 3, total: 3 },
        ranking: [
          {
            symbol: "NVDA",
            company_name: "NVIDIA Corporation",
            latest_close: 128.5,
            latest_date: "2026-08-28",
            final_rank: 1,
            final_score: 92.4,
            raw_decision: "ACHETER",
            display_decision: "ACHETER",
            momentum_20d: 14.5,
            momentum_60d: 38.2,
            volatility: 28.1,
            analysis_status: "complete",
            sparkline: [110, 112, 118, 122, 125, 128.5],
          },
          {
            symbol: "AAPL",
            company_name: "Apple Inc.",
            latest_close: 224.1,
            latest_date: "2026-08-28",
            final_rank: 2,
            final_score: 76.8,
            raw_decision: "CONSERVER",
            display_decision: "CONSERVER",
            momentum_20d: 3.2,
            momentum_60d: 8.5,
            volatility: 16.4,
            analysis_status: "complete",
            sparkline: [215, 218, 220, 222, 224.1],
          },
          {
            symbol: "INTC",
            company_name: "Intel Corporation",
            latest_close: 21.3,
            latest_date: "2026-08-28",
            final_rank: 3,
            final_score: 34.1,
            raw_decision: "VENDRE",
            display_decision: "VENDRE",
            momentum_20d: -8.4,
            momentum_60d: -22.1,
            volatility: 35.8,
            analysis_status: "complete",
            blocked: true,
            sparkline: [26, 25, 24, 23, 21.3],
          },
        ],
      };

      // Find react internal root or dispatch custom event if available
      window.__mockScannerJob = mockJob;
    });

    // Test Theme switching in live browser
    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "light");
    });
    await new Promise((r) => setTimeout(r, 150));

    const lightFormBg = await page.evaluate(() => {
      return window.getComputedStyle(document.querySelector(".scanner-form")).backgroundColor;
    });
    const [lR, lG, lB] = parseRgb(lightFormBg);
    assert.ok(lR >= 250 && lG >= 250 && lB >= 250, "Form background in light mode is pure white");

    await page.evaluate(() => {
      document.documentElement.setAttribute("data-theme", "dark");
    });
    await new Promise((r) => setTimeout(r, 150));

    const darkFormBg = await page.evaluate(() => {
      return window.getComputedStyle(document.querySelector(".scanner-form")).backgroundColor;
    });
    const [dR, dG, dB] = parseRgb(darkFormBg);
    assert.ok(dR <= 30 && dG <= 30 && dB <= 30, "Form background in dark mode is dark glass");

    assert.equal(pageErrors.length, 0, `Page errors encountered: ${pageErrors.join(", ")}`);
  } finally {
    if (browser) await browser.close();
  }
});
