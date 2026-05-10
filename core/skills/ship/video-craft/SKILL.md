---
name: video-craft
description: Polish frame-level video quality, pacing, captions, color, and audio for a demo or marketing cut, with a structured pass over each issue category before declaring the video ready. Use when the user says "polish my video", "improve my video frames", "improve my demo video", "video review", "make my video better", "video polish", or "edit pass". Reads .suiperpower/marketing-video.md or .suiperpower/submission-context.md video script if present, writes .suiperpower/video-craft.md.
---

## Preamble (run first)

```bash
_TEL_TIER=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"telemetryTier": *"[^"]*"' | head -1 | sed 's/.*"telemetryTier": *"//;s/"$//' || echo "anonymous")
_TEL_TIER="${_TEL_TIER:-anonymous}"
_TEL_PROMPTED=$([ -f ~/.suiperpower/.telemetry-prompted ] && echo "yes" || echo "no")
_TEL_START=$(date +%s)
_SESSION_ID="$$-$(date +%s)"
mkdir -p ~/.suiperpower
echo "TELEMETRY: $_TEL_TIER"
echo "TEL_PROMPTED: $_TEL_PROMPTED"
if [ "$_TEL_TIER" != "off" ]; then
  _TEL_EVENT='{"skill":"video-craft","phase":"ship","event":"started","ts":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
  echo "$_TEL_EVENT" >> ~/.suiperpower/telemetry.jsonl 2>/dev/null || true
  _CONVEX_URL=$(cat ~/.suiperpower/config.json 2>/dev/null | grep -o '"convexUrl":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
  [ -n "$_CONVEX_URL" ] && curl -s -X POST "$_CONVEX_URL/api/mutation" \
    -H "Content-Type: application/json" \
    -d '{"path":"telemetry:track","args":{"skill":"video-craft","phase":"ship","status":"started","version":"0.1.0","platform":"'$(uname -s)-$(uname -m)'","timestamp":'$(date +%s)000'}}' \
    >/dev/null 2>&1 &
  true
fi
```

If `TEL_PROMPTED` is `no`, before doing real work, ask the user:

> Help suiperpower get better. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`.
>
> A) Sure, anonymous
> B) No thanks

Write the answer to `~/.suiperpower/config.json` `telemetryTier` field and create `~/.suiperpower/.telemetry-prompted`. Then continue.

## What this skill does

Performs a frame-level polish pass on an already-edited video. Walks five categories in order: pacing, captions, color, audio, and accessibility. Surfaces concrete fixes per category, prioritized by viewer impact. Does not produce or edit footage; produces a fix list the user (or an editor) executes.

The skill assumes a draft video exists. For planning a video from scratch, use `marketing-video` or the script in `submit-to-sui-overflow`.

## When to use it

- After a draft cut exists, before publishing.
- When the user has feedback that the video "feels off" but cannot articulate what.
- Before re-rendering for distribution, since some fixes change the export settings.

## When NOT to use it

- Before a draft exists. The skill cannot polish what is not made.
- For full-flow planning. Route to `marketing-video` or the script step in `submit-to-sui-overflow`.
- For audio mastering only (a deeper task than this skill covers).

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.

## Inputs

- A reachable URL or local path to the draft video.
- The script and shot list from `marketing-video.md` or `submission-context.md` if present.
- The target channels and their specs.

## Outputs

A `.suiperpower/video-craft.md` with the fix list:

```markdown
## Video craft, <timestamp>

### Inputs
- video: <URL or path>
- duration: <seconds>
- channel target: <twitter | shorts | landing-page | judges>

### Pacing
- finding 1: <timestamp range, observation, fix>
- ...

### Captions
- finding 1: ...

### Color
- finding 1: ...

### Audio
- finding 1: ...

### Accessibility
- finding 1: ...

### Priority
- P0 (must fix before publish): ...
- P1 (should fix): ...
- P2 (nice to have): ...
```

## Workflow

1. **Read the video and the script**
   - Watch the video end to end at full speed.
   - Watch again with the script open. Note where the video diverges from the script.

2. **Pacing pass**
   - Identify dead frames (over 0.5 seconds with no visual change).
   - Identify rushed cuts (under 0.5 seconds where the viewer cannot read the on-screen text).
   - Recommend trims and extensions with timestamps.

3. **Captions pass**
   - If the video is silent-friendly, captions must carry the full message.
   - Check for typos, misalignment, off-screen overflow.
   - Confirm captions are burned in (or available as a sidecar SRT for platforms that need it).

4. **Color pass**
   - Check exposure, white balance, contrast across cuts. Multi-source footage often has mismatched looks.
   - Confirm brand colors if any are present in the video.
   - Flag any text that fails contrast on its background.

5. **Audio pass**
   - Check loudness target: -14 LUFS for streaming, -16 LUFS for Twitter. Use a meter, not a feeling.
   - Check voiceover clarity. Plosives, sibilance, room tone.
   - Check music ducks under voiceover by 6 to 9 dB.
   - Confirm SFX are mixed below voiceover and do not stack.

6. **Accessibility pass**
   - Caption coverage 100% of voiceover.
   - No flashing content above 3 Hz.
   - Color-only signals paired with shape or text.

7. **Prioritize fixes**
   - P0: anything that breaks the message (caption typo, audio drop, demo flow that does not show value).
   - P1: quality issues that materially hurt perception (mismatched color, bad pacing).
   - P2: polish items that improve but do not block.

8. **Writeback**
   - Append `.suiperpower/video-craft.md`.

## Quality gate (anti-slop)

Before reporting done:

- Was the video actually watched twice (once free, once with the script)?
- Was loudness measured with a meter, not approximated?
- Are findings tied to specific timestamps, not vague impressions?
- Is each fix actionable (a target trim, a target color, a target loudness)?
- Did the writeback happen?

If any answer is no, the skill keeps working.

## References

On-demand references (load when relevant to the user's question):

- `references/loudness-targets.md`: Per-channel loudness targets and meter recommendations.
- `references/pacing-rules.md`: Frame-level pacing rules with examples.

## Use in your agent

- Claude Code: `claude "/video-craft <your message>"`
- Codex: `codex "/video-craft <your message>"`
- Cursor: paste a chat message that includes a phrase like "polish my video", or load `~/.cursor/rules/video-craft.mdc` and reference it.

If you activated this and the user actually wants something else, consult `skills/SKILL_ROUTER.md` and hand off.
