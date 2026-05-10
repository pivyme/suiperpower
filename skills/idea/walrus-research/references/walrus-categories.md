# Walrus categories and per-category questions

Walk all four during research. Some yield real gaps; some yield generic ideas not worth pursuing. The discipline is to walk all four.

## 1. Media products

Apps that store and serve user-generated media (images, video, audio, 3D, text).

Questions:
- Which Sui consumer apps store user media on Walrus today vs IPFS vs S3?
- For NFT projects: do the JSON metadata and the image both live on Walrus? Or split?
- For video / large-blob apps: is Walrus economically viable per user, or does it require a freemium model?
- Which web2 apps in this space have observable trust issues (deplatforming complaints, content takedowns) that Walrus could address?

Candidate ideas:
- A creator platform where the artist owns the storage (paid in WAL).
- A Sui NFT marketplace that defaults to Walrus for both metadata and media, with a clear durability story.
- A video archive product for niche communities (e.g. crypto educational content, interview archives).
- A browser extension that auto-archives a saved page to Walrus.

## 2. Archive products

Long-lived, durability-critical storage of records.

Questions:
- Are there government / legal / scientific records that today rely on web2 archives with unclear longevity?
- Is there an audience willing to pay for "guaranteed-100-year" storage in crypto-native form?
- Are there existing IPFS-pinning services people are unhappy with?
- What is the smallest viable archive product (single user, single dataset class)?

Candidate ideas:
- A scientific dataset registry on Sui with Walrus storage and signed provenance.
- A receipts archive (transactions, contracts, signed PDFs) for individuals.
- An open-data publishing platform for journalists and researchers.

## 3. Identity / verifiable storage

User-controlled storage of credentials, identity documents, signed artifacts.

Questions:
- What identity flows on Sui need persistent off-chain blobs (vs on-chain Object data)?
- Can zkLogin + Walrus + capability gates compose into a verifiable-credential product?
- What are the privacy considerations (Walrus blobs are content-addressed and discoverable; private data needs encryption)?

Candidate ideas:
- A KYC-blob vault: encrypted KYC documents stored on Walrus, decryption gated by Sui capability.
- A signed-document archive (contracts, agreements) with a verifiable signature trail.
- A creator-credentials product: signed proofs of authorship, edits, attributions.

## 4. Developer tooling

Tools and frameworks for app developers using Walrus.

Questions:
- Is there a public CDN-grade Walrus gateway? Or only the official one?
- Is there a content-addressing helper library for common patterns (versioned blobs, blob trees, blob deduplication)?
- Is there a framework for "Walrus + Sui Object" composability (e.g. a registry where Sui Objects reference Walrus blobs)?
- Is there a metering tool for tracking WAL spend across an app's user base?

Candidate ideas:
- A Walrus-as-a-CDN gateway with a billing model that abstracts WAL purchase.
- A framework that bundles a Sui Move package + Walrus blob storage + indexer in one scaffold.
- A WAL spend dashboard for app developers.
- A Walrus blob explorer (search by content type, owner, recent uploads).

## How to evaluate candidate ideas

For each candidate, ask:

- Is the user named (a specific persona)?
- Is the unit economic positive (cost of WAL + cost of compute < value the user gets)?
- Is there a Sui-native composition (the candidate uses Walrus AND another Sui primitive in a load-bearing way)?
- Can the user, on their stated timeline, ship a v1?

Three or more "yes" answers = good candidate. Otherwise, deprioritize.
