# Pyth on Sui quickstart

Minimal recipes for integrating Pyth pull-based price feeds. Default network is testnet.

## Install TS SDK

```bash
pnpm add @pythnetwork/pyth-sui-js @mysten/sui
```

## Move dependency (Move.toml)

Testnet:

```toml
[dependencies.Pyth]
git = "https://github.com/pyth-network/pyth-crosschain.git"
subdir = "target_chains/sui/contracts"
rev = "sui-contract-testnet"

[dependencies.Wormhole]
git = "https://github.com/wormhole-foundation/wormhole.git"
subdir = "sui/wormhole"
rev = "sui/testnet"
```

Mainnet:

```toml
[dependencies.Pyth]
git = "https://github.com/pyth-network/pyth-crosschain.git"
subdir = "target_chains/sui/contracts"
rev = "sui-contract-mainnet"

[dependencies.Wormhole]
git = "https://github.com/wormhole-foundation/wormhole.git"
subdir = "sui/wormhole"
rev = "sui/mainnet"
```

Both networks also require the Sui framework dependency. Check your existing `Move.toml` for the correct `Sui` dependency rev.

## Hermes endpoints

| Network  | Hermes URL                            |
|----------|---------------------------------------|
| Testnet  | `https://hermes-beta.pyth.network`    |
| Mainnet  | `https://hermes.pyth.network`         |

## Contract addresses

Testnet (Beta channel):

- Pyth State: `0x243759059f4c3111179da5878c12f68d612c21a8d54d85edc86164bb18be1c7c`
- Wormhole State: `0x31358d198147da50db32eda2562951d53973a0c0ad5ed738e9b17d88b213d790`

Mainnet (Stable channel):

- Pyth State: `0x1f9310238ee9298fb703c3419030b35b22bb1cc37113e3bb5007c99aec79e5b8`
- Wormhole State: `0xaeab97f96cf9877fee2883315d459552b2b921edc16d7ceac6eab944dd88919c`

## Common feed IDs (Stable/mainnet)

| Pair      | Feed ID (hex, no 0x prefix)                                              |
|-----------|--------------------------------------------------------------------------|
| SUI/USD   | `23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744`       |
| BTC/USD   | `e62df6c8b4a85fe1a67db44dc12de5db330f7ac66b72dc658afedf0f4a415b43`       |
| ETH/USD   | `ff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace`       |
| USDC/USD  | `eaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a`       |

To look up other feeds:

```
GET https://hermes.pyth.network/v2/price_feeds?query=<symbol>&asset_type=crypto
```

Beta (testnet) and Stable (mainnet) Hermes may return different feed IDs for the same asset. Always verify against the Hermes endpoint you are targeting.

## Move contract pattern

Your contract receives `&PriceInfoObject`, never calls Pyth update functions directly.

```move
module my_pkg::my_module {
    use pyth::price_info::PriceInfoObject;
    use pyth::price_info;
    use pyth::price::{Self, Price};
    use pyth::i64;
    use sui::clock::Clock;

    public fun use_price(
        price_info_object: &PriceInfoObject,
        clock: &Clock,
        max_age_secs: u64,
    ) {
        let price: Price = price_info::get_price_no_older_than(
            price_info_object, clock, max_age_secs
        );
        let price_value = price::get_price(&price);   // I64
        let expo = price::get_expo(&price);            // I64, typically -8
        let conf = price::get_conf(&price);            // u64
        let timestamp = price::get_timestamp(&price);  // u64

        // Your logic here. Remember: real_price = price_value * 10^expo
    }
}
```

## Full TS integration

```typescript
import { SuiPythClient, SuiPriceServiceConnection } from "@pythnetwork/pyth-sui-js";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

// Config (testnet)
const HERMES = "https://hermes-beta.pyth.network";
const PYTH_STATE = "0x243759059f4c3111179da5878c12f68d612c21a8d54d85edc86164bb18be1c7c";
const WORMHOLE_STATE = "0x31358d198147da50db32eda2562951d53973a0c0ad5ed738e9b17d88b213d790";
const SUI_USD_FEED = "23d7315113f5b1d3ba7a83604c44b94d79f4fd69af77f804fc7f920a6dc65744";

const suiClient = new SuiClient({ url: getFullnodeUrl("testnet") });

// 1. Fetch signed price update from Hermes
const connection = new SuiPriceServiceConnection(HERMES);
const priceUpdateData = await connection.getPriceFeedsUpdateData([SUI_USD_FEED]);

// 2. Build PTB: update price, then call your contract
const tx = new Transaction();
const pythClient = new SuiPythClient(suiClient, PYTH_STATE, WORMHOLE_STATE);
const priceInfoObjectIds = await pythClient.updatePriceFeeds(
    tx, priceUpdateData, [SUI_USD_FEED]
);

// 3. Call your Move function with the PriceInfoObject
tx.moveCall({
    target: `${YOUR_PACKAGE_ID}::my_module::use_price`,
    arguments: [
        tx.object(priceInfoObjectIds[0]),
        tx.object("0x6"),           // Clock object
        tx.pure.u64(60),            // max_age_secs
    ],
});

// 4. Sign and execute
const result = await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: keypair,
});
console.log("digest:", result.digest);
```

The SDK handles the Pyth update fee automatically by splitting from the transaction's gas coin.

Last updated: 2026-05-11. Sources: https://docs.pyth.network/price-feeds/use-real-time-data/sui, https://docs.pyth.network/price-feeds/contract-addresses/sui
