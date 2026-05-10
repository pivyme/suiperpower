# Owned vs shared vs immutable

The default decision for every Sui Object. Get it wrong and you pay in throughput, security, or both.

## Decision rules

Use the table to find the matching pattern.

| Question | Answer |
|---|---|
| Is exactly one address the only writer? | Owned |
| Do multiple parties write concurrently? | Shared |
| Is it never written after creation? | Immutable (or shared-but-never-mutated) |
| Is it nested inside another Object? | No ownership of its own; ability `store` |

## Owned

Examples:

- A user's Profile Object.
- A user's individual Position in a lending protocol.
- A user's Kiosk.
- A NFT held by a user.

Properties:

- Mutations are sequenced at the wallet level. No consensus contention.
- Throughput is high. The owner can rapidly mutate without bumping into others.
- Transfers of an owned Object move ownership.

When to choose owned:

- The conceptual model is "this thing belongs to one person."
- You want fast, low-cost mutations.
- You do not need other parties to write to it.

## Shared

Examples:

- A DEX pool.
- A global registry.
- A Vault that anyone can deposit into.
- A Kiosk's listing record (the Kiosk itself is owned but listings are facts about pools).

Properties:

- Mutations are sequenced by consensus. Higher latency than owned.
- Anyone can call functions on it, subject to the function's gating logic.
- Useful when many writers must access the same state.

When to choose shared:

- The conceptual model is "global state."
- Multiple parties must write.
- You accept consensus latency in exchange for the contention model.

When NOT to choose shared:

- Per-user state. Use owned. (Common mistake: a registry that is really a per-user record.)
- High-throughput single-writer flows. Use owned.

## Immutable

Examples:

- A published package's binary.
- A content-addressed record where mutation would invalidate the meaning.
- A frozen NFT.

Properties:

- Never modifiable.
- Anyone can read.
- Cheap to read across many concurrent transactions.

When to choose immutable:

- The Object's whole purpose is to be a stable reference.
- Mutating it would break invariants on chain.

To freeze an Object: `transfer::freeze_object(obj)`. Once frozen, it can never be unfrozen.

## Examples worked through

### Lending protocol

- `Market` (per asset): shared. Many users deposit and borrow, must contend.
- `Obligation` (per user): owned. One user's positions across markets.
- `LiquidationBot`: holds the user's address; not an Object on chain. (Off-chain bot.)

### Marketplace

- `Listing` (a single offer): could be owned by the seller, but if the buyer must read and act on it, shared makes the lookup simpler.
- `Kiosk` (per seller): owned by the seller. Buying flows take the Kiosk by reference.
- `TransferPolicy<T>`: shared. The whole point is global enforcement.

### Game

- `Player` (per user): owned. Profile, inventory, stats.
- `Leaderboard`: shared. Many writers, one global record.
- `LootBox` (NFT): owned by the holder. Becomes shared if multi-party redeem.

### NFT collection

- `Collection` (the issuer's record): owned by the issuer (or transferred to a treasury). Used for minting authorization.
- `MintCap`: held by the issuer. Capability gates mints.
- `Asset` (each NFT): owned by the holder.
- `Display`: shared (the wallet rendering pulls from it).
- `TransferPolicy<Asset>`: shared.

## Anti-patterns

- **Per-user shared Object.** "I have a `UserState` shared with the user's id as a field" is almost always wrong. Make it owned by the user.
- **Owned global registry.** "I have a `GlobalRegistry` owned by the deployer" cannot be written by users; convert to shared.
- **Frozen things that should not be frozen.** Once you freeze, you cannot unfreeze. Reserve for genuinely permanent records.

## Migration path

If you discover later that an Object should have been the other ownership type:

- Owned to shared: there is no on-chain mutation that converts. You must publish a new package and migrate.
- Shared to owned: same; no in-place conversion.

Decide at design time. Migrating in production is painful and visible.

Last updated: 2026-05-10.
