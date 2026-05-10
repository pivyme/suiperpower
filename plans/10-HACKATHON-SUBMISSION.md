# 10. Hackathon submission generator

## What it is

`/submit-to-sui-overflow` is a skill that takes a project at deploy-ready state and produces a complete Sui Overflow 2026 submission package: copy, assets, package-id, demo video script, and a day-of preflight checklist.

It refuses to generate a submission against placeholder content. If the project does not have a working live URL, a deployed package, and at least one screenshot, the skill stops and tells the user what is missing.

## Submission portal

Submissions go to deepsurge.xyz, not overflow.sui.io.

Submission URL: `https://www.deepsurge.xyz/hackathons/b587dc0c-4cb8-4e63-ada5-519df38103bf`

The skill does not auto-submit (deepsurge.xyz does not expose a public API for hackathon submissions at the time of writing). It generates a copy-paste-ready package and walks the user through pasting it into the form.

## Required submission fields (from the brief)

Basic info:

- Project logo (1280x1280 recommended)
- Project name (must not be a generic name already used by other brands)
- Description

Track:

- One primary track (judges may reassign if multiple fit)

Deployment:

- Network (mainnet / testnet / devnet)
- Package id of the deployed program

Team:

- Members searched by username (each must have registered on deepsurge.xyz first)

Links:

- GitHub repo
- Website (live demo for judges to try)
- Demo video

Media:

- Images, 16:9 (1920x1080) recommended

## Skill workflow

```
1. Preflight (skill refuses to continue if any of these are missing)
   - .suiperpower/build-context.md exists
   - .suiperpower/deploy-context.md exists, contains a confirmed package_id
   - Live website URL provided and reachable (HTTP HEAD check)
   - At least one screenshot in docs/screenshots/ or a path the user provides
   - Project name selected (validated for uniqueness via "google for the name + a 30-sec brand check")
   - GitHub repo URL provided

2. Track selection
   - If user has not run /pick-my-sui-track yet, run it inline now
   - Confirm the chosen track
   - Tag secondary track if applicable (judges may reassign)

3. Logo
   - If user has logo at agreed-upon path (e.g. docs/logo-1280.png), validate dimensions = 1280x1280, format PNG/SVG
   - If missing or wrong size, offer to:
     a) generate a placeholder via brand-design skill (with user's brand colors)
     b) walk through using their existing logo with crop / resize hints
   - Output: docs/submission/logo-1280.png

4. Media (16:9)
   - Take user's screenshots from docs/screenshots/
   - For each, validate or resize to 1920x1080
   - Generate up to 5 media images (the deepsurge form accepts multiple)
   - Output: docs/submission/media-{1..5}.png

5. Project name validation
   - Quick web search for the name + "crypto" / "Sui" / common-noun collisions
   - Flag if the name is generic ("DeFiHub", "SuiSwap", etc.) or already used by 3+ projects
   - Force user to confirm or pick a new name

6. Description drafting
   - Pull from .suiperpower/build-context.md (the project's pitch)
   - Draft three lengths: 1-line tagline, 1-paragraph (300 chars), full (1000 chars)
   - Bias toward "what users do with it" over "what tech stack we used"
   - User picks / edits

7. Demo video script
   - 60-90 second target
   - Scene-by-scene with timestamps, narration, what is on screen
   - Anti-slop check: the skill refuses to generate a script that is "click around the dashboard" without showing a real user outcome
   - Output: docs/submission/demo-script.md

8. GitHub repo polish (optional)
   - Check repo has a README at root
   - Check README has install + run instructions, screenshots, demo video link, package-id link to suiscan
   - Offer to draft / improve README if missing fields

9. Submission package
   - Generates docs/submission/ folder containing:
     ├── logo-1280.png
     ├── media-1.png ... media-5.png
     ├── description-tagline.txt
     ├── description-short.txt
     ├── description-full.txt
     ├── demo-script.md
     ├── deepsurge-form.md         (every field with the value to paste)
     └── preflight-checklist.md    (day-of, see below)
   - Writes .suiperpower/submission-context.md

10. Walk-through
    - Open https://www.deepsurge.xyz/hackathons/b587dc0c-4cb8-4e63-ada5-519df38103bf
    - For each form field, tell the user which file to copy from
    - Confirm registration of all team members (each must have a deepsurge.xyz account before submission)
    - Final review: read the submission back to the user before they hit submit

11. Quality gate (anti-slop)
    - Skill asks: "Did you run the live demo end-to-end yourself in the last 60 minutes?"
    - If no, refuse to mark submission as ready, tell user to test now
    - Asks: "Have you watched the demo video at the actual playback speed (no scrubbing)?"
    - If no, force user to do so
    - Asks: "Would you, as a stranger on the internet, click submit on this submission and feel proud of it?"
    - If no, suggest /roast-my-product before submitting
```

