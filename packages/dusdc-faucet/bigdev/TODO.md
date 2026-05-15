# DUSDC Faucet, build TODO

Phased build plan for the autonomous loop. Each phase is independently testable. Phases 1-3 lay the monorepo + tooling baseline; phases 4-9 build the contract; 10-15 build the backend; 16-22 build the frontend; 23-25 are the mandatory polish phases; 26 finalizes deploy + handover.

The orchestrator reads this file at the start of every iteration and picks the first `[ ]` step. Builders batch up to 5 phases per iteration.

---

## Phase 1: Workspace cleanup and Sui deps [x]
- [x] remove leftover Solana/EVM deps from `backend/package.json` (`@solana/web3.js`, `@solana/wallet-standard-util`, `bs58`, `ethers`)
- [x] remove `backend/src/lib/evm/` if present
- [x] add `@mysten/sui`, `zod` to `backend/package.json` dependencies, `vitest`, `@types/node` already covered
- [x] add `@mysten/sui`, `@mysten/dapp-kit`, `@marsidev/react-turnstile`, `@noble/hashes` to `web/package.json`
- [x] `cd backend && bun install` and `cd web && bun install` to lock dep changes
- [x] confirm `bun run lint` passes in both `backend/` and `web/` after the cleanup

## Phase 2: Monorepo env and gitignore [x]
- [x] create `packages/dusdc-faucet/.env.example` per `bigdev/plans/08-ENV-AND-SECRETS.md`
- [x] create `packages/dusdc-faucet/.env.local-stub` per same doc
- [x] update `packages/dusdc-faucet/.gitignore` to ignore `.env`, `.env.local`, `bigdev/claude/auto-build-logs/`, `bigdev/claude/inject.md`, `.deploy.json`
- [x] update `backend/.env.example` and `web/.env.example` to match the per-app subsets in `08-ENV-AND-SECRETS.md`
- [x] verify `git status` shows no committed `.env` files

## Phase 3: Prisma schema for rate limits, stats, claim events [x]
- [x] extend `backend/prisma/schema.prisma` with `RateLimit`, `ClaimEvent`, `VaultStatsSnapshot` per `bigdev/plans/00-ARCHITECTURE.md`
- [x] keep existing `User` and `ErrorLog` untouched
- [x] emit a PAUSE_FOR_USER asking Kelvin to run `bun run db:push` from `backend/` (we never run destructive Prisma)
- [x] after Kelvin confirms, run `bun run db:generate` to refresh the Prisma client
- [x] confirm `bun run lint` passes

## Phase 4: Move package, faucet, scaffolding [x]
- [x] create `contracts/faucet/Move.toml` per `bigdev/plans/01-MOVE-CONTRACT.md`
- [x] create `contracts/faucet/sources/faucet.move` with the `Faucet<T>`, `DailyUsage`, `AdminCap` types, error codes, and events declared
- [x] add `create_faucet`, `claim`, `return_quote`, `refill` entry function signatures (bodies in next phases)
- [x] confirm `sui move build` succeeds with the type declarations and empty bodies (or `abort 0` placeholders)

## Phase 5: Move package, claim and refill [x]
- [x] implement `claim` body exactly per `bigdev/plans/01-MOVE-CONTRACT.md`, including u128 math, daily reset, counter update, event emit
- [x] implement `refill` body and event emit
- [x] update `create_faucet` to share the object and transfer the AdminCap to the sender
- [x] confirm `sui move build` clean

## Phase 6: Move package, return and admin functions [x]
- [x] implement `return_quote` per the doc, including dust check and pause/return_enabled assertions
- [x] implement `set_rate`, `set_per_tx_cap`, `set_daily_cap`, `set_paused`, `set_return_enabled`, `withdraw_sui`, `transfer_admin`
- [x] each admin entry asserts AdminCap binding via `cap.faucet_id == object::uid_to_address(&faucet.id)`
- [x] add read helpers (`quote_balance`, `sui_balance`, `rate`, `is_paused`, `return_enabled`, `total_served_quote`, `total_claims`)
- [x] confirm `sui move build` clean

## Phase 7: Move tests [x]
- [x] create `contracts/faucet/tests/faucet_tests.move` covering every case in `bigdev/plans/07-TEST-PLAN.md` Layer 1
- [x] use `sui::test_scenario` and `sui::clock::create_for_testing`
- [x] confirm `sui move test` passes all listed scenarios

## Phase 8: Test DUSDC clone package [x]
- [x] create `contracts/test-dusdc/Move.toml`
- [x] create `contracts/test-dusdc/sources/test_dusdc.move` exactly per `bigdev/plans/01-MOVE-CONTRACT.md`
- [x] confirm `sui move build` in that folder
- [x] add a one-line `tests/smoke.move` (or skip if framework allows no-test packages)

