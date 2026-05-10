# Reading a PTB dry-run

A dry-run returns what would happen if the PTB executed against current chain state. Treat it as "rehearsal," not a guarantee.

## What you get back

```ts
const dryRun = await sui.dryRunTransactionBlock({ transactionBlock: txBytes });
```

The response has:

- `effects.status`: success or failure with error string.
- `effects.gasUsed`: predicted gas use.
- `balanceChanges`: net balance change per address per coin type.
- `objectChanges`: created, mutated, deleted, transferred.
- `events`: events the move calls emit.

## Verifying intent

For each PTB you write, name the expected outcome. Then confirm:

- Did each `balanceChange` match expectation? (User's USDC down by 10, vault's USDC up by 10.)
- Were the right Objects created? (One Document mint.)
- Were the right Objects transferred? (To the buyer.)
- Did the right events fire? (`Purchased` with the correct fields.)

If any one of these is wrong, fix the PTB before signing.

## Reading balanceChanges

```ts
[
  { owner: { AddressOwner: USER_ADDR }, coinType: "0x2::sui::SUI", amount: "-1100000000" },
  { owner: { AddressOwner: USER_ADDR }, coinType: "0x...::usdc::USDC", amount: "10000000" },
  { owner: { AddressOwner: SELLER_ADDR }, coinType: "0x2::sui::SUI", amount: "1000000000" },
]
```

The user spent ~1.1 SUI (1 SUI principal + 0.1 SUI gas), got 10 USDC, and the seller received 1 SUI. Verify the gas slippage is reasonable (single-digit percent, not 50%).

## Reading objectChanges

```ts
[
  { type: "created", objectType: "...::market::Document", objectId: "0x...", owner: { AddressOwner: BUYER } },
  { type: "mutated", objectType: "...::market::Listing", objectId: "0x...", owner: { Shared: ... } },
]
```

Confirm the new Object went to the right owner. Mutations of shared Objects are normal and expected when the PTB calls a function on them.

## Reading events

```ts
[
  { type: "...::market::Purchased", parsedJson: { item: "0x...", buyer: "0x...", price: "1000000000" } },
]
```

If your indexer relies on this event, confirm field names and types are what the indexer expects.

## When the dry-run fails

```ts
{ status: { status: "failure", error: "MoveAbort(MoveLocation { module: ..., function: 5, instruction: 12, function_name: \"buy\" }, 3)" } }
```

The abort code is the third argument to `assert!` in the Move source. Map the abort code to the Move source's error constants:

```move
const E_INSUFFICIENT_PAYMENT: u64 = 3;
```

Knowing the constant tells you immediately why the PTB failed.

## Using dry-run for fee discovery

`gasUsed.computationCost`, `storageCost`, `storageRebate` give you a real gas estimate. Use them to set the explicit budget:

```ts
const totalGas = BigInt(dryRun.effects.gasUsed.computationCost)
  + BigInt(dryRun.effects.gasUsed.storageCost)
  - BigInt(dryRun.effects.gasUsed.storageRebate);

tx.setGasBudget(totalGas + 10_000_000n); // 10% headroom
```

## When dry-run lies

Dry-run executes against a snapshot of the chain. If the state changes between dry-run and execution:

- Object versions move (rare; SDK handles refreshes for `tx.object(id)`).
- Price oracles update.
- Other users mutate shared Objects.

For latency-sensitive flows, dry-run and execute back to back. For multi-second user delay, accept that the real result may differ.

Do not use dry-run as a substitute for actual on-chain testing. Run the PTB on testnet to confirm behavior matches.

Last updated: 2026-05-10.
