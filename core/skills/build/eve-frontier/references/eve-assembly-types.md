# EVE Frontier Smart Assembly types

Three assembly types, each with a different extension pattern. Your Move module defines an Auth witness struct, registers it with the assembly, then implements the expected function. The game world resolves your extension package at runtime and calls your function.

Source: https://github.com/evefrontier/world-contracts (contracts/world/sources/assemblies/), https://docs.evefrontier.com/

## Common pattern: typed witness authorization

All assembly types use the same auth pattern. Your extension module defines a witness struct, then registers it with the assembly via `authorize_extension`.

```move
/// Your extension module
module my_extension::my_turret;

use world::turret::{Self, Turret};
use world::access::OwnerCap;

/// Witness struct. Must have `drop` ability, no fields needed.
public struct MyAuth has drop {}

/// Owner calls this once to register your extension with their assembly.
public fun register(turret: &mut Turret, owner_cap: &OwnerCap<Turret>) {
    turret::authorize_extension<MyAuth>(turret, owner_cap);
}
```

A single assembly has one extension slot. Registering a new extension replaces the previous one. The owner can also freeze or revoke the extension config.

## 1. Turret

**Module**: `world::turret`  
**Struct**: `Turret` (not "SmartTurret")

**Purpose**: Custom targeting logic. The game calls your function when entities enter range or change behavior (start/stop attacking). You return a priority-ordered list of targets.

**Extension function your module must implement**:

```move
public fun get_target_priority_list(
    turret: &Turret,
    _owner_character: &Character,
    target_candidate_list: vector<u8>,
    receipt: OnlineReceipt,
): vector<u8>
```

**Key details**:
- `OnlineReceipt` is a hot potato (no `drop` ability). You must consume it before returning by calling `turret::destroy_online_receipt<MyAuth>(receipt, MyAuth {})`.
- Input `target_candidate_list` is BCS-encoded. Decode with `turret::unpack_candidate_list()` to get `vector<TargetCandidate>`.
- Return value is BCS-encoded. Serialize with `bcs::to_bytes()` on a `vector<ReturnTargetPriorityList>`.

**TargetCandidate fields** (read-only, provided by the game):

| Field | Type | Meaning |
|---|---|---|
| item_id | u64 | Target entity ID |
| type_id | u64 | Entity type |
| group_id | u64 | Entity group |
| character_id | u32 | Owning character |
| character_tribe | u32 | Character's tribe |
| hp_ratio | u64 | Health percentage |
| shield_ratio | u64 | Shield percentage |
| armor_ratio | u64 | Armor percentage |
| is_aggressor | bool | Currently attacking |
| priority_weight | u64 | Base priority |
| behaviour_change | BehaviourChangeReason | ENTERED, STARTED_ATTACK, STOPPED_ATTACK, UNSPECIFIED |

**ReturnTargetPriorityList** (what you return):

```move
public struct ReturnTargetPriorityList has copy, drop, store {
    target_item_id: u64,
    priority_weight: u64,
}
```

Build with `turret::new_return_target_priority_list(item_id, weight)`.

**Minimal working example** (from world-contracts extension_examples/turret.move):

```move
public fun get_target_priority_list(
    turret: &Turret,
    _: &Character,
    target_candidate_list: vector<u8>,
    receipt: OnlineReceipt,
): vector<u8> {
    assert!(receipt.turret_id() == turret::id(turret), EInvalidOnlineReceipt);
    let candidates = turret::unpack_candidate_list(target_candidate_list);
    let mut result = vector::empty<turret::ReturnTargetPriorityList>();
    // ... filter/sort candidates, push to result ...
    turret::destroy_online_receipt<TurretAuth>(receipt, TurretAuth {});
    bcs::to_bytes(&result)
}
```

## 2. Gate

**Module**: `world::gate`  
**Struct**: `Gate` (not "SmartGate")

**Purpose**: Access control for travel between locations. Instead of a hook that returns bool, gates use a permit model. Your extension issues a `JumpPermit` to authorized characters. Without a permit, the character cannot jump.

**How it works**:
1. By default (no extension), gates allow anyone to jump freely.
2. When an extension is registered, jumping requires a valid `JumpPermit`.
3. Your extension module calls `gate::issue_jump_permit` or `gate::issue_jump_permit_with_id` to grant access.
4. The player then calls `gate::jump_with_permit` with the permit to travel.

**Extension function for issuing permits**:

