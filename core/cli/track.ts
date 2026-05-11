// `suiperpower track <skill> <phase> <status> [--duration <ms>] [--category <s>]`
// Single entrypoint every caller (SKILL.md bash preamble, direct CLI commands,
// future webhooks) routes through. Writes Convex + telemetry.jsonl + projects.json.
//
// Designed to be safe to call from anywhere: never throws, never prints noise
// unless SUIPERPOWER_DEBUG=1. The whole point is that skills can shell out to
// this without worrying about side effects.

import { BRAND } from "./branding.js";
import { track as trackEvent, type Tier } from "./telemetry.js";

const VALID_STATUS = ["started", "completed", "failed", "aborted"] as const;
type Status = (typeof VALID_STATUS)[number];

function takeFlag(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1) return undefined;
  const next = args[idx + 1];
  if (!next || next.startsWith("-")) return undefined;
  return next;
}

export async function run(args: string[]): Promise<void> {
  const positional = args.filter((a) => !a.startsWith("-"));
  // Strip values that follow flags we know about so positional reads correctly.
  const knownValueFlags = ["--duration", "--category"];
  const cleanPositional: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a.startsWith("-")) {
      if (knownValueFlags.includes(a)) i++; // skip its value
      continue;
    }
    cleanPositional.push(a);
  }

  const [skill, phase, status] = cleanPositional;

  if (!skill || !phase || !status) {
    console.error(`usage: ${BRAND.PRODUCT_NAME} track <skill> <phase> <status>`);
    console.error(`status: ${VALID_STATUS.join(" | ")}`);
    process.exit(1);
  }

  if (!VALID_STATUS.includes(status as Status)) {
    console.error(`invalid status: ${status}`);
    console.error(`status must be: ${VALID_STATUS.join(" | ")}`);
    process.exit(1);
  }

  const durationRaw = takeFlag(args, "--duration");
  const duration = durationRaw ? Number(durationRaw) : undefined;
  const category = takeFlag(args, "--category");

  trackEvent({
    skill,
    phase,
    status: status as Status,
    durationMs: Number.isFinite(duration) ? duration : undefined,
    category,
  });

  // Telemetry's sendToConvex is fire-and-forget; give it a beat to flush
  // before the process exits. 250ms is plenty for a same-region POST.
  await new Promise((r) => setTimeout(r, 250));
}

// Re-export type so external callers can type the status arg if needed.
export type { Status, Tier };
