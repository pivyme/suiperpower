---
name: solana-new (superstack) architecture reference
description: Complete structural analysis of sendaifun/solana-new (the Solana equivalent of suiperpower) covering all 32 skills, CLI commands, catalog data, install flow, multi-agent support, and skill format. Key comparison baseline for suiperpower development. Updated 2026-05-11 with verified file counts from vendored copy.
type: reference
---

Full research report delivered on 2026-05-11. Verified from vendored copy at reference/solana-new-main/.

## Verified Counts (from actual files)

- **32 SKILL.md files on disk** across 3 phases: idea (7), build (19), launch (6)
- SKILL_ROUTER also lists 6 planned-but-not-implemented skills: solana-security-audit, solana-qa, solana-benchmark, solana-canary, solana-retro, solana-ship
- **109 reference docs** across skills (in references/ subdirectories)
- **30 openai.yaml** Codex agent files (one per skill except 2)
- **106 clonable repos** in cli/data/clonable-repos.json
- **36 MCP servers** in cli/data/solana-mcps.json
- **80 ecosystem skills** in cli/data/solana-skills.json (15 official + 65 community)
- **521 curated startup ideas** across 10 JSON files in skills/data/ideas/
- **7 knowledge docs** in skills/data/solana-knowledge/ (3,801 lines total)
- **11 guides** in skills/data/guides/ (2,831 lines total, includes YC/a16z/alliance idea docs)
- **1 phase handoff spec** in skills/data/specs/phase-handoff.md

## CLI Commands (10 total)
ship, init, search, repos, skills, copilot, doctor, feedback, uninstall, completion

## Architecture
- CLI: zero runtime deps (only convex as dependency), 636 lines index.ts
- Install: curl one-liner at solana.new/setup.sh, npm global install, postinstall hook runs init
- Skills install to ~/.claude/skills/ and ~/.codex/skills/ (no Cursor support)
- Phase handoff via .superstack/ directory (idea-context.md, build-context.md, learnings.md)
- Convex backend for telemetry (3-tier: off/anonymous/community) + feedback
- Colosseum Copilot integration (external API at copilot.colosseum.com, requires PAT)
- Interactive TUI modes: onboarding (663 lines), journey (386 lines), workspace-setup (627 lines)
- Landing page separate repo: solana-new-landing.vercel.app (proxied via vercel.json rewrites)
- No CI/CD (no .github directory)
- skills-lock.json tracks only 5 Convex agent skills (not journey skills)

## Notable Features Suiperpower Should Match/Exceed
1. Colosseum Copilot (5,400+ hackathon projects) - suiperpower equivalent: overflow-copilot
2. DefiLlama research skill - no direct Sui equivalent in suiperpower yet
3. Brand design with HTML browser preview (palette generation + shadcn integration)
4. CSO security skill (630 lines, largest skill, comprehensive infrastructure audit)
5. Workspace setup that auto-installs skills, MCPs, and clones repos from onboarding flow
6. Copilot token management (--token flag, interactive prompt, env var support)
7. All commands support --agent flag for machine-readable output

**Why:** This is the primary reference architecture that suiperpower is modeled after. Understanding exact feature parity helps prioritize what to build.

**How to apply:** When authoring suiperpower skills, CLI features, or catalog data, compare against this baseline. Match or exceed where it makes sense for Sui.
