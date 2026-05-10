#!/usr/bin/env bash
# Auto-build loop. Long-running autonomous build with fresh-session iterations.
#
# Features:
#   - Each iteration is a fresh claude -p session (no context bloat)
#   - N-phase batching per iteration (controlled by build-prompt.md)
#   - Live stream of tool calls and text via stream-json + jq
#   - Durable steering via bigdev/claude/requirements-log.md (persists, read every iter)
#   - One-shot inject via bigdev/claude/inject.md (consumed and archived)
#   - Auto-copies .env.local-stub to .env if missing
#   - Progress dashboard: phase, unchecked count, durable rules, cumulative cost
#   - Stuck detection: bails if 2 iters in a row make zero progress
#   - Per-iteration timeout (kills runaway iterations)
#   - Auto-MAX based on remaining work if MAX unset
#   - Lock file prevents concurrent runs
#   - Desktop notifications on key events
#   - Old log retention (keeps last 30 iters)
#   - Optional pre-flight via VALIDATE=1
#
# Usage:
#   bash bigdev/claude/auto-build.sh                    # default, just go
#   MAX=20 bash bigdev/claude/auto-build.sh             # cap iterations
#   ITER_TIMEOUT=1800 bash bigdev/claude/auto-build.sh  # cap each iter to 30min (default 1800s)
#   VALIDATE=1 bash bigdev/claude/auto-build.sh         # opt-in pre-flight
#   QUIET=1 bash bigdev/claude/auto-build.sh            # text mode (no live tool stream)
#
# Mid-build steering (use the launcher subcommands, easier):
#   ./bigdev/autobuild say "always pin Move.toml deps to a specific rev"   # durable, persists
#   ./bigdev/autobuild fix "skip phase 23 for now"                         # one-shot, transient
#   ./bigdev/autobuild log                                                 # view durable rules
#
# Stop early: Ctrl-C. Lock auto-cleaned.

set -uo pipefail
# Wrapper sits two levels deep at bigdev/claude/auto-build.sh; jump to project root.
cd "$(dirname "$0")/../.."

PROMPT_FILE="bigdev/claude/build-prompt.md"
VALIDATE_FILE="bigdev/claude/validate-prompt.md"
INJECT_FILE="bigdev/claude/inject.md"
REQ_LOG="bigdev/claude/requirements-log.md"
LOG_DIR="bigdev/claude/auto-build-logs"
LOCK_FILE="bigdev/claude/auto-build.lock"
TODO_FILE="bigdev/TODO.md"

ITER_TIMEOUT="${ITER_TIMEOUT:-1800}"
LOG_RETENTION="${LOG_RETENTION:-30}"
VALIDATE="${VALIDATE:-0}"
QUIET="${QUIET:-0}"

# ---- helpers ----
notify() {
  local title="$1" msg="$2"
  if command -v osascript >/dev/null 2>&1; then
    osascript -e "display notification \"$msg\" with title \"$title\"" 2>/dev/null || true
  elif command -v notify-send >/dev/null 2>&1; then
    notify-send "$title" "$msg" 2>/dev/null || true
  fi
  echo ""
  echo "############################################################"
  echo "  $title"
  echo "  $msg"
  echo "############################################################"
}

unchecked_count() {
  local n
  n=$(grep -cE '^- \[ \]' "$TODO_FILE" 2>/dev/null)
  echo "${n:-0}"
}

current_phase() {
  local lineno
  lineno=$(grep -nE '^- \[ \]' "$TODO_FILE" 2>/dev/null | head -1 | cut -d: -f1)
  [[ -z "$lineno" ]] && echo "(none)" && return
  awk -v ln="$lineno" 'NR<ln && /^## Phase /{p=$0} END{print p}' "$TODO_FILE" | sed 's/^## //;s/ \[ \]$//;s/ \[x\]$//'
}

phase_progress() {
  local total done
  total=$(grep -cE '^## Phase ' "$TODO_FILE" 2>/dev/null)
  done=$(grep -cE '^## Phase .*\[x\]' "$TODO_FILE" 2>/dev/null)
  echo "${done:-0}/${total:-0}"
}

