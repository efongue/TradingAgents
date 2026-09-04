# Rapport d'Enquête & État des Lieux — Vues 1 à 4 (Thème Jour/Nuit & Harmonisation)

## 1. Observation

L'analyse minutieuse du code source (`ScannerPage.jsx`, `scanner.css`, `AnalysisPage.jsx`, `AnalysisForm.jsx`, `ResultPage.jsx`, `FinancialBento.jsx`, `ExecutionLevelsCard.jsx`, `ActionPlanPanel.jsx`, `DecisionHero.jsx`, `AgentPolarityBoard.jsx`, `PolarityCard.jsx`, `AnalysisParametersPanel.jsx`, `StockSearchInput.jsx`, `Workflow.jsx`, `styles.css`) a permis de relever les anomalies concrètes suivantes.

---

### A. Vue 1 : Scanner (`ScannerPage.jsx`, `scanner.css`)

1. **Conteneurs sombres non surchargés en mode clair :**
   - `web_ui/src/scanner.css:11` : `.scanner-form { background: rgba(9, 14, 21, 0.82); }` — non surchargé sous `[data-theme="light"]`, conservant un fond noir translucide en mode clair.
   - `web_ui/src/scanner.css:49` : `.scanner-progress-panel, .scanner-results-panel, .scanner-empty-state { background: rgba(9, 14, 21, 0.82); }` — dans `styles.css:132-134`, `.scanner-table-panel` était déclaré (classe inexistante dans le JSX), tandis que `.scanner-results-panel` et `.scanner-empty-state` n'étaient pas ciblés et demeurent sombres en mode jour.
   - `web_ui/src/scanner.css:27` : `.scanner-symbols-field textarea { background: #060a0f; color: var(--text); border: 1px solid rgba(255, 255, 255, 0.1); }` — la spécificité de classe `.scanner-symbols-field textarea` outrepasse `[data-theme="light"] textarea`, affichant un textarea noir avec du texte clair.
   - `web_ui/src/scanner.css:107` : `.scanner-report-button { background: #0a1119; color: var(--text); }` — bouton d'action avec fond noir `#0a1119` persistant en mode clair.
   - `web_ui/src/scanner.css:239` : `.tab-tokens-badge { background: rgba(0, 0, 0, 0.35); color: #94a3b8; }` — badge noir.

2. **Défauts de contraste et textes illisibles en mode clair :**
   - `web_ui/src/scanner.css:67` : `.scanner-progress-grid span { color: #cbd5e1; }` — texte gris très clair sur carte blanche (ratio de contraste < 1.5:1, illisible).
   - `web_ui/src/scanner.css:70` : `.scanner-progress-track { background: #1e293b; }` — barre de piste sombre inesthétique.
   - `web_ui/src/scanner.css:72` : `.scanner-active-analysis { color: #e0f2fe; background: rgba(56, 189, 248, 0.08); }` — texte `#e0f2fe` (bleu pastel quasi-blanc) sur fond clair (contraste < 1.4:1).
   - `web_ui/src/scanner.css:83` : `.scanner-table td { color: #cbd5e1; }` — données du tableau en gris pâle sur fond blanc.
   - `web_ui/src/scanner.css:93` : `.scanner-row-status, .scanner-decision { color: #cbd5e1; background: rgba(255, 255, 255, 0.03); }` — badges d'état quasi invisibles.
   - `web_ui/src/scanner.css:111-112` : `.scanner-disclaimer p { color: #fde68a; }` et `strong { color: #fef08a; }` — texte jaune fluo sur fond ambre clair, non conforme WCAG.
   - `web_ui/src/scanner.css:205, 215, 221` : `.scanner-parallel-tab { color: #cbd5e1; }`, `.scanner-parallel-tab:hover { color: #fff; }`, `.scanner-parallel-tab.active { color: #fff; }` — texte blanc hardcodé sur fond d'onglet clair.
   - `web_ui/src/ScannerPage.jsx:313` : `<motion.tr whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.035)" }}>` — effet de survol blanc sur blanc.

---

### B. Vue 2 : Analyse & Formulaire (`AnalysisPage.jsx`, `AnalysisForm.jsx`, etc.)

