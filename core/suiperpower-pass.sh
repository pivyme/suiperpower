#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  SUIPERPOWER · Builder Pass · Terminal Welcome Card
#
#  Usage: bash suiperpower-pass.sh [theme] [--github-user USER]
#  Themes: ocean (default), aqua, deepsea, frost, void, mist, sunset
# ─────────────────────────────────────────────────────────────

set -u

# ── Argument parsing ─────────────────────────────────────────
THEME="ocean"
GITHUB_USER_ARG=""

while [ $# -gt 0 ]; do
  case "$1" in
    --github-user)    GITHUB_USER_ARG="$2"; shift 2 ;;
    --github-user=*)  GITHUB_USER_ARG="${1#*=}"; shift ;;
    -h|--help)
      printf 'Usage: %s [theme] [--github-user USERNAME]\n' "$0"
      printf 'Themes: ocean (default), aqua, deepsea, frost, void, mist, sunset\n'
      exit 0
      ;;
    *) THEME="$1"; shift ;;
  esac
done

# ── User identity ────────────────────────────────────────────
_get_name() {
  local n
  n=$(git config --global user.name 2>/dev/null) && [ -n "$n" ] && { echo "$n"; return; }
  n=$(id -F 2>/dev/null) && [ -n "$n" ] && { echo "$n"; return; }
  echo "${USER:-Builder}"
}

_format_name() {
  echo "$(_get_name)" | tr '[:lower:]' '[:upper:]' | sed 's/ /  /g'
}

_today_issued() {
  local months=("JAN" "FEB" "MAR" "APR" "MAY" "JUN" "JUL" "AUG" "SEP" "OCT" "NOV" "DEC")
  local d m y
  d=$(date +%d)
  m=${months[$(($(date +%-m) - 1))]}
  y=$(date +%Y)
  echo "${d}  ${m}  ${y}"
}

# ── GitHub fetch (gh CLI then REST fallback) ─────────────────
GH_LOGIN=""; GH_CONTRIBS=""; GH_REPOS_NUM=""; GH_FOLLOWERS_NUM=""

_gh_can_auth() { command -v gh >/dev/null 2>&1 && gh auth status >/dev/null 2>&1; }

_resolve_github_login() {
  if [ -n "$GITHUB_USER_ARG" ]; then printf '%s\n' "$GITHUB_USER_ARG"; return 0; fi
  if [ -n "${GITHUB_USER:-}" ]; then printf '%s\n' "$GITHUB_USER"; return 0; fi
  local cfg
  cfg=$(git config --global github.user 2>/dev/null)
  if [ -n "$cfg" ]; then printf '%s\n' "$cfg"; return 0; fi
  if _gh_can_auth; then gh api user --jq '.login' 2>/dev/null; return $?; fi
  return 1
}

_fetch_gh_rest() {
  local login="$1" json type
  [ -z "$login" ] && return 1
  json=$(curl -sf --max-time 3 "https://api.github.com/users/$login" 2>/dev/null) || return 1
  type=$(echo "$json" | grep '"type":' | head -1 | sed 's/.*"type":[[:space:]]*"\([^"]*\)".*/\1/')
  [ "$type" = "User" ] || return 1
  GH_LOGIN="$login"
  GH_REPOS_NUM=$(echo "$json" | grep '"public_repos":' | head -1 | tr -dc '0-9')
  GH_FOLLOWERS_NUM=$(echo "$json" | grep '"followers":' | head -1 | tr -dc '0-9')
  return 0
}

_fetch_gh_graphql() {
  local login="$1" row
  [ -z "$login" ] && return 1
  _gh_can_auth || return 1
  row=$(gh api graphql \
    -f query='query($login: String!) { user(login: $login) { login contributionsCollection { contributionCalendar { totalContributions } } repositories(privacy: PUBLIC) { totalCount } followers { totalCount } } }' \
    -F login="$login" \
    --jq '.data.user | [.login, (.contributionsCollection.contributionCalendar.totalContributions|tostring), (.repositories.totalCount|tostring), (.followers.totalCount|tostring)] | @tsv' 2>/dev/null) || return 1
  IFS=$'\t' read -r GH_LOGIN GH_CONTRIBS GH_REPOS_NUM GH_FOLLOWERS_NUM <<EOF
$row
EOF
  [ -n "$GH_LOGIN" ]
}

