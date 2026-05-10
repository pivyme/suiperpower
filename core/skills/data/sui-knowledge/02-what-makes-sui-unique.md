# 02. What makes Sui unique

> Audience: a dev who has shipped on EVM or Solana and is deciding whether Sui's primitives buy them anything. Intuition first, then code.

## The Object model in 5 minutes

On EVM, the chain is a key-value store. Each contract has a storage map; user balances are values inside that map. Ownership is implicit; you "own" a token because the ERC-20 contract says so.

On Solana, state lives in accounts. Each account has an owner (a program), and programs read and write account data. Ownership is also indirect; the SPL Token program holds your balance in a token account it owns, and you control that account through derived authority.

On Sui, state is a graph of Objects. Every Object has:

- A unique 32-byte ID
- A typed body (some Move struct)
- An owner field, which is one of:
  - An address (you)
  - Another Object (parent-child)
  - Shared (mutated by anyone, subject to access rules in the contract)
  - Immutable (read-only, can never be mutated again)
- A version number that increments on every mutation

When you "have" a Sui token, the chain literally says "this Object's owner is your address." There is no contract-level mapping. The Object exists in your slot in the global Object store. Move's resource semantics make Objects unforgeable and undroppable. You cannot accidentally write a function that duplicates an Object; the compiler refuses.

The mental shift from EVM:

- A Solidity ERC-721 NFT is a row in a contract's storage table. Its "owner" is whatever the contract's `_owners` mapping says.
- A Sui NFT is a Move Object whose `owner` is your address. The chain holds it in your slot. Transfer is the chain rewriting the owner field, not the contract updating a mapping.

The mental shift from Solana:

- A Solana SPL token account is owned by the SPL Token program; your authority over it is a separate field.
- A Sui Object is owned by your address directly. Transfer is one PTB call, not a CPI invocation.

## Owned vs shared Objects

This is the most common new-developer mistake on Sui.

- **Owned Objects** can only be used in transactions signed by their owner. The scheduler treats them as serial per-owner. No consensus is needed for a transaction that touches only owned Objects of one signer; it is "fast path" and finalizes in milliseconds.
- **Shared Objects** can be used by anyone, but every transaction that touches a shared Object goes through consensus. Latency is higher. Concurrent transactions on the same shared Object are ordered by the consensus protocol.

Default to owned. Use shared only when multiple users genuinely need to mutate the same on-chain state in arbitrary order (orderbooks, AMM pools, DAO governance). A common anti-pattern is to make an admin Object shared "just in case"; this gives up the fast-path latency win and adds consensus cost for nothing.

When to use which:

