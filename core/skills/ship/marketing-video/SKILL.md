---
name: marketing-video
description: Plan a 30 to 60 second product marketing video for Twitter, YouTube Shorts, or a launch landing page, with a tight script, a shot list, and on-screen text plan, grounded in the project's load-bearing flow rather than stock visuals. Use when the user says "marketing video", "promo video", "launch video", "Twitter video", "YouTube short", "shorts", "make a promo", or "trailer". Reads .suiperpower/idea-context.md, .suiperpower/deploy-context.md, .suiperpower/track-pick.md, writes .suiperpower/marketing-video.md.
---

## Preamble (run first)

```bash
# Suiperpower telemetry. Routes through the CLI so projects.json + Convex stay in sync.
# Silent on failure so the skill never blocks. Opt out: SUIPERPOWER_TELEMETRY=off.
#
# AGENT NOTE: when this skill finishes, run the matching completion command:
#   suiperpower track marketing-video ship completed
# Or use "failed" / "aborted" if it ended that way.
command -v suiperpower >/dev/null 2>&1 && suiperpower track marketing-video ship started >/dev/null 2>&1 &
true
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Plans a 30 to 60 second marketing video. Different from `submit-to-sui-overflow`'s demo video, which is for judges; this one is for product distribution: Twitter feed, YouTube Shorts, an embedded video on the landing page.

The plan covers the script, the shot list, the on-screen text, and the audio direction. The skill does not produce footage; it produces a tight plan the user (or an editor) executes.

## When to use it

- Right after launch, when the user is announcing the product publicly.
- For an ongoing distribution loop where new feature releases get a 30s clip.
- For an investor or grant teaser linked from a landing page.

## When NOT to use it

- Hackathon submission video. Route to `submit-to-sui-overflow`.
- Long-form explainer (5+ minutes). Different shape, different skill (not in v1).
- Video editing or post-production work. Route to `video-craft`.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- `.suiperpower/idea-context.md`: the product's core claim and target user.
- `.suiperpower/deploy-context.md`: the demo is on the deployed package.
- `.suiperpower/track-pick.md`: the load-bearing sponsor (if any) to feature.
- The distribution channel: `twitter`, `youtube-shorts`, `landing-page`, or `multi`.
- The asset bundle: a working demo, screen recordings, optional voiceover capability.

## Outputs

A `.suiperpower/marketing-video.md` with the plan:

```markdown
## Marketing video, <timestamp>

### Brief
- channel: <twitter | youtube-shorts | landing-page | multi>
- length: <30 | 45 | 60> seconds
- aspect ratio: <9:16 | 1:1 | 16:9>
- claim: <one sentence the video must communicate>

### Script
- 0:00-0:03: <hook line, on-screen text>
- 0:03-0:10: ...
- 0:10-0:25: ...
- 0:25-0:40: ...
- 0:40-0:55: ...
- 0:55-end: <CTA>

### Shot list
- shot 1: <what to capture, source: live demo / screen recording / static asset>
- shot 2: ...

### On-screen text
- moment 0:03: <text overlay>
- moment 0:25: ...

### Audio
- voiceover: <yes | no>
- music: <license-safe source, or none>
- sfx: <list>

### CTA
- ask: <demo URL | follow account | join waitlist>
```

## Workflow

1. **Read context**
   - Pull the claim, target user, deploy artifacts, and load-bearing track.
   - Confirm the channel and length.

2. **Pick the structure**
   - Hook in the first 2 to 3 seconds. Twitter and Shorts are scroll-pacers; the first frame must earn the next.
   - Demo cut by 0:10. The viewer needs visual proof the product is real.
   - Load-bearing sponsor moment if `track-pick.md` recommends a primary track. Show the integration doing real work.
   - CTA in the last 5 seconds. One clear ask.

3. **Write the script**
   - One sentence per beat. No filler.
   - On-screen text mirrors or extends the voiceover; never duplicates word-for-word.
   - Avoid jargon. The viewer is not a Sui dev unless the channel is dev-targeted.

4. **Build the shot list**
   - Each shot has a source: live recording, screen capture, static asset.
   - Each shot is named so the editor can find the file later.

5. **Plan on-screen text**
   - Size, position, contrast for the channel. Twitter video plays muted; on-screen text carries the message.

6. **Audio direction**
   - Voiceover or no. If yes, name a target tone (calm, excited, dry).
   - Music license must be cleared. Do not assume a track is free.
   - SFX list, including the captured product sound (transaction confirmed, success ping).

7. **CTA**
   - One ask. The CTA is concrete: a URL, a follow, a waitlist signup. Multiple CTAs split attention.

8. **Writeback**
   - Append `.suiperpower/marketing-video.md`.

9. **Hand off**
   - For frame-level polish, route to `video-craft`.
   - For embedding on the landing page, route to the website setup phase or a frontend skill.

## Quality gate (anti-slop)

Before reporting done:

- Is the hook in the first 3 seconds, with no logo splash?
- Does the demo cut land by 0:10?
- Is the load-bearing sponsor (if any) shown doing real work?
- Is there exactly one CTA?
- Is on-screen text legible at the channel's aspect ratio?
- Did the writeback happen?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/channel-specs.md`: Length, aspect ratio, on-screen text rules per channel.
- `references/script-beats.md`: 30, 45, 60 second beat templates with timing.

## Use in your agent

- Claude Code: `claude "/suiper:marketing-video <your message>"`
- Codex: `codex "/marketing-video <your message>"`
- Cursor: paste a chat message that includes a phrase like "marketing video", or load `~/.cursor/rules/marketing-video.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
