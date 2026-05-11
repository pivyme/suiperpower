# MANUAL-TODO.md

Things AI cannot do well. Things that need a human (you or your team) to verify, register, write, contact, or judge. Distribute the rows by filling in `Owner`. Mark `Status` as `open`, `wip`, `done`, or `blocked`.

This file is the checklist you ship from. The plans in `plans/` describe what should exist. This file describes what a human still has to touch before launch.

## How to use this doc

- Pick a block. Each block is independently assignable.
- Each row has acceptance criteria. The row is `done` only when all criteria check out, not just "I looked at it."
- If a row turns up something that needs a project-wide decision, append to `plans/19-OPEN-QUESTIONS.md` and link the row.
- Effort hints: `S` = under 1 hour, `M` = 1 to 4 hours, `L` = a day or more.
- Date format: `YYYY-MM-DD`. Today is `2026-05-10`.

## Legend

| Symbol | Meaning |
|---|---|
| `open` | Not started |
| `wip` | In progress |
| `done` | Acceptance criteria met |
| `blocked` | Cannot proceed without external input (note who you are waiting on) |

---

## Block A. Owner-only (Kelvin)

These are personal-judgment or registration tasks. Cannot be delegated.

| # | Task | Acceptance criteria | Effort | Status |
|---|---|---|---|---|
| A1 | Reserve `github.com/<handle-or-org>/suiperpower` | Repo created, default branch `main`, MIT license file pushed | S | open |
| A2 | Reserve npm name `suiperpower` | `npm view suiperpower` returns the placeholder `0.0.0-reserved` you published | S | open |
| A3 | Register / confirm `suiperpower.dev` domain | DNS pointed to Vercel, SSL active, root and `www` both resolve | S | open |
| A4 | Reserve Twitter / X handle (`@suiperpower` or `@suiperpowerdev`) | Handle owned, bio set to one line + URL, no posts yet | S | open |
| A5 | Trademark conflict check on "Suiperpower" | USPTO search done, web search done, no clear conflicts logged in `plans/19` | S | open |
| A6 | Decide whether to ship `suiperpower-pass.sh` (`plans/19` row 17) | Decision recorded in `plans/19-OPEN-QUESTIONS.md` decided log | S | open |
| A7 | Pick the long-term Convex account owner | Free-tier Convex project created under that account, project URL noted in `cli/branding.ts` placeholder | S | open |
| A8 | Pick the long-term Vercel account owner | Project linked to GitHub repo, deploy preview working | S | open |
| A9 | Decide footer copy for "Built by ..." | Final line locked, written into `plans/14-WEBSITE-STRUCTURE.md` footer section | S | open |
| A10 | Approve Kelvin's quote on the landing | Final wording locked in `plans/14-WEBSITE-STRUCTURE.md` section 5 | S | done |
| A11 | Approve final tagline `Build something meaningful, on Sui` | Confirmed across CLAUDE.md, README, all plans on 2026-05-11 | S | done |
| A12 | Logo direction call | Either ship a wordmark-only logo or commission a mark, decision in `plans/19` row 31 | M | open |
| A13 | Privacy policy text | Real policy reflecting the Convex schema in `plans/13`, not boilerplate. Lawyer-reviewed if possible. | M | open |
| A14 | Collect team photos for the landing "Made by" section | Four photos: Kelvin Adithya, Febi Mettasari, Louis Arvin, Tengku Farhan. Same aspect ratio, consistent crop, consistent lighting. Saved to `public/team/<firstname>.jpg`. Confirm each person OK with photo + link going public. | S | open |
| A15 | Verify per-skill install via skills.sh after the repo is public | After the GitHub repo is live at `github.com/pivyme/suiperpower`, run `npx skills add pivyme/suiperpower/skills/build/build-with-move` on a fresh machine. Confirm SKILL.md, references/, and agents/openai.yaml all land under the active agent's skills dir, byte-identical to the curl-flow install. | S | open |
| A16 | Optional: PR `vercel-labs/skills` for skills.sh leaderboard discovery | Once the repo is public, open a discovery PR or issue against `github.com/vercel-labs/skills` referencing the canonical Suiperpower repo URL. skills.sh has no formal registration flow, this is best-effort placement. | S | open |

---

## Block B. Data harvesting (distributable)

Manual research, copy from official sources, judgment on what to include. AI can draft the schema but cannot reliably fill these without making things up.

