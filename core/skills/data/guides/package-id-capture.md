# Package ID Capture

Capturing the package id from a `sui client publish` is mechanical, but it is the linchpin between deploy and every downstream skill. Get it wrong and the frontend points at nothing, the submission references a phantom package, and the user thinks they shipped when they did not.

## When to use this guide

- After `sui client publish` succeeds.
- When the user pastes a publish output and wants the package id extracted.
- When `submit-to-sui-overflow` needs to verify the package id on chain.

## The Capture Recipe

Always pass `--json`. The text output is for humans and changes between Sui CLI versions; the JSON is stable.

```bash
sui client publish --gas-budget 200000000 --json | tee /tmp/sui-publish-output.json
PACKAGE_ID=$(jq -r '.objectChanges[] | select(.type=="published") | .packageId' /tmp/sui-publish-output.json)
echo "package_id: $PACKAGE_ID"
```

If `jq` is missing:

```bash
brew install jq
```

The published object is the one with `type == "published"`. There is exactly one per successful publish.

## Writing to deploy-context

Append to `.suiperpower/deploy-context.md`:

```markdown
## Deploy <timestamp>
- package_id: <value>
- network: <devnet | testnet | mainnet>
- deployer: <address>
- upgrade_capability: <object_id or "burned">
- deployed_at: <YYYY-MM-DDTHH:MM:SSZ>
```

Append, do not overwrite. Each deploy is its own entry. Skills reading this file scan from the bottom for the most recent network they care about.

## Verification

Confirm the package exists on chain:

```bash
sui client object $PACKAGE_ID --json
```

If the result is empty or errors, the publish did not actually succeed. The skill should not record success. Common reasons a publish "appears" to succeed but the package is not on chain:

- The CLI was pointed at the wrong env mid-publish.
- A network blip between publish and the implicit confirm. Re-run `sui client object` after a few seconds.
- Gas budget was exhausted before the publish step landed (rare, surfaces as an explicit error in the JSON).

## Mainnet vs Testnet

Skills must capture the network too, not just the package id. A mainnet package id and a testnet package id are syntactically identical but functionally different. Reading a testnet package id as if it were mainnet is a class of bug that has shipped to production.

When writing `deploy-context.md`, the `network:` field is required. When reading `deploy-context.md`, scan for the network the skill cares about, not the most recent entry overall.

## Capturing the upgrade capability

The upgrade cap is created in the same publish transaction. Extract it the same way:

```bash
UPGRADE_CAP=$(jq -r '.objectChanges[] | select(.objectType | tostring | contains("UpgradeCap")) | .objectId' /tmp/sui-publish-output.json)
echo "upgrade_capability: $UPGRADE_CAP"
```

If the design burns the upgrade cap at deploy, record `upgrade_capability: burned`. The cap object id is meaningless once burned.

## Skills that read this guide

`deploy-to-testnet`, `deploy-to-mainnet`, `submit-to-sui-overflow`.

*Last updated: 2026-05-10. Targets Sui CLI v1.x JSON shape.*