1. **Conteneurs et champs sombres codés en dur :**
   - `web_ui/src/styles.css:573` : `.analysis-launcher-card { background: rgba(9, 14, 21, 0.85); }` — carte principale du lanceur restant sombre en mode jour.
   - `web_ui/src/styles.css:602, 783, 913` : `.launcher-input-group input`, `.stock-search-input-group input`, `.field input, .field select { background: #060a0f; }` — couleur d'arrière-plan sombre codée en dur.
   - `web_ui/src/styles.css:626` : `.launcher-autocomplete-dropdown { background: #090e17; }` — menu d'autocomplétion des actions sombre avec bordures dures.
   - `web_ui/src/styles.css:895` : `.analysis-form { background: rgba(9, 14, 21, 0.78); }` — conteneur du formulaire sombre.
   - `web_ui/src/styles.css:1002` : `.primary-button:disabled { background: #1e293b; border-color: #334155; }` — bouton désactivé sombre en mode jour.
   - `web_ui/src/styles.css:1010, 1016` : `.secondary-button { background: #0a1119; }` et `:hover { background: #101924; }`.
   - `web_ui/src/styles.css:1072, 1077` : `.failure-metrics span { background: rgba(0, 0, 0, 0.2); }` et `.failure-content details code { background: #05080e; color: #cbd5e1; }`.
   - `web_ui/src/styles.css:1084` : `.workflow-panel, .reliability-panel { background: rgba(9, 14, 21, 0.82); }`.
   - `web_ui/src/styles.css:1124` : `.stage-node { background: #090e15; }`.

2. **Défauts de contraste en mode clair :**
   - `web_ui/src/styles.css:693, 705` : `.autocomplete-ticker-tag { color: #f8fafc; }` et `.autocomplete-name { color: #e2e8f0; }` — texte clair dans le dropdown d'actions.
   - `web_ui/src/styles.css:860` : `.advanced-toggle-button { color: #94a3b8; background: rgba(255, 255, 255, 0.025); }` — contraste insuffisant sur surface claire.
   - `web_ui/src/styles.css:902` : `.field > span, .analyst-field legend { color: #cbd5e1; }` — labels des champs gris clair sur fond blanc.
   - `web_ui/src/styles.css:942, 953, 973` : `.analyst-toggle { color: #cbd5e1; }`, `.analyst-toggle.selected { color: #f0fdfa; }`, `.analyst-toggle.selected .analyst-card-copy small { color: #99f6e4; }` — cartes d'analystes avec texte pastel blanc/menthe clair sur fond clair.
   - `web_ui/src/styles.css:1029, 1041` : `.connection-error { color: #fecdd3; }`, `.connection-warning { color: #fde68a; }` — alertes avec texte clair inadapté au mode jour.
   - `web_ui/src/styles.css:1186, 1193` : `.stage-audit-card.verified { color: #ccfbf1; strong { color: #5eead4; } }` et `styles.css:1198, 1205` : `.stage-audit-card.blocked { color: #ffe4e6; strong { color: #fda4af; } }`.
   - `web_ui/src/styles.css:1245` : `.data-substep-copy strong { color: #cbd5e1; }` — intitulés des sous-étapes en gris clair sur blanc.

---

### C. Vue 3 : Résultats & Bento (`ResultPage.jsx`, `FinancialBento.jsx`, `ActionPlanPanel.jsx`, etc.)

