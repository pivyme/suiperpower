# 24. Sui Overflow 2026 playbook

## Audience

Sui Overflow 2026 participants. The doc that ships at `suiperpower.dev/overflow` is rendered from this source.

This is the only doc in `plans/` written in user voice (second-person, addressed to a participant), because it is consumed as user-facing content. Tone is direct, not condescending, no marketing fluff.

## TL;DR

You are competing in a hackathon that explicitly weights polish, real-world application, and long-term value. Most submissions will be slop. Suiperpower exists so yours is not.

```
curl -fsSL https://suiperpower.dev/setup.sh | bash
```

Then:

```
claude "/find-next-sui-idea what should I build for Sui Overflow?"
claude "/scaffold-project"
claude "/build-with-claude"
claude "/deploy-to-testnet"
claude "/submit-to-sui-overflow"
```

That is the whole journey. The skills in between handle anti-slop validation, sponsor integration, demo video script, deepsurge.xyz form prep, and day-of preflight.

## What Sui Overflow 2026 actually rewards

The Sui team's 2026 message is unambiguous. Two things they said, in their words:

> Teams that dedicate more time toward refining usability, functionality, and long-term value will generally be more competitive than teams spreading their efforts across multiple submissions.

> Judging criteria place much stronger emphasis on product quality, real-world application, technical execution, and overall polish.

What this means in practice:

- One or two strong submissions beat five weak ones.
- A working, polished demo beats a clever demo that only works on the demo machine.
- A clear business model beats novelty for novelty's sake.
- Sponsors weighing tracks want to see real integration, not import-and-forget.

Suiperpower is built around this bar. Every build skill includes a "will this survive past the hackathon" gate. The submission generator refuses to ship a submission against placeholder content.

## Pre-hackathon (T-minus weeks)

### Step 1, install

```bash
curl -fsSL https://suiperpower.dev/setup.sh | bash
```

What it does:

- Installs the `suiperpower` CLI globally
- Writes ~30 skills to `~/.claude/skills/`, `~/.codex/skills/`, and `~/.cursor/rules/` (whichever agents you have)
- Asks once whether you want to send anonymous telemetry; default is anonymous, you can pick off
- Runs a doctor check; warns if anything is missing, never blocks

Requires Node 20+ and git. Sui CLI is a soft requirement (warned, not blocking).

### Step 2, pick what to build

```bash
claude "/find-next-sui-idea what should I build for Sui Overflow 2026?"
```

The skill interviews you (background, available time, team size, interests) and recommends from a corpus of 150+ ideas tagged for Sui specifically. Sources include:

