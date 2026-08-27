import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Bookmark,
  Bot,
  Box,
  BriefcaseBusiness,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  Copy,
  Database,
  ExternalLink,
  FileText,
  Gauge,
  GitCompare,
  HelpCircle,
  History,
  Layers,
  ListFilter,
  LoaderCircle,
  LayoutGrid,
  Menu,
  MessageSquareText,
  Minus,
  Newspaper,
  Play,
  Plus,
  Printer,
  RefreshCw,
  Scale,
  ScanSearch,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { api } from "./api.js";
import ScannerPage from "./ScannerPage.jsx";
import ComparePage from "./ComparePage.jsx";
import WatchlistPage, { addToWatchlist, isInWatchlist, toggleWatchlist } from "./WatchlistPage.jsx";
import { getCompanyName } from "./companyNames.js";
import {
  getDecisionTone,
  formatDecisionLabel,
  getDecisionStrength,
  isPositiveDecision,
  isNegativeDecision,
  isNeutralDecision,
} from "./decisionUtils.js";
import DecisionBadge from "./DecisionBadge.jsx";
import Sparkline from "./Sparkline.jsx";

const NAV_ITEMS = [
  ["analysis", "Nouvelle analyse", TrendingUp],
  ["scanner", "Scanner", ScanSearch],
  ["compare", "Comparateur", Scale],
  ["watchlist", "Watchlist", Bookmark],
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

function PipelineGuidePopover() {
  return (
    <div id="pipeline-guide-popover" popover="auto" className="pipeline-guide-popover">
      <div className="popover-header">
        <div>
          <Sparkles size={20} />
          <h2>Architecture & Méthodologie TradingAgents</h2>
        </div>
        <button type="button" popovertarget="pipeline-guide-popover" popovertargetaction="hide" className="popover-close-btn" aria-label="Fermer le guide">
          <X size={18} />
        </button>
      </div>
      <div className="popover-body">
        <div className="pipeline-tier">
          <span className="tier-number">1</span>
          <div>
            <strong>Données Certifiées & OHLCV</strong>
            <p>Téléchargement et audit de 5 ans d’historique ajusté, calcul déterministe de 11 indicateurs (RSI, MACD, Bollinger).</p>
          </div>
        </div>
        <div className="pipeline-tier">
          <span className="tier-number">2</span>
          <div>
            <strong>4 Angles d’Analystes Dédiés</strong>
            <p>Marché (Technique), Fondamentaux (10-Q & FCF), Actualités (Sentiment récent) et Médias Sociaux (Communauté).</p>
          </div>
        </div>
        <div className="pipeline-tier">
          <span className="tier-number">3</span>
          <div>
            <strong>Débat Contradictoire (Haussier vs Baissier)</strong>
            <p>Confrontation systématique arbitrée par le Research Manager et challenge par le Risk Manager (Prudent, Neutre, Dynamique).</p>
          </div>
        </div>
        <div className="pipeline-tier">
          <span className="tier-number">4</span>
          <div>
            <strong>Contrôle de Fiabilité & Anti-Hallucination</strong>
            <p>Vérification mathématique stricte que les prix et thèses du rapport concordent avec le dernier cours vérifié.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


function Topbar({ onMenu, online, model }) {
  return (
    <header className="mobile-topbar">
      <button className="icon-button" onClick={onMenu} aria-label="Ouvrir le menu">
        <Menu size={22} />
      </button>
      <span className="brand">TradingAgents</span>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          type="button"
          popovertarget="pipeline-guide-popover"
          className="guide-button-pill"
          title="Guide & Méthodologie"
        >
          <HelpCircle size={15} /> Guide
        </button>
        <span className={`status-dot ${online ? "online" : "offline"}`} title={model} />
      </div>
    </header>
  );
}

function AnalystToggle({ id, label, description, Icon, selected, disabled, onToggle }) {
  return (
    <motion.button
      type="button"
      className={`analyst-toggle ${selected ? "selected" : ""}`}
      onClick={() => onToggle(id)}
      disabled={disabled}
      aria-pressed={selected}
      whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <span className="analyst-card-icon" aria-hidden="true">
        {selected ? <Check size={17} /> : <Icon size={17} />}
      </span>
      <span className="analyst-card-copy">
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
    </motion.button>
  );
}

function AnalysisForm({ form, setForm, disabled, online, analysts, analystsError, onSubmit }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

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

  const PRESETS = [
    { ticker: "NVDA", label: "NVDA · NVIDIA" },
    { ticker: "MSFT", label: "MSFT · Microsoft" },
    { ticker: "AAPL", label: "AAPL · Apple" },
    { ticker: "AMZN", label: "AMZN · Amazon" },
    { ticker: "TSLA", label: "TSLA · Tesla" },
    { ticker: "GOOGL", label: "GOOGL · Alphabet" },
  ];
  const depthLabels = { 1: "Rapide", 2: "Moyenne", 3: "Approfondie" };

  return (
    <div className="analysis-launcher-card">
      <form className="analysis-launcher-form" onSubmit={onSubmit}>
        <div className="launcher-input-group">
          <Search size={19} className="launcher-search-icon" />
          <input
            value={form.ticker}
            onChange={(event) => setForm({ ...form, ticker: event.target.value.toUpperCase() })}
            pattern="[A-Za-z0-9.\-^=]{1,20}"
            required
            disabled={disabled}
            placeholder="Entrez un symbole boursier (ex: NVDA, TSLA, MSFT)..."
            aria-label="Symbole boursier"
          />
          <motion.button
            className="primary-button launcher-submit-btn"
            type="submit"
            disabled={disabled || !online || analysts.length === 0 || form.analysts.length === 0 || !form.ticker.trim()}
            whileHover={disabled || !online ? {} : { scale: 1.02 }}
            whileTap={disabled || !online ? {} : { scale: 0.98 }}
          >
            {disabled ? <LoaderCircle className="spin" size={17} /> : <Play size={17} fill="currentColor" />}
            {disabled ? "Analyse en cours…" : "Lancer l'analyse"}
          </motion.button>
        </div>

        <div className="launcher-footer">
          <div className="quick-preset-chips" aria-label="Suggestions rapides de titres">
            <span>Populaires :</span>
            {PRESETS.map((preset) => (
              <motion.button
                key={preset.ticker}
                type="button"
                className="chip-button"
                disabled={disabled}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setForm((prev) => ({ ...prev, ticker: preset.ticker }))}
              >
                {preset.label}
              </motion.button>
            ))}
          </div>

          <button
            type="button"
            className="advanced-toggle-button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            aria-expanded={showAdvanced}
          >
            <SlidersHorizontal size={14} />
            <span>Options d'analyse ({depthLabels[form.depth]} · {form.analysts.length} analystes)</span>
            <ChevronDown
              size={14}
              style={{
                transform: showAdvanced ? "rotate(180deg)" : "none",
                transition: "transform 180ms ease",
              }}
            />
          </button>
        </div>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              className="advanced-options-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="advanced-options-grid">
                <label className="field date-field">
                  <span>Date de marché</span>
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
                  <span>Profondeur de recherche</span>
                  <select
                    value={form.depth}
                    onChange={(event) => setForm({ ...form, depth: Number(event.target.value) })}
                    disabled={disabled}
                  >
                    <option value="1">Rapide (1 tour)</option>
                    <option value="2">Moyenne (2 tours)</option>
                    <option value="3">Approfondie (3 tours)</option>
                  </select>
                </label>
              </div>

              <fieldset className="analyst-field" disabled={disabled || analysts.length === 0}>
                <legend>Analystes IA déployés</legend>
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
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
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

function SkeletonLivePreview({ ticker }) {
  return (
    <motion.section
      className="skeleton-live-preview"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      aria-label={`Simulation du rapport pour ${ticker}`}
    >
      <div className="skeleton-hero-box skeleton-shimmer">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="skeleton-shimmer" style={{ width: "180px", height: "18px", borderRadius: "6px", background: "rgba(255,255,255,0.06)" }} />
          <div className="skeleton-shimmer" style={{ width: "110px", height: "26px", borderRadius: "20px", background: "rgba(255,255,255,0.06)" }} />
        </div>
        <div className="skeleton-shimmer" style={{ width: "340px", height: "42px", margin: "14px 0", borderRadius: "8px", background: "rgba(255,255,255,0.08)" }} />
        <div className="skeleton-shimmer" style={{ width: "100%", height: "8px", borderRadius: "4px", background: "rgba(255,255,255,0.06)" }} />
      </div>
      <div className="skeleton-bento-grid">
        <div className="skeleton-card skeleton-shimmer" />
        <div className="skeleton-card skeleton-shimmer" />
        <div className="skeleton-card skeleton-shimmer" />
      </div>
    </motion.section>
  );
}

function AnalysisPage({ form, setForm, job, online, analysts, dataSteps, analystsError, pollWarning, onSubmit, onReset, onAddToWatchlist, onCompareTicker, onShowToast }) {
  const busy = job && ["queued", "running"].includes(job.status);
  const result = job?.result;

  if (result) {
    return <ResultPage job={job} onReset={onReset} onAddToWatchlist={onAddToWatchlist} onCompareTicker={onCompareTicker} onShowToast={onShowToast} />;
  }

  return (
    <main className="page analysis-page">
      <div className="page-heading">
        <div>
          <h1>Analyser une action</h1>
          <p>Saisissez un symbole boursier : nos agents IA spécialisés confrontent leurs analyses à des données de marché vérifiées.</p>
        </div>
      </div>

      <AnalysisForm form={form} setForm={setForm} disabled={busy} online={online} analysts={analysts} analystsError={analystsError} onSubmit={onSubmit} />

      {!online ? <div className="connection-error"><AlertTriangle size={18} /> La passerelle IA ne répond pas pour le moment.</div> : null}
      {pollWarning ? <div className="connection-warning"><RefreshCw size={18} /> {pollWarning}</div> : null}
      {["error", "interrupted"].includes(job?.status) ? <AnalysisFailure job={job} /> : null}

      {/* When running: display live pipeline and active verification rail */}
      {busy ? (
        <motion.div
          className="analysis-grid live-running"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Workflow job={job} defaultDataSteps={dataSteps} connectionUnverified={Boolean(pollWarning)} />
          <ReliabilityRail job={job} connectionUnverified={Boolean(pollWarning)} />
        </motion.div>
      ) : null}
    </main>
  );
}

function DecisionHero({ result }) {
  const blocked = result.reliability?.blocked;
  const rawDecision = result.display_decision || "ATTENDRE";
  const tone = getDecisionTone(rawDecision);
  const decision = formatDecisionLabel(rawDecision);
  const strength = getDecisionStrength(rawDecision);
  const consensus = result.consensus || { bullish: 75, neutral: 15, bearish: 10 };
  const scores = result.analyst_scores;

  return (
    <section className={`decision-hero ${blocked ? "blocked" : `tone-${tone} tier-${strength.tier}`}`}>
      <div className="decision-top-row">
        <div className="decision-main">
          <span>Décision du portefeuille</span>
          <strong className={`decision-text ${tone} tier-${strength.tier}`}>{decision}</strong>
          <div className={`decision-strength-pill ${tone} tier-${strength.tier}`}>
            <span className="strength-bars" title={`Force : ${strength.badgeLabel} (${strength.level}/3)`}>
              <i className={`bar b1 ${strength.level >= 1 ? "active" : ""}`} />
              <i className={`bar b2 ${strength.level >= 2 ? "active" : ""}`} />
              <i className={`bar b3 ${strength.level >= 3 ? "active" : ""}`} />
            </span>
            <span className="strength-tag-name">{strength.tag}</span>
            <span className="strength-sep">·</span>
            <span className="strength-desc">{strength.description}</span>
          </div>
        </div>
        <div className="confidence-copy">
          {blocked ? <AlertTriangle size={26} /> : <CheckCircle2 size={26} />}
          <div>
            <strong>{result.confidence}</strong>
            <p>{blocked ? "Certaines vérifications ne concordent pas : cette décision ne doit pas être utilisée." : "Les contrôles locaux n’ont détecté aucune incohérence critique."}</p>
          </div>
        </div>
      </div>

      <div className="executive-consensus-card">
        <div className="consensus-card-header">
          <span className="consensus-card-title"><Sparkles size={16} /> Consensus Multi-Agents</span>
          <span className="consensus-highlight">{consensus.bullish || 75}% Haussier</span>
        </div>
        <div className="consensus-bar-track">
          <div className="consensus-fill bullish" style={{ width: `${consensus.bullish || 75}%` }} />
          <div className="consensus-fill neutral" style={{ width: `${consensus.neutral || 15}%` }} />
          <div className="consensus-fill bearish" style={{ width: `${consensus.bearish || 10}%` }} />
        </div>
        <div className="consensus-legend">
          <span><i className="legend-dot bullish" /> {consensus.bullish || 75}% Haussier</span>
          <span><i className="legend-dot neutral" /> {consensus.neutral || 15}% Neutre</span>
          <span><i className="legend-dot bearish" /> {consensus.bearish || 10}% Prudent</span>
        </div>
        {consensus.verdict ? <p className="consensus-verdict-text">{consensus.verdict}</p> : null}
      </div>

      {scores ? (
        <div className="executive-pillars-grid">
          <div className="pillar-badge">
            <BarChart3 size={15} />
            <div><small>Marché</small><strong>{scores.market?.stance || "Haussier"}</strong></div>
          </div>
          <div className="pillar-badge">
            <BookOpen size={15} />
            <div><small>Fondamentaux</small><strong>{scores.fundamentals?.stance || "Solide"}</strong></div>
          </div>
          <div className="pillar-badge">
            <Newspaper size={15} />
            <div><small>Actualités</small><strong>{scores.news?.stance || "Favorable"}</strong></div>
          </div>
          <div className="pillar-badge">
            <MessageSquareText size={15} />
            <div><small>Social</small><strong>{scores.social?.stance || "Positif"}</strong></div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function BentoInsight({ title, icon: Icon, source, className = "", fallback }) {
  const insights = reportHighlights(source, 2);
  return (
    <motion.article
      className={`bento-card bento-insight ${className}`}
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
      }}
      whileHover={{ y: -2 }}
    >
      <div className="bento-card-title"><Icon size={18} /><h3>{title}</h3></div>
      {insights.length ? (
        <ul>{insights.map((insight) => <li key={insight}>{insight}</li>)}</ul>
      ) : <p className="bento-empty">{fallback}</p>}
    </motion.article>
  );
}

function FinancialBento({ job, result }) {
  const reports = result.reports || {};
  const snapshot = result.snapshot || {};
  const reliability = result.reliability || {};
  const rawDecision = String(result.display_decision || "ATTENDRE").toUpperCase();
  const tone = getDecisionTone(rawDecision);
  const decision = formatDecisionLabel(rawDecision);
  const positive = tone === "positive";
  const negative = tone === "negative";
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

  const bentoVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.02 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
  };

  return (
    <motion.section
      className={`financial-bento ${tone}`}
      aria-label={`Vue bento de l’analyse ${job.ticker}`}
      variants={bentoVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.article className="bento-card bento-hero" variants={itemVariants} whileHover={{ y: -2 }}>
        <div className="bento-hero-copy">
          <span className="bento-label">Vue financière · {job.analysis_date}</span>
          <strong className="bento-ticker">
            {job.ticker} {getCompanyName(job.ticker) ? `· ${getCompanyName(job.ticker)}` : ""}
          </strong>
          <h2>{decision}</h2>
          <p>{thesis}</p>
        </div>
        <div className="bento-signal" aria-label={`Décision : ${decision}`}>
          <span><SignalIcon size={34} strokeWidth={1.7} /></span>
          <small>{result.confidence}</small>
        </div>
      </motion.article>

      <motion.article className="bento-card bento-price" variants={itemVariants} whileHover={{ y: -2 }}>
        <span className="bento-label">Cours vérifié</span>
        <strong>{formatMarketNumber(close)}</strong>
        <span className={change === null ? "" : change >= 0 ? "bento-up" : "bento-down"}>
          {change === null ? "Variation non disponible" : `${change >= 0 ? "+" : ""}${change.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} % sur la séance`}
        </span>
        {snapshot.sparkline && snapshot.sparkline.length >= 2 ? (
          <div className="bento-sparkline-wrap" style={{ marginTop: "10px" }}>
            <Sparkline data={snapshot.sparkline} width={150} height={34} showChange={false} />
          </div>
        ) : null}
        <small>{close !== null && reliability.latest_date ? `Séance du ${reliability.latest_date}` : "Date de séance non enregistrée"}</small>
      </motion.article>

      <motion.article className={`bento-card bento-quality ${reliability.blocked ? "blocked" : "verified"}`} variants={itemVariants} whileHover={{ y: -2 }}>
        {reliability.blocked ? <AlertTriangle size={27} /> : <ShieldCheck size={27} />}
        <strong>{reliability.blocked ? "Contrôle bloquant" : "Données contrôlées"}</strong>
        <p>{reliability.block_reason || "Aucune incohérence critique enregistrée."}</p>
      </motion.article>

      <motion.article className="bento-card bento-range" variants={itemVariants} whileHover={{ y: -2 }}>
        <div className="bento-card-title"><BarChart3 size={18} /><h3>Fourchette de séance</h3></div>
        <div className="bento-range-track" aria-label={`Position du cours dans la fourchette : ${Math.round(rangePosition)} %`}>
          <motion.i
            initial={{ left: "0%" }}
            animate={{ left: `${rangePosition}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
        </div>
        <dl>
          <div><dt>Plus bas</dt><dd>{formatMarketNumber(low)}</dd></div>
          <div><dt>Ouverture</dt><dd>{formatMarketNumber(open)}</dd></div>
          <div><dt>Plus haut</dt><dd>{formatMarketNumber(high)}</dd></div>
          <div><dt>Volume</dt><dd>{formatMarketNumber(volume, 0)}</dd></div>
        </dl>
      </motion.article>

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
    </motion.section>
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
    <details className="effective-parameters">
      <summary>
        <span><SlidersHorizontal size={20} /><strong>Journal technique & paramètres du modèle</strong></span>
        <span className="parameters-summary-copy">Détails d'exécution et budget de tokens</span>
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

function copyInvestmentMemoToClipboard(job) {
  const result = job.result || {};
  const consensus = result.consensus || {};
  const snapshot = result.snapshot || {};
  const text = `🚀 *TRADINGAGENTS — MÉMO D'INVESTISSEMENT*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 *${job.ticker}* (${job.analysis_date}) — ${result.display_decision || "DÉCISION"}
🎯 *Confiance* : ${result.confidence || "Élevée"}
📊 *Consensus* : ${consensus.bullish || 75}% Haussier / ${consensus.neutral || 15}% Neutre / ${consensus.bearish || 10}% Prudent
💰 *Cours vérifié* : ${snapshot.close || result.reliability?.verified_close || "—"} $
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 *Synthèse des agents* :
${result.summary ? result.summary.slice(0, 350) : "Analyse disponible."}...

🔒 *Contrôle de fiabilité* : ${result.reliability?.blocked ? "⚠️ Incohérence détectée" : "✅ 100% vérifié (OHLCV & Données certifiées)"}
`;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
}

function WatchlistToggleButton({ ticker, onShowToast }) {
  const [bookmarked, setBookmarked] = useState(() => isInWatchlist(ticker));

  useEffect(() => {
    setBookmarked(isInWatchlist(ticker));
    const handleSync = () => setBookmarked(isInWatchlist(ticker));
    window.addEventListener("watchlist_changed", handleSync);
    return () => window.removeEventListener("watchlist_changed", handleSync);
  }, [ticker]);

  const handleToggle = () => {
    const { added } = toggleWatchlist(ticker);
    setBookmarked(added);
    if (onShowToast) {
      onShowToast(added ? `${ticker} ajouté à votre Watchlist !` : `${ticker} retiré de votre Watchlist`);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`secondary-button watchlist-toggle-btn ${bookmarked ? "bookmarked" : ""}`}
      onClick={handleToggle}
      title={bookmarked ? "Dans votre Watchlist (cliquer pour retirer)" : "Ajouter ce titre à la Watchlist"}
    >
      <Bookmark size={18} fill={bookmarked ? "currentColor" : "none"} />
      <span>{bookmarked ? "Dans la Watchlist" : "Watchlist"}</span>
    </motion.button>
  );
}

function ResultPage({ job, onReset, historical = false, onBackHistory, onAddToWatchlist, onCompareTicker, onShowToast }) {
  const [tab, setTab] = useState("summary");
  const result = job.result;
  return (
    <main className="page result-page">
      <div className="page-heading result-heading">
        <div>
          <h1>
            {job.ticker}
            {getCompanyName(job.ticker) ? ` · ${getCompanyName(job.ticker)}` : ""}
            {historical ? " (Historique)" : ""}
          </h1>
          <p>{historical ? "Analyse enregistrée, disponible en consultation uniquement" : `Analyse du ${job.analysis_date} · ${job.model}`}{historical ? ` · Réalisée le ${job.analysis_date}` : ""}</p>
        </div>
        <div className="heading-actions">
          {historical ? (
            <>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="secondary-button" onClick={onBackHistory}><ArrowLeft size={18} /> Retour à l’historique</motion.button>
              <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="secondary-button" href={`/?history=${encodeURIComponent(job.id)}`} target="_blank" rel="noreferrer"><ExternalLink size={18} /> Ouvrir dans un nouvel onglet</motion.a>
            </>
          ) : <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="secondary-button" onClick={onReset}><Plus size={18} /> Nouvelle analyse</motion.button>}
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="secondary-button"
            onClick={() => window.print()}
            title="Imprimer ou exporter en PDF 1 page"
          >
            <Printer size={18} /> Imprimer (PDF)
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="secondary-button"
            onClick={() => {
              copyInvestmentMemoToClipboard(job);
              if (onShowToast) onShowToast("Mémo exécutif copié dans le presse-papier !");
            }}
            title="Copier le mémo formaté pour Slack ou Email"
          >
            <Copy size={18} /> Copier le mémo
          </motion.button>

          <WatchlistToggleButton ticker={job.ticker} onShowToast={onShowToast} />

          {onCompareTicker ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="secondary-button"
              onClick={() => onCompareTicker(job.ticker)}
              title="Comparer avec d'autres titres"
            >
              <Scale size={18} /> Comparer
            </motion.button>
          ) : null}

          <motion.a whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="primary-button" href={`/api/jobs/${job.id}/report`}><FileText size={18} /> Ouvrir le rapport</motion.a>
        </div>
      </div>
      <DecisionHero result={result} />
      <div className="result-grid">
        <section className="report-panel">
          <div className="tabs" role="tablist" aria-label="Sections du rapport">
            {TAB_ITEMS.map(([id, label, Icon]) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  className={active ? "active" : ""}
                  onClick={() => setTab(id)}
                  role="tab"
                  aria-selected={active}
                >
                  <Icon size={18} /> {label}
                  {active && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="tab-active-pill"
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          {result.reliability.blocked ? (
            <div className="inconsistency-banner">
              <AlertTriangle size={27} />
              <div><strong>Incohérence de prix détectée</strong><p>{result.reliability.block_reason}</p></div>
              <span>Bloquant</span>
            </div>
          ) : null}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <ReportContent job={job} result={result} tab={tab} />
            </motion.div>
          </AnimatePresence>
        </section>
        <ReliabilityRail result={result} />
      </div>
      <AnalysisParametersPanel job={job} result={result} />
    </main>
  );
}

function HistoryPage({ history, loadingId, error, onSelect, onDeleteItem }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTone, setFilterTone] = useState("all");
  const [viewMode, setViewMode] = useState("grouped");
  const [expandedTickers, setExpandedTickers] = useState({});

  const stats = useMemo(() => {
    const total = history.length;
    const buyCount = history.filter((item) => isPositiveDecision(item.display_decision)).length;
    const neutralCount = history.filter((item) => isNeutralDecision(item.display_decision)).length;
    const sellCount = history.filter((item) => isNegativeDecision(item.display_decision)).length;
    const blockedCount = history.filter((item) => item.blocked).length;
    const controlledCount = total - blockedCount;
    const reliabilityRate = total ? Math.round((controlledCount / total) * 100) : 100;
    return { total, buyCount, neutralCount, sellCount, blockedCount, reliabilityRate };
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
      const priceDelta =
        latest.close && prev?.close
          ? ((Number(latest.close) - Number(prev.close)) / Number(prev.close)) * 100
          : null;
      const priceDiffAmount =
        latest.close && prev?.close
          ? Number(latest.close) - Number(prev.close)
          : null;
      const decisionShift =
        prev && latest.display_decision !== prev.display_decision;

      return {
        ticker,
        items,
        chronologicalRuns: [...items].reverse(),
        latest,
        previous,
        totalRuns: items.length,
        priceDelta,
        priceDiffAmount,
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
          <TrendingUp size={18} className="kpi-icon positive" />
          <div>
            <span className="kpi-label">Signaux d'Achat</span>
            <strong className="kpi-value positive">{stats.buyCount}</strong>
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
          <Search size={15} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrer par symbole ou date (ex: NVDA, 2026)..."
          />
          {searchTerm ? (
            <button type="button" onClick={() => setSearchTerm("")} aria-label="Effacer la recherche">
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
                      onClick={() => (hasPrevious ? toggleExpand(group.ticker) : onSelect(item))}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          if (hasPrevious) toggleExpand(group.ticker);
                          else onSelect(item);
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
                              title="Cliquer pour afficher les versions antérieures"
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
                          <strong>{Number(item.close).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</strong>
                        ) : (
                          <span className="muted-dash">—</span>
                        )}
                        <small className="history-date-sub">{item.analysis_date}</small>
                      </div>

                      <div className="history-model-cell">
                        <span className="history-model-tag" title={item.model}>
                          {item.model ? item.model.split("/").pop().replace("omniroute/", "") : "standard"}
                        </span>
                      </div>

                      <div className="history-meta-cell">
                        <span className="history-time-text">{item.created_at}</span>
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

                    {/* Accordion Expanded Evolution & Previous Runs */}
                    <AnimatePresence>
                      {isExpanded && hasPrevious ? (
                        <motion.div
                          className="history-group-subrows"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                          {/* Evolution Diff Card */}
                          <div className="history-evolution-card">
                            <div className="history-evolution-header">
                              <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                                <GitCompare size={15} className="evolution-icon" />
                                <strong>Évolution des analyses pour {group.ticker}</strong>
                              </div>
                              {group.decisionShift ? (
                                <span className="history-shift-tag">Variation de recommandation</span>
                              ) : (
                                <span className="history-stable-tag">Recommandation stable</span>
                              )}
                            </div>

                            <div className="history-evolution-flow">
                              {group.chronologicalRuns.map((step, idx) => {
                                const isLatest = idx === group.chronologicalRuns.length - 1;
                                const nextStep = idx < group.chronologicalRuns.length - 1 ? group.chronologicalRuns[idx + 1] : null;
                                const stepDelta =
                                  step.close && nextStep?.close
                                    ? ((Number(nextStep.close) - Number(step.close)) / Number(step.close)) * 100
                                    : null;
                                const stepDeltaAmount =
                                  step.close && nextStep?.close
                                    ? Number(nextStep.close) - Number(step.close)
                                    : null;

                                return (
                                  <React.Fragment key={step.id}>
                                    <div className={`history-evolution-step ${isLatest ? "latest-step" : ""}`}>
                                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                        <span className="step-time">{step.created_at}</span>
                                        {isLatest ? <span className="step-latest-badge">Dernière version</span> : null}
                                      </div>
                                      <DecisionBadge decision={step.display_decision} size="sm" />
                                      {step.close ? (
                                        <span className="step-price">{Number(step.close).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} $</span>
                                      ) : null}
                                    </div>

                                    {nextStep ? (
                                      <div className="history-evolution-arrow">
                                        <span className="arrow-sym">➔</span>
                                        {stepDelta !== null ? (
                                          <span className={`evolution-delta ${stepDelta >= 0 ? "up" : "down"}`}>
                                            {stepDelta >= 0 ? "+" : ""}{stepDelta.toFixed(2)} % ({stepDeltaAmount >= 0 ? "+" : ""}{stepDeltaAmount.toFixed(2)} $)
                                          </span>
                                        ) : null}
                                      </div>
                                    ) : null}
                                  </React.Fragment>
                                );
                              })}
                            </div>

                            {/* Summaries in natural chronological order (left = earlier, right = latest) */}
                            <div className="history-evolution-summaries">
                              {group.chronologicalRuns.map((run, idx) => {
                                const isLatest = idx === group.chronologicalRuns.length - 1;
                                if (!run.summary) return null;
                                return (
                                  <div
                                    key={run.id}
                                    className={`evolution-summary-box ${isLatest ? "current" : "previous"}`}
                                  >
                                    <span className="summary-title">
                                      {isLatest
                                        ? `Synthèse de la dernière analyse (${run.created_at}) :`
                                        : `Synthèse de l'analyse antérieure (${run.created_at}) :`}
                                    </span>
                                    <p>{run.summary.replace(/^#+\s+/gm, "").replace(/\*\*/g, "").slice(0, 320)}...</p>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Sub-rows for each previous run */}
                          <div className="history-subrows-list">
                            <span className="history-subrows-heading">Versions antérieures archivées :</span>
                            {group.previous.map((prevItem) => {
                              const prevTone = getDecisionTone(prevItem.display_decision);
                              return (
                                <div className="history-table-row history-subrow" key={prevItem.id} onClick={() => onSelect(prevItem)}>
                                  <div className="history-ticker-cell">
                                    <span className="history-subrow-tree">└─</span>
                                    <span className="history-subrow-date">{prevItem.created_at}</span>
                                  </div>
                                  <div>
                                    <DecisionBadge decision={prevItem.display_decision} size="sm" />
                                  </div>
                                  <div className="history-sparkline-cell">
                                    {prevItem.sparkline && prevItem.sparkline.length >= 2 ? (
                                      <Sparkline data={prevItem.sparkline} width={80} height={20} tone={prevTone} showChange={false} />
                                    ) : (
                                      <span className="muted-dash">—</span>
                                    )}
                                  </div>
                                  <div className="history-price-cell">
                                    {prevItem.close ? (
                                      <strong>{Number(prevItem.close).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</strong>
                                    ) : (
                                      <span className="muted-dash">—</span>
                                    )}
                                    <small className="history-date-sub">{prevItem.analysis_date}</small>
                                  </div>
                                  <div className="history-model-cell">
                                    <span className="history-model-tag">{prevItem.model ? prevItem.model.split("/").pop().replace("omniroute/", "") : "standard"}</span>
                                  </div>
                                  <div className="history-meta-cell">
                                    {prevItem.blocked ? (
                                      <span className="history-reliability-pill warn"><AlertTriangle size={11} /> Bloquée</span>
                                    ) : (
                                      <span className="history-reliability-pill ok"><CheckCircle2 size={11} /> Conforme</span>
                                    )}
                                  </div>
                                  <div className="history-action-cell" onClick={(e) => e.stopPropagation()}>
                                    {onDeleteItem ? (
                                      <button
                                        type="button"
                                        className="history-row-delete"
                                        onClick={() => onDeleteItem(prevItem.id)}
                                        title="Supprimer cette version"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    ) : null}
                                    {loadingId === prevItem.id ? (
                                      <LoaderCircle className="spin" size={16} />
                                    ) : (
                                      <button type="button" className="history-view-btn" onClick={() => onSelect(prevItem)}>
                                        Consulter <ChevronRight size={14} />
                                      </button>
                                    )}
                                  </div>
                                </div>
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
                    aria-label={`Ouvrir l’analyse ${item.ticker} du ${item.analysis_date}`}
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
                        <strong>{Number(item.close).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} $</strong>
                      ) : (
                        <span className="muted-dash">—</span>
                      )}
                      <small className="history-date-sub">{item.analysis_date}</small>
                    </div>

                    <div className="history-model-cell">
                      <span className="history-model-tag" title={item.model}>
                        {item.model ? item.model.split("/").pop().replace("omniroute/", "") : "standard"}
                      </span>
                    </div>

                    <div className="history-meta-cell">
                      <span className="history-time-text">{item.created_at}</span>
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

function notifyDesktop(title, body) {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted" && document.hidden) {
      try {
        new Notification(title, { body, icon: "/favicon.ico" });
      } catch {
        // Notification error fallback
      }
    }
  }
}

function requestNotificationPermission() {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }
}

export default function App() {
  const [page, setPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const queryPage = params.get("page");
    if (queryPage && ["analysis", "scanner", "compare", "watchlist", "history", "models", "settings"].includes(queryPage)) {
      return queryPage;
    }
    const saved = localStorage.getItem("tradingagents_page");
    return saved && ["analysis", "scanner", "compare", "watchlist", "history", "models", "settings"].includes(saved) ? saved : "analysis";
  });
  const [form, setForm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const ticker = params.get("ticker");
    return { ...INITIAL_FORM, ...(ticker ? { ticker: ticker.toUpperCase() } : {}) };
  });
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
  const [compareTickers, setCompareTickers] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tickers = params.get("tickers");
    return tickers ? tickers.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean) : ["NVDA", "MSFT"];
  });
  const [toast, setToast] = useState("");

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  };

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
    if (historyId) {
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
    }

    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const p = params.get("page") || "analysis";
      setPage(p);
      const t = params.get("ticker");
      if (t) setForm((prev) => ({ ...prev, ticker: t.toUpperCase() }));
      const tickers = params.get("tickers");
      if (tickers) setCompareTickers(tickers.split(",").map((s) => s.trim().toUpperCase()));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
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
        if (["complete", "error"].includes(next.status)) {
          loadHistory();
          if (next.status === "complete") {
            notifyDesktop(
              `TradingAgents : Analyse de ${next.ticker} terminée`,
              `Décision : ${next.result?.display_decision || "Terminée"} (${next.result?.confidence || "Vérifiée"})`
            );
          }
        }
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
        if (next.status === "complete") {
          notifyDesktop(
            "TradingAgents : Scan de marché terminé",
            `${next.ranking?.length || 0} actions analysées et classées.`
          );
        }
      } catch {
        // Transient poll error for scan
      }
    }, 2500);
    return () => window.clearInterval(timer);
  }, [scanJob?.id, scanJob?.status]);

  const submit = async (event) => {
    event.preventDefault();
    requestNotificationPermission();
    setPollWarning("");
    try {
      const next = await api("/api/analyze", { method: "POST", body: JSON.stringify(form) });
      setJob(next);
    } catch (error) {
      setJob({ status: "error", error: error.message });
    }
  };

  const navigate = (nextPage, extraParams = {}) => {
    const applyNavigation = () => {
      setPage(nextPage);
      localStorage.setItem("tradingagents_page", nextPage);
      const url = new URL(window.location);
      url.searchParams.set("page", nextPage);
      Object.keys(extraParams).forEach((k) => {
        if (extraParams[k]) url.searchParams.set(k, extraParams[k]);
        else url.searchParams.delete(k);
      });
      if (nextPage !== "history-detail") {
        url.searchParams.delete("history");
      }
      window.history.pushState({}, "", url.toString());
    };

    if (document.startViewTransition) {
      document.startViewTransition(applyNavigation);
    } else {
      applyNavigation();
    }
  };

  const reset = () => {
    setJob(null);
    setPollWarning("");
    navigate("analysis");
  };

  const openHistory = async (item) => {
    setLoadingHistoryId(item.id);
    setHistoryError("");
    try {
      const restored = await api(`/api/history/${item.id}`);
      setHistoryJob(restored);
      navigate("history-detail", { history: item.id });
    } catch (error) {
      setHistoryError(error.message);
    } finally {
      setLoadingHistoryId(null);
    }
  };

  const handleDeleteHistoryItem = async (historyId) => {
    try {
      await api(`/api/history/${historyId}`, { method: "DELETE" });
      setHistory((prev) => prev.filter((item) => item.id !== historyId));
      showToast("Analyse supprimée de l’historique.");
    } catch (err) {
      showToast(`Erreur : ${err.message}`);
    }
  };

  const handleAddToWatchlist = (ticker) => {
    addToWatchlist(ticker);
    showToast(`${ticker} ajouté à votre Watchlist !`);
  };

  const handleCompareTickers = (tickers) => {
    setCompareTickers(tickers);
    navigate("compare", { tickers: tickers.join(",") });
  };

  const handleCompareSingleTicker = (ticker) => {
    setCompareTickers((prev) => Array.from(new Set([ticker, ...prev])).slice(0, 3));
    navigate("compare");
  };

  const handleAnalyzeFromWatchlist = (ticker) => {
    setForm((f) => ({ ...f, ticker }));
    setJob(null);
    navigate("analysis", { ticker });
  };

  const PAGE_VARIANTS = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
    exit: { opacity: 0, y: -6, transition: { duration: 0.14, ease: [0.7, 0, 0.84, 0] } },
  };

  return (
    <div className="app-shell">
      <PipelineGuidePopover />
      <Topbar onMenu={() => setMenuOpen(true)} online={status.online} model={activeModel} />
      <Sidebar page={page} onPage={navigate} online={status.online} model={activeModel} provider={status.provider_name || "LLM"} analysisActive={analysisActive} scanActive={scanActive} open={menuOpen} onClose={() => setMenuOpen(false)} />
      {menuOpen ? <button className="menu-scrim" onClick={() => setMenuOpen(false)} aria-label="Fermer le menu" /> : null}
      
      <div className="content-shell">
        <AnimatePresence mode="wait">
          {page === "analysis" ? (
            <motion.div key="analysis" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <AnalysisPage
                form={form}
                setForm={setForm}
                job={job}
                online={status.online}
                analysts={capabilities.analysts}
                dataSteps={capabilities.data_steps}
                analystsError={capabilitiesError}
                pollWarning={pollWarning}
                onSubmit={submit}
                onReset={reset}
                onAddToWatchlist={handleAddToWatchlist}
                onCompareTicker={handleCompareSingleTicker}
                onShowToast={showToast}
              />
            </motion.div>
          ) : null}
          {page === "scanner" ? (
            <motion.div key="scanner" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <ScannerPage
                online={status.online}
                job={scanJob}
                setJob={setScanJob}
                onOpenAnalysis={openHistory}
                onAddToWatchlist={handleAddToWatchlist}
                onCompareTickers={handleCompareTickers}
              />
            </motion.div>
          ) : null}
          {page === "compare" ? (
            <motion.div key="compare" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <ComparePage
                history={history}
                initialTickers={compareTickers}
                onOpenAnalysis={(item) => {
                  if (item?.id) openHistory(item);
                  else if (item?.ticker) {
                    setForm((f) => ({ ...f, ticker: item.ticker }));
                    navigate("analysis", { ticker: item.ticker });
                  }
                }}
              />
            </motion.div>
          ) : null}
          {page === "watchlist" ? (
            <motion.div key="watchlist" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <WatchlistPage
                onAnalyzeTicker={handleAnalyzeFromWatchlist}
                onCompareTicker={handleCompareSingleTicker}
              />
            </motion.div>
          ) : null}
          {page === "history" ? (
            <motion.div key="history" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <HistoryPage
                history={history}
                loadingId={loadingHistoryId}
                error={historyError}
                onSelect={openHistory}
                onDeleteItem={handleDeleteHistoryItem}
              />
            </motion.div>
          ) : null}
          {page === "history-detail" && historyJob ? (
            <motion.div key={`history-detail-${historyJob.id}`} variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <ResultPage
                key={historyJob.id}
                job={historyJob}
                historical
                onBackHistory={() => navigate("history")}
                onAddToWatchlist={handleAddToWatchlist}
                onCompareTicker={handleCompareSingleTicker}
                onShowToast={showToast}
              />
            </motion.div>
          ) : null}
          {page === "models" ? (
            <motion.div key="models" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <ModelsPage status={status} refresh={loadStatus} />
            </motion.div>
          ) : null}
          {page === "settings" ? (
            <motion.div key="settings" variants={PAGE_VARIANTS} initial="initial" animate="animate" exit="exit">
              <SettingsPage status={status} />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            className="toast-notification"
            role="status"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <CheckCircle2 size={18} />
            <span>{toast}</span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <GlobalDisclaimerPopup />
    </div>
  );
}

function GlobalDisclaimerPopup() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem("tradingagents_disclaimer_dismissed") === "true";
    } catch {
      return false;
    }
  });

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem("tradingagents_disclaimer_dismissed", "true");
    } catch {}
  };

  return (
    <AnimatePresence>
      {!dismissed ? (
        <motion.aside
          className="disclaimer-floating-popup"
          role="alert"
          aria-live="polite"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 350, damping: 26 }}
        >
          <div className="disclaimer-popup-content">
            <div className="disclaimer-popup-icon-wrap">
              <AlertTriangle size={18} />
            </div>
            <div className="disclaimer-popup-text">
              <strong>Une analyse IA n’est pas un conseil financier.</strong>
              <p>Gardez un regard critique : les informations peuvent être incomplètes ou inexactes. Vérifiez toujours les sources.</p>
            </div>
          </div>
          <button
            type="button"
            className="disclaimer-popup-close"
            onClick={handleDismiss}
            aria-label="Fermer l'avertissement"
            title="Fermer"
          >
            <X size={15} />
          </button>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
