import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ExternalLink,
  LoaderCircle,
  Play,
  RefreshCw,
  ScanSearch,
  ShieldCheck,
} from "lucide-react";
import { api } from "./api.js";
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

function formatPercent(value) {
  if (value === null || value === undefined) return "—";
  const numeric = Number(value);
  return `${numeric > 0 ? "+" : ""}${formatNumber(numeric)} %`;
}

function decisionTone(decision) {
  const normalized = String(decision || "").toUpperCase();
  if (["BUY", "ACHETER", "OVERWEIGHT"].includes(normalized)) return "positive";
  if (["SELL", "VENDRE", "UNDERWEIGHT"].includes(normalized)) return "negative";
  return "neutral";
}

function statusCopy(candidate) {
  return {
    queued: "À analyser",
    running: "Analyse en cours",
    complete: "Analysé",
    blocked: "Contrôle bloquant",
    error: "Échec de l’analyse",
    prefiltered: "Préfiltré",
  }[candidate.analysis_status] || "Préfiltré";
}

function ScanProgress({ job }) {
  const screening = job.screen_progress || { completed: 0, total: 0 };
  const analysis = job.analysis_progress || { completed: 0, total: 0 };
  const screenWidth = screening.total ? (screening.completed / screening.total) * 100 : 0;
  const analysisWidth = analysis.total ? (analysis.completed / analysis.total) * 100 : 0;
  const activeAnalysis = job.active_analysis;

  return (
    <section className="scanner-progress-panel" aria-live="polite">
      <div className="scanner-panel-heading">
        <div>
          <span className={`scanner-status-dot ${job.status}`} />
          <div>
            <h2>{job.stage_label}</h2>
            <p>{job.active_symbol ? `Analyse de ${job.active_symbol}` : job.logs?.at(-1)}</p>
          </div>
        </div>
        <span className="scanner-elapsed">{job.elapsed}</span>
      </div>
      <div className="scanner-progress-grid">
        <div>
          <span><BarChart3 size={17} /> Univers préfiltré</span>
          <strong>{screening.completed} / {screening.total}</strong>
          <div className="scanner-progress-track"><i style={{ width: `${screenWidth}%` }} /></div>
        </div>
        <div>
          <span><ScanSearch size={17} /> Analyses TradingAgents</span>
          <strong>{analysis.completed} / {analysis.total}</strong>
          <div className="scanner-progress-track"><i style={{ width: `${analysisWidth}%` }} /></div>
        </div>
      </div>
      {activeAnalysis ? (
        <div className="scanner-active-analysis">
          <LoaderCircle className="spin" size={18} />
          <span>{activeAnalysis.ticker} · {activeAnalysis.llm_calls || 0} appel(s) modèle · {activeAnalysis.tool_calls || 0} source(s)</span>
        </div>
      ) : null}
    </section>
  );
}

