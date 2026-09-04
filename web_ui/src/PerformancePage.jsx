import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  TrendingUp,
  ShieldCheck,
  Search,
  X,
  RefreshCw,
  ChevronRight,
  Filter,
  BarChart3,
  Sparkles,
  Calculator,
  CheckSquare,
  Square,
  Layers,
} from "lucide-react";
import { getCompanyName, getCurrencySymbol } from "./companyNames";
import DecisionBadge from "./DecisionBadge";
import { isPositiveDecision, isNegativeDecision, isNeutralDecision, formatDateFr } from "./decisionUtils.js";

const CAPITAL_PRESETS = [5000, 10000, 25000, 50000, 100000];

export default function PerformancePage({ onSelectAnalysis }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("ticker") || params.get("search") || "";
  });
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date"); // "date", "alpha", "return"
  const currency = "$";

  // Mode: "simulator" (par défaut pour répondre immédiatement au besoin utilisateur) ou "overview"
  const [activeView, setActiveView] = useState("simulator");

  // Simulation State
  const [capital, setCapital] = useState(() => {
    try {
      const saved = localStorage.getItem("tradingagents_sim_capital");
      return saved ? Number(saved) : 10000;
    } catch {
      return 10000;
    }
  });

  const [selectedIds, setSelectedIds] = useState(() => {
    try {
      const saved = localStorage.getItem("tradingagents_sim_selected_ids");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const fetchPerformance = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/performance");
      if (!res.ok) throw new Error(`Erreur ${res.status} lors de la récupération des performances`);
      const json = await res.json();
      setData(json);

      // Si aucune sélection n'était enregistrée, présélectionner par défaut les signaux haussiers
      setSelectedIds((prev) => {
        if (prev.size > 0) return prev;
        const bullishIds = new Set();
        (json.items || []).forEach((item) => {
          if (isPositiveDecision(item.decision)) {
            bullishIds.add(item.id);
          }
        });
        return bullishIds.size > 0 ? bullishIds : new Set((json.items || []).map((i) => i.id));
      });
    } catch (err) {
      setError(err.message || "Impossible de charger le track record");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  // Save selected IDs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("tradingagents_sim_selected_ids", JSON.stringify(Array.from(selectedIds)));
    } catch {}
  }, [selectedIds]);

  // Save capital to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("tradingagents_sim_capital", String(capital));
    } catch {}
  }, [capital]);

  const rawItems = data?.items || [];

  // Toggle individual trade selection
  const handleToggleTrade = useCallback((id, e) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Quick Select Helpers
  const handleSelectBullish = useCallback(() => {
    const next = new Set();
    rawItems.forEach((item) => {
      if (isPositiveDecision(item.decision)) {
        next.add(item.id);
      }
    });
    setSelectedIds(next);
  }, [rawItems]);

  const handleSelectAll = useCallback(() => {
    setSelectedIds(new Set(rawItems.map((i) => i.id)));
  }, [rawItems]);

  const handleDeselectAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Portfolio Simulation Calculations on Checked Trades
  const simulationResults = useMemo(() => {
    const selectedList = rawItems.filter((item) => selectedIds.has(item.id));
    const count = selectedList.length;

    if (count === 0) {
      return {
        count: 0,
        allocationPerTrade: 0,
        totalReturnPct: 0,
        totalPnl: 0,
        finalCapital: capital,
        avgSp500Pct: 0,
        totalAlphaPct: 0,
        winningTrades: 0,
        winRate: 0,
        bestTrade: null,
        worstTrade: null,
      };
    }

    const allocation = capital / count;
    const getEffectiveReturn = (it) => {
      const isBear = it.status === "protected" || isNegativeDecision(it.decision);
      return isBear ? -(it.return_percent || 0) : (it.return_percent || 0);
    };

    const totalReturnPct = selectedList.reduce((acc, it) => acc + getEffectiveReturn(it), 0) / count;
    const avgSp500Pct = selectedList.reduce((acc, it) => acc + (it.sp500_return_percent || 0), 0) / count;
    const totalPnl = capital * (totalReturnPct / 100);
    const finalCapital = capital + totalPnl;
    const totalAlphaPct = totalReturnPct - avgSp500Pct;

    const winningTrades = selectedList.filter((it) => it.status === "win" || it.status === "protected").length;
    const winRate = (winningTrades / count) * 100;

    const sortedByPerf = [...selectedList].sort((a, b) => getEffectiveReturn(b) - getEffectiveReturn(a));
    const bestTrade = sortedByPerf[0] || null;
    const worstTrade = sortedByPerf[sortedByPerf.length - 1] || null;

    return {
      count,
      allocationPerTrade: allocation,
      totalReturnPct: Math.round(totalReturnPct * 100) / 100,
      totalPnl: Math.round(totalPnl * 100) / 100,
      finalCapital: Math.round(finalCapital * 100) / 100,
      avgSp500Pct: Math.round(avgSp500Pct * 100) / 100,
      totalAlphaPct: Math.round(totalAlphaPct * 100) / 100,
      winningTrades,
      winRate: Math.round(winRate * 10) / 10,
      bestTrade,
      worstTrade,
    };
  }, [rawItems, selectedIds, capital]);

  // General Track Record Summary
  const globalSummary = data?.summary || {
    total_trades: 0,
    evaluated_signals: 0,
    winning_signals: 0,
    win_rate: 0,
    avg_return_bullish: 0,
    avg_alpha: 0,
    drawdown_avoided: 0,
    best_trade: null,
    benchmark: "S&P 500 (^GSPC)",
  };

  // Filter and Sort Table Items
  const filteredItems = useMemo(() => {
    return rawItems
      .filter((item) => {
        const query = searchTerm.trim().toUpperCase();
        const matchesSearch =
          !query ||
          item.ticker.toUpperCase().includes(query) ||
          (getCompanyName(item.ticker) && getCompanyName(item.ticker).toUpperCase().includes(query)) ||
          item.entry_date.includes(query) ||
          (item.decision && item.decision.toUpperCase().includes(query));

        if (!matchesSearch) return false;

        if (filterStatus === "all") return true;
        if (filterStatus === "selected") return selectedIds.has(item.id);
        if (filterStatus === "win") return item.status === "win";
        if (filterStatus === "protected") return item.status === "protected";
        if (filterStatus === "loss") return item.status === "loss" || item.status === "miss";
        if (filterStatus === "neutral") return item.status === "neutral";
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "alpha") return (b.alpha_percent || 0) - (a.alpha_percent || 0);
        if (sortBy === "return") return (b.return_percent || 0) - (a.return_percent || 0);
        return new Date(b.entry_date) - new Date(a.entry_date);
      });
  }, [rawItems, searchTerm, filterStatus, sortBy, selectedIds]);

  return (
    <main className="page performance-page">
      {/* 1. Heading & Mode Switcher */}
      <div className="page-heading performance-heading">
        <div>
          <div className="heading-tag">
            <Award size={14} />
            <span>Audit de Précision & Simulateur Portefeuille</span>
          </div>
          <h1>Simulateur & Performance Réelle</h1>
          <p>
            Cochez les signaux que vous avez appliqués (ou auriez pu suivre) pour calculer votre gain net simulé en % et en {currency}.
          </p>
        </div>
        <div className="heading-actions">
          <div className="performance-view-tabs">
            <button
              type="button"
              className={`view-tab-btn ${activeView === "simulator" ? "active" : ""}`}
              onClick={() => setActiveView("simulator")}
            >
              <Calculator size={15} />
              <span>Simulateur ("Si j'avais suivi...")</span>
            </button>
            <button
              type="button"
              className={`view-tab-btn ${activeView === "overview" ? "active" : ""}`}
              onClick={() => setActiveView("overview")}
            >
              <BarChart3 size={15} />
              <span>Track Record Global</span>
            </button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="secondary-button"
            onClick={fetchPerformance}
            disabled={loading}
            title="Rafraîchir les cours en direct et recalculer"
          >
            <RefreshCw size={16} className={loading ? "spin" : ""} />
            <span>Recalculer</span>
          </motion.button>
        </div>
      </div>

      {error ? <div className="connection-error">{error}</div> : null}

      {/* 2. SIMULATEUR HERO PANEL ("Si j'avais suivi l'application...") */}
      <AnimatePresence mode="wait">
        {activeView === "simulator" ? (
          <motion.section
            key="simulator-panel"
            className="portfolio-simulator-panel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
          >
            <div className="simulator-panel-header">
              <div className="simulator-title-group">
                <div className="simulator-icon-badge">
                  <Calculator size={20} />
                </div>
                <div>
                  <h2>Simulateur de Portefeuille Personnalisé</h2>
                  <p>
                    Résultats calculés en direct sur les <strong>{simulationResults.count} positions cochées</strong> ci-dessous.
                  </p>
                </div>
              </div>

              {/* Capital Input & Presets */}
              <div className="simulator-capital-controller">
                <div className="capital-input-wrap">
                  <span className="capital-currency-label">$</span>
                  <input
                    type="number"
                    min="100"
                    step="500"
                    value={capital}
                    onChange={(e) => setCapital(Math.max(100, Number(e.target.value) || 0))}
                    className="simulator-capital-input"
                    title="Capital de départ investi"
                  />
                </div>

                <div className="capital-presets-strip">
                  {CAPITAL_PRESETS.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      className={`capital-preset-pill ${capital === amount ? "active" : ""}`}
                      onClick={() => setCapital(amount)}
                    >
                      {amount.toLocaleString("fr-FR")} {currency}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Simulated Live KPIs Strip */}
            <div className="simulator-kpi-grid">
              {/* Rendement % Total */}
              <div className="sim-kpi-box main-return-box">
                <span className="sim-kpi-label">Rendement Global Simulé</span>
                <strong className={`sim-kpi-value ${simulationResults.totalReturnPct >= 0 ? "positive" : "negative"}`}>
                  {simulationResults.totalReturnPct >= 0 ? "+" : ""}{simulationResults.totalReturnPct}%
                </strong>
                <span className="sim-kpi-subtext">
                  Sur l'ensemble du panier sélectionné
                </span>
              </div>

              {/* Gain / PNL en Euros */}
              <div className="sim-kpi-box pnl-box">
                <span className="sim-kpi-label">Gain Net Estimé (P&L)</span>
                <strong className={`sim-kpi-value ${simulationResults.totalPnl >= 0 ? "positive" : "negative"}`}>
                  {simulationResults.totalPnl >= 0 ? "+" : ""}{simulationResults.totalPnl.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}
                </strong>
                <span className="sim-kpi-subtext">
                  Valeur finale : <strong>{simulationResults.finalCapital.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {currency}</strong>
                </span>
              </div>

              {/* Alpha vs S&P 500 */}
              <div className="sim-kpi-box alpha-box">
                <span className="sim-kpi-label">Surperformance (Alpha)</span>
                <strong className={`sim-kpi-value ${simulationResults.totalAlphaPct >= 0 ? "positive" : "negative"}`}>
                  {simulationResults.totalAlphaPct >= 0 ? "+" : ""}{simulationResults.totalAlphaPct}%
                </strong>
                <span className="sim-kpi-subtext">
                  vs S&P 500 ({simulationResults.avgSp500Pct >= 0 ? "+" : ""}{simulationResults.avgSp500Pct}%)
                </span>
              </div>

              {/* Taux de Réussite sur la sélection */}
              <div className="sim-kpi-box winrate-box">
                <span className="sim-kpi-label">Taux de Succès</span>
                <strong className="sim-kpi-value win">
                  {simulationResults.winRate}%
                </strong>
                <span className="sim-kpi-subtext">
                  {simulationResults.winningTrades} / {simulationResults.count} positions gagnantes
                </span>
              </div>
            </div>

            {/* Selection Quick Actions Bar */}
            <div className="simulator-quick-actions-bar">
              <div className="quick-actions-left">
                <span className="selection-counter-badge">
                  <Layers size={14} />
                  <span>
                    <strong>{simulationResults.count}</strong> / {rawItems.length} signaux cochés
                    {simulationResults.count > 0 ? ` · ${simulationResults.allocationPerTrade.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} ${currency} / position` : ""}
                  </span>
                </span>
              </div>

              <div className="quick-actions-buttons">
                <button
                  type="button"
                  className="quick-action-btn primary-preset"
                  onClick={handleSelectBullish}
                  title="Cocher tous les signaux Achat Fort et Accumuler"
                >
                  <Sparkles size={14} />
                  <span>✨ Cocher tous les Achats</span>
                </button>
                <button
                  type="button"
                  className="quick-action-btn"
                  onClick={handleSelectAll}
                >
                  <CheckSquare size={14} />
                  <span>Tout cocher</span>
                </button>
                <button
                  type="button"
                  className="quick-action-btn"
                  onClick={handleDeselectAll}
                >
                  <Square size={14} />
                  <span>Tout décocher</span>
                </button>
              </div>
            </div>
          </motion.section>
        ) : (
          /* 3. VUE GLOBALE TRACK RECORD (Tous les signaux) */
          <motion.section
            key="overview-panel"
            className="performance-kpi-grid"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {/* KPI 1 : Taux de succès */}
            <div className="perf-kpi-card win-rate-card">
              <div className="perf-kpi-header">
                <span className="perf-kpi-title">Taux de Succès Global</span>
                <div className="perf-icon-wrap win-rate"><Award size={20} /></div>
              </div>
              <div className="perf-kpi-main">
                <strong className="perf-kpi-value">{globalSummary.win_rate}%</strong>
                <span className="perf-kpi-subtext">
                  {globalSummary.winning_signals} signaux gagnants sur {globalSummary.evaluated_signals} évalués
                </span>
              </div>
              <div className="perf-progress-bar">
                <div className="perf-progress-fill" style={{ width: `${Math.min(100, Math.max(0, globalSummary.win_rate))}%` }} />
              </div>
            </div>

            {/* KPI 2 : Alpha vs S&P 500 */}
            <div className="perf-kpi-card alpha-card">
              <div className="perf-kpi-header">
                <span className="perf-kpi-title">Alpha vs S&P 500</span>
                <div className="perf-icon-wrap alpha"><Sparkles size={20} /></div>
              </div>
              <div className="perf-kpi-main">
                <strong className={`perf-kpi-value ${globalSummary.avg_alpha >= 0 ? "positive" : "negative"}`}>
                  {globalSummary.avg_alpha >= 0 ? "+" : ""}{globalSummary.avg_alpha}%
                </strong>
                <span className="perf-kpi-subtext">Surperformance nette moyenne</span>
              </div>
              <div className="perf-kpi-footer"><span>Benchmark : {globalSummary.benchmark}</span></div>
            </div>

            {/* KPI 3 : Rendement Signaux Achat */}
            <div className="perf-kpi-card return-card">
              <div className="perf-kpi-header">
                <span className="perf-kpi-title">Gain Moyen sur Achats</span>
                <div className="perf-icon-wrap return"><TrendingUp size={20} /></div>
              </div>
              <div className="perf-kpi-main">
                <strong className={`perf-kpi-value ${globalSummary.avg_return_bullish >= 0 ? "positive" : "negative"}`}>
                  {globalSummary.avg_return_bullish >= 0 ? "+" : ""}{globalSummary.avg_return_bullish}%
                </strong>
                <span className="perf-kpi-subtext">Recommandations Achat Fort / Accumuler</span>
              </div>
              <div className="perf-kpi-footer"><span>Sur la durée de détention</span></div>
            </div>

            {/* KPI 4 : Protection Baissière */}
            <div className="perf-kpi-card protection-card">
              <div className="perf-kpi-header">
                <span className="perf-kpi-title">Pertes Évitées (Vente)</span>
                <div className="perf-icon-wrap protection"><ShieldCheck size={20} /></div>
              </div>
              <div className="perf-kpi-main">
                <strong className="perf-kpi-value protection">
                  {globalSummary.drawdown_avoided >= 0 ? "+" : ""}{globalSummary.drawdown_avoided}%
                </strong>
                <span className="perf-kpi-subtext">Repli moyen sur alertes Sous-pondérer</span>
              </div>
              <div className="perf-kpi-footer"><span>Préservation du capital</span></div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* 4. Toolbar de Recherche & Filtres */}
      <section className="performance-toolbar">
        <div className="performance-search-input">
          <Search size={15} className="search-icon" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrer par symbole, entreprise ou date (ex: NVDA, 2026)..."
          />
          {searchTerm ? (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => {
                setSearchTerm("");
                const url = new URL(window.location.href);
                url.searchParams.delete("ticker");
                url.searchParams.delete("search");
                window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""));
              }}
              aria-label="Effacer la recherche"
              title="Effacer la recherche"
            >
              <X size={13} />
            </button>
          ) : null}
        </div>

        <div className="performance-filter-chips">
          <button
            type="button"
            className={`filter-chip ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            Toutes ({rawItems.length})
          </button>
          <button
            type="button"
            className={`filter-chip ${filterStatus === "selected" ? "active" : ""}`}
            onClick={() => setFilterStatus("selected")}
          >
            ☑️ Cochées ({selectedIds.size})
          </button>
          <button
            type="button"
            className={`filter-chip ${filterStatus === "win" ? "active" : ""}`}
            onClick={() => setFilterStatus("win")}
          >
            🏆 Gains (+{rawItems.filter((i) => i.status === "win").length})
          </button>
          <button
            type="button"
            className={`filter-chip ${filterStatus === "protected" ? "active" : ""}`}
            onClick={() => setFilterStatus("protected")}
          >
            🛡️ Protégées ({rawItems.filter((i) => i.status === "protected").length})
          </button>
          <button
            type="button"
            className={`filter-chip ${filterStatus === "loss" ? "active" : ""}`}
            onClick={() => setFilterStatus("loss")}
          >
            🔻 Pertes ({rawItems.filter((i) => i.status === "loss" || i.status === "miss").length})
          </button>
        </div>

        <div className="performance-sort-selector">
          <span className="sort-label">Trier par :</span>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="performance-sort-dropdown">
            <option value="date">Date d'analyse</option>
            <option value="alpha">Meilleur Alpha (vs S&P 500)</option>
            <option value="return">Meilleur Rendement %</option>
          </select>
        </div>
      </section>

      {/* 5. Tableau d'Audit & Sélection Interactive des Trades */}
      <section className="performance-table-panel">
        <div className="performance-table-head selectable">
          <span style={{ width: "32px", textAlign: "center" }}>Suivi</span>
          <span>Instrument</span>
          <span>Date</span>
          <span>Signal IA</span>
          <span>Prix Entrée</span>
          <span>Cours Actuel</span>
          <span>Rendement</span>
          {activeView === "simulator" ? <span>Gain Estimé</span> : <span>S&P 500</span>}
          <span>Alpha Net</span>
          <span>Bilan</span>
          <span style={{ textAlign: "right" }}>Détails</span>
        </div>

        {loading ? (
          <div className="performance-loading-state">
            <RefreshCw size={24} className="spin" />
            <p>Calcul des rendements et simulation du portefeuille en cours...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="performance-empty-state">
            <Award size={36} />
            <h3>Aucune analyse ne correspond aux critères</h3>
            <p>Lancez de nouvelles analyses pour enrichir automatiquement votre simulateur de performance.</p>
          </div>
        ) : (
          <motion.div
            className="performance-table-body"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.03 } },
            }}
          >
            {filteredItems.map((item) => {
              const companyName = getCompanyName(item.ticker, true);
              const isSelected = selectedIds.has(item.id);
              const isWin = item.status === "win";
              const isProtected = item.status === "protected";
              const isLoss = item.status === "loss" || item.status === "miss";

              // Calcul de la contribution financière individuelle
              const isBear = item.status === "protected" || isNegativeDecision(item.decision);
              const effectiveReturn = isBear ? -(item.return_percent || 0) : (item.return_percent || 0);
              const tradeProfit = simulationResults.allocationPerTrade > 0
                ? simulationResults.allocationPerTrade * (effectiveReturn / 100)
                : 0;
              const currencySymbol = getCurrencySymbol(item.ticker);

              return (
                <motion.div
                  key={item.id}
                  className={`performance-table-row selectable ${item.status} ${isSelected ? "selected" : ""}`}
                  onClick={() => onSelectAnalysis && onSelectAnalysis(item.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onSelectAnalysis && onSelectAnalysis(item.id);
                    }
                  }}
                  variants={{
                    hidden: { opacity: 0, y: 6 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ backgroundColor: "rgba(45, 212, 191, 0.04)" }}
                >
                  {/* Case à cocher pour inclure dans le simulateur */}
                  <div
                    className="perf-checkbox-cell"
                    onClick={(e) => handleToggleTrade(item.id, e)}
                    title={isSelected ? "Retirer du simulateur" : "Inclure dans le simulateur"}
                  >
                    <button
                      type="button"
                      className={`custom-checkbox-btn ${isSelected ? "checked" : ""}`}
                      aria-label={`Inclure ${item.ticker} dans la simulation`}
                    >
                      {isSelected ? <CheckSquare size={16} /> : <Square size={16} />}
                    </button>
                  </div>

                  {/* Ticker & Name */}
                  <div className="perf-ticker-cell">
                    <strong className="ticker-badge">{item.ticker}</strong>
                    {companyName ? <span className="company-subname">{companyName}</span> : null}
                  </div>

                  {/* Date */}
                  <div className="perf-date-cell">
                    <span>{formatDateFr(item.entry_date)}</span>
                  </div>

                  {/* Signal */}
                  <div className="perf-decision-cell">
                    <DecisionBadge decision={item.decision} size="sm" />
                  </div>

                  {/* Entry Price */}
                  <div className="perf-price-cell">
                    <strong>{item.entry_price ? `${Number(item.entry_price).toFixed(2)} ${currencySymbol}` : "—"}</strong>
                  </div>

                  {/* Current Price */}
                  <div className="perf-price-cell">
                    <strong>{item.current_price ? `${Number(item.current_price).toFixed(2)} ${currencySymbol}` : "—"}</strong>
                  </div>

                  {/* Stock Return % */}
                  <div className="perf-return-cell">
                    <span className={`perf-delta-badge ${item.return_percent >= 0 ? "positive" : "negative"}`}>
                      {item.return_percent >= 0 ? "+" : ""}{item.return_percent}%
                    </span>
                  </div>

                  {/* Gain Estimé en devises OU Benchmark Return */}
                  {activeView === "simulator" ? (
                    <div className="perf-profit-cell">
                      {isSelected ? (
                        <strong className={`perf-profit-tag ${tradeProfit >= 0 ? "positive" : "negative"}`}>
                          {tradeProfit >= 0 ? "+" : ""}{tradeProfit.toFixed(0)} {currency}
                        </strong>
                      ) : (
                        <span className="perf-profit-muted">—</span>
                      )}
                    </div>
                  ) : (
                    <div className="perf-benchmark-cell">
                      <span className={`perf-benchmark-text ${item.sp500_return_percent >= 0 ? "positive" : "negative"}`}>
                        {item.sp500_return_percent >= 0 ? "+" : ""}{item.sp500_return_percent}%
                      </span>
                    </div>
                  )}

                  {/* Alpha */}
                  <div className="perf-alpha-cell">
                    <strong className={`perf-alpha-badge ${item.alpha_percent >= 0 ? "positive" : "negative"}`}>
                      {item.alpha_percent >= 0 ? "+" : ""}{item.alpha_percent}%
                    </strong>
                  </div>

                  {/* Status Badge */}
                  <div className="perf-status-cell">
                    {isWin ? (
                      <span className="perf-status-tag win">🏆 Gain</span>
                    ) : isProtected ? (
                      <span className="perf-status-tag protected">🛡️ Protégé</span>
                    ) : isLoss ? (
                      <span className="perf-status-tag loss">🔻 Échec</span>
                    ) : (
                      <span className="perf-status-tag neutral">⏳ Neutre</span>
                    )}
                  </div>

                  {/* Action Link */}
                  <div className="perf-action-cell" style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="table-action-btn view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectAnalysis && onSelectAnalysis(item.id);
                      }}
                      title="Consulter le rapport complet de cette analyse"
                    >
                      <span>Voir</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </section>
    </main>
  );
}
