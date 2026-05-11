// `suiperpower skills` browses installed skills.
// Reads the skills directory shipped with this package, groups by phase,
// and prints the agent command for the picked skill.

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { BRAND } from "./branding.js";
import { accent, bold, dim, muted } from "./colors.js";
import { detectPreferredAgentCli } from "./agent-cli.js";
import { searchAndPick, type PickItem } from "./interactive-universal.js";
import { getSkillsRoot } from "./paths.js";

interface SkillInfo {
  name: string;
  phase: string;
  description: string;
}

function parseDescription(skillMd: string): string {
  // Pull the `description:` value from the frontmatter.
  const fm = skillMd.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return "";
  const desc = fm[1].match(/^description:\s*(.*)$/m);
  if (!desc) return "";
  return desc[1].replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1").trim();
}

function loadSkills(): SkillInfo[] {
  const root = getSkillsRoot();
  if (!root) return [];
  const skills: SkillInfo[] = [];
  for (const phase of readdirSync(root, { withFileTypes: true })) {
    if (!phase.isDirectory()) continue;
    const phaseDir = join(root, phase.name);
    for (const sub of readdirSync(phaseDir, { withFileTypes: true })) {
      if (!sub.isDirectory()) continue;
      const skillMdPath = join(phaseDir, sub.name, "SKILL.md");
      if (!existsSync(skillMdPath)) continue;
      const desc = parseDescription(readFileSync(skillMdPath, "utf8"));
      skills.push({ name: sub.name, phase: phase.name, description: desc });
    }
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

function parseFlags(args: string[]): { json: boolean; agent: boolean; phase: string | null } {
  let json = false;
  let agent = false;
  let phase: string | null = null;
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--json") json = true;
    else if (a === "--agent") agent = true;
    else if (a === "--phase" || a === "-p") phase = (args[++i] || "").toLowerCase();
    else if (a.startsWith("--phase=")) phase = a.slice("--phase=".length).toLowerCase();
  }
  return { json, agent, phase };
}

export async function run(args: string[]): Promise<void> {
  const { json, agent, phase } = parseFlags(args);
  let all = loadSkills();
  if (phase) all = all.filter((s) => s.phase === phase);

  if (json) {
    process.stdout.write(JSON.stringify(all, null, 2) + "\n");
    return;
  }

  if (agent) {
    console.log(`${BRAND.PRODUCT_NAME} skills — ${all.length}`);
    for (const s of all) console.log(`- ${s.name} | ${s.phase} | ${s.description}`);
    return;
  }

  if (all.length === 0) {
    console.log(`  ${dim("no skills found")}`);
    return;
  }

  const items: PickItem[] = all.map((s) => ({
    id: s.name,
    label: s.name,
    hint: `${s.phase} — ${s.description.slice(0, 100)}`,
    category: s.phase,
  }));

  const picked = await searchAndPick(items, {
    title: `${BRAND.PRODUCT_NAME} skills`,
    subtitle: `${all.length} installed`,
  });
  if (!picked) return;

  const cli = detectPreferredAgentCli() ?? "claude";
  console.log("");
  console.log(`  ${bold("run this in your agent")}`);
  console.log("");
  console.log(`    ${accent(`${cli} "/${picked.id}"`)}`);
  console.log("");
  console.log(`  ${muted("source:")} skills/${picked.category}/${picked.id}/SKILL.md`);
  console.log("");
}
