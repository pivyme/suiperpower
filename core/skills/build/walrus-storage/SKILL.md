---
name: walrus-storage
description: Integrate Walrus decentralized blob storage into a Sui project, store and retrieve files, and commit blob ids on chain. Use when the user says "store files on Walrus", "integrate Walrus blob storage", "upload an image to Walrus", "host my NFT media on Walrus", "store user uploads on Sui", "use Walrus for my dataset", or "decentralized storage on Sui". Reads .suiperpower/build-context.md if present. Loads skills/data/sui-knowledge/sponsor-docs/walrus.md.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track walrus-storage build completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track walrus-storage build started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Integrates Walrus blob storage into a Sui project end to end. Picks the right surface (CLI, HTTP publisher, TS SDK), writes the upload and retrieval code, optionally commits the blob id on chain through a Move Object, and verifies the round-trip works against the live testnet aggregator before declaring done.

## When to use it

- The project stores files larger than is reasonable on chain (NFT media, user uploads, datasets, archives).
- The user wants verifiable retrieval tied to an on-chain commitment.
- The user wants storage and business logic on the same chain.
- The user is targeting the Walrus track at Sui Overflow 2026.

## When NOT to use it

- If the user has not picked a project yet, use `find-next-sui-idea` first.
- If the user has not scaffolded a project, use `scaffold-project` first.
- If the user wants to research what kinds of apps use Walrus, use `walrus-research` (idea phase) instead.
- If the user wants to host a static site on Walrus Sites, surface that as a separate path (Walrus Sites is a different surface).

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A Sui project (Move package and/or TS frontend).
- Optional: `.suiperpower/build-context.md` from `scaffold-project`. Read it if present.
- The intended blob type (image, video, JSON, encrypted blob), an estimate of size, and a target lifetime in epochs.

If unclear, interview the user for:

- What is being stored and what is its rough size?
- How long does it need to live? Is permanence required, or is N epochs enough?
- Is the blob sensitive? If yes, do they have a client-side encryption plan?
- Will the blob id be committed on chain inside a Move Object, or stored only in app state?

## Outputs

- Walrus client code, TS SDK or HTTP, that uploads, reads, and surfaces the blob id.
- Optional: a Move struct that records `walrus_blob_id: vector<u8>` inside an Object so the on-chain record is canonical.
- A live demo path: store one real file, retrieve it, render or hash-compare locally.
- Append to `.suiperpower/build-context.md`:

  ```markdown
  ## walrus-storage session, <timestamp>
  - blobs stored: <count>
  - sample blob id: <id>
  - epochs: <n>
  - publisher: <url>
  - aggregator: <url>
  - encryption: <none | client-side AES | other>
  - on-chain commitment: <module::struct or none>
  - open issues: <list>
  ```

The skill never deletes files outside the integration source path without explicit user confirmation.

## Workflow

1. **Context gathering**
   - Read `.suiperpower/build-context.md` if it exists.
   - Confirm the user's intent, what they store, who reads it, how long it lives.
   - Check whether the project has frontend, backend, or both. The integration surface differs.

2. **Pick the surface**
   - Server-side or one-off uploads: `walrus` CLI or HTTP publisher.
   - Browser uploads: HTTP publisher with a backend signer, or the Walrus TS SDK directly.
   - Atomic on-chain commit alongside the upload: TS SDK plus a Move call inside the same PTB.

3. **Network choice**
   - Default to testnet for development. Confirm publisher and aggregator endpoints match the network. Cross-network reads silently return not-found.
   - For mainnet, use a paid Walrus service provider or run your own. Public endpoints are best-effort.

4. **Encryption decision**
   - Walrus stores bytes as-is. If the blob is sensitive, client-side encrypt before upload. Document the key management plan in `build-context.md`.

5. **Implementation**
   - Write the upload path. Capture `blobId` from the publisher response.
   - Write the read path. Verify the bytes round-trip.
   - If committing on chain, write or extend a Move module that stores `walrus_blob_id: vector<u8>` on a key Object. Wire it into a PTB so upload-then-commit is atomic where possible.

6. **Live demo**
   - Upload a real file to testnet.
   - Read it back from the aggregator.
   - Hash-compare or render. The demo is not done until retrieval works.

7. **Lifetime + cost note**
   - Document the chosen epoch count and what happens when it expires.
   - If permanence is required, set `deletable=false` and note WAL cost implications.

8. **Writeback**
   - Append session details to `.suiperpower/build-context.md`.

## Quality gate (anti-slop)

Before reporting done, the skill asks itself the following and refuses to declare success if any answer is no:

- Did the demo actually retrieve a stored blob from the aggregator and verify the bytes match the source?
- Is the publisher and aggregator pair correct for the chosen network (testnet or mainnet)?
- If a Move Object commits the blob id, is that path tested with at least one positive test?
- Was the lifetime decision (epochs vs permanent) explicitly stated, not silently defaulted?
- If the data is sensitive, is encryption actually performed client-side, with a documented key plan?
- Is the integration code not just calling `store` and forgetting? Read-back must be in the code path.

If any answer is no, the skill reports the gap and works through it before claiming the integration is complete.

## References

On-demand references (load when relevant to the user's question):

- `references/walrus-quickstart.md`: Minimal upload and retrieve recipes for HTTP publisher, CLI, and TS SDK.
- `references/walrus-pitfalls.md`: Lifetime expiry, encryption, public endpoint reliability, network mismatches, WAL token balance.
- `references/walrus-move-commit.md`: Pattern for committing a `blobId` on chain inside a Move Object.
- `references/seal-encryption.md`: Seal decentralized encryption for access-controlled Walrus blobs.

Knowledge docs (load when scope expands beyond what is in references):

- `skills/data/sui-knowledge/sponsor-docs/walrus.md`: Concepts, key terms, deeper integration notes.

## Use in your agent

- Claude Code: `claude "/suiper:walrus-storage <your message>"`
- Codex: `codex "/walrus-storage <your message>"`
- Cursor: paste a chat message that includes a phrase like "store files on Walrus", or load `~/.cursor/rules/walrus-storage.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
