import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Copy, Download, Printer, Share2 } from "lucide-react";
import { getCurrencySymbol } from "../../companyNames.js";
import { extractAgentPositions } from "../results/AgentPolarityBoard.jsx";

export function copyInvestmentMemoToClipboard(job) {
  const result = job?.result || {};
  const snapshot = result.snapshot || {};
  const positions = extractAgentPositions(result);
  const currencySymbol = getCurrencySymbol(job?.ticker);
  const text = `TRADINGAGENTS · MÉMO D'INVESTISSEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${job?.ticker} (${job?.analysis_date}) · ${result.display_decision || "DÉCISION"}
Confiance : ${result.confidence || "Modérée"}
Positionnement des agents : ${positions.positive.length} Favorable(s) / ${positions.neutral.length} Neutre(s) / ${positions.negative.length} Prudent(s)
Cours vérifié : ${snapshot.close || result.reliability?.verified_close || "—"} ${currencySymbol}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Synthèse des agents :
${result.summary ? result.summary.slice(0, 350) : "Analyse disponible."}...

Contrôle de fiabilité : ${result.reliability?.blocked ? "Incohérence détectée" : "Données certifiées"}
`;
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    navigator.clipboard.writeText(text);
  }
}

export default function ExportDropdown({ job, onShowToast }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="export-dropdown-wrap" ref={dropdownRef}>
      <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`secondary-button export-toggle-btn ${open ? "active" : ""}`}
        onClick={() => setOpen(!open)}
        title="Partager ou exporter le rapport d'analyse"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Share2 size={16} /> Exporter & Partager <ChevronDown size={14} />
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="export-dropdown-menu"
            role="menu"
            aria-label="Options d'export et partage"
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.14, ease: "easeOut" }}
          >
            <button
              type="button"
              className="export-dropdown-item"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                window.print();
              }}
            >
              <Printer size={16} />
              <div>
                <strong>Exporter Mémo PDF</strong>
                <small>Format imprimable institutionnel</small>
              </div>
            </button>

            <button
              type="button"
              className="export-dropdown-item"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                copyInvestmentMemoToClipboard(job);
                if (onShowToast) onShowToast("Mémo exécutif copié dans le presse-papier !");
              }}
            >
              <Copy size={16} />
              <div>
                <strong>Copier le mémo</strong>
                <small>Formaté pour Slack / Email</small>
              </div>
            </button>

            <a
              className="export-dropdown-item"
              role="menuitem"
              href={`/api/jobs/${job?.id}/report`}
              target="_blank"
              rel="noreferrer"
              onClick={() => setOpen(false)}
              download={`${job?.ticker}_analyse_${job?.analysis_date || "rapport"}.md`}
            >
              <Download size={16} />
              <div>
                <strong>Télécharger la source (.md)</strong>
                <small>Fichier brut Markdown de l'analyse</small>
              </div>
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
