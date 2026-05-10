# Seven roast dimensions

Walk these in order. For each, write a diagnosis only if there is a real weakness. Do not pad.

## 1. Generic positioning

Diagnostic questions:

- Is the positioning sentence interchangeable with five other Sui projects in the catalog?
- Does it name a specific user, a specific pain, and a specific alternative?
- If you remove the chain name, is the sentence still distinct?

Example diagnosis:

> The positioning "decentralized social on Sui" applies to 12 other projects in the catalog. Name the user (game guild leaders, on-chain analysts, kiosk sellers) and the alternative (Discord, Mirror, X) explicitly.

## 2. Unclear value

Diagnostic questions:

- Within 10 seconds of seeing the product, can a stranger say what it does and why they would care?
- Is the value claim concrete (saves N hours, makes N basis points) or abstract (better experience, faster)?
- Does the demo show value in the first 30 seconds, or does it show navigation?

Example diagnosis:

> The first paint shows a sidebar and an empty dashboard. Lead with the outcome a user gets in their first session. Move "settings" off the homepage.

## 3. Demo theater

Diagnostic questions:

- Is the demo a recorded happy path? Does it show error handling, empty states, real network latency?
- Is the data hand-curated to make the product look more lively than it is?
- Are the testnet transactions actually finalizing, or are they hand-crafted screenshots?

Example diagnosis:

> The demo cuts to a "transaction confirmed" toast within 200 ms, but Sui finality on testnet is closer to 2 seconds. Either show the loading state honestly or run a localnet so the demo timing is real.

## 4. Missing competitive moat

Diagnostic questions:

- Why won't the next builder copy this in two weekends?
- Is the moat data, distribution, network effects, regulatory, or speed of execution?
- If "speed of execution", can the user back this with a credible track record?

Example diagnosis:

> The moat is "we shipped first". A copy is one weekend of work for a competent Move dev. Either find a real moat (data, integrations, brand) or accept that the moat is execution and lean into shipping more.

## 5. Pricing that does not make sense

Diagnostic questions:

- Does the pricing math support a sustainable margin? Does it cover Walrus / DeepBook / RPC / hosting at scale?
- Does the price match the payer's willingness from `business-model.md` or `will-pay.md`?
- Is the cadence (per tx, per month, per volume) right for the value cadence?

Example diagnosis:

> $5 per month does not cover Walrus storage at the volumes the demo implies. Either raise the price, change the cadence to per upload, or cap storage per tier.

## 6. Tech that is not load-bearing

Diagnostic questions:

- Would the product still work if you swapped Sui for another chain?
- Would it work with no chain at all?
- For each sponsor protocol used (Walrus, DeepBook, Scallop, zkLogin), is the product genuinely better with it, or is the integration a sticker?

Example diagnosis:

> The product uses zkLogin for sign-in but no other Sui primitive is load-bearing. The same UX runs on a Web2 OAuth + a postgres database. Either commit to using owned objects for the user's data and ship the on-chain advantages, or drop the chain claim.

## 7. Brand that is forgettable

Diagnostic questions:

- Does the name help or hurt recall? Is it pronounceable, spellable, distinctive?
- Is the visual identity distinguishable from the next 10 projects?
- Does the homepage render the same as a generic Vercel or Next.js template?

Example diagnosis:

> The name shares a stem with three other Sui projects, the homepage uses the default Vercel font and gradient, and there is no consistent typography or color logic. Pick a single typeface, a single accent color, and one structural element that recurs.

## How to write the diagnosis

- One sentence diagnosis. Specific, not vague.
- One sentence fix. Actionable in 24 hours.
- No softening qualifiers ("might", "could", "perhaps"). Direct.
- No insults. Critique the work, not the person.
