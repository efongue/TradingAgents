import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  GitCompare,
  History,
  Layers,
  ListFilter,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { getCompanyName, getCurrencySymbol } from "../companyNames.js";
import {
  getDecisionTone,
  isPositiveDecision,
  isNeutralDecision,
  isNegativeDecision,
  formatDateFr,
} from "../decisionUtils.js";
import { formatTokens } from "../Workflow.jsx";
import DecisionBadge from "../DecisionBadge.jsx";
import Sparkline from "../Sparkline.jsx";

export function extractCleanThesis(summaryText) {
  if (!summaryText) return "Synthèse de l'analyse enregistrée.";
  let clean = summaryText
    .replace(/^#+\s+.*$/gm, "")
    .replace(/\*\*(?:Rating|Executive Summary|Investment Thesis|Rationale|Recommendation|Time Horizon|Price Target|Strategic Actions)\*\*:\s*/gi, "")
    .replace(/\b(?:Overweight|Underweight|Strong Buy|Buy|Hold|Sell|Neutral|Surpondérer|Sous-pondérer|Acheter|Conserver|Vendre)\b\s*(?:Executive Summary|Summary|Synthèse)?[:\s]*/gi, "")
    .replace(/\*\*/g, "")
    .replace(/^>\s+/gm, "")
    .replace(/`([^`]+)`/g, "$1")
    .trim();

  // Remove leading punctuation or leftover colons
  clean = clean.replace(/^[:\s\-•–]+/, "").trim();

  const sentences = clean.split(/(?<=[.!?])\s+/);
  const first = sentences.find((s) => s.length > 25) || clean;
  return first.length > 175 ? `${first.slice(0, 175)}...` : first;
}

export default function HistoryPage({ history = [], loadingId, error, onSelect, onDeleteItem, onRefresh, isScanning }) {
  const [searchTerm, setSearchTerm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("ticker") || params.get("search") || "";
  });
  const [filterTone, setFilterTone] = useState("all");
  const [viewMode, setViewMode] = useState("grouped");
  const [expandedTickers, setExpandedTickers] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const ticker = params.get("ticker");
    return ticker ? { [ticker.toUpperCase()]: true } : {};
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const queryTicker = params.get("ticker") || params.get("search");
    if (queryTicker) {
      setSearchTerm(queryTicker);
      setExpandedTickers((prev) => ({ ...prev, [queryTicker.toUpperCase()]: true }));
    }
  }, []);

  const stats = useMemo(() => {
    const total = history.length;
    const buyCount = history.filter((item) => isPositiveDecision(item.display_decision)).length;
    const neutralCount = history.filter((item) => isNeutralDecision(item.display_decision)).length;
    const sellCount = history.filter((item) => isNegativeDecision(item.display_decision)).length;
    const blockedCount = history.filter((item) => item.blocked).length;
    const controlledCount = total - blockedCount;
    const reliabilityRate = total ? Math.round((controlledCount / total) * 100) : 100;
    const totalTokens = history.reduce((acc, item) => acc + (Number(item.total_tokens) || 0), 0);
    return { total, buyCount, neutralCount, sellCount, blockedCount, reliabilityRate, totalTokens };
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const matchesSearch = !searchTerm.trim() ||
        item.ticker.toUpperCase().includes(searchTerm.trim().toUpperCase()) ||
        item.analysis_date.includes(searchTerm.trim()) ||
        (item.display_decision && item.display_decision.toUpperCase().includes(searchTerm.trim().toUpperCase()));

      if (!matchesSearch) return false;

      if (filterTone === "all") return true;
      if (filterTone === "buy") return isPositiveDecision(item.display_decision);
      if (filterTone === "neutral") return isNeutralDecision(item.display_decision);
      if (filterTone === "sell") return isNegativeDecision(item.display_decision);
      if (filterTone === "blocked") return Boolean(item.blocked);
      return true;
    });
  }, [history, searchTerm, filterTone]);

  const toggleExpand = (ticker) => {
    setExpandedTickers((prev) => ({ ...prev, [ticker]: !prev[ticker] }));
  };

  const groupedHistory = useMemo(() => {
    if (viewMode === "flat") return null;
    const map = new Map();
    filteredHistory.forEach((item) => {
      const ticker = item.ticker;
      if (!map.has(ticker)) {
        map.set(ticker, []);
      }
      map.get(ticker).push(item);
    });
    return Array.from(map.entries()).map(([ticker, items]) => {
      const latest = items[0];
      const previous = items.slice(1);
      const prev = previous[0];
      const oldest = items[items.length - 1];
      const priceDelta =
        latest.close && prev?.close
          ? ((Number(latest.close) - Number(prev.close)) / Number(prev.close)) * 100
          : null;
      const priceDiffAmount =
        latest.close && prev?.close
          ? Number(latest.close) - Number(prev.close)
          : null;
      const totalSpanPriceDelta =
        latest.close && oldest?.close && items.length > 1
          ? ((Number(latest.close) - Number(oldest.close)) / Number(oldest.close)) * 100
          : null;
      const totalSpanPriceDiff =
        latest.close && oldest?.close && items.length > 1
          ? Number(latest.close) - Number(oldest.close)
          : null;
      const decisionShift =
        prev && latest.display_decision !== prev.display_decision;

      return {
        ticker,
        items,
        chronologicalRuns: [...items].reverse(),
        latest,
        previous,
        oldest,
        totalRuns: items.length,
        priceDelta,
        priceDiffAmount,
        totalSpanPriceDelta,
        totalSpanPriceDiff,
        decisionShift,
      };
    });
  }, [filteredHistory, viewMode]);

  return (
    <main className="page history-page">
      <div className="page-heading">
        <div>
          <h1>Historique & Journal d'Audit</h1>
          <p>Retrouvez l'ensemble de vos analyses multi-agents antérieures enregistrées localement.</p>
        </div>
        {onRefresh ? (
          <div className="page-heading-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {isScanning ? (
              <span className="sync-badge pulse" style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--mint)", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", padding: "4px 10px", borderRadius: "16px" }}>
                <span className="live-dot" /> Scan en cours (flux live)
              </span>
            ) : null}
            <button
              type="button"
              className="secondary-button"
              onClick={onRefresh}
              title="Recharger l'historique"
            >
              <RefreshCw size={14} /> Actualiser
            </button>
          </div>
        ) : null}
      </div>

      {error ? <div className="connection-error"><AlertTriangle size={18} /> {error}</div> : null}

      {/* KPI Stats Strip */}
      <section className="history-kpi-strip">
        <div className="history-kpi-box">
          <History size={18} className="kpi-icon" />
          <div>
            <span className="kpi-label">Analyses Archivées</span>
            <strong className="kpi-value">{stats.total}</strong>
          </div>
        </div>
        <div className="history-kpi-box">
          <Zap size={18} className="kpi-icon positive" />
          <div>
            <span className="kpi-label">Tokens Consommés</span>
            <strong className="kpi-value positive">{stats.totalTokens ? formatTokens(stats.totalTokens) : "—"}</strong>
          </div>
        </div>
        <div className="history-kpi-box">
          <ShieldCheck size={18} className="kpi-icon" />
          <div>
            <span className="kpi-label">Taux de Fiabilité</span>
            <strong className="kpi-value">{stats.reliabilityRate}%</strong>
          </div>
        </div>
      </section>

      {/* Search & Filter Toolbar */}
      <section className="history-toolbar">
        <div className="history-search-input">
          <Search size={15} className="search-icon" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrer par symbole ou date (ex: NVDA, 2026)..."
          />
          {searchTerm ? (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => {
                setSearchTerm("");
                const url = new URL(window.location.href);
                url.searchParams.delete("ticker");
                url.searchParams.delete("search");
                window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
              }}
              aria-label="Effacer la recherche"
              title="Effacer la recherche"
            >
              <X size={13} />
            </button>
          ) : null}
        </div>

        <div className="history-filter-chips">
          <button
            type="button"
            className={`filter-chip ${filterTone === "all" ? "active" : ""}`}
            onClick={() => setFilterTone("all")}
          >
            Tous ({stats.total})
          </button>
          <button
            type="button"
            className={`filter-chip ${filterTone === "buy" ? "active" : ""}`}
            onClick={() => setFilterTone("buy")}
          >
            <i className="dot dot-buy" /> Haussiers ({stats.buyCount})
          </button>
          <button
            type="button"
            className={`filter-chip ${filterTone === "neutral" ? "active" : ""}`}
            onClick={() => setFilterTone("neutral")}
          >
            <i className="dot dot-neutral" /> Neutres ({stats.neutralCount})
          </button>
          <button
            type="button"
            className={`filter-chip ${filterTone === "sell" ? "active" : ""}`}
            onClick={() => setFilterTone("sell")}
          >
            <i className="dot dot-sell" /> Baissiers / Ventes ({stats.sellCount})
          </button>
          {stats.blockedCount > 0 ? (
            <button
              type="button"
              className={`filter-chip ${filterTone === "blocked" ? "active" : ""}`}
              onClick={() => setFilterTone("blocked")}
            >
              <i className="dot dot-blocked" /> Bloquées ({stats.blockedCount})
            </button>
          ) : null}
        </div>

        <div className="history-view-mode-toggle">
          <button
            type="button"
            className={`view-mode-btn ${viewMode === "grouped" ? "active" : ""}`}
            onClick={() => setViewMode("grouped")}
            title="Vue regroupée par instrument (met en avant la dernière analyse)"
          >
            <Layers size={13} /> Par titre
          </button>
          <button
            type="button"
            className={`view-mode-btn ${viewMode === "flat" ? "active" : ""}`}
            onClick={() => setViewMode("flat")}
            title="Flux chronologique brut"
          >
            <ListFilter size={13} /> Flux brut
          </button>
        </div>
      </section>

      {/* History Table Panel */}
      <section className="history-table-panel">
        <div className="history-table-head">
          <span>Instrument</span>
          <span>Décision IA</span>
          <span>Tendance (30 j)</span>
          <span>Cours vérifié</span>
          <span>Modèle IA</span>
          <span>Date & Contrôle</span>
          <span style={{ textAlign: "right" }}>Actions</span>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
          }}
        >
          {viewMode === "grouped" ? (
            groupedHistory && groupedHistory.length ? (
              groupedHistory.map((group) => {
                const item = group.latest;
                const decision = item.display_decision || "Non spécifié";
                const tone = getDecisionTone(decision);
                const isExpanded = Boolean(expandedTickers[group.ticker]);
                const hasPrevious = group.previous.length > 0;

                return (
                  <div key={group.ticker} className={`history-group-wrap ${isExpanded ? "expanded" : ""}`}>
                    <motion.div
                      className="history-table-row"
                      onClick={() => onSelect(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          onSelect(item);
                        }
                      }}
                      variants={{
                        hidden: { opacity: 0, y: 6 },
                        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
                      }}
                      whileHover={{ backgroundColor: "rgba(45, 212, 191, 0.035)" }}
                    >
                      <div className="history-ticker-cell">
                        <strong className="ticker-badge history-symbol-tag">{group.ticker}</strong>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          {getCompanyName(group.ticker, true) ? (
                            <span className="company-subname" style={{ color: "var(--muted)", fontSize: "11px", fontWeight: "500" }}>
                              {getCompanyName(group.ticker, true)}
                            </span>
                          ) : null}
                          {hasPrevious ? (
                            <button
                              type="button"
                              className={`history-versions-pill ${isExpanded ? "active" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleExpand(group.ticker);
                              }}
                              title={isExpanded ? "Masquer les analyses antérieures" : "Dérouler les analyses antérieures"}
                            >
                              <History size={10} /> {group.totalRuns} analyses {isExpanded ? "▲" : "▼"}
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div>
                        <DecisionBadge decision={decision} size="sm" />
                      </div>

                      <div className="history-sparkline-cell">
                        {item.sparkline && item.sparkline.length >= 2 ? (
                          <Sparkline data={item.sparkline} width={88} height={22} tone={tone} showChange={false} />
                        ) : (
                          <span className="muted-dash">—</span>
                        )}
                      </div>

                      <div className="history-price-cell">
                        {item.close ? (
                          <strong>{Number(item.close).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {getCurrencySymbol(group.ticker)}</strong>
                        ) : (
                          <span className="muted-dash">—</span>
                        )}
                        <small className="history-date-sub">{formatDateFr(item.analysis_date)}</small>
                      </div>

                      <div className="history-model-cell">
                        <span
                          className="history-model-tag"
                          title={`Modèle : ${item.model || "standard"}${item.total_tokens ? ` · ${formatTokens(item.total_tokens)} tokens consommés` : ""}`}
                        >
                          {item.model ? item.model.split("/").pop().replace("omniroute/", "") : "standard"}
                        </span>
                      </div>

                      <div className="history-meta-cell">
                        <span className="history-time-text">{item.created_at}</span>
                        <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap" }}>
                          {item.blocked ? (
                            <span className="history-reliability-pill warn">
                              <AlertTriangle size={11} /> Bloquée
                            </span>
                          ) : (
                            <span className="history-reliability-pill ok">
                              <CheckCircle2 size={11} /> Conforme
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="history-action-cell" onClick={(e) => e.stopPropagation()}>
                        {onDeleteItem ? (
                          <button
                            type="button"
                            className="history-row-delete"
                            onClick={() => onDeleteItem(item.id)}
                            title="Supprimer cette analyse de l'historique"
                            aria-label="Supprimer de l'historique"
                          >
                            <Trash2 size={14} />
                          </button>
                        ) : null}
                        {loadingId === item.id ? (
                          <LoaderCircle className="spin" size={16} />
                        ) : (
                          <button
                            type="button"
                            className="history-view-btn"
                            onClick={() => onSelect(item)}
                          >
                            Consulter <ChevronRight size={14} />
                          </button>
                        )}
                        {hasPrevious ? (
                          <button
                            type="button"
                            className={`history-toggle-drawer-btn ${isExpanded ? "active" : ""}`}
                            onClick={() => toggleExpand(group.ticker)}
                            title={isExpanded ? "Masquer les versions antérieures" : "Déplier les versions antérieures"}
                          >
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        ) : null}
                      </div>
                    </motion.div>

                    {/* Accordion Expanded Evolution & Version History */}
                    <AnimatePresence>
                      {isExpanded && hasPrevious ? (
                        <motion.div
                          key={`subrows-${group.ticker}`}
                          className="history-group-subrows"
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18, ease: "easeOut" }}
                        >
                          {/* 1. Header Banner */}
                          <div className="history-evolution-banner">
                            <div className="evolution-banner-left">
                              <div className="evolution-banner-title">
                                <GitCompare size={16} className="evolution-icon" />
                                <strong>Historique d’audit des versions ({group.ticker})</strong>
                              </div>
                              <span className="evolution-banner-subtitle">
                                {group.totalRuns} analyses enregistrées · {group.oldest?.analysis_date === group.latest.analysis_date ? `Séance du ${formatDateFr(group.latest.analysis_date)}` : `Du ${formatDateFr(group.oldest?.analysis_date)} au ${formatDateFr(group.latest.analysis_date)}`}
                              </span>
                            </div>

                            <div className="evolution-banner-pills">
                              <div className="evolution-kpi-pill">
                                <span className="kpi-pill-label">Signal</span>
                                <span className={`kpi-pill-val ${group.decisionShift ? "shift" : "stable"}`}>
                                  {group.decisionShift ? "⚡ Variation de signal" : "✓ Signal stable"}
                                </span>
                              </div>

                              {group.totalSpanPriceDelta !== null ? (
                                <div className="evolution-kpi-pill">
                                  <span className="kpi-pill-label">Évolution globale</span>
                                  <span className={`kpi-pill-val ${group.totalSpanPriceDelta >= 0 ? "up" : "down"}`}>
                                    {group.totalSpanPriceDelta >= 0 ? "+" : ""}{group.totalSpanPriceDelta.toFixed(2)} % ({group.totalSpanPriceDiff >= 0 ? "+" : ""}{group.totalSpanPriceDiff.toFixed(2)} {getCurrencySymbol(group.ticker)})
                                  </span>
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {/* 2. Unified Version Timeline List */}
                          <div className="history-version-timeline">
                            {group.items.map((run, idx) => {
                              const versionNumber = group.items.length - idx;
                              const isLatest = idx === 0;
                              const olderRun = group.items[idx + 1];
                              const stepDelta = run.close && olderRun?.close
                                ? ((Number(run.close) - Number(olderRun.close)) / Number(olderRun.close)) * 100
                                : null;
                              const stepDeltaAmount = run.close && olderRun?.close
                                ? Number(run.close) - Number(olderRun.close)
                                : null;

                              return (
                                <motion.div
                                  key={run.id}
                                  className={`version-timeline-card ${isLatest ? "latest" : "archived"}`}
                                  onClick={() => onSelect(run)}
                                  whileHover={{ y: -1, backgroundColor: isLatest ? "rgba(45, 212, 191, 0.05)" : "rgba(255, 255, 255, 0.025)" }}
                                >
                                  {/* Col 1: Version badge & timestamp */}
                                  <div className="version-col-badge">
                                    <div className="version-number-tag">
                                      <span className={`v-pill ${isLatest ? "v-latest" : "v-archived"}`}>
                                        v{versionNumber}
                                      </span>
                                      {isLatest ? (
                                        <span className="v-current-badge">Actuelle</span>
                                      ) : (
                                        <span className="v-archived-badge">Archivée</span>
                                      )}
                                    </div>
                                    <span className="version-time-text">{run.created_at}</span>
                                  </div>

                                  {/* Col 2: Decision Badge */}
                                  <div className="version-col-decision">
                                    <DecisionBadge decision={run.display_decision} size="sm" />
                                  </div>

                                  {/* Col 3: Price & Step Delta */}
                                  <div className="version-col-price">
                                    <strong className="version-price-val">
                                      {run.close ? `${Number(run.close).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} ${getCurrencySymbol(group.ticker)}` : "—"}
                                    </strong>
                                    {stepDelta !== null ? (
                                      <span className={`version-delta-tag ${stepDelta >= 0 ? "up" : "down"}`}>
                                        {stepDelta >= 0 ? "+" : ""}{stepDelta.toFixed(2)} % ({stepDeltaAmount >= 0 ? "+" : ""}{stepDeltaAmount.toFixed(2)} {getCurrencySymbol(group.ticker)})
                                      </span>
                                    ) : (
                                      <span className="version-delta-tag base">Version initiale</span>
                                    )}
                                  </div>

                                  {/* Col 4: Clean Thesis Summary */}
                                  <div className="version-col-thesis">
                                    <span className="thesis-eyebrow">Thèse clé :</span>
                                    <p className="thesis-text">{extractCleanThesis(run.summary)}</p>
                                  </div>

                                  {/* Col 5: Tech metadata (model with token tooltip) */}
                                  <div className="version-col-meta">
                                    <span
                                      className="history-model-tag"
                                      title={`Modèle : ${run.model || "standard"}${run.total_tokens ? ` · ${formatTokens(run.total_tokens)} tokens consommés` : ""}`}
                                    >
                                      {run.model ? run.model.split("/").pop().replace("omniroute/", "") : "standard"}
                                    </span>
                                  </div>

                                  {/* Col 6: Actions */}
                                  <div className="version-col-actions" onClick={(e) => e.stopPropagation()}>
                                    {onDeleteItem && !isLatest ? (
                                      <button
                                        type="button"
                                        className="history-row-delete"
                                        onClick={() => onDeleteItem(run.id)}
                                        title="Supprimer cette version archivée"
                                        aria-label="Supprimer"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    ) : null}
                                    {loadingId === run.id ? (
                                      <LoaderCircle className="spin" size={15} />
                                    ) : (
                                      <button
                                        type="button"
                                        className="history-view-btn compact"
                                        onClick={() => onSelect(run)}
                                      >
                                        {isLatest ? "Consulter" : "Consulter"} <ChevronRight size={13} />
                                      </button>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <History size={36} />
                <strong>{searchTerm || filterTone !== "all" ? "Aucune analyse trouvée" : "Aucune analyse enregistrée"}</strong>
                <span>
                  {searchTerm || filterTone !== "all"
                    ? "Modifiez vos critères de recherche pour retrouver les rapports archivés."
                    : "Lancez votre première analyse multi-agents pour qu'elle s'enregistre automatiquement dans votre historique."}
                </span>
              </div>
            )
          ) : (
            filteredHistory.length ? (
              filteredHistory.map((item) => {
                const decision = item.display_decision || "Non spécifié";
                const tone = getDecisionTone(decision);

                return (
                  <motion.div
                    className="history-table-row"
                    key={item.id}
                    onClick={() => onSelect(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(item); }}
                    aria-label={`Ouvrir l’analyse ${item.ticker} du ${formatDateFr(item.analysis_date)}`}
                    variants={{
                      hidden: { opacity: 0, y: 6 },
                      visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
                    }}
                    whileHover={{ backgroundColor: "rgba(45, 212, 191, 0.035)", x: 2 }}
                  >
                    <div className="history-ticker-cell">
                      <strong className="ticker-badge history-symbol-tag">{item.ticker}</strong>
                      {getCompanyName(item.ticker, true) ? (
                        <small className="company-subname" style={{ color: "var(--muted)", fontSize: "11px", marginLeft: "6px", fontWeight: "500" }}>
                          {getCompanyName(item.ticker, true)}
                        </small>
                      ) : null}
                    </div>

                    <div>
                      <DecisionBadge decision={decision} size="sm" />
                    </div>

                    <div className="history-sparkline-cell">
                      {item.sparkline && item.sparkline.length >= 2 ? (
                        <Sparkline data={item.sparkline} width={88} height={22} tone={tone} showChange={false} />
                      ) : (
                        <span className="muted-dash">—</span>
                      )}
                    </div>

                    <div className="history-price-cell">
                      {item.close ? (
                        <strong>{Number(item.close).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {getCurrencySymbol(item.ticker)}</strong>
                      ) : (
                        <span className="muted-dash">—</span>
                      )}
                      <small className="history-date-sub">{formatDateFr(item.analysis_date)}</small>
                    </div>

                    <div className="history-model-cell">
                      <span
                        className="history-model-tag"
                        title={`Modèle : ${item.model || "standard"}${item.total_tokens ? ` · ${formatTokens(item.total_tokens)} tokens consommés` : ""}`}
                      >
                        {item.model ? item.model.split("/").pop().replace("omniroute/", "") : "standard"}
                      </span>
                    </div>

                    <div className="history-meta-cell">
                      <span className="history-time-text">{item.created_at}</span>
                      <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap" }}>
                        {item.blocked ? (
                          <span className="history-reliability-pill warn">
                            <AlertTriangle size={11} /> Bloquée
                          </span>
                        ) : (
                          <span className="history-reliability-pill ok">
                            <CheckCircle2 size={11} /> Conforme
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="history-action-cell" onClick={(e) => e.stopPropagation()}>
                      {onDeleteItem ? (
                        <button
                          type="button"
                          className="history-row-delete"
                          onClick={() => onDeleteItem(item.id)}
                          title="Supprimer cette analyse de l'historique"
                          aria-label="Supprimer de l'historique"
                        >
                          <Trash2 size={14} />
                        </button>
                      ) : null}
                      {loadingId === item.id ? (
                        <LoaderCircle className="spin" size={16} />
                      ) : (
                        <button
                          type="button"
                          className="history-view-btn"
                          onClick={() => onSelect(item)}
                        >
                          Consulter <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="empty-state">
                <History size={36} />
                <strong>{searchTerm || filterTone !== "all" ? "Aucune analyse trouvée" : "Aucune analyse enregistrée"}</strong>
                <span>
                  {searchTerm || filterTone !== "all"
                    ? "Modifiez vos critères de recherche pour retrouver les rapports archivés."
                    : "Lancez votre première analyse multi-agents pour qu'elle s'enregistre automatiquement dans votre historique."}
                </span>
              </div>
            )
          )}
        </motion.div>
      </section>
    </main>
  );
}
