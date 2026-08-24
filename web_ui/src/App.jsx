import { useEffect, useMemo, useState } from "react";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  interruptJob,
  isMissingJobError,
  TRANSIENT_POLL_MESSAGE,
} from "./jobPolling.js";
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Bot,
  Box,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  Database,
  ExternalLink,
  FileText,
  Gauge,
  History,
  LoaderCircle,
  Menu,
  MessageSquareText,
  Newspaper,
  Play,
  Plus,
  RefreshCw,
  Scale,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  ["analysis", "Nouvelle analyse", TrendingUp],
  ["history", "Historique", History],
  ["models", "Modèles", Box],
  ["settings", "Configuration", Settings],
];

const ANALYSTS = [
  ["market", "Marché", BarChart3],
  ["news", "Actualités", Newspaper],
  ["social", "Sentiment", MessageSquareText],
  ["fundamentals", "Fondamentaux", BookOpen],
];

const TAB_ITEMS = [
  ["summary", "Synthèse", FileText],
  ["analysts", "Analystes", Users],
  ["debate", "Débat", MessageSquareText],
  ["risks", "Risques", ShieldCheck],
  ["report", "Rapport complet", BookOpen],
];

const INITIAL_FORM = {
  ticker: "AAPL",
  date: new Date().toISOString().slice(0, 10),
  depth: 1,
  analysts: ["market", "news", "social", "fundamentals"],
};

const DATA_COLLECTION_COPY = "Avant de lancer les agents, l’application contrôle les données de marché avec Yahoo Finance : téléchargement ou lecture du cache local de 5 ans d’OHLCV quotidiens ajustés (ouverture, plus haut, plus bas, clôture, volume). Elle vérifie qu’aucune ligne ne dépasse la date d’analyse, refuse les données dont la dernière séance date de plus de 10 jours, retient les 30 dernières clôtures et calcule localement 11 indicateurs (EMA/SMA, RSI, bandes de Bollinger, MACD, ATR).";

