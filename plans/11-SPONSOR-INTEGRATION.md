# 11. Sponsor integration

## Sponsors of Sui Overflow 2026

| Sponsor | Role | Their angle |
|---|---|---|
| **Walrus** | Headline partner | Decentralized blob storage on Sui |
| **DeepBook** | Track sponsor | Central limit orderbook on Sui |
| **OpenZeppelin** | Prize sponsor | Audited Move libraries for Sui |
| **OtterSec** | Prize sponsor | Top-tier Sui Move auditor |
| **Scallop** | University award sponsor | Largest money market on Sui |

Each sponsor's tech is integrated as a first-class skill plus a knowledge doc plus catalog entries. The /pick-my-sui-track skill maps a project to a sponsor track based on actual integration depth, not marketing intent.

## Integration matrix

| Sponsor | First-class skill | Knowledge doc | Catalog entries | Audit / lint hook |
|---|---|---|---|---|
| Walrus | `walrus-storage`, `walrus-research` | `sponsor-docs/walrus.md` | repos: walrus-examples; mcps: walrus-mcp (if exists, else wrap) | scaffold-project includes Walrus as a default storage option |
| DeepBook | `deepbook-orderbook`, `deepbook-research` | `sponsor-docs/deepbook.md` | repos: deepbook examples + popular wrappers; mcps: deepbook-mcp (if exists) | scaffold-project includes DeepBook as a default for any orderbook / DEX intent |
| OpenZeppelin | `openzeppelin-sui-libs` | `sponsor-docs/openzeppelin-sui.md` | repos: oz-sui contracts + examples; mcps: none expected | review-move and ottersec-prep both link OZ patterns by category |
| OtterSec | `ottersec-prep` | `sponsor-docs/ottersec-checklist.md` | repos: ottersec sui-tools + audit reports if public | review-move calls into ottersec-checklist for the security pass |
| Scallop | `scallop-money-market` | `sponsor-docs/scallop.md` | repos: scallop sdk + examples; mcps: scallop-mcp (if exists) | scaffold-project includes Scallop as a default for lending/borrowing intent |

## Walrus

**What it is**: Decentralized blob storage on Sui. The headline partner of Overflow 2026. Stores files (images, video, datasets) certified on-chain with a defined storage epoch.

**First-class skill**: `walrus-storage`

Workflow:

1. Read project context, decide what kinds of blobs the project stores (NFT media, user uploads, datasets, encrypted files).
2. Walk user through Walrus SDK install (TS or CLI).
3. Generate the minimal integration: store a file, get a blob id, retrieve, render.
4. Address pricing model (epochs, extension, deletion).
5. Note encryption is the user's responsibility (Walrus stores blobs as-is).
6. Quality gate: the demo must actually retrieve a stored blob and render it, not just call store and forget.

**Knowledge doc**: `skills/data/sui-knowledge/sponsor-docs/walrus.md`

**Default surfacing**: `scaffold-project` includes "decentralized blob storage with Walrus" as one of the default options for any project that involves user-uploaded content.

**Why it matters for Suiperpower**: Walrus is the headline partner. A non-trivial fraction of v1 users will be aiming for the Walrus track. Making Walrus integration painless is a wedge for adoption.

## DeepBook

**What it is**: Central limit orderbook on Sui. Settles orders on-chain with maker/taker fees. The track sponsor of Overflow 2026.

**First-class skill**: `deepbook-orderbook`

Workflow:

1. Confirm project actually needs an orderbook (vs an AMM, vs aggregator).
2. Walk user through DeepBook SDK install.
3. Generate the minimal integration: pick a pool, place a limit order, fill, cancel.
4. Address tick size, lot size, settlement timing.
5. Note funding-rate / perpetuals patterns built on top of DeepBook.
6. Quality gate: the demo must place and settle at least one real order on testnet, observable on suiscan.

**Knowledge doc**: `sponsor-docs/deepbook.md`

**Companion idea-phase skill**: `deepbook-research`, surfaces volume / liquidity / market gaps so users can pick a real opportunity, not a vanity project.

**Default surfacing**: `scaffold-project` recommends DeepBook for any DEX / trading / orderbook intent.

## OpenZeppelin (Sui libs)

