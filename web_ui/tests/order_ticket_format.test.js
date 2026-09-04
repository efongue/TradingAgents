import test from "node:test";
import assert from "node:assert/strict";
import { isNegativeDecision } from "../src/decisionUtils.js";

function generateOrderTicket({ ticker, levels, decision = "ACCUMULER", currency = "$" }) {
  const { entry_price, target_price, stop_loss, target_change_percent, stop_change_percent, risk_reward_ratio } = levels;
  const isTargetPositive = target_change_percent >= 0;
  const isBearish = isNegativeDecision(decision);
  const actionLabel = isBearish ? "Vente / Allègement" : "Achat";
  const ibkrAction = isBearish ? "SELL" : "BUY";
  const stopLabel = isBearish ? "Stop Couverture (SL)" : "Stop-Loss (SL)";

  const numEntry = Number(entry_price).toFixed(2);
  const numTarget = Number(target_price).toFixed(2);
  const numStop = Number(stop_loss).toFixed(2);

  const standard = `${ticker} · ${actionLabel} Limite : ${Number(entry_price).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} ${currency} | Objectif (TP) : ${Number(target_price).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} ${currency} (${isTargetPositive ? "+" : ""}${target_change_percent}%) | ${stopLabel} : ${Number(stop_loss).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} ${currency} (${stop_change_percent > 0 ? "+" : ""}${stop_change_percent}%) | R:R : ${risk_reward_ratio || 2} : 1`;

  const ibkr = `${ibkrAction} ${ticker} LMT ${numEntry} GTC | TP LMT ${numTarget} | SL STP ${numStop}`;

  const json = {
    symbol: ticker,
    action: ibkrAction,
    orderType: "LMT",
    limitPrice: Number(numEntry),
    takeProfit: Number(numTarget),
    stopLoss: Number(numStop),
    tif: "GTC",
  };

  return { standard, ibkr, json };
}

test("Order Ticket Formatter generates valid Universal, IBKR Bracket, and JSON structures for Bullish trades", () => {
  const levels = {
    entry_price: 227.98,
    target_price: 255.34,
    stop_loss: 216.58,
    target_change_percent: 12.0,
    stop_change_percent: -5.0,
    risk_reward_ratio: 2.4,
  };

  const tickets = generateOrderTicket({ ticker: "NVDA", levels, decision: "ACHAT FORT" });

  // 1. Standard format
  assert.ok(tickets.standard.includes("NVDA · Achat Limite : 227,98 $"));
  assert.ok(tickets.standard.includes("Objectif (TP) : 255,34 $ (+12%)"));
  assert.ok(tickets.standard.includes("Stop-Loss (SL) : 216,58 $ (-5%)"));
  assert.ok(tickets.standard.includes("R:R : 2.4 : 1"));

  // 2. IBKR Bracket syntax
  assert.equal(tickets.ibkr, "BUY NVDA LMT 227.98 GTC | TP LMT 255.34 | SL STP 216.58");

  // 3. JSON API format
  assert.equal(tickets.json.symbol, "NVDA");
  assert.equal(tickets.json.action, "BUY");
  assert.equal(tickets.json.limitPrice, 227.98);
  assert.equal(tickets.json.takeProfit, 255.34);
  assert.equal(tickets.json.stopLoss, 216.58);
  assert.equal(tickets.json.tif, "GTC");
});

test("Order Ticket Formatter generates valid Bearish/Short structures for Sell recommendations", () => {
  const levels = {
    entry_price: 150.0,
    target_price: 135.0,
    stop_loss: 157.5,
    target_change_percent: -10.0,
    stop_change_percent: 5.0,
    risk_reward_ratio: 2.0,
  };

  const tickets = generateOrderTicket({ ticker: "TSLA", levels, decision: "VENTE FORTE" });

  assert.ok(tickets.standard.includes("TSLA · Vente / Allègement Limite"));
  assert.equal(tickets.ibkr, "SELL TSLA LMT 150.00 GTC | TP LMT 135.00 | SL STP 157.50");
  assert.equal(tickets.json.action, "SELL");
});

test("Order Ticket Formatter generates valid SELL/Allègement structures for SOUS-PONDÉRER / UNDERWEIGHT", () => {
  const levels = {
    entry_price: 769.35,
    target_price: 707.80,
    stop_loss: 803.97,
    target_change_percent: -8.0,
    stop_change_percent: 4.5,
    risk_reward_ratio: 1.8,
  };

  const tickets = generateOrderTicket({ ticker: "SPY", levels, decision: "SOUS-PONDÉRER" });

  assert.ok(tickets.standard.includes("SPY · Vente / Allègement Limite : 769,35 $"));
  assert.ok(tickets.standard.includes("Stop Couverture (SL) : 803,97 $ (+4.5%)"));
  assert.equal(tickets.ibkr, "SELL SPY LMT 769.35 GTC | TP LMT 707.80 | SL STP 803.97");
  assert.equal(tickets.json.action, "SELL");
});
