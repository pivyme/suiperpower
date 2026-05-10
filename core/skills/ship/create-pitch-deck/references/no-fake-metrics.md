# No fake metrics

Every numerical claim on the deck must be cited or downgraded. The skill enforces this; the user can override but the override is logged in `Notes`.

## Cite this number

Acceptable citations:

- A measurement from the project's own data, with a date. ("142 testnet transactions, week of 2026-05-04.")
- A public benchmark with a source. ("Sui mainnet finality 0.39 seconds, source: official Mysten benchmark, 2025-09.")
- A committed forecast labeled as a forecast. ("Forecast: 1,000 paying users by month 6, based on 30% conversion of the 3,000 candidate users in our waitlist.")

## Downgrade these numbers

Numbers that fail the citation rule should be downgraded to a qualitative claim.

| Failed claim | Downgrade |
| --- | --- |
| "Millions of users" | "Hundreds of users in the validation cohort" |
| "10x faster than X" | "Notably faster than X under the conditions in our benchmark" |
| "Industry-leading retention" | "Retention loop validated at the day 1 / day 7 anchors" |
| "Massive market" | Drop the slide if there is no cited market sizing |

## Forecast vs measurement

Always label which is which. A measurement is a number observed; a forecast is a number projected. Never present a forecast in the same shape as a measurement.

Examples:

- "100 paying users (measured, 2026-05-01)" is a measurement.
- "Target: 1,000 paying users by Q4 (forecast, contingent on the experiment in `will-pay.md` passing)" is a forecast.

## When the source contradicts the claim

If `business-model.md` says "validated: no" and the deck slide says "users will pay", the deck is making a claim the source does not support. Rewrite the slide:

- Remove the claim, or
- Downgrade to a qualitative version ("we are running a paid experiment to validate willingness; results pending"), or
- Invest the time to upgrade `business-model.md` to a `partial` or `yes` verdict before the deck ships.

## What this rule is NOT

- Not a ban on optimism. Optimistic forecasts are fine when labeled.
- Not a ban on numbers. Real numbers, cited, are the strongest possible content on the deck.
- Not a one-time check. Re-run on every deck revision; numbers drift as the project evolves.
