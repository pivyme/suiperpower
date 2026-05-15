# 03, Frontend

Single-page faucet on TanStack Start. Three tabs, one vault stats card, one footer. Dark by default. Built so it works without the backend (chain-only fallback path) and obviously better when the backend is up.

## Page structure (`/` route)

```
<RootLayout>                                  // existing __root.tsx
  <Header />                                  // brand left, wallet button right
  <main>
    <HeroBlock />                             // title + subtitle
    <VaultStats />                            // 3 numbers in a row
    <FaucetCard>                              // tabbed card
      <TabBar>Get DUSDC | Return DUSDC | Refill</TabBar>
      <ClaimTab />   or   <ReturnTab />   or   <RefillTab />
    </FaucetCard>
    <HowItWorks />                            // 3 short paragraphs
    <Credit />                                // "made by Kelvin Adithya"
  </main>
</RootLayout>
```

No router beyond `/`. No 404 redirects. No auth flow.

## File tree (additions)

```
web/src/
├── routes/
│   └── index.tsx                  // overwrites the WebstarterOnboarding page
├── components/
│   ├── Header.tsx
│   ├── HeroBlock.tsx
│   ├── VaultStats.tsx
│   ├── FaucetCard.tsx
│   ├── ClaimTab.tsx
│   ├── ReturnTab.tsx
│   ├── RefillTab.tsx
│   ├── HowItWorks.tsx
│   ├── Credit.tsx
│   ├── WalletButton.tsx
│   ├── TurnstileWidget.tsx
│   └── AmountInput.tsx
├── providers/
│   └── SuiProviders.tsx           // dapp-kit + queryClient wiring
├── lib/
│   ├── api.ts                     // backend fetch wrapper
│   ├── fingerprint.ts             // canvas + UA + screen hash
│   └── sui/
│       ├── client.ts              // SuiClient(testnet)
│       ├── ptb-claim.ts
│       ├── ptb-return.ts
│       ├── ptb-refill.ts
│       ├── faucet-read.ts
│       └── format.ts
├── hooks/
│   ├── useVaultStats.ts           // TanStack Query
│   ├── useTxHint.ts
│   ├── useFaucetMutations.ts
│   └── useTurnstile.ts
└── config.ts                       // brand constants
```

The starter ships an onboarding page and a demo art component. Both are deleted as part of this build.

## Provider wiring

`src/routes/__root.tsx` already wraps `ThemeProvider`, `LenisSmoothScrollProvider`, `Toaster`. Add `SuiProviders` inside `ThemeProvider`.

`src/providers/SuiProviders.tsx`:

```tsx
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import '@mysten/dapp-kit/dist/index.css';

const networks = {
  testnet: { url: import.meta.env.VITE_SUI_RPC_URL || getFullnodeUrl('testnet') },
};

export function SuiProviders({ children }: { children: React.ReactNode }) {
  return (
    <SuiClientProvider networks={networks} defaultNetwork="testnet">
      <WalletProvider autoConnect>
        {children}
      </WalletProvider>
    </SuiClientProvider>
  );
}
```

Place the dapp-kit CSS import at the top of `styles.css` instead, so Tailwind v4 can layer over it without ordering surprises.

## Env validation (`src/env.ts`)

Use `@t3-oss/env-core` (already in deps) + zod:

```ts
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_API_URL: z.string().url(),
    VITE_SUI_NETWORK: z.literal('testnet'),
    VITE_SUI_RPC_URL: z.string().url(),
    VITE_FAUCET_PACKAGE_ID: z.string().min(1),
    VITE_FAUCET_OBJECT_ID: z.string().min(1),
    VITE_DUSDC_COIN_TYPE: z.string().min(1),
    VITE_TURNSTILE_SITE_KEY: z.string().min(1),
  },
  runtimeEnv: {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_SUI_NETWORK: import.meta.env.VITE_SUI_NETWORK,
    VITE_SUI_RPC_URL: import.meta.env.VITE_SUI_RPC_URL,
    VITE_FAUCET_PACKAGE_ID: import.meta.env.VITE_FAUCET_PACKAGE_ID,
    VITE_FAUCET_OBJECT_ID: import.meta.env.VITE_FAUCET_OBJECT_ID,
    VITE_DUSDC_COIN_TYPE: import.meta.env.VITE_DUSDC_COIN_TYPE,
    VITE_TURNSTILE_SITE_KEY: import.meta.env.VITE_TURNSTILE_SITE_KEY,
  },
  emptyStringAsUndefined: true,
});
```

Importing from `@/env` everywhere instead of `import.meta.env` is mandatory per the starter rule.

## PTB construction

### `ptb-claim.ts`

