import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ExternalLink,
  MessageSquareText,
  Newspaper,
  Play,
  Plus,
  Scale,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { api } from "./api.js";
import { getCompanyName, getCurrencySymbol } from "./companyNames.js";
import StockSearchInput from "./StockSearchInput.jsx";
import { getDecisionTone, formatDecisionLabel, getDecisionStrength } from "./decisionUtils.js";
import DecisionBadge from "./DecisionBadge.jsx";

function formatNumber(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString("fr-FR", { maximumFractionDigits: digits });
}

function extractAnalystPillars(reports = {}, decisionTone = "neutral") {
  const isPos = decisionTone === "positive";
  const isNeg = decisionTone === "negative";

  const analyze = (text, fallbackStance) => {
    if (!text || typeof text !== "string") return { stance: fallbackStance, tone: decisionTone };
    const lower = text.toLowerCase();
    const bull = (lower.match(/\b(bullish|haussier|achat|acheter|surpondérer|surperformance|croissance|favorable|opportunité|rebond|accumuler|solide|surperformer|positif)\b/gi) || []).length;
    const bear = (lower.match(/\b(bearish|baissier|vente|vendre|sous-pondérer|sous-performance|risque|prudence|dégradation|fragile|surévalué|alléger|négatif)\b/gi) || []).length;
    if (bull > bear + 1) return { stance: "Haussier", tone: "positive" };
    if (bear > bull + 1) return { stance: "Prudent", tone: "negative" };
    return { stance: "Neutre", tone: "neutral" };
  };

  const market = analyze(reports.market, isPos ? "Haussier" : isNeg ? "Prudent" : "Neutre");
  const fundamentals = analyze(reports.fundamentals, isPos ? "Solide" : isNeg ? "Fragile" : "Neutre");
  const news = analyze(reports.news, isPos ? "Favorable" : isNeg ? "Défavorable" : "Neutre");
  const social = analyze(reports.social, isPos ? "Positif" : isNeg ? "Prudent" : "Neutre");

  return {
    market: { label: market.stance, tone: market.tone },
    fundamentals: { label: fundamentals.stance === "Haussier" ? "Solide" : fundamentals.stance === "Prudent" ? "Fragile" : "Équilibré", tone: fundamentals.tone },
    news: { label: news.stance === "Haussier" ? "Favorable" : news.stance === "Prudent" ? "Prudence" : "Neutre", tone: news.tone },
    social: { label: social.stance === "Haussier" ? "Positif" : social.stance === "Prudent" ? "Mitigé" : "Neutre", tone: social.tone },
  };
}

