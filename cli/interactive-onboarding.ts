// First-run TUI when the user types `suiperpower` with no args.
// Each option prints the agent command the user should run; we never invoke the agent for them.

import { BRAND } from "./branding.js";
import { accent, bold, dim, muted } from "./colors.js";
import { detectPreferredAgentCli, getAgentMeta } from "./agent-cli.js";
import { pick, type PickItem } from "./interactive-universal.js";
import { printBanner } from "./banner.js";

const OPTIONS: { item: PickItem; command: string }[] = [
  {
    item: { id: "find-idea", label: "Find an idea to build", hint: "discover and rank Sui-fit ideas" },
    command: '"/find-next-sui-idea what should I build for Sui Overflow?"',
  },
  {
    item: { id: "scaffold", label: "Scaffold a project", hint: "lay down a starter that fits your idea" },
    command: '"/scaffold-project set up my workspace"',
  },
  {
    item: { id: "build", label: "Build with Claude / Codex / Cursor", hint: "guided pair-programming through the MVP" },
    command: '"/build-with-claude help me build the MVP"',
  },
  {
    item: { id: "review-move", label: "Review my Move package", hint: "P0-P3 walk and OZ migration suggestions" },
    command: '"/review-move check my Move package for security issues"',
  },
  {
    item: { id: "deploy", label: "Deploy to testnet or mainnet", hint: "preflight gate, captures package id" },
    command: '"/deploy-to-testnet ship it"',
  },
  {
    item: { id: "submit", label: "Submit to Sui Overflow 2026", hint: "deepsurge fill, preflight gate, captures submission-context" },
    command: '"/submit-to-sui-overflow prepare my submission"',
  },
  {
    item: { id: "browse", label: "Browse the catalog", hint: "repos, MCPs, ecosystem skills, ideas" },
    command: `${BRAND.PRODUCT_NAME} search`,
  },
  {
    item: { id: "doctor", label: "Run health check", hint: "node, agents, Sui CLI, skills, catalog" },
    command: `${BRAND.PRODUCT_NAME} doctor`,
  },
  {
    item: { id: "update", label: `Update ${BRAND.PRODUCT_NAME}`, hint: "pull latest skills and CLI" },
    command: `${BRAND.PRODUCT_NAME} update`,
  },
];

export async function run(_args: string[]): Promise<void> {
  printBanner();
  console.log(`  ${dim("docs")}    ${muted(BRAND.WEBSITE_URL)}`);
  console.log(`  ${dim("source")}  ${muted(BRAND.GH_URL)}`);
  console.log("");

  const choice = await pick(
    OPTIONS.map((o) => o.item),
    { title: "What do you want to do?", allowQuit: true },
  );
  if (!choice) {
    console.log(`  ${dim("nothing picked")}`);
    return;
  }
  const opt = OPTIONS.find((o) => o.item.id === choice.id);
  if (!opt) return;

  const cli = detectPreferredAgentCli();
  console.log("");
  console.log(`  ${bold("run this in your agent")}`);
  console.log("");
  if (opt.command.startsWith('"/')) {
    const meta = cli ? getAgentMeta(cli) : null;
    const which = cli ?? "claude";
    console.log(`    ${accent(`${which} ${opt.command}`)}`);
    if (!meta) {
      console.log("");
      console.log(`  ${muted("no agent CLI detected.")} install:`);
      console.log(`    ${accent("npm i -g @anthropic-ai/claude-code")}  ${muted("Claude Code")}`);
      console.log(`    ${accent("npm i -g @openai/codex")}  ${muted("Codex")}`);
    }
  } else {
    console.log(`    ${accent(opt.command)}`);
  }
  console.log("");
}
