# Requirements Log

Durable steering accumulated during the autonomous build. Append-only, project memory, committed to git.

The build loop reads this every iteration and treats every entry as authoritative. If an entry belongs in CLAUDE.md or a plan, the loop will promote it and append `(promoted -> file)` to the entry.

Add new rules with: `./bigdev/autobuild say "your rule"`

---

- [2026-05-10 init] Suiperpower is for the Sui network only. Patterns and shapes from `reference/solana-new-main/` may be ADAPTED, but never copy Solana-specific content, branding, copy, ecosystem references, or commands. Translate concepts to Sui equivalents (Move, Slush, Mysten/Blockvision RPC, Sui multisig, MIST, capabilities) or drop the section entirely.
- [2026-05-10 init] Source-of-truth plans live in `plans/` (not `bigdev/plans/`). Use `plans/README.md` as the index. The TODO step descriptions name the exact plan file to load for that phase.
- [2026-05-10 init] No demo polish phases. The user is not presenting. Do not author DESIGN-SYSTEM.md, DEMO-FLOW.md, demo-script.md, preflight.md, or screenshot scaffolding.
- [2026-05-10 init] Website landing page is intentionally a text-only placeholder for v1. No styling, no design system, no Tailwind. Build phase 27 only scaffolds Next.js with a single `pre`-rendered text page.
- [2026-05-10 init] Per `~/.claude/CLAUDE.md`, Kelvin is the sole committer. NEVER add a `Co-Authored-By` line to any commit. Use the `/commit` skill but strip out any default co-author footer.
- [2026-05-10 init] Suiperpower project rules: no em-dashes anywhere; no banned words ("leverage", "cutting-edge", "world-class", "revolutionary", "AI-powered", "Web3"); capitalize Sui terms (Move, Object, PTB, Walrus, DeepBook, Scallop, Kiosk, zkLogin); kebab-case for all skill / file / catalog ids.
