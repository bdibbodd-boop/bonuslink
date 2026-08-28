import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = await readFile(new URL("../supabase/migrations/0004_wallet_withdrawal_ledger.sql", import.meta.url), "utf8");

test("le débit de retrait est atomique et vérifie le solde", () => {
    assert.match(migration, /select balance into current_balance.*for update/);
    assert.match(migration, /current_balance < amount_value/);
    assert.match(migration, /balance = balance - amount_value/);
});

test("un retrait exige un moyen vérifié et une demande unique", () => {
    assert.match(migration, /is_verified = true/);
    assert.match(migration, /status in \('PENDING','PROCESSING','APPROVED'\)/);
    assert.match(migration, /minimum withdrawal not reached/);
});

test("le retrait est inscrit dans le ledger avec un montant négatif", () => {
    assert.match(migration, /'WITHDRAWAL'/);
    assert.match(migration, /-amount_value/);
    assert.match(migration, /withdrawal:/);
});
