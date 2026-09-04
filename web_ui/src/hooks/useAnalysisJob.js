import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../api.js";
import {
  interruptJob,
  isMissingJobError,
  TRANSIENT_POLL_MESSAGE,
} from "../jobPolling.js";
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

export function requestNotificationPermission() {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
  }
}

export function useAnalysisJob({ onComplete } = {}) {
  const [job, setJob] = useState(null);
  const [pollWarning, setPollWarning] = useState("");
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Persist active job id in localStorage (only for standalone analyses, not scan children)
  useEffect(() => {
    if (job?.id && !job?.parent_scan_id) {
      localStorage.setItem("tradingagents_job_id", job.id);
    } else if (!job?.id || job?.parent_scan_id) {
      localStorage.removeItem("tradingagents_job_id");
    }
  }, [job?.id, job?.parent_scan_id]);

  // Polling loop when job is active
  useEffect(() => {
    if (!job || !["queued", "running"].includes(job.status)) return undefined;

    const timer = window.setInterval(async () => {
      try {
        const next = await api(`/api/jobs/${job.id}`);
        setPollWarning("");
        setJob(next);
        if (["complete", "error"].includes(next.status)) {
          if (onCompleteRef.current) onCompleteRef.current(next);
          if (next.status === "complete") {
            playSuccessChime();
            notifyDesktop(
              `TradingAgents : Analyse de ${next.ticker} terminée`,
              `Décision : ${next.result?.display_decision || "Terminée"} (${next.result?.confidence || "Vérifiée"})`
            );
          }
        }
      } catch (error) {
        if (isMissingJobError(error)) {
          setPollWarning("");
          setJob((current) => interruptJob(current));
        } else {
          setPollWarning(TRANSIENT_POLL_MESSAGE);
        }
      }
    }, 2500);

    return () => window.clearInterval(timer);
  }, [job?.id, job?.status]);

  const submit = useCallback(async (form) => {
    requestNotificationPermission();
    setPollWarning("");
    try {
      const next = await api("/api/analyze", { method: "POST", body: JSON.stringify(form) });
      setJob(next);
      return next;
    } catch (error) {
      const errJob = { status: "error", error: error.message };
      setJob(errJob);
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setJob(null);
    setPollWarning("");
  }, []);

  const isRunning = Boolean(job && ["queued", "running"].includes(job.status));

  return {
    job,
    setJob,
    isRunning,
    pollWarning,
    submitAnalysis: submit,
    resetJob: reset,
  };
}

export default useAnalysisJob;
