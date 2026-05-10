---
name: navigate-skills
description: Browse and pick the right Suiperpower skill for the user's current goal, reading from the skills catalog. Use when the user says "what skills do I have", "list suiperpower skills", "which skill should I use for X", "show me available skills", "what can suiperpower do", "find a skill for", "navigate skills", or "I do not know which skill fits". Reads cli/data/sui-skills.json and skills/SKILL_ROUTER.md if present.
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//' || echo "anonymous")
_TEL_TIER="${_TEL_TIER:-anonymous}"
_TEL_PROMPTED=$([ -f ~/.suiperpower/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.suiperpower
echo "TELEMETRY: $_TEL_TIER"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
if [ "$_TEL_TIER" != "off" ]; then
  _TEL_EVENT='{"skill":"navigate-skills","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
  echo "$_TEL_EVENT" >> ~/.suiperpower/telemetry.jsonl 2>/dev/null || true
  _CONVEX_URL=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
  [ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" \
    -H "Content-Type: application/json" \
    -d '{"path":"telemetry:track","args":{"skill":"navigate-skills","phase":"build","status":"started","version":"0.1.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' \
    >/dev/null 2>&1 &
  true
fi
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

A meta skill. It lists what skills are installed, groups them by phase (learn / idea / build / ship / grow), and helps the user pick the right one for their current goal. It reads the canonical catalog `cli/data/sui-skills.json` and the routing rules in `skills/SKILL_ROUTER.md`. It is the answer to the question "which suiperpower skill should I use right now".

It does not run other skills. It hands the user a name and the trigger phrase to use. The user activates the chosen skill.

## When to use it

- The user says they do not know which skill applies.
- The user wants a tour of what is available before committing to a workflow.
- An agent (Claude Code, Codex, Cursor) routes a vague request here for triage.

## When NOT to use it

- The user has a clear goal that maps to one skill, hand off directly to that skill.
- The user wants to see installed skills via the CLI (`suiperpower skills`), not via an agent. The CLI command is its own surface.
- The user is asking about one specific skill's behavior, read its `SKILL.md` instead.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- The user's stated goal, even if vague ("I want to launch something on Sui", "I am stuck on Move").
- Optional: `.suiperpower/idea-context.md` or `.suiperpower/build-context.md` to constrain suggestions to the user's project shape.

If unclear, ask:

- Are you exploring (no project yet), building (have code), or shipping (ready to deploy or submit)?
- What is the friction right now: idea, code, security, deploy, growth?

## Outputs

A short response of three parts:

1. **Best fit**: one skill name, its trigger phrase, one sentence on what it will do.
2. **Adjacent options**: up to two alternatives with one-sentence reasons to pick each instead.
3. **If none fit**: a one-liner directing the user to file a skill request, with the GitHub issues URL from `cli/branding.ts`.

The skill never invents skill names. If the catalog does not contain a skill matching the user's goal, it says so.

## Workflow

1. **Load the catalog**
   - Read `cli/data/sui-skills.json` (built-in suiperpower skills) and `skills/SKILL_ROUTER.md` if present.
   - Confirm the catalog version against the installed manifest at `~/.suiperpower/skills-installed.json`. If they diverge, prefer the installed manifest, since that is what the user actually has.

2. **Classify the goal**
   - Map to a phase: learn, idea, build, ship, grow.
   - Map to a category: Move authoring, sponsor integration, design, security, deploy, hackathon submission.

3. **Match against the catalog**
   - For each skill, score the description and the trigger phrase list against the user's goal text.
   - Pick the top scorer as best fit.
   - Pick up to two adjacent skills, prefer ones in the same phase.

4. **Apply router rules**
   - If `skills/SKILL_ROUTER.md` declares a "common-wrong-pick" route for the user's phrasing, use that route's recommendation.

5. **Format the response**
   - Three parts above.
   - Always include the trigger phrase verbatim (so the user can copy-paste).
   - Always include the phase the chosen skill belongs to.

6. **Hand off**
   - The skill ends without invoking the recommended skill. The user activates it explicitly.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself:

- Did I actually read the catalog, or did I recall skill names from memory?
- Is the recommended skill name an exact match in the catalog (not a hallucination, not a near-miss)?
- Did I include the trigger phrase verbatim from the skill's description?
- Did I include adjacent options only when they are real alternatives, not filler?
- If no skill fit, did I say so plainly instead of forcing a bad match?

If any answer is no, the skill keeps working before recommending.

## References

On-demand references (load when relevant to the user's question):

- `references/phase-glossary.md`: One-paragraph definitions of learn, idea, build, ship, grow phases.
- `references/router-precedence.md`: Tie-break rules when two skills could apply.

Knowledge docs (load when scope expands beyond what is in references):

- `cli/data/sui-skills.json`: The canonical catalog of suiperpower skills.
- `skills/SKILL_ROUTER.md`: Per-trigger-phrase routing table (authored in Phase 18).

## Use in your agent

- Claude Code: `claude "/navigate-skills <your message>"`
- Codex: `codex "/navigate-skills <your message>"`
- Cursor: paste a chat message that includes a phrase like "which suiperpower skill should I use", or load `~/.cursor/rules/navigate-skills.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
