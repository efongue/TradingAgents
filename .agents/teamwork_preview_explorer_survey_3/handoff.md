# Rapport d'Investigation & Audit Thème (Views 5-8 & Shared Components)
**Explorer Survey 3** — Theme Harmonization (Mode Jour & Mode Nuit)

---

## 1. Observations

### 1.1 Inventaire des Vues Analysées & Composants Dépendants

| Vue / Composant | Fichier Source | Classes CSS Clés (`styles.css`) |
|---|---|---|
| **Vue 5 : Comparateur** | `web_ui/src/ComparePage.jsx` | `.compare-page`, `.compare-selector-panel`, `.compare-active-chip`, `.compare-input-form`, `.compare-grid`, `.compare-card`, `.compare-card-placeholder`, `.compare-pillar-item`, `.compare-pillar-badge`, `.compare-thesis-box`, `.compare-risk-box` |
| **Vue 6 : Watchlist** | `web_ui/src/WatchlistPage.jsx` | `.watchlist-page`, `.watchlist-kpi-strip`, `.watchlist-kpi-box`, `.watchlist-controls-panel`, `.watchlist-input-wrapper`, `.watchlist-filter-box`, `.view-toggle-group`, `.watchlist-table-panel`, `.watchlist-table`, `.watchlist-grid`, `.watchlist-card` |
| **Vue 7 : Simulateur & Performance** | `web_ui/src/PerformancePage.jsx` | `.performance-page`, `.portfolio-simulator-panel`, `.simulator-capital-controller`, `.capital-input-wrap`, `.capital-preset-pill`, `.simulator-kpi-grid`, `.sim-kpi-box`, `.simulator-quick-actions-bar`, `.quick-action-btn`, `.performance-toolbar`, `.performance-search-input`, `.performance-sort-dropdown`, `.performance-table-panel`, `.performance-table-head`, `.performance-table-row`, `.perf-kpi-card` |
| **Vue 8 : Historique & Audit Log** | `web_ui/src/pages/HistoryPage.jsx` | `.history-page`, `.history-kpi-strip`, `.history-kpi-box`, `.history-toolbar`, `.history-search-input`, `.history-filter-chips`, `.filter-chip`, `.history-view-mode-toggle`, `.history-table-panel`, `.history-table-head`, `.history-table-row`, `.history-group-subrows`, `.history-evolution-banner`, `.evolution-kpi-pill`, `.version-timeline-card` |
| **Vue 9 / Réglages : Paramètres & IA** | `web_ui/src/pages/SettingsPage.jsx` | `.settings-panel`, `.setting-row`, `.model-list-panel`, `.connection-strip`, `.model-row`, `.settings-title` |
| **Shared : Navigation & Sidebar** | `web_ui/src/components/layout/Sidebar.jsx` | `.sidebar`, `.brand-row`, `.brand`, `.primary-nav`, `.nav-item`, `.sidebar-footer`, `.model-state`, `.sidebar-theme-btn`, `.sidebar-lang-btn` |
| **Shared : Header Mobile** | `web_ui/src/components/layout/Topbar.jsx` | `.mobile-topbar`, `.icon-button`, `.brand` |
| **Shared : Modale Guide Méthodologique** | `web_ui/src/components/layout/PipelineGuidePopover.jsx` | `.pipeline-guide-popover`, `.pipeline-guide-popover::backdrop`, `.popover-header`, `.popover-close-btn`, `.pipeline-tier`, `.tier-number` |
| **Shared : Popup Avertissement Flottant** | `web_ui/src/components/layout/GlobalDisclaimerPopup.jsx` | `.disclaimer-floating-popup`, `.disclaimer-popup-icon-wrap`, `.disclaimer-popup-text`, `.disclaimer-popup-close` |
| **Shared : Menu Export & Partage** | `web_ui/src/components/ui/ExportDropdown.jsx` | `.export-dropdown-wrap`, `.export-dropdown-menu`, `.export-dropdown-item` |
| **Shared : Badges Décision Multi-Tiers** | `web_ui/src/DecisionBadge.jsx` | `.decision-pill-badge`, `.strength-bars`, `.bar`, `.decision-pill-text`, `.tier-strong`, `.tier-strategic`, `.tier-moderate` |
| **Shared : Micro-Graphiques Sparklines** | `web_ui/src/Sparkline.jsx` | `.sparkline-container`, `.sparkline-svg`, `.sparkline-badge`, `.sparkline-trend-info` |
| **Shared : Cadrage d'Exécution & Calculateur** | `web_ui/src/ExecutionLevelsCard.jsx` | `.execution-levels-card`, `.order-ticket-copy-btn`, `.order-ticket-dropdown-menu`, `.order-ticket-menu-item`, `.execution-timing-banner`, `.execution-metric-box`, `.calc-number-input`, `.calc-preset-chip`, `.calc-result-card` |
| **Shared : Recherche Autocomplete** | `web_ui/src/StockSearchInput.jsx` | `.stock-search-wrapper`, `.stock-search-input-group`, `.launcher-autocomplete-dropdown`, `.autocomplete-header`, `.autocomplete-item`, `.autocomplete-ticker-tag`, `.autocomplete-name` |

