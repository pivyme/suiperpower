# Agent pitfalls on Sui

Common mistakes when building AI agents that transact on Sui, and how to avoid them.

## Hardcoded private keys

The most common and most dangerous mistake. Agent keypairs end up in source code, .env files checked into git, or plaintext config.

Fix:
- Use KMS (AWS KMS, GCP KMS, Vault) for server-side agents.
- Use zkLogin for session-scoped agents (no persistent key at all).
- Add `.env` and any key files to `.gitignore` before the first commit.
- Rotate keys on any suspected exposure.

## No spending limits or kill switch

An autonomous agent with unrestricted access to a funded wallet can drain it. LLM hallucinations, prompt injection, or logic bugs can trigger unexpected transactions.

Fix:
- Set a per-transaction spending cap enforced in the agent's transaction-building code.
- Set a per-session or per-day cumulative limit.
- Implement a kill switch (a flag in env or a shared object on chain) that halts all agent transactions.
- For high-value agents, require human approval above a threshold.

## Multi-transaction flows instead of PTBs

Building agent actions as sequential individual transactions instead of composing them into a single PTB. If transaction 2 fails after transaction 1 succeeds, the agent is in an inconsistent state.

Fix:
- Always compose related actions into a single PTB.
- PTBs support up to 1,024 Move calls. Use them.
- If a flow genuinely cannot fit in one PTB, design explicit rollback logic for partial failures.

## Ignoring gas estimation

Agents that build transactions without checking gas costs. The transaction fails at execution, the agent retries in a loop, burning gas on repeated failures.

Fix:
- Use `dryRunTransactionBlock` before submitting to check effects and gas cost.
- If the dry run fails, do not submit. Log the error and surface it.
- For sponsored transactions, confirm the sponsor has sufficient balance before building the PTB.

## Shared object contention

Using a single shared object as the coordination point for many agents. Every agent transaction that touches the same shared object goes through consensus sequencing, creating a bottleneck.

Fix:
- Partition state across multiple shared objects (shard by agent ID, by time window, or by task type).
- Use owned objects where possible (owned object transactions skip consensus).
- Use events for signaling instead of shared object reads for coordination that does not need atomicity.

## MemWal without namespace isolation

Using the same MemWal namespace for different agent contexts. Memories from one task bleed into another, causing the agent to act on irrelevant context.

Fix:
- Use a unique namespace per agent scope (e.g., `trading-agent-btc`, `support-agent-user-123`).
- Clear or archive stale memories when the agent's task changes.

## Trusting LLM output for transaction parameters

The agent uses raw LLM output (amounts, addresses, function targets) directly in PTB construction without validation.

Fix:
- Validate every parameter before including it in a PTB.
- Amounts: check against known bounds, parse as BigInt, reject negative or unreasonable values.
- Addresses: validate format (0x + 64 hex chars on Sui).
- Function targets: allowlist the Move functions the agent is permitted to call.
- Never let the LLM construct arbitrary Move call targets.

## Missing event subscriptions for reactive agents

Agents that poll chain state on a timer instead of subscribing to events. Polling is wasteful and introduces latency.

Fix:
- Use `suix_subscribeEvent` for real-time event streams.
- Fall back to polling only when WebSocket connections are unavailable.
- Set a reasonable reconnection strategy for dropped WebSocket connections.

## No attestation verification for Nautilus results

Using Nautilus enclave output without verifying the attestation on chain. The whole point of Nautilus is verifiable computation. Skipping verification makes it just a regular server.

Fix:
- Always register enclave PCRs in the Move `EnclaveConfig`.
- Always call `enclave::verify_signature` in the Move contract before acting on enclave output.
- In production, verify against specific PCR values, not a wildcard.

## Ignoring zkLogin epoch expiry

zkLogin proofs are bound to the current epoch. If the agent holds a proof across an epoch boundary, transactions will fail.

Fix:
- Regenerate the zkLogin proof at the start of each agent session.
- Monitor the current epoch and refresh before expiry.
- For long-running agents, use server-side keypairs instead of zkLogin.

## Over-scoping the agent

Giving the agent permission to call any Move function on any object. This maximizes the blast radius of any bug or prompt injection.

Fix:
- Define an explicit allowlist of Move functions the agent can call.
- Scope object access to specific object IDs the agent needs.
- Log every transaction the agent builds, with the full PTB, for audit.
- Start narrow, expand permissions only when the use case requires it.

Last updated: 2026-05-11.