function RankingTable({ candidates, final = false, onOpenAnalysis }) {
  if (!candidates?.length) return null;
  return (
    <div className="scanner-table-wrap">
      <table className="scanner-table">
        <thead>
          <tr>
            <th>Rang</th>
            <th>Action</th>
            {final ? <th>Décision agents</th> : <th>État</th>}
            <th>{final ? "Score final" : "Score préfiltre"}</th>
            <th>20 jours</th>
            <th>60 jours</th>
            <th>Volatilité</th>
            {final ? <th aria-label="Rapport" /> : null}
          </tr>
        </thead>
        <tbody>
          {candidates.map((candidate) => (
            <tr key={candidate.symbol} className={candidate.blocked ? "blocked-row" : ""}>
              <td data-label="Rang">{final ? candidate.final_rank || "—" : candidate.prefilter_rank}</td>
              <td data-label="Action">
                <strong>{candidate.symbol}</strong>
                <small>{formatNumber(candidate.latest_close, 2)} · {candidate.latest_date}</small>
              </td>
              <td data-label={final ? "Décision" : "État"}>
                {final ? (
                  <span className={`scanner-decision ${decisionTone(candidate.raw_decision)}`}>
                    {candidate.display_decision || candidate.raw_decision || "—"}
                  </span>
                ) : <span className={`scanner-row-status ${candidate.analysis_status}`}>{statusCopy(candidate)}</span>}
              </td>
              <td data-label="Score">
                <strong className="scanner-score">{formatNumber(final ? candidate.final_score : candidate.prefilter_score)}</strong>
                <small>/ 100</small>
              </td>
              <td data-label="20 jours" className={(candidate.momentum_20d || 0) >= 0 ? "metric-up" : "metric-down"}>{formatPercent(candidate.momentum_20d)}</td>
              <td data-label="60 jours" className={(candidate.momentum_60d || 0) >= 0 ? "metric-up" : "metric-down"}>{formatPercent(candidate.momentum_60d)}</td>
              <td data-label="Volatilité">{formatPercent(candidate.volatility)}</td>
              {final ? (
                <td className="scanner-report-cell">
                  <button
                    type="button"
                    className="scanner-report-button"
                    onClick={() => onOpenAnalysis(candidate.analysis_job_id)}
                    disabled={!candidate.analysis_job_id}
                  >
                    <ExternalLink size={15} /> Voir l’analyse
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function ScannerPage({ online, job, setJob, onOpenAnalysis }) {
  const [catalog, setCatalog] = useState([]);
  const [form, setForm] = useState(INITIAL_SCANNER_FORM);
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
        setForm((current) => ({ ...current, ...(payload.defaults || {}) }));
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

  const submit = async (event) => {
    event.preventDefault();
    setError("");
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
          <button type="button" className="secondary-button" onClick={() => setJob(null)}>
            <RefreshCw size={17} /> Nouveau scan
          </button>
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
        <button className="primary-button scanner-launch-button" type="submit" disabled={busy || !online || !catalog.length}>
          {busy ? <LoaderCircle className="spin" size={18} /> : <Play size={18} fill="currentColor" />}
          {busy ? "Scan en cours" : "Lancer le scanner"}
        </button>
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
      {error ? <div className="connection-error"><AlertTriangle size={18} /> {error}</div> : null}
      {job?.status === "error" ? <div className="connection-error"><AlertTriangle size={18} /> {job.error}</div> : null}
      {job ? <ScanProgress job={job} /> : (
        <section className="scanner-empty-state">
          <ScanSearch size={36} />
          <h2>Un classement en deux temps</h2>
          <p>Le préfiltre compare rapidement tout l’univers. Seuls les meilleurs candidats déclenchent ensuite l’analyse multi-agents, plus longue et plus coûteuse.</p>
        </section>
      )}

      {job?.ranking?.length ? (
        <section className="scanner-results-panel">
          <div className="scanner-panel-heading">
            <div>
              <CheckCircle2 size={21} />
              <div><h2>Classement TradingAgents</h2><p>45 % préfiltre quantitatif · 55 % décision des agents</p></div>
            </div>
          </div>
          <RankingTable candidates={job.ranking} final onOpenAnalysis={onOpenAnalysis} />
        </section>
      ) : null}

      {job?.candidates?.length ? (
        <section className="scanner-results-panel">
          <div className="scanner-panel-heading">
            <div>
              <BarChart3 size={21} />
              <div><h2>Préfiltrage de l’univers</h2><p>Momentum 20/60 jours, tendance, liquidité et volatilité</p></div>
            </div>
          </div>
          <RankingTable candidates={job.candidates} onOpenAnalysis={onOpenAnalysis} />
        </section>
      ) : null}

      <div className="scanner-disclaimer">
        <ShieldCheck size={18} />
        <p><strong>Outil de recherche, pas conseil financier.</strong> Le score sert à prioriser les analyses ; il ne prédit pas les performances futures et n’exécute aucun ordre.</p>
      </div>
    </main>
  );
}