**What it is**: Audited Move primitives for Sui (separate from OZ's EVM and Solana work). Access control, pausable, upgrade patterns, role-based permissions.

**First-class skill**: `openzeppelin-sui-libs`

Workflow:

1. Survey project's needs (admin-only ops, role hierarchy, pausable, upgradeable).
2. Pull the right OZ Sui module(s) into `Move.toml`.
3. Generate boilerplate using OZ patterns instead of hand-rolled access control.
4. Quality gate: review-move reviews OZ usage, flags misuse (e.g. capability passed to a public function without checks).

**Knowledge doc**: `sponsor-docs/openzeppelin-sui.md`

**Cross-reference**: `review-move` and `build-with-move` both reference OZ patterns where applicable.

**Why it matters**: OZ is a prize sponsor. Projects using OZ libraries demonstrate security maturity, which judges weight heavily in 2026.

## OtterSec

**What it is**: Top-tier Sui Move audit firm. Prize sponsor.

**First-class skill**: `ottersec-prep`

Workflow:

1. Run the OtterSec pre-audit checklist (in `sponsor-docs/ottersec-checklist.md`).
2. Run static checks: any `unsafe`, commented-out assertions, missing tests for public functions, capability leakage.
3. Run the security checklist (P0-P3) from `guides/security-checklist.md`.
4. Generate an audit-ready package: clean repo, documented entry points, threat model doc, scope doc.
5. Suggest engaging OtterSec for a real audit at ottersec.io if the project goes to mainnet with non-trivial TVL.

**Knowledge doc**: `sponsor-docs/ottersec-checklist.md`

**Cross-reference**: `review-move` calls into the OtterSec checklist as part of its workflow.

**Anti-slop angle**: A project tagged for the OtterSec track must demonstrate audit-prep posture, not just "we want the prize." `pick-my-sui-track` enforces this.

## Scallop

**What it is**: Largest money market on Sui (lending / borrowing / collateral management). University award sponsor.

**First-class skill**: `scallop-money-market`

Workflow:

1. Determine integration intent (deposit only, borrow, leverage, build a strategy on top of Scallop).
2. Walk user through Scallop SDK install.
3. Generate the minimal integration: deposit, borrow, repay.
4. Address oracle dependency (Pyth feeds), liquidation thresholds.
5. Quality gate: the demo must actually deposit + borrow + repay on testnet against a live Scallop pool.

**Knowledge doc**: `sponsor-docs/scallop.md`

**Default surfacing**: `scaffold-project` recommends Scallop for any lending / borrowing / yield intent.

**University award angle**: Scallop sponsors the university award. The skill surfaces this when the user mentions university affiliation in their idea context.

## /pick-my-sui-track skill, integration depth check

The skill grades integration depth on a 0-3 scale:

| Score | Meaning | Track recommendation |
|---|---|---|
| 0 | No imports, no calls | Do not recommend this track |
| 1 | Imported in `Move.toml` or referenced in docs only | Do not recommend |
| 2 | One or more function calls, but not on the load-bearing path | Recommend as secondary track |
| 3 | Used on the project's load-bearing flow, removing it would break the demo | Recommend as primary track |

The skill explains the score to the user, so a project that scores 1 with Walrus knows it needs to go deeper before claiming the Walrus track.

## Co-marketing potential (post-launch)

Each sponsor benefits from Suiperpower distribution:

- **Walrus**: Suiperpower-installed projects default to Walrus storage when applicable, increasing Walrus's blob count.
- **DeepBook**: Same for orderbook / DEX projects.
- **OpenZeppelin**: Sui libs get downstream adoption from every project using `openzeppelin-sui-libs`.
- **OtterSec**: Audit-ready posture from `ottersec-prep` graduates more leads to their service.
- **Scallop**: Same for any lending integration.

Post-launch reach-outs (in `17-LAUNCH-PLAN.md`) propose:

- Free distribution: sponsors mention Suiperpower in their hackathon channels.
- Co-authored skills: sponsor engineers review / co-author the relevant skill, in exchange for prominent attribution.
- Sponsor-curated example repos in our `clonable-repos` catalog.

## Risk: appearing to favor sponsors over better tools

Mitigation:

- The catalog includes non-sponsor alternatives (Cetus, Aftermath, Turbos for AMMs; NAVI for lending) and skills surface them as options.
- `find-next-sui-idea` and `validate-idea` push users toward what their idea needs, not toward sponsor tracks.
- Skill copy never says "you must use Walrus / DeepBook / Scallop." It says "if your project does X, here is how to integrate Y."

The bias is "sponsors are first-class options when they fit," not "sponsors are the only option."

## Risk: sponsor SDK churn

Sponsor SDKs evolve. Skills include version pins and `lastChecked` dates in their references. Quarterly maintenance pass updates examples against current SDK versions. Catastrophic breakage triggers a hot-fix release.

## What we ask sponsors for

(Optional, post-launch ask, not required for v1.)

- Permission to attribute their official examples in `clonable-repos`.
- Review of `sponsor-docs/<sponsor>.md` for accuracy.
- Cross-link from their Overflow page to suiperpower.dev/skills (or to their specific skill).
- Heads-up on SDK breaking changes 2 weeks before release.

What we do not ask for: payment, exclusivity, or content control beyond accuracy review.
