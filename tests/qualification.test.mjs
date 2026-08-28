import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const schema = await readFile(new URL("../supabase/migrations/0001_initial_schema.sql", import.meta.url), "utf8");
const business = await readFile(new URL("../supabase/migrations/0002_business_functions.sql", import.meta.url), "utf8");
const qualification = await readFile(new URL("../supabase/migrations/0003_qualification_workflow.sql", import.meta.url), "utf8");

test("le schema impose le referral unique et l'anti-auto-parrainage", () => {
    assert.match(schema, /referred_id uuid not null unique/);
    assert.match(schema, /check \(sponsor_id <> referred_id\)/);
});

test("la visite referral est dédupliquée et rate-limitée côté SQL", () => {
    assert.match(business, /interval '24 hours'/);
    assert.match(business, /interval '1 hour'/);
    assert.match(business, /track_referral_visit/);
});

test("le bonus de parrainage est idempotent via le ledger", () => {
    assert.match(business, /REFERRAL_BONUS/);
    assert.match(business, /'referral:' \|\| target_referral::text/);
    assert.match(business, /on conflict \(idempotency_key\) do nothing/);
});

test("la qualification exige session authentifiée, email et actions configurables", () => {
    assert.match(qualification, /request.jwt.claim.role/);
    assert.match(qualification, /email_confirmed_at is not null/);
    assert.match(qualification, /qualification_min_visits/);
    assert.match(qualification, /event_type = 'SIGNUP'/);
});

test("wallet et seuil de retrait restent protégés par le schéma", () => {
    assert.match(schema, /balance bigint not null default 0 check \(balance >= 0\)/);
    assert.match(schema, /amount bigint not null check \(amount >= 15000\)/);
    assert.match(business, /revoke all on function public.credit_reward/);
});

test("les tests d'intégration Supabase sont explicitement bloqués sans configuration", { skip: !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY }, () => {
    assert.ok(process.env.NEXT_PUBLIC_SUPABASE_URL);
});
