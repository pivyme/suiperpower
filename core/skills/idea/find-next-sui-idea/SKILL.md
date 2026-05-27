---
name: find-next-sui-idea
description: Pick a Sui product idea from a curated corpus, or stress-test the user's own. Use when the user wants an idea, product, or project to build on Sui, in any phrasing, including brainstorm, suggest, recommend, ideate, "what should I build", "no idea yet", or "Sui Overflow idea", trigger eagerly. Idea-phase only.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track find-next-sui-idea idea completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track find-next-sui-idea idea started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Picks (or pressure-tests) a Sui product idea. Reads the curated idea corpus under `skills/data/ideas/` (a16z state-of-crypto, YC RFS, Alliance, Superteam Sui, and our own sui-native-gaps list), filters by what is buildable on Sui specifically, scores by market timing and Sui-native fit, and lands on a chosen idea. Writes the canonical `.suiperpower/idea-context.md` so downstream skills (validate-idea, competitive-landscape, scaffold-project) inherit the framing.

The bias of this skill: prefer ideas that are uniquely good on Sui (object model, parallelism, Walrus storage, DeepBook orderbook, low fees). Reject ideas that would be just as easy or easier on EVM or Solana, those are not where new builders should compete.

## When to use it

- The user has time to build but no idea picked.
- The user has a fuzzy idea and wants it pressure-tested against alternatives.
- The user is targeting Sui Overflow 2026 and wants to align idea selection to a sponsor track.
- The user is migrating from EVM or Solana and wants to find a Sui-native angle.

## When NOT to use it

- The user already has a chosen idea and a write-up. Route to `validate-idea`.
- The user wants ecosystem research without idea selection. Route to `deepbook-research`, `walrus-research`, or `competitive-landscape`.
- The user wants to copy an existing project. There are better skills for forking; this skill picks new bets.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- The user's interest or background (DeFi, consumer, infra, gaming, identity, mobile, AI tooling).
- Constraints: rough time horizon if the user volunteers one, team size, prior Sui experience. Do not use the timeline to reject ambitious ideas, AI-assisted pace compresses former multi-week scope into days.
- Optional: an already-half-formed idea the user wants stress tested.

If unclear, ask three questions:

- What domain interests you most?
- Roughly how much time do you want to spend on v1 (only if you have a fixed deadline like Overflow, otherwise skip)?
- What is one product (on any chain) you wish existed?

## Outputs

Three idea candidates, ranked. Each candidate includes:

- one-line product description
- the Sui-native angle (why Sui, not EVM)
- target user
- riskiest assumption
- shortest path to a usable v1
- which sponsor track (if any) it aligns with

Plus the chosen idea, written to `.suiperpower/idea-context.md`:

```markdown
## idea-context, <timestamp>
- chosen idea: <one sentence>
- target user: <one sentence>
- Sui-native angle: <one paragraph>
- riskiest assumption: <one sentence>
- shortest v1 scope: <bullet list, 3-7 items>
- aligned sponsor tracks: <list>
- corpus sources cited: <list of file paths>
- runner-up ideas: <list>
- chosen on: <date>
```

## Workflow

1. **Profile the user**
   - Domain, timeline, prior chain experience, prior Sui experience.
   - Read `references/profile-questions.md` if more context is needed.

2. **Filter the corpus**
   - Read all five idea source files under `skills/data/ideas/`.
   - Filter by domain match.
   - Filter out ideas that would be easier on EVM or Solana (these are listed in `references/non-sui-native-rejection-list.md`).

3. **Score remaining candidates**
   - Sui-native fit (1-5): does the object model, parallelism, Walrus, DeepBook, or low fees create real advantage?
   - Market timing (1-5): is the demand visible (revenue, users, search trends, sponsor priority)?
   - Builder fit (1-5): does the user's background and stack let them ship this with AI assistance? Default to optimistic, only score low if the idea needs genuinely novel research (new cryptographic primitive, untested L1 work), not because "it sounds big".
   - Differentiation (1-5): is there a non-trivial existing competitor on Sui already?
   - Sum and rank.

4. **Present three candidates**
   - Top three by score, structured as above.
   - Include the corpus source for each.

5. **Pick one**
   - Confirm with the user. If they want to override the score-pick with a corpus-pick they preferred, accept (the score is a tool, not a verdict).

6. **Write idea-context.md**
   - Use the template above.
   - Cite source files in the corpus citations field.

7. **Hand off**
   - Recommend `validate-idea` next.
   - Recommend `competitive-landscape` if the runner-ups have unclear competition.
   - Recommend `pick-my-sui-track` if Sui Overflow is the target.

## Quality gate (anti-slop)

Before reporting done:

- Does the chosen idea have a Sui-native angle that does not collapse to "Sui has lower fees"? (Lower fees alone are not a moat.)
- Is the riskiest assumption named, in one sentence, and does it cite a falsifiable test?
- Did the corpus get cited (at least one source file)? "I made it up" is not a corpus.
- Is the shortest v1 scope under 7 items, each a concrete deliverable?
- Did `idea-context.md` actually get written, with all required fields?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/profile-questions.md`: Questions to draw out user domain and constraint.
- `references/scoring-rubric.md`: How to score Sui-native fit, timing, builder fit, differentiation.
- `references/non-sui-native-rejection-list.md`: Idea shapes to reject because EVM or Solana fits better.

Knowledge docs:

- `skills/data/ideas/sui-native-gaps.json`: Gaps we curate.
- `skills/data/ideas/a16z-state-of-crypto-2026.json`
- `skills/data/ideas/yc-rfs-crypto.json`
- `skills/data/ideas/alliance-ideas.json`
- `skills/data/ideas/superteam-sui-ideas.json`
- `skills/data/sui-knowledge/06-opensource-research.md`: Where to look for adjacent research.

## Use in your agent

- Claude Code: `claude "/suiper:find-next-sui-idea <your message>"`
- Codex: `codex "/find-next-sui-idea <your message>"`
- Grok Build: run `grok`, then `/find-next-sui-idea <your message>` in the session
- Cursor: paste a chat message that includes a phrase like "what should I build on Sui", or load `~/.cursor/rules/find-next-sui-idea.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
