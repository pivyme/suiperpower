---
name: object-model-design
description: Design the Sui Object schema for a project, choose owned vs shared vs immutable per Object, decide capability patterns, and document the rationale. Use when the user says "design the object schema", "owned vs shared object", "capability pattern for X", "model my data on Sui", "Sui object design", or "how should this be structured on Sui". Reads .suiperpower/build-context.md if present. Loads skills/data/sui-knowledge/03-move-and-objects.md.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track object-model-design build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track object-model-design build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Designs the Object schema for a Sui project before any Move code is written. Identifies every Object the system creates, decides owned vs shared vs immutable for each, picks the capability pattern that gates state changes, and writes the rationale into `build-context.md` so future readers (including auditors) can see why each decision was made.

Sui's object model is the most important architectural decision and the easiest to get wrong. This skill front-loads that thinking.

## When to use it

- Starting a new Move package and designing the data model.
- Refactoring an existing package whose ownership decisions have proven painful.
- Reviewing a third-party Move package and reverse-engineering its object decisions.
- Migrating from EVM mental model (account-centric) to Sui mental model (Object-centric).

## When NOT to use it

- For tiny single-Object utilities, design pressure is low; just write the code.
- For raw Move authoring after the design is done, use `build-with-move`.
- For client-side composition, use `ptb-composer`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A project intent (one sentence: what does the package do).
- Optional: `.suiperpower/build-context.md` from `scaffold-project`. Read it if present.

If unclear, interview the user for:

- What entities exist in the system? (User, Vault, Listing, Position, etc.)
- For each, who can read it, who can mutate it, who owns it?
- Are mutations sequenced (one at a time per user) or contended (many parties race)?
- What capabilities exist (admin, treasury, moderator, custom)?

## Outputs

- An Object map: each Object listed with its abilities (`key`, `store`), owner type (owned by address, shared, immutable), and the capability that gates mutation (if any).
- A capability flow diagram: where each capability is created, who holds it, who can use it.
- Rationale per decision: one line of why, especially for shared vs owned.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## object-model-design session, <timestamp>
  ### Objects
  | Object | Abilities | Ownership | Mutation gate | Why |
  |---|---|---|---|---|
  | User | key, store | owned | self | per-user state |
  | Vault | key | shared | AdminCap | global state, admins mutate |
  | ... | ... | ... | ... | ... |

  ### Capabilities
  - AdminCap: created in init, transferred to multisig, by-reference everywhere.
  - TreasuryCap: created via coin::create_currency, held by issuer, by-reference for mint/burn.

  ### Open issues
  - <list>
  ```

The skill never deletes files outside the integration source path without explicit user confirmation.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if present.
   - Confirm the project intent and major entities.

2. **Entity inventory**
   - For each entity, name it.
   - For each, identify: who creates it, who reads it, who mutates it, when it is destroyed.

3. **Owned vs shared vs immutable**
   - Owned: only one address mutates at a time. Default for per-user state.
   - Shared: multiple parties can call mutating functions concurrently (sequenced by consensus). Use for global state.
   - Immutable: never mutated after creation. Use for content-addressed records, NFTs that should not change.
   - Walk each entity, decide, write down the why.

4. **Abilities**
   - Top-level Objects: `key`, plus `store` if they will be nested or transferred.
   - Nested: `store` only.
   - Stateful: avoid `copy` and `drop` unless silent burning or duplication is the intent.

5. **Capability map**
   - For every state-changing function, name the capability that gates it.
   - For each capability, name: where it is created, who holds it, by-reference vs by-value, whether it can leak via Display or public read.

6. **Sketch the API surface**
   - List every public entry function. For each, name: which Object(s) it touches, which capability it requires, what it returns.
   - Walk the sketch back to the user.

7. **Stress-test the design**
   - Concurrency: can two users race in a way that matters?
   - Reinitialization: can an attacker call a "create" function twice?
   - Capability leakage: does any public function expose a Cap?
   - Versioning: does any shared Object's mutation path forget to bump version?

8. **Document and pass to build-with-move**
   - Write the Object map and capability map into `build-context.md`.
   - Hand off to `build-with-move` for actual implementation.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Does every Object in the schema have an explicit owner-type decision (owned, shared, immutable) with a one-line rationale?
- Does every capability have a documented holder strategy (EOA, multisig, hardware) and a by-reference vs by-value choice per call site?
- Has the design been stress-tested against concurrency, reinitialization, capability leakage, and versioning?
- Has the design been walked back to the user, not just produced?
- Is the resulting `build-context.md` entry concrete enough that `build-with-move` can implement directly without re-deciding anything?
- Does the design avoid one-Object-per-user-state when shared Object would be more appropriate (or vice versa)?

If any answer is no, the skill reports the gap and works through it before claiming the design is done.

## References

On-demand references (load when relevant to the user's question):

- `references/owned-vs-shared-decision.md`: Decision rules with examples (vault, marketplace, profile, registry).
- `references/capability-patterns.md`: Common capability shapes (Admin, Treasury, multi-cap, witness pattern).
- `references/object-schema-template.md`: Worked example of a full Object map for a small project.

Knowledge docs (load when scope expands beyond what is in references):

- `skills/data/sui-knowledge/03-move-and-objects.md`: Full Object model + capability reference.

## Use in your agent

- Claude Code: `claude "/suiper:object-model-design <your message>"`
- Codex: `codex "/object-model-design <your message>"`
- Cursor: paste a chat message that includes a phrase like "design the object schema", or load `~/.cursor/rules/object-model-design.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
