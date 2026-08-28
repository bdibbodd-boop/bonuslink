import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const workflow = await readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
const gitignore = await readFile(new URL("../.gitignore", import.meta.url), "utf8");

test("la CI valide chaque push main sans dupliquer le déploiement Vercel", () => {
    assert.match(workflow, /branches: \[main\]/);
    assert.match(workflow, /npm ci/);
    assert.match(workflow, /npm run build/);
    assert.doesNotMatch(workflow, /VERCEL_TOKEN|vercel deploy/);
});

test("le modèle d'environnement est versionnable mais les secrets restent ignorés", () => {
    assert.match(gitignore, /\.env\*/);
    assert.match(gitignore, /!\.env\.example/);
});