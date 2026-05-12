#!/usr/bin/env node
// Emits web/public/skills/index.json describing every shipped skill: id, phase,
// description from SKILL.md frontmatter, tarball URL, sha256, byte size, and
// the GitHub shorthand a user can pass to `npx skills add` for an a la carte
// install. Run after scripts/package-skills.sh so every tarball exists.
//   node scripts/generate-skills-index.mjs
// Exits non-zero if a skill folder lacks SKILL.md or a tarball.

import { createHash } from "node:crypto";
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CORE_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");
const REPO_ROOT = resolve(CORE_ROOT, "..");
const SKILLS_ROOT = join(CORE_ROOT, "skills");
const TARBALL_DIR = join(REPO_ROOT, "web", "public", "skills");
const INDEX_PATH = join(TARBALL_DIR, "index.json");
const APP_INDEX_PATH = join(REPO_ROOT, "web", "app", "data", "skills-index.json");
const PHASES = ["learn", "idea", "build", "ship", "grow"];

const PUBLISHER = "suiperpower";
const PUBLISHER_URL = "https://suiperpower.dev";
const TARBALL_BASE = "https://suiperpower.dev/skills";
const GH_REPO = "pivyme/suiperpower";
// Vercel's `skills` CLI takes either `owner/repo` shorthand (whole repo) or a
// full GitHub tree URL pointing at a subdirectory. To install a single skill
// we need the full URL form. See https://github.com/vercel-labs/skills.
const GH_TREE_BASE = `https://github.com/${GH_REPO}/tree/main/core/skills`;

function readPackageVersion() {
  const pkg = JSON.parse(readFileSync(join(CORE_ROOT, "package.json"), "utf8"));
  return pkg.version ?? "0.0.0";
}

function readFrontmatter(path) {
  const src = readFileSync(path, "utf8");
  if (!src.startsWith("---")) return {};
  const end = src.indexOf("\n---", 3);
  if (end < 0) return {};
  const block = src.slice(3, end).trim();
  const out = {};
  for (const line of block.split("\n")) {
    const m = /^([a-zA-Z_-]+):\s*(.*)$/.exec(line);
    if (m) out[m[1]] = m[2].trim();
  }
  return out;
}

function sha256OfFile(path) {
  const h = createHash("sha256");
  h.update(readFileSync(path));
  return h.digest("hex");
}

function listSkills() {
  const out = [];
  for (const phase of PHASES) {
    const phaseDir = join(SKILLS_ROOT, phase);
    let entries;
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

function main() {
  const version = readPackageVersion();
  const skills = listSkills();
  const entries = [];
  const errors = [];

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
      githubPath: `${GH_REPO}/core/skills/${skill.phase}/${skill.name}`,
      npxCmd: `npx skills add ${GH_TREE_BASE}/${skill.phase}/${skill.name}`,
      sha256: sha256OfFile(tarball),
      size: st.size,
      version,
    });
  }

  if (errors.length) {
    for (const err of errors) console.error(err);
    process.exit(1);
  }

  const index = {
    version: "0.1.0",
    generatedAt: new Date().toISOString(),
    publisher: PUBLISHER,
    publisherUrl: PUBLISHER_URL,
    totalSkills: entries.length,
    skills: entries,
  };

  const payload = JSON.stringify(index, null, 2) + "\n";
  writeFileSync(INDEX_PATH, payload);
  writeFileSync(APP_INDEX_PATH, payload);
  console.log(`wrote ${INDEX_PATH} with ${entries.length} entries`);
  console.log(`wrote ${APP_INDEX_PATH} with ${entries.length} entries`);
}

main();
