#!/usr/bin/env bash
# Package skills for distribution.
# Emits one tarball per skill under web/public/skills/<name>.tar.gz plus an aggregate
# web/public/skills.tar.gz used by the curl-flow installer. Run via:
#   ./scripts/package-skills.sh
# or:
#   pnpm package:skills
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WEB_PUBLIC="$(cd "$ROOT/.." && pwd)/web/public"

SKILLS_ROOT="$ROOT/skills"
OUT_DIR="$WEB_PUBLIC/skills"
AGGREGATE="$WEB_PUBLIC/skills.tar.gz"
PHASES=(learn idea build ship grow)

mkdir -p "$OUT_DIR"

# Reset previous per-skill tarballs so deletions propagate.
find "$OUT_DIR" -maxdepth 1 -type f -name '*.tar.gz' -delete 2>/dev/null || true

count=0
for phase in "${PHASES[@]}"; do
  phase_dir="$SKILLS_ROOT/$phase"
  [ -d "$phase_dir" ] || continue
  for skill_dir in "$phase_dir"/*/; do
    [ -d "$skill_dir" ] || continue
    skill_name="$(basename "$skill_dir")"
    [ -f "$skill_dir/SKILL.md" ] || {
      echo "skip $phase/$skill_name (no SKILL.md)" >&2
      continue
    }
    out="$OUT_DIR/$skill_name.tar.gz"
    # Tar from skills/<phase>/ so the archive root is the skill folder name.
    tar -czf "$out" -C "$SKILLS_ROOT/$phase" "$skill_name"
    count=$((count + 1))
  done
done

# Aggregate tarball used by curl-flow install. Mirrors what the installer
# consumed before per-skill packaging existed.
tar -czf "$AGGREGATE" \
  -C "$ROOT" \
  skills/learn \
  skills/idea \
  skills/build \
  skills/ship \
  skills/data \
  skills/SKILL_ROUTER.md \
  skills/README.md

agg_size="$(du -h "$AGGREGATE" | cut -f1)"
echo "packaged $count per-skill tarballs into $OUT_DIR"
echo "aggregate: $AGGREGATE ($agg_size)"
