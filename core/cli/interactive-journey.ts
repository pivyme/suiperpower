// `suiperpower journey` walks the user from idea to ship.
// Each step prints the agent command to run; we never invoke the agent for the user.

import { BRAND } from "./branding.js";
import { accent, bold, dim, muted } from "./colors.js";
import { detectPreferredAgentCli, formatQuotedSkillCommand } from "./agent-cli.js";
import { pick, type PickItem } from "./interactive-universal.js";

interface Stop {
  id: string;
  label: string;
  hint: string;
  command: string;
}

const STOPS: Stop[] = [
  {
    id: "learn-or-skip",
    label: "Learn the basics (optional)",
    hint: "skip if you have shipped Sui already",
    command: '"/sui-beginner I am new to Sui, teach me the fundamentals"',
  },
  {
    id: "find-idea",
    label: "Find an idea",
    hint: "discovery and ranking from curated sources",
    command: '"/find-next-sui-idea what should I build for Sui Overflow?"',
  },
  {
    id: "validate",
    label: "Validate the idea",
    hint: "stress test, demand signal, go / no-go",
    command: '"/validate-idea here is the idea, tell me if it holds"',
  },
  {
    id: "scaffold",
    label: "Scaffold the project",
    hint: "writes initial build-context.md",
    command: '"/scaffold-project set up my workspace"',
  },
  {
    id: "build",
    label: "Build the MVP",
    hint: "guided pair-programming",
    command: '"/build-with-claude help me build the MVP step by step"',
  },
  {
    id: "review-move",
    label: "Review the Move package",
    hint: "P0 to P3 walk and OpenZeppelin migration suggestions",
    command: '"/review-move check my package for security findings"',
  },
  {
    id: "validate-business",
    label: "Validate the business model",
    hint: "5 questions, blocks ship if unanswered",
    command: '"/validate-business-model do I have a real business?"',
  },
  {
    id: "deploy-testnet",
    label: "Deploy to testnet",
    hint: "captures package id into deploy-context.md",
    command: '"/deploy-to-testnet ship to testnet"',
  },
  {
    id: "pick-track",
    label: "Pick a Sui Overflow track",
    hint: "refuses unless your integration is load-bearing",
    command: '"/pick-my-sui-track which sponsor track fits?"',
  },
  {
    id: "submit",
    label: "Submit to Sui Overflow 2026",
    hint: "deepsurge fill, preflight gate",
    command: '"/submit-to-sui-overflow prepare my submission"',
  },
];

export async function run(_args: string[]): Promise<void> {
  console.log("");
  console.log(`  ${bold(`${BRAND.PRODUCT_NAME} journey`)} ${muted("idea -> ship")}`);
  console.log(`  ${dim("pick a stop. each prints the agent command to run.")}`);

  const items: PickItem[] = STOPS.map((s) => ({ id: s.id, label: s.label, hint: s.hint }));
  const choice = await pick(items, { title: "where are you in the journey?" });
  if (!choice) return;

  const stop = STOPS.find((s) => s.id === choice.id);
  if (!stop) return;
  const cli = detectPreferredAgentCli() ?? "claude";
  console.log("");
  console.log(`  ${bold("run this in your agent")}`);
  console.log(`    ${accent(formatQuotedSkillCommand(cli, stop.command))}`);
  console.log("");
  console.log(
    `  ${muted("next stops are listed in this menu when you re-run")} ${accent(`${BRAND.PRODUCT_NAME} journey`)}`,
  );
  console.log("");
}
