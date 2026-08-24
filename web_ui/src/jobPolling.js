export const TRANSIENT_POLL_MESSAGE =
  "Connexion au serveur local momentanément perdue. L’état affiché est le dernier reçu et ne prouve pas que l’analyse progresse. Reconnexion automatique toutes les 2,5 secondes.";

export const INTERRUPTED_JOB_MESSAGE =
  "Analyse interrompue : le serveur local a redémarré ou ne connaît plus ce travail. Relancez la même analyse pour réutiliser le checkpoint disponible.";

export function isMissingJobError(error) {
  return error?.status === 404;
}

export function interruptJob(job) {
  return {
    ...job,
    status: "interrupted",
    error: INTERRUPTED_JOB_MESSAGE,
    stages: (job?.stages || []).map((stage) =>
      stage.status === "active"
        ? {
            ...stage,
            status: "error",
            detail: "Cette étape a été interrompue avant que sa fin puisse être confirmée.",
          }
        : stage,
    ),
  };
}