function extractCleanThesis(summary, fallback = "Synthèse multi-agents validée.") {
  if (!summary || typeof summary !== "string") return fallback;
  let clean = summary
    .replace(/^#+.*$/gm, " ")
    .replace(/\*\*(?:Rating|Executive Summary|Investment Thesis|Time Horizon|Recommendation|Rationale|Strategic Actions|Price Target)\*\*\s*:\s*/gi, " ")
    .replace(/(?:Rating|Recommendation)\s*:\s*(?:Buy|Sell|Hold|Underweight|Overweight|Neutral|Achat|Vente|Conserver|Sous-pondérer|Surpondérer)\s*/gi, " ")
    .replace(/FINAL TRANSACTION PROPOSAL\s*:\s*[A-Z\s_-]+/gi, " ")
    .replace(/Date d'analyse\s*:\s*[^.\n]+/gi, " ")
    .replace(/Société\s*:\s*[^.\n]+/gi, " ")
    .replace(/\*\*/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  clean = clean.replace(/^(?:Underweight|Overweight|Hold|Buy|Sell|Neutral|Strong Buy|Strong Sell)\s+/i, "");

  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => s.length > 25);
  const first = (sentences[0] || clean).replace(/^[#:\s-]+/, "").trim();
  const second = sentences[1] ? ` ${sentences[1].replace(/^[#:\s-]+/, "").trim()}` : "";
  const combined = `${first}${second}`.trim();
  return combined.length > 175 ? `${combined.slice(0, 175)}...` : combined;
}

export default function ComparePage({ history = [], initialTickers, onOpenAnalysis, onAnalyzeTicker }) {
  const defaultTickers = useMemo(() => {
    if (initialTickers && initialTickers.length) return initialTickers;
    const fromHistory = Array.from(new Set((history || []).map((h) => h.ticker).filter(Boolean)));
    return fromHistory.slice(0, 2);
  }, [history, initialTickers]);

  const [selectedTickers, setSelectedTickers] = useState(defaultTickers);
  const [customInput, setCustomInput] = useState("");
  const [loadedResults, setLoadedResults] = useState({});

  // Auto-fetch full result for selected tickers that have an id in history
  useEffect(() => {
    selectedTickers.forEach((ticker) => {
      const histItem = (history || []).find((h) => (h?.ticker || "").toUpperCase() === ticker.toUpperCase());
      if (histItem?.id && !loadedResults[histItem.id]) {
        api(`/api/reports/${histItem.id}/result`)
          .then((res) => {
            setLoadedResults((prev) => ({ ...prev, [histItem.id]: res }));
          })
          .catch(() => {});
      }
    });
  }, [selectedTickers, history, loadedResults]);

  // Build lookup of available analyses purely from history items
  const analysisCatalog = useMemo(() => {
    const map = {};
    (history || []).forEach((item) => {
      if (item?.ticker) {
        const fullResult = loadedResults[item.id] || item.result;
        map[item.ticker.toUpperCase()] = {
          ...item,
          result: fullResult || {
            display_decision: item.display_decision || item.raw_decision,
            snapshot: { close: item.close },
            summary: item.summary,
          },
        };
      }
    });
    return map;
  }, [history, loadedResults]);

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
    const all = Array.from(new Set((history || []).map((h) => h.ticker).filter(Boolean)));
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
              {getCompanyName(ticker, true) ? (
                <small style={{ color: "var(--muted)", fontSize: "11px", marginLeft: "4px" }}>
                  {getCompanyName(ticker, true)}
                </small>
              ) : null}
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
            <StockSearchInput
              value={customInput}
              onChange={(val) => setCustomInput(val)}
              onSelect={(stock) => {
                addTicker(stock.ticker);
              }}
              placeholder="Ajouter une action à comparer (ex: AAPL, GOOGL, LVMH)..."
              inputIcon={<Plus size={16} className="input-icon" />}
              className="compare-search-wrapper"
              inputClassName="compare-input"
            >
              <button type="submit" className="secondary-button" disabled={!customInput.trim()}>
                <Plus size={16} /> Ajouter
              </button>
            </StockSearchInput>
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
                  + {symbol} {getCompanyName(symbol, true) ? `· ${getCompanyName(symbol, true)}` : ""}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {selectedTickers.length === 0 ? (
        <div className="empty-state compare-empty-state">
          <Scale size={38} style={{ color: "var(--mint)" }} />
          <strong style={{ fontSize: "16px", marginTop: "4px" }}>Aucun titre sélectionné</strong>
          <span style={{ maxWidth: "480px", textAlign: "center", lineHeight: "1.5" }}>
            Choisissez au moins 2 actions ci-dessus pour lancer la comparaison face-à-face, ou chargez un univers type en un clic :
          </span>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", marginTop: "12px" }}>
            <button
              type="button"
              className="chip-button"
              onClick={() => setSelectedTickers(["NVDA", "MSFT", "AAPL"])}
            >
              ✨ Leaders IA (NVDA vs MSFT vs AAPL)
            </button>
            <button
              type="button"
              className="chip-button"
              onClick={() => setSelectedTickers(["DSY.PA", "CAP.PA", "SU.PA"])}
            >
              🇫🇷 CAC 40 (DSY.PA vs CAP.PA vs SU.PA)
            </button>
            <button
              type="button"
              className="chip-button"
              onClick={() => setSelectedTickers(["SPY", "URTH"])}
            >
              🌍 Indices & ETF (SPY vs URTH)
            </button>
          </div>
        </div>
      ) : (
        <div className={`compare-grid columns-${selectedTickers.length}`}>
          {selectedTickers.map((ticker) => {
            const job = analysisCatalog[ticker.toUpperCase()];

            if (!job) {
              return (
                <motion.article
                  key={ticker}
                  className="compare-card compare-card-placeholder tone-neutral"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <div className="compare-card-header">
                    <div>
                      <span className="compare-badge pending">NON ANALYSÉ</span>
                      <h2>{ticker}</h2>
                      {getCompanyName(ticker) ? (
                        <span
                          className="compare-company-name"
                          style={{
                            fontSize: "12px",
                            color: "var(--muted)",
                            fontWeight: "500",
                            display: "block",
                            marginBottom: "4px",
                          }}
                        >
                          {getCompanyName(ticker)}
                        </span>
                      ) : null}
                      <span className="compare-price muted-text">Données en attente</span>
                    </div>
                    <span className="decision-pill tone-neutral" style={{ opacity: 0.7 }}>
                      À analyser
                    </span>
                  </div>

                  <div className="compare-placeholder-body">
                    <div className="placeholder-icon-wrap">
                      <Scale size={32} />
                    </div>
                    <strong>Aucune analyse disponible pour {ticker}</strong>
                    <p>
                      Lancez l'arbitrage multi-agents pour débloquer le consensus, les signaux contradictoires et le cadrage de risque de cette action.
                    </p>
                    <button
                      type="button"
                      className="primary-button"
                      onClick={() => (onAnalyzeTicker ? onAnalyzeTicker(ticker) : onOpenAnalysis({ ticker }))}
                      style={{ marginTop: "16px", width: "100%", justifyContent: "center" }}
                    >
                      <Play size={15} fill="currentColor" /> Lancer l'analyse de {ticker}
                    </button>
                  </div>
                </motion.article>
              );
            }

            const result = job.result || {};
            const snapshot = result.snapshot || {};
            const decision = result.display_decision || job.display_decision || job.raw_decision || "ATTENDRE";
            const tone = getDecisionTone(decision);
            const strength = getDecisionStrength(decision);
            const reports = result.reports || {};
            const pillars = extractAnalystPillars(reports, tone);
            const thesis = extractCleanThesis(result.summary || job.summary, "Synthèse multi-agents validée sans incohérence.");
            const price = snapshot.close || result.reliability?.verified_close || job.close;
            const currencySymbol = getCurrencySymbol(job.ticker);

            return (
              <motion.article
                key={job.ticker}
                className={`compare-card ${tone} tier-${strength.tier}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <div className="compare-card-header">
                  <div>
                    <span className="compare-badge">ANALYSE MULTI-AGENTS</span>
                    <h2>{job.ticker}</h2>
                    {getCompanyName(job.ticker) ? (
                      <span className="compare-company-name" style={{ fontSize: "12px", color: "var(--muted)", fontWeight: "500", display: "block", marginBottom: "4px" }}>
                        {getCompanyName(job.ticker)}
                      </span>
                    ) : null}
                    <span className="compare-price">{formatNumber(price)} {currencySymbol}</span>
                  </div>
                  <DecisionBadge decision={decision} size="md" />
                </div>

                {/* 4 Pillars with REAL dynamic stances */}
                <div className="compare-section">
                  <span className="compare-section-title"><Users size={15} /> Piliers d’Analystes</span>
                  <div className="compare-pillars-grid">
                    <div className="compare-pillar-item">
                      <div><TrendingUp size={14} /> <strong>Marché</strong></div>
                      <span className={`compare-pillar-badge ${pillars.market.tone}`}>{pillars.market.label}</span>
                    </div>
                    <div className="compare-pillar-item">
                      <div><BookOpen size={14} /> <strong>Fondamentaux</strong></div>
                      <span className={`compare-pillar-badge ${pillars.fundamentals.tone}`}>{pillars.fundamentals.label}</span>
                    </div>
                    <div className="compare-pillar-item">
                      <div><Newspaper size={14} /> <strong>Actualités</strong></div>
                      <span className={`compare-pillar-badge ${pillars.news.tone}`}>{pillars.news.label}</span>
                    </div>
                    <div className="compare-pillar-item">
                      <div><MessageSquareText size={14} /> <strong>Social</strong></div>
                      <span className={`compare-pillar-badge ${pillars.social.tone}`}>{pillars.social.label}</span>
                    </div>
                  </div>
                </div>

                {/* Thèse & Objectif d'allocation */}
                <div className="compare-section">
                  <span className="compare-section-title"><Sparkles size={15} /> Thèse & Objectif d’allocation</span>
                  <div className="compare-thesis-box">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px", flexWrap: "wrap", marginBottom: "8px" }}>
                      <span
                        className="history-model-tag"
                        style={{
                          background: "rgba(45, 212, 191, 0.12)",
                          color: "var(--mint)",
                          border: "1px solid rgba(45, 212, 191, 0.25)",
                          fontWeight: "600",
                        }}
                      >
                        {strength.tag}
                      </span>
                      {strength.description ? (
                        <small style={{ color: "var(--muted)", fontSize: "11px" }}>{strength.description}</small>
                      ) : null}
                    </div>
                    <p style={{ margin: 0, lineHeight: "1.5" }}>{thesis}</p>
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
          {selectedTickers.length === 1 ? (
            <div
              className="compare-card compare-card-placeholder tone-neutral"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                minHeight: "450px",
                borderStyle: "dashed",
              }}
            >
              <Plus size={32} style={{ color: "var(--mint)", marginBottom: "8px" }} />
              <strong style={{ fontSize: "15px" }}>Ajoutez un second titre</strong>
              <p style={{ color: "var(--muted)", fontSize: "12px", maxWidth: "260px", margin: "6px 0 16px" }}>
                Confrontez {selectedTickers[0]} à un pair ou un indice de référence.
              </p>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", justifyContent: "center" }}>
                {availableSuggestions.slice(0, 3).map((sym) => (
                  <button key={sym} type="button" className="chip-button" onClick={() => addTicker(sym)}>
                    + {sym}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </main>
  );
}
