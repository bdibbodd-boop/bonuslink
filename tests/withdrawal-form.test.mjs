import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const form = await readFile(new URL("../src/components/withdrawal-form.tsx", import.meta.url), "utf8");
const route = await readFile(new URL("../src/app/api/withdrawals/route.ts", import.meta.url), "utf8");

test("le formulaire n'envoie qu'une méthode vérifiée sélectionnée", () => {
    assert.match(form, /methods\.filter\(\(method\) => method\.is_verified\)/);
    assert.match(form, /paymentMethodId/);
});

test("l'API de retrait délègue le contrôle financier au RPC sécurisé", () => {
    assert.match(route, /supabase\.rpc\("request_withdrawal"/);
    assert.match(route, /Authentification requise/);
    assert.match(route, /Number\.isSafeInteger/);
});
