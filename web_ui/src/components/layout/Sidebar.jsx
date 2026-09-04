import React from "react";
import {
  Award,
  Bookmark,
  History,
  Scale,
  ScanSearch,
  Settings,
  Sparkles,
  TrendingUp,
  X,
  Sun,
  Moon,
} from "lucide-react";
import LogoMark from "./LogoMark.jsx";

export const NAV_SECTIONS = [
  {
    title: "Recherche & Arbitrage",
    items: [
      { id: "analysis", label: "Nouvelle analyse", icon: TrendingUp },
      { id: "scanner", label: "Scanner de marché", icon: ScanSearch },
      { id: "compare", label: "Comparateur", icon: Scale },
    ],
  },
  {
    title: "Suivi & Portefeuille",
    items: [
      { id: "watchlist", label: "Titres surveillés", icon: Bookmark },
      { id: "performance", label: "Simulateur & Perf", icon: Award },
      { id: "history", label: "Historique", icon: History },
    ],
  },
  {
    title: "Système",
    items: [
      { id: "settings", label: "Paramètres & IA", icon: Settings },
      { id: "landing", label: "Découvrir l'offre", icon: Sparkles },
    ],
  },
];

export default function Sidebar({
  page,
  onPage,
  online,
  model,
  provider,
  analysisActive,
  scanActive,
  open,
  onClose,
  theme = "dark",
  onToggleTheme,
}) {
  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="brand-row">
        <button
          type="button"
          className="brand-link-btn"
          onClick={() => {
            onPage("landing");
            onClose();
          }}
          title="Consulter la présentation du produit"
        >
          <LogoMark />
          <span className="brand">TradingAgents</span>
        </button>
        <button className="mobile-close icon-button" onClick={onClose} aria-label="Fermer le menu">
          <X size={20} />
        </button>
      </div>
      <nav className="primary-nav" aria-label="Navigation principale">
        {NAV_SECTIONS.map((section) => (
          <div className="nav-section-group" key={section.title}>
            <span className="nav-section-title">{section.title}</span>
            {section.items.map(({ id, label, icon: Icon }) => {
              const active = id === "history"
                ? ["history", "history-detail"].includes(page)
                : id === "settings"
                ? ["settings", "models"].includes(page)
                : page === id;
              const visibleLabel = id === "analysis" && analysisActive
                ? "Analyse en cours"
                : id === "scanner" && scanActive
                ? "Scan en cours"
                : label;

              return (
                <button
                  className={`nav-item ${active ? "active" : ""}`}
                  key={id}
                  onClick={() => {
                    onPage(id);
                    onClose();
                  }}
                >
                  <Icon size={19} strokeWidth={1.7} />
                  <span>{visibleLabel}</span>
                  {(id === "analysis" && analysisActive) || (id === "scanner" && scanActive) ? (
                    <span className="nav-progress-badge" aria-hidden="true" />
                  ) : null}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="model-state">
          <div className={`status-dot ${online ? "online" : "offline"}`} />
          <div>
            <strong>{online ? provider : `${provider} hors ligne`}</strong>
            <span>{model || "Modèle non détecté"}</span>
          </div>
        </div>
        <div className="sidebar-footer-bottom">
          <div className="local-note">Passerelle locale</div>
          <div className="sidebar-footer-actions">
            {onToggleTheme ? (
              <button
                type="button"
                className="sidebar-theme-btn"
                onClick={onToggleTheme}
                title={theme === "light" ? "Basculer en mode Nuit (Sombre)" : "Basculer en mode Jour (Clair)"}
                aria-label={theme === "light" ? "Basculer en mode Nuit" : "Basculer en mode Jour"}
              >
                {theme === "light" ? <Moon size={12} /> : <Sun size={12} />}
                <span className="theme-name">{theme === "light" ? "Nuit" : "Jour"}</span>
              </button>
            ) : null}
            <button
              type="button"
              className="sidebar-lang-btn"
              title="Langue : Français (actif) · Sélecteur multilingue à venir"
              aria-label="Langue : Français"
            >
              <span className="lang-flag" role="img" aria-label="Drapeau français">🇫🇷</span>
              <span className="lang-code">FR</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
