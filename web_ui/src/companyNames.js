// Dictionnaire et résolveur des noms complets d'entreprises pour les tickers boursiers (US, CAC 40, Europe)
// Les tickers canoniques utilisent le format Yahoo Finance requis par le moteur de données (.PA pour Paris, .DE pour Xetra, .SW pour Zurich, etc.)
export const COMPANY_NAMES = {
  // === US MEGA-CAPS & TECH ===
  NVDA: { name: "NVIDIA Corporation", short: "NVIDIA", sector: "Semi-conducteurs", exchange: "NASDAQ", flag: "🇺🇸" },
  MSFT: { name: "Microsoft Corporation", short: "Microsoft", sector: "Logiciels & Cloud", exchange: "NASDAQ", flag: "🇺🇸" },
  AAPL: { name: "Apple Inc.", short: "Apple", sector: "Matériel & Services", exchange: "NASDAQ", flag: "🇺🇸" },
  AMZN: { name: "Amazon.com Inc.", short: "Amazon", sector: "E-Commerce & Cloud", exchange: "NASDAQ", flag: "🇺🇸" },
  GOOGL: { name: "Alphabet Inc. (Google)", short: "Alphabet", sector: "Internet & IA", exchange: "NASDAQ", flag: "🇺🇸" },
  GOOG: { name: "Alphabet Inc. (Google)", short: "Alphabet", sector: "Internet & IA", exchange: "NASDAQ", flag: "🇺🇸" },
  META: { name: "Meta Platforms Inc.", short: "Meta", sector: "Réseaux Sociaux & IA", exchange: "NASDAQ", flag: "🇺🇸" },
  TSLA: { name: "Tesla Inc.", short: "Tesla", sector: "Automobile & Énergie", exchange: "NASDAQ", flag: "🇺🇸" },
  NFLX: { name: "Netflix Inc.", short: "Netflix", sector: "Streaming & Médias", exchange: "NASDAQ", flag: "🇺🇸" },
  AMD: { name: "Advanced Micro Devices", short: "AMD", sector: "Semi-conducteurs", exchange: "NASDAQ", flag: "🇺🇸" },
  INTC: { name: "Intel Corporation", short: "Intel", sector: "Semi-conducteurs", exchange: "NASDAQ", flag: "🇺🇸" },
  AVGO: { name: "Broadcom Inc.", short: "Broadcom", sector: "Semi-conducteurs", exchange: "NASDAQ", flag: "🇺🇸" },
  QCOM: { name: "Qualcomm Inc.", short: "Qualcomm", sector: "Semi-conducteurs & Télécom", exchange: "NASDAQ", flag: "🇺🇸" },
  ARM: { name: "Arm Holdings plc", short: "ARM", sector: "Semi-conducteurs", exchange: "NASDAQ", flag: "🇺🇸" },
  PLTR: { name: "Palantir Technologies", short: "Palantir", sector: "Logiciels & Défense", exchange: "NYSE", flag: "🇺🇸" },
  ORCL: { name: "Oracle Corporation", short: "Oracle", sector: "Logiciels & Base de données", exchange: "NYSE", flag: "🇺🇸" },
  CRM: { name: "Salesforce Inc.", short: "Salesforce", sector: "Logiciels CRM", exchange: "NYSE", flag: "🇺🇸" },
  ADBE: { name: "Adobe Inc.", short: "Adobe", sector: "Logiciels Créatifs", exchange: "NASDAQ", flag: "🇺🇸" },
  CSCO: { name: "Cisco Systems", short: "Cisco", sector: "Réseaux", exchange: "NASDAQ", flag: "🇺🇸" },
  IBM: { name: "IBM Corporation", short: "IBM", sector: "Services & IA", exchange: "NYSE", flag: "🇺🇸" },
  TXN: { name: "Texas Instruments", short: "Texas Instruments", sector: "Semi-conducteurs", exchange: "NASDAQ", flag: "🇺🇸" },
  ASML: { name: "ASML Holding NV", short: "ASML", sector: "Équipements Semi-conducteurs", exchange: "NASDAQ", flag: "🇺🇸" },
  TSM: { name: "Taiwan Semiconductor", short: "TSMC", sector: "Fonderie Semi-conducteurs", exchange: "NYSE", flag: "🇺🇸" },
  BABA: { name: "Alibaba Group", short: "Alibaba", sector: "E-Commerce & Cloud", exchange: "NYSE", flag: "🇺🇸" },
  UBER: { name: "Uber Technologies", short: "Uber", sector: "Mobilité & Livraison", exchange: "NYSE", flag: "🇺🇸" },
  COIN: { name: "Coinbase Global", short: "Coinbase", sector: "Crypto & Fintech", exchange: "NASDAQ", flag: "🇺🇸" },
  SNPS: { name: "Synopsys Inc.", short: "Synopsys", sector: "Logiciels & EDA Semi-conducteurs", exchange: "NASDAQ", flag: "🇺🇸" },
  CDNS: { name: "Cadence Design Systems", short: "Cadence", sector: "Logiciels & EDA Semi-conducteurs", exchange: "NASDAQ", flag: "🇺🇸" },
  AMAT: { name: "Applied Materials Inc.", short: "Applied Materials", sector: "Équipements Semi-conducteurs", exchange: "NASDAQ", flag: "🇺🇸" },
  LRCX: { name: "Lam Research Corporation", short: "Lam Research", sector: "Équipements Semi-conducteurs", exchange: "NASDAQ", flag: "🇺🇸" },
  KLAC: { name: "KLA Corporation", short: "KLA", sector: "Équipements Semi-conducteurs", exchange: "NASDAQ", flag: "🇺🇸" },
  MU: { name: "Micron Technology Inc.", short: "Micron", sector: "Mémoires & Semi-conducteurs", exchange: "NASDAQ", flag: "🇺🇸" },
  MRVL: { name: "Marvell Technology Inc.", short: "Marvell", sector: "Semi-conducteurs & Réseaux", exchange: "NASDAQ", flag: "🇺🇸" },
  NOW: { name: "ServiceNow Inc.", short: "ServiceNow", sector: "Logiciels Cloud & Workflow", exchange: "NYSE", flag: "🇺🇸" },
  SNOW: { name: "Snowflake Inc.", short: "Snowflake", sector: "Cloud Data Warehouse", exchange: "NYSE", flag: "🇺🇸" },
  DDOG: { name: "Datadog Inc.", short: "Datadog", sector: "Monitoring & Observabilité Cloud", exchange: "NASDAQ", flag: "🇺🇸" },
  CRWD: { name: "CrowdStrike Holdings", short: "CrowdStrike", sector: "Cybersécurité Cloud", exchange: "NASDAQ", flag: "🇺🇸" },
  PANW: { name: "Palo Alto Networks", short: "Palo Alto Networks", sector: "Cybersécurité", exchange: "NASDAQ", flag: "🇺🇸" },
  NET: { name: "Cloudflare Inc.", short: "Cloudflare", sector: "Infrastructure Internet & Sécurité", exchange: "NYSE", flag: "🇺🇸" },
  MDB: { name: "MongoDB Inc.", short: "MongoDB", sector: "Base de données NoSQL", exchange: "NASDAQ", flag: "🇺🇸" },
  SHOP: { name: "Shopify Inc.", short: "Shopify", sector: "E-Commerce", exchange: "NYSE", flag: "🇺🇸" },
  SPOT: { name: "Spotify Technology S.A.", short: "Spotify", sector: "Streaming Audio & Musique", exchange: "NYSE", flag: "🇺🇸" },
  ABNB: { name: "Airbnb Inc.", short: "Airbnb", sector: "Voyages & Réservations", exchange: "NASDAQ", flag: "🇺🇸" },
  SQ: { name: "Block Inc. (Square)", short: "Block", sector: "Fintech & Paiements", exchange: "NYSE", flag: "🇺🇸" },
  NVO: { name: "Novo Nordisk A/S", short: "Novo Nordisk", sector: "Pharmaceutique & Diabète", exchange: "NYSE", flag: "🇩🇰" },
  AZN: { name: "AstraZeneca PLC", short: "AstraZeneca", sector: "Biopharmacie & Oncologie", exchange: "NASDAQ", flag: "🇬🇧" },
  RACE: { name: "Ferrari N.V.", short: "Ferrari", sector: "Automobile de Luxe", exchange: "NYSE", flag: "🇮🇹" },

  // === US BLUE CHIPS, SANTÉ, FINANCE, CONSO ===
  DIS: { name: "The Walt Disney Company", short: "Disney", sector: "Divertissement", exchange: "NYSE", flag: "🇺🇸" },
  NKE: { name: "Nike Inc.", short: "Nike", sector: "Biens de consommation", exchange: "NYSE", flag: "🇺🇸" },
  SBUX: { name: "Starbucks Corporation", short: "Starbucks", sector: "Restauration", exchange: "NASDAQ", flag: "🇺🇸" },
  KO: { name: "The Coca-Cola Company", short: "Coca-Cola", sector: "Boissons", exchange: "NYSE", flag: "🇺🇸" },
  PEP: { name: "PepsiCo Inc.", short: "PepsiCo", sector: "Boissons & Snacks", exchange: "NASDAQ", flag: "🇺🇸" },
  COST: { name: "Costco Wholesale", short: "Costco", sector: "Grande Distribution", exchange: "NASDAQ", flag: "🇺🇸" },
  WMT: { name: "Walmart Inc.", short: "Walmart", sector: "Grande Distribution", exchange: "NYSE", flag: "🇺🇸" },
  HD: { name: "The Home Depot Inc.", short: "Home Depot", sector: "Bricolage & Équipement", exchange: "NYSE", flag: "🇺🇸" },
  PG: { name: "Procter & Gamble", short: "P&G", sector: "Biens de consommation", exchange: "NYSE", flag: "🇺🇸" },
  JNJ: { name: "Johnson & Johnson", short: "J&J", sector: "Santé & Pharma", exchange: "NYSE", flag: "🇺🇸" },
  LLY: { name: "Eli Lilly and Company", short: "Eli Lilly", sector: "Pharmaceutique", exchange: "NYSE", flag: "🇺🇸" },
  PFE: { name: "Pfizer Inc.", short: "Pfizer", sector: "Pharmaceutique", exchange: "NYSE", flag: "🇺🇸" },
  UNH: { name: "UnitedHealth Group", short: "UnitedHealth", sector: "Assurance Santé", exchange: "NYSE", flag: "🇺🇸" },
  JPM: { name: "JPMorgan Chase & Co.", short: "JPMorgan", sector: "Banque & Finance", exchange: "NYSE", flag: "🇺🇸" },
  BAC: { name: "Bank of America", short: "Bank of America", sector: "Banque", exchange: "NYSE", flag: "🇺🇸" },
  MS: { name: "Morgan Stanley", short: "Morgan Stanley", sector: "Banque d'Investissement", exchange: "NYSE", flag: "🇺🇸" },
  GS: { name: "Goldman Sachs Group", short: "Goldman Sachs", sector: "Banque d'Investissement", exchange: "NYSE", flag: "🇺🇸" },
  "BRK-B": { name: "Berkshire Hathaway Inc.", short: "Berkshire Hathaway", sector: "Holding & Assurance", exchange: "NYSE", flag: "🇺🇸" },
  V: { name: "Visa Inc.", short: "Visa", sector: "Paiements", exchange: "NYSE", flag: "🇺🇸" },
  MA: { name: "Mastercard Incorporated", short: "Mastercard", sector: "Paiements", exchange: "NYSE", flag: "🇺🇸" },
  PYPL: { name: "PayPal Holdings", sector: "Fintech", short: "PayPal", exchange: "NASDAQ", flag: "🇺🇸" },
  XOM: { name: "Exxon Mobil Corporation", short: "ExxonMobil", sector: "Énergie & Pétrole", exchange: "NYSE", flag: "🇺🇸" },
  CVX: { name: "Chevron Corporation", short: "Chevron", sector: "Énergie & Pétrole", exchange: "NYSE", flag: "🇺🇸" },

  // === CAC 40 & BOURSE DE PARIS (.PA) ===
  "DSY.PA": { name: "Dassault Systèmes SE", short: "Dassault Systèmes", sector: "Logiciels 3D & PLM", exchange: "Euronext Paris", flag: "🇫🇷" },
  "MC.PA": { name: "LVMH Moët Hennessy", short: "LVMH", sector: "Luxe", exchange: "Euronext Paris", flag: "🇫🇷" },
  "OR.PA": { name: "L'Oréal S.A.", short: "L'Oréal", sector: "Cosmétiques", exchange: "Euronext Paris", flag: "🇫🇷" },
  "TTE.PA": { name: "TotalEnergies SE", short: "TotalEnergies", sector: "Énergie", exchange: "Euronext Paris", flag: "🇫🇷" },
  "AIR.PA": { name: "Airbus SE", short: "Airbus", sector: "Aéronautique", exchange: "Euronext Paris", flag: "🇫🇷" },
  "SAN.PA": { name: "Sanofi S.A.", short: "Sanofi", sector: "Pharmaceutique", exchange: "Euronext Paris", flag: "🇫🇷" },
  "SAF.PA": { name: "Safran SE", short: "Safran", sector: "Aéronautique & Défense", exchange: "Euronext Paris", flag: "🇫🇷" },
  "SU.PA": { name: "Schneider Electric SE", short: "Schneider Electric", sector: "Équipements Électriques", exchange: "Euronext Paris", flag: "🇫🇷" },
  "AI.PA": { name: "Air Liquide S.A.", short: "Air Liquide", sector: "Gaz Industriels", exchange: "Euronext Paris", flag: "🇫🇷" },
  "BNP.PA": { name: "BNP Paribas", short: "BNP Paribas", sector: "Banque", exchange: "Euronext Paris", flag: "🇫🇷" },
  "EL.PA": { name: "EssilorLuxottica", short: "EssilorLuxottica", sector: "Optique", exchange: "Euronext Paris", flag: "🇫🇷" },
  "CS.PA": { name: "AXA S.A.", short: "AXA", sector: "Assurance", exchange: "Euronext Paris", flag: "🇫🇷" },
  "DG.PA": { name: "Vinci SA", short: "Vinci", sector: "Construction & Concessions", exchange: "Euronext Paris", flag: "🇫🇷" },
  "RI.PA": { name: "Pernod Ricard SA", short: "Pernod Ricard", sector: "Vins & Spiritueux", exchange: "Euronext Paris", flag: "🇫🇷" },
  "EN.PA": { name: "Bouygues SA", short: "Bouygues", sector: "BTP & Télécoms", exchange: "Euronext Paris", flag: "🇫🇷" },
  "CAP.PA": { name: "Capgemini SE", short: "Capgemini", sector: "Services IT & Conseil", exchange: "Euronext Paris", flag: "🇫🇷" },
  "HO.PA": { name: "Thales S.A.", short: "Thales", sector: "Défense & Aérospatial", exchange: "Euronext Paris", flag: "🇫🇷" },
  "KER.PA": { name: "Kering SA", short: "Kering", sector: "Luxe", exchange: "Euronext Paris", flag: "🇫🇷" },
  "RMS.PA": { name: "Hermès International", short: "Hermès", sector: "Luxe", exchange: "Euronext Paris", flag: "🇫🇷" },
  "VIE.PA": { name: "Veolia Environnement", short: "Veolia", sector: "Environnement & Eau", exchange: "Euronext Paris", flag: "🇫🇷" },
  "ORA.PA": { name: "Orange S.A.", short: "Orange", sector: "Télécommunications", exchange: "Euronext Paris", flag: "🇫🇷" },
  "GLE.PA": { name: "Société Générale", short: "Société Générale", sector: "Banque", exchange: "Euronext Paris", flag: "🇫🇷" },
  "ACA.PA": { name: "Crédit Agricole S.A.", short: "Crédit Agricole", sector: "Banque", exchange: "Euronext Paris", flag: "🇫🇷" },
  "ENGI.PA": { name: "Engie SA", short: "Engie", sector: "Énergie & Gaz", exchange: "Euronext Paris", flag: "🇫🇷" },
  "ML.PA": { name: "Michelin", short: "Michelin", sector: "Pneumatiques", exchange: "Euronext Paris", flag: "🇫🇷" },
  "PUB.PA": { name: "Publicis Groupe", short: "Publicis", sector: "Publicité & Médias", exchange: "Euronext Paris", flag: "🇫🇷" },
  "SGO.PA": { name: "Saint-Gobain", short: "Saint-Gobain", sector: "Matériaux de construction", exchange: "Euronext Paris", flag: "🇫🇷" },
  "STMPA.PA": { name: "STMicroelectronics N.V.", short: "STMicroelectronics", sector: "Semi-conducteurs", exchange: "Euronext Paris", flag: "🇫🇷" },
  "STLA": { name: "Stellantis N.V.", short: "Stellantis", sector: "Automobile", exchange: "NYSE / Euronext", flag: "🇪🇺" },
  "TEP.PA": { name: "Teleperformance SE", short: "Teleperformance", sector: "Services Clients & IA", exchange: "Euronext Paris", flag: "🇫🇷" },
  "LR.PA": { name: "Legrand SA", short: "Legrand", sector: "Infrastructures Électriques", exchange: "Euronext Paris", flag: "🇫🇷" },
  "EDEN.PA": { name: "Edenred SE", short: "Edenred", sector: "Services Prépayés", exchange: "Euronext Paris", flag: "🇫🇷" },
  "URW.PA": { name: "Unibail-Rodamco-Westfield", short: "Unibail-Rodamco", sector: "Immobilier Commercial", exchange: "Euronext Paris", flag: "🇫🇷" },
  "SW.PA": { name: "Sodexo S.A.", short: "Sodexo", sector: "Services & Restauration", exchange: "Euronext Paris", flag: "🇫🇷" },
  "ALO.PA": { name: "Alstom SA", short: "Alstom", sector: "Matériel Ferroviaire", exchange: "Euronext Paris", flag: "🇫🇷" },
  "RNO.PA": { name: "Renault Group", short: "Renault", sector: "Automobile", exchange: "Euronext Paris", flag: "🇫🇷" },
  "BN.PA": { name: "Danone S.A.", short: "Danone", sector: "Agroalimentaire", exchange: "Euronext Paris", flag: "🇫🇷" },
  "CA.PA": { name: "Carrefour S.A.", short: "Carrefour", sector: "Grande Distribution", exchange: "Euronext Paris", flag: "🇫🇷" },
  "VIV.PA": { name: "Vivendi SE", short: "Vivendi", sector: "Médias & Divertissement", exchange: "Euronext Paris", flag: "🇫🇷" },
  "WLN.PA": { name: "Worldline SA", short: "Worldline", sector: "Paiements", exchange: "Euronext Paris", flag: "🇫🇷" },
  "ELIS.PA": { name: "Elis SA", short: "Elis", sector: "Services aux Entreprises", exchange: "Euronext Paris", flag: "🇫🇷" },
  "ERF.PA": { name: "Eurofins Scientific", short: "Eurofins", sector: "Bio-analyse & Santé", exchange: "Euronext Paris", flag: "🇫🇷" },
  "BVI.PA": { name: "Bureau Veritas SA", short: "Bureau Veritas", sector: "Certification & Contrôle", exchange: "Euronext Paris", flag: "🇫🇷" },
  "GET.PA": { name: "Getlink SE", short: "Getlink (Eurotunnel)", sector: "Transport & Tunnels", exchange: "Euronext Paris", flag: "🇫🇷" },
  "FDJ.PA": { name: "La Française des Jeux", short: "FDJ", sector: "Jeux & Loteries", exchange: "Euronext Paris", flag: "🇫🇷" },
  "IPN.PA": { name: "Ipsen SA", short: "Ipsen", sector: "Pharmaceutique", exchange: "Euronext Paris", flag: "🇫🇷" },

  // === EUROPE (DAX, SMI, AEX) ===
  "SAP.DE": { name: "SAP SE", short: "SAP", sector: "Logiciels d'entreprise", exchange: "XETRA Frankfurt", flag: "🇩🇪" },
  "SIE.DE": { name: "Siemens AG", short: "Siemens", sector: "Industrie & Tech", exchange: "XETRA Frankfurt", flag: "🇩🇪" },
  "ALV.DE": { name: "Allianz SE", short: "Allianz", sector: "Assurance", exchange: "XETRA Frankfurt", flag: "🇩🇪" },
  "NESN.SW": { name: "Nestlé S.A.", short: "Nestlé", sector: "Agroalimentaire", exchange: "SIX Swiss Ex", flag: "🇨🇭" },
  "ROG.SW": { name: "Roche Holding AG", short: "Roche", sector: "Pharmaceutique", exchange: "SIX Swiss Ex", flag: "🇨🇭" },
  "NOVN.SW": { name: "Novartis AG", short: "Novartis", sector: "Pharmaceutique", exchange: "SIX Swiss Ex", flag: "🇨🇭" },
  "ASML.AS": { name: "ASML Holding NV", short: "ASML", sector: "Équipements Semi-conducteurs", exchange: "Euronext Amsterdam", flag: "🇳🇱" },
};

