import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  Scale,
  Clock,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Calculator,
  Wallet,
  Percent,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import { isNegativeDecision, isPositiveDecision } from "./decisionUtils.js";

const CAPITAL_PRESETS = [5000, 10000, 25000, 50000];
const RISK_PRESETS = [0.5, 1.0, 1.5, 2.0];

export default function ExecutionLevelsCard({
  ticker = "TITRE",
  levels,
  decision = "ACCUMULER",
  currency = "$",
  onShowToast,
}) {
  const [copiedFormat, setCopiedFormat] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Mini-calculator interactive state with localStorage persistence
  const [capital, setCapital] = useState(() => {
    const saved = localStorage.getItem("tradingagents_portfolio_capital");
    return saved ? Number(saved) : 10000;
  });

  const [riskPercent, setRiskPercent] = useState(() => {
    const saved = localStorage.getItem("tradingagents_risk_percent");
    return saved ? Number(saved) : 1.0;
  });

  const [isCalculatorOpen, setIsCalculatorOpen] = useState(() => {
    const saved = localStorage.getItem("tradingagents_calc_open");
    return saved !== null ? saved === "true" : true;
  });

  const updateCapital = (val) => {
    const num = Math.max(100, Number(val) || 0);
    setCapital(num);
    localStorage.setItem("tradingagents_portfolio_capital", String(num));
  };

  const updateRisk = (val) => {
    const num = Math.max(0.1, Math.min(10, Number(val) || 1.0));
    setRiskPercent(num);
    localStorage.setItem("tradingagents_risk_percent", String(num));
  };

  const toggleCalculator = () => {
    setIsCalculatorOpen((prev) => {
      const next = !prev;
      localStorage.setItem("tradingagents_calc_open", String(next));
      return next;
    });
  };

  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  if (!levels || !levels.entry_price) return null;

  const {
    entry_price,
    target_price,
    stop_loss,
    target_change_percent,
    stop_change_percent,
    risk_reward_ratio,
    risk_reward_label,
    horizon,
    entry_zone,
    timing_action,
    timing_rationale,
  } = levels;

  const isTargetPositive = target_change_percent >= 0;
  const isBearish = isNegativeDecision(decision);
  const actionLabel = isBearish ? "Vente / Allègement" : "Achat";
  const ibkrAction = isBearish ? "SELL" : "BUY";
  const stopLabel = isBearish ? "Stop Couverture (SL)" : "Stop-Loss (SL)";

  const idealEntry = entry_zone && timing_action?.includes("repli") ? entry_zone.max : entry_price;
  const numEntry = Number(idealEntry).toFixed(2);
  const numTarget = Number(target_price).toFixed(2);
  const numStop = Number(stop_loss).toFixed(2);

  // Position sizing calculations
  const pricePerShare = Number(idealEntry) || 1;
  const stopPerShare = Number(stop_loss) || (pricePerShare * 0.95);
  const targetPerShare = Number(target_price) || (pricePerShare * 1.1);

  const riskPerShare = Math.max(0.01, Math.abs(pricePerShare - stopPerShare));
  const rewardPerShare = Math.max(0.01, Math.abs(targetPerShare - pricePerShare));

  const targetRiskAmount = (capital * riskPercent) / 100;
  const idealShares = Math.max(1, Math.floor(targetRiskAmount / riskPerShare));
  const maxAffordableShares = Math.max(1, Math.floor(capital / pricePerShare));
  const calculatedShares = Math.min(idealShares, maxAffordableShares);

  const investedAmount = calculatedShares * pricePerShare;
  const portfolioWeightPercent = capital > 0 ? (investedAmount / capital) * 100 : 0;
  const actualMaxLoss = calculatedShares * riskPerShare;
  const actualExpectedGain = calculatedShares * rewardPerShare;
  const gainPercentOnLine = pricePerShare > 0 ? (rewardPerShare / pricePerShare) * 100 : 0;

  // Formats
  const entryText = entry_zone && timing_action?.includes("repli")
    ? `${actionLabel} Limite (Repli visé) : ${calculatedShares} act. @ ${Number(entry_zone.min).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} - ${Number(entry_zone.max).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} ${currency}`
    : `${actionLabel} Limite : ${calculatedShares} act. @ ${Number(entry_price).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} ${currency}`;

  const standardText = `${ticker} · ${entryText} (Engagé : ${investedAmount.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} ${currency}) | Objectif (TP) : ${Number(target_price).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} ${currency} (+${actualExpectedGain.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} ${currency}) | ${stopLabel} : ${Number(stop_loss).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} ${currency} (-${actualMaxLoss.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} ${currency}) | R:R : ${risk_reward_ratio || 2} : 1`;

  const ibkrText = `${ibkrAction} ${calculatedShares} ${ticker} LMT ${numEntry} GTC | TP LMT ${numTarget} | SL STP ${numStop}`;

  const jsonText = JSON.stringify({
    symbol: ticker,
    action: ibkrAction,
    quantity: calculatedShares,
    orderType: "LMT",
    limitPrice: Number(numEntry),
    takeProfit: Number(numTarget),
    stopLoss: Number(numStop),
    tif: "GTC",
  }, null, 2);

  const copyToClipboard = (text, formatName, toastMsg) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedFormat(formatName);
      setMenuOpen(false);
      if (onShowToast) onShowToast(toastMsg || `Ticket d'ordre ${ticker} copié !`);
      setTimeout(() => setCopiedFormat(null), 2500);
    });
  };

  const isAllègement = timing_action?.includes("Allègement") || String(decision).toUpperCase().includes("SOUS-PONDÉRER") || String(decision).toUpperCase().includes("UNDERWEIGHT");
  const isSortie = timing_action?.includes("Sortie") || timing_action?.includes("Pas d'achat") || String(decision).toUpperCase().includes("VENDRE") || String(decision).toUpperCase().includes("SELL");
  const isHoldAction = timing_action?.includes("Attente") || timing_action?.includes("Surveillance");

  let bannerClass = "immediate";
  let badgeLabel = "⚡ Entrée immédiate";

  if (isSortie) {
    bannerClass = "bearish";
    badgeLabel = "🛑 Sortie / Pas d'achat";
  } else if (isAllègement) {
    bannerClass = "defensive";
    badgeLabel = "🛡️ Allègement conseillé";
  } else if (isHoldAction) {
    bannerClass = "hold";
    badgeLabel = "⏳ Attente / Surveillance";
  } else if (timing_action?.includes("repli")) {
    bannerClass = "pullback";
    badgeLabel = "⏳ Attendre un repli";
  } else if (timing_action?.includes("cassure")) {
    bannerClass = "breakout";
    badgeLabel = "🚀 Achat sur cassure";
  }

  return (
    <motion.section
      className="execution-levels-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <div className="execution-card-header">
        <div className="execution-title-group">
          <div className="execution-icon-badge">
            <Target size={18} />
          </div>
          <div>
            <h3>Cadrage d'Exécution & Niveaux Clés</h3>
            <p>Objectifs de cours, niveau d'invalidation et timing stratégique certifiés</p>
          </div>
        </div>

        <div className="execution-header-actions" ref={dropdownRef}>
          <div className="execution-horizon-badge">
            <Clock size={13} />
            <span>{horizon || "Moyen terme"}</span>
          </div>

          <div className="execution-copy-btn-group">
            <button
              type="button"
              className={`order-ticket-copy-btn ${copiedFormat === "standard" ? "copied" : ""}`}
              onClick={() => copyToClipboard(standardText, "standard", `Ticket d'ordre ${ticker} (${calculatedShares} act.) copié !`)}
              title="Copier le ticket d'ordre pour votre courtier (Trade Republic, Bourse Direct, Fortuneo, BoursoBank...)"
            >
              {copiedFormat === "standard" ? <Check size={14} /> : <Copy size={14} />}
              <span>{copiedFormat === "standard" ? "Ticket copié !" : (isBearish ? `Copier l'ordre (${calculatedShares} act.)` : `Copier le ticket (${calculatedShares} act.)`)}</span>
            </button>

            <div className="order-ticket-dropdown-wrap">
              <button
                type="button"
                className="order-ticket-dropdown-trigger"
                onClick={() => setMenuOpen(!menuOpen)}
                title="Autres formats (IBKR, JSON)"
                aria-label="Plus de formats d'ordre"
              >
                <ChevronDown size={13} />
              </button>

              {menuOpen ? (
                <div className="order-ticket-dropdown-menu">
                  <button
                    type="button"
                    className="order-ticket-menu-item"
                    onClick={() => copyToClipboard(standardText, "standard", `Format Standard (${calculatedShares} act.) copié pour ${ticker} !`)}
                  >
                    <strong>📋 Format Universel Courtier</strong>
                    <small>Trade Republic, BoursoBank, Fortuneo, Degiro ({calculatedShares} actions)</small>
                  </button>
                  <button
                    type="button"
                    className="order-ticket-menu-item"
                    onClick={() => copyToClipboard(ibkrText, "ibkr", `Format IBKR Bracket (${calculatedShares} act.) copié pour ${ticker} !`)}
                  >
                    <strong>🏛️ Format IBKR (Bracket TWS)</strong>
                    <small>{ibkrText}</small>
                  </button>
                  <button
                    type="button"
                    className="order-ticket-menu-item"
                    onClick={() => copyToClipboard(jsonText, "json", `Format JSON (${calculatedShares} act.) copié pour ${ticker} !`)}
                  >
                    <strong>⚙️ Format JSON (API / Skill)</strong>
                    <small>quantity: {calculatedShares}, limitPrice: {numEntry}</small>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Bannière Timing Réel d'Entrée */}
      {timing_action && timing_action !== "Non spécifié" ? (
        <div className={`execution-timing-banner ${bannerClass}`}>
          <div className="timing-banner-left">
            <span className="timing-badge">{badgeLabel}</span>
            <div className="timing-text-group">
              <strong className="timing-zone-title">
                {entry_zone ? (
                  <>
                    Zone d'entrée recommandée : <span>{Number(entry_zone.min).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {currency} – {Number(entry_zone.max).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {currency}</span>
                  </>
                ) : (
                  <span>{timing_action}</span>
                )}
              </strong>
              {timing_rationale ? (
                <p className="timing-rationale-text">{timing_rationale}</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="execution-metrics-grid">
        {/* 1. Prix d'entrée / référence */}
        <div className="execution-metric-box entry-box">
          <div className="metric-box-title">
            <span className="metric-label">{isBearish ? "Cours de référence (Actuel)" : "Prix de référence (Entrée)"}</span>
            {entry_zone && !isBearish ? (
              <span className={`metric-delta-tag ${timing_action?.includes("repli") ? "warning" : "positive"}`}>
                Zone : {Number(entry_zone.min).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 1 })} - {Number(entry_zone.max).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 1 })} {currency}
              </span>
            ) : null}
          </div>
          <strong className="metric-value">
            {Number(entry_price).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
          </strong>
          <span className="metric-subtext">Dernier cours certifié</span>
        </div>

        {/* 2. Objectif de cours (Target) */}
        <div className={`execution-metric-box target-box ${isTargetPositive ? "positive" : "negative"}`}>
          <div className="metric-box-title">
            <span className="metric-label">Objectif de cours (Target)</span>
            <span className={`metric-delta-tag ${isTargetPositive ? "positive" : "negative"}`}>
              {isTargetPositive ? "+" : ""}{target_change_percent}%
            </span>
          </div>
          <strong className="metric-value">
            {Number(target_price).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
          </strong>
          <span className="metric-subtext">
            {isTargetPositive ? "Potentiel haussier estimé" : "Cible de repli / support"}
          </span>
        </div>

        {/* 3. Seuil d'invalidation (Stop-Loss / Couverture) */}
        <div className="execution-metric-box stop-box">
          <div className="metric-box-title">
            <span className="metric-label">{isBearish ? "Seuil d'invalidation (Couverture)" : "Seuil d'invalidation (Stop)"}</span>
            <span className={`metric-delta-tag warning`}>
              {stop_change_percent > 0 ? "+" : ""}{stop_change_percent}%
            </span>
          </div>
          <strong className="metric-value">
            {Number(stop_loss).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
          </strong>
          <span className="metric-subtext">
            {isBearish ? "Niveau de rachat en cas de hausse" : "Niveau de coupure / alerte"}
          </span>
        </div>

        {/* 4. Ratio Risque / Rendement */}
        <div className="execution-metric-box rr-box">
          <div className="metric-box-title">
            <span className="metric-label">Ratio Risque / Rendement</span>
            <Scale size={14} className="metric-rr-icon" />
          </div>
          <strong className="metric-value rr-value">
            {risk_reward_ratio ? `${risk_reward_ratio} : 1` : "—"}
          </strong>
          <span className={`metric-subtext rr-tag ${risk_reward_ratio >= 2 ? "favorable" : "neutral"}`}>
            {risk_reward_label || "Calculé"}
          </span>
        </div>
      </div>

      {/* Mini-Calculateur de Position & Risque */}
      <div className="execution-calculator-section">
        <div className="execution-calculator-header" onClick={toggleCalculator}>
          <div className="execution-calculator-title">
            <Calculator size={16} style={{ color: "var(--mint)" }} />
            <span>Simulateur de Position & Gestion du Risque</span>
          </div>
          <button
            type="button"
            className="execution-calculator-toggle-btn"
            aria-label={isCalculatorOpen ? "Masquer le calculateur" : "Afficher le calculateur"}
          >
            {isCalculatorOpen ? (
              <>
                <span>Masquer</span>
                <ChevronUp size={14} />
              </>
            ) : (
              <>
                <span>Ajuster ma position ({calculatedShares} act.)</span>
                <ChevronDown size={14} />
              </>
            )}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isCalculatorOpen ? (
            <motion.div
              className="execution-calculator-body"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="execution-calc-controls">
                {/* 1. Capital Portefeuille */}
                <div className="calc-control-group">
                  <div className="calc-control-label">
                    <span>
                      <Wallet size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                      Capital de portefeuille
                    </span>
                    <span style={{ color: "var(--mint)", fontWeight: "700" }}>
                      {capital.toLocaleString("fr-FR")} {currency}
                    </span>
                  </div>
                  <div className="calc-input-row">
                    <div className="calc-input-wrapper">
                      <input
                        type="number"
                        min="100"
                        step="500"
                        value={capital}
                        onChange={(e) => updateCapital(e.target.value)}
                        className="calc-number-input"
                        placeholder="10000"
                      />
                      <span className="calc-currency-suffix">{currency}</span>
                    </div>
                  </div>
                  <div className="calc-presets-row">
                    {CAPITAL_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className={`calc-preset-chip ${capital === preset ? "active" : ""}`}
                        onClick={() => updateCapital(preset)}
                      >
                        {preset >= 1000 ? `${preset / 1000} k ${currency}` : `${preset} ${currency}`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Risque par Trade */}
                <div className="calc-control-group">
                  <div className="calc-control-label">
                    <span>
                      <Percent size={12} style={{ marginRight: "4px", verticalAlign: "middle" }} />
                      Risque toléré par trade
                    </span>
                    <span style={{ color: "var(--amber)", fontWeight: "700" }}>
                      {riskPercent} % ({targetRiskAmount.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} {currency})
                    </span>
                  </div>
                  <div className="calc-input-row">
                    <div className="calc-input-wrapper">
                      <input
                        type="number"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={riskPercent}
                        onChange={(e) => updateRisk(e.target.value)}
                        className="calc-number-input"
                        placeholder="1.0"
                      />
                      <span className="calc-currency-suffix">%</span>
                    </div>
                  </div>
                  <div className="calc-presets-row">
                    {RISK_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className={`calc-preset-chip ${riskPercent === preset ? "active" : ""}`}
                        onClick={() => updateRisk(preset)}
                      >
                        {preset} %
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3 Boîtes de Résultats Calculés */}
              <div className="execution-calc-results">
                {/* Résultat 1 : Quantité & Engagement */}
                <div className="calc-result-card position">
                  <div className="calc-result-label">
                    <span>Taille recommandée</span>
                    <span className="history-model-tag" style={{ fontSize: "10px", padding: "1px 6px" }}>
                      {portfolioWeightPercent.toFixed(1)} % du port.
                    </span>
                  </div>
                  <strong className="calc-result-value">
                    {calculatedShares} {calculatedShares > 1 ? "actions" : "action"}
                  </strong>
                  <span className="calc-result-sub">
                    Engagé : {investedAmount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
                  </span>
                </div>

                {/* Résultat 2 : Perte Max au Stop */}
                <div className="calc-result-card risk">
                  <div className="calc-result-label">
                    <span>
                      <ShieldAlert size={12} style={{ color: "var(--amber)", marginRight: "4px" }} />
                      Perte max (Stop-Loss)
                    </span>
                    <span style={{ color: "var(--amber)", fontWeight: "600", fontSize: "11px" }}>
                      -{riskPercent} %
                    </span>
                  </div>
                  <strong className="calc-result-value danger">
                    -{actualMaxLoss.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
                  </strong>
                  <span className="calc-result-sub">
                    Si invalidation à {Number(stop_loss).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {currency}
                  </span>
                </div>

                {/* Résultat 3 : Gain Visé au TP */}
                <div className="calc-result-card reward">
                  <div className="calc-result-label">
                    <span>
                      <TrendingUp size={12} style={{ color: "#34d399", marginRight: "4px" }} />
                      Gain espéré (Objectif)
                    </span>
                    <span style={{ color: "#34d399", fontWeight: "600", fontSize: "11px" }}>
                      +{gainPercentOnLine.toFixed(1)} %
                    </span>
                  </div>
                  <strong className="calc-result-value success">
                    +{actualExpectedGain.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
                  </strong>
                  <span className="calc-result-sub">
                    Si cible atteinte à {Number(target_price).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} {currency}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
