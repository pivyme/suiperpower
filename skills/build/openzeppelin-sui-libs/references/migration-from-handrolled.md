# Migrating hand-rolled patterns to OZ Sui

Migrations are dangerous if rushed. Pattern: rewrite one path, rebuild, run tests, commit. Then the next.

## Pattern A: hand-rolled AdminCap to access_control

Before:

```move
module my_pkg::treasury;

public struct AdminCap has key, store { id: UID }

fun init(ctx: &mut TxContext) {
    transfer::transfer(AdminCap { id: object::new(ctx) }, ctx.sender());
}

public fun mint(_: &AdminCap, treasury: &mut Treasury, amount: u64) {
    treasury.balance = treasury.balance + amount;
}
```

After:

```move
module my_pkg::treasury;

use openzeppelin::access_control::{Self, AccessControl};

const ROLE_MINTER: vector<u8> = b"minter";

fun init(ctx: &mut TxContext) {
    let mut ac = access_control::new(ctx);
    access_control::grant_role(&mut ac, ROLE_MINTER, ctx.sender());
    transfer::share_object(ac);
}

public fun mint(ac: &AccessControl, treasury: &mut Treasury, amount: u64, ctx: &TxContext) {
    access_control::assert_role(ac, ROLE_MINTER, ctx.sender());
    treasury.balance = treasury.balance + amount;
}
```

Migration steps:

1. Add OZ dep, pin version.
2. Update `init` to create the `AccessControl` and grant the role.
3. Update every function that took `&AdminCap` to take `&AccessControl` and assert the role.
4. Rewire tests: scenarios that gave `AdminCap` to a user now grant `ROLE_MINTER` instead.
5. Run the full test suite. If anything fails, you missed a path.
6. Delete the now-unused `AdminCap` struct.

## Pattern B: hand-rolled pause flag to pausable

Before:

```move
public struct Config has key {
    id: UID,
    paused: bool,
}

public fun trade(cfg: &Config, /* ... */) {
    assert!(!cfg.paused, E_PAUSED);
    // ...
}

public fun pause(cfg: &mut Config, _: &AdminCap) {
    cfg.paused = true;
}
```

After:

```move
use openzeppelin::pausable::{Self, Pausable};

public struct Config has key {
    id: UID,
}

public fun trade(p: &Pausable, /* ... */) {
    pausable::assert_not_paused(p);
    // ...
}

public fun pause(p: &mut Pausable, _: &PauseCap) {
    pausable::pause(p);
}
```

Migration steps:

1. Add OZ dep.
2. Replace `paused: bool` field with a separate `Pausable` Object.
3. Update every read site (`!cfg.paused`) to use `pausable::assert_not_paused`.
4. Update every write site (`cfg.paused = ...`) to use `pausable::pause` / `unpause`.
5. Tests: scenarios that flipped the bool now call the OZ functions.

## Pattern C: hand-rolled multi-signer to signer_registry

If you implemented your own M-of-N signer pattern with a list and threshold checks:

Before:

```move
public struct MultiSig has key {
    id: UID,
    signers: vector<address>,
    threshold: u64,
    pending: VecMap<vector<u8>, vector<address>>,
}
```

After: import OZ's signer registry and replace the bookkeeping.

The migration is more involved than for access_control or pausable; budget extra time and ensure tests cover edge cases (signer rotation, threshold change, replay protection).

## Migration checklist

For every pattern migrated:

- [ ] OZ dep pinned, builds.
- [ ] All call sites updated.
- [ ] All tests updated.
- [ ] All tests pass.
- [ ] Old struct(s) deleted, not just orphaned.
- [ ] `build-context.md` updated.
- [ ] Diff reviewed for any leftover hand-rolled paths.

## Rollback plan

If an OZ migration introduces a regression you cannot diagnose quickly:

- Revert the migration commit.
- File an issue with the failing test case.
- Revisit after the OZ Sui release that addresses the gap (or stay hand-rolled with documented rationale).

Do not ship a half-migrated package. Either go all in for a pattern, or stay out.

Last updated: 2026-05-10.
