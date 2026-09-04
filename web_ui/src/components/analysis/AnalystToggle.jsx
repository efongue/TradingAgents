import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function AnalystToggle({ id, label, description, Icon, selected, disabled, onToggle }) {
  return (
    <motion.button
      type="button"
      className={`analyst-toggle ${selected ? "selected" : ""}`}
      onClick={() => onToggle(id)}
      disabled={disabled}
      aria-pressed={selected}
      whileHover={disabled ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <span className="analyst-card-icon" aria-hidden="true">
        {selected ? <Check size={17} /> : Icon ? <Icon size={17} /> : null}
      </span>
      <span className="analyst-card-copy">
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
    </motion.button>
  );
}
