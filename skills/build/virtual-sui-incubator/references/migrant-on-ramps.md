# Migrant on-ramps: EVM and Solana to Sui

For users coming from EVM or Solana, contrasts speed up the mental-model transfer.

## EVM (Solidity / Vyper) to Sui

### Storage model

- EVM: a contract is an account. State is a mapping `slot -> bytes`. Reads and writes go through `SLOAD`/`SSTORE`.
- Sui: state is Objects. Each Object has its own id, version, and ownership. There is no single "contract storage."

Implication: where Solidity stores `mapping(address => uint256) balances`, Sui usually uses per-user owned Objects. There is no single global mapping; the Sui idiom is "give each user their own Object."

### msg.sender

- EVM: `msg.sender` is the immediate caller. Reentrancy is a constant concern.
- Sui: the analogous concept is `tx_context::sender(ctx)`, which is the transaction signer. Move's resource semantics make EVM-style reentrancy structurally impossible (you cannot call back into a function that holds a reference you took).

Implication: most EVM defensive patterns (reentrancy guards, checks-effects-interactions) are irrelevant on Sui. Capability-based access control replaces them.

### Upgrades

- EVM: typically proxy pattern (UUPS, Transparent). Storage layout is fragile across upgrades.
- Sui: native upgrade via `UpgradeCap`. New code, same logical package, but the runtime id changes.

Implication: do not port the proxy pattern. Use Sui's native upgrade with the OZ upgradeable policy if you need governance.

### Tokens

- EVM: ERC-20 contract, balances mapping.
- Sui: `coin::Coin<T>` is a typed, owned Object. Balances are not in a mapping; they are owned Objects in user wallets.

Implication: a "transfer" on Sui is a transfer of an Object, not a balance update. Wallets aggregate Coin Objects of the same type for display.

## Solana (Anchor / native) to Sui

### Account model

- Solana: every piece of state is an Account, owned by a program. Accounts are passed to instructions explicitly.
- Sui: Objects are first-class. They have ids, owners, and versions. The runtime tracks ownership; no PDA pattern is needed.

Implication: where Anchor uses PDAs (program-derived addresses), Sui uses owned Objects with capabilities. Simpler conceptually for most cases.

### Programs vs packages

- Solana: a Program is a deployed BPF binary. State is in separate Accounts.
- Sui: a Package is a deployed Move bytecode. State is in Objects (some owned by users, some shared).

The mental shift: think "Object lifecycle" instead of "Account state."

### Transactions

- Solana: an instruction is a single program call with explicit accounts. A transaction is a list of instructions.
- Sui: a Programmable Transaction Block is a graph of move calls + transfers + splits. Result handles flow between calls.

Implication: PTBs are strictly more expressive than Solana transactions. You can build atomic multi-protocol flows in one tx without wrapper contracts.

### Compute units vs gas

- Solana: tx has a compute-unit limit; programs charge units.
- Sui: gas split into computation + storage, with storage rebate on delete.

Implication: storage hygiene matters more on Sui. Deleting Objects when no longer needed is cheaper than EVM.

### Token model

- Solana: SPL Token program; balances in Token Accounts.
- Sui: `Coin<T>` typed Objects.

The Sui model is closer to UTXO than to mapping. Wallets aggregate; transfers move whole Coins (or splits).

## Common gotchas for migrants

- "Where do I put the global counter?" In a shared Object, not in a function-local variable or per-program account.
- "How do I check who called?" Use capability possession (`&AdminCap`) or `tx_context::sender(ctx)`.
- "How do I store user balances?" Per-user owned Object with a `Balance<T>` field.
- "How do I emit a log?" `event::emit(MyEvent { ... })` from a Move function.
- "What replaces my reentrancy guard?" Move's borrow checker. You usually do not need a guard.

## Reading order for a fast on-ramp

1. `skills/data/sui-knowledge/03-move-and-objects.md`: 30 minutes.
2. `skills/data/sui-knowledge/02-what-makes-sui-unique.md`: 15 minutes.
3. Skim the Sui Move book chapters on objects and capabilities: 60 minutes.
4. Build a `Counter` shared Object end to end: 30 minutes.
5. Build a per-user `Profile` owned Object: 30 minutes.

3 hours and the migrant has the model.

Last updated: 2026-05-10.
