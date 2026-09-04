import React from "react";
import {
  AlertTriangle,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Database,
  FileText,
  LoaderCircle,
  MessageSquareText,
  Scale,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";

import { getCurrencySymbol } from "./companyNames.js";
import { formatDateFr } from "./decisionUtils.js";

export const DATA_COLLECTION_COPY = "Yahoo Finance, ratios financiers, actualités et réseaux sociaux";

export function numberValue(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const parsed = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatTokens(count) {
  if (count === null || count === undefined || Number.isNaN(Number(count))) return "—";
  return Number(count).toLocaleString("fr-FR");
}

export function formatMarketNumber(val, currency = "$") {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return "—";
  return `${Number(val).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} ${currency}`;
}

export function formatVolume(val) {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return "—";
  return Number(val).toLocaleString("fr-FR", { maximumFractionDigits: 0 });
}

export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined || Number.isNaN(Number(seconds))) return null;
  const s = Number(seconds);
  if (s <= 0) return null;
  if (s < 1) return "< 1 s";
  if (s < 60) return `${s.toFixed(1)} s`;
  const mins = Math.floor(s / 60);
  const remSecs = Math.round(s % 60);
  return `${mins} min${remSecs > 0 ? ` ${remSecs} s` : ""}`;
}

export function StageIcon({ id, status }) {
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

export function WorkflowStepList({ steps, connectionUnverified, label }) {
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
        const durCopy = formatDuration(step.duration_sec);
        return (
          <div className={`data-substep ${status}`} key={step.id}>
            <span className="data-substep-icon" aria-hidden="true">{icon}</span>
            <span className="data-substep-copy">
              <span className="data-substep-title-line">
                <strong>{step.label}</strong>
                <span className="data-substep-metrics">
                  {durCopy ? (
                    <span className="step-metric-pill duration" title="Temps d'exécution de cette étape">
                      <Clock3 size={10} /> {durCopy}
                    </span>
                  ) : null}
                  {step.tokens ? (
                    <span className="step-metric-pill tokens" title="Nombre de tokens utilisés">
                      <Zap size={10} /> {formatTokens(step.tokens)}
                    </span>
                  ) : null}
                </span>
              </span>
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

export default function Workflow({ job, defaultDataSteps = [], connectionUnverified = false, title, subtitle }) {
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
  const reliability = job?.result?.reliability || job?.reliability || {};

  return (
    <section className="workflow-panel" aria-live="polite">
      <div className="workflow-head">
        <div>
          <h2>{title || "Déroulement & Traçabilité de l’Analyse"}</h2>
          <p>
            {subtitle ||
              (job
                ? `${job.ticker} · ${job.llm_calls || 0} échanges avec le modèle local`
                : "Les étapes s’afficheront ici dès que vous lancerez l’analyse.")}
          </p>
        </div>
        <div className="workflow-head-metrics">
          {job?.total_tokens ? (
            <span className="workflow-metric-pill tokens" title="Tokens totaux consommés">
              <Zap size={13} /> {formatTokens(job.total_tokens)} tokens
            </span>
          ) : null}
          {job?.elapsed ? (
            <span className="elapsed" title="Temps total de l'analyse">
              <Clock3 size={14} /> {job.elapsed}
            </span>
          ) : null}
        </div>
      </div>
      <div className="stage-list">
        {stages.map((stage, index) => {
          const displayStatus = connectionUnverified && stage.status === "active" ? "unverified" : stage.status;
          const stageDuration = formatDuration(stage.duration_sec);
          return (
            <div className={`stage-row ${displayStatus}`} key={stage.id}>
              <div className="stage-rail" aria-hidden="true">
                <span className="stage-node"><StageIcon id={stage.id} status={displayStatus} /></span>
                {index < stages.length - 1 ? <span className="stage-line" /> : null}
              </div>
              <div className="stage-main">
                <div className="stage-title-row">
                  <h3>{stage.label}</h3>
                  <div className="stage-metrics-wrap">
                    {stageDuration ? (
                      <span className="stage-metric-badge duration" title="Temps cumulé de cette étape">
                        <Clock3 size={11} /> {stageDuration}
                      </span>
                    ) : null}
                    {stage.tokens ? (
                      <span className="stage-metric-badge tokens" title="Tokens consommés dans cette étape">
                        <Zap size={11} /> {formatTokens(stage.tokens)} tokens
                      </span>
                    ) : null}
                    <span className="stage-status">
                      {displayStatus === "complete"
                        ? "Terminé"
                        : displayStatus === "active"
                          ? "En cours"
                          : displayStatus === "unverified"
                            ? "État non vérifié"
                            : displayStatus === "error"
                              ? job?.status === "interrupted"
                                ? "Interrompu"
                                : "Erreur"
                              : "En attente"}
                    </span>
                  </div>
                </div>

                {/* Integrated Transmission & Reliability Checks per Stage */}
                {stage.id === "data" && (reliability.verified_close || reliability.latest_date) ? (
                  <div className="stage-audit-card verified">
                    <ShieldCheck size={16} />
                    <span>
                      <strong>Source unique certifiée :</strong> Cours vérifié à {formatMarketNumber(reliability.verified_close, getCurrencySymbol(job?.ticker))} · Séance du {formatDateFr(reliability.latest_date)} (distribué à l'ensemble des agents).
                    </span>
                  </div>
                ) : null}

                {stage.id === "analysts" && displayStatus === "complete" ? (
                  <div className="stage-audit-card verified">
                    <Users size={16} />
                    <span>
                      <strong>Exploitation certifiée :</strong> {(job?.analysts || []).length || 4} analystes autonomes alimentés par les clôtures et indicateurs vérifiés.
                    </span>
                  </div>
                ) : null}

                {stage.id === "debate" && displayStatus === "complete" ? (
                  <div className="stage-audit-card verified">
                    <MessageSquareText size={16} />
                    <span>
                      <strong>Confrontation contradictoire :</strong> Débat Bull vs Bear cadré sur le cours certifié et les métriques réelles.
                    </span>
                  </div>
                ) : null}

                {stage.id === "trader" && displayStatus === "complete" ? (() => {
                  const vPrice = reliability.verified_close ?? job?.result?.price ?? job?.verified_close;
                  const priceFmt = vPrice != null ? formatMarketNumber(vPrice, getCurrencySymbol(job?.ticker)) : null;
                  return (
                    <div className="stage-audit-card verified">
                      <Scale size={16} />
                      <span>
                        <strong>Cadrage des ordres :</strong> Prix d'entrée, stop-loss et cibles calculés à partir du cours vérifié{priceFmt && priceFmt !== "—" ? ` (${priceFmt})` : ""}.
                      </span>
                    </div>
                  );
                })() : null}

                {stage.id === "portfolio" && displayStatus === "complete" && reliability.block_reason ? (
                  <div className={`stage-audit-card ${reliability.blocked ? "blocked" : "verified"}`}>
                    {reliability.blocked ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
                    <span>
                      <strong>Contrôle anti-hallucination :</strong> {reliability.block_reason}
                    </span>
                  </div>
                ) : null}

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
