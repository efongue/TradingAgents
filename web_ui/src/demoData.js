// Analyses pré-calculées ultra-riches pour le mode Découverte Instantanée (FTUX)
// Permet une découverte immédiate sans latence de l'ensemble des fonctionnalités du SaaS.

export const DEMO_ANALYSES = {
  NVDA: {
    id: "demo-nvda-2026",
    ticker: "NVDA",
    analysis_date: "2026-08-27",
    model: "omniroute/codex-3accounts (gpt-5.6-sol)",
    status: "complete",
    elapsed: "1 min 14 s",
    is_demo: true,
    result: {
      display_decision: "ACHETER FORT",
      confidence: "Élevée (92 %)",
      consensus: {
        bullish: 88,
        neutral: 8,
        bearish: 4,
        verdict: "Consensus d'achat massif soutenu par les marges datacenters et la demande GPU/ASIC.",
      },
      catalysts: [
        "Monétisation record de l'architecture Blackwell Ultra",
        "Commandes serveurs IA souverains en hausse de +45 %",
        "Expansion des marges brutes logicielles (CUDA + Omniverse)",
      ],
      risk_veto: {
        triggered: false,
        level: "Faible à Modéré",
        summary: "Risque de concentration des hyperscalers surveillé, mais carnet de commandes plein sur 12 mois.",
      },
      analyst_scores: {
        market: { score: 94, stance: "Très Haussier", note: "Momentum haussier intact au-dessus de la SMA 50" },
        fundamentals: { score: 91, stance: "Haussier", note: "Marges opérationnelles > 62 %, croissance CA +84 %" },
        news: { score: 85, stance: "Haussier", note: "Annonces de partenariats stratégiques majeurs" },
        social: { score: 82, stance: "Très Favorable", note: "Sentiment retail et développeurs à un sommet" },
      },
      summary: `### Synthèse Exécutive : NVIDIA Corporation (NASDAQ: NVDA)

NVIDIA maintient une avance technologique et commerciale décisive sur l'ensemble de la chaîne de valeur du calcul accéléré. Les analyses multi-agents convergent vers une opportunité majeure d'accumulation.

#### Thèse d'investissement
1. **Domination incontestée du Compute IA** : La demande pour les plateformes GPU de nouvelle génération dépasse toujours l'offre disponible.
2. **Effet de réseau logiciel (CUDA)** : Barrière à l'entrée infranchissable à court et moyen terme pour les alternatives concurrentes.
3. **Flux de trésorerie disponible exceptionnel** : Permettant des rachats d'actions massifs et des investissements continus en R&D.

#### Recommandation de positionnement
- **Horizon** : 6 à 18 mois
- **Stratégie** : Entrée échelonnée ou renforcement sur repli technique vers la moyenne mobile 20 jours.`,
      complete_report: `# Rapport Exécutif d'Analyse Multi-Agents : NVIDIA Corporation

## 1. Vue d'Ensemble & Décision
- **Symbole** : NVDA (NASDAQ)
- **Décision Finale** : ACHAT FORT (Surpondérer)
- **Indice de Confiance** : 92 % (Données vérifiées sans incohérence)
- **Consensus Multi-Agents** : 88 % Haussier / 8 % Neutre / 4 % Prudent

---

## 2. Synthèse des 4 Piliers d'Analyse

### A. Analyse de Marché & Technique
Le titre évolue dans un canal haussier bien défini. Les volumes sur les phases de consolidation restent faibles, signalant une rétention forte des investisseurs institutionnels. L'indicateur RSI 14 jours (61) offre encore une marge de progression avant la zone de surachat.

### B. Analyse Fondamentale & Valorisation
Le ratio PEG (Price/Earnings-to-Growth) corrigé de la croissance attendue se situe à 1.35, ce qui reste attractif par rapport à la moyenne historique des leaders technologiques en phase d'hyper-croissance. La rentabilité des capitaux investis (ROIC) dépasse 50 %.

### C. Analyse de l'Actualité & Catalyseurs
Les déclarations des dirigeants des principaux clients Cloud confirment le maintien de budgets d'investissements CAPEX record pour les infrastructures d'accélération IA sur les prochains trimestres.

### D. Sentiment des Médias Sociaux & Développeurs
L'activité open-source autour de CUDA et des frameworks d'inférence montre un engagement record de la communauté d'ingénieurs IA mondiaux.

---

## 3. Débat Arbitré : Thèse Haussière vs Thèse Baissière

### Thèse Haussière (Bull Agent)
« La transition globale vers le calcul accéléré n'en est qu'à ses débuts. Les entreprises ne peuvent pas se permettre de sous-investir sous peine de décrochage technologique. Les marges de NVIDIA restent protégées par sa pile logicielle propriétaire. »

### Thèse Baissière (Bear Agent)
« La valorisation intègre déjà une perfection d'exécution. Tout retard de livraison dans la chaîne d'approvisionnement des fonderies avancées ou toute réduction de CAPEX d'un hyperscaler pourrait déclencher une volatilité à court terme. »

### Conclusion du Research Manager
La prime de valorisation est amplement justifiée par la visibilité des revenus et la rentabilité nette record. Les risques d'approvisionnement sont mitigés par la diversification des partenaires d'assemblage et de packaging avancé.

---

## 4. Gestion des Risques & Dimensionnement
- **Niveau de Risque Global** : Modéré
- **Allocation suggérée** : Surpondération dans un portefeuille diversifié Actions Croissance / Tech
- **Seuil d'invalidation** : Clôture hebdomadaire sous le support majeur des 105 $`,
      snapshot: {
        close: 128.45,
        open: 126.10,
        high: 129.80,
        low: 125.75,
        volume: 48200000,
        market_cap: "3.16 T$",
        pe_ratio: "42.8",
        sparkline: [110.2, 112.5, 111.8, 114.6, 116.0, 115.4, 118.9, 120.2, 119.5, 122.8, 124.0, 123.4, 125.1, 126.6, 125.9, 127.8, 128.45],
      },
      reliability: {
        verified: true,
        blocked: false,
        verified_close: 128.45,
        latest_date: "2026-08-27",
        block_reason: null,
        checks: [
          { name: "Cours de clôture OHLCV", status: "ok", detail: "128,45 $ conforme aux flux de marché" },
          { name: "Vérification cohérence prix", status: "ok", detail: "Écart de 0,00 % avec le marché vérifié" },
          { name: "Données financières vérifiées", status: "ok", detail: "Rapports 10-Q et bilans récents validés" },
          { name: "Absence de split non ajusté", status: "ok", detail: "Historique ajusté certifié" },
        ],
      },
      reports: {
        portfolio: `Décision du portefeuille : ACHETER FORT. Surpondérer la ligne avec un objectif moyen terme ambitieux.`,
        market: `Tendance haussière confirmée. Support clé à 122,50 $, résistance immédiate à 132,00 $. Flux acheteurs dominants.`,
        fundamentals: `Chiffre d'affaires trimestriel en progression de +84 % sur un an. Marge brute à 74,8 %. Bilan sans dette nette.`,
        news: `Nouveaux contrats d'envergure signés avec plusieurs gouvernements et leaders industriels pour des clusters de supercalculateurs.`,
        social: `Sentiment global extrêmement positif (82 % d'opinions favorables sur les forums d'analystes et développeurs).`,
        bull: `Le moat de CUDA est infranchissable. La demande pour le packaging CoWoS est sécurisée jusqu'en 2027.`,
        bear: `Attention au risque de durcissement des restrictions géopolitiques à l'exportation vers certains marchés secondaires.`,
        research_manager: `Arbitrage en faveur des acheteurs : la dynamique opérationnelle compense largement les incertitudes macroéconomiques.`,
        conservative: `Entrée prudente recommandée par fractions de 25 % pour lisser le prix de revient.`,
        neutral: `Allocation standard de 4 % à 6 % de l'actif net du portefeuille.`,
        aggressive: `Pleine allocation cible immédiate avec stop suiveur dynamique sous la moyenne mobile 20 séances.`,
      },
      analysis_parameters: {
        complete: true,
        debates: { investment: 2, risk: 1 },
        calls: { estimated: 12, completed: 12 },
        output_tokens_per_call: 2048,
        model: { name: "omniroute/codex-3accounts", temperature: null },
      },
    },
  },

  MSFT: {
    id: "demo-msft-2026",
    ticker: "MSFT",
    analysis_date: "2026-08-27",
    model: "omniroute/codex-3accounts (gpt-5.6-sol)",
    status: "complete",
    elapsed: "1 min 08 s",
    is_demo: true,
    result: {
      display_decision: "ACCUMULER",
      confidence: "Élevée (90 %)",
      consensus: {
        bullish: 82,
        neutral: 14,
        bearish: 4,
        verdict: "Monétisation solide de la suite Microsoft 365 Copilot et accélération d'Azure Cloud.",
      },
      catalysts: [
        "Croissance annuelle d'Azure supérieure à +30 % tirée par les workloads IA",
        "Hausse de l'ARPU entreprise via l'adoption globale de Copilot",
        "Résilience du flux de revenus d'abonnement récurrents (SaaS / Entreprise)",
      ],
      risk_veto: {
        triggered: false,
        level: "Très Faible",
        summary: "Bilan forteresse AAA, flux de trésorerie régulier et diversification produit unique.",
      },
      analyst_scores: {
        market: { score: 86, stance: "Haussier", note: "Consolidation saine au-dessus de la zone pivot des 430 $" },
        fundamentals: { score: 94, stance: "Très Haussier", note: "Free Cash Flow annuel > 70 Md$, marge nette > 35 %" },
        news: { score: 84, stance: "Favorable", note: "Adoption entreprise accélérée des outils de productivité" },
        social: { score: 79, stance: "Favorable", note: "Perception de leader institutionnel incontournable" },
      },
      summary: `### Synthèse Exécutive : Microsoft Corporation (NASDAQ: MSFT)

Microsoft combine le profil de croissance d'un acteur cloud de pointe avec la solidité financière d'une forteresse mondiale. L'intégration de l'IA générative dans son écosystème logiciel confère un levier de prix significatif.

#### Thèse d'investissement
1. **Azure comme plateforme Cloud IA de référence** : Part de marché croissante face aux concurrents historiques.
2. **Monétisation immédiate des bases installées** : Déploiement à grande échelle de Copilot dans Office 365.
3. **Bilan AAA & politique de dividende pérenne** : Rendement total actionnaire sécurisé.

#### Recommandation de positionnement
- **Horizon** : Moyen / Long terme
- **Stratégie** : Accumulation régulière, position de fond de portefeuille idéale.`,
      complete_report: `# Rapport Exécutif d'Analyse Multi-Agents : Microsoft Corporation

## 1. Vue d'Ensemble & Décision
- **Symbole** : MSFT (NASDAQ)
- **Décision Finale** : ACCUMULER (Surpondérer)
- **Indice de Confiance** : 90 %
- **Consensus Multi-Agents** : 82 % Haussier / 14 % Neutre / 4 % Prudent

---

## 2. Synthèse des 4 Piliers d'Analyse
- **Technique** : Support majeur testé et validé à 428 $. Tendance de fond résolument haussière.
- **Fondamentaux** : Ratio cours/bénéfice à 33x justifié par la visibilité des flux récurrents et les marges élevées.
- **Actualité & Catalyseurs** : Croissance des déploiements Azure OpenAI et partenariats stratégiques étendus.
- **Sentiment & Réputation** : Marque de confiance absolue auprès des DSI et directeurs informatiques du Fortune 500.`,
      snapshot: {
        close: 442.20,
        open: 439.50,
        high: 444.10,
        low: 438.80,
        volume: 19400000,
        market_cap: "3.28 T$",
        pe_ratio: "33.4",
        sparkline: [412.0, 415.5, 414.2, 418.0, 420.5, 419.0, 423.8, 425.2, 424.0, 428.1, 431.4, 430.2, 433.0, 436.5, 438.8, 440.5, 442.20],
      },
      reliability: {
        verified: true,
        blocked: false,
        verified_close: 442.20,
        latest_date: "2026-08-27",
        block_reason: null,
        checks: [
          { name: "Cours de clôture OHLCV", status: "ok", detail: "442,20 $ conforme aux flux de marché" },
          { name: "Vérification cohérence prix", status: "ok", detail: "Écart de 0,00 % avec le marché vérifié" },
          { name: "Données financières vérifiées", status: "ok", detail: "Bilan et FCF vérifiés" },
        ],
      },
      reports: {
        portfolio: `Décision du portefeuille : ACCUMULER. Valeur défensive de croissance idéale.`,
        market: `Consolidation au-dessus des moyennes mobiles 50 et 100 jours. Volatilité contenue.`,
        fundamentals: `Flux de trésorerie disponible robuste de 74,1 Md$. Marges opérationnelles d'exception.`,
        news: `Accélération du taux de conversion des licences E3/E5 vers les packs avec assistance IA.`,
        social: `Sentiment institutionnel très solide. Perception de valeur refuge technologique.`,
        bull: `La base installée de plus de 400 millions de sièges payants garantit un réservoir de croissance pour 5 ans.`,
        bear: `Les investissements d'infrastructures de datacenters pèsent temporairement sur les marges d'Azure.`,
        research_manager: `Le consensus penche nettement pour une surperformance durable du titre.`,
        conservative: `Accumulation progressive recommandée pour sécuriser le portefeuille global.`,
        neutral: `Pondération cible de 5 % à 7 % de l'actif total.`,
        aggressive: `Achat sur repli dès que le RSI 14 jours s'approche de 45.`,
      },
      analysis_parameters: {
        complete: true,
        debates: { investment: 2, risk: 1 },
        calls: { estimated: 12, completed: 12 },
        output_tokens_per_call: 2048,
        model: { name: "omniroute/codex-3accounts", temperature: null },
      },
    },
  },

  AAPL: {
    id: "demo-aapl-2026",
    ticker: "AAPL",
    analysis_date: "2026-08-27",
    model: "omniroute/codex-3accounts (gpt-5.6-sol)",
    status: "complete",
    elapsed: "1 min 02 s",
    is_demo: true,
    result: {
      display_decision: "CONSERVER",
      confidence: "Élevée (88 %)",
      consensus: {
        bullish: 64,
        neutral: 28,
        bearish: 8,
        verdict: "Croissance record du pôle Services, cycle de renouvellement matériel stable mais valorisation exigeante.",
      },
      catalysts: [
        "Marge brute du segment Services dépassant les 74 %",
        "Rachats d'actions massifs (plus de 100 Md$ par an)",
        "Fonctionnalités Apple Intelligence stimulant le renouvellement du parc mondial",
      ],
      risk_veto: {
        triggered: false,
        level: "Faible",
        summary: "Dépendance au matériel et valorisation à 31x les bénéfices limitant le potentiel à court terme.",
      },
      analyst_scores: {
        market: { score: 72, stance: "Neutre / Haussier", note: "Oscillation dans une zone de range entre 220 $ et 235 $" },
        fundamentals: { score: 85, stance: "Solide", note: "Rendement du capital exceptionnel, génération de cash record" },
        news: { score: 76, stance: "Neutre", note: "Surveillance des ventes sur le marché asiatique" },
        social: { score: 84, stance: "Favorable", note: "Fidélité de la marque la plus élevée du secteur grand public" },
      },
      summary: `### Synthèse Exécututive : Apple Inc. (NASDAQ: AAPL)

Apple bénéficie d'une base installée active de plus de 2,2 milliards d'appareils, garantissant une croissance continue et très rentable de sa division Services. La valorisation actuelle invite toutefois à la neutralité tactique.

#### Thèse d'investissement
1. **Écosystème captif et marge Services en expansion** : Monétisation croissante par utilisateur.
2. **Programme de retour de capital sans équivalent** : Soutien mécanique au bénéfice par action.
3. **Cycle de mise à niveau IA sur les terminaux** : Catalyseur potentiel sur les prochains trimestres.

#### Recommandation de positionnement
- **Horizon** : Moyen terme
- **Stratégie** : Conserver les positions existantes, attendre un repli sous 215 $ pour initier de nouveaux achats agressifs.`,
      complete_report: `# Rapport Exécutif d'Analyse Multi-Agents : Apple Inc.

## 1. Vue d'Ensemble & Décision
- **Symbole** : AAPL (NASDAQ)
- **Décision Finale** : CONSERVER (Pondération Neutre)
- **Indice de Confiance** : 88 %
- **Consensus Multi-Agents** : 64 % Haussier / 28 % Neutre / 8 % Prudent

---

## 2. Synthèse des 4 Piliers d'Analyse
- **Technique** : Phase de consolidation horizontale. Absence de catalyseur technique immédiat pour casser la résistance des 238 $.
- **Fondamentaux** : Bilan extrêmement sain mais multiple P/E proche de ses sommets historiques de 10 ans.
- **Actualité & Catalyseurs** : Déploiement progressif des fonctionnalités Apple Intelligence à l'international.
- **Sentiment & Écosystème** : Taux de rétention des utilisateurs iOS supérieur à 94 %.`,
      snapshot: {
        close: 227.80,
        open: 226.40,
        high: 229.10,
        low: 225.90,
        volume: 38700000,
        market_cap: "3.44 T$",
        pe_ratio: "31.2",
        sparkline: [232.5, 231.8, 233.0, 229.4, 228.9, 230.0, 227.8, 226.4, 228.1, 227.5, 229.2, 228.0, 229.9, 227.4, 227.80],
      },
      reliability: {
        verified: true,
        blocked: false,
        verified_close: 227.80,
        latest_date: "2026-08-27",
        block_reason: null,
        checks: [
          { name: "Cours de clôture OHLCV", status: "ok", detail: "227,80 $ conforme aux flux de marché" },
          { name: "Vérification cohérence prix", status: "ok", detail: "Écart de 0,00 % avec le marché vérifié" },
          { name: "Données financières vérifiées", status: "ok", detail: "Comptabilité et retours de capitaux certifiés" },
        ],
      },
      reports: {
        portfolio: `Décision du portefeuille : CONSERVER. Maintenir l'exposition sans surpondérer au cours actuel.`,
        market: `Range de négociation bien établi. Prises de bénéfices régulières autour des 235 $.`,
        fundamentals: `La division Services représente désormais plus de 25 % du chiffre d'affaires total avec 74 % de marge brute.`,
        news: `Poursuite des ajustements réglementaires européens sur l'App Store, impact financier marginal.`,
        social: `Fidélité client inégalée, forte attente autour des innovations logicielles.`,
        bull: `L'effet de réseau de l'écosystème Apple protège la rentabilité comme aucun autre actif au monde.`,
        bear: `Le rythme de croissance global des revenus matériels reste modéré (inférieur à 6 % par an).`,
        research_manager: `Recommandation prudente : maintien des positions avec discipline de valorisation.`,
        conservative: `Conserver sans renforcement aux niveaux de prix actuels.`,
        neutral: `Pondération neutre de 4 % du portefeuille.`,
        aggressive: `Vente de covered calls hors de la monnaie pour générer un rendement complémentaire.`,
      },
      analysis_parameters: {
        complete: true,
        debates: { investment: 2, risk: 1 },
        calls: { estimated: 12, completed: 12 },
        output_tokens_per_call: 2048,
        model: { name: "omniroute/codex-3accounts", temperature: null },
      },
    },
  },
};
