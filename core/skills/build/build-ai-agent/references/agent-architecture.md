# Agent architecture on Sui

Why Sui is uniquely suited for AI agents, and the building blocks available.

## Why Sui for agents

AI agents need four things from a blockchain. Sui provides all four natively.

| Requirement | Sui feature | Detail |
|---|---|---|
| Atomic multi-step actions | PTBs | Up to 1,024 Move calls per tx, outputs chain via NestedResult |
| Low-latency execution | Mysticeti consensus | Sub-second finality (~390ms), no agent stalls |
| Independent asset control | Object model | Each asset has its own ownership and permissions, no global state lock |
| Parallel execution | Object-level parallelism | Unrelated agent transactions execute without contention |

Source: https://blog.sui.io/agentic-execution-ai-agents-need-blockchain/

## PTBs as agent tool use

A PTB (Programmable Transaction Block) is the agent's primary action primitive. Instead of calling one contract at a time, the agent composes a multi-step atomic transaction.

Pattern:
1. Agent queries chain state (RPC or dry run).
2. Agent decides on action sequence.
3. Agent builds a PTB: check condition, execute swap, update registry, emit event.
4. Agent signs and submits. All steps succeed or all revert.

```typescript
import { Transaction } from '@mysten/sui/transactions';

const tx = new Transaction();
// Step 1: read pool state
const [pool] = tx.moveCall({ target: '0xPKG::pool::get_state', arguments: [tx.object(poolId)] });
// Step 2: swap tokens
const [output] = tx.moveCall({ target: '0xPKG::pool::swap', arguments: [pool, tx.pure.u64(amount)] });
// Step 3: update agent registry
tx.moveCall({ target: '0xPKG::registry::log_action', arguments: [tx.object(registryId), output] });
```

Key constraint: PTBs are atomic. If any step fails, the entire transaction reverts. This is a feature for agents: no partial state corruption.

Source: https://docs.sui.io/concepts/transactions/prog-txn-blocks

## Wallet patterns

### zkLogin (ephemeral, user-delegated)

Agent creates an ephemeral Ed25519 keypair per session. The user authenticates via OAuth (Google, Apple, Facebook, Twitch, AWS, Slack, Kakao, Microsoft, Credenza3, Karrier One). The zkLogin proof ties the ephemeral key to the OAuth identity. No persistent key custody.

Best for: user-facing assistants, session-scoped agents, gasless onboarding.

Source: https://docs.sui.io/concepts/cryptography/zklogin

### Sponsored transactions (gasless agents)

The agent never holds SUI for gas. A sponsor (Enoki, Shinami Gas Station, or self-hosted) signs the gas portion of the transaction. Combined with zkLogin, agents create wallets, transact, and expire without managing keys or gas balances.

Best for: consumer-facing agents, first-action-free flows, agents that should not hold funds.

Source: https://docs.enoki.mystenlabs.com/ts-sdk/sponsored-transactions

### Server-side Ed25519 keypair

For fully autonomous server-side agents, generate an Ed25519 keypair. Store the private key in environment variables or KMS. Fund the address with SUI for gas.

Best for: trading bots, backend autonomous agents, always-on services.

```typescript
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
const keypair = Ed25519Keypair.generate();
// Store keypair.getSecretKey() in KMS, never in source code
```

## Memory

### MemWal

Encrypted, persistent agent memory backed by Walrus storage and Seal encryption. Semantic search over stored memories.

Packages: `@mysten-incubation/memwal`, `/manual`, `/ai` (Vercel AI SDK integration).
Peer deps: `@mysten/sui`, `@mysten/seal`, `@mysten/walrus`, `ai`, `zod`.

Core flow: `remember()` stores text, `recall()` retrieves by semantic similarity.

Source: https://github.com/MystenLabs/MemWal

### Walrus (raw blob storage)

For agents that need to store large data (datasets, model outputs, media) without the MemWal abstraction. Upload bytes, get a blob ID, optionally commit the ID on chain.

Source: https://docs.walrus.site/

## Compute

### Nautilus (verifiable TEE inference)

Runs AI inference inside AWS Nitro Enclaves. The enclave signs results with an ephemeral Ed25519 key. Move contracts verify the signature and PCR attestation on chain before acting on the result.

Flow: user submits request, Nautilus enclave runs inference, signs result via BCS, Move contract calls `enclave::verify_signature`, acts on verified output.

Deployment: self-managed AWS (~$0.19/hr) or Marlin Oyster marketplace.

Source: https://github.com/MystenLabs/nautilus

### Atoma Network (decentralized AI cloud)

OpenAI-compatible API for inference. TEE isolation for private computation. 200+ dApps integrated. Mainnet since December 2024.

Source: https://github.com/atoma-network/atoma-node

## Coordination (multi-agent)

### Shared objects as coordination points

Use shared objects for bulletin boards, task queues, registries. Agents read and write through Mysticeti consensus. Contention only arises when agents touch the same shared object in the same checkpoint.

### Events as signals

Emit events via `sui::event::emit`. Other agents poll via `queryEvents` RPC (the WebSocket `suix_subscribeEvent` method is deprecated). Events are not stored in global state, making them lightweight for signaling.

### PTB-internal coordination

For atomic multi-step coordination between protocols, compose within a single PTB. Agent A's output feeds Agent B's input within the same transaction.

## Agent data privacy with Seal

Encrypt agent-managed data (user preferences, strategies, model weights) with Seal. A Move access policy gates who can decrypt. MemWal uses Seal internally for memory encryption.

Source: https://seal-docs.wal.app/

Last updated: 2026-05-11.
