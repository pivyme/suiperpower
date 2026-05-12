---
name: validate-idea
description: Use when stress testing a Sui idea against demand, competition, feasibility, and Sui-native fit. Produces a go/no-go.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track validate-idea idea completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track validate-idea idea started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Pressure tests a Sui product idea on four dimensions, demand evidence, competition, feasibility on the user's timeline, and Sui-native fit, and produces a written go/no-go recommendation. The skill is designed to kill weak ideas early. A "no go" with a clear reason is more valuable than a "go" with hand-waving.

## When to use it

- After `find-next-sui-idea` has written a chosen idea to `.suiperpower/idea-context.md` and the user wants a second pass before scaffolding.
- The user has an idea (their own, not from the corpus) and wants pressure testing.
- The user is mid-build and questioning whether to continue. Late validation is still useful.

## When NOT to use it

- The user has not picked an idea yet. Route to `find-next-sui-idea`.
- The user wants competitive landscape only. Route to `competitive-landscape`.
- The user wants a brutal critique of the existing product. Route to `roast-my-product`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- `.suiperpower/idea-context.md` if it exists.
- The idea in one or two sentences if no context file.
- Optional: any prior validation work the user has done (interviews, surveys, search-trend data).

## Outputs

A validation block appended to `.suiperpower/idea-context.md`:

```markdown
### Validation, <timestamp>
- demand evidence: <strong | medium | weak>, with one to three citations
- competition: <none | one | crowded>, with named competitors (Sui-specific and adjacent-chain)
- feasibility on stated timeline: <yes | yes-with-cuts | no>
- Sui-native fit: <strong | medium | weak>
- recommendation: <go | go-with-pivot | no-go>
- reasoning: <one paragraph>
- next experiments: <bullet list of 1-3 cheap tests to run before deeper investment>
```

The recommendation is one of `go`, `go-with-pivot`, `no-go`. `go-with-pivot` means the underlying market is real but the proposed product needs a specific change.

## Workflow

1. **Read the context**
   - Open `.suiperpower/idea-context.md`.
   - If missing, ask the user to describe the idea in one or two sentences and write a minimal context file before proceeding.

2. **Walk demand evidence**
   - Has anyone paid for something similar (on Sui, on EVM, on Solana, off-chain)? Cite at least one.
   - Are there public discussions, fundraises, or sponsor priorities pointing at the category?
   - What is the falsifiable signal that demand is real? (Search trends, paying customers elsewhere, sponsor RFP, repeated user request.)

3. **Walk competition**
   - List Sui-native competitors. None? One? Crowded?
   - List adjacent-chain competitors. What is their state (live, growing, struggling, dead)?
   - For each, what is the candidate's specific differentiation in one sentence?

4. **Walk feasibility**
   - Cross-reference the user's timeline (from `idea-context.md`) against the v1 scope.
   - Identify the longest single dependency (a sponsor SDK integration, a custom Move module, an oracle).
   - Honest call: can a v1 ship in the timeline? If not, what cuts make it feasible?

5. **Walk Sui-native fit**
   - What primitive does the idea depend on (Object model, Walrus, DeepBook, Kiosk, zkLogin, parallel execution, low fees)?
   - What does Sui give the idea that EVM or Solana would not?
   - "Sui has lower fees" alone is not a moat.

6. **Compose the recommendation**
   - `go` if at least three of four dimensions are strong or medium and no dimension is weak.
   - `go-with-pivot` if one dimension is weak but the underlying category is healthy.
   - `no-go` if two or more dimensions are weak, or if the idea is on the non-sui-native rejection list with no override.

7. **Suggest cheap next experiments**
   - 1 to 3 tests, each runnable in under a day, that would move at least one weak dimension to medium.
   - Examples: post the idea on a Sui community channel and count engagement; run a 10-person user interview; build a clickable prototype.

8. **Writeback**
   - Append to `.suiperpower/idea-context.md`.

## Quality gate (anti-slop)

Before reporting done:

- Is the demand-evidence claim backed by at least one citation that is not "founder intuition"?
- Is the competition list real, with named projects, not abstract "competitors exist"?
- Is feasibility tied to a specific timeline, not "should be doable"?
- Did the recommendation actually land on `go`, `go-with-pivot`, or `no-go`, not a hedge?
- Did the writeback happen?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/demand-evidence-questions.md`: Specific questions to test demand claims.
- `references/no-go-criteria.md`: Patterns that should trigger a `no-go` regardless of enthusiasm.

Knowledge docs:

- `skills/data/ideas/sui-native-gaps.json`: Curated gap list, useful for pivot suggestions.
- `skills/data/sui-knowledge/06-opensource-research.md`: Where to look for adjacent research and existing competitors.

## Use in your agent

- Claude Code: `claude "/suiper:validate-idea <your message>"`
- Codex: `codex "/validate-idea <your message>"`
- Cursor: paste a chat message that includes a phrase like "validate my idea", or load `~/.cursor/rules/validate-idea.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
