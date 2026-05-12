// Temporary script to merge all idea source files into sui-ideas.json
// Run: node core/scripts/merge-ideas.mjs
// Delete after use.

import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");
const ideasDir = join(__dirname, "..", "skills", "data", "ideas");
const outFile = join(__dirname, "..", "cli", "data", "sui-ideas.json");

const files = readdirSync(ideasDir).filter((f) => f.endsWith(".json"));
const allIdeas = [];
const sources = [];

for (const file of files) {
  const data = JSON.parse(readFileSync(join(ideasDir, file), "utf8"));
  sources.push(data.source);
  allIdeas.push(...data.ideas);
}

allIdeas.sort((a, b) => a.id.localeCompare(b.id));
sources.sort();

// Validate
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ids = allIdeas.map((i) => i.id);
const dupes = ids.filter((id, idx) => ids.indexOf(id) !== idx);
if (dupes.length > 0) {
  console.error("DUPLICATE IDS:", dupes);
  process.exit(1);
}
const bad = ids.filter((id) => !KEBAB.test(id));
if (bad.length > 0) {
  console.error("NON-KEBAB IDS:", bad);
  process.exit(1);
}

const result = {
  version: "0.1.0",
  generatedAt: "2026-05-11T00:00:00Z",
  sources,
  ideas: allIdeas,
};

writeFileSync(outFile, JSON.stringify(result, null, 2) + "\n");
console.log("Total ideas:", allIdeas.length);
console.log("Sources:", sources.join(", "));
console.log("Written to:", outFile);
