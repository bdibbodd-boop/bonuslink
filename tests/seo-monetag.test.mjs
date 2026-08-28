import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layout = await readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const adSlot = await readFile(new URL("../src/components/ad-slot.tsx", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../src/app/sitemap.ts", import.meta.url), "utf8");

test("le SEO utilise une URL de déploiement configurable", () => {
    assert.match(layout, /NEXT_PUBLIC_SITE_URL/);
    assert.match(layout, /openGraph/);
    assert.match(sitemap, /sitemap/);
});

test("les emplacements publicitaires sont préparés sans script tiers", () => {
    assert.match(adSlot, /data-ad-placement/);
    assert.match(adSlot, /public-home/);
    assert.doesNotMatch(adSlot, /monetag|script/i);
});
