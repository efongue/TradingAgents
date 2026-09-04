# Orchestration Plan — TradingAgents Light & Dark Theme Harmonization

## Objective
Harmoniser complètement le Mode Jour (Clair) et Mode Nuit (Sombre) sur l'ensemble de la webapp TradingAgents pour éliminer tous les défauts de contraste, textes illisibles, conteneurs sombres résiduels et incohérences visuelles (style SaaS moderne type Linear/Stripe), tout en préservant le mode sombre et en assurant le passage de tous les tests (34 JS, 31 Python) et du build Vite.

## Phases
1. **Survey**: 3 parallel Explorers to analyze theme definitions, CSS variables, hardcoded colors, inline styles, component hierarchy across all 8 views.
2. **Decomposition**: Synthesize Survey into `PROJECT.md` with explicit Feature Inventory and Milestones.
3. **Implementation Track**:
   - Milestone 1: Global Theme System & Shared Components / Base Form Controls (inputs, selects, buttons, modals, tabs)
   - Milestone 2: Core Analysis, Scanner & Form Views (`ScannerPage.jsx`, `scanner.css`, `AnalysisPage.jsx`)
   - Milestone 3: Results, Bento, Reports & Action Plan (`ResultPage.jsx`, `ReportContent.jsx`, `ActionPlanPanel.jsx`)
   - Milestone 4: Auxiliary Views (Comparator, Watchlist, Performance, History, Settings)
4. **E2E Testing Track**:
   - Build comprehensive E2E / regression test verification for light/dark theme contrast, WCAG AA compliance, theme switching, component rendering.
5. **Phase 1 & Phase 2 Final Hardening**:
   - 100% tests passing (JS + Python), Vite build clean, adversarial coverage hardening with Challengers.
6. **Forensic Integrity Verification & Handoff**:
   - Forensic Auditor verification, human report generation.
