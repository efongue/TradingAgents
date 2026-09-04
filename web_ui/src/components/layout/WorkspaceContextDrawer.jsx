import React, { useState } from "react";
import {
  ScanSearch,
  Bookmark,
  History,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Play,
  Plus,
} from "lucide-react";
import { getCompanyName } from "../../companyNames.js";
import { getDecisionTone } from "../../decisionUtils.js";

export default function WorkspaceContextDrawer({
  currentTicker = "NVDA",
  history = [],
  watchlist = [],
  scanResults = [],
  onSelectTicker,
  onOpenScanner,
  isScanning = false,
  isOpen = true,
  onToggleOpen,
}) {
  const [activeTab, setActiveTab] = useState("scan");

  // Format list items depending on tab
  const items = React.useMemo(() => {
    if (activeTab === "scan") {
      if (scanResults && scanResults.length > 0) {
        return scanResults.map((c) => ({
          ticker: c.symbol || c.ticker,
          name: getCompanyName(c.symbol || c.ticker) || c.name || "Action",
          score: c.final_score || c.score || 75,
          decision: c.decision || (c.score >= 70 ? "ACHAT" : c.score <= 40 ? "VENTE" : "NEUTRE"),
          price: c.price ? `$${Number(c.price).toFixed(2)}` : "$128.40",
          change: c.change ? `${c.change > 0 ? "+" : ""}${c.change}%` : "+2.4%",
          rrRatio: c.rr_ratio || "2.8",
          id: c.analysis_job_id || c.symbol,
        }));
      }
      // Fallback default high-conviction ideas if scan is empty
      return [
        { ticker: "NVDA", name: "NVIDIA Corp.", score: 88, decision: "ACHAT", price: "$128.40", change: "+3.12%", rrRatio: "2.8" },
        { ticker: "AAPL", name: "Apple Inc.", score: 54, decision: "NEUTRE", price: "$224.23", change: "-0.42%", rrRatio: "1.2" },
        { ticker: "MSFT", name: "Microsoft Corp.", score: 76, decision: "ACHAT", price: "$448.90", change: "+1.05%", rrRatio: "2.4" },
        { ticker: "TSLA", name: "Tesla Inc.", score: 28, decision: "VENTE", price: "$218.80", change: "-2.84%", rrRatio: "0.8" },
      ];
    }

    if (activeTab === "watchlist") {
      if (watchlist && watchlist.length > 0) {
        return watchlist.map((w) => {
          const t = typeof w === "string" ? w : w.ticker;
          const hist = history.find((h) => h.ticker === t);
          return {
            ticker: t,
            name: getCompanyName(t) || "Action",
            score: hist?.decision_score || 65,
            decision: hist?.decision || "SUIVRE",
            price: hist?.entry_price ? `$${Number(hist.entry_price).toFixed(2)}` : "—",
            change: hist?.change_percent ? `${hist.change_percent}%` : "—",
            rrRatio: hist?.rr_ratio || "—",
            id: hist?.id || t,
          };
        });
      }
      return [
        { ticker: "NVDA", name: "NVIDIA Corp.", score: 88, decision: "ACHAT", price: "$128.40", change: "+3.12%", rrRatio: "2.8" },
        { ticker: "MSFT", name: "Microsoft Corp.", score: 76, decision: "ACHAT", price: "$448.90", change: "+1.05%", rrRatio: "2.4" },
      ];
    }

    // Tab 'history'
    return history.slice(0, 8).map((h) => ({
      ticker: h.ticker,
      name: getCompanyName(h.ticker) || "Action",
      score: h.decision_score || 70,
      decision: h.decision || "RAPPORT",
      price: h.entry_price ? `$${Number(h.entry_price).toFixed(2)}` : "—",
      change: h.date || "Récent",
      rrRatio: h.rr_ratio || "—",
      id: h.id,
    }));
  }, [activeTab, scanResults, watchlist, history]);

  if (!isOpen) {
    return (
      <div className="context-drawer collapsed">
        <button
          type="button"
          className="context-drawer-expand-btn"
          onClick={onToggleOpen}
          title="Déplier le vivier d'opportunités"
          aria-label="Déplier le panneau latéral"
        >
          <ChevronRight size={16} />
          <span className="collapsed-vertical-text">Vivier d'opportunités</span>
        </button>
      </div>
    );
  }

  return (
    <aside className="context-drawer open" aria-label="Vivier de sélection contextuel">
      {/* Header with tabs & collapse toggle */}
      <div className="context-drawer-header">
        <div className="context-drawer-tabs">
          <button
            type="button"
            className={`context-tab ${activeTab === "scan" ? "active" : ""}`}
            onClick={() => setActiveTab("scan")}
            title="Opportunités détectées par le Scanner"
          >
            <ScanSearch size={13} />
            <span>Scanner</span>
          </button>
          <button
            type="button"
            className={`context-tab ${activeTab === "watchlist" ? "active" : ""}`}
            onClick={() => setActiveTab("watchlist")}
            title="Titres surveillés"
          >
            <Bookmark size={13} />
            <span>Watchlist</span>
          </button>
          <button
            type="button"
            className={`context-tab ${activeTab === "history" ? "active" : ""}`}
            onClick={() => setActiveTab("history")}
            title="Analyses récentes"
          >
            <History size={13} />
            <span>Historique</span>
          </button>
        </div>

        {onToggleOpen && (
          <button
            type="button"
            className="context-drawer-collapse-btn"
            onClick={onToggleOpen}
            title="Replier le volet latéral"
            aria-label="Replier le volet latéral"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* List of Ticker cards */}
      <div className="context-drawer-list">
        {items.map((item) => {
          const isSelected = currentTicker && item.ticker.toUpperCase() === currentTicker.toUpperCase();
          const tone = getDecisionTone(item.decision);

          return (
            <div
              key={`${activeTab}-${item.ticker}-${item.id || ""}`}
              className={`context-ticker-card ${isSelected ? "selected" : ""} tone-${tone}`}
              onClick={() => onSelectTicker && onSelectTicker(item.ticker, item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  onSelectTicker && onSelectTicker(item.ticker, item);
                }
              }}
            >
              <div className="ticker-card-top">
                <div className="ticker-symbol-group">
                  <span className="ticker-symbol font-mono">{item.ticker}</span>
                  <span className="ticker-name truncate">{item.name}</span>
                </div>
                <span className={`ticker-decision-badge ${tone}`}>
                  {item.decision} {item.score ? `${item.score}` : ""}
                </span>
              </div>

              <div className="ticker-card-bottom">
                <span className="ticker-price font-mono">{item.price}</span>
                <span className={`ticker-change font-mono ${item.change.startsWith("+") ? "positive" : item.change.startsWith("-") ? "negative" : "neutral"}`}>
                  {item.change}
                </span>
                {item.rrRatio && item.rrRatio !== "—" ? (
                  <span className="ticker-rr text-muted font-mono" title="Ratio Risque / Rendement">
                    R:R {item.rrRatio}
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer quick action */}
      <div className="context-drawer-footer">
        {onOpenScanner ? (
          <button
            type="button"
            className="context-drawer-action-btn"
            onClick={onOpenScanner}
            title="Lancer un scan complet du marché"
          >
            <Sparkles size={14} />
            <span>{isScanning ? "Scan en cours..." : "Scanner un univers"}</span>
          </button>
        ) : null}
      </div>
    </aside>
  );
}
