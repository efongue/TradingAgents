import test from "node:test";
import assert from "node:assert/strict";

function resolveAppRoute(urlString) {
  const url = new URL(urlString, "http://127.0.0.1:8787");
  const params = url.searchParams;
  const rawPage = params.get("page");
  const validPages = ["landing", "analysis", "performance", "scanner", "compare", "watchlist", "history", "models", "settings"];
  
  const page = rawPage && validPages.includes(rawPage) ? rawPage : "analysis";
  const ticker = params.get("ticker") ? params.get("ticker").toUpperCase().trim() : null;
  const search = params.get("search") ? params.get("search").trim() : ticker;
  const tickers = params.get("tickers")
    ? params.get("tickers").split(",").map((t) => t.trim().toUpperCase()).filter(Boolean)
    : ticker ? [ticker] : ["NVDA", "MSFT"];
  const symbols = params.get("symbols") ? params.get("symbols").toUpperCase().trim() : ticker;
  const historyId = params.get("history");
  const hash = url.hash.replace("#", "");

  return {
    page,
    ticker,
    search,
    tickers,
    symbols,
    historyId,
    hash,
    effectiveScannerUniverse: symbols ? "custom" : "us-large",
    effectiveScannerSymbols: symbols || "AAPL, MSFT, NVDA, AMZN, GOOGL, META",
    effectiveHistoryFilter: search || "",
    effectivePerformanceFilter: search || "",
  };
}

test("URL Routing: ?page=history&ticker=NVDA#performance resolves correctly without error", () => {
  const route = resolveAppRoute("http://127.0.0.1:8787/?page=history&ticker=NVDA#performance");
  assert.equal(route.page, "history");
  assert.equal(route.ticker, "NVDA");
  assert.equal(route.effectiveHistoryFilter, "NVDA");
  assert.equal(route.hash, "performance");
});

test("URL Routing: ?page=scanner&ticker=NVDA sets up custom universe for scanner", () => {
  const route = resolveAppRoute("http://127.0.0.1:8787/?page=scanner&ticker=NVDA");
  assert.equal(route.page, "scanner");
  assert.equal(route.ticker, "NVDA");
  assert.equal(route.effectiveScannerUniverse, "custom");
  assert.equal(route.effectiveScannerSymbols, "NVDA");
});

test("URL Routing: ?page=performance&ticker=NVDA auto-filters performance simulator", () => {
  const route = resolveAppRoute("http://127.0.0.1:8787/?page=performance&ticker=NVDA");
  assert.equal(route.page, "performance");
  assert.equal(route.ticker, "NVDA");
  assert.equal(route.effectivePerformanceFilter, "NVDA");
});

test("URL Routing: ?page=compare&tickers=AAPL,MSFT,NVDA parses multi-stock comparison list", () => {
  const route = resolveAppRoute("http://127.0.0.1:8787/?page=compare&tickers=AAPL,MSFT,NVDA");
  assert.equal(route.page, "compare");
  assert.deepEqual(route.tickers, ["AAPL", "MSFT", "NVDA"]);
});

test("URL Routing: invalid page fallback defaults safely to analysis", () => {
  const route = resolveAppRoute("http://127.0.0.1:8787/?page=unknown_hack");
  assert.equal(route.page, "analysis");
});
