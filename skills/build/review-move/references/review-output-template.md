# Review output template

Every `review-move` session writes a file at `.suiperpower/review-<timestamp>.md` using the structure below. Consistent shape lets `deploy-to-mainnet` and `ottersec-prep` parse the result reliably.

```markdown
# review-move, <project name>, <timestamp>

## Scope

- packages reviewed: <list of Move packages and their paths>
- entry functions inspected: <count>
- capabilities traced: <list of cap struct names>
- shared Objects audited: <list of shared Object names>
- not in scope: <off-chain components, frontend, dependencies that were not opened>

## Threat model

- callers: <who is allowed to call entry functions, who is hostile>
- value at risk: <coins, NFTs, capability authority>
- load-bearing invariants: <list, e.g. "total supply <= cap", "balance conservation across all transfers">

## Findings

### P0

#### F-001: <one-line title>
- location: <file:line>
- pattern: <observed pattern>
- impact: <what an attacker can do>
- recommended fix: <specific change>
- regression test: <name of test to add or update>

(repeat per P0 finding)

### P1

(same shape, P1)

### P2

(same shape, P2)

### P3

(same shape, P3)

## OZ migration candidates

### M-001: <module>::<function>
- pattern: <hand-rolled name>
- proposed swap: <OZ module + rev>
- rationale: <one sentence>
- risk of NOT migrating: <one sentence>

(repeat per candidate)

## Sign-off

- P0 count: <n>
- P1 count: <n>
- P2 count: <n>
- P3 count: <n>
- OZ candidates: <n>
- date: <yyyy-mm-dd>
- reviewer: <user or skill identity>
- confidence: <high | medium | low, with one-line reason>

## Next steps

1. <action item, e.g. "fix F-001 in build-with-move session">
2. <action item, e.g. "engage OtterSec once P0 + P1 = 0">
3. <action item, e.g. "add tests T-001..T-005">
```

## Rules

- Write findings in order P0 -> P1 -> P2 -> P3, never mixed.
- Always include the regression test column. A finding without a regression test is not closed when the fix lands.
- Use stable IDs (`F-001`, `F-002`, ...) so later sessions can reference findings by ID.
- If the review finds zero issues, fill the "Sign-off" with `confidence: low` by default and force the reviewer to justify "no findings" with the entry-points-inspected list. Empty reviews are suspicious until proven otherwise.
