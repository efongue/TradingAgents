import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

export default function GlobalDisclaimerPopup() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem("tradingagents_disclaimer_dismissed") === "true";
    } catch {
      return false;
    }
  });

  const handleDismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem("tradingagents_disclaimer_dismissed", "true");
    } catch {}
  };

  return (
    <AnimatePresence>
      {!dismissed ? (
        <motion.aside
          className="disclaimer-floating-popup"
          role="alert"
          aria-live="polite"
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 350, damping: 26 }}
        >
          <div className="disclaimer-popup-content">
            <div className="disclaimer-popup-icon-wrap">
              <AlertTriangle size={18} />
            </div>
            <div className="disclaimer-popup-text">
              <strong>Une analyse IA n’est pas un conseil financier.</strong>
              <p>Gardez un regard critique : les informations peuvent être incomplètes ou inexactes. Vérifiez toujours les sources.</p>
            </div>
          </div>
          <button
            type="button"
            className="disclaimer-popup-close"
            onClick={handleDismiss}
            aria-label="Fermer l'avertissement"
            title="Fermer"
          >
            <X size={15} />
          </button>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
