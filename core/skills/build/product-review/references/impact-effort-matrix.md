# Impact / effort matrix

A simple two-axis scoring rubric. Use it to bucket every finding into P0, P1, P2, or defer.

## Impact axis

How many users does this finding affect, and how badly?

- **High**: every first-time user hits this, and it blocks them from reaching value (broken onboarding step, blank error state, mobile-only failure when traffic is mobile-heavy).
- **Medium**: many users hit this, and it slows them down but does not block (slow loading state, mobile reflow that works but feels janky, copy that is unclear but recoverable).
- **Low**: few users hit this, or all users hit it but the cost is small (a typo, an internal page no one sees, a hover state that is slightly off).

## Effort axis

How long does fixing this take?

- **Low**: under 2 hours (copy change, swap an icon, add a skeleton state, tighten a button hit area).
- **Medium**: half a day to two days (rebuild a flow step, add error handling across a feature, redesign mobile layout for one screen).
- **High**: more than two days (re-architect the navigation, swap the wallet provider, rebuild the empty state UI system).

## Bucketing rule

| Impact | Effort low | Effort medium | Effort high |
| --- | --- | --- | --- |
| High | **P0** | **P1** | P1 (cut scope) |
| Medium | **P2** | P2 | defer |
| Low | defer | defer | defer |

P0 ships before the next demo. P1 within a week. P2 when time allows. "Defer" is not "ignore"; it is "log and reconsider after P0 / P1 ship".

## How to apply

For each finding written in the review:

1. Score impact honestly. The bias is to overstate impact for findings the user feels strongly about; counteract by asking "would a stranger using this for the first time even notice?".
2. Score effort honestly. The bias is to understate effort to make a finding actionable; counteract by asking "if I had to ship this today, how long would it actually take, including testing?".
3. Place it in the matrix.
4. Write the priority next to the finding.

## What this matrix is NOT

- Not a moral ranking. A "defer" finding is not a bad finding; it is a real issue with bad ROI right now.
- Not a forever ranking. A defer item can move to P0 next month if usage patterns change.
- Not a substitute for taste. The matrix is a guardrail, not the decision.
