#!/usr/bin/env tsx
// Replaces or verifies the canonical telemetry preamble across every SKILL.md.
// Hand-edits to a single skill's preamble are forbidden by spec; this script is
// the only sanctioned writer. Run via:
//   pnpm tsx scripts/inject-preamble.ts                  # rewrite every skill
//   pnpm tsx scripts/inject-preamble.ts --check          # verify all match
//   pnpm tsx scripts/inject-preamble.ts skills/build/x   # rewrite one skill

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");
const SKILLS_ROOT = join(REPO_ROOT, "skills");
const PHASES = ["learn", "idea", "build", "ship", "grow"];

// Verbatim preamble template. Placeholders <skill-name>, <phase>, <version>
// are substituted per skill at write time. Mirror this with plans/05-SKILL-FORMAT.md
// when the spec changes; both must move in lock-step.
const PREAMBLE_TEMPLATE = `\`\`\`bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track <skill-name> <phase> completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track <skill-name> <phase> started >/dev/null 2>&1 &
true
\`\`\``;

interface SkillRef {
  path: string;
  name: string;
  phase: string;
}

function readPackageVersion(): string {
  const pkg = JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf8"));
  return pkg.version ?? "0.0.0";
}

function discoverSkills(): SkillRef[] {
  const refs: SkillRef[] = [];
  for (const phase of PHASES) {
    const phaseDir = join(SKILLS_ROOT, phase);
    let entries: string[];
    try {
      entries = readdirSync(phaseDir);
    } catch {
      continue;
    }
    for (const entry of entries) {
      const skillDir = join(phaseDir, entry);
      if (!statSync(skillDir).isDirectory()) continue;
      const skillFile = join(skillDir, "SKILL.md");
      try {
        statSync(skillFile);
      } catch {
        continue;
      }
      refs.push({ path: skillFile, name: entry, phase });
    }
  }
  return refs;
}

function skillRefFromPath(p: string): SkillRef {
  const abs = resolve(p);
  const skillFile = abs.endsWith("SKILL.md") ? abs : join(abs, "SKILL.md");
  const parts = skillFile.split(sep);
  // expect: .../skills/<phase>/<name>/SKILL.md
  const skillsIdx = parts.lastIndexOf("skills");
  if (skillsIdx < 0 || parts.length < skillsIdx + 4) {
    throw new Error(`cannot infer phase/name from path: ${p}`);
  }
  return {
    path: skillFile,
    phase: parts[skillsIdx + 1] ?? "",
    name: parts[skillsIdx + 2] ?? "",
  };
}

function renderPreamble(name: string, phase: string, version: string): string {
  return PREAMBLE_TEMPLATE
    .replaceAll("<skill-name>", name)
    .replaceAll("<phase>", phase)
    .replaceAll("<version>", version);
}

// Find the bash code block that follows the first "## Preamble" heading.
// Returns [start, end] indices into the source string covering the fenced block,
// or null if no preamble heading exists.
function findPreambleBlock(src: string): { start: number; end: number } | null {
  const headingMatch = src.match(/^##\s+Preamble[^\n]*\n/im);
  if (!headingMatch) return null;
  const headingEnd = headingMatch.index! + headingMatch[0].length;
  const after = src.slice(headingEnd);
  const fenceOpen = after.match(/^[\s\S]*?(```bash\n)/);
  if (!fenceOpen || fenceOpen[1] === undefined) return null;
  const blockStart = headingEnd + fenceOpen[0].length - fenceOpen[1].length;
  const closeIdx = src.indexOf("\n```", blockStart + fenceOpen[1].length);
  if (closeIdx < 0) return null;
  return { start: blockStart, end: closeIdx + 4 };
}

interface Result {
  ref: SkillRef;
  status: "ok" | "rewritten" | "missing" | "drift";
  detail?: string;
}

function processSkill(ref: SkillRef, version: string, check: boolean): Result {
  const src = readFileSync(ref.path, "utf8");
  const block = findPreambleBlock(src);
  const expected = renderPreamble(ref.name, ref.phase, version);

  if (!block) {
    return { ref, status: "missing", detail: "no ## Preamble heading or bash block" };
  }

  const current = src.slice(block.start, block.end);
  if (current === expected) {
    return { ref, status: "ok" };
  }

  if (check) {
    return { ref, status: "drift", detail: "preamble does not match canonical template" };
  }

  const rewritten = src.slice(0, block.start) + expected + src.slice(block.end);
  writeFileSync(ref.path, rewritten);
  return { ref, status: "rewritten" };
}

function main(): void {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  const targetArg = args.find((a) => !a.startsWith("--"));
  const version = readPackageVersion();

  let refs: SkillRef[];
  if (targetArg) {
    refs = [skillRefFromPath(targetArg)];
  } else {
    refs = discoverSkills();
  }

  if (refs.length === 0) {
    console.log("no SKILL.md files found yet, nothing to do");
    return;
  }

  const results = refs.map((ref) => processSkill(ref, version, check));
  const issues = results.filter((r) => r.status === "missing" || r.status === "drift");
  const rewritten = results.filter((r) => r.status === "rewritten");
  const ok = results.filter((r) => r.status === "ok");

  for (const r of results) {
    const rel = relative(REPO_ROOT, r.ref.path);
    if (r.status === "ok") {
      console.log(`ok       ${rel}`);
    } else if (r.status === "rewritten") {
      console.log(`wrote    ${rel}`);
    } else {
      console.log(`${r.status.padEnd(8)} ${rel} (${r.detail})`);
    }
  }

  console.log(
    `\nsummary: ${ok.length} ok, ${rewritten.length} rewritten, ${issues.length} issues`,
  );

  if (check && issues.length > 0) {
    process.exit(1);
  }
}

main();
