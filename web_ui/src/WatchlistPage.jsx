import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
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
} from "lucide-react";
import { DEMO_ANALYSES } from "./demoData.js";
import { getCompanyName } from "./companyNames.js";
import { getDecisionTone, isPositiveDecision } from "./decisionUtils.js";

const DEFAULT_WATCHLIST = [
  { symbol: "NVDA", added_at: "2026-08-27", last_decision: "ACHETER FORT", note: "Leader calcul accéléré et datacenters" },
  { symbol: "MSFT", added_at: "2026-08-27", last_decision: "ACCUMULER", note: "Monétisation Copilot et Azure Cloud" },
  { symbol: "AAPL", added_at: "2026-08-27", last_decision: "CONSERVER", note: "Division Services et marge brute résiliente" },
];

export function getStoredWatchlist() {
  try {
    const raw = localStorage.getItem("tradingagents_watchlist");
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_WATCHLIST;
}

export function saveStoredWatchlist(items) {
  try {
    localStorage.setItem("tradingagents_watchlist", JSON.stringify(items));
  } catch {
    // ignore
  }
}

export function addToWatchlist(symbol, note = "") {
  const current = getStoredWatchlist();
  const upper = symbol.trim().toUpperCase();
  if (current.some((item) => item.symbol === upper)) return current;
  const updated = [{ symbol: upper, added_at: new Date().toISOString().slice(0, 10), note, last_decision: "À analyser" }, ...current];
  saveStoredWatchlist(updated);
  return updated;
}

export default function WatchlistPage({ onAnalyzeTicker, onCompareTicker, onOpenDemo }) {
  const [items, setItems] = useState(getStoredWatchlist);
  const [newSymbol, setNewSymbol] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [viewMode, setViewMode] = useState("cards"); // "cards" | "table"

  const handleAdd = (e) => {
    e.preventDefault();
    const symbol = newSymbol.trim().toUpperCase();
    if (!symbol) return;
    const updated = addToWatchlist(symbol);
    setItems(updated);
    setNewSymbol("");
  };

  const handleRemove = (symbol) => {
    const updated = items.filter((item) => item.symbol !== symbol);
    setItems(updated);
    saveStoredWatchlist(updated);
  };

  const handleQuickAdd = (symbol) => {
    const updated = addToWatchlist(symbol);
    setItems(updated);
  };

  const filteredItems = useMemo(() => {
    if (!searchFilter.trim()) return items;
    const q = searchFilter.trim().toUpperCase();
    return items.filter((item) => item.symbol.includes(q) || (item.note && item.note.toUpperCase().includes(q)));
  }, [items, searchFilter]);

  const bullishCount = items.filter((item) => {
    const demo = DEMO_ANALYSES[item.symbol];
    const decision = item.last_decision || (demo ? demo.result.display_decision : "");
    return isPositiveDecision(decision);
  }).length;

  return (
    <main className="page watchlist-page">
      <div className="page-heading">
        <div>
          <h1>Watchlist & Portefeuille de Surveillance</h1>
          <p>Supervisez vos positions clés, comparez les signaux des agents et lancez vos analyses en un clic.</p>
        </div>
        {items.length >= 2 ? (
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              const top = items.slice(0, 3).map((i) => i.symbol);
              if (onCompareTicker) onCompareTicker(top[0]);
            }}
          >
            <Scale size={16} /> Comparer le Top 3
          </button>
        ) : null}
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
        <div className="watchlist-kpi-box">
          <Sparkles size={20} className="kpi-icon" />
          <div>
            <span className="kpi-label">Mode Démo Instantané</span>
            <span className="kpi-subtext">3 analyses certifiées pré-chargées</span>
          </div>
        </div>
      </section>

      {/* Controls: Search, Add & View Switcher */}
      <section className="watchlist-controls-panel">
        <form onSubmit={handleAdd} className="watchlist-add-form">
          <div className="watchlist-input-wrapper">
            <Plus size={16} className="input-icon" />
            <input
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
              placeholder="Ajouter un symbole (ex: TSLA, AMZN)..."
              maxLength={15}
            />
          </div>
          <button type="submit" className="primary-button" disabled={!newSymbol.trim()}>
            Ajouter
          </button>
        </form>

        <div className="watchlist-quick-chips">
          <span>Suggestions :</span>
          {[
            { ticker: "AMZN", label: "AMZN · Amazon" },
            { ticker: "GOOGL", label: "GOOGL · Alphabet" },
            { ticker: "META", label: "META · Meta" },
            { ticker: "TSLA", label: "TSLA · Tesla" },
            { ticker: "NFLX", label: "NFLX · Netflix" },
            { ticker: "AMD", label: "AMD · AMD" },
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
        <div className="empty-state">
          <Bookmark size={36} />
          <strong>Aucun titre dans la liste</strong>
          <span>{searchFilter ? "Aucun titre ne correspond à votre filtre." : "Ajoutez des actions pour suivre leurs signaux et lancer vos analyses instantanées."}</span>
        </div>
      ) : viewMode === "table" ? (
        /* PRO TABLE VIEW */
        <section className="watchlist-table-panel">
          <table className="watchlist-table">
            <thead>
              <tr>
                <th>Symbole / Entreprise</th>
                <th>Dernière Décision</th>
                <th>Consensus IA</th>
                <th>Thèse / Note</th>
                <th>Date d'ajout</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const demo = DEMO_ANALYSES[item.symbol];
                const decision = item.last_decision || (demo ? demo.result.display_decision : "À analyser");
                const tone = getDecisionTone(decision);
                const consensus = demo?.result?.consensus || { bullish: 70, neutral: 20, bearish: 10 };

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
                        {demo ? <span className="demo-badge">Certifié</span> : null}
                      </div>
                    </td>
                    <td>
                      <span className={`watchlist-decision-pill ${tone}`}>
                        <i className="status-dot" /> {decision}
                      </span>
                    </td>
                    <td>
                      {demo ? (
                        <div className="watchlist-mini-consensus" title={`${consensus.bullish}% Haussier`}>
                          <div className="mini-bar">
                            <span style={{ width: `${consensus.bullish}%` }} />
                          </div>
                          <span className="mini-label">{consensus.bullish}% Bull</span>
                        </div>
                      ) : (
                        <span className="muted-text">—</span>
                      )}
                    </td>
                    <td>
                      <span className="watchlist-table-note">
                        {item.note || (demo ? demo.result.consensus?.verdict : "Prêt pour analyse.")}
                      </span>
                    </td>
                    <td>
                      <span className="watchlist-table-date">{item.added_at}</span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="watchlist-row-actions">
                        <button
                          type="button"
                          className="primary-button compact"
                          onClick={() => onAnalyzeTicker(item.symbol)}
                        >
                          <Play size={13} fill="currentColor" /> Analyser
                        </button>
                        {demo ? (
                          <button
                            type="button"
                            className="secondary-button compact"
                            onClick={() => onOpenDemo(demo)}
                            title="Voir démo instantanée"
                          >
                            <Sparkles size={13} /> Démo
                          </button>
                        ) : null}
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
              const demo = DEMO_ANALYSES[item.symbol];
              const decision = item.last_decision || (demo ? demo.result.display_decision : "À analyser");
              const tone = getDecisionTone(decision);
              const consensus = demo?.result?.consensus || { bullish: 75, neutral: 15, bearish: 10 };

              return (
                <motion.article
                  key={item.symbol}
                  className={`watchlist-card ${tone}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  whileHover={{ y: -3 }}
                >
                  <div className="watchlist-card-top">
                    <div>
                      <div className="watchlist-symbol-row">
                        <h2>{item.symbol}</h2>
                        {getCompanyName(item.symbol) ? (
                          <span className="watchlist-company-sub" style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "500" }}>
                            {getCompanyName(item.symbol)}
                          </span>
                        ) : null}
                        {demo ? <span className="demo-badge">Certifié</span> : null}
                      </div>
                      <span className="watchlist-added-date">Ajouté le {item.added_at}</span>
                    </div>
                    <span className={`watchlist-decision-pill ${tone}`}>
                      <i className="status-dot" /> {decision}
                    </span>
                  </div>

                  {demo ? (
                    <div className="watchlist-card-consensus">
                      <div className="consensus-bar-track">
                        <div className="consensus-fill bullish" style={{ width: `${consensus.bullish}%` }} />
                        <div className="consensus-fill neutral" style={{ width: `${consensus.neutral}%` }} />
                        <div className="consensus-fill bearish" style={{ width: `${consensus.bearish}%` }} />
                      </div>
                      <span className="consensus-mini-text">{consensus.bullish}% Consensus Haussier</span>
                    </div>
                  ) : null}

                  <p className="watchlist-note">
                    {item.note || (demo ? demo.result.consensus?.verdict : "Prêt pour une analyse multi-agents détaillée.")}
                  </p>

                  <div className="watchlist-actions">
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => onAnalyzeTicker(item.symbol)}
                    >
                      <Play size={14} fill="currentColor" /> Analyser
                    </button>
                    {demo ? (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => onOpenDemo(demo)}
                      >
                        <Sparkles size={14} /> Démo
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => onCompareTicker(item.symbol)}
                      title="Comparer avec d'autres titres"
                    >
                      <Scale size={14} /> Comparer
                    </button>
                    <button
                      type="button"
                      className="icon-button watchlist-remove-button"
                      onClick={() => handleRemove(item.symbol)}
                      aria-label={`Retirer ${item.symbol}`}
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
