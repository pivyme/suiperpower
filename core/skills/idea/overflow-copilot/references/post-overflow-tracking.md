# Post-Overflow tracking

For each past project, the most informative datapoint is what happened AFTER the hackathon. Did the team ship? Pivot? Disappear? Past Overflow status alone is weak signal; the post-Overflow trajectory is strong signal.

## What to check

For each project of interest, check (in this order, stopping when you have a clear answer):

1. **The project's own website**: still up? Last update?
2. **The project's Twitter / X**: still posting? Last post date? Engagement trend?
3. **GitHub**: commits since the hackathon? Recent issues / PRs?
4. **On-chain activity**: if the project deployed to mainnet or testnet, is there transaction activity in the last 90 days?
5. **Press / community mentions**: search the project name + "Sui" in the last 6 months. Anyone talking about it?

If 3+ signals are dead, the project is dead. If 1-2 are alive but stale (over 90 days), the project is dormant. If most signals are recent, the project is live.

## Why it matters

Hackathon entries that won did so for a reason. Dormant winners often hint at a market that did not pan out. Live winners often hint at a market that did. Both are useful signals for the candidate:

- A winner that pivoted into a different category: that pivot direction tells you something about where users actually want value.
- A winner that quietly died: their failure points (visible in their last public posts) are lessons.
- A submitted-but-not-finalist that grew anyway: judging is signal-noisy; this is the rare project worth studying closely.

## Common post-Overflow trajectories

Categorize the project into one of these:

- **Live and growing**: still building, has users, has activity. The candidate competes with this.
- **Live but stuck**: still online, no growth, no users. Candidate has more room than the surface suggests.
- **Pivoted**: same team, different product. Their pivot direction is useful intelligence.
- **Dormant**: no public activity in 6+ months, but not formally abandoned. Likely abandoned silently.
- **Dead**: archive notice, deleted website, public "shutting down" post.
- **Unknown**: archive present but no recent signals; treat as dormant by default.

## Capture format

Append to each project's record:

```markdown
- post-Overflow status: <live-growing | live-stuck | pivoted | dormant | dead | unknown>
- last public activity: <date>
- evidence: <link or one-line summary>
- inference for candidate: <one sentence>
```

## Be honest about uncertainty

If the search produces ambiguous signals, mark "unknown" rather than guessing. False signals (e.g. labeling a dead project "live" because the website still loads) corrupt the analysis.

## What this is NOT

This is not surveillance. The skill records public-only signals: public website, public social media, public on-chain activity, public press. Do not contact past project teams via DM to "confirm status" without permission.
