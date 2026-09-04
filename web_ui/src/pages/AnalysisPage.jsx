import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import Workflow from "../Workflow.jsx";
import AnalysisForm from "../components/analysis/AnalysisForm.jsx";
import ReliabilityRail from "../components/analysis/ReliabilityRail.jsx";
import AnalysisFailure from "../components/analysis/AnalysisFailure.jsx";
import ResultPage from "./ResultPage.jsx";

export default function AnalysisPage({
  form,
  setForm,
  job,
  online,
  analysts,
  dataSteps,
  analystsError,
  pollWarning,
  onSubmit,
  onReset,
  onAddToWatchlist,
  onCompareTicker,
  onShowToast,
}) {
  const busy = job && ["queued", "running"].includes(job.status);
  const result = job?.result;

  if (result) {
    return (
      <ResultPage
        job={job}
        onReset={onReset}
        onAddToWatchlist={onAddToWatchlist}
        onCompareTicker={onCompareTicker}
        onShowToast={onShowToast}
      />
    );
  }

  return (
    <main className="page analysis-page">
      <div className="page-heading">
        <div>
          <h1>Analyser une action</h1>
          <p>Comité d'investissement et de recherche fondamentale automatisé : analyse 360°, valorisation, débat contradictoire et gestion du risque.</p>
        </div>
      </div>

      <AnalysisForm
        form={form}
        setForm={setForm}
        disabled={busy}
        online={online}
        analysts={analysts}
        analystsError={analystsError}
        onSubmit={onSubmit}
      />

      {!online ? (
        <div className="connection-error">
          <AlertTriangle size={18} /> La passerelle IA ne répond pas pour le moment.
        </div>
      ) : null}
      {pollWarning ? (
        <div className="connection-warning">
          <RefreshCw size={18} /> {pollWarning}
        </div>
      ) : null}
      {["error", "interrupted"].includes(job?.status) ? <AnalysisFailure job={job} /> : null}

      {/* When running: display live pipeline and active verification rail */}
      {busy ? (
        <motion.div
          className="analysis-grid live-running"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Workflow job={job} defaultDataSteps={dataSteps} connectionUnverified={Boolean(pollWarning)} />
          <ReliabilityRail job={job} connectionUnverified={Boolean(pollWarning)} />
        </motion.div>
      ) : null}
    </main>
  );
}
