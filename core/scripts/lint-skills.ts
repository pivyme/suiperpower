#!/usr/bin/env tsx
// Lints every SKILL.md against plans/05-SKILL-FORMAT.md and plans/15-BRAND.md.
// Hard-fails on: missing frontmatter, name != folder, missing required sections,
// em-dashes, banned brand words. Warns on: short descriptions, missing trigger
// phrase coverage, lowercase Sui terms outside code blocks. Exit 0 only if no
// errors. Warnings print but do not fail. Run via:
//   pnpm tsx scripts/lint-skills.ts          # check every skill
//   pnpm tsx scripts/lint-skills.ts --warn   # also fail on warnings

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");
const SKILLS_ROOT = join(REPO_ROOT, "skills");
const PHASES = ["learn", "idea", "build", "ship", "grow"] as const;

const REQUIRED_SECTIONS = [
  "## Preamble",
  "## What this skill does",
  "## When to use it",
  "## When NOT to use it",
  "## Inputs",
  "## Outputs",
  "## Workflow",
  "## References",
];

const BANNED_WORDS = [
  "leverage",
  "leveraging",
  "leverages",
  "cutting-edge",
  "cutting edge",
  "world-class",
  "world class",
  "revolutionary",
  "AI-powered",
  "AI powered",
  "Web3",
];

const LOWER_SUI_TERMS: Record<string, string> = {
  ptb: "PTB",
  walrus: "Walrus",
  deepbook: "DeepBook",
  scallop: "Scallop",
  kiosk: "Kiosk",
  zklogin: "zkLogin",
};

type Issue = {
  file: string;
  line: number;
  level: "error" | "warn";
  message: string;
};

function parseFrontmatter(src: string): { fm: Record<string, string>; bodyOffset: number } {
  if (!src.startsWith("---\n") && !src.startsWith("---\r\n")) {
    return { fm: {}, bodyOffset: 0 };
  }
  const end = src.indexOf("\n---", 4);
  if (end < 0) return { fm: {}, bodyOffset: 0 };
  const block = src.slice(4, end);
  const fm: Record<string, string> = {};
  for (const raw of block.split("\n")) {
    const m = /^([a-zA-Z_-]+):\s*(.*)$/.exec(raw);
    if (m) fm[m[1]] = m[2].trim();
  }
  const after = src.indexOf("\n", end + 4);
  return { fm, bodyOffset: after >= 0 ? after + 1 : src.length };
}

function listSkills(): { phase: string; name: string; dir: string; skillMd: string }[] {
  const out: { phase: string; name: string; dir: string; skillMd: string }[] = [];
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
      out.push({ phase, name, dir, skillMd: join(dir, "SKILL.md") });
    }
  }
  return out;
}