| # | Task | Source | Output file | Acceptance criteria | Effort | Owner | Status |
|---|---|---|---|---|---|---|---|
| B1 | Past Sui Overflow winners catalog (analog of `reference/solana-new-main/skills/data/colosseum/hackathon-winners.md`) | overflow.sui.io results pages, Sui Foundation blog recaps, Twitter recaps from sponsors | `skills/data/sui-overflow/past-winners.md` | One entry per winner, format: `## <project name>`, then `Year`, `Track`, `One-line pitch`, `What they built`, `Where they are now (optional)`, `Source URL`. Cover Overflow 2024 and 2025 at minimum. | L | | open |
| B2 | Sui Overflow 2026 official rules + judging criteria | participant handbook (`go.sui.io/overflow26-participant-handbook`), Overflow site | `skills/data/sui-overflow/2026-rules.md` | Verbatim quotes for prize structure, eligibility, judging criteria, timeline, with source URLs and pull date noted at the top | M | | open |
| B3 | Sui Overflow 2026 exact submission deadline | Same as B2 | Updated row in `plans/19` | Date + timezone confirmed, propagated to `plans/17-LAUNCH-PLAN.md` | S | | open |
| B4 | Verify deepsurge.xyz submission form field labels | Fill out a sample submission, do NOT submit | `skills/data/sui-overflow/deepsurge-form.md` | Every field label, char limit, and required/optional flag captured. Screenshots optional but helpful. | M | | open |
| B5 | YC most-recent crypto RFS list | ycombinator.com/rfs | `skills/data/ideas/yc-rfs-crypto.json` | JSON entries with `id`, `title`, `summary`, `why-fit-for-Sui`, `recommended-track`, `source-url`, `pull-date` | M | | open |
| B6 | a16z State of Crypto 2026 (or 2025 if 2026 not yet out) | a16zcrypto.com | `skills/data/ideas/a16z-state-of-crypto-2026.json` | Same schema as B5. Note in header which year and pull date. | M | | open |
| B7 | a16z big ideas 2026 list (if published) | a16zcrypto.com | `skills/data/ideas/a16z-big-ideas-2026.json` | Same schema. If 2026 not out, log in `plans/19` and skip. | S | | open |
| B8 | Alliance ideas list (Sui-relevant subset) | alliance.xyz / their public reports | `skills/data/ideas/alliance-ideas.json` | Same schema. Include `relevance-rationale` per row. | M | | open |
| B9 | Yash 2024 / 2025 DeFi ideas, Sui-tagged | (if reachable) original source | `skills/data/ideas/yash-defi-2025-ideas.json` | Same schema. If access uncertain, log and drop. | S | | open |
| B10 | Curated Sui-native gap ideas (our differentiator) | Your own thinking, conversations with Sui devs | `skills/data/ideas/sui-native-gaps.json` | At least 30 entries, each with rationale why this is Sui-only or Sui-better-than | L | | open |
| B11 | DeepBook market activity snapshot for `deepbook-research` | DeepBook UI / docs / dashboards | `skills/data/sponsor-docs/deepbook-market-snapshot.md` | Top markets, rough daily volume range, asset coverage, with pull-date. Snapshot disclaimer at the top. | M | | open |
| B12 | Walrus production deployment examples | Walrus docs / Walrus.site / case studies | `skills/data/sponsor-docs/walrus-real-uses.md` | At least 5 real apps using Walrus, what they store, why Walrus over alternatives | M | | open |
| B13 | Scallop university award structure | Scallop docs / Scallop team via Discord | `skills/data/sponsor-docs/scallop-university-award.md` | Eligibility, prize amount, judging criteria, application path | S | | open |
| B14 | OtterSec Sui audit examples (public) | ottersec.io reports archive | `skills/data/sponsor-docs/ottersec-public-audits.md` | At least 3 public Sui audit reports referenced with the kind of issues they flag | M | | open |
| B15 | OpenZeppelin Sui libraries: confirm public release status, repo location, version | OpenZeppelin docs / GitHub | `skills/data/sponsor-docs/openzeppelin-sui-status.md` | Current version, install command, what is in scope, what is not | S | | open |
| B16 | Sui-side MCP server inventory | mcp.so / Sui Discord / GitHub topic search | `cli/data/mcps.json` | At least 8 entries, each verified to install and connect on Claude Code today | M | | open |
| B17 | Ecosystem repos catalog seed (40-60 entries) | Sui ecosystem map, awesome-sui lists, GitHub topic `sui` | `cli/data/repos.json` | Each row has owner, repo, license verified, last-commit date noted, one-line description from the repo's own README | L | | open |

