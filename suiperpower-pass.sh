#!/usr/bin/env bash
# Local-dev welcome screen for Suiperpower contributors. Prints a quick-reference
# of the Sui CLI commands the build / ship skills assume, plus shortcuts into
# the repo's TUIs. Not part of the published package, just a contributor helper.
#
# Usage: bash suiperpower-pass.sh
set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BOLD='\033[1m'
DIM='\033[2m'
RESET='\033[0m'

has_cmd() { command -v "$1" >/dev/null 2>&1; }

NAME="${USER:-builder}"
TODAY="$(date +%Y-%m-%d)"

printf "\n"
printf "  ${CYAN}${BOLD}suiperpower${RESET}  ${DIM}contributor pass${RESET}\n"
printf "  ${DIM}for ${NAME}, issued ${TODAY}${RESET}\n\n"

printf "  ${BOLD}Sui CLI quick reference${RESET}\n"
printf "    ${CYAN}sui client active-env${RESET}            ${DIM}current network${RESET}\n"
printf "    ${CYAN}sui client switch --env testnet${RESET}  ${DIM}switch to testnet${RESET}\n"
printf "    ${CYAN}sui client active-address${RESET}        ${DIM}current sender${RESET}\n"
printf "    ${CYAN}sui client gas${RESET}                   ${DIM}coin balances${RESET}\n"
printf "    ${CYAN}sui client faucet${RESET}                ${DIM}devnet faucet${RESET}\n"
printf "    ${CYAN}sui move build${RESET}                   ${DIM}compile package${RESET}\n"
printf "    ${CYAN}sui move test${RESET}                    ${DIM}run unit tests${RESET}\n"
printf "    ${CYAN}sui client publish --gas-budget 100000000${RESET} ${DIM}deploy${RESET}\n"
printf "\n"

printf "  ${BOLD}Suiperpower TUIs${RESET}\n"
printf "    ${CYAN}suiper${RESET}            ${DIM}interactive onboarding${RESET}\n"
printf "    ${CYAN}suiper skills${RESET}     ${DIM}browse installed skills${RESET}\n"
printf "    ${CYAN}suiper repos${RESET}      ${DIM}browse Sui ecosystem repos${RESET}\n"
printf "    ${CYAN}suiper mcps${RESET}       ${DIM}browse MCP servers${RESET}\n"
printf "    ${CYAN}suiper ideas${RESET}      ${DIM}browse curated ideas${RESET}\n"
printf "    ${CYAN}suiper journey${RESET}    ${DIM}guided idea to ship${RESET}\n"
printf "    ${CYAN}suiper doctor${RESET}     ${DIM}health check${RESET}\n"
printf "\n"

printf "  ${BOLD}Environment${RESET}\n"
if has_cmd node; then
  printf "    ${GREEN}+${RESET} node $(node -v)\n"
else
  printf "    ${YELLOW}!${RESET} node not installed\n"
fi
if has_cmd sui; then
  printf "    ${GREEN}+${RESET} sui $(sui --version 2>/dev/null | head -1 || echo installed)\n"
else
  printf "    ${YELLOW}!${RESET} sui CLI not installed (https://docs.sui.io/guides/developer/getting-started/sui-install)\n"
fi
if has_cmd suiper || has_cmd suiperpower; then
  V="$(suiper --version 2>/dev/null || suiperpower --version 2>/dev/null || echo installed)"
  printf "    ${GREEN}+${RESET} suiperpower v${V}\n"
else
  printf "    ${YELLOW}!${RESET} suiperpower not installed (run ./setup)\n"
fi
if has_cmd claude; then
  printf "    ${GREEN}+${RESET} claude (Claude Code) detected\n"
fi
if has_cmd codex; then
  printf "    ${GREEN}+${RESET} codex detected\n"
fi
if has_cmd cursor || [ -d "$HOME/.cursor" ]; then
  printf "    ${GREEN}+${RESET} cursor detected\n"
fi
printf "\n"
printf "  ${DIM}Docs https://suiperpower.dev   Repo https://github.com/kwekKwek/suiperpower${RESET}\n"
printf "\n"
