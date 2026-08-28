import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../src/app/admin/page.tsx", import.meta.url), "utf8");
const migration = await readFile(new URL("../supabase/migrations/0008_admin_access.sql", import.meta.url), "utf8");
const operations = await readFile(new URL("../supabase/migrations/0009_admin_operations.sql", import.meta.url), "utf8");
const rlsFix = await readFile(new URL("../supabase/migrations/0012_admin_rls_recursion_fix.sql", import.meta.url), "utf8");

test("l'administration exige une session et une ligne admin", () => {
    assert.match(page, /auth\.getUser/);
    assert.match(page, /admin_users/);
    assert.match(page, /redirect\("\/dashboard"\)/);
});

test("les policies admin passent par is_admin", () => {
    assert.match(migration, /create or replace function public\.is_admin/);
    assert.match(migration, /public\.is_admin\(\)/);
    assert.match(migration, /admin settings all/);
});

test("le contrôle admin évite la récursion RLS", () => {
    assert.match(rlsFix, /security definer/);
    assert.match(rlsFix, /drop policy if exists "admin users read"/);
});

test("les actions admin sont atomiques, auditées et réservées au rôle admin", () => {
    assert.match(operations, /admin_update_withdrawal/);
    assert.match(operations, /if not public\.is_admin\(\)/);
    assert.match(operations, /insert into public\.audit_logs/);
    assert.match(operations, /'WITHDRAWAL_' \|\| next_status/);
    assert.match(operations, /withdrawal-reversal:/);
});

test("les paramètres métier sont validés et configurables via RPC", () => {
    assert.match(operations, /admin_set_setting/);
    assert.match(operations, /signup_bonus/);
    assert.match(operations, /qualification_min_visits/);
    assert.match(operations, /setting_value #>>/);
});
