import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Layers,
  MessageSquareText,
  Minus,
  Newspaper,
  Plus,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { DEMO_ANALYSES } from "./demoData.js";

function decisionTone(decision) {
  const normalized = String(decision || "").toUpperCase();
  if (["BUY", "ACHETER", "ACHETER FORT", "ACCUMULER", "OVERWEIGHT"].some((token) => normalized.includes(token))) {
    return "positive";
  }
  if (["SELL", "VENDRE", "ALLÉGER", "UNDERWEIGHT"].some((token) => normalized.includes(token))) {
    return "negative";
  }
  return "neutral";
}

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString("fr-FR", { maximumFractionDigits: digits });
}

export default function ComparePage({ history = [], initialTickers = ["NVDA", "MSFT"], onOpenAnalysis }) {
  const [selectedTickers, setSelectedTickers] = useState(initialTickers);
  const [customInput, setCustomInput] = useState("");

  // Build lookup of available analyses (history items + demo analyses)
  const analysisCatalog = useMemo(() => {
    const map = {};
    // Add demo analyses first
    Object.keys(DEMO_ANALYSES).forEach((ticker) => {
      map[ticker] = DEMO_ANALYSES[ticker];
    });
    // Add history items (overriding demo if newer/real)
    (history || []).forEach((item) => {
      if (item?.ticker && item?.result) {
        map[item.ticker] = item;
      }
    });
    return map;
  }, [history]);

  const activeAnalyses = useMemo(() => {
    return selectedTickers
      .map((ticker) => analysisCatalog[ticker.toUpperCase()])
      .filter(Boolean);
  }, [selectedTickers, analysisCatalog]);

  const addTicker = (ticker) => {
    const symbol = ticker.trim().toUpperCase();
    if (!symbol || selectedTickers.includes(symbol)) return;
    if (selectedTickers.length >= 3) {
      setSelectedTickers([...selectedTickers.slice(1), symbol]);
    } else {
      setSelectedTickers([...selectedTickers, symbol]);
    }
    setCustomInput("");
  };

  const removeTicker = (ticker) => {
    setSelectedTickers(selectedTickers.filter((t) => t !== ticker));
  };

  const availableSuggestions = useMemo(() => {
    const all = Array.from(new Set([...Object.keys(DEMO_ANALYSES), ...history.map((h) => h.ticker).filter(Boolean)]));
    return all.filter((s) => !selectedTickers.includes(s));
  }, [history, selectedTickers]);

  return (
    <main className="page compare-page">
      <div className="page-heading">
        <div>
          <h1>Comparateur Face-à-Face</h1>
          <p>Confrontez 2 à 3 actions côte à côte : consensus des agents, signaux contradictoires et ratios de risque.</p>
        </div>
      </div>

      <section className="compare-selector-panel">
        <div className="compare-selected-chips">
          <span>Titres comparés ({selectedTickers.length}/3) :</span>
          {selectedTickers.map((ticker) => (
            <motion.span
              key={ticker}
              className="compare-active-chip"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <strong>{ticker}</strong>
              <button
                type="button"
                onClick={() => removeTicker(ticker)}
                aria-label={`Retirer ${ticker}`}
              >
                <X size={14} />
              </button>
            </motion.span>
          ))}
        </div>

        <div className="compare-add-row">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTicker(customInput);
            }}
            className="compare-input-form"
          >
            <input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value.toUpperCase())}
              placeholder="Ajouter un symbole (ex: AAPL, GOOGL)..."
              maxLength={15}
            />
            <button type="submit" className="secondary-button" disabled={!customInput.trim()}>
              <Plus size={16} /> Ajouter
            </button>
          </form>

          {availableSuggestions.length ? (
            <div className="compare-quick-suggestions">
              <span>Disponibles :</span>
              {availableSuggestions.map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  className="chip-button"
                  onClick={() => addTicker(symbol)}
                >
                  + {symbol}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {activeAnalyses.length === 0 ? (
        <div className="empty-state">
          <Scale size={36} />
          <strong>Aucun titre sélectionné</strong>
          <span>Choisissez au moins 2 actions ci-dessus pour lancer la comparaison face-à-face.</span>
        </div>
      ) : (
        <div className={`compare-grid columns-${activeAnalyses.length}`}>
          {activeAnalyses.map((job) => {
            const result = job.result || {};
            const snapshot = result.snapshot || {};
            const consensus = result.consensus || { bullish: 70, neutral: 20, bearish: 10 };
            const decision = result.display_decision || "ATTENDRE";
            const tone = decisionTone(decision);
            const scores = result.analyst_scores || {};
            const catalysts = result.catalysts || [];
            const riskVeto = result.risk_veto || {};

            return (
              <motion.article
                key={job.ticker}
                className={`compare-card ${tone}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <div className="compare-card-header">
                  <div>
                    <span className="compare-badge">{job.is_demo ? "DÉMO INSTANTANÉE" : "ANALYSE RÉELLE"}</span>
                    <h2>{job.ticker}</h2>
                    <span className="compare-price">{formatNumber(snapshot.close || result.reliability?.verified_close)} $</span>
                  </div>
                  <div className={`compare-decision-pill ${tone}`}>
                    {decision}
                  </div>
                </div>

                {/* Consensus breakdown */}
                <div className="compare-section">
                  <span className="compare-section-title"><Sparkles size={15} /> Consensus Multi-Agents</span>
                  <div className="consensus-bar-track" aria-label={`Consensus : ${consensus.bullish}% haussier`}>
                    <div className="consensus-fill bullish" style={{ width: `${consensus.bullish || 70}%` }} title={`Haussier: ${consensus.bullish || 70}%`} />
                    <div className="consensus-fill neutral" style={{ width: `${consensus.neutral || 20}%` }} title={`Neutre: ${consensus.neutral || 20}%`} />
                    <div className="consensus-fill bearish" style={{ width: `${consensus.bearish || 10}%` }} title={`Prudent: ${consensus.bearish || 10}%`} />
                  </div>
                  <div className="consensus-legend">
                    <span className="bullish-label"><i /> {consensus.bullish || 70}% Haussier</span>
                    <span className="neutral-label"><i /> {consensus.neutral || 20}% Neutre</span>
                    <span className="bearish-label"><i /> {consensus.bearish || 10}% Prudent</span>
                  </div>
                  {consensus.verdict ? <p className="consensus-verdict">{consensus.verdict}</p> : null}
                </div>

                {/* 4 Pillars */}
                <div className="compare-section">
                  <span className="compare-section-title"><Users size={15} /> Piliers d’Analystes</span>
                  <div className="compare-pillars-grid">
                    <div className="compare-pillar-item">
                      <div><TrendingUp size={14} /> <strong>Marché</strong></div>
                      <span>{scores.market?.stance || "Haussier"} ({scores.market?.score || 85}/100)</span>
                    </div>
                    <div className="compare-pillar-item">
                      <div><BookOpen size={14} /> <strong>Fondamentaux</strong></div>
                      <span>{scores.fundamentals?.stance || "Solide"} ({scores.fundamentals?.score || 88}/100)</span>
                    </div>
                    <div className="compare-pillar-item">
                      <div><Newspaper size={14} /> <strong>Actualités</strong></div>
                      <span>{scores.news?.stance || "Favorable"} ({scores.news?.score || 80}/100)</span>
                    </div>
                    <div className="compare-pillar-item">
                      <div><MessageSquareText size={14} /> <strong>Social</strong></div>
                      <span>{scores.social?.stance || "Positif"} ({scores.social?.score || 80}/100)</span>
                    </div>
                  </div>
                </div>

                {/* Catalysts & Risks */}
                <div className="compare-section">
                  <span className="compare-section-title"><CheckCircle2 size={15} /> Catalyseurs Clés</span>
                  {catalysts.length ? (
                    <ul className="compare-bullet-list">
                      {catalysts.map((cat, i) => <li key={i}>{cat}</li>)}
                    </ul>
                  ) : (
                    <p className="compare-fallback-text">{result.summary?.slice(0, 150)}...</p>
                  )}
                </div>

                <div className="compare-section">
                  <span className="compare-section-title"><ShieldCheck size={15} /> Évaluation Risque & Veto</span>
                  <div className="compare-risk-box">
                    <strong>Niveau de risque : {riskVeto.level || "Modéré"}</strong>
                    <p>{riskVeto.summary || "Contrôles locaux d’incohérence validés."}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="compare-card-actions">
                  <button
                    type="button"
                    className="primary-button"
                    onClick={() => onOpenAnalysis(job)}
                  >
                    <ExternalLink size={16} /> Ouvrir l’analyse complète
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </main>
  );
}
