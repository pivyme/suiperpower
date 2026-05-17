# 05, Demo Flow

The two-minute story Kelvin tells when handing this to the DeepBook team (or recording for a hackathon submission). Built so it survives a flaky network, a paused vault, or a frozen wallet popup.

## The arc

Five scenes, ~20 seconds each, total ~100 seconds plus a 20-second outro.

### Scene 1, the problem (0:00 to 0:18)

On screen: the existing Tally form (`https://tally.so/r/Xx102L`) in the browser.

Voiceover: "DeepBook Predict ships their testnet token through a Tally form. You fill it out, wait for someone to read the responses, wait some more. There is a better way."

Expected wow: none. This is the setup.

### Scene 2, the page (0:18 to 0:38)

Cut to `https://dusdc-faucet.localhost:3200` (or the deployed URL).

On screen: dark page, "DUSDC Faucet · DeepBook Predict Testnet" title, vault stats card showing "1,000 DUSDC available · 0 served today · 1 DUSDC / 1 SUI". The faucet card sits below with three tabs visible.

Voiceover: "This is a self-serve faucet. The vault is on-chain, anyone can refill, the rate is fixed. Let me show you a claim."

User action: hover over the vault stats card so the live values are obvious.

### Scene 3, the claim (0:38 to 1:05)

User action:
1. Click "Connect wallet". Choose Sui Wallet from the dapp-kit picker.
2. Wallet is on testnet, address shortens in the header.
3. Type `0.5` in the SUI input. The "you receive" preview updates to `50.000000 DUSDC`.
4. Click "Claim". Wallet popup appears, user approves.
5. Toast appears: `Claimed 50 DUSDC`. Vault stats refresh, `DUSDC available` drops to `950.000000`.

Voiceover: "Type the amount, sign, done. Five seconds, no form."

Expected wow: the speed of the round trip. Stats card updates before the toast finishes animating out.

### Scene 4, the return (1:05 to 1:25)

User action:
1. Click the "Return DUSDC" tab.
2. Click MAX. The input fills with `50.000000`.
3. Click "Return". Wallet popup, approve.
4. Toast: `Returned 50 DUSDC for 0.5 SUI`.

Voiceover: "Made a mistake or moved on? Return the DUSDC at the same rate, no spread, no fees. Same shared object on both sides."

### Scene 5, the refill (1:25 to 1:40)

User action:
1. Click the "Refill" tab.
2. Type `500`.
3. Click "Top up vault". Approve.
4. Vault stats jump.

Voiceover: "Refilling is permissionless. Anyone keeps the vault topped up. DeepBook's only job is to send DUSDC to this object when the balance gets low."

### Outro (1:40 to 2:00)

On screen: a code block showing the AdminCap transfer command (pre-staged in a small modal or a screenshot in the footer of the recording).

Voiceover: "AdminCap controls rates and caps. I am happy to transfer it to DeepBook's address. Code is open source, contract is deployed on testnet. Link in the description."

## Pre-staged seed data

Before recording, the publisher wallet has:
- At least 10 SUI on testnet (for gas and demo claims/returns/refills)
- 1,000 DUSDC (test DUSDC during rehearsal, real DUSDC for the live recording)
- AdminCap object in the publisher wallet

The vault state before recording:
- `quote_balance`: 1,000 DUSDC (so the first stat reads cleanly)
- `sui_balance`: 0 SUI
- `rate_numerator`: 1, `rate_denominator`: 1
- `per_tx_sui_cap_mist`: 1_000_000_000 (1 SUI)
- `per_wallet_daily_sui_cap_mist`: 5_000_000_000 (5 SUI)
- `paused`: false
- `return_enabled`: true
- `total_served_quote`: 0 (reset is not possible, so we publish a fresh Faucet object for the demo recording if total_served drifts)

The browser starts clean: no wallet connection, no cached vault stats, no pre-existing DUSDC in the wallet.

Seed scripts:
- `packages/dusdc-faucet/scripts/seed-demo-vault.ts`, mints test DUSDC and refills the vault. Used during rehearsal.
- `packages/dusdc-faucet/scripts/reset-demo-state.ts`, transfers the publisher's DUSDC back to the vault, restoring the 1,000 starting balance.

## The load-bearing moment

Scene 3, step 5: the `Claimed 50 DUSDC` toast lands AND the vault stats refresh in the same beat. Both visible in the same camera frame. That single moment is the "this thing actually works" beat the entire video lives or dies on.

What makes it land:
- TanStack Query refetch fires immediately after `useSignAndExecuteTransaction.onSuccess`
- Toast animates in from the bottom with 250ms ease-out
- Vault stat numbers transition over 400ms with `Intl.NumberFormat` between the old and new value
- Both happen inside a 600ms window so the eye perceives them as one event

## Fallback paths

| Failure | Recovery |
| --- | --- |
| Backend `/stats` down | Frontend pulls vault state directly from chain. Caption "stats from chain" appears under the card. Scene continues normally. |
| Turnstile widget fails to load | If `VITE_TURNSTILE_SITE_KEY` is set to the always-pass test key, this never happens. For the recording, we deliberately use the test key. Real keys go live after the demo is approved. |
| Wallet popup never appears | dapp-kit times out after 60s. Reset the scene, re-record. We do a dry run first to confirm the chosen wallet is healthy. |
| Vault drained between rehearsal and recording | Run `scripts/reset-demo-state.ts` immediately before recording. |
| Network rejects the tx | Show the toast verbatim (`Transaction failed. Check the wallet for details.`), pause the recording, cut. |
| Sui testnet is degraded | Reschedule the recording. Document the testnet status check in `preflight.md`. |

## Judge-friendly affordances

- The "How it works" section below the card stays visible without scrolling on a 1440x900 viewport. Judges who don't watch the video still understand the product in 10 seconds.
- The Credit footer is small but legible. `made by Kelvin Adithya` links to `https://klvn.dev`. No Suiperpower mention.
- An explorer link in every success toast lets a judge verify the tx on-chain.
- A `?demo=1` query parameter (optional, polish phase) auto-fills the claim input with `0.5` so a returning judge can re-run the demo in two clicks.

## Recording plan

- Viewport: 1280x720, browser zoom 100%, browser chrome hidden in OBS via cropping.
- Page in dark mode.
- Wallet: Sui Wallet (browser extension). Two backup wallets configured (Suiet, Phantom Sui) in case the popup misbehaves.
- Mic: USB or built-in is fine; record in a quiet room, do one cold pass for timing, then a clean pass.
- Recording target: scenes 2, 3, 4, 5 are screen recorded. Scene 1 is a screenshot of the Tally form held for 18 seconds.
- Outro: code block + short voiceover. Optional, the video can end on scene 5 if time is tight.

The Tally screenshot is stored at `packages/dusdc-faucet/web/public/demo/tally-before.png` (Kelvin captures it before recording).

The final cut targets 2:00 ± 10s. Anything longer gets compressed in editing. Anything shorter than 1:30 drops scene 5.
