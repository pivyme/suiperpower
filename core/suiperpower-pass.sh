#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  SUIPERPOWER · Builder Pass · Terminal Share Card
#
#  Usage: bash suiperpower-pass.sh [theme] [--github-user USER] [--plain]
#  Themes: ocean (default), aqua, deepsea, frost, void, mist, sunset
# ─────────────────────────────────────────────────────────────

set -u

# ── Argument parsing ─────────────────────────────────────────
THEME="ocean"
GITHUB_USER_ARG=""
PLAIN_OUTPUT=0

while [ $# -gt 0 ]; do
  case "$1" in
    --github-user)
      if [ $# -lt 2 ]; then
        printf 'Missing username for --github-user\n' >&2
        exit 1
      fi
      GITHUB_USER_ARG="$2"; shift 2
      ;;
    --github-user=*)  GITHUB_USER_ARG="${1#*=}"; shift ;;
    --plain|--no-color) PLAIN_OUTPUT=1; shift ;;
    -h|--help)
      printf 'Usage: %s [theme] [--github-user USERNAME] [--plain]\n' "$0"
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

if [ -n "$GH_CONTRIBS" ] && [ -n "$GH_REPOS_NUM" ]; then
  PASS_GITHUB="${GH_CONTRIBS}  CONTRIBUTIONS  ·  ${GH_REPOS_NUM}  REPOS"
elif [ -n "$GH_CONTRIBS" ]; then
  PASS_GITHUB="${GH_CONTRIBS}  CONTRIBUTIONS"
elif [ -n "$GH_LOGIN" ] && [ -n "$GH_REPOS_NUM" ]; then
  PASS_GITHUB="@${GH_LOGIN}  ·  ${GH_REPOS_NUM}  REPOS"
elif [ -n "$GH_LOGIN" ]; then
  PASS_GITHUB="@${GH_LOGIN}"
else
  PASS_GITHUB="NOT  CONNECTED"
fi

# ── Project stamps (auto-detects from .suiperpower/) ────────
_PHASE_DIR="${PWD}/.suiperpower"
_p_idea="○"; _p_build="○"; _p_deploy="○"; _p_submit="○"
[ -f "$_PHASE_DIR/idea-context.md" ] && _p_idea="●"
[ -f "$_PHASE_DIR/build-context.md" ] && { _p_idea="●"; _p_build="●"; }
[ -f "$_PHASE_DIR/deploy-context.md" ] && { _p_idea="●"; _p_build="●"; _p_deploy="●"; }
[ -f "$_PHASE_DIR/submission-context.md" ] && { _p_idea="●"; _p_build="●"; _p_deploy="●"; _p_submit="●"; }

# ── Configurable fields ─────────────────────────────────────
PASS_NAME="$(_format_name)"
[ -n "$GH_LOGIN" ] && PASS_NAME="${PASS_NAME}  (@${GH_LOGIN})"
PASS_ISSUED="$(_today_issued)"
PASS_YEAR="$(date +%Y)"
PASS_TYPE="SUI BUILDER PASS"
PASS_STATUS="CERTIFIED"
FOOTER_LEFT="suiperpower.dev"
FOOTER_RIGHT="by PIVY"

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

if [ "$PLAIN_OUTPUT" = "1" ] || [ -n "${NO_COLOR:-}" ] || [ ! -t 1 ]; then
  R=""; G=""; GB=""; GD=""; GK=""; D=""; BG=""
fi

# ── Layout constants ────────────────────────────────────────
STUB_W=4                                # interior width of left ticket stub
MAIN_W=54                               # interior width of main body
LABEL_W=8
VALUE_W=$((MAIN_W - LABEL_W - 4))       # 2 left pad + label + 1 space + value + 1 right pad
WAVE_N=33                               # number of ≋ glyphs in the top/bottom wave

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
  perl -CSDA -E 'my $s=$ARGV[0]; $s =~ s/\e\[\d+(;\d+)*m//g; print length($s)' "$1"
}

# ── Stub side (left ticket stub) ────────────────────────────
# Renders: │ text │ with unicode-aware width
# mode "c" (default) centers, "l" left-aligns to a fixed indent so labels share a column
_stub_side() {
  local txt="$1" mode="${2:-c}"
  local visw pad lpad rpad indent=3
  visw=$(vlen "$txt")
  pad=$((STUB_W - visw))
  ((pad < 0)) && pad=0
  if [ "$mode" = "l" ]; then
    lpad=$indent
    ((lpad > pad)) && lpad=$pad
    rpad=$((pad - lpad))
  else
    lpad=$((pad / 2))
    rpad=$((pad - lpad))
  fi
  printf "${GD}│${BG}${GK}%*s%s%*s${R}${GD}│${R}" "$lpad" "" "$txt" "$rpad" ""
}

# Perforation column between the stub and the main body, sells the tear-off feel
_perf() {
  printf " ${GD}·${R} "
}

# ── Top / bottom borders for the whole pass ─────────────────
_border_top() {
  printf "  ${GD}╭"; rep "─" $STUB_W; printf "╮${R}"
  _perf
  printf "${GD}╭"; rep "─" $MAIN_W; printf "╮${R}"
}

