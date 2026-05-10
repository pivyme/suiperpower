# Payer types

The five payer types the skill forces the user to choose between. Each type has different validation patterns and unit economic shapes.

## User (consumer or prosumer)

The end user pays directly.

Examples on Sui: NFT marketplace fees, paid Walrus storage, app-level subscriptions, premium features.

Validation pattern: a willingness-to-pay test. A landing page with a price tag and a payment flow, or a real charge in WAL or SUI, beats survey data every time.

Unit economic shape: revenue is roughly linear with active users. Margins are high if hosting and protocol costs are bounded.

Failure modes: pricing too low to cover acquisition cost; users who say they will pay but do not; high churn that erodes lifetime value.

## Developer

A developer (third-party app builder) pays you to use your infra, SDK, or service.

Examples on Sui: Walrus gateways, indexers-as-a-service, deployment tooling, security audit subscriptions, dev-tooling SaaS.

Validation pattern: a paid pilot with one developer team. Revenue per developer is usually high; volume is lower than consumer products.

Unit economic shape: high ARPU, lower count. Margins depend on how much support each customer needs.

Failure modes: developers route around tools they could build themselves; pricing must beat "do it in-house".

## Partner

A protocol, sponsor, or large platform pays you to integrate or to deliver a specific outcome.

Examples on Sui: a Walrus integration project paid by Mysten / Walrus team; a DeepBook market-maker arrangement; an OpenZeppelin Sui audit pipeline funded by OZ.

Validation pattern: a signed letter of intent or a small paid milestone. Often easier to close than user revenue but slower to scale.

Unit economic shape: lumpy revenue. Margins vary by deal.

Failure modes: dependence on a single partner; misalignment when the partner pivots; revenue that does not generalize beyond the initial deal.

## Treasury

A protocol or DAO treasury pays you, usually as a grant or a milestone-based contract.

Examples on Sui: Sui Foundation grants, Walrus / DeepBook / Scallop ecosystem grants, retroactive funding programs.

Validation pattern: a successful grant application or a pre-committed treasury allocation.

Unit economic shape: also lumpy. Useful as a runway buffer; rarely a sustainable model on its own.

Failure modes: treasury revenue dries up; grant outcomes are not measured the same way as user revenue.

## Advertiser

A third party pays to reach the user base.

Examples: app surfaces sponsor placements; community newsletter ads; partnership-based content.

Validation pattern: a real ad sale at a stated CPM or a sponsorship deal.

Unit economic shape: low ARPU per user; needs scale to matter.

Failure modes: low revenue per user requires high user counts; advertiser fit can erode the user experience.

## Mix vs single

Most products eventually have a mix. At validation stage, force the user to pick the largest one. Validating two payer types at once dilutes the test.

## Common bad answers

Reject these:

- "Token appreciation pays for it". Token-pays-for-itself is not a business model; it is a fundraising structure.
- "Network effects will create value". Network effects are an outcome, not a payment mechanism.
- "We will figure out monetization later". Acceptable in some pre-MVP cases but not after the product ships.
- "We are open source so we do not need to monetize". Maintenance has costs; sustainability requires either revenue or sponsor support; document which.
