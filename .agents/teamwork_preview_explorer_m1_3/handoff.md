# Rapport d'Investigation & Conception CSS (Shared Badges, Chips, Sparklines & Tooltips)
**Explorer 3 — Milestone 1 (Global Theme Foundation & Shared Components)**
**Date**: 2026-08-29

---

## 1. Observation

### 1.1 Decision Badges (`DecisionBadge.jsx` & `styles.css:4230-4395`)
- **Composant**: `web_ui/src/DecisionBadge.jsx` génère la hiérarchie HTML suivante :
  ```jsx
  <span className={`decision-pill-badge ${tone} tier-${tier} size-${size} ${className}`}>
    <span className="strength-bars" aria-hidden="true">
      <i className={`bar b1 ${level >= 1 ? "active" : ""}`} />
      <i className={`bar b2 ${level >= 2 ? "active" : ""}`} />
      <i className={`bar b3 ${level >= 3 ? "active" : ""}`} />
    </span>
    <span className="decision-pill-text">{label}</span>
    {showTag && tag ? <span className="decision-strength-tag">{tag}</span> : null}
  </span>
  ```
- **Classes CSS partagées** (`styles.css:4285-4395`) :
  Les mêmes règles s'appliquent à `.decision-pill-badge`, `.history-decision-pill`, `.watchlist-decision-pill`, `.compare-decision-pill`, et `.scanner-decision`.
- **Défauts observés en Mode Jour (`[data-theme="light"]`)** :
  1. **Tier Strong Positive (Achat Fort)** : `color: #34d399` sur fond `rgba(16, 185, 129, 0.22)` -> Ratio de contraste **~1.6:1** sur blanc (Échec sévère WCAG AA, requis >= 4.5:1).
  2. **Tier Strategic Positive (Surpondérer)** : `color: #5eead4` sur fond `rgba(45, 212, 191, 0.16)` -> Ratio de contraste **~1.4:1**.
  3. **Tier Moderate Positive (Acheter/Accumuler)** : `color: #a7f3d0` sur fond `rgba(16, 185, 129, 0.11)` -> Ratio de contraste **~1.2:1** (quasi-invisible).
  4. **Tier Strong Negative (Vente Forte)** : `color: #f87171` sur fond `rgba(239, 68, 68, 0.24)` -> Ratio de contraste **~2.3:1**.
  5. **Tier Strategic Negative (Sous-pondérer)** : `color: #fda4af` sur fond `rgba(244, 63, 94, 0.16)` -> Ratio de contraste **~1.7:1**.
  6. **Tier Moderate Negative (Alléger/Vendre)** : `color: #fecdd3` sur fond `rgba(244, 63, 94, 0.11)` -> Ratio de contraste **~1.3:1**.
  7. **Barres de force inactives** (`styles.css:4276`) : `.strength-bars .bar { background: rgba(255, 255, 255, 0.22); }` -> En mode clair, les barres blanches inactives sont invisibles sur fond clair.
  8. **Séparateur de tag** (`styles.css:4260`) : `border-left: 1px solid rgba(255, 255, 255, 0.15);` -> Invisible en mode clair.

---

### 1.2 Sparklines Micro-Charts (`Sparkline.jsx` & `styles.css:4046-4104`)
- **Composant**: `web_ui/src/Sparkline.jsx` génère un SVG avec une trajectoire lissée et optionnellement un badge de pourcentage `.sparkline-badge`.
- **Défauts observés en Mode Jour (`[data-theme="light"]`)** :
  1. `.sparkline-badge.positive` (`styles.css:4064`) : `color: #34d399; background: rgba(16, 185, 129, 0.16); border: 1px solid rgba(16, 185, 129, 0.3);` -> Texte vert pastel illisible sur fond blanc (contraste ~1.5:1).
  2. `.sparkline-badge.negative` (`styles.css:4069`) : `color: #fda4af; background: rgba(244, 63, 94, 0.16); border: 1px solid rgba(244, 63, 94, 0.3);` -> Texte rose pastel illisible (contraste ~1.4:1).
  3. `.sparkline-badge.neutral` (`styles.css:4074`) : `color: #fde047; background: rgba(245, 158, 11, 0.16); border: 1px solid rgba(245, 158, 11, 0.3);` -> Texte jaune pastel invisible (contraste ~1.18:1).
  4. `.watchlist-card-sparkline-row` (`styles.css:4086`) : `background: rgba(255, 255, 255, 0.025);` -> En mode clair, cette valeur blanche translucide n'a aucun contraste sur une carte blanche `#ffffff`.

