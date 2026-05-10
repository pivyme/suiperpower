const RESET = "\x1b[0m";
const DIM = "\x1b[2m";
const BOLD = "\x1b[1m";
const CYAN = "\x1b[36m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const MAGENTA = "\x1b[35m";

const MAX_VISIBLE = 15;

function gradientSearch(): string {
  const chars = "Search";
  const codes = [
    "\x1b[38;2;130;80;255m",
    "\x1b[38;2;160;60;240m",
    "\x1b[38;2;190;50;220m",
    "\x1b[38;2;215;40;190m",
    "\x1b[38;2;240;35;155m",
    "\x1b[38;2;255;30;130m",
  ];
  return chars.split("").map((c, i) => `${codes[i]}${c}`).join("") + RESET;
}

export interface SkillItem {
  slug: string;
  title: string;
  description: string;
  kind: "official" | "community";
  category: string;
  url: string;
  install_command: string;
  keywords: string[];
}

export interface SkillsData {
  official_skills: Array<{
    slug: string;
    title: string;
    description: string;
    github_url?: string;
    raw_url?: string;
  }>;
  community_skills: Array<{
    slug: string;
    title: string;
    description: string;
    url: string;
    category?: { labelKey: string } | null;
  }>;
}

export function buildSkillsIndex(data: SkillsData): SkillItem[] {
  const items: SkillItem[] = [];

  for (const s of data.official_skills) {
    items.push({
      slug: s.slug,
      title: s.title,
      description: s.description,
      kind: "official",
      category: "official",
      url: s.github_url ?? s.raw_url ?? "",
      install_command: "npx skills add https://github.com/solana-foundation/solana-dev-skill",
      keywords: [
        s.slug,
        ...s.slug.split("-"),
        ...s.title.toLowerCase().split(/\s+/),
        ...s.description.toLowerCase().split(/\s+/),
        "official",
      ],
    });
  }

  for (const s of data.community_skills) {
    const cat = s.category?.labelKey ?? "community";
    items.push({
      slug: s.slug,
      title: s.title,
      description: s.description,
      kind: "community",
      category: cat,
      url: s.url,
      install_command: `npx skills add ${s.url}`,
      keywords: [
        s.slug,
        ...s.slug.split("-"),
        ...s.title.toLowerCase().split(/\s+/),
        ...s.description.toLowerCase().split(/\s+/),
        cat,
        "community",
      ],
    });
  }

  return items;
}

function filterItems(items: SkillItem[], query: string): SkillItem[] {
  if (!query.trim()) return items;
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  return items.filter((item) =>
    words.every((w) => item.keywords.some((kw) => kw.includes(w))),
  );
}

export function searchSkills(items: SkillItem[], query: string): SkillItem[] {
  return filterItems(items, query);
}

function visibleLength(str: string): number {
  return str.replace(/\x1b\[[0-9;]*m/g, "").length;
}

function padVisible(str: string, width: number): string {
  const vis = visibleLength(str);
  const needed = Math.max(width - vis, 0);
  return str + " ".repeat(needed);
}

interface BuildResult {
  lines: string[];
  inputLineIndex: number;
}

function buildLines(
  query: string,
  items: SkillItem[],
  selected: number,
  rows: number,
  showDescriptions: boolean,
): BuildResult {
  const lines: string[] = [];
  const W = 62;

  lines.push(`  ${BOLD}${CYAN}solana.new${RESET}  ${DIM}Solana Skills — official & community${RESET}`);
  lines.push("");

  const topBorder = `  ╭${"─".repeat(W + 2)}╮`;
  const botBorder = `  ╰${"─".repeat(W + 2)}╯`;

  let innerContent: string;
  if (query) {
    innerContent = `${BOLD}>${RESET} ${query}`;
  } else {
    innerContent = `${BOLD}>${RESET} ${DIM}search anything across defi, tooling, infra, development${RESET}`;
  }
  const innerLine = `  │ ${padVisible(innerContent, W)} │`;

  lines.push(topBorder);
  const inputLineIndex = lines.length;
  lines.push(innerLine);
  lines.push(botBorder);

  const descToggle = showDescriptions ? "D:hide desc" : "D:show desc";
  lines.push(`  ${gradientSearch()} ${DIM}${items.length} skill${items.length === 1 ? "" : "s"}${RESET}    ${DIM}${descToggle}${RESET}`);
  lines.push("");

  const total = items.length;

  if (total === 0) {
    lines.push(`  ${DIM}No skills${query ? ` matching "${query}"` : ""}${RESET}`);
  } else {
    let start = 0;
    if (total > MAX_VISIBLE) {
      start = Math.max(0, Math.min(selected - Math.floor(MAX_VISIBLE / 2), total - MAX_VISIBLE));
    }
    const end = Math.min(start + MAX_VISIBLE, total);

    if (start > 0) {
      lines.push(`  ${DIM}  ▲ ${start} more${RESET}`);
    }

    for (let i = start; i < end; i++) {
      const item = items[i];
      const isSelected = i === selected;
      const pointer = isSelected ? `${CYAN}❯${RESET}` : " ";
      const kindTag = item.kind === "official"
        ? `${GREEN}[official]${RESET}`
        : `${YELLOW}[community]${RESET}`;
      const catTag = item.category !== "official" && item.category !== "community"
        ? `  ${DIM}${item.category}${RESET}`
        : "";
      const nameColor = isSelected ? BOLD + CYAN : BOLD;

      lines.push(`  ${pointer} ${nameColor}${item.title}${RESET}  ${kindTag}${catTag}`);

      if (showDescriptions || isSelected) {
        lines.push(`    ${DIM}${item.description}${RESET}`);
      }
      if (isSelected) {
        lines.push(`    ${MAGENTA}$ ${item.install_command}${RESET}`);
      }
      lines.push(""); // spacing between items
    }

    if (end < total) {
      lines.push(`  ${DIM}  ▼ ${total - end} more${RESET}`);
    }
  }

  const footerLines: string[] = [""];
  if (items.length > 0) {
    const sel = items[selected];
    footerLines.push(`  ${DIM}↑↓ scroll${RESET}  ${BOLD}enter${RESET} ${DIM}install${RESET}  ${DIM}esc quit${RESET}    ${MAGENTA}▸ ${sel.slug}${RESET}`);
  } else {
    footerLines.push(`  ${DIM}esc quit${RESET}`);
  }

  while (lines.length < rows - footerLines.length) {
    lines.push("");
  }
  lines.push(...footerLines);

  return { lines: lines.slice(0, rows), inputLineIndex };
}

export interface InteractiveSkillResult {
  item: SkillItem | null;
  action: "select" | "quit";
}

export async function interactiveSkills(
  data: SkillsData,
): Promise<InteractiveSkillResult> {
  const allItems = buildSkillsIndex(data);
  let query = "";
  let selected = 0;
  let filtered = filterItems(allItems, query);
  let showDescriptions = false;

  const stdin = process.stdin;
  const stdout = process.stdout;

  if (!stdin.isTTY) {
    for (const item of allItems) {
      const tag = item.kind === "official" ? "[official]" : "[community]";
      console.log(`  ${item.slug} ${tag}  ${item.description}`);
    }
    return { item: null, action: "quit" };
  }

  stdin.setRawMode(true);
  stdin.resume();
  stdin.setEncoding("utf8");

  stdout.write("\x1b[?1049h");
  stdout.write("\x1b[?25h");

  function getRows(): number {
    return stdout.rows || 24;
  }

  function draw() {
    const rows = getRows();
    const { lines, inputLineIndex } = buildLines(query, filtered, selected, rows, showDescriptions);
    const cursorPos = `\x1b[${inputLineIndex + 1};${7 + query.length}H`;
    stdout.write(`\x1b[H\x1b[J${lines.join("\n")}${cursorPos}`);
  }

  draw();

  const onResize = () => draw();
  stdout.on("resize", onResize);

  return new Promise((resolve) => {
    function cleanup() {
      stdout.removeListener("resize", onResize);
      stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
      stdout.write("\x1b[?1049l");
    }

    function onData(key: string) {
      // Ctrl+C
      if (key === "\x03") {
        cleanup();
        process.exit(0);
      }

      // Bare escape (not part of arrow sequence)
      if (key === "\x1b") {
        cleanup();
        resolve({ item: null, action: "quit" });
        return;
      }

      // Enter
      if (key === "\r" || key === "\n") {
        const item = filtered[selected] ?? null;
        cleanup();
        resolve({ item, action: "select" });
        return;
      }

      // Cmd+Backspace / Ctrl+U — clear entire line
      if (key === "\x15" || key === "\x17") {
        query = "";
        filtered = filterItems(allItems, query);
        selected = 0;
        draw();
        return;
      }

      // Backspace
      if (key === "\x7f" || key === "\b") {
        query = query.slice(0, -1);
        filtered = filterItems(allItems, query);
        selected = Math.min(selected, Math.max(filtered.length - 1, 0));
        draw();
        return;
      }

      // Arrow up
      if (key === "\x1b[A") {
        selected = Math.max(selected - 1, 0);
        draw();
        return;
      }

      // Arrow down
      if (key === "\x1b[B") {
        selected = Math.min(selected + 1, Math.max(filtered.length - 1, 0));
        draw();
        return;
      }

      // Tab
      if (key === "\t") {
        selected = (selected + 1) % Math.max(filtered.length, 1);
        draw();
        return;
      }

      // Toggle descriptions with 'd' only when search is empty
      if (key === "D") {
        showDescriptions = !showDescriptions;
        draw();
        return;
      }

      // Printable characters
      if (key.length === 1 && key >= " ") {
        query += key;
        filtered = filterItems(allItems, query);
        selected = 0;
        draw();
      }
    }

    stdin.on("data", onData);
  });
}
