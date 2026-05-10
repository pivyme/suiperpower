# Capability leakage patterns

Capabilities are Sui Move's authority primitive. A `TreasuryCap`, `AdminCap`, `UpgradeCap`, or any user-defined cap struct grants whoever holds it the right to perform a privileged action. Leaking a capability means that authority escapes to a wider audience than intended. The compiler will not catch this. The user has to.

## Pattern A, capability passed by value

```move
public fun mint_to(cap: TreasuryCap<MY_COIN>, amount: u64, ctx: &mut TxContext): Coin<MY_COIN> {
    coin::mint(&mut cap, amount, ctx)
}
```

The cap is consumed and not returned. The caller has to provide the cap, then it disappears. If the function is `public`, anyone who somehow obtains the cap can drain authority forever.

**Fix**: pass by mutable reference and keep the cap with its rightful owner.

```move
public fun mint_to(cap: &mut TreasuryCap<MY_COIN>, amount: u64, ctx: &mut TxContext): Coin<MY_COIN> {
    coin::mint(cap, amount, ctx)
}
```

## Pattern B, capability returned from a public function

```move
public fun create_admin(ctx: &mut TxContext): AdminCap {
    AdminCap { id: object::new(ctx) }
}
```

Anyone can call this and mint themselves an `AdminCap`. The function should be private to the module or only callable in `init`.

**Fix**: produce capabilities only at module init, or gate creation behind another capability.

## Pattern C, capability stored in a publicly-readable Display

`Display<T>` is publicly indexable. If you set a Display field that holds a cap (or even a string that exposes a cap-like secret), the cap is visible to all RPC readers.

**Fix**: never put authority-bearing data in Display. Display is for human-facing metadata only.

## Pattern D, friend declaration that mints

```move
module my_pkg::treasury {
    friend my_pkg::airdrop;
    public(friend) fun mint_for_airdrop(...) { ... }
}
```

If `airdrop` becomes public-callable later, the mint authority follows. Audit every `friend` declaration as if it were a public mint path.

**Fix**: prefer `public(package)` over friend, and audit every public function in the friend module to ensure it does not expose the privileged path.

## Pattern E, hot-potato that is not actually hot

A "hot potato" is a struct without `drop` or `store`, intended to force the caller to consume it within the same PTB. If you accidentally give it `drop`, the caller can silently throw it away, defeating the pattern.

**Fix**: hot-potato structs should have NO abilities. If the compiler complains, check whether the consumer pattern is correctly implemented before adding an ability.

## Pattern F, transferring a capability to a default EOA

```move
fun init(ctx: &mut TxContext) {
    let cap = AdminCap { id: object::new(ctx) };
    transfer::public_transfer(cap, ctx.sender());
}
```

If the deployer's EOA is later compromised, the cap is gone. For production, transfer to a multisig Object instead.

**Fix**: document the cap holder. For mainnet, prefer multisig custody (or burn the cap if no further authority is needed).

## Detection workflow

When the user reports "a function refuses to authorize" or "anyone seems to be able to mint":

1. List every cap struct in the module.
2. For each, find every function that takes it as a parameter (by value, ref, or mut ref).
3. For each, find every function that creates a new instance.
4. For each, find every storage path (transfer, share_object, public_share_object).
5. Trace whether any non-trusted caller can reach the cap.

If any non-trusted path leads to the cap, that is the leak. Fix the leak, not the symptom.

## What to write back

Append to `.suiperpower/build-context.md`:

```markdown
### Capability audit, <timestamp>
- cap: <name>
- creators: <function list>
- consumers: <function list>
- custody after init: <multisig | burned | EOA | module-bound>
- leak found: <yes | no, summary if yes>
- fix: <what changed>
```
