**Two preamble blocks may appear at the top of this prompt, in this order when both are present: `USER INJECT` first, then `REQUIREMENTS LOG`. Neither is required.**

**If a `USER INJECT` block is present (always at the very top),** that section is mid-build one-shot guidance from the user (delivered via `bigdev/claude/inject.md`). Apply it first to this iteration's work. Treat the inject as authoritative; it overrides loop defaults if they conflict. Inject is transient (archived by the wrapper after the iteration starts); the requirements log is durable.

**If a `REQUIREMENTS LOG` block is present,** that section is the user's accumulated durable steering, prepended by the wrapper from `bigdev/claude/requirements-log.md`. Treat every entry as authoritative durable guidance throughout this iteration AND every future iteration. If an entry contradicts something in CLAUDE.md or `plans/`, the log wins, AND you should update CLAUDE.md or the relevant plan to match (a durable rule deserves to live in the canonical doc, not just the log). When you promote a log entry into a plan or CLAUDE.md, append ` (promoted -> <relative file path>)` to that exact entry line in `bigdev/claude/requirements-log.md` so future iterations skip it. Already-promoted entries (those ending with `(promoted -> ...)`) are audit trail only; do not re-promote them.

If neither block is at the top of this prompt but `bigdev/claude/requirements-log.md` exists, read it directly and treat its non-promoted entries as authoritative.

**Pause-for-user steps:** if you hit a TODO step that requires the user to do something you cannot (deploy contracts, run a Convex deploy, fund a wallet, paste a secret, install a tool, register a Sui Foundation account, set up a Vercel project), do NOT mark the step `[x]`. Prepare whatever code/config the step needs first, then output your pause message wrapped in markers EXACTLY like this on their own lines:

```
<PAUSE_FOR_USER>
concise instructions for the user, including the exact command they should run if applicable
</PAUSE_FOR_USER>
```

The wrapper detects these markers and drops the user into an interactive prompt. Their reply gets auto-injected as USER INJECT in the next iteration. After emitting the markers, stop the iteration cleanly. Do not retry the step yourself.

**Baseline check first.** Run `pnpm install` once if `node_modules` is missing, then run `pnpm typecheck` and `pnpm lint:skills` (only if those scripts exist; if a phase has not yet added them, skip cleanly without erroring). If the baseline is broken (compile errors, lint failures, or skill-lint failures in code you did NOT write this iteration), your priority-zero task is to fix the regression first, then proceed to the next [ ] step. Do not pile new work on top of broken state.

Read `bigdev/TODO.md`. Find the FIRST unchecked step marked [ ] (not [x]).

If there are NO unchecked steps remaining, output <promise>ALL PHASES COMPLETE</promise> and stop.

---

## Batching rule (IMPORTANT)

In a single iteration of this loop, you should attempt to complete **up to 5 full phases**, not just 1 step.

- A "phase" is a `## Phase N: ...` block in `bigdev/TODO.md`. It is done when every `[ ]` under it is `[x]`.
- Keep working through steps and phases continuously. After each step, mark it `[x]`. After each completed phase, run the build/lint, commit with `feat: phase N implements <summary>`, then move to the next phase's first step.
- Only stop early before hitting 5 phases if:
  - You hit a step that requires user action (Convex deploy, npm publish, agent CLI install, hosting setup). Emit the `<PAUSE_FOR_USER>...</PAUSE_FOR_USER>` markers and stop.
  - You hit an unrecoverable blocker (real compile error you cannot fix after honest debugging). Print exactly what is blocking and stop.
  - All remaining phases are done. Then output `<promise>ALL PHASES COMPLETE</promise>`.
- Do NOT stop just because you finished one step or one phase. Keep going until you have done 5 phases or hit a real reason to stop.
- Do NOT stop because "context is getting big". The loop wrapper handles fresh sessions.

Do not output the completion promise unless every `[ ]` in `bigdev/TODO.md` is checked.

---

Otherwise, implement each step using this process:

**Before writing code:**
1. Read `bigdev/TODO.md`, identify the exact step and its phase.
2. Read `CLAUDE.md`, understand the project structure, tech stack, and file paths.
3. Internalize the REQUIREMENTS LOG block at the top of this prompt (or read `bigdev/claude/requirements-log.md` if no block is prepended). The user's durable steering lives there.
4. Read the relevant `plans/<file>.md` file(s) referenced in the step description. Plans are the canonical source of truth. The build loop cannot ask questions, so plans must answer them.
5. **Always start by skimming `plans/README.md` if you are not yet oriented.** It is the index. Saves time vs scanning all 31 plan docs. The TODO step usually names the exact plan file you need.
6. Read any source files you will modify; understand what already exists before touching anything.

