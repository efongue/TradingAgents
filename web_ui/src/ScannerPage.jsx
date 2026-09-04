import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Bookmark,
  CheckCircle2,
  Clock3,
  ExternalLink,
  LoaderCircle,
  Play,
  RefreshCw,
  Scale,
  ScanSearch,
  X,
  Zap,
} from "lucide-react";
import { api } from "./api.js";
import { getCompanyName, getCurrencySymbol } from "./companyNames.js";
import { getDecisionTone, formatDecisionLabel, getDecisionStrength } from "./decisionUtils.js";
import DecisionBadge from "./DecisionBadge.jsx";
import Sparkline from "./Sparkline.jsx";
import Workflow, { formatTokens } from "./Workflow.jsx";
import { useWatchlist } from "./hooks/useWatchlist.js";
import "./scanner.css";

const TODAY = new Date().toISOString().slice(0, 10);

const INITIAL_SCANNER_FORM = {
  universe: "us-large",
  symbols: "AAPL, MSFT, NVDA, AMZN, GOOGL, META",
  date: TODAY,
  prefilter_limit: 8,
  analysis_limit: 3,
};

function formatNumber(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString("fr-FR", { maximumFractionDigits: digits });
}

function formatPercent(value, showPlus = true) {
  if (value === null || value === undefined) return "—";
  const numeric = Number(value);
  return `${showPlus && numeric > 0 ? "+" : ""}${formatNumber(numeric)} %`;
}

function formatDateFr(dateStr) {
  if (!dateStr || dateStr === "—") return "—";
  try {
    const parts = String(dateStr).split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  } catch {
    // fallback
  }
  return dateStr;
}

function statusCopy(candidate, jobStatus) {
  if (jobStatus === "error" || jobStatus === "interrupted") {
    if (candidate.analysis_status === "running" || candidate.analysis_status === "queued" || candidate.analysis_status === "error") {
      return "Interrompu";
    }
  }
  return {
    queued: "En attente",
    running: "En cours",
    complete: "Analysé",
    blocked: "Contrôle bloquant",
    error: "Interrompu",
    prefiltered: "Préfiltré",
  }[candidate.analysis_status] || "Préfiltré";
}