requirements_count() {
  if [[ ! -f "$REQ_LOG" ]]; then echo 0; return; fi
  local n
  n=$(grep -cE '^- \[' "$REQ_LOG" 2>/dev/null)
  echo "${n:-0}"
}

requirements_block() {
  if [[ ! -f "$REQ_LOG" ]]; then return; fi
  if ! grep -qE '^- \[' "$REQ_LOG" 2>/dev/null; then return; fi
  printf 'REQUIREMENTS LOG (durable steering, treat as authoritative; entries marked (promoted) are already in canonical docs and serve as audit trail only):\n\n'
  cat "$REQ_LOG"
  printf '\n---\n\n'
}

format_stream() {
  if ! command -v jq >/dev/null 2>&1; then cat; return; fi
  jq -r --unbuffered '
    if .type == "assistant" then
      (.message.content // [] | .[]?
        | if .type == "text" then .text
          elif .type == "tool_use" then
            "-> \(.name)" +
            (if .input.file_path then " :: \(.input.file_path)"
             elif .input.command then " :: $ \(.input.command | tostring | .[0:100])"
             elif .input.pattern then " :: /\(.input.pattern)/"
             elif .input.path then " :: \(.input.path)"
             elif .input.url then " :: \(.input.url)"
             elif .input.description then " :: \(.input.description)"
             else "" end)
          else empty end)
    elif .type == "user" then
      (.message.content // [] | .[]?
        | if .type == "tool_result" then
            (if .is_error == true then "  x tool error" else empty end)
          else empty end)
    elif .type == "result" then
      "\n[iter result: \(.subtype // "ok"), $\(.total_cost_usd // 0), \(.num_turns // 0) turns]"
    else empty end
  ' 2>/dev/null
}

run_claude() {
  local prompt="$1" raw_log="$2" pretty_log="$3"
  if [[ "$QUIET" == "1" ]]; then
    timeout "$ITER_TIMEOUT" claude -p \
      --dangerously-skip-permissions \
      --output-format text --model opus \
      "$prompt" 2>&1 | tee "$pretty_log"
    cp "$pretty_log" "$raw_log"
  else
    timeout "$ITER_TIMEOUT" claude -p \
      --dangerously-skip-permissions \
      --output-format stream-json --verbose --model opus \
      "$prompt" 2>&1 \
      | tee "$raw_log" \
      | format_stream \
      | tee "$pretty_log"
  fi
  return ${PIPESTATUS[0]}
}

iter_cost() {
  local raw_log="$1"
  if [[ ! -f "$raw_log" ]] || ! command -v jq >/dev/null 2>&1; then echo "0"; return; fi
  jq -rs '[.[] | select(.type == "result") | .total_cost_usd // 0] | add // 0' "$raw_log" 2>/dev/null || echo "0"
}

# ---- env auto-stub ----
if [[ ! -f ".env" ]] && [[ -f ".env.local-stub" ]]; then
  cp .env.local-stub .env
  echo "no .env found, copied .env.local-stub -> .env (local mocks active)"
fi

# ---- auto-MAX ----
if [[ -z "${MAX:-}" ]]; then
  REMAINING_INIT=$(unchecked_count)
  if [[ "$REMAINING_INIT" -le 0 ]]; then
    echo "$TODO_FILE has no unchecked steps. nothing to do."
    exit 0
  fi
  MAX=$(( REMAINING_INIT / 3 + 5 ))
  [[ $MAX -lt 5 ]] && MAX=5
  [[ $MAX -gt 60 ]] && MAX=60
fi

# ---- lock ----
if [[ -f "$LOCK_FILE" ]]; then
  EXISTING_PID=$(cat "$LOCK_FILE" 2>/dev/null || echo "")
  if [[ -n "$EXISTING_PID" ]] && kill -0 "$EXISTING_PID" 2>/dev/null; then
    echo "auto-build already running (pid $EXISTING_PID). exit." >&2
    exit 1
  fi
  rm -f "$LOCK_FILE"
fi
echo $$ > "$LOCK_FILE"
trap 'rm -f "$LOCK_FILE"' EXIT INT TERM HUP

