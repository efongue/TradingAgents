import React, { useMemo } from "react";
import {
  Award,
  BarChart3,
  BookOpen,
  MessageSquareText,
  Newspaper,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { isPositiveDecision, isNegativeDecision } from "../../decisionUtils.js";
import PolarityCard from "./PolarityCard.jsx";

export function extractAgentPositions(result) {
  const reports = result?.reports || {};
  const rawDecision = String(result?.display_decision || "").toUpperCase();

  const isPosDec = isPositiveDecision(rawDecision);
  const isNegDec = isNegativeDecision(rawDecision);

  const analyzeSentiment = (text, fallbackStance = "neutral") => {
    if (!text || typeof text !== "string") return fallbackStance;
    const lower = text.toLowerCase();
    const bullMatches = (lower.match(/\b(bullish|haussier|achat|acheter|surpondérer|surperformance|croissance|favorable|opportunité|rebond|accumuler|solide|surperformer|positif)\b/gi) || []).length;
    const bearMatches = (lower.match(/\b(bearish|baissier|vente|vendre|sous-pondérer|sous-performance|risque|prudence|dégradation|fragile|surévalué|alléger|négatif)\b/gi) || []).length;
    if (bullMatches > bearMatches + 1) return "positive";
    if (bearMatches > bullMatches + 1) return "negative";
    return fallbackStance;
  };

  const extractSnippet = (text, fallback) => {
    if (!text) return fallback;
    let clean = text
      .replace(/^#+.*$/gm, " ")
      .replace(/(?:Bull|Bear|Market|Fundamentals|News|Social|Research|Portfolio)?\s*(?:Analyst|Researcher|Manager)?\s*:\s*#*\s*/gi, " ")
      .replace(/FINAL TRANSACTION PROPOSAL\s*:\s*[A-Z\s_-]+/gi, " ")
      .replace(/Date d'analyse\s*:\s*[^.\n]+/gi, " ")
      .replace(/Société\s*:\s*[^.\n]+/gi, " ")
      .replace(/Secteur\s*\/\s*industrie\s*:\s*[^.\n]+/gi, " ")
      .replace(/Place de cotation\s*:\s*[^.\n]+/gi, " ")
      .replace(/Ticker\s*:\s*[^.\n]+/gi, " ")
      .replace(/\*\*/g, "")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/\s+/g, " ")
      .trim();

    const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => {
      const low = s.toLowerCase();
      return s.length > 25 && !low.startsWith("date d") && !low.startsWith("société") && !low.startsWith("secteur");
    });
    const first = (sentences[0] || clean).replace(/^[#:\s-]+/, "").trim();
    return first.length > 160 ? `${first.slice(0, 160)}...` : first;
  };

  const marketStance = analyzeSentiment(reports.market, isPosDec ? "positive" : isNegDec ? "negative" : "neutral");
  const fundamentalsStance = analyzeSentiment(reports.fundamentals, isPosDec ? "positive" : isNegDec ? "negative" : "neutral");
  const newsStance = analyzeSentiment(reports.news, "neutral");
  const arbitratorStance = isPosDec ? "positive" : isNegDec ? "negative" : "neutral";

  const agents = [
    {
      id: "bull",
      name: "Chercheur Haussier",
      icon: TrendingUp,
      stance: "positive",
      stanceTag: "Haussier",
      summary: extractSnippet(reports.bull, "Arguments favorables, leviers de marge et catalyseurs de croissance identifiés."),
    },
    {
      id: "bear",
      name: "Chercheur Baissier",
      icon: TrendingDown,
      stance: "negative",
      stanceTag: "Prudent",
      summary: extractSnippet(reports.bear, "Points de vigilance, pression sur les valorisations et risques de repli identifiés."),
    },
    {
      id: "market",
      name: "Analyste Marché",
      icon: BarChart3,
      stance: marketStance,
      stanceTag: marketStance === "positive" ? "Haussier" : marketStance === "negative" ? "Baissier" : "Neutre",
      summary: extractSnippet(reports.market, "Analyse technique, moyennes mobiles et momentum du cours."),
    },
    {
      id: "fundamentals",
      name: "Analyste Fondamentaux",
      icon: BookOpen,
      stance: fundamentalsStance,
      stanceTag: fundamentalsStance === "positive" ? "Solide" : fundamentalsStance === "negative" ? "Fragile" : "Neutre",
      summary: extractSnippet(reports.fundamentals, "Multiples de valorisation, rentabilité et solidité bilancielle."),
    },
    {
      id: "news",
      name: "Analyste Actualités",
      icon: Newspaper,
      stance: newsStance,
      stanceTag: newsStance === "positive" ? "Favorable" : newsStance === "negative" ? "Défavorable" : "Neutre",
      summary: extractSnippet(reports.news, "Flux d'actualités récentes et annonces sectorielles."),
    },
    {
      id: "research_manager",
      name: "Arbitre du Débat",
      icon: Award,
      stance: arbitratorStance,
      stanceTag: arbitratorStance === "positive" ? "Favorable" : arbitratorStance === "negative" ? "Prudent" : "Partagé",
      summary: extractSnippet(reports.research_manager, "Synthèse collégiale des thèses haussières et baissières."),
    },
  ];

  if (reports.social) {
    const socialStance = analyzeSentiment(reports.social, "neutral");
    agents.push({
      id: "social",
      name: "Analyste Réseaux & Sentiment",
      icon: MessageSquareText,
      stance: socialStance,
      stanceTag: socialStance === "positive" ? "Positif" : socialStance === "negative" ? "Négatif" : "Neutre",
      summary: extractSnippet(reports.social, "Volume d'engagement, signaux retail et sentiment des investisseurs."),
    });
  }

  return {
    negative: agents.filter((a) => a.stance === "negative"),
    neutral: agents.filter((a) => a.stance === "neutral"),
    positive: agents.filter((a) => a.stance === "positive"),
  };
}

export default function AgentPolarityBoard({ result }) {
  const positions = useMemo(() => extractAgentPositions(result), [result]);

  return (
    <div className="agent-polarity-board">
      <div className="polarity-board-head">
        <span className="polarity-board-title">
          <Sparkles size={14} /> Positionnement des Analystes & Débatteurs
        </span>
        <span className="polarity-board-count">
          {positions.positive.length} Favorable(s) · {positions.neutral.length} Neutre(s) · {positions.negative.length} Prudent(s)
        </span>
      </div>

      <div className="polarity-grid">
        {/* Colonne 1 : Négatif / Prudent */}
        <div className="polarity-column negative">
          <div className="polarity-col-header">
            <span className="polarity-dot negative" />
            <strong className="polarity-col-title">Prudent / Risque</strong>
            <span className="polarity-col-count">{positions.negative.length}</span>
          </div>
          <div className="polarity-col-cards">
            {positions.negative.length ? (
              positions.negative.map((agent) => (
                <PolarityCard key={agent.id} agent={agent} />
              ))
            ) : (
              <span className="polarity-empty">Aucun avis prudent</span>
            )}
          </div>
        </div>

        {/* Colonne 2 : Neutre / Attente */}
        <div className="polarity-column neutral">
          <div className="polarity-col-header">
            <span className="polarity-dot neutral" />
            <strong className="polarity-col-title">Neutre / Attente</strong>
            <span className="polarity-col-count">{positions.neutral.length}</span>
          </div>
          <div className="polarity-col-cards">
            {positions.neutral.length ? (
              positions.neutral.map((agent) => (
                <PolarityCard key={agent.id} agent={agent} />
              ))
            ) : (
              <span className="polarity-empty">Aucun avis neutre</span>
            )}
          </div>
        </div>

        {/* Colonne 3 : Positif / Favorable */}
        <div className="polarity-column positive">
          <div className="polarity-col-header">
            <span className="polarity-dot positive" />
            <strong className="polarity-col-title">Favorable / Opportunité</strong>
            <span className="polarity-col-count">{positions.positive.length}</span>
          </div>
          <div className="polarity-col-cards">
            {positions.positive.length ? (
              positions.positive.map((agent) => (
                <PolarityCard key={agent.id} agent={agent} />
              ))
            ) : (
              <span className="polarity-empty">Aucun avis favorable</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
