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

## Infra & DevX load-bearing test

Test: is the project a tool, SDK, or infrastructure component that another developer would use? Does the demo show it being used in a real workflow?

- If yes (the demo shows a developer using the tool to accomplish something they could not easily do with existing tooling): score 3 stands.
- If no (the tool is a thin wrapper around existing SDK methods, or the demo only shows the tool's authors using it): score 2.

Also check: does the tool solve a pain point that is specific to Sui development? A generic blockchain tool ported to Sui without Sui-specific value is a 2.

## ONE Championship load-bearing test

Test: does the demo show a fan engagement, sports data, collectible, or entertainment experience that is designed for the ONE Championship audience or combat sports fans?

- If yes (the product targets sports/combat-sports fans and the fan engagement mechanic is the core value): score 3 stands.
- If no (sports is one of many categories, or the "fan" layer is a cosmetic skin on a generic app): score 2.

Also check: does the on-chain component matter? A pure off-chain sports app with a token tacked on is a 2.

## EVE Frontier load-bearing test

Test: remove the EVE Frontier integration (Smart Assemblies, game state reads, EVE economy interaction). Does the project still make sense?

- If yes (the project works as a standalone tool without EVE context): score 2.
- If no (the project is specifically a Smart Assembly mod, EVE game tool, or experience that only exists inside EVE Frontier): score 3.

Also check: is the EVE integration real? A project that reads EVE data from a public API but does not interact with Smart Assemblies or the EVE economy on-chain is a 2.

## Degen load-bearing test

Test: is the core mechanic a meme launch, bonding curve, gamified trading loop, or viral social trading experience? Does the demo show this mechanic working end to end?

- If yes (the degen mechanic is the product and the demo exercises it fully): score 3 stands.
- If no (the degen element is branding or a side feature in a broader DeFi product): score 2.

Also check: does the on-chain mechanic go beyond a standard token mint? A project that just mints a meme token with no novel bonding curve, gamification, or viral mechanic is a 1.

## Payments & Wallets load-bearing test

Test: is the project a wallet, payment rail, or transaction sponsorship layer? Does the demo show end users paying, receiving, or interacting through the wallet/payment UX?

- If yes (the payment/wallet infrastructure is the product): score 3 stands.
- If no (the project is an app that accepts payments, not payment infrastructure itself): score 2.

Also check: does the wallet or payment feature go beyond standard @mysten/dapp-kit wallet connection? Novel UX (gasless onboarding, paylinks, multi-sig wallets, sponsored transactions as a service) is required for a 3.

## Entertainment & Culture load-bearing test

Test: does the demo show a consumer interacting with a game, social app, NFT platform, or cultural experience where Sui is load-bearing?

- If yes (the Sui integration powers the consumer experience, e.g. object ownership for game items, Kiosk for NFT marketplace, on-chain game state): score 3 stands.
- If no (the game or app is off-chain with only a leaderboard or achievement badge on-chain): score 2.

Also check: would the experience break without Sui? If the product works fine as a Web2 app with a token bolted on, it is a 2.

## Explorations load-bearing test

Test: does the project genuinely not fit any of the ten specific tracks? Is the novel mechanic (RWA, DePIN, cross-chain, or something genuinely new) working end to end in the demo?

- If yes (the project is a real experiment that does not fit elsewhere and the demo shows the novel mechanic): score 3 stands.
- If no (the project could fit another track, or the "novel" aspect is aspirational): score 2.

Also check: Explorations is the catch-all. If a project plausibly scores 3 in another track, recommend that track instead of Explorations. Only recommend Explorations when no other track captures the project's core value.

## After verification

Update the score in the writeback. If a track was claimed at 3 and the test downgrades it to 2, name the gap explicitly. Examples:

- "Walrus is at 2 because the demo's hero image is served from a CDN with the Walrus blob as a fallback. Move the canonical render to Walrus to upgrade to 3."
- "Agentic Web is at 2 because the agent makes one signed transaction at the end of a long LLM chain. Add a real plan-act-observe-act cycle that responds to on-chain state to upgrade to 3."
- "DeFi & Payments is at 2 because the project is a forked AMM with no new composition. Pair it with a real new use case (e.g. an embedded payment rail for a consumer app) or deepen one of the other tracks."
- "Infra & DevX is at 2 because the SDK is a thin wrapper over suiClient.getObject. Add real value (caching, type generation, batch queries) to upgrade to 3."
- "ONE Championship is at 2 because the app has a sports collectibles section but the core product is a generic NFT marketplace. Make the sports fan experience the primary flow to upgrade to 3."
- "EVE Frontier is at 2 because the tool reads EVE game state but does not interact with Smart Assemblies. Build a real Smart Assembly mod to upgrade to 3."
- "Payments & Wallets is at 2 because the wallet connection uses standard dapp-kit with no UX innovation. Add gasless onboarding or paylinks to upgrade to 3."

## When no track reaches 3

Name the highest-scoring track from all eleven and the concrete change needed to upgrade it to 3. Quote the team-prerogative policy so the user knows they can still submit. The skill refuses to call a 2 a 3; it does not refuse the submission itself.
