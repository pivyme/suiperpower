# 30. Shared guides and phase-handoff specs

## Why this doc exists

Skills do not duplicate procedural content. When `deploy-to-testnet`, `deploy-to-mainnet`, and `submit-to-sui-overflow` all need to walk a Sui CLI publish flow, that flow lives in one place: a guide under `skills/data/guides/`. Skills reference it by relative path. The same is true for RPC + wallet setup, security checklists, package-id capture, and the deepsurge.xyz submission walk-through.

This doc specifies what each shared guide contains, the section structure, the length target, and which skills depend on it. It also specifies the phase-handoff context-file contracts (`.suiperpower/idea-context.md`, `build-context.md`, `deploy-context.md`, `submission-context.md`, `learnings.md`).

Both classes of artifact are content the build phase authors. This doc is the contract.

The patterns here are adapted from `reference/solana-new-main/skills/data/guides/` and `skills/data/specs/phase-handoff.md`. Solana-specific commands and ecosystem references are replaced with Sui-native equivalents. Where solana-new's pattern transfers cleanly, we kept the section shape.

## Files

```
skills/data/
├── guides/
│   ├── rpc-wallet-guide.md
│   ├── deploy-runbook.md
│   ├── security-checklist.md
│   ├── package-id-capture.md
│   └── deepsurge-submission.md
└── specs/
    └── phase-handoff.md
```

## guides/rpc-wallet-guide.md

**Audience**: any skill that needs the user to have a working Sui CLI environment with a funded wallet on the right network.

**Length target**: 100-150 lines.

**Sections**:

### Header

> Shared reference for all suiperpower skills. RPC + wallet setup for Sui dev and production.

### RPC setup

For each environment, give a copy-pasteable bash block:

- **Devnet** (free public endpoint via `sui client switch --env devnet`)
- **Testnet** (free public endpoint, primary network for hackathon submissions)
- **Mainnet** (paid RPC recommended for production: Mysten public mainnet is rate-limited; alternatives include Blockvision, Suiscan, or self-hosted)

Show how to verify RPC works:

```bash
sui client active-env
sui client envs
sui client active-address
sui client gas
```

### Wallet setup

For each context:

