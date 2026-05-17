# 07, Test Plan

How we know the faucet works before DeepBook funds the live vault. Three layers, ordered by what catches the most bugs per minute spent.

## Layer 1, Move unit tests

`contracts/faucet/tests/faucet_tests.move`. Run with:

```bash
cd packages/dusdc-faucet/contracts/faucet
sui move test
```

Required test cases (from `01-MOVE-CONTRACT.md`):

| Test | Expected |
| --- | --- |
| claim happy path | 1 SUI in, 1 DUSDC out, counters updated |
| claim over per-tx cap | abort E_OVER_PER_TX_CAP |
| claim over daily cap | abort E_OVER_DAILY_WALLET_CAP on the 6th 1-SUI claim |
| daily reset | after `clock::increment_for_testing` by 86_400_001 ms, the counter resets and a fresh claim succeeds |
| return happy path | 1 DUSDC in, 1 SUI out |
| return dust | 1 base unit DUSDC in, abort E_DUST_RETURN |
| return when disabled | abort E_RETURN_DISABLED after `set_return_enabled(false)` |
| refill | 500 DUSDC in, quote_balance grows |
| pause blocks claim | abort E_PAUSED |
| pause blocks return | abort E_PAUSED |
| pause does not block refill | refill still succeeds while paused (intentional) |
| wrong AdminCap | tune faucet A with cap from faucet B, abort E_WRONG_ADMIN_CAP |
| set_rate validates | num=0 aborts E_BAD_RATE |

Move tests use `sui::test_scenario` for shared object semantics and `sui::clock::create_for_testing` for time travel. Reference the framework's own `coin_tests.move` for patterns if needed.

Coverage target: 100% of entry functions hit at least once, every abort code triggered at least once.

## Layer 2, Backend integration tests

`packages/dusdc-faucet/backend/test/`. Vitest. Tests stub Turnstile and Prisma; we are testing route behavior, not the network.

```bash
cd packages/dusdc-faucet/backend
bun test
```

Add `vitest` to backend devDeps. Configure with `vitest.config.ts` pointing test root at `test/`.

Required tests:

- `verify.test.ts`:
  - body validation, missing fields return 400 with `FAUCET_BODY_INVALID`
  - Turnstile pass + quota available, returns `allowed: true` and a nonce
  - Turnstile fail returns `allowed: false, reason: TURNSTILE_FAILED`
  - IP cap exhausted returns `allowed: false, reason: IP_LIMIT`
  - Wallet cap exhausted returns `allowed: false, reason: WALLET_LIMIT`
  - `TURNSTILE_SECRET` unset auto-approves and logs a warning
  - Concurrent calls do not double-count (simulate with `Promise.all` of two upserts)

- `stats.test.ts`:
  - returns the latest snapshot when fresh
  - refetches on-chain when snapshot is > 60s stale (stub `readFaucetState`)
  - shape matches `00-ARCHITECTURE.md` exactly
  - serializes BigInts as strings

- `tx-hint.test.ts`:
  - invalid address returns 400 `FAUCET_BAD_ADDRESS`
  - zero usage returns full cap
  - partial usage returns cap minus consumed
  - over-cap returns zero, not negative

- `rate-limit.test.ts`:
  - same-day increment accumulates
  - next-day reset re-zeroes
  - cleanup deletes rows > 14 days old

## Layer 3, End-to-end rehearsal

`packages/dusdc-faucet/scripts/e2e-rehearsal.ts`. Bun script using `@mysten/sui` SDK. Publishes everything fresh, runs every PTB, asserts vault state.

```bash
cd packages/dusdc-faucet
bun run scripts/e2e-rehearsal.ts
```

Requires `PRIVATE_KEY` env (export your Sui CLI keypair via `sui keytool export <address>` and put the private key in `.env` as `E2E_SIGNER_PRIVATE_KEY`). The script publishes to testnet (or devnet via flag `--devnet`).

