# 12. Anti-slop framework

## The thesis

Most hackathon submissions are slop. They die the moment the prize is paid because they were never products, they were prize-grabbers wearing a product costume. Suiperpower exists to make slop the harder path and a real product the easier one.

The Sui team's 2026 message confirms this matters:

> Teams that dedicate more time toward refining usability, functionality, and long-term value will generally be more competitive.

> Judging criteria place much stronger emphasis on product quality, real-world application, technical execution, and overall polish.

This framework is how Suiperpower operationalizes that.

## Definition of slop

A submission is slop if it has any of the following:

1. **No real users.** Nobody outside the team has used it for its intended purpose.
2. **No retention loop.** No reason a user would come back next week.
3. **Broken golden path.** The load-bearing flow does not work end to end on the live URL.
4. **Demo theater.** The demo video shows things that the live product cannot actually do.
5. **Placeholder content.** Lorem ipsum, "<placeholder>", "TODO", or stock images that have nothing to do with the product.
6. **Sponsor cosplay.** Claims a sponsor track but the sponsor's package is imported and never called.
7. **Generic name and brand.** "DeFiHub", "SuiSwap", "ChainPilot", anything a thousand other teams could and have used.
8. **No business model.** No coherent answer to "how does this make money or sustain itself."
9. **No technical depth.** Could have been built in 30 minutes with a wallet connect button and a Tailwind template.
10. **No README.** Or a README that does not match the product.

The framework targets all ten.

## Where the gates live

```
┌───────────┐        ┌──────────┐        ┌────────────┐        ┌──────────┐
│  Idea     │  →     │  Build   │  →     │  Ship      │  →     │  Submit  │
│  phase    │        │  phase   │        │  phase     │        │  phase   │
└───────────┘        └──────────┘        └────────────┘        └──────────┘
     │                    │                    │                    │
     │ validate-idea      │ retention-loop     │ deploy-to-mainnet  │ submit-to-sui-overflow
     │ competitive-       │ validate-business- │ requires real      │ refuses on missing
     │   landscape        │   model            │ deploy + verify    │ live URL / package /
     │                    │ will-real-users-   │                    │ media
     │ output:            │   pay              │                    │
     │ idea-context.md    │ roast-my-product   │                    │ output:
     │ with stress-tests  │ product-review     │                    │ submission package
     │                    │ review-move        │                    │ + day-of preflight
     │                    │ (every build skill │                    │
     │                    │  has a quality     │                    │
     │                    │  gate)             │                    │
```

Gates are inline, not optional. A user who skips the validation skill still hits inline gates inside `build-with-claude` and `submit-to-sui-overflow`.

## Anti-slop skills (first-class)

### /validate-business-model

Walks the user through:

1. Who pays? (user, developer, partner, treasury, advertiser)
2. How much? (per-tx, per-month, per-feature, per-volume)
3. Why would they keep paying? (retention loop)
4. Unit economics: revenue per user vs cost per user
5. What is the smallest plausible business at this model? (minimum users for it to be a business at all, not just an experiment)

Output appended to `.suiperpower/idea-context.md`. The skill refuses to claim a business model exists if any of the questions has no answer.

### /retention-loop

Forces user to articulate the loop:

1. What does a user do on day 1?
2. What pulls them back on day 2?
3. What pulls them back on day 7?
4. What pulls them back on day 30?

If any answer is "we will figure that out later," the skill flags it. The output is a single-paragraph loop description that a stranger could understand without context.

### /will-real-users-pay

A pricing experiment skill:

1. Pick a price point.
2. Show the user how to get 5-10 candidate users to react to that price (e.g., a landing page test, a Twitter poll among target users, a paid LinkedIn message campaign at low cost).
3. Define a measurable signal (e.g. 30% of intent-targeted users say "I would pay this").
4. Block the launch claim "users will pay" until a signal is captured.

Cheap and fast, not a full market study. The point is to force the founder to talk to anyone who is not their friend.

### /roast-my-product

Brutal critique. Mirrors solana-new's roast-my-product. Skill plays "harshest investor in the room" and lists every weakness:

- Generic positioning
- Unclear value
- Demo theater
- Missing competitive moat
- Pricing that does not make sense
- Tech that is not load-bearing for the value
- Brand that is forgettable