1. **Conteneurs sombres résiduels et conflits de spécificité :**
   - `web_ui/src/styles.css:1456-1505` : `.decision-hero.tone-positive`, `.decision-hero.tone-negative`, `.decision-hero.tone-neutral`, `.decision-hero.blocked` avec leurs sous-classes `.tier-strong`, `.tier-strategic`, `.tier-moderate` ont une spécificité supérieure (0-3-0) et sont définies après `[data-theme="light"] .decision-hero` (0-2-0, ligne 126). Résultat : **le hero de décision reste noir d'encre même en mode clair** (`rgba(6, 24, 18, 0.95)`, `rgba(28, 8, 12, 0.95)`).
   - `web_ui/src/styles.css:1790` : `.financial-bento { background: #05080e; }` — conteneur global Bento codé en noir `#05080e`.
   - `web_ui/src/styles.css:1798` : `.bento-card { background: #090e15; }` — cartes Bento avec fond noir `#090e15`.
   - `web_ui/src/styles.css:1817` : `.bento-thesis-hero { background: linear-gradient(145deg, #09131d 0%, #060b11 100%); }`.
   - `web_ui/src/styles.css:1838, 1842` : `.bento-quality { background: #081514; }`, `.blocked { background: #190e10; }`.
   - `web_ui/src/styles.css:1845` : `.bento-range { background: linear-gradient(160deg, #0e151f, #080d13); }`.
   - `web_ui/src/styles.css:1858-1863` : `.bento-market { background: #0c131a; }`, `.bento-fundamentals { background: #0c131b; }`, `.bento-news { background: #13140e; }`, `.bento-debate { background: #111119; }`, `.bento-risk { background: #160e10; }`.
   - `web_ui/src/styles.css:1876-1896` : Doublons avec fonds sombres `#10171d`, `#12171c`, `#151612`, `#181313`.
   - `web_ui/src/styles.css:3065, 3135` : `.polarity-column { background: rgba(10, 20, 30, 0.55); }` et `.polarity-card { background: rgba(15, 27, 40, 0.8); }`.
   - `web_ui/src/styles.css:4401, 4709` : `.execution-levels-card { background: #080d14; }` et `.execution-metric-box { background: #05080c; }` — les 4 boîtes de métriques restent des blocs noirs en mode clair.
   - `web_ui/src/styles.css:4531` : `.order-ticket-dropdown-menu { background: #090e17; }`.
   - `web_ui/src/styles.css:4901, 4972` : `.calc-number-input { background: rgba(0, 0, 0, 0.35); }`, `.calc-result-card { background: rgba(0, 0, 0, 0.25); }`.
   - `web_ui/src/styles.css:6982` : `.action-plan-hero-card { background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.75) 100%); }`.
   - `web_ui/src/styles.css:7108` : `.action-profile-card { background: var(--surface-2, #0d1926); }`.
   - `web_ui/src/styles.css:7227` : `.action-order-box { background: rgba(0, 0, 0, 0.3); }` — boîte d'ordre noire en mode clair.

2. **Défauts de contraste et textes blancs sur fond clair :**
   - `web_ui/src/styles.css:1518-1560` : Titres de décision (`.decision-text.positive`, `.neutral`, `.negative`) avec dégradés commençant par des couleurs très claires (`#6ee7b7`, `#a7f3d0`, `#d1fae5`, `#fef08a`, `#fca5a5`, `#ffe4e6`) créant un effet délavé sur fond blanc.
   - `web_ui/src/styles.css:1582, 1590, 1605, 1610` : `.decision-strength-pill` texte `#cbd5e1`, `#a7f3d0`, `#fde047`, `#fca5a5` (illisible en mode clair).
   - `web_ui/src/styles.css:1691, 1702` : `.tabs { background: rgba(6, 10, 15, 0.5); }` et `.tabs button { color: #94a3b8; }`.
   - `web_ui/src/styles.css:1830, 1841, 1851, 1855` : Textes Bento en `#cbd5e1`, `#99f6e4`, `#f1f5f9`.
   - `web_ui/src/styles.css:3106-3108` : Titres des colonnes de polarité en `#fda4af`, `#fde047`, `#6ee7b7` (jaune/rose/vert fluo sur blanc).
   - `web_ui/src/styles.css:3186, 3235` : `.polarity-agent-name { color: #f1f5f9; }` et `.polarity-card-summary { color: #cbd5e1; }`.
   - `web_ui/src/styles.css:4438` : `.execution-title-group h3 { color: #f1f5f9; }` — titre blanc sur carte blanche (invisible).
   - `web_ui/src/styles.css:4640` : `.timing-zone-title { color: #f1f5f9; }` — titre blanc sur bannière.
   - `web_ui/src/styles.css:4781` : `.metric-value { color: #f8fafc; }` — valeur de prix blanche.
   - `web_ui/src/styles.css:5004` : `.calc-result-value { color: #f1f5f9; }` — résultat de simulation blanc.
   - `web_ui/src/styles.css:7008` : `.action-plan-hero-left h2 { color: #fff; }` — titre principal du plan d'action blanc sur fond blanc (invisible).
   - `web_ui/src/styles.css:7148` : `.action-profile-badge { color: #fff; }` — badge blanc sur fond blanc.
   - `web_ui/src/styles.css:7179, 7215, 7260` : `.action-profile-summary { color: #cbd5e1; }`, `.action-steps-list li { color: #e2e8f0; }`, `.order-val { color: #fff; }` — textes blancs/clairs sur cartes du plan d'action.