function stripCodeAndUrls(line: string): string {
  return line.replace(/`[^`]*`/g, "").replace(/https?:\/\/\S+/g, "");
}

function scanBody(file: string, body: string, issues: Issue[]): void {
  const lines = body.split("\n");
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (raw.trim().startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const lineNo = i + 1;
    const _lower = raw.toLowerCase();

    if (raw.includes("—") || raw.includes("–")) {
      issues.push({
        file,
        line: lineNo,
        level: "error",
        message: "em-dash or en-dash forbidden, use comma or period",
      });
    }

    for (const word of BANNED_WORDS) {
      const w = word.toLowerCase();
      // Word-boundary match. Multi-word phrases ("cutting edge") match as a substring.
      const re =
        w.includes(" ") || w.includes("-")
          ? new RegExp(w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i")
          : new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (re.test(raw)) {
        issues.push({ file, line: lineNo, level: "error", message: `banned word "${word}"` });
      }
    }

    const stripped = stripCodeAndUrls(raw);
    const stripLower = stripped.toLowerCase();
    for (const [term, canonical] of Object.entries(LOWER_SUI_TERMS)) {
      const re = new RegExp(`\\b${term}\\b`, "g");
      if (re.test(stripLower)) {
        const reCanonical = new RegExp(`\\b${canonical}\\b`);
        if (!reCanonical.test(stripped)) {
          issues.push({
            file,
            line: lineNo,
            level: "warn",
            message: `Sui term "${term}" should be "${canonical}"`,
          });
        }
      }
    }
  }
}

function lintSkill(s: { phase: string; name: string; dir: string; skillMd: string }): Issue[] {
  const issues: Issue[] = [];
  let src: string;
  try {
    src = readFileSync(s.skillMd, "utf8");
  } catch {
    issues.push({
      file: s.skillMd,
      line: 0,
      level: "error",
      message: "SKILL.md missing or unreadable",
    });
    return issues;
  }

  const { fm, bodyOffset } = parseFrontmatter(src);

  if (!fm.name) {
    issues.push({ file: s.skillMd, line: 1, level: "error", message: "frontmatter missing name" });
  } else if (fm.name !== s.name) {
    issues.push({
      file: s.skillMd,
      line: 1,
      level: "error",
      message: `frontmatter name "${fm.name}" != folder "${s.name}"`,
    });
  }

  if (!fm.description) {
    issues.push({
      file: s.skillMd,
      line: 1,
      level: "error",
      message: "frontmatter missing description",
    });
  } else {
    if (fm.description.length < 80) {
      issues.push({
        file: s.skillMd,
        line: 1,
        level: "warn",
        message: `description shorter than 80 chars (${fm.description.length})`,
      });
    }
    if (!/use when/i.test(fm.description)) {
      issues.push({
        file: s.skillMd,
        line: 1,
        level: "warn",
        message: 'description missing "Use when ..." trigger phrase block',
      });
    }
  }

  const body = src.slice(bodyOffset);
  for (const section of REQUIRED_SECTIONS) {
    // Match a heading line that starts with the required prefix (allows
    // trailing annotations like "## Preamble (run first)").
    const re = new RegExp(`^${section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\b|\\s|$)`, "m");
    if (!re.test(body)) {
      issues.push({
        file: s.skillMd,
        line: 0,
        level: "error",
        message: `missing required section: ${section}`,
      });
    }
  }

  scanBody(s.skillMd, body, issues);

  if (!body.includes("skills/SKILL_ROUTER.md")) {
    issues.push({
      file: s.skillMd,
      line: 0,
      level: "error",
      message: "missing handoff line referencing skills/SKILL_ROUTER.md",
    });
  }

  const openaiYaml = join(s.dir, "agents", "openai.yaml");
  try {
    const raw = readFileSync(openaiYaml, "utf8");
    if (
      fm.description &&
      !raw.includes(fm.description.slice(0, Math.min(60, fm.description.length)))
    ) {
      issues.push({
        file: openaiYaml,
        line: 0,
        level: "warn",
        message: "openai.yaml description does not echo the frontmatter description",
      });
    }
  } catch {
    issues.push({
      file: openaiYaml,
      line: 0,
      level: "error",
      message: "agents/openai.yaml missing",
    });
  }

  return issues;
}

function main(): void {
  const failOnWarn = process.argv.includes("--warn");
  const skills = listSkills();
  const all: Issue[] = [];
  for (const s of skills) {
    all.push(...lintSkill(s));
  }

  const errors = all.filter((i) => i.level === "error");
  const warns = all.filter((i) => i.level === "warn");

  for (const i of all) {
    const tag = i.level === "error" ? "error" : "warn";
    const rel = i.file.replace(REPO_ROOT + "/", "");
    console.log(`${tag} ${rel}:${i.line}  ${i.message}`);
  }

  console.log(
    `\nlinted ${skills.length} skills, ${errors.length} errors, ${warns.length} warnings`,
  );
  if (errors.length > 0 || (failOnWarn && warns.length > 0)) {
    process.exit(1);
  }
}

main();
