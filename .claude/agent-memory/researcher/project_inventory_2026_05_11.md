---
name: suiperpower inventory 2026-05-11 skill-recheck audit
description: Full codebase audit on skill-recheck branch. 45 skills on disk, catalog JSONs severely underpopulated (4/4/4/5), no CI, no ESLint, no tests, no grow/ phase, website static-only.
type: project
---

## Codebase Inventory (2026-05-11, branch: skill-recheck)

### Skills: 45 total, all structurally complete
- learn/: 2, idea/: 6, build/: 29, ship/: 8, grow/: 0 (missing)
- Every skill has SKILL.md + agents/openai.yaml + references/ with 2-4 files

### Catalog JSON (core/cli/data/): severely underpopulated
- clonable-repos.json: 4 entries (plans target ~33+)
- sui-ideas.json: 5 entries
- sui-mcps.json: 4 entries
- sui-skills.json: 4 entries

### Knowledge docs (core/skills/data/): 23 files total
- sui-knowledge: 7, sponsor-docs: 5, guides: 5, ideas: 5 JSON, specs: 1

### CLI: 15 commands registered, 24 .ts files in core/cli/

### Infrastructure gaps
- No .github/ (no CI/CD at all)
- No ESLint, no Prettier config
- No test files anywhere
- No grow/ phase directory
- Website is static-only (no Next.js app)

**Why:** Baseline for completeness audit on skill-recheck branch.
**How to apply:** Compare catalog JSON counts vs plans targets to identify data population gaps.
