#!/usr/bin/env node
// Package skills for distribution with deterministic tar.gz output.
// This keeps web/public/skills/index.json stable when skill contents did not
// change, so routine web builds do not dirty the working tree.

import { readFileSync, writeFileSync } from "node:fs";
import { mkdir, readdir, rm, stat } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const CORE_ROOT = resolve(SCRIPT_DIR, "..");
const REPO_ROOT = resolve(CORE_ROOT, "..");
const WEB_PUBLIC = join(REPO_ROOT, "web", "public");
const SKILLS_ROOT = join(CORE_ROOT, "skills");
const OUT_DIR = join(WEB_PUBLIC, "skills");
const AGGREGATE = join(WEB_PUBLIC, "skills.tar.gz");
const PHASES = ["learn", "idea", "build", "ship", "grow"];
const BLOCK_SIZE = 512;

function compareText(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}

function octal(value, width) {
  const text = value.toString(8);
  if (text.length > width - 1) {
    throw new Error(`tar header field too small for value ${value}`);
  }
  return text.padStart(width - 1, "0") + "\0";
}

function splitTarPath(path) {
  if (Buffer.byteLength(path) <= 100) return { name: path, prefix: "" };

  const parts = path.split("/");
  for (let i = parts.length - 1; i > 0; i -= 1) {
    const prefix = parts.slice(0, i).join("/");
    const name = parts.slice(i).join("/");
    if (Buffer.byteLength(prefix) <= 155 && Buffer.byteLength(name) <= 100) {
      return { name, prefix };
    }
  }

  throw new Error(`tar path too long: ${path}`);
}

function writeString(buf, offset, length, value) {
  const bytes = Buffer.from(value);
  if (bytes.length > length) {
    throw new Error(`tar header value too long: ${value}`);
  }
  bytes.copy(buf, offset);
}

function tarHeader(entry) {
  const header = Buffer.alloc(BLOCK_SIZE, 0);
  const { name, prefix } = splitTarPath(entry.path);

  writeString(header, 0, 100, name);
  writeString(header, 100, 8, octal(entry.mode, 8));
  writeString(header, 108, 8, octal(0, 8));
  writeString(header, 116, 8, octal(0, 8));
  writeString(header, 124, 12, octal(entry.size, 12));
  writeString(header, 136, 12, octal(0, 12));
  header.fill(0x20, 148, 156);
  writeString(header, 156, 1, entry.type);
  writeString(header, 257, 6, "ustar\0");
  writeString(header, 263, 2, "00");
  writeString(header, 265, 32, "root");
  writeString(header, 297, 32, "root");
  writeString(header, 345, 155, prefix);

  let checksum = 0;
  for (const byte of header) checksum += byte;
  writeString(header, 148, 8, checksum.toString(8).padStart(6, "0") + "\0 ");

  return header;
}

