# EVM to Sui translation

Use the user's Solidity intuition to anchor each Sui concept, then mark the cliff where the analogy breaks.

## Storage model

- EVM: every contract has its own key-value storage. State is read and written through the contract that owns it.
- Sui: state lives in Objects, identified by an ObjectID. Objects have a typed Move struct, an owner, and a version.
- Where the analogy breaks: there is no contract-owned mapping in Sui. If your EVM design says "the contract holds a `mapping(address => Position)`", on Sui you typically give each user their own owned `Position` object.

## Accounts and ownership

- EVM: an address is either an EOA or a contract. State belongs to the contract.
- Sui: an address can own Objects directly. There is also Shared and Immutable ownership, set at object creation.
- Where the analogy breaks: EVM has no equivalent to a `Shared` object. The closest is "anyone can call this contract function", but in Sui the object itself is the gating point and the consensus path differs.

## Functions and calls

- EVM: a transaction calls one entry function. Internal calls happen inside that function.
- Sui: a transaction is a Programmable Transaction Block, a list of Move calls. Outputs of one call can be wired directly into the inputs of the next.
- Where the analogy breaks: PTBs are not multicall on top of solidity calls. The SDK composes them ergonomically and the runtime treats them as a single atomic unit with cross-call type checking.

## Roles and access control

- EVM: OpenZeppelin AccessControl with `bytes32` role identifiers, granted per address.
- Sui: a Capability is a Move object. Holding the object is the permission. Capabilities can be transferred, split, or destroyed.
- Where the analogy breaks: a Capability is not bound to one address. Whoever holds it has the right. Lose it, lose the right. This is more like a bearer token than a role grant.

## Events and logs

- EVM: emit an event, indexed by topic.
- Sui: emit a Move event with a typed struct. Indexers consume by event type.
- Where the analogy breaks: less, this one mostly maps cleanly.

## Upgrades

- EVM: proxy patterns (UUPS, transparent, beacon), or non-upgradeable.
- Sui: package upgrades via `UpgradeCap`, with policies that can be locked down per object.
- Where the analogy breaks: Sui upgrades are first-class in the runtime. There is no proxy. The `UpgradeCap` is the upgrade authority.

## Tokens

- EVM: ERC20 / ERC721 / ERC1155 are interfaces, every token is a separate contract.
- Sui: `Coin<T>` and `Object<T>` are generic types. A new coin is a new `Coin<MY_COIN>` with a `TreasuryCap<MY_COIN>` minting authority.
- Where the analogy breaks: there is no ERC20 interface to implement. The compiler-enforced types replace the interface contract.

## Gas

- EVM: gas in gwei, paid in ETH. Fee market with base fee + tip.
- Sui: gas in MIST (10^-9 SUI), paid in SUI. Reference gas price + computation + storage.
- Where the analogy breaks: Sui charges separately for storage. Some operations also receive a storage rebate when objects are deleted. Plan for this in your fee math.

## Common porting mistakes

- Translating a `mapping(address => X)` to a single shared object with an internal table. Often the right Sui shape is per-user owned objects with a single shared registry.
- Using a global authority address everywhere. The Sui pattern is to mint a Capability and pass it.
- Treating PTBs as an afterthought. They are the primary way the dapp composes calls, and good PTB design changes UX.
