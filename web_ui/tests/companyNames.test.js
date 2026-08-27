import test from "node:test";
import assert from "node:assert/strict";
import { getCompanyName, getCompanySector, searchStocks } from "../src/companyNames.js";

test("getCompanyName resolves French CAC 40 tickers correctly", () => {
  assert.equal(getCompanyName("DSY.PA", true), "Dassault Systèmes");
  assert.equal(getCompanyName("DSY", true), "Dassault Systèmes");
  assert.equal(getCompanyName("SAF.PA", true), "Safran");
  assert.equal(getCompanyName("HO.PA", true), "Thales");
  assert.equal(getCompanyName("RI.PA", true), "Pernod Ricard");
  assert.equal(getCompanyName("CS.PA", true), "AXA");
  assert.equal(getCompanyName("CAP.PA", true), "Capgemini");
  assert.equal(getCompanyName("SU.PA", true), "Schneider Electric");
  assert.equal(getCompanyName("SAN.PA", true), "Sanofi");
  assert.equal(getCompanyName("AIR.PA", true), "Airbus");
  assert.equal(getCompanyName("OR.PA", true), "L'Oréal");
  assert.equal(getCompanyName("TTE.PA", true), "TotalEnergies");
});

test("getCompanyName resolves US tickers and distinguishes DIS from DSY", () => {
  assert.equal(getCompanyName("DIS", true), "Disney");
  assert.equal(getCompanyName("DIS"), "The Walt Disney Company");
  assert.equal(getCompanyName("DSY.PA"), "Dassault Systèmes SE");
  assert.equal(getCompanyName("BRK-B", true), "Berkshire Hathaway");
  assert.equal(getCompanyName("HD", true), "Home Depot");
});

test("searchStocks returns matching stocks for tickers and company names", () => {
  const nvdaMatches = searchStocks("NVDA");
  assert.ok(nvdaMatches.some((s) => s.ticker === "NVDA"));

  const msMatches = searchStocks("MS");
  assert.ok(msMatches.some((s) => s.ticker === "MSFT"));
  assert.ok(msMatches.some((s) => s.ticker === "MS"));

  const lvmhMatches = searchStocks("LVMH");
  assert.ok(lvmhMatches.some((s) => s.ticker === "MC.PA" || s.ticker === "MC"));

  const airbusMatches = searchStocks("Airbus");
  assert.ok(airbusMatches.some((s) => s.ticker === "AIR.PA" || s.ticker === "AIR"));
});
