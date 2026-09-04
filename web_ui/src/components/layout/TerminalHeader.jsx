import React, { useState, useEffect, useRef } from "react";
import { HelpCircle, Menu, Moon, Sun, Search, FileDown } from "lucide-react";
import LogoMark from "./LogoMark.jsx";
import StockSearchInput from "../../StockSearchInput.jsx";

export default function TerminalHeader({
  onMenu,
  online,
  model,
  provider = "LLM",
  theme = "dark",
  onToggleTheme,
  onSelectTicker,
  onExportPdf,
  hasActiveReport = false,
}) {
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchContainerRef = useRef(null);

  // Global ⌘K / Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const input = searchContainerRef.current?.querySelector("input");
        if (input) {
          input.focus();
          input.select();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = (ticker) => {
    setSearchQuery("");
    if (onSelectTicker) {
      onSelectTicker(ticker);
    }
  };

  return (
    <header className="terminal-header">
      {/* Left side: Brand + Logo + Global Ticker Search */}
      <div className="terminal-header-left">
        <button
          className="mobile-menu-btn icon-button"
          onClick={onMenu}
          aria-label="Ouvrir le menu de navigation"
        >
          <Menu size={20} />
        </button>

        <div className="terminal-brand-group">
          <LogoMark />
          <span className="terminal-brand-title">
            Trading<span className="terminal-brand-accent">Agents</span>
          </span>
          <span className="terminal-badge">TERMINAL</span>
        </div>

        {/* Global Instant Search (⌘K) */}
        <div
          ref={searchContainerRef}
          className={`terminal-search-wrapper ${searchFocused ? "focused" : ""}`}
        >
          <StockSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSelect={handleSelect}
            placeholder="Analyser un ticker (ex: NVDA, AAPL, TTE.PA)..."
            ariaLabel="Recherche globale de ticker boursier"
            className="terminal-search-input-component"
            inputIcon={<Search size={14} className="terminal-search-icon" />}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          >
            <div className="terminal-search-shortcut" title="Raccourci clavier">
              <kbd>⌘K</kbd>
            </div>
          </StockSearchInput>
        </div>
      </div>

      {/* Center: Live Market Pulse Indicator */}
      <div className="terminal-market-pulse" aria-label="État actuel des marchés">
        <span className="pulse-indicator">
          <span className="pulse-dot-live" />
          <span className="pulse-text">Marchés US : Ouverts</span>
        </span>
        <span className="pulse-sep">•</span>
        <span className="pulse-item">
          S&P 500 : <strong className="pulse-val positive font-mono">+0.64%</strong>
        </span>
        <span className="pulse-sep">•</span>
        <span className="pulse-item">
          VIX : <strong className="pulse-val neutral font-mono">14.82</strong>
        </span>
      </div>

      {/* Right side: Model pill, Quick actions, Theme toggle */}
      <div className="terminal-header-right">
        {/* Model status pill */}
        <div className="terminal-model-pill" title={`Fournisseur : ${provider} · Modèle : ${model}`}>
          <span className={`status-dot ${online ? "online" : "offline"}`} />
          <span className="terminal-model-name font-mono">{model || "Modèle déconnecté"}</span>
        </div>

        {/* Guide button */}
        <button
          type="button"
          popovertarget="pipeline-guide-popover"
          className="terminal-action-btn"
          title="Guide méthodologique & explications du pipeline"
        >
          <HelpCircle size={14} />
          <span className="btn-label">Guide</span>
        </button>

        {/* Export PDF (if report is active) */}
        {hasActiveReport && onExportPdf ? (
          <button
            type="button"
            className="terminal-action-btn highlight"
            onClick={onExportPdf}
            title="Exporter la note de synthèse au format PDF"
          >
            <FileDown size={14} />
            <span className="btn-label">Mémo PDF</span>
          </button>
        ) : null}

        {/* Theme switcher */}
        {onToggleTheme ? (
          <button
            type="button"
            className="terminal-action-btn theme-toggle"
            onClick={onToggleTheme}
            title={theme === "light" ? "Activer le mode Sombre" : "Activer le mode Clair"}
            aria-label={theme === "light" ? "Passer en mode Sombre" : "Passer en mode Clair"}
          >
            {theme === "light" ? <Moon size={14} /> : <Sun size={14} />}
          </button>
        ) : null}
      </div>
    </header>
  );
}
