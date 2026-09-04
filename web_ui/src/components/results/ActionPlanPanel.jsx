import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  TrendingUp,
  Scale,
  CheckCircle2,
  Copy,
  Check,
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";
import { getCompanyName, getCurrencySymbol } from "../../companyNames.js";
import {
  isNegativeDecision,
  isPositiveDecision,
  formatDecisionLabel,
  getDecisionTone,
} from "../../decisionUtils.js";
import { formatMarketNumber } from "../../Workflow.jsx";

export default function ActionPlanPanel({ job, result, onShowToast }) {
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeProfileTab, setActiveProfileTab] = useState("all");

  const ticker = job?.ticker || "TITRE";
  const companyName = getCompanyName(ticker);
  const currency = getCurrencySymbol(ticker);

  const decision = result?.display_decision || result?.decision || result?.raw_decision || "CONSERVER";
  const tone = getDecisionTone(decision);
  const isBullish = isPositiveDecision(decision);
  const isBearish = isNegativeDecision(decision);

  const levels = result?.execution_levels || {};
  const currentPrice = levels.entry_price || result?.price || job?.snapshot?.close || 0;
  const targetPrice = levels.target_price || 0;
  const stopLoss = levels.stop_loss || 0;
  const targetPct = levels.target_change_percent != null
    ? levels.target_change_percent
    : (currentPrice && targetPrice ? ((targetPrice - currentPrice) / currentPrice) * 100 : 0);
  const stopPct = levels.stop_change_percent != null
    ? levels.stop_change_percent
    : (currentPrice && stopLoss ? ((stopLoss - currentPrice) / currentPrice) * 100 : 0);

  const rrRatio = levels.risk_reward_ratio || (
    Math.abs(stopPct) > 0 ? (Math.abs(targetPct) / Math.abs(stopPct)).toFixed(1) : "—"
  );

  const copyToClipboard = (text, key) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      if (onShowToast) onShowToast("Plan d'action copié dans le presse-papier !");
      setTimeout(() => setCopiedKey(null), 2500);
    }
  };

  // Profile 1: Existing Long Holder
  const renderProfileLongHolder = () => {
    let title = "";
    let badgeClass = "";
    let summaryText = "";
    let actionableSteps = [];

    if (isBullish) {
      title = "Conserver et Renforcer / Laisser courir les gains";
      badgeClass = "positive";
      summaryText = `Le consensus est favorable pour ${ticker}. Vous pouvez maintenir votre exposition et envisager un renforcement tactique sur la zone de cours certifié à ${formatMarketNumber(currentPrice, currency)}.`;
      actionableSteps = [
        `Maintenir la position long avec un objectif de valorisation fixé à ${formatMarketNumber(targetPrice, currency)} (${targetPct > 0 ? `+${targetPct.toFixed(1)}%` : `${targetPct.toFixed(1)}%`}).`,
        `Placer un stop de protection / stop suiveur sous le support clé à ${formatMarketNumber(stopLoss, currency)} (${stopPct.toFixed(1)}%) pour verrouiller vos plus-values en cas de retournement.`,
        `Envisager des prises de bénéfices partielles (25-30% de la ligne) à l'approche de la zone de résistance cible (${formatMarketNumber(targetPrice, currency)}).`,
      ];
    } else if (isBearish) {
      title = "Allègement conseillé / Prise de bénéfices de précaution";
      badgeClass = "negative";
      summaryText = `Position défensive requise : allègement partiel recommandé (10 à 25% de la ligne) autour du cours actuel de ${formatMarketNumber(currentPrice, currency)}. Pas de nouvel achat avant confirmation d'un support.`;
      actionableSteps = [
        `Alléger immédiatement 10 à 25 % de la ligne à ${formatMarketNumber(currentPrice, currency)} pour sécuriser des liquidités et neutraliser le risque de baisse court terme.`,
        `Attendre le repli vers le support majeur estimé à ${formatMarketNumber(targetPrice, currency)} (${targetPct.toFixed(1)}%) pour réévaluer un rachat à meilleur compte si les fondamentaux restent sains.`,
        `Sortie totale ou protection renforcée si le titre franchit à la hausse son niveau d'invalidation baissière à ${formatMarketNumber(stopLoss, currency)} (${stopPct > 0 ? `+${stopPct.toFixed(1)}%` : `${stopPct.toFixed(1)}%`}).`,
      ];
    } else {
      title = "Conserver sans nouvel apport de capital";
      badgeClass = "neutral";
      summaryText = `Phase de consolidation ou neutralité technique sur ${ticker}. Conservez les positions existantes avec une gestion disciplinée du risque sans engager de nouveaux capitaux.`;
      actionableSteps = [
        `Conserver les positions ouvertes sans renforcer au milieu du range actuel (${formatMarketNumber(currentPrice, currency)}).`,
        `Maintenir une protection sous ${formatMarketNumber(stopLoss, currency)} (${stopPct.toFixed(1)}%) comme seuil d'alerte en cas de rupture de consolidation.`,
        `Surveiller un franchissement haussier validé avec volume au-dessus de ${formatMarketNumber(targetPrice || (currentPrice * 1.05), currency)} avant tout nouvel investissement.`,
      ];
    }

    return { title, badgeClass, summaryText, actionableSteps };
  };

  // Profile 2: Active Trader / CFD / Short
  const renderProfileActiveTrader = () => {
    let orderType = "";
    let badgeClass = "";
    let summaryText = "";
    let orderDetails = {};

    if (isBullish) {
      orderType = "Ordre Achat Long cadré (Bracket Order)";
      badgeClass = "positive";
      summaryText = `Configuration haussière validée. Entrée à l'achat avec ratio Risque/Rendement calibré à ${rrRatio}:1.`;
      orderDetails = {
        type: "BUY / ACHAT LONG",
        entry: `${formatMarketNumber(currentPrice, currency)} (Cours actuel / Ordre Limit)`,
        stopLoss: `${formatMarketNumber(stopLoss, currency)} (${stopPct.toFixed(1)}%) · Seuil d'invalidation`,
        takeProfit: `${formatMarketNumber(targetPrice, currency)} (${targetPct > 0 ? `+${targetPct.toFixed(1)}%` : `${targetPct.toFixed(1)}%`}) · Objectif cible`,
        riskReward: `${rrRatio} : 1`,
      };
    } else if (isBearish) {
      orderType = "Ordre Short classique / Vente à découvert (Bracket Order)";
      badgeClass = "negative";
      summaryText = `Configuration baissière ou repli tactique. Stratégie de vente à découvert cadrée avec ratio Risque/Rendement de ${rrRatio}:1.`;
      orderDetails = {
        type: "SELL / SHORT (Vente à découvert)",
        entry: `${formatMarketNumber(currentPrice, currency)} (Vente au cours actuel)`,
        stopLoss: `${formatMarketNumber(stopLoss, currency)} (${stopPct > 0 ? `+${stopPct.toFixed(1)}%` : `${stopPct.toFixed(1)}%`}) · Achat de protection (Buy Stop)`,
        takeProfit: `${formatMarketNumber(targetPrice, currency)} (${targetPct.toFixed(1)}%) · Rachat de gain sur support (Take Profit)`,
        riskReward: `${rrRatio} : 1`,
      };
    } else {
      orderType = "Pas de trade directionnel immédiat (Range Trading)";
      badgeClass = "neutral";
      summaryText = `Signal neutre. Risque de faux départs élevé dans le range actuel. Privilégiez l'attente d'une cassure franche.`;
      orderDetails = {
        type: "ATTENTE / RANGE TRADING",
        entry: `Attendre cassure > ${formatMarketNumber(targetPrice || (currentPrice * 1.04), currency)} ou repli < ${formatMarketNumber(stopLoss || (currentPrice * 0.96), currency)}`,
        stopLoss: `Placer à l'opposé du point de cassure`,
        takeProfit: `Objectif de swing à définir sur breakout`,
        riskReward: `Neutre`,
      };
    }

    return { orderType, badgeClass, summaryText, orderDetails };
  };

  // Profile 3: New Buyer / Waiting for entry
  const renderProfileNewBuyer = () => {
    let title = "";
    let badgeClass = "";
    let summaryText = "";
    let actionableSteps = [];

    if (isBullish) {
      title = "Opportunité d'entrée progressive favorable";
      badgeClass = "positive";
      summaryText = `Conditions réunies pour un premier achat. Privilégiez des entrées échelonnées pour optimiser le prix de revient.`;
      actionableSteps = [
        `Initier une première tranche d'achat au cours actuel de ${formatMarketNumber(currentPrice, currency)}.`,
        `Garder une réserve pour renforcer sur léger repli technique vers ${formatMarketNumber(currentPrice * 0.98, currency)}.`,
        `Calibrer la taille de position pour que le risque monétaire maximal jusqu'au stop (${formatMarketNumber(stopLoss, currency)}) ne dépasse pas 0,5 à 1 % de votre capital total.`,
      ];
    } else if (isBearish) {
      title = "Rester à l'écart pour le moment";
      badgeClass = "negative";
      summaryText = `Ne pas acheter au cours actuel (${formatMarketNumber(currentPrice, currency)}). Pression vendeuse ou valorisation tendue à court terme.`;
      actionableSteps = [
        `Rester patient et ne pas courir après le titre sur les niveaux actuels.`,
        `Placer une alerte de prix sur le support clé à ${formatMarketNumber(targetPrice, currency)} (${targetPct.toFixed(1)}%) pour envisager une entrée une fois le repli stabilisé.`,
        `Attendre la confirmation d'un signal technique haussier (ex: bougie de retournement, MACD positif) avant toute prise de position.`,
      ];
    } else {
      title = "Observation et mise sous surveillance (Watchlist)";
      badgeClass = "neutral";
      summaryText = `Le couple rendement/risque n'est pas encore asymétrique. Ajoutez ${ticker} à votre Watchlist.`;
      actionableSteps = [
        `Ajouter ${ticker} à votre Watchlist pour recevoir les alertes de changement de signal.`,
        `Attendre qu'une direction claire se dégage du consensus des analystes.`,
        `Ne pas engager de capital sans catalyseur fondamental ou cassure technique confirmée.`,
      ];
    }

    return { title, badgeClass, summaryText, actionableSteps };
  };

  const p1 = renderProfileLongHolder();
  const p2 = renderProfileActiveTrader();
  const p3 = renderProfileNewBuyer();

  const fullPlanText = `=== PLAN D'ACTION TRADINGAGENTS : ${ticker} (${companyName || ticker}) ===
Date : ${job?.analysis_date || "Aujourd'hui"} | Décision : ${formatDecisionLabel(decision)} | Cours : ${formatMarketNumber(currentPrice, currency)}

1. SI VOUS AVEZ DÉJÀ L'ACTION EN PORTEFEUILLE (INVESTISSEUR LONG) :
- Posture : ${p1.title}
- Recommandation : ${p1.summaryText}
- Actions :
${p1.actionableSteps.map((s) => `  * ${s}`).join("\n")}

2. SI VOUS FAITES DU TRADING ACTIF / CFD / VENTE À DÉCOUVERT :
- Stratégie : ${p2.orderType}
- Détails de l'ordre :
  * Type : ${p2.orderDetails.type}
  * Entrée : ${p2.orderDetails.entry}
  * Stop-Loss : ${p2.orderDetails.stopLoss}
  * Take-Profit : ${p2.orderDetails.takeProfit}
  * Ratio R:R : ${p2.orderDetails.riskReward}

3. SI VOUS N'AVEZ PAS DE POSITION ET CHERCHEZ À ACHETER :
- Posture : ${p3.title}
- Recommandation : ${p3.summaryText}
- Actions :
${p3.actionableSteps.map((s) => `  * ${s}`).join("\n")}
`;

  return (
    <div className="action-plan-container">
      {/* Header Banner */}
      <section className="action-plan-hero-card">
        <div className="action-plan-hero-left">
          <div className="action-plan-tag">
            <Sparkles size={14} /> Plan d'Action Stratégique & Opérationnel
          </div>
          <h2>
            Que faire avec <strong>{ticker}</strong> {companyName ? `(${companyName})` : ""} ?
          </h2>
          <p className="action-plan-hero-sub">
            Guide d'exécution concret et impartial certifié par les 6 étapes multi-agents. Adaptez votre décision selon votre profil d'investissement :
          </p>
        </div>
        <div className="action-plan-hero-right">
          <div className={`action-decision-pill ${tone}`}>
            <span>Recommandation</span>
            <strong>{formatDecisionLabel(decision)}</strong>
          </div>
          <button
            type="button"
            className="secondary-button compact"
            onClick={() => copyToClipboard(fullPlanText, "full_plan")}
            title="Copier l'ensemble des 3 plans d'action"
          >
            {copiedKey === "full_plan" ? <Check size={14} style={{ color: "#34d399" }} /> : <Copy size={14} />}
            {copiedKey === "full_plan" ? "Plan complet copié !" : "Copier le plan"}
          </button>
        </div>
      </section>

      {/* Profiles Filter Selector */}
      <div className="action-plan-filter-tabs">
        <button
          type="button"
          className={`action-plan-filter-btn ${activeProfileTab === "all" ? "active" : ""}`}
          onClick={() => setActiveProfileTab("all")}
        >
          <Layers size={14} /> Tous les profils (3)
        </button>
        <button
          type="button"
          className={`action-plan-filter-btn ${activeProfileTab === "long" ? "active" : ""}`}
          onClick={() => setActiveProfileTab("long")}
        >
          <Briefcase size={14} /> 1. Déjà actionnaire (Long)
        </button>
        <button
          type="button"
          className={`action-plan-filter-btn ${activeProfileTab === "trader" ? "active" : ""}`}
          onClick={() => setActiveProfileTab("trader")}
        >
          <Scale size={14} /> 2. Trader actif & CFD
        </button>
        <button
          type="button"
          className={`action-plan-filter-btn ${activeProfileTab === "new" ? "active" : ""}`}
          onClick={() => setActiveProfileTab("new")}
        >
          <TrendingUp size={14} /> 3. Nouvel acheteur (Sans position)
        </button>
      </div>

      {/* Profile Cards Grid */}
      <div className="action-plan-cards-grid">
        {/* CARD 1: EXISTING LONG HOLDER */}
        {activeProfileTab === "all" || activeProfileTab === "long" ? (
          <motion.div
            className={`action-profile-card ${p1.badgeClass}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="action-profile-card-header">
              <div className="action-profile-badge">
                <Briefcase size={16} /> Profil 1 : Investisseur Long (Déjà en portefeuille)
              </div>
              <span className={`action-status-chip ${p1.badgeClass}`}>
                {p1.title}
              </span>
            </div>

            <p className="action-profile-summary">{p1.summaryText}</p>

            <div className="action-steps-list">
              <h4><CheckCircle2 size={15} /> Démarche opérationnelle recommandée :</h4>
              <ul>
                {p1.actionableSteps.map((step, idx) => (
                  <li key={idx}>
                    <ChevronRight size={14} className="action-step-arrow" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : null}

        {/* CARD 2: ACTIVE TRADER / CFD / SHORT */}
        {activeProfileTab === "all" || activeProfileTab === "trader" ? (
          <motion.div
            className={`action-profile-card ${p2.badgeClass}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className="action-profile-card-header">
              <div className="action-profile-badge">
                <Scale size={16} /> Profil 2 : Trader Actif / CFD / Vente à découvert
              </div>
              <span className={`action-status-chip ${p2.badgeClass}`}>
                {p2.orderType}
              </span>
            </div>

            <p className="action-profile-summary">{p2.summaryText}</p>

            <div className="action-order-box">
              <h4><Layers size={15} /> Paramètres de l'ordre d'exécution :</h4>
              <div className="action-order-table">
                <div className="action-order-row">
                  <span className="order-label">Type d'opération</span>
                  <strong className={`order-val ${p2.badgeClass}`}>{p2.orderDetails.type}</strong>
                </div>
                <div className="action-order-row">
                  <span className="order-label">Prix d'Entrée</span>
                  <strong className="order-val">{p2.orderDetails.entry}</strong>
                </div>
                <div className="action-order-row">
                  <span className="order-label">Stop-Loss (Protection)</span>
                  <strong className="order-val danger">{p2.orderDetails.stopLoss}</strong>
                </div>
                <div className="action-order-row">
                  <span className="order-label">Take-Profit (Objectif)</span>
                  <strong className="order-val success">{p2.orderDetails.takeProfit}</strong>
                </div>
                <div className="action-order-row">
                  <span className="order-label">Ratio Risque / Rendement</span>
                  <strong className="order-val accent">{p2.orderDetails.riskReward}</strong>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}

        {/* CARD 3: NEW BUYER / WITHOUT POSITION */}
        {activeProfileTab === "all" || activeProfileTab === "new" ? (
          <motion.div
            className={`action-profile-card ${p3.badgeClass}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
          >
            <div className="action-profile-card-header">
              <div className="action-profile-badge">
                <TrendingUp size={16} /> Profil 3 : Nouvel Acheteur (Sans position actuelle)
              </div>
              <span className={`action-status-chip ${p3.badgeClass}`}>
                {p3.title}
              </span>
            </div>

            <p className="action-profile-summary">{p3.summaryText}</p>

            <div className="action-steps-list">
              <h4><CheckCircle2 size={15} /> Consignes d'entrée sur le marché :</h4>
              <ul>
                {p3.actionableSteps.map((step, idx) => (
                  <li key={idx}>
                    <ChevronRight size={14} className="action-step-arrow" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
