import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api.js";
import { playSuccessChime } from "../utils/audioAlert.js";

function notifyDesktop(title, body) {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted" && document.hidden) {
      try {
        new Notification(title, { body, icon: "/favicon.ico" });
      } catch {
        // Notification error fallback
      }
    }
  }
}

export function useScanJob({ onProgress, onComplete } = {}) {
  const [scanJob, setScanJob] = useState(null);
  const onProgressRef = useRef(onProgress);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onProgressRef.current = onProgress;
  }, [onProgress]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Persist active scan id in localStorage
  useEffect(() => {
    if (scanJob?.id) {
      localStorage.setItem("tradingagents_scan_id", scanJob.id);
    } else {
      localStorage.removeItem("tradingagents_scan_id");
    }
  }, [scanJob?.id]);

  // Polling loop for scanner job
  useEffect(() => {
    if (!scanJob || !["queued", "running"].includes(scanJob.status)) return undefined;

    const timer = window.setInterval(async () => {
      try {
        const next = await api(`/api/scans/${scanJob.id}`);
        if (
          next.analysis_progress?.completed !== scanJob?.analysis_progress?.completed ||
          ["complete", "error"].includes(next.status)
        ) {
          if (onProgressRef.current) onProgressRef.current(next);
        }
        setScanJob(next);
        if (next.status === "complete" && scanJob.status !== "complete") {
          playSuccessChime();
          if (onCompleteRef.current) onCompleteRef.current(next);
          notifyDesktop(
            "TradingAgents : Scan de marché terminé",
            `${next.ranking?.length || 0} actions analysées et classées.`
          );
        }
      } catch {
        // Transient poll error for scan
      }
    }, 2500);

    return () => window.clearInterval(timer);
  }, [scanJob?.id, scanJob?.status, scanJob?.analysis_progress?.completed]);

  const isRunning = Boolean(scanJob && ["queued", "running"].includes(scanJob.status));

  return {
    scanJob,
    setScanJob,
    isRunning,
  };
}

export default useScanJob;
