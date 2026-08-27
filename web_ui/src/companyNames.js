// Dictionnaire et résolveur des noms complets d'entreprises pour les tickers boursiers (US, CAC 40, Europe)
export const COMPANY_NAMES = {
  // === US MEGA-CAPS & TECH ===
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

  // === US BLUE CHIPS, SANTÉ, FINANCE, CONSO ===
  DIS: { name: "The Walt Disney Company", short: "Disney", sector: "Divertissement" },
  NKE: { name: "Nike Inc.", short: "Nike", sector: "Biens de consommation" },
  SBUX: { name: "Starbucks Corporation", short: "Starbucks", sector: "Restauration" },
  KO: { name: "The Coca-Cola Company", short: "Coca-Cola", sector: "Boissons" },
  PEP: { name: "PepsiCo Inc.", short: "PepsiCo", sector: "Boissons & Snacks" },
  COST: { name: "Costco Wholesale", short: "Costco", sector: "Grande Distribution" },
  WMT: { name: "Walmart Inc.", short: "Walmart", sector: "Grande Distribution" },
  HD: { name: "The Home Depot Inc.", short: "Home Depot", sector: "Bricolage & Équipement" },
  PG: { name: "Procter & Gamble", short: "P&G", sector: "Biens de consommation" },
  JNJ: { name: "Johnson & Johnson", short: "J&J", sector: "Santé & Pharma" },
  LLY: { name: "Eli Lilly and Company", short: "Eli Lilly", sector: "Pharmaceutique" },
  PFE: { name: "Pfizer Inc.", short: "Pfizer", sector: "Pharmaceutique" },
  UNH: { name: "UnitedHealth Group", short: "UnitedHealth", sector: "Assurance Santé" },
  JPM: { name: "JPMorgan Chase & Co.", short: "JPMorgan", sector: "Banque & Finance" },
  BAC: { name: "Bank of America", short: "Bank of America", sector: "Banque" },
  MS: { name: "Morgan Stanley", short: "Morgan Stanley", sector: "Banque d'Investissement" },
  GS: { name: "Goldman Sachs Group", short: "Goldman Sachs", sector: "Banque d'Investissement" },
  "BRK-B": { name: "Berkshire Hathaway Inc.", short: "Berkshire Hathaway", sector: "Holding & Assurance" },
  "BRK.B": { name: "Berkshire Hathaway Inc.", short: "Berkshire Hathaway", sector: "Holding & Assurance" },
  BRKB: { name: "Berkshire Hathaway Inc.", short: "Berkshire Hathaway", sector: "Holding & Assurance" },
  V: { name: "Visa Inc.", short: "Visa", sector: "Paiements" },
  MA: { name: "Mastercard Incorporated", short: "Mastercard", sector: "Paiements" },
  PYPL: { name: "PayPal Holdings", short: "PayPal", sector: "Fintech" },
  XOM: { name: "Exxon Mobil Corporation", short: "ExxonMobil", sector: "Énergie & Pétrole" },
  CVX: { name: "Chevron Corporation", short: "Chevron", sector: "Énergie & Pétrole" },

  // === CAC 40 & BOURSE DE PARIS (.PA) ===
  "DSY.PA": { name: "Dassault Systèmes SE", short: "Dassault Systèmes", sector: "Logiciels 3D & PLM" },
  DSY: { name: "Dassault Systèmes SE", short: "Dassault Systèmes", sector: "Logiciels 3D & PLM" },
  "MC.PA": { name: "LVMH Moët Hennessy", short: "LVMH", sector: "Luxe" },
  MC: { name: "LVMH Moët Hennessy", short: "LVMH", sector: "Luxe" },
  "OR.PA": { name: "L'Oréal S.A.", short: "L'Oréal", sector: "Cosmétiques" },
  OR: { name: "L'Oréal S.A.", short: "L'Oréal", sector: "Cosmétiques" },
  "TTE.PA": { name: "TotalEnergies SE", short: "TotalEnergies", sector: "Énergie" },
  TTE: { name: "TotalEnergies SE", short: "TotalEnergies", sector: "Énergie" },
  "AIR.PA": { name: "Airbus SE", short: "Airbus", sector: "Aéronautique" },
  AIR: { name: "Airbus SE", short: "Airbus", sector: "Aéronautique" },
  "SAN.PA": { name: "Sanofi S.A.", short: "Sanofi", sector: "Pharmaceutique" },
  SAN: { name: "Sanofi S.A.", short: "Sanofi", sector: "Pharmaceutique" },
  "SAF.PA": { name: "Safran SE", short: "Safran", sector: "Aéronautique & Défense" },
  SAF: { name: "Safran SE", short: "Safran", sector: "Aéronautique & Défense" },
  "SU.PA": { name: "Schneider Electric SE", short: "Schneider Electric", sector: "Équipements Électriques" },
  SU: { name: "Schneider Electric SE", short: "Schneider Electric", sector: "Équipements Électriques" },
  "AI.PA": { name: "Air Liquide S.A.", short: "Air Liquide", sector: "Gaz Industriels" },
  AI: { name: "Air Liquide S.A.", short: "Air Liquide", sector: "Gaz Industriels" },
  "BNP.PA": { name: "BNP Paribas", short: "BNP Paribas", sector: "Banque" },
  BNP: { name: "BNP Paribas", short: "BNP Paribas", sector: "Banque" },
  "EL.PA": { name: "EssilorLuxottica", short: "EssilorLuxottica", sector: "Optique" },
  EL: { name: "EssilorLuxottica", short: "EssilorLuxottica", sector: "Optique" },
  "CS.PA": { name: "AXA S.A.", short: "AXA", sector: "Assurance" },
  CS: { name: "AXA S.A.", short: "AXA", sector: "Assurance" },
  "DG.PA": { name: "Vinci SA", short: "Vinci", sector: "Construction & Concessions" },
  DG: { name: "Vinci SA", short: "Vinci", sector: "Construction & Concessions" },
  "RI.PA": { name: "Pernod Ricard SA", short: "Pernod Ricard", sector: "Vins & Spiritueux" },
  RI: { name: "Pernod Ricard SA", short: "Pernod Ricard", sector: "Vins & Spiritueux" },
  "EN.PA": { name: "Bouygues SA", short: "Bouygues", sector: "BTP & Télécoms" },
  EN: { name: "Bouygues SA", short: "Bouygues", sector: "BTP & Télécoms" },
  "CAP.PA": { name: "Capgemini SE", short: "Capgemini", sector: "Services IT & Conseil" },
  CAP: { name: "Capgemini SE", short: "Capgemini", sector: "Services IT & Conseil" },
  "HO.PA": { name: "Thales S.A.", short: "Thales", sector: "Défense & Aérospatial" },
  HO: { name: "Thales S.A.", short: "Thales", sector: "Défense & Aérospatial" },
  "KER.PA": { name: "Kering SA", short: "Kering", sector: "Luxe" },
  KER: { name: "Kering SA", short: "Kering", sector: "Luxe" },
  "RMS.PA": { name: "Hermès International", short: "Hermès", sector: "Luxe" },
  RMS: { name: "Hermès International", short: "Hermès", sector: "Luxe" },
  "VIE.PA": { name: "Veolia Environnement", short: "Veolia", sector: "Environnement & Eau" },
  VIE: { name: "Veolia Environnement", short: "Veolia", sector: "Environnement & Eau" },
  "ORA.PA": { name: "Orange S.A.", short: "Orange", sector: "Télécommunications" },
  ORA: { name: "Orange S.A.", short: "Orange", sector: "Télécommunications" },
  "GLE.PA": { name: "Société Générale", short: "Société Générale", sector: "Banque" },
  GLE: { name: "Société Générale", short: "Société Générale", sector: "Banque" },
  "ACA.PA": { name: "Crédit Agricole S.A.", short: "Crédit Agricole", sector: "Banque" },
  ACA: { name: "Crédit Agricole S.A.", short: "Crédit Agricole", sector: "Banque" },
  "ENGI.PA": { name: "Engie SA", short: "Engie", sector: "Énergie & Gaz" },
  ENGI: { name: "Engie SA", short: "Engie", sector: "Énergie & Gaz" },
  "ML.PA": { name: "Michelin", short: "Michelin", sector: "Pneumatiques" },
  ML: { name: "Michelin", short: "Michelin", sector: "Pneumatiques" },
  "PUB.PA": { name: "Publicis Groupe", short: "Publicis", sector: "Publicité & Médias" },
  PUB: { name: "Publicis Groupe", short: "Publicis", sector: "Publicité & Médias" },
  "SGO.PA": { name: "Saint-Gobain", short: "Saint-Gobain", sector: "Matériaux de construction" },
  SGO: { name: "Saint-Gobain", short: "Saint-Gobain", sector: "Matériaux de construction" },
  "STMPA.PA": { name: "STMicroelectronics N.V.", short: "STMicroelectronics", sector: "Semi-conducteurs" },
  "STM.PA": { name: "STMicroelectronics N.V.", short: "STMicroelectronics", sector: "Semi-conducteurs" },
  STM: { name: "STMicroelectronics N.V.", short: "STMicroelectronics", sector: "Semi-conducteurs" },
  "STLAP.PA": { name: "Stellantis N.V.", short: "Stellantis", sector: "Automobile" },
  STLA: { name: "Stellantis N.V.", short: "Stellantis", sector: "Automobile" },
  "TEP.PA": { name: "Teleperformance SE", short: "Teleperformance", sector: "Services Clients & IA" },
  TEP: { name: "Teleperformance SE", short: "Teleperformance", sector: "Services Clients & IA" },
  "LR.PA": { name: "Legrand SA", short: "Legrand", sector: "Infrastructures Électriques" },
  LR: { name: "Legrand SA", short: "Legrand", sector: "Infrastructures Électriques" },
  "EDEN.PA": { name: "Edenred SE", short: "Edenred", sector: "Services Prépayés" },
  EDEN: { name: "Edenred SE", short: "Edenred", sector: "Services Prépayés" },
  "URW.PA": { name: "Unibail-Rodamco-Westfield", short: "Unibail-Rodamco", sector: "Immobilier Commercial" },
  URW: { name: "Unibail-Rodamco-Westfield", short: "Unibail-Rodamco", sector: "Immobilier Commercial" },
  "SW.PA": { name: "Sodexo S.A.", short: "Sodexo", sector: "Services & Restauration" },
  SW: { name: "Sodexo S.A.", short: "Sodexo", sector: "Services & Restauration" },
  "ALO.PA": { name: "Alstom SA", short: "Alstom", sector: "Matériel Ferroviaire" },
  ALO: { name: "Alstom SA", short: "Alstom", sector: "Matériel Ferroviaire" },
  "RNO.PA": { name: "Renault Group", short: "Renault", sector: "Automobile" },
  RNO: { name: "Renault Group", short: "Renault", sector: "Automobile" },
  "BN.PA": { name: "Danone S.A.", short: "Danone", sector: "Agroalimentaire" },
  BN: { name: "Danone S.A.", short: "Danone", sector: "Agroalimentaire" },
  "CA.PA": { name: "Carrefour S.A.", short: "Carrefour", sector: "Grande Distribution" },
  CA: { name: "Carrefour S.A.", short: "Carrefour", sector: "Grande Distribution" },
  "VIV.PA": { name: "Vivendi SE", short: "Vivendi", sector: "Médias & Divertissement" },
  VIV: { name: "Vivendi SE", short: "Vivendi", sector: "Médias & Divertissement" },
  "WLN.PA": { name: "Worldline SA", short: "Worldline", sector: "Paiements" },
  WLN: { name: "Worldline SA", short: "Worldline", sector: "Paiements" },
  "ELIS.PA": { name: "Elis SA", short: "Elis", sector: "Services aux Entreprises" },
  ELIS: { name: "Elis SA", short: "Elis", sector: "Services aux Entreprises" },
  "ERF.PA": { name: "Eurofins Scientific", short: "Eurofins", sector: "Bio-analyse & Santé" },
  ERF: { name: "Eurofins Scientific", short: "Eurofins", sector: "Bio-analyse & Santé" },
  "BVI.PA": { name: "Bureau Veritas SA", short: "Bureau Veritas", sector: "Certification & Contrôle" },
  BVI: { name: "Bureau Veritas SA", short: "Bureau Veritas", sector: "Certification & Contrôle" },
  "GET.PA": { name: "Getlink SE", short: "Getlink (Eurotunnel)", sector: "Transport & Tunnels" },
  GET: { name: "Getlink SE", short: "Getlink (Eurotunnel)", sector: "Transport & Tunnels" },
  "FDJ.PA": { name: "La Française des Jeux", short: "FDJ", sector: "Jeux & Loteries" },
  FDJ: { name: "La Française des Jeux", short: "FDJ", sector: "Jeux & Loteries" },
  "IPN.PA": { name: "Ipsen SA", short: "Ipsen", sector: "Pharmaceutique" },
  IPN: { name: "Ipsen SA", short: "Ipsen", sector: "Pharmaceutique" },

  // === EUROPE (DAX, SMI, AEX) ===
  "SAP.DE": { name: "SAP SE", short: "SAP", sector: "Logiciels d'entreprise" },
  SAP: { name: "SAP SE", short: "SAP", sector: "Logiciels d'entreprise" },
  "SIE.DE": { name: "Siemens AG", short: "Siemens", sector: "Industrie & Tech" },
  SIE: { name: "Siemens AG", short: "Siemens", sector: "Industrie & Tech" },
  "ALV.DE": { name: "Allianz SE", short: "Allianz", sector: "Assurance" },
  ALV: { name: "Allianz SE", short: "Allianz", sector: "Assurance" },
  "NESN.SW": { name: "Nestlé S.A.", short: "Nestlé", sector: "Agroalimentaire" },
  NESN: { name: "Nestlé S.A.", short: "Nestlé", sector: "Agroalimentaire" },
  "ROG.SW": { name: "Roche Holding AG", short: "Roche", sector: "Pharmaceutique" },
  ROG: { name: "Roche Holding AG", short: "Roche", sector: "Pharmaceutique" },
  "NOVN.SW": { name: "Novartis AG", short: "Novartis", sector: "Pharmaceutique" },
  NOVN: { name: "Novartis AG", short: "Novartis", sector: "Pharmaceutique" },
  "ASML.AS": { name: "ASML Holding NV", short: "ASML", sector: "Équipements Semi-conducteurs" },
};