---

### 1.2 Observations Détaillées des Défauts par Composant / Vue

#### A. Barre Latérale & En-Tête (`Sidebar.jsx`, `Topbar.jsx`, `styles.css`)
1. **Logo / Brand illisible en Mode Clair** :
   - `styles.css:363` : `.brand { background: linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }`
   - En mode clair (`[data-theme="light"]`), `.sidebar` a un fond blanc (`#ffffff` à `#f8fafc`). Le texte du logo "TradingAgents" reste dégradé blanc-gris clair sur fond blanc -> **invisibilité totale** (contraste < 1.1:1).
   - `styles.css:2687` : `.mobile-topbar { background: rgba(6,17,27,.96); ... }` conserve un fond noir en mode jour sur mobile.
2. **Pied de Sidebar Sombre Résiduel** :
   - `styles.css:448` : `.sidebar-footer { background: #090e15; ... }`
   - En mode clair, `.sidebar-footer` n'a pas de règle de thème et reste un bloc noir `#090e15` au bas de la barre latérale blanche.

#### B. Modales & Popups Flottants (`PipelineGuidePopover.jsx`, `GlobalDisclaimerPopup.jsx`, `ExportDropdown.jsx`)
1. **Modale Guide Méthodologique** :
   - `styles.css:2896` : `.pipeline-guide-popover { background: #081622; ... }`
   - `styles.css:2915` : `.pipeline-guide-popover::backdrop { background: rgba(4, 10, 16, 0.72); ... }`
   - `styles.css:2978` : `.pipeline-tier { background: rgba(255, 255, 255, 0.02); ... }`
   - En mode clair, l'ouverture du Popover affiche une modale sombre `#081622` non adaptée.
2. **Disclaimer Flottant Global** :
   - `styles.css:4144` : `.disclaimer-floating-popup { background: rgba(13, 20, 31, 0.92); border: 1px solid rgba(245, 158, 11, 0.4); ... }`
   - `styles.css:4179` : `.disclaimer-popup-text strong { color: #fde047; }`
   - `styles.css:4186` : `.disclaimer-popup-text p { color: #cbd5e1; }`
   - En mode clair, le bandeau d'avertissement reste sombre avec des contrastes non optimisés.
3. **Menu Déroulant d'Export & Partage** :
   - `styles.css:1394` : `.export-dropdown-menu { background: rgba(13, 20, 31, 0.98); border: 1px solid rgba(255, 255, 255, 0.12); ... }`
   - `styles.css:1434` : `.export-dropdown-item strong { color: #f1f5f9; }`
   - En mode clair, le menu d'export s'ouvre sous la forme d'un menu noir sur fond blanc.

#### C. Comparateur (`ComparePage.jsx` & `styles.css`)
1. **Sélecteur & Barre de Recherche** :
   - `styles.css:3253` : `.compare-selector-panel { background: rgba(8, 21, 31, 0.72); }` -> Fond sombre résiduel.
   - `styles.css:3301` : `.compare-input-form input { background: #08131e; border: 1px solid #40505c; color: var(--text); }` -> Champ de saisie noir codé en dur.
2. **Cartes de Comparaison & Conflit de Spécificité CSS** :
   - `styles.css:129` déclare `[data-theme="light"] .compare-card { background: #ffffff; }`, MAIS :
   - `styles.css:3348-3358` déclare `.compare-card.positive`, `.compare-card.neutral`, `.compare-card.negative` avec `background: linear-gradient(155deg, rgba(...), #0a1622 100%);`
   - Comme `.compare-card.positive` a deux classes et est déclaré plus bas, il **écrase** la règle de mode clair et rend la carte sombre `#0a1622` même en mode jour !
