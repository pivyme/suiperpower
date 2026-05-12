// Local-only project registry. Privacy posture: nothing leaves the machine.
// Stored at ~/.suiperpower/projects.json. Tracks projects the user is building
// across phases, plus an append-only event log per project.
//
// Doubles as a CLI command module: `suiperpower projects [show|set|archive] ...`
//
// Event log grows unbounded in v1. If it ever becomes a problem we cap per
// project, not here.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, basename, resolve } from "node:path";
import { randomUUID } from "node:crypto";

import { BRAND } from "./branding.js";
import { accent, bold, dim, muted, ok } from "./colors.js";

const CFG_DIR = join(homedir(), BRAND.CONFIG_DIR);
const PROJECTS_FILE = join(CFG_DIR, "projects.json");

export type Phase = "idea" | "build" | "ship" | "grow";
export type Status = "active" | "paused" | "shipped" | "archived";

export interface ProjectEvent {
  ts: number;
  kind: "skill" | "phase" | "milestone" | "note";
  value: string;
  status?: string;
  durationMs?: number;
}

export interface ProjectLinks {
  github?: string;
  demo?: string;
  deployed?: string;
  txDigest?: string;
}

export interface Project {
  id: string;
  name: string;
  path: string;
  concept?: string;
  phase: Phase;
  status: Status;
  tags: string[];
  links: ProjectLinks;
  notes?: string;
  created: number;
  updated: number;
  events: ProjectEvent[];
}

interface ProjectsFile {
  version: 1;
  projects: Project[];
}

function readAll(): ProjectsFile {
  try {
    const raw = readFileSync(PROJECTS_FILE, "utf8");
    const parsed = JSON.parse(raw) as ProjectsFile;
    if (parsed && parsed.version === 1 && Array.isArray(parsed.projects)) return parsed;
  } catch {
    // fall through to default
  }
  return { version: 1, projects: [] };
}

function writeAll(data: ProjectsFile): void {
  mkdirSync(CFG_DIR, { recursive: true });
  writeFileSync(PROJECTS_FILE, JSON.stringify(data, null, 2) + "\n");
}

export function list(): Project[] {
  return readAll().projects;
}

export function findByPath(path: string): Project | undefined {
  const abs = resolve(path);
  return readAll().projects.find((p) => p.path === abs);
}

export function findByNameOrId(query: string): Project | undefined {
  const all = readAll().projects;
  return (
    all.find((p) => p.id === query) ??
    all.find((p) => p.name === query) ??
    all.find((p) => p.name.toLowerCase() === query.toLowerCase())
  );
}

export interface RegisterInput {
  path: string;
  name?: string;
  concept?: string;
  phase?: Phase;
}

// Register or update a project at the given path. Idempotent.
export function register(input: RegisterInput): Project {
  const data = readAll();
  const abs = resolve(input.path);
  const now = Date.now();
  const existing = data.projects.find((p) => p.path === abs);

  if (existing) {
    if (input.name) existing.name = input.name;
    if (input.concept) existing.concept = input.concept;
    if (input.phase) existing.phase = input.phase;
    existing.updated = now;
    writeAll(data);
    return existing;
  }

  const project: Project = {
    id: randomUUID(),
    name: input.name ?? basename(abs),
    path: abs,
    concept: input.concept,
    phase: input.phase ?? "idea",
    status: "active",
    tags: [],
    links: {},
    created: now,
    updated: now,
    events: [],
  };
  data.projects.push(project);
  writeAll(data);
  return project;
}

// Lazy register: returns existing project for cwd, or creates one with sensible
// defaults. Used by telemetry to attach events to a project without forcing
// the user to run workspace-setup first.
export function ensureForCwd(cwd: string = process.cwd()): Project {
  const existing = findByPath(cwd);
  if (existing) return existing;
  return register({ path: cwd });
}

export function logEvent(projectId: string, event: Omit<ProjectEvent, "ts">): void {
  const data = readAll();
  const project = data.projects.find((p) => p.id === projectId);
  if (!project) return;
  project.events.push({ ts: Date.now(), ...event });
  project.updated = Date.now();
  writeAll(data);
}

export interface UpdateInput {
  name?: string;
  concept?: string;
  phase?: Phase;
  status?: Status;
  tags?: string[];
  links?: Partial<ProjectLinks>;
  notes?: string;
}

export function update(id: string, patch: UpdateInput): Project | undefined {
  const data = readAll();
  const project = data.projects.find((p) => p.id === id);
  if (!project) return undefined;
  if (patch.name !== undefined) project.name = patch.name;
  if (patch.concept !== undefined) project.concept = patch.concept;
  if (patch.phase !== undefined) project.phase = patch.phase;
  if (patch.status !== undefined) project.status = patch.status;
  if (patch.tags !== undefined) project.tags = patch.tags;
  if (patch.links !== undefined) project.links = { ...project.links, ...patch.links };
  if (patch.notes !== undefined) project.notes = patch.notes;
  project.updated = Date.now();
  writeAll(data);
  return project;
}

// CLI command handlers below.

function formatDate(ts: number): string {
  const d = new Date(ts);
  return d.toISOString().slice(0, 10);
}

function relTime(ts: number): string {
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(ts);
}

function printList(): void {
  const all = list();
  if (all.length === 0) {
    console.log("");
    console.log(`  ${muted("No projects yet.")}`);
    console.log(
      `  ${muted("Run")} ${accent(`${BRAND.PRODUCT_NAME} workspace-setup`)} ${muted("inside a project dir to register one.")}`,
    );
    console.log("");
    return;
  }
  console.log("");
  console.log(`  ${bold("Projects")} ${muted(`(${all.length})`)}`);
  console.log("");
  const sorted = [...all].sort((a, b) => b.updated - a.updated);
  for (const p of sorted) {
    const phase = `[${p.phase}]`;
    const status = p.status === "active" ? "" : ` ${muted(`(${p.status})`)}`;
    const concept = p.concept ? ` ${muted("- " + p.concept)}` : "";
    console.log(`  ${bold(p.name)} ${dim(phase)}${status}`);
    if (concept) console.log(`    ${concept}`);
    console.log(`    ${muted(`${p.path}  ${relTime(p.updated)}`)}`);
    console.log("");
  }
}