function padBlock(size) {
  const remainder = size % BLOCK_SIZE;
  return remainder === 0 ? Buffer.alloc(0) : Buffer.alloc(BLOCK_SIZE - remainder);
}

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < table.length; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (const byte of buf) {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function gzipStore(buf) {
  const blocks = [];
  for (let offset = 0; offset < buf.length; offset += 0xffff) {
    const chunk = buf.subarray(offset, Math.min(offset + 0xffff, buf.length));
    const header = Buffer.alloc(5);
    header[0] = offset + chunk.length >= buf.length ? 0x01 : 0x00;
    header.writeUInt16LE(chunk.length, 1);
    header.writeUInt16LE(~chunk.length & 0xffff, 3);
    blocks.push(header, chunk);
  }

  const trailer = Buffer.alloc(8);
  trailer.writeUInt32LE(crc32(buf), 0);
  trailer.writeUInt32LE(buf.length >>> 0, 4);

  return Buffer.concat([
    Buffer.from([0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff]),
    ...blocks,
    trailer,
  ]);
}

async function walkArchiveEntries(sourceDir, archiveRoot) {
  const entries = [];

  async function visit(fullPath, archivePath) {
    const st = await stat(fullPath);
    if (st.isDirectory()) {
      entries.push({
        fullPath,
        path: archivePath.endsWith("/") ? archivePath : `${archivePath}/`,
        type: "5",
        mode: 0o755,
        size: 0,
        data: Buffer.alloc(0),
      });

      const children = (await readdir(fullPath)).sort(compareText);
      for (const child of children) {
        await visit(join(fullPath, child), `${archivePath}/${child}`);
      }
      return;
    }

    if (!st.isFile()) return;

    const data = readFileSync(fullPath);
    entries.push({
      fullPath,
      path: archivePath,
      type: "0",
      mode: st.mode & 0o111 ? 0o755 : 0o644,
      size: data.length,
      data,
    });
  }

  await visit(sourceDir, archiveRoot);
  return entries.sort((a, b) => compareText(a.path, b.path));
}

async function writeTarGz(outPath, roots) {
  const chunks = [];

  for (const root of roots) {
    const entries = await walkArchiveEntries(root.sourceDir, root.archiveRoot);
    for (const entry of entries) {
      chunks.push(tarHeader(entry));
      if (entry.data.length > 0) {
        chunks.push(entry.data, padBlock(entry.data.length));
      }
    }
  }

  chunks.push(Buffer.alloc(BLOCK_SIZE * 2));
  const tar = Buffer.concat(chunks);
  const gz = gzipStore(tar);
  writeFileSync(outPath, gz);
}

function humanSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}K`;
  return `${(bytes / 1024 / 1024).toFixed(1)}M`;
}

async function removeOldTarballs() {
  await mkdir(OUT_DIR, { recursive: true });
  const entries = await readdir(OUT_DIR).catch(() => []);
  for (const entry of entries) {
    if (entry.endsWith(".tar.gz")) {
      await rm(join(OUT_DIR, entry), { force: true });
    }
  }
}

async function main() {
  await removeOldTarballs();

  let count = 0;
  for (const phase of PHASES) {
    const phaseDir = join(SKILLS_ROOT, phase);
    const phaseStats = await stat(phaseDir).catch(() => null);
    if (!phaseStats?.isDirectory()) continue;

    const entries = (await readdir(phaseDir)).sort(compareText);
    for (const skillName of entries) {
      const skillDir = join(phaseDir, skillName);
      const skillStats = await stat(skillDir).catch(() => null);
      if (!skillStats?.isDirectory()) continue;

      const skillMd = await stat(join(skillDir, "SKILL.md")).catch(() => null);
      if (!skillMd?.isFile()) {
        console.error(`skip ${phase}/${skillName} (no SKILL.md)`);
        continue;
      }

      await writeTarGz(join(OUT_DIR, `${skillName}.tar.gz`), [
        { sourceDir: skillDir, archiveRoot: basename(skillDir) },
      ]);
      count += 1;
    }
  }

  await writeTarGz(AGGREGATE, [
    { sourceDir: join(SKILLS_ROOT, "learn"), archiveRoot: "skills/learn" },
    { sourceDir: join(SKILLS_ROOT, "idea"), archiveRoot: "skills/idea" },
    { sourceDir: join(SKILLS_ROOT, "build"), archiveRoot: "skills/build" },
    { sourceDir: join(SKILLS_ROOT, "ship"), archiveRoot: "skills/ship" },
    { sourceDir: join(SKILLS_ROOT, "data"), archiveRoot: "skills/data" },
    { sourceDir: join(SKILLS_ROOT, "SKILL_ROUTER.md"), archiveRoot: "skills/SKILL_ROUTER.md" },
    { sourceDir: join(SKILLS_ROOT, "README.md"), archiveRoot: "skills/README.md" },
  ]);

  const aggregateSize = (await stat(AGGREGATE)).size;
  console.log(`packaged ${count} per-skill tarballs into ${OUT_DIR}`);
  console.log(`aggregate: ${AGGREGATE} (${humanSize(aggregateSize)})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
