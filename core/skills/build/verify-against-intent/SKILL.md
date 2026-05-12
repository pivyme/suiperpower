---
name: verify-against-intent
description: Use when verifying a finished Sui build session, checking whether Move code, capabilities, sponsor integrations, and upgrades match intent.md and build-plan.md.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track verify-against-intent build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track verify-against-intent build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Closes the loop on a Sui build session with disk-grounded checks, not session-memory claims. Walks the plan's Object model, capability holders, sponsor surfaces, and upgrade posture against actual Move source, `Move.toml`, `deploy-context.md`, and the test suite. Names drift honestly: decorative sponsor integration claimed as load-bearing, capabilities held in the wrong place, public functions without tests, deploy state that does not match the planned network rollout.

Without this gate, agents say "done" against a target that was never written. With it, every criterion gets a pass / fail / partial verdict tied to a concrete artifact.

## When to use it

- A build skill (`build-with-move`, `walrus-storage`, `deepbook-orderbook`, `scallop-money-market`, `sui-zk-login`, `kiosk-marketplace`, etc.) just reported done.
- The user says "did we get there", "is this what I asked for", or "review what we built".
- A session is about to be wrapped, before `learn` captures it.
- The user is preparing to ship: run this before `deploy-to-testnet`, `deploy-to-mainnet`, or `submit-to-sui-overflow`.

## When NOT to use it

- `.suiperpower/intent.md` does not exist. There is nothing to verify against. Use `clarify-intent` to backfill, then re-run.
- The user wants a security audit, use `review-move` (different gate, P0 to P3 findings) or `ottersec-prep`.
- The user wants UX critique, use `product-review` or `roast-my-product`.
- The user wants a code-style review. Not this skill.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- `.suiperpower/intent.md` (required).
- `.suiperpower/build-plan.md` if `plan-before-code` ran.
- `.suiperpower/build-context.md`, `.suiperpower/deploy-context.md` if present.
- The current project tree: Move sources, `Move.toml`, `tests/`, frontend if any.

If `intent.md` is missing, stop. Tell the user verification needs a recorded intent. Offer `clarify-intent` to backfill.

## Outputs

A printed report and an append to `.suiperpower/build-context.md`:

```markdown
## verify-against-intent, <timestamp>

### Success criteria check
1. <criterion>: pass | fail | partial, evidence: <file:line | testnet tx hash | package id>
2. <criterion>: pass | fail | partial, evidence: <...>
...

### Object model check
- <ObjectName>: planned <ownership, abilities> | actual <ownership, abilities>: match | mismatch
- ...

### Capability holder check
- <CapName>: planned holder <X> | actual at init <Y>: match | mismatch

### Sponsor integration check (load-bearing test)
- <Walrus | DeepBook | Scallop | OZ Sui | zkLogin>: planned surface <...> | actual: <imported only | called but result unused | load-bearing in user flow with evidence <...>>

### Test coverage check
- Public entry points with at least one test: <count> / <total>
- Cap-gated functions with expected-failure tests: <count> / <total>
- Functions missing tests: <list>

### Build check
- `sui move build`: pass | fail (<error summary if fail>)
- `Move.toml` deps pinned (rev or tag): yes | no

### Upgrade and deploy posture check
- Planned network rollout: <devnet -> testnet -> mainnet>
- Actual deploy state: <per-network package id from deploy-context.md, or "not deployed">
- Upgrade authority: planned <X> | actual <Y from on-chain or deploy-context>: match | mismatch

### Drift summary
<one paragraph, honest>

### Follow-ups
- <thing to fix, with the skill that fixes it>
- <thing to document as accepted scope cut>
```

The skill does not fix the drift. It names it, points to the right skill, hands off.

## Workflow

1. **Read inputs**
   - `.suiperpower/intent.md`. Missing? Stop.
   - `.suiperpower/build-plan.md` if present.
   - `.suiperpower/build-context.md`, `.suiperpower/deploy-context.md`.
   - List Move modules (`sources/*.move`), tests (`tests/*.move`), `Move.toml`, frontend entry points if applicable.

