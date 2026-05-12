---
name: Agentic Web on Sui deep research
description: Complete landscape research for AI agents transacting on Sui. Covers PTBs, agent wallets (zkLogin/sponsored), memory (MemWal/Walrus), compute (Nautilus TEE/Atoma), coordination (shared objects/events), frameworks (Talus Nexus, Sui Agent Kit), Seal encryption, and example architectures. Sources verified May 2026.
type: reference
---

## Key Sources
- Sui agentic vision: https://blog.sui.io/agentic-execution-ai-agents-need-blockchain/
- Composable agent-ready apps: https://blog.sui.io/from-apps-to-composable-systems/
- Nautilus docs: https://docs.sui.io/guides/developer/nautilus/using-nautilus
- Nautilus GitHub: https://github.com/MystenLabs/nautilus
- MemWal GitHub: https://github.com/MystenLabs/MemWal
- Seal: https://seal.mystenlabs.com/how-it-works and https://seal-docs.wal.app/
- PTBs: https://docs.sui.io/concepts/transactions/prog-txn-blocks
- zkLogin: https://docs.sui.io/concepts/cryptography/zklogin
- Sponsored txs: https://docs.enoki.mystenlabs.com/ts-sdk/sponsored-transactions
- Atoma: https://github.com/atoma-network/atoma-node
- Talus/Nexus: https://talus.network/litepaper
- Sui Agent Kit: https://github.com/pelagosaionsui/sui-agent-kit
- Turnkey for Sui agents: https://www.turnkey.com/blog/sui-for-ai-blockchain-infrastructure-for-multi-agent-systems
- Overflow 2026 Agentic Web track: overflow.sui.io (1st $30K, 2nd $15K, 3rd $10K, 4th $7.5K)
- Agent Typhoon hackathon winner: Apocalyptic World (AI game on Atoma)

## Architecture Patterns
- PTBs: up to 1024 Move calls per tx, atomic, outputs chain between commands
- Agent wallets: zkLogin ephemeral keys + Enoki sponsored txs = gasless invisible wallets
- Agent memory: MemWal (encrypted Walrus blobs + semantic search + Seal encryption)
- Agent compute: Nautilus (AWS Nitro TEE, on-chain PCR verification), Atoma (decentralized GPU, OpenAI-compatible API, TEE privacy)
- Agent coordination: shared objects through Mysticeti consensus, events via sui::event::emit
- Agent data privacy: Seal identity-based encryption with on-chain Move access policies
