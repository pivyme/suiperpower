// Exercises the live Convex telemetry endpoint with a few sample events.
// Reads CONVEX URL from env. Run via:
//   pnpm test:telemetry
// which invokes this with `node --env-file=../.env` so root .env is loaded.
//
// Prints HTTP status per call so you can confirm rows land in the dashboard
// without staring at silent fire-and-forget logs.

import { platform, arch } from "node:os";

const URL_CANDIDATES = [
  process.env.SUIPERPOWER_CONVEX_URL,
  process.env.NEXT_PUBLIC_CONVEX_URL,
];
const CONVEX_URL = URL_CANDIDATES.find((u) => u && u.startsWith("http"));

if (!CONVEX_URL) {
  console.error("No Convex URL found.");
  console.error("Set NEXT_PUBLIC_CONVEX_URL in .env or SUIPERPOWER_CONVEX_URL in your shell.");
  process.exit(1);
}

interface SampleEvent {
  skill: string;
  phase: string;
  status: "started" | "completed" | "failed" | "aborted";
  durationMs?: number;
}

const SAMPLES: SampleEvent[] = [
  { skill: "test-telemetry", phase: "cli", status: "started" },
  { skill: "test-telemetry", phase: "cli", status: "completed", durationMs: 1234 },
  { skill: "scaffold-project", phase: "build", status: "started" },
  { skill: "scaffold-project", phase: "build", status: "completed", durationMs: 8742 },
  { skill: "build-with-move", phase: "build", status: "failed", durationMs: 412 },
];

async function send(event: SampleEvent): Promise<void> {
  const payload = {
    path: "telemetry:track",
    args: {
      skill: event.skill,
      phase: event.phase,
      status: event.status,
      durationMs: event.durationMs,
      version: "0.1.0-test",
      platform: `${platform()}-${arch()}`,
      tier: "anonymous",
      timestamp: Date.now(),
    },
  };
  const url = `${CONVEX_URL!.replace(/\/$/, "")}/api/mutation`;
  const t0 = Date.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });
    const body = await res.text().catch(() => "");
    const dur = Date.now() - t0;
    const tag = res.ok ? "OK  " : "FAIL";
    const detail = `${event.skill} (${event.status})`;
    console.log(`  [${tag}] ${res.status} ${dur}ms  ${detail}`);
    if (!res.ok) console.log(`         ${body.slice(0, 300)}`);
  } catch (e) {
    console.log(`  [FAIL] network ${event.skill} (${event.status}): ${(e as Error).message}`);
  }
}

async function main(): Promise<void> {
  console.log("");
  console.log(`  Suiperpower telemetry test`);
  console.log(`  endpoint: ${CONVEX_URL}/api/mutation`);
  console.log(`  sending ${SAMPLES.length} events...`);
  console.log("");
  for (const ev of SAMPLES) {
    await send(ev);
  }
  console.log("");
  const dashHost = CONVEX_URL!
    .replace("https://", "")
    .replace(".convex.cloud", "");
  console.log(`  Dashboard: https://dashboard.convex.dev/d/${dashHost}/data?table=telemetry`);
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
