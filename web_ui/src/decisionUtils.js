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

/**
 * Formate et traduit la décision en français naturel pour l'interface.
 */
export function formatDecisionLabel(decision) {
  if (!decision) return "À analyser";
  const str = String(decision).trim();
  const upper = str.toUpperCase();

  // Strong Buy / Achat Fort
  if (/STRONG\s*BUY|ACHAT\s*FORT|ACHETER\s*FORT/.test(upper)) return "ACHAT FORT";
  // Overweight / Surpondérer
  if (/OVERWEIGHT|SURPOND[EÉ]RER/.test(upper)) return "SURPONDÉRER";
  // Outperform / Surperformer
  if (/OUTPERFORM|SURPERFORMER/.test(upper)) return "SURPERFORMER";
  // Accumulate / Accumuler / Renforcer
  if (/ACCUMULAT(E|ER)|RENFORCER/.test(upper)) return "ACCUMULER";
  // Buy / Acheter
  if (/^BUY$|^ACHAT$|^ACHETER$/.test(upper) || /ACHETER|BUY/.test(upper)) return "ACHETER";

  // Strong Sell / Vente Forte
  if (/STRONG\s*SELL|VENTE\s*FORTE|VENDRE\s*FORT/.test(upper)) return "VENTE FORTE";
  // Underweight / Sous-pondérer
  if (/UNDERWEIGHT|SOUS[\s-]*POND[EÉ]RER/.test(upper)) return "SOUS-PONDÉRER";
  // Underperform / Sous-performer
  if (/UNDERPERFORM|SOUS[\s-]*PERFORMER/.test(upper)) return "SOUS-PERFORMER";
  // Reduce / Alléger
  if (/REDUCE|ALL[EÉ]GER|R[EÉ]DUIRE/.test(upper)) return "ALLÉGER";
  // Sell / Vendre
  if (/^SELL$|^VENTE$|^VENDRE$/.test(upper) || /VENDRE|SELL/.test(upper)) return "VENDRE";

  // Neutral / Equal-weight / Pondération neutre
  if (/EQUAL[\s-]*WEIGHT|POND[EÉ]RATION\s*NEUTRE|MARKET[\s-]*PERFORM/.test(upper)) return "PONDÉRATION NEUTRE";
  // Hold / Conserver
  if (/^HOLD$|^CONSERVER$/.test(upper) || /CONSERVER|HOLD/.test(upper)) return "CONSERVER";
  // Wait / Attendre
  if (/^WAIT$|^ATTENDRE$|^PATIENTER$/.test(upper) || /ATTENDRE|PATIENTER/.test(upper)) return "ATTENDRE";
  // Neutral / Neutre
  if (/^NEUTRAL$|^NEUTRE$/.test(upper) || /NEUTRE|NEUTRAL/.test(upper)) return "NEUTRE";

  return str;
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
