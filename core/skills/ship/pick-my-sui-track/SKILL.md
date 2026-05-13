---
name: pick-my-sui-track
description: Use when picking a Sui Overflow 2026 track (Agentic Web, DeFi, Walrus, DeepBook).
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track pick-my-sui-track ship completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track pick-my-sui-track ship started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Walks the project's actual code and demo flow, scores depth of fit against all eleven official Sui Overflow 2026 tracks on a 0 to 3 scale, and recommends a single primary track only if a track scores 3 (load-bearing).

The eleven official tracks:

**Core tracks ($62.5K each)**:
- **Agentic Web**: autonomous AI agents that act, transact, and coordinate using Sui's object model.
- **DeFi & Payments**: financial primitives or payment rails on Sui.
- **Infra & DevX**: developer tools, SDKs, indexers, and infrastructure that make Sui easier to build on.

**Specialized tracks**:
- **Walrus** ($70K): applications built on Walrus decentralized storage.
- **DeepBook** ($70K): trading or liquidity applications powered by DeepBook's on-chain orderbook.
- **ONE Championship** ($70K): consumer apps in sports, entertainment, fan engagement, gaming, NFTs.
- **EVE Frontier** ($50K): Smart Assembly mods, tools, or experiences for EVE Frontier.
- **Degen** (TBD): meme launches, gamified trading, bonding curves, viral degen culture.
- **Payments & Wallets** (TBD): wallet UX, payment rails, sponsored transactions.
- **Entertainment & Culture** (TBD): NFTs, gaming, social, consumer culture apps.
- **Explorations** (TBD): RWA, DePIN, multi-chain, novel experiments.

If overflow.sui.io ever changes its track list mid-cycle, this skill should be re-verified against the current page before recommending.

### Official policy

Per overflow.sui.io: "You must select the one track that best represents your project."

Per the Overflow 2026 organizers (Telegram, paraphrased): track choice is the team's prerogative. Teams pick where the project aligns most strongly.

This skill stays opinionated within that policy. It will not bless a track recommendation where the fit is aspirational, because judges score against what they see in the demo, not what is claimed in the description.

## When to use it

- After the project compiles and at least one demo flow runs end to end.
- Before drafting the submission, so the right track is locked in early.
- When the user is torn between two plausible tracks and wants a tie-breaker.

## When NOT to use it

- Pre-build, when fit cannot be measured against real code.
- For special award eligibility (OpenZeppelin, OtterSec, Scallop, Hippo). Those are prize partners or special awards, not tracks themselves; see "Special awards and prize sponsors" below.
- For grant track decisions. Route to `apply-grant`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- `.suiperpower/idea-context.md`: project intent and target user.
- `.suiperpower/build-context.md`: stack, package id, modules used.
- Move package source and any frontend code (for static evidence of integrations).
- Optional: a recording of the load-bearing demo flow.

## Outputs

Append to `.suiperpower/track-pick.md`:

```markdown
## Track pick, <timestamp>

### Track fit scores (core)
- Agentic Web: <0 | 1 | 2 | 3>, evidence: <one sentence>
- DeFi & Payments: <0 | 1 | 2 | 3>, evidence: <one sentence>
- Infra & DevX: <0 | 1 | 2 | 3>, evidence: <one sentence>

### Track fit scores (specialized)
- Walrus: <0 | 1 | 2 | 3>, evidence: <one sentence>
- DeepBook: <0 | 1 | 2 | 3>, evidence: <one sentence>
- ONE Championship: <0 | 1 | 2 | 3>, evidence: <one sentence>
- EVE Frontier: <0 | 1 | 2 | 3>, evidence: <one sentence>
- Degen: <0 | 1 | 2 | 3>, evidence: <one sentence>
- Payments & Wallets: <0 | 1 | 2 | 3>, evidence: <one sentence>
- Entertainment & Culture: <0 | 1 | 2 | 3>, evidence: <one sentence>
- Explorations: <0 | 1 | 2 | 3>, evidence: <one sentence>

### Primary track
- recommended: <track name | none of the eleven>
- reasoning: <one paragraph>
- caveats: <one paragraph if any>

### What is needed to upgrade a 2 to a 3
- <if any track sits at 2, what would tip it to load-bearing>

### Special awards and prize sponsor eligibility (informational, not tracks)
- OpenZeppelin (1st place DeFi & Payments sponsor): <yes | no>, evidence: ...
- OtterSec (3rd place DeFi & Payments sponsor): <yes | no>, evidence: ...
- Scallop University Award ($2.5K x 10 teams): <yes | no>, evidence: ...
- Hippo Community Award ($25K): <eligible by default, community-voted>

### Verdict
- ready to submit to one of the eleven tracks: <yes | no>
- if no: which track to deepen, with the concrete change needed to get there
```