3. **Cartes Vides / Placeholders** :
   - `styles.css:3364` : `.compare-card.compare-card-placeholder { background: rgba(10, 22, 34, 0.6); border-color: rgba(255, 255, 255, 0.15); }` -> Fond sombre en mode jour.
4. **Boîte de Thèse & Variable Non Définie** :
   - `styles.css:3529` : `.compare-thesis-box p { color: var(--text-main); }` -> `--text-main` n'est pas déclaré dans `:root` (seul `--text` existe).
5. **Boîte de Risque** :
   - `styles.css:3536` : `.compare-risk-box { background: rgba(0, 0, 0, 0.2); } .compare-risk-box strong { color: #ffd681; }` -> Contrastes faibles en mode clair.

#### D. Watchlist (`WatchlistPage.jsx` & `styles.css`)
1. **KPI Strip & Barre de Contrôles** :
   - `styles.css:3582` : `.watchlist-kpi-box { background: rgba(9, 14, 21, 0.78); }` -> Bloc noir en mode clair.
   - `styles.css:3626` : `.watchlist-controls-panel { background: rgba(9, 14, 21, 0.82); }` -> Bloc noir en mode clair.
   - `styles.css:3656` : `.watchlist-input-wrapper input { background: #060a0f; border: 1px solid rgba(255, 255, 255, 0.1); }` -> Input noir.
   - `styles.css:3710` : `.watchlist-filter-box input:focus { background: #060a0f; }` -> Au focus en mode clair, l'input devient subitement noir.
   - `styles.css:3723` : `.view-toggle-group { background: #060a0f; }` -> Sélecteur de vue noir.
2. **Tableau Pro Watchlist** :
   - `styles.css:3750` : `.watchlist-table-panel { background: rgba(9, 14, 21, 0.84); }` -> Tableau noir.
   - `styles.css:3774` : `.watchlist-table td { color: #cbd5e1; }` -> Texte gris clair `#cbd5e1` illisible sur fond blanc.
3. **Cartes Grille Watchlist** :
   - `styles.css:3899, 3907, 3915` : `.watchlist-card.positive`, `.neutral`, `.negative` ont un dégradé se terminant par `rgba(9, 14, 21, 0.9)`, écrasant le mode clair.

#### E. Simulateur & Performance (`PerformancePage.jsx` & `styles.css`)
1. **Simulateur Hero Panel** :
   - `styles.css:5082` : `.portfolio-simulator-panel { background: #080d14; border: 1px solid rgba(45, 212, 191, 0.25); }` -> Conteneur entièrement noir `#080d14`.
   - `styles.css:5124` : `.simulator-title-group h2 { color: #f8fafc; }` -> Texte blanc forcé.
   - `styles.css:5147` : `.capital-input-wrap { background: #05080c; border: 1px solid rgba(255, 255, 255, 0.15); }` -> Input capital noir.
   - `styles.css:5164` : `.simulator-capital-input { color: #f8fafc; }`
   - `styles.css:5200` : `.capital-preset-pill { color: #94a3b8; } .capital-preset-pill:hover, .active { color: #f8fafc; }`
   - `styles.css:5229` : `.sim-kpi-box { background: #05080c; }` -> Boîtes KPI noires `#05080c`.
   - `styles.css:5266` : `.sim-kpi-value { color: #f8fafc; }`
   - `styles.css:5316` : `.quick-action-btn { color: #cbd5e1; background: rgba(255, 255, 255, 0.04); }`
2. **Barre d'Outils & Filtres Performance** :
   - `styles.css:5495` : `.performance-toolbar { background: #080d14; }` -> Barre noire.
   - `styles.css:5520` : `.performance-search-input input { background: #05080c; color: #f8fafc; }` -> Champ noir.
   - `styles.css:5576` : `.performance-sort-dropdown { background: #05080c; color: #f8fafc; }` -> Select noir.
3. **Tableau d'Audit Interactif des Trades** :
   - `styles.css:5584` : `.performance-table-panel { background: #080d14; }` -> Fond noir `#080d14`.
   - `styles.css:5617` : `.performance-table-row { border-bottom: 1px solid rgba(255, 255, 255, 0.04); }`
   - Règle `[data-theme="light"]` orpheline : la ligne 135 ciblait `.performance-overview-card` et `.performance-trades-card`, or la refonte utilise `.portfolio-simulator-panel` et `.performance-table-panel`.