**Reference repo policy:**
- Patterns and shapes from `reference/solana-new-main/` are fair game to ADAPT (file structure, install-script flow, branding-constants pattern, telemetry preamble shape, schema layout, JSON catalog schema, guide section structure).
- **Never copy Solana-affiliated content, branding, copy, ecosystem references, or commands into Suiperpower.** Suiperpower is for the Sui network only. If a Solana-specific concept appears (Anchor, Phantom, Helius, Squads, lamports, PDAs, IDL), translate to the Sui equivalent (Move, Slush wallet, Mysten / Blockvision RPC, Sui multisig, MIST, capabilities, Move ABI). If no equivalent exists, drop the section.
- Cite origin only in places where `plans/` already does (e.g. `plans/30-SHARED-GUIDES-SPEC.md` ends with an "Origin acknowledgment"). Do not invent new attributions.

**Implementation rules (Suiperpower-specific):**
- Follow `plans/` exactly. They contain the architecture, schema, and decisions. Use them as the reference, not inspiration.
- Match file paths from `plans/02-PROJECT-STRUCTURE.md`. If a file path is ambiguous, defer to that doc.
- TypeScript: strict, ESM, NodeNext. All imports use `.js` extensions. No implicit any.
- CLI runtime deps stay at zero except for the Convex client. If you need a third-party package for the CLI, push back via `<PAUSE_FOR_USER>` instead of adding it.
- Single source of truth for branding: `cli/branding.ts`. Never hardcode brand strings elsewhere. If a string is missing from `BRAND`, add it there first, then import.
- Skills are plain markdown. No code generation in skills. The telemetry preamble is the only bash; everything else is human-readable instruction.
- Catalog data is JSON, kebab-case ids, sorted alphabetically by id, schema validated.
- No emojis in product copy.
- **No em-dashes.** Use commas or periods. (Project rule.)
- **No banned words:** "leverage", "cutting-edge", "world-class", "revolutionary", "AI-powered", "Web3" (per `plans/15-BRAND.md`).
- Capitalize Sui-specific terms: Move, Object, PTB, Walrus, DeepBook, Scallop, Kiosk, zkLogin.
- Comments concise and direct. No multi-paragraph docstrings. No "explains what the code does" comments. Only WHY when non-obvious.
- Production quality. No placeholder code. No `TODO:` comments left in shipped code. No half-finished implementations.
- Do NOT add features, abstractions, or error handling beyond what the step requires.

**Skill authoring quality gates (enforce strictly when authoring any `SKILL.md`):**
- Frontmatter has `name:` (= folder name) and `description:` (over 80 chars, multiple trigger phrases the user is likely to say verbatim).
- Sections present in this order: Preamble, What this skill does, When to use it, When NOT to use it, Inputs, Outputs, Workflow, Quality gate (anti-slop), References, Use in your agent.
- Telemetry preamble byte-identical to the template. Run `scripts/inject-preamble.ts` (once it exists) instead of hand-writing.
- Every build / ship skill ends with a non-trivial Quality gate (anti-slop). Examples in `plans/12-ANTI-SLOP-FRAMEWORK.md`.
- Every skill ends with: "If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off."
- `agents/openai.yaml` mirrors the frontmatter description.
- All `references/` paths resolve to existing files in the same skill folder.
- No em-dashes, no banned words, Sui terms capitalized.

**Knowledge / guide / catalog gates:**
- Knowledge docs follow the outline in `plans/06-SUI-KNOWLEDGE-BASE.md`. Length matches the target stated there.
- Shared guides follow the section structure in `plans/30-SHARED-GUIDES-SPEC.md`. Sui-native commands only. End with `## Skills that read this guide`.
- Catalog JSON validates against `plans/07-ECOSYSTEM-CATALOG.md` schema. Ids kebab-case, sorted alphabetically.
- Authoring style for ALL markdown / JSON / CLI output: `plans/29-DOCS-AUTHORING-STANDARDS.md`. Read it once per session before authoring user-facing content.

**After implementing each step:**
1. If the step touched TypeScript, run `pnpm typecheck`. Fix every error and warning before continuing.
2. If the step touched a skill, run `pnpm lint:skills` (once Phase 26 lands; before that, hand-check against the skill authoring gates above).
3. If the step touched JSON catalog, run `pnpm lint:catalog` (once it exists).
4. Mark the completed step `[x]` in `bigdev/TODO.md`.

**After completing each phase (every step in the phase is `[x]`):**
1. Run `pnpm typecheck` (and `pnpm lint:skills` / `pnpm lint:catalog` if relevant) one final time. Confirm clean output.
2. Use the `/commit` skill to commit everything with a phase-level conventional commit, e.g. `feat: phase 9 add canonical build-with-move sample skill`. **Important:** the user is the sole committer; per `~/.claude/CLAUDE.md` rule, NEVER add any `Co-Authored-By` line to commits.
3. Move on to the next phase's first step (per the batching rule above, keep going).

Do NOT output the completion promise until every single `[ ]` in `bigdev/TODO.md` is checked off.
