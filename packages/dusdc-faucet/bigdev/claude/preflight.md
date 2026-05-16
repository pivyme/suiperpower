# Preflight checklist

Day-of, before recording the demo or pinging DeepBook. Tick each line as you go.

## Environment

- [ ] `bun --version` returns a version (≥ 1.0)
- [ ] `sui --version` returns a version
- [ ] `sui client active-env` is `testnet`
- [ ] `sui client gas` shows at least 1 SUI in the publisher wallet
- [ ] Postgres is reachable (`psql $DATABASE_URL -c "select 1"` succeeds)
- [ ] `backend/.env` has correct `DATABASE_URL`, `FAUCET_PACKAGE_ID`, `FAUCET_OBJECT_ID`, `DUSDC_COIN_TYPE`, `TURNSTILE_SECRET`
- [ ] `web/.env` has the matching `VITE_*` values
- [ ] Turnstile keys: dev demos use the always-pass test keys; live demos use real keys

## Services

- [ ] Backend running, `curl http://localhost:4127/` returns `{ success: true }`
- [ ] Backend `/faucet/stats` returns vault state with `dusdcAvailable` matching the chain
- [ ] Frontend running, `http://localhost:3200/` loads the page
- [ ] Vault stats card shows non-zero `DUSDC available`
- [ ] Console shows no zod validation errors at boot

## Wallet

- [ ] Sui Wallet extension installed in Chrome, set to testnet
- [ ] Suiet installed in Firefox as backup, set to testnet
- [ ] Phantom Sui installed in Safari as backup, set to testnet
- [ ] Each wallet has ≥ 2 SUI for gas + demo transactions
- [ ] No leftover DUSDC in the wallet from previous rehearsals (run `scripts/reset-demo-state.ts` if needed)

## Vault state

- [ ] `DUSDC available` is exactly 1,000 (`1_000_000_000` base units)
- [ ] `Served today` is 0
- [ ] `paused` is false
- [ ] `return_enabled` is true
- [ ] Rate is 100 / 1

If any value is off:

```bash
# tune via AdminCap
bun run scripts/reset-demo-state.ts
```

## Browser

- [ ] Dark mode in the OS
- [ ] Dark mode in the page (theme toggle to moon)
- [ ] Browser zoom at 100%
- [ ] No browser extensions popping notifications during recording
- [ ] DevTools closed (no random console overlays in the frame)
- [ ] Tabs closed except the faucet and the Tally screenshot

## Recording

- [ ] OBS / QuickTime configured for 1280x720
- [ ] Mic level checked, no clipping
- [ ] Screen recording target window is the browser, not the desktop
- [ ] One cold timing pass done
- [ ] `bigdev/claude/demo-script.md` open on a second monitor or printed

## Right before hitting record

- [ ] Refresh the page once, confirm vault stats reload cleanly
- [ ] Disconnect the wallet (so the demo starts from the "Connect wallet" state)
- [ ] Clear the toast area (refresh again if a stale toast lingers)
- [ ] Inhale, exhale, hit record

## After recording

- [ ] Verify the file is in the right format and resolution
- [ ] Trim head and tail
- [ ] Sanity check: no Suiperpower mention anywhere on screen
- [ ] Credit footer reads `made by Kelvin Adithya` linking to klvn.dev
- [ ] Upload to the submission target

## Before pinging DeepBook (live deploy)

- [ ] All boxes above checked AGAINST the real DUSDC type, not the test clone
- [ ] Vault reads 0 DUSDC, frontend shows "vault empty" banner gracefully
- [ ] Email / DM draft to DeepBook ready: site URL, contract addr, AdminCap addr, offer to transfer
- [ ] Twitter / community post drafted but not yet sent (send after DeepBook confirms)
