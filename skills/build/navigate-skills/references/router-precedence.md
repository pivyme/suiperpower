# Router precedence

When two or more skills could apply to a user's request, use these tie-break rules. They mirror what `skills/SKILL_ROUTER.md` codifies but condensed for in-the-moment decisions.

## Rule 1, the failing-build rule

If the user's last message contains a literal compile error, abort code, or stack trace, the first skill is `debug-move` (or the relevant debug skill for that surface). Do not route to feature-building or review skills until the build is green.

## Rule 2, the no-context rule

If neither `.suiperpower/idea-context.md` nor `.suiperpower/build-context.md` exist, and the user mentions "build", "scaffold", or "start", route to `scaffold-project`. Skills that need build context to function should not be the first stop.

## Rule 3, the deploy-blockers rule

If the user wants to deploy to mainnet but the prerequisites are missing (no `review-move` output, no `validate-business-model`, no `retention-loop`), route to the missing prerequisite first. `deploy-to-mainnet` itself enforces this, but `navigate-skills` should preempt the friction.

## Rule 4, the sponsor-integration rule

If the user mentions a sponsor name (Walrus, DeepBook, Scallop, OpenZeppelin, OtterSec, zkLogin), prefer the sponsor-specific build skill over a generic one. Generic Move authoring help can come from `build-with-move` after the sponsor-specific decisions are made.

## Rule 5, the meta rule

If the user is asking about Suiperpower itself ("what can you do", "list skills", "which skill"), this is `navigate-skills`. Do not recursively re-invoke.

## Rule 6, the anti-slop rule

If the user shows symptoms of slop (vague claims about their product, no validation evidence, fuzzy retention story), but is asking about deploy or marketing, route to the relevant anti-slop skill (`validate-business-model`, `retention-loop`, `roast-my-product`) before the deploy or marketing skill.

## Rule 7, the explicit override rule

If the user explicitly names a skill ("use launch-coin", "run review-move"), respect it. Do not second-guess unless the prerequisites are missing (then fall through to Rule 3).

## Tie-break order

When multiple rules apply, apply in the order above. Rule 1 wins if the build is broken, regardless of any other signal.

## What to do when no skill fits

If after applying these rules nothing in the catalog matches, say so plainly:

> No installed skill is a clean fit for this. You can file a skill request at <github issues URL>, or describe the goal differently and we can try again.

Do not pick the closest skill out of obligation. Slop in equals slop out.
