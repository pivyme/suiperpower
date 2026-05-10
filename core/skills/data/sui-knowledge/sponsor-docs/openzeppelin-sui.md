# OpenZeppelin on Sui (knowledge brief)

## What it is

OpenZeppelin's Sui libraries are audited Move primitives that implement common patterns: access control, pausable, upgradeable, signers, role-based permissions, and more. They are distinct from OZ's EVM and Cairo libraries; the Sui versions are designed around Move's resource semantics rather than mapped one-to-one from Solidity.

OpenZeppelin is a Sui Overflow 2026 prize sponsor.

## When to use it

- Any production-grade Sui Move package. Hand-rolling access control or pausable patterns from scratch is unnecessary risk.
- Refactoring an existing project to remove duplicated boilerplate.
- When you want a published audit trail backing the access pattern you depend on.

When NOT to use it:

- Toy or learning projects where the goal is to understand the underlying pattern.
- Patterns that OZ Sui does not yet cover; check the latest module list before assuming.

## Key modules

(Always cross-reference the latest OZ Sui release for module names and signatures; this list is illustrative.)

- **Access control**: role-based permission checks, capability-style.
- **Ownable**: single-owner pattern with transfer.
- **Pausable**: pause and unpause an action surface, gated by a capability.
- **Upgradeable**: helpers around the Sui native upgrade flow with policy enforcement.
- **Signer registry**: multiple authorized signers, threshold checks.
- **Math safe**: bounded arithmetic helpers (where Move's native abort is not the desired behavior).
- **Emit helpers**: standardized events for common state transitions.

Module names and exact APIs change as the libraries evolve. Pin to a specific commit or release in `Move.toml`.

## How to depend on OZ Sui in `Move.toml`

```toml
[dependencies]
OpenZeppelin = { git = "https://github.com/OpenZeppelin/openzeppelin-sui.git", rev = "<release-tag-or-commit>" }
```

Use a stable release tag or a specific commit; `main` moves over time and breaks builds.

## Minimal integration recipe (access control example)

```move
module my_package::treasury;

use openzeppelin::access_control::{Self, AccessControl};

public struct AdminCap has key, store { id: UID }

fun init(ctx: &mut TxContext) {
    let admin = AdminCap { id: object::new(ctx) };
    transfer::transfer(admin, ctx.sender());
}

public fun mint_admin_only(_: &AdminCap, /* ... */) {
    // possession of AdminCap is the permission check
}
```

When OZ provides a more general role registry (multiple roles, threshold checks), import the OZ module and configure roles at init.

## Common pitfalls

- **Move resource semantics differ from Solidity.** A function that "transfers ownership" in OZ Solidity changes a storage slot; in OZ Sui, it transfers an Object. Do not assume API parity by name.
- **Module versioning.** OZ Sui is younger than the EVM library. Breaking changes between versions are still common. Pin and audit deps before upgrading.
- **Capability-by-value vs by-reference.** OZ helpers usually expect references (`&Cap`). Passing by value (`Cap`) consumes the cap; the compile error is clear but easy to miss in review.
- **Audit scope is per-module.** Just because OZ Sui exists does not mean every module is audited. Check the audit metadata in the repo.
- **Upgrade flow is Sui-native.** OZ's upgradeable helpers do not replace Sui's protocol-level upgrade; they layer policy on top.

## Where to go deeper

- OpenZeppelin Sui repo: `https://github.com/OpenZeppelin/openzeppelin-sui`
- OpenZeppelin Move framework documentation: `https://docs.openzeppelin.com/`
- Suiperpower skill: `skills/build/openzeppelin-sui-libs/`
- Related skill: `skills/build/review-move/` flags hand-rolled patterns OZ replaces.

Last updated: 2026-05-10.
