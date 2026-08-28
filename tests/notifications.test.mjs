import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const route = await readFile(new URL("../src/app/api/notifications/read/route.ts", import.meta.url), "utf8");
const migration = await readFile(new URL("../supabase/migrations/0005_notifications.sql", import.meta.url), "utf8");
const qualification = await readFile(new URL("../supabase/migrations/0003_qualification_workflow.sql", import.meta.url), "utf8");

test("la lecture d'une notification exige une session et l'utilisateur propriétaire", () => {
    assert.match(route, /Authentification requise/);
    assert.match(route, /eq\("user_id", user\.id\)/);
});

test("la notification est marquée lue côté serveur", () => {
    assert.match(route, /update\(\{ read_at:/);
    assert.match(migration, /notifications own update/);
});

test("la qualification crée les notifications après la récompense", () => {
    assert.match(qualification, /if reward_created then/);
    assert.match(qualification, /Un filleul est qualifié/);
    assert.match(qualification, /Qualification confirmée/);
});
