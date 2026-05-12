---
name: nautilus-offchain
description: Use when building verifiable off-chain compute on Sui via Nautilus TEEs (AWS Nitro Enclaves), or attested off-chain oracles.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track nautilus-offchain build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track nautilus-offchain build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Guides the user through building verifiable off-chain computation on Sui using Nautilus. The result is a Rust server running inside an AWS Nitro Enclave whose outputs are cryptographically verified by a Move contract on chain. Covers both the enclave-side Rust code and the on-chain Move verification logic.

## When to use it

- The project needs computation that cannot run on chain (API calls, heavy ML inference, private data processing).
- The user wants verifiable off-chain results posted back to Sui with cryptographic proof.
- The user mentions TEEs, Nitro Enclaves, or Nautilus.
- The user needs an oracle-like pattern where off-chain data must be trusted on chain.

## When NOT to use it

- If the user has not picked a project yet, use `find-next-sui-idea` first.
- If the user has not scaffolded a project, use `scaffold-project` first.
- If the logic can run entirely on chain in Move, use `build-with-move` instead.
- If the user only needs price feeds, use `pyth-oracle` instead.
- If the user wants zero-knowledge proofs (not TEE attestation), this is the wrong tool. Point them to ZK resources.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A Sui project (Move package and/or TS frontend).
- Optional: `.suiperpower/build-context.md` from `scaffold-project`. Read it if present.
- A description of what computation needs to happen off chain and what result goes on chain.

If unclear, interview the user for:

- What computation runs off chain? (API call, ML model, data aggregation, random number generation)
- What data does the on-chain contract need from the enclave? (a price, a score, a boolean, arbitrary bytes)
- Does the enclave need to read on-chain state before computing?
- What is the trust model? (Who runs the enclave? Single operator or decentralized?)

## Outputs

- A Move module using `enclave::enclave` to register and verify enclave signatures.
- A Rust server (Axum) implementing the enclave logic with Nautilus SDK endpoints.
- Integration code: PTB or TS that calls the enclave server, posts verified results on chain.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## nautilus-offchain session, <timestamp>
  - enclave logic: <what it computes>
  - move module: <module::name>
  - rust server endpoints: <list>
  - pcr values: <pending build | recorded>
  - deployment: <local | AWS Nitro>
  - open issues: <list>
  ```

## Workflow

1. **Decide if TEE is needed**
   - Use the decision table below. If the computation can run on chain, steer the user to `build-with-move`.
   - If the user needs verifiable randomness only, check if Sui's native randomness module suffices first.
   - Confirm with the user before proceeding.

2. **Design the enclave logic**
   - Define what the Rust server computes: inputs it receives via POST, outputs it returns.
   - Define the BCS payload struct. Field order matters: Rust and Move must match exactly.
   - Sketch the endpoints: health check, attestation, and the custom processing endpoint.

3. **Write the Move contract**
   - Use `enclave::enclave` module functions. See `references/nautilus-architecture.md` for the full API.
   - Implement OTW pattern with `new_cap<T>` for admin capabilities.
   - Create `EnclaveConfig` with expected PCR values via `create_enclave_config`.
   - Write a function that calls `verify_signature` to validate enclave output before acting on it.
   - Add timestamp freshness checks manually (`verify_signature` does not enforce this).

4. **Build the Rust enclave server**
   - Clone the Nautilus repo: `git clone https://github.com/MystenLabs/nautilus`.
   - Use the Axum server template. Implement GET `/health_check`, GET `/get_attestation`, and POST endpoint for the custom logic.
   - Ensure BCS serialization of the response payload matches the Move struct field order exactly.
   - Sign the payload with the enclave's ephemeral Ed25519 keypair.

5. **Deploy the Move package**
   - Run `sui move build` and `sui client publish`.
   - Call `create_enclave_config` with the PCR values from the built enclave image.
   - Record the package ID and config object ID.

6. **Deploy the enclave**
   - Build the Docker image for the Nitro Enclave.
   - Extract PCR0, PCR1, PCR2 values from the built image.
   - Deploy to AWS Nitro Enclave instance.
   - Call `register_enclave` on chain with the attestation document.

7. **Register on chain**
   - Fetch the attestation from the running enclave via GET `/get_attestation`.
   - Call `register_enclave<T>(config, attestation_doc, ctx)` to register the enclave's public key.
   - Verify registration succeeded by checking the on-chain enclave object.

8. **Verify the integration**
   - Send a real request to the enclave's processing endpoint.
   - Submit the signed response to the Move contract's verify function.
   - Confirm the on-chain state updated correctly.
   - Test with a tampered signature and confirm rejection.

9. **Closing handoff**
   - If `.suiperpower/intent.md` exists and the session was non-trivial (new module, new sponsor integration, or material changes to public functions), recommend `verify-against-intent` as the next step so drift is caught before shipping.
   - If no `intent.md` exists and the session was non-trivial, surface that gap once: offer `clarify-intent` to backfill, do not force it.

## Decision table: when to use Nautilus

| Scenario | Use Nautilus? | Alternative |
|---|---|---|
| Heavy computation (ML, data processing) | Yes | None on chain |
| External API calls (web2 data) | Yes | Pyth for price feeds specifically |
| Private data processing | Yes | Seal for encryption-only use cases |
| Simple on-chain logic | No | `build-with-move` |
| Price feeds only | No | `pyth-oracle` |
| Verifiable randomness only | No | Sui native randomness module |
| ZK proof generation | No | ZK tooling (Circom, Noir) |

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Does the Move package compile with `sui move build`?
- Does `verify_signature` include a manual timestamp freshness check?
- Do the BCS struct field orders match exactly between Rust and Move?
- Was a real round-trip tested (enclave processes data, Move contract verifies signature)?
- Was signature rejection tested (tampered or expired data fails verification)?
- Are PCR values documented and the user understands they must rebuild and re-register on any code change?
- Is the ephemeral keypair lifecycle documented (new key on every boot, must re-register)?

If any answer is no, the skill reports the gap and works through it before claiming the integration is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/nautilus-architecture.md`: Move module API (`enclave::enclave`), Rust server setup, deployment flow.
- `references/nautilus-pitfalls.md`: Key pitfalls with PCR values, BCS ordering, ephemeral keys, and timestamp freshness.

External docs (fetch at runtime for the latest API surface):

- Nautilus repo and examples: https://github.com/MystenLabs/nautilus
- Nautilus developer guide: https://docs.sui.io/guides/developer/nautilus

## Use in your agent

- Claude Code: `claude "/suiper:nautilus-offchain <your message>"`
- Codex: `codex "/nautilus-offchain <your message>"`
- Cursor: paste a chat message that includes a phrase like "off-chain compute" or "Nautilus TEE", or load `~/.cursor/rules/nautilus-offchain.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
