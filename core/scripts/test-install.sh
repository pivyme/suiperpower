#!/usr/bin/env bash
# CLI smoke test. Builds the CLI, runs --version / --help / doctor, then runs
# init --vendor in a temporary project root and verifies skills land under all
# three agent dirs. Does not exercise the curl one-liner (that runs npm install
# globally and needs a sandboxed environment).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CLI="$ROOT/dist/cli/index.js"

red()   { printf "\033[0;31m%s\033[0m\n" "$1"; }
green() { printf "\033[0;32m%s\033[0m\n" "$1"; }
log()   { printf "  > %s\n" "$1"; }
fail()  { red "  FAIL: $1"; exit 1; }
pass()  { green "  ok: $1"; }

TMP=""
TMP_HOME=""
cleanup() {
  [ -n "$TMP" ] && rm -rf "$TMP"
  [ -n "$TMP_HOME" ] && rm -rf "$TMP_HOME"
}
trap cleanup EXIT

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

log "checking doctor does not initialize Sui wallet in clean HOME"
TMP_HOME=$(mktemp -d)
DOCTOR_CLEAN=$(HOME="$TMP_HOME" node "$CLI" doctor --agent)
printf "%s\n" "$DOCTOR_CLEAN" | grep -Eq "no Sui client config|Sui CLI: not installed" || fail "doctor did not report missing Sui config or missing Sui CLI"
[ ! -e "$TMP_HOME/.sui" ] || fail "doctor created ~/.sui in a clean HOME"
pass "doctor clean HOME"

log "checking global init uses Claude plugin flow"
HOME="$TMP_HOME" node "$CLI" init --agent >/dev/null || fail "global init exited non-zero"
GLOBAL_CODEX_COUNT=$(find "$TMP_HOME/.codex/skills" -mindepth 2 -maxdepth 2 -name SKILL.md | wc -l | tr -d ' ')
GLOBAL_CURSOR_COUNT=$(find "$TMP_HOME/.cursor/rules" -name '*.mdc' | wc -l | tr -d ' ')
[ "$GLOBAL_CODEX_COUNT" -gt 0 ] || fail "global init did not write Codex skills"
[ "$GLOBAL_CURSOR_COUNT" -gt 0 ] || fail "global init did not write Cursor rules"
[ ! -e "$TMP_HOME/.claude/skills" ] || fail "global init wrote flat Claude skills instead of using plugin flow"
[ -f "$TMP_HOME/.codex/skills/skills/SKILL_ROUTER.md" ] || fail "global Codex shared router missing"
grep -q "../../skills/data/sui-knowledge/03-move-and-objects.md" "$TMP_HOME/.codex/skills/build-with-move/agents/openai.yaml" || fail "global Codex knowledge paths were not rewritten"
grep -q "Shared references (inlined)" "$TMP_HOME/.cursor/rules/build-with-move.mdc" || fail "global Cursor shared references block missing"
pass "global init landed $GLOBAL_CODEX_COUNT Codex skills and $GLOBAL_CURSOR_COUNT Cursor rules, Claude stays plugin-only"

log "running init --vendor in temp project"
TMP=$(mktemp -d)
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

CLAUDE_COUNT=$(find "$CLAUDE_DIR" -maxdepth 2 -name SKILL.md | wc -l | tr -d ' ')
CODEX_COUNT=$(find "$CODEX_DIR" -maxdepth 2 -name SKILL.md | wc -l | tr -d ' ')
CURSOR_COUNT=$(find "$CURSOR_DIR" -name '*.mdc' | wc -l | tr -d ' ')

[ "$CLAUDE_COUNT" -gt 0 ] || fail "no SKILL.md files under $CLAUDE_DIR"
[ "$CODEX_COUNT" -gt 0 ]  || fail "no SKILL.md files under $CODEX_DIR"
[ "$CURSOR_COUNT" -gt 0 ] || fail "no .mdc files under $CURSOR_DIR"

pass "init landed $CLAUDE_COUNT skills under Claude, $CODEX_COUNT under Codex, $CURSOR_COUNT .mdc rules under Cursor"

log "checking shared knowledge and agent metadata"
[ -f "$CLAUDE_DIR/skills/SKILL_ROUTER.md" ] || fail "Claude shared router missing"
[ -f "$CODEX_DIR/skills/SKILL_ROUTER.md" ] || fail "Codex shared router missing"
[ -f "$CODEX_DIR/skills/data/sui-knowledge/03-move-and-objects.md" ] || fail "Codex shared Sui knowledge missing"
[ -f "$CODEX_DIR/cli/data/sui-skills.json" ] || fail "Codex catalog mirror missing"
grep -q "../../skills/data/sui-knowledge/03-move-and-objects.md" "$CODEX_DIR/build-with-move/agents/openai.yaml" || fail "Codex knowledge paths were not rewritten for install layout"
grep -q "Shared references (inlined)" "$CURSOR_DIR/build-with-move.mdc" || fail "Cursor shared references block missing"
grep -q "skills/data/sui-knowledge/03-move-and-objects.md" "$CURSOR_DIR/build-with-move.mdc" || fail "Cursor shared Sui knowledge not inlined"
pass "shared knowledge resolves for Claude, Codex, and Cursor"

log "checking built CLI catalog discovery"
DOCTOR_OUT=$(node "$CLI" doctor --agent)
printf "%s\n" "$DOCTOR_OUT" | grep -Eq "catalog: [1-9][0-9]* repos, [1-9][0-9]* mcps, [1-9][0-9]* ecosystem skills, [1-9][0-9]* ideas" || fail "doctor catalog counts are zero from built CLI"
pass "built CLI finds packaged catalogs"

log "checking workspace setup command"
( cd "$TMP" && node "$CLI" workspace-setup --agent >/dev/null ) || fail "workspace-setup exited non-zero"
[ -f "$TMP/.suiperpower/README.md" ] || fail "workspace README missing"
[ -f "$TMP/.suiperpower/idea-context.md" ] || fail "idea-context placeholder missing"
[ -f "$TMP/.env.example" ] || fail ".env.example missing"
pass "workspace-setup"

log "smoke test complete"
green "all checks passed"