Output is a numbered list. User picks the top 3 to fix before submitting.

### /product-review

Balanced UX review. Less brutal than roast, but more concrete:

- First-paint experience
- Onboarding friction
- Empty states, error states, loading states
- Mobile experience
- Time-to-first-value (how many seconds before a new user gets a result)

Output: a roadmap of UX fixes prioritized by impact / effort.

### /review-move

Code-quality review for Move:

- Public function safety
- Capability handling
- Object lifecycle correctness
- Test coverage for public entry points
- Use of OpenZeppelin Sui libs where applicable
- Static checks (no `unsafe`, no commented-out assertions, no leaked internal types)

Cross-references `sponsor-docs/openzeppelin-sui.md` and `sponsor-docs/ottersec-checklist.md`.

## Quality gates inside other skills

Every build / ship skill embeds a "Quality gate (anti-slop)" section. Examples:

| Skill | Gate |
|---|---|
| `scaffold-project` | After scaffold, ask: is the chosen tech stack the simplest possible for this idea? If not, simplify. |
| `build-with-claude` | After each build sub-step, ask: is there a passing test? Is the demo path runnable? |
| `walrus-storage` | The demo must actually retrieve a stored blob and render it. |
| `deepbook-orderbook` | The demo must place + settle a real order on testnet. |
| `scallop-money-market` | The demo must deposit + borrow + repay against a live Scallop pool. |
| `sui-zk-login` | A real OAuth provider must work end-to-end, not a stub. |
| `deploy-to-testnet` | Verify the package id on chain via `sui client object` before reporting deploy done. |
| `deploy-to-mainnet` | Refuses to run unless `validate-business-model`, `retention-loop`, and `review-move` have outputs in `.suiperpower/`. |
| `submit-to-sui-overflow` | Live URL must respond, package id must verify, all media must exist at correct dimensions, demo video script must show a real outcome. |
| `pick-my-sui-track` | Track must score 3 (load-bearing integration), not 1 or 2. |

## Composability

Anti-slop skills compose. A user can run them standalone or as part of a journey.

```
claude "/validate-business-model"
claude "/retention-loop"
claude "/will-real-users-pay"
claude "/roast-my-product"
```

Each writes to `.suiperpower/`. `submit-to-sui-overflow` reads them and surfaces unresolved flags before generating the submission.

## What anti-slop is NOT

- It is not gatekeeping experimental projects. A user can run any skill, build anything, deploy anything. Anti-slop kicks in when the user claims "this is ready to submit."
- It is not a moral judgment. It is a quality bar.
- It is not a substitute for product taste. It surfaces the questions a good PM would ask. The user still has to answer.
- It is not an automated rejection mechanism. The skill flags issues, the user decides whether to address them. We never hard-block someone from submitting.

## Tone

The anti-slop skills are direct, not condescending. They sound like a senior friend who has shipped before, not a school principal.

Examples:

> Skill: "Your retention loop says 'users will keep coming back to check their dashboard.' That is not a loop, that is a hope. What would actually pull them back?"

Not:

> Skill: "Your retention loop is insufficient. Please rewrite to include the following five required elements..."

Brand voice rules in `15-BRAND.md`.

## Measurement

Convex telemetry tracks (anonymously, opt-in):

- How often each anti-slop skill is invoked
- How often a user runs an anti-slop skill before vs after `submit-to-sui-overflow`
- How often the submission gate blocks (and the user fixes vs overrides)

Goal: in v1.1 we know whether the framework is being used or being skipped. If it is being skipped, we re-design (more friction at submit time, more visible gates earlier).

## Why this framework will work for Sui Overflow 2026 specifically

- Sui team explicitly weighted polish, real-world application, and technical execution. The framework directly targets each.
- Judges are pattern-matchers. A submission that ran `roast-my-product` and addressed the findings will look qualitatively different from one that did not.
- The framework gives a small team an unfair advantage: they get the same critique loop a well-funded startup would get from advisors, just from skills.

## Why this framework will keep working past Sui Overflow 2026

These skills are not hackathon-specific. They make any Sui builder ship better. The hackathon is the launch occasion, the framework is the long-lived asset.
