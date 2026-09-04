import React from "react";
import { motion } from "framer-motion";
import { reportHighlights } from "../../utils/reportUtils.js";

export default function BentoInsight({ title, icon: Icon, source, className = "", fallback }) {
  const insights = reportHighlights(source, 2);
  return (
    <motion.article
      className={`bento-card bento-insight ${className}`}
      variants={{
        hidden: { opacity: 0, y: 12 },
        visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } },
      }}
      whileHover={{ y: -2 }}
    >
      <div className="bento-card-title">{Icon ? <Icon size={18} /> : null}<h3>{title}</h3></div>
      {insights.length ? (
        <ul>{insights.map((insight) => <li key={insight}>{insight}</li>)}</ul>
      ) : <p className="bento-empty">{fallback}</p>}
    </motion.article>
  );
}