if [[ -n "$(git status --porcelain 2>/dev/null)" ]]; then
  echo ""
  echo "working tree is dirty. uncommitted changes from a previous run?"
  echo "  git status to check. The loop will detect baseline state and may"
  echo "  try to fix or commit what it finds. Stash or commit manually if you"
  echo "  want a clean slate."
  echo ""
fi

# ---- sanity ----
if [[ ! -f "$PROMPT_FILE" ]]; then
  notify "auto-build error" "missing $PROMPT_FILE"
  exit 1
fi
mkdir -p "$LOG_DIR"

# ---- log retention ----
if [[ "$LOG_RETENTION" -gt 0 ]]; then
  ls -t "$LOG_DIR"/iter-*.log 2>/dev/null | tail -n +"$((LOG_RETENTION + 1))" | xargs -I{} rm -f {} 2>/dev/null
  ls -t "$LOG_DIR"/iter-*.raw.jsonl 2>/dev/null | tail -n +"$((LOG_RETENTION + 1))" | xargs -I{} rm -f {} 2>/dev/null
fi

# ---- pre-flight (opt-in) ----
if [[ "$VALIDATE" == "1" ]] && [[ -f "$VALIDATE_FILE" ]]; then
  TS="$(date +%Y%m%d-%H%M%S)"
  VLOG_RAW="$LOG_DIR/validate-${TS}.raw.jsonl"
  VLOG="$LOG_DIR/validate-${TS}.log"
  echo ""
  echo "============================================================"
  echo "  PRE-FLIGHT: opt-in validation pass"
  echo "  log -> $VLOG"
  echo "============================================================"
  run_claude "$(cat "$VALIDATE_FILE")" "$VLOG_RAW" "$VLOG"
  if grep -q "VALIDATION_BLOCKER" "$VLOG"; then
    notify "auto-build BLOCKED" "pre-flight blockers, see $VLOG"
    exit 1
  fi
  echo ""
  echo "pre-flight OK, starting build loop"
fi

# ---- main loop ----
PROMPT_BASE="$(cat "$PROMPT_FILE")"
TOTAL_COST="0"
PREV_REMAINING=$(unchecked_count)
STUCK_COUNT=0
START_TS=$(date +%s)

RULES_INIT=$(requirements_count)

echo ""
echo "############################################################"
echo "  auto-build START"
echo "  $(unchecked_count) unchecked steps across $(grep -cE '^## Phase ' "$TODO_FILE") phases"
echo "  starting at: $(current_phase)"
[[ "$RULES_INIT" -gt 0 ]] && echo "  $RULES_INIT durable rules in $REQ_LOG"
echo "  iter cap: $MAX  |  iter timeout: ${ITER_TIMEOUT}s  |  log retention: $LOG_RETENTION"
echo "  durable steering:  ./bigdev/autobuild say \"rule\""
echo "  one-shot inject:   ./bigdev/autobuild fix \"msg\""
echo "############################################################"

for i in $(seq 1 "$MAX"); do
  TS="$(date +%Y%m%d-%H%M%S)"
  RAW_LOG="$LOG_DIR/iter-${i}-${TS}.raw.jsonl"
  LOG="$LOG_DIR/iter-${i}-${TS}.log"

  PROMPT="$PROMPT_BASE"
  REQ_BLOCK="$(requirements_block)"
  if [[ -n "$REQ_BLOCK" ]]; then
    PROMPT="${REQ_BLOCK}

${PROMPT_BASE}"
  fi

  INJECT_NOTE=""
  if [[ -f "$INJECT_FILE" ]]; then
    INJECT_CONTENT="$(cat "$INJECT_FILE")"
    PROMPT="USER INJECT (one-shot, apply this guidance before continuing):

$INJECT_CONTENT

---

