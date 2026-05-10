#!/usr/bin/env bash
# CLI smoke test. Builds the CLI, runs --version / --help / doctor, then runs
# init --vendor in a temporary project root and verifies skills land under all
# three agent dirs. Does not exercise the curl one-liner (that runs npm install
# globally and needs a sandboxed environment, see plans/21-TESTING-STRATEGY.md
# layer 5 + MANUAL-TODO Block G).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLI="$ROOT/dist/cli/index.js"

red()   { printf "\033[0;31m%s\033[0m\n" "$1"; }
green() { printf "\033[0;32m%s\033[0m\n" "$1"; }
log()   { printf "  > %s\n" "$1"; }
fail()  { red "  FAIL: $1"; exit 1; }
pass()  { green "  ok: $1"; }

log "building CLI"
( cd "$ROOT" && pnpm build >/dev/null )
[ -x "$CLI" ] || fail "dist/cli/index.js missing or not executable"
pass "build"

log "checking --version"
VER=$(node "$CLI" --version)
[ -n "$VER" ] || fail "--version printed nothing"
pass "version: $VER"

log "checking --help"
node "$CLI" --help >/dev/null || fail "--help exited non-zero"
pass "help"

log "checking doctor exits 0"
node "$CLI" doctor >/dev/null || fail "doctor exited non-zero, must always be 0"
pass "doctor"

log "running init --vendor in temp project"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
( cd "$TMP" && cat > package.json <<'JSON'
{"name":"suiperpower-smoke","version":"0.0.0","private":true}
JSON
)
( cd "$TMP" && node "$CLI" init --vendor >/dev/null ) || fail "init --vendor exited non-zero"

CLAUDE_DIR="$TMP/.claude/skills/suiperpower"
CODEX_DIR="$TMP/.codex/skills/suiperpower"
CURSOR_DIR="$TMP/.cursor/rules/suiperpower"

[ -d "$CLAUDE_DIR" ] || fail "no skills landed at $CLAUDE_DIR"
[ -d "$CODEX_DIR" ]  || fail "no skills landed at $CODEX_DIR"
[ -d "$CURSOR_DIR" ] || fail "no .mdc rules landed at $CURSOR_DIR"

CLAUDE_COUNT=$(find "$CLAUDE_DIR" -name SKILL.md | wc -l | tr -d ' ')
CODEX_COUNT=$(find "$CODEX_DIR" -name SKILL.md | wc -l | tr -d ' ')
CURSOR_COUNT=$(find "$CURSOR_DIR" -name '*.mdc' | wc -l | tr -d ' ')

[ "$CLAUDE_COUNT" -gt 0 ] || fail "no SKILL.md files under $CLAUDE_DIR"
[ "$CODEX_COUNT" -gt 0 ]  || fail "no SKILL.md files under $CODEX_DIR"
[ "$CURSOR_COUNT" -gt 0 ] || fail "no .mdc files under $CURSOR_DIR"

pass "init landed $CLAUDE_COUNT skills under Claude, $CODEX_COUNT under Codex, $CURSOR_COUNT .mdc rules under Cursor"

log "smoke test complete"
green "all checks passed"