function printShow(query: string): void {
  const p = findByNameOrId(query);
  if (!p) {
    console.error(`project not found: ${query}`);
    process.exit(1);
  }
  console.log("");
  console.log(`  ${bold(p.name)} ${dim(`[${p.phase}]`)} ${muted(`(${p.status})`)}`);
  if (p.concept) console.log(`  ${p.concept}`);
  console.log("");
  console.log(`  ${muted("Path")}     ${p.path}`);
  console.log(`  ${muted("Created")}  ${formatDate(p.created)}`);
  console.log(`  ${muted("Updated")}  ${relTime(p.updated)}`);
  if (p.tags.length > 0) console.log(`  ${muted("Tags")}     ${p.tags.join(", ")}`);
  const linkEntries = Object.entries(p.links).filter(([, v]) => Boolean(v));
  if (linkEntries.length > 0) {
    console.log("");
    console.log(`  ${bold("Links")}`);
    for (const [k, v] of linkEntries) console.log(`    ${muted(k.padEnd(9))} ${v}`);
  }
  if (p.notes) {
    console.log("");
    console.log(`  ${bold("Notes")}`);
    console.log(`    ${p.notes}`);
  }
  if (p.events.length > 0) {
    console.log("");
    console.log(`  ${bold("Recent activity")}`);
    const recent = p.events.slice(-20).reverse();
    for (const e of recent) {
      const status = e.status ? ` ${muted(e.status)}` : "";
      const dur = e.durationMs ? muted(` (${Math.round(e.durationMs / 100) / 10}s)`) : "";
      console.log(
        `    ${muted(relTime(e.ts).padEnd(10))} ${dim(e.kind)} ${e.value}${status}${dur}`,
      );
    }
  }
  console.log("");
}

function printSet(args: string[]): void {
  const [query, key, ...rest] = args;
  if (!query || !key || rest.length === 0) {
    console.error("usage: projects set <name> <key> <value>");
    console.error(
      "keys: name, concept, phase, status, notes, github, demo, deployed, tag-add, tag-remove",
    );
    process.exit(1);
  }
  const p = findByNameOrId(query);
  if (!p) {
    console.error(`project not found: ${query}`);
    process.exit(1);
  }
  const value = rest.join(" ");
  const patch: UpdateInput = {};
  switch (key) {
    case "name":
      patch.name = value;
      break;
    case "concept":
      patch.concept = value;
      break;
    case "phase":
      if (!["idea", "build", "ship", "grow"].includes(value)) {
        console.error(`phase must be one of: idea | build | ship | grow`);
        process.exit(1);
      }
      patch.phase = value as Phase;
      break;
    case "status":
      if (!["active", "paused", "shipped", "archived"].includes(value)) {
        console.error(`status must be one of: active | paused | shipped | archived`);
        process.exit(1);
      }
      patch.status = value as Status;
      break;
    case "notes":
      patch.notes = value;
      break;
    case "github":
    case "demo":
    case "deployed":
    case "txDigest":
      patch.links = { [key]: value };
      break;
    case "tag-add":
      patch.tags = Array.from(new Set([...p.tags, value]));
      break;
    case "tag-remove":
      patch.tags = p.tags.filter((t) => t !== value);
      break;
    default:
      console.error(`unknown key: ${key}`);
      process.exit(1);
  }
  update(p.id, patch);
  console.log(`${ok("updated")} ${p.name} ${muted(`(${key})`)}`);
}

function printArchive(query: string): void {
  const p = findByNameOrId(query);
  if (!p) {
    console.error(`project not found: ${query}`);
    process.exit(1);
  }
  update(p.id, { status: "archived" });
  console.log(`${ok("archived")} ${p.name}`);
}

function printHelp(): void {
  const lines = [
    "",
    `  ${bold("suiperpower projects")}`,
    `  ${muted("Local project history. Stored at ~/.suiperpower/projects.json. Never leaves your machine.")}`,
    "",
    `  ${bold("Subcommands")}`,
    "",
    "    projects                         List projects",
    "    projects show <name>             Show project detail and recent activity",
    "    projects set <name> <key> <val>  Edit a project field",
    "    projects archive <name>          Mark a project archived",
    "",
    `  ${bold("Editable keys")}`,
    "",
    "    name, concept, phase, status, notes,",
    "    github, demo, deployed, txDigest,",
    "    tag-add, tag-remove",
    "",
  ];
  for (const l of lines) console.log(l);
}

export async function run(args: string[]): Promise<void> {
  const sub = args[0];
  if (!sub) return printList();
  if (sub === "--help" || sub === "-h" || sub === "help") return printHelp();
  if (sub === "show") {
    const q = args[1];
    if (!q) {
      console.error("usage: projects show <name>");
      process.exit(1);
    }
    return printShow(q);
  }
  if (sub === "set") return printSet(args.slice(1));
  if (sub === "archive") {
    const q = args[1];
    if (!q) {
      console.error("usage: projects archive <name>");
      process.exit(1);
    }
    return printArchive(q);
  }
  console.error(`unknown subcommand: ${sub}`);
  console.error(`run ${accent(`${BRAND.PRODUCT_NAME} projects --help`)} for usage`);
  process.exit(1);
}

export const __forTest = { PROJECTS_FILE };
