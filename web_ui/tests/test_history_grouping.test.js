import test from "node:test";
import assert from "node:assert/strict";

function groupHistoryItems(items) {
  const map = new Map();
  items.forEach((item) => {
    const ticker = item.ticker;
    if (!map.has(ticker)) {
      map.set(ticker, []);
    }
    map.get(ticker).push(item);
  });
  return Array.from(map.entries()).map(([ticker, groupItems]) => {
    const latest = groupItems[0];
    const previous = groupItems.slice(1);
    const prev = previous[0];
    const priceDelta =
      latest.close && prev?.close
        ? ((Number(latest.close) - Number(prev.close)) / Number(prev.close)) * 100
        : null;
    const priceDiffAmount =
      latest.close && prev?.close
        ? Number(latest.close) - Number(prev.close)
        : null;
    const decisionShift =
      prev && latest.display_decision !== prev.display_decision;

    return {
      ticker,
      items: groupItems,
      chronologicalRuns: [...groupItems].reverse(),
      latest,
      previous,
      totalRuns: groupItems.length,
      hasPrevious: previous.length > 0,
      priceDelta,
      priceDiffAmount,
      decisionShift,
    };
  });
}

test("History Grouping: properly aggregates single and multi-run tickers", () => {
  const mockHistory = [
    { id: "nvda-1", ticker: "NVDA", close: 227.98, display_decision: "SURPONDÉRER", created_at: "28/08/2026 01:00" },
    { id: "nvda-2", ticker: "NVDA", close: 220.00, display_decision: "ACHETER", created_at: "27/08/2026 12:00" },
    { id: "v-1", ticker: "V", close: 280.50, display_decision: "UNDERWEIGHT", created_at: "27/08/2026 11:00" },
    { id: "ma-1", ticker: "MA", close: 450.00, display_decision: "UNDERWEIGHT", created_at: "27/08/2026 10:00" },
    { id: "ma-2", ticker: "MA", close: 440.00, display_decision: "HOLD", created_at: "26/08/2026 09:00" },
    { id: "meta-1", ticker: "META", close: 559.02, display_decision: "ACHETER", created_at: "25/08/2026 03:00" },
  ];

  const grouped = groupHistoryItems(mockHistory);
  assert.equal(grouped.length, 4);

  const nvda = grouped.find((g) => g.ticker === "NVDA");
  assert.ok(nvda);
  assert.equal(nvda.totalRuns, 2);
  assert.equal(nvda.hasPrevious, true);
  assert.equal(nvda.latest.id, "nvda-1");
  assert.equal(nvda.previous.length, 1);
  assert.equal(nvda.previous[0].id, "nvda-2");

  const v = grouped.find((g) => g.ticker === "V");
  assert.ok(v);
  assert.equal(v.totalRuns, 1);
  assert.equal(v.hasPrevious, false);
  assert.equal(v.latest.id, "v-1");

  const ma = grouped.find((g) => g.ticker === "MA");
  assert.ok(ma);
  assert.equal(ma.totalRuns, 2);
  assert.equal(ma.hasPrevious, true);

  const meta = grouped.find((g) => g.ticker === "META");
  assert.ok(meta);
  assert.equal(meta.totalRuns, 1);
  assert.equal(meta.hasPrevious, false);
});