---

## Block C. Sponsor verification (one row per sponsor, distributable)

Each row needs a real human at that sponsor confirming our docs are accurate. This is what protects us from publishing wrong API patterns or wrong contact info.

For each sponsor: read our `sponsor-docs/<name>.md`, send to their team, request review, log feedback.

| # | Sponsor | Doc to review | Contact channel | Acceptance criteria | Owner | Status |
|---|---|---|---|---|---|---|
| C1 | Walrus | `skills/data/sui-knowledge/sponsor-docs/walrus.md` | Sui Discord #walrus, Walrus Discord, Mysten Labs DevRel | Walrus team member explicitly approved or returned edits, all edits applied | | open |
| C2 | DeepBook | `skills/data/sui-knowledge/sponsor-docs/deepbook.md` | Sui Discord #deepbook, Mysten Labs DevRel | Same | | open |
| C3 | OpenZeppelin (Sui) | `skills/data/sui-knowledge/sponsor-docs/openzeppelin-sui.md` | OZ devrel email / OZ Sui repo issue | Same | | open |
| C4 | OtterSec | `skills/data/sui-knowledge/sponsor-docs/ottersec-checklist.md` | OtterSec contact form / Twitter DM | Same | | open |
| C5 | Scallop | `skills/data/sui-knowledge/sponsor-docs/scallop.md` | Scallop Discord / team email | Same | | open |
| C6 | Mysten Labs (general) | `README.md` and `plans/15-BRAND.md` "Sui Foundation alignment guardrails" | Mysten Labs DevRel | Mysten reviewer confirms we are not implying endorsement | | open |

---

## Block D. Skill-by-skill review (distributable)

The largest block. One row per skill. The reviewer's job is to make sure nothing in the SKILL.md, its `references/`, or its trigger phrases is misinformation, broken links, or wrong API shapes.

**Reviewer instructions** (read once before starting any row):

1. Read the SKILL.md end-to-end.
2. For every external URL: click it. If it 404s, redirects to a marketing page, or content has changed, log it.
3. For every code snippet: verify against the official docs of the tool / SDK / sponsor it references. Note version mismatches.
4. For every claim about Sui or Move behavior: cross-check against `docs.sui.io` or the Sui repo at the current main branch.
5. Run the trigger phrases in Claude Code, Codex, AND Cursor. Confirm the right skill activates. If not, log it.
6. Write feedback as inline comments in the SKILL.md or as a row append at the bottom of this file.

**Acceptance criteria for every row in this block**:

- [ ] All URLs resolve to the right content.
- [ ] All claims match docs.sui.io / sponsor docs at review date.
- [ ] All code snippets compile or at minimum match current SDK shape.
- [ ] Trigger phrases activate the skill in all three agents.
- [ ] No misinformation, no marketing-speak.
- [ ] Anti-slop gate (if a build skill) actually has teeth, not a checkbox.

### D1. Learn skills

| # | Skill | Sui-specific accuracy focus | Owner | Status |
|---|---|---|---|---|
| D1.1 | `sui-beginner` | Object model explanation, Sui vs Solana / EVM mental-model deltas, current testnet faucet URL | | open |
| D1.2 | `learn` | Persistence path conventions, no Sui-specific facts to verify | | open |

### D2. Idea skills

| # | Skill | Sui-specific accuracy focus | Owner | Status |
|---|---|---|---|---|
| D2.1 | `find-next-sui-idea` | Idea corpus references resolve, Sui-fit rationale isn't generic | | open |
| D2.2 | `validate-idea` | No Sui-specific data, but check generic claims hold up | | open |
| D2.3 | `competitive-landscape` | Sui ecosystem-map references current, no dead projects framed as live | | open |
| D2.4 | `deepbook-research` | DeepBook docs URL, market data interpretation accuracy, current asset list | | open |
| D2.5 | `walrus-research` | Walrus docs URL, real production examples, encryption story accuracy | | open |
| D2.6 | `overflow-copilot` | Past-winner data file (B1) actually exists and is current, no fabricated winners | | open |

### D3. Build skills

