import test from "node:test";
import assert from "node:assert/strict";

test("Simulation de portefeuille équipondéré sur trades sélectionnés", () => {
  const capital = 10000;
  const selectedTrades = [
    { ticker: "NVDA", return_percent: 18.5, sp500_return_percent: 3.5 },
    { ticker: "MSFT", return_percent: 8.0, sp500_return_percent: 2.0 },
    { ticker: "AAPL", return_percent: -2.5, sp500_return_percent: 1.0 },
  ];

  const count = selectedTrades.length;
  const allocationPerTrade = capital / count;
  const avgReturn = selectedTrades.reduce((acc, t) => acc + t.return_percent, 0) / count;
  const avgSp500 = selectedTrades.reduce((acc, t) => acc + t.sp500_return_percent, 0) / count;
  const totalPnl = capital * (avgReturn / 100);
  const finalCapital = capital + totalPnl;
  const alpha = avgReturn - avgSp500;
  assert.equal(count, 3);
  assert.equal(Math.round(avgReturn * 100) / 100, 8.0); // (18.5 + 8.0 - 2.5) / 3 = 8.0%
  assert.equal(totalPnl, 800.0);
  assert.equal(finalCapital, 10800.0);
  assert.equal(Math.round(alpha * 100) / 100, 5.83); // 8.0 - 2.167 = 5.83%
});

test("Simulation de portefeuille équipondéré avec trades baissiers / protégés", () => {
  const capital = 10000;
  const selectedTrades = [
    { ticker: "NVDA", return_percent: 18.5, sp500_return_percent: 3.5, decision: "ACHAT FORT", status: "win" },
    { ticker: "SPY", return_percent: -8.0, sp500_return_percent: -8.0, decision: "SOUS-PONDÉRER", status: "protected" },
  ];

  const count = selectedTrades.length;
  const allocationPerTrade = capital / count;
  const getEffectiveReturn = (t) => (t.status === "protected" || t.decision === "SOUS-PONDÉRER" ? -t.return_percent : t.return_percent);

  const avgReturn = selectedTrades.reduce((acc, t) => acc + getEffectiveReturn(t), 0) / count;
  const totalPnl = capital * (avgReturn / 100);
  const finalCapital = capital + totalPnl;

  // NVDA: +18.5%, SPY (protected drop -8%): +8% saved = avg 13.25%
  assert.equal(avgReturn, 13.25);
  assert.equal(totalPnl, 1325.0);
  assert.equal(finalCapital, 11325.0);
});

