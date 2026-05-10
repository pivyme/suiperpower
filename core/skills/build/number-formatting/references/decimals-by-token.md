# Sui ecosystem coin decimals

Common decimals encountered across Sui-native and bridged coins. Always confirm against the Object's `CoinMetadata` at runtime; this list is a quick reference, not authoritative.

## Native

- **SUI**: 9 decimals. The base unit is MIST (1 SUI = 1,000,000,000 MIST).

## Stablecoins (Sui-native or bridged)

- **USDC** (Sui-native via Circle): 6
- **USDT** (bridged via Wormhole or LayerZero): 6
- **USDC** (Wormhole-wrapped older variant): 6, but may exist alongside the native form. Check the Object type.

## Sponsor / DeFi tokens

- **DEEP** (DeepBook governance): 6
- **WAL** (Walrus protocol): 9
- **SCA** (Scallop governance): 9
- Many Scallop sToken / market tokens: 9

## Wrapped or bridged

- **WETH** (bridged): 8 on most Sui bridges (NOT 18 like Ethereum-native ETH). Always verify per bridge.
- **WBTC** (bridged): 8.
- **NAVX**, other DeFi token decimals vary; never assume.

## How to look up at runtime

```ts
const metadata = await suiClient.getCoinMetadata({ coinType });
const decimals = metadata?.decimals ?? 9;
```

Cache `CoinMetadata` per `coinType` for the session. It does not change post-publish (and if it does for a coin you depend on, that is a red flag).

## Decimals selection for new coins

When launching your own coin via `launch-coin`:

- 6 is the right default for utility / payment coins (matches USDC, comfortable for human-readable amounts).
- 9 mirrors SUI. Pick when the coin composes 1:1 with SUI in math.
- 18 mirrors EVM. Avoid unless cross-chain symmetry is a hard requirement.
- 0 only for whole-unit-only tokens (points, non-divisible utility).

See `skills/build/launch-coin/references/tokenomics-decisions.md` for the longer discussion.

## Gotchas

- The same logical token can exist on Sui as multiple Object types (a native version and a bridged version) with the same symbol but different decimals. Always disambiguate by Object type.
- `CoinMetadata` decimals are immutable post-publish.
- Display rounding: never round token values silently. If you display 4 decimals out of 9, also link to the explorer for the full value.