2. **Map criteria to Sui-grounded evidence**
   For each success criterion in `intent.md`, decide what would prove it:
   - On-chain function existing? Check for `public entry fun <name>` in source.
   - Test pass? Check for the named test in `tests/`.
   - Network deploy? Check `deploy-context.md` for a package id on the right network.
   - Frontend behavior? Check that the route calls the named entry point.
   - Sponsor user flow? Check that the SDK call sits inside a real user path, not a top-of-file import only.

   Do not trust session memory. Read disk.

3. **Object model check**
   For each Object in `build-plan.md`:
   - Find `struct <Name>` in source. Parse abilities (`has key, store, ...`).
   - Compare to plan. Note mismatch on ownership (e.g. plan said shared, code uses `transfer::transfer`, that is owned).

4. **Capability holder check**
   For each capability:
   - Locate the `init` function. See where the cap goes (`transfer::transfer(cap, ctx.sender())`, `transfer::share_object(cap)`, `transfer::public_transfer`, or burn).
   - Compare to plan. Surface mismatch.

5. **Sponsor load-bearing check**
   For each sponsor in `build-plan.md`:
   - Confirm the SDK call or Move call exists in source.
   - Confirm the call is reachable from a public entry function (Move side) or a user-triggered handler (frontend side).
   - Confirm the result is used (the blob is read into UI, the order is placed against a real pool, the zkLogin proof is verified, etc.).
   - If only imported, or the result is unused: mark decorative. This is the most common drift; do not soften it.

6. **Test coverage check**
   - Count public entry functions vs functions covered by at least one test.
   - For each cap-gated function, confirm there is an expected-failure test for the unauthorized caller.
   - List the gaps.

7. **Build check**
   - Run `sui move build`. Record pass or fail.
   - Read `Move.toml`. Confirm deps are pinned to a rev or tag, not floating.

8. **Upgrade and deploy posture check**
   - Compare planned network rollout to `deploy-context.md`. Per network: deployed or not, package id captured or not.
   - Compare planned upgrade authority to the upgrade-cap state recorded at publish.

9. **Call drift honestly**
   - For each mismatch above: pass, fail, or partial. Evidence tied to a file path, a tx hash, or a package id.
   - Anything in the plan but not built: was it intentionally cut or forgotten? Ask the user.
   - Anything built but not in the plan: scope creep, accident, or load-bearing? Ask.
   - Anything in intent but not in plan or code: worst kind of drift, surface first.

10. **Report and writeback**
    - Print the report shape above.
    - Append the same text to `.suiperpower/build-context.md` under a new `## verify-against-intent` section.

11. **Hand off**
    - Clean report: recommend `deploy-to-testnet` (or `deploy-to-mainnet` if testnet already passed) or `learn`.
    - Drift exists: recommend the right skill for the largest gap (`build-with-move`, `review-move`, `walrus-storage`, etc.) via `skills/SKILL_ROUTER.md`.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself:

- Did I read actual Move source and `Move.toml`, not recall from session memory?
- Did every success criterion get pass / fail / partial with a concrete artifact reference (file:line, tx hash, package id)?
- Did I run the sponsor load-bearing test, not accept "the import is there"?
- Did I check capability holders at init, not just that the cap struct exists?
- Did I name drift honestly when the build skill called itself done?
- Did I avoid fixing the drift in this skill (the job here is calling, not fixing)?
- Did I append the verdict to `.suiperpower/build-context.md` so the next session sees it?

If any answer is no, the skill keeps working before reporting done.

## References

Knowledge docs (load when scope expands):

- `core/skills/data/sui-knowledge/03-move-and-objects.md`: Object model and ability reference.
- `core/skills/data/guides/package-id-capture.md`: Where package id and upgrade cap state are recorded.

## Use in your agent

- Claude Code: `claude "/suiper:verify-against-intent <your message>"`
- Codex: `codex "/verify-against-intent <your message>"`
- Cursor: paste a message like "did we build what I asked for on Sui", or reference `~/.cursor/rules/verify-against-intent.mdc`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
