// Detect / install agent CLIs. Never blocks: missing CLI is a warning, not a failure.
// Three agents we care about: Claude Code, Codex, Cursor.

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { ENV } from "./branding.js";

export type AgentCli = "claude" | "codex" | "cursor";

interface AgentMeta {
  label: string;
  installCmd: string;
  npmPkg: string | null;
}

const AGENT_META: Record<AgentCli, AgentMeta> = {
  claude: {
    label: "Claude Code",
    installCmd: "npm i -g @anthropic-ai/claude-code",
    npmPkg: "@anthropic-ai/claude-code",
  },
  codex: {
    label: "Codex",
    installCmd: "npm i -g @openai/codex",
    npmPkg: "@openai/codex",
  },
  cursor: {
    label: "Cursor",
    installCmd: "https://cursor.com",
    npmPkg: null,
  },
};

let cachedPaths: Record<AgentCli, string> | null = null;

function which(bin: string): string {
  // No shell, no interpolation. Static binary name only.
  try {
    return execFileSync("command", ["-v", bin], {
      encoding: "utf8",
      timeout: 5000,
      stdio: ["pipe", "pipe", "pipe"],
      shell: "/bin/sh",
    }).trim();
  } catch {
    return "";
  }
}

export function detectAgentCliPaths(): Record<AgentCli, string> {
  if (cachedPaths) return cachedPaths;
  const paths: Record<AgentCli, string> = { claude: "", codex: "", cursor: "" };
  for (const cli of Object.keys(paths) as AgentCli[]) {
    paths[cli] = which(cli);
  }
  // Cursor often installs as a GUI app on macOS; fall back to ~/.cursor existence.
  if (!paths.cursor && existsSync(join(homedir(), ".cursor"))) {
    paths.cursor = `${homedir()}/.cursor`;
  }
  cachedPaths = paths;
  return paths;
}

export function detectPreferredAgentCli(): AgentCli | null {
  const paths = detectAgentCliPaths();
  const envPref = (process.env[ENV.AGENT] || "").toLowerCase() as AgentCli;
  const order: AgentCli[] =
    envPref === "claude" || envPref === "codex" || envPref === "cursor"
      ? [envPref, ...(["claude", "codex", "cursor"] as AgentCli[]).filter((a) => a !== envPref)]
      : ["claude", "codex", "cursor"];
  for (const cli of order) {
    if (paths[cli]) return cli;
  }
  return null;
}

export function getAgentMeta(cli: AgentCli): AgentMeta {
  return AGENT_META[cli];
}

export function getAgentCliInstallHelp(): string {
  return Object.values(AGENT_META)
    .map((m) => `${m.label}: ${m.installCmd}`)
    .join(" | ");
}

export function formatSkillInvocation(
  cli: AgentCli | null,
  skillName: string,
  message = "",
): string {
  const target = cli ?? "claude";
  const slash = target === "claude" ? `/suiper:${skillName}` : `/${skillName}`;
  const prompt = message ? `${slash} ${message}` : slash;
  if (target === "cursor") return `Cursor chat: "${prompt}"`;
  return `${target} "${prompt}"`;
}

export function formatQuotedSkillCommand(cli: AgentCli | null, quotedCommand: string): string {
  const m = quotedCommand.match(/^"\/([^\s"]+)(?:\s+([^"]*))?"$/);
  if (!m) return `${cli ?? "claude"} ${quotedCommand}`;
  return formatSkillInvocation(cli, m[1], m[2] ?? "");
}

export function tryInstallAgentCli(cli: AgentCli): boolean {
  const meta = AGENT_META[cli];
  if (!meta.npmPkg) return false;
  try {
    execFileSync("npm", ["i", "-g", meta.npmPkg], {
      stdio: "ignore",
      timeout: 120000,
    });
    cachedPaths = null;
    return Boolean(detectAgentCliPaths()[cli]);
  } catch {
    return false;
  }
}
