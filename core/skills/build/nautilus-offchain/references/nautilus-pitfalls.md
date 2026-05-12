# Nautilus pitfalls

Common mistakes when building with Nautilus TEEs on Sui. Read before writing any code.

## PCR values change on any code change

PCR0, PCR1, PCR2 are deterministic hashes of the enclave image. Any change to the Rust source, dependencies, or Docker configuration produces different PCR values. After every code change:

1. Rebuild the enclave image.
2. Extract the new PCR values.
3. Call `update_pcrs` on chain with the new values (requires the `Cap<T>` admin object).
4. Re-register the enclave with a fresh attestation.

Forgetting this means the on-chain config rejects the enclave's attestation. There is no partial update. Plan for this in your CI/CD pipeline.

## BCS struct field order must match exactly

BCS serialization is positional, not named. The Rust struct and the Move struct must have fields in the exact same order with compatible types.

**Wrong:**
```rust
// Rust
struct Result { score: u64, address: Vec<u8> }
```
```move
// Move: fields reversed
struct Result has drop { address: vector<u8>, score: u64 }
```

**Right:**
```rust
// Rust
struct Result { score: u64, address: Vec<u8> }
```
```move
// Move: same order
struct Result has drop { score: u64, address: vector<u8> }
```

A mismatch causes silent deserialization errors or signature verification failures. Always define the struct in one place first (Move), then mirror it exactly in Rust.

## New keypair on every boot

The enclave generates an ephemeral Ed25519 keypair each time it starts. This means:

- After any restart (crash, redeploy, scaling event), the enclave has a new public key.
- The old on-chain `Enclave` object references the old public key and will reject signatures from the new instance.
- You must call `register_enclave` again with the new attestation document after every restart.

Design your system to handle re-registration gracefully. Consider automating this in the enclave's startup sequence.

## verify_signature does NOT check timestamp freshness

`enclave::enclave::verify_signature` validates the cryptographic signature but does not enforce that the timestamp is recent. An attacker could replay an old valid signature indefinitely.

**Always add your own freshness check:**

```move
let current_ms = clock::timestamp_ms(clock);
assert!(current_ms - timestamp_ms < MAX_AGE_MS, E_STALE_RESULT);
```

Pick a `MAX_AGE_MS` appropriate for your use case. 60 seconds is a reasonable default. Tighter windows (5-10 seconds) for financial operations.

## Not security audited

As of the time of writing, Nautilus has not undergone a formal security audit. Consider this when deciding trust boundaries:

- Do not use for high-value financial operations without additional safeguards.
- Add on-chain circuit breakers (max value per transaction, admin pause).
- Monitor enclave output for anomalies.
- Plan for the possibility that the TEE model has undiscovered weaknesses.

## AWS Nitro Enclave constraints

- The enclave has no persistent storage. All state is lost on restart.
- The enclave has no direct network access. Communication goes through a vsock proxy on the parent EC2 instance.
- Memory is allocated from the parent instance. Size the EC2 instance accordingly.
- Only specific EC2 instance types support Nitro Enclaves (e.g., m5.xlarge and above).
- Debug mode disables attestation security. Never use debug mode in production.
