// `suiperpower init` writes skills to ~/.claude/skills, ~/.codex/skills, ~/.cursor/rules.
// `--vendor` writes to <project>/.claude/skills/suiperpower etc instead.
// All writes are tracked in ~/.suiperpower/skills-installed.json so `update` and `uninstall`
// only touch files we own.

import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { BRAND } from "./branding.js";
import { accent, bold, dim, muted, ok } from "./colors.js";
import { detectAgentCliPaths } from "./agent-cli.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface SkillEntry {
  phase: string;
  name: string;
  srcDir: string;
}

interface Manifest {
  version: string;
  installedAt: string;
  vendor: boolean;
  files: string[];
  skills: { name: string; phase: string }[];
}

const VALID_PHASES = new Set(["learn", "idea", "build", "ship", "grow"]);

// Resolve skills root: works in dev (cli/ next to skills/) and in dist (dist/cli/ → ../../skills/).
function getSkillsRoot(): string {
  const dev = join(__dirname, "..", "skills");
  if (existsSync(dev)) return dev;
  const built = join(__dirname, "..", "..", "skills");
  if (existsSync(built)) return built;
  throw new Error("skills/ directory not found");
}

function getSkillsDataRoot(): string {
  return join(getSkillsRoot(), "data");
}

function getCliDataRoot(): string {
  // dev: cli/data/, dist: dist/cli/data/ or sibling
  const dev = join(__dirname, "data");
  if (existsSync(dev)) return dev;
  const root = join(__dirname, "..", "cli", "data");
  if (existsSync(root)) return root;
  return "";
}

function discoverSkills(): SkillEntry[] {
  const root = getSkillsRoot();
  const skills: SkillEntry[] = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || !VALID_PHASES.has(entry.name)) continue;
    const phaseDir = join(root, entry.name);
    for (const sub of readdirSync(phaseDir, { withFileTypes: true })) {
      if (sub.isDirectory() && existsSync(join(phaseDir, sub.name, "SKILL.md"))) {
        skills.push({ phase: entry.name, name: sub.name, srcDir: join(phaseDir, sub.name) });
      }
    }
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

function homeConfigDir(): string {
  return join(homedir(), BRAND.CONFIG_DIR);
}

function manifestPath(vendor: boolean): string {
  if (vendor) return join(detectProjectRoot(), BRAND.CONFIG_DIR, "skills-installed.json");
  return join(homeConfigDir(), "skills-installed.json");
}

function detectProjectRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    if (
      existsSync(join(dir, ".git")) ||
      existsSync(join(dir, "package.json")) ||
      existsSync(join(dir, "Move.toml"))
    ) {
      return dir;
    }
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

function targetDirs(vendor: boolean): { claude: string; codex: string; cursor: string } {
  if (vendor) {
    const root = detectProjectRoot();
    return {
      claude: join(root, ".claude", "skills", "suiperpower"),
      codex: join(root, ".codex", "skills", "suiperpower"),
      cursor: join(root, ".cursor", "rules", "suiperpower"),
    };
  }
  return {
    claude: join(homedir(), ".claude", "skills"),
    codex: join(homedir(), ".codex", "skills"),
    cursor: join(homedir(), ".cursor", "rules"),
  };
}

function copySkillToClaudeOrCodex(skill: SkillEntry, dest: string): string[] {
  mkdirSync(dest, { recursive: true });
  const written: string[] = [];
  cpSync(skill.srcDir, dest, {
    recursive: true,
    filter: (src) => {
      // Skip generated artifacts the skill might leave behind.
      const base = src.split("/").pop() ?? "";
      if (base === ".DS_Store") return false;
      if (base.startsWith("generated-")) return false;
      return true;
    },
  });
  walk(dest, (f) => written.push(f));
  return written;
}

function renderCursorMdc(skill: SkillEntry, destDir: string): string[] {
  // Phase 23 will swap this out for scripts/generate-cursor-rules.ts that
  // inlines references/. For Phase 20 we ship a minimal valid .mdc that
  // contains the SKILL.md content so Cursor users see it immediately.
  mkdirSync(destDir, { recursive: true });
  const skillMd = readFileSync(join(skill.srcDir, "SKILL.md"), "utf8");
  const out = join(destDir, `${skill.name}.mdc`);
  writeFileSync(out, skillMd);
  return [out];
}

function walk(dir: string, fn: (file: string) => void): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, fn);
    else fn(full);
  }
}

function copySharedData(targets: string[]): string[] {
  // Skills reference ../../data/* paths. Mirror skills/data into each agent dir
  // so those paths resolve regardless of installation root.
  const dataRoot = getSkillsDataRoot();
  const cliData = getCliDataRoot();
  const written: string[] = [];
  for (const target of targets) {
    const dest = join(target, "data");
    if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
    mkdirSync(dest, { recursive: true });
    if (existsSync(dataRoot)) {
      cpSync(dataRoot, dest, { recursive: true });
    }
    if (cliData) {
      const catalogDest = join(dest, "catalogs");
      mkdirSync(catalogDest, { recursive: true });
      for (const f of readdirSync(cliData)) {
        if (f.endsWith(".json")) cpSync(join(cliData, f), join(catalogDest, f));
      }
    }
    walk(dest, (f) => written.push(f));
  }
  return written;
}

