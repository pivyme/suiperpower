# Load-bearing tests per track

A score of 3 is a claim that removing the track-defining piece breaks the demo or the product's reason to exist. Verify the claim by running the test below for any track scored 3. If the test does not produce the stated outcome, downgrade to 2.

## Agentic Web load-bearing test

Test: in the demo, can the agent decide, act on chain, observe the result, and act again, without a human in the loop for at least one full cycle?

- If yes (the agent autonomously runs at least one plan-act-observe-act cycle and the user-visible flow depends on it): score 3 stands.
- If no (the "agent" is a one-shot text generator, or the on-chain step is hand-triggered each time): score 2.

Also check: does the agent use Sui-specific mechanics (object ownership, capabilities, PTB composition) or is it provider-agnostic LLM glue? Pure LLM glue with a single signed transaction at the end is a 2.

## DeFi & Payments load-bearing test

Test: walk the demo. Does real on-chain value movement happen on the critical path, and would the project lose its reason to exist if you removed it?

- If yes (the demo executes a real lending, AMM, payment, RWA, or derivative flow and the product is defined by that flow): score 3 stands.
- If no (the financial flow is a side feature, or it is a fork-with-recolor of an existing primitive without a new use case): score 2.

Also check: are real Sui mechanics used (Coin, shared Object, capabilities) or is the flow generic ERC-20-style transfers? Generic transfers alone are a 2.

## Walrus load-bearing test

Test: comment out the Walrus retrieval call in the demo path. Run the demo. Does the user-visible output break?

- If yes (broken UI, missing media, wrong content): score 3 stands.
- If no (a fallback CDN serves the same content, or the missing blob does not matter): score 2.

Also check: is the data being stored non-trivial (real media, verifiable artifacts, model weights)? Placeholder JSON or text-only metadata that could live anywhere is a 2 at best.

## DeepBook load-bearing test

Test: remove the order placement or settlement call from the demo path. Does the project still complete its core flow?

- If yes (a static price feed could replace it, or the project does not depend on order execution): score 2.
- If no (the demo's whole point is a settled DeepBook trade or a market built on DeepBook): score 3.

## After verification

Update the score in the writeback. If a track was claimed at 3 and the test downgrades it to 2, name the gap explicitly. Examples:

- "Walrus is at 2 because the demo's hero image is served from a CDN with the Walrus blob as a fallback. Move the canonical render to Walrus to upgrade to 3."
- "Agentic Web is at 2 because the agent makes one signed transaction at the end of a long LLM chain. Add a real plan-act-observe-act cycle that responds to on-chain state to upgrade to 3."
- "DeFi & Payments is at 2 because the project is a forked AMM with no new composition. Pair it with a real new use case (e.g. an embedded payment rail for a consumer app) or deepen one of the other three tracks."

## When no track reaches 3

Name the highest-scoring track and the concrete change needed to upgrade it to 3. Quote the team-prerogative policy so the user knows they can still submit. The skill refuses to call a 2 a 3; it does not refuse the submission itself.
