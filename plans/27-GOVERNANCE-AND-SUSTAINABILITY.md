# 27. Governance and sustainability

## Why this doc exists

Suiperpower is a community-facing infrastructure project with sponsors, contributors, and a long-term commitment to Sui builders past Overflow 2026. Without a clear governance and sustainability story, the project drifts:

- Decisions get made by whoever happens to be online
- Contributor expectations diverge
- Sponsor relationships become unclear
- Burnout sets in for the original maintainer
- Fork pressure builds when the project does not respond

This doc lays out the model. It is intentionally lightweight; we are not a foundation, we do not need a constitution. We need clarity on who decides what and how the project keeps running.

## Project ownership

**Initial state**: One maintainer (the founder). Owns the GitHub org, the npm package, the Vercel project, the Convex deployment, the domain, the Twitter handle.

**Target state by v1.1**: Two-to-three maintainers. Founder still primary, plus 1-2 trusted collaborators who have demonstrated sustained, high-quality contribution.

**Target state by v2.0**: Three-to-five maintainers, distributed across timezones. Bus-factor of one is unhealthy for a project Sui builders depend on.

## Decision authority

| Decision type | Who decides | How |
|---|---|---|
| Catalog row addition | Any maintainer | Approval from one maintainer is enough |
| New skill addition | Any maintainer | Approval from one, plus passing CI |
| Knowledge doc edit | Any maintainer | Approval from one |
| Breaking change to skill format | All active maintainers | Consensus required |
| Renaming a skill | All active maintainers | Consensus required (changelog impact) |
| Removing a sponsor doc | All active maintainers | Consensus required |
| Domain / npm / Vercel access changes | Founder + one other maintainer | Two-key control |
| Adding a maintainer | All active maintainers | Consensus required |
| Removing a maintainer (inactivity) | Automatic after 90 days idle | Documented |
| Removing a maintainer (cause) | Other maintainers consensus | Documented in advisory |
| Changing the license | All active maintainers + community RFC | High bar, 30-day discussion window |
| Changing the brand voice | Founder | Voice is Kelvin's call, single point |
| Accepting paid sponsorship that affects ranking | Never | Banned by policy |

The bias is "any one maintainer can move forward on small things; multiple required for things that touch the project's contract with users."

## Consensus, definition

Consensus does not mean unanimous. It means:

- All maintainers were given 48 hours to weigh in
- No active maintainer has a strong "do not ship" objection
- Concerns raised are addressed in the discussion thread

If a single maintainer blocks a decision the others want to ship, the discussion continues until either the blocker is convinced or the rest of the maintainers conclude the objection does not warrant blocking. We default to "ship if no strong objection," not "ship only if everyone agrees."

## Conflict of interest

Maintainers and contributors who work for projects in the catalog must:

- Disclose in their PR description and on their GitHub profile
- Recuse from review of PRs that benefit their employer
- Disclose paid sponsorship arrangements (we do not allow paid placement, but speaking gigs, advisory fees, and grant relationships happen)

Recusal does not mean silence. A recused reviewer can still comment on factual accuracy, just cannot approve.

## Fundraising stance

For v1, Suiperpower is unfunded. Maintainers donate time. Convex / Vercel / npm are on free tiers.

We will accept:

- **Sui Foundation grant** for skill content authoring or knowledge docs, if offered
- **Sponsor grants** with no strings attached (e.g. Walrus pays for a deeper Walrus knowledge doc, no preferential treatment)
- **Open Collective** donations from the community (transparent ledger)

We will NOT accept:

- Paid placement in the catalog
- Paid trigger phrases in skill descriptions
- "Pay for review priority" arrangements
- Anything that compromises independence

If we ever take a grant, we publicly disclose the terms. The grant does not change our editorial stance.

## Sponsor relationships

Sponsors of Sui Overflow 2026 (Walrus, DeepBook, OpenZeppelin, OtterSec, Scallop) get:

