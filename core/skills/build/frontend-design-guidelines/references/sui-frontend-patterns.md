# Sui-specific frontend patterns

Surfaces every Sui dapp has and how to render them well.

## Wallet connect

- Single button at top-right when disconnected, labeled "Connect wallet" (not "Login", not "Sign in").
- On connect, show: ellipsized address, network (testnet / mainnet) with a colored dot, balance in SUI.
- Disconnect under a dropdown next to the address. Confirm only on devnet / testnet (mainnet should be one-click for trust).
- If multiple wallets are supported, present a sheet of options (Slush first, then others). Do not pre-select.

## Address display

- Ellipsis format: `0x1234...abcd` (4 chars head, 4 chars tail). NOT 6+6, that is too wide.
- Always pair with a copy button, focus-visible, with a "Copied" toast on click.
- On hover: tooltip with full address.
- For long names (Object IDs, package IDs, digests), use `0x1234...abcd` and link to the explorer.

## Network indicator

- Single small pill at top-right, near the wallet button.
- Mainnet: green dot, "Mainnet". Testnet: yellow dot, "Testnet". Devnet: orange dot, "Devnet".
- Click to switch (if app supports).

## Transaction state

Four states, each with its own visual treatment:

1. **Signing**: modal or inline indicator with "Confirm in your wallet". Disable the trigger button.
2. **Pending**: spinner, "Submitting transaction". Show digest as soon as it exists, link to SuiVision.
3. **Success**: green check, "Transaction confirmed", show effects (which Objects were created or updated), link to SuiVision, dismiss after 5s.
4. **Failed**: red X, the failure reason in plain language (route abort codes through `debug-move` reasoning if helpful), retry CTA, link to SuiVision for the failed tx.

## Gas display

- Show gas in SUI with at most 6 decimals, NOT in MIST raw form, NOT scientific notation.
- For "estimate", show as `~0.001 SUI`. For "actual", drop the tilde.
- See `number-formatting` skill for the helper that does this.

## Object display

For an Object the user owns:

- Type name (the Move type, simplified) at top.
- Object ID below, ellipsized, with copy.
- Type-specific fields (a coin shows balance, an NFT shows image + name, a generic Object shows the JSON-serialized fields under a disclosure).
- Action menu: transfer, view in explorer, custom actions per type.

## Coin / token display

- Always tabular figures.
- Symbol after the number, separated by a thin space. `1,234.56 USDC`, not `USDC1234.56`.
- For balances: trailing zeros trimmed unless the user is in a "trade" surface where alignment matters.
- For input: dropdown of user's coin types, selected coin's balance shown above the input, a "Max" button.

## Empty wallet state

If the connected wallet has no relevant Objects:

- Title: "No <thing> yet".
- Body: one sentence explaining how to get one.
- CTA: directs to the action that creates one. If the action requires testnet SUI, link to the faucet explicitly.

## Faucet flow (testnet only)

- A small persistent button or banner: "Need testnet SUI? Faucet".
- Click triggers the faucet request, shows a toast on success.
- If the user has more than 1 SUI on testnet, hide the banner.

## Failure copy patterns

- Insufficient gas: "Not enough SUI for gas. You need ~X SUI; you have Y."
- User rejected: "Transaction not confirmed. <Retry button>".
- Network error: "Could not reach the Sui network. Check your connection."
- Object not found: "This Object no longer exists or you do not own it."

## Anti-patterns

- Showing the raw 0x...64-char address inline.
- Showing MIST values directly to users.
- Showing transaction digest as the only feedback (wrap it: "Transaction sent. Digest: 0x...").
- Letting a network switch fail silently.
- Using "wallet" and "address" interchangeably (they are not the same; an address is owned by a wallet).
