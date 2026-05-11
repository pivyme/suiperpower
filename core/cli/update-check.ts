// Async update check. Fires after each CLI command, never blocks the user.
// Result cached for 24h in ~/.suiperpower/.update-check.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";

import { BRAND } from "./branding.js";
import { accent, dim } from "./colors.js";
import { readPackageVersion } from "./paths.js";

const CACHE_PATH = join(homedir(), BRAND.CONFIG_DIR, ".update-check");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface Cache {
  checkedAt: number;
  latest: string;
  current: string;
}

function readCurrent(): string {
  return readPackageVersion();
}

function compareSemver(a: string, b: string): number {
  const pa = a.split(".").map((s) => Number.parseInt(s, 10));
  const pb = b.split(".").map((s) => Number.parseInt(s, 10));
  for (let i = 0; i < 3; i++) {
    const av = Number.isFinite(pa[i]) ? pa[i] : 0;
    const bv = Number.isFinite(pb[i]) ? pb[i] : 0;
    if (av !== bv) return av < bv ? -1 : 1;
  }
  return 0;
}

function readCache(): Cache | null {
  if (!existsSync(CACHE_PATH)) return null;
  try {
    return JSON.parse(readFileSync(CACHE_PATH, "utf8")) as Cache;
  } catch {
    return null;
  }
}

function writeCache(c: Cache): void {
  try {
    mkdirSync(dirname(CACHE_PATH), { recursive: true });
    writeFileSync(CACHE_PATH, JSON.stringify(c, null, 2));
  } catch {
    // ignore
  }
}

async function fetchLatest(): Promise<string | null> {
  try {
    const resp = await fetch(`https://registry.npmjs.org/${BRAND.NPM_PKG}/latest`, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(2000),
    });
    if (!resp.ok) return null;
    const body = (await resp.json()) as { version?: string };
    return body.version ?? null;
  } catch {
    return null;
  }
}

export async function check(): Promise<{ latest: string; current: string } | null> {
  const current = readCurrent();
  const cache = readCache();
  if (cache && Date.now() - cache.checkedAt < CACHE_TTL_MS && cache.current === current) {
    return { latest: cache.latest, current };
  }
  const latest = await fetchLatest();
  if (!latest) return null;
  writeCache({ checkedAt: Date.now(), latest, current });
  return { latest, current };
}

export async function run(_args: string[]): Promise<void> {
  // Manual invocation: `suiperpower update-check` is not in the public command set,
  // but exposing run() lets the dispatcher call into this file.
  const result = await check();
  if (!result) {
    console.log(dim("update-check: no result"));
    return;
  }
  if (compareSemver(result.current, result.latest) < 0) {
    printNudge(result.current, result.latest);
  } else {
    console.log(dim(`up to date (v${result.current})`));
  }
}

export function printNudge(current: string, latest: string): void {
  console.log(
    `${dim(`${BRAND.PRODUCT_NAME} v${latest} available (you have v${current}). run`)} ${accent(`${BRAND.PRODUCT_NAME} update`)}`,
  );
}

export async function maybeNudge(): Promise<void> {
  // Best-effort, silent on failure. Suitable to call after a CLI command.
  try {
    const result = await check();
    if (!result) return;
    if (compareSemver(result.current, result.latest) < 0) {
      printNudge(result.current, result.latest);
    }
  } catch {
    // ignore
  }
}
