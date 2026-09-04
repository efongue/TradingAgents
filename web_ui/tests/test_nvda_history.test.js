import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  getDecisionTone,
  formatDecisionLabel,
  getDecisionStrength,
} from "../src/decisionUtils.js";
import { getCompanyName } from "../src/companyNames.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const historyFile = path.resolve(__dirname, "../data/history.json");

test("NVDA History items integrity and formatters", () => {
  assert.ok(fs.existsSync(historyFile), "history.json must exist");
  const historyData = JSON.parse(fs.readFileSync(historyFile, "utf-8"));
  const nvdaItems = historyData.filter((item) => item.ticker === "NVDA");

  assert.ok(nvdaItems.length > 0, "NVDA items must exist in history");

  for (const item of nvdaItems) {
    assert.equal(item.ticker, "NVDA");
    assert.ok(item.id, "id must be present");
    assert.ok(item.created_at, "created_at must be present");

    const tone = getDecisionTone(item.display_decision);
    assert.ok(["positive", "negative", "neutral"].includes(tone));

    const label = formatDecisionLabel(item.display_decision);
    assert.ok(typeof label === "string" && label.length > 0);

    const strength = getDecisionStrength(item.display_decision);
    assert.ok(strength && typeof strength.level === "number");

    const company = getCompanyName(item.ticker);
    assert.equal(company, "NVIDIA Corporation");

    // Check execution levels if present
    if (item.execution_levels) {
      assert.ok(typeof item.execution_levels.entry_price === "number");
      assert.ok(typeof item.execution_levels.target_price === "number");
      assert.ok(typeof item.execution_levels.stop_loss === "number");
    }
  }
});
