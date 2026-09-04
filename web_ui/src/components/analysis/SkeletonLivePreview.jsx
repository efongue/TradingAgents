import React from "react";
import { motion } from "framer-motion";

export default function SkeletonLivePreview({ ticker }) {
  return (
    <motion.section
      className="skeleton-live-preview"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      aria-label={`Simulation du rapport pour ${ticker}`}
    >
      <div className="skeleton-hero-box skeleton-shimmer">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div className="skeleton-shimmer-bar" style={{ width: "180px", height: "18px", borderRadius: "6px" }} />
          <div className="skeleton-shimmer-bar" style={{ width: "110px", height: "26px", borderRadius: "20px" }} />
        </div>
        <div className="skeleton-shimmer-bar" style={{ width: "340px", height: "42px", margin: "14px 0", borderRadius: "8px" }} />
        <div className="skeleton-shimmer-bar" style={{ width: "100%", height: "8px", borderRadius: "4px" }} />
      </div>
      <div className="skeleton-bento-grid">
        <div className="skeleton-card skeleton-shimmer" />
        <div className="skeleton-card skeleton-shimmer" />
        <div className="skeleton-card skeleton-shimmer" />
      </div>
    </motion.section>
  );
}
