# Walrus unit economics

Walrus is paid for in WAL, with the cost a function of blob size and storage epoch (how long it is durably stored). Any Walrus-based product must have unit economics that survive the WAL/USD price curve and the storage duration the use case implies.

## What to confirm at runtime

Confirm these against current Walrus docs (`skills/data/sui-knowledge/sponsor-docs/walrus.md` and the official Walrus pricing docs):

- Cost per MB per epoch (in WAL).
- Epoch length in days.
- Minimum storage commitment.
- Cost of read (gateway cost, not protocol cost; the protocol read is free).

## Useful framings

For each candidate use case, calculate:

- **Cost per user per month**: blob_size_per_user (MB) * cost_per_MB_per_epoch (WAL) * (30 days / epoch_days) * WAL_to_USD.
- **Cost per blob per year**: blob_size (MB) * cost_per_MB_per_epoch (WAL) * (365 / epoch_days) * WAL_to_USD.
- **Read serving cost**: usually borne by the gateway, not the protocol. Estimate via gateway pricing, not via Walrus protocol fees.

A 10MB blob stored for 1 year is the canonical "media file" benchmark. If the cost per such blob is over a dollar, your media product needs careful pricing.

## Patterns that work economically

- **Small blobs, long retention**: identity documents, signed records, NFT metadata. Cheap per item, durability premium.
- **Medium blobs, short retention**: user uploads in transient apps (e.g. session recordings, ephemeral posts). Cost is bounded.
- **Large blobs, paid by the user**: user-pays-for-own-storage is the canonical Walrus model, since the user has the WAL and the durability they want.

## Patterns that struggle economically

- **Large blobs, app pays, free for user**: any "free media hosting" model where the app pays for everyone's blobs. The unit economics rarely close at consumer scale.
- **Small blobs but enormous count**: e.g. one blob per chat message. Per-blob overhead may dominate.
- **High read load**: gateway cost can dwarf storage cost. Estimate carefully.

## Pricing models to consider

For an app pricing on top of Walrus:

- **Pass-through with markup**: user pays Walrus cost + 20-50% margin. Transparent, scales with user activity.
- **Subscription with quota**: user pays X / month for Y blobs per month. Easier to budget, but the app eats the cost variance.
- **WAL-native**: the app charges users in WAL directly. Reduces friction for crypto-native users; alienates non-crypto users.
- **Freemium with cap**: free tier with limits, paid tier above. Standard SaaS pattern; works if the free tier's WAL cost is bounded.

## Unit-economics red flags

A candidate fails the unit-economic test when:

- The WAL spend per active user exceeds the user's plausible monthly willingness to pay.
- The WAL spend grows superlinearly with user count (storage compounds, but pricing usually does not).
- The product depends on free storage as a marketing hook with no clear path to monetization.

If any of these fire, the candidate either needs to change the business model or pick a different use case.

## What to write in the research output

Per candidate idea:

```markdown
- candidate: <name>
- estimated cost per active user per month: <USD figure with WAL conversion assumption>
- pricing model assumed: <pass-through | subscription | WAL-native | freemium>
- unit-economic verdict: <positive | needs-tuning | unviable>
- assumption sources: <links to docs and pricing>
```
