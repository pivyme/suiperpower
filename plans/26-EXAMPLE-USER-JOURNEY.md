# 26. Example user journey

## Why this doc exists

Plans describe the system. This doc describes what happens to a person using it. A worked walkthrough makes the abstractions concrete for:

- New contributors who want to understand what they are building
- Marketing copy and the website
- Sponsors deciding whether to surface us in their channels
- Skill authors who want to know what their skill feels like in context

The walkthrough is fictional but plausible. The skills, prompts, outputs, and gates exist as designed in the rest of the plans.

## The fictional builder

**Sora Tanaka** is a 27-year-old engineer in Tokyo. Three years of Solidity, six months of Solana. Heard about Sui Overflow 2026 last week. Wants to ship one strong submission, not five weak ones. Has heard of Walrus and DeepBook but never used either. Five weeks before the submission deadline.

Sora has Claude Code installed and likes terminal-driven workflows.

## Day 1, install (15 minutes)

Sora opens a terminal:

```bash
curl -fsSL https://suiperpower.dev/setup.sh | bash
```

Output:

```
suiperpower
Build something meaningful, on Sui

  ✓ Node.js v20.11.0
  ✓ git installed
  → Installing suiperpower CLI...
  ✓ npm install -g suiperpower (v0.3.0) complete
  → Detecting agents...
  ✓ Claude Code 1.2.4 detected
  ⚠ Codex not installed; skills still written to ~/.codex/skills/
  ⚠ Cursor not installed; skills still written to ~/.cursor/rules/
  → Writing skills...
  ✓ ~/.claude/skills/  32 skills
  ✓ ~/.codex/skills/   32 skills (Codex install pending)
  ✓ ~/.cursor/rules/   32 .mdc rules

Help suiperpower get better. We send anonymous skill usage stats.
Pick one:
  A) Sure, anonymous (default)
  B) No thanks
> A

  ✓ Telemetry: anonymous

  ✓ Install complete in 47 seconds.

Try:
  claude "/find-next-sui-idea what should I build for Sui Overflow?"
  claude "/scaffold-project"
  claude "/submit-to-sui-overflow"

Docs: https://suiperpower.dev
GitHub: https://github.com/<your-handle>/suiperpower
Sui Overflow 2026: https://overflow.sui.io
```

Sora reads `~/.claude/skills/` and confirms the markdown is human-readable. Inspires trust.

## Day 1, idea (45 minutes)

```bash
claude "/find-next-sui-idea I want to ship for Sui Overflow 2026, I have 5 weeks, I'm coming from Solana"
```

Skill activates. Walks Sora through:

- Background: Solidity then Solana, six months on Solana
- Time available: 5 weeks, evenings + weekends, can take a week off in week 4
- Team size: solo
- Interests: DeFi, has built a small lending demo on Solana before
- Anti-goals: not interested in NFT speculation, not interested in pure airdrop farming

Skill reads `skills/data/ideas/sui-native-gaps.json`, `a16z-state-of-crypto-2026.json`, `yc-rfs-crypto.json`. Returns:

> Top 5 ideas matching your background:
>
> 1. **Perpetuals using DeepBook as the settlement venue**
>    Why Sui: DeepBook's CLOB makes funding-rate computation cheap on-chain
>    Difficulty: hard. 4-5 weeks for a real demo if you go heads-down.
>    Recommended track: DeepBook
>
> 2. **Lending with kiosk-object collateral**
>    Why Sui: only works because Sui objects compose
>    Difficulty: medium-hard. 3-4 weeks.
>    Recommended track: Scallop (university award) if you have university affiliation, else general DeFi
>
> 3. **Yield aggregator across Scallop / NAVI / Suilend**
>    Why Sui: parallel execution lets you batch routing without contention
>    Difficulty: medium. 3 weeks.
>    Recommended track: Scallop
>
> 4. **Sponsored-tx receipts as a service**
>    Why Sui: zkLogin + sponsored gas hides web3 from the end user
>    Difficulty: medium. 2-3 weeks. Strong polish potential.
>    Recommended track: general (UX)
>
> 5. **PTB strategies marketplace**
>    Why Sui: PTBs let you compose strategies as recipes
>    Difficulty: medium. 3 weeks.
>    Recommended track: general or DeepBook
>
> Want to dive into one?

Sora picks #4 (sponsored-tx receipts). Skill writes `.suiperpower/idea-context.md`:

