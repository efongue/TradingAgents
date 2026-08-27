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
        close: 227.26,
        open: 224.50,
        high: 229.80,
        low: 223.75,
        volume: 48200000,
        market_cap: "3.16 T$",
        pe_ratio: "42.8",
        sparkline: [200.75, 206.64, 211.94, 219.22, 218.99, 223.96, 217.55, 217.50, 224.09, 225.30, 225.16, 225.01, 219.74, 217.56, 216.85, 214.72, 208.48, 213.05, 209.66, 227.26],
      },
      reliability: {
        verified: true,
        blocked: false,
        verified_close: 227.26,
        latest_date: "2026-08-27",
        block_reason: null,
        checks: [
          { name: "Cours de clôture OHLCV", status: "ok", detail: "227,26 $ conforme aux flux de marché" },
          { name: "Vérification cohérence prix", status: "ok", detail: "Écart de 0,00 % avec le marché vérifié" },
          { name: "Données financières vérifiées", status: "ok", detail: "Rapports 10-Q et bilans récents validés" },
          { name: "Absence de split non ajusté", status: "ok", detail: "Historique ajusté certifié" },
        ],
      },
      reports: {
        portfolio: `Décision du portefeuille : ACHETER FORT. Surpondérer la ligne avec un objectif moyen terme ambitieux.`,
        market: `Tendance haussière confirmée. Support clé à 215,00 $, résistance immédiate à 235,00 $. Flux acheteurs dominants.`,
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
      confidence: "Élevée (85 %)",
      consensus: {
        bullish: 82,
        neutral: 14,
        bearish: 4,
        verdict: "Consolidation haussière durable portée par la monétisation de Copilot et les gains de parts de marché d'Azure.",
      },
      catalysts: [
        "Augmentation de +31 % de l'ARPU sur les abonnements Microsoft 365 Copilot",
        "Croissance de +29 % du chiffre d'affaires cloud Azure à taux de change constant",
        "Partenariats de distribution élargis dans le secteur bancaire et la santé",
      ],
      risk_veto: {
        triggered: false,
        level: "Faible",
        summary: "Visibilité exceptionnelle sur les flux récurrents de trésorerie (ARR), risque d'exécution maîtrisé.",
      },
      analyst_scores: {
        market: { score: 86, stance: "Haussier", note: "Rebond technique sur support SMA 50 jours" },
        fundamentals: { score: 93, stance: "Très Solide", note: "Génération de cash-flow libre record de 74,1 Md$" },
        news: { score: 81, stance: "Favorable", note: "Accords pluriannuels de cybersécurité signés" },
        social: { score: 79, stance: "Positif", note: "Forte confiance des décideurs IT d'entreprise" },
      },
      summary: `### Synthèse Exécututive : Microsoft Corporation (NASDAQ: MSFT)

Microsoft combine une position dominante dans les logiciels de productivité d'entreprise avec un moteur de croissance cloud à forte rentabilité. Le consensus multi-agents recommande une stratégie d'accumulation progressive.`,
      complete_report: `# Rapport Exécutif d'Analyse Multi-Agents : Microsoft Corporation

## 1. Vue d'Ensemble & Décision
- **Symbole** : MSFT (NASDAQ)
- **Décision Finale** : ACCUMULER (Achat Progressif)
- **Indice de Confiance** : 85 %
- **Consensus Multi-Agents** : 82 % Haussier / 14 % Neutre / 4 % Prudent

---

## 2. Synthèse des 4 Piliers d'Analyse
- **Technique** : Support majeur testé et validé à 485 $. Tendance de fond résolument haussière.
- **Fondamentaux** : Multiple P/E en ligne avec la qualité du bilan et la récurrence des marges logicielles.
- **Actualité & Catalyseurs** : Croissance soutenue des déploiements d'infrastructures d'inférence Azure.
- **Sentiment & Réputation** : Marque de confiance absolue auprès des directeurs informatiques du Fortune 500.`,
      snapshot: {
        close: 505.82,
        open: 498.50,
        high: 508.10,
        low: 496.80,
        volume: 19400000,
        market_cap: "3.28 T$",
        pe_ratio: "33.4",
        sparkline: [463.85, 486.73, 491.88, 486.54, 498.92, 499.05, 505.11, 502.86, 491.50, 495.95, 494.47, 479.45, 480.73, 483.40, 481.15, 483.24, 487.31, 491.71, 496.37, 505.82],
      },
      reliability: {
        verified: true,
        blocked: false,
        verified_close: 505.82,
        latest_date: "2026-08-27",
        block_reason: null,
        checks: [
          { name: "Cours de clôture OHLCV", status: "ok", detail: "505,82 $ conforme aux flux de marché" },
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
      confidence: "Moyenne (68 %)",
      consensus: {
        bullish: 64,
        neutral: 24,
        bearish: 12,
        verdict: "Maintien de la position sans surpondération immédiate compte tenu de la valorisation tendue.",
      },
      catalysts: [
        "Monétisation croissante de la base d'abonnés aux Services (iCloud, Apple Music, Pay)",
        "Programme de rachat d'actions record de 110 Md$",
        "Lancement progressif de nouvelles fonctionnalités d'intelligence embarquée",
      ],
      risk_veto: {
        triggered: false,
        level: "Modéré",
        summary: "Croissance des ventes d'iPhone stabilisée, pression réglementaire sur les commissions de l'App Store.",
      },
      analyst_scores: {
        market: { score: 72, stance: "Neutre / Positif", note: "Consolidation horizontale dans le canal 300-320 $" },
        fundamentals: { score: 86, stance: "Très Solide", note: "Génération de cash-flow inégalée et marge brute de 46 %" },
        news: { score: 68, stance: "Neutre", note: "Attente des prochaines annonces produits" },
        social: { score: 78, stance: "Favorable", note: "Fidélité de marque exceptionnelle" },
      },
      summary: `### Synthèse Exécututive : Apple Inc. (NASDAQ: AAPL)

Apple demeure une forteresse financière incontournable, caractérisée par une rentabilité élevée et une base d'utilisateurs ultra-fidèle. Les analystes préconisent le maintien de la pondération actuelle (Conserver) en attendant un catalyseur de réaccélération de la division matérielle.`,
      complete_report: `# Rapport Exécutif d'Analyse Multi-Agents : Apple Inc.

## 1. Vue d'Ensemble & Décision
- **Symbole** : AAPL (NASDAQ)
- **Décision Finale** : CONSERVER (Pondération Neutre)
- **Indice de Confiance** : 68 %
- **Consensus Multi-Agents** : 64 % Haussier / 24 % Neutre / 12 % Prudent

---

## 2. Synthèse des 4 Piliers d'Analyse
- **Technique** : Phase de consolidation horizontale. Absence de catalyseur technique immédiat pour casser la résistance des 325 $.
- **Fondamentaux** : Bilan extrêmement sain mais multiple P/E proche de ses sommets historiques de 10 ans.
- **Actualité & Catalyseurs** : Déploiement progressif des fonctionnalités Apple Intelligence à l'international.
- **Sentiment & Écosystème** : Taux de rétention des utilisateurs iOS supérieur à 94 %.`,
      snapshot: {
        close: 313.62,
        open: 310.40,
        high: 315.80,
        low: 309.20,
        volume: 38700000,
        market_cap: "3.44 T$",
        pe_ratio: "31.2",
        sparkline: [308.64, 303.16, 309.11, 310.73, 312.14, 313.06, 308.26, 304.91, 302.25, 305.26, 305.93, 305.59, 310.03, 316.83, 311.30, 309.35, 310.34, 309.90, 313.45, 313.62],
      },
      reliability: {
        verified: true,
        blocked: false,
        verified_close: 313.62,
        latest_date: "2026-08-27",
        block_reason: null,
        checks: [
          { name: "Cours de clôture OHLCV", status: "ok", detail: "313,62 $ conforme aux flux de marché" },
          { name: "Vérification cohérence prix", status: "ok", detail: "Écart de 0,00 % avec le marché vérifié" },
          { name: "Données financières vérifiées", status: "ok", detail: "Comptabilité et retours de capitaux certifiés" },
        ],
      },
      reports: {
        portfolio: `Décision du portefeuille : CONSERVER. Maintenir l'exposition sans surpondérer au cours actuel.`,
        market: `Range de négociation bien établi. Prises de bénéfices régulières autour des 320 $.`,
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
