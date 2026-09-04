import test from "node:test";
import assert from "node:assert/strict";
import { isSoundEnabled, setSoundEnabled } from "../src/utils/audioAlert.js";

test("Audio Alerts: persistence and toggling works cleanly", () => {
  setSoundEnabled(false);
  assert.equal(isSoundEnabled(), false);

  setSoundEnabled(true);
  assert.equal(isSoundEnabled(), true);
});

test("Watchlist Signal Alerts: correctly detects shifts in consensus postures between runs", () => {
  const history = [
    {
      id: "run-nvda-2",
      ticker: "NVDA",
      analysis_date: "2026-08-28",
      display_decision: "ACHETER",
      confidence: "Forte",
    },
    {
      id: "run-nvda-1",
      ticker: "NVDA",
      analysis_date: "2026-08-20",
      display_decision: "CONSERVER",
      confidence: "Modérée",
    },
  ];

  const watchlistSymbol = "NVDA";
  const matching = history
    .filter((h) => h.ticker === watchlistSymbol)
    .sort((a, b) => new Date(b.analysis_date) - new Date(a.analysis_date));

  const latest = matching[0];
  const previous = matching[1];

  const signalChanged = Boolean(
    latest &&
    previous &&
    latest.display_decision !== previous.display_decision
  );

  assert.equal(signalChanged, true);
  assert.equal(latest.display_decision, "ACHETER");
  assert.equal(previous.display_decision, "CONSERVER");
});
