#!/usr/bin/env bash
# Verifies that web/public/setup.sh (served from suiperpower.dev/setup.sh)
# matches core/install.sh byte-for-byte. The deployed setup.sh is the canonical
# install entrypoint; if it drifts from the source-of-truth in core/, curl|bash
# users get a different install than direct callers.
#
# Run with --write to update web/public/setup.sh from core/install.sh.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SRC="$ROOT/core/install.sh"
DST="$ROOT/web/public/setup.sh"

if [ ! -f "$SRC" ]; then
  printf "  missing: %s\n" "$SRC" >&2
  exit 1
fi
if [ ! -f "$DST" ]; then
  printf "  missing: %s\n" "$DST" >&2
  exit 1
fi

if [ "${1:-}" = "--write" ]; then
  cp "$SRC" "$DST"
  printf "  synced web/public/setup.sh from core/install.sh\n"
  exit 0
fi

if ! diff -q "$SRC" "$DST" >/dev/null; then
  printf "  drift: core/install.sh and web/public/setup.sh differ\n" >&2
  printf "  fix:   pnpm setup:sync\n" >&2
  diff "$SRC" "$DST" >&2 || true
  exit 1
fi