#### F. Historique & Journal d'Audit (`HistoryPage.jsx` & `styles.css`)
1. **Strip KPI & Toolbar** :
   - `styles.css:1947` : `.history-kpi-box { background: rgba(9, 14, 21, 0.78); }`
   - `styles.css:1964` : `.history-toolbar { background: rgba(9, 14, 21, 0.82); }`
   - `styles.css:1992` : `.history-search-input input { background: #060a0f; }`
   - `styles.css:2047` : `.filter-chip { color: #cbd5e1; }`
2. **Tableau d'Historique** :
   - `styles.css:2110` : `.history-table-panel { background: rgba(9, 14, 21, 0.84); }`
   - `styles.css:2138` : `.history-table-row { color: #cbd5e1; }` (texte gris clair)
   - `styles.css:2172` : `.history-symbol-tag { color: #f8fafc; background: rgba(255, 255, 255, 0.05); }`
   - `styles.css:2190` : `.history-price-cell strong { color: #f1f5f9; }`
3. **Tiroir Accordéon Déroulant des Versions Antérieures** :
   - `styles.css:2364` : `.history-group-subrows { background: rgba(8, 13, 20, 0.95); }` -> Tiroir noir profond en mode clair !
   - `styles.css:2379` : `.history-evolution-banner { background: rgba(15, 23, 42, 0.7); }`
   - `styles.css:2395` : `.evolution-banner-title { color: #f1f5f9; }`
   - `styles.css:2414` : `.evolution-kpi-pill { background: rgba(0, 0, 0, 0.35); }`
   - `styles.css:2453` : `.version-timeline-card { background: rgba(13, 20, 31, 0.85); }`
   - `styles.css:2463` : `.version-timeline-card.latest { background: rgba(13, 27, 36, 0.9); }`
   - `styles.css:2531` : `.version-price-val { color: #f1f5f9; }`

#### G. Badges Décision (`DecisionBadge.jsx` & `styles.css`)
- `styles.css:4291` : `.decision-pill-badge.positive.tier-strong { color: #34d399; }` (vert pastel clair)
- `styles.css:4307` : `.decision-pill-badge.positive.tier-strategic { color: #5eead4; }` (menthe pastel clair)
- `styles.css:4324` : `.decision-pill-badge.positive.tier-moderate { color: #a7f3d0; }` (vert sauge très clair)
- `styles.css:4340` : `.decision-pill-badge.negative.tier-strong { color: #f87171; }` (rouge pastel clair)
- `styles.css:4356` : `.decision-pill-badge.negative.tier-strategic { color: #fda4af; }` (rose pastel clair)
- `styles.css:4373` : `.decision-pill-badge.negative.tier-moderate { color: #fecdd3; }` (rose très clair)
- **Problème WCAG AA** : En Mode Nuit, ces couleurs néon/pastel sont très lisibles sur fond sombre. Mais en Mode Jour, sur un badge à fond blanc/clair, `#a7f3d0` ou `#fecdd3` est **quasiment invisible** (ratio de contraste ~1.3:1).
- **Solution** : Adapter les classes `.positive.tier-*` et `.negative.tier-*` sous `[data-theme="light"]` avec les couleurs d'encre sombre définies dans `--signal-bullish-text: #065f46;` et `--signal-bearish-text: #991b1b;`.

#### H. Micro-Graphiques Sparklines (`Sparkline.jsx` & `styles.css`)
- `styles.css:4065-4075` :
  - `.sparkline-badge.positive { color: #34d399; }` -> En mode jour, texte vert pastel illisible.
  - `.sparkline-badge.negative { color: #fda4af; }` -> En mode jour, texte rose pastel illisible.
  - `.sparkline-badge.neutral { color: #fde047; }` -> En mode jour, texte jaune pastel illisible.
- **Solution** : Utiliser sous `[data-theme="light"]` les encres à fort contraste : vert foncé `#065f46`, rouge foncé `#991b1b`, ambre foncé `#92400e`.

