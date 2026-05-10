#!/usr/bin/env tsx
// Validates the JSON catalogs in cli/data against plans/07-ECOSYSTEM-CATALOG.md.
// Hard-fails on schema mismatches, missing required fields, ids that are not
// kebab-case, ids that are not sorted alphabetically, or duplicate ids. Run via:
//   pnpm tsx scripts/lint-catalog.ts

import { readFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(fileURLToPath(import.meta.url), "..", "..");
const DATA = join(REPO_ROOT, "cli", "data");

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type Issue = { file: string; message: string };

function loadJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8"));
}

function checkArrayBlock(
  file: string,
  doc: any,
  arrayKey: string,
  requiredFields: string[],
  issues: Issue[],
): void {
  if (typeof doc.version !== "string") {
    issues.push({ file, message: "missing or non-string version" });
  }
  if (typeof doc.generatedAt !== "string") {
    issues.push({ file, message: "missing or non-string generatedAt" });
  }
  const arr = doc[arrayKey];
  if (!Array.isArray(arr)) {
    issues.push({ file, message: `expected an array at "${arrayKey}"` });
    return;
  }
  const seenIds = new Set<string>();
  let lastId = "";
  for (let i = 0; i < arr.length; i++) {
    const row = arr[i];
    if (typeof row !== "object" || row === null) {
      issues.push({ file, message: `${arrayKey}[${i}] is not an object` });
      continue;
    }
    for (const field of requiredFields) {
      if (!(field in row)) {
        issues.push({ file, message: `${arrayKey}[${i}] (id=${row.id ?? "?"}) missing required field "${field}"` });
      }
    }
    if (typeof row.id !== "string") {
      issues.push({ file, message: `${arrayKey}[${i}] id is not a string` });
      continue;
    }
    if (!KEBAB.test(row.id)) {
      issues.push({ file, message: `${arrayKey}[${i}] id "${row.id}" is not kebab-case` });
    }
    if (seenIds.has(row.id)) {
      issues.push({ file, message: `${arrayKey}[${i}] duplicate id "${row.id}"` });
    }
    seenIds.add(row.id);
    if (row.id < lastId) {
      issues.push({ file, message: `${arrayKey}[${i}] id "${row.id}" out of alphabetical order (after "${lastId}")` });
    }
    lastId = row.id;
  }
}

function checkRepos(issues: Issue[]): void {
  const file = join(DATA, "clonable-repos.json");
  if (!existsSync(file)) {
    issues.push({ file, message: "missing" });
    return;
  }
  const doc: any = loadJson(file);
  checkArrayBlock(
    file,
    doc,
    "repos",
    ["id", "name", "owner", "url", "description", "category", "tags", "license", "official", "stars", "lastChecked"],
    issues,
  );
}

function checkSuiSkills(issues: Issue[]): void {
  const file = join(DATA, "sui-skills.json");
  if (!existsSync(file)) {
    issues.push({ file, message: "missing" });
    return;
  }
  const doc: any = loadJson(file);
  checkArrayBlock(
    file,
    doc,
    "skills",
    ["id", "name", "publisher", "publisherType", "url", "description", "agents", "phase", "tags", "lastChecked"],
    issues,
  );
}

function checkMcps(issues: Issue[]): void {
  const file = join(DATA, "sui-mcps.json");
  if (!existsSync(file)) {
    issues.push({ file, message: "missing" });
    return;
  }
  const doc: any = loadJson(file);
  checkArrayBlock(
    file,
    doc,
    "mcps",
    ["id", "name", "publisher", "url", "installCmd", "description", "lastChecked"],
    issues,
  );
}

function checkIdeas(issues: Issue[]): void {
  const file = join(DATA, "sui-ideas.json");
  if (!existsSync(file)) {
    issues.push({ file, message: "missing" });
    return;
  }
  const doc: any = loadJson(file);
  checkArrayBlock(
    file,
    doc,
    "ideas",
    ["id", "title", "summary", "source", "category", "fitForSui", "addedAt"],
    issues,
  );
}

function main(): void {
  const issues: Issue[] = [];
  checkRepos(issues);
  checkSuiSkills(issues);
  checkMcps(issues);
  checkIdeas(issues);

  for (const i of issues) {
    const rel = i.file.replace(REPO_ROOT + "/", "");
    console.log(`error ${rel}  ${i.message}`);
  }
  console.log(`\n${issues.length} issues across catalogs`);
  if (issues.length > 0) process.exit(1);
}

main();
