# Nautilus architecture reference

## Overview

Nautilus is a framework for verifiable off-chain computation on Sui using AWS Nitro Enclaves. Two components work together: a Rust server running inside the enclave, and Move contracts on Sui that verify the enclave's output.

## Move module: `enclave::enclave`

The on-chain side uses the `enclave::enclave` module to manage enclave registration and signature verification.

### Core types

| Type | Definition | Purpose |
|---|---|---|
| `Cap<T>` | `has key, store` | Admin capability (owned object). Authorizes `update_pcrs` and `update_name`. |
| `EnclaveConfig<T>` | `has key` | Shared object storing PCR values and enclave metadata. |
| `Enclave<T>` | `has key` | Shared object storing the registered enclave's public key. |
| `Pcrs` | `(vector<u8>, vector<u8>, vector<u8>)`, `has copy, drop, store` | Tuple of PCR0, PCR1, PCR2 measurement values. |
| `IntentMessage<T>` | `has copy, drop` | Wrapper for signed intent payloads. |

### Functions

| Function | Signature | Purpose |
|---|---|---|
| `new_cap` | `new_cap<T: drop>(witness: T, ctx: &mut TxContext): Cap<T>` | Create admin capability using OTW pattern |
| `create_enclave_config` | `create_enclave_config<T: drop>(cap: &Cap<T>, name: String, pcr0: vector<u8>, pcr1: vector<u8>, pcr2: vector<u8>, ctx: &mut TxContext)` | Create shared config with expected PCR values |
| `register_enclave` | `register_enclave<T>(config: &EnclaveConfig<T>, document: NitroAttestationDocument, ctx: &mut TxContext)` | Register an enclave's public key from its attestation document |
| `verify_signature` | `verify_signature<T, P: drop>(enclave: &Enclave<T>, intent_scope: u8, timestamp_ms: u64, payload: P, signature: &vector<u8>): bool` | Verify a BCS-serialized Ed25519 signature from the enclave. Returns `true` if valid. |
| `update_pcrs` | `update_pcrs<T: drop>(config: &mut EnclaveConfig<T>, cap: &Cap<T>, pcr0: vector<u8>, pcr1: vector<u8>, pcr2: vector<u8>)` | Update PCR values on an existing config (requires `Cap<T>`) |
| `update_name` | `update_name<T: drop>(config: &mut EnclaveConfig<T>, cap: &Cap<T>, name: String)` | Update the enclave config's display name |
| `destroy_old_enclave` | `destroy_old_enclave<T>(e: Enclave<T>, config: &EnclaveConfig<T>)` | Destroy an enclave whose PCRs no longer match the config |
| `deploy_old_enclave_by_owner` | `deploy_old_enclave_by_owner<T>(e: Enclave<T>, ctx: &mut TxContext)` | Remove a stale enclave object (owner-only) |
| `create_intent_message` | `create_intent_message<P: drop>(intent: u8, timestamp_ms: u64, payload: P): IntentMessage<P>` | Build an intent message for signing |
| `pcr0` / `pcr1` / `pcr2` | `pcr{0,1,2}<T>(config: &EnclaveConfig<T>): &vector<u8>` | Read individual PCR values from config |
| `pk` | `pk<T>(enclave: &Enclave<T>): &vector<u8>` | Read the enclave's registered public key |

### Sui framework support

The `sui::nitro_attestation` module provides `NitroAttestationDocument`, which is used by `register_enclave` to parse and validate the AWS Nitro attestation, extracting PCR values and the enclave's public key.

### Move contract pattern

```move
module my_pkg::my_module {
    use std::string;
    use enclave::enclave::{Self, Cap, EnclaveConfig, Enclave};

    /// One-time witness
    public struct MY_MODULE has drop {}

    /// Admin capability, created once at publish
    fun init(witness: MY_MODULE, ctx: &mut TxContext) {
        let cap = enclave::new_cap(witness, ctx);
        transfer::public_transfer(cap, tx_context::sender(ctx));
    }

    /// Register PCR values (call after deploying the enclave image)
    public entry fun setup_config(
        cap: &Cap<MY_MODULE>,
        name: vector<u8>,
        pcr0: vector<u8>,
        pcr1: vector<u8>,
        pcr2: vector<u8>,
        ctx: &mut TxContext,
    ) {
        enclave::create_enclave_config(
            cap,
            string::utf8(name),
            pcr0, pcr1, pcr2,
            ctx,
        );
    }

    /// Verify enclave output and act on it
    public entry fun process_verified_result<P: drop>(
        enclave_obj: &Enclave<MY_MODULE>,
        intent_scope: u8,
        timestamp_ms: u64,
        payload: P,
        signature: vector<u8>,
        clock: &Clock,
    ) {
        // Verify the enclave signature (returns bool)
        let valid = enclave::verify_signature(
            enclave_obj,
            intent_scope,
            timestamp_ms,
            payload,
            &signature,
        );
        assert!(valid, 0);

        // IMPORTANT: manually check timestamp freshness
        let current_ms = clock::timestamp_ms(clock);
        assert!(current_ms - timestamp_ms < 60_000, 1); // 60 second max age

        // Act on the verified payload
        // ...
    }
}
```

## Rust server (enclave side)

The enclave runs an Axum HTTP server built with the Nautilus SDK.

### Required endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/` | Basic info / version |
| GET | `/health_check` | Liveness probe |
| GET | `/get_attestation` | Returns the AWS Nitro attestation document (used for on-chain registration) |
| POST | `/process_data` | Custom logic: receives input, computes result, returns signed BCS payload |

### Server structure

```rust
use axum::{Router, routing::{get, post}};
use nautilus_sdk::{attestation, signing};

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/", get(root))
        .route("/health_check", get(health_check))
        .route("/get_attestation", get(get_attestation))
        .route("/process_data", post(process_data));

    // Bind to enclave-specific address
    axum::Server::bind(&"0.0.0.0:3000".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}
```

### Signing pattern

The enclave generates an ephemeral Ed25519 keypair on boot. Every response is BCS-serialized and signed:

1. Serialize the response struct with BCS (field order must match the Move struct exactly).
2. Prepend intent scope bytes and timestamp.
3. Sign with the ephemeral private key.
4. Return `{ payload, signature, timestamp_ms }` to the caller.

The caller submits payload + signature + timestamp to the Move contract, which calls `verify_signature`.

## Deployment flow

1. Write Rust enclave server code.
2. Build the Docker image for AWS Nitro Enclave.
3. Convert to enclave image format (EIF). This produces PCR0, PCR1, PCR2 values.
4. Deploy the Move package with `sui client publish`.
5. Call `create_enclave_config` with the PCR values from step 3.
6. Launch the enclave on an AWS Nitro-capable EC2 instance.
7. Fetch attestation from GET `/get_attestation`.
8. Call `register_enclave` on chain with the attestation document.
9. The enclave is now registered. Clients can call the processing endpoint and verify results on chain.

## Install

Nautilus is not an npm package. Clone the repo directly:

```bash
git clone https://github.com/MystenLabs/nautilus
```

For the Move dependency, add to `Move.toml`:

```toml
[dependencies]
Nautilus = { git = "https://github.com/MystenLabs/nautilus", subdir = "move", rev = "<pinned-rev>" }
```

Pin to a specific commit. Do not use `main` branch as a floating reference.