Steps the script runs:
1. Publish `contracts/test-dusdc`. Save package id.
2. Publish `contracts/faucet`. Save package id.
3. Mint 100,000 test DUSDC to the signer.
4. Call `create_faucet<TEST_DUSDC>`. Capture Faucet id, AdminCap id.
5. Call `refill` with 1,000 DUSDC.
6. Read Faucet state. Assert `quote_balance == 1_000_000_000_000` (1,000 * 10^6).
7. Build a claim PTB for 0.1 SUI. Sign, execute, wait.
8. Assert wallet gained 10 DUSDC (10 * 10^6 base units).
9. Build a return PTB for 5 DUSDC. Sign, execute.
10. Assert wallet gained 0.05 SUI back.
11. Try a 2 SUI claim, expect tx to fail with `E_OVER_PER_TX_CAP`. Catch and continue.
12. Tune the per-tx cap to 5 SUI via AdminCap.
13. Retry the 2 SUI claim, assert success.
14. Pause, expect a 0.1 SUI claim to fail with `E_PAUSED`.
15. Unpause, claim 0.1 SUI, assert success.
16. Report timings and a clean exit code.

The script is idempotent in spirit (each run publishes a fresh package). Total runtime target: under 90 seconds on testnet, under 30 on devnet.

Output format:

```
[e2e] publishing test-dusdc... done (0.2s)
[e2e] minting 100,000 test DUSDC... done (1.1s)
[e2e] publishing faucet... done (0.3s)
...
[e2e] PASS  14/14 assertions  total 72s
```

On any failure, exit code 1 and print the tx digest plus a sui explorer link for postmortem.

## Layer 4, Manual rehearsal

A pre-recorded run by Kelvin using the actual frontend. This is the gate before asking DeepBook to refill.

Steps (each ticked in `preflight.md`):
1. Backend and frontend deployed, real Turnstile keys live.
2. Vault on testnet contains 1,000 test DUSDC.
3. Three browsers open: Chrome with Sui Wallet, Firefox with Suiet, Safari with Phantom Sui. All three should claim successfully.
4. Try a claim while throttling Network in DevTools to "Slow 3G". The tx should still go through (long spinner but eventual success).
5. Disable the backend. Confirm the frontend still claims (chain-only path).
6. Try to claim 6 SUI cumulatively from one wallet. The 6th claim should fail with the on-chain abort, frontend shows the error.
7. Return all the claimed DUSDC. Confirm the SUI comes back.
8. Refill 500 from another wallet. Confirm stats update.

If any of those 8 fail, stop, fix, re-run from step 1. Do not proceed to step 9.

9. Republish with the **real** DUSDC coin type (no test clone).
10. Vault now reads zero. Ping DeepBook with the addr.
11. Once DeepBook refills, run steps 3 through 7 again with real DUSDC.
12. Then transfer the AdminCap to DeepBook's address.

## What we do NOT test

- Frontend visual regression (no snapshot tests). The design system spec is the contract.
- Wallet UI behavior across every Sui wallet (assume dapp-kit's tested matrix).
- Performance under load. Testnet volume does not warrant it.
- Bytecode equivalence after refactors. Move tests cover semantics.

## CI

Single GitHub Action at `.github/workflows/dusdc-faucet.yml` (project-relative if Kelvin wants it later, not blocking v1):

```yaml
name: dusdc-faucet
on:
  push:
    paths: ['packages/dusdc-faucet/**']
jobs:
  contracts:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: MystenLabs/sui-setup-action@latest
      - run: sui move test
        working-directory: packages/dusdc-faucet/contracts/faucet
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
        working-directory: packages/dusdc-faucet/backend
      - run: bun test
        working-directory: packages/dusdc-faucet/backend
  web:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
        working-directory: packages/dusdc-faucet/web
      - run: bun run build
        working-directory: packages/dusdc-faucet/web
```

The e2e script is NOT in CI; it needs a funded testnet wallet and we do not want to leak the key. Kelvin runs it manually.

## Confidence checklist before asking DeepBook to refill

The build is ready when ALL of these are true:

- [ ] All Move tests pass locally.
- [ ] All backend tests pass locally.
- [ ] The e2e rehearsal script passes against testnet (last run within 24 hours).
- [ ] Steps 1-8 of the manual rehearsal pass.
- [ ] Steps 9-10 are executed (republished with real DUSDC type).
- [ ] Backend env vars and frontend env vars match the republished package and object ids.
- [ ] Vault reads zero DUSDC, frontend correctly shows the "vault empty" banner.
- [ ] The pitch email to DeepBook is drafted and ready to send.

Only then ping DeepBook. The moment they deposit, the page goes live to the world.
