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
  ArrowDownRight,
  ArrowUpRight,
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
  LayoutGrid,
  Menu,
  MessageSquareText,
  Minus,
  Newspaper,
  Play,
  Plus,
  RefreshCw,
  Scale,
  ScanSearch,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { api } from "./api.js";
import ScannerPage from "./ScannerPage.jsx";

const NAV_ITEMS = [
  ["analysis", "Nouvelle analyse", TrendingUp],
  ["scanner", "Scanner", ScanSearch],
  ["history", "Historique", History],
  ["models", "Modèles", Box],
  ["settings", "Configuration", Settings],
];

const ANALYST_ICONS = {
  market: BarChart3,
  news: Newspaper,
  social: MessageSquareText,
  fundamentals: BookOpen,
};

const TAB_ITEMS = [
  ["image", "Image", LayoutGrid],
  ["summary", "Synthèse", FileText],
  ["analysts", "Analystes", Users],
  ["debate", "Débat", MessageSquareText],
  ["risks", "Risques", ShieldCheck],
  ["report", "Rapport complet", BookOpen],
];

const REPORT_LINK_LABELS = {
  market: "Marché",
  social: "Sentiment du marché",
  news: "Actualités",
  fundamentals: "Fondamentaux",
  bull: "Analyste haussier",
  bear: "Analyste baissier",
};

const INITIAL_FORM = {
  ticker: "AAPL",
  date: new Date().toISOString().slice(0, 10),
  depth: 1,
  analysts: [],
};

const DATA_COLLECTION_COPY = "Avant de lancer les agents, l’application contrôle les données de marché avec Yahoo Finance : téléchargement ou lecture du cache local de 5 ans d’OHLCV quotidiens ajustés (ouverture, plus haut, plus bas, clôture, volume). Elle vérifie qu’aucune ligne ne dépasse la date d’analyse, refuse les données dont la dernière séance date de plus de 10 jours, retient les 30 dernières clôtures et calcule localement 11 indicateurs (EMA/SMA, RSI, bandes de Bollinger, MACD, ATR).";
const formatTokens = (value) => value === null || value === undefined || value === ""
  ? "Non disponible"
  : Number(value).toLocaleString("fr-FR");