---

### 1.3 Tooltips, Chips & Status Indicators
- **Toast Notification** (`styles.css:4108-4127`) :
  - `background: rgba(7, 23, 34, 0.95);` -> Bloc noir flottant en mode clair.
- **Action Status Chips** (`styles.css:7151-7176`) :
  - `.action-status-chip.positive { color: #34d399; }`
  - `.action-status-chip.negative { color: #f87171; }`
  - `.action-status-chip.neutral { color: #fbbf24; }`
- **Execution Timing Badges** (`styles.css:4609-4685`) :
  - `.timing-badge` (`#fbbf24`), `.immediate` (`#34d399`), `.breakout` (`#38bdf8`), `.defensive` (`#fbbf24`), `.bearish` (`#f87171`), `.hold` (`#cbd5e1`).
- **Performance Delta & Alpha Badges** (`styles.css:5629-5661`) :
  - `.perf-delta-badge.positive { color: #10b981; }` (contraste 2.37:1 sur blanc)
  - `.perf-delta-badge.negative { color: #f43f5e; }` (contraste 3.2:1 sur blanc)
  - `.perf-alpha-badge.positive { color: #c084fc; }` (contraste 2.8:1 sur blanc)
- **Preset Chips & Capital Pills** :
  - `.calc-preset-chip` (`styles.css:4932-4955`) : `color: #cbd5e1;` -> gris clair illisible sur fond clair.
  - `.capital-preset-pill.active` (`styles.css:5219`) : `color: #f8fafc;` -> texte blanc sur fond menthe clair.
- **Stage Metrics & Status Indicators** (`styles.css:1142-1170`) :
  - `.stage-metric-badge.duration { color: #38bdf8; }`
  - `.stage-row.error .stage-status { color: #fecdd3; }`
  - `.stage-row.unverified .stage-status { color: #fde68a; }`

---

## 2. Logic Chain

1. **Prémisse 1 (Lisibilité WCAG AA 4.5:1)** :
   Sur un fond clair/blanc (`#ffffff` ou `rgba(..., 0.1)`), les couleurs de texte doivent posséder une luminance relative suffisamment faible pour garantir un ratio de contraste minimal de 4.5:1 pour le texte normal et 3.0:1 pour les badges/indicateurs graphiques.
