# No-go criteria

Patterns that should trigger a `no-go` recommendation regardless of the user's enthusiasm. The skill exists to be an honest second opinion; bending toward `go` to be agreeable is the slop the framework was built to refuse.

## Hard no-go

If any of these fire, the recommendation is `no-go`. The user can override, but the skill should make the user explicitly override.

- **No demand evidence at all.** No paying users elsewhere, no public discussion, no sponsor signal, no personal frustration. Pure speculation.
- **Idea is on the non-sui-native rejection list with no override.** The chain choice fights the idea.
- **Feasibility requires research-grade work the user must drive personally** (new cryptographic primitive, untested L1 work, custom consensus, novel oracle infra) AND the user has a hard external deadline that cannot accommodate that research. Application-layer scope does not qualify, AI-assisted pace handles that. Only trigger on genuine research gaps, not on "this sounds big".
- **Sui-native fit is weak (1-2) AND market timing is weak (1-2).** No edge, no urgency.
- **The user cannot articulate the riskiest assumption.** If you cannot say what would have to be true for this to work, you do not understand the idea well enough to commit to it.

## Soft no-go (recommend `go-with-pivot`)

These do not auto-kill, but they steer toward a pivot:

- **Demand evidence is weak.** Cheap experiments first; do not scaffold yet.
- **Competition is crowded with no clear differentiation.** The user must articulate the angle in one sentence; "we will be cheaper" is not enough.
- **Sui-native fit is medium.** The idea works on Sui but the angle is not specific. Push for an angle (a specific Walrus, DeepBook, Kiosk, or zkLogin integration) before scaffolding.

## Common false-positive go signals

Reject these as reasons to recommend `go`:

- The user is excited. Excitement is necessary, not sufficient.
- An LLM (or a friend) said it is a great idea. Same.
- A sponsor track exists for the category. Sponsors fund categories that have surface area; they do not validate specific ideas inside that category.
- A previous hackathon project in the same space won an award. Past awards do not predict market fit.
- The idea sounds futuristic. Futuristic-sounding correlates negatively with shipping.

## Common false-positive no-go signals

Do NOT auto-no-go on:

- "Someone already does this." Competition is normal; differentiation matters more than novelty.
- "It would be a small market." Wedge markets that grow into big ones are the YC playbook.
- "This is simple." Simple ideas executed well beat complex ideas executed badly.

## How to deliver a no-go

The skill must:

1. Name the specific dimension(s) that triggered the no-go.
2. Cite the no-go criterion from this file.
3. Suggest the cheapest experiment that would move the failing dimension if the user wants to challenge the no-go.
4. Suggest 1 to 2 adjacent ideas from `skills/data/ideas/sui-native-gaps.json` that share the user's interest but score better.

A no-go is not a closed door; it is a redirect with a reason.
