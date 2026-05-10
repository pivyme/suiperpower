# 17. Launch plan

## Why this matters

Suiperpower is for Sui builders, but they will not find it on their own. The launch plan is how we get it in front of Sui Overflow 2026 participants and the broader Sui community without paid distribution.

The framing throughout: "this is infrastructure for Sui builders, available free, useful past the hackathon." Not "we made a hackathon helper."

## Pre-launch checklist (T-minus four weeks to T-0)

| Week | Milestone |
|---|---|
| T-4w | Domain `suiperpower.dev` registered. npm name `suiperpower` reserved. GitHub org / repo created. |
| T-4w | Convex project created. Telemetry endpoints deployed to staging. |
| T-3w | v0.1 of the CLI working (init, doctor, uninstall). 5-10 skills authored end-to-end. Knowledge base seeded with 3 docs. |
| T-3w | Internal alpha. Kelvin runs the full journey on a real test idea. Fixes feedback. |
| T-2w | v0.2 of the CLI. ~25 skills. Full sponsor docs. Hackathon submission generator working against deepsurge.xyz form (manual paste verified). |
| T-2w | Closed beta. 5-10 friendly Sui builders test the install + journey. Fix feedback. |
| T-1w | v0.3, the v1 release candidate. ~30 skills. Full knowledge base. Catalog seeded with 40+ repos, 10+ MCPs, 150+ ideas. Website live at suiperpower.dev. |
| T-1w | Sponsor outreach (see below). |
| T-0d | Launch (see launch day plan). |
| T+1w | Hot-fix window. Triage feedback, ship v1.1.0 if needed. |
| T+2w | First post-launch retro. Decide v1.1 priorities (see `18-ROADMAP.md`). |

T-0 should align to a date that gives Sui Overflow 2026 participants meaningful runway before the hackathon submission deadline. Concretely: aim for T-0 = at least 4-6 weeks before the Overflow submission deadline, so participants have time to install, build, and submit.

(Exact Overflow 2026 dates: Kelvin to confirm from overflow.sui.io / participant handbook.)

## Sponsor outreach (T-1w)

Email / DM template per sponsor:

**Walrus** (headline partner)

> Hey [name], we built Suiperpower (suiperpower.dev), a free open-source CLI + skills bundle for AI agents (Claude Code, Codex, Cursor) targeting Sui Overflow 2026 participants. Walrus is a first-class skill (`/walrus-storage`) and the headline sponsor doc lives at [link]. We are launching [date]. Would you mention Suiperpower in your Overflow channels in exchange for the storage adoption it drives? Open-source MIT, no commercial play, and we are happy to incorporate any review comments on the integration skill.

Same template adapted for DeepBook, OpenZeppelin, OtterSec, Scallop. Customize the angle for each (Scallop university award, OtterSec audit prep, OpenZeppelin libs, DeepBook track).

What we ask for:

- Mention in their Overflow channel / Telegram / Twitter
- Review of their `sponsor-docs/<sponsor>.md` for accuracy (reply by T+3d ideally)
- Optional: link from their Overflow page to suiperpower.dev/sponsors

What we offer:

- First-class integration skill
- Knowledge doc with their preferred capitalization, accurate copy
- Catalog inclusion of their official repos
- Co-marketing on our `/sponsors` page

Outcome to track: by T-0, ideally 2-3 sponsors have agreed to mention us. Even 1 is a win for v1.

## Sui Foundation outreach (T-1w)

We are not affiliated, but the Foundation may want to surface Suiperpower in their Overflow comms if it actually helps participants. Soft reach-out:

> Hey [Sui Foundation contact], independent project here, we built Suiperpower (suiperpower.dev), a free CLI + skills bundle for builders in Overflow 2026. Designed around the polish + sustainability bar your 2026 message emphasized. Happy to share early access if useful. No expectation of endorsement, just want to make sure you know it exists in case it is helpful for participants.

If they engage, we can discuss formal recognition. If not, we proceed independently.

## Launch day (T-0)

Order of operations:

1. **Final pre-flight (morning)**
   - Run `suiperpower init` on a fresh container, verify install works.
   - Run a full journey (idea → build → ship) against a test project.
   - Verify website deploys cleanly, all catalog routes render.
   - Verify `setup.sh` is reachable at `suiperpower.dev/setup.sh`.
   - Verify Convex telemetry mutation works.

2. **Publish (early afternoon)**
   - `npm publish` (semver: v0.3.0 or v1.0.0 depending on confidence).
   - Tag the GitHub release with the version + a one-paragraph changelog.
   - Vercel deploys the website with the new version.

