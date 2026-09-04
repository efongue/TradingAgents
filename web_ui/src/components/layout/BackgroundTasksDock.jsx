import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ScanSearch, ChevronDown, ChevronUp, Zap, Clock } from "lucide-react";
import { formatTokens } from "../../Workflow.jsx";

export default function BackgroundTasksDock({
  analysisActive,
  scanActive,
  job,
  scanJob,
  onOpenAnalysis,
  onOpenScanner,
}) {
  const [minimized, setMinimized] = useState(false);

  if (!analysisActive && !scanActive) return null;

  const isScan = scanActive && !analysisActive;
  const activeTitle = isScan
    ? "Scan de marché en cours"
    : `Analyse de ${job?.ticker || "titre"} en tâche de fond`;

  const activeDetail = isScan
    ? `${scanJob?.analysis_progress?.completed || 0}/${scanJob?.analysis_progress?.total || 0} analyses terminées · Ticker : ${scanJob?.active_symbol || "Préfiltrage"}`
    : `${job?.stage_label || "Calcul multi-agents"} · ${job?.total_tokens ? `${formatTokens(job.total_tokens)} tokens` : "Initialisation"}`;

  const progressPercent = isScan
    ? Math.round(((scanJob?.analysis_progress?.completed || 0) / Math.max(scanJob?.analysis_progress?.total || 1, 1)) * 100)
    : 65;

  return (
    <AnimatePresence>
      <motion.div
        className={`floating-task-dock ${minimized ? "minimized" : ""}`}
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        role="status"
        aria-live="polite"
      >
        <div className="task-dock-indicator">
          <span className="dock-ping-circle" />
          <span className="dock-pulse-core" />
        </div>

        {!minimized ? (
          <div className="task-dock-content">
            <div className="task-dock-title-row">
              <span className="task-dock-title font-semibold">{activeTitle}</span>
              {job?.elapsed && job.elapsed !== "—" ? (
                <span className="task-dock-timer font-mono">
                  <Clock size={11} /> {job.elapsed}
                </span>
              ) : null}
            </div>

            <div className="task-dock-detail truncate">{activeDetail}</div>

            {/* Progress track */}
            <div className="task-dock-progress-track">
              <div
                className="task-dock-progress-fill"
                style={{ width: `${Math.min(100, Math.max(10, progressPercent))}%` }}
              />
            </div>
          </div>
        ) : (
          <span className="task-dock-minimized-label">
            {isScan ? "Scan actif" : `Analyse ${job?.ticker || ""}`}
          </span>
        )}

        <div className="task-dock-actions">
          <button
            type="button"
            className="task-dock-action-btn primary"
            onClick={isScan ? onOpenScanner : onOpenAnalysis}
            title="Ouvrir le direct de l'exécution"
          >
            {isScan ? <ScanSearch size={13} /> : <Play size={13} />}
            {!minimized && <span>Ouvrir</span>}
          </button>

          <button
            type="button"
            className="task-dock-minimize-btn"
            onClick={() => setMinimized((prev) => !prev)}
            title={minimized ? "Agrandir le dock" : "Réduire le dock"}
            aria-label={minimized ? "Agrandir le panneau" : "Réduire le panneau"}
          >
            {minimized ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
