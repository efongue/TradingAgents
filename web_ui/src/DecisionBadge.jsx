import React from "react";
import { formatDecisionLabel, getDecisionStrength } from "./decisionUtils.js";

/**
 * Composant Badge Décision avec indicateur visuel de force (1 à 3 barres / nuances).
 * Distingue clairement Achat Fort (3 barres / vert néon), Surpondérer (2 barres / vert menthe) et Acheter/Accumuler (1 barre / vert sauge).
 */
export default function DecisionBadge({
  decision,
  size = "md",
  showStrengthBars = true,
  showTag = false,
  className = "",
}) {
  const label = formatDecisionLabel(decision);
  const strength = getDecisionStrength(decision);
  const { tone, tier, level, badgeLabel, tag } = strength;

  return (
    <span
      className={`decision-pill-badge ${tone} tier-${tier} size-${size} ${className}`}
      title={`Décision : ${label} · Force : ${badgeLabel} (${level}/3)`}
      aria-label={`Décision : ${label}, Force : ${badgeLabel}`}
    >
      {showStrengthBars ? (
        <span className="strength-bars" aria-hidden="true">
          <i className={`bar b1 ${level >= 1 ? "active" : ""}`} />
          <i className={`bar b2 ${level >= 2 ? "active" : ""}`} />
          <i className={`bar b3 ${level >= 3 ? "active" : ""}`} />
        </span>
      ) : (
        <i className="status-dot" aria-hidden="true" />
      )}
      <span className="decision-pill-text">{label}</span>
      {showTag && tag ? <span className="decision-strength-tag">{tag}</span> : null}
    </span>
  );
}
