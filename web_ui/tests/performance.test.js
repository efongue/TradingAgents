import test from "node:test";
import assert from "node:assert/strict";

test("Calcul des niveaux d'exécution : Achat Fort / Strong Buy", () => {
  const close = 100.0;
  const targetPct = 18.5;
  const stopPct = -6.0;
  const targetPrice = Math.round(close * (1 + targetPct / 100) * 100) / 100;
  const stopPrice = Math.round(close * (1 + stopPct / 100) * 100) / 100;
  const reward = Math.abs(targetPrice - close);
  const risk = Math.abs(close - stopPrice);
  const rr = Math.round((reward / risk) * 10) / 10;

  assert.equal(targetPrice, 118.5);
  assert.equal(stopPrice, 94.0);
  assert.equal(rr, 3.1);
  assert.ok(rr >= 3.0, "Le ratio R/R doit être >= 3 pour un achat fort");
});

test("Calcul de l'alpha par rapport au S&P 500", () => {
  const stockReturn = 12.5; // +12.5%
  const sp500Return = 4.2;  // +4.2%
  const alpha = Math.round((stockReturn - sp500Return) * 100) / 100;

  assert.equal(alpha, 8.3);
  assert.ok(alpha > 0, "L'alpha doit être positif en cas de surperformance");
});
