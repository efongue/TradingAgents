import React from "react";
import { AlertTriangle, CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";

export default function ReliabilityRail({ job, result, connectionUnverified = false }) {
  const checks = result?.reliability?.checks || job?.reliability?.checks || [
    { label: "Cours vérifié", status: "pending", detail: "Le dernier cours sera contrôlé avant de commencer" },
    { label: "Données datées", status: "pending", detail: "La date de la dernière séance apparaîtra ici" },
    { label: "Incohérences bloquantes", status: "pending", detail: "La conclusion sera comparée aux données vérifiées" },
  ];
  const blocked = result?.reliability?.blocked;

  return (
    <aside className="reliability-panel">
      <div className="panel-heading">
        <ShieldCheck size={21} />
        <h2>Contrôles de fiabilité</h2>
      </div>
      <div className="check-list">
        {checks.map((check) => {
          const unverified = connectionUnverified && check.status === "pending";
          const activelyChecking = check.status === "pending" && ["queued", "running"].includes(job?.status) && !connectionUnverified;
          return (
            <div className={`check-row ${unverified ? "unverified" : check.status}`} key={check.label}>
              {check.status === "ok" ? (
                <CheckCircle2 size={21} />
              ) : check.status === "blocked" || unverified ? (
                <AlertTriangle size={21} />
              ) : (
                <LoaderCircle className={activelyChecking ? "spin" : ""} size={21} />
              )}
              <div>
                <strong>{check.label}</strong>
                <span>{unverified ? `État non vérifié — ${check.detail}` : check.detail}</span>
              </div>
            </div>
          );
        })}
      </div>
      {blocked ? (
        <div className="blocking-box">
          <AlertTriangle size={25} />
          <div>
            <strong>Décision non exploitable</strong>
            <p>Une vérification importante ne concorde pas. Corrigez-la avant d’interpréter le résultat.</p>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
