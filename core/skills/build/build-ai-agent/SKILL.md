---
name: build-ai-agent
description: Build autonomous AI agents that transact on Sui using PTBs, zkLogin wallets, MemWal memory, Nautilus TEEs, and Atoma inference. Use when the user says "AI agent on Sui", "build an agent", "agentic web", "autonomous agent", "agent that transacts", "AI trading bot", "agent wallet", "agent memory", "build with Nautilus", "Atoma on Sui", "multi-agent coordination", or "agent PTB composition". Reads .suiperpower/build-context.md if present.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track build-ai-agent build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track build-ai-agent build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Guides the user through building an AI agent that autonomously transacts on Sui. Picks the right wallet pattern, compute layer, memory system, and coordination model for the agent's use case, then wires them together with PTBs as the agent's tool-use layer. Refuses to ship an agent that cannot execute a real transaction end to end.

## When to use it

- The user wants to build an AI agent that reads chain state and executes transactions.
- The user is targeting the Agentic Web track at Sui Overflow 2026.
- The user wants agent-managed wallets (zkLogin, sponsored, or server-side keypair).
- The user wants persistent agent memory via MemWal.
- The user needs verifiable AI inference via Nautilus or Atoma.
- The user wants multi-agent coordination through shared objects or events.

## When NOT to use it

- If the user has not picked a project yet, use `find-next-sui-idea` first.
- If the user has not scaffolded a project, use `scaffold-project` first.
- If the user only needs zkLogin without an autonomous agent, use `sui-zk-login`.
- If the user only needs sponsored transactions without an agent, use `sponsored-transactions`.
- If the user only needs Seal encryption without an agent, use `seal-access-control`.
- If the user wants to write Move code not related to agents, use `build-with-move`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A Sui project (Move package and/or TS/Python backend).
- Optional: `.suiperpower/build-context.md` from `scaffold-project`. Read it if present.
- The agent's purpose and autonomy level.

If unclear, interview the user for:

- What does the agent do in one sentence?
- Does the agent act on behalf of a user (delegated) or independently (autonomous)?
- Does the agent need persistent memory across sessions?
- Does the agent need verifiable inference (Nautilus TEE or Atoma)?
- Does the agent manage funds? If yes, what are the custody constraints?

## Outputs

