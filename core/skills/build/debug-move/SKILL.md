---
name: debug-move
description: Debug Sui Move compile errors, runtime aborts, or capability leaks. Use when the user has a Move error, abort code, failed PTB, or compiler issue.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track debug-move build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track debug-move build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Diagnoses Move problems methodically. Sui Move errors fall into three buckets, compile errors, runtime aborts, and capability or ownership mistakes that compile but misbehave. This skill sorts the symptom into the right bucket, then walks the matching playbook until the bug is reproduced, understood, and fixed. It does not guess. It runs the build or the test, reads the actual error, and proceeds from evidence.

## When to use it

- A `sui move build` or `sui move test` is failing and the user does not know why.
- A PTB on testnet aborted with an `abort_code` and the user wants to trace it.
- An Object will not transfer, a coin will not mint, or a shared Object cannot be locked.
- The user suspects a capability leak or an ability mismatch but cannot point at the culprit.

## When NOT to use it

- The user has not written Move yet, use `build-with-move`.
- The bug is in TypeScript dapp-kit code or PTB construction, use `ptb-composer` or the relevant frontend skill.
- The user wants a security review of a working module, use `review-move`.
- The build error is in `Move.toml` (dependency rev mismatch), this skill will route you, but resolution may belong in `scaffold-project`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A failing command and its full output (do not paraphrase the error, copy it verbatim).
- The Move source file under suspicion.
- Optional: `Move.toml`, `.suiperpower/build-context.md`, the PTB transaction digest if the error came from testnet.

If unclear, ask:

- What command did you run? Paste the exact output.
- Is this a build error, a test failure, or a runtime abort from a real transaction?
- Did the same code work yesterday? If so, what changed?

## Outputs

- A working build or a green test, with the fix applied.
- A short explanation of root cause, written in `.suiperpower/build-context.md` under a `### debug-move session, <timestamp>` heading.
- If the bug pattern is repeatable (e.g. capability leak), a note in `learnings.md` so future builds avoid it.

The skill never edits code without reading the surrounding module and confirming the change preserves intent.

## Workflow

1. **Reproduce**
   - Run the exact failing command. Confirm the error is real and consistent.
   - If the user reports a flake, run twice. Sui Move is deterministic locally; flakes usually mean a non-deterministic test (clock, randomness) or stale build artifacts.

2. **Categorize**
   - **Compile error**: `error[E...]` from the Move compiler. Bucket by code: ability mismatch, type mismatch, missing function, visibility.
   - **Test abort**: `MoveAbort` with a code. Read the `abort_code` and find the `assert!` or named error const that produced it.
   - **Runtime abort on testnet**: same as test abort, but trace through the PTB by digest with `sui client tx-block <digest>`.
   - **Ownership / capability bug**: code compiles but `transfer::public_transfer` fails, a function refuses to authorize, or a shared Object behaves unexpectedly. This category is the trickiest.

3. **Walk the bucket-specific playbook**
   - For compile errors, see `references/compile-error-playbook.md`.
   - For aborts, see `references/abort-tracing.md`.
   - For capability and ownership, see `references/capability-leakage.md`.

4. **Fix and re-run**
   - Apply the smallest fix that addresses root cause, not the symptom.
   - Re-run the build or the failing test. Do not declare success until output is clean.

5. **Add a regression test if missing**
   - If the bug was a logic error not caught by tests, add one. A bug that escapes tests will return.

6. **Writeback**
   - Append the diagnosis and the fix to `.suiperpower/build-context.md`.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself:

- Did I run the failing command and see the error first-hand, or did I guess from memory?
- Is the fix targeting root cause, not a symptom (e.g. swallowing the abort instead of fixing why it aborts)?
- Does the build or the test now pass cleanly, with no warnings I introduced?
- Did I add a test that would have caught this bug before deploy, if a test gap was the cause?
- Is the diagnosis written to `.suiperpower/build-context.md` so the next session has context?
- Did I avoid disabling lints, removing assertions, or pinning to a different framework rev to make the error go away?

If any answer is no, the skill keeps working before declaring fixed.

## References

On-demand references (load when relevant to the user's question):

- `references/compile-error-playbook.md`: Common compiler error codes and the fix shape for each.
- `references/abort-tracing.md`: Reading `abort_code`, mapping to `assert!` lines, tracing PTB aborts on testnet.
- `references/capability-leakage.md`: Patterns that compile but misuse capabilities, and the safer rewrites.

Knowledge docs (load when scope expands beyond what is in references):

- `skills/data/sui-knowledge/03-move-and-objects.md`: Object model and Move ability rules.
- `skills/build/build-with-move/references/common-move-pitfalls.md`: Cross-cutting Move pitfalls reference.

## Use in your agent

- Claude Code: `claude "/suiper:debug-move <your message>"`
- Codex: `codex "/debug-move <your message>"`
- Grok Build: run `grok`, then `/debug-move <your message>` in the session
- Cursor: paste a chat message that includes a phrase like "fix my Move error", or load `~/.cursor/rules/debug-move.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
