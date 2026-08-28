import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const migration = await readFile(new URL("../supabase/migrations/0010_campaigns_analytics.sql", import.meta.url), "utf8");
const route = await readFile(new URL("../src/app/api/admin/route.ts", import.meta.url), "utf8");

test("les campagnes sont modifiables uniquement par RPC admin et auditées", () => {
    assert.match(migration, /admin_upsert_campaign/);
    assert.match(migration, /if not public\.is_admin\(\)/);
    assert.match(migration, /CAMPAIGN_UPDATED/);
});

test("les analytics sont des agrégats SQL protégés", () => {
    assert.match(migration, /admin_analytics/);
    assert.match(migration, /qualified_referrals/);
    assert.match(migration, /paid_withdrawal_amount/);
    assert.match(migration, /grant execute on function public\.admin_analytics\(\) to authenticated/);
});

test("l'API admin valide la campagne avant son RPC", () => {
    assert.match(route, /body\.action === "campaign"/);
    assert.match(route, /admin_upsert_campaign/);
    assert.match(route, /typeof body\.active !== "boolean"/);
});
