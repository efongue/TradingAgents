import assert from "node:assert/strict";
import test from "node:test";

import {
  INTERRUPTED_JOB_MESSAGE,
  TRANSIENT_POLL_MESSAGE,
  interruptJob,
  isMissingJobError,
} from "../src/jobPolling.js";

test("une erreur réseau reste temporaire et annonce la reconnexion", () => {
  assert.equal(isMissingJobError(new TypeError("Failed to fetch")), false);
  assert.match(TRANSIENT_POLL_MESSAGE, /dernier reçu/);
  assert.match(TRANSIENT_POLL_MESSAGE, /Reconnexion automatique/);
});

test("une réponse 404 identifie un travail perdu par le serveur", () => {
  const error = new Error("Analyse introuvable");
  error.status = 404;
  assert.equal(isMissingJobError(error), true);
});

test("une analyse perdue devient interrompue sans étape encore active", () => {
  const job = {
    id: "job-meta",
    status: "running",
    stages: [
      { id: "data", status: "complete", detail: "Cours vérifié" },
      { id: "analysts", status: "active", detail: "Analyse locale" },
      { id: "debate", status: "pending", detail: "En attente" },
    ],
  };

  const interrupted = interruptJob(job);

  assert.equal(interrupted.status, "interrupted");
  assert.equal(interrupted.error, INTERRUPTED_JOB_MESSAGE);
  assert.equal(interrupted.stages[0].status, "complete");
  assert.equal(interrupted.stages[1].status, "error");
  assert.equal(interrupted.stages.some((stage) => stage.status === "active"), false);
});