## Phase 9: Deploy helper script [ ]
- [x] create `packages/dusdc-faucet/scripts/deploy.ts` per `bigdev/plans/06-DEPLOY-AND-ADMIN.md` (publish, create_faucet, refill, write .deploy.json)
- [x] do NOT execute the script in the loop; only validate it `bun run --check`-style by type-checking and parsing flags
- [x] emit PAUSE_FOR_USER instructions so Kelvin runs `bun run scripts/deploy.ts --which=test` manually
- [x] capture returned `FAUCET_PACKAGE_ID`, `FAUCET_OBJECT_ID`, `ADMIN_CAP` ids from Kelvin's reply into `backend/.env` and `web/.env`

## Phase 10: Backend config and Sui client [x]
- [x] extend `backend/src/config/main-config.ts` with the variables listed in `bigdev/plans/02-BACKEND.md`
- [x] add the startup `validateConfig()` function in `backend/index.ts` per `bigdev/plans/08-ENV-AND-SECRETS.md`
- [x] create `backend/src/lib/sui/client.ts` and `backend/src/lib/sui/faucet-read.ts`
- [x] confirm `bun run typecheck` (add the script if missing, `tsc --noEmit`) passes

## Phase 11: Backend rate limit and Turnstile libs [x]
- [x] create `backend/src/lib/rate-limit.ts` with `checkAndConsume({ scope, identifier, requestedMist, capMist })` returning `{ allowed, remaining }`
- [x] use Prisma upsert keyed by `(scope, identifier, utcDay)` for atomic increment
- [x] create `backend/src/lib/turnstile.ts` exactly per `bigdev/plans/02-BACKEND.md`
- [x] vitest stub-friendly: extract `fetch` calls to a thin wrapper for mockability

## Phase 12: Backend routes [x]
- [x] create `backend/src/routes/faucetRoutes.ts` mounting `/verify`, `/stats`, `/tx-hint/:addr`, `/event/claim`
- [x] zod body validators per `bigdev/plans/02-BACKEND.md`
- [x] response envelope matches the starter pattern (`success`, `error`, `data`)
- [x] register the plugin in `backend/index.ts` with prefix `/faucet`
- [x] remove the example route registration if Kelvin agrees (default: keep it, harmless)

## Phase 13: Stats cache worker [x]
- [x] create `backend/src/workers/statsCacheWorker.ts` polling chain every 15 seconds, writing `VaultStatsSnapshot`
- [x] use the starter's `isRunning` flag pattern
- [x] register in `backend/index.ts`
- [x] confirm `bun dev` boots without errors and `/faucet/stats` returns shape

## Phase 14: Rate limit cleanup worker [x]
- [x] create `backend/src/workers/rateLimitCleanup.ts`, hourly, deletes rows where `utcDay < currentDay - 14`
- [x] register in `backend/index.ts`

## Phase 15: Backend tests [x]
- [x] create `backend/vitest.config.ts`
- [x] write tests under `backend/test/` per `bigdev/plans/07-TEST-PLAN.md` Layer 2 (verify, stats, tx-hint, rate-limit)
- [x] stub Prisma via `vitest-mock-extended` (add to devDeps)
- [x] confirm `bun test` passes

## Phase 16: Frontend env, providers, base layout [x]
- [x] create `web/src/env.ts` exactly per `bigdev/plans/03-FRONTEND.md`
- [x] add Google Sans Flex + Google Sans Code font links to `web/src/routes/__root.tsx`, remove the Inter Variable font import from `styles.css`
- [x] update `web/src/styles.css` to use the new font tokens and palette per `bigdev/plans/04-DESIGN-SYSTEM.md`
- [x] create `web/src/providers/SuiProviders.tsx`, wire into `__root.tsx`
- [x] import `@mysten/dapp-kit/dist/index.css` at the top of `styles.css`

## Phase 17: Frontend lib (sui, api, fingerprint, format) [x]
- [x] create `web/src/lib/sui/client.ts`
- [x] create `web/src/lib/sui/format.ts` (SUI↔MIST, DUSDC↔base)
- [x] create `web/src/lib/sui/ptb-claim.ts`, `ptb-return.ts`, `ptb-refill.ts` per `bigdev/plans/03-FRONTEND.md`
- [x] create `web/src/lib/sui/faucet-read.ts` mirroring the backend reader
- [x] create `web/src/lib/api.ts` with typed fetch wrappers for `/verify`, `/stats`, `/tx-hint`, `/event/claim`
- [x] create `web/src/lib/fingerprint.ts` per the doc

