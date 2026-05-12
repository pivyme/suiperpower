# Seal Move access patterns

Seven reference patterns from the Seal repo (`move/patterns/sources/`). Each implements one or more `seal_approve` entry functions.

Source: https://github.com/MystenLabs/seal/tree/main/move/patterns/sources

## The seal_approve convention

Every policy function that Seal key servers call must follow these rules:

1. Function name MUST start with `seal_approve`
2. First parameter MUST be `id: vector<u8>`
3. Function MUST NOT modify state (it runs via `dry_run`, not executed on chain)
4. Abort = access denied. Normal return = access granted.

The key servers build a PTB that calls your `seal_approve` function. If the dry-run succeeds (no abort), the server releases its key share.

## 1. Whitelist

Admin-managed address allowlist. Admin adds or removes addresses. Only listed addresses can decrypt.

```move
module patterns::whitelist {
    use sui::table;

    public struct Cap has key { id: UID }

    public struct Whitelist has key {
        id: UID,
        allowed: table::Table<address, bool>,
    }

    // Admin creates the whitelist (returns Cap + Whitelist)
    public fun create_whitelist(ctx: &mut TxContext): (Cap, Whitelist) { /* ... */ }

    // Admin adds an address
    public fun add(wl: &mut Whitelist, cap: &Cap, account: address) { /* ... */ }

    // Seal policy check
    entry fun seal_approve(
        id: vector<u8>,
        wl: &Whitelist,
        ctx: &TxContext,
    ) {
        assert!(table::contains(&wl.allowed, tx_context::sender(ctx)), ENotAllowed);
    }
}
```

Use when: a known set of addresses should have access, managed by an admin.

## 2. Subscription

Time-limited paid access. User pays a fee and receives a subscription object that expires after a TTL.

```move
module patterns::subscription {
    public struct Service has key {
        id: UID,
        fee: u64,
        ttl: u64, // subscription duration in ms
    }

    public struct Subscription has key {
        id: UID,
        // tracks owner and expiry
    }

    // Admin creates the service
    public fun create_service(fee: u64, ttl: u64, ctx: &mut TxContext): Service { /* ... */ }

    // User buys a subscription
    public fun subscribe(
        fee: Coin<SUI>,
        service: &Service,
        c: &Clock,
        ctx: &mut TxContext,
    ): Subscription { /* ... */ }

    // Seal policy check (validates subscription is active)
    entry fun seal_approve(
        id: vector<u8>,
        pkg_version: &PackageVersion,
        sub: &Subscription,
        service: &Service,
        c: &Clock,
    ) {
        // verifies subscription matches service and has not expired
    }
}
```

Use when: access is paid and time-limited (premium content, SaaS-style gating).

## 3. Account-based

Encrypt to a specific address. Only that address can decrypt.

```move
module patterns::account_based {
    // No on-chain object needed. The caller's address IS the access check.
    entry fun seal_approve(
        id: vector<u8>,
        ctx: &TxContext,
    ) {
        // verifies the caller matches the account owner encoded in id
    }
}
```

Use when: point-to-point encrypted messages or private data targeted to a specific address. The identity is encoded directly in the encryption `id`, so no on-chain access list is needed.

## 4. Private data

Creator-only access. The object creator is the only one who can decrypt.

```move
module patterns::private_data {
    public struct PrivateData has key {
        id: UID,
        // stores creator address and nonce
    }

    // Store private data (creates a PrivateData object)
    public fun store(nonce: vector<u8>, data: vector<u8>, ctx: &mut TxContext): PrivateData { /* ... */ }

    // Seal policy check (only the creator can decrypt)
    entry fun seal_approve(
        id: vector<u8>,
        e: &PrivateData,
    ) {
        // verifies id matches creator + nonce
    }
}
```

Use when: a user encrypts their own private data and wants no one else to access it.

## 5. Time-lock encryption (TLE)

Anyone can decrypt after a specified timestamp. Before that, no one can.

```move
module patterns::tle {
    // No on-chain object needed. The unlock time is encoded in the id.
    entry fun seal_approve(
        id: vector<u8>,
        c: &clock::Clock,
    ) {
        // verifies current timestamp >= unlock time encoded in id
    }
}
```

Use when: sealed-bid auctions, embargoed content, scheduled reveals. No identity check, only time. The unlock timestamp is encoded directly in the encryption `id`.

## 6. Voting

Secret ballot with threshold decryption. Votes are encrypted, decrypted only after the vote closes.

```move
module patterns::voting {
    public struct Vote has key {
        id: UID,
        // tracks voters, options, encrypted votes, and key server config
    }

    // Create a vote with eligible voter list
    public fun create_vote(
        voters: vector<address>,
        options: u8,
        key_servers: vector<address>,
        public_keys: vector<vector<u8>>,
        threshold: u8,
        ctx: &mut TxContext,
    ): Vote { /* ... */ }

    // Cast an encrypted vote
    public fun cast_vote(vote: &mut Vote, encrypted_vote: vector<u8>, ctx: &mut TxContext) { /* ... */ }

    // Seal policy check (all voters must have cast before decryption)
    entry fun seal_approve(
        id: vector<u8>,
        vote: &Vote,
    ) {
        // verifies all voters have submitted their encrypted votes
    }

    // Finalize and tally after decryption
    public fun finalize_vote(
        vote: &mut Vote,
        derived_keys: &vector<vector<u8>>,
        key_servers: &vector<address>,
    ): VoteResult { /* ... */ }
}
```

Use when: secret ballots, sealed-bid auctions where results are revealed after all votes are cast.

## 7. Key request (delegated access)

A witness pattern where a third party grants access. Useful for delegation, admin-approved decryption, or multi-party workflows.

```move
module patterns::key_request {
    public struct AccessGrant has key {
        id: UID,
        grantee: address,
        resource_id: ID,
    }

    entry fun seal_approve(
        id: vector<u8>,
        grant: &AccessGrant,
        ctx: &TxContext,
    ) {
        assert!(grant.grantee == tx_context::sender(ctx), ENotGrantee);
    }
}
```

Use when: an authority issues access grants to specific users for specific resources.

## Composing patterns

Patterns can be combined in a single module. For example, an allowlist that expires:

```move
entry fun seal_approve(
    id: vector<u8>,
    wl: &Whitelist,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(table::contains(&wl.allowed, tx_context::sender(ctx)), ENotAllowed);
    assert!(clock::timestamp_ms(clock) < wl.expires_at, EExpired);
}
```

The `seal_approve` convention is flexible. Any logic that aborts on denial and returns on approval works.

## Quick reference

| Pattern | Auth check | Time check | Payment | Best for |
|---|---|---|---|---|
| whitelist | address in table | no | no | Admin-managed access lists |
| subscription | owner match | expiry | yes | Paid, time-limited content |
| account_based | recipient match | no | no | Point-to-point encryption |
| private_data | creator match | no | no | Self-encrypted vaults |
| tle | none | unlock time | no | Scheduled reveals, auctions |
| voting | none | close time | no | Secret ballots |
| key_request | grantee match | no | no | Delegated or third-party access |

Last updated: 2026-05-12.
