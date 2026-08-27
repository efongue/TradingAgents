// Utilitaires de normalisation et d'harmonisation des décisions d'investissement (SaaS Financier)

const POSITIVE_TERMS = [
  "ACHETER",
  "ACHAT",
  "BUY",
  "ACCUMULER",
  "ACCUMULATE",
  "OVERWEIGHT",
  "SURPONDÉRER",
  "SURPONDERER",
  "OUTPERFORM",
  "SURPERFORMER",
  "RENFORCER",
  "HAUSSIER",
  "BULLISH",
];

const NEGATIVE_TERMS = [
  "VENDRE",
  "VENTE",
  "SELL",
  "ALLÉGER",
  "ALLEGER",
  "RÉDUIRE",
  "REDUCE",
  "UNDERWEIGHT",
  "SOUSPONDÉRER",
  "SOUSPONDERER",
  "UNDERPERFORM",
  "SOUS-PERFORMER",
  "BAISSIER",
  "BEARISH",
  "SHORT",
];

/**
 * Retourne le tone sémantique ("positive" | "negative" | "neutral")
 * pour harmoniser les codes couleurs partout dans le SaaS.
 */
export function getDecisionTone(decision) {
  if (!decision) return "neutral";
  const str = String(decision).toUpperCase().trim();

  // Check positive matches
  if (POSITIVE_TERMS.some((term) => str.includes(term))) {
    return "positive";
  }

  // Check negative matches
  if (NEGATIVE_TERMS.some((term) => str.includes(term))) {
    return "negative";
  }

  // Default to neutral (HOLD, CONSERVER, ATTENDRE, EQUAL-WEIGHT, etc.)
  return "neutral";
}

export function isPositiveDecision(decision) {
  return getDecisionTone(decision) === "positive";
}

export function isNegativeDecision(decision) {
  return getDecisionTone(decision) === "negative";
}

export function isNeutralDecision(decision) {
  return getDecisionTone(decision) === "neutral";
}
