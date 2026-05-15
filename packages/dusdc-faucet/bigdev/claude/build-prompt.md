**Two preamble blocks may appear at the top of this prompt, in this order when both are present: `USER INJECT` first, then `REQUIREMENTS LOG`. Neither is required.**

**If a `USER INJECT` block is present (always at the very top),** that section is mid-build one-shot guidance from the user (delivered via `bigdev/claude/inject.md`). Apply it first to this iteration's work. Treat the inject as authoritative; it overrides loop defaults if they conflict. Inject is transient (archived by the orchestrator after the iteration starts); the requirements log is durable.

**If a `REQUIREMENTS LOG` block is present,** that section is the user's accumulated durable steering, prepended by the orchestrator from `bigdev/claude/requirements-log.md`. Treat every entry as authoritative durable guidance throughout this iteration AND every future iteration. If an entry contradicts something in CLAUDE.md or bigdev/plans/, the log wins, AND you should update CLAUDE.md or the relevant plan to match (a durable rule deserves to live in the canonical doc, not just the log). When you promote a log entry into a plan or CLAUDE.md, append ` (promoted → <relative file path>)` to that exact entry line in `bigdev/claude/requirements-log.md` so future iterations skip it. Already-promoted entries (those ending with `(promoted → ...)`) are audit trail only; do not re-promote them.

If neither block is at the top of this prompt but `bigdev/claude/requirements-log.md` exists, read it directly and treat its non-promoted entries as authoritative.

**Pause-for-user steps:** if you hit a TODO step that requires the user to do something you cannot (deploy contracts, run a DB migration, fund a wallet, paste a secret, install a tool), do NOT mark the step `[x]`. Prepare whatever code/config the step needs first, then output your pause message wrapped in markers EXACTLY like this on their own lines:

```
<PAUSE_FOR_USER>
concise instructions for the user, including the exact command they should run if applicable
</PAUSE_FOR_USER>
```

The orchestrator (parent agent that dispatched you) detects these markers in your returned summary, surfaces the message to the user inside the tmux session, and stops the loop so the user can respond via `./bigdev/autobuild fix "..."`. Their reply becomes the USER INJECT for the next iteration. After emitting the markers, stop the iteration cleanly. Do not retry the step yourself.

**Baseline check first.** Before doing any new work, run the relevant build/test commands for the layer the next [ ] step touches. Use the commands listed in CLAUDE.md:

- Backend: `cd packages/dusdc-faucet/backend && bun run lint && bun test` (only if tests exist yet)
- Frontend: `cd packages/dusdc-faucet/web && bun run build`
- Move package: `cd packages/dusdc-faucet/contracts/faucet && sui move build`

If the baseline is broken (compile errors or failing tests in code you did NOT write this iteration), your priority-zero task is to fix the regression first, then proceed to the next [ ] step. Do not pile new work on top of broken state.

Read `packages/dusdc-faucet/bigdev/TODO.md`. Find the FIRST unchecked step marked [ ] (not [x]).

If there are NO unchecked steps remaining, output <promise>ALL PHASES COMPLETE</promise> and stop.

---

## Batching rule (IMPORTANT)

In a single iteration of this loop, you should attempt to complete **up to 5 full phases**, not just 1 step.

- A "phase" is a `## Phase N: ...` block in `packages/dusdc-faucet/bigdev/TODO.md`. It is done when every `[ ]` under it is `[x]`.
- Keep working through steps and phases continuously. After each step, mark it `[x]`. After each completed phase, run the relevant build, commit with `feat: phase N implements <summary>`, then move to the next phase's first step.
- Only stop early before hitting 5 phases if:
  - You hit a step that requires user action (deploy, migrate, paste secret). Emit the `<PAUSE_FOR_USER>...</PAUSE_FOR_USER>` markers and stop.
  - You hit an unrecoverable blocker (real compile error you cannot fix after honest debugging). Print exactly what is blocking and stop.
  - All remaining phases are done. Then output `<promise>ALL PHASES COMPLETE</promise>`.
- Do NOT stop just because you finished one step or one phase. Keep going until you've done 5 phases or hit a real reason to stop.
- Do NOT stop because "context is getting big". You are a subagent with your own fresh context; the orchestrator dispatches a new subagent per iteration.

Do not output the completion promise unless every `[ ]` in `packages/dusdc-faucet/bigdev/TODO.md` is checked.

---

Otherwise, implement each step using this process:

