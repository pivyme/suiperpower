// `suiperpower update` runs `npm install -g @pivyme/suiperpower@latest`, then re-runs init,
// then prints a one-line changelog summary based on shipped skills.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import { BRAND } from "./branding.js";
import { accent, bold, dim, muted, ok, warn } from "./colors.js";
import { run as initRun, readPackageVersion } from "./init.js";

// Pre-rename, the CLI was published as plain "suiperpower". After the rename to
// "@pivyme/suiperpower" the bin name stayed the same, so npm refuses to install
// the new package with EEXIST when the legacy one is still globally installed.
const LEGACY_PACKAGE = "suiperpower";

interface InstalledManifest {
  version: string;
  skills: { name: string; phase: string }[];
}

function readManifest(): InstalledManifest | null {
  const path = join(homedir(), BRAND.CONFIG_DIR, "skills-installed.json");
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as InstalledManifest;
  } catch {
    return null;
  }
}

function tryNpmInstall(): boolean {
  try {
    execFileSync("npm", ["install", "-g", `${BRAND.NPM_PKG}@latest`], {
      stdio: "inherit",
      timeout: 180000,
    });
    return true;
  } catch {
    return false;
  }
}

function isLegacyPackageInstalled(): boolean {
  try {
    execFileSync("npm", ["ls", "-g", "--depth=0", LEGACY_PACKAGE], {
      stdio: "ignore",
      timeout: 30000,
    });
    return true;
  } catch {
    return false;
  }
}

function uninstallLegacyPackage(): boolean {
  try {
    execFileSync("npm", ["uninstall", "-g", LEGACY_PACKAGE], {
      stdio: "inherit",
      timeout: 60000,
    });
    return true;
  } catch {
    return false;
  }
}

function npmInstallLatest(agent: boolean): boolean {
  if (tryNpmInstall()) return true;
  // First attempt failed. Most common cause is the legacy "suiperpower" package
  // still owning the global bin from before the rename to @pivyme/suiperpower.
  if (!isLegacyPackageInstalled()) return false;
  if (!agent) {
    console.log("");
    console.log(
      `  ${muted("removing legacy")} ${accent(LEGACY_PACKAGE)} ${muted("package (renamed to")} ${accent(BRAND.NPM_PKG)}${muted(")")}`,
    );
  }
  if (!uninstallLegacyPackage()) return false;
  return tryNpmInstall();
}

export async function run(args: string[]): Promise<void> {
  const agent = args.includes("--agent");
  const skipNpm = args.includes("--skip-npm");
  const before = readManifest();

  if (!skipNpm) {
    if (!agent) {
      console.log("");
      console.log(`  ${bold(`${BRAND.PRODUCT_NAME} update`)}`);
      console.log(`  ${muted("running")} ${accent(`npm install -g ${BRAND.NPM_PKG}@latest`)}`);
      console.log("");
    }
    const okInstall = npmInstallLatest(agent);
    if (!okInstall && !agent) {
      console.log(`  ${warn("npm install failed; continuing with local skill refresh")}`);
    }
  }

  await initRun(agent ? ["--agent"] : []);

  const after = readManifest();
  const newVersion = readPackageVersion();
  const beforeNames = new Set((before?.skills ?? []).map((s) => s.name));
  const afterNames = (after?.skills ?? []).map((s) => s.name);
  const added = afterNames.filter((n) => !beforeNames.has(n));
  const removed = (before?.skills ?? []).map((s) => s.name).filter((n) => !afterNames.includes(n));

  if (agent) {
    console.log(`updated to v${newVersion}`);
    if (added.length) console.log(`added: ${added.join(", ")}`);
    if (removed.length) console.log(`removed: ${removed.join(", ")}`);
    return;
  }

  console.log("");
  console.log(`  ${ok(`updated to v${newVersion}`)}`);
  if (before?.version && before.version !== newVersion) {
    console.log(`  ${dim(`from v${before.version}`)}`);
  }
  if (added.length) {
    console.log(`  ${bold("added skills")}`);
    for (const s of added) console.log(`    + ${s}`);
  }
  if (removed.length) {
    console.log(`  ${bold("removed skills")}`);
    for (const s of removed) console.log(`    - ${s}`);
  }
  console.log("");
}
