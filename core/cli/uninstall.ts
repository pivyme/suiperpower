// `suiperpower uninstall` reads the manifest written by init.ts and removes only files we own.
// User-authored skills in the same directories are untouched. Prompts before deleting ~/.suiperpower/.

import { existsSync, readFileSync, readdirSync, rmSync, rmdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { createInterface } from "node:readline/promises";

import { BRAND } from "./branding.js";
import { bold, dim, muted, ok, warn } from "./colors.js";

interface Manifest {
  version: string;
  installedAt: string;
  vendor: boolean;
  files: string[];
  skills: { name: string; phase: string }[];
}

function readManifest(): Manifest | null {
  const path = join(homedir(), BRAND.CONFIG_DIR, "skills-installed.json");
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as Manifest;
  } catch {
    return null;
  }
}

async function prompt(q: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(q)).trim().toLowerCase();
  } finally {
    rl.close();
  }
}

function tryRmFile(p: string): boolean {
  try {
    if (existsSync(p)) {
      rmSync(p, { force: true });
      return true;
    }
  } catch {
    // ignore
  }
  return false;
}

// Walk the tree bottom-up and remove every empty directory under root.
// Leaves root itself in place if it ends up empty, since root is the agent's
// canonical dir (~/.codex/skills, ~/.cursor/rules, ~/.grok/skills) that other tools may rely on.
function pruneEmptyDirsRecursive(root: string): void {
  if (!existsSync(root)) return;
  const visit = (dir: string): boolean => {
    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return false;
    }
    let allRemoved = true;
    for (const name of entries) {
      const full = join(dir, name);
      let st;
      try {
        st = statSync(full);
      } catch {
        allRemoved = false;
        continue;
      }
      if (st.isDirectory()) {
        const emptiedChild = visit(full);
        if (!emptiedChild) allRemoved = false;
      } else {
        allRemoved = false;
      }
    }
    if (!allRemoved) return false;
    if (dir === root) return true;
    try {
      rmdirSync(dir);
      return true;
    } catch {
      return false;
    }
  };
  visit(root);
}

export async function run(args: string[]): Promise<void> {
  const yes = args.includes("--yes") || args.includes("-y");
  const agent = args.includes("--agent");
  const manifest = readManifest();

  if (!manifest) {
    if (agent) console.log("no manifest found");
    else
      console.log(
        `  ${warn("no manifest found")} ${dim(`(expected at ~/${BRAND.CONFIG_DIR}/skills-installed.json)`)}`,
      );
    return;
  }

  if (!agent) {
    console.log("");
    console.log(`  ${bold(`${BRAND.PRODUCT_NAME} uninstall`)}`);
    console.log(`  ${muted("manifest version")} ${manifest.version}`);
    console.log(`  ${muted("files tracked")} ${manifest.files.length}`);
    console.log(`  ${muted("skills tracked")} ${manifest.skills.length}`);
    console.log("");
  }

  if (!yes && !agent && process.stdin.isTTY) {
    const a = await prompt("remove tracked files? [y/N] ");
    if (a !== "y" && a !== "yes") {
      console.log(`  ${dim("aborted")}`);
      return;
    }
  }

  let removed = 0;
  for (const p of manifest.files) {
    if (tryRmFile(p)) removed += 1;
  }

  // Bottom-up sweep, removes every empty dir under each agent install root.
  // cpSync leaves empty `agents/` and `references/` placeholders behind, plus
  // the shared knowledge tree, and none of those end up in the file manifest.
  const installDirs = [
    join(homedir(), ".claude", "skills"),
    join(homedir(), ".codex", "skills"),
    join(homedir(), ".cursor", "rules"),
    join(homedir(), ".grok", "skills"),
  ];
  for (const d of installDirs) pruneEmptyDirsRecursive(d);

  // Optionally remove ~/.suiperpower/
  const cfgDir = join(homedir(), BRAND.CONFIG_DIR);
  let removedConfig = false;
  if (existsSync(cfgDir)) {
    const goAhead =
      yes || (!agent && process.stdin.isTTY && (await prompt(`remove ${cfgDir}? [y/N] `)) === "y");
    if (goAhead) {
      try {
        rmSync(cfgDir, { recursive: true, force: true });
        removedConfig = true;
      } catch {
        // ignore
      }
    }
  }

  if (agent) {
    console.log(`removed ${removed} files`);
    if (removedConfig) console.log("removed ~/.suiperpower/");
    return;
  }

  console.log("");
  console.log(`  ${ok(`removed ${removed} files`)}`);
  if (removedConfig) console.log(`  ${ok(`removed ~/${BRAND.CONFIG_DIR}/`)}`);
  console.log(`  ${dim("user-authored files in those dirs were left untouched")}`);
  console.log("");
}