function cleanReportText(value) {
  return String(value || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^[\s>*#\d.)-]+/g, "")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function reportHighlights(value, count = 1) {
  const ignored = /^(analyse|résumé|conclusion|recommandation|note|rapport sur|fin du rapport|key observations|recommendations?|[A-Z]\.\s)\b/i;
  const lines = String(value || "")
    .split(/\n+/)
    .map(cleanReportText)
    .filter((line) => line.length >= 45 && !ignored.test(line) && !/:\s*$/.test(line));
  return [...new Set(lines)].slice(0, count).map((line) => (
    line.length > 210 ? `${line.slice(0, 207).replace(/\s+\S*$/, "")}…` : line
  ));
}

function numberValue(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const parsed = Number(String(value ?? "").replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatMarketNumber(value, maximumFractionDigits = 2) {
  const parsed = numberValue(value);
  return parsed === null
    ? "Non disponible"
    : parsed.toLocaleString("fr-FR", { maximumFractionDigits });
}

function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 34 34" aria-hidden="true">
      <path d="M4 26 12 7l5 12 5-12 8 19" />
      <path d="m9 20 8-10 8 10" />
    </svg>
  );
}

function Sidebar({ page, onPage, online, model, provider, analysisActive, scanActive, open, onClose }) {
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
          const visibleLabel = id === "analysis" && analysisActive
            ? "Analyse en cours"
            : id === "scanner" && scanActive ? "Scan en cours" : label;
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
            {(id === "analysis" && analysisActive) || (id === "scanner" && scanActive)
              ? <span className="nav-progress-badge" aria-hidden="true" />
              : null}
          </button>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div className="model-state">
          <div className={`status-dot ${online ? "online" : "offline"}`} />
          <div>
            <strong>{online ? provider : `${provider} hors ligne`}</strong>
            <span>{model || "Modèle non détecté"}</span>
          </div>
        </div>
        <div className="local-note">Passerelle locale</div>
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

function AnalystToggle({ id, label, description, Icon, selected, disabled, onToggle }) {
  return (
    <button
      type="button"
      className={`analyst-toggle ${selected ? "selected" : ""}`}
      onClick={() => onToggle(id)}
      disabled={disabled}
      aria-pressed={selected}
    >
      <span className="analyst-card-icon" aria-hidden="true">
        {selected ? <Check size={17} /> : <Icon size={17} />}
      </span>
      <span className="analyst-card-copy">
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
    </button>
  );
}

function AnalysisForm({ form, setForm, disabled, online, analysts, analystsError, onSubmit }) {
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
      <fieldset className="analyst-field" disabled={disabled || analysts.length === 0}>
        <legend>Analystes</legend>
        <p className="analyst-field-copy">Choisissez les angles utilisés pour construire l’analyse.</p>
        <div className="analyst-options">
          {analysts.length ? analysts.map((analyst) => {
            const Icon = ANALYST_ICONS[analyst.id] || Users;
            return (
              <AnalystToggle
                key={analyst.id}
                id={analyst.id}
                label={analyst.name}
                description={analyst.description}
                Icon={Icon}
                selected={form.analysts.includes(analyst.id)}
                disabled={disabled}
                onToggle={toggleAnalyst}
              />
            );
          }) : <span className="analyst-options-status">{analystsError || "Chargement des analystes…"}</span>}
        </div>
      </fieldset>
      <button className="primary-button launch-button" type="submit" disabled={disabled || !online || analysts.length === 0 || form.analysts.length === 0}>
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

function WorkflowStepList({ steps, connectionUnverified, label }) {
  return (
    <div className="data-substeps" aria-label={label}>
      {steps.map((step) => {
        const status = connectionUnverified && step.status === "active" ? "unverified" : step.status;
        const icon = status === "complete"
          ? <Check size={15} />
          : status === "active"
            ? <LoaderCircle className="spin" size={15} />
            : ["warning", "error", "unverified"].includes(status)
              ? <AlertTriangle size={15} />
              : <Circle size={12} />;
        return (
          <div className={`data-substep ${status}`} key={step.id}>
            <span className="data-substep-icon" aria-hidden="true">{icon}</span>
            <span className="data-substep-copy">
              <strong>{step.label}</strong>
              <small>{step.detail}</small>
            </span>
            {step.report_url ? (
              <a
                className="step-report-link"
                href={step.report_url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Ouvrir le rapport Markdown : ${step.label}`}
              >
                <FileText size={13} /> .md
              </a>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function Workflow({ job, defaultDataSteps = [], connectionUnverified = false }) {
  const stages = job?.stages || [
    ["data", "Données", DATA_COLLECTION_COPY],
    ["analysts", "Analystes", "En attente"],
    ["debate", "Débat", "En attente"],
    ["trader", "Trader", "En attente"],
    ["risks", "Risques", "En attente"],
    ["portfolio", "Portefeuille", "En attente"],
  ].map(([id, label, detail]) => ({ id, label, status: "pending", detail }));
  const visibleDataSteps = job?.data_steps || defaultDataSteps;
  const visibleStageSteps = job?.stage_steps || {};

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
              {stage.id === "data" && visibleDataSteps.length ? (
                <WorkflowStepList
                  steps={visibleDataSteps}
                  connectionUnverified={connectionUnverified}
                  label="Contrôles des données de marché"
                />
              ) : visibleStageSteps[stage.id]?.length ? (
                <WorkflowStepList
                  steps={visibleStageSteps[stage.id]}
                  connectionUnverified={connectionUnverified}
                  label={`Sous-étapes : ${stage.label}`}
                />
              ) : <p>{stage.detail}</p>}
              {stage.id !== "data" && displayStatus === "active" && job?.logs?.length ? (
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
      {job?.limits ? <ContextLimitCard limits={job.limits} /> : null}
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

function ContextLimitCard({ limits }) {
  const windowTokens = limits.context_window_tokens;
  const promptTokens = limits.last_prompt_estimated_tokens;
  const requestTokens = limits.estimated_request_tokens;
  const usage = Math.max(0, Number(limits.usage_percent || 0));
  const hasWindow = Number(windowTokens) > 0;
  const meterWidth = `${Math.min(100, usage)}%`;
  const state = hasWindow ? limits.state || "waiting" : "unknown";

  return (
    <section className={`context-card ${state}`} aria-label="Utilisation du contexte du modèle">
      <div className="context-card-head">
        <Gauge size={20} />
        <div>
          <strong>Contexte du modèle</strong>
          <span>{hasWindow ? `${formatTokens(windowTokens)} tokens` : "Limite non communiquée par la passerelle"}</span>
        </div>
      </div>
      {hasWindow ? (
        <div className="context-meter" aria-label={usage ? `${usage} % du contexte estimé` : "Contexte en attente"}>
          <i style={{ width: meterWidth }} />
        </div>
      ) : null}
      <dl className="context-values">
        <div><dt>Dernier prompt</dt><dd>{promptTokens ? `≈ ${formatTokens(promptTokens)}` : "En attente"}</dd></div>
        <div><dt>Réponse réservée</dt><dd>{formatTokens(limits.max_output_tokens)}</dd></div>
        <div><dt>Total estimé</dt><dd>{requestTokens ? formatTokens(requestTokens) : "—"}</dd></div>
      </dl>
      {state === "warning" ? <p>La requête approche de la limite. Les réponses peuvent être raccourcies.</p> : null}
      {state === "critical" ? <p>La requête estimée dépasse la fenêtre disponible et risque d’échouer.</p> : null}
      {!hasWindow && limits.model_capacity_tokens ? <p>Capacité maximale déclarée : {formatTokens(limits.model_capacity_tokens)} tokens. OmniRoute n’expose pas de fenêtre active par requête.</p> : null}
      <small>{limits.context_source || (limits.model_capacity_tokens ? "La capacité du modèle est connue; la fenêtre active ne l’est pas." : "La passerelle n’a communiqué aucune capacité de contexte.")} Le nombre de tokens du prompt reste une estimation.</small>
    </section>
  );
}

function AnalysisFailure({ job }) {
  const failure = job?.failure || {
    title: job?.status === "interrupted" ? "Analyse interrompue" : "L’analyse s’est arrêtée",
    message: job?.error || "Une erreur inconnue a interrompu l’analyse.",
  };
  const context = failure.context || job?.limits;

  return (
    <section className="analysis-failure" role="alert">
      <span className="failure-icon"><AlertTriangle size={23} /></span>
      <div className="failure-content">
        <span className="failure-label">Analyse arrêtée</span>
        <h2>{failure.title}</h2>
        <p>{failure.message}</p>
        {context?.context_window_tokens ? (
          <div className="failure-metrics">
            <span>Limite<strong>{formatTokens(context.context_window_tokens)} tokens</strong></span>
            <span>Prompt estimé<strong>{context.last_prompt_estimated_tokens ? `≈ ${formatTokens(context.last_prompt_estimated_tokens)} tokens` : "Indisponible"}</strong></span>
            <span>Réponse prévue<strong>{formatTokens(context.max_output_tokens)} tokens max.</strong></span>
          </div>
        ) : null}
        {failure.recommendation ? <p className="failure-recommendation">À faire : {failure.recommendation}</p> : null}
        {failure.technical ? (
          <details>
            <summary>Afficher le détail technique</summary>
            <code>{failure.technical}</code>
          </details>
        ) : null}
      </div>
    </section>
  );
}

function AnalysisPage({ form, setForm, job, online, analysts, dataSteps, analystsError, pollWarning, onSubmit, onReset }) {
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
          <p>Choisissez une action : plusieurs agents IA confrontent leurs analyses à des données vérifiées.</p>
        </div>
      </div>
      <AnalysisForm form={form} setForm={setForm} disabled={busy} online={online} analysts={analysts} analystsError={analystsError} onSubmit={onSubmit} />
      {!online ? <div className="connection-error"><AlertTriangle size={18} /> La passerelle IA ne répond pas pour le moment.</div> : null}
      {pollWarning ? <div className="connection-warning"><RefreshCw size={18} /> {pollWarning}</div> : null}
      {["error", "interrupted"].includes(job?.status) ? <AnalysisFailure job={job} /> : null}
      <div className="analysis-grid">
        <Workflow job={job} defaultDataSteps={dataSteps} connectionUnverified={Boolean(pollWarning)} />
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

function BentoInsight({ title, icon: Icon, source, className = "", fallback }) {
  const insights = reportHighlights(source, 2);
  return (
    <article className={`bento-card bento-insight ${className}`}>
      <div className="bento-card-title"><Icon size={18} /><h3>{title}</h3></div>
      {insights.length ? (
        <ul>{insights.map((insight) => <li key={insight}>{insight}</li>)}</ul>
      ) : <p className="bento-empty">{fallback}</p>}
    </article>
  );
}

function FinancialBento({ job, result }) {
  const reports = result.reports || {};
  const snapshot = result.snapshot || {};
  const reliability = result.reliability || {};
  const decision = String(result.display_decision || "ATTENDRE").toUpperCase();
  const positive = /ACHETER|BUY/.test(decision);
  const negative = /VENDRE|SELL/.test(decision);
  const tone = positive ? "positive" : negative ? "negative" : "neutral";
  const SignalIcon = positive ? ArrowUpRight : negative ? ArrowDownRight : Minus;
  const close = numberValue(snapshot.close ?? reliability.verified_close);
  const open = numberValue(snapshot.open);
  const high = numberValue(snapshot.high);
  const low = numberValue(snapshot.low);
  const volume = numberValue(snapshot.volume);
  const change = close !== null && open ? ((close - open) / open) * 100 : null;
  const rangePosition = close !== null && low !== null && high !== null && high > low
    ? Math.min(100, Math.max(0, ((close - low) / (high - low)) * 100))
    : 50;
  const thesis = reportHighlights(reports.portfolio || result.summary, 1)[0]
    || "La décision finale est disponible dans la synthèse du rapport.";
  const debateSource = [reports.research_manager, reports.bull, reports.bear].filter(Boolean).join("\n");
  const riskSource = [reports.conservative, reports.neutral, reports.aggressive].filter(Boolean).join("\n");

  return (
    <section className={`financial-bento ${tone}`} aria-label={`Vue bento de l’analyse ${job.ticker}`}>
      <article className="bento-card bento-hero">
        <div className="bento-hero-copy">
          <span className="bento-label">Vue financière · {job.analysis_date}</span>
          <strong className="bento-ticker">{job.ticker}</strong>
          <h2>{decision}</h2>
          <p>{thesis}</p>
        </div>
        <div className="bento-signal" aria-label={`Décision : ${decision}`}>
          <span><SignalIcon size={34} strokeWidth={1.7} /></span>
          <small>{result.confidence}</small>
        </div>
      </article>

      <article className="bento-card bento-price">
        <span className="bento-label">Cours vérifié</span>
        <strong>{formatMarketNumber(close)}</strong>
        <span className={change === null ? "" : change >= 0 ? "bento-up" : "bento-down"}>
          {change === null ? "Variation non disponible" : `${change >= 0 ? "+" : ""}${change.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} % sur la séance`}
        </span>
        <small>{close !== null && reliability.latest_date ? `Séance du ${reliability.latest_date}` : "Date de séance non enregistrée"}</small>
      </article>

      <article className={`bento-card bento-quality ${reliability.blocked ? "blocked" : "verified"}`}>
        {reliability.blocked ? <AlertTriangle size={27} /> : <ShieldCheck size={27} />}
        <strong>{reliability.blocked ? "Contrôle bloquant" : "Données contrôlées"}</strong>
        <p>{reliability.block_reason || "Aucune incohérence critique enregistrée."}</p>
      </article>

      <article className="bento-card bento-range">
        <div className="bento-card-title"><BarChart3 size={18} /><h3>Fourchette de séance</h3></div>
        <div className="bento-range-track" aria-label={`Position du cours dans la fourchette : ${Math.round(rangePosition)} %`}>
          <i style={{ left: `${rangePosition}%` }} />
        </div>
        <dl>
          <div><dt>Plus bas</dt><dd>{formatMarketNumber(low)}</dd></div>
          <div><dt>Ouverture</dt><dd>{formatMarketNumber(open)}</dd></div>
          <div><dt>Plus haut</dt><dd>{formatMarketNumber(high)}</dd></div>
          <div><dt>Volume</dt><dd>{formatMarketNumber(volume, 0)}</dd></div>
        </dl>
      </article>

      <BentoInsight
        title="Signal marché"
        icon={TrendingUp}
        source={reports.market}
        className="bento-market"
        fallback="L’analyste marché n’a pas produit de rapport pour cette analyse."
      />
      <BentoInsight
        title="Fondamentaux"
        icon={BookOpen}
        source={reports.fundamentals}
        className="bento-fundamentals"
        fallback="Aucune donnée fondamentale n’est disponible dans ce rapport."
      />
      <BentoInsight
        title="Actualités à surveiller"
        icon={Newspaper}
        source={reports.news}
        className="bento-news"
        fallback="Aucune actualité n’est disponible dans ce rapport."
      />
      <BentoInsight
        title="Ce que dit le débat"
        icon={MessageSquareText}
        source={debateSource}
        className="bento-debate"
        fallback="Aucun débat haussier ou baissier n’est disponible."
      />
      <BentoInsight
        title="Risque principal"
        icon={ShieldCheck}
        source={riskSource}
        className="bento-risk"
        fallback="Aucune analyse de risque n’est disponible."
      />
    </section>
  );
}

function ParameterCard({ className = "", icon: Icon, title, children }) {
  return (
    <article className={`parameter-card ${className}`}>
      <div className="parameter-card-title"><Icon size={18} /><h3>{title}</h3></div>
      <div className="parameter-card-content">{children}</div>
    </article>
  );
}

function AnalysisParametersPanel({ job, result }) {
  const parameters = result.analysis_parameters || {};
  const debates = parameters.debates || {};
  const calls = parameters.calls || {};
  const model = parameters.model || {};
  const sources = parameters.sources || [];
  const news = parameters.news || {};
  const requests = news.requests || [];
  const memory = parameters.memory || {};
  const attempts = parameters.attempts || {};
  const shown = (value, suffix = "") => value === null || value === undefined ? "Non enregistré" : `${value}${suffix}`;
  const temperature = model.temperature === null || model.temperature === undefined
    ? "Non enregistrée"
    : Number(model.temperature).toLocaleString("fr-FR");

  return (
    <details className="effective-parameters" open>
      <summary>
        <span><SlidersHorizontal size={20} /><strong>Paramètres effectifs</strong></span>
        <span className="parameters-summary-copy">Ce qui a réellement configuré cette analyse</span>
        <ChevronDown className="parameters-chevron" size={19} />
      </summary>
      {parameters.complete === false ? (
        <div className="legacy-parameters-note">
          <History size={17} /> Certains détails n’étaient pas encore enregistrés lors de cette ancienne analyse.
        </div>
      ) : null}
      <div className="parameter-grid">
        <ParameterCard className="parameter-effort" icon={MessageSquareText} title="Effort de l’analyse">
          <dl>
            <div><dt>Débat investissement</dt><dd>{shown(debates.investment, " tour(s)")}</dd></div>
            <div><dt>Discussion des risques</dt><dd>{shown(debates.risk, " tour(s)")}</dd></div>
            <div><dt>Appels au modèle</dt><dd>{shown(calls.estimated, " estimés")}</dd></div>
            {calls.completed !== null && calls.completed !== undefined ? <div><dt>Appels effectués</dt><dd>{calls.completed}</dd></div> : null}
            <div><dt>Budget de réponse</dt><dd>{shown(parameters.output_tokens_per_call, " tokens/appel")}</dd></div>
          </dl>
        </ParameterCard>

        <ParameterCard icon={Bot} title="Modèle">
          <strong className="parameter-primary-value">{model.name || job.model || "Non enregistré"}</strong>
          <p>Température : {temperature}</p>
          <p>Fenêtre de contexte : {model.context_window_tokens ? `${formatTokens(model.context_window_tokens)} tokens` : "Non enregistrée"}</p>
          {model.model_capacity_tokens ? <p>Capacité déclarée : {formatTokens(model.model_capacity_tokens)} tokens</p> : null}
          {model.context_source ? <small className="parameter-value-source">{model.context_source}</small> : null}
          <p>Modèle rapide et approfondi identique.</p>
        </ParameterCard>

        <ParameterCard className="parameter-sources" icon={Database} title="Sources réellement consultées">
          {sources.length ? (
            <ul className="source-list">
              {sources.map((source) => (
                <li key={source.name}>
                  <span><strong>{source.name}</strong><small>{(source.details || []).join(" · ")}</small></span>
                  <span className={`source-status ${source.status || "ok"}`}>{source.status === "partial" ? "Partiel" : "Consultée"}</span>
                </li>
              ))}
            </ul>
          ) : <p className="parameter-empty">Non enregistrées pour cette analyse historique.</p>}
        </ParameterCard>

        <ParameterCard className="parameter-news" icon={Newspaper} title="Période et actualités">
          {requests.length ? (
            <ul className="news-request-list">
              {requests.map((request, index) => {
                const period = request.start_date && request.end_date
                  ? `${request.start_date} → ${request.end_date}`
                  : request.lookback_days
                    ? `${request.lookback_days} jours avant le ${request.end_date || job.analysis_date}`
                    : "Période non enregistrée";
                const returned = request.articles_returned === null || request.articles_returned === undefined
                  ? "nombre retourné non mesuré"
                  : `${request.articles_returned} article(s) retourné(s)`;
                return (
                  <li key={`${request.kind}-${period}-${index}`}>
                    <strong>{request.kind}</strong>
                    <span>{period}</span>
                    <small>{returned} · {shown(request.article_limit, " maximum")}</small>
                  </li>
                );
              })}
            </ul>
          ) : <p className="parameter-empty">Aucune consultation d’actualités enregistrée.</p>}
        </ParameterCard>

        <ParameterCard icon={BarChart3} title="Indice de comparaison">
          <strong className="parameter-primary-value">{parameters.benchmark || "Non enregistré"}</strong>
          <p>Référence utilisée pour mesurer la performance relative des décisions passées.</p>
        </ParameterCard>

        <ParameterCard icon={History} title="Mémoire antérieure">
          <strong className={`parameter-primary-value memory-${String(memory.used)}`}>
            {memory.used === true ? "Utilisée" : memory.used === false ? "Non utilisée" : "Non enregistré"}
          </strong>
          <p>{memory.used === true ? `Des enseignements antérieurs ont été injectés pour ${job.ticker}.` : memory.used === false ? "Aucun enseignement antérieur n’a été injecté." : "Ce détail n’existait pas dans l’ancien historique."}</p>
        </ParameterCard>

        <ParameterCard icon={RefreshCw} title="Tentatives et reprises">
          <dl>
            <div><dt>Lancement de l’analyse</dt><dd>{shown(attempts.analysis)}</dd></div>
            <div><dt>Relances autorisées</dt><dd>{shown(attempts.max_retries_per_call, " par appel")}</dd></div>
            <div><dt>Erreurs modèle remontées</dt><dd>{shown(attempts.model_errors)}</dd></div>
            <div><dt>Reprise de sauvegarde</dt><dd>{attempts.resumed === true ? `Oui, étape ${attempts.resume_step}` : attempts.resumed === false ? "Non" : "Non enregistré"}</dd></div>
          </dl>
        </ParameterCard>
      </div>
    </details>
  );
}

function MarkdownReportLinks({ job, reports, reportKeys }) {
  const available = reportKeys.filter((key) => reports[key]);
  if (!available.length) return null;
  return (
    <nav className="markdown-report-links" aria-label="Rapports Markdown disponibles">
      <span>Fichiers sources</span>
      <div>
        {available.map((key) => (
          <a
            key={key}
            href={`/api/jobs/${job.id}/reports/${key}.md`}
            target="_blank"
            rel="noreferrer"
          >
            <FileText size={14} /> {REPORT_LINK_LABELS[key]}.md
          </a>
        ))}
      </div>
    </nav>
  );
}

function ReportContent({ job, result, tab }) {
  const reports = result.reports || {};
  if (tab === "image") return <FinancialBento job={job} result={result} />;

  const reportKeys = tab === "analysts"
    ? ["market", "social", "news", "fundamentals"]
    : [];
  const debateSteps = job.stage_steps?.debate || [];

  const content = {
    summary: result.summary,
    analysts: [reports.market, reports.news, reports.social, reports.fundamentals].filter(Boolean).join("\n\n---\n\n"),
    debate: [reports.bull, reports.bear, reports.research_manager].filter(Boolean).join("\n\n---\n\n"),
    risks: [reports.aggressive, reports.conservative, reports.neutral].filter(Boolean).join("\n\n---\n\n"),
    report: result.complete_report,
  }[tab] || result.summary;

  return (
    <>
      {tab === "debate" && debateSteps.length ? (
        <section className="report-stage-summary" aria-labelledby="debate-steps-title">
          <h3 id="debate-steps-title">Étapes du débat</h3>
          <WorkflowStepList
            steps={debateSteps}
            connectionUnverified={false}
            label="Étapes réelles du débat"
          />
        </section>
      ) : null}
      <MarkdownReportLinks job={job} reports={reports} reportKeys={reportKeys} />
      <div className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "Aucun contenu disponible."}</ReactMarkdown>
      </div>
    </>
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
          <p>{historical ? "Analyse enregistrée, disponible en consultation uniquement" : `Analyse du ${job.analysis_date} · ${job.model}`}{historical ? ` · Réalisée le ${job.analysis_date}` : ""}</p>
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
      <AnalysisParametersPanel job={job} result={result} />
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
          <ReportContent job={job} result={result} tab={tab} />
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
      <div className="page-heading"><div><h1>Modèles</h1><p>Voici le modèle actif pour TradingAgents.</p></div><button className="secondary-button" onClick={refresh}><RefreshCw size={17} /> Rafraîchir la liste</button></div>
      <section className="model-list-panel">
        <div className="connection-strip"><span className={`status-dot ${status.online ? "online" : "offline"}`} /><strong>{status.online ? `${status.provider_name} connecté` : `${status.provider_name} hors ligne`}</strong><span>{status.endpoint}</span></div>
        {(status.models || []).map((model) => (
          <div className={`model-row ${model.name === status.active_model ? "selected" : ""}`} key={model.name}>
            <Bot size={22} /><div><strong>{model.name}</strong><span>{model.provider}</span></div>{model.name === status.active_model ? <span className="active-label">Actif</span> : null}
          </div>
        ))}
      </section>
    </main>
  );
}

function SettingsPage({ status }) {
  const configuration = status.tradingagents || {};
  const capabilities = status.capabilities || {};
  const analysis = status.analysis;
  const budgets = configuration.output_token_budgets || {};
  const budgetCopy = [budgets[1], budgets[2], budgets[3]].every((value) => value !== undefined)
    ? `${formatTokens(budgets[1])} / ${formatTokens(budgets[2])} / ${formatTokens(budgets[3])}`
    : "Non disponible";
  return (
    <main className="page simple-page">
      <div className="page-heading"><div><h1>Configuration</h1><p>Valeurs détectées automatiquement au démarrage et capacités annoncées par OmniRoute.</p></div></div>
      <h2 className="settings-title">TradingAgents</h2>
      <section className="settings-panel">
        <div className="setting-row"><div><Gauge size={21} /><span><strong>Fournisseur</strong><small>TRADINGAGENTS_LLM_PROVIDER</small></span></div><code>{configuration.provider || "Non disponible"}</code></div>
        <div className="setting-row"><div><Gauge size={21} /><span><strong>Endpoint LLM</strong><small>TRADINGAGENTS_LLM_BACKEND_URL</small></span></div><code>{configuration.endpoint || "Non disponible"}</code></div>
        <div className="setting-row"><div><Sparkles size={21} /><span><strong>Modèles rapide / profond</strong><small>Modèles réellement transmis au client</small></span></div><code>{configuration.quick_model && configuration.deep_model ? `${configuration.quick_model} / ${configuration.deep_model}` : "Non disponible"}</code></div>
        <div className="setting-row"><div><SlidersHorizontal size={21} /><span><strong>Température</strong><small>Valeur envoyée à chaque appel du modèle</small></span></div><code>{configuration.temperature === null || configuration.temperature === undefined ? "Non disponible" : Number(configuration.temperature).toLocaleString("fr-FR")}</code></div>
        <div className="setting-row"><div><RefreshCw size={21} /><span><strong>Relances du modèle</strong><small>Maximum autorisé pour chaque appel</small></span></div><code>{configuration.max_retries_per_call ?? "Non disponible"}</code></div>
        <div className="setting-row"><div><History size={21} /><span><strong>Reprise après interruption</strong><small>Sauvegarde des étapes de l’analyse</small></span></div><code>{configuration.checkpoint_enabled === true ? "active" : configuration.checkpoint_enabled === false ? "inactive" : "Non disponible"}</code></div>
        <div className="setting-row"><div><ShieldCheck size={21} /><span><strong>Blocage des incohérences</strong><small>Compare les prix proposés au dernier cours vérifié</small></span></div><code>{configuration.price_consistency_check === true ? "actif" : configuration.price_consistency_check === false ? "inactif" : "Non disponible"}</code></div>
      </section>
      <h2 className="settings-title">Capacités OmniRoute</h2>
      <section className="settings-panel">
        <div className="setting-row"><div><Database size={21} /><span><strong>Entrée maximale</strong><small>Capacité annoncée, pas une fenêtre active</small></span></div><code>{capabilities.max_input_tokens ? `${formatTokens(capabilities.max_input_tokens)} tokens` : "Non disponible"}</code></div>
        <div className="setting-row"><div><Gauge size={21} /><span><strong>Sortie maximale</strong><small>Maximum annoncé par OmniRoute</small></span></div><code>{capabilities.max_output_tokens ? `${formatTokens(capabilities.max_output_tokens)} tokens` : "Non disponible"}</code></div>
        <div className="setting-row"><div><Sparkles size={21} /><span><strong>Appels d’outils</strong><small>Capacité annoncée pour le modèle</small></span></div><code>{capabilities.tool_calling === true ? "supportés" : capabilities.tool_calling === false ? "non supportés" : "Non disponible"}</code></div>
        <div className="setting-row"><div><Sparkles size={21} /><span><strong>Raisonnement</strong><small>Capacité annoncée pour le modèle</small></span></div><code>{capabilities.reasoning === true ? "supporté" : capabilities.reasoning === false ? "non supporté" : "Non disponible"}</code></div>
      </section>
      <h2 className="settings-title">Analyse en cours</h2>
      <section className="settings-panel">
        {analysis ? <>
          <div className="setting-row"><div><Gauge size={21} /><span><strong>Instrument / date</strong><small>Requête actuellement exécutée</small></span></div><code>{analysis.ticker} · {analysis.analysis_date}</code></div>
          <div className="setting-row"><div><SlidersHorizontal size={21} /><span><strong>Profondeur / analystes</strong><small>Choix envoyés par le formulaire</small></span></div><code>{analysis.depth} · {analysis.analysts.join(", ")}</code></div>
          <div className="setting-row"><div><Gauge size={21} /><span><strong>Budget / appels estimés</strong><small>Tokens de sortie par appel · estimation</small></span></div><code>{formatTokens(analysis.output_tokens_per_call)} / {analysis.estimated_model_calls ?? "—"}</code></div>
        </> : <div className="settings-empty">Aucune analyse en cours. Les paramètres apparaîtront ici après le lancement.</div>}
        <div className="setting-row"><div><Gauge size={21} /><span><strong>Budgets disponibles</strong><small>Rapide / moyenne / approfondie</small></span></div><code>{budgetCopy}</code></div>
      </section>
    </main>
  );
}

export default function App() {
  const [page, setPage] = useState(() => {
    const saved = localStorage.getItem("tradingagents_page");
    return saved && ["analysis", "scanner", "history", "models", "settings"].includes(saved) ? saved : "analysis";
  });
  const [form, setForm] = useState(INITIAL_FORM);
  const [job, setJob] = useState(null);
  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState({ online: false, models: [], endpoint: "", active_model: "", capabilities: {}, tradingagents: {}, analysis: null });
  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingHistoryId, setLoadingHistoryId] = useState(null);
  const [historyError, setHistoryError] = useState("");
  const [pollWarning, setPollWarning] = useState("");
  const [historyJob, setHistoryJob] = useState(null);
  const [capabilities, setCapabilities] = useState({ analysts: [], data_steps: [] });
  const [capabilitiesError, setCapabilitiesError] = useState("");
  const [scanJob, setScanJob] = useState(null);

  const analysisActive = Boolean(job && ["queued", "running"].includes(job.status));
  const scanActive = Boolean(scanJob && ["queued", "running"].includes(scanJob.status));

  const activeModel = useMemo(() => status.active_model || status.models?.[0]?.name || "Modèle non détecté", [status]);

  const loadStatus = async () => {
    try { setStatus(await api("/api/status")); } catch { setStatus((current) => ({ ...current, online: false })); }
  };
  const loadHistory = async () => {
    try { setHistory((await api("/api/history")).items || []); } catch { setHistory([]); }
  };
  const loadCapabilities = async () => {
    try {
      const payload = await api("/api/capabilities");
      const analysts = Array.isArray(payload.analysts) ? payload.analysts : [];
      const dataSteps = Array.isArray(payload.data_steps) ? payload.data_steps : [];
      const ids = analysts.map((analyst) => analyst.id);
      setCapabilities({ analysts, data_steps: dataSteps });
      setCapabilitiesError("");
      setForm((current) => {
        const selected = current.analysts.filter((id) => ids.includes(id));
        return { ...current, analysts: selected.length ? selected : ids };
      });
    } catch (error) {
      setCapabilities({ analysts: [], data_steps: [] });
      setCapabilitiesError(`Analystes indisponibles : ${error.message}`);
    }
  };

  useEffect(() => {
    loadStatus();
    loadHistory();
    loadCapabilities();

    api("/api/active")
      .then((activePayload) => {
        if (activePayload?.active_scan) {
          setScanJob(activePayload.active_scan);
        } else {
          const savedScanId = localStorage.getItem("tradingagents_scan_id");
          if (savedScanId) {
            api(`/api/scans/${savedScanId}`).then((s) => setScanJob(s)).catch(() => localStorage.removeItem("tradingagents_scan_id"));
          } else if (activePayload?.latest_scan) {
            setScanJob(activePayload.latest_scan);
          }
        }

        if (activePayload?.active_job) {
          setJob(activePayload.active_job);
        } else {
          const savedJobId = localStorage.getItem("tradingagents_job_id");
          if (savedJobId) {
            api(`/api/jobs/${savedJobId}`).then((j) => setJob(j)).catch(() => localStorage.removeItem("tradingagents_job_id"));
          } else if (activePayload?.latest_job) {
            setJob(activePayload.latest_job);
          }
        }
      })
      .catch(() => {});

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
    if (job?.id) localStorage.setItem("tradingagents_job_id", job.id);
    else localStorage.removeItem("tradingagents_job_id");
  }, [job?.id]);

  useEffect(() => {
    if (scanJob?.id) localStorage.setItem("tradingagents_scan_id", scanJob.id);
    else localStorage.removeItem("tradingagents_scan_id");
  }, [scanJob?.id]);

  useEffect(() => {
    if (page !== "settings" || !analysisActive) return undefined;
    const timer = window.setInterval(loadStatus, 2500);
    return () => window.clearInterval(timer);
  }, [page, analysisActive]);

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

  useEffect(() => {
    if (!scanJob || !["queued", "running"].includes(scanJob.status)) return undefined;
    const timer = window.setInterval(async () => {
      try {
        const next = await api(`/api/scans/${scanJob.id}`);
        setScanJob(next);
      } catch {
        // Transient poll error for scan
      }
    }, 2500);
    return () => window.clearInterval(timer);
  }, [scanJob?.id, scanJob?.status]);

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
    localStorage.setItem("tradingagents_page", nextPage);
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
      <Sidebar page={page} onPage={navigate} online={status.online} model={activeModel} provider={status.provider_name || "LLM"} analysisActive={analysisActive} scanActive={scanActive} open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen ? <button className="menu-scrim" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu" /> : null}
      <div className="content-shell">
        {page === "analysis" ? <AnalysisPage form={form} setForm={setForm} job={job} online={status.online} analysts={capabilities.analysts} dataSteps={capabilities.data_steps} analystsError={capabilitiesError} pollWarning={pollWarning} onSubmit={submit} onReset={reset} /> : null}
        {page === "scanner" ? <ScannerPage online={status.online} job={scanJob} setJob={setScanJob} onOpenAnalysis={(analysisJobId) => openHistory({ id: analysisJobId })} /> : null}
        {page === "history" ? <HistoryPage history={history} loadingId={loadingHistoryId} error={historyError} onSelect={openHistory} /> : null}
        {page === "history-detail" && historyJob ? <ResultPage key={historyJob.id} job={historyJob} historical onBackHistory={() => navigate("history")} /> : null}
        {page === "models" ? <ModelsPage status={status} refresh={loadStatus} /> : null}
        {page === "settings" ? <SettingsPage status={status} /> : null}
      </div>
    </div>
  );
}
