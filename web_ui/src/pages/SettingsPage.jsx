import React, { useState } from "react";
import {
  Bell,
  Bot,
  Database,
  Gauge,
  History,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Volume2,
  VolumeX,
  Sun,
  Moon,
} from "lucide-react";
import { formatTokens } from "../Workflow.jsx";
import { formatDateFr } from "../decisionUtils.js";
import { isSoundEnabled, setSoundEnabled, playSuccessChime } from "../utils/audioAlert.js";

export default function SettingsPage({ status, refresh, theme = "dark", onToggleTheme }) {
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled());

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playSuccessChime();
  };

  const configuration = status?.tradingagents || {};
  const capabilities = status?.capabilities || {};
  const analysis = status?.analysis;
  const budgets = configuration.output_token_budgets || {};
  const budgetCopy = [budgets[1], budgets[2], budgets[3]].every((value) => value !== undefined)
    ? `${formatTokens(budgets[1])} / ${formatTokens(budgets[2])} / ${formatTokens(budgets[3])}`
    : "Non disponible";

  return (
    <main className="page simple-page">
      <div className="page-heading">
        <div>
          <h1>Paramètres & Modèles IA</h1>
          <p>Supervisez vos modèles LLM connectés, la passerelle locale et configurez vos préférences d'affichage.</p>
        </div>
        {refresh ? (
          <button className="secondary-button" onClick={refresh} title="Rafraîchir la détection des modèles">
            <RefreshCw size={16} /> Rafraîchir
          </button>
        ) : null}
      </div>

      <h2 className="settings-title">Apparence & Thème d'Affichage</h2>
      <section className="settings-panel">
        <div className="setting-row">
          <div>
            {theme === "light" ? <Sun size={21} style={{ color: "#d97706" }} /> : <Moon size={21} style={{ color: "#38bdf8" }} />}
            <span>
              <strong>Thème Visuel ({theme === "light" ? "Mode Jour" : "Mode Nuit"})</strong>
              <small>Basculez entre le mode clair reposant pour la journée et le mode sombre haute visibilité</small>
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              type="button"
              className={`secondary-button compact ${theme === "dark" ? "active" : ""}`}
              onClick={() => onToggleTheme && theme !== "dark" && onToggleTheme()}
              title="Activer le mode Sombre (Nuit)"
            >
              <Moon size={14} /> Nuit (Sombre)
            </button>
            <button
              type="button"
              className={`secondary-button compact ${theme === "light" ? "active" : ""}`}
              onClick={() => onToggleTheme && theme !== "light" && onToggleTheme()}
              title="Activer le mode Clair (Jour)"
            >
              <Sun size={14} /> Jour (Clair)
            </button>
          </div>
        </div>
      </section>

      <h2 className="settings-title">Alertes & Notifications Intelligentes</h2>
      <section className="settings-panel">
        <div className="setting-row">
          <div>
            {soundOn ? <Volume2 size={21} /> : <VolumeX size={21} />}
            <span>
              <strong>Carillon Sonore de Fin de Calcul</strong>
              <small>Joue un accord discret lors de la fin d'une analyse ou d'un scan de marché</small>
            </span>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {soundOn ? (
              <button
                type="button"
                className="secondary-button compact"
                onClick={() => playSuccessChime()}
                title="Tester le son"
              >
                Tester le son
              </button>
            ) : null}
            <button
              type="button"
              className={`primary-button compact ${soundOn ? "active" : ""}`}
              onClick={handleToggleSound}
            >
              {soundOn ? "Activé" : "Désactivé"}
            </button>
          </div>
        </div>
      </section>

      <h2 className="settings-title">Modèles d'IA Détectés & Passerelle</h2>
      <section className="model-list-panel">
        <div className="connection-strip">
          <span className={`status-dot ${status?.online ? "online" : "offline"}`} />
          <strong>{status?.online ? `${status.provider_name} connecté` : `${status?.provider_name || "Fournisseur"} hors ligne`}</strong>
          <span>{status?.endpoint}</span>
        </div>
        {(status?.models || []).map((model) => (
          <div className={`model-row ${model.name === status.active_model ? "selected" : ""}`} key={model.name}>
            <Bot size={22} />
            <div>
              <strong>{model.name}</strong>
              <span>{model.provider}</span>
            </div>
            {model.name === status.active_model ? <span className="active-label">Actif</span> : null}
          </div>
        ))}
      </section>

      <h2 className="settings-title">Moteur Multi-Agents TradingAgents</h2>
      <section className="settings-panel">
        <div className="setting-row"><div><Gauge size={21} /><span><strong>Fournisseur</strong><small>TRADINGAGENTS_LLM_PROVIDER</small></span></div><code>{configuration.provider || "Non disponible"}</code></div>
        <div className="setting-row"><div><Gauge size={21} /><span><strong>Endpoint LLM</strong><small>TRADINGAGENTS_LLM_BACKEND_URL</small></span></div><code>{configuration.endpoint || "Non disponible"}</code></div>
        <div className="setting-row"><div><Sparkles size={21} /><span><strong>Modèles rapide / profond</strong><small>Modèles réellement transmis au client</small></span></div><code>{configuration.quick_model && configuration.deep_model ? `${configuration.quick_model} / ${configuration.deep_model}` : "Non disponible"}</code></div>
        <div className="setting-row"><div><SlidersHorizontal size={21} /><span><strong>Température</strong><small>Valeur envoyée à chaque appel du modèle</small></span></div><code>{configuration.temperature === null || configuration.temperature === undefined ? "Non disponible" : Number(configuration.temperature).toLocaleString("fr-FR")}</code></div>
        <div className="setting-row"><div><RefreshCw size={21} /><span><strong>Relances du modèle</strong><small>Maximum autorisé pour chaque appel</small></span></div><code>{configuration.max_retries_per_call ?? "Non disponible"}</code></div>
        <div className="setting-row"><div><History size={21} /><span><strong>Reprise après interruption</strong><small>Sauvegarde des étapes de l’analyse</small></span></div><code>{configuration.checkpoint_enabled === true ? "active" : configuration.checkpoint_enabled === false ? "inactive" : "Non disponible"}</code></div>
        <div className="setting-row"><div><ShieldCheck size={21} /><span><strong>Blocage des incohérences</strong><small>Compare les prix proposés au dernier cours vérifié</small></span></div><code>{configuration.price_consistency_check === true ? "actif" : configuration.price_consistency_check === false ? "inactif" : "Non disponible"}</code></div>
      </section>

      <h2 className="settings-title">Capacités & Quotas OmniRoute</h2>
      <section className="settings-panel">
        <div className="setting-row"><div><Database size={21} /><span><strong>Entrée maximale</strong><small>Fenêtre de contexte maximale déclarée</small></span></div><code>{capabilities.max_input_tokens ? `${formatTokens(capabilities.max_input_tokens)} tokens` : "Non disponible"}</code></div>
        <div className="setting-row"><div><Gauge size={21} /><span><strong>Sortie maximale</strong><small>Génération maximale par requête</small></span></div><code>{capabilities.max_output_tokens ? `${formatTokens(capabilities.max_output_tokens)} tokens` : "Non disponible"}</code></div>
        <div className="setting-row"><div><Sparkles size={21} /><span><strong>Appels d’outils</strong><small>Function calling natif</small></span></div><code>{capabilities.tool_calling === true ? "supportés" : capabilities.tool_calling === false ? "non supportés" : "Non disponible"}</code></div>
        <div className="setting-row"><div><Sparkles size={21} /><span><strong>Raisonnement</strong><small>Chaîne de pensée / réflexion</small></span></div><code>{capabilities.reasoning === true ? "supporté" : capabilities.reasoning === false ? "non supporté" : "Non disponible"}</code></div>
      </section>

      <h2 className="settings-title">Analyse en cours</h2>
      <section className="settings-panel">
        {analysis ? <>
          <div className="setting-row"><div><Gauge size={21} /><span><strong>Instrument / date</strong><small>Requête actuellement exécutée</small></span></div><code>{analysis.ticker} · {formatDateFr(analysis.analysis_date)}</code></div>
          <div className="setting-row"><div><SlidersHorizontal size={21} /><span><strong>Profondeur / analystes</strong><small>Choix envoyés par le formulaire</small></span></div><code>{analysis.depth} · {(analysis.analysts || []).join(", ")}</code></div>
          <div className="setting-row"><div><Gauge size={21} /><span><strong>Budget / appels estimés</strong><small>Tokens de sortie par appel · estimation</small></span></div><code>{formatTokens(analysis.output_tokens_per_call)} / {analysis.estimated_model_calls ?? "—"}</code></div>
        </> : <div className="settings-empty">Aucune analyse en cours. Les paramètres apparaîtront ici après le lancement.</div>}
        <div className="setting-row"><div><Gauge size={21} /><span><strong>Budgets disponibles</strong><small>Rapide / moyenne / approfondie</small></span></div><code>{budgetCopy}</code></div>
      </section>
    </main>
  );
}
