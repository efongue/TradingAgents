import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Workflow, { WorkflowStepList } from "../../Workflow.jsx";
import FinancialBento from "./FinancialBento.jsx";
import AnalysisParametersPanel from "./AnalysisParametersPanel.jsx";
import MarkdownReportLinks from "./MarkdownReportLinks.jsx";
import ActionPlanPanel from "./ActionPlanPanel.jsx";

export default function ReportContent({ job, result, tab, onShowToast }) {
  const reports = result?.reports || {};
  if (tab === "image") return <FinancialBento job={job} result={result} />;
  if (tab === "action_plan") return <ActionPlanPanel job={job} result={result} onShowToast={onShowToast} />;
  if (tab === "workflow") {
    return (
      <div className="report-workflow-wrapper">
        <Workflow job={job} defaultDataSteps={job?.data_steps || []} />
        <AnalysisParametersPanel job={job} result={result} />
      </div>
    );
  }

  const reportKeys = tab === "analysts"
    ? ["market", "social", "news", "fundamentals"]
    : [];
  const debateSteps = job?.stage_steps?.debate || [];

  const content = {
    summary: result?.summary,
    analysts: [reports.market, reports.news, reports.social, reports.fundamentals].filter(Boolean).join("\n\n---\n\n"),
    debate: [reports.bull, reports.bear, reports.research_manager].filter(Boolean).join("\n\n---\n\n"),
    risks: [reports.aggressive, reports.conservative, reports.neutral].filter(Boolean).join("\n\n---\n\n"),
    report: result?.complete_report,
  }[tab] || result?.summary;

  return (
    <>
      {tab === "debate" && debateSteps.length ? (
        <section className="report-stage-summary" aria-labelledby="debate-steps-title">
          <h3 id="debate-steps-title">Étapes du débat</h3>
          <WorkflowStepList
            steps={debateSteps}
            connectionUnverified={false}
            label="Étapes réelles du débat"
          />
        </section>
      ) : null}
      <MarkdownReportLinks job={job} reports={reports} reportKeys={reportKeys} />
      <div className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "Aucun contenu disponible."}</ReactMarkdown>
      </div>
    </>
  );
}
