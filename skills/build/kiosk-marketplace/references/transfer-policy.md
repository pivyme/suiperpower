# TransferPolicy on Sui

A TransferPolicy is the asset type's contract for what must happen on every sale. Royalties, lock-ups, allowlists, and custom rules attach to the policy. Without a TransferPolicy, the Kiosk cannot complete a purchase for that asset type.

## Create a policy

The publisher of the asset's Move package creates the policy:

```move
module my_collection::policy_setup;

use sui::package;
use sui::transfer_policy;
use my_collection::my_collection::MyAsset;

public fun init_policy(
    publisher: &package::Publisher,
    ctx: &mut TxContext,
) {
    let (policy, cap) = transfer_policy::new<MyAsset>(publisher, ctx);
    transfer_policy::share(policy);
    transfer::public_transfer(cap, ctx.sender());
}
```

The `Publisher` Object proves the caller can administer the asset type. The TransferPolicy is shared (so the marketplace flow can read it). The TransferPolicyCap goes to the publisher.

## Add a royalty rule

```move
use sui::transfer_policy;
use sui::royalty_rule;

public fun add_royalty(
    policy: &mut transfer_policy::TransferPolicy<MyAsset>,
    cap: &transfer_policy::TransferPolicyCap<MyAsset>,
    royalty_bp: u16, // basis points, e.g. 250 = 2.5%
    min_amount: u64, // minimum royalty per sale
) {
    royalty_rule::add(policy, cap, royalty_bp, min_amount);
}
```

Every purchase that completes against this policy automatically pays the royalty to the publisher's address (or wherever the rule routes it).

## Add a lock rule

```move
use sui::kiosk_lock_rule;

public fun add_lock(
    policy: &mut transfer_policy::TransferPolicy<MyAsset>,
    cap: &transfer_policy::TransferPolicyCap<MyAsset>,
) {
    kiosk_lock_rule::add(policy, cap);
}
```

The lock rule forces the buyer to place the asset in their own Kiosk. The asset cannot leave Kiosks except through another sale that satisfies the policy. This is the canonical mechanism for enforced royalties on Sui.

Without the lock rule, a buyer could pull the asset into their wallet and transfer freely (bypassing future royalties).

## Custom rules

You can write your own rule modules. A rule defines:

- A `Rule` witness type.
- A `Config` Object holding rule parameters.
- An `add` function that registers the rule on a policy.
- A `prove` function that the buyer calls during purchase to satisfy the rule.

Example shapes: allowlist (only certain addresses can buy), oracle-priced floor (refuse below floor), KYC-gated (require KYC token).

## Allowlist rule sketch

```move
module my_collection::allowlist_rule;

use sui::transfer_policy::{Self, TransferPolicy, TransferPolicyCap, TransferRequest};

public struct Rule has drop {}

public struct Config has store, drop {
    allowed: vector<address>,
}

public fun add(
    policy: &mut TransferPolicy<MyAsset>,
    cap: &TransferPolicyCap<MyAsset>,
    allowed: vector<address>,
) {
    transfer_policy::add_rule(Rule {}, policy, cap, Config { allowed });
}

public fun prove(
    request: &mut TransferRequest<MyAsset>,
    policy: &TransferPolicy<MyAsset>,
    buyer: address,
) {
    let cfg: &Config = transfer_policy::get_rule(Rule {}, policy);
    assert!(vector::contains(&cfg.allowed, &buyer), 0);
    transfer_policy::add_receipt(Rule {}, request);
}
```

The buyer's purchase PTB must call `prove` for every rule before `confirm_request` lands. Skip a rule, the purchase reverts.

## Enforcement is in the policy, not the Kiosk

The Kiosk does not enforce royalties on its own. The TransferPolicy does. A Kiosk holding asset X looks at X's TransferPolicy on every sale and refuses to complete unless every rule is satisfied.

If you author a new asset type and forget to create a policy, no one can buy it from a Kiosk; purchases revert with a "no policy" error.

## Multiple policies for the same asset

Only one canonical TransferPolicy per asset type, by convention. Multiple is technically possible (different policies with different rule sets) but produces ambiguity for marketplaces. Stick to one canonical policy unless you have a clear reason.

Last updated: 2026-05-10.
