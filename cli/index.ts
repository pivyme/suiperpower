#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { BRAND } from "./branding.js";
import { accent, bold, muted } from "./colors.js";

type Handler = (args: string[]) => Promise<void>;
type Module = { run: Handler; runIdeas?: Handler };

// Dynamic path through a variable so TS does not statically resolve modules
// that later phases will create (init, doctor, update, etc.).
const load = (name: string): Promise<Module> =>
  import(`./${name}.js`) as Promise<Module>;

const handlers: Record<string, () => Promise<Module>> = {
  init: () => load("init"),
  doctor: () => load("doctor"),
  update: () => load("update"),
  uninstall: () => load("uninstall"),
  skills: () => load("interactive-skills"),
  repos: () => load("repos"),
  mcps: () => load("interactive-mcps"),
  search: () => load("interactive-search"),
  feedback: () => load("feedback"),
  journey: () => load("interactive-journey"),
  completion: () => load("completion"),
};

function readVersion(): string {
  // dist layout: dist/cli/index.js -> ../../package.json
  // dev (tsx): cli/index.ts -> ../package.json
  const here = dirname(fileURLToPath(import.meta.url));
  for (const rel of ["../package.json", "../../package.json"]) {
    try {
      const pkg = JSON.parse(readFileSync(join(here, rel), "utf8")) as { version?: string };
      if (typeof pkg.version === "string") return pkg.version;
    } catch {
      // try next
    }
  }
  return "0.0.0";
}

function printHelp(): void {
  const v = readVersion();
  const lines = [
    "",
    `  ${bold(BRAND.PRODUCT_NAME)} v${v}`,
    `  ${muted(BRAND.TAGLINE)}`,
    "",
    `  ${bold("Commands")}`,
    "",
    "    init [--vendor]      Install or refresh skills",
    "    doctor               Run environment health check",
    "    update               Update suiperpower and refresh skills",
    "    uninstall            Remove skills and config",
    "",
    "    skills               Browse installed skills",
    "    repos                Browse ecosystem repos",
    "    mcps                 Browse MCP servers",
    "    ideas                Browse curated ideas",
    "    search <query>       Search across all of the above",
    "",
    "    journey              Guided journey TUI, idea to ship",
    "    feedback             Send feedback to the team",
    "    completion <shell>   Print shell completion script",
    "",
    `  ${bold("Options")}`,
    "",
    "    --version            Print version and exit",
    "    --help               Print this help",
    "",
    `  ${muted("Docs")}              ${BRAND.WEBSITE_URL}`,
    `  ${muted("Source")}            ${BRAND.GH_URL}`,
    `  ${muted("Sui Overflow 2026")} ${BRAND.HACKATHON_URL}`,
    "",
  ];
  for (const l of lines) console.log(l);
}

async function dispatch(argv: string[]): Promise<number> {
  if (argv.length === 0) {
    const onboarding = await load("interactive-onboarding");
    await onboarding.run([]);
    return 0;
  }

  const first = argv[0];
  if (first === "--version" || first === "-v") {
    console.log(readVersion());
    return 0;
  }
  if (first === "--help" || first === "-h" || first === "help") {
    printHelp();
    return 0;
  }

  if (first === "ideas") {
    const search = await load("interactive-search");
    const fn = search.runIdeas ?? search.run;
    await fn(argv.slice(1));
    return 0;
  }

  const loader = handlers[first];
  if (!loader) {
    console.error(`unknown command: ${first}`);
    console.error(`run ${accent(`${BRAND.PRODUCT_NAME} --help`)} for usage`);
    return 1;
  }
  const mod = await loader();
  await mod.run(argv.slice(1));
  return 0;
}

const argv = process.argv.slice(2);
dispatch(argv).then(
  (code) => process.exit(code),
  (e) => {
    if (process.env.SUIPERPOWER_DEBUG) console.error(e);
    else console.error(`${BRAND.PRODUCT_NAME}: ${(e as Error).message ?? e}`);
    process.exit(3);
  },
);