_load_github_stats() {
  local login
  login=$(_resolve_github_login) || return 1
  [ -n "$login" ] || return 1
  _fetch_gh_graphql "$login" || _fetch_gh_rest "$login" || return 1
  return 0
}

_load_github_stats || true

if [ -n "$GH_CONTRIBS" ]; then
  PASS_GITHUB="${GH_CONTRIBS}  CONTRIBUTIONS"
elif [ -n "$GH_LOGIN" ]; then
  PASS_GITHUB="@${GH_LOGIN}"
else
  PASS_GITHUB="NOT  CONNECTED"
fi

# ── Sui network + address (Sui-native, replaces solana's seal) ──
SUI_ENV=""
SUI_ADDR=""
if command -v sui >/dev/null 2>&1; then
  SUI_ENV=$(sui client active-env 2>/dev/null | tr '[:lower:]' '[:upper:]' | tr -d '[:space:]')
  _full=$(sui client active-address 2>/dev/null | tr -d '[:space:]')
  if [[ "$_full" == 0x* ]] && [ ${#_full} -ge 10 ]; then
    SUI_ADDR="${_full:0:6}..${_full: -4}"
  fi
fi
if [ -n "$SUI_ENV" ] && [ -n "$SUI_ADDR" ]; then
  PASS_NETWORK="▰  ${SUI_ENV}  ·  ${SUI_ADDR}"
elif [ -n "$SUI_ENV" ]; then
  PASS_NETWORK="▰  ${SUI_ENV}"
else
  PASS_NETWORK="▱  SUI  CLI  NOT  DETECTED"
fi

# ── Phase progress (auto-detects from .suiperpower/) ────────
_PHASE_DIR="${PWD}/.suiperpower"
_p_learn="●"; _p_idea="●"; _p_build="○"; _p_ship="○"; _p_grow="○"
[ -f "$_PHASE_DIR/build-context.md" ] && _p_build="●"
[ -f "$_PHASE_DIR/deploy-context.md" ] && _p_ship="●"
[ -f "$_PHASE_DIR/submission-context.md" ] && _p_grow="●"

# ── Configurable fields ─────────────────────────────────────
PASS_NAME="$(_format_name)"
[ -n "$GH_LOGIN" ] && PASS_NAME="${PASS_NAME}  (@${GH_LOGIN})"
PASS_ISSUED="$(_today_issued)"
PASS_CLASS="OVERFLOW  '26  BUILDER"
PASS_NO="0142"
TAGLINE="build something meaningful, on Sui"
ORG_FOOTER="suiperpower.dev   ◇   think · build · ship"

# ── Themes (Sui-flavored palettes) ──────────────────────────
R=$'\033[0m'

case "$THEME" in
  aqua)
    G=$'\033[38;5;87m';   GB=$'\033[1;38;5;195m'; GD=$'\033[38;5;38m'
    GK=$'\033[38;5;30m';  D=$'\033[38;5;73m';     BG=$'\033[48;5;233m'
    ;;
  deepsea)
    G=$'\033[38;5;33m';   GB=$'\033[1;38;5;75m';  GD=$'\033[38;5;25m'
    GK=$'\033[38;5;24m';  D=$'\033[38;5;67m';     BG=$'\033[48;5;232m'
    ;;
  frost)
    G=$'\033[38;5;195m';  GB=$'\033[1;38;5;255m'; GD=$'\033[38;5;152m'
    GK=$'\033[38;5;102m'; D=$'\033[38;5;188m';    BG=$'\033[48;5;234m'
    ;;
  void)
    G=$'\033[38;5;255m';  GB=$'\033[1;38;5;255m'; GD=$'\033[38;5;238m'
    GK=$'\033[38;5;240m'; D=$'\033[38;5;245m';    BG=$'\033[48;5;232m'
    ;;
  mist)
    G=$'\033[38;5;152m';  GB=$'\033[1;38;5;195m'; GD=$'\033[38;5;66m'
    GK=$'\033[38;5;59m';  D=$'\033[38;5;109m';    BG=$'\033[48;5;234m'
    ;;
  sunset)
    G=$'\033[38;5;215m';  GB=$'\033[1;38;5;223m'; GD=$'\033[38;5;131m'
    GK=$'\033[38;5;95m';  D=$'\033[38;5;180m';    BG=$'\033[48;5;233m'
    ;;
  *)  # ocean (default)
    G=$'\033[38;5;45m';   GB=$'\033[1;38;5;87m';  GD=$'\033[38;5;31m'
    GK=$'\033[38;5;24m';  D=$'\033[38;5;67m';     BG=$'\033[48;5;233m'
    ;;