| # | Skill | Sui-specific accuracy focus | Owner | Status |
|---|---|---|---|---|
| D3.1 | `scaffold-project` | `sui` CLI install instructions current, recommended Move toolchain version pinned correctly | | open |
| D3.2 | `build-with-claude` | No Sui-specific facts, but check workflow handoff to other skills works | | open |
| D3.3 | `virtual-sui-incubator` | Deep Sui internals: PTB execution model, validator set, consensus, gas pricing, all current | | open |
| D3.4 | `build-with-move` | Move syntax current to latest stable, no Aptos Move drift, examples compile against latest `sui move build` | | open |
| D3.5 | `ptb-composer` | TS SDK shape current (`@mysten/sui` not the deprecated `@mysten/sui.js`), gas estimation API current | | open |
| D3.6 | `object-model-design` | Owned vs shared semantics, transfer rules, capability pattern examples match current best practice | | open |
| D3.7 | `walrus-storage` | Walrus SDK install, blob upload + retrieval flow, retention model, pricing notes | | open |
| D3.8 | `deepbook-orderbook` | DeepBook v3 SDK shape (or current version), market creation flow, fee tiers | | open |
| D3.9 | `scallop-money-market` | Scallop SDK install, lending / borrowing flow, current asset list, oracle setup | | open |
| D3.10 | `sui-zk-login` | zkLogin provider list current, salt server requirement, ephemeral key flow | | open |
| D3.11 | `sponsored-transactions` | Sponsor signing flow, fee payer rules, current SDK helpers | | open |
| D3.12 | `kiosk-marketplace` | Kiosk module reference current, transfer policy, royalty enforcement story | | open |
| D3.13 | `build-mobile-sui` | Sui Mobile SDK status (iOS / Android), wallet adapter currency, deep link standard | | open |
| D3.14 | `launch-coin` | Coin standard (the new one if applicable), TreasuryCap discipline, anti-rug patterns | | open |
| D3.15 | `debug-move` | Common error catalog accurate against current `sui move build` output | | open |
| D3.16 | `review-move` | Code-review checklist matches Sui security best practice, links to OtterSec public reports | | open |
| D3.17 | `ottersec-prep` | Audit-prep checklist sourced from OtterSec actual asks, not invented | | open |
| D3.18 | `openzeppelin-sui-libs` | Current OZ Sui repo + version, install command, scope notes accurate | | open |
| D3.19 | `brand-design` | Generic, no Sui-specific to verify, but check no marketing-speak crept in | | open |
| D3.20 | `frontend-design-guidelines` | Sui token / address / package-id formatting helpers correct | | open |
| D3.21 | `number-formatting` | SUI decimal handling (9), USDC decimal handling (6), no off-by-one errors in examples | | open |
| D3.22 | `page-load-animations` | Generic, no Sui-specific | | open |
| D3.23 | `design-taste` | Generic, no Sui-specific | | open |
| D3.24 | `product-review` | Generic, no Sui-specific | | open |
| D3.25 | `roast-my-product` | Voice check, no marketing-speak | | open |
| D3.26 | `validate-business-model` | No Sui-specific, but check the questions force real answers | | open |
| D3.27 | `retention-loop` | Same | | open |
| D3.28 | `will-real-users-pay` | Pricing-experiment ideas grounded in reality | | open |
| D3.29 | `navigate-skills` | Skill list matches current catalog, no skills referenced that do not exist | | open |

### D4. Ship skills

| # | Skill | Sui-specific accuracy focus | Owner | Status |
|---|---|---|---|---|
| D4.1 | `deploy-to-testnet` | `sui client publish` flags current, faucet URL, gas notes | | open |
| D4.2 | `deploy-to-mainnet` | Production publish checklist, irreversibility warnings explicit, package upgrade story | | open |
| D4.3 | `pick-my-sui-track` | Track list matches the actual Overflow 2026 tracks, refusal logic works on a fake "we used Walrus only for the logo" example | | open |
| D4.4 | `submit-to-sui-overflow` | deepsurge.xyz form fields match B4, package-id capture works, media dimension specs match current Overflow rules | | open |
| D4.5 | `create-pitch-deck` | No Sui-specific, but check the structure matches what Sui-aware investors actually want | | open |
| D4.6 | `marketing-video` | Generic | | open |
| D4.7 | `video-craft` | Generic | | open |
| D4.8 | `apply-grant` | Sui Foundation grant URL + form current, eligibility accurate | | open |