/**
 * Résout le nom complet ou court d'une entreprise à partir de son symbole boursier.
 * Supporte automatiquement les variantes avec et sans extension de place (ex: DSY -> DSY.PA, HO -> HO.PA, BRK.B -> BRK-B).
 */
export function getCompanyName(ticker, short = false) {
  if (!ticker) return "";
  const upper = String(ticker).trim().toUpperCase();

  // 1. Recherche exacte directe
  let info = COMPANY_NAMES[upper];

  // 2. Recherche en ajoutant le suffixe de place parisien .PA (ex: HO -> HO.PA, DSY -> DSY.PA)
  if (!info && !upper.includes(".")) {
    info = COMPANY_NAMES[`${upper}.PA`];
  }

  // 3. Recherche en retirant le suffixe de place (ex: BRK.B -> BRK-B, STM.PA -> STMPA.PA)
  if (!info && upper.includes(".")) {
    const base = upper.split(".")[0];
    info = COMPANY_NAMES[base] || COMPANY_NAMES[`${base}-B`];
  }
  if (!info && upper.includes("-")) {
    const base = upper.split("-")[0];
    info = COMPANY_NAMES[base];
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
    COMPANY_NAMES[`${upper}.PA`] ||
    (upper.includes(".") ? COMPANY_NAMES[upper.split(".")[0]] : null);
  return info?.sector || "";
}

/**
 * Recherche des actions correspondantes (par symbole, nom d'entreprise ou secteur) pour l'autocomplétion.
 * Retourne uniquement les tickers canoniques et évite tout doublon.
 */
export function searchStocks(query, limit = 8) {
  if (!query || !String(query).trim()) return [];
  const q = String(query).trim().toUpperCase();
  const results = [];
  const seenTickers = new Set();

  const add = (ticker, data) => {
    if (!seenTickers.has(ticker)) {
      seenTickers.add(ticker);
      results.push({
        ticker,
        name: data.name,
        short: data.short,
        sector: data.sector,
        exchange: data.exchange || "Marché",
        flag: data.flag || "🌐",
      });
    }
  };

  // 1. Priorité 1 : Le ticker commence par la requête, ou le symbole de base commence par la requête (ex: "HO" -> HO.PA)
  for (const [ticker, data] of Object.entries(COMPANY_NAMES)) {
    const base = ticker.includes(".") ? ticker.split(".")[0] : ticker;
    if (ticker.startsWith(q) || base.startsWith(q)) {
      add(ticker, data);
      if (results.length >= limit) return results;
    }
  }

  // 2. Priorité 2 : Le nom court ou complet commence par la requête (ex: "Thales" -> HO.PA)
  for (const [ticker, data] of Object.entries(COMPANY_NAMES)) {
    if (data.name.toUpperCase().startsWith(q) || data.short.toUpperCase().startsWith(q)) {
      add(ticker, data);
      if (results.length >= limit) return results;
    }
  }

  // 3. Priorité 3 : Contient la requête dans le symbole ou nom
  for (const [ticker, data] of Object.entries(COMPANY_NAMES)) {
    if (
      ticker.includes(q) ||
      data.name.toUpperCase().includes(q) ||
      data.short.toUpperCase().includes(q)
    ) {
      add(ticker, data);
      if (results.length >= limit) return results;
    }
  }

  // 4. Priorité 4 : Contient la requête dans le secteur ou la place boursière
  for (const [ticker, data] of Object.entries(COMPANY_NAMES)) {
    if (
      (data.sector && data.sector.toUpperCase().includes(q)) ||
      (data.exchange && data.exchange.toUpperCase().includes(q))
    ) {
      add(ticker, data);
      if (results.length >= limit) return results;
    }
  }

  return results.slice(0, limit);
}
