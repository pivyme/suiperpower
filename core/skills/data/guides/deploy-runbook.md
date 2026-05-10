# Deploy Runbook

Step-by-step Sui Move deploy commands. Devnet to testnet to mainnet. Referenced by `deploy-to-testnet`, `deploy-to-mainnet`, `scaffold-project`, and `submit-to-sui-overflow`.

## Pre-requisites Check

```bash
sui --version
node --version
pnpm --version
```

Required: Sui CLI on a current stable, Node 20 or newer, pnpm any recent.

If `sui` is missing:

```bash
brew install sui
```

If brew is not available, build from source via `cargo install --locked --git https://github.com/MystenLabs/sui.git --branch testnet sui` or grab a release binary from the mystenlabs/sui releases page. Pin the same Sui CLI version across the team. Mismatched CLI versions surface as cryptic publish errors.

Verify gas budget tooling works:

```bash
sui client gas
```

If this errors, the active env or address is unset. Re-run the relevant section of `rpc-wallet-guide.md`.

## Phase 1: Build the Package

```bash
sui move build
```

Verify build artifacts under `build/`. Look at warnings, not just errors. Common warnings worth fixing before publish:

- Unused imports
- Unused public functions (often signal a capability that should be private)
- Implicit module visibility on something callable cross-package

If `Move.toml` references unpinned dependencies (a branch, not a rev or tag), pin them now. Publish with floating deps means a future build of the same source can produce a different bytecode.

## Phase 2: Deploy to Devnet

```bash
sui client switch --env devnet
sui client active-address
sui client gas
sui client faucet
sui client publish --gas-budget 200000000 --json | tee /tmp/sui-publish-output.json
```

Capture the package id. The recipe lives in `package-id-capture.md`. In short:

```bash
PACKAGE_ID=$(jq -r '.objectChanges[] | select(.type=="published") | .packageId' /tmp/sui-publish-output.json)
echo "package_id: $PACKAGE_ID"
```

Verify the package on chain:

```bash
sui client object $PACKAGE_ID
```

If the result is empty, the publish did not succeed. Do not record success.

## Phase 3: Deploy to Testnet

Same shape, switch env to testnet. This is the primary network for Sui Overflow 2026 submissions when the project is not mainnet ready.

```bash
sui client switch --env testnet
sui client active-address
sui client gas
sui client faucet
sui client publish --gas-budget 200000000 --json | tee /tmp/sui-publish-testnet.json
```

Capture and verify the package id the same way. Update `.suiperpower/deploy-context.md` with the testnet entry. Frontend env points at testnet for the demo.

## Phase 4: Pre-mainnet Checklist

Run through every item before mainnet. Skip none.

- **Security pass**: scan for secrets in repo history (`git log -p | grep -iE 'private|secret|key'`), run `review-move`, run the security checklist in `security-checklist.md`. P0 must be clean.
- **Move soundness**: `sui move build` clean (no warnings), all tests pass (`sui move test`), capability handling reviewed by hand, OZ libs used wherever they apply.
- **Build verification**: clean build hash captured. `Move.toml` deps pinned to specific revs or tags.
- **Upgrade authority decision**: keep the upgrade cap, transfer to multisig, or burn it. Document the choice and the reason in `deploy-context.md`.
- **Frontend cutover prepared**: env vars, RPC URL, package id placeholders ready to flip.
- **Funded mainnet wallet**: at least 1 SUI for a small package, more for medium. Cost reference below.

If any item fails, do not continue. The skill `deploy-to-mainnet` refuses to proceed.

## Phase 5: Deploy to Mainnet

```bash
sui client switch --env mainnet
sui client active-address
sui client gas
sui client publish --gas-budget 500000000 --json | tee /tmp/sui-publish-mainnet.json
```

Post-deploy verification:

- `sui client object <PACKAGE_ID> --json` returns the published package
- Build hash matches local
- Upgrade authority is where you intended (cap object owner address or "burned")
- Frontend env points at mainnet
- A simple read call against the package succeeds (e.g. a view of a public function)

Append to `.suiperpower/deploy-context.md`:

```markdown
## Deploy <timestamp>
- package_id: <value>
- network: mainnet
- deployer: <address>
- upgrade_capability: <object_id or "burned">
- deployed_at: <YYYY-MM-DDTHH:MM:SSZ>
- build_hash: <sha256 of build/ contents>
```

## Cost Reference

| Operation | Estimated SUI cost |
|---|---|
| Publish small package (under 50KB) | 0.05 to 0.15 SUI |
| Publish medium package (50 to 200KB) | 0.15 to 0.4 SUI |
| Publish large package (200 to 500KB) | 0.4 to 1.0 SUI |
| Upgrade | 50 to 80 percent of original publish cost |
| Object creation | gas-only, fractions of a SUI |
| Simple transfer | tiny |

Numbers reflect current Sui mainnet gas at doc author time. Verify with `sui client dry-run` before a high-cost publish.

## Rollback

If the package is upgradeable, deploy a previous version through the upgrade flow:

```bash
sui client upgrade \
  --upgrade-capability <UPGRADE_CAP_ID> \
  --gas-budget 500000000 \
  --json | tee /tmp/sui-upgrade-output.json
```

If the upgrade cap was burned, the package is immutable. You cannot roll back. Document this trade-off when discussing the upgrade authority decision.

## Deploy Failure Recovery

If a publish fails midway:

1. Inspect `/tmp/sui-publish-output.json`. The error code identifies the cause.
2. Common causes: insufficient gas budget, dependency resolution failure, capability conflict.
3. Fix the root cause. Do not retry blindly.
4. If the publish partially registered objects, those objects exist on chain. Decide whether to clean up or proceed with the next attempt.

## Skills that read this guide

`deploy-to-testnet`, `deploy-to-mainnet`, `scaffold-project` (intro section), `submit-to-sui-overflow` (verification section), `ottersec-prep`.

*Last updated: 2026-05-10. Targets Sui CLI v1.x.*
