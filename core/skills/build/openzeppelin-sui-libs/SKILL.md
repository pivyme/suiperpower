---
name: openzeppelin-sui-libs
description: Use OpenZeppelin's audited Move libraries for Sui to replace hand-rolled access control, pausable, ownable, upgradeable, and signer-registry patterns. Use when the user says "use OpenZeppelin Sui libraries", "secure primitives for Sui", "OZ on Sui", "audited Move libraries", "OZ access control on Sui", "OZ pausable Sui", or "stop hand-rolling auth on Sui". Reads .suiperpower/build-context.md if present. Loads skills/data/sui-knowledge/sponsor-docs/openzeppelin-sui.md.
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
  _TEL_EVENT='{"skill":"openzeppelin-sui-libs","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
  echo "$_TEL_EVENT" >> ~/.suiperpower/telemetry.jsonl 2>/dev/null || true
  _CONVEX_URL=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
  [ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" \
    -H "Content-Type: application/json" \
    -d '{"path":"telemetry:track","args":{"skill":"openzeppelin-sui-libs","phase":"build","status":"started","version":"0.1.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' \
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

Surveys the user's Move package, identifies hand-rolled patterns OpenZeppelin's Sui libraries replace, pulls in the right OZ modules, and rewrites the affected code paths. Reduces audit surface and bugs by swapping bespoke patterns for audited ones. Refuses to declare success unless the rewrite still passes tests.

## When to use it

- Pre-audit: identify hand-rolled access control or pausable patterns and replace with audited equivalents.
- New project: pick up OZ patterns from day one rather than rolling custom.
- Refactor: collapse duplicated boilerplate (admin-only checks, role registries) into the OZ module.

## When NOT to use it

- Toy or learning projects where hand-rolling teaches the underlying pattern.
- Patterns OZ Sui does not yet cover; verify with the latest OZ Sui module list before assuming.
- If the user's bespoke logic has constraints OZ does not match (rare); document and stay custom.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A Sui project with at least one Move package.
- Optional: `.suiperpower/build-context.md` and any prior `review-move` output.

If unclear, interview the user for:

- Which patterns are present (admin-only ops, role hierarchy, pausable, upgrade policy)?
- Are there custom patterns the team is attached to for non-technical reasons?
- What is the test coverage for the affected code paths? OZ migration without tests is dangerous.

## Outputs

- Updated `Move.toml` with pinned OZ Sui dependency.
- Move modules rewritten to use OZ primitives.
- Tests updated and passing.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## openzeppelin-sui-libs session, <timestamp>
  - oz version: <release-tag-or-commit>
  - modules adopted: <list>
  - hand-rolled patterns removed: <list>
  - test count before / after: <n> / <n>
  - open issues: <list>
  ```

The skill never deletes files outside the integration source path without explicit user confirmation.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if present.
   - Identify hand-rolled patterns: admin checks, role registries, pause/unpause, upgrade hooks.

2. **OZ module survey**
   - Cross-reference with the OZ Sui repo for current module list.
   - Pick the matching module(s).

3. **Pin the dependency**
   - Add OZ to `Move.toml` with a pinned `rev` or release tag, never `main`.
   - Run `sui move build`. Resolve any conflicts.

4. **Migration plan**
   - For each hand-rolled pattern, write down: which OZ module replaces it, which functions change, which tests cover the path.
   - Walk the plan back to the user before touching code.

5. **Refactor**
   - Replace one pattern at a time. Rebuild and run tests after each.
   - If a test fails, the migration is incomplete; do not move on.

6. **API parity check**
   - OZ Sui APIs are not one-to-one with OZ EVM APIs. Confirm semantics by reading the OZ module's source, not by analogy.
   - In particular, capability-by-reference vs by-value: OZ Sui usually wants `&Cap`.

7. **Test pass**
   - Run the full `sui move test` suite. Refuse to declare done if anything is red.
   - For each replaced pattern, confirm the new test exercises the OZ-backed path, not just the old hand-rolled one.

8. **Writeback**
   - Append session details to `.suiperpower/build-context.md`.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Is the OZ dependency pinned to a specific `rev` or release tag, not `main`?
- For every hand-rolled pattern replaced, is the corresponding test still passing and exercising the OZ path?
- Did `sui move build` produce zero warnings after the migration?
- Are all hand-rolled stubs that OZ replaces actually removed, not left as dead code?
- For capabilities, is the by-reference vs by-value choice correct (matches OZ's expectation)?
- Is the OZ version recorded in `build-context.md` so future audits can pin against it?

If any answer is no, the skill reports the gap and works through it before claiming the migration is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/oz-modules-quickref.md`: Cheat-sheet of common OZ Sui modules and the patterns they replace.
- `references/migration-from-handrolled.md`: Step-by-step pattern migrations with before/after code.
- `references/oz-pitfalls.md`: API parity surprises, version pin discipline, module-vs-package boundaries.

Knowledge docs (load when scope expands beyond what is in references):

- `skills/data/sui-knowledge/sponsor-docs/openzeppelin-sui.md`: Concepts, key modules, deeper integration notes.

## Use in your agent

- Claude Code: `claude "/openzeppelin-sui-libs <your message>"`
- Codex: `codex "/openzeppelin-sui-libs <your message>"`
- Cursor: paste a chat message that includes a phrase like "use OpenZeppelin Sui libraries", or load `~/.cursor/rules/openzeppelin-sui-libs.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