**Before writing code:**
1. Read `packages/dusdc-faucet/bigdev/TODO.md`, identify the exact step and its phase
2. Read `packages/dusdc-faucet/CLAUDE.md`, understand the project structure, tech stack, and file paths
3. Internalize the REQUIREMENTS LOG block at the top of this prompt (or read `packages/dusdc-faucet/bigdev/claude/requirements-log.md` if no block is prepended). The user's durable steering lives there.
4. Read the relevant `packages/dusdc-faucet/bigdev/plans/` file for this phase (CLAUDE.md has a reference table mapping phases to plan files)
5. If the phase touches UI, ALSO read `packages/dusdc-faucet/bigdev/plans/04-DESIGN-SYSTEM.md` and `packages/dusdc-faucet/bigdev/plans/05-DEMO-FLOW.md`. Treat them as binding, not advisory.
6. Read any source files you will modify, understand what already exists before touching anything

**Implementation rules:**
- Follow `packages/dusdc-faucet/bigdev/plans/` exactly. They contain the types, algorithms, and architecture decisions. Use them as the reference, not inspiration.
- Match file paths from `00-ARCHITECTURE.md`.
- Production quality. No placeholder code. No TODO comments left in code.
- Error handling per `CLAUDE.md` and the per-plan error sections.
- Concise comments only where logic is non-obvious. Default to no comments. Never write multi-paragraph docstrings.
- Do NOT add features, abstractions, or error handling beyond what the step requires.
- The page must NEVER mention Suiperpower. The credit footer reads `made by Kelvin Adithya` linking to `https://klvn.dev`. No other branding.
- No em-dashes anywhere (commas or periods instead).
- No emojis in product copy or comments.
- No banned phrases: leverage, seamless, powerful, robust, cutting-edge, world-class, AI-powered, Web3.

**Database safety (CRITICAL):**
- Never run destructive Prisma commands. No `migrate reset`, no `db push --force-reset`.
- For schema changes, prepare the schema edit, then emit `<PAUSE_FOR_USER>` asking Kelvin to run `cd packages/dusdc-faucet/backend && bun run db:push` himself.

**Quality gates for UI work (enforce strictly, this is the demo-grade bar):**
- **No Lorem ipsum.** No `<placeholder>`. No `TODO:` strings shipped to UI. No `Coming soon` unless `bigdev/plans/05-DEMO-FLOW.md` explicitly authorizes it.
- **Real fixture data**, sourced from `bigdev/plans/04-DESIGN-SYSTEM.md` example values or `bigdev/plans/05-DEMO-FLOW.md` seed data. If a screen displays a list, it must have at least 5 realistic entries by default for the demo path.
- **Every screen with data must implement all five states**: empty state, loading state, error state, skeleton state, populated state. Wire all of them. The empty state must have on-brand copy + primary CTA per `bigdev/plans/04-DESIGN-SYSTEM.md`.
- **Copy comes from the plans, verbatim**. If a string is in the "Verbatim demo strings" table in `bigdev/plans/04-DESIGN-SYSTEM.md`, copy it character for character. Do not paraphrase. If the plan does not specify a string, write it in the tone defined in that doc (direct, technical, no exclamation marks).
- **Use design tokens**, never raw hex or arbitrary spacing. If a token is missing, add it to `bigdev/plans/04-DESIGN-SYSTEM.md` first, then use it.
- **Sanity check after each UI screen**: would a judge or user see this and think "this looks unfinished"? If yes, you missed something in the plan, fix it now. The cost of polish in-flight is low; the cost of a generic-looking demo is the entire submission.

**Commit rule (project-wide):**
- Kelvin is the sole committer. NEVER add a `Co-Authored-By` line to any commit, ever.
- Use conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`.

**After implementing each step:**
1. Run the layer-relevant build/test command and fix ALL errors and warnings before continuing
2. Mark the completed step [x] in `packages/dusdc-faucet/bigdev/TODO.md`

**After completing each phase (every step in the phase is [x]):**
1. Run the build command one final time, confirm clean output
2. Use the `/commit` skill (or `git add` + `git commit`) to commit everything with a phase-level conventional commit (e.g., `feat: phase 5 implements claim and refill move entries`)
3. Move on to the next phase's first step (per the batching rule above, keep going)

Do NOT output the completion promise until every single [ ] in `packages/dusdc-faucet/bigdev/TODO.md` is checked off.
