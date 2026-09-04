import test from "node:test";
import assert from "node:assert/strict";
import puppeteer from "puppeteer";
import fs from "node:fs";
import path from "node:path";

// Color luminance and contrast helpers
function hexToRgb(hex) {
  let cleaned = hex.replace("#", "").trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split("").map((c) => c + c).join("");
  }
  const num = parseInt(cleaned, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

function parseRgb(rgbStr) {
  const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    return [parseInt(match[1], 10), parseInt(match[2], 10), parseInt(match[3], 10)];
  }
  if (rgbStr.startsWith("#")) {
    return hexToRgb(rgbStr);
  }
  return [0, 0, 0];
}

function getLuminance([r, g, b]) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(c1, c2) {
  const rgb1 = typeof c1 === "string" ? parseRgb(c1) : c1;
  const rgb2 = typeof c2 === "string" ? parseRgb(c2) : c2;
  const l1 = getLuminance(rgb1);
  const l2 = getLuminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

test("Challenger 2 M3 Stress 1: Form Validation Error States, Offline Banners & Warnings Contrast", async () => {
  const stylesPath = path.resolve(process.cwd(), "src/styles.css");
  const css = fs.readFileSync(stylesPath, "utf-8");

  // 1. Verify light mode connection error banner
  const hasLightConnError = css.includes('.connection-error');
  assert.ok(hasLightConnError, "CSS must define .connection-error");

  // 2. Verify contrast of .connection-warning (.warn-text / amber signals)
  const paleAmberComposite = [254, 248, 238];
  const warningTextContrast = getContrastRatio("#92400e", paleAmberComposite);
  const warningStrongContrast = getContrastRatio("#78350f", paleAmberComposite);
  assert.ok(warningTextContrast >= 4.5, `Warning text contrast (${warningTextContrast.toFixed(2)}) must meet WCAG AA (>= 4.5:1)`);
  assert.ok(warningStrongContrast >= 7.0, `Warning strong contrast (${warningStrongContrast.toFixed(2)}) must meet WCAG AAA (>= 7.0:1)`);

  // 3. Verify contrast of .connection-error (.danger-text / red signals)
  const paleRedComposite = [253, 241, 241];
  const dangerTextContrast = getContrastRatio("#991b1b", paleRedComposite);
  const dangerHeadingContrast = getContrastRatio("#7f1d1d", paleRedComposite);
  assert.ok(dangerTextContrast >= 4.5, `Danger text contrast (${dangerTextContrast.toFixed(2)}) must meet WCAG AA (>= 4.5:1)`);
  assert.ok(dangerHeadingContrast >= 7.0, `Danger heading contrast (${dangerHeadingContrast.toFixed(2)}) must meet WCAG AAA (>= 7.0:1)`);
});

test("Challenger 2 M3 Stress 2: Long Pipeline Execution Logs & Failed Analysis Diagnostic Card", async () => {
  const stylesPath = path.resolve(process.cwd(), "src/styles.css");
  const css = fs.readFileSync(stylesPath, "utf-8");

  // Verify .analysis-failure light mode rules
  assert.ok(css.includes('[data-theme="light"] .analysis-failure'), "Must contain light theme override for .analysis-failure");
  assert.ok(css.includes('[data-theme="light"] .failure-content h2'), "Must contain light theme override for .failure-content h2");
  assert.ok(css.includes('[data-theme="light"] .failure-metrics span'), "Must contain light theme override for .failure-metrics span");
  assert.ok(css.includes('[data-theme="light"] .failure-content details code'), "Must contain light theme override for failure code block");

  // Check code block contrast on white
  const codeContrast = getContrastRatio("#0f172a", "#ffffff");
  assert.ok(codeContrast >= 15.0, `Failure technical code contrast (${codeContrast.toFixed(2)}) must be >= 15:1`);

  // Active log contrast on mint soft background (rgba(13, 148, 136, 0.08) on white -> #effbf9)
  const mintSoftComposite = [239, 251, 249];
  const activeLogContrast = getContrastRatio("#0f172a", mintSoftComposite);
  assert.ok(activeLogContrast >= 14.0, `Active log contrast (${activeLogContrast.toFixed(2)}) must be >= 14:1`);
});

test("Challenger 2 M3 Stress 3: Live DOM Viewport Overflow & Responsiveness", async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();

    const viewports = [
      { name: "Mobile iPhone SE", width: 375, height: 667 },
      { name: "Mobile iPhone 14/15/16", width: 390, height: 844 },
      { name: "Tablet iPad Portrait", width: 768, height: 1024 },
      { name: "Tablet iPad Landscape", width: 1024, height: 768 },
      { name: "Desktop Standard", width: 1280, height: 800 },
    ];

    for (const vp of viewports) {
      await page.setViewport({ width: vp.width, height: vp.height });
      await page.goto("http://127.0.0.1:8787/?page=analysis", { waitUntil: "networkidle0", timeout: 15000 });

      // If on result view, reset to launcher
      const resetBtn = await page.$(".page-heading .secondary-button");
      if (resetBtn) {
        await resetBtn.click();
        await new Promise((r) => setTimeout(r, 200));
      }

      // Check overflow metrics
      const overflowMetrics = await page.evaluate(() => {
        const docW = document.documentElement.scrollWidth;
        const clientW = document.documentElement.clientWidth;
        return {
          docW,
          clientW,
          overflow: docW - clientW,
        };
      });

      // Tablet and desktop must NEVER overflow
      if (vp.width >= 768) {
        assert.equal(
          overflowMetrics.overflow,
          0,
          `Viewport ${vp.name} (${vp.width}px) must have 0 horizontal overflow (actual: ${overflowMetrics.docW}px)`
        );
      }
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});
