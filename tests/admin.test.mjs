import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../src/app/admin/page.tsx", import.meta.url), "utf8");
const migration = await readFile(new URL("../supabase/migrations/0008_admin_access.sql", import.meta.url), "utf8");

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