---

## 2. Logic Chain

1. **Constat sur l'architecture CSS actuelle :**
   - Le fichier `styles.css` applique initialement des couleurs sombres codées en dur (`#05080e`, `#090e15`, `#060a0f`, `rgba(9, 14, 21, ...)`, `#fff`) au lieu de se baser systématiquement sur les variables CSS `--bg`, `--surface`, `--surface-2`, `--surface-3`, `--text`, `--text-secondary`, `--muted`, `--line`.
   - Les règles sous `[data-theme="light"]` dans `styles.css` n'étaient que partielles et souffraient de conflits de spécificité (notamment sur `.decision-hero.tone-*.tier-*`, `.execution-metric-box`, `.bento-*`, `.scanner-*`).

2. **Impact sur l'expérience utilisateur :**
   - En mode clair, l'utilisateur est confronté à des "trous noirs" (conteneurs restés sombres), des titres invisibles (texte `#fff` sur fond blanc), des données illisibles (textes gris clair `#cbd5e1` sur cartes blanches avec contraste < 2:1) et des alertes jaunes fluo non contrastées.
   - En mode sombre, la structure visuelle et les lueurs néon sont bien calibrées mais dépendent parfois de valeurs dupliquées.

3. **Stratégie de résolution :**
   - **Règle d'or sémantique :** Remplacer les fonds codés en dur par `var(--surface)`, `var(--surface-2)`, `var(--surface-3)`, `var(--surface-glass)` et les couleurs de texte par `var(--text)`, `var(--text-secondary)`, `var(--muted)`.
   - **Harmonisation des signaux financiers :** Utiliser `--signal-bullish`, `--signal-bullish-text`, `--signal-bullish-bg`, `--signal-neutral-*`, `--signal-bearish-*` qui sont déjà correctement différenciées entre mode sombre et mode clair (vert foncé `#065f46`, ambre `#92400e`, rouge `#991b1b` en mode jour).
   - **Résolution des spécificités :** Structurer les règles `[data-theme="light"]` pour couvrir explicitement toutes les sous-classes des vues 1 à 4 (`.scanner-*`, `.analysis-*`, `.decision-hero`, `.execution-*`, `.bento-*`, `.action-plan-*`, `.polarity-*`).

---

## 3. Caveats

- Les vues 5 à 8 (Comparateur, Watchlist, Performance, Historique, Paramètres) ont été uniquement survolées pour vérifier les styles globaux mais relèvent du périmètre d'Explorer 1.
- Le serveur Python (démon actif) ne doit sous aucun prétexte être redémarré pendant les tests ou la suite des travaux.

---

## 4. Conclusion

Les 4 premières vues de l'application présentent 4 familles critiques d'anomalies visuelles en mode jour :
1. **Conteneurs sombres résiduels :** `.scanner-form`, `.scanner-results-panel`, `.analysis-launcher-card`, `.decision-hero`, `.financial-bento`, `.bento-card`, `.execution-metric-box`, `.action-order-box`.
2. **Textes invisibles (blanc sur blanc) :** `.action-plan-hero-left h2`, `.execution-title-group h3`, `.action-profile-badge`, `.order-val`, `.calc-result-value`.
3. **Textes à faible contraste (gris/pastel sur blanc) :** `.scanner-table td`, `.scanner-progress-grid span`, `.data-substep-copy strong`, `.bento-thesis-list`, `.action-steps-list li`, `.polarity-col-title`.
4. **Composants interactifs à fond noir :** `.scanner-symbols-field textarea`, `.launcher-autocomplete-dropdown`, `.calc-number-input`.

Un plan de remédiation complet et prêt à être implémenté via des tokens CSS sémantiques a été formalisé dans ce rapport.

---

## 5. Verification Method

Pour vérifier l'état du code et valider les futures implémentations :
1. **Tests unitaires JavaScript :** `npm test` dans `web_ui` (34 tests doivent réussir à 100%).
2. **Build de production Vite :** `npm run build` dans `web_ui` (0 erreur).
3. **Tests Python :** `uv run pytest tests` (tous les tests du moteur doivent passer sans toucher au démon).
4. **Inspection visuelle :** Bascule instantanée jour/nuit sur `/scanner`, `/`, et la vue résultat pour confirmer la lisibilité WCAG AA 4.5:1.
