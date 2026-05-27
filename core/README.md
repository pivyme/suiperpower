<div align="center">

<img src="https://raw.githubusercontent.com/pivyme/suiperpower/main/web/public/assets/suiperpower-og.png" alt="Suiperpower" width="100%" />

# Suiperpower

**Build something meaningful, on Sui.**

A superpower for AI coding agents to ship real products on Sui.

[Website](https://suiperpower.dev) · [Skills](https://suiperpower.dev/skills) · [GitHub](https://github.com/pivyme/suiperpower) · [Sui Overflow 2026](https://overflow.sui.io)

</div>

---

Your AI coding agent has never written Move before. Suiperpower fixes that.

It's an open platform of 60 production-grade skills, a curated ecosystem catalog, a Sui knowledge base, and a CLI that turns Claude Code, Codex, Cursor, or Grok Build into a senior Sui engineer sitting next to you. One curl install, four agents, every Sui project from here on.

Built around an explicit anti-slop bar so the project survives past the hackathon, not just wins it.

## Install

```bash
curl -fsSL https://suiperpower.dev/setup.sh | bash
```

Requirements: Node.js 20+, git.

Or install the CLI directly from npm:

```bash
npm install -g @pivyme/suiperpower
```

The installer writes Codex skills to `~/.codex/skills/`, Cursor rules to `~/.cursor/rules/`, Grok Build skills to `~/.grok/skills/`, and prints the Claude Code plugin commands:

```text
/plugin marketplace add pivyme/suiperpower
/plugin install suiper@suiperpower
```

Two bin entries resolve to the same dispatcher. `suiper` for daily typing, `suiperpower` for the unambiguous brand. Both work everywhere.

```bash
suiper init       # set up agents in this repo
suiper doctor     # check your install
suiper update     # pull the latest skills
```

## Drive it

```bash
claude "/suiper:find-next-sui-idea what should I build for Sui Overflow?"
claude "/suiper:scaffold-project escrow with Walrus storage"
claude "/suiper:build-with-claude help me build the MVP"
claude "/suiper:build-with-move add the lock function"
claude "/suiper:deploy-to-testnet"
claude "/suiper:submit-to-sui-overflow"
```

Use the `/suiper:` prefix in Claude Code. Use the bare skill name in Codex, Cursor, and Grok Build. Skills auto-route by intent, so you mostly don't need to remember names.

## Why this exists

Most Sui hackathon submissions are built for the hackathon, not to actually become a product. They die the moment the prize is paid. No business model, no retention loop, no real users.

The Sui team made the bar explicit for Overflow 2026:

> Judging criteria place much stronger emphasis on product quality, real-world application, technical execution, and overall polish.

Suiperpower is shaped around that bar. Every build skill embeds a "will this survive past the hackathon" gate. The sponsor integrations are load-bearing, not decoration. The submission flow refuses to package against placeholder content.

From the creator:

> Most Sui hackathon submissions are built for the hackathon, not to actually become a product. That always bothered me. So I poured my product thinking into Suiperpower, so the agent acts like a brutally honest senior engineer that won't sugarcoat anything. This is my giveback to the Sui community. If it raises the bar of what gets shipped on Sui, that is the win.

[Kelvin Adithya](https://klvn.dev), co-founder of [PIVY](https://pivy.me) (1st place, Payment & Wallets track, Sui Overflow 2025).

## What it is, what it isn't

It is:

- A single source of senior Sui taste for any AI agent in your editor
- A skill library grounded in real Sui docs, OpenZeppelin Move, sponsor APIs, not training-data guesses
- A CLI with zero runtime deps, ESM TypeScript, opt-in anonymous telemetry
- Open source, MIT, independent

It isn't:

- A Sui Foundation product
- A webapp, dashboard, or signup flow
- A hackathon-only tool
- A paid product

## The journey

Six phases. Skills hand off through the filesystem so your agent never loses context between them.

| # | Phase | What happens |
|---|---|---|
| 01 | **Learn** | Get oriented on Sui without a 50-tab research session |
| 02 | **Idea** | Pressure-test what you want to build before writing a line of code |
| 03 | **Build** | Scaffold, integrate, iterate, with Sui knowledge your agent can read |
| 04 | **Ship** | Get to mainnet without skipping the gates that catch real bugs |
| 05 | Grow | Earn first users, not just a launch tweet *(in progress)* |
| 06 | Earn | Turn real users into real revenue, not vanity metrics *(in progress)* |

Each phase writes context to `.suiperpower/` in your project. The next phase reads it automatically. Handoff is optional, not a gate. Any skill can be invoked standalone.

## Skills (60 today)

Browse the live tree under [`core/skills/`](https://github.com/pivyme/suiperpower/tree/main/core/skills) or the rendered catalog at [suiperpower.dev/skills](https://suiperpower.dev/skills).

| Phase | Count | Examples |
|---|---|---|
| Learn | 2 | `sui-beginner` · `learn` |
| Idea | 7 | `find-next-sui-idea` · `validate-idea` · `competitive-landscape` |
| Build | 43 | `build-with-move` · `ptb-composer` · `walrus-storage` · `deepbook-orderbook` |
| Ship | 8 | `deploy-to-testnet` · `deploy-to-mainnet` · `submit-to-sui-overflow` |

## Anti-slop, the actual differentiator

Every build skill answers one question. Will this survive past the hackathon. If the answer is no, the agent says so.

- `/validate-business-model` who pays, how much, why they keep paying
- `/retention-loop` what pulls users back on day 7, day 30
- `/will-real-users-pay` cheap pricing experiments before launch
- `/roast-my-product` brutal critique, investor-grade
- `/product-review` balanced UX evaluation from a first-time user POV
- `/review-move` code quality and security review against the OWASP / Move ability checklist

`/submit-to-sui-overflow` refuses to generate a submission against placeholder content. The live URL must work, the package must verify on chain, the media must exist at the right dimensions. The skill is on your side, not the judges'.

## Sponsor integrations

Real integrations only. `/pick-my-sui-track` recommends a track based on actual integration depth in your repo, not marketing intent.

| Sponsor | Role | First-class skills |
|---|---|---|
| **Walrus** | Headline partner | `/walrus-storage`, `/walrus-sites`, `/walrus-research` |
| **DeepBook** | Track sponsor | `/deepbook-orderbook`, `/deepbook-research` |
| **OpenZeppelin** | Prize sponsor | `/openzeppelin-sui-libs` |
| **OtterSec** | Prize sponsor | `/ottersec-prep` |
| **Scallop** | University award | `/scallop-money-market` |

Also wired in: Pyth, Seal, Nautilus, SuiNS, zkLogin, Cetus, NAVI, Kiosk, EVE Frontier.

## Multi-agent

| Agent | Install path | Invocation |
|---|---|---|
| Claude Code | Plugin marketplace, namespaced | `/suiper:<skill-name>` |
| Codex | `~/.codex/skills/<skill-name>/` | bare skill name |
| Cursor | `~/.cursor/rules/<skill-name>.mdc` | bare skill name |
| Grok Build | `~/.grok/skills/<skill-name>/` | bare skill name (`/<skill-name>`) |

Grok Build reads the Anthropic skill format straight from `~/.grok/skills/`, the same `SKILL.md` we ship, so it needs no separate generator. `suiper init` writes Codex, Cursor, and Grok formats by default and prints the Claude plugin install commands. `suiper init --vendor` writes all four into the current repo under namespaced folders, so teammates inherit the skill set on clone.

## Telemetry

Opt-in, anonymous by default. Tracks which skills get used and how long they take. No code, no file paths, no PII. Configure in `~/.suiperpower/config.json`:

```text
"off" | "anonymous" (default) | "community"
```

Source is public: [convex/telemetry.ts](https://github.com/pivyme/suiperpower/blob/main/convex/telemetry.ts). Read it before you trust it.

## Made by

Built by the [PIVY](https://pivy.me) team. PIVY won 1st place in the Payment & Wallets track at [Sui Overflow 2025](https://blog.sui.io/2025-sui-overflow-hackathon-winners/). We built Suiperpower to pass that same bar back to every Sui builder.

Independent project, MIT licensed, no Sui Foundation endorsement claimed.

## Contributing

PRs welcome. Before opening one, read [CONTRIBUTING.md](https://github.com/pivyme/suiperpower/blob/main/CONTRIBUTING.md), [AGENTS.md](https://github.com/pivyme/suiperpower/blob/main/AGENTS.md), and the skill authoring rules in [CLAUDE.md](https://github.com/pivyme/suiperpower/blob/main/CLAUDE.md). Skills must be grounded in real sources, not training-data guesses. Sui drifts fast.

## License

[MIT](https://github.com/pivyme/suiperpower/blob/main/LICENSE)

## Links

- [suiperpower.dev](https://suiperpower.dev)
- [Skills catalog](https://suiperpower.dev/skills)
- [GitHub](https://github.com/pivyme/suiperpower) · [Twitter / X](https://x.com/suiperpower)
- [Sui Overflow 2026](https://overflow.sui.io) · [Telegram](https://go.sui.io/suioverflow2026-tg)
- [Sui Docs](https://docs.sui.io)
</content>
</invoke>