```ts
import { Transaction } from '@mysten/sui/transactions';
import { env } from '../../env';

export interface BuildClaimArgs {
  suiAmountMist: bigint;
}

export function buildClaimTx({ suiAmountMist }: BuildClaimArgs): Transaction {
  const tx = new Transaction();
  // Split the gas coin to produce a Coin<SUI> of the exact requested amount.
  const [payment] = tx.splitCoins(tx.gas, [tx.pure.u64(suiAmountMist)]);
  tx.moveCall({
    target: `${env.VITE_FAUCET_PACKAGE_ID}::faucet::claim`,
    typeArguments: [env.VITE_DUSDC_COIN_TYPE],
    arguments: [
      tx.object(env.VITE_FAUCET_OBJECT_ID),
      payment,
      tx.object('0x6'), // Clock
    ],
  });
  return tx;
}
```

### `ptb-return.ts`

User provides a `dusdcCoinId` they own. We do not auto-merge their DUSDC coins, the wallet handles that; we just consume the one they pick. For simplicity we take the largest one and split if needed. dapp-kit's `useSuiClient().getCoins()` lets us fetch their coin objects.

```ts
import { Transaction } from '@mysten/sui/transactions';
import { env } from '../../env';

export interface BuildReturnArgs {
  dusdcAmountBase: bigint;
  ownerCoins: { coinObjectId: string; balance: string }[];
}

export function buildReturnTx({ dusdcAmountBase, ownerCoins }: BuildReturnArgs): Transaction {
  const tx = new Transaction();
  // Merge all DUSDC coins into the first, then split the exact amount.
  const primary = tx.object(ownerCoins[0].coinObjectId);
  if (ownerCoins.length > 1) {
    tx.mergeCoins(primary, ownerCoins.slice(1).map(c => tx.object(c.coinObjectId)));
  }
  const [payment] = tx.splitCoins(primary, [tx.pure.u64(dusdcAmountBase)]);
  tx.moveCall({
    target: `${env.VITE_FAUCET_PACKAGE_ID}::faucet::return_quote`,
    typeArguments: [env.VITE_DUSDC_COIN_TYPE],
    arguments: [
      tx.object(env.VITE_FAUCET_OBJECT_ID),
      payment,
      tx.object('0x6'),
    ],
  });
  return tx;
}
```

### `ptb-refill.ts`

Same merge-then-split pattern, calls `faucet::refill`.

## State management

TanStack Query for everything async. Query keys:

- `['vault-stats']`, refetch every 10s when tab is visible, `staleTime: 5000`
- `['tx-hint', addr]`, refetch every 20s when a wallet is connected
- `['dusdc-coins', addr]`, refetch on tab switch to Return/Refill, after a successful tx

Mutations:

- `useClaim()`, wraps `useSignAndExecuteTransaction` + post-success ClaimEvent ingestion
- `useReturn()`, same
- `useRefill()`, same

## Wallet integration

dapp-kit's hooks:

- `useCurrentAccount()`, returns `{ address } | null`
- `useConnectWallet()`, `useDisconnectWallet()`
- `useSignAndExecuteTransaction()`, with `chain: 'sui:testnet'`

`<WalletButton />`: shows "Connect wallet" when disconnected; shows shortened address + disconnect on click when connected. Uses HeroUI Button via direct import.

## Fingerprint

`src/lib/fingerprint.ts`:

```ts
import { sha256 } from '@noble/hashes/sha2';
import { bytesToHex } from '@noble/hashes/utils';

export async function getFingerprint(): Promise<string> {
  const parts = [
    navigator.userAgent,
    String(screen.width), String(screen.height), String(screen.colorDepth),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    String(navigator.hardwareConcurrency || 0),
    String((navigator as { deviceMemory?: number }).deviceMemory || 0),
    String(navigator.language),
  ];

  // Canvas fingerprint
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200; canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(0, 0, 60, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('dusdc-faucet', 2, 15);
      parts.push(canvas.toDataURL().slice(-200));
    }
  } catch { /* ignore canvas errors */ }

  const data = new TextEncoder().encode(parts.join('|'));
  return bytesToHex(sha256(data));
}
```

Cached in `sessionStorage` once computed.

## Components

### `Header`

Sticky top, 64px tall, `bg-neutral-950/80 backdrop-blur border-b border-neutral-800`. Left: "DUSDC Faucet" wordmark in Google Sans Code. Right: `<WalletButton />` and a theme toggle (HeroUI Switch on a sun/moon icon row).

### `HeroBlock`

Centered, 64px below header. Title "DUSDC Faucet · DeepBook Predict Testnet" in Google Sans Flex 600 at 44px desktop / 32px mobile. Subtitle "Trade testnet SUI for DUSDC at 100:1. Swap back any time. No form, no waiting." in neutral-400 at 18px.

