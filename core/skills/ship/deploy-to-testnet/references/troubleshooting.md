# Testnet deploy troubleshooting

Common publish failures with the actual fix. Add to this as new failure modes appear.

## "InsufficientGas"

Symptom: publish aborts with an InsufficientGas error.

Fix:

- Raise `--gas-budget` (e.g. from `100000000` to `500000000`).
- Check the active address has free gas not locked in pending transactions: `sui client gas`.
- If the address has SUI but it is split across many tiny coins, merge them: `sui client merge-coin --primary-coin <id> --coin-to-merge <id> --gas-budget 10000000`.

## "ModuleVerificationFailure" or generic verifier error

Symptom: publish fails citing the Move verifier.

Fix:

- Re-run `sui move build` locally; the local build catches most verifier errors first.
- Confirm the Sui CLI version matches the network. A new verifier rule on testnet may be missing in an older CLI; upgrade.

## "PackageDependencyVerificationFailed"

Symptom: a dependency in `Move.toml` does not resolve or has a different package id on this network.

Fix:

- Confirm dependencies have correct `published-at` values for the current network in their respective `Move.toml`.
- Pin dependency revs explicitly. Do not rely on `branch = "main"` unless you control the upstream.

## "ObjectNotFound" for the gas object

Symptom: publish picks a gas coin that is locked or already spent.

Fix:

- Wait 5 to 10 seconds and retry. The mempool may still hold a prior tx.
- Pass `--gas <coin id>` explicitly to choose a known-free coin from `sui client gas`.

## "CompiledModule version mismatch"

Symptom: the binary produced by `sui move build` is rejected by the network.

Fix:

- Upgrade the Sui CLI to the version that matches the testnet protocol version.
- Re-run `sui move build` so the bytecode is fresh.

## Publish hangs forever

Symptom: command does not return.

Fix:

- The RPC may be slow or down. Switch to a different testnet RPC per `skills/data/guides/rpc-wallet-guide.md`.
- Cancel with Ctrl-C. Check `sui client active-env` and try again.

## Frontend cannot find the package after publish

Symptom: the package is on-chain but the frontend reports "Module not found".

Fix:

- Confirm the frontend is configured for testnet, not devnet or mainnet.
- Confirm the package id in the frontend matches `deploy-context.md` exactly. A truncated copy is a common bug.
- Run `sui client object <package id>` to confirm the package is reachable from the same RPC the frontend uses.
