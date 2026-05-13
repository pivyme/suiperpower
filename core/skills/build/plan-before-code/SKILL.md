---
name: plan-before-code
description: Use when planning a Sui Move package before writing code (abilities, capabilities, PTB, upgrades). Writes build-plan.md.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track plan-before-code build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track plan-before-code build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Turns `intent.md` into a Sui-shaped, file-level plan the user has approved. Forces the Move decisions that are expensive to reverse: Object abilities, capability holders, PTB entry-point shape, package layout, upgrade authority strategy, and per-sponsor verification commitments. The plan is the contract `verify-against-intent` later checks against.

`clarify-intent` answers "what". This skill answers "how, in just enough Sui detail that yes/no is possible before any Move code is written".

## When to use it

- `clarify-intent` just ran and the build is non-trivial.
- The user explicitly asks for a plan, an outline, or "walk me through the approach".
- The build touches more than one Move module, more than one shared Object, a sponsor integration, or a multi-step PTB.
- The user is mid-build and lost about what comes next.

## When NOT to use it

- The build is a single one-function change. Hand off to `build-with-move` directly.
- `.suiperpower/intent.md` does not exist. Use `clarify-intent` first.
- The user is debugging, use `debug-move`.
- The user is reviewing existing code, use `review-move` or `product-review`.
- The user only needs an Object schema, use `object-model-design` directly.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- `.suiperpower/intent.md` (required, from `clarify-intent`).
- Optional: `.suiperpower/build-context.md` from a prior session.
- Optional: existing project tree if any code already exists.

If `intent.md` is missing, stop and hand off to `clarify-intent`. Do not invent intent.

## Outputs

A single file at `.suiperpower/build-plan.md` with this Sui-shaped schema:

```markdown
# Build plan, <timestamp>

## Linked intent
.suiperpower/intent.md, summary: <one sentence from intent>

## Package layout
- Package name: <name>
- Single package or multi-package: <decision + rationale>
- Move.toml dependencies: <Sui framework rev, OZ Sui modules, other pinned deps>

## Object model (per Object, forced ability decisions)
- <ObjectName>:
  - Ownership: <owned | shared | immutable>
  - Abilities: <key, store, drop?, copy?> with rationale per ability
  - Purpose: <one line>
  - Created by: <function name>
  - Mutated by: <function name(s)>
  - Destroyed by: <function name, or "never">
- <next Object>: ...

## Capabilities
- <CapName>:
  - Holder at init: <module-internal | published-to-deployer | shared>
  - Gates: <which functions require it>
  - Transferability: <transferable | bound | burnable>

## Modules
- <module_name>:
  - Purpose: <one line>
  - Public entry functions: <names>
  - Friend modules: <list, or "none">
  - Stdlib dependencies: <e.g. sui::transfer, sui::object, sui::coin>

## Public entry points
- `<module>::<fn>(args) -> effect` (caller, gas posture, abort codes)
- ...

## PTB shape
- Composability: <single-call entry | PTB chain across modules | not applicable>
- If chained: the canonical PTB sequence the user or frontend builds
- Gas envelope expected (rough): <e.g. < 0.01 SUI on testnet>

## Tests (one per intent.md success criterion)
- <test_name>: covers <fn>, expected <pass | abort code>, ties to intent criterion #<n>
- ...
- Any success criterion without a test: flag here as a risk.

## Frontend or off-chain pieces (if any)
- Stack: <Next.js + dapp-kit | mobile | indexer | agent>
- Routes / surfaces: <list>
- Auth: <wallet adapter | zkLogin | sponsored>
- Calls to chain: <list of public entry points hit>

## Sponsor integrations (load-bearing, with verification commitment)
- <Walrus | DeepBook | Scallop | OZ Sui | zkLogin | OtterSec>:
  - Surface: <which SDK calls, which Move functions touch it>
  - Load-bearing test: <how `verify-against-intent` will prove it is not decorative>
  - Reference: <docs URL the author or skill grounded this on>

## Network rollout
- Order: devnet -> testnet -> mainnet (or stop earlier)
- Per-network exit criterion: <what must be true before moving up>

## Upgrade authority
- Strategy: <keep with multisig | keep solo | burn at mainnet>
- Where the upgrade cap lives after publish: <address | shared object | burned>
- Package id capture: <where it's recorded for downstream skills>

## Risks and unknowns
- <risk>: severity, how we will resolve (fetch docs, prototype, ask author)
- ...

## Order of build
1. <step that proves the riskiest unknown first>
2. <step>
3. ...

## What "done" looks like for this plan
- <observable outcome tied to intent.md success criterion #N, on which network>
```

