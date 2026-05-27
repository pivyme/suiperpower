#!/usr/bin/env bash
# suiperpower, one-command bootstrap.
# Usage: curl -fsSL https://suiperpower.dev/setup.sh | bash
set -euo pipefail

PRODUCT_NAME="suiperpower"
SHORT_NAME="suiper"
NPM_PACKAGE="@pivyme/suiperpower"
GITHUB_REPO_URL="https://github.com/pivyme/suiperpower"
WEBSITE_URL="https://suiperpower.dev"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

log()  { printf "\n  ${GREEN}>${RESET} %s\n" "$1"; }
warn() { printf "  ${YELLOW}!${RESET} %s\n" "$1"; }
fail() { printf "\n  ${RED}x${RESET} %s\n\n" "$1" >&2; exit 1; }
ok()   { printf "  ${GREEN}+${RESET} %s\n" "$1"; }

has_cmd() { command -v "$1" >/dev/null 2>&1; }

# Banner
printf "\n"
printf "  ${CYAN}${BOLD}suiperpower${RESET}\n"
printf "  ${DIM}Build something meaningful, on Sui${RESET}\n\n"

# Prerequisites
log "Checking prerequisites"

if ! has_cmd node || ! has_cmd npm; then
  fail "Node.js and npm are required (>= 20). Install from https://nodejs.org"
fi

NODE_MAJOR=$(node -e "console.log(process.versions.node.split('.')[0])")
if [ "$NODE_MAJOR" -lt 20 ]; then
  fail "Node.js >= 20 required (found v$(node -v)). Update: https://nodejs.org"
fi
ok "Node.js $(node -v)"
ok "npm $(npm -v)"

if ! has_cmd git; then
  warn "git not found, some scaffold flows will not work. Install: https://git-scm.com"
else
  ok "git $(git --version | awk '{print $3}')"
fi

# Install suiperpower globally
if ! has_cmd "$PRODUCT_NAME" && ! has_cmd "$SHORT_NAME"; then
  log "Installing ${PRODUCT_NAME} globally"
  if ! npm install -g "$NPM_PACKAGE"; then
    warn "Global install failed. Will use npx as fallback."
  fi
fi

if has_cmd "$PRODUCT_NAME"; then
  ok "${PRODUCT_NAME} $(${PRODUCT_NAME} --version 2>/dev/null || echo installed)"
fi
if has_cmd "$SHORT_NAME"; then
  ok "${SHORT_NAME} alias ready"
fi

# Agent CLIs (best-effort, never block)
if has_cmd claude; then
  ok "Claude Code found"
else
  log "Installing Claude Code CLI"
  if npm install -g @anthropic-ai/claude-code; then
    ok "Claude Code installed"
  else
    warn "Could not install Claude Code. Install later: npm i -g @anthropic-ai/claude-code"
  fi
fi

if has_cmd codex; then
  ok "Codex found"
else
  log "Installing Codex CLI"
  if npm install -g @openai/codex; then
    ok "Codex installed"
  else
    warn "Could not install Codex. Install later: npm i -g @openai/codex"
  fi
fi

if has_cmd cursor || [ -d "$HOME/.cursor" ]; then
  ok "Cursor detected"
else
  warn "Cursor not detected. If you use Cursor, install from https://cursor.com (skills still write to ~/.cursor/rules/)"
fi

if has_cmd grok || [ -d "$HOME/.grok" ]; then
  ok "Grok Build detected"
else
  warn "Grok Build not detected. If you use Grok Build, install with: curl -fsSL https://x.ai/cli/install.sh | bash (skills still write to ~/.grok/skills/)"
fi

# Auto-install the Suiperpower plugin into Claude Code.
# Idempotent; both subcommands no-op if already added/installed. Silent failure
# (e.g. repo not yet public) falls back to the manual instructions printed below.
if has_cmd claude; then
  log "Installing suiperpower plugin in Claude Code"
  if claude plugin marketplace add pivyme/suiperpower >/dev/null 2>&1; then
    ok "marketplace added"
    if claude plugin install suiper@suiperpower >/dev/null 2>&1; then
      ok "plugin installed, skills available as /suiper:<name>"
    else
      warn "plugin install failed, run manually: claude plugin install suiper@suiperpower"
    fi
  else
    warn "marketplace add failed (repo may be private), see manual steps below"
  fi