```markdown
# Idea context

## Pick
Sponsored-tx receipts as a service.
Users sign in with Google (zkLogin), make purchases on partner sites,
each purchase becomes a Sui object the user owns and can re-show anywhere.
Partner sponsors gas. End user never sees a wallet.

## Source
sui-native-gaps

## Why Sui
zkLogin + sponsored tx + objects-as-passport, no Solana / EVM equivalent at this UX level.

## Time budget
5 weeks (3.5 weeks build, 1 week polish, 0.5 week submission prep)

## Open questions
- Which partner site for the demo? (TBD)
- Pricing for partners? (TBD, see validate-business-model)
```

## Day 2, validate (90 minutes)

```bash
claude "/validate-idea"
```

Skill reads idea-context. Asks:

- Who is the user (the buyer or the partner)?
- What is the smallest version that delivers value?
- Why would users care about an on-chain receipt vs. an email receipt?
- What is the partner's pain point you are solving?
- What is the smallest plausible partner who would pay for this?

Sora answers each. Skill flags the second-to-last as weak ("partners get 'analytics' is hand-waving") and pushes back. Sora rewrites: partners get a verifiable, portable customer history that the user owns and that resists chargebacks.

Skill writes back to `.suiperpower/idea-context.md`. Adds a section flagging the chargeback hypothesis as the load-bearing claim that needs partner conversation.

## Day 3, validate business model (60 minutes)

```bash
claude "/validate-business-model"
```

Skill walks Sora through:

- Who pays: partners (per-receipt fee)
- How much: $0.05 per receipt (test)
- Why they keep paying: receipts reduce chargeback rate (hypothesis)
- Unit economics: cost per receipt is ~$0.001 (Sui sponsored tx + Walrus storage), revenue is $0.05, so 50x margin
- Smallest plausible business: 100 partners, 1000 receipts each per month = $5k MRR

Skill outputs: "Solid pricing thesis. Untested. Confirm with 3 small Shopify-class partner conversations before week 4."

## Week 1, scaffold (2 hours)

```bash
claude "/scaffold-project"
```

Skill reads idea-context. Asks scope clarifications:

- Frontend stack: Next.js + dapp-kit (recommended)
- Move package: yes, custom receipt object module
- Storage: Walrus for receipt metadata (recommended given the partner narrative)
- Auth: zkLogin (Google + Apple)
- Sponsored tx: yes (the pitch depends on it)
- Mobile: not for v1

Skill scaffolds:

```
sora-receipts/
├── README.md (scaffolded with project name, install, demo link slot)
├── move/
│   ├── Move.toml
│   └── sources/
│       └── receipts.move (skeleton with a TreasuryCap pattern)
├── frontend/
│   ├── package.json
│   ├── app/
│   │   └── page.tsx (zkLogin signin scaffold)
│   └── lib/sui.ts (suiClient setup)
├── docs/
│   └── screenshots/
└── .suiperpower/
    ├── idea-context.md
    └── build-context.md
```

Skill writes `.suiperpower/build-context.md` with the chosen stack and unanswered questions.

## Week 2, build Move (5 days)

```bash
claude "/build-with-move design the receipt object schema first"
```

Skill walks the design pass before writing code. Sora and Claude land on:

- Receipt object: owned by user, contains partner_id, amount, timestamp, blob_id (Walrus)
- AdminCap: held by partner, used to mint receipts
- Capability: admin can revoke (chargeback path)

Skill writes the Move module, including tests. Quality gate fires: every public function has a test, build succeeds, OZ access-control library used for AdminCap minting.

```bash
claude "/walrus-storage integrate Walrus for storing receipt metadata"
```

Skill reads `sponsor-docs/walrus.md`, walks Sora through Walrus SDK install, generates the integration: when a partner mints a receipt, metadata blob goes to Walrus, blob_id stored in the receipt object. When the user views a receipt, frontend retrieves the blob from Walrus.

Quality gate: the demo must actually retrieve a stored blob and render it. Skill walks Sora through the test, confirms the round-trip.

## Week 3, build frontend + auth (5 days)

```bash
claude "/sui-zk-login add zkLogin, Google + Apple"
```

Skill generates the zkLogin flow with current Mysten enoki SDK. Walks Sora through the OAuth setup on Google Cloud Console.

```bash
claude "/sponsored-transactions partner sponsors user gas"
```

Skill generates the sponsored tx flow. Partner-side, a small backend that sponsors txs for known users.

```bash
claude "/frontend-design-guidelines"
```

