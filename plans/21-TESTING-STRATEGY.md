# 21. Testing strategy

## Why a testing plan exists for a markdown-skills project

Suiperpower's surface is unusual. The CLI has TypeScript code that we can unit-test the normal way. The skills, however, are markdown prompts that ship to AI agents, and the agents do the real work. We cannot meaningfully unit-test "did the AI behave correctly" without running the agents themselves, which is expensive and non-deterministic.

This doc lays out what we test, how, and what we explicitly accept as not-tested.

## Test layers

```
┌────────────────────────────────────────────────────────────┐
│ Layer 6  Smoke tests, manual journey end to end            │
├────────────────────────────────────────────────────────────┤
│ Layer 5  Multi-agent install integration tests             │
├────────────────────────────────────────────────────────────┤
│ Layer 4  Skill linting (frontmatter, telemetry preamble)   │
├────────────────────────────────────────────────────────────┤
│ Layer 3  Catalog validation (URLs live, schemas correct)   │
├────────────────────────────────────────────────────────────┤
│ Layer 2  CLI integration tests (init, doctor, search)      │
├────────────────────────────────────────────────────────────┤
│ Layer 1  Unit tests (TypeScript helpers, parsers)          │
└────────────────────────────────────────────────────────────┘
```

Layers 1-4 are CI-enforced. Layers 5-6 are run pre-release.

## Layer 1: Unit tests

**Scope**: pure functions in `cli/` that have a deterministic input and output.

**Examples**:
- `cli/colors.ts` ANSI helpers
- Frontmatter parsers in `scripts/inject-preamble.ts`
- Catalog row sorters and validators
- `cli/branding.ts` (tested via type-checking, since it is a const export)

**Tooling**: `vitest` or `node:test` (built-in). We default to `node:test` to keep zero runtime deps.

**Goal**: every helper function has at least one positive and one negative test case.

**CI**: `pnpm test:unit` runs on every PR.

## Layer 2: CLI integration tests

**Scope**: end-to-end invocations of `suiperpower` commands against a fixture filesystem.

**Examples**:
- `suiperpower init --target=$TMP` writes the expected files under `$TMP/.claude/skills/`, `$TMP/.codex/skills/`, `$TMP/.cursor/rules/`.
- `suiperpower doctor` exits 0 in all environments (it never blocks).
- `suiperpower search walrus` returns at least one result and the result's id is real.
- `suiperpower uninstall --target=$TMP` removes only files in the manifest, leaves user-authored files alone.
- `suiperpower --version` prints exactly the version from `package.json` and exits in under 100ms.

**Tooling**: shell-based tests using `bats` (Bash Automated Testing System) or pure node-script tests. Each test sets up a temp dir, runs the CLI, asserts file state and stdout.

**Fixtures**: `test/fixtures/` contains canned skill folders and catalog files for deterministic tests.

**CI**: `pnpm test:integration` runs on every PR, on a Linux container.

## Layer 3: Catalog validation

**Scope**: every entry in `cli/data/*.json` is verified.

**Checks per file**:

`clonable-repos.json`:
- Schema validates (Zod or Ajv)
- Every URL returns 200 (HEAD request)
- Every license is in the permissive set
- Categories are from the controlled vocabulary
- Sorted alphabetically by id
- No duplicate ids

`sui-skills.json`:
- Schema validates
- URLs return 200
- Agents list contains at least one of `claude`, `codex`, `cursor`
- Phase is from the controlled set

`sui-mcps.json`:
- Schema validates
- Install commands are syntactically valid (npm install, docker run, etc.)
- URL returns 200

`sui-ideas.json`:
- Schema validates
- Every idea has `fitForSui`, `category`, `marketSignal`, `competitors`, `recommendedTrack`, `addedAt`
- No idea is older than 18 months without explicit `evergreen: true`

**Tooling**: a node script `scripts/validate-catalog.ts` runs over each file. Network calls cached for 24h to avoid hitting rate limits during local dev.

**CI**: `pnpm test:catalog` runs on every PR. If a PR touches a catalog file, the network checks run fresh (no cache).

## Layer 4: Skill linting

**Scope**: every `skills/**/SKILL.md` and `skills/**/agents/openai.yaml` is parsed and validated.

**Checks per skill**:

