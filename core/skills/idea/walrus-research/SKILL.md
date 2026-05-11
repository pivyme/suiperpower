---
name: walrus-research
description: Research Walrus storage usage patterns and surface product opportunities, underserved use cases, and integration gaps. Use when the user says "Walrus research", "find Walrus opportunities", "what to build on Walrus", "Walrus market gaps", "decentralized storage idea", "Walrus blob storage opportunities", or "Walrus integration ideas". Reads skills/data/sui-knowledge/sponsor-docs/walrus.md.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track walrus-research idea completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track walrus-research idea started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Surveys current Walrus storage usage and turns it into a list of product opportunities. Walks four categories: media products, archive products, identity / verifiable storage, and developer tooling. Output is a ranked candidate list grounded in observed usage patterns and gaps in tooling, not generic "decentralized storage" framings.

The Walrus value proposition is durable, available, content-addressed blob storage with payment in WAL. The gaps are usually at the integration layer (apps, tooling, gateways), not the protocol layer.

## When to use it

- The user wants to build on Walrus but is exploring use cases.
- The user is mid-validation of a Walrus-adjacent idea and wants traction signals.
- The user is sponsor-track-aligned (Sui Overflow Walrus track) and needs a load-bearing integration angle.

## When NOT to use it

- The user wants to build a Walrus integration with a chosen idea, route to `walrus-storage`.
- The user wants general Sui idea search, route to `find-next-sui-idea`.
- The user wants DeepBook research, route to `deepbook-research`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- The user's interest in Walrus (curious, picking an idea, validating).
- Optional: a content type the user has in mind (images, video, datasets, archives).
- Optional: the user's chain experience.

## Outputs

A research block written to `.suiperpower/idea-context.md` (or a new `.suiperpower/research-walrus-<timestamp>.md` if no idea is chosen yet):

```markdown
## Walrus research, <timestamp>

### Usage patterns observed
- <pattern>: <evidence>
- ...

### Underserved use cases
1. <use case>: <evidence>, <product idea this enables>
2. ...

### Gaps in tooling
- <gap>: <evidence>, <product idea this enables>

### Risks and constraints
- <risk>: <mitigation>

### Citations
- <Walrus docs link, observability dashboard, sponsor RFP, etc>
```

## Workflow

1. **Confirm scope**
   - Open-ended Walrus research, or focused on a specific content type?

2. **Scan Walrus usage signals**
   - Read the official Walrus dashboard (suiscan.xyz/mainnet/Walrus or equivalent) for active publishers and aggregators.
   - Survey known consumer apps integrating Walrus (NFT marketplaces using Walrus for media, dapps using it for static assets, etc.).
   - Note volume signals (blobs published per day, total size, payment activity in WAL).

3. **Walk the four categories**

   - **Media products**: NFT marketplaces, content-creator platforms, social media, image / video sharing. Where do existing apps fall short on storage durability, hosting cost, or content-addressing?
   - **Archive products**: legal documents, scientific datasets, government records, backups. The "permanent storage" angle. Who needs verifiable, long-lived storage today?
   - **Identity / verifiable storage**: user-controlled storage of identity documents, credentials, signed artifacts. zkLogin + Walrus + capability gates is a Sui-native composition.
   - **Developer tooling**: Walrus gateways, indexing tools, content-addressing helpers, Walrus-as-a-CDN, frameworks for app developers.

4. **Identify underserved use cases**
   - For each category, name at least one use case where current solutions are unsatisfying (web2 risky, IPFS unreliable, S3 expensive at scale).
   - Tie each use case to a specific user (not "users", not "developers", but a named persona).

5. **Identify tooling gaps**
   - Is there a public Walrus gateway with a CDN-grade SLA?
   - Is there an indexing layer for blob discovery?
   - Is there a framework for "Walrus + Sui Object" composability?
   - Is there a billing / metering tool for app developers managing WAL spend?

6. **Risks and constraints**
   - Walrus pricing in WAL: is the WAL/USD curve at a level that makes the use case unit-economic-positive?
   - Latency and read patterns: Walrus is for blob storage, not realtime database. Use cases that need sub-100ms reads at scale should be flagged.
   - Sponsor risk: Walrus is sponsor-backed; map out the sponsor relationship if the candidate's business model depends on Walrus stability.

7. **Citations**
   - Every claim links to docs, a dashboard, an existing project, or a community post.
   - Refuse claims without citations.

8. **Writeback**
   - Append to the chosen output file.

## Quality gate (anti-slop)

Before reporting done:

- Is each use case tied to a named persona, not "users"?
- Are tooling gaps cited with evidence (or explicit "no public solution found, last checked <date>")?
- Did the analysis include unit-economic considerations (WAL spend per user / blob)?
- Did the analysis avoid "decentralized storage is the future" framing without specifics?
- Did the writeback happen?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/walrus-categories.md`: Four-category decomposition with category-specific questions.
- `references/walrus-unit-economics.md`: How to think about WAL spend, gateway cost, pricing.

Knowledge docs:

- `skills/data/sui-knowledge/sponsor-docs/walrus.md`: Walrus integration knowledge doc.
- `skills/data/sui-knowledge/04-protocols-and-sdks.md`: SDK and integration overview.

## Use in your agent

- Claude Code: `claude "/suiper:walrus-research <your message>"`
- Codex: `codex "/walrus-research <your message>"`
- Cursor: paste a chat message that includes a phrase like "Walrus research", or load `~/.cursor/rules/walrus-research.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
