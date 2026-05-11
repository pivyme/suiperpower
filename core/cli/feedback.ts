// `suiperpower feedback` collects skill, rating, free-text, optional contact
// and submits via the Convex feedback:submit mutation. Falls back to a local
// queue file if the network or Convex is unreachable.

import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { homedir, platform, arch } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";

import { BRAND, ENV } from "./branding.js";
import { accent, bold, dim, muted, ok, warn } from "./colors.js";
import { readPackageVersion } from "./paths.js";
import { track } from "./telemetry.js";

interface Submission {
  skill?: string;
  rating?: number;
  text: string;
  contact?: string;
  version: string;
  platform: string;
  timestamp: number;
}

function readConvexUrl(): string | undefined {
  const envUrl = process.env[ENV.CONVEX_URL];
  if (envUrl) return envUrl;
  try {
    const cfg = JSON.parse(
      readFileSync(join(homedir(), BRAND.CONFIG_DIR, "config.json"), "utf8"),
    ) as { convexUrl?: string };
    if (cfg.convexUrl && cfg.convexUrl !== BRAND.CONVEX_URL_DEFAULT) return cfg.convexUrl;
  } catch {
    // no config
  }
  return undefined;
}

async function submitToConvex(s: Submission, url: string): Promise<boolean> {
  try {
    const resp = await fetch(`${url.replace(/\/$/, "")}/api/mutation`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ path: "feedback:submit", args: s }),
      signal: AbortSignal.timeout(5000),
    });
    return resp.ok;
  } catch {
    return false;
  }
}

function bufferLocal(s: Submission): void {
  const dir = join(homedir(), BRAND.CONFIG_DIR);
  mkdirSync(dir, { recursive: true });
  appendFileSync(join(dir, "feedback-queue.jsonl"), JSON.stringify(s) + "\n");
}

export async function run(args: string[]): Promise<void> {
  const agent = args.includes("--agent");
  if (process.stdin.isTTY === false && !agent) {
    console.log(`  ${warn("feedback requires an interactive terminal")}`);
    return;
  }

  console.log("");
  console.log(`  ${bold(`${BRAND.PRODUCT_NAME} feedback`)}`);
  console.log(`  ${dim("free-form, anonymous unless you add contact info")}`);
  console.log("");

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const skill = (await rl.question("skill (optional, e.g. build-with-move): ")).trim();
    const ratingRaw = (await rl.question("rating 1-5 (optional): ")).trim();
    const text = (await rl.question("what worked, what did not, what is missing: ")).trim();
    if (!text) {
      console.log(`  ${warn("no text, nothing to submit")}`);
      return;
    }
    const contact = (await rl.question("contact (optional, only if you want a reply): ")).trim();

    const ratingNum = ratingRaw ? Number.parseInt(ratingRaw, 10) : NaN;
    const submission: Submission = {
      skill: skill || undefined,
      rating: Number.isFinite(ratingNum) && ratingNum >= 1 && ratingNum <= 5 ? ratingNum : undefined,
      text,
      contact: contact || undefined,
      version: readPackageVersion(),
      platform: `${platform()}-${arch()}`,
      timestamp: Date.now(),
    };

    const url = readConvexUrl();
    let sent = false;
    if (url) sent = await submitToConvex(submission, url);
    if (!sent) bufferLocal(submission);

    console.log("");
    console.log(`  ${ok(sent ? "submitted" : "buffered locally")}`);
    if (!sent) {
      console.log(
        `  ${dim(`will retry on next ${BRAND.PRODUCT_NAME} run; queue: ~/${BRAND.CONFIG_DIR}/feedback-queue.jsonl`)}`,
      );
    }
    console.log(`  ${muted("thanks. issues / RFCs:")} ${accent(BRAND.GH_URL)}`);
    console.log("");

    track({ skill: "feedback", phase: "cli", status: "completed" });
  } finally {
    rl.close();
  }
}
