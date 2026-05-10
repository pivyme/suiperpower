# Capability patterns on Sui

Capabilities are Sui's permission system. A function that takes `&AdminCap` says "this requires the AdminCap to call." Possession is permission.

## The basics

A capability is a Move struct with `key + store` abilities. Examples:

```move
public struct AdminCap has key, store { id: UID }
```

The capability's existence is the access token. Holding it lets you call gated functions.

## By-reference vs by-value

Almost always by reference (`&AdminCap`). The function checks possession without consuming the cap:

```move
public fun mint_protected(_: &AdminCap, /* ... */) {
    // ...
}
```

By value (`AdminCap`) consumes the cap. Use only for "destroy this cap to perform a one-time op":

```move
public fun retire_admin(cap: AdminCap) {
    let AdminCap { id } = cap;
    object::delete(id);
    // admin role is now retired forever
}
```

## Single AdminCap

Simplest pattern. One cap, one holder.

```move
fun init(ctx: &mut TxContext) {
    transfer::transfer(AdminCap { id: object::new(ctx) }, ctx.sender());
}
```

Where to send the cap:

- A multisig address (production).
- An EOA (testnet, dev).
- A timelock contract (governance).

Decision: who holds it determines what an attacker who compromises the holder can do. For consequential power, use a multisig.

## Multi-cap split

When permissions are differentiated, split the cap:

```move
public struct AdminCap has key, store { id: UID }
public struct PauseCap has key, store { id: UID }
public struct ModeratorCap has key, store { id: UID }
```

Each cap gates a different surface. The compromise of one does not give the others.

For more than three caps, switch to a role registry (OZ access_control or similar). Hand-rolled multi-cap stacks become unwieldy.

## TreasuryCap (coin standard)

The `coin::create_currency` flow returns a `TreasuryCap<T>`. Holding it lets you mint and burn the coin.

```move
public fun mint_more(
    cap: &mut TreasuryCap<MY_COIN>,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
    let coin = coin::mint(cap, amount, ctx);
    transfer::public_transfer(coin, recipient);
}
```

Treat the TreasuryCap like a printing press. Hold it carefully (multisig for production), or burn it forever after the initial supply is minted (a fixed-supply coin).

## Witness pattern

A "witness" is a one-time-use struct. Common in init for proving uniqueness:

```move
module my_pkg::my_coin;

public struct MY_COIN has drop {} // OTW

fun init(witness: MY_COIN, ctx: &mut TxContext) {
    let (treasury, metadata) = coin::create_currency(witness, /* ... */, ctx);
    transfer::public_freeze_object(metadata);
    transfer::public_transfer(treasury, ctx.sender());
}
```

The OTW must be named identically to the module path's last segment in uppercase. Sui creates exactly one at publish.

## UpgradeCap

Sui's protocol-level upgrade mechanism. Holding `UpgradeCap` lets you upgrade the package.

Decisions:

- Keep it: your team can upgrade.
- Transfer to a multisig: governance can upgrade.
- Burn it: package is permanently immutable.
- Wrap in OZ upgradeable: add policy (timelock, multisig) on top.

For mainnet, document the choice in `THREAT_MODEL.md`. Auditors will ask.

## Capability leak prevention

The capability's value lives in possession. Anything that exposes the cap is a leak.

Common leaks:

- A `display::add` field that interpolates a struct field which contains the cap.
- A public read function that returns `&AdminCap` (just looking at it might be fine, but downstream code might extract).
- A capability stored inside a shared Object that has a public mutation function.

Rule of thumb: keep capability handling out of the read path. If a public function returns something, that something should not contain a cap.

## Capability types vs phantom types

For type safety across coin types, generic capability:

```move
public struct MintCap<phantom T> has key, store { id: UID }
```

Phantom T is a compile-time tag. `MintCap<USDC>` and `MintCap<MY_COIN>` are different types and cannot be confused.

Use this when one module mints multiple coin types and you want compile-time enforcement that you do not mix them up.

## Capability handoff via PTB

A capability can be created in one move call inside a PTB and passed to a subsequent move call:

```ts
const tx = new Transaction();

const cap = tx.moveCall({ target: `${PKG}::factory::issue_temp_cap`, arguments: [...] });

tx.moveCall({ target: `${PKG}::vault::do_thing`, arguments: [tx.object(VAULT), cap] });
```

For one-off privileged ops where issuing a capability is a step in the same flow as using it. The cap exists only inside the PTB and is consumed by the second call.

Last updated: 2026-05-10.
