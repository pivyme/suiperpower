# Demo script

A 2:00 walkthrough Kelvin reads aloud while screen recording. Timing is the spine; the words can flex by a few seconds either way.

Source of truth: `bigdev/plans/05-DEMO-FLOW.md`. This is the user-facing condensation.

---

**[0:00]** Open Chrome to the existing DUSDC Tally form (`https://tally.so/r/Xx102L`). Camera holds.

> "DeepBook Predict ships their testnet token through this Tally form. You fill it out, you wait for someone to read it. There's a better way."

**[0:18]** Cut to the DUSDC Faucet page in dark mode. Show the title, vault stats, three tabs.

> "This is a self-serve faucet for the same token. The vault lives on-chain, anyone can refill it, the rate is fixed."

Hover over the vault stats card briefly so the values are legible.

**[0:38]** Click "Connect wallet". Pick Sui Wallet. Wallet popup, approve.

> "Connect a testnet wallet."

Wait for the header to update with the shortened address.

**[0:45]** Click into the SUI amount input. Type `0.5`.

> "Type the amount of SUI you want to trade."

The "you receive" preview updates to `50.000000 DUSDC`.

**[0:52]** Click "Claim". Wallet popup. Approve.

> "Sign one transaction."

**[0:58]** Toast lands, "Claimed 50 DUSDC", and the vault stats refresh to `950.000000 DUSDC available`.

> "Done. Five seconds. No form."

**[1:05]** Click the "Return DUSDC" tab.

> "Made a mistake or moved on? Return DUSDC at the same rate."

Click MAX. Input fills with `50.000000`. Click "Return". Approve.

**[1:20]** Toast lands, "Returned 50 DUSDC for 0.5 SUI". Vault stats refresh.

> "Same shared object on both sides. No spread, no fee."

**[1:25]** Click the "Refill" tab.

> "And refilling is permissionless. Anyone keeps the vault stocked."

Type `500`. Click "Top up vault". Approve.

**[1:40]** Toast lands, vault stats jump.

> "DeepBook's only job is to deposit DUSDC into this object when it runs low. That's the whole product."

**[1:48]** Optional outro: show a small panel or screenshot with the AdminCap transfer command.

> "The AdminCap controls rates and caps. Happy to transfer it to DeepBook's address. Code is open, contract is on testnet. Link in the description."

**[2:00]** Fade.

---

## Fallback notes

| If this breaks live | Recovery |
| --- | --- |
| Tally form 404s | Use a screenshot at `web/public/demo/tally-before.png` |
| Wallet popup never appears | Switch to backup wallet (Suiet), retake scene |
| `/stats` 5xx | Page falls back to chain reads, caption "stats from chain" appears, continue |
| Tx pending more than 15s | Pause, narrate "testnet is busy today" briefly, keep going when it lands |
| Vault drains mid-recording | Stop. Run `bun run scripts/reset-demo-state.ts`. Re-record from scene 2. |
| Sui testnet degraded | Reschedule. Check `https://status.sui.io` before recording. |

## Recording config

- OBS, viewport 1280x720, browser zoom 100%, chrome cropped out
- Dark mode in the OS, dark mode in the page
- Mic: USB or built-in; record one cold pass for timing, then a clean pass
- Output: 1080p webm or mp4, < 50MB

## Variants

- **Submission video (2:00)**: this script verbatim.
- **Quick share to DeepBook (1:00)**: scenes 2, 3, 5. Skip the Tally framing and the return scene.
- **GIF for Twitter (15s)**: just the claim moment, the toast and the stat refresh.
