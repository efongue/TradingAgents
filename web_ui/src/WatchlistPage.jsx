import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Plus,
  Play,
  RefreshCw,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { DEMO_ANALYSES } from "./demoData.js";

const DEFAULT_WATCHLIST = [
  { symbol: "NVDA", added_at: "2026-08-27", last_decision: "ACHETER FORT", note: "Leader calcul accéléré et datacenters" },
  { symbol: "MSFT", added_at: "2026-08-27", last_decision: "ACCUMULER", note: "Monétisation Copilot et Azure" },
  { symbol: "AAPL", added_at: "2026-08-27", last_decision: "CONSERVER", note: "Division Services et base installée" },
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

  return (
    <main className="page watchlist-page">
      <div className="page-heading">
        <div>
          <h1>Watchlist & Surveillance</h1>
          <p>Gardez un œil sur vos titres prioritaires, comparez leurs signaux et relancez les analyses en un clic.</p>
        </div>
      </div>

      <section className="watchlist-controls-panel">
        <form onSubmit={handleAdd} className="watchlist-add-form">
          <input
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            placeholder="Ajouter une action (ex: GOOGL, AMZN, TSLA)..."
            maxLength={15}
          />
          <button type="submit" className="primary-button" disabled={!newSymbol.trim()}>
            <Plus size={17} /> Ajouter à la liste
          </button>
        </form>

        <div className="watchlist-quick-chips">
          <span>Suggestions rapides :</span>
          {["AMZN", "GOOGL", "META", "TSLA", "NFLX", "AMD"].map((sym) => (
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
      </section>

      {items.length === 0 ? (
        <div className="empty-state">
          <Bookmark size={36} />
          <strong>Votre Watchlist est vide</strong>
          <span>Ajoutez des actions pour suivre leurs décisions et alertes au fil du temps.</span>
        </div>
      ) : (
        <div className="watchlist-grid">
          <AnimatePresence>
            {items.map((item) => {
              const demo = DEMO_ANALYSES[item.symbol];
              const decision = item.last_decision || (demo ? demo.result.display_decision : "À analyser");
              const isBuy = /ACHETER|BUY|ACCUMULER/.test(decision);
              const isSell = /VENDRE|SELL/.test(decision);
              const tone = isBuy ? "positive" : isSell ? "negative" : "neutral";

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
                      <span className="watchlist-added-date">Ajouté le {item.added_at}</span>
                      <h2>{item.symbol}</h2>
                    </div>
                    <span className={`watchlist-decision-pill ${tone}`}>
                      {decision}
                    </span>
                  </div>

                  <p className="watchlist-note">
                    {item.note || (demo ? demo.result.consensus?.verdict : "Prêt pour une analyse multi-agents détaillée.")}
                  </p>

                  <div className="watchlist-actions">
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => onAnalyzeTicker(item.symbol)}
                    >
                      <Play size={15} fill="currentColor" /> Analyser
                    </button>
                    {demo ? (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => onOpenDemo(demo)}
                      >
                        <Sparkles size={15} /> Voir démo
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => onCompareTicker(item.symbol)}
                      title="Comparer avec d'autres titres"
                    >
                      <Scale size={15} /> Comparer
                    </button>
                    <button
                      type="button"
                      className="icon-button watchlist-remove-button"
                      onClick={() => handleRemove(item.symbol)}
                      aria-label={`Retirer ${item.symbol}`}
                    >
                      <Trash2 size={16} />
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
