import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function PolarityCard({ agent }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = agent.icon;

  return (
    <div className={`polarity-card ${agent.stance} ${expanded ? "expanded" : ""}`}>
      <button
        type="button"
        className="polarity-card-header"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
      >
        <div className="polarity-card-title-group">
          {Icon ? <Icon size={14} className="polarity-icon" /> : null}
          <span className="polarity-agent-name">{agent.name}</span>
        </div>
        <div className="polarity-card-right">
          <span className="polarity-mini-tag">{agent.stanceTag}</span>
          <ChevronDown size={13} className={`polarity-chevron ${expanded ? "open" : ""}`} />
        </div>
      </button>

      <AnimatePresence>
        {expanded ? (
          <motion.div
            className="polarity-card-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <p className="polarity-card-summary">{agent.summary}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
