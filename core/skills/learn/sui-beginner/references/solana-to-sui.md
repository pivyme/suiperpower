# Solana to Sui translation

Use the user's Anchor / Solana intuition to anchor each Sui concept, then mark the cliff where the analogy breaks.

## Account model

- Solana: every piece of state is an account. Accounts are owned by a program. PDAs are derived from seeds.
- Sui: state is an Object, identified by an ObjectID. Objects have a typed Move struct, an owner, and a version. There are no PDAs.
- Where the analogy breaks: address derivation is not a thing on Sui. You do not pre-compute Object IDs from seeds. Objects are created in transactions and their IDs are returned.

## Programs and modules

- Solana: a program is deployed code, indexed by program ID, that owns accounts.
- Sui: a Move package is a set of modules deployed under a package ID. Modules define Object types and entry functions.
- Where the analogy breaks: ownership goes the other way. On Solana, the program owns the account. On Sui, the module defines the type, but the address that holds the Object is its owner.

## Instructions and transactions

- Solana: a transaction is a list of instructions. Each instruction calls a program with a list of accounts.
- Sui: a transaction is a Programmable Transaction Block, a list of Move calls. Outputs flow into the next call.
- Where the analogy breaks: in Solana, you pre-list every account the instruction will read or write. In Sui, the PTB references Objects by ID and the runtime resolves the rest. The composition feels more like piping function outputs.

## Type safety

- Solana with Anchor: you describe accounts in Rust structs, and Anchor enforces layout at runtime.
- Sui Move: types are enforced by the Move VM and the compiler. Abilities (`key`, `store`, `copy`, `drop`) tighten guarantees further.
- Where the analogy breaks: Move enforces resource safety natively. There is no equivalent to "drop a resource by mistake" passing the compile.

## Authority and signers

- Solana: an instruction marks accounts as signer / writable. The signer authority is the public key on the keypair.
- Sui: ownership is in the Object metadata. A Capability is a Move object granting a permission. Holding it is the permission.
- Where the analogy breaks: capabilities are bearer-style by default. They can be transferred, split, frozen, or destroyed. This is more granular than a single signer authority.

## Tokens

- Solana: SPL tokens, mint accounts, token accounts per holder.
- Sui: `Coin<T>` is a generic Move type. A new coin is a new type with a `TreasuryCap<MY_COIN>` minting authority. Each holder holds `Coin<T>` Objects directly.
- Where the analogy breaks: there is no ATA (associated token account). Holders simply own `Coin<T>` Objects. You can also split and merge coins atomically inside a PTB.

## Compute budget vs gas

- Solana: compute units, fixed budget per transaction.
- Sui: gas in MIST, with separate computation and storage components. Storage rebates on deletion.
- Where the analogy breaks: storage is metered. If your design creates a lot of small persistent state, plan for the storage cost.

## Cross-program invocation vs PTB

- Solana: CPI lets one program call another, with passed accounts.
- Sui: a PTB lets you call multiple Move modules in one transaction, wiring outputs to inputs.
- Where the analogy breaks: PTBs are at the transaction level, not the module level. A module does not need to "know" it is being composed; the SDK handles the wiring.

## Upgrades

- Solana: program upgrade authority, deployed via upgrade buffer.
- Sui: package upgrades via `UpgradeCap` with configurable policy.
- Where the analogy breaks: Sui upgrades are versioned packages, not in-place patching of the program code. You publish a new version and clients reference the new package ID.

## Common porting mistakes

- Looking for PDAs and getting confused when there are none. Sui resolves this with explicit Object references.
- Building a single big shared Object as a table mapping users to data. The Sui pattern is often per-user owned Objects plus a shared registry.
- Treating PTBs as multi-instruction transactions only. The flow-based composition (output → input) changes how dapps are built.
- Underestimating storage costs at scale. Anchor accounts are also rent-bearing, but Sui's storage cost shape is different and worth modeling.