## Phase 18: Frontend hooks [x]
- [x] create `web/src/hooks/useVaultStats.ts` (TanStack Query, 10s refetch, chain fallback if backend 5xx)
- [x] create `web/src/hooks/useTxHint.ts`
- [x] create `web/src/hooks/useFaucetMutations.ts` exposing `useClaim`, `useReturn`, `useRefill`
- [x] create `web/src/hooks/useTurnstile.ts` returning `{ token, ready, error, reset }`

## Phase 19: Frontend primitive components [x]
- [x] delete `web/src/components/WebstarterOnboarding.tsx` and any starter art references it pulls
- [x] create `web/src/components/AmountInput.tsx`, `web/src/components/WalletButton.tsx`, `web/src/components/TurnstileWidget.tsx`, `web/src/components/Credit.tsx`
- [x] match `bigdev/plans/04-DESIGN-SYSTEM.md` for every visible string and state
- [x] confirm `bun run build` passes

## Phase 20: Frontend layout components [x]
- [x] create `Header`, `HeroBlock`, `VaultStats`, `FaucetCard`, `HowItWorks`
- [x] copy strings VERBATIM from `bigdev/plans/04-DESIGN-SYSTEM.md` "Verbatim demo strings" table
- [x] wire all five page-level states (empty, loading, error, skeleton, populated) per the doc

## Phase 21: Frontend tabs (Claim, Return, Refill) [x]
- [x] create `ClaimTab.tsx`, `ReturnTab.tsx`, `RefillTab.tsx` per `bigdev/plans/03-FRONTEND.md`
- [x] wire mutations + toasts, include explorer link in success toasts (`https://suiscan.xyz/testnet/tx/<digest>`)
- [x] handle the not-connected, vault-dry, balance-empty, daily-cap-exhausted edge states with the exact copy from the design system

## Phase 22: Frontend index route [x]
- [x] overwrite `web/src/routes/index.tsx` to assemble the page in the layout from `bigdev/plans/03-FRONTEND.md`
- [x] remove the WebstarterOnboarding route reference and any demo routes from the starter
- [x] confirm `bun run build` clean and `bun dev` shows the page

## Phase 23: Design system foundation [x]
- [x] tokens wired (colors, spacing, radius, shadow per `bigdev/plans/04-DESIGN-SYSTEM.md`)
- [x] Google Sans Flex + Google Sans Code applied to body/headings; no leftover Inter
- [x] base primitives (Button, AmountInput, Card, TabBar, Toast, Chip) styled with every required state (idle, hover, focus, active, disabled, loading, error)
- [x] typography scale applied across the page; no arbitrary text sizes

## Phase 24: UI states pass [x]
- [x] every screen has empty state with on-brand copy per design system
- [x] every screen has loading + skeleton states for the data it shows
- [x] every screen has error state with recovery action (chain-fallback caption, retry-where-applicable)
- [x] no Lorem ipsum, no `<placeholder>`, no TODO strings, all copy from `bigdev/plans/04-DESIGN-SYSTEM.md` verbatim
- [x] vault stats render with real fixture data when running with `0xPENDING_*` stub ids: show "stats unavailable, claim still works" rather than crashing

## Phase 25: Demo polish [ ]
- [ ] create `scripts/seed-demo-vault.ts` that mints test DUSDC and refills the vault to 1,000
- [ ] create `scripts/reset-demo-state.ts` that returns the publisher's DUSDC back to the vault
- [ ] golden demo path (claim 0.5 SUI, return 50 DUSDC, refill 500 DUSDC) runs end-to-end without errors against testnet
- [ ] screenshots captured to `web/public/demo/` and `packages/dusdc-faucet/docs/screenshots/` (placeholder names: `hero.png`, `claim.png`, `return.png`, `refill.png`, `vault-stats.png`)
- [ ] `README.md` screenshot placeholders filled
- [ ] `bigdev/claude/demo-script.md` timing verified by Kelvin (PAUSE_FOR_USER for the manual stopwatch pass)

## Phase 26: E2E rehearsal and live deploy handover [ ]
- [ ] create `scripts/e2e-rehearsal.ts` per `bigdev/plans/07-TEST-PLAN.md` Layer 3
- [ ] emit PAUSE_FOR_USER so Kelvin runs `bun run scripts/e2e-rehearsal.ts` against testnet
- [ ] Kelvin reports PASS, builder commits the script
- [ ] emit PAUSE_FOR_USER for the manual rehearsal checklist (8 steps from `bigdev/plans/07-TEST-PLAN.md` Layer 4)
- [ ] emit PAUSE_FOR_USER to confirm republish with the real DUSDC coin type and update env
- [ ] emit PAUSE_FOR_USER for the AdminCap transfer to DeepBook once they accept
- [ ] final commit: tag `v0.1.0`, update README's "deployed at" section with the live testnet ids
