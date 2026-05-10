# OpenZeppelin Sui modules, quickref

Module names and exact APIs change across OZ Sui releases. Always verify against the pinned release before quoting an API.

## Patterns and the modules that replace them

| Hand-rolled pattern | OZ Sui replacement | Why |
|---|---|---|
| Custom `AdminCap` + ad-hoc checks | `access_control` (role-based) | Uniform pattern, audited |
| Custom owner field + transfer logic | `ownable` | Single-owner with safe transfer |
| Custom pause flag | `pausable` | Standardized, with capability gate |
| Custom upgrade authority handling | `upgradeable` | Wraps Sui's native upgrade with policy |
| Custom signer-set + threshold | `signer_registry` (or similar) | M-of-N pattern |
| Custom event emitter | `events` helpers | Typed event helpers |
| Bespoke checked arithmetic | `math::safe` (or similar) | Bounded helpers |

## Sample: access_control

The hand-rolled pattern usually looks like:

```move
public struct AdminCap has key, store { id: UID }
public struct ModeratorCap has key, store { id: UID }
public struct PauseCap has key, store { id: UID }

public fun mint(_: &AdminCap, /* ... */) { /* ... */ }
public fun moderate(_: &ModeratorCap, /* ... */) { /* ... */ }
```

The OZ access-control pattern collapses this to a single role registry:

```move
use openzeppelin::access_control::{Self, AccessControl};

const ROLE_ADMIN: vector<u8> = b"admin";
const ROLE_MODERATOR: vector<u8> = b"moderator";

public fun setup(/* ... */) {
    let mut ac = access_control::new(ctx);
    access_control::grant_role(&mut ac, ROLE_ADMIN, admin_addr);
    access_control::grant_role(&mut ac, ROLE_MODERATOR, mod_addr);
    transfer::share_object(ac);
}

public fun mint(ac: &AccessControl, /* ... */) {
    access_control::assert_role(ac, ROLE_ADMIN, ctx.sender());
    // ...
}
```

One source of truth for roles, transferable, audited.

## Sample: pausable

```move
use openzeppelin::pausable::{Self, Pausable};

public fun trade(p: &Pausable, /* ... */) {
    pausable::assert_not_paused(p);
    // ...
}

public fun pause(_: &PauseCap, p: &mut Pausable) {
    pausable::pause(p);
}

public fun unpause(_: &PauseCap, p: &mut Pausable) {
    pausable::unpause(p);
}
```

## Sample: ownable

```move
use openzeppelin::ownable::{Self, Ownable};

public fun privileged_op(o: &Ownable, /* ... */) {
    ownable::assert_owner(o, ctx.sender());
    // ...
}

public fun transfer_ownership(o: &mut Ownable, new_owner: address) {
    ownable::transfer_ownership(o, new_owner);
}
```

## Sample: upgradeable policy

OZ does not replace Sui's native upgrade flow; it adds policy. Typical wrapping:

```move
use openzeppelin::upgradeable::{Self, UpgradePolicy};

public fun authorize_upgrade(
    policy: &UpgradePolicy,
    cap: &mut UpgradeCap,
    digest: vector<u8>,
): UpgradeTicket {
    upgradeable::authorize(policy, cap, digest)
}
```

The policy can require a timelock, multi-sig signatures, or a specific governance body.

## Notes on naming

The exact module names (e.g. `access_control` vs `accesscontrol`, `pausable` vs `pause`) change between OZ Sui releases. Read the pinned release's `sources/` directory before importing, not this cheat-sheet.

When in doubt, browse `https://github.com/OpenZeppelin/openzeppelin-sui` at the pinned commit.

Last updated: 2026-05-10.
