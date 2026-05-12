# 05. App layer and consumer

> Audience: a builder making a consumer-facing app on Sui. Frontend, mobile, onboarding, the UX gotchas that bite in production.

## Frontend stack defaults

For a new web app on Sui, the boring-and-correct defaults:

- **Framework**: Next.js 14+ App Router or Vite + React.
- **Wallet integration**: `@mysten/dapp-kit-react` (React) or `@mysten/dapp-kit-core` (vanilla JS). Wraps the Wallet Standard, exposes `useCurrentAccount`, `useCurrentClient`.
- **Query layer**: `@tanstack/react-query` (no longer a peer dep of dapp-kit-react, but still the recommended query layer for your app).
- **Styling**: Tailwind. Skip enterprise component libraries unless the product requires them.
- **Type-safe contract calls**: hand-written wrappers around `Transaction` from `@mysten/sui/transactions`.

Install:

```bash
pnpm add @mysten/sui @mysten/dapp-kit-react @tanstack/react-query
```

Provider setup (Next.js App Router):

```tsx
"use client";
import { DAppKitProvider, createDAppKit } from "@mysten/dapp-kit-react";

// SDK v2.0: SuiGrpcClient (from @mysten/sui/grpc) is the recommended transport.
// createDAppKit replaces createNetworkConfig. DAppKitProvider replaces the
// nested QueryClientProvider > SuiClientProvider > WalletProvider stack.
// The CSS import (@mysten/dapp-kit/dist/index.css) is removed; dapp-kit-react
// uses web components with CSS custom properties instead.

const dAppKit = createDAppKit({
  networks: {
    testnet: { transport: "grpc" },
    mainnet: { transport: "grpc" },
  },
  defaultNetwork: "testnet",
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DAppKitProvider dAppKit={dAppKit}>{children}</DAppKitProvider>
  );
}
```

## Wallet connection patterns

Default UX:

```tsx
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit-react";

export function Header() {
  const account = useCurrentAccount();
  return (
    <div>
      {account ? <span>{account.address}</span> : null}
      <ConnectButton />
    </div>
  );
}
```

Patterns:

- One `<ConnectButton />` in the header. Do not pop a modal on first page load.
- Show address (truncated) when connected; never a full address in compact UI.
- Auto-reconnect from local storage; dapp-kit handles this by default.

## zkLogin in production

For social login as the primary auth, use Enoki:

```bash
pnpm add @mysten/enoki
```

Enoki wraps:

- OIDC flow (Google, Apple, etc.)
- Salt management (so users do not lose their address if their browser storage clears)
- Sponsored-tx coordination

Setup:

```tsx
import { EnokiFlow, EnokiFlowProvider } from "@mysten/enoki/react";

const flow = new EnokiFlow({ apiKey: process.env.NEXT_PUBLIC_ENOKI_API_KEY! });

export function Providers({ children }) {
  return <EnokiFlowProvider client={flow}>{children}</EnokiFlowProvider>;
}
```

Sign in:

```tsx
const { redirect } = useEnokiFlow();
await redirect("Google");
```

After the OIDC redirect, Enoki gives you a Sui address you can use in your dApp the same way as any wallet-connected address.

In development you can run zkLogin without Enoki, but production salt management is enough work that paying for Enoki almost always saves time.

## Sponsored tx in production

If you want users to take their first action without paying gas, sponsor the transaction.

Server-side sponsor pattern:

1. Client builds the transaction body (PTB without gas info).
2. Client posts the body to your API.
3. Server inspects the body. If it matches an allowed pattern (e.g. "mint one welcome NFT"), the server signs as gas payer.
4. Server returns the signed sponsorship; client adds user signature; client submits the dual-signed transaction.

Enoki can run this for you (the Enoki SDK provides a sponsor method; check `@mysten/enoki` docs for the current API name, as it may have changed with SDK v2.0). For custom rules, run your own server.

Footgun: a sponsor that signs anything is a hot wallet leak. Always validate the transaction body server-side. Never sponsor arbitrary user-submitted PTBs.

## Mobile (React Native + Sui Mobile SDK + Expo)

For a Sui mobile app:

