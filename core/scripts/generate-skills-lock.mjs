#!/usr/bin/env node
// Emits skills-lock.json listing every shipped skill with file hashes and a
// folder hash. The file is rewritten only when skill contents actually change.

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, relative, resolve } from "node:path";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");
const SKILLS_ROOT = join(REPO_ROOT, "skills");
const LOCK_PATH = join(REPO_ROOT, "skills-lock.json");
const PHASES = ["learn", "idea", "build", "ship", "grow"];

function compareText(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

function walk(dir, out) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (st.isFile()) out.push(full);
  }
}

function readPackageVersion() {
  const pkg = JSON.parse(readFileSync(join(REPO_ROOT, "package.json"), "utf8"));
  return pkg.version ?? "0.0.0";
}

function readExistingLock() {
  if (!existsSync(LOCK_PATH)) return null;
  try {
    return JSON.parse(readFileSync(LOCK_PATH, "utf8"));
  } catch {
    return null;
  }
}

function withoutGeneratedAt(lock) {
  if (!lock || typeof lock !== "object") return null;
  return {
    ...lock,
    generatedAt: "",
  };
}

function main() {
  const skills = [];
  for (const phase of PHASES) {
    const phaseDir = join(SKILLS_ROOT, phase);
    let entries;
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

      const files = [];
      walk(dir, files);
      files.sort(compareText);

      const fileEntries = [];
      const folderHasher = createHash("sha256");
      for (const f of files) {
        const buf = readFileSync(f);
        const h = sha256(buf);
        const rel = relative(dir, f).replaceAll("\\", "/");
        fileEntries.push({
          path: rel,
          sha256: h,
          size: buf.length,
        });
        folderHasher.update(`${rel}\0${h}\n`);
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
  const next = {
    version: readPackageVersion(),
    generatedAt: "",
    totalSkills: skills.length,
    skills,
  };
  const samePayload =
    JSON.stringify(withoutGeneratedAt(existing)) === JSON.stringify(withoutGeneratedAt(next));

  const lock = {
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
