import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function firstExisting(candidates: string[]): string {
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return "";
}

export function getPackageRoot(): string {
  const candidates = [
    // Dev: core/cli/*.ts -> core/
    join(__dirname, ".."),
    // Built npm package: core/dist/cli/*.js -> core/
    join(__dirname, "..", ".."),
  ];
  for (const root of candidates) {
    if (existsSync(join(root, "package.json")) && existsSync(join(root, "skills"))) {
      return root;
    }
  }
  return firstExisting(candidates);
}

export function getSkillsRoot(): string {
  const root = join(getPackageRoot(), "skills");
  if (existsSync(root)) return root;
  throw new Error("skills/ directory not found");
}

export function getCliDataRoot(): string {
  const root = join(getPackageRoot(), "cli", "data");
  if (existsSync(root)) return root;
  // Fallback for a future build step that copies JSON next to dist/cli.
  return firstExisting([join(__dirname, "data")]);
}

export function readPackageVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(join(getPackageRoot(), "package.json"), "utf8")) as {
      version?: string;
    };
    return pkg.version ?? "0.0.0";
  } catch {
    return "0.0.0";
  }
}
