#!/usr/bin/env tsx
// Emits web/public/skills/index.json describing every shipped skill: id, phase,
// description from SKILL.md frontmatter, tarball URL, sha256, byte size, and
// the GitHub shorthand a user can pass to `npx skills add` for an a la carte
// install. Run after scripts/package-skills.sh so every tarball exists.
//   pnpm tsx scripts/generate-skills-index.ts
// Exits non-zero if a skill folder lacks SKILL.md or a tarball.

import { readFileSync, writeFileSync, statSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CORE_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");
const REPO_ROOT = resolve(CORE_ROOT, "..");
const SKILLS_ROOT = join(CORE_ROOT, "skills");
const TARBALL_DIR = join(REPO_ROOT, "web", "public", "skills");
const INDEX_PATH = join(TARBALL_DIR, "index.json");
const PHASES = ["learn", "idea", "build", "ship", "grow"] as const;

const PUBLISHER = "suiperpower";
const PUBLISHER_URL = "https://suiperpower.dev";
const TARBALL_BASE = "https://suiperpower.dev/skills";
const GH_REPO = "kwekKwek/suiperpower";

type Phase = (typeof PHASES)[number];

interface IndexEntry {
  id: string;
  phase: Phase;
  description: string;
  tarballUrl: string;
  githubPath: string;
  npxCmd: string;
  sha256: string;
  size: number;
  version: string;
}

interface Index {
  version: string;
  generatedAt: string;
  publisher: string;
  publisherUrl: string;
  totalSkills: number;
  skills: IndexEntry[];
}

function readPackageVersion(): string {
  const pkg = JSON.parse(readFileSync(join(CORE_ROOT, "package.json"), "utf8"));
  return pkg.version ?? "0.0.0";
}

function readFrontmatter(path: string): { name?: string; description?: string } {
  const src = readFileSync(path, "utf8");
  if (!src.startsWith("---")) return {};
  const end = src.indexOf("\n---", 3);
  if (end < 0) return {};
  const block = src.slice(3, end).trim();
  const out: Record<string, string> = {};
  for (const line of block.split("\n")) {
    const m = /^([a-zA-Z_-]+):\s*(.*)$/.exec(line);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

function sha256OfFile(path: string): string {
  const h = createHash("sha256");
  h.update(readFileSync(path));
  return h.digest("hex");
}

function listSkills(): { phase: Phase; name: string; dir: string }[] {
  const out: { phase: Phase; name: string; dir: string }[] = [];
  for (const phase of PHASES) {
    const phaseDir = join(SKILLS_ROOT, phase);
    let entries: string[];
    try {
      entries = readdirSync(phaseDir);
    } catch {
      continue;
    }
    for (const name of entries) {
      const dir = join(phaseDir, name);
      let st;
      try {
        st = statSync(dir);
      } catch {
        continue;
      }
      if (!st.isDirectory()) continue;
      out.push({ phase, name, dir });
    }
  }
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

function main(): void {
  const version = readPackageVersion();
  const skills = listSkills();
  const entries: IndexEntry[] = [];
  const errors: string[] = [];

  for (const skill of skills) {
    const skillMd = join(skill.dir, "SKILL.md");
    try {
      statSync(skillMd);
    } catch {
      errors.push(`${skill.phase}/${skill.name}: missing SKILL.md`);
      continue;
    }
    const fm = readFrontmatter(skillMd);
    const tarball = join(TARBALL_DIR, `${skill.name}.tar.gz`);
    let st;
    try {
      st = statSync(tarball);
    } catch {
      errors.push(`${skill.name}: tarball missing, run scripts/package-skills.sh first`);
      continue;
    }
    entries.push({
      id: skill.name,
      phase: skill.phase,
      description: fm.description ?? "",
      tarballUrl: `${TARBALL_BASE}/${skill.name}.tar.gz`,
      githubPath: `${GH_REPO}/skills/${skill.phase}/${skill.name}`,
      npxCmd: `npx skills add ${GH_REPO}/skills/${skill.phase}/${skill.name}`,
      sha256: sha256OfFile(tarball),
      size: st.size,
      version,
    });
  }

  if (errors.length) {
    for (const err of errors) console.error(err);
    process.exit(1);
  }

  const index: Index = {
    version: "0.1.0",
    generatedAt: new Date().toISOString(),
    publisher: PUBLISHER,
    publisherUrl: PUBLISHER_URL,
    totalSkills: entries.length,
    skills: entries,
  };

  writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2) + "\n");
  console.log(`wrote ${INDEX_PATH} with ${entries.length} entries`);
}

main();
