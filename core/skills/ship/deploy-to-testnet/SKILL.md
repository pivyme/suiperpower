---
name: deploy-to-testnet
description: Deploy a Sui Move package to testnet and capture package id and UpgradeCap. Use when the user wants to deploy to testnet or publish to Sui testnet.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track deploy-to-testnet ship completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track deploy-to-testnet ship started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Runs the testnet deploy flow end to end: validates prerequisites, runs `sui client publish`, captures the package id and `UpgradeCap` from the publish output, writes `deploy-context.md` with the real artifacts, and points the user at the next step.

The flow follows `skills/data/guides/deploy-runbook.md` for the publish steps and `skills/data/guides/package-id-capture.md` for the capture rules. Capability handling is non-trivial; the skill never prints capability ids in shared logs and never hardcodes them into client code.

## When to use it

- After the Move package compiles and tests pass on localnet.
- Before any frontend work that needs a real on-chain package id.
- Any time the user wants a fresh testnet deployment after a breaking change.

## When NOT to use it

- Mainnet deploys. Route to `deploy-to-mainnet`.
- Localnet runs. Use `sui move test` and the local validator directly; no deploy-context is written for localnet.
- Pre-test, when the package has not been compiled or unit tested.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- `.suiperpower/build-context.md` for the Move package path and module names.
- The user's funded testnet address. If not funded, the skill points at the testnet faucet.
- Sui CLI installed and on `testnet` env. If not, the skill walks the env switch per `skills/data/guides/rpc-wallet-guide.md`.

## Outputs

A `.suiperpower/deploy-context.md` entry following the canonical headers from `skills/data/specs/phase-handoff.md`:

```markdown
## Deploy, <timestamp>

### Network
- env: testnet
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

### Notes
- <anything the user should know about this deploy>
```

## Workflow

1. **Preflight**
   - Verify Sui CLI is installed and version is at least the version pinned in `skills/data/guides/deploy-runbook.md`. If not, ask the user to run `cargo install --git https://github.com/MystenLabs/sui --branch testnet sui` or use the official binary.
   - Verify env is `testnet` via `sui client active-env`. If not, switch.
   - Verify the active address has enough SUI for gas. If not, point at the official testnet faucet and pause.
   - Read `build-context.md` to get the package path. Default to `./move/`.

2. **Build and check**
   - Run `sui move build --path <package path>`. Surface any error.
   - Run `sui move test --path <package path>`. If tests fail, do not proceed.

3. **Publish**
   - Run the publish command per `skills/data/guides/deploy-runbook.md`:
     `sui client publish <package path> --gas-budget <budget> --json`
   - Capture the JSON output to a temp file.

4. **Capture artifacts**
   - Apply the jq recipe from `skills/data/guides/package-id-capture.md` to extract:
     - `package id`
     - `digest`
     - `UpgradeCap` object id
   - Cross-check the package id against the modules listed in the build output.

5. **Write deploy-context.md**
   - Append the new `## Deploy, <timestamp>` block per the spec headers.
   - Include the env, RPC, gas address, balances, package id, modules, digest, upgrade cap, and policy.
   - Leave any prior `## Deploy` blocks intact (append-only).

6. **Verify on-chain**
   - Run `sui client object <package id>` to confirm the package exists.
   - Run `sui client object <upgrade cap id>` to confirm the cap landed in the active address.

7. **Hand off**
   - Tell the user the package id explicitly so they can wire it into `cli/data/sui-skills.json` or their frontend.
   - Recommend `deploy-to-mainnet` once the testnet deploy has been exercised by a frontend or PTB. Recommend `submit-to-sui-overflow` if this is the submission deploy.

## Quality gate (anti-slop)

Before reporting done:

- Did `sui move build` and `sui move test` both pass before publish?
- Was the package id captured from real publish output, not from a manual prompt to the user?
- Was the `UpgradeCap` object id captured and recorded?
- Was the upgrade policy recorded?
- Was `deploy-context.md` appended (not overwritten)?
- Were the post-deploy `sui client object` checks run and surfaced?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/preflight-checklist.md`: Step-by-step preflight items to verify before publish.
- `references/troubleshooting.md`: Common testnet publish failures and fixes.

Canonical:

- `skills/data/guides/deploy-runbook.md`
- `skills/data/guides/package-id-capture.md`
- `skills/data/guides/rpc-wallet-guide.md`

## Use in your agent

- Claude Code: `claude "/suiper:deploy-to-testnet <your message>"`
- Codex: `codex "/deploy-to-testnet <your message>"`
- Cursor: paste a chat message that includes a phrase like "deploy to testnet", or load `~/.cursor/rules/deploy-to-testnet.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
