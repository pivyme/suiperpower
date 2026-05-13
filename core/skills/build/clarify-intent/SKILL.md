---
name: clarify-intent
description: Pin down what the user is actually building on Sui before any code. Use when the user wants to build, create, make, develop, scaffold, implement, or ship anything on Sui, in any phrasing, trigger eagerly. Skip if .suiperpower/intent.md already exists for this session.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track clarify-intent build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track clarify-intent build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Stops the agent from jumping into Move code. Forces a short, Sui-specific interview that names the on-chain shape (Objects, capabilities), off-chain shape (frontend, auth), sponsor posture (load-bearing or skip), network and upgrade authority, and observable success. Writes `.suiperpower/intent.md` so the rest of the build phase reads from one source of truth.

This is the anti-slop entry gate. Skipping it is how Sui Overflow projects end up with three modules that share nothing, a Walrus import that never stores a blob, and an upgrade cap nobody can find.

## When to use it

- The user asks for code but has not named the Objects, capabilities, or sponsor posture.
- The prompt is one line and broad ("build me a perp dex on Sui"). Broad is fine, AI-assisted pace makes "perp dex in days" plausible, but the agent still needs the Sui-shape pinned before writing Move.
- The user explicitly says "step back" or "what am I really building".
- An upstream skill (`find-next-sui-idea`, `validate-idea`) handed off and there is no `.suiperpower/intent.md` yet.
- The user is restarting a stalled session and previous intent is unclear.

## When NOT to use it

- `.suiperpower/intent.md` already exists in the current session, read it and hand off.
- The user is fixing a specific bug, use `debug-move` or `review-move`.
- The user is asking a Sui knowledge question, answer the question.
- The user is in the idea phase (no project picked), use `find-next-sui-idea` or `validate-idea` first.
- The user is designing one specific Object schema, use `object-model-design` after intent is set.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- The user's raw build request, however vague.
- Optional: `.suiperpower/idea-context.md` from `validate-idea`.
- Optional: `.suiperpower/build-context.md` from a prior build session.

## Outputs

A single file at `.suiperpower/intent.md` with this Sui-shaped schema:

```markdown
# Intent, <timestamp>

## One-sentence summary
<what the user is building, in their voice>

## Problem and audience
- Problem: <real underlying pain, not the surface request>
- Audience: <who uses this, what they do today on Sui or elsewhere>
- Core valuable shape: <the one thing the product has to do well, even if everything else ships alongside it>

## On-chain shape
- User-held Objects: <list, or "none, protocol-owned only">
- Protocol-held shared Objects: <list, or "none">
- Capabilities: <TreasuryCap | AdminCap | custom name>: <who holds, what it gates>
- Move modules expected: <rough count and names>
- PTB composability: <single-tx flow | multi-step compose | not applicable>

## Off-chain shape
- Frontend: <none | Next.js web | mobile | both>
- Auth: <wallet adapter | zkLogin | sponsored tx | none>
- Off-chain services: <none | indexer | bot | agent>

## Sponsor integrations (load-bearing only)
- <Walrus | DeepBook | Scallop | OpenZeppelin Sui | OtterSec | zkLogin>: <what surface, why load-bearing>
- If decorative was proposed, refuse and note here why it was dropped.

## Network and upgrade authority
- Target network at launch: <devnet | testnet | mainnet>
- Upgrade authority intent: <keep with multisig | keep solo | burn at mainnet>
- Package id capture plan: <where it lands, who reads it>

## Success criteria
1. <observable on-chain or off-chain outcome, with the network it's checked on>
2. <observable>
3. <observable>

## Out of scope
- <thing the user might assume but is not in>
- <thing>

## Constraints
- Deadline: <Sui Overflow 2026 cutoff, or other. Note, do not use the deadline to shrink scope by default. AI-assisted builds compress weeks into days.>
- Risk tolerance: <hackathon demo | testnet pilot | production>
- Existing assets: <Move package id, frontend, deployed pools>

## Open questions for the user
- <thing the agent could not pin down>
```

The skill stops here. No code. Hand off.

## Workflow

1. **Read prior context**
   - If `.suiperpower/intent.md` exists and is fresh, read it, summarize, ask if it still holds. If yes, skip to step 6.
   - Otherwise read `.suiperpower/idea-context.md` and `.suiperpower/build-context.md` if present.
   - **Fast-path from idea phase**: if `idea-context.md` already has problem, audience, success criteria, pre-fill those and only ask for the Sui-specific fields below. Do not re-ask what `validate-idea` already answered.

2. **Restate the request**
   - One sentence, in the user's voice. Confirm before continuing. A vague "yeah" is not confirmation.

3. **Walk the Sui interview**
   Group questions so the user is not nickel-and-dimed. Five tracks:

   - **Problem track**: What pain, for whom, what do they do today (on Sui or off)? What is the one thing the product has to do well? Do not push for a scope cut here, AI-assisted pace means the full product is often in reach, the job is to name the load-bearing surface, not shrink the build.
   - **On-chain track**: Do users hold Objects, or only the protocol? Which Objects are shared vs owned vs immutable? What capabilities exist and who holds each? Will users compose calls through PTBs?
   - **Off-chain track**: Frontend or no? If yes, Next.js or mobile? Auth via wallet adapter, zkLogin, or sponsored transactions? Any indexer, bot, or agent?
   - **Sponsor track**: Any sponsor integration claimed (Walrus, DeepBook, Scallop, OZ Sui, zkLogin, OtterSec)? For each: is it load-bearing in the user flow, or decoration? Refuse to record decorative integrations as load-bearing.
   - **Ship track**: Target network at launch (devnet, testnet, mainnet)? Upgrade authority intent (keep, burn, multisig)? Deadline and risk tolerance?

4. **Push back on slop**
   - "Everyone" for audience: push for a Sui-native wedge.
   - "Good UX" for success: push for observable outcomes ("user can open the app, sign in with zkLogin, place a DeepBook order, see the fill on testnet").
   - "Mainnet eventually" with no plan: surface that mainnet means upgrade authority decisions now.
   - "It uses Walrus" with no flow: push for the specific blob lifecycle (write path, retrieval path, encryption posture). If no real lifecycle, drop the integration.
   - One push-back round per topic. If the user insists on vague, record the vagueness honestly and move on.

5. **Write `.suiperpower/intent.md`** using the schema in Outputs. Open questions stay open. Timestamp it.

6. **Hand off**
   - If non-trivial (multi-module, sponsor integration, or unclear object model), recommend `plan-before-code`.
   - If one-step (single Move module, single sponsor surface), point at the specific build skill via `skills/SKILL_ROUTER.md`.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself:

- Did I write `.suiperpower/intent.md`, not just talk about it?
- Is the on-chain shape concrete: Objects named, ownership decided, capabilities listed?
- Is every claimed sponsor integration load-bearing in a user flow, not decorative import?
- Is the target network and upgrade authority intent named, not deferred?
- Are success criteria observable on a specific network, not aspirational?
- Did I list out-of-scope items, not only in-scope?
- Did I avoid starting any code, even a stub?

If any answer is no, the skill keeps working before handing off.

## References

Knowledge docs (load when scope expands):

- `core/skills/data/sui-knowledge/03-move-and-objects.md`: Object model and capability reference.

## Use in your agent

- Claude Code: `claude "/suiper:clarify-intent <your message>"`
- Codex: `codex "/clarify-intent <your message>"`
- Cursor: paste a message like "step back, what am I really building on Sui", or reference `~/.cursor/rules/clarify-intent.mdc`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
