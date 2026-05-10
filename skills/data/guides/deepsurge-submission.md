# Deepsurge Submission Guide

Walk-through for submitting to deepsurge.xyz, the Sui Overflow 2026 submission portal. The full submission spec lives in `plans/10-HACKATHON-SUBMISSION.md`; this guide is the user-facing recipe.

## What deepsurge.xyz is

Sui Overflow 2026's submission portal. Distinct from overflow.sui.io, which is the hackathon information site. Submissions only land on deepsurge.

URL: https://www.deepsurge.xyz/hackathons/b587dc0c-4cb8-4e63-ada5-519df38103bf

The form does not auto-save. Compose every field in your editor first, then paste in a single sitting.

## Required fields

- Project logo, 1280x1280 recommended
- Project name, must not collide with a generic-noun brand already in crypto
- Description, short (300 chars) and full (1000 chars)
- Track, one primary
- Deployment network (devnet, testnet, mainnet)
- Package id of the deployed Move package
- Team, each member registered on deepsurge.xyz first
- Links: GitHub, live website, demo video
- Media images, 16:9 (1920x1080) recommended

## Pre-submission Checks

Run before opening the form. The skill `submit-to-sui-overflow` runs these as a preflight gate; do not skip them in manual flow either.

- Live URL reachable. `curl -I <url>` returns 200.
- Package id verifies on chain. `sui client object <id>` returns the package.
- Logo dimensions are exactly 1280x1280. `file logo.png` and `identify logo.png` both confirm.
- Every media image is exactly 1920x1080.
- Demo video plays in an incognito window without sign-in. YouTube unlisted is fine.
- All team members have deepsurge.xyz accounts and have shared their usernames.
- Project name is not already taken by 3 or more other projects (web search the name + "Sui").

## Walk-through

For each form field, paste from a prepared file under `docs/submission/`.

| Form field | Source file |
|---|---|
| Project name | docs/submission/deepsurge-form.md, line 1 |
| Logo | docs/submission/logo-1280.png |
| Description (short) | docs/submission/description-short.txt |
| Description (full) | docs/submission/description-full.txt |
| Track | docs/submission/deepsurge-form.md, "Track" section |
| Deployment network | docs/submission/deepsurge-form.md, "Network" |
| Package id | docs/submission/deepsurge-form.md, "Package id" |
| GitHub | docs/submission/deepsurge-form.md, "Links" |
| Website | docs/submission/deepsurge-form.md, "Links" |
| Demo video | docs/submission/deepsurge-form.md, "Links" |
| Media images | docs/submission/media-1.png to media-5.png |
| Team usernames | docs/submission/deepsurge-form.md, "Team" |

The `submit-to-sui-overflow` skill generates this folder for you. If you are submitting by hand, build it from your `build-context.md` and `deploy-context.md` files.

## Common Pitfalls

- Pasting unicode quotes from a chat app instead of plain ASCII. The deepsurge form often does not accept curly quotes. Compose in a plain editor.
- Logo with a transparent background. Some renderings show a checkerboard. Use a solid background or test the rendered preview before submitting.
- Demo video region locked. Judges sit in multiple regions. Prefer YouTube unlisted over Vimeo region restricted.
- Media image dimensions slightly off (e.g. 1920x1079). Validators may reject. Use exactly 1920x1080.
- Team member username typos. The form looks up usernames live; one wrong character means the member is not added. Confirm the spelling with each teammate.
- Submitting at the deadline minute. Form failures cluster near the end. Submit at least an hour before the deadline.

## Post-submission

After the form returns a confirmation:

- Take a screenshot of the confirmation page. Save under `docs/submission/confirmation.png`.
- Append the submission record to `.suiperpower/submission-context.md` under the Submission section.
- Post in Sui Overflow Telegram (https://go.sui.io/suioverflow2026-tg). Short message, link to the live demo.
- Optional: tweet the submission with sponsor mentions. The template is in `plans/10-HACKATHON-SUBMISSION.md`.

If something is wrong after submission (typo in description, wrong package id), check whether deepsurge allows edits within the submission window. If not, contact the organizers via Telegram immediately.

## Skills that read this guide

`submit-to-sui-overflow` (primary), `pick-my-sui-track` (light reference).

*Last updated: 2026-05-10. Targets the deepsurge.xyz Sui Overflow 2026 submission form.*
