import React from "react";
import { AlertTriangle } from "lucide-react";
import { formatTokens } from "../../Workflow.jsx";

export default function AnalysisFailure({ job }) {
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
