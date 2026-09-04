import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import puppeteer from "puppeteer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const stylesPath = path.resolve(__dirname, "../src/styles.css");

test("Terminal UI: Static CSS classes existence and contract verification", () => {
  const css = fs.readFileSync(stylesPath, "utf-8");
  
  const requiredClasses = [
    ".terminal-header",
    ".terminal-brand-title",
    ".terminal-badge",
    ".terminal-search-wrapper",
    ".terminal-market-pulse",
    ".terminal-model-pill",
    ".workspace-layout",
    ".workspace-main",
    ".workspace-sidebar",
    ".context-drawer",
    ".context-ticker-card",
    ".floating-task-dock",
    ".dock-pulse-core"
  ];

  for (const cls of requiredClasses) {
    assert.ok(css.includes(cls), `CSS must include class ${cls}`);
  }
});

test("Terminal UI: E2E Live Mount of Terminal Header, Drawer and Workspace Layout", async () => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(err.toString()));

    await page.goto("http://127.0.0.1:8787/?page=analysis&ticker=NVDA", {
      waitUntil: "networkidle0",
      timeout: 10000
    });

    assert.equal(pageErrors.length, 0, `Errors during mount: ${pageErrors.join(", ")}`);

    // Verify TerminalHeader is present in DOM
    const headerExists = await page.$(".terminal-header");
    assert.ok(headerExists, "TerminalHeader must be present in DOM");

    const badgeText = await page.$eval(".terminal-badge", (el) => el.textContent.trim());
    assert.equal(badgeText, "TERMINAL");

    // Verify Market pulse indicator is present
    const marketPulse = await page.$(".terminal-market-pulse");
    assert.ok(marketPulse, "Market Pulse pill should be rendered on desktop");

    // Verify Context Drawer is present
    const contextDrawer = await page.$(".context-drawer");
    assert.ok(contextDrawer, "WorkspaceContextDrawer should be rendered on workspace pages");

    // Verify Ticker cards inside Context Drawer
    const tickerCards = await page.$$(".context-ticker-card");
    assert.ok(tickerCards.length > 0, "Context Drawer should display ticker candidate cards");

    // Verify Search Input inside Terminal Header
    const searchInput = await page.$(".terminal-search-wrapper input");
    assert.ok(searchInput, "Global search input should be present in TerminalHeader");

  } finally {
    if (browser) {
      await browser.close();
    }
  }
});