### D5. Grow skills (v1.1)

| # | Skill | Sui-specific accuracy focus | Owner | Status |
|---|---|---|---|---|
| D5.1 | `analytics-baseline` | No Sui-specific, recommend privacy-friendly tools | | open |
| D5.2 | `retention-instrumentation` | Generic | | open |
| D5.3 | `partnership-outreach` | Sui ecosystem contact list current, not stale | | open |
| D5.4 | `community-launch` | Sui Discord channel routing current, X / Twitter Sui community handles current | | open |

---

## Block E. Knowledge base accuracy (distributable)

Each `skills/data/sui-knowledge/*.md` doc needs one human pass. Check every URL, every claim about Sui mainnet behavior, every code example.

| # | Doc | Focus | Owner | Status |
|---|---|---|---|---|
| E1 | `01-what-and-why-sui.md` | Origin story accuracy, value props match what Mysten + Sui Foundation publicly claim, no exaggeration | | open |
| E2 | `02-what-makes-sui-unique.md` | PTBs, parallel execution, object model, all current | | open |
| E3 | `03-move-and-objects.md` | Move syntax current, object semantics current | | open |
| E4 | `04-protocols-and-sdks.md` | SDK list current (TS SDK package name, dApp-kit, mobile SDK status) | | open |
| E5 | `05-app-layer.md` | Wallets list current (Sui Wallet, Phantom-on-Sui, Slush, etc), zkLogin providers current | | open |
| E6 | `06-opensource-research.md` | Repo links current, none archived without note | | open |
| E7 | `cookbook-index.md` | Every cookbook link resolves to a working recipe | | open |
| E8 | `sponsor-docs/walrus.md` | (also covered by C1 sponsor review) | | open |
| E9 | `sponsor-docs/deepbook.md` | (also covered by C2) | | open |
| E10 | `sponsor-docs/scallop.md` | (also covered by C5) | | open |
| E11 | `sponsor-docs/openzeppelin-sui.md` | (also covered by C3) | | open |
| E12 | `sponsor-docs/ottersec-checklist.md` | (also covered by C4) | | open |

---

## Block F. Catalog accuracy (distributable)

Each row in `cli/data/*.json` needs a click-through. AI cannot reliably verify a repo is actively maintained or a license is what it claims.

| # | Catalog | What to verify | Owner | Status |
|---|---|---|---|---|
| F1 | `cli/data/repos.json` | Each repo: URL resolves, license matches, last-commit within 12 months OR explicitly marked archived in our entry, description not marketing fluff | | open |
| F2 | `cli/data/mcps.json` | Each MCP: install command works, server connects in Claude Code, basic tool call succeeds | | open |
| F3 | `cli/data/skills.json` (ecosystem skills, not our journey skills) | Each entry installs cleanly, no broken links, attribution to original author present | | open |
| F4 | `cli/data/ideas/*.json` | Spot-check 20% of entries: source URL resolves, summary matches source, no AI hallucinations | | open |

---

## Block G. Multi-agent install testing (distributable)

Run the full install + first-skill flow on a clean machine, three agents, three OSes. AI cannot do this for us. We need human-confirmed end-to-end smoke results.

| # | OS | Agent | Acceptance criteria | Owner | Status |
|---|---|---|---|---|---|
| G1 | macOS (Apple Silicon) | Claude Code | curl install completes, `~/.claude/skills/<some-skill>/SKILL.md` present, trigger phrase activates skill, output is sane | | open |
| G2 | macOS (Apple Silicon) | Codex | Equivalent in `~/.codex/skills/` | | open |
| G3 | macOS (Apple Silicon) | Cursor | `.mdc` files present in `~/.cursor/rules/`, rules trigger in Cursor agent mode | | open |
| G4 | macOS (Intel) | Claude Code | Same as G1 | | open |
| G5 | Linux (Ubuntu 22.04) | Claude Code | Same as G1 | | open |
| G6 | Linux (Ubuntu 22.04) | Codex | Same as G2 | | open |
| G7 | Windows (WSL2 Ubuntu) | Claude Code | Same as G1, document any WSL-specific gotchas | | open |
| G8 | Fresh Node 20 | All three | Confirm Node 20 is genuinely the floor, not silently requiring a higher minor | | open |
| G9 | Fresh Node 22 (current LTS) | All three | Same | | open |