#### I. Cadrage d'Exécution & Mini-Calculateur (`ExecutionLevelsCard.jsx` & `styles.css`)
- `styles.css:4401` : `.execution-levels-card { background: #080d14; }`
- `styles.css:4531` : `.order-ticket-dropdown-menu { background: #090e17; }` (menu déroulant formats d'ordre toujours noir)
- `styles.css:4564` : `.order-ticket-menu-item strong { color: #e2e8f0; }`
- `styles.css:4640` : `.timing-zone-title { color: #f1f5f9; }`
- `styles.css:4709` : `.execution-metric-box { background: #05080c; }`
- `styles.css:4781` : `.metric-value { color: #f8fafc; }`
- `styles.css:4821` : `.execution-calculator-title { color: #f1f5f9; }`
- `styles.css:4901` : `.calc-number-input { background: rgba(0, 0, 0, 0.35); color: #fff; }`
- `styles.css:4972` : `.calc-result-card { background: rgba(0, 0, 0, 0.25); }`

#### J. Champ de Recherche Autocomplete (`StockSearchInput.jsx` & `styles.css`)
- `styles.css:626` : `.launcher-autocomplete-dropdown { background: #090e17; }`
- `styles.css:693` : `.autocomplete-ticker-tag { color: #f8fafc; }`
- `styles.css:705` : `.autocomplete-name { color: #e2e8f0; }`
- `styles.css:732` : `.autocomplete-sector-tag { color: #94a3b8; }`
- En mode clair, la liste déroulante d'autocomplétion des symboles reste un rectangle noir flottant.

---

## 2. Logic Chain

1. **Prémisse 1 (Spécificité et Cascade CSS)** : Les sélecteurs composites avec modificateurs d'état (ex: `.compare-card.positive`, `.watchlist-card.neutral`, `.decision-pill-badge.positive.tier-strong`) ont une spécificité supérieure à `[data-theme="light"] .compare-card` et sont déclarés plus bas dans la feuille `styles.css`. Par conséquent, ils écrasent les styles clairs et forcent des fonds/textes sombres même en mode jour.
2. **Prémisse 2 (Composants Récemment Refondus)** : Le simulateur de portefeuille (`PerformancePage.jsx`), les tiroirs de versions d'historique (`HistoryPage.jsx`), le menu d'export (`ExportDropdown.jsx`), le cadrage d'exécution (`ExecutionLevelsCard.jsx`) et l'autocomplétion (`StockSearchInput.jsx`) ont été développés avec des palettes sombres explicites (`#080d14`, `#05080c`, `#090e17`, `rgba(13,20,31,...)`). Sans règles spécifiques sous `[data-theme="light"]`, ils ne s'adaptent pas au mode jour.
3. **Prémisse 3 (WCAG AA & Encres Pastel)** : Les couleurs néon à haute luminosité (`#34d399`, `#5eead4`, `#a7f3d0`, `#f87171`, `#fda4af`, `#fecdd3`, `#fde047`, `#ffd681`) ont un ratio de contraste excellent (> 7:1) sur fond sombre `#05080e`, mais catastrophique (< 2:1) sur fond blanc `#ffffff`. Elles doivent basculer en encres foncées (`#065f46`, `#0f766e`, `#047857`, `#991b1b`, `#be123c`, `#92400e`) en mode clair.
4. **Prémisse 4 (Logo & Navigation)** : Le composant `.brand` utilise un clipping de dégradé `#ffffff` vers `#cbd5e1`. Sans surcharge en mode clair, la marque "TradingAgents" devient invisible sur la sidebar blanche.
5. **Conclusion Logique** : Pour atteindre une harmonisation 100% sans faille (style SaaS type Linear/Stripe), l'ensemble de ces conteneurs, inputs, badges, menus, tableaux et tiroirs doit être mappé sur les variables sémantiques ou surchargé sous `[data-theme="light"]`, tout en préservant intactes les déclarations sombres par défaut pour le Dark Mode.

---

## 3. Caveats

- **Mode Sombre Intact** : Aucune règle par défaut de `:root` ne doit être supprimée pour éviter toute régression sur le thème sombre. L'ensemble des adaptations jour doit être encapsulé sous `[data-theme="light"]`.
- **Compatibilité Démon Python** : Aucun redémarrage du backend Python n'est nécessaire ; les modifications sont strictement frontend (CSS/JSX).
- **Animations Framer Motion** : Les styles `whileHover` avec `backgroundColor` en dur dans JSX (ex: `PerformancePage.jsx` ligne 644) doivent utiliser des teintes translucides adaptées aux deux modes ou des classes CSS.

---

## 4. Conclusion & Plan d'Action Recommandé

### 4.1 Synthèse Globale des Correctifs Requis

1. **Navigation & Marque** :
   - Ajouter `[data-theme="light"] .brand` avec dégradé sombre (`#0f172a` à `#334155`).
   - Adapter `[data-theme="light"] .sidebar-footer` (`background: #f8fafc`, `border-color: var(--line)`).
   - Adapter `[data-theme="light"] .mobile-topbar` (`background: rgba(255, 255, 255, 0.96)`).
2. **Modales, Popups & Dropdowns** :
   - Adapter `[data-theme="light"] .pipeline-guide-popover` (fond `#ffffff`, texte foncé, backdrop doux).
   - Adapter `[data-theme="light"] .disclaimer-floating-popup` (fond `#ffffff`, ombre légère, texte contrasté).
   - Adapter `[data-theme="light"] .export-dropdown-menu` (fond `#ffffff`, texte `#0f172a`).
   - Adapter `[data-theme="light"] .launcher-autocomplete-dropdown` (fond `#ffffff`, items et badges adaptés).
3. **Comparateur (`ComparePage.jsx`)** :
   - Adapter `.compare-selector-panel`, `.compare-input-form input`, `.compare-card.positive/.neutral/.negative`, `.compare-card.compare-card-placeholder`, `.compare-thesis-box`, `.compare-risk-box`.
4. **Watchlist (`WatchlistPage.jsx`)** :
   - Adapter `.watchlist-kpi-box`, `.watchlist-controls-panel`, `.watchlist-input-wrapper input`, `.view-toggle-group`, `.watchlist-table-panel`, `.watchlist-table td`, `.watchlist-card.positive/.neutral/.negative`.
5. **Performance & Simulateur (`PerformancePage.jsx`)** :
   - Adapter `.portfolio-simulator-panel`, `.simulator-title-group h2`, `.capital-input-wrap`, `.simulator-capital-input`, `.sim-kpi-box`, `.sim-kpi-value`, `.performance-toolbar`, `.performance-search-input input`, `.performance-sort-dropdown`, `.performance-table-panel`, `.performance-table-row`.
6. **Historique & Versions (`HistoryPage.jsx`)** :
   - Adapter `.history-kpi-box`, `.history-toolbar`, `.history-search-input input`, `.history-table-panel`, `.history-table-row`, `.history-symbol-tag`, `.history-group-subrows`, `.history-evolution-banner`, `.version-timeline-card`.
7. **Badges Décision Multi-Tiers & Sparklines** :
   - Définir sous `[data-theme="light"]` les couleurs de texte et barres pour `.tier-strong`, `.tier-strategic`, `.tier-moderate` (vert foncé `#065f46`, rouge foncé `#991b1b`).
   - Adapter `.sparkline-badge.positive/.negative/.neutral`.
8. **Cadrage d'Exécution & Calculateur (`ExecutionLevelsCard.jsx`)** :
   - Adapter `.execution-levels-card`, `.order-ticket-dropdown-menu`, `.execution-metric-box`, `.calc-number-input`, `.calc-result-card`.

---

## 5. Verification Method

Pour vérifier de manière indépendante l'absence de régression et la conformité complète :

1. **Suite de tests JavaScript (Intégrité JSX & Routing)** :
   ```bash
   cd /Users/etienne/Documents/ChatGPT/TradingAgents/web_ui && npm test
   ```
   *Critère de succès : 34/34 tests réussis.*

2. **Suite de tests Python (Backend & Modèles)** :
   ```bash
   cd /Users/etienne/Documents/ChatGPT/TradingAgents && .venv/bin/pytest tests/
   ```
   *Critère de succès : 100% tests réussis.*

3. **Build de Production Vite** :
   ```bash
   cd /Users/etienne/Documents/ChatGPT/TradingAgents/web_ui && npm run build
   ```
   *Critère de succès : 0 erreur de compilation.*

4. **Inspection Visuelle des Contrastes (Mode Jour & Mode Nuit)** :
   - Basculer le thème via le bouton de la barre latérale ou des Paramètres (`?page=settings`).
   - Vérifier la parfaite lisibilité du texte du logo "TradingAgents" dans la sidebar.
   - Parcourir les 8 vues : Scanner, Analyse, Résultats, Comparateur, Watchlist, Performance, Historique, Paramètres.
   - Ouvrir la modale Guide (`popover`), le menu Export, et déplier une version antérieure dans l'Historique.
   - Vérifier avec l'inspecteur DevTools qu'aucun texte n'a un ratio de contraste inférieur à 4.5:1 (WCAG AA).