- Agent wallet setup (zkLogin + sponsored, server keypair, or hybrid).
- PTB composition logic for the agent's on-chain actions.
- Memory integration (MemWal) if the agent needs persistence.
- Compute integration (Nautilus or Atoma) if the agent needs inference.
- Coordination layer (shared objects, events) if multi-agent.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## build-ai-agent session, <timestamp>
  - agent purpose: <one sentence>
  - wallet pattern: <zkLogin+sponsored | keypair | hybrid>
  - compute: <Nautilus | Atoma | local | none>
  - memory: <MemWal | custom | none>
  - coordination: <shared objects | events | none>
  - packages added: <list>
  - open issues: <list>
  ```

## Decision table: pick agent architecture

| Use case | Wallet | Compute | Memory | Coordination |
|---|---|---|---|---|
| Trading bot (server-side) | Ed25519 keypair | Atoma or local LLM | MemWal | Events for signals |
| User-facing assistant | zkLogin + Enoki sponsored | Atoma API | MemWal | None |
| Data marketplace agent | zkLogin + sponsored | Nautilus TEE | Walrus blobs | Shared object registry |
| Multi-agent swarm | Keypair per agent | Atoma | MemWal per agent | Shared objects as bulletin boards |
| Privacy-preserving agent | zkLogin | Nautilus TEE + Seal | MemWal (encrypted) | Events, Seal-gated |
| Game NPC / autonomous entity | Keypair (server) | Local or Atoma | MemWal | Shared game state objects |

Confirm the architecture with the user before writing code. If the use case does not fit a row, compose from the columns.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if it exists.
   - Confirm the agent's purpose in one sentence.
   - Determine autonomy level: delegated (user approves each action) vs fully autonomous.

2. **Pick architecture**
   - Walk through the decision table above with the user.
   - Confirm wallet, compute, memory, and coordination choices.
   - If the agent manages real funds, require explicit discussion of custody risk, loss bounds, and kill switches.

3. **Wallet setup**
   - **zkLogin + sponsored**: Use Enoki for sponsored transactions, zkLogin for ephemeral keys. Agent creates a wallet per session, transacts without holding SUI. See `sui-zk-login` and `sponsored-transactions` skills for detail.
   - **Server keypair**: Generate Ed25519 keypair via `@mysten/sui/keypairs/ed25519`. Store the private key in env or KMS, never in source. Fund with SUI for gas.
   - **Hybrid**: zkLogin for user-facing flows, keypair for server-side autonomous actions.

4. **PTB composition (agent tool use)**
   - Each agent action maps to a PTB. Up to 1,024 Move calls per transaction, outputs chain between commands via `NestedResult`.
   - Pattern: agent reads state (dry run or RPC query), decides action, composes PTB, signs, executes.
   - Use `Transaction` from `@mysten/sui/transactions`. Compose multi-step atomic operations: check condition, swap, update state, emit event, all in one PTB.
   - See `references/agent-architecture.md` for PTB-as-tool-use patterns.

5. **Memory integration (if applicable)**
   - Install `@mysten-incubation/memwal` and peer deps (`@mysten/sui`, `@mysten/seal`, `@mysten/walrus`, `ai`, `zod`).
   - Initialize MemWal with a delegate key, account id, server URL, and namespace.
   - Use `mw.remember()` to store decisions, user preferences, and context.
   - Use `mw.recall()` for semantic retrieval.
   - See `references/agent-tooling.md` for the API.

6. **Compute integration (if applicable)**
   - **Atoma**: OpenAI-compatible API, deploy models or use hosted endpoints. TEE isolation for private inference.
   - **Nautilus**: For verifiable inference with on-chain attestation. Enclave runs inference, signs result, Move contract verifies. See `references/agent-architecture.md` for the Nautilus flow.

7. **Coordination (if multi-agent)**
   - Use shared objects as coordination points (bulletin boards, registries, task queues).
   - Use `sui::event::emit` for agent-to-agent signals, subscribe via `suix_subscribeEvent`.
   - For atomic multi-step coordination, compose within a single PTB.

8. **Test end to end**
   - The agent must execute at least one real transaction on testnet.
   - If the agent has memory, verify `remember` then `recall` returns the stored context.
   - If multi-agent, verify two agents can coordinate through their shared mechanism.
   - If using Nautilus, verify the attestation verifies on chain.

9. **Writeback**
   - Append session details to `.suiperpower/build-context.md`.
   - List open issues, especially custody risks if the agent manages funds.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Has the agent executed at least one real transaction on testnet (not just a dry run)?
- Is the wallet pattern explicitly chosen and documented, not defaulted silently?
- If the agent manages funds, is there a kill switch or spending limit?
- Are private keys stored in env/KMS, never hardcoded or committed?
- If using MemWal, does a round-trip (remember then recall) work?
- If using Nautilus or Atoma, is the compute call wired and returning real results?
- Are PTBs composed atomically (no multi-tx flows that can partially fail)?
- Is the agent's scope clearly bounded (what it can and cannot do)?

If any answer is no, the skill reports the gap and works through it before claiming the session is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/agent-architecture.md`: Why Sui for agents, PTBs as tool use, wallet patterns, memory, compute, coordination.
- `references/agent-tooling.md`: MemWal API, Atoma API, agent frameworks (Sui Agent Kit, Caterpillar Kit, Talus), Enoki sponsored flow, npm packages.
- `references/agent-pitfalls.md`: Common mistakes when building AI agents on Sui.

External docs (fetch at runtime for the latest API surface):

- MemWal: https://github.com/MystenLabs/MemWal
- Nautilus: https://github.com/MystenLabs/nautilus
- Atoma: https://github.com/atoma-network/atoma-node
- PTBs: https://docs.sui.io/concepts/transactions/prog-txn-blocks
- zkLogin: https://docs.sui.io/concepts/cryptography/zklogin
- Enoki sponsored txs: https://docs.enoki.mystenlabs.com/ts-sdk/sponsored-transactions

## Use in your agent

- Claude Code: `claude "/suiper:build-ai-agent <your message>"`
- Codex: `codex "/build-ai-agent <your message>"`
- Cursor: paste a chat message that includes a phrase like "build an AI agent on Sui" or reference `~/.cursor/rules/build-ai-agent.mdc`

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
