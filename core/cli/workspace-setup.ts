// `suiperpower workspace-setup` bootstraps a project workspace:
// - .suiperpower/ for phase-handoff context files (idea-context.md etc)
// - .suiperpower/README.md explaining what lives there
// - .env.example for shared env vars

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { BRAND } from "./branding.js";
import { bold, dim, muted, ok } from "./colors.js";
import { register as registerProject } from "./projects.js";
import { track } from "./telemetry.js";

const README = `# .${BRAND.CONFIG_DIR}/

Phase-handoff context for ${BRAND.PRODUCT_NAME_TITLE} skills lives here.

Skills append to these files as you move through the journey:

- \`idea-context.md\` written by idea-phase skills (find-next-sui-idea, validate-idea, etc.)
- \`build-context.md\` written by build-phase skills (scaffold-project, build-with-move, etc.)
- \`deploy-context.md\` written by ship-phase skills (deploy-to-testnet, deploy-to-mainnet)
- \`submission-context.md\` written by submit-to-sui-overflow
- \`learnings.md\` cross-phase notes from the learn skill

Spec: \`skills/data/specs/phase-handoff.md\` in the ${BRAND.PRODUCT_NAME} repo.

Files are append-only. Skills do not delete user-authored sections; they prepend new sections at the top with timestamps.

You can commit this directory if your team wants shared context. Add to \`.gitignore\` if you prefer per-developer state.
`;

const ENV_EXAMPLE = `# Sui RPC and wallet
SUI_RPC_URL=https://fullnode.devnet.sui.io:443
SUI_WALLET_KEYSTORE=

# Walrus aggregator + publisher (testnet defaults)
WALRUS_AGGREGATOR_URL=https://aggregator-devnet.walrus.space
WALRUS_PUBLISHER_URL=https://publisher-devnet.walrus.space

# DeepBook indexer (optional)
DEEPBOOK_INDEXER_URL=

# zkLogin OAuth client ids (only fill what you use)
ZKLOGIN_GOOGLE_CLIENT_ID=
ZKLOGIN_APPLE_CLIENT_ID=
ZKLOGIN_TWITCH_CLIENT_ID=

# Suiperpower telemetry override (off | anonymous | community)
SUIPERPOWER_TELEMETRY=

# Convex URL override for self-hosted telemetry / feedback (optional)
SUIPERPOWER_CONVEX_URL=
`;

function takeFlagValue(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1) return undefined;
  const next = args[idx + 1];
  if (!next || next.startsWith("-")) return undefined;
  return next;
}

export async function run(args: string[]): Promise<void> {
  const force = args.includes("--force") || args.includes("-f");
  const agent = args.includes("--agent");
  const concept = takeFlagValue(args, "--concept");
  const name = takeFlagValue(args, "--name");
  const root = process.cwd();
  const dir = join(root, BRAND.CONFIG_DIR);
  mkdirSync(dir, { recursive: true });

  // Register in the global project log. Idempotent.
  const project = registerProject({ path: root, name, concept });

  const wrote: string[] = [];
  const existed: string[] = [];

  const readmePath = join(dir, "README.md");
  if (!existsSync(readmePath) || force) {
    writeFileSync(readmePath, README);
    wrote.push(readmePath);
  } else {
    existed.push(readmePath);
  }

  const envPath = join(root, ".env.example");
  if (!existsSync(envPath) || force) {
    writeFileSync(envPath, ENV_EXAMPLE);
    wrote.push(envPath);
  } else {
    existed.push(envPath);
  }

  // Empty placeholders for the four context files. Skills create them on first write,
  // but laying down a stub helps users see the shape immediately.
  for (const name of ["idea-context.md", "build-context.md", "deploy-context.md", "submission-context.md"]) {
    const p = join(dir, name);
    if (!existsSync(p)) {
      writeFileSync(p, `# ${name}\n\nWritten by ${BRAND.PRODUCT_NAME} skills as you move through the journey.\n`);
      wrote.push(p);
    } else {
      existed.push(p);
    }
  }

  if (agent) {
    for (const p of wrote) console.log(`+ ${p}`);
    for (const p of existed) console.log(`= ${p}`);
    return;
  }

  console.log("");
  console.log(`  ${bold(`${BRAND.PRODUCT_NAME} workspace-setup`)}`);
  for (const p of wrote) console.log(`  ${ok("+")} ${p}`);
  for (const p of existed) console.log(`  ${dim(`= ${p}`)}`);
  console.log("");
  console.log(`  ${muted("project")}  ${project.name} ${dim(`[${project.phase}]`)}`);
  if (project.concept) console.log(`  ${muted("concept")}  ${project.concept}`);
  console.log(`  ${muted("history")}  run ${BRAND.PRODUCT_NAME} projects show ${project.name}`);
  console.log("");
  console.log(`  ${muted("commit")} ${dir} ${muted("if your team wants shared context")}`);
  console.log("");

  track({ skill: "workspace-setup", phase: "cli", status: "completed" });
}