## Package-id capture

`/deploy-to-testnet` and `/deploy-to-mainnet` capture the package-id from `sui client publish` output and write it to `.suiperpower/deploy-context.md`.

Capture pattern:

```bash
sui client publish --gas-budget 200000000 --json | tee /tmp/sui-publish-output.json
# parse: packageId from objectChanges where type=="published"
PACKAGE_ID=$(jq -r '.objectChanges[] | select(.type=="published") | .packageId' /tmp/sui-publish-output.json)
echo "package_id: $PACKAGE_ID" >> .suiperpower/deploy-context.md
echo "network: $(sui client active-env)" >> .suiperpower/deploy-context.md
echo "deployed_at: $(date -u +%Y-%m-%dT%H:%M:%SZ)" >> .suiperpower/deploy-context.md
echo "deployer: $(sui client active-address)" >> .suiperpower/deploy-context.md
```

Verification: skill issues a `sui client object <package-id>` to confirm the package exists on chain before treating the deploy as real.

## Demo video script template

```markdown
# Demo video script

Total length target: 60-90 seconds.

## Scene 1, hook (0-10s)
- On screen: <what>
- Narration: <one-sentence problem statement; user opens the app>
- Audio: <if any>

## Scene 2, the main action (10-50s)
- On screen: <screen recording of the user doing the load-bearing flow end to end>
- Narration: <walk through what the user is doing and why>
- Sub-scenes:
  - 10-25s: <step 1 of the flow>
  - 25-40s: <step 2>
  - 40-50s: <result>

## Scene 3, the proof (50-70s)
- On screen: <on-chain proof, suiscan link to the package, or stats from a real user>
- Narration: <real outcome, e.g. "transactions settled in X seconds, on Sui mainnet">

## Scene 4, the close (70-90s)
- On screen: <project logo, URL, GitHub link, sponsor track tag>
- Narration: <single-sentence call to action>
- End card: <package-id, live URL, team handles>

## Production notes

- Record at 1920x1080.
- Use the user's actual screen, no after-effects.
- No music until the rough cut works without it.
- Captions for the narration (judges watch on mute often).
- Anti-slop check: if the demo video looks fake / staged / doesn't match the live URL, fix the live URL or fix the script. Never fake the demo.
```

## /pick-my-sui-track skill

This skill is invoked standalone or by `submit-to-sui-overflow`. Output: a single recommended primary track plus optional secondary tags.

Tracks (pulled from Sui Overflow 2026 sponsor list, exact slugs to be confirmed when the deepsurge.xyz form is inspected):

- **Walrus track**, projects using Walrus as a non-trivial dependency
- **DeepBook track**, projects using DeepBook as a non-trivial dependency
- **OpenZeppelin track**, projects using OpenZeppelin Sui libs prominently
- **OtterSec track**, projects with security-first design or audit-ready posture
- **University award (Scallop sponsored)**, university-affiliated teams
- **General tracks**, DeFi, gaming, infra, social, AI, RWA (categories from past Overflow themes; confirm slugs at submission time)

Recommendation logic:

1. Read project source files for sponsor package imports (look for `walrus::` / `deepbook::` / `scallop::` / `openzeppelin_sui::` in `Move.toml` and `.move` files).
2. If exactly one sponsor is a real runtime dependency, recommend that sponsor's track.
3. If multiple are real dependencies, recommend the one with the deepest integration (most function calls).
4. If none, fall back to a general track based on the project's category in `.suiperpower/idea-context.md`.
5. Output reasoning plus the chosen track. User can override.

