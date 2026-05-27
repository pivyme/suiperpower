---
name: openzeppelin-sui-libs
description: Use OpenZeppelin's audited Move libraries on Sui (access control, pausable, ownable). Use when the user mentions OpenZeppelin, OZ, or audited Move libs.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track openzeppelin-sui-libs build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track openzeppelin-sui-libs build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Surveys the user's Move package for hand-rolled patterns that OZ Contracts for Sui (v1.1.0) replaces, pulls in the right OZ packages via MVR, and rewrites the affected code paths. The library covers three areas:

1. **Safe ownership transfer** (`openzeppelin_access`): two-step transfer and time-locked delayed transfer wrappers for `key + store` objects.
2. **Integer math** (`openzeppelin_math`): overflow-safe `mul_div`, `sqrt`, `log2`, `log10`, `average`, shift ops, modular arithmetic, `u512` wide type, and decimal scaling.
3. **Fixed-point math** (`openzeppelin_fp_math`): `UD30x9` (unsigned) and `SD29x9` (signed) decimal types with 9 decimal places, matching Sui coin precision.

That is the complete scope. There is no access_control role registry, no pausable, no ownable, no upgradeable wrapper in OZ Sui. If the user needs those patterns, they stay hand-rolled.

## When to use it

- Admin capabilities that need safe two-step or time-locked ownership handoff.
- Arithmetic-heavy DeFi logic (AMMs, lending, vaults) where hand-rolled `mul_div` or fixed-point math is a liability.
- Decimal scaling between tokens with different precision (e.g., 6-decimal USDC to 9-decimal Sui coins).

## When NOT to use it

- Patterns OZ Sui does not cover: role-based access control, pausable, multi-sig. Those stay hand-rolled.
- Toy projects where hand-rolling teaches the underlying pattern.
- If the user's bespoke logic has constraints OZ wrappers do not match (rare); document and stay custom.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A Sui project with at least one Move package.
- Optional: `.suiperpower/build-context.md` and any prior `review-move` output.

If unclear, interview the user for:

- Which patterns are present (admin cap transfer, time-locked actions, hand-rolled arithmetic)?
- Are there custom patterns the team is attached to for non-technical reasons?
- What is the test coverage for the affected code paths? OZ migration without tests is dangerous.

## Outputs

- Updated `Move.toml` with MVR dependencies for the adopted OZ packages.
- Move modules rewritten to use OZ primitives.
- Tests updated and passing.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## openzeppelin-sui-libs session, <timestamp>
  - oz version: 1.1.0 (contracts-sui)
  - packages adopted: <list of openzeppelin_access, openzeppelin_math, openzeppelin_fp_math>
  - hand-rolled patterns removed: <list>
  - test count before / after: <n> / <n>
  - open issues: <list>
  ```

The skill never deletes files outside the integration source path without explicit user confirmation.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if present.
   - Identify hand-rolled patterns: admin cap transfers, manual delay logic, unsafe arithmetic.

2. **OZ package survey**
   - Cross-reference with the three OZ packages. See `references/oz-modules-quickref.md`.
   - Pick the matching package(s). Do not import packages the project does not need.

3. **Add MVR dependencies**
   - Install the MVR CLI if not present. Add deps to `Move.toml`:
     ```toml
     openzeppelin_access = { r.mvr = "@openzeppelin-move/access" }
     openzeppelin_math = { r.mvr = "@openzeppelin-move/integer-math" }
     openzeppelin_fp_math = { r.mvr = "@openzeppelin-move/fixed-point-math" }
     ```
   - Only add the packages the project actually uses.
   - Run `sui move build`. Resolve any conflicts.

4. **Migration plan**
   - For each hand-rolled pattern, write down: which OZ module replaces it, which functions change, which tests cover the path.
   - Walk the plan back to the user before touching code.

5. **Refactor**
   - Replace one pattern at a time. Rebuild and run tests after each.
   - If a test fails, the migration is incomplete; do not move on.

6. **API check**
   - OZ Sui APIs are not one-to-one with OZ EVM APIs. Read the OZ module's source, not by analogy.
   - `two_step_transfer` wraps objects, not storage slots. `delayed_transfer` needs a `Clock` reference.
   - Math functions return `Option<T>`, not abort-on-overflow. Handle the `None` case.

7. **Test pass**
   - Run the full `sui move test` suite. Refuse to declare done if anything is red.
   - For each replaced pattern, confirm the new test exercises the OZ-backed path.

8. **Writeback**
   - Append session details to `.suiperpower/build-context.md`.

9. **Closing handoff**
   - If `.suiperpower/intent.md` exists and the session was non-trivial (OZ modules pinned in `Move.toml`, hand-rolled patterns migrated to OZ-backed paths, capability-by-reference refactors), recommend `verify-against-intent` as the next step so the new OZ-backed surface is checked before shipping.
   - If no `intent.md` exists and the session was non-trivial, surface that gap once: offer `clarify-intent` to backfill, do not force it.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Are only the needed OZ packages added (no unused deps)?
- For every hand-rolled pattern replaced, is the corresponding test still passing and exercising the OZ path?
- Did `sui move build` produce zero errors after the migration?
- Are all hand-rolled stubs that OZ replaces actually removed, not left as dead code?
- For `two_step_transfer`: is the wrapper owned by the correct address, and is `accept_transfer` tested?
- For `delayed_transfer`: is the `min_delay_ms` set to a sane value, and is the `Clock` passed correctly?
- For math: are `Option` return values from `mul_div`/`inv_mod` handled (not blindly unwrapped)?
- Are the OZ packages recorded in `build-context.md` so future audits can trace them?

If any answer is no, the skill reports the gap and works through it before claiming the migration is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/oz-modules-quickref.md`: All three OZ packages, their modules, types, and function signatures.
- `references/migration-from-handrolled.md`: Step-by-step pattern migrations with before/after code.
- `references/oz-pitfalls.md`: API parity surprises, version discipline, common mistakes.

Knowledge docs (load when scope expands beyond what is in references):

- `skills/data/sui-knowledge/sponsor-docs/openzeppelin-sui.md`: Overview, correct repo URLs, deeper integration notes.

## Use in your agent

- Claude Code: `claude "/suiper:openzeppelin-sui-libs <your message>"`
- Codex: `codex "/openzeppelin-sui-libs <your message>"`
- Grok Build: run `grok`, then `/openzeppelin-sui-libs <your message>` in the session
- Cursor: paste a chat message that includes a phrase like "use OpenZeppelin Sui libraries", or load `~/.cursor/rules/openzeppelin-sui-libs.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