fi

# Helper to run suiperpower
run_ss() {
  if has_cmd "$SHORT_NAME"; then
    "$SHORT_NAME" "$@"
  elif has_cmd "$PRODUCT_NAME"; then
    "$PRODUCT_NAME" "$@"
  else
    npx -y "$NPM_PACKAGE" "$@"
  fi
}

# Install skills for Codex + Cursor + Grok Build (flat copy; those tools have no
# plugin system, and Grok reads the Anthropic skill format from ~/.grok/skills/).
# Claude Code skills land via the plugin marketplace flow printed at the end,
# so we deliberately skip ~/.claude/skills/ to avoid colliding with other packs.
log "Installing journey skills (Codex + Cursor + Grok)"
mkdir -p "$HOME/.codex/skills" "$HOME/.cursor/rules" "$HOME/.grok/skills"
run_ss init

# Doctor (never blocks)
log "Running setup checks"
run_ss doctor || warn "Doctor reported issues. Run: ${SHORT_NAME} doctor"

# Bin verification (per Phase 1.5 alias decision)
if has_cmd "$PRODUCT_NAME" && has_cmd "$SHORT_NAME"; then
  V_LONG="$($PRODUCT_NAME --version 2>/dev/null || echo unknown)"
  V_SHORT="$($SHORT_NAME --version 2>/dev/null || echo unknown)"
  if [ "$V_LONG" = "$V_SHORT" ]; then
    ok "bin alias verified, both ${PRODUCT_NAME} and ${SHORT_NAME} report v${V_LONG}"
  else
    warn "bin alias mismatch: ${PRODUCT_NAME}=${V_LONG} ${SHORT_NAME}=${V_SHORT}"
  fi
fi

# Telemetry opt-in
printf "\n"
printf "  ${BOLD}Telemetry${RESET} ${DIM}(helps us improve ${PRODUCT_NAME})${RESET}\n"
printf "  ${DIM}Skill usage counts only, no code, no file paths, no PII.${RESET}\n"
printf "  ${DIM}Options: anonymous (default), off, community${RESET}\n\n"

if [ -t 0 ]; then
  printf "  Enable telemetry [off/anonymous/community]: "
  read -r TELEMETRY_CHOICE </dev/tty || TELEMETRY_CHOICE="anonymous"
  TELEMETRY_CHOICE="${TELEMETRY_CHOICE:-anonymous}"
else
  TELEMETRY_CHOICE="anonymous"
fi

case "$TELEMETRY_CHOICE" in
  off|anonymous|community) ;;
  *) TELEMETRY_CHOICE="anonymous" ;;
esac

CONFIG_DIR="$HOME/.${PRODUCT_NAME}"
mkdir -p "$CONFIG_DIR"
if [ -f "$CONFIG_DIR/config.json" ]; then
  node -e "
    const fs = require('fs');
    const p = '$CONFIG_DIR/config.json';
    const c = JSON.parse(fs.readFileSync(p, 'utf8'));
    c.telemetryTier = '$TELEMETRY_CHOICE';
    fs.writeFileSync(p, JSON.stringify(c, null, 2) + '\n');
  " 2>/dev/null || true
else
  printf '{"telemetryTier":"%s"}\n' "$TELEMETRY_CHOICE" > "$CONFIG_DIR/config.json"
fi
if [ -t 0 ]; then
  : > "$CONFIG_DIR/.telemetry-prompted"
fi
ok "Telemetry: $TELEMETRY_CHOICE"

# Install summary
printf "\n"
printf "  ${CYAN}+--------------------------------------------------------------+${RESET}\n"
printf "  ${CYAN}|${RESET} ${BOLD}Skills installed${RESET}                                              ${CYAN}|${RESET}\n"
printf "  ${CYAN}|${RESET}   ~/.codex/skills/    ~/.cursor/rules/                       ${CYAN}|${RESET}\n"
printf "  ${CYAN}|${RESET}   ~/.grok/skills/                                            ${CYAN}|${RESET}\n"
printf "  ${CYAN}|${RESET}   Claude Code: see plugin install steps below                ${CYAN}|${RESET}\n"
printf "  ${CYAN}+--------------------------------------------------------------+${RESET}\n"

# Done
printf "\n"
printf "  ${GREEN}${BOLD}Setup complete${RESET}\n\n"