esac

# ── Layout constants ────────────────────────────────────────
MW=58   # main card inner width
ROWS_TOTAL=14

# ── Helpers ─────────────────────────────────────────────────
fixl()  { printf "%-${2}.${2}s" "$1"; }
fixr()  { printf "%${2}.${2}s" "$1"; }
fixc()  {
  local txt="$1" w="$2" len=${#1}
  if ((len >= w)); then printf "%.${w}s" "$txt"
  else
    local lpad=$(( (w - len) / 2 )) rpad=$(( w - len - (w - len) / 2 ))
    printf "%*s%s%*s" "$lpad" "" "$txt" "$rpad" ""
  fi
}
rep() { printf "%0.s$1" $(seq 1 "$2"); }

vlen() {
  local stripped
  stripped=$(printf '%s' "$1" | perl -pe 's/\e\[\d+(;\d+)*m//g')
  echo ${#stripped}
}

# ── Per-row stub renderer ───────────────────────────────────
# 14-row stub: rounded corners, vertical SUIPER spelling,
# horizontal perforation marks ┄ at rows 2 and 9.
_stub() {
  case "$1" in
    0)  printf "  ${GD}╭───╮${R}" ;;
    1)  printf "  ${GD}│${BG}   ${R}${GD}│${R}" ;;
    2)  printf "  ${GD}│${BG} ${GK}┄${BG} ${R}${GD}│${R}" ;;
    3)  printf "  ${GD}│${BG} ${GB}S${BG} ${R}${GD}│${R}" ;;
    4)  printf "  ${GD}│${BG} ${GB}U${BG} ${R}${GD}│${R}" ;;
    5)  printf "  ${GD}│${BG} ${GB}I${BG} ${R}${GD}│${R}" ;;
    6)  printf "  ${GD}│${BG} ${GB}P${BG} ${R}${GD}│${R}" ;;
    7)  printf "  ${GD}│${BG} ${GB}E${BG} ${R}${GD}│${R}" ;;
    8)  printf "  ${GD}│${BG} ${GB}R${BG} ${R}${GD}│${R}" ;;
    9)  printf "  ${GD}│${BG} ${GK}┄${BG} ${R}${GD}│${R}" ;;
    10) printf "  ${GD}│${BG}   ${R}${GD}│${R}" ;;
    11) printf "  ${GD}│${BG}   ${R}${GD}│${R}" ;;
    12) printf "  ${GD}│${BG}   ${R}${GD}│${R}" ;;
    13) printf "  ${GD}╰───╯${R}" ;;
    *)  printf "       " ;;
  esac
}

# ── Main card row helpers ───────────────────────────────────
_main_top() { printf " ${GD}╭"; rep "─" $MW; printf "╮${R}"; }
_main_bot() { printf " ${GD}╰"; rep "─" $MW; printf "╯${R}"; }

_main_row() {
  local content="$1"
  local pad=$((MW - $(vlen "$1")))
  printf " ${GD}│${BG}%s" "$content"
  ((pad > 0)) && printf "%${pad}s" ""
  printf "${R}${GD}│${R}"
}

_main_rowlr() {
  local left="$1" right="$2"
  local gap=$((MW - $(vlen "$1") - $(vlen "$2")))
  printf " ${GD}│${BG}%s" "$left"
  ((gap > 0)) && printf "%${gap}s" ""
  printf "%s${R}${GD}│${R}" "$right"
}