---

## Block H. Final pre-launch human checks

| # | Task | Acceptance criteria | Owner | Status |
|---|---|---|---|---|
| H1 | Read every page of suiperpower.dev | No typos, no em-dashes, no marketing-speak, voice consistent across sections | | open |
| H2 | Read README, CONTRIBUTING, AGENTS, CLAUDE.md as a fresh visitor | A new contributor can go from zero to first PR using only these files | | open |
| H3 | Run `suiperpower doctor` on a clean machine | All checks pass, error messages are actionable | | open |
| H4 | Test `suiperpower init --vendor` in a fresh repo | Skills land in the repo, gitignore handled, teammates cloning the vendor repo can use the skills without re-installing | | open |
| H5 | Test `suiperpower update` after a fake catalog change | Catalog updates, skills do not | | open |
| H6 | Test `suiperpower uninstall` | Only Suiperpower-written files removed, user's other skills untouched | | open |
| H7 | Verify `setup.sh` is served with `Content-Type: text/x-shellscript` and short cache | curl to the URL returns the script, headers correct | | open |
| H8 | Verify `og-image.png` renders correctly on Twitter / X, Telegram, Slack | Manual share test, image visible at expected aspect ratio | | open |
| H9 | Verify telemetry path: install with `anonymous`, do one skill, check Convex received the event | One row in Convex `skill_runs` table with no PII, opt-out toggle flips correctly | | open |
| H10 | Read `plans/12-ANTI-SLOP-FRAMEWORK.md` aloud against a real existing Sui hackathon submission of your choice | If the submission would not pass our gate, we know our gate has teeth. If it would pass and you think it should not, the gate is broken. | | open |
| H11 | Lawyer / advisor review of `LICENSE`, privacy policy text, "not affiliated with Sui Foundation" disclaimers | Sign-off recorded | | open |
| H12 | Backup: confirm all work is in the GitHub repo, not just on Kelvin's laptop | Repo `main` reflects intended launch state | | open |

---

## Block I. Reference-folder adaptation (one-shot)

Things to port from `reference/solana-new-main/` to Sui equivalents. Per memory: OK to adapt patterns for non-Solana content, rephrase, credit. Never copy Solana-specific content.

| # | Source in reference/ | Sui equivalent target | Notes | Owner | Status |
|---|---|---|---|---|---|
| I1 | `skills/data/colosseum/hackathon-winners.md` | `skills/data/sui-overflow/past-winners.md` | Drives `overflow-copilot` skill. See B1. | | open |
| I2 | `skills/data/guides/rpc-wallet-guide.md` | `skills/data/guides/rpc-wallet-guide.md` (Sui-native) | Per `plans/30-SHARED-GUIDES-SPEC.md`. RPC providers, wallet adapter patterns. | | open |
| I3 | `skills/data/guides/deploy-runbook.md` | `skills/data/guides/deploy-runbook.md` (Sui-native) | Per `plans/30`. Sui testnet + mainnet specifics. | | open |
| I4 | `skills/data/guides/security-checklist.md` | `skills/data/guides/security-checklist.md` (Sui-native) | Per `plans/30`. Move + capability + object specifics. | | open |
| I5 | `skills/data/specs/phase-handoff.md` | `skills/data/specs/phase-handoff.md` | Per `plans/30`. Spec is largely chain-agnostic, just rephrase + credit. | | open |
| I6 | `skills/data/defi/defillama-api.json` | `skills/data/defi/deepbook-api.json` (or similar Sui-native) | Per memory: defillama → deepbook is an explicit OK adaptation. | | open |
| I7 | `skills/data/copilot-api.json` | `skills/data/copilot-api.json` | Schema-level reuse, Sui-side data. | | open |

---

## Append-only log: surprises / discoveries

When you (a reviewer) find something that should be a durable rule, append a row here and follow up with a `plans/19` decided entry.

| Date | Reviewer | Discovery | Action taken |
|---|---|---|---|
| | | | |

---

## What is intentionally NOT in this file

- Implementation tasks (those are tracked in `TODO.md` and bigdev / build phase artifacts).
- Refactor / cleanup tasks.
- Anything an AI agent can do reliably without human verification.

If you find yourself adding a row that an AI could finish in a single tool-call, it does not belong here. Put it in `TODO.md` and let the agent handle it.
