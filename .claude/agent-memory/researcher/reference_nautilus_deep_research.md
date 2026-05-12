---
name: Nautilus deep research for skill authoring
description: Complete technical research on Nautilus (Sui TEE off-chain computation): Move module APIs, Rust server, attestation flow, PCRs, deployment paths (self-managed AWS + Marlin Oyster), Seal integration, code examples, mainnet status
type: reference
---

## Nautilus: Verified Research for Skill Authoring (2026-05-11)

### What It Is
Framework for verifiable off-chain computation on Sui using TEEs (AWS Nitro Enclaves). Enclave runs sensitive code, produces cryptographic attestation, Move contracts verify on-chain before acting on results.

### Availability
- Testnet: April 2025
- Mainnet: June 10, 2025
- Custom PCR verification on mainnet: February 2026 (Marlin Nautilus enclaves)

### Architecture (Two Components)
1. **Enclave (Rust)**: Runs in AWS Nitro Enclave, generates Ed25519 keypair, signs responses with BCS serialization
2. **Smart Contract (Move)**: Registers enclave PCRs and public key, verifies signatures on computation results

### Deployment Paths
1. **Self-managed AWS**: EC2 with Nitro Enclave support, full control, ~$0.19/hr
2. **Marlin Oyster**: TEE marketplace, Docker image + Oyster CLI, stablecoin payments, operators provision enclaves

### Move Module: `enclave::enclave`
Key types: `Pcrs`, `EnclaveConfig<T>`, `Enclave<T>`, `Cap<T>`, `IntentMessage<T>`
Key functions: `new_cap`, `create_enclave_config`, `register_enclave`, `verify_signature`, `update_pcrs`, `update_name`, `destroy_old_enclave`

### Sui Framework: `sui::nitro_attestation`
Key type: `NitroAttestationDocument` (module_id, timestamp, digest, pcrs, public_key, user_data, nonce)
Entry function: `load_nitro_attestation(attestation_bytes, clock)` - parses and verifies attestation against AWS root CA stored in Sui framework

### Enclave Server Endpoints
- `GET /health_check` - connectivity test, returns public key
- `GET /get_attestation` - returns signed attestation document
- `POST /process_data` - custom computation (developer implements)

### Signing: Ed25519 + BCS
- `IntentMessage { intent: u8, timestamp_ms: u64, data: T }` serialized via BCS
- Signed with ephemeral Ed25519 key generated at enclave boot
- Move `verify_signature` checks Ed25519 sig against registered public key

### Seal + Nautilus Pattern
- Seal stores long-term keys, grants access only to attested TEEs
- Nautilus computes over encrypted data, Seal controls key access
- Feature flag `seal-example` in server code for this integration

### Sources
- GitHub: https://github.com/MystenLabs/nautilus
- Example: https://github.com/MystenLabs/nautilus-twitter
- Docs: https://docs.sui.io/guides/developer/nautilus
- Blog: https://blog.sui.io/nautilus-offchain-security-privacy-web3/
- Marlin: https://blog.marlin.org/scaling-confidential-compute-on-sui-nautilus-and-marlin-oyster-integration