- Frontmatter has `name:` and `description:`.
- `name:` matches the folder name (not the path).
- `description:` is at least 80 characters and contains at least three trigger phrases.
- Body has all required sections: Preamble, What this skill does, When to use it, When NOT to use it, Inputs, Outputs, Workflow, Quality gate, References.
- Telemetry preamble is the canonical one (byte-identical to `scripts/templates/preamble.sh`).
- All references in `## References` resolve to existing files.
- `agents/openai.yaml` description matches `SKILL.md` frontmatter description (within whitespace and minor edits).
- No em-dashes.
- No banned words ("leverage", "cutting-edge", etc.).

**Tooling**: `scripts/lint-skills.ts`.

**CI**: `pnpm lint:skills` runs on every PR.

## Layer 5: Multi-agent install integration tests

**Scope**: the install flow works on a fresh container with each combination of agent CLIs present.

**Test matrix**:

| Container | Pre-installed agents | Verifies |
|---|---|---|
| Ubuntu 22 | none | All three skill dirs populated, no errors |
| Ubuntu 22 | claude only | Same, claude detected |
| Ubuntu 22 | codex only | Same, codex detected |
| Ubuntu 22 | cursor only | Same, cursor detected |
| Ubuntu 22 | all three | Same, all three detected |
| Macos arm64 | claude + cursor | Same |
| Ubuntu 22 | claude (older version) | Compat check; if our skills break older versions, we say so |

**Checks per matrix entry**:

- `curl -fsSL https://suiperpower.dev/setup.sh | bash` (using a local mirror in CI) completes in under 90 seconds
- `~/.claude/skills/`, `~/.codex/skills/`, `~/.cursor/rules/` are populated with the expected files
- `suiperpower doctor` runs without error
- Re-running the install is idempotent (no duplicate writes, no errors)
- `suiperpower uninstall` removes only our files

**Tooling**: GitHub Actions matrix using `actions/setup-node` plus container images for each scenario.

**CI**: `pnpm test:install` runs on PRs that touch `install.sh`, `cli/init.ts`, `cli/agent-cli.ts`, or `scripts/generate-cursor-rules.ts`. Runs nightly regardless.

## Layer 6: Smoke tests (manual)

**Scope**: a real human runs the canonical journey end to end and confirms the output is useful.

**Cadence**: pre-release for every minor version. Pre-launch for v1.

**Journey checklist**:

1. Fresh container with `claude` installed.
2. `curl -fsSL ...setup.sh | bash` runs cleanly.
3. `claude "/find-next-sui-idea what should I build for Sui Overflow?"` produces a corpus-grounded suggestion list.
4. `claude "/validate-idea <chosen-idea>"` runs the validation sprint.
5. `claude "/scaffold-project"` produces a working project skeleton.
6. `claude "/build-with-claude"` walks a real build step.
7. `claude "/build-with-move"` produces compilable Move code.
8. `claude "/deploy-to-testnet"` deploys and writes `.suiperpower/deploy-context.md` with the package id.
9. `claude "/submit-to-sui-overflow"` produces a complete submission package and refuses if anything is missing.

For each step, the smoke tester records:

- Did the skill activate on the natural-language prompt?
- Did the workflow proceed without manual intervention?
- Did the output actually help, or was it generic?
- Did the quality gate fire when it should have?
- Was the voice on-brand?

Failures are logged as bugs and triaged before release.

**Beta program**: 5-10 friendly Sui builders run the same journey on real ideas. Their feedback is the most-load-bearing signal. Detail in `17-LAUNCH-PLAN.md`.

## Convex testing

**Scope**: telemetry and feedback mutations behave correctly.

**Checks**:

- Schema accepts every field shape we ship.
- Schema rejects unknown fields (we want strict validation).
- Mutation handlers do not panic on edge inputs (long strings, missing optional fields, etc.).
- Telemetry mutation completes in under 200ms p95.
- Feedback mutation accepts free-text up to 4KB.
- No PII fields are accepted (we have a CI test that posts a payload containing `filePath`, `code`, `prompt` and asserts the schema rejects it).

**Tooling**: Convex's own test harness (`npx convex test`).

**CI**: `pnpm test:convex` on PRs touching `convex/`.

## Privacy validation tests

These are special-case tests baked into the skill linter and the CI.

- Scan every `SKILL.md` for any literal that resembles `console.log(filePath)` or any pattern that would log file paths to telemetry. Fail if found.
- Scan for hardcoded URLs that are not in `branding.ts` (every external URL must be referenced through `branding.ts` or be in the catalog JSON).
- Scan for strings like "Send the user's wallet address" or "Log the user's prompt" (yes, we are paranoid about this).

