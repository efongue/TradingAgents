import React from "react";
import { FileText } from "lucide-react";

export const REPORT_LINK_LABELS = {
  market: "Marché",
  social: "Sentiment du marché",
  news: "Actualités",
  fundamentals: "Fondamentaux",
  bull: "Analyste haussier",
  bear: "Analyste baissier",
};

export default function MarkdownReportLinks({ job, reports, reportKeys }) {
  const available = (reportKeys || []).filter((key) => reports?.[key]);
  if (!available.length) return null;
  return (
    <nav className="markdown-report-links" aria-label="Rapports Markdown disponibles">
      <span>Fichiers sources</span>
      <div>
        {available.map((key) => (
          <a
            key={key}
            href={`/api/jobs/${job.id}/reports/${key}.md`}
            target="_blank"
            rel="noreferrer"
          >
            <FileText size={14} /> {REPORT_LINK_LABELS[key] || key}.md
          </a>
        ))}
      </div>
    </nav>
  );
}
