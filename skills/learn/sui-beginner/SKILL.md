---
name: sui-beginner
description: Teach Sui from scratch in plain language, with explicit framing for builders coming from EVM or Solana so they map known concepts to Sui equivalents instead of being told "it is just different". Use when the user says "teach me Sui", "I am new to Sui", "explain Sui to me", "Sui basics", "Sui for beginners", "I am coming from EVM", "I am coming from Solana", "what is different on Sui", "how does Sui work", or "Sui starter". Reads from skills/data/sui-knowledge/ and writes session notes to .suiperpower/learnings.md if the user wants them captured.
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
  _TEL_EVENT='{"skill":"sui-beginner","phase":"learn","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
  echo "$_TEL_EVENT" >> ~/.suiperpower/telemetry.jsonl 2>/dev/null || true
  _CONVEX_URL=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
  [ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" \
    -H "Content-Type: application/json" \
    -d '{"path":"telemetry:track","args":{"skill":"sui-beginner","phase":"learn","status":"started","version":"0.1.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' \
    >/dev/null 2>&1 &
  true
fi
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Walks a new builder through the Sui mental model in the order it actually clicks: object-centric state, the Move type system, ownership, transactions as Programmable Transaction Blocks, and how the SDKs and wallets sit on top. The teaching is grounded in `skills/data/sui-knowledge/` so the explanations stay in sync with the canonical knowledge base.

For builders coming from EVM or Solana, the skill adds a translation pass: each Sui concept is paired with the closest analogue from their previous chain, plus a clean note on where the analogy breaks. The point is to use the user's existing intuition, then mark the cliff.

## When to use it

- A first session on Sui, before scaffolding anything.
- Right after `find-next-sui-idea`, when the user has picked an idea but has not yet built on Sui.
- When the user has been writing Solidity or Anchor and is about to write their first Move module.

## When NOT to use it

- The user is already confident in Move and objects. Route to `build-with-move` or `object-model-design`.
- The user wants a deep theoretical dive. Route to `virtual-sui-incubator`.
- The user wants to ship now. Route to `scaffold-project`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- The user's prior chain experience: EVM, Solana, neither, both. If unstated, ask.
- The user's goal in this session: orientation only, or orientation plus first steps.
- Optional: `.suiperpower/idea-context.md` so the examples can be tied to the user's chosen idea.

## Outputs

A guided session, optionally followed by an entry written to `.suiperpower/learnings.md` (under `## What we tried` and `## Decisions`) so the next skill can read where the user is. Format when written:

```markdown
## Learnings, <timestamp>

### What we tried
- ran sui-beginner: intro to objects, Move, PTBs (<duration> minutes)

### Decisions
- prior background: <evm | solana | both | neither>
- next step: <chosen follow-up skill>
```

## Workflow

1. **Frame the user**
   - Ask their prior chain experience and their goal for the session.
   - Pick the right reference doc as anchor:
     - `skills/data/sui-knowledge/01-what-and-why-sui.md` for the orientation.
     - `skills/data/sui-knowledge/02-what-makes-sui-unique.md` for the why.
     - `skills/data/sui-knowledge/03-move-and-objects.md` for the model.
   - For EVM-background users, also load `references/evm-to-sui.md`.
   - For Solana-background users, also load `references/solana-to-sui.md`.

2. **Teach the object model first**
   - Sui is object-centric. Every piece of on-chain state is an Object with an ID, an owner, and a type.
   - Owned vs Shared vs Immutable. Owned objects belong to one address; shared objects accept any signer; immutable objects are read-only.
   - Translation:
     - From EVM: there is no global mapping. State lives in objects, not in contract storage.
     - From Solana: closer to Solana accounts, but typed by Move and with explicit ownership in metadata, not in PDA seeds.

3. **Teach Move and the type system**
   - Move is resource-oriented. A struct with `key` is an Object; a struct with `store` can live inside another Object.
   - Abilities: `key`, `store`, `copy`, `drop`. The compiler enforces these. Resources cannot be silently duplicated or dropped.
   - Translation:
     - From EVM: Solidity lets you copy state freely. Move does not. This protects against duplicate spend bugs at the type level.
     - From Solana: similar to Anchor in spirit (typed accounts), but the abilities system is stricter and the compiler does more for you.

4. **Teach Capabilities**
   - A Capability is a Move object that grants a permission to its holder. `TreasuryCap`, `UpgradeCap`, `AdminCap` are common shapes.
   - Translation:
     - From EVM: closest analogue is a privileged role in OpenZeppelin AccessControl, but capabilities are first-class objects, transferable, splittable, and not bound to a single address by default.
     - From Solana: closest analogue is a signer authority on an account, except a capability is a typed object you hold.

5. **Teach PTBs**
   - A Programmable Transaction Block is a single transaction that runs multiple Move calls atomically, passing outputs as inputs.
   - Translation:
     - From EVM: closest is multicall, but PTBs are first-class and the SDK builds them ergonomically.
     - From Solana: closest is a single transaction with multiple instructions; PTBs let you wire outputs directly into the next call's inputs without intermediate accounts.

6. **Show the SDKs and wallets**
   - `@mysten/sui` for TypeScript clients.
   - `@mysten/dapp-kit` for React.
   - Slush for the user wallet, plus zkLogin for OAuth-style login.
   - Reference: `skills/data/sui-knowledge/04-protocols-and-sdks.md`.

7. **Pick a concrete next step**
   - If the user wants to write Move next, hand off to `build-with-move`.
   - If they want to scaffold a full project, hand off to `scaffold-project`.
   - If they want a deeper dive on the model, hand off to `virtual-sui-incubator`.

8. **Optional writeback**
   - Ask if the user wants this session captured in `.suiperpower/learnings.md`.
   - If yes, append `## What we tried` and `## Decisions` entries per the phase-handoff spec, with timestamp and duration.

## Quality gate (anti-slop)

Before reporting done:

- Did the session actually teach the object model, Move abilities, capabilities, and PTBs, in that order?
- For an EVM or Solana background user, did each major concept include a translation note plus where the analogy breaks?
- Did the session end with a concrete recommended next skill, not a generic "good luck"?
- Did the skill avoid pitching Sui in superlatives (no "best", no "fastest", no "revolutionary")?
- If the user opted in to writeback, did the writeback follow phase-handoff spec headers exactly?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/evm-to-sui.md`: Concept-by-concept translation table for Solidity / EVM developers.
- `references/solana-to-sui.md`: Concept-by-concept translation table for Anchor / Solana developers.

Knowledge base anchors (canonical):

- `skills/data/sui-knowledge/01-what-and-why-sui.md`
- `skills/data/sui-knowledge/02-what-makes-sui-unique.md`
- `skills/data/sui-knowledge/03-move-and-objects.md`
- `skills/data/sui-knowledge/04-protocols-and-sdks.md`

## Use in your agent

- Claude Code: `claude "/sui-beginner <your message>"`
- Codex: `codex "/sui-beginner <your message>"`
- Cursor: paste a chat message that includes a phrase like "teach me Sui", or load `~/.cursor/rules/sui-beginner.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
