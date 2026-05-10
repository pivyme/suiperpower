// Shared TUI primitives. No third-party UI lib.
// Numbered list picker, prompt, fuzzy filter. Suitable for the v1 CLI;
// a richer cursor-based TUI is a post-launch upgrade.

import { createInterface } from "node:readline/promises";

import { accent, bold, dim, muted } from "./colors.js";

export interface PickItem {
  id: string;
  label: string;
  hint?: string;
  category?: string;
}

export async function prompt(question: string): Promise<string> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

export function printHeader(title: string, subtitle?: string): void {
  console.log("");
  console.log(`  ${bold(title)}${subtitle ? "  " + muted(subtitle) : ""}`);
  console.log("");
}

export function fuzzyFilter<T extends { id?: string; label: string; hint?: string }>(
  items: T[],
  query: string,
): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  const tokens = q.split(/\s+/);
  return items.filter((item) => {
    const hay = `${item.id ?? ""} ${item.label} ${item.hint ?? ""}`.toLowerCase();
    return tokens.every((t) => hay.includes(t));
  });
}

function renderList(items: PickItem[]): void {
  const widthIndex = String(items.length).length;
  for (let i = 0; i < items.length; i++) {
    const idx = String(i + 1).padStart(widthIndex, " ");
    const item = items[i];
    const line = `  ${dim(`[${idx}]`)} ${item.label}`;
    console.log(line);
    if (item.hint) console.log(`        ${muted(item.hint)}`);
  }
  console.log("");
}

export async function pick(items: PickItem[], options: { title: string; subtitle?: string; allowQuit?: boolean }): Promise<PickItem | null> {
  const allowQuit = options.allowQuit !== false;
  if (items.length === 0) {
    printHeader(options.title, "no items");
    return null;
  }
  printHeader(options.title, options.subtitle);
  renderList(items);
  while (true) {
    const ans = await prompt(`  ${dim("pick number")} ${allowQuit ? dim("(or q to quit)") : ""} ${accent(">")} `);
    if (allowQuit && (ans.toLowerCase() === "q" || ans.toLowerCase() === "quit")) return null;
    const n = Number.parseInt(ans, 10);
    if (Number.isFinite(n) && n >= 1 && n <= items.length) return items[n - 1];
    console.log(`  ${muted("not a valid number, try again")}`);
  }
}

export async function searchAndPick(
  items: PickItem[],
  options: { title: string; subtitle?: string },
): Promise<PickItem | null> {
  if (items.length === 0) {
    printHeader(options.title, "no items");
    return null;
  }
  printHeader(options.title, options.subtitle);
  console.log(`  ${dim("type to filter, blank to list all, q to quit")}`);
  console.log("");
  while (true) {
    const q = await prompt(`  ${dim("filter")} ${accent(">")} `);
    if (q.toLowerCase() === "q" || q.toLowerCase() === "quit") return null;
    const filtered = fuzzyFilter(items, q).slice(0, 25);
    if (filtered.length === 0) {
      console.log(`  ${muted("no matches")}`);
      continue;
    }
    renderList(filtered);
    const ans = await prompt(`  ${dim("pick number, or blank to refilter")} ${accent(">")} `);
    if (!ans) continue;
    const n = Number.parseInt(ans, 10);
    if (Number.isFinite(n) && n >= 1 && n <= filtered.length) return filtered[n - 1];
    console.log(`  ${muted("not a valid number")}`);
  }
}
