import test from "node:test";
import assert from "node:assert/strict";
import puppeteer from "puppeteer";

test("Browser Smoke Test: All 7 primary application views mount with zero runtime console errors", async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();

    const pagesToTest = [
      "http://127.0.0.1:8787",
      "http://127.0.0.1:8787/?page=analysis",
      "http://127.0.0.1:8787/?page=scanner",
      "http://127.0.0.1:8787/?page=compare",
      "http://127.0.0.1:8787/?page=watchlist",
      "http://127.0.0.1:8787/?page=history",
      "http://127.0.0.1:8787/?page=performance"
    ];

    for (const url of pagesToTest) {
      const pageErrors = [];
      page.on("pageerror", (err) => pageErrors.push(err.toString()));

      await page.goto(url, { waitUntil: "networkidle0", timeout: 8000 });
      assert.equal(pageErrors.length, 0, `Errors encountered on ${url}: ${pageErrors.join(", ")}`);
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});
