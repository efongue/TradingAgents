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
  if (/OVERWEIGHT|SURPOND[EÉ]R|OUTPERFORM|SURPERFORM/.test(upper)) return "SURPONDÉRER";
  // Accumulate / Accumuler / Renforcer
  if (/ACCUMUL|RENFORC/.test(upper)) return "ACCUMULER";
  // Buy / Acheter
  if (/^BUY$|^ACHAT$|^ACHETER$/.test(upper) || /ACHETER|BUY/.test(upper)) return "ACHETER";

  // Strong Sell / Vente Forte
  if (/STRONG\s*SELL|VENTE\s*FORTE|VENDRE\s*FORT/.test(upper)) return "VENTE FORTE";
  // Underweight / Sous-pondérer
  if (/UNDERWEIGHT|SOUS[\s-]*POND[EÉ]R|UNDERPERFORM|SOUS[\s-]*PERFORM/.test(upper)) return "SOUS-PONDÉRER";
  // Reduce / Alléger
  if (/REDUCE|ALL[EÉ]G|R[EÉ]DUIRE/.test(upper)) return "ALLÉGER";
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

/**
 * Retourne le niveau de force et de conviction de la décision (1 à 3) :
 * - level: 3 (Force maximale / Extrême), 2 (Force stratégique / Surpondération), 1 (Force modérée / Standard), 0 (Neutre)
 * - tier: "strong" | "strategic" | "moderate" | "neutral"
 * - tone: "positive" | "negative" | "neutral"
 * - badgeLabel: Libellé court explicite de la force
 * - tag: Tag visuel avec icône
 */
export function getDecisionStrength(decision) {
  if (!decision) {
    return {
      level: 0,
      tier: "neutral",
      tone: "neutral",
      badgeLabel: "Neutre",
      tag: "⚖️ Statu Quo",
      description: "Aucun déséquilibre directionnel majeur",
    };
  }

  const upper = String(decision).toUpperCase().trim();

  // === FAMILLE HAUSSIÈRE / ACHAT ===
  // Force 3 : Achat Fort / Conviction Maximale
  if (/STRONG\s*BUY|ACHAT\s*FORT|ACHETER\s*FORT/.test(upper)) {
    return {
      level: 3,
      tier: "strong",
      tone: "positive",
      badgeLabel: "Force Maximale",
      tag: "⚡ Conviction Forte",
      description: "Convergence unanime des agents et fort potentiel",
    };
  }
  // Force 2 : Surpondérer / Surperformer (Force Stratégique)
  if (/OVERWEIGHT|SURPOND[EÉ]R|OUTPERFORM|SURPERFORM/.test(upper)) {
    return {
      level: 2,
      tier: "strategic",
      tone: "positive",
      badgeLabel: "Surpondération",
      tag: "📈 Allocation +",
      description: "Surperformance attendue par rapport au marché",
    };
  }
  // Force 1 : Acheter / Accumuler (Force Modérée / Standard)
  if (/BUY|ACHAT|ACHETER|ACCUMUL|RENFORC|HAUSSIER|BULLISH/.test(upper)) {
    return {
      level: 1,
      tier: "moderate",
      tone: "positive",
      badgeLabel: "Entrée / Accumulation",
      tag: "✨ Entrée / Renfort",
      description: "Opportunité d'achat ou renforcement progressif",
    };
  }

  // === FAMILLE BAISSIÈRE / VENTE ===
  // Force 3 : Vente Forte / Urgence Maximale
  if (/STRONG\s*SELL|VENTE\s*FORTE|VENDRE\s*FORT/.test(upper)) {
    return {
      level: 3,
      tier: "strong",
      tone: "negative",
      badgeLabel: "Sortie Urgente",
      tag: "⚠️ Alerte Sortie",
      description: "Risques élevés et désaccord baissier marqué",
    };
  }
  // Force 2 : Sous-pondérer / Sous-performer
  if (/UNDERWEIGHT|SOUS[\s-]*POND[EÉ]R|UNDERPERFORM|SOUS[\s-]*PERFORM/.test(upper)) {
    return {
      level: 2,
      tier: "strategic",
      tone: "negative",
      badgeLabel: "Sous-pondération",
      tag: "📉 Allocation -",
      description: "Sous-performance attendue par rapport à l'indice",
    };
  }
  // Force 1 : Vendre / Alléger / Réduire
  if (/SELL|VENTE|VENDRE|ALL[EÉ]G|R[EÉ]DUIRE|BAISSIER|BEARISH|SHORT/.test(upper)) {
    return {
      level: 1,
      tier: "moderate",
      tone: "negative",
      badgeLabel: "Allègement",
      tag: "🔻 Prise de Profit",
      description: "Réduction tactique de l'exposition au titre",
    };
  }

  // === FAMILLE NEUTRE ===
  return {
    level: 0,
    tier: "neutral",
    tone: "neutral",
    badgeLabel: "Neutre",
    tag: "⚖️ Statu Quo",
    description: "Position à conserver, attendre un catalyseur",
  };
}
