#!/usr/bin/env tsx
// Regenerate .claude-plugin/marketplace.json at the repo root from the on-disk
// skill tree. Run after adding, removing, or renaming a skill so Claude Code
// users see the change after `/plugin install` or `/plugin update`.
//   pnpm tsx scripts/generate-marketplace.ts
// Exits non-zero if any skill folder is missing SKILL.md.

import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CORE_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");
const REPO_ROOT = resolve(CORE_ROOT, "..");
const SKILLS_ROOT = join(CORE_ROOT, "skills");
const MARKETPLACE_PATH = join(REPO_ROOT, ".claude-plugin", "marketplace.json");
const PHASES = ["learn", "idea", "build", "ship", "grow"] as const;

type Phase = (typeof PHASES)[number];

function readCoreVersion(): string {
  const pkg = JSON.parse(readFileSync(join(CORE_ROOT, "package.json"), "utf8")) as {
    version?: string;
  };
  return pkg.version ?? "0.0.0";
}

function listSkills(): { phase: Phase; name: string }[] {
  const out: { phase: Phase; name: string }[] = [];
  const errors: string[] = [];
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
      const skillMd = join(dir, "SKILL.md");
      try {
        statSync(skillMd);
      } catch {
        errors.push(`${phase}/${name}: missing SKILL.md`);
        continue;
      }
      out.push({ phase, name });
    }
  }
  if (errors.length) {
    for (const e of errors) console.error(e);
    process.exit(1);
  }
  // Sort by name for stable diffs.
  out.sort((a, b) => a.name.localeCompare(b.name));
  return out;
}

function main(): void {
  const version = readCoreVersion();
  const skills = listSkills();
  const skillPaths = skills.map((s) => `./skills/${s.phase}/${s.name}`);

  const marketplace = {
    name: "suiperpower",
    owner: {
      name: "Kelvin Adithya",
      email: "eternate17@gmail.com",
    },
    metadata: {
      description: "Build something meaningful, on Sui",
      version,
    },
    plugins: [
      {
        name: "suiper",
        description:
          "Skills, knowledge, and journeys for shipping production Sui products. Think. Build. Ship.",
        source: "./core",
        strict: false,
        skills: skillPaths,
      },
    ],
  };

  mkdirSync(dirname(MARKETPLACE_PATH), { recursive: true });
  writeFileSync(MARKETPLACE_PATH, JSON.stringify(marketplace, null, 2) + "\n");
  console.log(`wrote ${MARKETPLACE_PATH} with ${skills.length} skills`);
}

main();
