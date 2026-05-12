// Shared TUI primitives. No third-party UI lib.
// Arrow-key picker for TTYs, numbered fallback for scripts, prompt, fuzzy filter.

import { emitKeypressEvents } from "node:readline";
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

interface KeypressEvent {
  name?: string;
  ctrl?: boolean;
  sequence?: string;
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

function canUseArrowPicker(): boolean {
  return Boolean(
    process.stdin.isTTY &&
      process.stdout.isTTY &&
      typeof process.stdin.setRawMode === "function",
  );
}

function truncateForTerminal(text: string, maxColumns: number): string {
  if (maxColumns <= 0) return "";
  if (text.length <= maxColumns) return text;
  if (maxColumns <= 3) return text.slice(0, maxColumns);
  return `${text.slice(0, maxColumns - 3)}...`;
}

function renderArrowList(items: PickItem[], selected: number, allowQuit: boolean): number {
  const columns = process.stdout.columns ?? 80;
  const safeColumns = Math.max(20, columns);
  const labelColumns = Math.max(1, safeColumns - 4);
  const hintColumns = Math.max(1, safeColumns - 6);
  const controlColumns = Math.max(1, safeColumns - 2);
  let lines = 0;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isSelected = i === selected;
    const marker = isSelected ? accent(">") : " ";
    const truncatedLabel = truncateForTerminal(item.label, labelColumns);
    const label = isSelected ? bold(truncatedLabel) : truncatedLabel;
    process.stdout.write(`  ${marker} ${label}\n`);
    lines += 1;
    if (item.hint) {
      process.stdout.write(`      ${muted(truncateForTerminal(item.hint, hintColumns))}\n`);
      lines += 1;
    }
  }
  process.stdout.write("\n");
  lines += 1;
  const quitText = allowQuit ? ", q to quit" : "";
  process.stdout.write(`  ${dim(truncateForTerminal(`up/down to move, enter to pick${quitText}`, controlColumns))}\n`);
  lines += 1;
  return lines;
}

function clearRenderedLines(lines: number): void {
  if (lines <= 0) return;
  process.stdout.write(`\x1b[${lines}A\x1b[J`);
}

async function pickByNumber(items: PickItem[], options: { title: string; subtitle?: string; allowQuit?: boolean }): Promise<PickItem | null> {
  const allowQuit = options.allowQuit !== false;
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

async function pickByArrow(items: PickItem[], options: { title: string; subtitle?: string; allowQuit?: boolean }): Promise<PickItem | null> {
  const allowQuit = options.allowQuit !== false;
  printHeader(options.title, options.subtitle);

  const input = process.stdin;
  const wasRaw = input.isRaw;
  let selected = 0;
  let renderedLines = renderArrowList(items, selected, allowQuit);

  process.stdout.write("\x1b[?25l");

  return await new Promise<PickItem | null>((resolve) => {
    const cleanup = (value: PickItem | null): void => {
      input.off("keypress", onKeypress);
      if (!wasRaw) input.setRawMode(false);
      input.pause();
      process.stdout.write("\x1b[?25h");
      console.log("");
      resolve(value);
    };

    const redraw = (): void => {
      clearRenderedLines(renderedLines);
      renderedLines = renderArrowList(items, selected, allowQuit);
    };

    const onKeypress = (_chunk: string, key: KeypressEvent = {}): void => {
      if (key.ctrl && key.name === "c") {
        cleanup(null);
        process.exit(130);
      }

      if (key.name === "up" || key.name === "k") {
        selected = (selected - 1 + items.length) % items.length;
        redraw();
        return;
      }
      if (key.name === "down" || key.name === "j") {
        selected = (selected + 1) % items.length;
        redraw();
        return;
      }
      if (key.name === "home") {
        selected = 0;
        redraw();
        return;
      }
      if (key.name === "end") {
        selected = items.length - 1;
        redraw();
        return;
      }
      if (key.name === "return" || key.name === "enter") {
        cleanup(items[selected]);
        return;
      }
      if (allowQuit && (key.name === "q" || key.name === "escape")) {
        cleanup(null);
        return;
      }

      const digit = key.sequence ? Number.parseInt(key.sequence, 10) : Number.NaN;
      if (Number.isFinite(digit) && digit >= 1 && digit <= items.length) {
        cleanup(items[digit - 1]);
      }
    };

    emitKeypressEvents(input);
    input.setRawMode(true);
    input.resume();
    input.on("keypress", onKeypress);
  });
}

export async function pick(items: PickItem[], options: { title: string; subtitle?: string; allowQuit?: boolean }): Promise<PickItem | null> {
  if (items.length === 0) {
    printHeader(options.title, "no items");
    return null;
  }
  if (canUseArrowPicker()) return pickByArrow(items, options);
  return pickByNumber(items, options);
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
