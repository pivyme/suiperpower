#!/usr/bin/env tsx
// Emits skills-lock.json at the repo root listing every shipped skill with a
// sha256 of every file under skills/<phase>/<name>/ and an aggregate hash for
// the skill folder. The manifest is the contract `cli/update.ts` consults to
// detect a changed skill across versions. Run via:
//   pnpm tsx scripts/generate-skills-lock.ts

import { existsSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, resolve, relative } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");
const SKILLS_ROOT = join(REPO_ROOT, "skills");
const LOCK_PATH = join(REPO_ROOT, "skills-lock.json");
const PHASES = ["learn", "idea", "build", "ship", "grow"] as const;

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

interface FileEntry {
  path: string;
  sha256: string;
  size: number;
}

interface SkillEntry {
  id: string;
  phase: string;
  folderHash: string;
  files: FileEntry[];
}

interface Lock {
  version: string;
  generatedAt: string;
  totalSkills: number;
  skills: SkillEntry[];
}

function sha256(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex");
}

function walk(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (st.isFile()) out.push(full);
  }
}

function readPackageVersion(): string {
  const pkg = JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf8"));
  return pkg.version ?? "0.0.0";
}

function readExistingLock(): Lock | null {
  if (!existsSync(LOCK_PATH)) return null;
  try {
    return JSON.parse(readFileSync(LOCK_PATH, "utf8")) as Lock;
  } catch {
    return null;
  }
}

function withoutGeneratedAt(
  lock: Lock | null,
): (Omit<Lock, "generatedAt"> & { generatedAt: string }) | null {
  if (!lock) return null;
  return {
    ...lock,
    generatedAt: "",
  };
}

function main(): void {
  const skills: SkillEntry[] = [];
  for (const phase of PHASES) {
    const phaseDir = join(SKILLS_ROOT, phase);
    let entries: string[];
    try {
      entries = readdirSync(phaseDir);
    } catch {
      continue;
    }
    for (const name of entries.sort(compareText)) {
      const dir = join(phaseDir, name);
      let st;
      try {
        st = statSync(dir);
      } catch {
        continue;
      }
      if (!st.isDirectory()) continue;

      const files: string[] = [];
      walk(dir, files);
      files.sort(compareText);

      const fileEntries: FileEntry[] = [];
      const folderHasher = createHash("sha256");
      for (const f of files) {
        const buf = readFileSync(f);
        const h = sha256(buf);
        fileEntries.push({
          path: relative(dir, f).replaceAll("\\", "/"),
          sha256: h,
          size: buf.length,
        });
        folderHasher.update(`${relative(dir, f)}\0${h}\n`);
      }

      skills.push({
        id: name,
        phase,
        folderHash: folderHasher.digest("hex"),
        files: fileEntries,
      });
    }
  }

  const existing = readExistingLock();
  const next: Lock = {
    version: readPackageVersion(),
    generatedAt: "",
    totalSkills: skills.length,
    skills,
  };
  const samePayload =
    JSON.stringify(withoutGeneratedAt(existing)) === JSON.stringify(withoutGeneratedAt(next));

  const lock: Lock = {
    ...next,
    generatedAt:
      samePayload && existing?.generatedAt ? existing.generatedAt : new Date().toISOString(),
  };

  const payload = JSON.stringify(lock, null, 2) + "\n";
  if (existsSync(LOCK_PATH) && readFileSync(LOCK_PATH, "utf8") === payload) {
    console.log(`up to date ${LOCK_PATH} with ${skills.length} skills`);
    return;
  }
  writeFileSync(LOCK_PATH, payload);
  console.log(`wrote ${LOCK_PATH} with ${skills.length} skills`);
}

main();
