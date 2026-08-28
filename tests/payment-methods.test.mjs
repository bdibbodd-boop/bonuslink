import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const route = await readFile(new URL("../src/app/api/payment-methods/route.ts", import.meta.url), "utf8");
const migration = await readFile(new URL("../supabase/migrations/0006_payment_methods_security.sql", import.meta.url), "utf8");

test("les méthodes de paiement sont validées côté serveur", () => {
    assert.match(route, /isPaymentProvider/);
    assert.match(route, /accountReference.*length < 4/);
    assert.match(route, /providerConnected: false/);
});

test("un moyen appartient toujours à la session courante", () => {
    assert.match(route, /user_id: user\.id/);
    assert.match(route, /eq\("user_id", user\.id\)/);
    assert.match(migration, /methods own insert/);
});

test("la vérification ne peut pas être modifiée par l'utilisateur", () => {
    assert.match(migration, /grant insert \(user_id, provider, account_reference\)/);
    assert.doesNotMatch(migration, /grant update/);
    assert.match(migration, /is_verified = false/);
});