/**
 * Résout le nom complet ou court d'une entreprise à partir de son symbole boursier.
 * Supporte automatiquement les variantes avec et sans extension de place (ex: DSY.PA -> Dassault Systèmes, DSY -> Dassault Systèmes).
 */
export function getCompanyName(ticker, short = false) {
  if (!ticker) return "";
  const upper = String(ticker).trim().toUpperCase();

  // 1. Recherche exacte directe
  let info = COMPANY_NAMES[upper];

  // 2. Recherche en retirant le suffixe de place (ex: DSY.PA -> DSY, BRK-B -> BRK)
  if (!info && upper.includes(".")) {
    const base = upper.split(".")[0];
    info = COMPANY_NAMES[base];
  }
  if (!info && upper.includes("-")) {
    const base = upper.split("-")[0];
    info = COMPANY_NAMES[base];
  }

  // 3. Recherche en ajoutant le suffixe de place parisien .PA
  if (!info && !upper.includes(".")) {
    info = COMPANY_NAMES[`${upper}.PA`];
  }

  if (info) {
    return short ? info.short : info.name;
  }
  return "";
}

/**
 * Résout le secteur d'activité d'une entreprise.
 */
export function getCompanySector(ticker) {
  if (!ticker) return "";
  const upper = String(ticker).trim().toUpperCase();
  const info =
    COMPANY_NAMES[upper] ||
    (upper.includes(".") ? COMPANY_NAMES[upper.split(".")[0]] : null) ||
    COMPANY_NAMES[`${upper}.PA`];
  return info?.sector || "";
}