```move
public fun issue_jump_permit<Auth: drop>(
    source_gate: &Gate,
    destination_gate: &Gate,
    character: &Character,
    auth: Auth,                        // your witness instance
    expires_at_timestamp_ms: u64,
    ctx: &mut TxContext,
)
```

**JumpPermit struct** (created by the world module, not by you):

```move
public struct JumpPermit has key, store {
    id: UID,
    character_id: ID,
    route_hash: vector<u8>,           // direction-agnostic hash of gate pair
    expires_at_timestamp_ms: u64,
}
```

Permits are bidirectional (A to B or B to A). Delete unused permits with `gate::delete_jump_permit(permit)` or `gate::delete_jump_permit_with_auth<Auth>(gate, permit, auth)`.

**Example: tribe-based gate** (from world-contracts extension_examples/tribe_permit.move):

```move
public fun issue_jump_permit(
    extension_config: &ExtensionConfig,
    source_gate: &Gate,
    destination_gate: &Gate,
    character: &Character,
    _: &AdminCap,
    clock: &Clock,
    ctx: &mut TxContext,
): ID {
    let tribe = config::borrow_rule<TribeConfigKey, TribeConfig>(extension_config, TribeConfigKey {});
    assert!(character.tribe() == tribe.tribe, ENotStarterTribe);
    gate::issue_jump_permit_with_id(
        source_gate, destination_gate, character,
        config::x_auth(), clock.timestamp_ms() + 60_000, ctx,
    )
}
```

## 3. Storage Unit

**Module**: `world::storage_unit`  
**Struct**: `StorageUnit` (not "SmartStorageUnit")

**Purpose**: Programmable on-chain storage with inventory management. Extensions control deposit/withdraw logic for vending machines, trading posts, or item exchanges.

**There is no `on_interact` hook.** Instead, your extension calls the world module's inventory functions with your Auth witness:

```move
// Deposit an item into the storage unit (player's inventory slot)
public fun deposit_item<Auth: drop>(
    storage_unit: &mut StorageUnit,
    character: &Character,
    item: Item,
    _: Auth,
    _: &mut TxContext,
)

// Withdraw an item from the storage unit
public fun withdraw_item<Auth: drop>(
    storage_unit: &mut StorageUnit,
    character: &Character,
    _: Auth,
    type_id: u64,
    quantity: u32,
    ctx: &mut TxContext,
): Item
```

Additional inventory functions:
- `deposit_to_open_inventory<Auth>` / `withdraw_from_open_inventory<Auth>`: shared open storage slot
- `deposit_to_owned<Auth>`: deposit to character's personal slot
- `deposit_by_owner<T>` / `withdraw_by_owner<T>`: owner operations using OwnerCap

**Design pattern**: your extension module wraps these calls with your business logic (price checks, allowlists, exchange rates) and passes your Auth witness to authorize the operation.

## Builder scaffold directory structure

```
builder-scaffold/
  move-contracts/           # NOT "move/"
    smart_gate_extension/
      sources/              # config.move, tribe_permit.move, corpse_gate_bounty.move
      tests/
      Move.toml
    storage_unit_extension/
      sources/
      tests/
      Move.toml
  ts-scripts/               # NOT "scripts/"
    helpers/                # query utilities (OwnerCap lookups)
    smart_gate_extension/   # example interaction scripts
    utils/                  # helper.ts, derive-object-id.ts, proof.ts
  docker/                   # dev container (Sui CLI + Node.js)
  dapps/                    # reference dApp template
  setup-world/              # world deployment config
  zklogin/                  # OAuth signing CLI
```

Clone: `git clone https://github.com/evefrontier/builder-scaffold`

## Shared types and modules

| Type | Module | Notes |
|---|---|---|
| `Turret` | `world::turret` | Assembly struct |
| `Gate` | `world::gate` | Assembly struct |
| `StorageUnit` | `world::storage_unit` | Assembly struct |
| `Character` | `world::character` | Player identity, holds OwnerCaps |
| `OwnerCap<T>` | `world::access` | Generic ownership capability |
| `OnlineReceipt` | `world::turret` | Hot potato, no drop |
| `JumpPermit` | `world::gate` | Travel authorization |
| `Item` | `world::inventory` | In-game item with item_id, type_id |
| `NetworkNode` | `world::network_node` | Power source for assemblies |
| `ExtensionConfig` | Extension's config module | Dynamic field store for extension rules |
| `AdminCap` | Extension's config module | Admin authority for config changes |
