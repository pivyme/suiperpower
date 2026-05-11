---
name: competitive-landscape
description: Map the competitive landscape for a Sui product idea, on Sui and adjacent chains, and identify the defensible angle. Use when the user says "competitive landscape", "who else is doing this", "competitor analysis", "is anyone building this on Sui", "what is my edge", "find competitors", or "map the space". Reads .suiperpower/idea-context.md and writes a competitor block back.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when you finish this skill, run the matching completion command:
#   suiperpower track competitive-landscape idea completed
# Or use "failed" / "aborted" if it ended that way. This closes the loop so the
# user's local project log and the maintainer's stats reflect real outcomes.
command -v suiperpower >/dev/null 2>&1 && suiperpower track competitive-landscape idea started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Builds a structured competitive map for a candidate idea. Three rings: Sui-native competitors, adjacent-chain competitors, off-chain competitors (web2 services, centralized products). For each ring, lists the players, their stage, what they do well, what they miss, and the candidate's angle against them.

Output is a defensible angle (one sentence) backed by the map. Without a defensible angle, the candidate is "me too" and the skill says so.

## When to use it

- Mid-validation: the user has an idea and wants to see what already exists.
- Pre-pitch: the user has a draft pitch and wants to substantiate "we are different from X" claims.
- Post-launch: a competitor surfaced and the user wants to re-establish positioning.

## When NOT to use it

- The user has not picked an idea. Route to `find-next-sui-idea`.
- The user wants validation overall, not just competition. Route to `validate-idea` (which calls this skill internally).
- The user wants a specific protocol's research (DeepBook market gaps, Walrus storage gaps). Route to `deepbook-research` or `walrus-research`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- `.suiperpower/idea-context.md` if it exists.
- The category one-liner (e.g. "Sui-native lending", "consumer mobile zkLogin app", "DeepBook bot").
- Optional: a list of competitors the user already knows about.

## Outputs

A competitive block appended to `.suiperpower/idea-context.md`:

```markdown
### Competitive landscape, <timestamp>

#### On Sui
- <project>: <stage>, <one-line summary>, <strength>, <gap>
- ...

#### On EVM / Solana / other chains
- <project>: <chain>, <one-line summary>, <why they have not come to Sui>
- ...

#### Off-chain
- <product>: <what they do>, <where they fall short for crypto-native users>
- ...

#### Defensible angle
- <one sentence stating the candidate's specific differentiation, naming at least one competitor it explicitly beats and how>

#### Risks from competition
- <if any incumbent could trivially extend into the candidate's territory, name them and the response>
```

## Workflow

1. **Define the category**
   - One sentence: what does the candidate do, and for whom?
   - Identify the closest comparable category (e.g. "lending" -> Compound, Aave on EVM; Scallop, NAVX on Sui).

2. **Map the on-Sui ring**
   - Start with `cli/data/clonable-repos.json` and the broader Sui ecosystem catalog (when available).
   - Visit Sui-specific aggregators and explorers (SuiVision, Sui Foundation showcase, Web3Goyala, Suipiens).
   - List 3-7 named projects. For each: stage (idea, testnet, mainnet, dead), one-line summary, strength, observable gap.

3. **Map the adjacent-chain ring**
   - Same approach for EVM and Solana incumbents.
   - For each adjacent-chain incumbent, ask: have they expressed interest in Sui? Why have they not migrated yet? (Often: liquidity, audience, cost of porting code).

4. **Map the off-chain ring**
   - Centralized exchanges, web2 SaaS, traditional finance products that solve adjacent problems.
   - For each: what do they offer that is hard to match on-chain? What do they fail at that crypto-native users care about?

5. **Identify the defensible angle**
   - One sentence. Names a specific competitor and a specific way the candidate beats them.
   - Tests: would a sophisticated Sui community member nod, or laugh? If it does not pass the laugh test, sharpen.

6. **Identify the risk**
   - Could an existing on-Sui incumbent extend into this space in a single sprint? If yes, the moat is timing or distribution, not technology. Say so.
   - Could an adjacent-chain incumbent port to Sui in a sponsor-funded weekend? If yes, the moat must be Sui-native, not "first to Sui".

7. **Writeback**
   - Append to `.suiperpower/idea-context.md`.

## Quality gate (anti-slop)

Before reporting done:

- Is each on-Sui competitor named with a real project, not a placeholder ("various lending dapps")?
- Does the defensible angle name a specific competitor and a specific advantage, not generic phrases ("better UX", "faster")?
- Is at least one off-chain comparator listed (most crypto products are competing with web2 alternatives more than they realize)?
- Did the analysis honestly answer "could the incumbent trivially extend into this space"? If the answer is "we are not sure", that is a yellow flag worth recording.
- Did the writeback happen?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/where-to-look.md`: Sources for Sui ecosystem mapping, adjacent-chain mapping, off-chain mapping.
- `references/defensibility-tests.md`: Tests to apply to the candidate's angle.

Knowledge docs:

- `skills/data/sui-knowledge/06-opensource-research.md`: Open-source research workflow.
- `cli/data/clonable-repos.json`: Sui ecosystem repos catalog.

## Use in your agent

- Claude Code: `claude "/suiper:competitive-landscape <your message>"`
- Codex: `codex "/competitive-landscape <your message>"`
- Cursor: paste a chat message that includes a phrase like "competitive landscape", or load `~/.cursor/rules/competitive-landscape.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