Skill suggests a clean, single-product page layout. Sora pushes back on a generic layout, skill suggests `/design-taste` next.

## Week 3, taste check (2 hours)

```bash
claude "/design-taste my landing page looks generic"
```

Skill: "Yeah it does. Three issues: (1) hero copy says 'sponsored receipts on Sui', that's not a benefit. Try 'a receipt that survives the storefront.' (2) The button 'Sign in with Google' is wallet-talk under the hood, fine, but the copy could lean into 'no wallet needed.' (3) The screenshot below the fold is a Lorem-ipsum-shaped mock; replace with the real frontend running."

Sora updates the copy and replaces the mock.

## Week 3, anti-slop pass (3 hours)

```bash
claude "/roast-my-product"
```

Skill: "Your value prop says 'on-chain receipts' but that doesn't tell the user why they care. The chargeback story is buried in your README. Lead with: 'Cut chargeback fraud by 40% with verifiable customer histories the user owns.' Also, your demo currently shows a single partner. Show two so the network effect is visible. Third: your demo video says 'Sora demo' in the corner, that's amateur. Drop it."

Sora fixes copy and demo flow. Records two-partner version of the demo.

```bash
claude "/product-review"
```

Skill: "First-paint is 800ms, fine. Onboarding has a 3-second blank screen during zkLogin redirect, mask with a skeleton. Mobile experience untested, run a quick check. Empty state when a user has no receipts is just blank, add a friendly nudge. Time to first receipt: 12 seconds, target sub-10."

Sora ships the fixes.

## Week 4, deploy testnet + dry run (3 days)

```bash
claude "/deploy-to-testnet"
```

Skill walks `sui client publish --network testnet`. Captures the package id from the JSON output. Verifies the package exists with `sui client object`. Writes `.suiperpower/deploy-context.md`:

```
package_id: 0xab3fc9...
network: testnet
deployed_at: 2026-XX-XXT12:34:56Z
deployer: 0xfedc...
```

Sora opens the live URL on a fresh browser, mints a test receipt, retrieves it from another browser. Works.

## Week 4, anti-slop pass 2 (1 day)

```bash
claude "/will-real-users-pay"
```

Skill nudges Sora: "You said 100 partners @ $5k MRR. Have you talked to a partner? If not, this is fiction. Try this script in a Shopify Discord and see if anyone bites."

Sora messages 5 small Shopify store owners on Twitter / Discord. Three respond, two say "I'd try it for $0.10/receipt if it actually reduced chargebacks." Sora updates business-model context.

```bash
claude "/retention-loop"
```

Skill: "What pulls a user back day 7? Day 30?"

Sora articulates: users come back to view their receipt history when they need to dispute a charge or prove a purchase. Skill notes this is more "consult-on-demand" than "habit loop"; flags as acceptable for the receipt category.

## Week 5, mainnet decision + submission prep (3 days)

```bash
claude "/deploy-to-mainnet"
```

Skill checks the gates. `validate-business-model`, `retention-loop`, `review-move` outputs are all in `.suiperpower/`. Proceeds.

Mainnet deploy goes clean. Sora runs the demo flow live with a real partner-test. Works. Updates README with the mainnet package id.

```bash
claude "/pick-my-sui-track"
```

Skill reads `move/Move.toml` and source files. Finds:

- `walrus::` imports and 4 function calls on the receipt-mint critical path → score 3 (load-bearing)
- `deepbook::` no imports → not applicable
- `scallop::` no imports → not applicable
- `openzeppelin_sui::` imports for AdminCap pattern, 2 calls on the partner mint flow → score 2 (real but secondary)

Recommendation: **Walrus track primary**, OpenZeppelin secondary tag.

```bash
claude "/submit-to-sui-overflow"
```

Skill runs the preflight:

- ✓ build-context exists
- ✓ deploy-context with verified package id
- ✓ Live URL reachable, returns 200
- ✓ Logo at docs/logo-1280.png is exactly 1280x1280
- ✓ 4 screenshots, all 1920x1080
- ✓ Project name "RecourseReceipt" passes the uniqueness check
- ✓ GitHub repo URL provided

Skill generates `docs/submission/`:

- logo-1280.png
- media-1.png ... media-4.png
- description-tagline.txt: "A receipt that survives the storefront."
- description-short.txt: 280 chars, leading with the chargeback narrative
- description-full.txt: 950 chars
- demo-script.md: 75-second video, 4 scenes, ends with the on-chain proof
- deepsurge-form.md: every field with the value to paste
- preflight-checklist.md