${PROMPT}"
    mv "$INJECT_FILE" "$LOG_DIR/inject-applied-${TS}.md"
    INJECT_NOTE="  user inject applied (archived to $LOG_DIR/inject-applied-${TS}.md)"
  fi

  CURRENT_REMAINING=$(unchecked_count)
  CURRENT_RULES=$(requirements_count)
  RULES_LINE=""
  [[ "$CURRENT_RULES" -gt 0 ]] && RULES_LINE="  $CURRENT_RULES durable rules active"

  echo ""
  echo "============================================================"
  echo "  iteration $i / $MAX"
  echo "  phase: $(current_phase)  ($(phase_progress) phases done)"
  echo "  $CURRENT_REMAINING steps remaining  |  cumulative \$$TOTAL_COST"
  [[ -n "$RULES_LINE" ]] && echo "$RULES_LINE"
  [[ -n "$INJECT_NOTE" ]] && echo "$INJECT_NOTE"
  echo "  log -> $LOG"
  echo "============================================================"

  run_claude "$PROMPT" "$RAW_LOG" "$LOG"
  ITER_EXIT=$?

  ITER_COST=$(iter_cost "$RAW_LOG")
  TOTAL_COST=$(awk -v a="$TOTAL_COST" -v b="$ITER_COST" 'BEGIN { printf "%.4f", a + b }')

  REMAINING=$(unchecked_count)
  SAW_DONE=0
  grep -q "ALL PHASES COMPLETE" "$LOG" && SAW_DONE=1

  if [[ "$REMAINING" -eq 0 ]]; then
    ELAPSED=$(( $(date +%s) - START_TS ))
    notify "auto-build DONE" "$i iters | \$$TOTAL_COST | ${ELAPSED}s"
    exit 0
  fi

  if [[ "$ITER_EXIT" -eq 124 ]]; then
    echo ""
    echo "  iteration timed out at ${ITER_TIMEOUT}s, moving to next iter"
  fi

  PAUSE_MSG=""
  if grep -q "<PAUSE_FOR_USER>" "$LOG"; then
    PAUSE_MSG=$(awk '/<PAUSE_FOR_USER>/{flag=1; next} /<\/PAUSE_FOR_USER>/{flag=0} flag' "$LOG")
  fi

  if [[ -n "$PAUSE_MSG" ]]; then
    notify "auto-build paused" "iter $i needs your input"
    echo ""
    echo "############################################################"
    echo "  ITERATION $i PAUSED, AWAITING YOUR INPUT"
    echo "############################################################"
    echo "$PAUSE_MSG"
    echo "############################################################"
    echo ""
    echo "Type your reply below. Press Ctrl-D on a new line when done."
    echo "Empty reply (just Ctrl-D) continues the loop without injecting anything."
    echo "Ctrl-C aborts."
    echo ""
    USER_REPLY=$(cat)
    if [[ -n "$USER_REPLY" ]]; then
      echo "$USER_REPLY" > "$INJECT_FILE"
      echo ""
      echo "reply saved as inject for next iteration"
    else
      echo ""
      echo "  (empty reply, continuing loop without inject)"
    fi
    STUCK_COUNT=0
    PREV_REMAINING="$REMAINING"
    echo ""
    echo "  iter $i done (paused). cost \$$ITER_COST. $REMAINING steps left."
    continue
  fi

  if [[ "$REMAINING" -ge "$PREV_REMAINING" ]]; then
    STUCK_COUNT=$(( STUCK_COUNT + 1 ))
    echo ""
    echo "  no progress this iter ($PREV_REMAINING -> $REMAINING unchecked)"
    if [[ "$STUCK_COUNT" -ge 2 ]]; then
      notify "auto-build STUCK" "2 iters no progress | $REMAINING left | \$$TOTAL_COST"
      echo ""
      echo "  steer with:  ./bigdev/autobuild say \"guidance\""
      echo "  or fix once: ./bigdev/autobuild fix \"do X first\""
      echo "  then re-run: ./bigdev/autobuild"
      exit 1
    fi
  else
    STUCK_COUNT=0
  fi
  PREV_REMAINING="$REMAINING"

  if [[ "$SAW_DONE" == "1" ]]; then
    echo ""
    echo "  model claimed ALL PHASES COMPLETE but $REMAINING unchecked. continuing."
  fi

  echo ""
  echo "  iter $i done. cost \$$ITER_COST. $REMAINING steps left."
done

ELAPSED=$(( $(date +%s) - START_TS ))
notify "auto-build HIT MAX" "$MAX iters | $REMAINING left | \$$TOTAL_COST | ${ELAPSED}s"
exit 1
