---
name: submit-to-sui-overflow
description: Use when submitting to Sui Overflow on deepsurge.xyz. Captures package id, validates the 1280x1280 logo, drafts form copy, runs preflight.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track submit-to-sui-overflow ship completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track submit-to-sui-overflow ship started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Runs the full Sui Overflow submission flow, following `skills/data/guides/deepsurge-submission.md`. The skill prepares everything the user needs to paste into the deepsurge.xyz form, validates assets to spec, generates a tight demo video script, and runs a day-of preflight gate that catches the obvious last-minute mistakes.

The skill writes everything captured to `.suiperpower/submission-context.md` per the phase-handoff spec. Submission stays append-only so re-runs can refine without losing prior state.

## When to use it

- After the package is deployed and `track-pick.md` has named a primary track.
- When the user wants to submit to Sui Overflow and asks what is left.
- For the day-of submission window when preflight matters.

## When NOT to use it

- Before the project deploys. Run `deploy-to-testnet` or `deploy-to-mainnet` first.
- Without a track pick. Run `pick-my-sui-track` first; the form needs a primary track.
- For non-Overflow submissions. Other Sui hackathons may use different forms; this skill targets deepsurge.xyz.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- `.suiperpower/idea-context.md`: chosen idea, target user, one-liner.
- `.suiperpower/deploy-context.md`: package id, env (mainnet or testnet), modules.
- `.suiperpower/track-pick.md`: primary track, optional secondary.
- `.suiperpower/business-model.md` and `.suiperpower/retention-loop.md`, used to draft the project description.
- The team roster (names, roles).
- Asset files: a 1280x1280 logo, a 1920x1080 cover image, a demo video link or file.
- Optional: a roast and product-review pass so the form copy is sharper.

## Outputs

A `.suiperpower/submission-context.md` entry following the canonical headers from `skills/data/specs/phase-handoff.md`:

```markdown
## Submission, <timestamp>

### Hackathon
- name: Sui Overflow 2026
- portal: https://deepsurge.xyz
- track primary: <sponsor or thematic>
- track secondary: <sponsor or thematic | none>
- submission deadline: <yyyy-mm-dd HH:MM TZ>

### Project copy
- name: <project name>
- one-liner: <one sentence>
- description: <one paragraph, 80-150 words>
- problem: <one paragraph>
- solution: <one paragraph>
- why-Sui: <one paragraph naming the Sui primitives load-bearing for the project>

### Artifacts
- package id (mainnet or testnet): <0x...>
- demo URL: <https://...>
- repo URL: <https://...>
- video URL: <https://...>
- pitch deck URL: <https://...>
- logo (1280x1280, PNG, transparent OK): <path or URL>
- cover image (1920x1080, PNG): <path or URL>

### Demo video
- length: <60-180 seconds>
- script: <inline or path to script>

### Team
- members: <list of name, role, contact>

### Day-of preflight
- form fields filled: <yes | no>
- assets uploaded: <yes | no>
- demo URL reachable: <yes | no>
- video URL reachable: <yes | no>
- package id verified on the right env: <yes | no>
- pitch deck readable: <yes | no>
- track aligned with deepest sponsor integration: <yes | no>
- final submitted: <yes | no>
```

## Workflow

1. **Read context**
   - Verify `idea-context.md`, `deploy-context.md`, `track-pick.md` exist. If any are missing, route to the relevant skill.
   - Read `business-model.md`, `retention-loop.md`, `product-review.md`, `roast.md` if they exist; the form copy will be sharper.

2. **Draft project copy**
   - Name and one-liner: pull from `idea-context.md`. Sharpen for the form: under 80 characters.
   - Description: one paragraph, 80 to 150 words. Lead with the problem, then the solution, then the user.
   - Problem: one paragraph, concrete and named.
   - Solution: one paragraph, concrete. Mention Sui primitives only when load-bearing.
   - Why Sui: one paragraph naming the primitives (objects, capabilities, PTBs, sponsor protocols) the project genuinely depends on. Refuse to claim Sui is load-bearing if `pick-my-sui-track` says otherwise.

3. **Validate assets**
   - Logo: confirm 1280x1280, PNG. If the user provides a different size, either auto-resize (with consent) or block the submission until corrected.
   - Cover: confirm 1920x1080 PNG.
   - Demo URL: HEAD or HTTP GET to confirm a 200.
   - Video URL: confirm a 200 and an embeddable target.
   - Pitch deck URL: confirm a 200.

4. **Demo video script**
   - 60 to 180 seconds. Structure:
     - 0 to 10s: hook, the problem in one sentence.
     - 10 to 30s: the solution, with a working demo cut.
     - 30 to 90s: walk the load-bearing flow showing the sponsor integration in action.
     - 90 to 120s: the team in one beat. Optional.
     - 120 to 180s: the ask, where to find more.
   - See `references/video-script-template.md`.

5. **Form copy**
   - Generate the exact text to paste into each deepsurge.xyz field per `skills/data/guides/deepsurge-submission.md`. The skill does not auto-submit; it produces text.
   - Save form copy under `Project copy` in `submission-context.md`.

6. **Day-of preflight**
   - Walk the preflight checklist in the writeback's `Day-of preflight` section.
   - For each item, mark yes only after a verifiable check (HTTP 200, file size match, package id present in `sui client object` output).
   - If any item is no, name what is blocking and stop. Do not mark `final submitted: yes` unless the user confirms the actual deepsurge.xyz submission went through.

7. **Writeback**
   - Append the `## Submission, <timestamp>` block. Append-only; re-runs add a new dated block.

8. **Hand off**
   - Surface the form copy and the submission portal URL.
   - Pause: the deepsurge.xyz form is filled in the user's browser. The skill cannot submit on the user's behalf.

## Quality gate (anti-slop)

Before reporting done:

- Was every required input file present? (Refuse to draft submission copy without `idea-context.md` and `deploy-context.md`.)
- Did the why-Sui paragraph cite a load-bearing primitive, not a sticker-level integration?
- Was the logo verified at 1280x1280? Cover at 1920x1080?
- Did the demo video script show the load-bearing flow from `track-pick.md`?
- Did the day-of preflight tick every item with a verifiable check, not an "I think so"?
- Did the writeback happen?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/video-script-template.md`: 60-180 second beats, with copy slots.
- `references/form-copy-template.md`: deepsurge.xyz field-by-field copy template.

Canonical:

- `skills/data/guides/deepsurge-submission.md`
- `skills/data/specs/phase-handoff.md`

## Use in your agent

- Claude Code: `claude "/suiper:submit-to-sui-overflow <your message>"`
- Codex: `codex "/submit-to-sui-overflow <your message>"`
- Cursor: paste a chat message that includes a phrase like "submit to Sui Overflow", or load `~/.cursor/rules/submit-to-sui-overflow.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
