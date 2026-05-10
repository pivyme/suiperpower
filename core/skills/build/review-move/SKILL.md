---
name: review-move
description: Run an in-house P0 to P3 security review on a Sui Move package and surface OpenZeppelin migration suggestions. Use when the user says "review my Move code for security", "find bugs in my Move package", "P0 P1 P2 P3 walk", "internal Move audit", "where can OpenZeppelin replace my code", "Move review", or "self-audit before OtterSec". Reads .suiperpower/build-context.md if present. Loads skills/data/guides/security-checklist.md and skills/data/sui-knowledge/sponsor-docs/openzeppelin-sui.md.
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
  _TEL_EVENT='{"skill":"review-move","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
  echo "$_TEL_EVENT" >> ~/.suiperpower/telemetry.jsonl 2>/dev/null || true
  _CONVEX_URL=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
  [ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" \
    -H "Content-Type: application/json" \
    -d '{"path":"telemetry:track","args":{"skill":"review-move","phase":"build","status":"started","version":"0.1.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' \
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

Runs an in-house security review on a Sui Move package. The output is a triaged finding list using P0 to P3 severity from `skills/data/guides/security-checklist.md`, plus a section flagging any hand-rolled patterns that OpenZeppelin Sui libraries already implement safely. The goal is to ship cleaner code into a real audit (or straight to mainnet, when an audit is not in scope) by handling the obvious classes of bugs first.

This is not a substitute for an external auditor. It is a self-review pass that removes the embarrassing bugs before paid eyes see the code.

## When to use it

- Pre-deploy review on a Move package targeting testnet promotion or mainnet.
- Self-audit before engaging OtterSec or another firm (saves audit hours by removing P0 / P1 noise).
- After a feature lands, before merging to the main branch.
- Anti-slop step required by `deploy-to-mainnet` (which refuses without recent review-move output).

## When NOT to use it

- Code does not compile, use `debug-move` first.
- Building a feature, use `build-with-move`. Reviews come after the code exists.
- Looking for OtterSec-engagement-specific prep, use `ottersec-prep`.
- Concerned about non-Move surfaces (frontend XSS, key custody in dapp UI), use the relevant skill.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A Sui Move package that compiles.
- The user's own threat model, if they have one. If not, ask three questions:
  - Who can call public entry functions, and what is the worst they could do?
  - What capabilities exist, and who holds each?
  - What invariants must hold across all states (supply conservation, ownership exclusivity, etc.)?
- Optional: `.suiperpower/build-context.md` for prior decisions.

## Outputs

A finding list, written into the project as `.suiperpower/review-<timestamp>.md`, structured by severity:

- **P0 (must fix before deploy)**: fund loss, unauthorized state mutation, capability escape.
- **P1 (high)**: significant misuse paths, denial-of-service against a user, broken invariants under specific conditions.
- **P2 (medium)**: code clarity issues that hide bugs, missing tests on entry functions, weak validation.
- **P3 (low / informational)**: style, dead code, missing comments where the WHY is non-obvious.

Each finding has: location (file:line), severity, observed pattern, why it is a problem, recommended fix.

A separate "OZ migration candidates" section names hand-rolled patterns that OpenZeppelin Sui already covers and gives the swap.

The skill writes the finding count back to `.suiperpower/build-context.md`:

```markdown
### review-move session, <timestamp>
- P0: <count>
- P1: <count>
- P2: <count>
- P3: <count>
- review file: .suiperpower/review-<timestamp>.md
- OZ swap candidates: <count>
```

## Workflow

1. **Inventory**
   - List every module, public function, capability struct, shared Object, and `init` body.
   - Identify the trust boundary, who is allowed to call what.

2. **P0 walk**
   - For every public entry, ask: can a non-authorized caller cause fund movement, supply change, or state mutation that breaks an invariant?
   - For every capability, ask: can it be created or extracted by a non-trusted path?
   - For every shared Object, ask: can two PTBs in the same checkpoint produce an inconsistent state?

3. **P1 walk**
   - For every assertion, ask: is the error code descriptive? Is there a test for the failure case?
   - For every external dependency, ask: is its rev pinned? Does it match the framework rev?
   - For every coin or balance operation, ask: is conservation maintained?

4. **P2 walk**
   - Visibility audit: is anything `public` that should be `public(package)`?
   - Test coverage on every public entry. Missing tests are a finding.
   - Magic numbers, inline strings, copy-pasted error codes.

5. **P3 walk**
   - Comments only where the WHY is non-obvious.
   - Dead code, unused imports.
   - Naming consistency.

6. **OZ migration scan**
   - Hand-rolled access control? Suggest `access_control` from OZ Sui.
   - Hand-rolled pausable pattern? Suggest the OZ pausable module.
   - Custom multisig logic? Note the OZ implementation.
   - Roll-your-own upgradable proxy? Audit very carefully and consider the OZ upgrade pattern.

7. **Triage and write**
   - Sort findings by severity, then by file location.
   - Write `.suiperpower/review-<timestamp>.md` with the structure above.
   - Append the count summary to `.suiperpower/build-context.md`.

8. **Hand off**
   - If P0 findings exist, hand off to `debug-move` or `build-with-move` to fix before continuing.
   - If the user is targeting an audit firm, hand off to `ottersec-prep` once P0 / P1 are clean.
   - If targeting mainnet, `deploy-to-mainnet` will block until P0 / P1 are zero.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself:

- Did every public entry function get reviewed for the worst-case caller? (Not just glanced at.)
- Did every capability get traced from creation to consumption to confirm no leakage path?
- Did the OZ migration scan happen, with at least a "no candidates" or a list?
- Are findings written with file:line, not vague descriptions?
- Is each P0 / P1 finding actionable (a recommended fix, not just "this looks risky")?
- Did the review surface zero findings? If yes, the review is suspicious by default. Confirm coverage by listing the entry points actually inspected.

If any answer is no, the skill keeps working before declaring the review complete.

## References

On-demand references (load when relevant to the user's question):

- `references/p0-p3-rubric.md`: Severity definitions with examples for each band.
- `references/oz-migration-candidates.md`: Hand-rolled patterns and the OZ replacement.
- `references/review-output-template.md`: Canonical format of `.suiperpower/review-<timestamp>.md`.

Knowledge docs (load when scope expands beyond what is in references):

- `skills/data/guides/security-checklist.md`: P0 to P3 security checklist for Sui Move.
- `skills/data/sui-knowledge/sponsor-docs/openzeppelin-sui.md`: OpenZeppelin Sui catalog and which patterns it covers.

## Use in your agent

- Claude Code: `claude "/review-move <your message>"`
- Codex: `codex "/review-move <your message>"`
- Cursor: paste a chat message that includes a phrase like "review my Move code for security", or load `~/.cursor/rules/review-move.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
