#!/usr/bin/env tsx
// Watches core/skills/** and rebuilds the per-skill tarballs + index.json
// whenever anything changes. Debounced so a flurry of saves coalesces into
// one rebuild. Run alongside `pnpm dev` if you are actively authoring skills.
//   pnpm tsx scripts/watch-skills.ts

import { watch } from "node:fs";
import { spawn } from "node:child_process";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const CORE_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");
const SKILLS_ROOT = join(CORE_ROOT, "skills");
const DEBOUNCE_MS = 400;

let pending: NodeJS.Timeout | null = null;
let running = false;
let dirty = false;

function rebuild(): void {
  if (running) {
    dirty = true;
    return;
  }
  running = true;
  dirty = false;
  const start = Date.now();
  console.log("[watch-skills] rebuilding...");
  const child = spawn("pnpm", ["package:skills"], {
    cwd: CORE_ROOT,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  child.on("exit", (code) => {
    running = false;
    const dt = ((Date.now() - start) / 1000).toFixed(1);
    if (code === 0) {
      console.log(`[watch-skills] done in ${dt}s`);
    } else {
      console.error(`[watch-skills] failed (exit ${code})`);
    }
    if (dirty) rebuild();
  });
}

function schedule(): void {
  if (pending) clearTimeout(pending);
  pending = setTimeout(rebuild, DEBOUNCE_MS);
}

console.log(`[watch-skills] watching ${SKILLS_ROOT}`);
try {
  watch(SKILLS_ROOT, { recursive: true }, (_event, filename) => {
    if (!filename) return;
    // ignore editor swap / dotfiles
    const base = filename.toString().split(/[/\\]/).pop() ?? "";
    if (base.startsWith(".")) return;
    schedule();
  });
} catch (err) {
  console.error("[watch-skills] fs.watch failed:", err);
  process.exit(1);
}

// initial build so the index is fresh on startup
rebuild();
