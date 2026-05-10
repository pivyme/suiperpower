# Variable cost checklist for Q4

The Q4 unit economic question is "what is your margin per paying user". Most builders skip variable costs they will eventually pay. Walk this checklist; include each that applies.

## Sui protocol costs

- **Gas per transaction**: every user action that hits chain costs gas. Estimate avg gas per user-month at the user's expected activity level.
- **Walrus storage**: per-MB-per-epoch in WAL. Apply to per-user blob storage.
- **DeepBook fees**: basis points on volume routed through DeepBook pools.
- **Scallop fees**: borrow APR or interest rate spread when applicable.
- **zkLogin OAuth costs**: typically free, but check the OAuth provider's terms.

## Infrastructure costs

- **RPC reads**: most users hit RPC nodes hundreds of times per session. If the user runs their own RPC infra, that is a real ops cost. If they use a hosted RPC (Mysten, Blockvision, Triton One, etc.), check the pricing tier.
- **Indexer**: if the product depends on a custom indexer, hosting and DB cost adds up at scale.
- **Hosting**: frontend (Vercel, Cloudflare), backend services, any worker queues.
- **Email / SMS / push notifications**: if the product transactional.

## Support costs

- **Customer support time**: even at zero paid support, the founder's time is a cost. Estimate hours per active user.
- **Onboarding burden**: if the first session needs handholding (especially for non-crypto-native users), that is recurring cost.

## One-time amortized costs

- **Audit**: a Move audit at OtterSec (or equivalent) is a one-time cost. Amortize over expected user count.
- **Legal**: terms of service review, jurisdiction structuring.
- **Marketing**: if there is paid acquisition, the CAC enters here.

## Costs to NOT include in Q4

- Founder salary (if pre-revenue, this is a runway question, not a unit-economic question).
- Opportunity cost of capital.
- Token treasury value (these are not variable per-user costs).

## Sample math

User pays $5/month. Variable costs:

- gas: $0.10 (6 actions per month at $0.015 gas average)
- Walrus: $0.20 (50MB stored, durable)
- RPC: $0.10 (300 reads per session, 4 sessions per month, hosted RPC)
- support: $0.30 (5 minutes per month at $30/hr blended)
- hosting (per-user share): $0.05

Total variable cost: $0.75
Gross margin: ($5.00 - $0.75) / $5.00 = 85%

That is a healthy margin. Now check at scale: does any cost compound non-linearly (e.g. support time grows superlinearly with active users)?

## Red flags

- Total variable cost over 50% of revenue at one user. Hard to scale.
- A single cost over 30% of revenue. Makes the product fragile to that cost moving.
- Costs that grow superlinearly with users (typically support, abuse mitigation, manual operations).

If any flag fires, the user should adjust pricing, scope down the product, or accept lower margins consciously.
