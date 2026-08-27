import React, { useId, useMemo } from "react";
import { motion } from "framer-motion";

/**
 * Micro-graphique SVG Sparkline haute performance pour visualiser
 * instantanément la trajectoire de cours et le momentum d'un titre.
 */
export default function Sparkline({
  data = [],
  width = 110,
  height = 32,
  tone,
  showChange = false,
  showDots = true,
  animate = true,
  className = "",
}) {
  const gradientId = useId();

  // Extraction stricte des points réels sans invention de données synthétiques
  const points = useMemo(() => {
    if (Array.isArray(data) && data.length >= 2) {
      const valid = data.map((v) => Number(v)).filter((v) => !Number.isNaN(v) && Number.isFinite(v));
      if (valid.length >= 2) return valid;
    }
    return null;
  }, [data]);

  if (!points) {
    return <span className="muted-text">—</span>;
  }

  const { pathD, fillD, strokeColor, startPoint, endPoint, percentChange, detectedTone } = useMemo(() => {
    const n = points.length;
    const minVal = Math.min(...points);
    const maxVal = Math.max(...points);
    const range = maxVal - minVal || 1;

    const padX = 3;
    const padY = 4;
    const innerW = width - padX * 2;
    const innerH = height - padY * 2;

    const coords = points.map((val, idx) => {
      const x = padX + (idx / (n - 1)) * innerW;
      const y = padY + innerH - ((val - minVal) / range) * innerH;
      return { x: Number(x.toFixed(2)), y: Number(y.toFixed(2)) };
    });

    // Construction du tracé de courbe adouci
    const lineParts = [`M ${coords[0].x} ${coords[0].y}`];
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const cx = ((prev.x + curr.x) / 2).toFixed(2);
      lineParts.push(`C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`);
    }
    const pathD = lineParts.join(" ");

    // Tracé de la surface fermée pour le dégradé lumineux
    const last = coords[coords.length - 1];
    const first = coords[0];
    const fillD = `${pathD} L ${last.x} ${height} L ${first.x} ${height} Z`;

    const startVal = points[0];
    const endVal = points[points.length - 1];
    const diff = endVal - startVal;
    const pct = startVal !== 0 ? (diff / startVal) * 100 : 0;

    let computedTone = tone;
    if (!computedTone) {
      if (pct > 0.4) computedTone = "positive";
      else if (pct < -0.4) computedTone = "negative";
      else computedTone = "neutral";
    }

    let strokeColor = "#2dd4bf"; // mint par défaut
    if (computedTone === "positive") strokeColor = "#10b981"; // vert émeraude
    else if (computedTone === "negative") strokeColor = "#f43f5e"; // rose corail
    else if (computedTone === "neutral") strokeColor = "#f59e0b"; // ambre

    return {
      pathD,
      fillD,
      strokeColor,
      startPoint: first,
      endPoint: last,
      percentChange: pct,
      detectedTone: computedTone,
    };
  }, [points, width, height, tone]);

  return (
    <div className={`sparkline-container tone-${detectedTone} ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="sparkline-svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.28" />
            <stop offset="85%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Zone remplie avec halo de dégradé */}
        <path d={fillD} fill={`url(#${gradientId})`} />

        {/* Ligne principale de cours */}
        {animate ? (
          <motion.path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0.2 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : (
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Point lumineux de fin (dernière clôture) */}
        {showDots && (
          <motion.circle
            cx={endPoint.x}
            cy={endPoint.y}
            r="2.8"
            fill={strokeColor}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: animate ? 0.6 : 0, duration: 0.3 }}
          />
        )}
      </svg>

      {showChange && (
        <span className={`sparkline-badge ${detectedTone}`}>
          {percentChange >= 0 ? "+" : ""}
          {percentChange.toFixed(1)}%
        </span>
      )}
    </div>
  );
}
