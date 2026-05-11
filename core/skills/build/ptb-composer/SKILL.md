---
name: ptb-composer
description: Compose Sui Programmable Transaction Blocks that chain multiple Move calls and transfers atomically in a single transaction. Use when the user says "compose a programmable transaction", "build a PTB", "chain calls in one transaction on Sui", "atomic multi-step Sui tx", "compose Move calls", or "PTB across modules". Reads .suiperpower/build-context.md if present. Loads skills/data/sui-knowledge/03-move-and-objects.md.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when you finish this skill, run the matching completion command:
#   suiperpower track ptb-composer build completed
# Or use "failed" / "aborted" if it ended that way. This closes the loop so the
# user's local project log and the maintainer's stats reflect real outcomes.
command -v suiperpower >/dev/null 2>&1 && suiperpower track ptb-composer build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Composes a PTB that does multiple things in one transaction: split coins, call multiple Move functions, route results between calls, transfer Objects, and so on. Verifies the PTB compiles, dry-runs cleanly, and executes against testnet before declaring done. Avoids the trap of "one tx per step" sequencing where a single PTB would be both faster and atomic.

## When to use it

- The user wants atomicity across multiple calls (split, swap, deposit, all or nothing).
- The user wants fewer signatures and lower latency in a multi-step flow.
- The user is wiring a sponsored-tx flow where the sponsor signs the whole PTB.
- The user is composing across modules or across protocols (e.g. DeepBook + Walrus + custom).

## When NOT to use it

- For single Move calls with no chaining, a plain `moveCall` is enough.
- If the user has not picked a project or scaffolded yet, route them to `find-next-sui-idea` or `scaffold-project` first.
- For Move-side composition (entry function calling another module), use `build-with-move`. PTBs are client-side.
- For deploys, use `deploy-to-testnet` / `deploy-to-mainnet`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A Sui project with a TS or Rust client.
- Optional: `.suiperpower/build-context.md`. Read it if present.
- The intended sequence of operations and the data flow between them.

If unclear, interview the user for:

- What is the goal of the PTB in one sentence?
- Which moves does it perform, in order?
- What outputs does each move produce, and which subsequent moves consume them?
- Does it need to be all-or-nothing (atomicity), or just batched?

## Outputs

- TS code that constructs the PTB.
- A dry-run pass showing expected effects.
- A real testnet execution capturing the digest.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## ptb-composer session, <timestamp>
  - ptb name: <description>
  - command count: <n>
  - input count: <n>
  - first executed digest: <digest>
  - gas budget: <value>
  - open issues: <list>
  ```

The skill never deletes files outside the integration source path without explicit user confirmation.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if present.
   - Confirm the goal, sequence, and atomicity requirement.

2. **Sketch the PTB on paper**
   - Numbered list of commands.
   - For each, the inputs (from chain or from previous result) and the outputs.
   - Note where errors should abort the entire PTB (the default) vs where to allow partial.

3. **Build the PTB**
   - Use the TS SDK. Construct commands in order.
   - Use `tx.splitCoins`, `tx.mergeCoins`, `tx.transferObjects`, `tx.moveCall`, `tx.makeMoveVec`, `tx.publish` as needed.
   - Wire results between commands using the result handles the SDK returns.

4. **Dry-run**
   - Run `dryRunTransactionBlock`. Inspect effects.
   - Confirm balance changes match intent.
   - Confirm Objects created and transferred as expected.
   - Surface any "unexpected behavior" before signing.

5. **Execute on testnet**
   - Sign and submit. Capture the digest.
   - Verify on suiscan that the transaction did exactly what the dry-run predicted.

6. **Tune**
   - Set an explicit gas budget. PTBs near the gas limit benefit from a generous explicit budget.
   - If sponsoring, set gas owner separately.

7. **Writeback**
   - Append session details to `.suiperpower/build-context.md`.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Did the dry-run pass with exactly the expected effects (balance changes, Object creations, transfers)?
- Did a real testnet execution settle, with the digest matching the dry-run prediction?
- Are command results wired correctly (no implicit assumption about ordering or stale references)?
- Is the gas budget set explicitly and sized to fit the PTB's actual cost plus headroom?
- For atomic flows, is there at least one negative test (a deliberate fail to confirm rollback works)?
- If the PTB exceeds 100 commands or 100 inputs, has the user been warned about protocol limits?

If any answer is no, the skill reports the gap and works through it before claiming the PTB is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/ptb-quickstart.md`: Common patterns (split + swap + deposit, mint + transfer, multi-protocol composition).
- `references/ptb-pitfalls.md`: Result handle staleness, gas-coin conflicts, command limits, sponsor surprises.
- `references/ptb-dryrun.md`: How to read a dry-run output and verify intent.

Knowledge docs (load when scope expands beyond what is in references):

- `skills/data/sui-knowledge/03-move-and-objects.md`: Object model + capability reference.

## Use in your agent

- Claude Code: `claude "/suiper:ptb-composer <your message>"`
- Codex: `codex "/ptb-composer <your message>"`
- Cursor: paste a chat message that includes a phrase like "compose a PTB", or load `~/.cursor/rules/ptb-composer.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
