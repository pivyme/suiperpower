// `suiperpower mcps` browses MCP servers from cli/data/sui-mcps.json.
// Picking a row prints the install command and config snippet.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { BRAND } from "./branding.js";
import { accent, bold, dim, muted } from "./colors.js";
import { searchAndPick, type PickItem } from "./interactive-universal.js";
import { getCliDataRoot } from "./paths.js";

interface Mcp {
  id: string;
  name: string;
  publisher: string;
  url: string;
  installCmd: string;
  configSnippet: string;
  description: string;
  tools: string[];
  useCases: string[];
  lastChecked: string;
}

function findCatalog(): string {
  const path = join(getCliDataRoot(), "sui-mcps.json");
  return existsSync(path) ? path : "";
}

function loadMcps(): Mcp[] {
  const path = findCatalog();
  if (!path) return [];
  try {
    const data = JSON.parse(readFileSync(path, "utf8")) as { mcps: Mcp[] };
    return data.mcps ?? [];
  } catch {
    return [];
  }
}

export async function run(args: string[]): Promise<void> {
  const json = args.includes("--json");
  const agent = args.includes("--agent");
  const all = loadMcps();

  if (json) {
    process.stdout.write(JSON.stringify(all, null, 2) + "\n");
    return;
  }

  if (agent) {
    console.log(`${BRAND.PRODUCT_NAME} mcps, ${all.length}`);
    for (const m of all) console.log(`- ${m.id} | ${m.publisher} | ${m.installCmd}`);
    return;
  }

  if (all.length === 0) {
    console.log(`  ${dim("no MCPs found")}`);
    return;
  }

  const items: PickItem[] = all.map((m) => ({
    id: m.id,
    label: m.name,
    hint: `${m.publisher}: ${m.description.slice(0, 100)}`,
  }));

  const picked = await searchAndPick(items, {
    title: `${BRAND.PRODUCT_NAME} mcps`,
    subtitle: `${all.length} servers`,
  });
  if (!picked) return;

  const m = all.find((x) => x.id === picked.id);
  if (!m) return;
  console.log("");
  console.log(`  ${bold(m.name)} ${dim(`(${m.id})`)}`);
  console.log(`  ${m.description}`);
  console.log("");
  console.log(`  ${bold("install")}`);
  console.log(`    ${accent(m.installCmd)}`);
  console.log("");
  console.log(`  ${bold("config snippet")}`);
  for (const line of m.configSnippet.split("\n")) console.log(`    ${line}`);
  console.log("");
  console.log(`  ${muted("docs:")} ${m.url}`);
  console.log("");
}
