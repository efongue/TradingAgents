# Original User Request

## 2026-08-29T21:40:10Z

Refonte et harmonisation complète du Mode Jour (Clair) et Mode Nuit (Sombre) sur l'ensemble de la webapp TradingAgents pour éliminer tous les défauts de contraste, textes illisibles, conteneurs sombres résiduels et incohérences visuelles (style SaaS moderne type Linear/Stripe).

Working directory: /Users/etienne/Documents/ChatGPT/TradingAgents
Integrity mode: development

## Requirements

### R1. Élimination des couleurs sombres codées en dur & Unification CSS
Remplacer toutes les couleurs sombres codées en dur (ex: `#060a0f`, `#05080e`, `#080d14`, `rgba(0,0,0,...)`) dans les formulaires, cartes, sélecteurs, tableaux et en-têtes par les variables de thème sémantiques (`--bg`, `--surface`, `--surface-2`, `--surface-3`, `--text`, `--text-secondary`, `--muted`, `--line`, `--line-soft`).

### R2. Refonte du Mode Jour (Light Theme) sur l'ensemble des 8 vues
- **Scanner (`ScannerPage.jsx` & `scanner.css`)** : Titres visibles et contrastés, cartes de configuration et de déroulement sur fond blanc/surface claire avec bordures douces, inputs/selects avec fond blanc et texte sombre, tableau de classement lisible avec contrastes de texte conformes WCAG AA.
- **Analyse & Formulaire (`AnalysisPage.jsx`)** : Inputs, menus déroulants, sélecteurs de profondeur et boutons harmonisés en mode clair.
- **Résultats & Bento (`ResultPage.jsx`, `ReportContent.jsx`, `ActionPlanPanel.jsx`)** : Onglets, cartes de synthèse, cartes d'ordres et sections bento parfaitement contrastés.
- **Comparateur, Watchlist, Performance, Historique & Paramètres** : Harmonisation des tableaux, sparklines, jauges et barres d'outils.

### R3. Préservation et perfectionnement du Mode Nuit (Dark Theme)
Garantir que le mode nuit conserve son rendu sombre haute visibilité et ses lueurs néon sans aucune régression.

## Acceptance Criteria

### Contrastes & Lisibilité
- [ ] Aucun texte blanc sur fond clair ni texte sombre sur fond noir en mode clair (contraste minimum WCAG AA 4.5:1).
- [ ] Les titres de pages (ex: "Scanner le marché", "Historique & Journal d'Audit") sont parfaitement lisibles dans les deux modes.
- [ ] Tous les champs de saisie, `textarea` et `select` s'affichent avec un fond clair, texte sombre lisible et bordures distinctes en mode jour.

### Intégrité & Cohérence
- [ ] Les 34 tests JavaScript (`npm test`) et 31 tests Python passent à 100% avec succès.
- [ ] Le build de production Vite (`npm run build`) compile avec 0 erreur.
- [ ] Le basculement entre Jour et Nuit se fait de manière instantanée et fluide sur toutes les pages via le bouton de la barre latérale et des paramètres.
- [ ] Ne PAS redémarrer le serveur Python (conserver le démon actif).
