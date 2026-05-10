# deepsurge.xyz form copy template

Field-by-field copy template for Sui Overflow submissions. The skill emits text to paste; the user submits in their browser.

## Project name

Under 80 characters. Pronounceable. No emoji. No version suffix.

Slot:

> <project name>

## One-liner

One sentence under 140 characters. Names the user and the outcome.

Slot:

> <project name> helps <user> <do the thing they currently can't do well>.

## Short description (80 to 150 words)

One paragraph. Lead with the problem, then the solution, then the user. End on the load-bearing Sui primitive that makes this approach possible.

Template:

> <user> currently <painful current behavior>. The cost is <named cost: time, money, lost upside>. <Project name> <one sentence on what it does>. The user <one sentence on the new behavior>. The result is <outcome>. We use <Sui primitive: objects, capabilities, PTBs, or sponsor protocol> because <one sentence on why this primitive is load-bearing>.

## Long description (300 to 500 words)

Three paragraphs:

1. Problem and user. Cite a concrete behavior or pattern, not a generic market.
2. Solution. How the product works, end to end. Name the load-bearing flow.
3. Why Sui. Cite the primitive that makes this implementation possible. If the answer is "we wanted to be on Sui", rewrite this paragraph until it cites a primitive.

## Tracks

- Primary track: <from `track-pick.md`>
- Secondary track (if hackathon allows): <from `track-pick.md` or none>

## Team

Format: `Name | Role | Contact`. Roles are concrete (Move, frontend, design, biz) not generic (founder).

Slot:

> <name> | <role> | <contact>
> <name> | <role> | <contact>

## Repo URL

The repository hosting the code. Public by submission time.

Slot:

> <https://github.com/...>

## Demo URL

A reachable hosted demo. If the demo requires testnet, name that explicitly in the description so judges know to switch networks.

Slot:

> <https://...>

## Video URL

The demo video, hosted on a platform that allows the deepsurge.xyz embed.

Slot:

> <https://...>

## Pitch deck URL

A link the judges can open without authentication.

Slot:

> <https://...>

## Package id

Pulled from `deploy-context.md`. State the env: testnet or mainnet.

Slot:

> <0x...> (mainnet | testnet)

## Logo and cover

- Logo: 1280x1280 PNG. Transparent background OK. No watermark.
- Cover: 1920x1080 PNG. The cover is the first impression; treat it like a poster, not a screenshot.

## Field-by-field rules

- No banned words: "leverage", "cutting-edge", "world-class", "revolutionary", "AI-powered", "Web3".
- No em-dashes anywhere. Use commas or periods.
- Capitalize Sui-specific terms: Move, Object, PTB, Walrus, DeepBook, Scallop, Kiosk, zkLogin.
- No emojis in product copy.
- The same text in description, video, and pitch deck must use the same project name and one-liner. Inconsistency reads as low effort.