function writeConfig(convexUrl: string | undefined): void {
  const dir = homeConfigDir();
  mkdirSync(dir, { recursive: true });
  const cfgPath = join(dir, "config.json");
  let cfg: Record<string, unknown> = {};
  if (existsSync(cfgPath)) {
    try {
      cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
    } catch {
      cfg = {};
    }
  }
  if (convexUrl) cfg.convexUrl = convexUrl;
  if (!cfg.telemetryTier) cfg.telemetryTier = "anonymous";
  if (!cfg.installedAt) cfg.installedAt = new Date().toISOString();
  cfg.version = readPackageVersion();
  writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
}

function readPackageVersion(): string {
  try {
    const p = JSON.parse(
      readFileSync(join(__dirname, "..", "..", "package.json"), "utf8"),
    ) as { version?: string };
    return p.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}

function parseFlags(args: string[]): {
  vendor: boolean;
  agent: boolean;
  convexUrl: string | undefined;
} {
  let vendor = false;
  let agent = false;
  let convexUrl: string | undefined;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--vendor") vendor = true;
    else if (a === "--agent") agent = true;
    else if (a === "--convex-url") convexUrl = args[++i];
    else if (a.startsWith("--convex-url=")) convexUrl = a.slice("--convex-url=".length);
  }
  return { vendor, agent, convexUrl };
}

export async function run(args: string[]): Promise<void> {
  const { vendor, agent, convexUrl } = parseFlags(args);
  const skills = discoverSkills();
  const targets = targetDirs(vendor);
  mkdirSync(targets.claude, { recursive: true });
  mkdirSync(targets.codex, { recursive: true });
  mkdirSync(targets.cursor, { recursive: true });

  const allWritten: string[] = [];
  const installed: string[] = [];

  for (const skill of skills) {
    const claudeDest = join(targets.claude, skill.name);
    const codexDest = join(targets.codex, skill.name);
    if (existsSync(claudeDest)) rmSync(claudeDest, { recursive: true, force: true });
    if (existsSync(codexDest)) rmSync(codexDest, { recursive: true, force: true });
    allWritten.push(...copySkillToClaudeOrCodex(skill, claudeDest));
    allWritten.push(...copySkillToClaudeOrCodex(skill, codexDest));
    allWritten.push(...renderCursorMdc(skill, targets.cursor));
    installed.push(skill.name);
  }

  allWritten.push(...copySharedData([targets.claude, targets.codex]));

  if (!vendor) writeConfig(convexUrl);

  const manifest: Manifest = {
    version: readPackageVersion(),
    installedAt: new Date().toISOString(),
    vendor,
    files: allWritten,
    skills: skills.map((s) => ({ name: s.name, phase: s.phase })),
  };
  const mPath = manifestPath(vendor);
  mkdirSync(dirname(mPath), { recursive: true });
  writeFileSync(mPath, JSON.stringify(manifest, null, 2));

  // Best-effort: install Claude Code or Codex if neither is present and we are interactive.
  if (!vendor && !agent && process.stdout.isTTY) {
    const have = detectAgentCliPaths();
    if (!have.claude && !have.codex) {
      // We do not auto-install; just print guidance. The install.sh script handles agent install.
    }
  }

  if (agent) {
    console.log(`${BRAND.PRODUCT_NAME} init — ${installed.length} skills (${vendor ? "vendor" : "global"})`);
    for (const s of installed) console.log(`  + ${s}`);
    console.log(`manifest: ${mPath}`);
    return;
  }

  console.log("");
  console.log(`  ${bold(`${BRAND.PRODUCT_NAME} init`)} ${muted(vendor ? "(vendor)" : "(global)")}`);
  console.log("");
  console.log(`  ${ok(`${installed.length} skills installed`)}`);
  console.log(`  ${dim(targets.claude)} ${muted("(Claude Code)")}`);
  console.log(`  ${dim(targets.codex)} ${muted("(Codex)")}`);
  console.log(`  ${dim(targets.cursor)} ${muted("(Cursor)")}`);
  console.log("");
  console.log(`  ${muted("manifest:")} ${mPath}`);
  console.log("");
  if (!vendor) {
    console.log(`  ${muted("next:")} ${accent(`${BRAND.PRODUCT_NAME} doctor`)}`);
    console.log("");
  }
}

// Re-export helpers for `update` and `uninstall` to share manifest logic.
export { manifestPath, homeConfigDir, readPackageVersion, targetDirs, detectProjectRoot };
