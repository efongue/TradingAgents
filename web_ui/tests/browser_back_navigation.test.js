import test from "node:test";
import assert from "node:assert/strict";
import puppeteer from "puppeteer";

test("Browser Navigation: History Back and Forward buttons navigate seamlessly without crashes", async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on("pageerror", (err) => pageErrors.push(err.toString()));

    // 1. Start on Home / Analysis
    await page.goto("http://127.0.0.1:8787/?page=analysis", { waitUntil: "networkidle0" });
    assert.equal(page.url().includes("page=analysis"), true);

    // 2. Navigate to Watchlist
    await page.evaluate(() => {
      const watchlistBtn = Array.from(document.querySelectorAll(".nav-item")).find(b => b.textContent.includes("Titres surveillés"));
      if (watchlistBtn) watchlistBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));
    assert.equal(page.url().includes("page=watchlist"), true);

    // 3. Navigate to Scanner
    await page.evaluate(() => {
      const scannerBtn = Array.from(document.querySelectorAll(".nav-item")).find(b => b.textContent.includes("Scan"));
      if (scannerBtn) scannerBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));
    assert.equal(page.url().includes("page=scanner"), true);

    // 4. Hit Browser BACK (should return to Watchlist)
    await page.goBack({ waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 300));
    assert.equal(page.url().includes("page=watchlist"), true);

    // 5. Hit Browser BACK again (should return to Analysis)
    await page.goBack({ waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 300));
    assert.equal(page.url().includes("page=analysis"), true);

    // 6. Hit Browser FORWARD (should go forward to Watchlist)
    await page.goForward({ waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 300));
    assert.equal(page.url().includes("page=watchlist"), true);

    assert.equal(pageErrors.length, 0, `Errors during back/forward navigation: ${pageErrors.join(", ")}`);
  } finally {
    if (browser) await browser.close();
  }
});
