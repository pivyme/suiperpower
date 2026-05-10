# Testnet deploy preflight

Walk this list before running `sui client publish`. A missed item costs minutes; a missed item that lands a half-broken package costs hours.

## Tooling

- [ ] Sui CLI installed and runnable: `sui --version` returns a version.
- [ ] Sui CLI version matches or exceeds the version pinned in `skills/data/guides/deploy-runbook.md`. Mismatched CLI vs network is a common cause of opaque errors.
- [ ] `jq` installed for capture step: `jq --version`.

## Network

- [ ] Active env is `testnet`: `sui client active-env`. Not `mainnet`, not `devnet`, not a custom rpc.
- [ ] Reachable RPC: `sui client gas` returns without timeout.

## Address and balance

- [ ] Active address known: `sui client active-address`.
- [ ] Balance is enough for the gas budget plus headroom (at least 0.5 SUI free for a typical small package).
- [ ] If under-funded, request from the testnet faucet, wait for confirmation, re-check balance.

## Move package

- [ ] `Move.toml` is in the package path and has a published-at value of `0x0` for first-time publish (or matches the prior deploy for upgrade).
- [ ] `sui move build --path <package>` succeeds with no warnings worth blocking on.
- [ ] `sui move test --path <package>` passes.

## Plan

- [ ] You know the gas budget you intend to pass. Default `--gas-budget 100000000` for small packages; raise for large.
- [ ] You know which env to switch back to after publish (some teams keep mainnet active for client work).
- [ ] You have a place to record the package id (`build-context.md`, `deploy-context.md`, frontend env file).

## After publish

- [ ] Capture the JSON publish output. Do not rely on the human-readable terminal output for the canonical artifacts.
- [ ] Run `sui client object <package id>` and `sui client object <upgrade cap id>` to confirm.
- [ ] Append the deploy block to `.suiperpower/deploy-context.md` immediately, while the values are fresh in scrollback.
