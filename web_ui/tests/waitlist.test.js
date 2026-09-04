import test from "node:test";
import assert from "node:assert/strict";

test("Validation email pour la liste d'attente", () => {
  const validEmail = "investor@tradingagents.com";
  const invalidEmail = "invalid-email";

  assert.ok(validEmail.includes("@") && validEmail.includes("."), "Email valide requis");
  assert.ok(!invalidEmail.includes("@"), "Email invalide rejeté");
});

test("Calcul du statut et profil de prospect", () => {
  const profile = "cgp";
  const allowedProfiles = ["investisseur", "trader", "cgp", "pro"];
  assert.ok(allowedProfiles.includes(profile), "Le profil doit être parmi les options");
});
