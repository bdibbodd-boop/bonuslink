import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = await readFile(new URL("../supabase/migrations/0011_security_hardening.sql", import.meta.url), "utf8");

test("un compte suspendu ne peut pas qualifier ni demander un retrait", () => {
    assert.match(migration, /user_is_suspended/);
    assert.match(migration, /account suspended/);
    assert.match(migration, /or public\.user_is_suspended\(\)/);
});

test("le retrait reste atomique et idempotent via le ledger", () => {
    assert.match(migration, /for update/);
    assert.match(migration, /withdrawal:/);
    assert.match(migration, /balance = balance - amount_value/);
});
