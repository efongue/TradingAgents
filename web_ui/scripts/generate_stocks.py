#!/usr/bin/env python3
"""Generate a comprehensive dictionary of world stocks and Trade Republic aliases for the web UI."""

import json
from pathlib import Path

COMPANIES = {
    # === US MEGA-CAPS & TECH ===
    "NVDA": {"name": "NVIDIA Corporation", "short": "NVIDIA", "sector": "Semi-conducteurs & IA", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "MSFT": {"name": "Microsoft Corporation", "short": "Microsoft", "sector": "Logiciels & Cloud", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "AAPL": {"name": "Apple Inc.", "short": "Apple", "sector": "Matériel & Services", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "AMZN": {"name": "Amazon.com Inc.", "short": "Amazon", "sector": "E-Commerce & Cloud", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "GOOGL": {"name": "Alphabet Inc. (Class A)", "short": "Alphabet", "sector": "Internet & IA", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "GOOG": {"name": "Alphabet Inc. (Class C)", "short": "Alphabet", "sector": "Internet & IA", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "META": {"name": "Meta Platforms Inc.", "short": "Meta", "sector": "Réseaux Sociaux & IA", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "TSLA": {"name": "Tesla Inc.", "short": "Tesla", "sector": "Automobile & Énergie", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "NFLX": {"name": "Netflix Inc.", "short": "Netflix", "sector": "Streaming & Médias", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "AMD": {"name": "Advanced Micro Devices", "short": "AMD", "sector": "Semi-conducteurs", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "INTC": {"name": "Intel Corporation", "short": "Intel", "sector": "Semi-conducteurs", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "AVGO": {"name": "Broadcom Inc.", "short": "Broadcom", "sector": "Semi-conducteurs", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "QCOM": {"name": "Qualcomm Inc.", "short": "Qualcomm", "sector": "Semi-conducteurs & 5G", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "ARM": {"name": "Arm Holdings plc", "short": "ARM", "sector": "Architecture Semi-conducteurs", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "PLTR": {"name": "Palantir Technologies", "short": "Palantir", "sector": "IA & Logiciels Défense", "exchange": "NYSE", "flag": "🇺🇸"},
    "ORCL": {"name": "Oracle Corporation", "short": "Oracle", "sector": "Base de données & Cloud", "exchange": "NYSE", "flag": "🇺🇸"},
    "CRM": {"name": "Salesforce Inc.", "short": "Salesforce", "sector": "Logiciels CRM & Cloud", "exchange": "NYSE", "flag": "🇺🇸"},
    "ADBE": {"name": "Adobe Inc.", "short": "Adobe", "sector": "Logiciels Créatifs & IA", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "CSCO": {"name": "Cisco Systems", "short": "Cisco", "sector": "Réseaux & Sécurité", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "IBM": {"name": "IBM Corporation", "short": "IBM", "sector": "Cloud Hybride & IA", "exchange": "NYSE", "flag": "🇺🇸"},
    "TXN": {"name": "Texas Instruments", "short": "Texas Instruments", "sector": "Semi-conducteurs Analogiques", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "ASML": {"name": "ASML Holding NV (ADR)", "short": "ASML", "sector": "Lithographie Semi-conducteurs", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "TSM": {"name": "Taiwan Semiconductor (ADR)", "short": "TSMC", "sector": "Fonderie Semi-conducteurs", "exchange": "NYSE", "flag": "🇺🇸"},
    "SNPS": {"name": "Synopsys Inc.", "short": "Synopsys", "sector": "Logiciels & EDA Semi-conducteurs", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "CDNS": {"name": "Cadence Design Systems", "short": "Cadence", "sector": "Logiciels & EDA Semi-conducteurs", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "AMAT": {"name": "Applied Materials Inc.", "short": "Applied Materials", "sector": "Équipements Semi-conducteurs", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "LRCX": {"name": "Lam Research Corporation", "short": "Lam Research", "sector": "Équipements Semi-conducteurs", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "KLAC": {"name": "KLA Corporation", "short": "KLA", "sector": "Métrologie Semi-conducteurs", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "MU": {"name": "Micron Technology Inc.", "short": "Micron", "sector": "Mémoires DRAM & NAND", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "MRVL": {"name": "Marvell Technology Inc.", "short": "Marvell", "sector": "Semi-conducteurs Datacenters", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "ADI": {"name": "Analog Devices Inc.", "short": "Analog Devices", "sector": "Semi-conducteurs Analogiques", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "NXPI": {"name": "NXP Semiconductors NV", "short": "NXP", "sector": "Semi-conducteurs Auto & IoT", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "MPWR": {"name": "Monolithic Power Systems", "short": "Monolithic Power", "sector": "Gestion d'Énergie Semi-conducteurs", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "ON": {"name": "ON Semiconductor", "short": "ON Semi", "sector": "Semi-conducteurs Carbure de Silicium", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "SMCI": {"name": "Super Micro Computer", "short": "Supermicro", "sector": "Serveurs IA & Datacenters", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "DELL": {"name": "Dell Technologies", "short": "Dell", "sector": "Serveurs IA & Matériel", "exchange": "NYSE", "flag": "🇺🇸"},
    "HPQ": {"name": "HP Inc.", "short": "HP", "sector": "PC & Impression", "exchange": "NYSE", "flag": "🇺🇸"},
    "HPE": {"name": "Hewlett Packard Enterprise", "short": "HPE", "sector": "Serveurs & Edge Computing", "exchange": "NYSE", "flag": "🇺🇸"},

    # === US CLOUD, SAAS & CYBERSÉCURITÉ ===
    "NOW": {"name": "ServiceNow Inc.", "short": "ServiceNow", "sector": "Workflows d'Entreprise Cloud", "exchange": "NYSE", "flag": "🇺🇸"},
    "SNOW": {"name": "Snowflake Inc.", "short": "Snowflake", "sector": "Data Cloud & Analytics", "exchange": "NYSE", "flag": "🇺🇸"},
    "DDOG": {"name": "Datadog Inc.", "short": "Datadog", "sector": "Observabilité & Monitoring Cloud", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "CRWD": {"name": "CrowdStrike Holdings", "short": "CrowdStrike", "sector": "Cybersécurité Endpoint & Cloud", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "PANW": {"name": "Palo Alto Networks", "short": "Palo Alto Networks", "sector": "Cybersécurité Réseau", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "FTNT": {"name": "Fortinet Inc.", "short": "Fortinet", "sector": "Cybersécurité & Firewalls", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "ZS": {"name": "Zscaler Inc.", "short": "Zscaler", "sector": "Cybersécurité Zero-Trust", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "NET": {"name": "Cloudflare Inc.", "short": "Cloudflare", "sector": "Réseaux & CDN Sécurisé", "exchange": "NYSE", "flag": "🇺🇸"},
    "MDB": {"name": "MongoDB Inc.", "short": "MongoDB", "sector": "Base de données NoSQL", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "INTU": {"name": "Intuit Inc.", "short": "Intuit", "sector": "Logiciels Fiscaux & TurboTax", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "WDAY": {"name": "Workday Inc.", "short": "Workday", "sector": "Logiciels RH & Finance Cloud", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "TEAM": {"name": "Atlassian Corporation", "short": "Atlassian", "sector": "Outils Collaboratifs Jira/Confluence", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "ANSS": {"name": "ANSYS Inc.", "short": "ANSYS", "sector": "Simulation & Ingénierie", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "DOCU": {"name": "DocuSign Inc.", "short": "DocuSign", "sector": "Signature Électronique", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "TWLO": {"name": "Twilio Inc.", "short": "Twilio", "sector": "Communications Cloud & API", "exchange": "NYSE", "flag": "🇺🇸"},
    "OKTA": {"name": "Okta Inc.", "short": "Okta", "sector": "Gestion d'Identité Cloud", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "PATH": {"name": "UiPath Inc.", "short": "UiPath", "sector": "Automatisation RPA & IA", "exchange": "NYSE", "flag": "🇺🇸"},
    "ESTC": {"name": "Elastic N.V.", "short": "Elastic", "sector": "Moteur de Recherche Elasticsearch", "exchange": "NYSE", "flag": "🇺🇸"},
    "GTLB": {"name": "GitLab Inc.", "short": "GitLab", "sector": "DevOps & CI/CD", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "APP": {"name": "AppLovin Corporation", "short": "AppLovin", "sector": "Monétisation d'Applications & IA", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "IOT": {"name": "Samsara Inc.", "short": "Samsara", "sector": "IoT & Opérations Connectées", "exchange": "NYSE", "flag": "🇺🇸"},
    "DUOL": {"name": "Duolingo Inc.", "short": "Duolingo", "sector": "Apprentissage des Langues & IA", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "RBLX": {"name": "Roblox Corporation", "short": "Roblox", "sector": "Métavers & Jeux En Ligne", "exchange": "NYSE", "flag": "🇺🇸"},
    "U": {"name": "Unity Software Inc.", "short": "Unity", "sector": "Moteur 3D Temps Réel", "exchange": "NYSE", "flag": "🇺🇸"},

    # === US E-COMMERCE, STREAMING, CONSO & FINTECH ===
    "SHOP": {"name": "Shopify Inc.", "short": "Shopify", "sector": "Plateforme E-Commerce", "exchange": "NYSE", "flag": "🇺🇸"},
    "SPOT": {"name": "Spotify Technology S.A.", "short": "Spotify", "sector": "Streaming Musical & Podcasts", "exchange": "NYSE", "flag": "🇺🇸"},
    "ABNB": {"name": "Airbnb Inc.", "short": "Airbnb", "sector": "Hébergement & Voyages", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "BKNG": {"name": "Booking Holdings Inc.", "short": "Booking.com", "sector": "Réservations de Voyages", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "EXPE": {"name": "Expedia Group Inc.", "short": "Expedia", "sector": "Voyages En Ligne", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "UBER": {"name": "Uber Technologies", "short": "Uber", "sector": "VTC & Livraison UberEats", "exchange": "NYSE", "flag": "🇺🇸"},
    "DASH": {"name": "DoorDash Inc.", "short": "DoorDash", "sector": "Livraison de Repas", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "COIN": {"name": "Coinbase Global", "short": "Coinbase", "sector": "Bourse Crypto & Web3", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "HOOD": {"name": "Robinhood Markets", "short": "Robinhood", "sector": "Courtage & Trading Sans Frais", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "SOFI": {"name": "SoFi Technologies", "short": "SoFi", "sector": "Néobanque & Crédits", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "AFRM": {"name": "Affirm Holdings", "short": "Affirm", "sector": "Paiement Fractionné BNPL", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "SQ": {"name": "Block Inc. (Square / Cash App)", "short": "Block", "sector": "Paiements Commerçants & Fintech", "exchange": "NYSE", "flag": "🇺🇸"},
    "PYPL": {"name": "PayPal Holdings", "short": "PayPal", "sector": "Paiements Numériques", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "V": {"name": "Visa Inc.", "short": "Visa", "sector": "Réseaux de Cartes Bancaires", "exchange": "NYSE", "flag": "🇺🇸"},
    "MA": {"name": "Mastercard Incorporated", "short": "Mastercard", "sector": "Réseaux de Paiement Mondiaux", "exchange": "NYSE", "flag": "🇺🇸"},

    # === US BLUE CHIPS, BANQUES & FINANCE ===
    "BRK-B": {"name": "Berkshire Hathaway Inc.", "short": "Berkshire Hathaway", "sector": "Conglomérat & Assurance", "exchange": "NYSE", "flag": "🇺🇸"},
    "JPM": {"name": "JPMorgan Chase & Co.", "short": "JPMorgan", "sector": "Banque Universelle & Investissement", "exchange": "NYSE", "flag": "🇺🇸"},
    "BAC": {"name": "Bank of America", "short": "Bank of America", "sector": "Banque de Détail & Finance", "exchange": "NYSE", "flag": "🇺🇸"},
    "WFC": {"name": "Wells Fargo & Company", "short": "Wells Fargo", "sector": "Banque Commerciale & Crédits", "exchange": "NYSE", "flag": "🇺🇸"},
    "C": {"name": "Citigroup Inc.", "short": "Citigroup", "sector": "Banque Internationale", "exchange": "NYSE", "flag": "🇺🇸"},
    "GS": {"name": "Goldman Sachs Group", "short": "Goldman Sachs", "sector": "Banque d'Affaires & Marchés", "exchange": "NYSE", "flag": "🇺🇸"},
    "MS": {"name": "Morgan Stanley", "short": "Morgan Stanley", "sector": "Gestion de Fortune & Conseil", "exchange": "NYSE", "flag": "🇺🇸"},
    "BLK": {"name": "BlackRock Inc.", "short": "BlackRock", "sector": "Gestion d'Actifs (iShares)", "exchange": "NYSE", "flag": "🇺🇸"},
    "SCHW": {"name": "Charles Schwab Corporation", "short": "Charles Schwab", "sector": "Courtage & Gestion de Patrimoine", "exchange": "NYSE", "flag": "🇺🇸"},
    "AXP": {"name": "American Express Company", "short": "American Express", "sector": "Cartes Premium & Crédits", "exchange": "NYSE", "flag": "🇺🇸"},
    "SPGI": {"name": "S&P Global Inc.", "short": "S&P Global", "sector": "Notations Financières & Indices", "exchange": "NYSE", "flag": "🇺🇸"},
    "MCO": {"name": "Moody's Corporation", "short": "Moody's", "sector": "Notation de Crédit & Données", "exchange": "NYSE", "flag": "🇺🇸"},
    "CME": {"name": "CME Group Inc.", "short": "CME Group", "sector": "Bourse de Dérivés & Futures", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "ICE": {"name": "Intercontinental Exchange (NYSE)", "short": "ICE", "sector": "Opérateur de Bourses & Énergie", "exchange": "NYSE", "flag": "🇺🇸"},

    # === US SANTÉ & PHARMACEUTIQUE ===
    "LLY": {"name": "Eli Lilly and Company", "short": "Eli Lilly", "sector": "Pharmaceutique (Mounjaro/Zepbound)", "exchange": "NYSE", "flag": "🇺🇸"},
    "UNH": {"name": "UnitedHealth Group", "short": "UnitedHealth", "sector": "Assurance Santé & Soins", "exchange": "NYSE", "flag": "🇺🇸"},
    "JNJ": {"name": "Johnson & Johnson", "short": "J&J", "sector": "Dispositifs Médicaux & Pharma", "exchange": "NYSE", "flag": "🇺🇸"},
    "ABBV": {"name": "AbbVie Inc.", "short": "AbbVie", "sector": "Immunologie & Oncologie", "exchange": "NYSE", "flag": "🇺🇸"},
    "MRK": {"name": "Merck & Co. Inc.", "short": "Merck", "sector": "Oncologie (Keytruda) & Vaccins", "exchange": "NYSE", "flag": "🇺🇸"},
    "PFE": {"name": "Pfizer Inc.", "short": "Pfizer", "sector": "Vaccins & Médicaments", "exchange": "NYSE", "flag": "🇺🇸"},
    "TMO": {"name": "Thermo Fisher Scientific", "short": "Thermo Fisher", "sector": "Instruments de Laboratoire & Biotech", "exchange": "NYSE", "flag": "🇺🇸"},
    "ABT": {"name": "Abbott Laboratories", "short": "Abbott", "sector": "Dispositifs Cardio & Diagnostic", "exchange": "NYSE", "flag": "🇺🇸"},
    "DHR": {"name": "Danaher Corporation", "short": "Danaher", "sector": "Sciences de la Vie & Diagnostic", "exchange": "NYSE", "flag": "🇺🇸"},
    "BMY": {"name": "Bristol-Myers Squibb", "short": "Bristol-Myers", "sector": "Biopharmacie & Oncologie", "exchange": "NYSE", "flag": "🇺🇸"},
    "AMGN": {"name": "Amgen Inc.", "short": "Amgen", "sector": "Biotechnologie Thérapeutique", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "GILD": {"name": "Gilead Sciences", "short": "Gilead", "sector": "Antiviraux & Thérapies Cellulaires", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "ISRG": {"name": "Intuitive Surgical", "short": "Intuitive Surgical", "sector": "Robots Chirurgicaux (da Vinci)", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "VRTX": {"name": "Vertex Pharmaceuticals", "short": "Vertex", "sector": "Mucoviscidose & Thérapie Génique", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "REGN": {"name": "Regeneron Pharmaceuticals", "short": "Regeneron", "sector": "Biotechnologie & Ophtalmologie", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "SYK": {"name": "Stryker Corporation", "short": "Stryker", "sector": "Implants Orthopédiques & Chirurgie", "exchange": "NYSE", "flag": "🇺🇸"},
    "MDT": {"name": "Medtronic plc", "short": "Medtronic", "sector": "Technologies Médicales Cardio", "exchange": "NYSE", "flag": "🇺🇸"},
    "BSX": {"name": "Boston Scientific", "short": "Boston Scientific", "sector": "Cardiologie Interventionnelle", "exchange": "NYSE", "flag": "🇺🇸"},
    "MRNA": {"name": "Moderna Inc.", "short": "Moderna", "sector": "Vaccins & Thérapies ARNm", "exchange": "NASDAQ", "flag": "🇺🇸"},

    # === US GRANDE CONSOMMATION & RETAIL ===
    "WMT": {"name": "Walmart Inc.", "short": "Walmart", "sector": "Grande Distribution & Hypermarchés", "exchange": "NYSE", "flag": "🇺🇸"},
    "COST": {"name": "Costco Wholesale", "short": "Costco", "sector": "Clubs-Entrepôts d'Achats", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "HD": {"name": "The Home Depot Inc.", "short": "Home Depot", "sector": "Rénovation & Bricolage", "exchange": "NYSE", "flag": "🇺🇸"},
    "LOW": {"name": "Lowe's Companies Inc.", "short": "Lowe's", "sector": "Aménagement de l'Habitat", "exchange": "NYSE", "flag": "🇺🇸"},
    "TGT": {"name": "Target Corporation", "short": "Target", "sector": "Grande Distribution Discount", "exchange": "NYSE", "flag": "🇺🇸"},
    "PG": {"name": "Procter & Gamble", "short": "P&G", "sector": "Hygiène & Soins Quotidiens", "exchange": "NYSE", "flag": "🇺🇸"},
    "KO": {"name": "The Coca-Cola Company", "short": "Coca-Cola", "sector": "Boissons Sans Alcool", "exchange": "NYSE", "flag": "🇺🇸"},
    "PEP": {"name": "PepsiCo Inc.", "short": "PepsiCo", "sector": "Boissons & Snacks (Lay's)", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "MCD": {"name": "McDonald's Corporation", "short": "McDonald's", "sector": "Restauration Rapide", "exchange": "NYSE", "flag": "🇺🇸"},
    "SBUX": {"name": "Starbucks Corporation", "short": "Starbucks", "sector": "Cafés & Torréfaction", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "CMG": {"name": "Chipotle Mexican Grill", "short": "Chipotle", "sector": "Fast-Casual Mexicain", "exchange": "NYSE", "flag": "🇺🇸"},
    "NKE": {"name": "Nike Inc.", "short": "Nike", "sector": "Chaussures & Vêtements de Sport", "exchange": "NYSE", "flag": "🇺🇸"},
    "LULU": {"name": "Lululemon Athletica", "short": "Lululemon", "sector": "Vêtements de Yoga & Fitness", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "DIS": {"name": "The Walt Disney Company", "short": "Disney", "sector": "Parcs à Thèmes & Divertissement", "exchange": "NYSE", "flag": "🇺🇸"},
    "PM": {"name": "Philip Morris International", "short": "Philip Morris", "sector": "Tabac & Produits Sans Fumée", "exchange": "NYSE", "flag": "🇺🇸"},
    "MO": {"name": "Altria Group Inc.", "short": "Altria", "sector": "Tabac & Cigarettes (Marlboro US)", "exchange": "NYSE", "flag": "🇺🇸"},
    "CL": {"name": "Colgate-Palmolive", "short": "Colgate", "sector": "Hygiène Bucco-dentaire", "exchange": "NYSE", "flag": "🇺🇸"},

    # === US INDUSTRIE, ÉNERGIE & DÉFENSE ===
    "CAT": {"name": "Caterpillar Inc.", "short": "Caterpillar", "sector": "Engins de Construction & Mines", "exchange": "NYSE", "flag": "🇺🇸"},
    "DE": {"name": "Deere & Company", "short": "John Deere", "sector": "Machinerie Agricole & GPS", "exchange": "NYSE", "flag": "🇺🇸"},
    "GE": {"name": "GE Aerospace", "short": "GE Aerospace", "sector": "Moteurs d'Avions & Défense", "exchange": "NYSE", "flag": "🇺🇸"},
    "HON": {"name": "Honeywell International", "short": "Honeywell", "sector": "Aérospatiale & Automatisation", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "UNP": {"name": "Union Pacific Corporation", "short": "Union Pacific", "sector": "Fret Ferroviaire", "exchange": "NYSE", "flag": "🇺🇸"},
    "UPS": {"name": "United Parcel Service", "short": "UPS", "sector": "Logistique & Colis Express", "exchange": "NYSE", "flag": "🇺🇸"},
    "FDX": {"name": "FedEx Corporation", "short": "FedEx", "sector": "Transport Aérien de Fret", "exchange": "NYSE", "flag": "🇺🇸"},
    "RTX": {"name": "RTX Corporation (Raytheon)", "short": "RTX", "sector": "Missiles & Aéronautique (Pratt)", "exchange": "NYSE", "flag": "🇺🇸"},
    "LMT": {"name": "Lockheed Martin", "short": "Lockheed Martin", "sector": "Avions de Chasse F-35 & Défense", "exchange": "NYSE", "flag": "🇺🇸"},
    "BA": {"name": "The Boeing Company", "short": "Boeing", "sector": "Aviation Commerciale & Espace", "exchange": "NYSE", "flag": "🇺🇸"},
    "NOC": {"name": "Northrop Grumman", "short": "Northrop Grumman", "sector": "Bombardiers Furtifs B-21 & Espace", "exchange": "NYSE", "flag": "🇺🇸"},
    "GD": {"name": "General Dynamics", "short": "General Dynamics", "sector": "Sous-Marins Nucléaires & Chars", "exchange": "NYSE", "flag": "🇺🇸"},
    "XOM": {"name": "Exxon Mobil Corporation", "short": "ExxonMobil", "sector": "Pétrole, Gaz & Raffinage", "exchange": "NYSE", "flag": "🇺🇸"},
    "CVX": {"name": "Chevron Corporation", "short": "Chevron", "sector": "Énergie & Exploration Pétrolière", "exchange": "NYSE", "flag": "🇺🇸"},
    "COP": {"name": "ConocoPhillips", "short": "ConocoPhillips", "sector": "Pétrole de Schiste & Gaz Naturel", "exchange": "NYSE", "flag": "🇺🇸"},
    "SLB": {"name": "SLB (Schlumberger)", "short": "SLB", "sector": "Services & Technologies Pétrolières", "exchange": "NYSE", "flag": "🇺🇸"},
    "LIN": {"name": "Linde plc", "short": "Linde", "sector": "Gaz Industriels & Hydrogène", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "SHW": {"name": "Sherwin-Williams", "short": "Sherwin-Williams", "sector": "Peintures & Revêtements", "exchange": "NYSE", "flag": "🇺🇸"},
    "FCX": {"name": "Freeport-McMoRan", "short": "Freeport", "sector": "Mines de Cuivre & Or", "exchange": "NYSE", "flag": "🇺🇸"},
    "NEM": {"name": "Newmont Corporation", "short": "Newmont", "sector": "Extraction Aurifère", "exchange": "NYSE", "flag": "🇺🇸"},

    # === CAC 40 & BOURSE DE PARIS (.PA) ===
    "MC.PA": {"name": "LVMH Moët Hennessy Louis Vuitton", "short": "LVMH", "sector": "Luxe, Mode & Maroquinerie", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "OR.PA": {"name": "L'Oréal S.A.", "short": "L'Oréal", "sector": "Cosmétiques & Beauté", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "RMS.PA": {"name": "Hermès International", "short": "Hermès", "sector": "Haute Maroquinerie & Soie", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "KER.PA": {"name": "Kering SA", "short": "Kering", "sector": "Luxe (Gucci, Saint Laurent)", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "TTE.PA": {"name": "TotalEnergies SE", "short": "TotalEnergies", "sector": "Énergie, GNL & Renouvelables", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "AIR.PA": {"name": "Airbus SE", "short": "Airbus", "sector": "Avions Commerciaux & Aérospatial", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "SAF.PA": {"name": "Safran SE", "short": "Safran", "sector": "Moteurs d'Avions (LEAP) & Défense", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "HO.PA": {"name": "Thales S.A.", "short": "Thales", "sector": "Radars, Défense & Cybersécurité", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "DSY.PA": {"name": "Dassault Systèmes SE", "short": "Dassault Systèmes", "sector": "Logiciels 3D (CATIA) & Jumeaux Numériques", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "SU.PA": {"name": "Schneider Electric SE", "short": "Schneider Electric", "sector": "Gestion d'Énergie & Automatisation", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "AI.PA": {"name": "Air Liquide S.A.", "short": "Air Liquide", "sector": "Gaz Industriels, Santé & Hydrogène", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "SAN.PA": {"name": "Sanofi S.A.", "short": "Sanofi", "sector": "Pharmaceutique & Vaccins", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "BNP.PA": {"name": "BNP Paribas", "short": "BNP Paribas", "sector": "Première Banque de la Zone Euro", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "GLE.PA": {"name": "Société Générale", "short": "Société Générale", "sector": "Banque & Dérivés Actions", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "ACA.PA": {"name": "Crédit Agricole S.A.", "short": "Crédit Agricole", "sector": "Banque Universelle & Gestion Amundi", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "CS.PA": {"name": "AXA S.A.", "short": "AXA", "sector": "Assurance IARD & Santé", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "EL.PA": {"name": "EssilorLuxottica", "short": "EssilorLuxottica", "sector": "Verres Optiques & Lunettes (Ray-Ban)", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "DG.PA": {"name": "Vinci SA", "short": "Vinci", "sector": "Concessions d'Autoroutes & BTP", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "EN.PA": {"name": "Bouygues SA", "short": "Bouygues", "sector": "BTP, Télécoms & Médias (TF1)", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "SGO.PA": {"name": "Saint-Gobain", "short": "Saint-Gobain", "sector": "Matériaux de Construction Durables", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "CAP.PA": {"name": "Capgemini SE", "short": "Capgemini", "sector": "Conseil Numérique, Cloud & IA", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "STMPA.PA": {"name": "STMicroelectronics N.V.", "short": "STMicroelectronics", "sector": "Puces Auto, Puissance & Capteurs", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "STLA": {"name": "Stellantis N.V.", "short": "Stellantis", "sector": "Constructeur Auto (Peugeot, Jeep, Fiat)", "exchange": "NYSE / Euronext", "flag": "🇪🇺"},
    "RNO.PA": {"name": "Renault Group", "short": "Renault", "sector": "Automobile & Véhicules Électriques", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "ML.PA": {"name": "Michelin", "short": "Michelin", "sector": "Pneumatiques Haut de Gamme", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "LR.PA": {"name": "Legrand SA", "short": "Legrand", "sector": "Appareillage Électrique & Datacenters", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "ENGI.PA": {"name": "Engie SA", "short": "Engie", "sector": "Électricité Renouvelable & Réseaux Gaz", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "VIE.PA": {"name": "Veolia Environnement", "short": "Veolia", "sector": "Traitement de l'Eau & Déchets", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "ORA.PA": {"name": "Orange S.A.", "short": "Orange", "sector": "Opérateur Télécom Fibre & 5G", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "PUB.PA": {"name": "Publicis Groupe", "short": "Publicis", "sector": "Communication, Data & Médias", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "RI.PA": {"name": "Pernod Ricard SA", "short": "Pernod Ricard", "sector": "Spiritueux Premium (Jameson, Absolut)", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "BN.PA": {"name": "Danone S.A.", "short": "Danone", "sector": "Produits Laitiers, Végétal & Nutrition", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "CA.PA": {"name": "Carrefour S.A.", "short": "Carrefour", "sector": "Hypermarchés & Supermarchés", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "TEP.PA": {"name": "Teleperformance SE", "short": "Teleperformance", "sector": "Relation Client Digitale & IA", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "EDEN.PA": {"name": "Edenred SE", "short": "Edenred", "sector": "Tickets Restaurant & Avantages Salariés", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "URW.PA": {"name": "Unibail-Rodamco-Westfield", "short": "Unibail-Rodamco", "sector": "Grands Centres Commerciaux", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "SW.PA": {"name": "Sodexo S.A.", "short": "Sodexo", "sector": "Restauration Collective & Facility Management", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "ALO.PA": {"name": "Alstom SA", "short": "Alstom", "sector": "Trains TGV & Signalisation Ferroviaire", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "VIV.PA": {"name": "Vivendi SE", "short": "Vivendi", "sector": "Médias, Édition (Hachette) & Canal+", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "WLN.PA": {"name": "Worldline SA", "short": "Worldline", "sector": "Terminaux de Paiement & E-Commerce", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "ELIS.PA": {"name": "Elis SA", "short": "Elis", "sector": "Location & Entretien Textile Professionnel", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "ERF.PA": {"name": "Eurofins Scientific", "short": "Eurofins", "sector": "Analyses Biologiques & Tests Alimentaires", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "BVI.PA": {"name": "Bureau Veritas SA", "short": "Bureau Veritas", "sector": "Inspection & Certification Qualité", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "GET.PA": {"name": "Getlink SE", "short": "Getlink (Eurotunnel)", "sector": "Navettes Sous la Manche", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "FDJ.PA": {"name": "La Française des Jeux", "short": "FDJ", "sector": "Loteries, Paris Sportifs & Jeux En Ligne", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "IPN.PA": {"name": "Ipsen SA", "short": "Ipsen", "sector": "Biopharmacie & Maladies Rares", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "SOI.PA": {"name": "Soitec SA", "short": "Soitec", "sector": "Substrats Silicium sur Isolant (SOI)", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "FGR.PA": {"name": "Eiffage SA", "short": "Eiffage", "sector": "Concessions Autoroutières (APRR) & BTP", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "NEX.PA": {"name": "Nexans SA", "short": "Nexans", "sector": "Câbles Électriques & Électrification", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "ATE.PA": {"name": "Alten SA", "short": "Alten", "sector": "Ingénierie & Conseil en Technologies", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "RXL.PA": {"name": "Rexel SA", "short": "Rexel", "sector": "Distribution de Matériel Électrique", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "SPIE.PA": {"name": "SPIE SA", "short": "SPIE", "sector": "Services Multi-techniques & Énergie", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "UBI.PA": {"name": "Ubisoft Entertainment", "short": "Ubisoft", "sector": "Jeux Vidéo (Assassin's Creed)", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "GTT.PA": {"name": "Gaztransport & Technigaz", "short": "GTT", "sector": "Membranes Cryogéniques pour Méthaniers", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "VIRP.PA": {"name": "Virbac SA", "short": "Virbac", "sector": "Santé Animale & Vétérinaire", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "RUI.PA": {"name": "Rubis SCA", "short": "Rubis", "sector": "Distribution d'Énergie & Stockage Liquide", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "SESL.PA": {"name": "VusionGroup (SES-imagotag)", "short": "VusionGroup", "sector": "Étiquettes Électroniques & IoT Retail", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "BOL.PA": {"name": "Bolloré SE", "short": "Bolloré", "sector": "Holding Médias (Vivendi, UMG) & Logistique", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "DEC.PA": {"name": "JCDecaux SE", "short": "JCDecaux", "sector": "Mobilier Urbain & Publicité Extérieure", "exchange": "Euronext Paris", "flag": "🇫🇷"},
    "SK.PA": {"name": "SEB SA", "short": "Groupe SEB", "sector": "Petit Électroménager (Tefal, Moulinex)", "exchange": "Euronext Paris", "flag": "🇫🇷"},

    # === EUROPE (ALLEMAGNE, SUISSE, PAYS-BAS, UK, ITALIE, ESPAGNE) ===
    "SAP.DE": {"name": "SAP SE", "short": "SAP", "sector": "Logiciels ERP & Cloud d'Entreprise", "exchange": "XETRA Frankfurt", "flag": "🇩🇪"},
    "SIE.DE": {"name": "Siemens AG", "short": "Siemens", "sector": "Industrie 4.0, Automatisation & Santé", "exchange": "XETRA Frankfurt", "flag": "🇩🇪"},
    "ALV.DE": {"name": "Allianz SE", "short": "Allianz", "sector": "Premier Assureur Européen & Pimco", "exchange": "XETRA Frankfurt", "flag": "🇩🇪"},
    "BMW.DE": {"name": "Bayerische Motoren Werke AG", "short": "BMW", "sector": "Automobile Premium & Motos", "exchange": "XETRA Frankfurt", "flag": "🇩🇪"},
    "MBG.DE": {"name": "Mercedes-Benz Group AG", "short": "Mercedes-Benz", "sector": "Véhicules de Luxe & Utilitaires", "exchange": "XETRA Frankfurt", "flag": "🇩🇪"},
    "VOW3.DE": {"name": "Volkswagen AG", "short": "Volkswagen", "sector": "Groupe Automobile (Audi, Porsche)", "exchange": "XETRA Frankfurt", "flag": "🇩🇪"},
    "P911.DE": {"name": "Dr. Ing. h.c. F. Porsche AG", "short": "Porsche", "sector": "Voitures de Sport de Luxe", "exchange": "XETRA Frankfurt", "flag": "🇩🇪"},
    "BAS.DE": {"name": "BASF SE", "short": "BASF", "sector": "Chimie Industrielle Mondiale", "exchange": "XETRA Frankfurt", "flag": "🇩🇪"},
    "BAYN.DE": {"name": "Bayer AG", "short": "Bayer", "sector": "Agrochimie (Monsanto) & Pharma", "exchange": "XETRA Frankfurt", "flag": "🇩🇪"},
    "DBK.DE": {"name": "Deutsche Bank AG", "short": "Deutsche Bank", "sector": "Banque de Financement & Marchés", "exchange": "XETRA Frankfurt", "flag": "🇩🇪"},
    "MUV2.DE": {"name": "Munich Re", "short": "Munich Re", "sector": "Réassurance Mondiale & Ergo", "exchange": "XETRA Frankfurt", "flag": "🇩🇪"},
    "IFX.DE": {"name": "Infineon Technologies AG", "short": "Infineon", "sector": "Semi-conducteurs Auto & Énergie", "exchange": "XETRA Frankfurt", "flag": "🇩🇪"},
    "DHL.DE": {"name": "DHL Group (Deutsche Post)", "short": "DHL", "sector": "Messagerie Internationale & Fret", "exchange": "XETRA Frankfurt", "flag": "🇩🇪"},
    "RWE.DE": {"name": "RWE AG", "short": "RWE", "sector": "Éolien En Mer & Solaire", "exchange": "XETRA Frankfurt", "flag": "🇩🇪"},
    "ADS.DE": {"name": "Adidas AG", "short": "Adidas", "sector": "Articles de Sport & Baskets", "exchange": "XETRA Frankfurt", "flag": "🇩🇪"},
    "DTE.DE": {"name": "Deutsche Telekom AG", "short": "Deutsche Telekom", "sector": "Télécoms (T-Mobile US)", "exchange": "XETRA Frankfurt", "flag": "🇩🇪"},

    # SUISSE
    "NESN.SW": {"name": "Nestlé S.A.", "short": "Nestlé", "sector": "Agroalimentaire Mondial (Nespresso)", "exchange": "SIX Swiss Ex", "flag": "🇨🇭"},
    "ROG.SW": {"name": "Roche Holding AG", "short": "Roche", "sector": "Oncologie & Diagnostic Médical", "exchange": "SIX Swiss Ex", "flag": "🇨🇭"},
    "NOVN.SW": {"name": "Novartis AG", "short": "Novartis", "sector": "Pharmaceutique & Thérapies Géniques", "exchange": "SIX Swiss Ex", "flag": "🇨🇭"},
    "UBSG.SW": {"name": "UBS Group AG", "short": "UBS", "sector": "Gestion de Fortune & Banque Suisse", "exchange": "SIX Swiss Ex", "flag": "🇨🇭"},
    "ABBN.SW": {"name": "ABB Ltd", "short": "ABB", "sector": "Robotique & Électrification", "exchange": "SIX Swiss Ex", "flag": "🇨🇭"},
    "CFR.SW": {"name": "Compagnie Financière Richemont", "short": "Richemont", "sector": "Haute Joaillerie (Cartier, Van Cleef)", "exchange": "SIX Swiss Ex", "flag": "🇨🇭"},
    "ZURN.SW": {"name": "Zurich Insurance Group", "short": "Zurich Insurance", "sector": "Assurance Globale", "exchange": "SIX Swiss Ex", "flag": "🇨🇭"},
    "SIKA.SW": {"name": "Sika AG", "short": "Sika", "sector": "Chimie pour la Construction", "exchange": "SIX Swiss Ex", "flag": "🇨🇭"},

    # PAYS-BAS & NORDICS
    "ASML.AS": {"name": "ASML Holding NV", "short": "ASML", "sector": "Monopole Mondial Lithographie EUV", "exchange": "Euronext Amsterdam", "flag": "🇳🇱"},
    "ADYEN.AS": {"name": "Adyen N.V.", "short": "Adyen", "sector": "Paiements Commerçants Omnicanal", "exchange": "Euronext Amsterdam", "flag": "🇳🇱"},
    "PHIA.AS": {"name": "Koninklijke Philips NV", "short": "Philips", "sector": "Technologies Médicales & Soins", "exchange": "Euronext Amsterdam", "flag": "🇳🇱"},
    "HEIA.AS": {"name": "Heineken N.V.", "short": "Heineken", "sector": "Brasserie & Bières Internationales", "exchange": "Euronext Amsterdam", "flag": "🇳🇱"},
    "PRX.AS": {"name": "Prosus N.V.", "short": "Prosus", "sector": "Investissements Tech (Tencent)", "exchange": "Euronext Amsterdam", "flag": "🇳🇱"},
    "INGA.AS": {"name": "ING Groep N.V.", "short": "ING", "sector": "Banque Digitale & Crédits", "exchange": "Euronext Amsterdam", "flag": "🇳🇱"},
    "NVO": {"name": "Novo Nordisk A/S (ADR)", "short": "Novo Nordisk", "sector": "Leader Mondial Diabète & Ozempic/Wegovy", "exchange": "NYSE", "flag": "🇩🇰"},

    # ROYAUME-UNI, ITALIE & ESPAGNE
    "SHEL.L": {"name": "Shell plc", "short": "Shell", "sector": "Major Pétrolière & Gaz Naturel", "exchange": "London LSE", "flag": "🇬🇧"},
    "AZN": {"name": "AstraZeneca PLC (ADR)", "short": "AstraZeneca", "sector": "Oncologie & Médicaments Cardiovasculaires", "exchange": "NASDAQ", "flag": "🇬🇧"},
    "HSBA.L": {"name": "HSBC Holdings plc", "short": "HSBC", "sector": "Banque Globale Asie & Europe", "exchange": "London LSE", "flag": "🇬🇧"},
    "ULVR.L": {"name": "Unilever PLC", "short": "Unilever", "sector": "Biens de Consommation (Dove, Knorr)", "exchange": "London LSE", "flag": "🇬🇧"},
    "BP.L": {"name": "BP p.l.c.", "short": "BP", "sector": "Pétrole, Gaz & Transition Énergétique", "exchange": "London LSE", "flag": "🇬🇧"},
    "GSK.L": {"name": "GSK plc", "short": "GSK", "sector": "Vaccins & Infectiologie", "exchange": "London LSE", "flag": "🇬🇧"},
    "DGE.L": {"name": "Diageo plc", "short": "Diageo", "sector": "Boissons Spiritueuses (Johnnie Walker)", "exchange": "London LSE", "flag": "🇬🇧"},
    "RIO.L": {"name": "Rio Tinto plc", "short": "Rio Tinto", "sector": "Mines de Fer & Aluminium", "exchange": "London LSE", "flag": "🇬🇧"},
    "GLEN.L": {"name": "Glencore plc", "short": "Glencore", "sector": "Négoce de Matières Premières & Cuivre", "exchange": "London LSE", "flag": "🇬🇧"},
    "RACE": {"name": "Ferrari N.V.", "short": "Ferrari", "sector": "Supercars & F1 de Luxe", "exchange": "NYSE", "flag": "🇮🇹"},
    "ENEL.MI": {"name": "Enel S.p.A.", "short": "Enel", "sector": "Électricité & Énergies Renouvelables", "exchange": "Borsa Italiana", "flag": "🇮🇹"},
    "ENI.MI": {"name": "Eni S.p.A.", "short": "Eni", "sector": "Pétrole, Gaz & Biocarburants", "exchange": "Borsa Italiana", "flag": "🇮🇹"},
    "ISP.MI": {"name": "Intesa Sanpaolo", "short": "Intesa Sanpaolo", "sector": "Banque Leader en Italie", "exchange": "Borsa Italiana", "flag": "🇮🇹"},
    "UCG.MI": {"name": "UniCredit S.p.A.", "short": "UniCredit", "sector": "Banque Paneuropéenne", "exchange": "Borsa Italiana", "flag": "🇮🇹"},
    "ITX.MC": {"name": "Industria de Diseño Textil (Inditex)", "short": "Inditex (Zara)", "sector": "Fast Fashion & Mode Mondiale", "exchange": "Bolsa Madrid", "flag": "🇪🇸"},
    "SAN.MC": {"name": "Banco Santander S.A.", "short": "Santander", "sector": "Banque de Détail Europe & Amériques", "exchange": "Bolsa Madrid", "flag": "🇪🇸"},
    "BBVA.MC": {"name": "Banco Bilbao Vizcaya Argentaria", "short": "BBVA", "sector": "Banque Digitale Espagne & Mexique", "exchange": "Bolsa Madrid", "flag": "🇪🇸"},
    "IBE.MC": {"name": "Iberdrola S.A.", "short": "Iberdrola", "sector": "Leader Mondial de l'Éolien", "exchange": "Bolsa Madrid", "flag": "🇪🇸"},

    # === TECH MONDIALE, ASIE & ADRS ===
    "BABA": {"name": "Alibaba Group Holding (ADR)", "short": "Alibaba", "sector": "E-Commerce Chinois & Cloud", "exchange": "NYSE", "flag": "🇨🇳"},
    "PDD": {"name": "PDD Holdings Inc. (Temu)", "short": "PDD (Temu)", "sector": "E-Commerce Social & Export", "exchange": "NASDAQ", "flag": "🇨🇳"},
    "JD": {"name": "JD.com Inc. (ADR)", "short": "JD.com", "sector": "E-Commerce & Logistique Directe", "exchange": "NASDAQ", "flag": "🇨🇳"},
    "BIDU": {"name": "Baidu Inc. (ADR)", "short": "Baidu", "sector": "Moteur de Recherche & IA Ernie", "exchange": "NASDAQ", "flag": "🇨🇳"},
    "TCEHY": {"name": "Tencent Holdings Ltd (ADR)", "short": "Tencent", "sector": "Jeux Vidéo & WeChat", "exchange": "OTC US", "flag": "🇨🇳"},
    "SE": {"name": "Sea Limited (Shopee)", "short": "Sea Limited", "sector": "E-Commerce & Jeux Asie du Sud-Est", "exchange": "NYSE", "flag": "🇸🇬"},
    "MELI": {"name": "MercadoLibre Inc.", "short": "MercadoLibre", "sector": "E-Commerce & Fintech Amérique Latine", "exchange": "NASDAQ", "flag": "🇺🇸"},
    "SONY": {"name": "Sony Group Corporation (ADR)", "short": "Sony", "sector": "PlayStation, Musique & Capteurs Photo", "exchange": "NYSE", "flag": "🇯🇵"},
    "TM": {"name": "Toyota Motor Corporation (ADR)", "short": "Toyota", "sector": "Premier Constructeur Automobile Mondial", "exchange": "NYSE", "flag": "🇯🇵"},
    "NTDOY": {"name": "Nintendo Co. Ltd (ADR)", "short": "Nintendo", "sector": "Consoles (Switch) & Licences Mario/Zelda", "exchange": "OTC US", "flag": "🇯🇵"},
}

# Table de correspondance des mnémoniques / tickers européens (Trade Republic, Lang & Schwarz, Tradegate, Xetra) vers les tickers officiels Yahoo Finance
TRADE_REPUBLIC_ALIASES = {
    "SYP": "SNPS",     # Synopsys (Trade Republic / Lang & Schwarz)
    "NVD": "NVDA",     # NVIDIA
    "APC": "AAPL",     # Apple
    "MSF": "MSFT",     # Microsoft
    "AMZ": "AMZN",     # Amazon
    "ABEA": "GOOGL",   # Alphabet Class A
    "ABEC": "GOOG",    # Alphabet Class C
    "FB2A": "META",    # Meta Platforms
    "TL0": "TSLA",     # Tesla
    "NFC": "NFLX",     # Netflix
    "CDU": "CDNS",     # Cadence Design Systems
    "APM": "AMAT",     # Applied Materials
    "LRC": "LRCX",     # Lam Research
    "KLA": "KLAC",     # KLA Corporation
    "AHLA": "BABA",    # Alibaba
    "SOU": "SHOP",     # Shopify
    "PLR": "PLTR",     # Palantir
    "PYP": "PYPL",     # PayPal
    "DIS": "DIS",      # Disney
    "WMT": "WMT",      # Walmart
    "KO": "KO",        # Coca-Cola
    "PEP": "PEP",      # PepsiCo
    "MCD": "MCD",      # McDonald's
    "CAT": "CAT",      # Caterpillar
    "IBM": "IBM",      # IBM
    "ORC": "ORCL",     # Oracle
    "ADX": "ADBE",     # Adobe
    "CIS": "CSCO",     # Cisco
    "INT": "INTC",     # Intel
    "AMD": "AMD",      # AMD
    "QCI": "QCOM",     # Qualcomm
    "TII": "TXN",      # Texas Instruments
}

def generate_file():
    target_path = Path("web_ui/src/companyNames.js")
    
    lines = [
        "// Dictionnaire et résolveur universel des entreprises cotées (US, CAC 40, SBF 120, DAX, Europe & ADRs)",
        "// Les tickers canoniques utilisent le format Yahoo Finance (.PA pour Paris, .DE pour Xetra, .SW pour Zurich, etc.)",
        "// avec résolution automatique des codes de place et des alias européens (Trade Republic / Tradegate).",
        "",
        f"export const COMPANY_NAMES = {json.dumps(COMPANIES, indent=2, ensure_ascii=False)};",
        "",
        f"export const TRADE_REPUBLIC_ALIASES = {json.dumps(TRADE_REPUBLIC_ALIASES, indent=2, ensure_ascii=False)};",
        "",
        """/**
 * Résout le nom complet ou court d'une entreprise à partir de son symbole boursier ou alias.
 * Supporte automatiquement les variantes avec/sans extension (.PA, .DE, .SW) et les alias Trade Republic.
 */
export function getCompanyName(ticker, short = false) {
  if (!ticker) return "";
  const upper = String(ticker).trim().toUpperCase();

  // 1. Alias Trade Republic direct (ex: SYP -> SNPS)
  const canonical = TRADE_REPUBLIC_ALIASES[upper] || upper;

  // 2. Recherche exacte
  let info = COMPANY_NAMES[canonical];

  // 3. Recherche en ajoutant le suffixe de place parisien .PA (ex: HO -> HO.PA, DSY -> DSY.PA)
  if (!info && !canonical.includes(".")) {
    info = COMPANY_NAMES[`${canonical}.PA`];
  }

  // 4. Recherche en retirant le suffixe de place (ex: BRK.B -> BRK-B, STM.PA -> STMPA.PA)
  if (!info && canonical.includes(".")) {
    const base = canonical.split(".")[0];
    info = COMPANY_NAMES[base] || COMPANY_NAMES[`${base}-B`];
  }
  if (!info && canonical.includes("-")) {
    const base = canonical.split("-")[0];
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
  const canonical = TRADE_REPUBLIC_ALIASES[upper] || upper;
  const info =
    COMPANY_NAMES[canonical] ||
    COMPANY_NAMES[`${canonical}.PA`] ||
    (canonical.includes(".") ? COMPANY_NAMES[canonical.split(".")[0]] : null);
  return info?.sector || "";
}

/**
 * Recherche des actions correspondantes (par symbole, nom d'entreprise, alias Trade Republic ou secteur) pour l'autocomplétion.
 * Retourne uniquement les tickers canoniques et évite tout doublon.
 */
export function searchStocks(query, limit = 8) {
  if (!query || !String(query).trim()) return [];
  const q = String(query).trim().toUpperCase();
  const results = [];
  const seenTickers = new Set();

  const add = (ticker, data, aliasNote = null) => {
    if (!seenTickers.has(ticker)) {
      seenTickers.add(ticker);
      results.push({
        ticker,
        name: data.name,
        short: data.short,
        sector: aliasNote ? `${aliasNote} · ${data.sector}` : data.sector,
        exchange: data.exchange || "Marché",
        flag: data.flag || "🌐",
      });
    }
  };

  // 1. Correspondance exacte ou partielle avec un alias Trade Republic (ex: "SYP" -> SNPS)
  for (const [trCode, canonical] of Object.entries(TRADE_REPUBLIC_ALIASES)) {
    if (trCode === q || trCode.startsWith(q)) {
      const data = COMPANY_NAMES[canonical];
      if (data) {
        add(canonical, data, `Code Trade Republic : ${trCode}`);
        if (results.length >= limit) return results;
      }
    }
  }

  // 2. Le ticker commence par la requête, ou le symbole de base commence par la requête (ex: "HO" -> HO.PA)
  for (const [ticker, data] of Object.entries(COMPANY_NAMES)) {
    const base = ticker.includes(".") ? ticker.split(".")[0] : ticker;
    if (ticker.startsWith(q) || base.startsWith(q)) {
      add(ticker, data);
      if (results.length >= limit) return results;
    }
  }

  // 3. Le nom court ou complet commence par la requête (ex: "Thales" -> HO.PA, "Synopsys" -> SNPS)
  for (const [ticker, data] of Object.entries(COMPANY_NAMES)) {
    if (data.name.toUpperCase().startsWith(q) || data.short.toUpperCase().startsWith(q)) {
      add(ticker, data);
      if (results.length >= limit) return results;
    }
  }

  // 4. Contient la requête dans le symbole ou le nom
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

  // 5. Contient la requête dans le secteur ou la place boursière
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
"""
    ]
    
    target_path.write_text("\n".join(lines), encoding="utf-8")
    print(f"Generated {target_path} with {len(COMPANIES)} companies and {len(TRADE_REPUBLIC_ALIASES)} Trade Republic aliases.")

if __name__ == "__main__":
    generate_file()
