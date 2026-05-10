// Generate Cursor `.mdc` files from SKILL.md plus referenced files.
// Cursor inlines `references/` because it does not load files on demand.
//
// Run as a script:
//   tsx scripts/generate-cursor-rules.ts --out <dir>
//   tsx scripts/generate-cursor-rules.ts --check    # dry run, exit 1 on drift
//
// Importable for cli/init.ts to render at install time.

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

interface Skill {
  name: string;
  phase: string;
  dir: string;
  skillMdPath: string;
}

const VALID_PHASES = new Set(["learn", "idea", "build", "ship", "grow"]);

function listSkills(skillsRoot: string): Skill[] {
  const out: Skill[] = [];
  for (const phase of readdirSync(skillsRoot, { withFileTypes: true })) {
    if (!phase.isDirectory() || !VALID_PHASES.has(phase.name)) continue;
    const phaseDir = join(skillsRoot, phase.name);
    for (const sub of readdirSync(phaseDir, { withFileTypes: true })) {
      if (!sub.isDirectory()) continue;
      const skillDir = join(phaseDir, sub.name);
      const md = join(skillDir, "SKILL.md");
      if (!existsSync(md)) continue;
      out.push({ name: sub.name, phase: phase.name, dir: skillDir, skillMdPath: md });
    }
  }
  return out.sort((a, b) => a.name.localeCompare(b.name));
}

function parseFrontmatter(content: string): { fm: Record<string, string>; body: string } {
  const m = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { fm: {}, body: content };
  const fm: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
  }
  return { fm, body: m[2] };
}

function listReferences(skillDir: string): string[] {
  const refDir = join(skillDir, "references");
  if (!existsSync(refDir) || !statSync(refDir).isDirectory()) return [];
  return readdirSync(refDir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => join(refDir, f));
}

export function renderMdc(skill: Skill): string {
  const content = readFileSync(skill.skillMdPath, "utf8");
  const { fm, body } = parseFrontmatter(content);
  const desc = fm.description ?? "";
  const refs = listReferences(skill.dir);

  const refsBlock =
    refs.length === 0
      ? ""
      : "\n\n## References (inlined)\n\n" +
        refs
          .map((p) => {
            const name = relative(skill.dir, p);
            const text = readFileSync(p, "utf8");
            return `### ${name}\n\n${text.trim()}\n`;
          })
          .join("\n");

  const escapedDesc = desc.replace(/\n/g, " ").trim();
  const front = ["---", `description: ${escapedDesc}`, "globs:", "alwaysApply: false", "---"].join(
    "\n",
  );
  return `${front}\n\n${body.trim()}${refsBlock}\n`;
}

export function generateAll(skillsRoot: string, outDir: string): { written: string[] } {
  mkdirSync(outDir, { recursive: true });
  const skills = listSkills(skillsRoot);
  const written: string[] = [];
  for (const skill of skills) {
    const out = join(outDir, `${skill.name}.mdc`);
    writeFileSync(out, renderMdc(skill));
    written.push(out);
  }
  return { written };
}

export function checkAll(skillsRoot: string, outDir: string): { drift: string[] } {
  const skills = listSkills(skillsRoot);
  const drift: string[] = [];
  for (const skill of skills) {
    const out = join(outDir, `${skill.name}.mdc`);
    const expected = renderMdc(skill);
    if (!existsSync(out)) {
      drift.push(`${skill.name}: missing`);
      continue;
    }
    const actual = readFileSync(out, "utf8");
    if (actual !== expected) drift.push(`${skill.name}: drift`);
  }
  return { drift };
}

export function defaultSkillsRoot(): string {
  return join(ROOT, "skills");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const skillsRoot = defaultSkillsRoot();
  let outDir = join(ROOT, "build", "cursor");
  let check = false;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--out") outDir = args[++i];
    else if (a.startsWith("--out=")) outDir = a.slice("--out=".length);
    else if (a === "--check") check = true;
  }

  if (check) {
    const { drift } = checkAll(skillsRoot, outDir);
    if (drift.length === 0) {
      console.log(`cursor rules in sync (${outDir})`);
      return;
    }
    console.error(`cursor rules drift detected:`);
    for (const d of drift) console.error(`  ${d}`);
    process.exitCode = 1;
    return;
  }

  const { written } = generateAll(skillsRoot, outDir);
  console.log(`wrote ${written.length} .mdc files to ${outDir}`);
}

const invokedAsScript = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (invokedAsScript) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
