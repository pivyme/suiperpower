#!/usr/bin/env tsx
// Pre-publish gate. Runs every quality check and verifies the package shape
// before npm publish. Fails fast on the first broken gate. Run via:
//   pnpm publish:dry        # full gate, no npm publish, just `npm pack --dry-run`
//   pnpm tsx scripts/publish.ts --publish    # gate + actual publish (gated for maintainers)

import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const CORE_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");
const REPO_ROOT = resolve(CORE_ROOT, "..");
const WEB_PUBLIC = join(REPO_ROOT, "web", "public");
const MARKETPLACE_PATH = join(REPO_ROOT, ".claude-plugin", "marketplace.json");

const args = process.argv.slice(2);
const realPublish = args.includes("--publish");

function step(name: string, fn: () => void): void {
  process.stdout.write(`  > ${name} ... `);
  try {
    fn();
    process.stdout.write("ok\n");
  } catch (e: any) {
    process.stdout.write("FAIL\n");
    console.error(e?.message ?? e);
    process.exit(1);
  }
}

function run(cmd: string, ...rest: string[]): void {
  execFileSync(cmd, rest, { cwd: CORE_ROOT, stdio: "inherit" });
}

function runQuiet(cmd: string, ...rest: string[]): string {
  return execFileSync(cmd, rest, { cwd: CORE_ROOT, encoding: "utf8" });
}

function readJson<T = any>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8"));
}

function checkPackageShape(): void {
  const pkg = readJson<any>(join(CORE_ROOT, "package.json"));
  if (typeof pkg.bin !== "object" || pkg.bin === null) {
    throw new Error("package.json bin must be an object");
  }
  if (pkg.bin.suiperpower !== "./dist/cli/index.js") {
    throw new Error('bin.suiperpower must equal "./dist/cli/index.js"');
  }
  if (pkg.bin.suiper !== "./dist/cli/index.js") {
    throw new Error('bin.suiper must equal "./dist/cli/index.js"');
  }
  const requiredFiles = [
    "dist/",
    "skills/learn/",
    "skills/idea/",
    "skills/build/",
    "skills/ship/",
    "skills/data/",
    "cli/data/",
    "install.sh",
    "skills-lock.json",
  ];
  if (!Array.isArray(pkg.files)) {
    throw new Error("package.json files must be an array");
  }
  for (const f of requiredFiles) {
    if (!pkg.files.includes(f)) {
      throw new Error(`package.json files missing required entry: ${f}`);
    }
  }
  for (const banned of ["plans/", "bigdev/", "reference/", "web/"]) {
    if (pkg.files.includes(banned)) {
      throw new Error(`package.json files must not include ${banned}`);
    }
  }
}

function checkVersionSync(): void {
  const pkg = readJson<any>(join(CORE_ROOT, "package.json"));
  if (existsSync(join(CORE_ROOT, "skills-lock.json"))) {
    const lock = readJson<any>(join(CORE_ROOT, "skills-lock.json"));
    if (lock.version !== pkg.version) {
      throw new Error(`skills-lock.json version ${lock.version} != package.json ${pkg.version}`);
    }
  }
  if (existsSync(join(WEB_PUBLIC, "skills", "index.json"))) {
    const idx = readJson<any>(join(WEB_PUBLIC, "skills", "index.json"));
    for (const s of idx.skills ?? []) {
      if (s.version !== pkg.version) {
        throw new Error(`web/public/skills/index.json entry ${s.id} version ${s.version} != package.json ${pkg.version}`);
      }
    }
  }
}

function checkTarballHashes(): void {
  const idxPath = join(WEB_PUBLIC, "skills", "index.json");
  if (!existsSync(idxPath)) {
    throw new Error("web/public/skills/index.json missing, run pnpm package:skills");
  }
  const idx = readJson<any>(idxPath);
  for (const s of idx.skills ?? []) {
    const tarball = join(WEB_PUBLIC, "skills", `${s.id}.tar.gz`);
    if (!existsSync(tarball)) {
      throw new Error(`tarball missing for ${s.id}`);
    }
    const buf = readFileSync(tarball);
    const sha = createHash("sha256").update(buf).digest("hex");
    if (sha !== s.sha256) {
      throw new Error(`sha256 mismatch for ${s.id}: index says ${s.sha256}, file is ${sha}`);
    }
  }
}

function checkClaudeMarketplace(): void {
  if (!existsSync(MARKETPLACE_PATH)) {
    throw new Error(".claude-plugin/marketplace.json missing, run pnpm marketplace:gen");
  }
  const pkg = readJson<any>(join(CORE_ROOT, "package.json"));
  const marketplace = readJson<any>(MARKETPLACE_PATH);
  if (marketplace?.metadata?.version !== pkg.version) {
    throw new Error(
      `.claude-plugin/marketplace.json version ${marketplace?.metadata?.version} != package.json ${pkg.version}`,
    );
  }
  const plugin = marketplace?.plugins?.find((p: any) => p.name === "suiper");
  if (!plugin) {
    throw new Error('.claude-plugin/marketplace.json missing plugin "suiper"');
  }
  if (plugin.source !== "./core") {
    throw new Error('Claude plugin source must equal "./core"');
  }
  const skills: string[] = plugin.skills ?? [];
  if (!skills.includes("./skills/build/build-with-move")) {
    throw new Error("Claude plugin marketplace missing build-with-move skill");
  }
}

function checkPackTarball(): void {
  // npm pack --dry-run prints the file list. We assert it includes dist/, skills/, cli/data/.
  const out = runQuiet("npm", "pack", "--dry-run", "--json");
  const parsed = JSON.parse(out);
  const entry = Array.isArray(parsed) ? parsed[0] : parsed;
  const filenames: string[] = (entry?.files ?? []).map((f: any) => f.path);
  const need = ["dist/cli/index.js", "skills/build/build-with-move/SKILL.md", "cli/data/sui-skills.json", "install.sh"];
  for (const f of need) {
    if (!filenames.includes(f)) {
      throw new Error(`npm pack tarball missing required file: ${f}`);
    }
  }
  const banned = ["plans/00-OVERVIEW.md", "bigdev/TODO.md", "reference/solana-new-main/README.md"];
  for (const f of filenames) {
    for (const b of banned) {
      if (f === b) {
        throw new Error(`npm pack tarball includes banned file: ${f}`);
      }
    }
  }
}

function main(): void {
  console.log(`pre-publish gate (${realPublish ? "publish mode" : "dry run"})\n`);

  step("typecheck", () => run("pnpm", "typecheck"));
  step("lint:skills", () => run("pnpm", "lint:skills"));
  step("lint:catalog", () => run("pnpm", "lint:catalog"));
  step("preamble:check", () => run("pnpm", "preamble:check"));
  step("package:skills", () => run("pnpm", "package:skills"));
  step("generate Claude marketplace", () => run("pnpm", "marketplace:gen"));
  step("generate skills-lock.json", () => run("pnpm", "tsx", "scripts/generate-skills-lock.ts"));
  step("build", () => run("pnpm", "build"));
  step("test:install", () => run("pnpm", "test:install"));
  step("package.json shape", checkPackageShape);
  step("Claude marketplace shape", checkClaudeMarketplace);
  step("version sync", checkVersionSync);
  step("tarball hashes match index", checkTarballHashes);
  step("npm pack file list", checkPackTarball);

  if (realPublish) {
    console.log("\nall gates passed, running npm publish");
    run("npm", "publish");
    console.log("published");
  } else {
    console.log("\nall gates passed (dry run, no publish)");
  }
}

main();
