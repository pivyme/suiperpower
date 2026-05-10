# Archive search patterns

Efficient query patterns for the Sui Overflow archive. The official archive lives at deepsurge.xyz; supplementary information lives in Sui Foundation blog posts, sponsor recap posts, and the projects' own GitHub repos.

## Primary source

deepsurge.xyz hosts the canonical submission archive across Sui Overflow editions. Filter by:

- **Edition**: 2024, 2025, 2026, etc. Each edition has different tracks, sponsor priorities, and prize pools.
- **Track**: DeFi, consumer, infra, mobile, sponsor-specific tracks (Walrus, DeepBook, OpenZeppelin, OtterSec).
- **Outcome**: winner, finalist, submitted-but-not-finalist, withdrawn.

Within filters, sort by category and read the project descriptions. Take notes per project.

## Secondary sources

- **Sui Foundation blog**: recap posts after each Overflow announce winners with project descriptions and links.
- **Sponsor recap posts**: Walrus, DeepBook, OpenZeppelin, OtterSec all publish track-specific recaps with their own pick of winners.
- **Twitter / X**: search "Sui Overflow <year>" for community commentary, often surfaces "underrated" projects worth investigating.
- **GitHub topic search**: `topic:sui-overflow-2025` (or year-specific) often surfaces the project repo, linked to the submission.

## Search tactics

For a category-broad query ("DeFi projects in past Overflow"):

1. Filter by edition + DeFi track.
2. Walk the top 20 by ranking order.
3. Note name, one-line summary, outcome, link.

For a specific-idea query ("has anyone built a DeepBook charting tool"):

1. Filter by sponsor track (DeepBook).
2. Read every project description.
3. Search Twitter / GitHub for project name + "DeepBook" + "chart" or "data".
4. Conclude either "yes, project X did this" or "no record of one".

For a competitive query ("how does my candidate compare to past entries"):

1. Filter by category match.
2. Filter further by Sui-native primitives in use (Walrus, DeepBook, Kiosk, zkLogin).
3. Walk all matches; categorize by similarity to candidate.

## Capture format

Per project found:

```markdown
- name: <project name>
- edition: <Overflow year>
- track: <track>
- outcome: <winner | finalist | submitted | withdrawn | unknown>
- summary: <one sentence>
- Sui primitives used: <list>
- post-Overflow status: <live | pivoted | dead | unknown>
- citation: <deepsurge link, GitHub link, demo video link>
```

Five projects with structured capture is more useful than fifty with one-line summaries.

## When the archive returns nothing

If the search returns no past entries in the category, that is also a finding. Treat as evidence of either:

- An untapped category (good for the candidate).
- A category that has not attracted hackathon-scale builders (signal: market may not be ready for a hackathon-pace product).

Cite the empty result explicitly: "deepsurge.xyz search filtered by <criteria>, retrieved <date>, returned 0 matches".

## Anti-pattern: hallucinating projects

Never name a project that the search did not actually surface. If unsure whether a name is from the archive or imagined, drop it. Citation is the integrity signal of this skill.
