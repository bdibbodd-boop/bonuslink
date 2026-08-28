import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = await readFile(new URL("../supabase/migrations/0007_fraud_signals.sql", import.meta.url), "utf8");

test("un dépassement de rate limit crée un signal de fraude côté SQL", () => {
    assert.match(migration, /REFERRAL_RATE_LIMIT/);
    assert.match(migration, /insert into public\.fraud_events/);
    assert.match(migration, /interval '1 hour'/);
});

test("les événements de fraude ne sont pas écrivable par un utilisateur", () => {
    assert.match(migration, /revoke all on public\.fraud_events from authenticated/);
    assert.match(migration, /fraud own read/);
    assert.doesNotMatch(migration, /grant insert.*fraud_events/);
});
