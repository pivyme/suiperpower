# Demand evidence questions

The single most common slop in idea validation is unsupported demand claims. "I think people will love this" is not evidence. Walk these questions until at least one yields a concrete signal.

## The pay test

- Has anyone paid (in any currency, on any chain or off-chain) for something that solves the same problem? Name the product. Name the price. Name the audience size if known.
- Has a sponsor (Sui Foundation, a track sponsor, a grants program) explicitly funded the category in the last 12 months? Cite the announcement.
- Are there public revenue numbers from a competitor (DeFiLlama, Token Terminal, the project's own dashboard)?

If yes to one, demand is at least medium.

## The search test

- Search the category on Twitter / X. Are there at least 5 distinct people in the last 30 days asking for this? Quote one or two.
- Search the relevant Discord / Telegram. Same question.
- Google search trends, where the trend is up or stable in the last 12 months. Note the trend shape.

If yes, demand has search-level signal.

## The frustration test

- Does an existing solution exist that users complain about publicly? Quote a complaint.
- What specifically does the candidate fix that the existing solution does not?
- Does the user (the builder) personally experience the frustration in their own work?

Personal frustration is weak demand evidence. Personal frustration plus public signal is strong.

## The interview test

- If the user has time before scaffolding, can they interview 5 to 10 prospective users in the next week? What would they ask?
- If the user has already done interviews, what was the most surprising thing they heard?

Interview evidence is medium-strength on its own. Strong only when combined with at least one search or pay signal.

## Anti-evidence patterns

Reject these as "demand evidence" when offered:

- "It is obvious" or "everyone needs this".
- "AI / crypto / X is hot, so this is hot."
- "I would use it" (the builder is not the customer unless they are also the audience).
- A LinkedIn poll with under 50 votes.
- An LLM-generated market-size number with no source.

If the user offers anti-evidence, restate the question and ask for harder signal.

## Evidence triage

The skill writes a one-liner per piece of evidence:

```markdown
- evidence: <citation>, strength: <strong | medium | weak>, why: <one sentence>
```

Aggregate to demand evidence rating:

- **strong**: at least one strong + one medium, or two strongs.
- **medium**: at least one medium, no strong required.
- **weak**: only personal frustration or "obvious" claims.

A weak rating does NOT auto-kill the idea, but it does push the recommendation toward `go-with-pivot` or `no-go` unless the other dimensions compensate.