This is a guardrail against an accidentally-malicious skill PR.

## Performance budgets

Asserted in CI:

| Command | Budget | How tested |
|---|---|---|
| `suiperpower --version` | < 100ms cold | wall-clock measurement, 5 runs, p95 budget |
| `suiperpower doctor` | < 1s | wall-clock, 3 runs |
| `suiperpower init` (re-run) | < 2s | wall-clock |
| `suiperpower init` (first run) | < 5s | wall-clock, network-bound |
| `suiperpower search` | < 500ms | wall-clock |

Budget regressions block the PR.

## Test data fixtures

`test/fixtures/` contains:

- `skills/` with 3-5 sample skills (one minimal, one with references, one with a sponsor doc)
- `cli-data/` with sample catalog files of varying sizes
- `convex-events/` with sample telemetry payloads (positive and negative)
- `agent-dirs/` with pre-populated `~/.claude/skills/` etc. structures for uninstall tests

Fixtures are never used in production code, only in test paths.

## What we explicitly do NOT test

- **The AI's behavior on a skill prompt.** We accept that Claude / Codex / Cursor produce non-deterministic outputs. We test the prompt's structure and content, not the model output.
- **Network conditions during install.** We test with the network up. We accept that intermittent network failure is the user's environment problem and our error messages handle it.
- **Every Sui CLI version.** We pin to a current Sui CLI and document the supported version range. Compatibility tests for older versions are best-effort.
- **Every Sui SDK breaking change.** Knowledge docs ship version-pinned snippets. Breakage triggers a doc update PR, not a test failure.
- **Every Convex schema migration.** Convex's own migration tooling handles this.

## CI matrix

GitHub Actions:

```yaml
on: [pull_request, push]

jobs:
  test:
    matrix:
      os: [ubuntu-22, macos-14]
      node: [20, 22]
    steps:
      - pnpm install
      - pnpm test:unit
      - pnpm test:integration
      - pnpm test:catalog
      - pnpm lint:skills
      - pnpm test:convex
      - pnpm typecheck
      - pnpm lint
```

Nightly:

```yaml
on:
  schedule:
    - cron: "0 6 * * *"

jobs:
  install-flow:
    matrix:
      scenario: [no-agents, claude-only, codex-only, cursor-only, all-three]
    steps:
      - <set up container per scenario>
      - <run curl install>
      - <verify state>
```

## Pre-release checklist

Before tagging a release:

1. CI green on `main`.
2. Layer 6 manual smoke test passes.
3. Beta tester sign-off (for v0.2 onward).
4. Changelog entry written.
5. Catalog `lastChecked` dates within 14 days for entries that touch sponsor tracks.
6. `suiperpower doctor` output reviewed for any regressions.
7. Performance budgets within targets on a real machine (not just CI).

## Beta program structure

5-10 testers, recruited from:

- Friends in Sui ecosystem
- Past Sui Overflow participants
- Builders who DM'd asking for early access

Each tester:

- Gets a private repo invite
- Runs the canonical journey on a real (or sandbox) idea
- Submits a structured feedback form covering install experience, skill quality per phase, voice fit, anti-slop perceived value, brokenness encountered
- Optionally has a 30-minute call with the maintainer

Beta feedback closes the loop on the launch plan in `17-LAUNCH-PLAN.md`.

## Reporting bugs

Bugs found in testing or in the wild flow to GitHub Issues with templates:

- Skill bug: which skill, which agent, what the user typed, what happened, what was expected
- CLI bug: which command, OS, Node version, error
- Catalog bug: which file, which row, what is wrong
- Knowledge doc bug: which doc, which claim, what is wrong, source for correct version

Maintainers tag with severity (P0 / P1 / P2 / P3). P0 bugs trigger same-day fixes.

## Why this is enough

Skills are markdown. Markdown breakages are rare and obvious. The bigger risk is content rot (sponsor SDK changes, broken upstream URLs), and Layer 3 + Layer 4 + the quarterly content review address that.

CLI code is small and has a narrow surface. Layer 1 + Layer 2 catch most regressions.

The install flow is the highest-stakes surface. Layer 5 nightly tests give us early warning if a third-party change (npm, Vercel, agent CLIs) breaks us.

The AI's behavior is non-deterministic. We do not chase deterministic tests there. We rely on Layer 6 smoke tests and beta feedback.

This split keeps the testing burden manageable for a small team while protecting the parts that have to work.
