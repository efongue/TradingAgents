# Feuille de Route & Évolutions UX Priorisées (TODO)

---

# 🔥 Priorité 1 · Frictions bloquantes & Continuité de flux (À traiter en priorité)

Ces éléments créent une rupture de navigation, un sentiment de blocage ou une perte d'état en cours d'utilisation.

---

### 1.1 [✅ FAIT] Lancement direct d'analyses depuis le Comparateur
* **📌 Constat :** Quand l'utilisateur souhaite comparer deux actions (ex. `NVDA` déjà analysé et `MSFT` non analysé), le comparateur bloquait car aucune analyse de MSFT n'était présente dans l'historique.
* **🎯 Résolu :** Le comparateur affiche désormais les actions non analysées dans une carte dédiée avec bouton d'action immédiat `[ ⚡ Lancer l'analyse de MSFT ]` qui pré-remplit et déclenche l'analyse instantanément.

---

### 1.2 [✅ FAIT] Persistance et visibilité immédiate dans l'Historique lors des scans
* **📌 Constat :** Lors d'un scan multi-actions (ex. CRM, MSFT, AAPL), quand les deux premières valeurs ont terminé leur analyse, elles n'étaient pas immédiatement visibles dans la page Historique tant que le lot complet n'avait pas fini.
* **🎯 Résolu :** Chaque titre analysé est sauvegardé instantanément en base locale (`data/reports/{id}/result.json` + `data/history.json`) et l'Historique s'actualise au fil de l'eau en direct pendant le déroulement du scan.

---

### 1.3 [✅ FAIT] Suivi immersif du déroulement en direct dans le Scanner de marché
* **📌 Constat :** L'analyse unitaire disposait du composant immersif `Workflow`, alors que le Scanner était restreint à une barre de progression globale.
* **🎯 Résolu :** Intégration modulaire du composant `<Workflow />` en direct pour le titre actif dans le Scanner, avec bascule fluide, étapes en temps réel, tokens et contrôle d'affichage.

---

### 1.4 [✅ FAIT] Bandeau persistant de reprise automatique lors du rechargement
* **📌 Constat :** Si l'utilisateur changeait d'onglet ou actualisait sa page pendant qu'une analyse ou un scan tournait, aucun retour visuel clair n'indiquait la progression en arrière-plan.
* **🎯 Résolu :** Bandeau flottant persistant haute visibilité (`ActiveExecutionBanner`) affichant l'état en direct et proposant un bouton d'action immédiat `[ ⚡ Reprendre le direct ]` ou `[ 🔍 Suivre le scan ]` depuis n'importe quel écran de l'application.

---

### 1.5 [✅ FAIT] Autocomplétion tolérante et validation des symboles bruts
* **📌 Constat :** Si l'utilisateur tapait un ticker international ou non préenregistré (ex. `ASML.AS`, `SAP.DE`, `NOVO-B.CO`, `2330.TW`), l'autocomplétion masquait le menu et pouvait laisser penser à tort que le titre était inaccessible.
* **🎯 Résolu :** Intégration dans `StockSearchInput` d'une option dédiée immédiate `[ ⚡ Valider le symbole brut "{TICKER}" via Yahoo Finance ]` compatible avec tous les symboles mondiaux sur les pages Analyse, Comparateur et Watchlist.

---

# ⚡ Priorité 2 · Ergonomie opérationnelle, Passage à l'action & Réduction du risque (Court terme)

Ces éléments améliorent la prise de décision, accélèrent le passage d'ordres et préviennent les erreurs de trading.

---

### 2.1 [✅ FAIT] Bouton de copie rapide du ticket d'ordre pour le courtier
* **📌 Constat :** Après lecture du rapport, l'utilisateur devait recopier manuellement les 3 niveaux clés (Entrée, Objectif, Stop-loss) dans son application de courtage.
* **🎯 Résolu :** Intégration dans `ExecutionLevelsCard` d'un bouton de copie multi-formats avec retour visuel immédiat (Format Universel Courtier, Format Bracket Interactive Brokers TWS, et Format JSON API).

---

### 2.2 Mini-calculateur de taille de position et Money Management
* **📌 Constat :** Le plan de trade propose des niveaux de prix, mais l'utilisateur doit calculer lui-même à la main le nombre d'actions à acheter pour respecter son risque de capital (ex. 1 % de 10 000 $).
* **🎯 Objectif :** Obtenir instantanément le nombre exact d'actions à commander selon son capital.
* **🛠️ Implémentation :** Curseur interactif dans la carte Trader : `Capital : 10 000 $ · Risque : 1 % (100 $) ➔ Acheter 9 actions (Exposition : 2 051 $)`.

---

### 2.3 Suggestions de paires sectorielles intelligentes dans le Comparateur
* **📌 Constat :** Le bouton `[ Comparer ]` sur un rapport ouvre le comparateur sans pré-remplir de pair logique.
* **🎯 Objectif :** Proposer des comparaisons sectorielles instantanées en 1 clic (ex. `NVDA` $\rightarrow$ suggérer `AMD`, `MSFT`, `TSM` ; `MC.PA` $\rightarrow$ `RMS.PA`, `KER.PA`).
* **🛠️ Implémentation :** Table de correspondance sectorielle dynamique injectée dans le comparateur.

---

### 2.4 Indicateur de fraîcheur et ré-analyse dans la Watchlist
* **📌 Constat :** Les actions de la Watchlist affichent leur dernière décision sans préciser si de nouvelles séances boursières sont intervenues depuis.
* **🎯 Objectif :** Offrir une visibilité claire sur l'ancienneté du signal et permettre une mise à jour en 1 clic.
* **🛠️ Implémentation :** Badge de fraîcheur `Analysé il y a 7 jours` avec bouton d'actualisation directe sur la ligne.

---

### 2.5 Alerte sur le calendrier des résultats trimestriels (Earnings Calendar)
* **📌 Constat :** Acheter une action 24h avant la publication de ses résultats trimestriels expose à un gap imprévisible de ±15 %.
* **🎯 Objectif :** Avertir l'investisseur de la proximité d'une annonce majeure.
* **🛠️ Implémentation :** Récupération de la date d'annonce via Yahoo Finance et affichage d'un badge : `📅 Résultats dans 3 jours (29 août) · Prudence sur le risque`.

---

### 2.6 Suppression et archivage sélectifs dans l'Historique
* **📌 Constat :** Impossible de supprimer une seule analyse de test sans effacer manuellement des dossiers dans le terminal.
* **🎯 Objectif :** Permettre le nettoyage et l'organisation propre de son historique.
* **🛠️ Implémentation :** Bouton `[ 🗑️ Supprimer de l'historique ]` avec modal de confirmation.

---

### 2.7 Notification et titre dynamique d'onglet navigateur
* **📌 Constat :** L'utilisateur change fréquemment d'onglet pendant les calculs longs (1 à 2 min) et ne sait pas quand l'analyse s'achève.
* **🎯 Objectif :** Informer l'utilisateur sans qu'il ait besoin de surveiller fixement la page.
* **🛠️ Implémentation :** Mise à jour du `document.title` (`🟢 Prêt : NVDA · TradingAgents`) et notifications Web natives optionnelles.

---

### 2.8 Clarté des options de lancement avec durée estimée
* **📌 Constat :** Le terme *« 1 tour, 2 tours, 3 tours »* n'explicite pas la différence d'effort et de temps d'attente.
* **🎯 Objectif :** Rendre les options compréhensibles immédiatement.
* **🛠️ Implémentation :** Libellés explicites : `Rapide (~45s)`, `Standard (~1m30)`, `Approfondie (Débat contradictoire ~3 min)`.

---

# ✨ Priorité 3 · Enrichissement fonctionnel, Analyse avancée & Confort (Moyen terme)

Ces éléments apportent du confort visuel, de la personnalisation et des fonctionnalités d'analyse plus poussées.

---

### 3.1 Graphique en chandeliers interactif avec niveaux tracés
* **📌 Constat :** Les niveaux de prix sont purement textuels sans repère graphique sur l'action des cours.
* **🎯 Objectif :** Visualiser le plan de trade directement sur les bougies de cours.
* **🛠️ Implémentation :** Intégration d'un graphique léger (*TradingView Lightweight Charts*) avec lignes automatiques TP (vert), Entrée (bleu), SL (rouge).

---

### 3.2 Export de données au format tableur (CSV / Excel)
* **📌 Constat :** Les investisseurs qui gèrent leur suivi sur tableur ne peuvent pas exporter leurs tableaux en format brut.
* **🎯 Objectif :** Permettre le téléchargement des données (Historique, Watchlist, Scanner) en CSV.
* **🛠️ Implémentation :** Bouton `[ 📥 Exporter en CSV ]` générant les colonnes financières standard.

---

### 3.3 Micro-infobulles pédagogiques sur les indicateurs financiers
* **📌 Constat :** Des termes comme `RSI 68`, `ATR 8.40 $`, `P/E 26x` peuvent dérouter un investisseur débutant.
* **🎯 Objectif :** Rendre la finance accessible sans encombrer les synthèses.
* **🛠️ Implémentation :** Pastilles interactives avec infobulles explicatives au survol.

---

### 3.4 Dossiers thématiques dans la Watchlist
* **📌 Constat :** Dès que la Watchlist dépasse 15 titres, les styles d'investissement se mélangent.
* **🎯 Objectif :** Structurer sa surveillance par portefeuille thématique.
* **🛠️ Implémentation :** Onglets personnalisables (`Tech Croissance`, `Dividendes PEA`, `Cibles du mois`).

---

### 3.5 Indicateur d'état du marché (Horaires / Week-end)
* **📌 Constat :** Lors d'une consultation le week-end, l'utilisateur débutant peut s'interroger sur l'actualité des cours.
* **🎯 Objectif :** Préciser l'état d'ouverture de la place financière concernée.
* **🛠️ Implémentation :** Badge `⚪ Marché fermé · Dernière clôture officielle du vendredi 28 août`.

---

### 3.6 Raccourci clavier universel de recherche rapide (`Cmd + K`)
* **📌 Constat :** La navigation souris ralentit les utilisateurs fréquents.
* **🎯 Objectif :** Ouvrir une palette de recherche instantanée depuis n'importe quelle page.
* **🛠️ Implémentation :** Écouteur global de `Cmd + K` / `Ctrl + K`.

---

### 3.7 Qualification explicite des places de cotation (Paris PEA vs Wall Street ADR)
* **📌 Constat :** Risque de confondre une action cotée à Paris (`TTE.PA` en €) et son ADR à New York (`TTE` en $).
* **🎯 Objectif :** Afficher des pastilles fiscales claires dans la recherche (`[ 🇫🇷 PEA · € ]` vs `[ 🇺🇸 NYSE · $ ]`).

---

### 3.8 Commutateur Thème Clair / Thème Sombre (Light / Dark Mode)
* **📌 Constat :** L'application est exclusivement sombre, ce qui peut gêner en plein jour ou pour l'impression.
* **🎯 Objectif :** Offrir le choix de confort visuel.
* **🛠️ Implémentation :** Basculeur `[ ☀️ / 🌙 ]` avec persistance `localStorage`.

---

### 3.9 Suivi en direct du P&L sur les analyses passées (Live Tracking)
* **📌 Constat :** Les anciens rapports affichent le cours d'entrée initial sans indiquer la progression actuelle.
* **🎯 Objectif :** Visualiser où se situe le cours d'aujourd'hui par rapport à la cible.
* **🛠️ Implémentation :** Jauge dynamique : `Cours actuel : 238,50 $ · Progression : +4,6 % vers l'objectif (255 $)`.

---

### 3.10 Fiabilisation du rendu d'impression PDF
* **📌 Constat :** L'export PDF navigateur peut perdre les contrastes sombres si les graphismes d'arrière-plan sont désactivés.
* **🎯 Objectif :** Forcer un rendu net quel que soit le navigateur.
* **🛠️ Implémentation :** Règles CSS `@media print` avec `-webkit-print-color-adjust: exact`.

---

### 3.11 Indicateur d'activité et de débit du modèle local
* **📌 Constat :** Lors d'un calcul local long, l'utilisateur ne sait pas si le LLM tourne ou si la mémoire est saturée.
* **🎯 Objectif :** Retour visuel en direct sur l'inférence.
* **🛠️ Implémentation :** Statut temps réel : `Modèle local actif · 18 tokens/sec · Échange 4/8...`.

---

### 3.12 Frise temporelle d'évolution des thèses (Time Travel)
* **📌 Constat :** Les analyses successives d'une même valeur ne montrent pas l'évolution du raisonnement dans le temps.
* **🎯 Objectif :** Visualiser le renforcement ou le pivot de la décision.
* **🛠️ Implémentation :** Frise chronologique : `15 août : Achat (210 $) ➔ 28 août : Surpondérer (227 $)`.

---

### 3.13 Pause / Reprise d'un scan multi-actions
* **📌 Constat :** Un scan de 10 valeurs monopolise la machine sans possibilité de suspension temporaire.
* **🎯 Objectif :** Pouvoir suspendre et reprendre l'exécution à tout moment.
* **🛠️ Implémentation :** Contrôles `[ ⏸️ Mettre en pause ]` et `[ ▶️ Reprendre ]` dans le Scanner.

---

### 3.14 Déduction fiscale et frais de courtage dans le Simulateur
* **📌 Constat :** Le simulateur affiche des gains bruts sans tenir compte du régime fiscal.
* **🎯 Objectif :** Évaluer son rendement net réel en poche.
* **🛠️ Implémentation :** Sélecteur `[ Mode PEA (0 % impôt) ]` / `[ Mode CTO (Flat Tax 30 %) ]`.

---

### 3.15 Alerte de détachement de dividende
* **📌 Constat :** Le détachement d'un coupon fait chuter mécaniquement le cours, créant une fausse alerte de support.
* **🎯 Objectif :** Prévenir de la baisse technique liée au dividende.
* **🛠️ Implémentation :** Mention : `💰 Détachement dividende (2,10 €) le 12/09 · Ajustement de cours normal`.

---

### 3.16 Indicateur de concentration sectorielle
* **📌 Constat :** L'accumulation de valeurs du même secteur crée un faux sentiment de diversification.
* **🎯 Objectif :** Alerter sur le risque de corrélation de son portefeuille.
* **🛠️ Implémentation :** Jauge de répartition : `⚠️ Portefeuille concentré à 85 % sur les Semi-conducteurs`.

---

### 3.17 Mode "Remonter le temps" (Backtesting à date passée)
* **📌 Constat :** Une analyse lancée sur une date passée n'affiche pas la trajectoire réelle constatée depuis.
* **🎯 Objectif :** Comparer la recommandation de l'époque avec la réalité des marchés.
* **🛠️ Implémentation :** Encadré de confrontation : `Recommandation IA (15/01/2024) : Achat à 150 $ ➔ Réalisé : 227 $ (+51 %)`.

---

### 3.18 Guide et bouton de démonstration au premier lancement (Onboarding)
* **📌 Constat :** À la première ouverture, l'application est vierge.
* **🎯 Objectif :** Découverte instantanée des capacités du système.
* **🛠️ Implémentation :** Bouton d'accueil démonstratif : `[ 🚀 Charger un rapport de démonstration complet (NVDA) ]`.

---

### 3.19 Paramétrage interactif des profils d'inférence du modèle IA
* **📌 Constat :** La page *Paramètres & IA* est en consultation seule.
* **🎯 Objectif :** Choisir la sensibilité de l'IA directement depuis l'interface.
* **🛠️ Implémentation :** Profils sélectionnables (*Rapide, Analytique, Exploratoire*).

---

### 3.20 Export d'infographie image (PNG) pour partage direct
* **📌 Constat :** Le partage par messagerie d'un mémo PDF est peu adapté aux smartphones.
* **🎯 Objectif :** Générer une fiche synthétique au format image en 1 clic.
* **🛠️ Implémentation :** Bouton `[ 📸 Exporter la fiche en PNG ]`.
