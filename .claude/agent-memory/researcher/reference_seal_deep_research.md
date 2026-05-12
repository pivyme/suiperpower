---
name: Seal deep research (2026-05-11)
description: Complete technical research on Seal (Sui decryption secrets management), SDK API, Move modules, key servers, access patterns, code examples, for skill authoring
type: reference
---

Seal deep research completed 2026-05-11. Key findings:
- SDK: @mysten/seal v1.1.0+, peer dep @mysten/sui v2.5.1+
- Seal package on mainnet: 0xcb83a248bda5f7a0a431e6bf9e96d184e604130ec5218696e3f1211113b447b7
- Seal package on testnet: 0x8d90881fc48eb30d4422db68083b49e7d0f879658444e3a0ed85ce47feaa54b2
- Key classes: SealClient, SessionKey, EncryptedObject
- Key pattern: seal_approve* Move entry functions, first param id: vector<u8>
- 7 Move pattern modules: whitelist, subscription, account_based, private_data, tle, voting, key_request
- 7 core seal Move modules: bf_hmac_encryption, gf256, hmac256ctr, kdf, key_server, polynomial, staleness
- Decentralized key server (3-of-5) on testnet, mainnet support planned
- Full research output delivered as assistant message in conversation