function ScanProgress({ job, onReset, selectedTicker, onSelectTicker }) {
  const screening = job.screen_progress || { completed: 0, total: 0 };
  const analysis = job.analysis_progress || { completed: 0, total: 0 };
  const screenWidth = screening.total ? (screening.completed / screening.total) * 100 : 0;
  const analysisWidth = analysis.total ? (analysis.completed / analysis.total) * 100 : 0;
  const isDoneOrError = ["complete", "error"].includes(job.status);
  const [showLiveWorkflow, setShowLiveWorkflow] = useState(true);

  // Parallel candidate analyses tracked in the scan
  const candidatesWithAnalysis = useMemo(() => {
    return (job.candidates || []).filter(
      (c) => c.analysis_job_id || job.child_analyses?.[c.symbol] || ["queued", "running", "complete", "error", "blocked"].includes(c.analysis_status)
    );
  }, [job.candidates, job.child_analyses]);

  // Determine which analysis is currently displayed
  const availableTickers = candidatesWithAnalysis.map((c) => c.symbol);
  const activeTicker = (selectedTicker && availableTickers.includes(selectedTicker))
    ? selectedTicker
    : (job.active_symbol && availableTickers.includes(job.active_symbol))
      ? job.active_symbol
      : (job.active_analysis?.ticker && availableTickers.includes(job.active_analysis.ticker))
        ? job.active_analysis.ticker
        : availableTickers[0] || job.active_symbol;

  const displayedAnalysis = (activeTicker && job.child_analyses?.[activeTicker])
    || (job.active_analysis?.ticker === activeTicker ? job.active_analysis : null)
    || (candidatesWithAnalysis.length <= 1 ? job.active_analysis : null);

  return (
    <motion.section
      className="scanner-progress-panel"
      aria-live="polite"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
    >
      <div className="scanner-panel-heading">
        <div>
          <span className={`scanner-status-dot ${job.status}`} />
          <div>
            <h2>{job.stage_label}</h2>
            <p>{job.active_symbol ? `Analyse de ${job.active_symbol} en cours...` : job.logs?.at(-1)}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isDoneOrError && onReset ? (
            <button
              type="button"
              className="secondary-button compact"
              onClick={onReset}
              title="Effacer et préparer un nouveau scan"
            >
              <RefreshCw size={13} /> Nouveau scan
            </button>
          ) : null}
          <span className="scanner-elapsed">{job.elapsed}</span>
        </div>
      </div>
      <div className="scanner-progress-grid">
        <div>
          <span><BarChart3 size={17} /> Univers préfiltré</span>
          <strong>{screening.completed} / {screening.total}</strong>
          <div className="scanner-progress-track">
            <motion.i
              initial={{ width: 0 }}
              animate={{ width: `${screenWidth}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
        <div>
          <span><ScanSearch size={17} /> Analyses TradingAgents</span>
          <strong>{analysis.completed} / {analysis.total}</strong>
          <div className="scanner-progress-track">
            <motion.i
              initial={{ width: 0 }}
              animate={{ width: `${analysisWidth}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
      </div>

      {activeTicker ? (
        <div className="scanner-active-live-card">
          <div className="scanner-active-live-header" onClick={() => setShowLiveWorkflow(!showLiveWorkflow)}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="pulse-live-indicator" />
              <strong>Analyse active : {displayedAnalysis?.ticker || activeTicker}</strong>
              <span className="live-pill">{displayedAnalysis?.status === "complete" ? "Terminé" : "Direct"}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              {displayedAnalysis?.total_tokens ? (
                <span className="workflow-sub-metric">
                  <Zap size={13} /> {formatTokens(displayedAnalysis.total_tokens)} tokens
                </span>
              ) : null}
              {displayedAnalysis?.elapsed ? (
                <span className="workflow-sub-metric">
                  <Clock3 size={13} /> {displayedAnalysis.elapsed}
                </span>
              ) : null}
              <button
                type="button"
                className="chip-button compact"
                style={{ fontSize: "11px", padding: "3px 8px" }}
              >
                {showLiveWorkflow ? "Masquer le déroulement" : "Afficher les 6 étapes"}
              </button>
            </div>
          </div>

          {/* Multi-analysis parallel switcher tabs */}
          {candidatesWithAnalysis.length > 1 ? (
            <div className="scanner-parallel-tabs-row">
              <span className="scanner-parallel-tabs-label">Analyses en parallèle :</span>
              {candidatesWithAnalysis.map((c) => {
                const isSelected = c.symbol === activeTicker;
                const cJob = job.child_analyses?.[c.symbol];
                const isRunning = c.analysis_status === "running" || cJob?.status === "running";
                const isComplete = c.analysis_status === "complete" || cJob?.status === "complete";
                return (
                  <button
                    key={c.symbol}
                    type="button"
                    className={`scanner-parallel-tab ${isSelected ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onSelectTicker) onSelectTicker(c.symbol);
                    }}
                    title={`Afficher le direct de ${c.symbol}`}
                  >
                    {isRunning ? <span className="pulse-live-indicator" style={{ width: 7, height: 7 }} /> : null}
                    {isComplete ? <CheckCircle2 size={12} style={{ color: "var(--signal-bullish, #10b981)" }} /> : null}
                    <strong>{c.symbol}</strong>
                    <small>{isRunning ? "En direct" : isComplete ? "Analysé" : "En attente"}</small>
                    {cJob?.total_tokens ? (
                      <span className="tab-tokens-badge">{formatTokens(cJob.total_tokens)}</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          ) : null}

          <AnimatePresence>
            {showLiveWorkflow ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                style={{ overflow: "hidden" }}
              >
                <div style={{ marginTop: "14px" }}>
                  {displayedAnalysis ? (
                    <Workflow
                      key={displayedAnalysis.ticker || displayedAnalysis.id}
                      job={displayedAnalysis}
                      defaultDataSteps={displayedAnalysis.data_steps || []}
                      title={`Déroulement de l'analyse : ${displayedAnalysis.ticker}`}
                      subtitle={`${displayedAnalysis.ticker} · ${displayedAnalysis.llm_calls || 0} appels IA · ${displayedAnalysis.tool_calls || 0} sources de données`}
                    />
                  ) : (
                    <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)", fontSize: "13px" }}>
                      Initialisation de l'analyse multi-agents pour <strong>{activeTicker}</strong>...
                    </div>
                  )}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ) : null}
    </motion.section>
  );
}

function ScannerWatchlistButton({ symbol }) {
  const { isInWatchlist, toggleWatchlist } = useWatchlist();
  const bookmarked = isInWatchlist(symbol);

  const handleToggle = () => {
    toggleWatchlist(symbol);
  };

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`chip-button watchlist-toggle-chip ${bookmarked ? "bookmarked" : ""}`}
      onClick={handleToggle}
      title={bookmarked ? "Dans votre Watchlist (cliquer pour retirer)" : "Ajouter à la Watchlist"}
    >
      <Bookmark size={13} fill={bookmarked ? "currentColor" : "none"} />
      <span>{bookmarked ? "Suivi" : "Watchlist"}</span>
    </motion.button>
  );
}

function RankingTable({ candidates, final = false, onOpenAnalysis, jobStatus, history = [], onSelectTicker, selectedTicker }) {
  if (!candidates?.length) return null;
  return (
    <div className="scanner-table-wrap">
      <table className="scanner-table">
        <thead>
          <tr>
            <th>Rang</th>
            <th>Action</th>
            {final ? <th>Décision agents</th> : <th>État</th>}
            <th>Tendance</th>
            <th>{final ? "Score final" : "Score préfiltre"}</th>
            <th>20 jours</th>
            <th>60 jours</th>
            <th>Volatilité</th>
            <th>Actions</th>
          </tr>
        </thead>
        <motion.tbody
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
          }}
        >
          {candidates.map((candidate) => {
            const isSelected = candidate.symbol === selectedTicker;
            const isRunning = candidate.analysis_status === "running";
            return (
              <motion.tr
                key={candidate.symbol}
                className={`${candidate.blocked ? "blocked-row" : ""} ${isSelected ? "selected-row" : ""}`}
                variants={{
                  hidden: { opacity: 0, y: 8 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
                }}
              >
                <td data-label="Rang">{final ? candidate.final_rank || "—" : candidate.prefilter_rank}</td>
                <td data-label="Action">
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                      <strong>{candidate.symbol}</strong>
                      {getCompanyName(candidate.symbol, true) || candidate.company_name ? (
                        <span style={{ color: "var(--muted)", fontSize: "11px", fontWeight: "500" }}>
                          {getCompanyName(candidate.symbol, true) || candidate.company_name}
                        </span>
                      ) : null}
                    </div>
                    <small>{formatNumber(candidate.latest_close, 2)} {getCurrencySymbol(candidate.symbol)} · {formatDateFr(candidate.latest_date)}</small>
                  </div>
                </td>
                <td data-label={final ? "Décision" : "État"}>
                  {final ? (
                    <DecisionBadge decision={candidate.display_decision || candidate.raw_decision} size="sm" />
                  ) : (
                    <button
                      type="button"
                      className={`scanner-row-status-btn scanner-row-status ${
                        ["error", "interrupted"].includes(jobStatus) && ["running", "queued", "error"].includes(candidate.analysis_status)
                          ? "error"
                          : candidate.analysis_status
                      }`}
                      onClick={() => onSelectTicker && onSelectTicker(candidate.symbol)}
                      title={isRunning ? `Cliquer pour suivre le direct de ${candidate.symbol}` : undefined}
                    >
                      {isRunning ? <span className="pulse-live-indicator" style={{ width: 6, height: 6, marginRight: 4 }} /> : null}
                      {statusCopy(candidate, jobStatus)}
                    </button>
                  )}
                </td>
                <td data-label="Tendance">
                  <Sparkline
                    data={candidate.sparkline}
                    width={88}
                    height={22}
                    showChange={false}
                    showDots={true}
                  />
                </td>
                <td data-label="Score">
                  <strong className="scanner-score">{formatNumber(final ? candidate.final_score : candidate.prefilter_score)}</strong>
                  <small>/ 100</small>
                </td>
                <td data-label="20 jours" className={(candidate.momentum_20d || 0) >= 0 ? "metric-up" : "metric-down"}>{formatPercent(candidate.momentum_20d)}</td>
                <td data-label="60 jours" className={(candidate.momentum_60d || 0) >= 0 ? "metric-up" : "metric-down"}>{formatPercent(candidate.momentum_60d)}</td>
                <td data-label="Volatilité">{formatPercent(candidate.volatility, false)}</td>
                <td className="scanner-report-cell">
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    {final || candidate.analysis_status === "complete" ? (
                      <motion.button
                        type="button"
                        className="scanner-report-button"
                        onClick={() => {
                          const targetId =
                            candidate.analysis_job_id ||
                            candidate.id ||
                            (history || []).find((h) => (h.ticker || "").toUpperCase() === (candidate.symbol || "").toUpperCase())?.id;
                          if (targetId) {
                            onOpenAnalysis(targetId);
                          } else {
                            onOpenAnalysis({ ticker: candidate.symbol });
                          }
                        }}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <ExternalLink size={14} /> Consulter
                      </motion.button>
                    ) : isRunning ? (
                      <motion.button
                        type="button"
                        className="scanner-report-button live"
                        onClick={() => onSelectTicker && onSelectTicker(candidate.symbol)}
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                      >
                        <Zap size={13} /> Direct
                      </motion.button>
                    ) : null}
                    <ScannerWatchlistButton symbol={candidate.symbol} />
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </motion.tbody>
      </table>
    </div>
  );
}

export default function ScannerPage({ online, job, setJob, onOpenAnalysis, onAddToWatchlist, onCompareTickers, history = [] }) {
  const [catalog, setCatalog] = useState([]);
  const [selectedLiveTicker, setSelectedLiveTicker] = useState(null);
  const [form, setForm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const queryTicker = params.get("ticker") || params.get("symbols");
    if (queryTicker) {
      return {
        ...INITIAL_SCANNER_FORM,
        universe: "custom",
        symbols: queryTicker.toUpperCase(),
      };
    }
    return INITIAL_SCANNER_FORM;
  });
  const [error, setError] = useState("");
  const busy = Boolean(job && ["queued", "running"].includes(job.status));
  const selectedUniverse = useMemo(
    () => catalog.find((universe) => universe.id === form.universe),
    [catalog, form.universe],
  );

  useEffect(() => {
    api("/api/scanner/universes")
      .then((payload) => {
        setCatalog(payload.universes || []);
        setForm((current) => {
          const params = new URLSearchParams(window.location.search);
          const queryTicker = params.get("ticker") || params.get("symbols");
          if (queryTicker) {
            return {
              ...current,
              universe: "custom",
              symbols: queryTicker.toUpperCase(),
            };
          }
          return { ...current, ...(payload.defaults || {}) };
        });
      })
      .catch((requestError) => setError(requestError.message));
  }, []);

  useEffect(() => {
    if (!busy || !job?.id) return undefined;
    const timer = window.setInterval(async () => {
      try {
        const next = await api(`/api/scans/${job.id}`);
        setError("");
        setJob(next);
      } catch (requestError) {
        setError(`Impossible d’actualiser le scan : ${requestError.message}`);
      }
    }, 2500);
    return () => window.clearInterval(timer);
  }, [busy, job?.id, setJob]);

  const handleResetScan = () => {
    localStorage.removeItem("tradingagents_scan_id");
    api("/api/scans/active", { method: "DELETE" }).catch(() => {});
    setError("");
    setSelectedLiveTicker(null);
    if (setJob) setJob(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSelectedLiveTicker(null);
    try {
      const next = await api("/api/scans", { method: "POST", body: JSON.stringify(form) });
      setJob(next);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="page scanner-page">
      <div className="page-heading scanner-heading">
        <div>
          <h1>Scanner le marché</h1>
          <p>Préfiltrez un univers avec des données OHLCV, puis soumettez les meilleurs candidats à TradingAgents pour obtenir un classement final.</p>
        </div>
        {job && !busy ? (
          <motion.button
            type="button"
            className="secondary-button"
            onClick={handleResetScan}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw size={17} /> Nouveau scan
          </motion.button>
        ) : null}
      </div>

      <form className="scanner-form" onSubmit={submit}>
        <label className="field scanner-universe-field">
          <span>Univers d’actions</span>
          <select value={form.universe} disabled={busy} onChange={(event) => setForm((current) => ({ ...current, universe: event.target.value }))}>
            {catalog.map((universe) => <option key={universe.id} value={universe.id}>{universe.label}{universe.count ? ` · ${universe.count}` : ""}</option>)}
          </select>
          <small>{selectedUniverse?.description || "Chargement des univers…"}</small>
        </label>
        {form.universe === "custom" ? (
          <label className="field scanner-symbols-field">
            <span>Symboles</span>
            <textarea value={form.symbols} disabled={busy} rows="2" placeholder="AAPL, MSFT, MC.PA" onChange={(event) => setForm((current) => ({ ...current, symbols: event.target.value }))} />
          </label>
        ) : null}
        <label className="field">
          <span>Date d’analyse</span>
          <input type="date" max={TODAY} value={form.date} disabled={busy} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} />
        </label>
        <label className="field">
          <span>Titres préfiltrés</span>
          <select value={form.prefilter_limit} disabled={busy} onChange={(event) => setForm((current) => ({ ...current, prefilter_limit: Number(event.target.value) }))}>
            {[5, 8, 10, 15, 20].map((value) => <option value={value} key={value}>Top {value}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Analyses complètes</span>
          <select value={form.analysis_limit} disabled={busy} onChange={(event) => setForm((current) => ({ ...current, analysis_limit: Number(event.target.value) }))}>
            {[1, 2, 3, 4, 5].map((value) => <option value={value} key={value}>Top {value}</option>)}
          </select>
        </label>
        <motion.button
          className="primary-button scanner-launch-button"
          type="submit"
          disabled={busy || !online || !catalog.length}
          whileHover={busy || !online ? {} : { scale: 1.02 }}
          whileTap={busy || !online ? {} : { scale: 0.98 }}
        >
          {busy ? <LoaderCircle className="spin" size={18} /> : <Play size={18} fill="currentColor" />}
          {busy ? "Scan en cours" : "Lancer le scanner"}
        </motion.button>
      </form>

      <section className="scanner-method" aria-label="Méthode du scanner">
        <span><strong>1</strong> Univers</span>
        <i />
        <span><strong>2</strong> Préfiltre quantitatif</span>
        <i />
        <span><strong>3</strong> TradingAgents</span>
        <i />
        <span><strong>4</strong> Classement final</span>
      </section>

      {!online ? <div className="connection-error"><AlertTriangle size={18} /> La passerelle IA doit être disponible pour analyser les candidats.</div> : null}
      {error ? (
        <div className="connection-error" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            title="Masquer ce message"
            aria-label="Fermer le message"
            style={{ color: "inherit", background: "none", border: "none", cursor: "pointer", padding: "4px" }}
          >
            <X size={15} />
          </button>
        </div>
      ) : null}
      {job?.status === "error" ? (
        <div className="connection-error" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <AlertTriangle size={18} />
            <span>{job.error || "Le scan a été interrompu."}</span>
          </div>
          <button
            type="button"
            className="secondary-button compact"
            onClick={handleResetScan}
            style={{ marginLeft: "auto", height: "30px", fontSize: "11.5px", padding: "0 12px" }}
          >
            <RefreshCw size={13} /> Préparer un nouveau scan
          </button>
        </div>
      ) : null}
      {job ? <ScanProgress job={job} onReset={handleResetScan} selectedTicker={selectedLiveTicker} onSelectTicker={setSelectedLiveTicker} /> : (
        <section className="scanner-empty-state">
          <ScanSearch size={36} />
          <h2>Un classement en deux temps</h2>
          <p>Le préfiltre compare rapidement tout l’univers. Seuls les meilleurs candidats déclenchent ensuite l’analyse multi-agents, plus longue et plus coûteuse.</p>
        </section>
      )}

      <AnimatePresence>
        {job?.ranking?.length ? (() => {
          const completedRanking = (job.ranking || []).filter((c) => c.analysis_status === "complete" || c.display_decision || c.analysis_job_id);
          const canCompare = completedRanking.length >= 2;
          return (
            <motion.section
              className="scanner-results-panel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="scanner-panel-heading">
                <div>
                  <CheckCircle2 size={21} />
                  <div><h2>Classement TradingAgents</h2><p>45 % préfiltre quantitatif · 55 % décision des agents</p></div>
                </div>
                {onCompareTickers ? (
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={!canCompare}
                    onClick={() => canCompare && onCompareTickers(completedRanking.slice(0, 3).map((c) => c.symbol))}
                    title={canCompare ? `Comparer le Top ${Math.min(3, completedRanking.length)} des actions analysées` : "Au moins 2 analyses doivent être terminées pour activer la comparaison"}
                  >
                    <Scale size={16} /> Comparer le Top {canCompare ? Math.min(3, completedRanking.length) : Math.min(3, job.ranking.length)}
                  </button>
                ) : null}
              </div>
              <RankingTable candidates={job.ranking} final onOpenAnalysis={onOpenAnalysis} jobStatus={job.status} history={history} onSelectTicker={setSelectedLiveTicker} selectedTicker={selectedLiveTicker} />
            </motion.section>
          );
        })() : null}
      </AnimatePresence>

      <AnimatePresence>
        {job?.candidates?.length ? (() => {
          const completedCandidates = (job.candidates || []).filter(
            (c) => c.analysis_status === "complete" || (job.child_analyses?.[c.symbol]?.status === "complete") || c.analysis_job_id
          );
          const canCompare = completedCandidates.length >= 2;
          return (
            <motion.section
              className="scanner-results-panel"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <div className="scanner-panel-heading">
                <div>
                  <BarChart3 size={21} />
                  <div><h2>Préfiltrage de l’univers</h2><p>Momentum 20/60 jours, tendance, liquidité et volatilité</p></div>
                </div>
                {onCompareTickers ? (
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={!canCompare}
                    onClick={() => canCompare && onCompareTickers(completedCandidates.slice(0, 3).map((c) => c.symbol))}
                    title={canCompare ? `Comparer les ${Math.min(3, completedCandidates.length)} analyses terminées` : "Au moins 2 analyses doivent être terminées pour activer la comparaison"}
                  >
                    <Scale size={16} /> Comparer {canCompare ? `le Top ${Math.min(3, completedCandidates.length)}` : `(2 requises)`}
                  </button>
                ) : null}
              </div>
              <RankingTable candidates={job.candidates} onOpenAnalysis={onOpenAnalysis} jobStatus={job.status} history={history} onSelectTicker={setSelectedLiveTicker} selectedTicker={selectedLiveTicker} />
            </motion.section>
          );
        })() : null}
      </AnimatePresence>
    </main>
  );
}
