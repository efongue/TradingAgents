import test from "node:test";
import assert from "node:assert/strict";
import {
  getDecisionTone,
  formatDecisionLabel,
  getDecisionStrength,
  isPositiveDecision,
  isNegativeDecision,
  isNeutralDecision,
} from "../src/decisionUtils.js";

test("getDecisionTone classifies correctly", () => {
  assert.equal(getDecisionTone("ACHAT FORT"), "positive");
  assert.equal(getDecisionTone("SURPONDÉRER"), "positive");
  assert.equal(getDecisionTone("ACCUMULER"), "positive");
  assert.equal(getDecisionTone("ACHETER"), "positive");
  assert.equal(getDecisionTone("BUY"), "positive");
  assert.equal(getDecisionTone("STRONG BUY"), "positive");

  assert.equal(getDecisionTone("CONSERVER"), "neutral");
  assert.equal(getDecisionTone("HOLD"), "neutral");
  assert.equal(getDecisionTone("ATTENDRE"), "neutral");
  assert.equal(getDecisionTone("PONDÉRATION NEUTRE"), "neutral");

  assert.equal(getDecisionTone("VENTE FORTE"), "negative");
  assert.equal(getDecisionTone("SOUS-PONDÉRER"), "negative");
  assert.equal(getDecisionTone("ALLÉGER"), "negative");
  assert.equal(getDecisionTone("VENDRE"), "negative");
  assert.equal(getDecisionTone("SELL"), "negative");
  assert.equal(getDecisionTone("STRONG SELL"), "negative");
});

test("formatDecisionLabel formats in natural French", () => {
  assert.equal(formatDecisionLabel("STRONG BUY"), "ACHAT FORT");
  assert.equal(formatDecisionLabel("ACHAT FORT"), "ACHAT FORT");
  assert.equal(formatDecisionLabel("OVERWEIGHT"), "SURPONDÉRER");
  assert.equal(formatDecisionLabel("SURPONDÉRER"), "SURPONDÉRER");
  assert.equal(formatDecisionLabel("ACCUMULATE"), "ACCUMULER");
  assert.equal(formatDecisionLabel("ACCUMULER"), "ACCUMULER");
  assert.equal(formatDecisionLabel("BUY"), "ACHETER");
  assert.equal(formatDecisionLabel("ACHETER"), "ACHETER");

  assert.equal(formatDecisionLabel("HOLD"), "CONSERVER");
  assert.equal(formatDecisionLabel("CONSERVER"), "CONSERVER");
  assert.equal(formatDecisionLabel("EQUAL-WEIGHT"), "PONDÉRATION NEUTRE");

  assert.equal(formatDecisionLabel("STRONG SELL"), "VENTE FORTE");
  assert.equal(formatDecisionLabel("UNDERWEIGHT"), "SOUS-PONDÉRER");
  assert.equal(formatDecisionLabel("REDUCE"), "ALLÉGER");
  assert.equal(formatDecisionLabel("SELL"), "VENDRE");
});

test("getDecisionStrength returns exact tier and positive tone for ACCUMULER", () => {
  const nvda = getDecisionStrength("ACHAT FORT");
  assert.equal(nvda.level, 3);
  assert.equal(nvda.tier, "strong");
  assert.equal(nvda.tone, "positive");

  const msft = getDecisionStrength("ACCUMULER");
  assert.equal(msft.level, 1);
  assert.equal(msft.tier, "moderate");
  assert.equal(msft.tone, "positive");

  const aapl = getDecisionStrength("CONSERVER");
  assert.equal(aapl.level, 0);
  assert.equal(aapl.tier, "neutral");
  assert.equal(aapl.tone, "neutral");

  const overweight = getDecisionStrength("SURPONDÉRER");
  assert.equal(overweight.level, 2);
  assert.equal(overweight.tier, "strategic");
  assert.equal(overweight.tone, "positive");
});