## Workflow

1. **Read project state**
   - Open `idea-context.md` and `build-context.md`.
   - Walk the Move package and frontend for integration evidence.
   - Walk the user-visible demo flow end to end.

2. **Score each of the eleven tracks on 0 to 3**
   - 0: no real fit.
   - 1: thematic adjacency only (a mention in docs, an aspirational claim in the description).
   - 2: real code or theme present, but the project still works as something else if you removed it.
   - 3: load-bearing. Remove this and the demo, or the project's reason to exist, breaks.

   See `references/scoring-rubric.md` for per-track examples and edge cases.

3. **Verify load-bearing claims**
   - For any track at 3, run the matching test from `references/load-bearing-tests.md`.
   - If the test does not produce the stated outcome, downgrade to 2.

4. **Recommend the primary track**
   - If exactly one of the eleven scores 3, recommend that as primary.
   - If two or more score 3, recommend the one most central to the user-visible value. Use `idea-context.md` to break the tie.
   - If none scores 3, primary is `none`. Name the highest-scoring track and the concrete change needed to upgrade it to 3. Do not bless a 2 as a submission-ready pick.

5. **Note special awards and prize sponsor eligibility**
   - These sit alongside tracks, not in place of them. Scoring is informational so the user knows what else is reachable from their primary track.
   - OpenZeppelin: 1st place sponsor for DeFi & Payments. Eligible if the project uses load-bearing OZ Sui modules.
   - OtterSec: 3rd place sponsor for DeFi & Payments. Eligible if the project completed a real OtterSec-style security pass with P0 items resolved.
   - Scallop University Award: $2.5K x 10 teams. Eligible per the Overflow university award criteria, not gated on Scallop integration.
   - Hippo Community Award: $25K total, community-voted. All submitted projects are eligible by default. Mention this so the user knows it exists but do not score it.

6. **Name what would upgrade a 2 to a 3**
   - For each track at 2, write one concrete change. Example: "Walrus is at 2 because the demo's hero image is served from a CDN with the Walrus blob as fallback. Move the canonical render to Walrus to upgrade to 3."

7. **Write the verdict**
   - If primary is named, recommend `submit-to-sui-overflow`.
   - If primary is `none`, do not block the user. Surface the team-prerogative policy, name the highest-scoring track from all eleven, and give the concrete upgrade path. The user can still submit; the skill just refuses to call a 2 a 3.

8. **Writeback**
   - Append the entry to `.suiperpower/track-pick.md`.

## Quality gate (anti-slop)

Before reporting done:

- Were all eleven tracks scored, with a one-sentence evidence string? (No skipped tracks.)
- Was every load-bearing claim verified by walking the demo flow, not by trusting an import list?
- Was a track at 3 demoted if the demo flow did not actually exercise it?
- Was the upgrade-path note written for every track at 2?
- If no track scored 3, did the writeup name the highest-scoring track and the concrete upgrade change instead of blessing a 2 as a submission-ready pick?
- Did the special awards section stay informational (not framed as a twelfth track)?
- Did the writeback happen?

If any answer is no, the skill keeps working.

## Where to get help

Sui Overflow 2026 runs dedicated Telegram groups for sponsor tracks. Point the user at the matching group so they can talk to mentors and team members directly:

- General Sui Overflow Telegram: https://go.sui.io/suioverflow2026-tg
- Walrus track Telegram: https://go.sui.io/ofw-walrus-tg
- DeepBook track Telegram: https://go.sui.io/ofw-deepbook-tg

For tracks without a known dedicated Telegram, direct the user to the general Overflow group.

## References

On-demand references (load when the skill needs the detail):

- `references/scoring-rubric.md`: 0 to 3 examples per track, including edge cases.
- `references/load-bearing-tests.md`: concrete tests to verify a 3 score per track.

Canonical:

- Sui Overflow 2026 tracks: https://overflow.sui.io
- Participant Handbook: https://go.sui.io/overflow26-participant-handbook
- `skills/data/sui-knowledge/sponsor-docs/walrus.md`
- `skills/data/sui-knowledge/sponsor-docs/deepbook.md`

## Use in your agent

- Claude Code: `claude "/suiper:pick-my-sui-track <your message>"`
- Codex: `codex "/pick-my-sui-track <your message>"`
- Cursor: paste a chat message that includes a phrase like "which Overflow track", or load `~/.cursor/rules/pick-my-sui-track.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