printf "  ${BOLD}Your CLI${RESET} ${DIM}(${PRODUCT_NAME} and ${SHORT_NAME} are the same binary, use whichever)${RESET}\n\n"
printf "    ${BOLD}Manage${RESET}\n"
printf "      ${CYAN}${SHORT_NAME}${RESET}                      ${DIM}interactive onboarding menu${RESET}\n"
printf "      ${CYAN}${SHORT_NAME} doctor${RESET}               ${DIM}health check, never blocks${RESET}\n"
printf "      ${CYAN}${SHORT_NAME} update${RESET}               ${DIM}pull the latest skills + CLI${RESET}\n"
printf "      ${CYAN}${SHORT_NAME} init${RESET}                 ${DIM}re-run install for Codex + Cursor + Grok${RESET}\n"
printf "      ${CYAN}${SHORT_NAME} init --vendor${RESET}        ${DIM}vendor skills into the current repo${RESET}\n"
printf "      ${CYAN}${SHORT_NAME} uninstall${RESET}            ${DIM}remove tracked skills + config${RESET}\n"
printf "\n"
printf "    ${BOLD}Browse${RESET}\n"
printf "      ${CYAN}${SHORT_NAME} skills${RESET}               ${DIM}installed skills (idea, build, ship)${RESET}\n"
printf "      ${CYAN}${SHORT_NAME} repos${RESET}                ${DIM}Sui ecosystem starter repos${RESET}\n"
printf "      ${CYAN}${SHORT_NAME} mcps${RESET}                 ${DIM}MCP servers for Sui${RESET}\n"
printf "      ${CYAN}${SHORT_NAME} ideas${RESET}                ${DIM}curated build ideas${RESET}\n"
printf "      ${CYAN}${SHORT_NAME} search <q>${RESET}           ${DIM}search across all of the above${RESET}\n"
printf "\n"
printf "    ${BOLD}Work${RESET}\n"
printf "      ${CYAN}${SHORT_NAME} journey${RESET}              ${DIM}guided TUI, idea to ship${RESET}\n"
printf "      ${CYAN}${SHORT_NAME} workspace-setup${RESET}      ${DIM}seed .suiperpower/ in this repo${RESET}\n"
printf "      ${CYAN}${SHORT_NAME} feedback${RESET}             ${DIM}send a note to the team${RESET}\n"
printf "      ${CYAN}${SHORT_NAME} --help${RESET}               ${DIM}full command list${RESET}\n"

printf "\n"
printf "  ${BOLD}Claude Code, one-time install${RESET} ${DIM}(namespaced, no collision with other packs)${RESET}\n\n"
printf "    ${CYAN}claude${RESET}\n"
printf "    ${DIM}then inside Claude, run:${RESET}\n"
printf "    ${CYAN}/plugin marketplace add pivyme/suiperpower${RESET}\n"
printf "    ${CYAN}/plugin install suiper@suiperpower${RESET}\n"
printf "\n"
printf "  ${BOLD}Get started${RESET} ${DIM}(open Claude Code, Codex, Cursor, or Grok Build and ask):${RESET}\n\n"
printf "    ${CYAN}claude \"/suiper:find-next-sui-idea what should I build for Sui Overflow?\"${RESET}\n"
printf "    ${CYAN}claude \"/suiper:scaffold-project escrow with Walrus storage\"${RESET}\n"
printf "    ${CYAN}claude \"/suiper:build-with-claude help me build the MVP\"${RESET}\n"
printf "    ${CYAN}claude \"/suiper:build-with-move add the lock function\"${RESET}\n"
printf "    ${CYAN}claude \"/suiper:deploy-to-testnet\"${RESET}\n"
printf "    ${CYAN}claude \"/suiper:submit-to-sui-overflow\"${RESET}\n"
printf "\n"
printf "  ${DIM}Skills auto-route by intent inside Claude. In Codex / Cursor / Grok use the${RESET}\n"
printf "  ${DIM}bare name (no /suiper: prefix). Same trigger phrases work across all four.${RESET}\n"
printf "\n"

printf "  ${DIM}Docs   ${WEBSITE_URL}${RESET}\n"
printf "  ${DIM}Source ${GITHUB_REPO_URL}${RESET}\n"
printf "\n"
