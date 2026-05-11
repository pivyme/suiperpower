---
name: pick-my-sui-track
description: Map the project to a single Sui Overflow track based on integration depth, scoring each sponsor (Walrus, DeepBook, OpenZeppelin, OtterSec, Scallop) on a 0-3 scale and refusing to recommend any track that does not score 3 on a load-bearing flow. Use when the user says "which track", "which Overflow track", "which sponsor track", "pick my track", "what track should I submit to", "Sui Overflow track", or "track recommendation". Reads .suiperpower/idea-context.md, .suiperpower/build-context.md, and the user's Move package, writes .suiperpower/track-pick.md.
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

Walks the project's actual code and configuration, scores integration depth for each sponsor on a 0 to 3 scale per `plans/11-SPONSOR-INTEGRATION.md`, and recommends a single primary track only if a sponsor scores 3 (load-bearing). Recommends a secondary track for any sponsor at score 2.

Refuses to recommend a sponsor track unless the integration is genuinely load-bearing. Aspirational integrations ("we plan to use Walrus next") score 0.

## When to use it

- After the project compiles and at least one demo flow runs end to end.
- Before drafting the submission, so the right track is picked early.
- When the user is choosing between two plausible tracks and wants a tie-breaker.

## When NOT to use it

- Pre-build, when the integration depth cannot be measured.
- For thematic tracks that do not have a sponsor scoring rubric. Note them separately; this skill is sponsor-track focused.
- For grant track decisions. Route to `apply-grant`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- `.suiperpower/idea-context.md`: project intent and target user.
- `.suiperpower/build-context.md`: stack, package id, modules used.
- The Move package source files (for static scoring of sponsor calls).
- Optional: a recorded demo of the load-bearing flow, if available, to confirm the score.

## Outputs

A `.suiperpower/track-pick.md` with per-sponsor scores, the primary track recommendation, optional secondary track, and the reasoning:

```markdown
## Track pick, <timestamp>

### Sponsor scores
- Walrus: <0 | 1 | 2 | 3>, evidence: <one sentence with file or call site>
- DeepBook: <0 | 1 | 2 | 3>, evidence: ...
- OpenZeppelin: <0 | 1 | 2 | 3>, evidence: ...
- OtterSec: <0 | 1 | 2 | 3>, evidence: ...
- Scallop: <0 | 1 | 2 | 3>, evidence: ...

### Primary track
- recommended: <sponsor name | none>
- reasoning: <one paragraph>
- caveats: <one paragraph if any>

### Secondary track
- recommended: <sponsor name | none>
- reasoning: <one sentence>

### What is needed to upgrade a 2 to a 3
- <if any sponsor sits at 2, what would tip it to load-bearing>

### Verdict
- ready to submit to a sponsor track: <yes | no>
- if no: which sponsor to deepen, or recommend a thematic-only submission
```

## Workflow

1. **Read project state**
   - Open `idea-context.md` and `build-context.md`.
   - Walk the Move package to find imports of sponsor packages and call sites.
   - Walk the frontend or PTB code if available, for SDK calls (`@mysten/walrus`, `@deepbook/sdk`, `@scallop/sdk`).

2. **Score each sponsor on the 0 to 3 scale**
   - 0: no imports, no calls. Aspirational mentions count as 0.
   - 1: imported in `Move.toml` or referenced in docs only, but not actually called.
   - 2: one or more calls in the codebase, but the project still functions if removed.
   - 3: used on the load-bearing flow; removing the integration breaks the demo.

3. **Verify the load-bearing claim**
   - For any sponsor at 3, confirm by walking the demo flow:
     - Walrus: is a stored blob retrieved and rendered as part of the user-visible flow?
     - DeepBook: is at least one real testnet order placed and settled?
     - OpenZeppelin: is at least one OZ Sui module replacing what would have been a hand-rolled equivalent?
     - OtterSec: are P0 items from the OtterSec checklist completed and recorded?
     - Scallop: is a deposit, borrow, or repay completed against a live Scallop pool in the demo?
   - If the load-bearing claim cannot be verified, downgrade the score to 2.

4. **Recommend the primary track**
   - If exactly one sponsor scores 3, recommend that as primary.
   - If two or more score 3, recommend the one most central to the user-visible value. Use `idea-context.md` to break ties.
   - If no sponsor scores 3, recommend `none` and explain.

5. **Recommend a secondary track**
   - The highest-scoring sponsor at 2, if any. State explicitly that a secondary track is informational; submission rules may not allow secondary submission for the user's hackathon.

6. **Name what would upgrade a 2 to a 3**
   - For each sponsor at 2, write one concrete change that would make it load-bearing. Example: "DeepBook is at 2 because the demo skips order settlement. Add a settlement call in the demo path to upgrade to 3."

7. **Write the verdict**
   - If primary is `none`, the user is not ready to submit to a sponsor track. Recommend deepening the highest-scoring sponsor or submitting to a thematic-only track instead.
   - If primary is named, the user is ready. Recommend `submit-to-sui-overflow`.

8. **Writeback**
   - Append `.suiperpower/track-pick.md` with the entry.

## Quality gate (anti-slop)

Before reporting done:

- Was every sponsor scored, with a one-sentence evidence string? (No skipped sponsors.)
- Was the load-bearing claim verified by walking the demo flow, not by trusting the import list?
- Was a sponsor at 3 demoted if the demo flow did not actually use it?
- Was the upgrade-path note written for every sponsor at 2?
- Did the writeback happen?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/scoring-rubric.md`: Detailed examples of what scores 0, 1, 2, 3 for each sponsor.
- `references/load-bearing-tests.md`: Concrete tests to verify a 3 score per sponsor.

Canonical:

- `skills/data/sui-knowledge/sponsor-docs/walrus.md`
- `skills/data/sui-knowledge/sponsor-docs/deepbook.md`
- `skills/data/sui-knowledge/sponsor-docs/openzeppelin-sui.md`
- `skills/data/sui-knowledge/sponsor-docs/ottersec-checklist.md`
- `skills/data/sui-knowledge/sponsor-docs/scallop.md`

## Use in your agent

- Claude Code: `claude "/suiper:pick-my-sui-track <your message>"`
- Codex: `codex "/pick-my-sui-track <your message>"`
- Cursor: paste a chat message that includes a phrase like "which Overflow track", or load `~/.cursor/rules/pick-my-sui-track.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
