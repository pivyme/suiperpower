# Scoring rubric

Score each candidate on four axes, 1 to 5 each, sum to a 4-20 score. Use this to rank, not to dictate. A 16 with a clear reason to lose to a 13 is fine if the user surfaces a real reason.

## Sui-native fit (1-5)

How much of the value comes from Sui-specific primitives?

- **5**: cannot be built on EVM or Solana without major loss of value (e.g. a marketplace that depends on Kiosk, a storage product on Walrus, a DEX deeply tied to DeepBook orderbook semantics, fast finality apps).
- **4**: clearly easier or cheaper on Sui (e.g. high-frequency consumer apps that benefit from parallel execution, mobile-first apps using zkLogin).
- **3**: works on Sui as well as elsewhere, no special advantage.
- **2**: works on Sui but slightly worse than on the alternative.
- **1**: forced fit. The idea wants to be on EVM or Solana.

Reject any candidate that scores 1 or 2 unless the user has a specific reason to insist.

## Market timing (1-5)

Is the demand visible right now?

- **5**: real revenue exists somewhere (another chain, off-chain), users are searching, sponsors are funding.
- **4**: clear demand signal (community discussions, recent fundraises in the category, search trend up).
- **3**: theoretical demand. People nod when you describe it but no one is paying.
- **2**: maybe a future market, hard to validate today.
- **1**: speculative. Built on assumptions about future user behavior.

A score of 1 or 2 here is fine for a research bet but not for a 4-week sprint.

## Builder fit (1-5)

Can THIS user, on THIS timeline, ship a v1?

- **5**: matches their prior experience and the timeline is generous.
- **4**: stretch but reasonable.
- **3**: doable with focus.
- **2**: tight, needs cuts to scope.
- **1**: unrealistic. Either the user has not shipped at this complexity before, or the timeline is too short.

A score of 1 here means the idea is wrong for this user, even if it is right in the abstract.

## Differentiation (1-5)

What does the candidate do that the existing Sui ecosystem does not?

- **5**: clear gap. No one is doing it. Or one team is doing it badly with public friction signals.
- **4**: one or two competitors but unclear winner; positioning is open.
- **3**: established competition but a defensible angle (audience, mechanism, surface area).
- **2**: crowded field, candidate would be the third or fourth entrant with no clear edge.
- **1**: dominant incumbent. The candidate would be a "me too".

If the differentiation is below 3, the candidate needs a specific angle the user can articulate in one sentence. "We will be cheaper" does not count.

## Score interpretation

- **17-20**: strong candidate, present.
- **13-16**: viable candidate. Often the right pick if the user has a specific reason to prefer it over a higher-scored one.
- **9-12**: ok-to-discuss. Probably not the lead.
- **4-8**: drop unless the user names a hard reason to keep.

## Tie-breaks

When two candidates score equally:

1. Prefer the one with a clearer riskiest assumption (specific, falsifiable beats vague).
2. Prefer the one with a closer match to the user's prior experience.
3. Prefer the one with a sponsor track alignment if Sui Overflow is the target.
4. Prefer the one with a smaller v1 scope.

## Anti-pattern: scoring as cover

If the user wants to pick a candidate that the score does not favor, the right answer is to ask why and update the scores if the user surfaces a real reason. Do not let the rubric override the user's judgment when they have one. The rubric is for filtering noise, not for ruling.
