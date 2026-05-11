# 22. Sample skill (canonical reference)

## Why this doc exists

`05-SKILL-FORMAT.md` describes the format. This doc is a fully-written reference skill so authors have something concrete to copy from. The skill chosen is `build-with-move`. It demonstrates:

- Frontmatter with packed trigger phrases
- The canonical telemetry preamble (verbatim shape)
- All required sections (What, When, When NOT, Inputs, Outputs, Workflow, Quality gate, References)
- Anti-slop quality gate that is non-trivial
- References inlining from `references/` and from `skills/data/sui-knowledge/`
- agents/openai.yaml mirror

This is the gold standard. Skill authors clone the structure. Reviewers compare PRs against this shape.

## File tree for the sample skill

```
skills/build/build-with-move/
├── SKILL.md
├── agents/
│   └── openai.yaml
└── references/
    ├── move-syntax-cheatsheet.md
    ├── common-move-pitfalls.md
    └── package-manifest-example.md
```

## Sample SKILL.md (full content)

````markdown
---
name: build-with-move
description: Author Sui Move modules and packages with a senior Move dev as your pair. Use when the user says "build a Move module", "write a Move package", "help me with Move", "add a function to my contract", "create a smart contract on Sui", "scaffold a Move package", or "I need to write Move code". Reads .suiperpower/build-context.md if present. Uses skills/data/sui-knowledge/03-move-and-objects.md and skills/data/sui-knowledge/sponsor-docs/openzeppelin-sui.md.
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//' || echo "anonymous")
_TEL_TIER="${_TEL_TIER:-anonymous}"
_TEL_PROMPTED=$([ -f ~/.suiperpower/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.suiperpower
echo "TELEMETRY: $_TEL_TIER"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
if [ "$_TEL_TIER" != "off" ]; then
  _TEL_EVENT='{"skill":"build-with-move","phase":"build","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
  echo "$_TEL_EVENT" >> ~/.suiperpower/telemetry.jsonl 2>/dev/null || true
  _CONVEX_URL=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
  [ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" \
    -H "Content-Type: application/json" \
    -d '{"path":"telemetry:track","args":{"skill":"build-with-move","phase":"build","status":"started","version":"<version>","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' \
    >/dev/null 2>&1 &
  true
fi
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user via `AskUserQuestion`:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write their answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Pairs with the user to author Sui Move modules and packages. It treats Move as a different mental model from Solidity or Rust-on-accounts (it is), pushes the user toward Sui-native patterns (objects, capabilities, PTBs), and refuses to ship code that lacks tests for public entry points.

## When to use it

- The user wants to write Move code (a module, a function, a test).
- The user is stuck on a Move compilation error.
- The user is migrating EVM or Solana logic to Sui Move and needs the right primitives.
- The user has a Move package and wants to extend it.

## When NOT to use it

- If the user has not picked a project yet, use `find-next-sui-idea` first.
- If the user has not scaffolded a project, use `scaffold-project` first.
- If the user is composing transactions across modules, use `ptb-composer`.
- If the user is debugging a runtime error from a deployed package, use `debug-move`.
- If the user wants a security review, use `review-move`.

If you activated this skill and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- An existing Move project (a directory with `Move.toml` and `sources/`), OR a fresh intent the user describes.
- Optional: `.suiperpower/build-context.md` from `scaffold-project`. Read it if present.
- Optional: `.suiperpower/idea-context.md` if the user is starting from an idea.

If neither context file exists, interview the user for:

- What does the package do in one sentence?
- What objects does it own / share?
- What capabilities are required for state-changing functions?
- What entry points does it expose to PTBs?

## Outputs

- One or more `.move` files under `sources/` of the project.
- Updated `Move.toml` if dependencies changed.
- One or more test files under `tests/` covering each public function.
- Append a record of what was built to `.suiperpower/build-context.md`:

  ```markdown
  ## build-with-move session, <timestamp>
  - module: <module-name>
  - functions added: <names>
  - tests added: <names>
  - dependencies added: <names>
  - open issues: <list>
  ```

- The skill never deletes files outside `sources/` and `tests/` without explicit user confirmation.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if it exists.
   - If the project has `Move.toml`, list its current modules and dependencies.
   - Confirm the user's intent in one sentence before writing any code.

2. **Design pass (object model first)**
   - Identify which objects this module creates or modifies.
   - Decide owned vs shared vs immutable for each.
   - Identify capabilities needed (TreasuryCap, AdminCap, custom).
   - Sketch the entry points the user will call.
   - Walk the design back to the user. Adjust before writing code.

3. **Implementation**
   - Write the module(s) following the conventions in `references/move-syntax-cheatsheet.md`.
   - Use OpenZeppelin Sui libraries where applicable (see `skills/data/sui-knowledge/sponsor-docs/openzeppelin-sui.md`). Do not hand-roll access control if OZ provides it.
   - Avoid the pitfalls listed in `references/common-move-pitfalls.md`.
   - Keep functions small. One responsibility per function.

4. **Tests**
   - Every public entry point gets at least one positive test.
   - Capability-gated entry points get an "expected failure" test for the unauthorized call.
   - Use `sui::test_scenario` for scenarios involving multiple addresses.
   - If the user asks to skip tests, push back. Explain that submission preflight will fail without tests.

5. **Build**
   - Run `sui move build` and resolve any errors.
   - If the user is on a non-current Sui CLI version, surface the version mismatch.

6. **Writeback**
   - Append session details to `.suiperpower/build-context.md`.
   - List any open issues you intentionally left for follow-up.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Is there a non-trivial test for every public function I added or modified?
- Does `sui move build` complete without errors?
- Did I avoid any `unsafe`, commented-out assertions, or capability-leakage patterns?
- Did I capitalize Object, Move, PTB consistently in any user-facing text I produced?
- Is the design walked back to the user, not just code-dumped?
- Are dependencies pinned (no floating versions in `Move.toml`)?

If any answer is no, the skill reports the gap and works through it before claiming the session is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/move-syntax-cheatsheet.md`: Concise syntax reference for Move on Sui (objects, abilities, capabilities, witness pattern, init function).
- `references/common-move-pitfalls.md`: Mistakes that look right and break (mismatched abilities, leaked capabilities, off-by-one with version increments, etc.).
- `references/package-manifest-example.md`: A canonical `Move.toml` with current Mysten dependencies and pinned versions.

Knowledge docs (load when scope expands beyond what is in references):

- `skills/data/sui-knowledge/03-move-and-objects.md`: Full Move + object model reference.
- `skills/data/sui-knowledge/sponsor-docs/openzeppelin-sui.md`: When to use OZ Sui libs, which modules exist.

## Use in your agent

- Claude Code: `claude "/suiper:build-with-move <your message>"`
- Codex: `codex "/build-with-move <your message>"`
- Cursor: paste a chat message that includes a phrase like "write a Move module" or reference `~/.cursor/rules/build-with-move.mdc`
````

## Sample agents/openai.yaml (full content)

```yaml
name: build-with-move
version: 1
phase: build
description: |
  Author Sui Move modules and packages with a senior Move dev as your pair.
  Use when the user says "build a Move module", "write a Move package",
  "help me with Move", "add a function to my contract", "create a smart contract on Sui",
  "scaffold a Move package", or "I need to write Move code".
  Reads .suiperpower/build-context.md if present.
prompt_path: ../SKILL.md
references:
  - ../references/move-syntax-cheatsheet.md
  - ../references/common-move-pitfalls.md
  - ../references/package-manifest-example.md
knowledge:
  - skills/data/sui-knowledge/03-move-and-objects.md
  - skills/data/sui-knowledge/sponsor-docs/openzeppelin-sui.md
```

## Sample reference: move-syntax-cheatsheet.md (outline)

The actual content is authored in build phase. The outline:

```markdown
# Move on Sui, syntax cheatsheet

## Module declaration
- module path syntax (`my_pkg::module_name`)
- friend visibility, public visibility
- `init` function semantics

## Abilities
- key (object can be top-level)
- store (can be stored inside another object)
- copy (rare, usually no)
- drop (rare, usually no for resources)

## Object lifecycle
- created via constructor functions
- transferred via `transfer::transfer`, `transfer::share_object`, `transfer::freeze_object`
- mutated via `&mut` references in entry functions

## Capability pattern
- minimal example: a `TreasuryCap` controlling mint
- multi-cap pattern: AdminCap + a per-feature cap
- never expose internals through public functions

## Witness pattern
- one-time witness (OTW) for module-level singletons
- usage in `init`

## Coin standard
- `coin::create_currency` example
- treasury cap handling

## Display standard
- `display::create_internal` for NFT-like objects

## Common patterns
- escrow with two-party release
- vault with capability-gated withdraw
- registry with shared object

## Building and publishing
- `sui move build`
- `sui client publish`
- capturing the package id

## Test patterns
- `sui::test_scenario` walkthrough
- expected-failure asserts
```

## Sample reference: common-move-pitfalls.md (outline)

```markdown
# Common Move pitfalls (Sui)

## Ability mismatches
- giving `key` to something that should not be a top-level object
- forgetting `store` on a struct intended to nest inside another object
- adding `drop` accidentally, allowing silent burning

## Capability leakage
- passing AdminCap by value into a public function
- exposing a capability inside a Display field

## Shared object versioning
- forgetting to bump `id_version` after a mutation
- assuming finality where it does not yet apply

## Init function gotchas
- one-time witness must be a struct named exactly like the module in caps
- init runs once at publish; cannot be called again

## Tests
- forgetting to consume the test scenario, leaving objects "orphaned" in test state
- not asserting expected failures with `aborts_with`

## Move.toml
- floating dependency versions (use rev or tag)
- missing `framework` dep when using stdlib functions
```

## Sample reference: package-manifest-example.md (outline)

```markdown
# Move.toml, canonical example

(Authored at build time, pinned to a current Sui CLI version.)

[package]
name = "my_package"
version = "0.1.0"
edition = "2024"

[dependencies]
Sui = { git = "https://github.com/MystenLabs/sui.git", subdir = "crates/sui-framework/packages/sui-framework", rev = "<pinned-rev>" }

[addresses]
my_package = "0x0"
```

## Why this skill is the right exemplar

- It uses the full SKILL.md shape, not a degenerate one.
- It demonstrates the references folder, not just inline content.
- It demonstrates knowledge-doc routing.
- The quality gate is non-trivial (six checks, all enforceable).
- It refuses to do something the user might want (skip tests), which is the anti-slop muscle in action.
- It is Sui-unique. Move is the chain's contract language; nothing about this skill ports to Solana.

Skill authors writing a new skill should clone this structure first, then mutate.

## Skills that should look similar

These skills follow the same shape (build-phase, anti-slop gate at the end, references-driven, writes to `.suiperpower/build-context.md`):

- `walrus-storage`
- `deepbook-orderbook`
- `scallop-money-market`
- `kiosk-marketplace`
- `sui-zk-login`
- `sponsored-transactions`
- `openzeppelin-sui-libs`
- `ottersec-prep`

Skills that depart from the shape (and why):

- `find-next-sui-idea`: idea phase, no `.suiperpower/build-context.md` reading. Writes idea-context instead.
- `roast-my-product`: brutal critique mode, no workflow steps, just opinionated output.
- `submit-to-sui-overflow`: ship phase, has a longer preflight gate that blocks rather than nudges.
- `navigate-skills`: meta skill, just lists what is available.

The above are exceptions, not the rule.

## What goes in the skill, what goes in the knowledge doc

A common authoring mistake is putting too much in `SKILL.md`. The split:

| Belongs in SKILL.md | Belongs in references/ | Belongs in knowledge/ |
|---|---|---|
| Workflow steps | Cheat-sheets the AI loads when needed | Long-form chapter content |
| Anti-slop gate | Pitfall lists | Sponsor SDK reference |
| Trigger phrases | Code skeletons / templates | Architecture explanations |
| Routing pointers | Project-specific config examples | Tutorials |

If a section feels too long for SKILL.md, it probably belongs as a reference. If it feels chapter-length, it belongs in `skills/data/sui-knowledge/`.

## Lint expectations the sample passes

- Frontmatter: name + description present
- name = folder name (`build-with-move`)
- Description over 80 chars, multiple trigger phrases
- Sections: Preamble, What, When, When NOT, Inputs, Outputs, Workflow, Quality gate, References, Use in your agent
- Telemetry preamble byte-identical to template
- All references resolve to existing files
- agents/openai.yaml description matches frontmatter description
- No em-dashes
- No banned words
- Sui terms capitalized (Move, Object, PTB)

## Authoring checklist (use when writing a new skill)

1. Decide the phase. Place under `skills/<phase>/<name>/`.
2. Copy this sample's structure.
3. Replace name, description, workflow, gate, references.
4. Run `scripts/inject-preamble.ts skills/<phase>/<name>/SKILL.md` to install the canonical preamble.
5. Author `agents/openai.yaml` with the same description.
6. Add the references files.
7. Run `pnpm lint:skills` locally to catch issues.
8. Add a row to `04-SKILLS-CATALOG.md`.
9. Add a routing entry to `skills/SKILL_ROUTER.md` if the skill is confusable with a nearby one.
10. Run a smoke test in Claude Code in your own dev environment.

Time to first PR for an experienced contributor: under 90 minutes.