### `VaultStats`

Three numbers in a row (stacked on mobile). Each in its own card with `border-neutral-800 bg-neutral-900/50`.

- DUSDC available, big number, `font-mono`, e.g. `420.000000`
- Served today, smaller, with claims count subtitle
- Rate, "100 DUSDC / 1 SUI"

States:
- loading, skeleton (animated `bg-neutral-800` block)
- error, "stats unavailable" caption in neutral-500, no full failure
- low-vault (< per-tx-cap of DUSDC), warning chip "vault running low, ping DeepBook to refill"

### `FaucetCard`

A 480px max-width card, centered. `rounded-2xl`, `border border-neutral-800`, `bg-neutral-900`, `p-6`. Internal tab bar uses a simple radio-as-buttons row, no HeroUI Tabs needed.

### `ClaimTab`

Form:
- amount input (SUI), default `0.5`, max derived from `Math.min(perTxCap, txHint.remaining)`
- "Get DUSDC" preview: live computes `amount * rate_num / rate_den` and shows the DUSDC the user will receive
- Turnstile widget, invisible mode, renders the challenge inline if Cloudflare requires
- Submit button "Claim"

Validation states:
- empty amount, button disabled
- over per-tx cap, inline error "max 1 SUI per claim"
- over daily cap (from tx-hint), inline error "you've used 4.5 of 5 SUI today, try a smaller amount"
- vault empty, button text changes to "vault empty" and disabled
- not connected, button text changes to "connect wallet"

Submit flow:
1. Call `/verify`, if `allowed: false`, show inline error.
2. Build PTB, call `useSignAndExecuteTransaction`.
3. On success, post to `/event/claim`, refetch vault stats and tx-hint, toast `Claimed 50.000000 DUSDC. tx: 0x...` with explorer link.
4. On failure, toast the wallet's error verbatim.

### `ReturnTab`

Form:
- amount input (DUSDC), default `0`, max = user's DUSDC balance
- SUI preview using inverse rate
- "Return" button

Disabled when:
- not connected
- DUSDC balance is zero (text: "you have no DUSDC")
- vault SUI insufficient for the requested amount (text: "returns paused, vault needs SUI deposits")
- `returnEnabled === false` (text: "returns disabled by admin")

Submit flow: same shape as claim minus Turnstile, plus a balance refetch.

### `RefillTab`

Form:
- amount input (DUSDC), default `100`
- "Top up vault" button
- copy: "Anyone can refill. Recommended balance: 1,000+ DUSDC."

Submit flow: build refill PTB, sign, on success show a toast "Refilled vault with X DUSDC, thanks for keeping it stocked."

### `AmountInput`

Reusable. Props: `value: bigint`, `onChange: (v: bigint) => void`, `unit: 'SUI' | 'DUSDC'`, `decimals: number`, `max?: bigint`, `placeholder?: string`. Renders a big numeric input with the unit chip on the right, plus a "MAX" button when `max` is provided. Stores internal string state to avoid floating-point in React; converts to bigint on every change.

### `TurnstileWidget`

Wraps `@marsidev/react-turnstile`. Props: `onToken: (t: string) => void`, `onError: () => void`. Site key from env. Invisible by default.

### `Credit`

```tsx
<footer className="py-12 text-center text-sm text-neutral-500">
  made by <a href="https://klvn.dev" target="_blank" rel="noreferrer" className="text-neutral-300 underline-offset-4 hover:underline">Kelvin Adithya</a>
</footer>
```

## Error and edge states

### Wallet not on testnet

If `useCurrentAccount().chains` does not include `sui:testnet`, show a banner "Switch your wallet to Sui Testnet". Most wallets follow the dapp's request automatically, so this is a fallback.

### Vault dry

When `stats.dusdcAvailable === 0`: ClaimTab shows a full-card warning "vault empty, ping @deepbook to refill". Return and Refill tabs still work.

### Backend offline

If `/stats` 5xx's, switch to direct chain reads using `SuiClient.getObject`. Show a small neutral-500 caption "stats from chain" so we know the cache is bypassed. `/verify` failure: skip Turnstile path, send the claim anyway, the chain caps catch any abuse.

### Slow tx

Show an inline mini-spinner inside the button for up to 30s, then if still pending offer "view in explorer".

## Performance

- Bundle Sui dapp-kit lazily? No, it's needed on the only page. Skip.
- Pre-warm vault stats on mount with `prefetchQuery`.
- Avoid re-renders by memoizing the formatter.

## Accessibility

- All inputs have `<label>` (visually hidden if not shown).
- Tab bar uses `role="tablist"` + `aria-selected`.
- Toast errors also appear inline so screen readers do not depend on transient elements.
- Focus visible at all times via the `focus-ring` utility.
