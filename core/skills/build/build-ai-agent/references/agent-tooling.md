# Agent tooling on Sui

Frameworks, SDKs, and APIs for building AI agents that transact on Sui.

## Agent frameworks

| Framework | Package / URL | What it does |
|---|---|---|
| Sui Agent Kit (Pelagos) | `@pelagosai/sui-agent-kit` | LangChain and Vercel AI SDK integration. Pre-built tools for NAVI, Cetus, Suilend, transfers, staking. |
| Sui AI Agent Kit (Caterpillar) | github.com/caterpillardev/Sui-AI-Agent-Kit | MCP-based agent toolkit. Tools for Suilend, Steamm, SpringSui, transfers. |
| Talus / Nexus | talus.network | On-chain agent framework. Mainnet April 2026. Agents, tools, and coordination as Move objects. |

Pick a framework when the agent needs pre-built DeFi or protocol integrations. Build from scratch (PTBs + SDK) when the agent's actions are custom.

## MemWal API

```bash
pnpm add @mysten-incubation/memwal @mysten/sui @mysten/seal @mysten/walrus ai zod
```

```typescript
import { MemWal } from '@mysten-incubation/memwal';

const mw = MemWal.create({
  key: 'delegate-key-hex',
  accountId: 'memwal-account-id',
  serverUrl: 'https://relayer-url.com',
  namespace: 'agent-scope',
});

// Store a memory
await mw.remember('User prefers DeFi protocols with < 5% impermanent loss');

// Recall by semantic similarity
const memories = await mw.recall('what does the user want?');
```

Sub-packages:
- `@mysten-incubation/memwal`: core SDK
- `@mysten-incubation/memwal/manual`: manual memory management
- `@mysten-incubation/memwal/ai`: Vercel AI SDK provider integration

MemWal encrypts memories via Seal and stores ciphertext on Walrus. Only the agent (or authorized parties) can decrypt.

Source: https://github.com/MystenLabs/MemWal

## Atoma Network API

OpenAI-compatible inference API. Deploy models or use hosted endpoints.

```typescript
const response = await fetch('https://api.atoma.network/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ATOMA_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'meta-llama/Llama-3.3-70B-Instruct',
    messages: [{ role: 'user', content: 'Analyze this DeFi position...' }],
  }),
});
```

Features: confidential inference (TEE), multiple model providers, usage-based billing.

Source: https://github.com/atoma-network/atoma-node

## Enoki sponsored transactions flow

For agents using zkLogin, Enoki sponsors gas so the agent never holds SUI.

Flow:
1. Agent builds the transaction (PTB).
2. Agent sends the transaction bytes to Enoki's sponsorship endpoint.
3. Enoki returns a sponsored transaction with the gas object attached.
4. Agent (or user via zkLogin) signs the sponsored transaction.
5. Enoki co-signs and submits.

The agent pays nothing. The Enoki project account is debited.

Source: https://docs.enoki.mystenlabs.com/ts-sdk/sponsored-transactions

## Nautilus enclave flow

For agents that need verifiable inference with on-chain proof.

1. Deploy Rust enclave code to AWS Nitro (self-managed) or Marlin Oyster.
2. Enclave boots, generates Ed25519 keypair, produces attestation document.
3. Register enclave PCRs and public key in a Move `EnclaveConfig`.
4. Agent sends inference request to enclave's `POST /process_data` endpoint.
5. Enclave runs computation, signs result as `IntentMessage<T>` via BCS + Ed25519.
6. Agent submits signed result to Move contract.
7. Move contract calls `enclave::verify_signature`, acts on verified output.

Source: https://github.com/MystenLabs/nautilus

## Key npm packages

| Package | Purpose |
|---|---|
| `@mysten/sui` | Sui TS SDK (transactions, RPC, keypairs) |
| `@mysten/sui/transactions` | Transaction (PTB) builder |
| `@mysten/sui/keypairs/ed25519` | Ed25519 keypair generation |
| `@mysten-incubation/memwal` | Agent memory (encrypted, semantic) |
| `@mysten/seal` | Client-side encryption with on-chain access policies |
| `@mysten/walrus` | Walrus blob storage SDK |
| `@mysten/zklogin` | zkLogin proof generation |
| `@mysten/enoki` | Enoki SDK (zkLogin + sponsored txs) |
| `@pelagosai/sui-agent-kit` | Pre-built agent tools (NAVI, Cetus, Suilend) |
| `ai` | Vercel AI SDK (for MemWal AI provider) |

## Overflow 2025 AI winners (architecture patterns)

| Project | Architecture | Result |
|---|---|---|
| Suithetic | AI data marketplace, synthetic data generation | 1st AI track |
| OpenGraph | ML model verification on chain | 2nd AI track |
| Magma Finance | AI-driven DeFi rebalancing | 1st DeFi (used AI) |
| Sui Sentinel | Nautilus TEE for threat detection | 3rd Crypto track |

Pattern: winners used Sui primitives (PTBs, shared objects, Seal, Nautilus) as load-bearing infrastructure, not decorative imports.

Last updated: 2026-05-11.
