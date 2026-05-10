# 19. Open questions

Live tracker for things we have not resolved yet. Each entry has a status, a needed-by date, and an owner.

Status values: `open`, `decided`, `deferred`.

## Critical (must resolve before T-3w)

| # | Question | Status | Needed by | Owner | Notes |
|---|---|---|---|---|---|
| 1 | GitHub handle / org for `github.com/<X>/suiperpower` | `open` | T-4w | Kelvin | Without this, we cannot reserve the npm name (since unrelated package metadata points at the repo) and we cannot publish |
| 2 | Domain `suiperpower.dev` available + registered | `open` | T-4w | Kelvin | Likely fine, .dev is open registration. Check Namecheap / Cloudflare / Google Domains. |
| 3 | npm package `suiperpower` available | `open` | T-4w | Kelvin | Check `npm view suiperpower` |
| 4 | Convex project owner account | `open` | T-4w | Kelvin | Free tier sufficient. Account that owns it should be the long-term maintainer's. |
| 5 | Vercel project owner account for suiperpower.dev | `open` | T-3w | Kelvin | Free tier sufficient. |

## Important (resolve before T-2w)

| # | Question | Status | Needed by | Owner | Notes |
|---|---|---|---|---|---|
| 6 | Twitter / X handle for the project | `open` | T-2w | Kelvin | Reserve `@suiperpower` / `@suiperpowerdev` whichever is available |
| 7 | Whether to maintain our own Telegram / Discord | `decided: no, v1` | T-2w | Kelvin | Use existing Sui Overflow Telegram + Sui Discord. Revisit post-launch. |
| 8 | Sui Overflow 2026 exact submission deadline | `open` | T-3w | Kelvin | Pull from participant handbook (https://go.sui.io/overflow26-participant-handbook). Drives the launch date. |
| 9 | Verify deepsurge.xyz form fields match what we generate | `open` | T-2w | Kelvin or maintainer | Fill out a sample submission (without submitting) to confirm field labels |
| 10 | Whether Sui-side MCP servers exist for: Mysten RPC, Pyth, Walrus | `open` | T-2w | Build phase research | If thin, ship our own wrappers under `mcps/` |
| 11 | OpenZeppelin Sui libraries: confirm public release status + repo location | `open` | T-2w | Build phase research | If pre-release, mark in `sponsor-docs/openzeppelin-sui.md` and adapt |
| 12 | Walrus' encryption story for sensitive content | `open` | T-2w | Build phase research | Sponsor doc needs this answered correctly |

## Should resolve (helpful, not blocking)

| # | Question | Status | Needed by | Owner | Notes |
|---|---|---|---|---|---|
| 13 | Whether to support self-hosting of the Convex backend | `decided: yes, via convexUrl override` | n/a | n/a | Documented in `13-CONVEX-BACKEND.md` |
| 14 | Whether to ship Continue.dev / Aider / Goose support in v1 | `decided: no, post-v1` | n/a | n/a | Cursor + Claude + Codex is enough surface for v1 |
| 15 | Whether to namespace skills under `~/.claude/skills/suiperpower/<name>` or flat | `decided: flat by default, prompt on conflict` | n/a | n/a | Documented in `09-MULTI-AGENT-PARITY.md` |
| 16 | Whether to ship an `apply-for-real-funding` skill in v1 | `decided: no, v1.2` | n/a | n/a | Out of scope until users actually finish projects |
| 17 | Whether to adopt the `solana-pass.sh` local-dev pattern (`suiperpower-pass.sh`) | `open` | T-1w | Kelvin | Useful for contributors. Keep simple. |
| 18 | Whether to bundle Anthropic / OpenAI / Cursor API keys in any way | `decided: no` | n/a | n/a | User brings their own. We never store keys. |
| 19 | Whether the CLI should have a `--quiet` mode that skips banners | `decided: yes` | T-1w | Build phase | Banner shown by `init`, suppressed elsewhere if `--quiet` or non-TTY |
| 20 | Whether to include analytics like Plausible on the website | `decided: yes, privacy-friendly` | T-1w | Build phase | Plausible or Vercel Analytics. No GA. |

## Sponsor-specific open questions

| # | Question | Status | Needed by | Owner | Notes |
|---|---|---|---|---|---|
| 21 | Walrus team contact for review of `sponsor-docs/walrus.md` | `open` | T-1w | Kelvin | Reach out via Sui Discord / Walrus Discord |
| 22 | DeepBook team contact for review of `sponsor-docs/deepbook.md` | `open` | T-1w | Kelvin | |
| 23 | OpenZeppelin team contact for the Sui libs review | `open` | T-1w | Kelvin | |
| 24 | OtterSec team contact for `sponsor-docs/ottersec-checklist.md` review | `open` | T-1w | Kelvin | |
| 25 | Scallop team contact + university award details | `open` | T-1w | Kelvin | |

## Content questions

| # | Question | Status | Needed by | Owner | Notes |
|---|---|---|---|---|---|
| 26 | Past Sui Overflow winner data: where to source | `open` | T-2w | Build phase research | Check overflow.sui.io, Sui Foundation blog, past hackathon retros |
| 27 | Whether Superteam Sui chapter exists with publishable ideas | `open` | T-2w | Kelvin | If no, drop `superteam-sui-ideas.json` from v1 |
| 28 | a16z 2026 State of Crypto, publish date | `open` | T-2w | Kelvin | If not yet released, use 2025 with Sui re-tagging |
| 29 | YC's most-recent crypto RFS list URL | `open` | T-2w | Build phase research | ycombinator.com/rfs |

## Brand / legal

| # | Question | Status | Needed by | Owner | Notes |
|---|---|---|---|---|---|
| 30 | Trademark conflicts with the name "Suiperpower" | `open` | T-3w | Kelvin | Quick USPTO + general web search |
| 31 | Logo, file dimensions and source asset path | `open` | T-1w | Kelvin | We will not block launch on this; placeholder text logo is fine |
| 32 | Privacy policy template source (we want a real one, not boilerplate) | `open` | T-2w | Kelvin | Use a privacy-focused template, customize for our actual data flow |

## Risks (track even if not actionable)

- **Risk**: Sui Foundation publishes a competing tool or skill set during our build window. **Response**: We integrate / interop, do not compete. Suiperpower is the user-facing journey, theirs may be primitives.
- **Risk**: a sponsor disengages and asks us to remove their integration. **Response**: We comply, document the removal in changelog, recommend ecosystem alternatives.
- **Risk**: npm package gets typosquatted (`suiperpwer`, `suipeerpower`, etc). **Response**: Reserve common typos at launch.
- **Risk**: solana-new team objects to the format mirroring (we use similar patterns). **Response**: We credit them in README. Skills are markdown, the format is common, but we are explicit about origin.

## How to add an open question

Append a row. Set status `open`. Add a needed-by date. Tag an owner. Move to `decided` once resolved, with a one-line note.

## Decided log (keep for reference)

| # | Decision | Date |
|---|---|---|
| 7 | No own Telegram/Discord in v1 | 2026-05-10 |
| 13 | Self-hosting Convex supported via `convexUrl` override | 2026-05-10 |
| 14 | Cursor + Claude + Codex only for v1 | 2026-05-10 |
| 15 | Skills installed flat by default, prompt on conflict | 2026-05-10 |
| 16 | `apply-for-real-funding` deferred to v1.2 | 2026-05-10 |
| 18 | Never bundle agent API keys | 2026-05-10 |
| 19 | `--quiet` mode supported | 2026-05-10 |
| 20 | Privacy-friendly analytics (Plausible / Vercel) | 2026-05-10 |

## Cross-references to detailed plans

Several open-question areas have full plan docs that supersede informal notes here:

- Contribution / supply-chain rules: see `20-CONTRIBUTING-PLAN.md`
- Testing strategy: see `21-TESTING-STRATEGY.md`
- Sample SKILL.md (resolves "what does a real skill look like"): see `22-SAMPLE-SKILL.md`
- Skill routing seed: see `23-SKILL-ROUTER-SPEC.md`
- Overflow participant playbook: see `24-OVERFLOW-2026-PLAYBOOK.md`
- Security posture (resolves "is curl-to-bash trustworthy"): see `25-SECURITY-POSTURE.md`
- Worked example journey: see `26-EXAMPLE-USER-JOURNEY.md`
- Governance / sustainability: see `27-GOVERNANCE-AND-SUSTAINABILITY.md`
- Competitive landscape: see `28-COMPETITIVE-LANDSCAPE.md`
- Docs authoring standards: see `29-DOCS-AUTHORING-STANDARDS.md`
- Shared guides + phase-handoff specs: see `30-SHARED-GUIDES-SPEC.md`

Open questions that remain genuinely open (not subsumed by another plan): rows above.
