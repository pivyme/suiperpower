// `suiperpower doctor` prints a status table and never exits non-zero.
// The install must be unblockable.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { BRAND } from "./branding.js";
import { bold, dim, err, muted, ok, warn } from "./colors.js";
import { detectAgentCliPaths } from "./agent-cli.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

type Status = "pass" | "warn" | "fail";

interface Check {
  group: string;
  label: string;
  status: Status;
  detail: string;
}

function tryExec(bin: string, args: string[]): string {
  try {
    return execFileSync(bin, args, {
      encoding: "utf8",
      timeout: 5000,
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return "";
  }
}

function getSkillsRoot(): string {
  const dev = join(__dirname, "..", "skills");
  if (existsSync(dev)) return dev;
  const built = join(__dirname, "..", "..", "skills");
  if (existsSync(built)) return built;
  return "";
}

function expectedSkills(): string[] {
  const root = getSkillsRoot();
  if (!root) return [];
  const out: string[] = [];
  for (const phase of readdirSync(root, { withFileTypes: true })) {
    if (!phase.isDirectory()) continue;
    const phaseDir = join(root, phase.name);
    for (const sub of readdirSync(phaseDir, { withFileTypes: true })) {
      if (sub.isDirectory() && existsSync(join(phaseDir, sub.name, "SKILL.md"))) {
        out.push(sub.name);
      }
    }
  }
  return out;
}

function readJson<T>(path: string): T | null {
  try {
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
}

function catalogCounts(): { repos: number; skills: number; mcps: number; ideas: number } {
  const cliData = join(__dirname, "data");
  const altCliData = join(__dirname, "..", "cli", "data");
  const root = existsSync(cliData) ? cliData : altCliData;
  const counts = { repos: 0, skills: 0, mcps: 0, ideas: 0 };
  if (!existsSync(root)) return counts;
  const repos = readJson<{ repos: unknown[] }>(join(root, "clonable-repos.json"));
  const skills = readJson<{ skills: unknown[] }>(join(root, "sui-skills.json"));
  const mcps = readJson<{ mcps: unknown[] }>(join(root, "sui-mcps.json"));
  const ideas = readJson<{ ideas: unknown[] }>(join(root, "sui-ideas.json"));
  counts.repos = repos?.repos?.length ?? 0;
  counts.skills = skills?.skills?.length ?? 0;
  counts.mcps = mcps?.mcps?.length ?? 0;
  counts.ideas = ideas?.ideas?.length ?? 0;
  return counts;
}

function suiActiveEnv(): { env: string; address: string } {
  const out = tryExec("sui", ["client", "active-env"]);
  const env = out || "";
  const addr = tryExec("sui", ["client", "active-address"]);
  return { env, address: addr };
}

export async function run(args: string[]): Promise<void> {
  const agent = args.includes("--agent");
  const checks: Check[] = [];

  // Environment
  const nodeMajor = parseInt(process.version.slice(1).split(".")[0], 10);
  checks.push({
    group: "Environment",
    label: "Node.js",
    status: nodeMajor >= 20 ? "pass" : "fail",
    detail: nodeMajor >= 20 ? process.version : `${process.version} requires >= 20.0.0`,
  });
  const npmV = tryExec("npm", ["--version"]);
  checks.push({
    group: "Environment",
    label: "npm",
    status: npmV ? "pass" : "fail",
    detail: npmV || "not found",
  });
  const gitV = tryExec("git", ["--version"]);
  checks.push({
    group: "Environment",
    label: "git",
    status: gitV ? "pass" : "fail",
    detail: gitV || "not installed",
  });

  // Agents
  const agents = detectAgentCliPaths();
  checks.push({
    group: "Agents",
    label: "Claude Code",
    status: agents.claude ? "pass" : "warn",
    detail: agents.claude || "not installed, install: npm i -g @anthropic-ai/claude-code",
  });
  checks.push({
    group: "Agents",
    label: "Codex",
    status: agents.codex ? "pass" : "warn",
    detail: agents.codex || "not installed, install: npm i -g @openai/codex",
  });
  checks.push({
    group: "Agents",
    label: "Cursor",
    status: agents.cursor ? "pass" : "warn",
    detail: agents.cursor || "not detected, install: https://cursor.com",
  });

  // Sui
  const suiV = tryExec("sui", ["--version"]);
  if (suiV) {
    checks.push({ group: "Sui", label: "Sui CLI", status: "pass", detail: suiV });
    const { env, address } = suiActiveEnv();
    checks.push({
      group: "Sui",
      label: "active env",
      status: env ? "pass" : "warn",
      detail: env || "no active env, run: sui client switch --env devnet",
    });
    checks.push({
      group: "Sui",
      label: "address",
      status: address ? "pass" : "warn",
      detail: address || "no active address, run: sui client new-address ed25519",
    });
  } else {
    checks.push({
      group: "Sui",
      label: "Sui CLI",
      status: "warn",
      detail: "not installed, see https://docs.sui.io/guides/developer/getting-started/sui-install",
    });
  }

  // Suiperpower state
  const cfgPath = join(homedir(), BRAND.CONFIG_DIR, "config.json");
  if (existsSync(cfgPath)) {
    const cfg = readJson<{ telemetryTier?: string; convexUrl?: string }>(cfgPath);
    checks.push({
      group: "Suiperpower",
      label: "config",
      status: "pass",
      detail: `telemetry: ${cfg?.telemetryTier ?? "unknown"}`,
    });
  } else {
    checks.push({
      group: "Suiperpower",
      label: "config",
      status: "warn",
      detail: `${cfgPath} missing, run: ${BRAND.PRODUCT_NAME} init`,
    });
  }

  const expected = expectedSkills();
  const claudeDir = join(homedir(), ".claude", "skills");
  const codexDir = join(homedir(), ".codex", "skills");
  const installedCount = expected.filter(
    (s) => existsSync(join(claudeDir, s)) || existsSync(join(codexDir, s)),
  ).length;
  checks.push({
    group: "Suiperpower",
    label: "skills",
    status: installedCount === expected.length && expected.length > 0 ? "pass" : "warn",
    detail:
      expected.length === 0
        ? "no skills discovered"
        : `${installedCount}/${expected.length} installed`,
  });

  const counts = catalogCounts();
  checks.push({
    group: "Suiperpower",
    label: "catalog",
    status: "pass",
    detail: `${counts.repos} repos, ${counts.mcps} mcps, ${counts.skills} ecosystem skills, ${counts.ideas} ideas`,
  });

  if (agent) {
    console.log(`${BRAND.PRODUCT_NAME} doctor`);
    for (const c of checks) {
      const icon = c.status === "pass" ? "OK" : c.status === "warn" ? "WARN" : "FAIL";
      console.log(`[${icon}] ${c.group} / ${c.label}: ${c.detail}`);
    }
    return;
  }

  console.log("");
  console.log(`  ${bold(`${BRAND.PRODUCT_NAME} doctor`)}`);
  let lastGroup = "";
  for (const c of checks) {
    if (c.group !== lastGroup) {
      console.log("");
      console.log(`  ${bold(c.group)}`);
      lastGroup = c.group;
    }
    const mark = c.status === "pass" ? ok("✓") : c.status === "warn" ? warn("!") : err("✗");
    const pad = " ".repeat(Math.max(16 - c.label.length, 1));
    console.log(`  ${mark} ${c.label}${pad}${dim(c.detail)}`);
  }
  console.log("");
}
