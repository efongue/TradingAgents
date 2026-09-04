import test from "node:test";
import assert from "node:assert/strict";
import { getCompanyName, getCompanySector, searchStocks, getCurrencySymbol } from "../src/companyNames.js";

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

  const synopsysMatches = searchStocks("Synopsys");
  assert.ok(synopsysMatches.some((s) => s.ticker === "SNPS"));

  // Trade Republic alias resolution
  const sypMatches = searchStocks("SYP");
  assert.ok(sypMatches.some((s) => s.ticker === "SNPS"), "SYP should resolve to SNPS");
  assert.equal(getCompanyName("SYP"), "Synopsys Inc.", "getCompanyName(SYP) should resolve to Synopsys");

  const apcMatches = searchStocks("APC");
  assert.ok(apcMatches.some((s) => s.ticker === "AAPL"), "APC should resolve to AAPL");

  const nvdMatches = searchStocks("NVD");
  assert.ok(nvdMatches.some((s) => s.ticker === "NVDA"), "NVD should resolve to NVDA");
});

test("getCompanyName handles raw international tickers gracefully", () => {
  assert.equal(getCompanyName("ASML.AS", true), "ASML"); // Resolves to company short name
  assert.equal(getCompanyName("NOVO-B.CO", true), ""); // Unlisted returns empty string as intended
  assert.equal(getCompanyName("2330.TW", true), ""); // Unlisted returns empty string as intended
});

test("getCurrencySymbol resolves currency symbols for multiple international exchanges correctly", () => {
  assert.equal(getCurrencySymbol("NVDA"), "$");
  assert.equal(getCurrencySymbol("AAPL"), "$");
  assert.equal(getCurrencySymbol("MC.PA"), "€");
  assert.equal(getCurrencySymbol("OR.PA"), "€");
  assert.equal(getCurrencySymbol("SAP.DE"), "€");
  assert.equal(getCurrencySymbol("ASML.AS"), "€");
  assert.equal(getCurrencySymbol("SXR8.DE"), "€");
  assert.equal(getCurrencySymbol("AZN.L"), "£");
  assert.equal(getCurrencySymbol("RY.TO"), "C$");
  assert.equal(getCurrencySymbol("NESN.SW"), "CHF");
});