| Pattern | Owner type |
|---|---|
| User-owned NFT, coin balance, character | Owned |
| Liquidity pool, orderbook | Shared |
| Treasury cap held by deployer | Owned (deployer's address, often a multisig) |
| Game leaderboard | Shared |
| Per-user game state | Owned (the player) |
| Marketplace listing | Shared (so any buyer can purchase) |
| Marketplace kiosk (the user's storefront) | Owned |

## Capabilities, why they matter

A capability is a Move struct that is hard to obtain and grants permission to do something. The classic example is `TreasuryCap<T>`: whoever holds it can mint coins of type `T`. Move's resource semantics mean the capability cannot be duplicated and cannot be silently created; it is minted once at module init or by a controlled function.

Capabilities replace Solidity's `onlyOwner` modifier and Solana's signer checks. They are stronger because:

- The capability's existence is the permission. A function that takes `&mut TreasuryCap<T>` cannot be called without one.
- Capabilities are themselves Objects. They can be transferred, frozen, or destroyed.
- Multi-party permissions are natural: hold a capability in a multisig.

When you design a Sui contract, ask "what is the capability for this action?" before "who can call this?"

## Programmable Transaction Blocks (PTBs)

A PTB is a single transaction that strings together multiple Move calls and primitive operations (split coin, merge coin, transfer, publish), with the output of one call feeding the input of the next. The user signs the entire block.

PTBs replace EVM's "approve then call" two-step flow with a single atomic block. They also enable:

- Atomic multi-step composition without writing a router contract
- Sponsored transactions (the gas payer is different from the signer; the PTB enforces both)
- Bulk operations (mint 100 NFTs in one tx)

The TS SDK exposes PTB construction directly. dApps build PTBs client-side and submit them; the chain executes them atomically.

Footgun: if a PTB call mid-block aborts, the entire PTB rolls back. Design PTBs assuming they are atomic, never partial.

## Parallel execution, what it actually unlocks

Sui's scheduler reads each transaction's Object access set up front, then schedules transactions whose access sets do not overlap to run in parallel across CPU cores.

What this unlocks in practice:

- **Independent users do not block each other.** Two users transferring two different NFTs do not wait for each other. On EVM, both transactions fight for block inclusion and serialize at the gas-pricing layer.
- **Hot shared Objects are still bottlenecks.** A high-traffic AMM pool serializes through consensus. Sui does not magically parallelize a single shared Object.

Design implication: split state. If you have a "global counter," ask whether it could be N per-user counters. If yes, parallel execution serves you.

## Sponsored transactions

The signer of a transaction and the gas payer can be different addresses. The user signs the transaction body; the sponsor co-signs to pay the gas.

UX impact:

- New user signs up, takes their first action, never sees a gas dialog. The app's sponsor address pays the few-cent gas fee.
- Power users can opt into self-paid gas later, or never.

Sui's sponsored-tx flow is built into the protocol. No relayer contract needed. The TS SDK supports it directly.

Footgun: the sponsor must trust the transaction body (the user could be doing something the sponsor does not want to subsidize). Apps typically run a server-side sponsor that inspects the tx before co-signing.

## zkLogin, the social login wedge

zkLogin lets a user prove they are the holder of an OIDC credential (Google, Apple, Twitch, Facebook) without revealing the credential, and use a deterministic Sui address derived from the credential as their on-chain identity.

UX impact:

- Sign in with Google, get a Sui wallet, no seed phrase ever exposed.
- The address is tied to the OIDC subject; if the user logs in again with the same Google account on a new device, they get the same address.
- The cryptographic proof is verified in Move at the protocol level; zkLogin is not a contract-level concept users have to integrate piecewise.

Footgun: the user is dependent on the OIDC provider. If their Google account is closed, the wallet is recoverable through a salt mechanism but only if they kept the salt, which most users will lose. Production zkLogin apps usually pair with Enoki or a similar service that handles salt management.

## Move (Sui flavor)

Sui Move is descended from Diem Move but has diverged. Notable differences:

- **No `acquires` keyword** (unlike Aptos Move). Object access is explicit through arguments.
- **Objects are first-class.** Sui Move has built-in Object types and standard library functions for transfer and ownership.
- **Witness pattern is idiomatic.** One-time witnesses (OTW) are the standard way to ensure a token type is unique to a single module.
- **Public visibility is conservative.** Move 2024 introduced `public(package)` as the preferred default; pure `public` is for cross-package APIs.

If you are coming from Aptos, the syntax is familiar but the standard library and idioms are different. If you are coming from Solidity or Rust, expect 1-2 weeks to feel productive.

## Kiosk standard

Kiosk is a Sui-native marketplace primitive. Each Kiosk is an Object owned by a user. They list NFTs in their Kiosk; another user buys via a PTB that handles royalty, transfer, and policy enforcement atomically.

Why this matters:

- No marketplace contract is needed. Two users with Kiosks can transact peer-to-peer.
- Royalties are enforced at the protocol level via Transfer Policies. Marketplace bypasses are explicit on-chain, not silent.
- Marketplace UIs become aggregators of Kiosks rather than custodians of inventory.

If you are building any NFT product on Sui, default to Kiosk. Hand-rolling escrow is rarely worth it.

## Summary

Sui's primitives compose:

- Object model gives you typed, owned state.
- PTBs give you atomic multi-step transactions.
- Sponsored tx + zkLogin give you a one-tap onboarding experience.
- Move gives you compile-time safety on the value flow.
- Kiosk, DeepBook, Walrus give you off-the-shelf substrates for marketplace, exchange, and storage products.

If your product naturally maps to these primitives, Sui is a strong pick. If your product is a clone of an EVM DeFi protocol with no Sui-specific design, Sui will feel like resistance.

Last updated: 2026-05-10. Targeting Sui mainnet stable.
