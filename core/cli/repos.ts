// `suiperpower repos` reads cli/data/clonable-repos.json and renders a TUI list.
// Filterable by category and tag. Selecting a row prints the clone command and details.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { BRAND } from "./branding.js";
import { accent, bold, dim, muted } from "./colors.js";
import { getCliDataRoot } from "./paths.js";

interface Repo {
  id: string;
  name: string;
  owner: string;
  url: string;
  description: string;
  category: string;
  tags: string[];
  license: string;
  official: boolean;
  stars: number;
  lastChecked: string;
}

interface Catalog {
  version: string;
  generatedAt: string;
  repos: Repo[];
}

function findCatalog(): string {
  const path = join(getCliDataRoot(), "clonable-repos.json");
  return existsSync(path) ? path : "";
}

function loadRepos(): Repo[] {
  const path = findCatalog();
  if (!path) return [];
  try {
    return (JSON.parse(readFileSync(path, "utf8")) as Catalog).repos ?? [];
  } catch {
    return [];
  }
}

function parseFilter(args: string[]): {
  category: string | null;
  query: string | null;
  json: boolean;
  agent: boolean;
} {
  let category: string | null = null;
  let query: string | null = null;
  let json = false;
  let agent = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--category" || a === "-c") category = (args[++i] || "").toLowerCase();
    else if (a.startsWith("--category=")) category = a.slice("--category=".length).toLowerCase();
    else if (a === "--json") json = true;
    else if (a === "--agent") agent = true;
    else if (!a.startsWith("--") && !query) query = a.toLowerCase();
  }
  return { category, query, json, agent };
}

function matchRepo(r: Repo, q: string): boolean {
  const hay = [r.name, r.id, r.owner, r.description, r.category, ...(r.tags ?? [])]
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

export async function run(args: string[]): Promise<void> {
  const { category, query, json, agent } = parseFilter(args);
  const all = loadRepos();
  let filtered = all;
  if (category) filtered = filtered.filter((r) => r.category === category);
  if (query) filtered = filtered.filter((r) => matchRepo(r, query));

  if (json) {
    process.stdout.write(JSON.stringify(filtered, null, 2) + "\n");
    return;
  }

  if (agent) {
    console.log(`${BRAND.PRODUCT_NAME} repos — ${filtered.length}/${all.length}`);
    for (const r of filtered) {
      console.log(`- ${r.id} | ${r.category} | ${r.url}`);
    }
    return;
  }

  console.log("");
  console.log(`  ${bold(`${BRAND.PRODUCT_NAME} repos`)} ${muted(`${filtered.length}/${all.length}`)}`);
  if (category) console.log(`  ${muted("category:")} ${category}`);
  if (query) console.log(`  ${muted("query:")} ${query}`);
  console.log("");
  if (filtered.length === 0) {
    console.log(`  ${dim("no repos match")}`);
    console.log("");
    return;
  }
  for (const r of filtered) {
    const tag = r.official ? accent("official") : muted(r.category);
    console.log(`  ${bold(r.name)} ${dim(`(${r.id})`)}  ${tag}`);
    console.log(`    ${r.description}`);
    console.log(`    ${muted(r.url)}`);
    console.log("");
  }
}
