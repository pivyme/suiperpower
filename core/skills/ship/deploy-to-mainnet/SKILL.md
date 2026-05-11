---
name: deploy-to-mainnet
description: Publish to Sui mainnet only after the project has cleared the anti-slop gates (validate-business-model, retention-loop, review-move) and the testnet deploy was exercised, then capture the mainnet artifacts and lock the upgrade policy intentionally. Use when the user says "deploy to mainnet", "ship to production", "go to mainnet", "mainnet publish", "production deploy", or "publish to Sui mainnet". Reads .suiperpower/business-model.md, .suiperpower/retention-loop.md, .suiperpower/deploy-context.md (must contain a testnet entry), writes a new mainnet entry to .suiperpower/deploy-context.md.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when you finish this skill, run the matching completion command:
#   suiperpower track deploy-to-mainnet ship completed
# Or use "failed" / "aborted" if it ended that way. This closes the loop so the
# user's local project log and the maintainer's stats reflect real outcomes.
command -v suiperpower >/dev/null 2>&1 && suiperpower track deploy-to-mainnet ship started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Runs the mainnet deploy with refusal gates in front of the publish step. The point is not to gatekeep, it is to surface the gates honestly so the user is not deploying to mainnet because they typed a command, but because they have done the work that mainnet implies.

If a gate is missing, the skill names what is missing and routes the user to the relevant skill. The user can override and proceed by typing the literal phrase the skill asks for, but the override is logged in `deploy-context.md` so it is on the record.

## When to use it

- After the testnet deploy was exercised by a frontend or PTB and the relevant anti-slop skills have run.
- For a production launch the user is willing to defend.

## When NOT to use it

- Pre-MVP, before there is a working testnet deploy.
- For experimental projects that should stay on testnet. Mainnet introduces real cost and real user expectations.
- If the user only wants a "label" of mainnet without the responsibility. Route to `validate-business-model` and `retention-loop` first.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- `.suiperpower/business-model.md` (required, verdict must be `yes` or `partial`).
- `.suiperpower/retention-loop.md` (required, verdict must not be `no`).
- A recent `review-move` output, indicated by an entry in `.suiperpower/learnings.md` under `Decisions` or a separate `.suiperpower/review-move.md` if present.
- `.suiperpower/deploy-context.md` (required, must contain at least one testnet entry).
- `Move.toml` and the package path for the publish.
- A funded mainnet address.

## Outputs

A `## Deploy, <timestamp>` block appended to `.suiperpower/deploy-context.md` with `env: mainnet`, the package id, the upgrade cap, the upgrade policy chosen, and any override notes:

```markdown
## Deploy, <timestamp>

### Network
- env: mainnet
- rpc: <rpc url>
- gas address: <0x...>
- balance before: <SUI>
- balance after: <SUI>

### Package
- package id: <0x...>
- modules: <comma-separated module names>
- digest: <publish digest>
- upgrade cap object: <0x...>
- upgrade cap policy: <compatible | additive | dep-only | immutable>

### Gates
- business-model: <yes | partial | overridden>
- retention-loop: <yes | partial | overridden>
- review-move: <recent | overridden>
- testnet exercised: <yes | overridden>

### Notes
- <override rationale, if any>
- <stakeholders notified, if any>
```

## Workflow

1. **Read the gate inputs**
   - Open `business-model.md`, `retention-loop.md`, `deploy-context.md`. If any are missing, surface which ones and route the user back.
   - Look for evidence that `review-move` ran in the last 14 days. The skill considers a `## Decisions` entry referencing `review-move` or a `.suiperpower/review-move.md` file as evidence.

2. **Score the gates**
   - business-model: `yes` to proceed cleanly, `partial` to proceed with a flag, `no` to refuse unless override.
   - retention-loop: `yes` or `partial` to proceed, `no` to refuse unless override.
   - review-move: recent run within 14 days, or refuse unless override.
   - testnet exercised: must have a testnet entry in `deploy-context.md` plus user-confirmed evidence the testnet package was exercised by a frontend or PTB.

3. **If a gate fails**
   - Name the failed gate explicitly.
   - Recommend the corresponding skill to clear it: `validate-business-model`, `retention-loop`, `review-move`, `deploy-to-testnet`.
   - Offer the override path: the user must type "I accept the risk and want to deploy anyway" verbatim. Anything less is treated as a no.
   - If the user overrides, record the rationale in the `Notes` section of the new deploy entry.

4. **Mainnet preflight**
   - Verify Sui CLI version matches the version pinned in `skills/data/guides/deploy-runbook.md`.
   - Verify env is `mainnet`, address is funded, RPC is healthy.
   - Verify the same Move package builds and tests pass: `sui move build`, `sui move test`.

5. **Publish**
   - Run `sui client publish --gas-budget <budget> --json <package path>`.
   - Capture JSON output to a temp file.

6. **Capture artifacts**
   - Apply jq recipe per `skills/data/guides/package-id-capture.md`.
   - Extract package id, digest, `UpgradeCap` id.

7. **Lock the upgrade policy intentionally**
   - Default policy after first mainnet publish is `compatible`. The skill prompts the user to choose:
     - `compatible` (default): future upgrades may add fields and functions but not change existing signatures.
     - `additive`: future upgrades may only add, never modify.
     - `dep-only`: future upgrades only update dependency package addresses.
     - `immutable`: no future upgrades possible. Most secure, most rigid.
   - The skill records the chosen policy. If the user picks `immutable`, the skill confirms with a second prompt.

8. **Write deploy-context.md**
   - Append the new mainnet block with all artifacts and the gate status.
   - Leave the testnet entry intact.

9. **Verify on-chain**
   - `sui client object <package id>` and `sui client object <upgrade cap id>`.
   - Surface the package id to the user with explicit "this is mainnet" framing.

10. **Hand off**
    - Recommend `submit-to-sui-overflow` if this is a hackathon submission.
    - Recommend `apply-grant` if the user is preparing a Sui Foundation grant application.
    - Recommend `analytics-baseline` (post-launch grow phase) once it ships in v1.1.

## Quality gate (anti-slop)

Before reporting done:

- Were all four gates evaluated explicitly, with a recorded status?
- Was the override path required to be the verbatim phrase, not a casual "yes"?
- Was the upgrade policy selected intentionally (not silently defaulted)?
- Was the new entry appended to `deploy-context.md` with `env: mainnet` and all required fields?
- Was the post-deploy `sui client object` confirmation surfaced?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/gate-rationale.md`: Why each gate exists and what failure looks like.
- `references/upgrade-policy-choice.md`: Trade-offs between compatible, additive, dep-only, immutable.

Canonical:

- `skills/data/guides/deploy-runbook.md`
- `skills/data/guides/package-id-capture.md`
- `skills/data/guides/security-checklist.md`

## Use in your agent

- Claude Code: `claude "/suiper:deploy-to-mainnet <your message>"`
- Codex: `codex "/deploy-to-mainnet <your message>"`
- Cursor: paste a chat message that includes a phrase like "deploy to mainnet", or load `~/.cursor/rules/deploy-to-mainnet.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
