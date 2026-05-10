// Lightweight skill / CLI usage tracking. Privacy-first.
// Three tiers: off | anonymous | community. Default after install: anonymous.
// Always writes a local JSONL log so users can audit what would have been sent.
// Fires Convex mutation in the background, swallows all failures.

import {
  appendFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { homedir, platform, arch } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

import { BRAND, ENV } from "./branding.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const CFG_DIR = join(homedir(), BRAND.CONFIG_DIR);
const CFG_FILE = join(CFG_DIR, "config.json");
const LOG_FILE = join(CFG_DIR, "telemetry.jsonl");

export type Tier = "off" | "anonymous" | "community";

export interface TelemetryEvent {
  skill: string;
  phase: string; // learn | idea | build | ship | grow | cli
  status: "started" | "completed" | "failed" | "aborted";
  durationMs?: number;
  category?: string;
  version: string;
  platform: string;
  tier: Tier;
  timestamp: number;
  installationId?: string;
}

interface Config {
  telemetryTier?: Tier;
  convexUrl?: string;
  installationId?: string;
  category?: string;
  [k: string]: unknown;
}

function readConfig(): Config {
  try {
    return JSON.parse(readFileSync(CFG_FILE, "utf8")) as Config;
  } catch {
    return {};
  }
}

function writeConfig(c: Config): void {
  mkdirSync(CFG_DIR, { recursive: true });
  writeFileSync(CFG_FILE, JSON.stringify(c, null, 2) + "\n");
}

export function getTier(): Tier {
  const env = (process.env[ENV.TELEMETRY] || "").toLowerCase();
  if (env === "off" || env === "anonymous" || env === "community") return env;
  return readConfig().telemetryTier ?? "anonymous";
}

export function setTier(tier: Tier): void {
  const cfg = readConfig();
  cfg.telemetryTier = tier;
  if (tier === "community" && !cfg.installationId) cfg.installationId = randomUUID();
  writeConfig(cfg);
}

function readVersion(): string {
  for (const rel of ["../package.json", "../../package.json"]) {
    try {
      const p = JSON.parse(readFileSync(join(__dirname, rel), "utf8")) as { version?: string };
      if (p.version) return p.version;
    } catch {
      // try next
    }
  }
  return "0.0.0";
}

export function track(
  fields: Pick<TelemetryEvent, "skill" | "phase" | "status"> &
    Partial<Pick<TelemetryEvent, "durationMs" | "category">>,
): void {
  try {
    const tier = getTier();
    if (tier === "off") return;
    const cfg = readConfig();
    const event: TelemetryEvent = {
      skill: fields.skill,
      phase: fields.phase,
      status: fields.status,
      durationMs: fields.durationMs,
      category: tier === "community" ? fields.category ?? cfg.category : undefined,
      version: readVersion(),
      platform: `${platform()}-${arch()}`,
      tier,
      timestamp: Date.now(),
      installationId: tier === "community" ? cfg.installationId : undefined,
    };
    mkdirSync(CFG_DIR, { recursive: true });
    appendFileSync(LOG_FILE, JSON.stringify(event) + "\n");
    void sendToConvex(event, cfg.convexUrl);
  } catch {
    // never crash on telemetry
  }
}

async function sendToConvex(event: TelemetryEvent, convexUrl: string | undefined): Promise<void> {
  const url = process.env[ENV.CONVEX_URL] || convexUrl || BRAND.CONVEX_URL_DEFAULT;
  if (!url || url === BRAND.CONVEX_URL_DEFAULT) return;
  try {
    await fetch(`${url.replace(/\/$/, "")}/api/mutation`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: "telemetry:track", args: event }),
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // fire-and-forget
  }
}

export function timeSkill(skill: string, phase: string): { finish: (status: "completed" | "failed" | "aborted") => void } {
  const start = Date.now();
  track({ skill, phase, status: "started" });
  return {
    finish(status) {
      track({ skill, phase, status, durationMs: Date.now() - start });
    },
  };
}

export const __forTest = { CFG_FILE, LOG_FILE };
