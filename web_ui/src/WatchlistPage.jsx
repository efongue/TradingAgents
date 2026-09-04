import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  Eye,
  LayoutGrid,
  List,
  Play,
  Plus,
  Scale,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { getCompanyName, getCurrencySymbol } from "./companyNames.js";
import StockSearchInput from "./StockSearchInput.jsx";
import { getDecisionTone, formatDecisionLabel, getDecisionStrength, isPositiveDecision, formatDateFr } from "./decisionUtils.js";
import DecisionBadge from "./DecisionBadge.jsx";
import Sparkline from "./Sparkline.jsx";
import {
  useWatchlist,
  getStoredWatchlist,
  saveStoredWatchlist,
  isInWatchlist,
  removeFromWatchlist,
  toggleWatchlist,
  addToWatchlist,
} from "./hooks/useWatchlist.js";

export {
  getStoredWatchlist,
  saveStoredWatchlist,
  isInWatchlist,
  removeFromWatchlist,
  toggleWatchlist,
  addToWatchlist,
};

export default function WatchlistPage({
  history = [],
  onOpenAnalysis,
  onAnalyzeTicker,
  onCompareTicker,
  onCompareTickers,
}) {
  const { watchlist: items, addToWatchlist: add, removeFromWatchlist: remove } = useWatchlist();
  const [newSymbol, setNewSymbol] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"
  const [filterAlertsOnly, setFilterAlertsOnly] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    const symbol = newSymbol.trim().toUpperCase();
    if (!symbol) return;
    add(symbol);
    setNewSymbol("");
  };

  const handleRemove = (symbol) => {
    remove(symbol);
  };

  const handleQuickAdd = (symbol) => {
    add(symbol);
  };

  // Correlate Watchlist items with actual historical analysis runs
  const enrichedItems = useMemo(() => {
    const historyList = Array.isArray(history) ? history : [];
    return items.map((item) => {
      const sym = (item.symbol || item.ticker || "").toUpperCase();
      const matchAnalyses = historyList
        .filter((h) => (h.ticker || "").toUpperCase() === sym)
        .sort((a, b) => new Date(b.analysis_date || b.created_at || 0) - new Date(a.analysis_date || a.created_at || 0));

      const latest = matchAnalyses[0] || null;
      const previous = matchAnalyses[1] || null;

      const latestDecision = latest?.display_decision || latest?.result?.display_decision || item.last_decision || "À analyser";
      const latestPrice = latest?.snapshot?.close || latest?.result?.snapshot?.close || latest?.verified_close || null;
      const latestConfidence = latest?.confidence || latest?.result?.confidence || null;
      const latestDate = latest?.analysis_date || latest?.created_at || item.added_at;
      const sparkline = latest?.sparkline || (latest?.snapshot?.history ? latest.snapshot.history.map((h) => h.close) : null);

      let signalChanged = false;
      let prevDecision = null;

      if (
        latest &&
        previous &&
        latest.display_decision &&
        previous.display_decision &&
        latest.display_decision.trim().toUpperCase() !== previous.display_decision.trim().toUpperCase()
      ) {
        signalChanged = true;
        prevDecision = previous.display_decision;
      }

      return {
        ...item,
        symbol: sym,
        ticker: sym,
        latest,
        previous,
        latestDecision,
        latestPrice,
        latestConfidence,
        latestDate,
        sparkline,
        signalChanged,
        prevDecision,
      };
    });
  }, [items, history]);

  const signalAlertsCount = enrichedItems.filter((i) => i.signalChanged).length;

  const filteredItems = useMemo(() => {
    let result = enrichedItems;
    if (filterAlertsOnly) {
      result = result.filter((item) => item.signalChanged);
    }
    if (!searchFilter.trim()) return result;
    const q = searchFilter.trim().toUpperCase();
    return result.filter(
      (item) =>
        item.symbol.includes(q) ||
        (getCompanyName(item.symbol) && getCompanyName(item.symbol).toUpperCase().includes(q)) ||
        (item.note && item.note.toUpperCase().includes(q))
    );
  }, [enrichedItems, searchFilter, filterAlertsOnly]);

  const bullishCount = enrichedItems.filter((item) => {
    return isPositiveDecision(item.latestDecision);
  }).length;

  return (
    <main className="page watchlist-page">
      <div className="page-heading">
        <div>
          <h1>Watchlist & Portefeuille de Surveillance</h1>
          <p>Supervisez vos positions clés, suivez les alertes de changement de signal et relancez vos analyses d'un clic.</p>
        </div>
        {items.length >= 2 ? (() => {
          const analyzedItems = items.filter((i) => Boolean(i.latest) || (i.last_decision && i.last_decision !== "À analyser"));
          const canCompareWatchlist = analyzedItems.length >= 2;
          return (
            <button
              type="button"
              className="secondary-button"
              disabled={!canCompareWatchlist}
              onClick={() => {
                if (!canCompareWatchlist) return;
                const top = analyzedItems.slice(0, 3).map((i) => i.symbol || i.ticker);
                if (onCompareTickers) onCompareTickers(top);
                else if (onCompareTicker) onCompareTicker(top[0]);
              }}
              title={canCompareWatchlist ? `Comparer le Top ${Math.min(3, analyzedItems.length)} des titres analysés` : "Au moins 2 titres doivent être analysés pour pouvoir les comparer"}
            >
              <Scale size={16} /> Comparer {canCompareWatchlist ? `le Top ${Math.min(3, analyzedItems.length)}` : "(2 requises)"}
            </button>
          );
        })() : null}
      </div>

      {/* Summary KPI Strip */}
      <section className="watchlist-kpi-strip">
        <div className="watchlist-kpi-box">
          <Bookmark size={20} className="kpi-icon" />
          <div>
            <span className="kpi-label">Titres Surveillés</span>
            <strong className="kpi-value">{items.length}</strong>
          </div>
        </div>
        <div className="watchlist-kpi-box">
          <TrendingUp size={20} className="kpi-icon positive" />
          <div>
            <span className="kpi-label">Signaux Haussiers</span>
            <strong className="kpi-value positive">{bullishCount} / {items.length}</strong>
          </div>
        </div>
        <div
          className={`watchlist-kpi-box ${signalAlertsCount > 0 ? "highlight-alert" : ""}`}
          style={{ cursor: signalAlertsCount > 0 ? "pointer" : "default" }}
          onClick={() => signalAlertsCount > 0 && setFilterAlertsOnly(!filterAlertsOnly)}
          title={signalAlertsCount > 0 ? "Cliquer pour filtrer les signaux modifiés" : ""}
        >
          <Zap size={20} className={`kpi-icon ${signalAlertsCount > 0 ? "warning-pulse" : ""}`} />
          <div>
            <span className="kpi-label">Variations de Signal</span>
            <strong className={`kpi-value ${signalAlertsCount > 0 ? "alert" : ""}`}>
              {signalAlertsCount > 0 ? `${signalAlertsCount} Alerte${signalAlertsCount > 1 ? "s" : ""}` : "Aucun changement"}
            </strong>
          </div>
        </div>
      </section>

      {/* Controls: Search, Add & View Switcher */}
      <section className="watchlist-controls-panel">
        <form onSubmit={handleAdd} className="watchlist-add-form">
          <StockSearchInput
            value={newSymbol}
            onChange={(sym) => setNewSymbol(sym)}
            onSelect={(stock) => {
              add(stock.ticker);
              setNewSymbol("");
            }}
            placeholder="Ajouter une action (ex: LVMH, TSLA, Sanofi, MSFT)..."
            inputIcon={<Plus size={16} className="input-icon" />}
            className="watchlist-search-wrapper"
            inputClassName="watchlist-input"
          >
            <button type="submit" className="primary-button" disabled={!newSymbol.trim()}>
              Ajouter
            </button>
          </StockSearchInput>
        </form>

        <div className="watchlist-quick-chips">
          <span>Suggestions :</span>
          {[
            { ticker: "AMZN", label: "AMZN · Amazon" },
            { ticker: "GOOGL", label: "GOOGL · Alphabet" },
            { ticker: "META", label: "META · Meta" },
            { ticker: "TSLA", label: "TSLA · Tesla" },
            { ticker: "MC.PA", label: "LVMH" },
            { ticker: "SAN.PA", label: "Sanofi" },
          ].map((item) => (
            <button
              key={item.ticker}
              type="button"
              className="chip-button"
              onClick={() => handleQuickAdd(item.ticker)}
            >
              + {item.label}
            </button>
          ))}
        </div>

        <div className="watchlist-view-switcher">
          {filterAlertsOnly ? (
            <button
              type="button"
              className="chip-button active-filter"
              onClick={() => setFilterAlertsOnly(false)}
            >
              <X size={12} /> Voir tous les titres
            </button>
          ) : null}

          {items.length > 3 ? (
            <div className="watchlist-filter-box">
              <Search size={14} />
              <input
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Filtrer..."
              />
              {searchFilter ? (
                <button type="button" onClick={() => setSearchFilter("")}>
                  <X size={12} />
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="view-toggle-group">
            <button
              type="button"
              className={viewMode === "cards" ? "active" : ""}
              onClick={() => setViewMode("cards")}
              title="Vue Grille de Cartes"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              className={viewMode === "table" ? "active" : ""}
              onClick={() => setViewMode("table")}
              title="Vue Tableau Pro"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      {filteredItems.length === 0 ? (
        <div className="empty-state watchlist-empty-state">
          <Bookmark size={36} />
          <strong>
            {filterAlertsOnly
              ? "Aucune variation de signal détectée"
              : searchFilter
              ? "Aucun titre ne correspond à votre filtre"
              : "Votre Watchlist est vide"}
          </strong>
          <span>
            {filterAlertsOnly
              ? "Tous les titres surveillés conservent leur posture établie lors des dernières analyses."
              : searchFilter
              ? "Essayez un autre symbole ou réinitialisez le champ de recherche."
              : "Ajoutez vos premières actions pour suivre leurs signaux et lancer vos analyses d'un clic."}
          </span>
          {!searchFilter && !filterAlertsOnly ? (
            <div style={{ marginTop: "14px", display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
              {["NVDA", "MSFT", "AAPL", "MC.PA"].map((sym) => (
                <button
                  key={sym}
                  type="button"
                  className="chip-button"
                  onClick={() => handleQuickAdd(sym)}
                >
                  + {sym}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : viewMode === "table" ? (
        /* PRO TABLE VIEW */
        <section className="watchlist-table-panel">
          <table className="watchlist-table">
            <thead>
              <tr>
                <th>Symbole / Entreprise</th>
                <th>Dernière Décision</th>
                <th>Alerte Signal</th>
                <th>Cours Vérifié</th>
                <th>Tendance (30 j)</th>
                <th>Dernière Analyse</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const currency = getCurrencySymbol(item.symbol);

                return (
                  <tr key={item.symbol}>
                    <td>
                      <div className="watchlist-table-symbol">
                        <strong>{item.symbol}</strong>
                        {getCompanyName(item.symbol, true) ? (
                          <small className="table-company-sub" style={{ color: "var(--muted)", fontSize: "11px", marginLeft: "6px", fontWeight: "500" }}>
                            {getCompanyName(item.symbol, true)}
                          </small>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <DecisionBadge decision={item.latestDecision} size="sm" />
                    </td>
                    <td>
                      {item.signalChanged ? (
                        <span className="signal-alert-pill" title={`Signal précédent : ${item.prevDecision}`}>
                          <Zap size={12} /> {item.prevDecision} <ArrowRight size={10} /> {item.latestDecision}
                        </span>
                      ) : (
                        <span className="muted-text" style={{ fontSize: "12px" }}>Stable</span>
                      )}
                    </td>
                    <td>
                      {item.latestPrice ? (
                        <strong style={{ fontFamily: "var(--font-mono, monospace)" }}>
                          {item.latestPrice} {currency}
                        </strong>
                      ) : (
                        <span className="muted-text">—</span>
                      )}
                    </td>
                    <td>
                      {item.sparkline && item.sparkline.length > 1 ? (
                        <Sparkline data={item.sparkline} width={75} height={20} />
                      ) : (
                        <span className="muted-text">—</span>
                      )}
                    </td>
                    <td>
                      <span className="watchlist-table-date">{formatDateFr(item.latestDate)}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="watchlist-row-actions">
                        {item.latest && onOpenAnalysis ? (
                          <button
                            type="button"
                            className="secondary-button compact"
                            onClick={() => onOpenAnalysis(item.latest)}
                            title="Consulter le dernier rapport complet"
                          >
                            <Eye size={13} /> Consulter
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="primary-button compact"
                          onClick={() => onAnalyzeTicker(item.symbol)}
                          title={item.latest ? `Analyser ${item.symbol}` : `Lancer le premier audit pour ${item.symbol}`}
                        >
                          <Play size={13} fill="currentColor" /> {item.latest ? "Analyser" : "Premier audit"}
                        </button>
                        <button
                          type="button"
                          className="secondary-button compact"
                          onClick={() => onCompareTicker(item.symbol)}
                          title="Comparer"
                        >
                          <Scale size={13} />
                        </button>
                        <button
                          type="button"
                          className="icon-button compact-remove"
                          onClick={() => handleRemove(item.symbol)}
                          title={`Retirer ${item.symbol}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ) : (
        /* CARDS GRID VIEW */
        <div className="watchlist-grid">
          <AnimatePresence>
            {filteredItems.map((item) => {
              const decision = item.latestDecision;
              const tone = getDecisionTone(decision);
              const strength = getDecisionStrength(decision);
              const currency = getCurrencySymbol(item.symbol);

              return (
                <motion.article
                  key={item.symbol}
                  className={`watchlist-card ${tone} tier-${strength.tier}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  whileHover={{ y: -3 }}
                >
                  {item.signalChanged ? (
                    <div className="watchlist-signal-alert-banner">
                      <Zap size={13} />
                      <span>
                        Signal modifié : <strong>{item.prevDecision}</strong> <ArrowRight size={11} /> <strong>{item.latestDecision}</strong>
                      </span>
                    </div>
                  ) : null}

                  <div className="watchlist-card-top">
                    <div>
                      <div className="watchlist-symbol-row">
                        <h2>{item.symbol}</h2>
                        {getCompanyName(item.symbol) ? (
                          <span className="watchlist-company-sub" style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "500" }}>
                            {getCompanyName(item.symbol)}
                          </span>
                        ) : null}
                      </div>
                      <span className="watchlist-added-date">Dernière maj : {formatDateFr(item.latestDate)}</span>
                    </div>
                    <DecisionBadge decision={decision} size="md" />
                  </div>

                  {item.latestPrice ? (
                    <div className="watchlist-price-strip" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "10px 0 6px" }}>
                      <div>
                        <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>Dernier cours</span>
                        <div style={{ fontSize: "16px", fontWeight: "700", fontFamily: "var(--font-mono, monospace)" }}>
                          {item.latestPrice} {currency}
                        </div>
                      </div>
                      {item.sparkline && item.sparkline.length > 1 ? (
                        <Sparkline data={item.sparkline} width={90} height={26} />
                      ) : null}
                    </div>
                  ) : (
                    <div
                      className="watchlist-unanalyzed-strip"
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 12px",
                        margin: "10px 0 6px",
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px dashed var(--line-soft)",
                        borderRadius: "var(--radius-sm)",
                      }}
                    >
                      <span
                        className="history-model-tag"
                        style={{
                          background: "rgba(148, 163, 184, 0.1)",
                          color: "var(--muted)",
                          border: "1px solid rgba(148, 163, 184, 0.2)",
                          fontSize: "11px",
                        }}
                      >
                        Jamais analysé
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--muted)" }}>Aucun run</span>
                    </div>
                  )}

                  <div className="watchlist-actions">
                    {item.latest && onOpenAnalysis ? (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => onOpenAnalysis(item.latest)}
                        title="Consulter le rapport de l'analyse"
                      >
                        <Eye size={14} /> Consulter
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => onAnalyzeTicker(item.symbol)}
                      title={item.latest ? `Analyser ${item.symbol}` : `Lancer le premier audit pour ${item.symbol}`}
                    >
                      <Play size={14} fill="currentColor" /> {item.latest ? "Analyser" : "Lancer le premier audit"}
                    </button>
                    <button
                      type="button"
                      className="secondary-button icon-only"
                      onClick={() => onCompareTicker(item.symbol)}
                      title={`Comparer ${item.symbol} avec d'autres titres`}
                    >
                      <Scale size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      onClick={() => handleRemove(item.symbol)}
                      title={`Retirer ${item.symbol} de la Watchlist`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </main>
  );
}
