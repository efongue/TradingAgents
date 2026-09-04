import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  getDecisionTone,
  formatDecisionLabel,
  getDecisionStrength,
} from "../../decisionUtils.js";
import AgentPolarityBoard from "./AgentPolarityBoard.jsx";

export default function DecisionHero({ result }) {
  const blocked = result?.reliability?.blocked;
  const rawDecision = result?.display_decision || "ATTENDRE";
  const tone = getDecisionTone(rawDecision);
  const decision = formatDecisionLabel(rawDecision);
  const strength = getDecisionStrength(rawDecision);

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
        {blocked ? (
          <div className="confidence-copy blocked">
            <AlertTriangle size={26} />
            <div>
              <strong>Décision invalidée</strong>
              <p>Une incohérence de prix a été détectée sur cette analyse.</p>
            </div>
          </div>
        ) : null}
      </div>

      <AgentPolarityBoard result={result} />
    </section>
  );
}