_border_bot() {
  printf "  ${GD}╰"; rep "─" $STUB_W; printf "╯${R}"
  _perf
  printf "${GD}╰"; rep "─" $MAIN_W; printf "╯${R}"
}

# ── Row renderers ───────────────────────────────────────────
# Separator inside main (stub side stays unbroken)
_row_sep() {
  local stub_txt="$1" stub_mode="${2:-c}"
  printf "  "
  _stub_side "$stub_txt" "$stub_mode"
  _perf
  printf "${GD}├"; rep "╌" $MAIN_W; printf "┤${R}"
}

# Content row with left + right text in the main body
_row_lr() {
  local stub_txt="$1" main_left="$2" main_right="$3" stub_mode="${4:-c}"
  local gap=$((MAIN_W - $(vlen "$main_left") - $(vlen "$main_right")))
  ((gap < 1)) && gap=1
  printf "  "
  _stub_side "$stub_txt" "$stub_mode"
  _perf
  printf "${GD}│${BG}%s" "$main_left"
  printf "%${gap}s" ""
  printf "%s${R}${GD}│${R}" "$main_right"
}

# Content row formatted as label + value (value uses unicode-width padding)
_row_field() {
  local stub_txt="$1" label="$2" value="$3" stub_mode="${4:-c}"
  local label_disp value_pad value_visw
  label_disp=$(fixl "$label" $LABEL_W)
  value_visw=$(vlen "$value")
  value_pad=$((VALUE_W - value_visw))
  ((value_pad < 0)) && value_pad=0
  printf "  "
  _stub_side "$stub_txt" "$stub_mode"
  _perf
  printf "${GD}│${BG}  ${GK}%s${R}${BG} ${G}%s${R}${BG}%*s ${GD}│${R}" "$label_disp" "$value" "$value_pad" ""
}

_wave() {
  printf "  ${D}"
  for ((j=0; j<WAVE_N-1; j++)); do printf "≋ "; done
  printf "≋${R}\n"
}

# ── Derived display values ──────────────────────────────────
STAMP_ROW="[${_p_idea} IDEATED]  [${_p_build} BUILT]  [${_p_deploy} DEPLOYED]  [${_p_submit} SUBMITTED]"

# ── Render ──────────────────────────────────────────────────
# Ticket layout:
#   ┌─stub─┐ ┌──────────── main ────────────┐
#   │  ◠   │ │ header                       │
#   │      │ │── separator ────────────────│
#   │ SUI  │ │ data rows                    │
#   │      │ │── separator ────────────────│
#   │ PASS │ │ proof                        │
#   │      │ │── separator ────────────────│
#   │  ◡   │ │ footer                       │
#   └──────┘ └──────────────────────────────┘

echo ""
_wave
echo ""
# Abstract hatched fill for the stub (light shade, no text)
HATCH_A="░░░░"
HATCH_B="▒░▒░"
HATCH_C="░▒░▒"

# Split stamps into 2 rows so full labels survive a narrower body
STAMP_ROW_A="[${_p_idea} IDEATED]   [${_p_build} BUILT]"
STAMP_ROW_B="[${_p_deploy} DEPLOYED]  [${_p_submit} SUBMITTED]"

_border_top; echo ""
_row_lr     "$HATCH_A" "  ${GB}✦ suiperpower${R}${BG}" "${GK}N° ${PASS_YEAR}  ·  ${R}${BG}${G}${PASS_TYPE}${R}${BG}  "; echo ""
_row_sep    "$HATCH_B"; echo ""
_row_lr     "$HATCH_C" "" ""; echo ""
_row_field  "$HATCH_A" "BUILDER" "$PASS_NAME"; echo ""
_row_field  "$HATCH_B" "STATUS"  "$PASS_STATUS"; echo ""
_row_field  "$HATCH_C" "GITHUB"  "$PASS_GITHUB"; echo ""
_row_field  "$HATCH_A" "ISSUED"  "$PASS_ISSUED"; echo ""
_row_lr     "$HATCH_C" "" ""; echo ""
_row_lr     "$HATCH_A" "" ""; echo ""
_row_sep    "$HATCH_B"; echo ""
_row_lr     "$HATCH_C" "" ""; echo ""
_row_lr     "$HATCH_A" "  ${GK}STAMPS${R}${BG}   ${G}${STAMP_ROW_A}${R}${BG}" "  "; echo ""
_row_lr     "$HATCH_B" "           ${G}${STAMP_ROW_B}${R}${BG}" "  "; echo ""
_row_lr     "$HATCH_B" "" ""; echo ""
_row_lr     "$HATCH_C" "" ""; echo ""
_row_sep    "$HATCH_A"; echo ""
_row_lr     "$HATCH_B" "  ${D}${FOOTER_LEFT}${R}${BG}" "${GB}${FOOTER_RIGHT}${R}${BG}  "; echo ""
_border_bot; echo ""
echo ""
_wave
echo ""
