# Phase glossary

Suiperpower groups skills into five phases. Each phase corresponds to a moment in the journey from "I want to build on Sui" to "I am running a sustainable product".

## learn

Skills that teach Sui itself. The user knows nothing or knows another chain (EVM, Solana) and is mapping their mental model onto Sui. Output is understanding, not code.

Examples: `sui-beginner`, `learn`.

Use when the user is asking conceptual questions, not asking for code yet.

## idea

Skills that help pick what to build. The user has the desire to build, but no chosen idea, or an idea that has not been validated. Output is a chosen idea with a write-back to `.suiperpower/idea-context.md`.

Examples: `find-next-sui-idea`, `validate-idea`, `competitive-landscape`, `deepbook-research`, `walrus-research`, `overflow-copilot`.

Use before the user has scaffolded any code.

## build

Skills that produce code. The bulk of the catalog. Move authoring, frontend, sponsor integrations, debugging, internal review.

Examples: `build-with-move`, `walrus-storage`, `deepbook-orderbook`, `scallop-money-market`, `sui-zk-login`, `kiosk-marketplace`, `sponsored-transactions`, `ottersec-prep`, `openzeppelin-sui-libs`, `ptb-composer`, `object-model-design`, `scaffold-project`, `build-with-claude`, `virtual-sui-incubator`, `build-mobile-sui`, `launch-coin`, `debug-move`, `review-move`, `navigate-skills`, plus the design and anti-slop families.

Use when the user is writing code, debugging code, or reviewing their own code.

## ship

Skills that take working code into the world. Deploys, hackathon submission, pitch decks, grants.

Examples: `deploy-to-testnet`, `deploy-to-mainnet`, `pick-my-sui-track`, `submit-to-sui-overflow`, `create-pitch-deck`, `marketing-video`, `video-craft`, `apply-grant`.

Use when the project compiles and the user is moving to a real environment or audience.

## grow

Skills that handle post-launch concerns: distribution, retention, product-market fit. (Catalog is light here in v1; expands in later versions.)

Use when the project is live and the user is asking how to make it sustainable.

## How to use this glossary

- If the user's request maps to one phase, recommend skills from that phase first.
- If the request straddles phases (common: build + ship), recommend the earlier-phase skill first, since later-phase skills usually depend on its output.
- If the user is mid-phase but hitting a meta question ("am I doing this right"), the anti-slop family in build (`validate-business-model`, `roast-my-product`, `product-review`) is often the right answer.