- a16z State of Crypto 2026 (re-tagged for Sui)
- YC Requests for Startups (re-tagged for Sui)
- Sui-native gaps (curated by us, ideas that only make sense because of Sui's primitives)
- Past Sui Overflow patterns (what won, what is still open whitespace)

The skill writes `.suiperpower/idea-context.md` with the idea you picked.

### Step 3, validate before you build

```bash
claude "/validate-idea"
```

Reads your idea-context, runs a structured validation sprint:

- Who are the users? Have you talked to any?
- What is the smallest version of the product that delivers value?
- What is the retention loop?
- What is the business model?
- Who are the competitors? Why does Sui make this better?

If you cannot answer these, the skill flags it and refuses to claim the idea is validated. This is the first anti-slop checkpoint.

Optional next pass:

```bash
claude "/competitive-landscape"
claude "/will-real-users-pay"
claude "/validate-business-model"
claude "/retention-loop"
```

Each of these is also writeable to `.suiperpower/idea-context.md`. They are not gates, they are tools you reach for as needed.

## During the hackathon (T-0 through submission deadline)

### Step 4, scaffold

```bash
claude "/scaffold-project"
```

Reads idea-context, asks you a few clarifying questions, generates:

- Project directory structure (Move package + frontend if applicable)
- Move.toml with current Mysten dependencies pinned
- Recommended ecosystem repos to clone (DeepBook example if your idea uses orderbooks, Walrus example if your idea stores blobs, etc.)
- A README scaffolding the README the judges will read

Writes `.suiperpower/build-context.md`.

### Step 5, build

You have multiple options depending on what you are building.

**For the bulk of the work**:

```bash
claude "/build-with-claude"
```

Generic build pairing. Walks you through implementation step by step.

**For Move code**:

```bash
claude "/build-with-move"
```

Move-specific. Object model design, capability handling, tests for public entry points (yes, tests are mandatory; the skill refuses to declare done without them).

**For sponsor integrations**:

```bash
claude "/walrus-storage"
claude "/deepbook-orderbook"
claude "/scallop-money-market"
claude "/sui-zk-login"
claude "/sponsored-transactions"
claude "/kiosk-marketplace"
claude "/openzeppelin-sui-libs"
```

Each of these has a quality gate that demands the integration is load-bearing on your demo, not a marketing import.

**For frontend / design**:

```bash
claude "/frontend-design-guidelines"
claude "/brand-design"
claude "/design-taste"
```

### Step 6, anti-slop pass (do this in week 2)

Before you start polishing, get harsh feedback.

```bash
claude "/roast-my-product"
```

Plays "harshest investor in the room." Lists every weakness. Pick the top 3 to fix.

```bash
claude "/product-review"
```

Balanced UX review. Roadmap of fixes by impact / effort.

```bash
claude "/review-move"
```

Code-quality review for Move. Public function safety, capability handling, OZ usage where applicable.

These are the muscles that separate a polished submission from a generic one.

## Submission (T-minus days to deadline)

### Step 7, deploy

```bash
claude "/deploy-to-testnet"
```

Walks the testnet deploy. Captures the package id from `sui client publish` output, verifies it on chain, writes it to `.suiperpower/deploy-context.md`.

If you are going to mainnet:

```bash
claude "/deploy-to-mainnet"
```

This skill refuses to run unless you have `validate-business-model`, `retention-loop`, and `review-move` outputs in `.suiperpower/`. It is intentionally hard to skip.

### Step 8, pick your track

```bash
claude "/pick-my-sui-track"
```

Reads your project's source files, looks for sponsor package imports (`walrus::`, `deepbook::`, `scallop::`, `openzeppelin_sui::`), grades integration depth on a 0-3 scale, and recommends a primary track.

If you imported Walrus but never call it, the skill refuses to recommend the Walrus track. This protects you from sponsor cosplay (claiming a track for a sponsor whose tech you do not actually use).

Tracks for 2026:

- Walrus (headline)
- DeepBook (track sponsor)
- OpenZeppelin (prize sponsor)
- OtterSec (prize sponsor)
- Scallop (university award)
- General tracks (DeFi, gaming, infra, social, AI, RWA)

### Step 9, generate the submission package

```bash
claude "/submit-to-sui-overflow"
```

Reads your build-context, deploy-context, and idea-context. Produces `docs/submission/`:

- `logo-1280.png` (validates 1280x1280 exact)
- `media-1.png` through `media-5.png` (1920x1080 each)
- `description-tagline.txt` (1 line)
- `description-short.txt` (300 chars)
- `description-full.txt` (1000 chars)
- `demo-script.md` (60-90 second video script, scene by scene)
- `deepsurge-form.md` (every form field with the value to paste)
- `preflight-checklist.md` (day-of, see below)

The skill refuses to generate this package if:

- The live URL is not reachable
- The package id does not verify on chain
- Logo is not exactly 1280x1280
- No screenshots exist or none are 1920x1080
- The demo video script would describe things the live URL cannot do

This is intentional. Slop submissions slip past every filter except a hard one.

### Step 10, day-of preflight

Run the preflight checklist within 6 hours of the submission deadline:

- Open the live URL in incognito. Does the load-bearing flow work?
- Re-verify the package id with `sui client object <id>`.
- Confirm all team members have registered on deepsurge.xyz.
- Logo is 1280x1280, no transparency artifacts.
- At least 3 media images uploaded, all 1920x1080.
- Demo video plays without sign-in (YouTube unlisted is fine).
- Track selection makes sense given actual integration depth.

Then go to:

```
https://www.deepsurge.xyz/hackathons/b587dc0c-4cb8-4e63-ada5-519df38103bf
```

Paste each field from `docs/submission/deepsurge-form.md`.

Submit.

Take a screenshot of the confirmation.

Post in Sui Overflow Telegram so the team and community see you shipped: https://go.sui.io/suioverflow2026-tg

## After submission

You are not done. The judges look at a few things post-submission:

- Last commit recency (if your last commit is a week before submission, it looks abandoned)
- Issue / PR activity (if you respond to feedback, that is signal)
- Community response (if anyone outside your team uses it, that is gold)

Post a launch tweet. Tag the sponsors whose tracks you targeted. Drop the live URL.

If you placed, consider:

```bash
claude "/apply-grant"
```

For applying to Sui Foundation grants, sponsor follow-up grants, or accelerator programs.

Your project does not end with the hackathon submission. Suiperpower's whole point is to bias your work toward something that lasts.

## Common mistakes to avoid

Pulled from past Solana hackathons (the patterns are universal). Suiperpower's anti-slop framework targets each.

| Mistake | What it looks like | What to do instead |
|---|---|---|
| Demo theater | Demo video shows a feature the live URL does not have | Fix the live URL or fix the script |
| Generic name | "DeFiHub", "SuiSwap", "ChainPilot" | Pick a name that searchably is yours |
| Sponsor cosplay | `walrus::` in `Move.toml` but no calls | Make the integration load-bearing or pick a different track |
| No README | Repo with no README or one that does not match the product | Use the scaffolded README, fill in real content |
| Last-minute deploy | Deploy 30 minutes before deadline, no time to test | Deploy to testnet on day 1, deploy to mainnet day before deadline |
| Lorem ipsum | "TODO", "<placeholder>", stock images | Replace with real copy and real screenshots |
| One-machine-only | Demo only works on the demo computer | Test on a fresh device before submitting |
| Spreading across submissions | 5 half-built submissions instead of 1 strong one | Pick one. Sui team explicitly said this. |

## How sponsors are surfaced

Suiperpower has first-class skills for the 2026 sponsors:

- **Walrus** (headline partner): `/walrus-storage`, `/walrus-research`, knowledge doc at `sponsor-docs/walrus.md`
- **DeepBook** (track sponsor): `/deepbook-orderbook`, `/deepbook-research`, knowledge doc
- **OpenZeppelin** (prize sponsor): `/openzeppelin-sui-libs`, knowledge doc
- **OtterSec** (prize sponsor): `/ottersec-prep`, audit-prep checklist
- **Scallop** (university award sponsor): `/scallop-money-market`, knowledge doc

Skills are bias-free at the catalog level: non-sponsor alternatives (Cetus, Aftermath, NAVI, etc.) are also surfaced when they fit better. The sponsor's tech is first-class when it actually fits, not by mandate.

## Resources

| Resource | URL |
|---|---|
| Sui Overflow 2026 hackathon | https://overflow.sui.io |
| Submission portal (deepsurge.xyz) | https://www.deepsurge.xyz/hackathons/b587dc0c-4cb8-4e63-ada5-519df38103bf |
| Participant handbook | https://go.sui.io/overflow26-participant-handbook |
| Sui Overflow Telegram | https://go.sui.io/suioverflow2026-tg |
| Sui official docs | https://docs.sui.io |
| Suiperpower install | https://suiperpower.dev/setup.sh |
| Suiperpower source | https://github.com/&lt;your-handle&gt;/suiperpower |

## Frequently asked

**Do I have to use Suiperpower to participate in Overflow?**
No. Overflow is run by the Sui Foundation, Suiperpower is independent and free. Suiperpower exists to make participation easier and your submission better.

**Does Suiperpower work without Claude Code?**
Yes. Codex and Cursor are first-class. The same skills install to all three.

**What if I do not want telemetry?**
Set `telemetryTier: "off"` in `~/.suiperpower/config.json`. The CLI never sends a network event. Skills still work fully offline.

**What if my idea is not in the corpus?**
The corpus is a starting point, not a hard wall. `find-next-sui-idea` will recommend from the corpus by default but accepts custom ideas if you have one. The skill walks you through validating it.

**Can I use Suiperpower for non-Sui projects?**
Suiperpower is Sui-specific by design. The Move skills, sponsor integrations, and ecosystem catalog are all Sui-native. For Solana, see solana-new (the inspiration). For EVM, there are equivalents emerging.

**What if a sponsor's SDK changes during the hackathon?**
Sponsor docs are version-pinned and have a `Last updated:` date. If we know about a breaking change, we ship a patch within 48 hours. If you find one we missed, open an issue or DM the maintainer.

**Is this an officially endorsed Sui Foundation tool?**
No. Suiperpower is independent, MIT-licensed, no Sui Foundation endorsement. We link to docs.sui.io and overflow.sui.io as authoritative; we are a community asset.

**How do I report a bug or suggest a skill?**
GitHub Issues at the repo URL above.

**How do I contribute?**
See `CONTRIBUTING.md` in the repo. Most common contributions are catalog rows (under 5 minutes) and new skills (under 90 minutes for an experienced author).

## What success looks like for you

By the time you submit:

- A live URL that handles the golden path end to end on a fresh browser
- A README in your repo that an investor could read in 90 seconds
- A demo video that shows real product behavior, not staged theater
- A clear answer to "who pays, why, how often"
- A package id verifiable on chain
- A sponsor track that actually fits what you built

That is the bar. Suiperpower's job is to make hitting it the path of least resistance.

Build something you would be proud to have your name on. Sui Overflow 2026 is a launch occasion, not a destination. The product you ship here is the product you might still be running in 2027.

Build something meaningful, on Sui