- **Development on devnet/testnet** (`sui client new-address ed25519`, faucet via `sui client faucet`)
- **Production on mainnet** (separate keypair, never reuse devnet keys, fund from your wallet)
- **Multisig for high-value packages** (point at Mysten's multisig docs and ecosystem multisig services as they emerge)

### Wallet adapter / frontend setup

Quick reference table by use case:

| Use case | SDK | Install |
|---|---|---|
| Web dApp, crypto users | `@mysten/dapp-kit` | `pnpm i @mysten/dapp-kit @mysten/sui @tanstack/react-query` |
| Web dApp, social login | `@mysten/enoki` (zkLogin) | `pnpm i @mysten/enoki` |
| Sui Wallet only | dapp-kit's Sui Wallet integration | included in dapp-kit |
| Mobile (React Native) | Sui Mobile SDK | per Mysten Mobile SDK guide |
| AI agent / bot | `@mysten/sui` Keypair | `pnpm i @mysten/sui` |

### Environment variables pattern

Every project has `.env` (gitignored) and `.env.example` (committed). Show both shapes with the canonical Sui variables (`SUI_NETWORK`, `SUI_RPC_URL`, `SUI_FAUCET_URL`, `ENOKI_API_KEY`, etc.).

### Quick reference: which RPC for what

| Use case | RPC | Why |
|---|---|---|
| Dev / testing | Mysten public devnet/testnet | Free, no signup |
| Production app, low volume | Blockvision / Suiscan | Reliable, generous free tiers |
| Production app, high volume | Paid RPC tier or self-hosted full node | Rate-limit headroom |
| Indexer / analytics | Mysten indexer or third-party | Different endpoint than RPC |

### Quick reference: which wallet for what

(Same shape as the SDK table above. Keep table tight, link to `06-SUI-KNOWLEDGE-BASE.md` 04-protocols-and-sdks for depth.)

### Skills that read this guide

`scaffold-project`, `build-with-claude`, `deploy-to-testnet`, `deploy-to-mainnet`, `sui-zk-login`, `sponsored-transactions`, `build-mobile-sui`.

## guides/deploy-runbook.md

**Audience**: anyone deploying a Sui Move package, devnet to mainnet.

**Length target**: 200-260 lines.

**Sections**:

### Header

> Step-by-step Sui Move deploy commands. Devnet → testnet → mainnet. Referenced by `deploy-to-testnet`, `deploy-to-mainnet`, `scaffold-project`, and `submit-to-sui-overflow`.

### Pre-requisites check

```bash
sui --version           # >= current stable
node --version          # >= 20
pnpm --version          # any recent
```

How to install Sui CLI if missing (point to mystenlabs/sui releases or `cargo install`).

### Phase 1: build the package

```bash
sui move build
```

Verify build artifacts under `build/`. Check warnings.

### Phase 2: deploy to devnet

```bash
sui client switch --env devnet
sui client active-address
sui client gas
# Faucet if needed:
sui client faucet
# Then publish:
sui client publish --gas-budget 200000000 --json | tee /tmp/sui-publish-output.json
```

Capture package id (link to `package-id-capture.md` for the parsing recipe). Verify package on chain:

```bash
sui client object <PACKAGE_ID>
```

### Phase 3: deploy to testnet

Same shape, switch env to testnet. This is the primary network for Sui Overflow 2026 submissions when the project is not mainnet-ready.

### Phase 4: pre-mainnet checklist

Run through every item before mainnet:

- **Security**: scan for secrets in repo history, run `review-move`, run the security checklist from `security-checklist.md`
- **Move soundness**: build clean, all tests pass, capability handling reviewed, OZ libs used where applicable
- **Build verification**: clean build hash captured, `Move.toml` deps pinned to specific revs / tags
- **Upgrade authority decision**: keep upgrade cap, transfer to multisig, or freeze. Document the choice.

### Phase 5: deploy to mainnet

```bash
sui client switch --env mainnet
sui client active-address
sui client gas      # need budget for the publish
sui client publish --gas-budget 500000000 --json | tee /tmp/sui-publish-mainnet.json
```

Post-deploy verification:

- `sui client object <PACKAGE_ID> --json` returns the published package
- Build hash matches local
- Upgrade authority is where you intended
- Frontend env points at mainnet

### Cost reference

| Operation | Estimated SUI cost |
|---|---|
| Publish small package (<50KB) | ~0.05-0.15 SUI |
| Publish medium package (50-200KB) | ~0.15-0.4 SUI |
| Publish large package (200-500KB) | ~0.4-1.0 SUI |
| Upgrade | ~50-80% of original publish cost |
| Object creation | gas-cost-only, fractions of a SUI |
| Simple transfer | tiny |

(Numbers updated against current Sui mainnet gas at doc author time.)

### Rollback

If the package is upgradeable, deploy a previous version with the upgrade flow (`sui client upgrade --upgrade-capability <CAP> --gas-budget ...`). If the upgrade cap was burned, the package is immutable; you cannot roll back. Document this trade-off when discussing upgrade authority.

### Skills that read this guide

`deploy-to-testnet`, `deploy-to-mainnet`, `scaffold-project` (intro section), `submit-to-sui-overflow` (verification section), `ottersec-prep`.

## guides/security-checklist.md

**Audience**: developer or skill performing a security pass on a Sui Move package.

**Length target**: 230-280 lines.

**Structure**: P0 / P1 / P2 / P3 priorities, mirroring the `reference/solana-new-main/skills/data/guides/security-checklist.md` shape. Replace Solana-specific findings (signer constraints, Anchor account types, PDA seeds, lamport handling) with Sui-Move-specific findings.

### P0: critical, fix before any deployment

1. **Capability handling**
   - Public functions must not accept capabilities by value when they should be by reference
   - Capabilities must not be exposed via Display or other public read paths
   - `grep -rn 'pub fun.*Cap'` for review; cross-check by hand

2. **Object ability mismatch**
   - `key` only on top-level objects
   - `store` only when nesting inside another object is intended
   - `drop` and `copy` should be rare for stateful resources

3. **Shared object versioning**
   - Mutations of shared objects must respect the consensus contract; review `&mut` usage
   - No assumption of strong consistency between shared object reads and writes inside a single block

4. **Capability leak via friend / public visibility**
   - `friend` should be used sparingly; document why
   - `public(package)` (Move 2024) keeps caps inside a package; prefer it over plain `public` when possible

5. **Init function safety**
   - One-time witness must match the module name in caps and not be reused
   - `init` runs once at publish; idempotency is provided by Move, not your code

6. **Reinitialization defense**
   - Pattern-check: any "create" function that does not enforce uniqueness via shared registry or capability burn
   - For coin / treasury patterns, ensure the witness pattern is intact

7. **Arithmetic overflow / underflow**
   - Move's u64 overflow aborts the transaction; this is usually safe
   - For u128 / multi-step math, use checked arithmetic or explicit bounds
   - Review any `as u64` cast for truncation risk

8. **PTB-side trust assumptions**
   - When composing PTBs that the user signs, the user signs the entire block; design APIs so partial-step abuses are impossible
   - Sponsored tx flows: verify the sponsor cannot inject malicious moves into the user's PTB

### P1: high, fix before mainnet

9. **Object access control**
   - Functions that mutate an Object should require the right capability or witness
   - Avoid "anyone can call" mutating functions unless intentional

10. **Cross-package call safety**
    - When calling another package's function via `entry`, validate the caller is authorized
    - Pin dependency revs in `Move.toml` to avoid silent upstream changes

11. **Display and metadata correctness**
    - For NFT-like objects, the Display fields must not leak internal state
    - Validate URL / image fields if user-supplied

12. **Event emission**
    - Critical state transitions emit events for off-chain indexing and monitoring
    - Audit absence of events on `mint`, `transfer`, `burn`, `revoke`

### P2: medium, fix before significant TVL or user count

13. **Excessive privileges**
    - Treasury caps held by a single EOA; consider multisig before TVL grows
    - Upgrade cap retained or burned; document the reason

14. **Error path quality**
    - Avoid `assert!(false)` in production paths
    - Define error codes via `const E_*: u64 = ...;` for clarity in failures

15. **Test coverage for public entry points**
    - Every public function has at least one happy-path and one expected-failure test
    - Capability-gated functions have at least one unauthorized-call test

### P3: best practices

16. **Gas profile awareness**
    - For functions called frequently, run `sui client dry-run` and inspect gas
    - Avoid gas spikes from unbounded vector growth

17. **Documentation**
    - Public functions have docstrings (`/// ...`) explaining inputs, outputs, side-effects
    - The package README documents the deploy command and the package id

18. **Linting**
    - `sui move build` clean (no warnings) before publish
    - Follow Move 2024 idioms (`public(package)` vs `friend`, etc.)

### Automated tools

- `review-move` skill walks through each P0-P3 item with concrete commands
- `ottersec-prep` skill packages findings into an audit-ready report
- `openzeppelin-sui-libs` skill recommends migrations from hand-rolled patterns to OZ primitives

### Scoring guide

| Grade | Criteria |
|---|---|
| **A** | All P0-P2 clean; most P3 addressed; tests for public entry points |
| **B** | All P0 clean; most P1 clean; some P2 remaining |
| **C** | P0 clean but P1 has issues; needs work before mainnet |
| **D** | P0 issues found; do NOT deploy to mainnet |
| **F** | Multiple P0 issues; consider rewriting the affected modules |

### Skills that read this guide

`review-move`, `ottersec-prep`, `deploy-to-mainnet`, `cso` if added in v1.1, `submit-to-sui-overflow` (light reference at the gate).

## guides/package-id-capture.md

**Audience**: any skill that needs the package id of the user's deployed Move package.

**Length target**: 60-100 lines.

**Sections**:

### When to use this guide

- After `sui client publish` succeeds
- When the user pastes a publish output and wants the package id extracted
- When `submit-to-sui-overflow` needs to verify the package id on chain

### The capture recipe

```bash
sui client publish --gas-budget 200000000 --json | tee /tmp/sui-publish-output.json
PACKAGE_ID=$(jq -r '.objectChanges[] | select(.type=="published") | .packageId' /tmp/sui-publish-output.json)
echo "package_id: $PACKAGE_ID"
```

### Writing to deploy-context

Append to `.suiperpower/deploy-context.md`:

```markdown
## Deploy <timestamp>
- package_id: <value>
- network: <devnet | testnet | mainnet>
- deployer: <address>
- upgrade_capability: <object_id or "burned">
- deployed_at: <YYYY-MM-DDTHH:MM:SSZ>
```

### Verification

Confirm the package exists on chain:

```bash
sui client object $PACKAGE_ID --json
```

If the result is empty or errors, the publish did not actually succeed. The skill should not record success.

### Mainnet vs testnet

Skills must capture the network too, not just the package id. A mainnet package id and a testnet package id are syntactically identical but functionally different.

### Skills that read this guide

`deploy-to-testnet`, `deploy-to-mainnet`, `submit-to-sui-overflow`.

## guides/deepsurge-submission.md

**Audience**: anyone preparing a deepsurge.xyz submission for Sui Overflow 2026.

**Length target**: 100-160 lines.

**Sections**:

### What deepsurge.xyz is

Sui Overflow 2026's submission portal. Distinct from overflow.sui.io (the hackathon site).

URL: `https://www.deepsurge.xyz/hackathons/b587dc0c-4cb8-4e63-ada5-519df38103bf`

### Required fields

(Mirror the list from `10-HACKATHON-SUBMISSION.md`. Keep the guide concise; the spec lives in `10-`.)

- Project logo (1280x1280 recommended)
- Project name (must be unique-ish, see name validation)
- Description (short and full)
- Track (one primary)
- Deployment network
- Package id of the deployed program
- Team (each member registered on deepsurge.xyz first)
- Links: GitHub, Website, Demo video
- Media: 16:9 (1920x1080) recommended

### Pre-submission checks

- Live URL reachable (HTTP HEAD returns 200)
- Package id verifies on chain (`sui client object <id>`)
- Logo is exactly 1280x1280
- All media images exactly 1920x1080
- Demo video plays without sign-in (YouTube unlisted is fine)
- All team members have deepsurge.xyz accounts
- Project name is not already taken by 3+ other projects (web search)

### Walk-through

For each form field, where to copy from:

```markdown
| Form field | Source file |
|---|---|
| Project name | docs/submission/deepsurge-form.md, line 1 |
| Logo | docs/submission/logo-1280.png |
| Description (short) | docs/submission/description-short.txt |
| Description (full) | docs/submission/description-full.txt |
| Track | docs/submission/deepsurge-form.md "Track" section |
| Deployment network | docs/submission/deepsurge-form.md "Network" |
| Package id | docs/submission/deepsurge-form.md "Package id" |
| GitHub | docs/submission/deepsurge-form.md "Links" |
| Website | docs/submission/deepsurge-form.md "Links" |
| Demo video | docs/submission/deepsurge-form.md "Links" |
| Media images | docs/submission/media-1.png … media-5.png |
| Team usernames | docs/submission/deepsurge-form.md "Team" |
```

### Common pitfalls

- Pasting unicode quotes from a chat app instead of plain ASCII: deepsurge form often does not accept curly quotes
- Logo with transparent background: some renderings show a checkerboard; use a solid background or test before submitting
- Demo video region-locked: judges from various regions; prefer YouTube unlisted over Vimeo region-restricted
- Media image dimensions slightly off: validators may reject; use exactly 1920x1080

### Post-submission

After submitting:

- Take a screenshot of the confirmation
- Post in Sui Overflow Telegram (https://go.sui.io/suioverflow2026-tg)
- Optional: tweet with sponsor mentions (template in `10-HACKATHON-SUBMISSION.md`)

### Skills that read this guide

`submit-to-sui-overflow` (primary), `pick-my-sui-track` (light reference).

## specs/phase-handoff.md

**Audience**: skill authors. Defines the structured markdown context files skills write to `.suiperpower/` in the user's project workspace.

**Length target**: 250-350 lines.

The contract pattern is adapted directly from `reference/solana-new-main/skills/data/specs/phase-handoff.md`. The shape is similar; the field names and example values are Sui-native.

### File locations

```
<project-root>/
  .suiperpower/
    idea-context.md           Written by Idea-phase skills
    build-context.md          Written by Build-phase skills
    deploy-context.md         Written by Ship-phase deploy skills
    submission-context.md     Written by submit-to-sui-overflow
    learnings.md              Written by /learn across sessions
```

### idea-context.md

Written by: `find-next-sui-idea`, `validate-idea`, `competitive-landscape`, `deepbook-research`, `walrus-research`, `validate-business-model`, `retention-loop`, `will-real-users-pay`.

Sections:

- **Chosen Idea** (required, written first by `find-next-sui-idea`)
  - Slug, name, one-liner, why-Sui, completed-at timestamp
- **Scores** (1-3 across founder fit, MVP speed, distribution clarity, market pull, revenue path)
- **MVP Checklist** (bulleted, the smallest version that delivers value)
- **Go-to-Market** (wedge, first ten users, distribution channel)
- **Validation** (optional, written by `validate-idea`)
  - Go/no-go, confidence, demand signals, risks, next steps
- **Landscape** (optional, written by `competitive-landscape`)
  - Crowdedness, moat type, differentiation, substitutes table
- **Business Model** (optional, written by `validate-business-model`)
  - Who pays, how much, why they keep paying, unit economics, smallest-plausible-business
- **Retention Loop** (optional, written by `retention-loop`)
  - Day 1, Day 2, Day 7, Day 30 anchors plus a single-paragraph loop description
- **Source Reports** (accumulating list of artifact filenames)

### build-context.md

Written by: `scaffold-project`, `build-with-claude`, `build-with-move`, `walrus-storage`, `deepbook-orderbook`, `scallop-money-market`, `sui-zk-login`, `sponsored-transactions`, `kiosk-marketplace`, `build-mobile-sui`, `launch-coin`, `review-move`.

Sections:

- **Stack** (required, written first by `scaffold-project`)
  - Template, architecture pattern, completed-at, skills installed, MCPs configured, repos cloned
- **Move Package** (per-module breakdown)
  - Module names, public functions, capabilities, dependencies (`Move.toml` summary)
- **Frontend** (if applicable)
  - Stack chosen (Next.js + dapp-kit, etc.), key routes, auth method (zkLogin / wallet adapter / both)
- **Sponsor Integrations** (each as its own subsection)
  - Walrus: blob types stored, retrieval flow, encryption posture
  - DeepBook: pool used, order types, settlement flow
  - Scallop: markets used, deposit/borrow/repay flow
  - OpenZeppelin Sui: modules used, where they replace hand-rolled patterns
  - OtterSec: pre-audit checklist status
- **Build Status** (table)
  - MVP complete, tests passing, devnet deployed, testnet deployed, mainnet deployed, package id (per network), deployment date, RPC provider
- **Milestones** (timestamped checklist)
- **Review** (optional, written by `review-move`)
  - Security score, quality score, ready-for-mainnet, findings table

### deploy-context.md

Written by: `deploy-to-testnet`, `deploy-to-mainnet`.

Sections:

- **Deploy** (one entry per deploy event, accumulating)
  - Network, package id, deployer address, upgrade capability id (or "burned"), deployed-at timestamp, build hash
- **Verification** (results of post-deploy checks)
  - On-chain object exists, build hash match, upgrade authority confirmed, frontend updated

### submission-context.md

Written by: `submit-to-sui-overflow`.

Sections:

- **Submission** (per-submission record, in case of multiple)
  - Submission timestamp, project name, primary track, secondary tags, network, package id, live URL, demo video URL
- **Assets** (file paths to logo / media / descriptions / scripts)
- **Preflight** (checklist results from `10-HACKATHON-SUBMISSION.md`)
- **Confirmation** (deepsurge confirmation screenshot path, Telegram post link, tweet link)

### learnings.md

Written by: `learn` skill across sessions.

Free-form, but encouraged shape:

- **What we tried** (terse bullets)
- **What worked** (one line each, with dates)
- **What did not work** (with rationale, so we do not retry)
- **Open questions** (rolling list)
- **Decisions** (one-liner each, with date)

### Field rules

- All sections are append-only when re-running a skill, except scalar fields (scores, statuses), which are overwritten with the latest value
- `Source Reports`, `Milestones`, `Findings`, and `Submission` records are accumulating lists; never replace
- Every skill that writes updates `Completed at` (or `Updated at` for the relevant section) with the current UTC timestamp
- Skills must not delete sections written by other skills; they extend or update

### Creating context files

Any skill can create a context file if it does not exist yet. The user may invoke skills in any order; they do not need to follow Learn → Idea → Build → Ship sequence. The first skill that needs context for a phase bootstraps the file.

When a skill needs a context file that does not exist:

1. Proceed immediately. Ask the user directly for the information.
2. Create the file with whatever context you gather. Use the format above. Fill what you know, leave other sections out.
3. Do NOT redirect the user to run other commands first.
4. Do NOT print dependency chains or warn about missing files.

### Merging rules

When a skill updates an existing context file:

1. Read the current file first.
2. Add new sections or update existing ones. Do not remove sections written by other skills.
3. Append to list fields. Overwrite scalar fields with the latest value.
4. Update the relevant timestamp.

### Why a flat markdown file and not JSON

- Markdown is human-readable; users can read their own context without tooling
- Skills compose easily by writing to specific sections
- Diff-friendly for git
- AI agents read markdown context naturally
- Versioning is just "add a new section if the schema evolves"; we never migrate JSON

The trade-off is that parsing markdown is fuzzier than parsing JSON. We accept this; skills do not parse machine-precisely, they read context to inform conversation.

## Update cadence

| Guide | Cadence |
|---|---|
| `rpc-wallet-guide.md` | Per Sui CLI major release; per major dapp-kit release |
| `deploy-runbook.md` | Per Sui CLI major release; cost numbers updated quarterly |
| `security-checklist.md` | Per OpenZeppelin Sui release; per OtterSec public-finding pattern release |
| `package-id-capture.md` | Rare; only if `sui client publish` JSON shape changes |
| `deepsurge-submission.md` | Per deepsurge.xyz form change; pre-Overflow 2026 frozen one week before judging |
| `phase-handoff.md` | Per skill format change (rare); per new context-file addition |

## Authoring checklist

When authoring a guide:

1. Mirror the section structure of the corresponding `reference/solana-new-main/skills/data/guides/` file where applicable
2. Replace Solana-specific commands with Sui-native equivalents
3. Replace Solana-ecosystem references (Helius, Phantom, Squads, Anchor) with Sui equivalents (Mysten, Slush, multisig services as they emerge, Move framework)
4. Pin against current Sui CLI / SDK versions, with a `Last updated` footer
5. Cross-check: every command runs cleanly in a fresh container with the stated tooling
6. Add the `## Skills that read this guide` section at the bottom

When authoring a phase-handoff change:

1. Update `phase-handoff.md` first
2. Update every skill that writes to the affected file
3. Update `21-TESTING-STRATEGY.md` if a new validation test is needed
4. Bump the spec version in the file's header
5. Add a changelog entry noting the breaking change (if any)

## Origin acknowledgment

The guide structure (P0-P3 priorities, copy-paste recipes, scoring rubric, environment-variable pattern) is adapted from `reference/solana-new-main/skills/data/guides/` by SendAI / Superteam. Solana-specific content is replaced with Sui-native equivalents. The phase-handoff contract pattern is adapted from `reference/solana-new-main/skills/data/specs/phase-handoff.md`. We restructured around Sui's deploy lifecycle (devnet/testnet/mainnet, package id capture as a distinct concern) and added a separate `submission-context.md` for hackathon-aware skills.

This is the kind of plan doc the build phase reads end-to-end before authoring the actual `skills/data/guides/` and `skills/data/specs/` content.
