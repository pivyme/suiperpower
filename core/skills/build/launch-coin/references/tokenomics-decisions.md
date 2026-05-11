# Tokenomics decisions for a Sui coin

Decimals, supply, and custody are the three load-bearing decisions. They are hard to reverse and they shape how the coin behaves in wallets, exchanges, and downstream protocols. Pick deliberately, document the reasoning in `.suiperpower/build-context.md`.

## Decimals

- 6 is the most common choice on Sui (matches USDC, mirrors Sui's own MIST scaling convention at 9). Pick 6 for utility coins where users will see whole-unit prices.
- 9 mirrors SUI itself. Pick 9 only if the coin is intended to compose 1:1 with SUI in math (e.g. a derivative or a wrapper).
- 18 mirrors EVM ERC-20 conventions. Avoid unless the coin has a hard EVM bridge requirement; the extra precision wastes display space and confuses users used to Sui's 6 / 9 norms.
- 0 (whole-unit only) is correct only for points or non-divisible utility tokens.

Decimals cannot be changed after publish. The `CoinMetadata` Object is the source of truth; downstream wallets and aggregators read it.

## Supply

- **Fixed**: full supply minted in `init`, TreasuryCap consumed (via wrapper struct or `treasury_into_supply`). No more coins ever. Pick when distribution is final at launch (airdrops, fair launches, fully-on-chain governance tokens).
- **Capped**: `TreasuryCap` retained, but a wrapper `mint` function enforces an upper bound. Pick when emissions follow a schedule (vesting, staking rewards, gradual unlocks) and the cap must be public and provable.
- **Open**: `TreasuryCap` retained with no on-chain cap. Pick only when a stablecoin or a wrapped asset, where supply tracks an off-chain backing.

Document who holds `TreasuryCap` in every case (multisig address, burned, or named EOA with a recovery plan). A `TreasuryCap` sitting in a deployer EOA with no recovery is a liability.

## Custody of TreasuryCap

- **Consumed**: the cleanest signal. Two options: (a) wrap the TreasuryCap in a module-level struct that exposes no public mint function, or (b) call `coin::treasury_into_supply(treasury)` to irreversibly convert it into `Supply<T>`. Never freeze or share the TreasuryCap (official Sui docs explicitly warn against both). Note: `coin::burn` burns a `Coin<T>`, not a TreasuryCap; the TreasuryCap authorizes the burn via `&mut` reference and remains intact afterward.
- **Multisig**: transfer the cap into a Sui multisig Object. Document the threshold and the signer set. This is the right answer for almost every coin that wants future emissions.
- **Module-bound**: keep the cap inside a struct stored at module level, with `mint` only callable by holding a separate `AdminCap`. Composes well with governance later.
- **EOA-held**: only acceptable when the cap holder is documented and the project owner explicitly accepts the rug-pull risk perception.

Capabilities passed by reference (`&mut TreasuryCap`) are safer than by value. Never return a cap from a `public` function.

## Metadata

- `name`: human-readable, no marketing fluff. "USD Coin" not "USD Coin: the future of money".
- `symbol`: 3 to 6 chars, all caps, ASCII only.
- `description`: one sentence. What the coin is, not what the project is.
- `icon_url`: HTTPS URL to a square PNG, ideally hosted on Walrus or a permanent CDN. IPFS without a pin is fragile.

Freeze the `CoinMetadata` Object (`transfer::public_freeze_object`) once you are confident in the values. Frozen metadata is what serious wallets and aggregators want to see before listing.

## Common pitfalls

- Picking 18 decimals to "match Ethereum". Wastes display space, confuses Sui-native users, no upside.
- Keeping `TreasuryCap` in the deployer EOA with no recovery plan. A lost key kills future emissions.
- Setting an icon URL on a CDN you do not control or a free hosting service that can disappear.
- Choosing "open supply" when "capped" would have done. Open supply lowers credibility for governance and utility tokens.
- Renaming or rebranding after launch and discovering metadata is frozen. Decide once, freeze deliberately.

## What to write back

In `.suiperpower/build-context.md`, append:

```markdown
### Coin tokenomics, <timestamp>
- decimals: <n>
- total supply policy: <fixed | capped | open>
- cap: <amount or none>
- TreasuryCap custody: <consumed:wrapper | consumed:treasury_into_supply | multisig:<addr> | module-bound | eoa:<addr>>
- CoinMetadata frozen: <yes | no>
- icon hosting: <walrus | self-hosted CDN | other>
- rationale: <one to three sentences>
```

Downstream skills (deploy-to-mainnet, ottersec-prep, validate-business-model) read this section.
