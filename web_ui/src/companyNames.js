// Dictionnaire et résolveur des noms complets d'entreprises pour les tickers boursiers
export const COMPANY_NAMES = {
  // US Mega-Caps & Tech
  NVDA: { name: "NVIDIA Corporation", short: "NVIDIA", sector: "Semi-conducteurs" },
  MSFT: { name: "Microsoft Corporation", short: "Microsoft", sector: "Logiciels & Cloud" },
  AAPL: { name: "Apple Inc.", short: "Apple", sector: "Matériel & Services" },
  AMZN: { name: "Amazon.com Inc.", short: "Amazon", sector: "E-Commerce & Cloud" },
  GOOGL: { name: "Alphabet Inc. (Google)", short: "Alphabet", sector: "Internet & IA" },
  GOOG: { name: "Alphabet Inc. (Google)", short: "Alphabet", sector: "Internet & IA" },
  META: { name: "Meta Platforms Inc.", short: "Meta", sector: "Réseaux Sociaux & IA" },
  TSLA: { name: "Tesla Inc.", short: "Tesla", sector: "Automobile & Énergie" },
  NFLX: { name: "Netflix Inc.", short: "Netflix", sector: "Streaming & Médias" },
  AMD: { name: "Advanced Micro Devices", short: "AMD", sector: "Semi-conducteurs" },
  INTC: { name: "Intel Corporation", short: "Intel", sector: "Semi-conducteurs" },
  AVGO: { name: "Broadcom Inc.", short: "Broadcom", sector: "Semi-conducteurs" },
  QCOM: { name: "Qualcomm Inc.", short: "Qualcomm", sector: "Semi-conducteurs & Télécom" },
  ARM: { name: "Arm Holdings plc", short: "ARM", sector: "Semi-conducteurs" },
  PLTR: { name: "Palantir Technologies", short: "Palantir", sector: "Logiciels & Défense" },
  ORCL: { name: "Oracle Corporation", short: "Oracle", sector: "Logiciels & Base de données" },
  CRM: { name: "Salesforce Inc.", short: "Salesforce", sector: "Logiciels CRM" },
  ADBE: { name: "Adobe Inc.", short: "Adobe", sector: "Logiciels Créatifs" },
  CSCO: { name: "Cisco Systems", short: "Cisco", sector: "Réseaux" },
  IBM: { name: "IBM Corporation", short: "IBM", sector: "Services & IA" },
  TXN: { name: "Texas Instruments", short: "Texas Instruments", sector: "Semi-conducteurs" },
  ASML: { name: "ASML Holding NV", short: "ASML", sector: "Équipements Semi-conducteurs" },
  TSM: { name: "Taiwan Semiconductor", short: "TSMC", sector: "Fonderie Semi-conducteurs" },
  BABA: { name: "Alibaba Group", short: "Alibaba", sector: "E-Commerce & Cloud" },
  UBER: { name: "Uber Technologies", short: "Uber", sector: "Mobilité & Livraison" },
  COIN: { name: "Coinbase Global", short: "Coinbase", sector: "Crypto & Fintech" },

  // US Blue Chips & Santé / Finance / Conso
  DIS: { name: "Walt Disney Company", short: "Disney", sector: "Divertissement" },
  NKE: { name: "Nike Inc.", short: "Nike", sector: "Biens de consommation" },
  SBUX: { name: "Starbucks Corporation", short: "Starbucks", sector: "Restauration" },
  KO: { name: "The Coca-Cola Company", short: "Coca-Cola", sector: "Boissons" },
  PEP: { name: "PepsiCo Inc.", short: "PepsiCo", sector: "Boissons & Snacks" },
  COST: { name: "Costco Wholesale", short: "Costco", sector: "Grande Distribution" },
  WMT: { name: "Walmart Inc.", short: "Walmart", sector: "Grande Distribution" },
  PG: { name: "Procter & Gamble", short: "P&G", sector: "Biens de consommation" },
  JNJ: { name: "Johnson & Johnson", short: "J&J", sector: "Santé & Pharma" },
  LLY: { name: "Eli Lilly and Company", short: "Eli Lilly", sector: "Pharmaceutique" },
  PFE: { name: "Pfizer Inc.", short: "Pfizer", sector: "Pharmaceutique" },
  UNH: { name: "UnitedHealth Group", short: "UnitedHealth", sector: "Assurance Santé" },
  JPM: { name: "JPMorgan Chase & Co.", short: "JPMorgan", sector: "Banque & Finance" },
  BAC: { name: "Bank of America", short: "Bank of America", sector: "Banque" },
  MS: { name: "Morgan Stanley", short: "Morgan Stanley", sector: "Banque d'Investissement" },
  GS: { name: "Goldman Sachs Group", short: "Goldman Sachs", sector: "Banque d'Investissement" },
  V: { name: "Visa Inc.", short: "Visa", sector: "Paiements" },
  MA: { name: "Mastercard Incorporated", short: "Mastercard", sector: "Paiements" },
  PYPL: { name: "PayPal Holdings", short: "PayPal", sector: "Fintech" },
  XOM: { name: "Exxon Mobil Corporation", short: "ExxonMobil", sector: "Énergie & Pétrole" },
  CVX: { name: "Chevron Corporation", short: "Chevron", sector: "Énergie & Pétrole" },

  // Europe & CAC 40
  "MC.PA": { name: "LVMH Moët Hennessy", short: "LVMH", sector: "Luxe" },
  "OR.PA": { name: "L'Oréal S.A.", short: "L'Oréal", sector: "Cosmétiques" },
  "TTE.PA": { name: "TotalEnergies SE", short: "TotalEnergies", sector: "Énergie" },
  "AIR.PA": { name: "Airbus SE", short: "Airbus", sector: "Aéronautique" },
  "SAN.PA": { name: "Sanofi S.A.", short: "Sanofi", sector: "Pharmaceutique" },
  "RMS.PA": { name: "Hermès International", short: "Hermès", sector: "Luxe" },
  "BNP.PA": { name: "BNP Paribas", short: "BNP Paribas", sector: "Banque" },
  "AI.PA": { name: "Air Liquide", short: "Air Liquide", sector: "Gaz Industriels" },
  "SU.PA": { name: "Schneider Electric", short: "Schneider Electric", sector: "Équipements Électriques" },
  "KER.PA": { name: "Kering SA", short: "Kering", sector: "Luxe" },
  "EL.PA": { name: "EssilorLuxottica", short: "EssilorLuxottica", sector: "Optique" },
  "DG.PA": { name: "Vinci SA", short: "Vinci", sector: "Construction & Concessions" },
  "CAP.PA": { name: "Capgemini SE", short: "Capgemini", sector: "Services IT" },
  "GLE.PA": { name: "Société Générale", short: "Société Générale", sector: "Banque" },
};

export function getCompanyName(ticker, short = false) {
  if (!ticker) return "";
  const upper = String(ticker).trim().toUpperCase();
  const info = COMPANY_NAMES[upper];
  if (info) {
    return short ? info.short : info.name;
  }
  return "";
}

export function getCompanySector(ticker) {
  if (!ticker) return "";
  const upper = String(ticker).trim().toUpperCase();
  return COMPANY_NAMES[upper]?.sector || "";
}
