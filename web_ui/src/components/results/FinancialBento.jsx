import React from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  MessageSquareText,
  Newspaper,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { getCurrencySymbol } from "../../companyNames.js";
import { getDecisionTone } from "../../decisionUtils.js";
import { formatMarketNumber, formatVolume, numberValue } from "../../Workflow.jsx";
import { reportHighlights } from "../../utils/reportUtils.js";
import BentoInsight from "../ui/BentoInsight.jsx";

export default function FinancialBento({ job, result }) {
  const reports = result?.reports || {};
  const snapshot = result?.snapshot || {};
  const reliability = result?.reliability || {};
  const rawDecision = String(result?.display_decision || "ATTENDRE").toUpperCase();
  const tone = getDecisionTone(rawDecision);
  const close = numberValue(snapshot.close ?? reliability.verified_close);
  const open = numberValue(snapshot.open);
  const high = numberValue(snapshot.high);
  const low = numberValue(snapshot.low);
  const volume = numberValue(snapshot.volume);
  const rangePosition = close !== null && low !== null && high !== null && high > low
    ? Math.min(100, Math.max(0, ((close - low) / (high - low)) * 100))
    : 50;
  const thesis = reportHighlights(reports.portfolio || result?.summary, 3);
  const debateSource = [reports.research_manager, reports.bull, reports.bear].filter(Boolean).join("\n");
  const riskSource = [reports.conservative, reports.neutral, reports.aggressive].filter(Boolean).join("\n");

  const bentoVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.02 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
  };

  return (
    <motion.section
      className={`financial-bento ${tone}`}
      aria-label={`Vue bento de l’analyse ${job?.ticker}`}
      variants={bentoVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 1. Core Strategic Thesis & Key Catalysts */}
      <motion.article className="bento-card bento-thesis-hero" variants={itemVariants} whileHover={{ y: -2 }}>
        <div className="bento-card-title">
          <Sparkles size={18} />
          <h3>Thèse d'Investissement & Synthèse Stratégique ({job?.ticker})</h3>
        </div>
        <div className="bento-thesis-content">
          {thesis.length ? (
            <ul className="bento-thesis-list">
              {thesis.map((point, i) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          ) : (
            <p className="bento-empty">Synthèse de la recommandation institutionnelle disponible dans les rapports détaillés.</p>
          )}
        </div>
      </motion.article>

      {/* 2. Fourchette de séance (OHLC + Volume) */}
      <motion.article className="bento-card bento-range" variants={itemVariants} whileHover={{ y: -2 }}>
        <div className="bento-card-title"><BarChart3 size={18} /><h3>Fourchette de séance & Volumes</h3></div>
        <div className="bento-range-track" aria-label={`Position du cours dans la fourchette : ${Math.round(rangePosition)} %`}>
          <motion.i
            initial={{ left: "0%" }}
            animate={{ left: `${rangePosition}%` }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          />
        </div>
        <dl>
          <div><dt>Plus bas</dt><dd>{formatMarketNumber(low, getCurrencySymbol(job?.ticker))}</dd></div>
          <div><dt>Ouverture</dt><dd>{formatMarketNumber(open, getCurrencySymbol(job?.ticker))}</dd></div>
          <div><dt>Plus haut</dt><dd>{formatMarketNumber(high, getCurrencySymbol(job?.ticker))}</dd></div>
          <div><dt>Volume</dt><dd>{volume !== null ? `${formatVolume(volume)} titres` : "—"}</dd></div>
        </dl>
      </motion.article>

      {/* 3. Données & Intégrité */}
      <motion.article className={`bento-card bento-quality ${reliability.blocked ? "blocked" : "verified"}`} variants={itemVariants} whileHover={{ y: -2 }}>
        {reliability.blocked ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
        <strong>{reliability.blocked ? "Contrôle bloquant" : "Données contrôlées"}</strong>
        <p>{reliability.block_reason || "Aucune anomalie critique sur les cours ou les flux analysés."}</p>
      </motion.article>

      {/* 4. Analyst Poles */}
      <BentoInsight
        title="Signal technique & Marché"
        icon={TrendingUp}
        source={reports.market}
        className="bento-market"
        fallback="L’analyste marché n’a pas produit de rapport pour cette analyse."
      />
      <BentoInsight
        title="Analyse Fondamentale & Métriques"
        icon={BookOpen}
        source={reports.fundamentals}
        className="bento-fundamentals"
        fallback="Aucune donnée fondamentale n’est disponible dans ce rapport."
      />
      <BentoInsight
        title="Actualités & Sentiment de marché"
        icon={Newspaper}
        source={reports.news}
        className="bento-news"
        fallback="Aucune actualité n’est disponible dans ce rapport."
      />
      <BentoInsight
        title="Débat Stratégique Bull vs Bear"
        icon={MessageSquareText}
        source={debateSource}
        className="bento-debate"
        fallback="Aucun débat haussier ou baissier n’est disponible."
      />
      <BentoInsight
        title="Facteurs de Risque & Horizon"
        icon={ShieldCheck}
        source={riskSource}
        className="bento-risk"
        fallback="Aucune analyse de risque n’est disponible."
      />
    </motion.section>
  );
}
