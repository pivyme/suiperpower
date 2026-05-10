# PTB pitfalls

Mistakes that compile but break at execute time.

## Result handles are placeholders, not values

```ts
const a = tx.splitCoins(tx.gas, [tx.pure.u64(100)]);
console.log(a); // not a real Coin yet
```

`a` is a proxy. You cannot inspect it client-side. It only becomes a real Object when the PTB executes.

Implication: do not branch on `a`'s value in TS. PTBs are static graphs; conditionality belongs in Move, not in the construction code.

## Reusing a result across multiple PTBs

A result from one PTB is not transferable to another PTB. Once the PTB executes, the resulting Objects have real ids you can pass to subsequent transactions, but the proxy handles do not survive across PTBs.

Common mistake: building two PTBs in sequence and trying to thread the first's result handle into the second. Build one PTB that contains both flows, or use the real Object id from the first PTB's effects after it settles.

## Gas coin conflicts

`tx.splitCoins(tx.gas, ...)` peels SUI off the gas coin. If you also try to use `tx.gas` as a separate gas coin, the runtime can fail in opaque ways.

Convention: split off what you need first, let the rest serve as gas. Do not over-engineer gas-coin manipulation.

## Command limits

Sui caps command count and input count per PTB (current limits are around 1024 each, verify in protocol config). Above that, the PTB rejects.

For loops that grow command count with input size, set a hard cap in the UI:

```ts
if (items.length > 100) {
  throw new Error("split into multiple PTBs above 100 items");
}
```

## Object freshness

If a PTB references an Object by id and version, but the version moved between client construction and execution, the PTB rejects.

Mitigations:

- Use `tx.object(id)` (the SDK fills in the latest version at build time).
- Avoid manually pinning versions unless you have a specific reason.

## Move call argument types

`tx.moveCall` argument types must match the Move function signature exactly. Common surprises:

- `vector<u8>` is not the same as `string`. Encode `b"..."` from the user's string.
- A by-value `Object` consumes it; a `&Object` reference does not. Reflect this with `tx.object(id)` (the SDK chooses based on the function signature when the type info is available).
- Generic Move functions need type arguments; pass via `typeArguments: ["0x...::module::Type"]`.

## Sponsoring a PTB

When a sponsor pays gas, the sponsor's signature covers the entire PTB. The sponsor cannot insert moves the user did not sign for, but they can refuse to sign or pad the gas budget.

Sponsor servers should validate the PTB's commands against an allowlist before signing. See `skills/build/sponsored-transactions/`.

## Sender vs gas owner

A PTB has a sender (signs the move calls) and a gas owner (pays gas). For non-sponsored flows they are the same address.

For sponsored flows:

- `tx.setSender(userAddr)` and `tx.setGasOwner(sponsorAddr)`.
- The sender's signature authorizes the moves; the sponsor's signature authorizes the gas usage.
- Both signatures cover the same bytes.

## Dry-run does not catch all errors

A dry-run executes against the current chain state. If state changes between dry-run and execution (someone else moved an Object, a price oracle updated), the execution can still revert.

For high-stakes flows, dry-run + execute should be very close in time. For longer-lived flows (a user clicks "buy" after seeing a UI for 30 seconds), accept that revert risk and surface "transaction failed" gracefully.

## Atomicity is per-PTB, not across PTBs

Two PTBs executed back to back are not atomic relative to each other. Any third party can interleave.

For "all or nothing" behavior across what would otherwise be two PTBs: combine into one PTB. If you cannot, design for the partial-state case.

Last updated: 2026-05-10.