Anti-slop guard: if the user wants a sponsor track but the sponsor's package is only `imported but never called`, the skill calls it out and refuses to recommend that track.

## deepsurge.xyz form pre-fill output

The skill writes `docs/submission/deepsurge-form.md` with one section per form field:

```markdown
# deepsurge.xyz submission, copy-paste ready

## Project name
<value>

## Project logo
docs/submission/logo-1280.png  (1280x1280 PNG)

## Description (short, paste as is)
<value>

## Track
<primary track>
(secondary tags judge may apply: <track2>, <track3>)

## Deployment network
testnet  (or mainnet)

## Package id
<value>
[suiscan link: https://suiscan.xyz/testnet/object/<value>]

## Team
- @<your-deepsurge-username>
- @<teammate1-deepsurge-username>
- @<teammate2-deepsurge-username>

## Links
- GitHub: https://github.com/<owner>/<repo>
- Website: <live-url>
- Demo video: <video-url>

## Media (upload these in order)
- docs/submission/media-1.png
- docs/submission/media-2.png
- docs/submission/media-3.png
- docs/submission/media-4.png
- docs/submission/media-5.png
```

## Day-of preflight checklist

`docs/submission/preflight-checklist.md` (also `.suiperpower/submission-context.md`):

```markdown
# Day-of preflight

Run this checklist within 6 hours of the submission deadline.

## Live demo
- [ ] Open the live URL in an incognito window. Does the load-bearing flow work end to end?
- [ ] Can a stranger reach a result without you walking them through it?
- [ ] No errors in the browser console on the golden path.

## On-chain
- [ ] Re-verify the package id is on chain (sui client object <id> returns valid).
- [ ] Re-verify the deploy network matches what is in the form.
- [ ] If on testnet, faucet your test address so users can interact.

## Repo
- [ ] README has install + run + demo URL + package-id + screenshots.
- [ ] License file present.
- [ ] Last commit is recent (judges look at commit recency).
- [ ] No leftover .env or secrets in the repo.

## Submission form
- [ ] Project name matches across logo, description, GitHub, video.
- [ ] All team members have registered on deepsurge.xyz under the usernames you listed.
- [ ] Logo is exactly 1280x1280, no transparency artifacts.
- [ ] At least 3 media images uploaded, all 1920x1080.
- [ ] Demo video link plays without sign-in (YouTube unlisted is fine).
- [ ] Track selection makes sense given the actual integration depth.

## Submit
- [ ] Click submit.
- [ ] Take a screenshot of the confirmation.
- [ ] Post in Sui Overflow Telegram (https://go.sui.io/suioverflow2026-tg) so the team knows you submitted.
```

## Anti-slop guards in this skill

1. Live URL must be reachable, return 200, and the load-bearing flow must work in headless test (puppeteer / playwright snapshot if available; manual check otherwise).
2. Package id must verify on chain.
3. Project name uniqueness check, web search for collisions.
4. Logo must be 1280x1280 exact, not "approximately."
5. Media must be 1920x1080 exact.
6. Demo video script must show a real user outcome, not "click around the dashboard."
7. Skill asks the user to do the live walk-through within 60 minutes of submission, not days before.

If any guard fails, the skill stops and tells the user what is wrong. It does not generate a half-broken submission.

## Sui Overflow Telegram + Twitter integration

After submission, skill prompts:

> Want to post in the Sui Overflow Telegram so the community sees you shipped? (https://go.sui.io/suioverflow2026-tg)

And:

> Want a draft tweet for the launch?

Tweet draft template:

```
shipped to sui overflow 2026 ✦

<one-line product>

live: <url>
package: <suiscan link>
sponsor track: <track>

built with @suiperpower (suiperpower.dev)
```

User-controlled, never auto-posted.

## What this skill does NOT do

- Auto-submit to deepsurge.xyz (no API).
- Generate fake screenshots.
- Generate AI-generated demo videos that do not match the actual product.
- Pick a sponsor track the project does not actually integrate with.
- Submit on behalf of teammates who have not registered.

These limits are intentional. The skill exists to make a real submission painless, not to enable a fake one.