# ── Derived display values ──────────────────────────────────
PASS_NO_FMT=$(echo "$PASS_NO" | sed 's/./& /g' | sed 's/ $//')

VAL_W=$((MW - 16))   # 2 margin + 9 label-area + 5 gap
NAME_DISP=$(fixl "$PASS_NAME" $VAL_W)
ISS_DISP=$(fixl "$PASS_ISSUED" $VAL_W)
CLS_DISP=$(fixl "$PASS_CLASS" $VAL_W)
GH_DISP=$(fixl "◆  $PASS_GITHUB" $VAL_W)
NET_DISP=$(fixl "$PASS_NETWORK" $VAL_W)

# ── Build the 14 main-card rows ─────────────────────────────
ROWS=()

# Row 0: top border
ROWS+=("$(_main_top)")

# Row 1: brand line (◇ glyph + product + pass-no)
ROWS+=("$(_main_rowlr \
  "  ${GB}◇ SUIPERPOWER${R}${BG}  ${GK}·${R}${BG}  ${G}BUILDER PASS${R}${BG}" \
  "${GK}N°${R}${BG}  ${G}${PASS_NO_FMT}${R}${BG}  ")")

# Row 2: dotted divider
ROWS+=("$(_main_row "  ${GK}$(rep '┄' $((MW-4)))${R}${BG}  ")")

# Rows 3-7: identity fields
ROWS+=("$(_main_row "  ${GK}NAME${R}${BG}         ${G}${NAME_DISP}${R}${BG}")")
ROWS+=("$(_main_row "  ${GK}ISSUED${R}${BG}       ${G}${ISS_DISP}${R}${BG}")")
ROWS+=("$(_main_row "  ${GK}CLASS${R}${BG}        ${G}${CLS_DISP}${R}${BG}")")
ROWS+=("$(_main_row "  ${GK}GITHUB${R}${BG}       ${G}${GH_DISP}${R}${BG}")")
ROWS+=("$(_main_row "  ${GK}NETWORK${R}${BG}      ${G}${NET_DISP}${R}${BG}")")

# Row 8: PHASE label divider
PHASE_LBL="  ${GK}── ${R}${BG}${G}PHASE${R}${BG} ${GK}$(rep '─' 45)${R}${BG}  "
ROWS+=("$(_main_row "$PHASE_LBL")")

# Row 9: phase chain (auto-detected dots, sleek arrow flow)
PHASE_CHAIN="  ${G}${_p_learn}${R}${BG}  ${GK}LEARN${R}${BG} ${GD}─▸${R}${BG} ${G}${_p_idea}${R}${BG}  ${GK}IDEA${R}${BG} ${GD}─▸${R}${BG} ${G}${_p_build}${R}${BG}  ${GK}BUILD${R}${BG} ${GD}─▸${R}${BG} ${G}${_p_ship}${R}${BG}  ${GK}SHIP${R}${BG} ${GD}─▸${R}${BG} ${G}${_p_grow}${R}${BG}  ${GK}GROW${R}${BG}  "
ROWS+=("$(_main_row "$PHASE_CHAIN")")

# Row 10: thin divider
ROWS+=("$(_main_row "  ${GK}$(rep '─' $((MW-4)))${R}${BG}  ")")

# Row 11: tagline (centered)
TAGLINE_C=$(fixc "$TAGLINE" $((MW-4)))
ROWS+=("$(_main_row "  ${G}${TAGLINE_C}${R}${BG}  ")")

# Row 12: org footer (centered)
ORG_C=$(fixc "$ORG_FOOTER" $((MW-4)))
ROWS+=("$(_main_row "  ${D}${ORG_C}${R}${BG}  ")")

# Row 13: bottom border
ROWS+=("$(_main_bot)")

# ── Wave scallops (Sui = water) ─────────────────────────────
_wave() {
  local n=37
  printf "  ${D}"
  for ((j=0; j<n; j++)); do printf "∼ "; done
  printf "${R}\n"
}

# ── Render ──────────────────────────────────────────────────
echo ""
_wave
for i in $(seq 0 $((ROWS_TOTAL - 1))); do
  printf '%s %s\n' "$(_stub "$i")" "${ROWS[$i]}"
done
_wave
echo ""