3. **Announce (mid-afternoon, peak Twitter time in target tz)**

   - Twitter / X thread (5-7 tweets):
     - Tweet 1: hook, install command, screenshot of the install
     - Tweet 2: what it is, who it is for
     - Tweet 3: the anti-slop angle (link to /overflow page)
     - Tweet 4: sponsor integrations (tag each sponsor)
     - Tweet 5: example skill in action (short video / gif)
     - Tweet 6: link to the website
     - Tweet 7: open source, MIT, contributing pointer
   - Post in Sui Overflow Telegram (https://go.sui.io/suioverflow2026-tg) with the install command and a one-paragraph what-it-is.
   - Post in Sui Discord (general / dev channels) with the same.
   - Submit to Hacker News (Show HN) with title pattern: "Show HN: Suiperpower, a CLI + skills bundle for shipping production Sui apps".
   - Submit to /r/Sui_network and /r/cryptocurrency (if relevant).
   - Post in relevant Crypto Builder Telegrams / Discords (Superteam, Solana cross-pollination, etc.).

4. **Inbox (rest of day)**
   - Monitor GitHub issues, PRs, Twitter mentions, Discord pings.
   - Acknowledge every non-spam message within 4 hours on launch day.
   - Triage bugs into fix-now (deploy hot-fix today) vs fix-soon (v1.0.1 within a week).

5. **Day-of metrics to capture**
   - npm install count (every hour)
   - Website unique visitors (Vercel analytics)
   - GitHub stars (rough proxy for awareness)
   - Telemetry: install events, first skill invocation events
   - Sentiment: rough scan of Twitter / Discord replies

## Week 1 post-launch

Goals:

- Ship v1.0.1 with any blocker bugs fixed.
- Respond to every PR (review or close, no PR sits more than 48h).
- Publish 1-2 follow-up tweets per day showing real users / outputs (with permission).
- Reach out to 3-5 builders who installed and ask "what worked, what did not."

Anti-goal:

- No new features. No scope creep. Stabilize first.

## Week 2-4 post-launch (during hackathon)

- v1.1 priorities decided (see `18-ROADMAP.md`).
- Daily check-in on telemetry: which skills are used, which are not, why.
- Sponsor follow-ups if they delivered on promised mentions.
- Document any blocker bugs in a "known issues" page.
- If a participant uses Suiperpower and submits to Overflow, ask if we can spotlight them (case study tweet, with their permission).

## Post-hackathon (T+8w through end of year)

Suiperpower's purpose does not end with Overflow 2026. The post-hackathon plan:

- v1.1 ships with `grow/` skills (analytics-baseline, retention-instrumentation, partnership-outreach, community-launch).
- Quarterly catalog refresh.
- Sponsor doc refresh for each sponsor's quarterly SDK release.
- New journey skill: `apply-for-real-funding` (post-hackathon grant / VC application).
- Continue narrative: "the tool that helps Sui builders ship past the hackathon."

## Distribution channels (longer-term)

| Channel | Cadence | What we post |
|---|---|---|
| Twitter / X | 2-3 / week | New skill releases, user spotlights, anti-slop tips |
| Sui Telegram / Discord | Weekly summary | Catalog updates, new docs |
| GitHub Discussions | As needed | Roadmap proposals, RFCs |
| YouTube / Loom (optional) | Monthly | One real-build walkthrough using Suiperpower |
| Sui ecosystem newsletters | Per-issue | Brief blurb when new major release ships |

## Metrics we will track

| Metric | Target by T+12w |
|---|---|
| Total installs | 1000+ (rough) |
| Active monthly users (telemetry-opted-in) | 300+ |
| GitHub stars | 200+ |
| External contributors (PRs merged from non-team) | 10+ |
| Skills authored by community | 3+ |
| Submitted Overflow projects citing Suiperpower | 20+ |

These are rough first targets. Adjust after real-world data.

## Anti-launch behaviors

What we will NOT do:

- Pay for installs (zero credibility, distorts telemetry).
- Run a referral program (over-incentivizes shallow installs).
- Run influencer marketing (the Sui dev community sees through it).
- Claim Sui Foundation endorsement we do not have.
- Charge for skills, premium tiers, or anything else (it is open-source).
- Build a Discord server we cannot moderate (use existing Sui channels).
- Promise features we cannot ship in v1 (under-promise, over-deliver).

## What success looks like

By the end of Sui Overflow 2026:

- Multiple Overflow submissions visibly built with Suiperpower (mentioned in their READMEs / videos).
- Sponsors have surfaced us in their channels at least once.
- A small but real community of contributors (GitHub stars + PRs + skill authors).
- Concrete user feedback that informs the v1.1 roadmap.
- A founder of one of the submitted projects DM-ing us "this saved me a week."

That last one is the only metric that really matters.