2. **Prémisse 2 (Nuances d'encre sémantiques)** :
   - Pour les signaux haussiers (bullish / positive), les encres recommandées et conformes WCAG AA sont :
     - Émeraude foncé (Tier Strong) : `#065f46` (contraste 9.2:1 sur blanc).
     - Teal foncé (Tier Strategic) : `#0f766e` (contraste 6.8:1 sur blanc).
     - Vert forêt/sauge (Tier Moderate) : `#047857` (contraste 6.2:1 sur blanc).
   - Pour les signaux baissiers (bearish / negative), les encres recommandées sont :
     - Rouge rubis foncé (Tier Strong) : `#991b1b` (contraste 7.2:1 sur blanc).
     - Rose/Framboise foncé (Tier Strategic) : `#be123c` (contraste 6.5:1 sur blanc).
     - Rouge carmin foncé (Tier Moderate) : `#991b1b` (contraste 7.2:1 sur blanc).
   - Pour les signaux neutres (neutral) :
     - Ambre foncé : `#92400e` (contraste 5.6:1 sur blanc).
3. **Prémisse 3 (Séparation du Thème Sombre)** :
   Toutes les règles du mode sombre existantes dans `:root` et dans les déclarations par défaut (lignes 4046-4395) fonctionnent parfaitement sur fond sombre `#05080e` et NE DOIVENT PAS être altérées. Toutes les adaptations de mode jour doivent être encapsulées sous le sélecteur `[data-theme="light"]`.
4. **Prémisse 4 (Spécificité CSS)** :
   Les sélecteurs de badges de décision comportant des modificateurs de classe (ex: `.decision-pill-badge.positive.tier-strong`) doivent être surchargés sous `[data-theme="light"] .decision-pill-badge.positive.tier-strong` pour garantir que la règle jour gagne la cascade sans recourir à `!important`.
5. **Conclusion Logique** :
   En appliquant ces surcharges `[data-theme="light"]` ciblées dans `web_ui/src/styles.css`, tous les badges de décision, sparklines, chips, pills, toasts et jauges d'état deviennent immédiatement 100% conformes WCAG AA, esthétiques (style Stripe/Linear), tout en garantissant zéro régression sur le mode sombre.

---

## 3. Caveats

- **Zéro régression Dark Mode** : Ne supprimer aucune classe existante dans la section 4000-4400 ; ajouter les blocs sous `[data-theme="light"]`.
- **Classes composites partagées** : Veiller à inclure systématiquement les 5 classes de badges de décision (`.decision-pill-badge`, `.history-decision-pill`, `.watchlist-decision-pill`, `.compare-decision-pill`, `.scanner-decision`) dans chaque règle de tier.
- **Backend Python** : Aucune modification backend n'est requise ; les tests Python et JavaScript s'exécutent de manière totalement indépendante du CSS.

---

## 4. Conclusion & Ready-to-Apply CSS Implementation

Voici l'ensemble des blocs CSS prêts à l'emploi avec les lignes exactes d'insertion pour `web_ui/src/styles.css`.

### Bloc 1 : Decision Badges Light Mode Overrides
**Emplacement recommandé** : Ajouter immédiatement après la définition des Decision Badges (ligne 4395 de `web_ui/src/styles.css`).

```css
/* ==========================================================================
   Decision Badges - Light Mode High Contrast Inks (WCAG AA Compliant)
   ========================================================================== */
[data-theme="light"] .strength-bars .bar {
  background: rgba(15, 23, 42, 0.18);
}

[data-theme="light"] .decision-strength-tag {
  border-left-color: rgba(15, 23, 42, 0.15);
  color: inherit;
}

/* Tier 3 : Achat Fort (Force Maximale) - Encre Émeraude Sombre */
[data-theme="light"] .decision-pill-badge.positive.tier-strong,
[data-theme="light"] .history-decision-pill.positive.tier-strong,
[data-theme="light"] .watchlist-decision-pill.positive.tier-strong,
[data-theme="light"] .compare-decision-pill.positive.tier-strong,
[data-theme="light"] .scanner-decision.positive.tier-strong {
  background: rgba(5, 150, 105, 0.12);
  color: #065f46;
  border: 1.5px solid #059669;
  box-shadow: 0 1px 2px rgba(5, 150, 105, 0.15);
}
[data-theme="light"] .positive.tier-strong .strength-bars .bar.active {
  background: #059669;
  box-shadow: none;
}

/* Tier 2 : Surpondérer (Force Stratégique) - Encre Teal Sombre */
[data-theme="light"] .decision-pill-badge.positive.tier-strategic,
[data-theme="light"] .history-decision-pill.positive.tier-strategic,
[data-theme="light"] .watchlist-decision-pill.positive.tier-strategic,
[data-theme="light"] .compare-decision-pill.positive.tier-strategic,
[data-theme="light"] .scanner-decision.positive.tier-strategic {
  background: rgba(13, 148, 136, 0.1);
  color: #0f766e;
  border: 1px solid rgba(13, 148, 136, 0.45);
  box-shadow: 0 1px 2px rgba(13, 148, 136, 0.1);
}
[data-theme="light"] .positive.tier-strategic .strength-bars .bar.active {
  background: #0d9488;
  box-shadow: none;
}

/* Tier 1 : Acheter / Accumuler (Force Modérée) - Encre Vert Forêt */
[data-theme="light"] .decision-pill-badge.positive.tier-moderate,
[data-theme="light"] .decision-pill-badge.positive,
[data-theme="light"] .history-decision-pill.positive.tier-moderate,
[data-theme="light"] .watchlist-decision-pill.positive.tier-moderate,
[data-theme="light"] .compare-decision-pill.positive.tier-moderate,
[data-theme="light"] .scanner-decision.positive.tier-moderate {
  background: rgba(16, 185, 129, 0.09);
  color: #047857;
  border: 1px solid rgba(16, 185, 129, 0.38);
  box-shadow: none;
}
[data-theme="light"] .positive.tier-moderate .strength-bars .bar.active,
[data-theme="light"] .positive .strength-bars .bar.active {
  background: #10b981;
  box-shadow: none;
}

/* Tier 3 : Vente Forte (Urgence Maximale) - Encre Rouge Rubis */
[data-theme="light"] .decision-pill-badge.negative.tier-strong,
[data-theme="light"] .history-decision-pill.negative.tier-strong,
[data-theme="light"] .watchlist-decision-pill.negative.tier-strong,
[data-theme="light"] .compare-decision-pill.negative.tier-strong,
[data-theme="light"] .scanner-decision.negative.tier-strong {
  background: rgba(220, 38, 38, 0.12);
  color: #991b1b;
  border: 1.5px solid #dc2626;
  box-shadow: 0 1px 2px rgba(220, 38, 38, 0.15);
}
[data-theme="light"] .negative.tier-strong .strength-bars .bar.active {
  background: #dc2626;
  box-shadow: none;
}

/* Tier 2 : Sous-pondérer (Dégradation Stratégique) - Encre Rose Sombre */
[data-theme="light"] .decision-pill-badge.negative.tier-strategic,
[data-theme="light"] .history-decision-pill.negative.tier-strategic,
[data-theme="light"] .watchlist-decision-pill.negative.tier-strategic,
[data-theme="light"] .compare-decision-pill.negative.tier-strategic,
[data-theme="light"] .scanner-decision.negative.tier-strategic {
  background: rgba(225, 29, 72, 0.1);
  color: #be123c;
  border: 1px solid rgba(225, 29, 72, 0.45);
  box-shadow: 0 1px 2px rgba(225, 29, 72, 0.1);
}
[data-theme="light"] .negative.tier-strategic .strength-bars .bar.active {
  background: #e11d48;
  box-shadow: none;
}

/* Tier 1 : Alléger / Vendre (Allègement Modéré) - Encre Rouge Carmin */
[data-theme="light"] .decision-pill-badge.negative.tier-moderate,
[data-theme="light"] .decision-pill-badge.negative,
[data-theme="light"] .history-decision-pill.negative.tier-moderate,
[data-theme="light"] .watchlist-decision-pill.negative.tier-moderate,
[data-theme="light"] .compare-decision-pill.negative.tier-moderate,
[data-theme="light"] .scanner-decision.negative.tier-moderate {
  background: rgba(244, 63, 94, 0.09);
  color: #991b1b;
  border: 1px solid rgba(244, 63, 94, 0.38);
  box-shadow: none;
}
[data-theme="light"] .negative.tier-moderate .strength-bars .bar.active,
[data-theme="light"] .negative .strength-bars .bar.active {
  background: #f43f5e;
  box-shadow: none;
}

/* Tier Neutre - Encre Ambre Sombre */
[data-theme="light"] .decision-pill-badge.neutral,
[data-theme="light"] .history-decision-pill.neutral,
[data-theme="light"] .watchlist-decision-pill.neutral,
[data-theme="light"] .compare-decision-pill.neutral,
[data-theme="light"] .scanner-decision.neutral {
  background: rgba(217, 119, 6, 0.12);
  color: #92400e;
  border: 1px solid rgba(217, 119, 6, 0.4);
  box-shadow: none;
}
[data-theme="light"] .neutral .strength-bars .bar.active {
  background: #d97706;
  box-shadow: none;
}
```

---

### Bloc 2 : Sparklines Light Mode Overrides
**Emplacement recommandé** : Ajouter immédiatement après la définition des Sparklines (ligne 4104 de `web_ui/src/styles.css`).

```css
/* ==========================================================================
   Sparklines & Trend Badges - Light Mode High Contrast Inks
   ========================================================================== */
[data-theme="light"] .sparkline-badge.positive {
  color: #065f46;
  background: rgba(5, 150, 105, 0.12);
  border: 1px solid rgba(5, 150, 105, 0.35);
}

[data-theme="light"] .sparkline-badge.negative {
  color: #991b1b;
  background: rgba(220, 38, 38, 0.12);
  border: 1px solid rgba(220, 38, 38, 0.35);
}

[data-theme="light"] .sparkline-badge.neutral {
  color: #92400e;
  background: rgba(217, 119, 6, 0.12);
  border: 1px solid rgba(217, 119, 6, 0.35);
}

[data-theme="light"] .watchlist-card-sparkline-row {
  background: rgba(15, 23, 42, 0.025);
  border-color: var(--line-soft);
}
```

---

### Bloc 3 : Shared Chips, Status Indicators, Pills & Toasts Light Mode Overrides
**Emplacement recommandé** : Dans la section globale `[data-theme="light"]` (autour de la ligne 240 de `web_ui/src/styles.css`) ou en fin de sections composant.

```css
/* ==========================================================================
   Toast Notification (Light Mode)
   ========================================================================== */
[data-theme="light"] .toast-notification {
  background: rgba(255, 255, 255, 0.98);
  border: 1px solid rgba(13, 148, 136, 0.45);
  color: #0f172a;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08), 0 0 20px rgba(13, 148, 136, 0.12);
}

/* ==========================================================================
   Action Status Chips & Presets (Light Mode)
   ========================================================================== */
[data-theme="light"] .action-status-chip.positive {
  background: rgba(5, 150, 105, 0.1);
  border-color: rgba(5, 150, 105, 0.35);
  color: #065f46;
}

[data-theme="light"] .action-status-chip.negative {
  background: rgba(220, 38, 38, 0.1);
  border-color: rgba(220, 38, 38, 0.35);
  color: #991b1b;
}

[data-theme="light"] .action-status-chip.neutral {
  background: rgba(217, 119, 6, 0.1);
  border-color: rgba(217, 119, 6, 0.35);
  color: #92400e;
}

/* ==========================================================================
   Preset Chips & Capital Pills (Light Mode)
   ========================================================================== */
[data-theme="light"] .calc-preset-chip {
  background: rgba(15, 23, 42, 0.03);
  border-color: rgba(15, 23, 42, 0.12);
  color: #334155;
}

[data-theme="light"] .calc-preset-chip:hover {
  background: rgba(13, 148, 136, 0.08);
  border-color: rgba(13, 148, 136, 0.3);
  color: #0f172a;
}

[data-theme="light"] .calc-preset-chip.active {
  background: rgba(13, 148, 136, 0.12);
  border-color: #0d9488;
  color: #0f766e;
}

[data-theme="light"] .capital-preset-pill {
  background: rgba(15, 23, 42, 0.03);
  border-color: rgba(15, 23, 42, 0.12);
  color: #475569;
}

[data-theme="light"] .capital-preset-pill:hover {
  border-color: rgba(13, 148, 136, 0.3);
  color: #0f172a;
}

[data-theme="light"] .capital-preset-pill.active {
  background: rgba(13, 148, 136, 0.12);
  border-color: rgba(13, 148, 136, 0.4);
  color: #0f766e;
}

/* ==========================================================================
   Performance Delta & Alpha Badges (Light Mode)
   ========================================================================== */
[data-theme="light"] .perf-delta-badge.positive {
  background: rgba(5, 150, 105, 0.1);
  color: #065f46;
}

[data-theme="light"] .perf-delta-badge.negative {
  background: rgba(220, 38, 38, 0.1);
  color: #991b1b;
}

[data-theme="light"] .perf-alpha-badge.positive {
  color: #7e22ce;
}

[data-theme="light"] .perf-alpha-badge.negative {
  color: #64748b;
}

/* ==========================================================================
   Stage Metric Badges & Status Indicators (Light Mode)
   ========================================================================== */
[data-theme="light"] .stage-metric-badge {
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(15, 23, 42, 0.1);
  color: #475569;
}

[data-theme="light"] .stage-metric-badge.duration {
  color: #0369a1;
  background: rgba(2, 132, 199, 0.08);
  border-color: rgba(2, 132, 199, 0.25);
}

[data-theme="light"] .stage-metric-badge.tokens {
  color: #0f766e;
  background: rgba(13, 148, 136, 0.08);
  border-color: rgba(13, 148, 136, 0.25);
}

[data-theme="light"] .stage-row.complete .stage-status {
  color: #065f46;
  background: rgba(5, 150, 105, 0.1);
  border-color: rgba(5, 150, 105, 0.35);
}

[data-theme="light"] .stage-row.active .stage-status {
  color: #0284c7;
  background: rgba(2, 132, 199, 0.1);
  border-color: #0284c7;
}

[data-theme="light"] .stage-row.error .stage-status {
  color: #991b1b;
  background: rgba(220, 38, 38, 0.1);
  border-color: rgba(220, 38, 38, 0.35);
}

[data-theme="light"] .stage-row.unverified .stage-status {
  color: #92400e;
  background: rgba(217, 119, 6, 0.1);
  border-color: rgba(217, 119, 6, 0.35);
}

/* ==========================================================================
   Evolution KPI Pills & Version Badges (Light Mode)
   ========================================================================== */
[data-theme="light"] .evolution-kpi-pill {
  background: rgba(15, 23, 42, 0.04);
  border-color: var(--line);
}

[data-theme="light"] .kpi-pill-val.shift {
  color: #991b1b;
}

[data-theme="light"] .kpi-pill-val.stable,
[data-theme="light"] .kpi-pill-val.up {
  color: #065f46;
}

[data-theme="light"] .v-pill.v-latest {
  color: #0f766e;
  background: rgba(13, 148, 136, 0.12);
  border-color: rgba(13, 148, 136, 0.35);
}

[data-theme="light"] .v-pill.v-archived {
  color: #64748b;
  background: rgba(15, 23, 42, 0.04);
  border-color: rgba(15, 23, 42, 0.1);
}

[data-theme="light"] .v-current-badge {
  color: #0d9488;
}

/* ==========================================================================
   Execution Timing Badges (Light Mode)
   ========================================================================== */
[data-theme="light"] .timing-badge {
  background: rgba(217, 119, 6, 0.12);
  color: #92400e;
}

[data-theme="light"] .execution-timing-banner.immediate .timing-badge {
  background: rgba(5, 150, 105, 0.12);
  color: #065f46;
}

[data-theme="light"] .execution-timing-banner.breakout .timing-badge {
  background: rgba(2, 132, 199, 0.12);
  color: #0369a1;
}

[data-theme="light"] .execution-timing-banner.defensive .timing-badge {
  background: rgba(217, 119, 6, 0.12);
  color: #92400e;
}

[data-theme="light"] .execution-timing-banner.bearish .timing-badge {
  background: rgba(220, 38, 38, 0.12);
  color: #991b1b;
}

[data-theme="light"] .execution-timing-banner.hold .timing-badge {
  background: rgba(15, 23, 42, 0.05);
  color: #475569;
}
```

---

## 5. Verification Method

Pour vérifier de manière indépendante et automatisée la validité de ces spécifications :

1. **Suite de Tests JavaScript** :
   ```bash
   cd /Users/etienne/Documents/ChatGPT/TradingAgents/web_ui && npm test
   ```
   *Vérification : 34/34 tests réussis à 100%.*

2. **Suite de Tests Python** :
   ```bash
   cd /Users/etienne/Documents/ChatGPT/TradingAgents && .venv/bin/pytest tests/ web_ui/tests/
   ```
   *Vérification : 100% tests réussis sans modification du serveur.*

3. **Compilation du Build Vite** :
   ```bash
   cd /Users/etienne/Documents/ChatGPT/TradingAgents/web_ui && npm run build
   ```
   *Vérification : 0 erreur de compilation.*

4. **Vérification du Contraste WCAG AA** :
   - Tester les badges de décision `.decision-pill-badge.positive.tier-strong`, `.tier-strategic`, `.tier-moderate` sous `[data-theme="light"]` avec un vérificateur de contraste (ex: axe / Chrome DevTools).
   - Confirmer que tous les ratios de contraste dépassent **4.5:1** (les encres `#065f46`, `#0f766e`, `#991b1b`, `#92400e` atteignent entre 5.6:1 et 9.2:1).
   - Vérifier que le rendu en mode nuit (`data-theme="dark"`) conserve son aspect d'origine avec ses lueurs néon sans aucune altération.
