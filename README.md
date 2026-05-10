# suiperpower

> Build something meaningful, on Sui

The open platform behind [suiperpower.dev](https://suiperpower.dev). Skills, knowledge, and a CLI for shipping production Sui products with Claude Code, Codex, or Cursor.

Made for [Sui Overflow 2026](https://overflow.sui.io) participants. Built to keep working past the hackathon.

## Install

```bash
curl -fsSL https://suiperpower.dev/setup.sh | bash
```

Installs to `~/.claude/skills/`, `~/.codex/skills/`, and `~/.cursor/rules/`. Nothing touches your PATH or runs in the background.

**Requirements**: Node.js 20+ and git.

The CLI ships two bin entries that resolve to the same dispatcher: `suiper` for daily typing, `suiperpower` for unambiguous brand. Use either, both work everywhere.

```bash
suiper init        # same as: suiperpower init
suiper doctor      # same as: suiperpower doctor
```

## Quick start

```bash
claude "/find-next-sui-idea what should I build for Sui Overflow?"
claude "/scaffold-project escrow with Walrus storage"
claude "/build-with-claude help me build the MVP"
claude "/build-with-move add the lock function"
claude "/deploy-to-testnet"
claude "/submit-to-sui-overflow"
```

Skills auto-route by intent. You ask in natural language, the right skill activates. Same commands work in Codex and Cursor.

## Why it exists

Most hackathon submissions are slop. They die the moment the prize is paid. They have no business model, no retention loop, no real users.

The Sui team's 2026 message was clear:

> Teams that dedicate more time toward refining usability, functionality, and long-term value will generally be more competitive.

> Judging criteria place much stronger emphasis on product quality, real-world application, technical execution, and overall polish.

Suiperpower is built around that bar. Every build skill embeds a "will this survive past the hackathon" gate. Sponsor integrations are real, not cosmetic. Submission generator refuses to package a project against placeholder content.

## What you get

- **~30 journey skills** across Learn, Idea, Build, Ship phases
- **Sui knowledge base**: Move + objects, PTBs, Walrus, DeepBook, Scallop, OpenZeppelin, OtterSec
- **Ecosystem catalog**: clonable repos, MCP servers, ecosystem skills, 150+ curated startup ideas
- **Anti-slop quality gates** wired into every build skill
- **Hackathon submission generator**: package-id capture, deepsurge.xyz form copy, demo video script, day-of preflight
- **Sponsor integrations**: Walrus (headline), DeepBook (track), OpenZeppelin (prize), OtterSec (prize), Scallop (university award)

## Journey skills

| Phase | Skills |
|---|---|
| **Learn** | `sui-beginner`, `learn` |
| **Idea** | `find-next-sui-idea`, `validate-idea`, `competitive-landscape`, `deepbook-research`, `walrus-research`, `overflow-copilot` |
| **Build** | `scaffold-project`, `build-with-claude`, `virtual-sui-incubator`, `build-with-move`, `ptb-composer`, `object-model-design`, `walrus-storage`, `deepbook-orderbook`, `scallop-money-market`, `sui-zk-login`, `sponsored-transactions`, `kiosk-marketplace`, `build-mobile-sui`, `launch-coin`, `debug-move`, `review-move`, `ottersec-prep`, `openzeppelin-sui-libs`, `brand-design`, `frontend-design-guidelines`, `number-formatting`, `page-load-animations`, `design-taste`, `product-review`, `roast-my-product`, `validate-business-model`, `retention-loop`, `will-real-users-pay`, `navigate-skills` |
| **Ship** | `deploy-to-testnet`, `deploy-to-mainnet`, `pick-my-sui-track`, `submit-to-sui-overflow`, `create-pitch-deck`, `marketing-video`, `video-craft`, `apply-grant` |

Full descriptions and trigger phrases in [plans/04-SKILLS-CATALOG.md](plans/04-SKILLS-CATALOG.md).

## How phases connect

Each phase writes context to `.suiperpower/` in your project. The next phase reads it automatically.

```
find-next-sui-idea     ──writes──>  .suiperpower/idea-context.md
scaffold-project       ──reads───>  .suiperpower/idea-context.md
build-with-claude      ──writes──>  .suiperpower/build-context.md
deploy-to-testnet      ──reads───>  .suiperpower/build-context.md
submit-to-sui-overflow ──reads───>  .suiperpower/deploy-context.md, .suiperpower/build-context.md
```

Context handoff is **optional, not a gate**. Any skill can be invoked standalone, in which case it interviews you directly.

## Anti-slop framework

Every build skill has a "will this survive past the hackathon" gate. First-class anti-slop skills:

- `/validate-business-model`, who pays, how much, why they keep paying
- `/retention-loop`, what pulls users back on day 7, day 30
- `/will-real-users-pay`, cheap pricing experiments before launch
- `/roast-my-product`, brutal critique
- `/product-review`, balanced UX evaluation
- `/review-move`, code-quality + security review

`/submit-to-sui-overflow` refuses to generate a submission against placeholder content. The live URL must work, the package must verify on chain, the media must exist at the right dimensions. The skill is on your side, not the judges'.

Full framework in [plans/12-ANTI-SLOP-FRAMEWORK.md](plans/12-ANTI-SLOP-FRAMEWORK.md).

## Sponsor integrations

| Sponsor | Role | First-class skill |
|---|---|---|
| **Walrus** | Headline partner | `/walrus-storage`, `/walrus-research` |
| **DeepBook** | Track sponsor | `/deepbook-orderbook`, `/deepbook-research` |
| **OpenZeppelin** | Prize sponsor | `/openzeppelin-sui-libs` |
| **OtterSec** | Prize sponsor | `/ottersec-prep` |
| **Scallop** | University award sponsor | `/scallop-money-market` |

`/pick-my-sui-track` recommends the right track based on actual integration depth, not marketing intent. Detail in [plans/11-SPONSOR-INTEGRATION.md](plans/11-SPONSOR-INTEGRATION.md).

## Ecosystem catalog

Curated catalog the skills search and recommend from.

| Catalog | v1 target |
|---|---|
| Repos | 40-60 |
| Ecosystem skills | 15-25 |
| MCP servers | 10-15 |
| Curated ideas | 150+ |

Catalog data lives in `cli/data/`. Skills reference it automatically.

## Telemetry

Anonymous, opt-in, privacy-first. Tracks which skills get used and how long they take. No code, no file paths, no PII. Default after install is **anonymous** (or **off** if you choose).

```bash
# Configure in ~/.suiperpower/config.json
# Options: "off" | "anonymous" (default) | "community"
```

Source: [convex/telemetry.ts](convex/telemetry.ts). Read it before you trust it.

## Project structure

```
cli/                CLI source + ecosystem catalog data
skills/             Journey skills + Sui knowledge base + curated ideas
convex/             Telemetry + feedback backend
public/             setup.sh + assets served by the website
plans/              Source-of-truth planning docs
install.sh          Bash bootstrap, hosted at suiperpower.dev/setup.sh
README.md           This file
CLAUDE.md           Context for AI agents working on Suiperpower itself
```

Full tree in [plans/02-PROJECT-STRUCTURE.md](plans/02-PROJECT-STRUCTURE.md).

## Multi-agent

| Agent | Skills install path |
|---|---|
| Claude Code | `~/.claude/skills/<skill-name>/` |
| Codex | `~/.codex/skills/<skill-name>/` |
| Cursor | `~/.cursor/rules/<skill-name>.mdc` |

`suiperpower init` writes to all three by default. Detail in [plans/09-MULTI-AGENT-PARITY.md](plans/09-MULTI-AGENT-PARITY.md).

## Use in your repo (vendor mode)

Want your teammates to get all skills automatically when they clone?

```bash
suiper init --vendor
```

Copies skills into `<your-repo>/.claude/skills/suiperpower/`, `<repo>/.codex/skills/suiperpower/`, and `<repo>/.cursor/rules/suiperpower/`. Commit them, teammates clone, ready to go.

## Update

```bash
suiper update
```

Or re-curl the install URL. Both are idempotent and supported.

## Uninstall

```bash
suiper uninstall
```

Removes only files Suiperpower wrote. Your own skills are untouched.

## Contributing

We welcome PRs. Lowest-friction contributions:

- Add a repo / MCP / idea to `cli/data/*.json`
- Improve a skill's references or workflow
- Add a sponsor doc

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

## Credits

Built independently. Inspired by [solana-new](https://solana.new) (SendAI + Superteam).

Powered by the Sui ecosystem:

- [Sui Foundation](https://github.com/MystenLabs) and Mysten Labs, the protocol
- [Walrus](https://walrus.site), decentralized blob storage
- [DeepBook](https://deepbook.tech), on-chain CLOB
- [Scallop](https://scallop.io), money market
- [OpenZeppelin](https://openzeppelin.com), audited Move libraries
- [OtterSec](https://ottersec.io), Sui Move audits

And every Sui ecosystem team building primitives the rest of us depend on.

## License

[MIT](LICENSE)

## Links

- [Website](https://suiperpower.dev)
- [Sui Overflow 2026](https://overflow.sui.io)
- [Submission portal (deepsurge.xyz)](https://www.deepsurge.xyz/hackathons/b587dc0c-4cb8-4e63-ada5-519df38103bf)
- [Sui Overflow Telegram](https://go.sui.io/suioverflow2026-tg)
- [Participant Handbook](https://go.sui.io/overflow26-participant-handbook)
- [Sui Docs](https://docs.sui.io)