Sora records the demo video, uploads to YouTube unlisted. Updates `demo-script.md` with the video URL.

```bash
claude "/submit-to-sui-overflow"
```

(re-invoked) Quality gate fires:

- "Did you run the live demo end-to-end yourself in the last 60 minutes?" Sora says yes (just did).
- "Have you watched the demo video at full playback speed?" Sora confirms.
- "Would you, as a stranger on the internet, click submit and feel proud of it?" Sora hesitates on one slide of the demo; updates the screenshot. Re-watches. Says yes.

Skill walks Sora to the deepsurge.xyz URL. Field by field, Sora pastes from `deepsurge-form.md`. Confirms team registration (just himself). Reviews the submission summary. Submits.

## Day of submission, post-submission (30 minutes)

Sora posts in Sui Overflow Telegram with the live URL and a one-paragraph description. Tags @walrusprotocol on Twitter with the demo video.

Skill prompts Sora to draft a launch tweet:

> shipped to sui overflow 2026 ✦
>
> RecourseReceipt: a receipt that survives the storefront.
>
> users sign in with google. partners sponsor gas. every receipt is a sui object the user owns.
>
> live: <url>
> package: <suiscan link>
> sponsor track: walrus
>
> built with @suiperpower (suiperpower.dev)

Sora reviews, edits, posts.

## Outcome

What Sora ships:

- A live URL with a real working demo (Walrus storage, zkLogin, sponsored tx all load-bearing)
- A 75-second demo video that matches the live product
- A pitched description grounded in a real customer pain (chargebacks)
- Mainnet deploy with a verified package id
- A README that an investor could read in 90 seconds
- A primary track (Walrus) that fits the actual integration
- Three real partner conversations during the build, one of whom asked to be the first paying user post-hackathon

What Sora avoided:

- Generic name and pitch
- Sponsor cosplay (DeepBook track was tempting because of the prizes, but the pitch did not actually need DeepBook)
- Demo theater (the video shows the live product, not a staged version)
- A single-machine demo (tested on three browsers, two devices)
- No business model thinking (validate-business-model and will-real-users-pay forced the conversation)

## What this took, in hours

- Install + idea + validation: 4 hours
- Scaffold: 2 hours
- Build (Move + frontend + Walrus + zkLogin + sponsored tx): 60 hours
- Anti-slop pass + design taste: 6 hours
- Testnet deploy + dry runs: 8 hours
- Mainnet deploy + submission prep: 6 hours
- Post-submission promotion: 1 hour

Total: ~87 hours over 5 weeks. Roughly 18 hours per week. Plausible for a solo builder with evenings and weekends.

## What Suiperpower delivered for Sora

- The idea (corpus-grounded, not a hunch)
- The validation framework (refuses to claim the idea is good without answers)
- The scaffold (correct stack, sensible defaults)
- The Move skill (forced tests, used OZ libs, capability handling clean)
- The Walrus integration (refused to declare done without a working round-trip)
- The taste check (caught generic copy and stock screenshots before submission)
- The roast (caught the buried chargeback narrative and got it into the lead)
- The will-real-users-pay nudge (forced 3 partner conversations)
- The submission generator (refused to ship without the right asset dimensions and a passing live URL)
- The track selector (recommended Walrus correctly based on integration depth, not Sora's wishful thinking)

## What Sora did that Suiperpower could not have done

- Made the actual product good
- Talked to real partners
- Recorded a great demo video
- Wrote the actual code (Claude / Codex / Cursor wrote, but Sora reviewed)
- Made tasteful design decisions
- Hustle on launch day

Suiperpower is a multiplier, not a replacement. Sora made the decisions. Suiperpower made it harder for Sora to skip the questions that matter.

## Why this journey is plausible

- Time per phase aligns with `17-LAUNCH-PLAN.md` and `04-SKILLS-CATALOG.md`
- Skills invoked in the order they are designed for
- Every quality gate fires when designed
- Anti-slop framework demonstrably catches issues
- Sponsor integration is real, not cosmetic
- Submission generator behaves as `10-HACKATHON-SUBMISSION.md` specifies

If the journey diverges in practice, the plans need updating, not the journey.

## How this doc gets used

- Linked from `00-OVERVIEW.md` for new readers
- Source for marketing copy on `suiperpower.dev`
- Source for the example sections of skill SKILL.md descriptions
- Reference for new contributors who want to feel what they are building
- Sample for sponsor pitch decks ("here is what a participant ships using your tech")
