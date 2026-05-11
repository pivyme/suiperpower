// `suiperpower search <query>` searches across skills + repos + mcps + ideas.
// `suiperpower ideas` (via runIdeas) is a focused ideas browser.
// Top results are grouped by source. Each result prints the right command to act on it.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { BRAND } from "./branding.js";
import { accent, bold, dim, muted } from "./colors.js";
import { detectPreferredAgentCli } from "./agent-cli.js";
import { searchAndPick, type PickItem } from "./interactive-universal.js";
import { getCliDataRoot, getSkillsRoot } from "./paths.js";

type Source = "skill" | "repo" | "mcp" | "idea";

interface Hit {
  source: Source;
  id: string;
  label: string;
  hint: string;
  meta: Record<string, unknown>;
}

function findCli(): string {
  return getCliDataRoot();
}

function loadJson<T>(rel: string): T | null {
  const root = findCli();
  if (!root) return null;
  const path = join(root, rel);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function loadSkills(): Hit[] {
  const skillsRoot = getSkillsRoot();
  if (!skillsRoot) return [];
  const out: Hit[] = [];
  for (const phase of readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!phase.isDirectory()) continue;
    const phaseDir = join(skillsRoot, phase.name);
    for (const sub of readdirSync(phaseDir, { withFileTypes: true })) {
      if (!sub.isDirectory()) continue;
      const md = join(phaseDir, sub.name, "SKILL.md");
      if (!existsSync(md)) continue;
      const fm = readFileSync(md, "utf8").match(/^---\n([\s\S]*?)\n---/);
      const desc = fm?.[1].match(/^description:\s*(.*)$/m)?.[1].replace(/^["'](.*)["']$/, "$1") ?? "";
      out.push({
        source: "skill",
        id: sub.name,
        label: sub.name,
        hint: `${phase.name} — ${desc.slice(0, 100)}`,
        meta: { phase: phase.name },
      });
    }
  }
  return out;
}

function loadRepos(): Hit[] {
  const data = loadJson<{ repos: { id: string; name: string; description: string; category: string; url: string; tags?: string[] }[] }>("clonable-repos.json");
  if (!data) return [];
  return data.repos.map((r) => ({
    source: "repo",
    id: r.id,
    label: r.name,
    hint: `${r.category} — ${r.description.slice(0, 100)}`,
    meta: { url: r.url, tags: r.tags },
  }));
}

function loadMcps(): Hit[] {
  const data = loadJson<{ mcps: { id: string; name: string; description: string; installCmd: string }[] }>("sui-mcps.json");
  if (!data) return [];
  return data.mcps.map((m) => ({
    source: "mcp",
    id: m.id,
    label: m.name,
    hint: m.description.slice(0, 120),
    meta: { installCmd: m.installCmd },
  }));
}

function loadIdeas(): Hit[] {
  const data = loadJson<{ ideas: { id: string; title: string; summary: string; source: string; category: string }[] }>("sui-ideas.json");
  if (!data) return [];
  return data.ideas.map((i) => ({
    source: "idea",
    id: i.id,
    label: i.title,
    hint: `${i.category} — ${i.summary.slice(0, 100)}`,
    meta: { idSource: i.source },
  }));
}

function score(hit: Hit, q: string): number {
  if (!q) return 0;
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean);
  const hay = `${hit.id} ${hit.label} ${hit.hint}`.toLowerCase();
  let s = 0;
  for (const t of tokens) {
    if (hay.includes(t)) s += 1;
    if (hit.label.toLowerCase().includes(t)) s += 1;
    if (hit.id.includes(t)) s += 2;
  }
  return s;
}

function actionFor(hit: Hit): string {
  const cli = detectPreferredAgentCli() ?? "claude";
  switch (hit.source) {
    case "skill":
      return `${cli} "/${hit.id}"`;
    case "repo":
      return `git clone ${(hit.meta as { url?: string }).url ?? ""}`;
    case "mcp":
      return `${(hit.meta as { installCmd?: string }).installCmd ?? ""}`;
    case "idea":
      return `${cli} "/validate-idea ${hit.label}"`;
  }
}

function renderHits(hits: Hit[]): void {
  const groups: Record<Source, Hit[]> = { skill: [], repo: [], mcp: [], idea: [] };
  for (const h of hits) groups[h.source].push(h);
  const order: { source: Source; label: string }[] = [
    { source: "skill", label: "skills" },
    { source: "repo", label: "repos" },
    { source: "mcp", label: "mcps" },
    { source: "idea", label: "ideas" },
  ];
  for (const { source, label } of order) {
    const list = groups[source];
    if (list.length === 0) continue;
    console.log("");
    console.log(`  ${bold(label)} ${dim(`(${list.length})`)}`);
    for (const h of list) {
      console.log(`    ${bold(h.label)} ${dim(`(${h.id})`)}`);
      console.log(`      ${muted(h.hint)}`);
      console.log(`      ${accent(actionFor(h))}`);
    }
  }
  console.log("");
}

function loadAll(): Hit[] {
  return [...loadSkills(), ...loadRepos(), ...loadMcps(), ...loadIdeas()];
}

export async function run(args: string[]): Promise<void> {
  const json = args.includes("--json");
  const agent = args.includes("--agent");
  const positional = args.filter((a) => !a.startsWith("--"));
  const q = positional.join(" ").trim();
  const all = loadAll();

  if (!q) {
    const items: PickItem[] = all.map((h) => ({
      id: `${h.source}:${h.id}`,
      label: `[${h.source}] ${h.label}`,
      hint: h.hint,
    }));
    const picked = await searchAndPick(items, {
      title: `${BRAND.PRODUCT_NAME} search`,
      subtitle: "everything",
    });
    if (!picked) return;
    const found = all.find((h) => `${h.source}:${h.id}` === picked.id);
    if (!found) return;
    console.log("");
    console.log(`  ${accent(actionFor(found))}`);
    console.log("");
    return;
  }

  const ranked = all
    .map((h) => ({ h, s: score(h, q) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 25)
    .map((x) => x.h);

  if (json) {
    process.stdout.write(JSON.stringify(ranked, null, 2) + "\n");
    return;
  }
  if (agent) {
    console.log(`${BRAND.PRODUCT_NAME} search "${q}" — ${ranked.length}`);
    for (const h of ranked) console.log(`- [${h.source}] ${h.id} | ${actionFor(h)}`);
    return;
  }

  if (ranked.length === 0) {
    console.log("");
    console.log(`  ${muted(`no matches for "${q}"`)}`);
    console.log("");
    return;
  }
  console.log("");
  console.log(`  ${bold(`${BRAND.PRODUCT_NAME} search`)} ${muted(`"${q}" — ${ranked.length}`)}`);
  renderHits(ranked);
}

export async function runIdeas(args: string[]): Promise<void> {
  const json = args.includes("--json");
  const agent = args.includes("--agent");
  const positional = args.filter((a) => !a.startsWith("--"));
  const q = positional.join(" ").trim();
  const all = loadIdeas();

  if (json) {
    process.stdout.write(JSON.stringify(all, null, 2) + "\n");
    return;
  }
  if (agent) {
    console.log(`${BRAND.PRODUCT_NAME} ideas — ${all.length}`);
    for (const h of all) console.log(`- ${h.id} | ${h.label}`);
    return;
  }

  let filtered = all;
  if (q) {
    filtered = all
      .map((h) => ({ h, s: score(h, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.h);
  }

  const items: PickItem[] = filtered.map((h) => ({
    id: h.id,
    label: h.label,
    hint: h.hint,
  }));

  const picked = await searchAndPick(items, {
    title: `${BRAND.PRODUCT_NAME} ideas`,
    subtitle: `${filtered.length} curated`,
  });
  if (!picked) return;
  const found = all.find((h) => h.id === picked.id);
  if (!found) return;
  console.log("");
  console.log(`  ${bold(found.label)}`);
  console.log(`  ${muted(found.hint)}`);
  console.log(`  ${accent(actionFor(found))}`);
  console.log("");
}
