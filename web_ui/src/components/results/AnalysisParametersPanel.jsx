import React from "react";
import {
  BarChart3,
  Bot,
  ChevronDown,
  Database,
  History,
  MessageSquareText,
  Newspaper,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";
import { formatTokens } from "../../Workflow.jsx";
import { formatDateFr } from "../../decisionUtils.js";
import ParameterCard from "../ui/ParameterCard.jsx";

export default function AnalysisParametersPanel({ job, result }) {
  const parameters = result?.analysis_parameters || {};
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
          <strong className="parameter-primary-value">{model.name || job?.model || "Non enregistré"}</strong>
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
                  ? `${formatDateFr(request.start_date)} → ${formatDateFr(request.end_date)}`
                  : request.lookback_days
                    ? `${request.lookback_days} jours avant le ${formatDateFr(request.end_date || job?.analysis_date)}`
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
          <p>{memory.used === true ? `Des enseignements antérieurs ont été injectés pour ${job?.ticker}.` : memory.used === false ? "Aucun enseignement antérieur n’a été injecté." : "Ce détail n’existait pas dans l’ancien historique."}</p>
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