async function api(path, options) {
  const response = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `Erreur HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 34 34" aria-hidden="true">
      <path d="M4 26 12 7l5 12 5-12 8 19" />
      <path d="m9 20 8-10 8 10" />
    </svg>
  );
}

function Sidebar({ page, onPage, online, model, analysisActive, open, onClose }) {
  return (
    <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
      <div className="brand-row">
        <LogoMark />
        <span className="brand">TradingAgents</span>
        <button className="mobile-close icon-button" onClick={onClose} aria-label="Fermer le menu">
          <X size={20} />
        </button>
      </div>
      <nav className="primary-nav" aria-label="Navigation principale">
        {NAV_ITEMS.map(([id, label, Icon]) => {
          const active = id === "history" ? ["history", "history-detail"].includes(page) : page === id;
          const visibleLabel = id === "analysis" && analysisActive ? "Analyse en cours" : label;
          return (
          <button
            className={`nav-item ${active ? "active" : ""}`}
            key={id}
            onClick={() => {
              onPage(id);
              onClose();
            }}
          >
            <Icon size={21} strokeWidth={1.7} />
            <span>{visibleLabel}</span>
            {id === "analysis" && analysisActive ? <span className="nav-progress-badge" aria-hidden="true" /> : null}
          </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="model-state">
          <div className={`status-dot ${online ? "online" : "offline"}`} />
          <div>
            <strong>{online ? "Ollama" : "Ollama hors ligne"}</strong>
            <span>{model || "qwen3:8b"}</span>
          </div>
        </div>
        <div className="local-note">Modèle local · aucune clé externe</div>
      </div>
    </aside>
  );
}

function Topbar({ onMenu, online, model }) {
  return (
    <header className="mobile-topbar">
      <button className="icon-button" onClick={onMenu} aria-label="Ouvrir le menu">
        <Menu size={22} />
      </button>
      <span className="brand">TradingAgents</span>
      <span className={`status-dot ${online ? "online" : "offline"}`} title={model} />
    </header>
  );
}

function AnalystToggle({ id, label, Icon, selected, disabled, onToggle }) {
  return (
    <button
      type="button"
      className={`analyst-toggle ${selected ? "selected" : ""}`}
      onClick={() => onToggle(id)}
      disabled={disabled}
      aria-pressed={selected}
    >
      {selected ? <Check size={17} /> : <Icon size={17} />}
      {label}
    </button>
  );
}

function AnalysisForm({ form, setForm, disabled, online, onSubmit }) {
  const toggleAnalyst = (id) => {
    setForm((current) => {
      const exists = current.analysts.includes(id);
      if (exists && current.analysts.length === 1) return current;
      return {
        ...current,
        analysts: exists
          ? current.analysts.filter((item) => item !== id)
          : [...current.analysts, id],
      };
    });
  };

  return (
    <form className="analysis-form" onSubmit={onSubmit}>
      <label className="field symbol-field">
        <span>Symbole</span>
        <input
          value={form.ticker}
          onChange={(event) => setForm({ ...form, ticker: event.target.value.toUpperCase() })}
          pattern="[A-Za-z0-9.\-^=]{1,20}"
          required
          disabled={disabled}
          aria-label="Symbole boursier"
        />
      </label>
      <label className="field date-field">
        <span>Date d’analyse</span>
        <input
          type="date"
          value={form.date}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(event) => setForm({ ...form, date: event.target.value })}
          required
          disabled={disabled}
        />
      </label>
      <label className="field depth-field">
        <span>Profondeur</span>
        <select
          value={form.depth}
          onChange={(event) => setForm({ ...form, depth: Number(event.target.value) })}
          disabled={disabled}
        >
          <option value="1">Rapide</option>
          <option value="2">Moyenne</option>
          <option value="3">Approfondie</option>
        </select>
      </label>
      <fieldset className="analyst-field" disabled={disabled}>
        <legend>Analystes</legend>
        <div className="analyst-options">
          {ANALYSTS.map(([id, label, Icon]) => (
            <AnalystToggle
              key={id}
              id={id}
              label={label}
              Icon={Icon}
              selected={form.analysts.includes(id)}
              disabled={disabled}
              onToggle={toggleAnalyst}
            />
          ))}
        </div>
      </fieldset>
      <button className="primary-button launch-button" type="submit" disabled={disabled || !online}>
        {disabled ? <LoaderCircle className="spin" size={18} /> : <Play size={18} fill="currentColor" />}
        {disabled ? "Analyse en cours…" : "Analyser cette action"}
      </button>
    </form>
  );
}

function StageIcon({ id, status }) {
  const icons = {
    data: Database,
    analysts: Users,
    debate: MessageSquareText,
    trader: Scale,
    risks: ShieldCheck,
    portfolio: BriefcaseBusiness,
  };
  const Icon = icons[id] || Circle;
  if (status === "complete") return <CheckCircle2 size={24} />;
  if (status === "active") return <LoaderCircle className="spin" size={24} />;
  return <Icon size={23} />;
}

function Workflow({ job, connectionUnverified = false }) {
  const stages = job?.stages || [
    ["data", "Données", DATA_COLLECTION_COPY],
    ["analysts", "Analystes", "En attente"],
    ["debate", "Débat", "En attente"],
    ["trader", "Trader", "En attente"],
    ["risks", "Risques", "En attente"],
    ["portfolio", "Portefeuille", "En attente"],
  ].map(([id, label, detail]) => ({ id, label, status: "pending", detail }));

  return (
    <section className="workflow-panel" aria-live="polite">
      <div className="workflow-head">
        <div>
          <h2>Suivi de l’analyse</h2>
          <p>{job ? `${job.ticker} · ${job.llm_calls || 0} échanges avec le modèle local` : "Les étapes s’afficheront ici dès que vous lancerez l’analyse."}</p>
        </div>
        {job?.elapsed ? <span className="elapsed"><Clock3 size={15} /> {job.elapsed}</span> : null}
      </div>
      <div className="stage-list">
        {stages.map((stage, index) => {
          const displayStatus = connectionUnverified && stage.status === "active" ? "unverified" : stage.status;
          return (
          <div className={`stage-row ${displayStatus}`} key={stage.id}>
            <div className="stage-rail" aria-hidden="true">
              <span className="stage-node"><StageIcon id={stage.id} status={displayStatus} /></span>
              {index < stages.length - 1 ? <span className="stage-line" /> : null}
            </div>
            <div className="stage-main">
              <div className="stage-title-row">
                <h3>{stage.label}</h3>
                <span className="stage-status">
                  {displayStatus === "complete" ? "Terminé" : displayStatus === "active" ? "En cours" : displayStatus === "unverified" ? "État non vérifié" : displayStatus === "error" ? job?.status === "interrupted" ? "Interrompu" : "Erreur" : "En attente"}
                </span>
              </div>
              <p>{stage.detail}</p>
              {displayStatus === "active" && job?.logs?.length ? (
                <div className="active-log">{job.logs[job.logs.length - 1]}</div>
              ) : null}
            </div>
          </div>
          );
        })}
      </div>
    </section>
  );
}

function ReliabilityRail({ job, result, connectionUnverified = false }) {
  const checks = result?.reliability?.checks || job?.reliability?.checks || [
    { label: "Cours vérifié", status: "pending", detail: "Le dernier cours sera contrôlé avant de commencer" },
    { label: "Données datées", status: "pending", detail: "La date de la dernière séance apparaîtra ici" },
    { label: "Incohérences bloquantes", status: "pending", detail: "La conclusion sera comparée aux données vérifiées" },
  ];
  const blocked = result?.reliability?.blocked;

  return (
    <aside className="reliability-panel">
      <div className="panel-heading">
        <ShieldCheck size={21} />
        <h2>Contrôles de fiabilité</h2>
      </div>
      <div className="check-list">
        {checks.map((check) => {
          const unverified = connectionUnverified && check.status === "pending";
          const activelyChecking = check.status === "pending" && ["queued", "running"].includes(job?.status) && !connectionUnverified;
          return (
          <div className={`check-row ${unverified ? "unverified" : check.status}`} key={check.label}>
            {check.status === "ok" ? <CheckCircle2 size={21} /> : check.status === "blocked" || unverified ? <AlertTriangle size={21} /> : <LoaderCircle className={activelyChecking ? "spin" : ""} size={21} />}
            <div>
              <strong>{check.label}</strong>
              <span>{unverified ? `État non vérifié — ${check.detail}` : check.detail}</span>
            </div>
          </div>
          );
        })}
      </div>
      {blocked ? (
        <div className="blocking-box">
          <AlertTriangle size={25} />
          <div>
            <strong>Décision non exploitable</strong>
            <p>Une vérification importante ne concorde pas. Corrigez-la avant d’interpréter le résultat.</p>
          </div>
        </div>
      ) : null}
      <div className="warning-box">
        <AlertTriangle size={23} />
        <div>
          <strong>Une analyse IA n’est pas un conseil financier.</strong>
          <p>Gardez un regard critique : les informations peuvent être incomplètes ou inexactes. Vérifiez toujours les sources.</p>
        </div>
      </div>
    </aside>
  );
}

function AnalysisPage({ form, setForm, job, online, pollWarning, onSubmit, onReset }) {
  const busy = job && ["queued", "running"].includes(job.status);
  const result = job?.result;

  if (result) {
    return <ResultPage job={job} onReset={onReset} />;
  }

  return (
    <main className="page analysis-page">
      <div className="page-heading">
        <div>
          <h1>Analyser une action</h1>
          <p>Choisissez une action : plusieurs agents IA locaux confrontent leurs analyses à des données vérifiées.</p>
        </div>
      </div>
      <AnalysisForm form={form} setForm={setForm} disabled={busy} online={online} onSubmit={onSubmit} />
      {!online ? <div className="connection-error"><AlertTriangle size={18} /> Ollama ne répond pas pour le moment. Ouvrez l’application Ollama, puis réessayez.</div> : null}
      {pollWarning ? <div className="connection-warning"><RefreshCw size={18} /> {pollWarning}</div> : null}
      {["error", "interrupted"].includes(job?.status) ? <div className="connection-error"><AlertTriangle size={18} /> {job.error}</div> : null}
      <div className="analysis-grid">
        <Workflow job={job} connectionUnverified={Boolean(pollWarning)} />
        <ReliabilityRail job={job} connectionUnverified={Boolean(pollWarning)} />
      </div>
    </main>
  );
}

function DecisionHero({ result }) {
  const blocked = result.reliability.blocked;
  return (
    <section className={`decision-hero ${blocked ? "blocked" : "clear"}`}>
      <div className="decision-main">
        <span>Décision du portefeuille</span>
        <strong>{result.display_decision}</strong>
      </div>
      <div className="confidence-copy">
        {blocked ? <AlertTriangle size={26} /> : <CheckCircle2 size={26} />}
        <div>
          <strong>{result.confidence}</strong>
          <p>{blocked ? "Certaines vérifications ne concordent pas : cette décision ne doit pas être utilisée." : "Les contrôles locaux n’ont détecté aucune incohérence critique."}</p>
        </div>
      </div>
      <div className="confidence-scale" aria-label={`Niveau de confiance : ${result.confidence}`}>
        <span>Niveau de confiance</span>
        <div className="scale-track"><i style={{ width: blocked ? "18%" : "58%" }} /></div>
        <div className="scale-labels"><span>Très faible</span><span>Moyen</span><span>Élevé</span></div>
      </div>
    </section>
  );
}

function ReportContent({ result, tab }) {
  const reports = result.reports || {};
  const content = {
    summary: result.summary,
    analysts: [reports.market, reports.news, reports.social, reports.fundamentals].filter(Boolean).join("\n\n---\n\n"),
    debate: [reports.bull, reports.bear, reports.research_manager].filter(Boolean).join("\n\n---\n\n"),
    risks: [reports.aggressive, reports.conservative, reports.neutral].filter(Boolean).join("\n\n---\n\n"),
    report: result.complete_report,
  }[tab] || result.summary;

  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "Aucun contenu disponible."}</ReactMarkdown>
    </div>
  );
}

function ResultPage({ job, onReset, historical = false, onBackHistory }) {
  const [tab, setTab] = useState("summary");
  const result = job.result;
  return (
    <main className="page result-page">
      <div className="page-heading result-heading">
        <div>
          <h1>{historical ? `Analyse historique — ${job.ticker}` : `Analyse de ${job.ticker}`}</h1>
          <p>{historical ? "Analyse enregistrée, disponible en consultation uniquement" : `Analyse du ${job.analysis_date} · Ollama · ${job.model}`}{historical ? ` · Réalisée le ${job.analysis_date}` : ""}</p>
        </div>
        <div className="heading-actions">
          {historical ? (
            <>
              <button className="secondary-button" onClick={onBackHistory}><ArrowLeft size={18} /> Retour à l’historique</button>
              <a className="secondary-button" href={`/?history=${encodeURIComponent(job.id)}`} target="_blank" rel="noreferrer"><ExternalLink size={18} /> Ouvrir dans un nouvel onglet</a>
            </>
          ) : <button className="secondary-button" onClick={onReset}><Plus size={18} /> Nouvelle analyse</button>}
          <a className="primary-button" href={`/api/jobs/${job.id}/report`}><FileText size={18} /> Ouvrir le rapport</a>
        </div>
      </div>
      <DecisionHero result={result} />
      <div className="result-grid">
        <section className="report-panel">
          <div className="tabs" role="tablist" aria-label="Sections du rapport">
            {TAB_ITEMS.map(([id, label, Icon]) => (
              <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)} role="tab" aria-selected={tab === id}>
                <Icon size={18} /> {label}
              </button>
            ))}
          </div>
          {result.reliability.blocked ? (
            <div className="inconsistency-banner">
              <AlertTriangle size={27} />
              <div><strong>Incohérence de prix détectée</strong><p>{result.reliability.block_reason}</p></div>
              <span>Bloquant</span>
            </div>
          ) : null}
          <ReportContent result={result} tab={tab} />
        </section>
        <ReliabilityRail result={result} />
      </div>
    </main>
  );
}

function HistoryPage({ history, loadingId, error, onSelect }) {
  return (
    <main className="page simple-page">
      <div className="page-heading"><div><h1>Historique</h1><p>Retrouvez vos analyses précédentes. Elles restent enregistrées sur cet ordinateur.</p></div></div>
      {error ? <div className="connection-error"><AlertTriangle size={18} /> {error}</div> : null}
      <section className="table-panel">
        <div className="table-head"><span>Action</span><span>Date analysée</span><span>Décision</span><span>Fiabilité</span><span>Créée</span></div>
        {history.length ? history.map((item) => (
          <button className="table-row" key={item.id} onClick={() => onSelect(item)} disabled={loadingId === item.id} aria-label={`Ouvrir l’analyse ${item.ticker} du ${item.analysis_date}`}>
            <strong>{item.ticker}</strong><span>{item.analysis_date}</span><span>{item.display_decision || "—"}</span><span className={item.blocked ? "warn-text" : "ok-text"}>{item.blocked ? "Bloquée" : "Contrôlée"}</span><span className="history-created">{item.created_at}{loadingId === item.id ? <LoaderCircle className="spin" size={17} /> : <ChevronRight size={17} />}</span>
          </button>
        )) : <div className="empty-state"><History size={32} /><strong>Aucune analyse enregistrée</strong><span>Votre première analyse apparaîtra ici.</span></div>}
      </section>
    </main>
  );
}

function ModelsPage({ status, refresh }) {
  return (
    <main className="page simple-page">
      <div className="page-heading"><div><h1>Modèles</h1><p>Voici les modèles disponibles dans votre instance Ollama locale.</p></div><button className="secondary-button" onClick={refresh}><RefreshCw size={17} /> Rafraîchir la liste</button></div>
      <section className="model-list-panel">
        <div className="connection-strip"><span className={`status-dot ${status.online ? "online" : "offline"}`} /><strong>{status.online ? "Ollama connecté" : "Ollama hors ligne"}</strong><span>{status.endpoint}</span></div>
        {(status.models || []).map((model) => (
          <div className={`model-row ${model.name === "qwen3:8b" ? "selected" : ""}`} key={model.name}>
            <Bot size={22} /><div><strong>{model.name}</strong><span>{model.size}</span></div>{model.name === "qwen3:8b" ? <span className="active-label">Actif</span> : null}
          </div>
        ))}
      </section>
    </main>
  );
}

function SettingsPage() {
  return (
    <main className="page simple-page">
      <div className="page-heading"><div><h1>Configuration</h1><p>Ces réglages sont utilisés par l’interface sans modifier le projet TradingAgents.</p></div></div>
      <section className="settings-panel">
        <div className="setting-row"><div><Gauge size={21} /><span><strong>Endpoint Ollama</strong><small>Serveur local compatible OpenAI</small></span></div><code>http://localhost:11434/v1</code></div>
        <div className="setting-row"><div><Sparkles size={21} /><span><strong>Modèle</strong><small>Analyse rapide et approfondie</small></span></div><code>qwen3:8b</code></div>
        <div className="setting-row"><div><SlidersHorizontal size={21} /><span><strong>Réflexion hybride</strong><small>Désactivée pour préserver le contexte des agents</small></span></div><code>think=false</code></div>
        <div className="setting-row"><div><ShieldCheck size={21} /><span><strong>Blocage des incohérences</strong><small>Compare les prix proposés au dernier cours vérifié</small></span></div><code>actif</code></div>
      </section>
    </main>
  );
}

export default function App() {
  const [page, setPage] = useState("analysis");
  const [form, setForm] = useState(INITIAL_FORM);
  const [job, setJob] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState({ online: false, models: [], endpoint: "http://localhost:11434" });
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingHistoryId, setLoadingHistoryId] = useState(null);
  const [historyError, setHistoryError] = useState("");
  const [pollWarning, setPollWarning] = useState("");
  const [historyJob, setHistoryJob] = useState(null);

  const analysisActive = Boolean(job && ["queued", "running"].includes(job.status));

  const activeModel = useMemo(() => status.models?.find((item) => item.name === "qwen3:8b")?.name || "qwen3:8b", [status]);

  const loadStatus = async () => {
    try { setStatus(await api("/api/status")); } catch { setStatus((current) => ({ ...current, online: false })); }
  };
  const loadHistory = async () => {
    try { setHistory((await api("/api/history")).items || []); } catch { setHistory([]); }
  };

  useEffect(() => {
    loadStatus();
    loadHistory();
    const historyId = new URLSearchParams(window.location.search).get("history");
    if (!historyId) return;
    setLoadingHistoryId(historyId);
    api(`/api/history/${encodeURIComponent(historyId)}`)
      .then((restored) => {
        setHistoryJob(restored);
        setPage("history-detail");
      })
      .catch((error) => {
        setHistoryError(error.message);
        setPage("history");
      })
      .finally(() => setLoadingHistoryId(null));
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [page, job?.id]);

  useEffect(() => {
    if (!job || !["queued", "running"].includes(job.status)) return undefined;
    const timer = window.setInterval(async () => {
      try {
        const next = await api(`/api/jobs/${job.id}`);
        setPollWarning("");
        setJob(next);
        if (["complete", "error"].includes(next.status)) loadHistory();
      } catch (error) {
        if (isMissingJobError(error)) {
          setPollWarning("");
          setJob((current) => interruptJob(current));
        } else {
          setPollWarning(TRANSIENT_POLL_MESSAGE);
        }
      }
    }, 2500);
    return () => window.clearInterval(timer);
  }, [job?.id, job?.status]);

  const submit = async (event) => {
    event.preventDefault();
    setPollWarning("");
    try {
      const next = await api("/api/analyze", { method: "POST", body: JSON.stringify(form) });
      setJob(next);
    } catch (error) {
      setJob({ status: "error", error: error.message });
    }
  };

  const navigate = (nextPage) => {
    setPage(nextPage);
    if (nextPage !== "history-detail" && window.location.search.includes("history=")) {
      window.history.replaceState({}, "", window.location.pathname);
    }
  };
  const reset = () => { setJob(null); setPollWarning(""); navigate("analysis"); };
  const openHistory = async (item) => {
    setLoadingHistoryId(item.id);
    setHistoryError("");
    try {
      const restored = await api(`/api/history/${item.id}`);
      setHistoryJob(restored);
      setPage("history-detail");
    } catch (error) {
      setHistoryError(error.message);
    } finally {
      setLoadingHistoryId(null);
    }
  };

  return (
    <div className="app-shell">
      <Topbar onMenu={() => setMenuOpen(true)} online={status.online} model={activeModel} />
      <Sidebar page={page} onPage={navigate} online={status.online} model={activeModel} analysisActive={analysisActive} open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen ? <button className="menu-scrim" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu" /> : null}
      <div className="content-shell">
        {page === "analysis" ? <AnalysisPage form={form} setForm={setForm} job={job} online={status.online} pollWarning={pollWarning} onSubmit={submit} onReset={reset} /> : null}
        {page === "history" ? <HistoryPage history={history} loadingId={loadingHistoryId} error={historyError} onSelect={openHistory} /> : null}
        {page === "history-detail" && historyJob ? <ResultPage key={historyJob.id} job={historyJob} historical onBackHistory={() => navigate("history")} /> : null}
        {page === "models" ? <ModelsPage status={status} refresh={loadStatus} /> : null}
        {page === "settings" ? <SettingsPage /> : null}
      </div>
    </div>
  );
}
