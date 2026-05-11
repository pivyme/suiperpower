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

    public struct Allowlist has key {
        id: UID,
        allowed: table::Table<address, bool>,
    }

    // Admin creates the allowlist
    public fun create(ctx: &mut TxContext): Allowlist { /* ... */ }

    // Admin adds an address
    public fun add(list: &mut Allowlist, addr: address) { /* ... */ }

    // Seal policy check
    entry fun seal_approve_decrypt(
        id: vector<u8>,
        list: &Allowlist,
        ctx: &TxContext,
    ) {
        assert!(table::contains(&list.allowed, tx_context::sender(ctx)), ENotAllowed);
    }
}
```

Use when: a known set of addresses should have access, managed by an admin.

## 2. Subscription

Time-limited paid access. User pays a fee and receives a subscription object that expires after a TTL.

```move
module patterns::subscription {
    public struct Subscription has key {
        id: UID,
        owner: address,
        expires_at: u64, // epoch timestamp
    }

    // User buys a subscription
    public fun subscribe(
        payment: Coin<SUI>,
        ttl_ms: u64,
        ctx: &mut TxContext,
    ): Subscription { /* ... */ }

    // Seal policy check
    entry fun seal_approve_decrypt(
        id: vector<u8>,
        sub: &Subscription,
        clock: &Clock,
        ctx: &TxContext,
    ) {
        assert!(sub.owner == tx_context::sender(ctx), ENotOwner);
        assert!(clock::timestamp_ms(clock) < sub.expires_at, EExpired);
    }
}
```

Use when: access is paid and time-limited (premium content, SaaS-style gating).

## 3. Account-based

Encrypt to a specific address. Only that address can decrypt.

```move
module patterns::account_based {
    public struct SecretEnvelope has key {
        id: UID,
        recipient: address,
    }

    entry fun seal_approve_decrypt(
        id: vector<u8>,
        envelope: &SecretEnvelope,
        ctx: &TxContext,
    ) {
        assert!(envelope.recipient == tx_context::sender(ctx), ENotRecipient);
    }
}
```

Use when: point-to-point encrypted messages or private data shared with one address.

## 4. Private data

Creator-only access. The object creator is the only one who can decrypt.

```move
module patterns::private_data {
    public struct PrivateVault has key {
        id: UID,
        creator: address,
    }

    entry fun seal_approve_decrypt(
        id: vector<u8>,
        vault: &PrivateVault,
        ctx: &TxContext,
    ) {
        assert!(vault.creator == tx_context::sender(ctx), ENotCreator);
    }
}
```

Use when: a user encrypts their own private data and wants no one else to access it.

## 5. Time-lock encryption (TLE)

Anyone can decrypt after a specified timestamp. Before that, no one can.

```move
module patterns::tle {
    public struct TimeLock has key {
        id: UID,
        unlock_time: u64, // epoch timestamp in ms
    }

    entry fun seal_approve_decrypt(
        id: vector<u8>,
        lock: &TimeLock,
        clock: &Clock,
    ) {
        assert!(clock::timestamp_ms(clock) >= lock.unlock_time, ETooEarly);
    }
}
```

Use when: sealed-bid auctions, embargoed content, scheduled reveals. No identity check, only time.

## 6. Voting

Secret ballot with threshold decryption. Votes are encrypted, decrypted only after the vote closes.

```move
module patterns::voting {
    public struct Ballot has key {
        id: UID,
        closes_at: u64,
        threshold: u64,
    }

    entry fun seal_approve_tally(
        id: vector<u8>,
        ballot: &Ballot,
        clock: &Clock,
    ) {
        assert!(clock::timestamp_ms(clock) >= ballot.closes_at, EVoteOpen);
    }
}
```

Use when: secret ballots, sealed-bid auctions where results are revealed after a deadline.

## 7. Key request (delegated access)

A witness pattern where a third party grants access. Useful for delegation, admin-approved decryption, or multi-party workflows.

```move
module patterns::key_request {
    public struct AccessGrant has key {
        id: UID,
        grantee: address,
        resource_id: ID,
    }

    entry fun seal_approve_decrypt(
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
entry fun seal_approve_decrypt(
    id: vector<u8>,
    list: &Allowlist,
    clock: &Clock,
    ctx: &TxContext,
) {
    assert!(table::contains(&list.allowed, tx_context::sender(ctx)), ENotAllowed);
    assert!(clock::timestamp_ms(clock) < list.expires_at, EExpired);
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

Last updated: 2026-05-11.