- **Framework**: Expo + React Native (or bare React Native if you need native modules).
- **Wallet**: Sui Mobile SDK for embedded wallets, or deep-link to Slush mobile.
- **Auth**: zkLogin via Enoki, or wallet adapter via deep link.

Key gotcha: native iOS deep links require URL scheme registration in `Info.plist`. Test deep-link flows on a real device, not just the simulator.

For the dedicated build skill, see `skills/build/build-mobile-sui/`.

## Onboarding patterns

The "good first transaction" target: a new user lands, sees something useful, takes one tap, sees confirmation, all without seed phrases or gas.

Mechanics:

1. Sign in with zkLogin via Enoki.
2. Server sponsors the user's first transaction (mint a welcome NFT, set up their account state).
3. User sees confirmation in under five seconds.
4. After this point, the user has an address; subsequent transactions can be self-paid or app-sponsored at your choice.

Anti-patterns:

- Showing the user a seed phrase. zkLogin avoids this; do not undo it with extra "save your keys" steps.
- Asking the user to top up gas before they have done anything. Sponsor the first action.
- Forcing wallet install before showing product value. Let users browse first, gate at the action they want to take.

Named accounts: SuiNS lets users register human-readable names. Worth surfacing in profile UI so users see `kelvin.sui` instead of a hex address.

## UX gotchas specific to Sui

### Object versioning

Every Object has a `version` and a `digest`. When the user signs a PTB that mutates an Object, the chain checks the version matches what the client provided. If another tx mutated the Object in between, the user's tx fails with `ObjectVersionMismatch`.

Mitigation:

- Refresh the Object state right before signing.
- For shared Objects, expect occasional version mismatches under load and handle gracefully.
- Do not cache Object state for too long.

### Finality timing

- **Owned-Object-only transactions**: fast path, finalized in milliseconds.
- **Shared-Object transactions**: consensus, sub-second under normal load.
- **Cross-region latency**: factor RPC location into UX; users in Asia hitting US East RPC see 200ms+ on top.

Show feedback in the UI immediately after the user signs, before chain confirmation. Do not block the UI on finality unless the next action depends on it.

### Fee predictability

Sui gas is more predictable than EVM but not free of surprises:

- Object creation has a base cost.
- PTBs with many calls cost more than a single call.
- Storage rebate: when an Object is destroyed, you get back the storage cost.

For consumer UX, abstract gas. Either sponsor the tx or set a generous gas budget and trust it.

### Transaction failures

The most common failure modes in production:

- **Insufficient gas**: bump `gasBudget`. The TS SDK usually estimates correctly but extreme PTBs can underestimate.
- **Object version mismatch**: refresh state, retry.
- **Move abort**: a contract function rejected the call. Surface the abort code to the user, not the raw error.
- **Network drop / RPC outage**: retry with exponential backoff against a fallback RPC.

Build retry into your SDK wrapper, not into every component.

## Live examples

Public consumer-facing apps on Sui worth studying:

- **Slush**: the official wallet itself. UX reference.
- **DoubleUp**: gambling product, large active user base, good zkLogin flow.
- **Aftermath**: DeFi aggregator, complex PTB construction.
- **Bluefin**: perp DEX, mobile and web.
- **Cetus**: AMM, well-designed LP UX.
- **Suiet**: independent wallet; reference for connection patterns.
- **Capsule app shipping with Walrus**: blob storage UX; check the Walrus showcase.

When studying a live app, look at:

- How long from "land on site" to "useful first action complete"
- What the user sees during signing and confirmation
- How errors are surfaced
- Whether the app uses sponsored tx (you can tell by checking gas-payer in the explorer)

## Where to go next

- Frontend skills: `skills/build/frontend-design-guidelines/`, `skills/build/page-load-animations/`, `skills/build/number-formatting/`.
- zkLogin skill: `skills/build/sui-zk-login/`.
- Sponsored tx skill: `skills/build/sponsored-transactions/`.
- Mobile skill: `skills/build/build-mobile-sui/`.

Last updated: 2026-05-11. Updated for Sui SDK v2.0 (dapp-kit-react, DAppKitProvider, gRPC transport).
