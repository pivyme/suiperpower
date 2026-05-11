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

import { getPackageRoot } from "../cli/paths.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = getPackageRoot() || join(__dirname, "..");

interface Skill {
  name: string;
  phase: string;
  dir: string;
  skillMdPath: string;
}

interface SharedReference {
  rel: string;
  abs: string;
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

function listYamlKnowledge(skillDir: string): string[] {
  const yaml = join(skillDir, "agents", "openai.yaml");
  if (!existsSync(yaml)) return [];
  const raw = readFileSync(yaml, "utf8");
  const out: string[] = [];
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*-\s+((?:skills|cli)\/[^\s#]+)\s*$/);
    if (m) out.push(m[1]);
  }
  return out;
}

function listBodyKnowledge(body: string): string[] {
  const out = new Set<string>();
  const backtick = /`((?:skills|cli)\/[^`\s)]+)`/g;
  for (const m of body.matchAll(backtick)) out.add(m[1]);
  return [...out];
}

function resolveSharedReference(rel: string): SharedReference | null {
  const clean = rel.replace(/[.,;:]+$/, "");
  const abs = join(ROOT, clean);
  if (!existsSync(abs)) return null;
  try {
    if (!statSync(abs).isFile()) return null;
  } catch {
    return null;
  }
  return { rel: clean, abs };
}

function listSharedReferences(skill: Skill, body: string): SharedReference[] {
  const refs = new Map<string, SharedReference>();
  for (const rel of [...listBodyKnowledge(body), ...listYamlKnowledge(skill.dir)]) {
    const resolved = resolveSharedReference(rel);
    if (resolved) refs.set(resolved.rel, resolved);
  }
  return [...refs.values()].sort((a, b) => a.rel.localeCompare(b.rel));
}

function renderReferenceText(ref: SharedReference): string {
  const text = readFileSync(ref.abs, "utf8").trim();
  if (ref.rel.endsWith(".json")) {
    return `### ${ref.rel}\n\n\`\`\`json\n${text}\n\`\`\`\n`;
  }
  return `### ${ref.rel}\n\n${text}\n`;
}

export function renderMdc(skill: Skill): string {
  const content = readFileSync(skill.skillMdPath, "utf8");
  const { fm, body } = parseFrontmatter(content);
  const desc = fm.description ?? "";
  const refs = listReferences(skill.dir);
  const sharedRefs = listSharedReferences(skill, body);

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

  const sharedRefsBlock =
    sharedRefs.length === 0
      ? ""
      : "\n\n## Shared references (inlined)\n\n" + sharedRefs.map(renderReferenceText).join("\n");

  const escapedDesc = desc.replace(/\n/g, " ").trim();
  const front = ["---", `description: ${escapedDesc}`, "globs:", "alwaysApply: false", "---"].join(
    "\n",
  );
  return `${front}\n\n${body.trim()}${refsBlock}${sharedRefsBlock}\n`;
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