The skill stops here. No code. Hand off to the right build skill.

## Workflow

1. **Read intent and prior context**
   - Read `.suiperpower/intent.md`. Missing? Stop and hand off to `clarify-intent`.
   - Read `.suiperpower/build-context.md` if present.
   - If a project already exists on disk, list current modules and `Move.toml` deps in one short summary.

2. **Package layout first**
   - Single package or multi-package? Multi-package means upgrade boundaries and address management; only pick if intent justifies it.
   - Pin `Move.toml` deps (Sui framework rev, OZ Sui modules). Floating versions are slop; refuse them.

3. **Object model with forced ability decisions**
   - For each Object the intent named: decide ownership (owned, shared, immutable).
   - Decide abilities (`key`, `store`, and explicitly justify `drop` or `copy` if used).
   - Decide who creates, mutates, destroys. Each verb mapped to a function name.

4. **Capability model**
   - Each capability from intent gets a holder, a gating list, and a transferability decision.
   - Refuse "we will figure out caps later". The cap holder is upgrade-cap-adjacent in seriousness.

5. **Module split and public surface**
   - List public entry functions. Anything not public is implementation detail; do not enumerate.
   - Identify friend visibility where needed.
   - Note stdlib deps so `Move.toml` can be confirmed.

6. **PTB shape**
   - If the user composes calls, draw the canonical PTB sequence. If not, say "single-call".
   - Rough gas posture, not exact. Surface if any step is expected to be expensive.

7. **Tests tied to intent criteria**
   - Each success criterion in `intent.md` maps to at least one named test.
   - Capability-gated functions get an expected-failure test for the unauthorized call.
   - Any criterion with no testable path: flag in Risks.

8. **Sponsor integrations**
   - For each sponsor in intent: define the surface, then commit to how `verify-against-intent` will prove it is load-bearing (e.g. "a testnet tx hash where the Walrus blob is read into the UI", not "import path exists").
   - If you cannot define a load-bearing test, refuse the integration and write that down.

9. **Network rollout and upgrade authority**
   - Devnet, testnet, mainnet order. Per-network exit criterion.
   - Upgrade authority decision at publish: keep solo, keep multisig, or burn. Each has consequences; surface them.
   - Package id capture plan so downstream skills (`deploy-to-testnet`, `submit-to-sui-overflow`) read from one place.

10. **Risks, unknowns, build order**
    - Risks named with severity and resolution path.
    - First build step proves the riskiest unknown, not the easiest one.

11. **Walk the plan to the user**
    - Two-sentence summary, then "approve, edit, or scrap?".
    - Do not write the file until the user approves. Acknowledgment is not approval; ask for explicit yes.

12. **Write `.suiperpower/build-plan.md`** and hand off to the right build skill via `skills/SKILL_ROUTER.md`.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself:

- Does every Object have a decided ownership and ability set, not "we'll figure it out"?
- Does every capability have a named holder and gate list?
- Does every success criterion in `intent.md` map to at least one named test?
- Does every sponsor integration have a load-bearing verification commitment (a real testnet artifact to check), not "import exists"?
- Is the upgrade authority decision named, with consequence acknowledged?
- Are `Move.toml` deps pinned (rev or tag), not floating?
- Did the user explicitly approve the plan, not just nod?
- Did I avoid starting any code, even a stub?

If any answer is no, the skill keeps working before handing off.

## References

Knowledge docs (load when scope expands):

- `core/skills/data/sui-knowledge/03-move-and-objects.md`: Object model, abilities, capability reference.
- `core/skills/data/guides/deploy-runbook.md`: Network rollout and upgrade authority context.

## Use in your agent

- Claude Code: `claude "/suiper:plan-before-code <your message>"`
- Codex: `codex "/plan-before-code <your message>"`
- Cursor: paste a message like "plan the Sui build before we code", or reference `~/.cursor/rules/plan-before-code.mdc`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