- First-class skills with their tech as load-bearing integrations
- Knowledge docs in the user's hands
- Catalog inclusion of their official repos
- A named row on `/sponsors`

What sponsors get nothing of:

- Higher rank in `/pick-my-sui-track` based on payment
- Access to telemetry data
- A say in the catalog policy
- Editorial control over content (only accuracy review)

A sponsor relationship is a "you ship the tech, we make it usable; we ship to your community, you point your users at us" reciprocal. Money does not flow either way.

If a sponsor wants more (e.g. a paid integration partner status), we say no. The integrity of the catalog and the anti-slop framework is the whole product. Selling rank is the fastest way to destroy it.

## Maintainer time commitment

Realistic baseline:

- **Founder (Kelvin)**: 5-15 hours/week through launch, 3-8 hours/week post-launch steady state
- **Co-maintainer 1**: 2-5 hours/week
- **Co-maintainer 2**: 2-5 hours/week

Total: 10-25 hours/week steady state. PRs get reviewed within 48 hours, releases happen on schedule, support inbox is responsive.

If we cannot maintain this, the project is failing. Either we recruit more maintainers, narrow scope, or hand off.

## Burnout prevention

- No maintainer is on call. Issues get response within 48 hours best-effort, not contractual.
- Vacation: declare on GitHub Discussions, other maintainers cover.
- Critical-path knowledge documented. No "only Kelvin knows how the install script works" failure mode.
- Quarterly retro: maintainers honestly assess "are we ok, what is unsustainable."
- Rotate review duty during launch weeks (one maintainer is on triage, others build).

## Sustainability post-Overflow 2026

The hackathon ends. The project does not.

Steady-state plan:

- **Quarterly** content reviews (catalog, knowledge docs, sponsor docs)
- **Per Sui major release** Move + object knowledge updates
- **Per sponsor SDK release** integration skill check
- **Monthly** dependency security audit
- **Per security report** SLA-driven response

This is roughly one maintainer-week per quarter of focused effort, plus rolling PR review and triage.

If the user base grows past 10k active users, we re-evaluate maintenance scaling (more maintainers, possible Sui Foundation co-maintenance, possible specialized maintainers per phase).

## What success looks like long-term

- Sui builders reach for Suiperpower the way Solana builders reach for solana-new
- Sponsors maintain their own sponsor docs and skills as PRs to our repo (not us chasing them)
- 10-20% of skills are community-authored
- The project has a maintainer team of 3+ active people across timezones
- It survives at least two maintainer transitions (founder steps back, others continue)

This is the test of "did we build infrastructure or did we build a toy." Toys depend on the founder. Infrastructure outlives the founder.

## Forking

Suiperpower is MIT. Anyone can fork at any time. We support forking actively:

- The Convex backend URL is overridable in `branding.ts`, so a fork can run its own backend
- All skills are markdown, all catalog is JSON, no proprietary format
- We do not run anti-fork measures (no required phone-home, no DRM, no obfuscation)

Why we are pro-fork:

- It is the right thing for an open-source project
- Forks pressure-test our governance: if a fork takes off, we have failed somewhere, and we should learn
- Forks can serve niches we do not (e.g. an Aptos fork, an Asia-only fork with localized content)

We ask forks (politely, not legally) to:

- Pick a name distinct enough to not confuse users
- Credit the upstream
- Disclose if they monetize differently than us

We do not ask forks for:

- Permission
- Profit-sharing
- Trademark license

## Trademark posture

"Suiperpower" is the project name. We do not aggressively defend it.

If a malicious clone uses the name to scam users (e.g. distributing a backdoored install script under the same name), we would respond with:

- A public advisory naming the clone
- A request to npm and Vercel to take down impersonating distributions
- A clarifying tweet / Telegram message

We do not file lawsuits. Open-source ecosystems handle bad actors via reputation, not litigation.

## Privacy posture for governance

