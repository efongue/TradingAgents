import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Clock3,
  FileText,
  Plus,
  Scale,
  ShieldCheck,
  Zap,
  LayoutGrid,
  Users,
  MessageSquareText,
  BookOpen,
  Target,
} from "lucide-react";
import { getCompanyName } from "../companyNames.js";
import { formatDateFr } from "../decisionUtils.js";
import { formatTokens } from "../Workflow.jsx";
import ExecutionLevelsCard from "../ExecutionLevelsCard.jsx";
import PrintableMemo from "../PrintableMemo.jsx";
import DecisionHero from "../components/results/DecisionHero.jsx";
import ReportContent from "../components/results/ReportContent.jsx";
import WatchlistToggleButton from "../components/ui/WatchlistToggleButton.jsx";
import ExportDropdown from "../components/ui/ExportDropdown.jsx";

export const TAB_ITEMS = [
  ["image", "Vue Bento", LayoutGrid],
  ["summary", "Synthèse", FileText],
  ["workflow", "Déroulement & Métriques", Clock3],
  ["analysts", "Analystes", Users],
  ["debate", "Débat", MessageSquareText],
  ["risks", "Risques", ShieldCheck],
  ["action_plan", "Que faire ?", Target],
  ["report", "Rapport complet", BookOpen],
];

export default function ResultPage({ job, onReset, historical = false, onBackHistory, onAddToWatchlist, onCompareTicker, onShowToast }) {
  const [tab, setTab] = useState("image");
  const result = job?.result;

  return (
    <main className="page result-page">
      <div className="page-heading result-heading">
        <div>
          <h1>
            {job?.ticker}
            {getCompanyName(job?.ticker) ? ` · ${getCompanyName(job?.ticker)}` : ""}
            {historical ? " (Historique)" : ""}
          </h1>
          <p>{historical ? "Analyse enregistrée, disponible en consultation uniquement" : `Analyse du ${formatDateFr(job?.analysis_date)} · ${job?.model}`}{historical ? ` · Réalisée le ${formatDateFr(job?.analysis_date)}` : ""}</p>
          <div className="result-metric-summary-pills">
            {job?.total_tokens ? (
              <span className="result-metric-pill" title="Tokens totaux utilisés lors de l'analyse">
                <Zap size={11} /> {formatTokens(job.total_tokens)} tokens
              </span>
            ) : null}
            {job?.elapsed && job.elapsed !== "—" ? (
              <span className="result-metric-pill" title="Temps total d'exécution">
                <Clock3 size={11} /> {job.elapsed}
              </span>
            ) : null}
            <button
              type="button"
              className={`result-metric-pill clickable reliability ${result?.reliability?.blocked ? "blocked" : "verified"}`}
              onClick={() => setTab("workflow")}
              title="Cliquer pour inspecter les 4 contrôles de fiabilité dans le déroulement"
            >
              {result?.reliability?.blocked ? <AlertTriangle size={11} /> : <ShieldCheck size={11} />}
              <span>{result?.reliability?.blocked ? "Anomalie détectée" : "Données certifiées (4/4)"}</span>
            </button>
          </div>
        </div>
        <div className="heading-actions">
          {historical ? (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="secondary-button" onClick={onBackHistory}>
              <ArrowLeft size={18} /> Retour à l’historique
            </motion.button>
          ) : (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="secondary-button" onClick={onReset}>
              <Plus size={18} /> Nouvelle analyse
            </motion.button>
          )}

          <WatchlistToggleButton ticker={job?.ticker} onShowToast={onShowToast} />

          {onCompareTicker ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="secondary-button"
              onClick={() => onCompareTicker(job?.ticker)}
              title="Comparer avec d'autres titres"
            >
              <Scale size={18} /> Comparer
            </motion.button>
          ) : null}

          <ExportDropdown job={job} onShowToast={onShowToast} />
        </div>
      </div>
      {result ? <DecisionHero result={result} /> : null}
      {result?.execution_levels ? (
        <ExecutionLevelsCard
          ticker={job?.ticker}
          levels={result.execution_levels}
          decision={result.display_decision}
          onShowToast={onShowToast}
        />
      ) : null}
      <div className="result-grid">
        <section className="report-panel">
          <div className="tabs" role="tablist" aria-label="Sections du rapport">
            {TAB_ITEMS.map(([id, label, Icon]) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  className={active ? "active" : ""}
                  onClick={() => setTab(id)}
                  role="tab"
                  aria-selected={active}
                >
                  <Icon size={18} /> {label}
                  {active && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="tab-active-pill"
                      transition={{ type: "spring", stiffness: 450, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          {result?.reliability?.blocked ? (
            <div className="inconsistency-banner">
              <AlertTriangle size={27} />
              <div><strong>Incohérence de prix détectée</strong><p>{result.reliability.block_reason || "Une incohérence critique a été détectée sur les prix."}</p></div>
              <span>Bloquant</span>
            </div>
          ) : null}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <ReportContent job={job} result={result} tab={tab} onShowToast={onShowToast} />
            </motion.div>
          </AnimatePresence>
        </section>
      </div>

      {/* Printable Institutional PDF Memo (Active during window.print()) */}
      <div className="print-only-memo-wrapper">
        <PrintableMemo job={job} result={result} />
      </div>
    </main>
  );
}
