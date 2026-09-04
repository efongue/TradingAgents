import React from "react";
import { Sparkles, X } from "lucide-react";

export default function PipelineGuidePopover() {
  return (
    <div
      id="pipeline-guide-popover"
      popover="auto"
      className="pipeline-guide-popover"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pipeline-guide-title"
    >
      <div className="popover-header">
        <div>
          <Sparkles size={20} />
          <h2 id="pipeline-guide-title">Architecture & Méthodologie TradingAgents</h2>
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