Maintainers do not have access to individual user data. Convex telemetry is aggregated; the dashboard at `/stats` (post-v1) shows counts only. Feedback submissions are reviewed by maintainers but the contact field (if any) is treated confidentially.

When we publish stats publicly:

- We publish counts, never individuals
- We do not share platform-string distributions in a way that could identify a user
- We anonymize feedback quotes if used in marketing (with permission, ideally)

## Code of conduct enforcement

`20-CONTRIBUTING-PLAN.md` defines the code of conduct. Enforcement:

1. **First incident**: maintainer reaches out privately, explains the issue
2. **Second incident**: PR / issue locked, public note in the thread
3. **Third incident or severe first incident**: ban from the GitHub org

Public moderation log lives at `docs/MODERATION-LOG.md` (v1.1). For v1, we keep notes privately and aggregate them at quarterly retros.

We do not run a Discord, so the moderation surface is limited to GitHub and (if it happens) Twitter mentions / Sui Telegram. We are not a community space; we are a project.

## RFC process

For changes that affect the project's user-facing contract:

- Renaming or removing a skill
- Changing the install path or directory layout
- Changing the telemetry schema
- Adding a payment / paid feature (would never happen in v1, but for completeness)

The change starts as an RFC in GitHub Discussions:

1. Author writes a one-page RFC: motivation, change, alternatives, deprecation path
2. 14-day discussion window
3. Maintainer team consensus
4. If approved, ship in the next minor release
5. If rejected, author can revise and re-open

This is overkill for catalog rows; it is appropriate for changes that break user expectations.

## Sustainability budget (post-launch)

Hosting:

- Vercel free tier (sufficient through ~100k unique visitors/month)
- Convex free tier (sufficient through ~1M function calls/month)
- npm free for public packages
- Cloudflare for DNS (free)

Domain: $15/year for `.dev`. Paid by founder out of pocket.

If Vercel / Convex spend exceeds free tier:

- We consider a sponsorship from Vercel / Convex (both have generous OSS programs)
- We consider Open Collective donations
- We optimize (caching, batching telemetry)

We do not put a Patreon button on the site. We do not pursue revenue. The minute money becomes the question, the integrity question follows.

## Long-term ownership transition

If Kelvin steps back from active maintenance:

1. Announce 90 days in advance
2. Identify a successor maintainer (already a co-maintainer with track record)
3. Transfer GitHub org admin (founder retains repo access as alumni)
4. Transfer npm publish rights (founder retains read access)
5. Transfer Vercel / Convex / domain (founder retains read access)
6. Public note in CHANGELOG and on the website

Founder retains the right to fork at any time, same as any community member.

## Legal posture

- MIT license: we accept no warranty, users assume risk
- DCO on commits: contributors confirm right to submit
- No CLA: avoids paperwork friction
- No EULA: no end-user agreement beyond MIT
- No "Suiperpower Pty Ltd": we are not a company; we are a project

If at some point we incorporate (e.g. for grant administration, hosting receipts), it would be a non-profit foundation, not a startup. Decision deferred until there is a real need.

## Anti-patterns we will not adopt

- Maintainer-as-CEO: no titles, no hierarchy, just maintainers with merge bits
- Token launch: the project will never have a token; suggesting one is reason to remove a maintainer
- Paid premium tier: not in v1, not in v2; if we ever revisit it would be services on top of the open-source core, and the core stays open and free
- Closed governance: no private maintainer Discord; decisions happen in public on GitHub
- Sponsor capture: a sponsor never gets to determine roadmap

## How this doc gets used

- Read by new maintainers when invited
- Read by sponsors during outreach (they know what we will and will not accept)
- Read by curious community members evaluating whether to invest time
- Updated when maintainers join, when policies change, when we grow

## Origin acknowledgment

The governance model takes inspiration from solana-new (informal but clear), oh-my-zsh (small maintainer team, big community), and the Linux kernel (BDFL with strong delegation). Where Suiperpower differs (no commercial play, anti-slop as load-bearing) is intentional.
