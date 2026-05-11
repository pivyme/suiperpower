// `suiperpower init` writes Codex skills and Cursor rules globally.
// Claude Code uses the plugin marketplace globally and vendor-mode flat copies.
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

import { BRAND } from "./branding.js";
import { accent, bold, dim, muted, ok } from "./colors.js";
import { detectAgentCliPaths } from "./agent-cli.js";
import { getCliDataRoot, getSkillsRoot, readPackageVersion } from "./paths.js";
import { renderMdc as renderCursorRule } from "../scripts/generate-cursor-rules.js";
import { track } from "./telemetry.js";

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

function getSkillsDataRoot(): string {
  return join(getSkillsRoot(), "data");
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

function copySkillToClaudeOrCodex(skill: SkillEntry, dest: string, rewriteCodexYaml: boolean): string[] {
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
  if (rewriteCodexYaml) rewriteOpenAiYamlForInstalledLayout(dest);
  walk(dest, (f) => written.push(f));
  return written;
}

function rewriteOpenAiYamlForInstalledLayout(skillDest: string): void {
  const yamlPath = join(skillDest, "agents", "openai.yaml");
  if (!existsSync(yamlPath)) return;
  const raw = readFileSync(yamlPath, "utf8");
  const rewritten = raw
    .replace(/^(\s*-\s+)skills\//gm, "$1../../skills/")
    .replace(/^(\s*-\s+)cli\//gm, "$1../../cli/");
  if (rewritten !== raw) writeFileSync(yamlPath, rewritten);
}

function renderCursorMdc(skill: SkillEntry, destDir: string): string[] {
  // Use the renderer in scripts/generate-cursor-rules.ts so init and the
  // standalone generator stay byte-identical.
  mkdirSync(destDir, { recursive: true });
  const out = join(destDir, `${skill.name}.mdc`);
  writeFileSync(
    out,
    renderCursorRule({
      name: skill.name,
      phase: skill.phase,
      dir: skill.srcDir,
      skillMdPath: join(skill.srcDir, "SKILL.md"),
    }),
  );
  return [out];
}

function walk(dir: string, fn: (file: string) => void): void {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, fn);
    else fn(full);
  }
}

function copyDirFresh(src: string, dest: string, written: string[]): void {
  if (!existsSync(src)) return;
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  mkdirSync(dirname(dest), { recursive: true });
  cpSync(src, dest, {
    recursive: true,
    filter: (p) => {
      const base = p.split("/").pop() ?? "";
      return base !== ".DS_Store";
    },
  });
  walk(dest, (f) => written.push(f));
}

function copySharedKnowledge(targets: string[]): string[] {
  // Keep both the canonical source-tree paths (`skills/data/*`, `cli/data/*`)
  // and the older root `data/*` mirror available. Skills mention the canonical
  // paths in prose, while installed Codex YAML is rewritten to `../../skills/*`.
  const dataRoot = getSkillsDataRoot();
  const cliData = getCliDataRoot();
  const skillsRoot = getSkillsRoot();
  const written: string[] = [];
  for (const target of targets) {
    copyDirFresh(skillsRoot, join(target, "skills"), written);
    if (cliData) copyDirFresh(cliData, join(target, "cli", "data"), written);

    const legacyDest = join(target, "data");
    copyDirFresh(dataRoot, legacyDest, written);
    if (cliData) {
      const catalogDest = join(legacyDest, "catalogs");
      mkdirSync(catalogDest, { recursive: true });
      for (const f of readdirSync(cliData)) {
        if (f.endsWith(".json")) cpSync(join(cliData, f), join(catalogDest, f));
      }
      walk(catalogDest, (f) => written.push(f));
    }
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
  // Resolve URL: explicit flag > env > existing config. Once written, the bash
  // preamble in every SKILL.md can find it without the user passing flags.
  const resolved =
    convexUrl ||
    process.env.SUIPERPOWER_CONVEX_URL ||
    process.env.NEXT_PUBLIC_CONVEX_URL ||
    (cfg.convexUrl as string | undefined);
  if (resolved) cfg.convexUrl = resolved;
  if (!cfg.telemetryTier) cfg.telemetryTier = "anonymous";
  if (!cfg.installedAt) cfg.installedAt = new Date().toISOString();
  cfg.version = readPackageVersion();
  writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
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

// Older versions installed skills flat into ~/.claude/skills/. We now ship those
// via the plugin marketplace, so those flat copies are orphaned and would
// double-trigger alongside the namespaced /suiper:* versions. On a global init,
// remove any previously-tracked files that lived under ~/.claude/skills/.
function cleanupLegacyGlobalClaudeFiles(): number {
  const mPath = manifestPath(false);
  if (!existsSync(mPath)) return 0;
  let manifest: Manifest;
  try {
    manifest = JSON.parse(readFileSync(mPath, "utf8")) as Manifest;
  } catch {
    return 0;
  }
  const claudeRoot = join(homedir(), ".claude", "skills");
  let removed = 0;
  for (const f of manifest.files ?? []) {
    if (!f.startsWith(claudeRoot + "/") && f !== claudeRoot) continue;
    try {
      rmSync(f, { force: true });
      removed += 1;
    } catch {
      // ignore
    }
  }
  return removed;
}

export async function run(args: string[]): Promise<void> {
  const { vendor, agent, convexUrl } = parseFlags(args);
  const skills = discoverSkills();
  const targets = targetDirs(vendor);

  // Global Claude lives behind the plugin marketplace, not flat copy, so we
  // skip writing to ~/.claude/skills/ to avoid colliding with other packs.
  // Vendor mode is already namespaced under <project>/.claude/skills/suiperpower/
  // so it stays. Codex and Cursor have no plugin model, flat copy for both.
  const writeClaude = vendor;
  const legacyCleaned = !vendor ? cleanupLegacyGlobalClaudeFiles() : 0;
  if (writeClaude) mkdirSync(targets.claude, { recursive: true });
  mkdirSync(targets.codex, { recursive: true });
  mkdirSync(targets.cursor, { recursive: true });

  const allWritten: string[] = [];
  const installed: string[] = [];

  for (const skill of skills) {
    const codexDest = join(targets.codex, skill.name);
    if (existsSync(codexDest)) rmSync(codexDest, { recursive: true, force: true });
    if (writeClaude) {
      const claudeDest = join(targets.claude, skill.name);
      if (existsSync(claudeDest)) rmSync(claudeDest, { recursive: true, force: true });
      allWritten.push(...copySkillToClaudeOrCodex(skill, claudeDest, false));
    }
    allWritten.push(...copySkillToClaudeOrCodex(skill, codexDest, true));
    allWritten.push(...renderCursorMdc(skill, targets.cursor));
    installed.push(skill.name);
  }

  const sharedTargets = writeClaude ? [targets.claude, targets.codex] : [targets.codex];
  allWritten.push(...copySharedKnowledge(sharedTargets));

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
    console.log(`${BRAND.PRODUCT_NAME} init, ${installed.length} skills (${vendor ? "vendor" : "global"})`);
    for (const s of installed) console.log(`  + ${s}`);
    console.log(`manifest: ${mPath}`);
    return;
  }

  console.log("");
  console.log(`  ${bold(`${BRAND.PRODUCT_NAME} init`)} ${muted(vendor ? "(vendor)" : "(global)")}`);
  console.log("");
  console.log(`  ${ok(`${installed.length} skills installed`)}`);
  if (writeClaude) {
    console.log(`  ${dim(targets.claude)} ${muted("(Claude Code)")}`);
  } else {
    console.log(`  ${muted("Claude Code: install via plugin marketplace, see below")}`);
    if (legacyCleaned > 0) {
      console.log(
        `  ${muted(`removed ${legacyCleaned} legacy file(s) from ~/.claude/skills/`)}`,
      );
    }
  }
  console.log(`  ${dim(targets.codex)} ${muted("(Codex)")}`);
  console.log(`  ${dim(targets.cursor)} ${muted("(Cursor)")}`);
  console.log("");
  console.log(`  ${muted("manifest:")} ${mPath}`);
  console.log("");
  if (!vendor) {
    console.log(`  ${bold("Claude Code, one-time install:")}`);
    console.log(`  ${accent("/plugin marketplace add pivyme/suiperpower")}`);
    console.log(`  ${accent("/plugin install suiper@suiperpower")}`);
    console.log("");
    console.log(`  ${muted("next:")} ${accent(`${BRAND.PRODUCT_NAME} doctor`)}`);
    console.log("");
  }

  track({ skill: "init", phase: "cli", status: "completed" });
}

// Re-export helpers for `update` and `uninstall` to share manifest logic.
export { manifestPath, homeConfigDir, readPackageVersion, targetDirs, detectProjectRoot };
