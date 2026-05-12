# Launch video concept

A 35 second motion-graphic spot for Suiperpower, scored to a house track with two drops (0:04 and 0:19) and a last kick at 0:33. No voiceover, no talking head. Two real screen recordings (install pass, Claude Code session) stitched into a typographic spine. Built in Remotion, single composition. Visual language matches sui.io: true black, flat, single blue accent, institutional rectangular composition, ease-out everywhere.

This doc is the production spec. If you build the spot, build it exactly from this. If you change a beat, change this file first.

## Thesis

> What if your agent had a superpower for Sui? The hook is a question. The answer is the brand name, revealing itself out of the sentence as the line lands.

Agents already know Sui. What they lack is the founder instinct to ship on it. The spot does not say that out loud, the wordplay does the work. The opening line builds, the word `superpower` morphs into `Suiperpower` mid-screen by pulling the `Sui` at the end of the sentence back into it, the wordmark is born from the punchline. Everything after that is product proof.

## Length and format

- **Master**: 35.0 s, 1920x1080, 60 fps, H.264, CRF 18.
- **Square cut**: 1080x1080, same timeline, re-cropped composition (separate Remotion entry).
- **Teaser cut**: 8.0 s (scene 1 opening hook with `BrandPull` + CTA hold), same timeline with sequences gated.
- **Extended cut**: 60 s (adds a sponsor integration beat between Claude Code and outcome). Out of scope for this doc but the timeline must leave room for it.

## Music map (load-bearing)

The spot is cut to the music. Every scene transition aligns with a music event. Locked map:

| Time | Frame | Music event | Visual event |
|---|---|---|---|
| 0:00 | 0 | Intro buildup begins, pad swells | Opening hook line starts building |
| 0:04 | 240 | First beat drop, house 4/4 enters | `BrandPull` snap completes, `Sui` lands inside `superpower` exactly on the kick |
| 0:08 | 480 | House continues | Tagline expansion completes, install scene cues in |
| 0:15 | 900 | Break / chops begin | Claude Code frame fades in |
| 0:19 | 1140 | Second beat drop | `intent.md written` annotation lands on the kick |
| 0:27 | 1620 | House continuation | Cut to charged hold before the word-burst |
| 0:30 | 1800 | Pre-roll into final beat | `IN.` lands at end of word-burst |
| 0:33 | 1980 | Last beat / kicks closing | Wordmark + `suiperpower.dev` fully settled, center frame, all black |
| 0:35 | 2100 | Silence | End frame |

If any of these sync points drift by more than 4 frames in the final render, re-cut. The music IS the cut.

Visual language is sui.io: true-black canvas, institutional rectangular composition, single saturated blue, monospace tag chips, flat icons. Nothing soft, nothing warm, nothing rounded past 8 px. Refer to `sui.io` homepage if you need a live reference, the spot must feel like a moving slice of that surface.

Locked tokens. Everything in the spot pulls from these. Mirror into `tokens.ts` in the Remotion project.

| Token | Value | Use |
|---|---|---|
| `bg.base` | `#000000` | Frame background, true black, no warmth |
| `bg.surface` | `#131518` | Cards, terminal frames, primary surfaces |
| `bg.elevated` | `#232529` | Borders, dividers, slightly raised surfaces |
| `bg.light` | `#F4F5F7` | Light-mode beats (used once, for the status-pill row backdrop optional) |
| `accent.blue` | `#2A8DFF` | The Sui blue. Backgrounds for action chips, glyph color on `Sui` after `BrandPull`, dividers, highlights |
| `accent.glow` | `#2A8DFF` at 20% alpha, blur 60 | Behind the install moment only |
| `text.primary` | `#FFFFFF` | Headlines, body, anything on dark surface |
| `text.muted` | `#A0A4AB` | Captions, subtitles, annotations |
| `text.dim` | `#6E7178` | Tertiary metadata, monospace tag-chip labels |
| `text.invert` | `#000000` | Text on `bg.light` or on `accent.blue` chips |
| `state.success` | `#34D399` | Status pills in the outcome beat |
| `radius` | `4px` standard, `0px` on tag chips | Square-ish. Tag chips are perfectly rectangular, action chips and terminals get 4 px |
| `type.display` | TWK Everett Medium, -2% tracking | All headlines and the wordmark |
| `type.body` | TWK Everett Regular, 0% tracking | Subtitles, taglines, body text |
| `type.emphasis` | TWK Everett Bold Italic | Rarely used, reserved for one-word emphasis if needed |
| `type.mono` | JetBrains Mono Regular | Terminal, slash commands, install command, tag-chip labels |

Fonts in repo:

- TWK Everett (Regular, Medium, Bold Italic) is in `scratchpads/video/assets/`. Load via Remotion's `@remotion/fonts` from local path, do not pull from CDN.
- JetBrains Mono pairs cleanly with TWK Everett, both share a Swiss/institutional posture. Load via `@remotion/google-fonts/JetBrainsMono` Regular weight. If you prefer IBM Plex Mono for an even tighter institutional match, swap before scaffolding, just pick one and stick with it.

### Visual motifs (from the sui.io reference)

These are decorative patterns, not primitives. They appear at the discretion of each scene, never required, but each is locked when used so the spot reads as one piece.

- **Tag chip**: a small monospace label sitting outside a major element. Rectangular, no radius, `bg.elevated` (`#232529`) fill, `text.dim` label, padding 6 px horizontal 3 px vertical, 12 px monospace. Examples on sui.io: `The economy, rebuilt on integrity`, `Sui is`, `[ → ]`. In our spot, use sparingly to chapter the timeline (e.g. `[ install ]` above the terminal frame, `[ build ]` above the Claude Code frame, `[ ship ]` above the outcome line). Each chip enters via `CharRise` 200 ms before the main element it anchors.
- **Block highlight**: a chunk of inline text wrapped in a solid rectangle, text inverts to `text.invert` (black on white block) or stays white (on `accent.blue` block). Used to emphasize sub-phrases inside a line without breaking the line. Available for the opening hook if needed (e.g. wrap `superpower` in a blue block momentarily), but read the warning under "what would kill this" before using.
- **Dotted divider**: a 1 px horizontal row of `text.dim` dots, 4 px spacing, separates stacked elements. Use between the wordmark and the tagline in scenes 1 and 2 if the composition feels too floaty. Optional.
- **Action chip**: a 32 px square `accent.blue` rectangle with a single white line icon centered. Sui uses these on `Get started`, `Explore Sui Stack for X`. We use one only, in the CTA: a small action chip with an arrow icon sits left of the curl command, suggesting "run this".
- **Bracket arrow**: monospace `[ → ]` chip, treated like a tag chip, used as the CTA secondary cue under the curl command if the action chip is dropped. Pick one or the other, not both.

The institutional rectangular vibe is doing most of the brand work. Resist the urge to add gradients, rounded pills, or soft shadows. Every surface is either flat black, flat blue, or flat white, with at most a single 60 px blur halo behind the install terminal.

## Motion language

One easing, zero springs, multiple typographic primitives. The discipline is the easing curve. The variety is in which property each primitive animates.

- **Content easing**: `cubic-bezier(0.16, 1, 0.3, 1)`, ease-out-expo. Every move uses it.
- **Element entrance**: 600 ms, 24 px upward + fade, 70 ms stagger.
- **Camera-ish scale hold**: 1.00 to 1.02 over 1.2 s on long holds.
- **Cuts**: act breaks land on the kick of the music, never mid-bar.

No bounces, no overshoots, no parallax, no springs. Flat is the brand. The typographic system below is how the spot earns its agency-quality feel without breaking flatness.

### Typographic motion primitives

Six named primitives. Each scene's text picks one. Mixing primitives within a single line is forbidden, mixing across scenes is the point.

| Primitive | What it does | Use for |
|---|---|---|
| `CharPunch` | Per character. Each char enters at scale 1.35, blur 8 px, opacity 0, snaps to 1.00 scale, 0 blur, opacity 1 over 140 ms. Default stagger 28 ms, slowed to 50 ms for the opening hook line specifically. The signature move, fast zoom in and lock. | Opening hook, tagline expansion insert, outcome line |
| `CharRise` | Per character. y offset +28 px, opacity 0 to 1, 380 ms, 22 ms stagger. Calmer cousin of CharPunch. | Short tagline, outcome pills |
| `MonoType` | Per character, monospace only. Char appears instant with a 60 ms scale 1.15 to 1.0 pulse and a blue caret that runs ahead. 38 ms per character. | Install command, slash command annotation, CTA |
| `WordSwap` | One word in a settled line gets replaced or inserted. Outgoing word blurs 6 px and lifts 8 px out, incoming builds with `CharPunch` on its characters. 280 to 360 ms total. | Tagline `Build on Sui.` to `Build something meaningful, on Sui.` expansion |
| `BrandPull` | The signature, used once. A 2 px `accent.blue` connector draws from a source character to a target word, snaps back pulling the target word into the source, transforming the source word in place. 600 ms total. | Scene 1, pulling `Sui` from end of sentence into `superpower` to form `Suiperpower` |
| `TrackBreathe` | Applied as a settle pass after any primitive. Letter-spacing animates from +14% to 0% over 600 ms while the line holds. Subtle, but it is the move that reads as "agency". | After the opening hook line, not used on tagline or pill text |

Exit choreography, three options, picked per scene:

| Exit | What it does | Use for |
|---|---|---|
| `LineLift` | Words push up 18 px staggered in reverse, fade to 0 with a 4 px x-blur trail, 360 ms, 50 ms reverse-stagger. Default exit. | Outcome line exit |
| `WipeOut` | Clip-path `inset(0 0% 0 0)` to `inset(0 0% 0 100%)`, 400 ms. | Annotation dismissal, install command lifting on enter |
| `HardCut` | One-frame fade to black on a music beat. No motion. | Outcome to CTA seam |

### Detail moves, sprinkled

These are decoration. Each appears once or twice across the spot, never as filler.

- **CaretRun**: a 2 px x 24 px blue caret travels left to right across a line at 1.3x the line's reveal speed, parks 4 px past the last character, blinks twice, then dissolves. Use under MonoType.
- **DropShadowPunch**: on CharPunch entrance, a one-frame `text-shadow: 0 0 24px #2A8DFF` flashes then clears. Only used on the outcome line `Build like it has to last.`
- **GhostTrail**: a duplicate layer of the line at 12% opacity offsets +6 px x during CharPunch then catches up at line settle. Used on the opening hook line only.
- **SuiPulse**: a one-frame `accent.blue` color flash on a single character mid-build. Used once, on the `s` of `superpower` in scene 1, as the subliminal pre-pay-off for `BrandPull`.

## Storyboard

Six scenes, 35 seconds total. Times are inclusive starts. Frame counts assume 60 fps. Scene boundaries align with music events from the map above.

| # | Scene | Start | End | Frames | Anchored music event |
|---|---|---|---|---|---|
| 1 | Opening hook + brand reveal | 0:00 | 0:04 | 0 to 240 | `BrandPull` snap on first drop at 0:04 |
| 2 | Brand hold + tagline | 0:04 | 0:08 | 240 to 480 | rides first house bars |
| 3 | Install moment | 0:08 | 0:15 | 480 to 900 | mid-house, ends at break |
| 4 | Claude Code | 0:15 | 0:27 | 900 to 1620 | spans break + second drop, `intent.md` on 0:19 |
| 5 | Word-burst close | 0:27 | 0:33 | 1620 to 1980 | builds into the last beat at 0:33 |
| 6 | Elegant CTA hold | 0:33 | 0:35 | 1980 to 2100 | last beat decay + silence |

### Scene 1, opening hook + brand reveal (0:00 to 0:04)

The whole hook is one continuous typographic shot, compressed to 4 seconds so the `BrandPull` snap lands exactly on the first beat drop at 0:04. The viewer reads a question, the question morphs into the brand name on the drop, the brand name is born from the punchline AND the kick at the same instant.

Setup: pure `bg.base`. The line builds centered, `type.display`, 88 px, white. The line is:

> What if your agent had a superpower for Sui?

Character count: 44 including spaces and the question mark. Two anchor positions to remember through this scene:
- The `s` of `superpower` (character index 25, the first letter of word four).
- The word `Sui` near the end (characters 38 to 40, the second-to-last word).

Build sequence, 60 fps, all frame counts locked to the 0:04 drop landing on frame 240:

**Frames 0 to 12, caret cue.** A blue caret blinks once at center, then disappears as the line starts. 200 ms total. Pad swells underneath.

**Frames 12 to 120, line types in via `CharPunch` with `GhostTrail`.** 30 ms stagger per character, 100 ms per-char punch. Across 44 chars, total reveal takes ~1.8 s. When the `s` of `superpower` lands (around frame 65), it pulses `accent.blue` for one frame via `SuiPulse`, then returns to white. Subliminal.

**Frames 120 to 170, hold with `TrackBreathe` settle pass.** Letter-spacing animates from +14% to 0% over 600 ms. The sentence breathes briefly. Pad continues to swell, tension building toward the drop.

**Frames 170 to 185, `Sui` activates.** The `Sui` at the end of the sentence glows up to `accent.blue` over 250 ms. Simultaneous scale beat on `Sui` (1.00 to 1.06 to 1.00). This is the visual "pre-roll" that tells the viewer something is about to happen, perfectly aligned with the music's final pre-drop bar.

**Frames 185 to 240, `BrandPull`, the signature move, snap lands on the drop.** 

- Connector draws frames 185 to 200 (250 ms), 2 px `accent.blue` line from `s` to leading edge of `Sui`.
- Hold frames 200 to 204 (67 ms).
- Snap frames 204 to 229 (416 ms), connector retracts pulling `Sui` along its length. `Sui` scales 1.00 to 0.92 in transit, `s` of `superpower` slides +14 px right to open a slot.
- Settle frames 229 to 240 (184 ms), `Sui` lands inside the word at the slot, connector dissolves, `Sui` scale returns to 1.00.
- **At frame 240, the kick lands.** Simultaneously, the audio one-shot accent fires, the bg flashes `accent.blue` for exactly 1 frame, and the word `superpower` is now `Suiperpower` on screen with the `Sui` segment in `accent.blue` and the rest in white. The viewer's eye, ear, and the bg all confirm the brand arrival in the same instant.

The trailing `?` and the rest of the sentence are still on screen at frame 240. They get cleaned up in scene 2, the drop hits before any cleanup so the kick lands on the maximum-information frame.

### Scene 2, brand hold + tagline expansion (0:04 to 0:08)

The first 4 s of house beat. The wordmark settles cleanly, the sentence wreckage clears, and the tagline expands from short to full while the beat carries the energy.

Build sequence:

**Frames 240 to 270, sentence cleanup, 500 ms.** The `?` cross-fades into a `.` via a 200 ms glyph swap. Every character on the line except `Suiperpower` fades to 0 opacity, per-word reverse stagger (last word first). By frame 270, only the wordmark sits on screen, still in its in-sentence position.

**Frames 270 to 330, wordmark centers + first tagline arrives, 1 s.** The wordmark drifts to true center over 24 px, 600 ms. As it settles, the short tagline `Build on Sui.` `CharRise`s in below it, `text.muted`, `type.body`, 26 px. Tagline lands by frame 330.

**Frames 330 to 420, tagline expansion via `WordSwap` insertion, 1.5 s.** The phrase `something meaningful,` inserts between `Build` and `on`. `Build` shifts 40 px left, `on Sui.` shifts right to make room (200 ms). The inserted words `CharPunch` in the gap (360 ms). The line re-centers (340 ms). Result:

> Build something meaningful, on Sui.

**Frames 420 to 480, hold, 1 s.** Wordmark + full tagline hold together. Subtle 1.00 to 1.02 camera-ish scale. The kick keeps four-on-the-floor underneath. Frame 480 is the seam into the install scene.

The two-beat tagline (`Build on Sui.` then `Build something meaningful, on Sui.`) is the structural rhyme that makes the brand promise feel inevitable rather than declared. The short version was the answer to the question. The long version is what the answer means.

### Scene 3, install moment (0:08 to 0:15)

7 seconds, frames 480 to 900. The brand composition (wordmark + tagline) lifts up and parks at the top center, with the wordmark scaling down to ~40 px tall and the tagline dropping to 14 px in `text.dim`. A `[ install ]` tag chip enters at the top-left of the terminal area via `CharRise`, 200 ms before the terminal frame. Below the tag, a terminal-shaped frame fades in: `bg.surface`, 4 px radius, 1280 x 360 px, with `accent.glow` blurred behind it. Inside, in `type.mono` 28 px:

```
$ curl -fsSL suiperpower.dev/setup.sh | bash
```

Build sequence:

1. **Frames 480 to 510**, brand composition lifts up + tag chip appears. Wordmark scales down to 40 px at top center, tagline dims and shrinks to 14 px. `[ install ]` tag chip `CharRise`s in at the top-left of the terminal area, 500 ms.
2. **Frames 510 to 540**, terminal frame fades in with a 12 px y offset, 500 ms. `accent.glow` halo builds behind it during this fade.
3. **Frames 540 to 660**, command builds via `MonoType` with `CaretRun`, ~47 ms per character across the 43-char command, 2 s total. Caret parks at end and blinks twice.
4. **Frames 660 to 720**, enter beat. Command line lifts 4 px and dims to `text.muted`, the real `suiperpower-pass` ASCII art renders in place. This is the captured mp4, dropped as a `<Video>` layer inside the frame. 1 s.
5. **Frames 720 to 900**, hold the pass plus a `ready.` line. 3 s. The house beat keeps the energy from going flat during the hold. Frame 900 cues the break, which is the seam into Claude Code.

The contrast between `MonoType` here and `CharPunch` elsewhere is deliberate. Monospace gets mechanical motion, display gets explosive motion.

No log spam. Whatever the real install prints, capture clean. The viewer should see only the pass and the final `ready.` line.

### Scene 4, Claude Code in action (0:15 to 0:27)

12 seconds, frames 900 to 1620. Spans the music's break section (0:15 to 0:19) and the second house drop and continuation (0:19 to 0:27). The break gives Claude Code room to breathe quietly, the second drop punches the `intent.md` annotation into focus, the continuation rides house energy into the word-burst handoff.

The `[ install ]` tag chip cross-fades to `[ build ]` at frame 900. The terminal frame transitions to a larger frame, 1600 x 900 px, that hosts the real Claude Code screen recording. Same 4 px radius, no glow this time. The wordmark stays parked at the top.

Three annotations enter from the right as the recording plays. Each annotation: `text.muted`, `type.body`, 20 px, with a 2 px `accent.blue` left bar that draws in first then the text follows.

Entrance per annotation: left bar draws top-down 200 ms, then text builds. The slash command annotation uses `MonoType` (it is monospace). The other two use `CharRise`. Annotations sit in a vertical stack with 16 px gap, never overlapping.

| Frame | Time | Annotation | Primitive | Trigger in capture | Music sync |
|---|---|---|---|---|---|
| 1020 | 0:17 | `/scaffold-project` | `MonoType` | Slash command fires | Mid-break, quiet |
| 1140 | 0:19 | `intent.md written` | `CharRise` | `.suiperpower/intent.md` appears in file tree | **Second beat drop lands here, the annotation is the visual on the kick** |
| 1380 | 0:23 | `build-plan.md written` | `CharRise` | `.suiperpower/build-plan.md` appears | Mid-house, post-drop continuation |

Each annotation auto-dismisses 1.8 s after entrance via a horizontal `WipeOut` followed by the left bar collapsing top-up. The screen breathes between callouts.

Sequencing notes:

- **Frames 900 to 1020** (2 s), Claude Code frame fades in with a 12 px y offset. The break section is quieter than the first half, so the frame entry should be a calm fade, not a punch. The viewer registers the transition.
- **Frames 1020 to 1140** (2 s), slash command annotation appears, holds. The break is still going, so the visual stays subdued.
- **Frame 1140**, the second beat drop. The `intent.md` annotation enters precisely on the kick. The viewer's eye and ear lock to the same moment, making the founder-mindset payoff (intent before code) feel inevitable. Annotation 1 dismisses just before, so frame 1140 has annotation 2 entering on a clear stack.
- **Frames 1140 to 1380** (4 s), the second drop's house energy carries the annotation hold. Annotation 2 dismisses around frame 1320.
- **Frames 1380 to 1500** (2 s), `build-plan.md` annotation enters and holds. Mid-house, no special music event needed.
- **Frames 1500 to 1620** (2 s), hold + transition prep. The Claude Code frame begins to subtly dim (10% opacity reduction across 1 s ending at frame 1620). This primes the cut to the word-burst close.

### Scene 5, word-burst close (0:27 to 0:33)

6 seconds, frames 1620 to 1980. Opens with a brief charged hold (the spot's only true silent visual beat besides the close), then a fast four-word burst with bg flips, then the wordmark + URL settle exactly on the last beat at 0:33.

Hard cut from Claude Code into pure `bg.base`. Each word fills the screen, the background flips between `bg.base` (black) and `accent.blue` between every word, four words total, then resolves into the elegant wordmark hold.

The line, exactly as it renders on screen:

> LOCK. THE. F***. IN.

All caps, `type.display`, 220 px, centered, on whichever bg the current beat sits on. The asterisks are literal glyphs, not a placeholder. The censor IS the move. Self-censoring reads as confident and playful at the same time, where the uncensored version would read as edgy-for-edge's-sake. The dots between words plus the asterisks doing double-duty as both censor and punctuation is the entire typographic joke.

Build sequence, 60 fps:

| Frame | Time | Duration | Background | Word | Mechanic |
|---|---|---|---|---|---|
| 1620 to 1740 | 0:27 to 0:29 | 2 s | `bg.base` | (silent charged hold) | Hard cut from Claude Code. Black frame, no text. The bass under the music carries the tension. This silent visual beat against the loud music is what makes the burst that follows hit harder. |
| 1740 to 1752 | 0:29 to 0:29.2 | 200 ms | `bg.base` | `LOCK.` | `CharPunch`, 30 ms stagger, 100 ms per char, holds for the rest of the beat |
| 1752 to 1764 | 0:29.2 to 0:29.4 | 200 ms | `accent.blue` | `THE.` | `HardCut` bg flip (1 frame), word `CharPunch`es in fresh, text stays `text.primary` |
| 1764 to 1776 | 0:29.4 to 0:29.6 | 200 ms | `bg.base` | `F***.` | bg flip, `CharPunch`. Three asterisk glyphs get a 1-frame `accent.blue` flash on landing, then return to white |
| 1776 to 1800 | 0:29.6 to 0:30 | 400 ms | `accent.blue` | `IN.` | bg flip, `CharPunch` with `DropShadowPunch` on entrance, holds the full 400 ms. Landing word, earns the extra beat. |
| 1800 to 1860 | 0:30 to 0:31 | 1 s | blue to black, 200 ms fade then hold black | (transition) | `IN.` dissolves over 200 ms via opacity fade to 0. Wordmark `Suiperpower` `CharRise`s in at frame 1812, centered, settles by frame 1860. |
| 1860 to 1980 | 0:31 to 0:33 | 2 s | `bg.base` | wordmark settles + URL arrives | The URL `suiperpower.dev` `CharRise`s in below the wordmark, `text.muted`, `type.body`, 24 px, 16 px gap, starts at frame 1860, settles by frame 1920. Then both elements hold to frame 1980. **At frame 1980, the last beat of the music lands as the composition is fully present and at rest.** |

Beat math: 2 s charged hold + 1 s of word burst + 1 s transition + 2 s wordmark settle = 6 s total. The four word-punches each land on house off-beats. The `IN.` lands at 0:30, which is one bar before the final kick at 0:33. This gives 3 seconds of music carry to the final beat while the wordmark + URL emerge calmly underneath.

Asterisk rendering details (this matters, get it right):

- TWK Everett's default asterisk sits at superscript height. For display use at 220 px, that reads as a tiny mark floating high. Override the baseline: render the three asterisks at the cap-height center, not the default position. CSS: `vertical-align: middle` plus a manual `transform: translateY(-0.15em)` on the asterisk span.
- Spacing between the three asterisks: tighten letter-spacing by -4% on the asterisks specifically. Default kerning leaves them feeling like three separate punctuation marks rather than a single censor unit.
- The trailing period after the asterisks stays at baseline, normal weight. Reads as `[asterisks at cap-mid] [period at baseline]`, which is the right rhythm.
- Color: white on the entrance, blue flash for 1 frame on landing (`SuiPulse` reuse), then back to white. The blue flash on the asterisks specifically calls them out as the censor without making them permanently colored.

Alternate phrasings if `LOCK. THE. F***. IN.` does not land in the read-through (default stays the default, these are fallbacks only):

1. `LOCK. THE. F***. IN.` (default, the line)
2. `LOCK. IT. ALL. IN.` (same rhythm, no censor)
3. `LOCK. IN. AND. BUILD.` (action-oriented close)

Music: the word burst rides house off-beats during the second-drop continuation. `LOCK.` lands at frame 1740 (0:29), each subsequent word follows at 200 ms intervals (frames 1752, 1764, 1776). `IN.` holds across frame 1800 (0:30), giving 3 seconds of music carry to the final kick at frame 1980 (0:33). The wordmark + URL settle silently relative to the music, the kick at 0:33 is the audio punctuation on a visual that is already at rest.

### Scene 6, elegant CTA hold (0:33 to 0:35)

Pure `bg.base`. Wordmark center. `suiperpower.dev` below. Nothing else. Both elements already arrived during scene 5, this scene is just the calm two-second hold that closes the spot.

Build sequence:

1. **Frame 1980**, the last beat lands. Wordmark + URL are fully present. The kick is the audio confirmation that the spot has resolved.
2. **Frames 1980 to 2100**, hold. Subtle 1.00 to 1.02 scale on the wordmark + URL composition across 2 seconds.
3. **Frames 2076 to 2100**, music decay. Last 400 ms is the kick's natural tail fading to silence.
4. Last frame (2100) is the silent CTA, wordmark + URL on black. This frame is the YouTube thumbnail and the social screenshot.

The shape on screen at the close:

```
                    Suiperpower
                  suiperpower.dev
```

No curl command on this frame, no tag chip, no decorations. The install command lives only in scene 3 where it earns its place. The closing frame is the brand at rest. Elegant because everything else has gone quiet.


## Script copy, locked

Eight lines total. Do not rewrite without updating this section. Each line is bound to a primitive from the motion language. Treat the primitive column as load-bearing, swapping the line is fine, swapping the primitive changes the spot's feel.

| Beat | Line | Primitive | Detail |
|---|---|---|---|
| Opening hook | What if your agent had a superpower for Sui? | `CharPunch` (50 ms stagger) | `GhostTrail` + `SuiPulse` on the `s` of `superpower` + `TrackBreathe` settle, then `BrandPull` morph to `Suiperpower` |
| Hook tagline | Build on Sui. | `CharRise` | no settle pass |
| Expanded tagline | Build something meaningful, on Sui. | `WordSwap` insertion | inserts `something meaningful,` between `Build` and `on` |
| Install | `$ curl -fsSL suiperpower.dev/setup.sh \| bash` | `MonoType` | `CaretRun` |
| Annotation 1 | `/scaffold-project` | `MonoType` | left bar draws first |
| Annotation 2 | `intent.md written` | `CharRise` | left bar draws first |
| Annotation 3 | `build-plan.md written` | `CharRise` | left bar draws first |
| Word-burst 1 | `LOCK.` | `CharPunch` | full-frame, black bg, 200 ms beat |
| Word-burst 2 | `THE.` | `CharPunch` | bg `HardCut` to `accent.blue` |
| Word-burst 3 | `F***.` | `CharPunch` | bg `HardCut` to black, asterisks rendered at cap-mid baseline, blue flash on landing |
| Word-burst 4 | `IN.` | `CharPunch` | bg `HardCut` to `accent.blue`, `DropShadowPunch` on entrance, holds 400 ms |
| CTA wordmark | (the `Suiperpower` wordmark itself) | `CharRise` | settles centered after `SUI.` dissolves |
| CTA URL | `suiperpower.dev` | `CharRise` | below wordmark, `text.muted` |

No em-dashes, no emojis, no banned brand words (see `plans/15-BRAND.md`).

### Scene overlap rules

Acts glue together by overlapping exits and entrances by 30 to 60 frames. The motion language stays clean because:

- Exit of scene N runs on a separate `<Sequence>` layer from entrance of scene N+1.
- Easing is identical, so velocities match at the seam.
- Scene 1 has no internal cuts. The 4 s opening is one continuous shot held together by `CharPunch`, `BrandPull`, and the music's pre-drop tension.
- **Scene 1 to Scene 2 seam (frame 240, 0:04)** is the loudest seam: kick + `BrandPull` snap + bg blue flash all at once. The seam IS the drop.
- **Scene 2 to Scene 3 seam (frame 480, 0:08)** is mid-house, no special event, just a cued tag-chip arrival.
- **Scene 3 to Scene 4 seam (frame 900, 0:15)** is the music's break entry. The Claude Code frame fades in over a quieter section.
- **Scene 4 to Scene 5 seam (frame 1620, 0:27)** is a `HardCut` from Claude Code into pure black. The cut is the move, the music continues.
- **Scene 5 to Scene 6 seam (frame 1980, 0:33)** is the last beat landing on the wordmark + URL composition. The composition is already settled, the kick is the punctuation.

## Music direction

Single track, royalty-cleared. Brief for whoever scores or sources:

The track is house, 35 s, two drops, structure already locked. The notes below describe what the visual expects from each music section.

- **0:00 to 0:04, intro + buildup.** Clean pad swells, no drums. Tension builds toward the first drop. Visual: hook line builds, `Sui` glows, `BrandPull` initiates.
- **0:04, first beat drop.** Kick + house 4/4 hits. Visual: `BrandPull` snap completes, `Sui` lands inside `superpower`, bg flashes blue for 1 frame, audio one-shot accent fires simultaneously. The brand is born from the drop.
- **0:04 to 0:15, first house section.** Steady kick. Visual: brand hold + tagline expansion (scene 2), install moment (scene 3). The beat carries the energy through the install demo.
- **0:15 to 0:19, break / chops.** Drums drop out or chop, quieter section. Visual: Claude Code frame fades in calmly, slash command annotation appears. The quieter music gives the product capture room to be read.
- **0:19, second beat drop.** Visual: `intent.md written` annotation lands exactly on the kick.
- **0:19 to 0:27, second house section.** Steady kick continuation. Visual: `build-plan.md written` annotation, Claude Code hold + dim.
- **0:27 to 0:29, charged hold.** Music continues, visual is intentionally silent (pure black, no text). The contrast between loud music and empty frame is the loudest moment of the spot.
- **0:29 to 0:30, word-burst.** Four words on off-beats. `LOCK.` at 0:29, `THE.` at 0:29.2, `F***.` at 0:29.4, `IN.` at 0:29.6 holding 400 ms. The burst is a single bar of off-beat punctuation against the kick.
- **0:30 to 0:33, settle into the last beat.** Music continues four-on-the-floor toward the final kick. Visual: wordmark + URL emerge calmly. By 0:33 they are at rest.
- **0:33, last beat / kicks closing.** The final kick lands on the wordmark composition at full settle. This is the audio confirmation of the brand resolution.
- **0:33 to 0:35, tail.** The last kick decays naturally. Last 400 ms is silence. The closing frame is the silent CTA, wordmark + URL on black.

Reference vibe: Linear and Vercel launch videos. Not Apple-product-launch swell.

Source options, in priority order: original score, Artlist (`minimal electronic, cinematic`), Musicbed. Save the license file next to the audio asset in the repo.

## Asset checklist

Only two real captures. Everything else is motion graphics in Remotion.

1. **`suiperpower-pass` install render**
   - Resolution: capture at 1280 x 360 (the in-frame size) at native pixel density, or 2x and downscale.
   - Tool: `asciinema rec` + `agg` for clean conversion, or screen capture in a clean `zsh` with prompt set to `$ `.
   - Content: only the curl command, the pass ASCII, and a `ready.` line. Trim everything else.
   - Filename: `captures/install.mp4`. Muted. ~3 to 4 s usable.

2. **Claude Code session**
   - Resolution: capture at 1600 x 900 (the in-frame size) at 2x, downscale on import.
   - Pre-rehearse the prompt. Suggested: `scaffold a Sui Move object capability pattern for a kiosk-listing module`.
   - Hit the three annotation beats in order: slash command, `intent.md` appearing in the sidebar, `build-plan.md` appearing.
   - Total usable: 6 to 7 s. If real timing is too slow, capture each beat separately and stitch via `<Sequence>` in Remotion.
   - Filename: `captures/claudecode.mp4`. Muted.

Optional later: original score file as `audio/track.mp3` or `.wav`.

## Remotion implementation notes

One `<Composition>`, 1920 x 1080, 60 fps, 2100 frames (35 seconds). One file orchestrates six scene components. No nested compositions needed.

Suggested layout under `web/remotion/` (new, scoped to the website package):

```
web/remotion/
  src/
    Root.tsx
    LaunchVideo.tsx           // top-level sequence
    tokens.ts                 // colors, easings, durations from this doc
    util/ease.ts              // single interpolate helper
    scenes/
      OpeningHook.tsx         // scene 1, the Alt R hook + BrandPull morph
      BrandHold.tsx           // scene 2, tagline expansion
      InstallMoment.tsx       // scene 3
      ClaudeCodeMoment.tsx    // scene 4
      Outcome.tsx             // scene 5
      Cta.tsx                 // scene 6
    components/
      Frame.tsx               // 4 px radius surface, optional glow
      Annotation.tsx          // right-side blue-bar caption
      StatusPill.tsx          // outcome pill
      Wordmark.tsx            // suiperpower wordmark (also the target of BrandPull)
      TagChip.tsx             // monospace label chip (`[ install ]`, `[ build ]`, `[ ship ]`)
      ActionChip.tsx          // 32 px blue square with white icon, used in CTA
      DottedDivider.tsx       // optional, between wordmark and tagline
      type/
        CharPunch.tsx
        CharRise.tsx
        MonoType.tsx
        WordSwap.tsx
        BrandPull.tsx         // signature, scene 1 only
        TrackBreathe.tsx
  public/
    captures/install.mp4
    captures/claudecode.mp4
    audio/track.mp3
    fonts/TWKEverett-Regular.otf
    fonts/TWKEverett-Medium.otf
    fonts/TWKEverett-BoldItalic.otf
```

Font loading (Remotion-side):

```tsx
// In Root.tsx, before registering compositions
import { staticFile } from 'remotion';

const everett = new FontFace('TWK Everett', `url(${staticFile('fonts/TWKEverett-Medium.otf')})`, { weight: '500' });
await everett.load();
document.fonts.add(everett);
// Repeat for Regular and Bold Italic.
// JetBrains Mono loads via @remotion/google-fonts/JetBrainsMono.
```

Copy the three OTF files from `scratchpads/video/assets/` into `web/remotion/public/fonts/` during scaffold. Do not commit OTFs anywhere else, the fonts live in `public/` for the Remotion render only.

Tactical patterns, kept terse on purpose:

- Drive every scene with `<Sequence from={start} durationInFrames={length}>`. Do not chain off `useCurrentFrame` math, it gets brittle when you re-time.
- One `ease(frame, [startF, endF])` helper that returns 0 to 1 with the locked easing. Reuse everywhere.
- Scene 1 is the heaviest scene. Treat it as one big component that internally orchestrates `CharPunch`, `SuiPulse`, `TrackBreathe`, `BrandPull`, sentence collapse, and `CharRise` on the tagline. Do not split scene 1 across `<Sequence>` boundaries, the timing of `BrandPull` depends on knowing exact character positions on the hook line.
- `BrandPull` needs character positions. Either measure with a hidden span on mount and store in state, or hard-code the x offsets per character given the font metrics. Hard-coded is safer for deterministic renders.
- Install glow: a `<div>` behind the frame with `filter: blur(60px)` and `background: #2A8DFF33`. Box-shadow does not give the same soft halo.
- Captures: `<Video src={staticFile('captures/install.mp4')} startFrom={0} muted />` inside a `<Frame>` with `overflow: hidden`.
- Audio: a single `<Audio src={track} />` at root with the 35 s music bed. Plus a single `<Audio>` one-shot at frame 240 (`BrandPull` snap accent, doubled with the first beat drop). The track itself is the source of truth for the kick at 0:04, 0:19, and 0:33, do not add additional one-shots for those.
- Render command: `npx remotion render LaunchVideo out/launch.mp4 --codec h264 --crf 18`.

### Primitive implementation shapes

Pseudo-code per primitive. Build these as components under `components/type/` so any scene can pull them. All take `(text, startFrame, options)` and own their internal stagger.

`CharPunch`:

```tsx
// Per char: scale 1.35 -> 1.00, blur 8 -> 0, opacity 0 -> 1, over 140 ms
// Stagger 28 ms between chars
const charStart = startFrame + i * msToFrames(28);
const p = ease(frame, [charStart, charStart + msToFrames(140)]);
const scale = interpolate(p, [0, 1], [1.35, 1.00]);
const blur = interpolate(p, [0, 1], [8, 0]);
const opacity = p;
// transform-origin center, render as inline-block per char
```

`CharRise`:

```tsx
// Per char: y +28 -> 0, opacity 0 -> 1, over 380 ms
// Stagger 22 ms
const charStart = startFrame + i * msToFrames(22);
const p = ease(frame, [charStart, charStart + msToFrames(380)]);
const y = interpolate(p, [0, 1], [28, 0]);
const opacity = p;
```

`MonoType`:

```tsx
// Per char: appears instant, then 60 ms scale 1.15 -> 1.00 pulse
// 38 ms per char advance
const charStart = startFrame + i * msToFrames(38);
const visible = frame >= charStart;
const p = ease(frame, [charStart, charStart + msToFrames(60)]);
const scale = visible ? interpolate(p, [0, 1], [1.15, 1.00]) : 0;
const opacity = visible ? 1 : 0;
// Caret rides 1.3x ahead: caretFrame = startFrame + (i + 1) * msToFrames(29)
```

`WordSwap` (insertion variant, scene 2 tagline expansion):

```tsx
// Original: ['Build', 'on', 'Sui.'] -> Final: ['Build', 'something', 'meaningful,', 'on', 'Sui.']
// Phase 1 (0-200 ms): 'Build' shifts left 40px, 'on' and 'Sui.' shift right to make room
// Phase 2 (200-560 ms): inserted words 'something meaningful,' build via CharPunch in the gap
// Phase 3 (560-720 ms): line re-centers (positions snap to final layout)
const phase1 = ease(frame, [swapStart, swapStart + msToFrames(200)]);
const buildXOffset = interpolate(phase1, [0, 1], [0, -40]);
// inside Phase 2, each inserted char drives its own CharPunch starting at swapStart + msToFrames(200) + i * msToFrames(28)
```

`BrandPull` (signature, scene 1 only):

```tsx
// Source: x position of the 's' in 'superpower' on the hook line
// Target: x position of the leading edge of 'Sui' at end of sentence
// Phase 1 (0-200 ms): 2px accent.blue connector draws source -> target, left-to-right
//   width interpolates 0 -> (target.x - source.x), height fixed at 2px, vertical centered
// Phase 2 (200-280 ms): hold 4 frames
// Phase 3 (280-360 ms): connector snaps back, width interpolates back to 0 from the target end
//   while the 'Sui' glyph rides the trailing edge of the connector back toward the source
//   Sui scale 1.00 -> 0.92 along the path
//   The 's' of superpower simultaneously translates +14px right to open a slot for Sui
// Phase 4 (360-440 ms): connector dissolves, Sui glyph settles in the slot next to the s
//   Sui stays accent.blue, the rest of the wordmark stays white
//   Net effect: the word 'superpower' is now 'Suiperpower' in place

const p1 = ease(frame, [pullStart, pullStart + msToFrames(200)]);
const connectorWidth = interpolate(p1, [0, 1], [0, target.x - source.x]);

const p3 = ease(frame, [pullStart + msToFrames(280), pullStart + msToFrames(360)]);
const suiX = interpolate(p3, [0, 1], [target.x, source.x + sCharWidth]);
const suiScale = interpolate(p3, [0, 1], [1.00, 0.92]);
const sShift = interpolate(p3, [0, 1], [0, 14]);

const p4 = ease(frame, [pullStart + msToFrames(360), pullStart + msToFrames(440)]);
const connectorOpacity = 1 - p4;
const suiScaleSettle = interpolate(p4, [0, 1], [0.92, 1.00]);
```

`SuiPulse` (detail move, paired with CharPunch on scene 1):

```tsx
// On the frame the 's' of 'superpower' lands (CharPunch completes for that char),
// flash color accent.blue for exactly 1 frame, then return to text.primary
const charLandFrame = lineStart + charIndex_s * msToFrames(50) + msToFrames(140);
const color = frame === charLandFrame ? accent.blue : text.primary;
```

`TrackBreathe` (settle pass, layered on the container):

```tsx
// letter-spacing +14% -> 0% over 600 ms after the primitive completes
const p = ease(frame, [primitiveEndFrame, primitiveEndFrame + msToFrames(600)]);
const tracking = interpolate(p, [0, 1], [0.14, 0]); // em units
// apply as letterSpacing: `${tracking}em` on the line container
```

`LineLift` (exit):

```tsx
// Per word in reverse: y 0 -> -18, opacity 1 -> 0, x-blur 0 -> 4
// 360 ms, 50 ms reverse stagger
const totalWords = words.length;
const wordStart = exitFrame + (totalWords - 1 - i) * msToFrames(50);
const p = ease(frame, [wordStart, wordStart + msToFrames(360)]);
const y = interpolate(p, [0, 1], [0, -18]);
const opacity = 1 - p;
const xBlur = interpolate(p, [0, 1], [0, 4]);
// filter: `blur(${xBlur}px)` on the word span
```

`CaretRun` (decoration, paired with MonoType):

```tsx
// 2x24 px blue caret, rides ahead of MonoType, blinks twice at park, then dissolves
const advance = msToFrames(38) / 1.3; // 1.3x ahead
const caretX = (frame - startFrame) / advance * charWidth;
// after final char, lock X, blink 2x at 8-frame intervals, fade out
```

The detail moves (`GhostTrail`, `DropShadowPunch`, `UnderlineDraw`) wrap the primitive components and add a single CSS property each. Keep them as render-prop wrappers, not standalone primitives, so the spot stays under 600 lines per file.

## Variant cuts

Same source, gated sequences.

| Cut | Length | Sequences included |
|---|---|---|
| Teaser | 8.0 s | Scene 1 (opening hook + brand reveal) + CTA |
| Master | 35.0 s | All six scenes |
| Extended | 60.0 s | Master plus a sponsor integration beat between Claude Code and outcome (Walrus or DeepBook real session) |
| Square | 35.0 s | Master, 1080 x 1080 composition with re-centered content |

The teaser is slightly longer than before because scene 1 is the full hook now and runs 10 s on its own. Trim the wordmark hold at the end to land at 8 s, do not truncate the `BrandPull` morph.

The extended cut is post-launch. Plan the timeline for it, do not build it day one.

## Accessibility

- Captions burned in via a `<Captions>` overlay component that reads from a JSON track. Even with no voiceover, every on-screen line gets a caption track so the spot is intelligible muted on social.
- Caption styling: `text.primary` on a 70% `bg.surface` rectangle, 4 px radius, centered bottom 96 px from frame edge. Use `type.mono` not `type.body` for captions to match the tag-chip language already in the spot.
- Provide a `.srt` and a `.vtt` alongside the master mp4 for YouTube and direct hosting.
- No critical information conveyed by color alone (the success pills include the literal `ok` and `pinned` text).

## Decisions log

Record every locked decision here. If you change one, replace the row and date it.

| Decision | Why | Date |
|---|---|---|
| 35 s master, cut to the music | Originally 28 s on a hypothetical music bed. User has a real 35 s house track with two drops (0:04, 0:19) and a last kick (0:33). Re-paced every scene boundary to land on a music event. The cut is the music. | 2026-05-11 |
| `BrandPull` snap lands on first drop | Frame 240 = 0:04 = first kick. The brand reveal IS the drop. Maximum coordination of audio + visual + meaning. The hook line takes only 4 s now instead of 10, the compression makes the build feel like a real intro section rather than a slow tease. | 2026-05-11 |
| `intent.md` annotation lands on second drop | Frame 1140 = 0:19 = second kick. The single most important founder-mindset moment of the spot (writing intent before code) lands on the second drop. Eye and ear lock to the same instant. | 2026-05-11 |
| Wordmark + URL settle on the last beat | Frame 1980 = 0:33 = last kick. The composition is at rest when the kick lands. The kick is punctuation on the resolution, not a punch on motion. | 2026-05-11 |
| Silent visual hold across loud music in scene 5 | Frames 1620 to 1740 (0:27 to 0:29) is pure black, no text, while the music continues. Two seconds of visual silence against the loud beat is the loudest moment in the spot. Builds the maximum tension for the word burst that follows. | 2026-05-11 |
| One easing, ease-out-expo | Cohesion is the brand. Multiple eases read as a portfolio reel, not a product. | 2026-05-11 |
| No springs anywhere | The `CharPunch` scale 1.35 to 1.00 already has springy character through ease-out-expo. Layering a literal spring on one element broke the rule. Pure ease only is cleaner discipline. | 2026-05-11 |
| Two real captures, no more | Anything else competitors can fake with mockups. Install pass and Claude Code are load-bearing proof. | 2026-05-11 |
| No voiceover | Senior-friend voice on screen, not in narration. Voiceover dates fast and locks language. | 2026-05-11 |
| No emojis, no em-dashes | Project-wide brand rule. | 2026-05-11 |
| 60 fps not 30 | The text reveals and `BrandPull` snap need the headroom. File size is fine at CRF 18. | 2026-05-11 |
| Six typographic primitives | Flat does not mean static. Agency-grade lines need varied attack and decay. One easing curve plus six properties keeps cohesion while giving each line its own beat. | 2026-05-11 |
| `CharPunch` is the signature | Fast zoom-in lock reads as confident, not flashy, when scale stops cleanly at 1.00. Used on the opening hook and outcome line. | 2026-05-11 |
| Monospace and display share no primitives | Mixing them within a line collapses the rhythm. Monospace gets `MonoType` only, display gets the rest. | 2026-05-11 |
| Opening hook is one 10 s continuous shot, no internal cuts | The `BrandPull` morph depends on character positions on the hook line. Splitting across `<Sequence>` boundaries breaks timing and removes the inevitability of the morph. One scene, one component. | 2026-05-11 |
| The brand reveal IS the punchline, not a separate logo assembly | Old structure had three scenes of setup then a logo lands. New structure has the wordmark born from the sentence. Stronger payoff, no separate beat needed, video gets 4 s of room back for the brand hold and tagline expansion. | 2026-05-11 |
| Two-beat tagline (`Build on Sui.` then `Build something meaningful, on Sui.`) | The short version is the answer to the question. The long version is what the answer means. Structural rhyme makes the brand promise feel earned, not declared. | 2026-05-11 |
| Founder-mindset framing, not survival framing | Earlier draft pitched against hackathon project death. Reframe is that agents already know Sui, what they lack is founder instinct to ship. Wordplay carries the meaning, no preachy slop grid needed. | 2026-05-11 |
| sui.io palette + TWK Everett | True black (`#000000`), brighter blue (`#2A8DFF`), institutional rectangular composition. Earlier warm-near-black + Inter Tight read as generic startup. The Sui-matched palette makes the spot read as if it could live on sui.io itself. | 2026-05-11 |
| 4 px radius, not 8 | Sui.io uses near-zero radius on chips and small surfaces. The 8 px earlier was too soft. Locked at 4 px for surfaces, 0 px for tag chips. | 2026-05-11 |
| Tag-chip motif (`[ install ]`, `[ build ]`) | Sui.io uses monospace label chips above key sections to chapter the page. We adopt the same motif to chapter the video timeline. Tag chips give viewers a one-glance read of "where we are" without narration. | 2026-05-11 |
| Closing is a word-burst, not status pills | Earlier outcome was three success pills (`move build, ok` etc). Replaced with four-word punch (`LOCK. THE. F***. IN.`) with bg flipping black/blue every word. Way more energy, lands a builder-voice command rather than a checklist. Status pills moved out of the spot entirely. | 2026-05-11 |
| Censored asterisks, not the uncensored word, not no-censor | `F***` rendered literally on screen is the joke. Uncensored reads as edgy-for-edge's-sake, sanitized reads as soft. The asterisks are a self-aware wink that lets the spot keep its energy while staying shareable. The censor IS the punchline. | 2026-05-11 |
| Elegant black-only close, no install command on final frame | Final frame is wordmark + `suiperpower.dev` on pure black. The install command earned its place in scene 3, repeating it at the close diluted both moments. Closing on the brand alone reads as confidence. | 2026-05-11 |

## What would kill this video

Internal red team list. If you catch any of these in dailies, cut the take.

- A second easing curve sneaks in. The whole spot will feel like a portfolio reel.
- The opening hook line builds in under 1.8 s. Too fast, the morph that follows has nothing to morph from. Hold the line for the full 2.3 s.
- The install capture shows shell prompt customizations, oh-my-zsh themes, or any non-default chrome. Re-capture in a clean shell.
- The Claude Code capture shows a different prompt than the script implies. Annotation beats will drift.
- Music has a melodic hook that competes with the line copy. Pick ambient over melodic.
- A marketing word leaks in (`leverage`, `seamlessly`, `powerful`, `revolutionary`, `AI-powered`). Cut on sight.
- The CTA hold is shorter than 1.5 s. The frame must survive as a screenshot.
- Background motion during text beats. The lines must read silent first.

Typography-specific failures (these are the agency-grade discipline tests):

- `CharPunch` overshoots past 1.00 or bounces. Damping is wrong, the spot will read as toy-shop. Scale must hit 1.00 and stop, never undershoot then settle.
- `CharPunch` default stagger exceeds 32 ms per char. Lines stop reading as words and start reading as a roll-call. Keep under 30 ms. The opening hook is the deliberate exception at 50 ms, the dramatic pace earns the morph.
- `MonoType` and `CharPunch` appear in the same line. Mix is forbidden, monospace gets mechanical motion only.
- `TrackBreathe` runs longer than 700 ms or letter-spacing peaks above +16%. Either makes the line look broken.
- Annotations all use the same primitive. The variety between `MonoType` (slash command) and `CharRise` (file events) is what sells the rhythm. If they all use the same one, cut and re-time.
- `GhostTrail` appears on more than one line. The trail is a signature beat for the opening hook, repeating it makes both lines weaker.
- Blur on `CharPunch` exceeds 12 px at entrance. Reads as motion-blurred render, not as intent. Cap at 8 px.

`BrandPull` failure modes (scene 1's load-bearing move, watch this one closely):

- The connector draw is faster than 160 ms or slower than 240 ms. Too fast and the eye misses it, too slow and it feels like a loading bar. Lock at 200 ms.
- The connector snap-back velocity exceeds the draw velocity. Should feel like elastic returning, not whip-cracking. The whole snap phase is 80 ms, not less.
- `Sui` scales below 0.88 or above 0.96 during transit. Below 0.88 it pops, above 0.96 it doesn't read as compression. Hold 0.92 at the midpoint.
- The `s` shift to make room happens before the connector starts pulling. Sequence is: draw, hold, then snap (which is when the `s` shifts and `Sui` travels). Order matters or the slot-opening looks unmotivated.
- After `BrandPull`, the `Sui` glyph and the rest of `Suiperpower` are not perfectly kerned. They must read as one word, not as two glued together. Test by comparing to the final Wordmark component, kerning should match within 1 px.
- The `BrandPull` snap does not land on frame 240 (0:04, first drop). If the snap arrives even 4 frames early or late, the seam with the music is broken and the brand reveal feels accidental. This is the single most important sync point in the spot.

Scene-5-specific failures (word-burst close):

- Any word-burst lasts longer than 220 ms. The whole point is fast pace, 200 ms per word is the ceiling. Slower reads as a slideshow.
- The bg flip is animated instead of a `HardCut`. The flip must be exactly 1 frame. Easing the bg color over 100 ms kills the snap, the spot loses its punch.
- Blue bg appears under any word other than `THE.` and `IN.` Pattern is black / blue / black / blue, alternating. Breaking the pattern reads as random.
- `IN.` does not hold longer than the other three. The last word earns 400 ms not 200 ms. Equal hold flattens the landing.
- The wordmark fades in before `IN.` fully dissolves. Sequence: `IN.` opacity to 0 (200 ms), then wordmark `CharRise`s in. Overlapping reads as crossfade soup.
- Music kick misses the `LOCK.` frame by more than 2 frames. The whole scene is timed off that downbeat.
- The asterisks in `F***.` render at default superscript height instead of cap-mid. Reads as a tiny floating glyph rather than a censor. Always override the baseline, per the asterisk rendering details above.
- The censor swaps for the uncensored word or a sanitized version. Locked at `F***.` exactly. Both alternatives kill the joke.
- The closing two-second hold drifts the wordmark or URL. They are pinned center, only the subtle 1.00 to 1.02 scale moves. Anything else makes the close feel restless.

Scene-1-specific failures:

- `SuiPulse` is visible for longer than 1 frame. The pulse is supposed to be subliminal. Two frames at 60 fps reads as a glitch, not a tease.
- The sentence-collapse at frames 470 to 540 leaves any non-wordmark character visible past frame 540. Black bg + wordmark + tagline only by frame 540, no residue.
- The tagline `Build on Sui.` arrives before the wordmark settles. Wordmark first, tagline second, never overlapping their entrances.

## Build order

If you build the spot, do it in this order. Each step gates the next.

1. Lock the script copy in this doc (done above).
2. Capture `install.mp4` clean. Verify it lands in 3 to 4 s and reads at 1280 x 360.
3. Capture `claudecode.mp4` clean. Verify the three annotation beats are visible and timed loosely 1.5 to 2 s apart.
4. Scaffold `web/remotion/` per the layout above. Stub all six scenes with placeholder content, verify the 35 s (2100 frame) timeline renders end to end.
5. Build the typographic primitives library under `components/type/` first: `CharPunch`, `CharRise`, `MonoType`, `WordSwap`, `TrackBreathe`. Test each in isolation with a sample line.
6. Build `BrandPull` last in the primitives library. This is the hardest single component. Build it against a static hook line first, get the connector + snap + slot-opening working, then integrate.
7. Build scene 5 (outcome) and scene 6 (CTA). These are pure typography and validate the primitives library end to end.
8. Build scene 1 (opening hook). This is the heaviest scene, build it after the primitives are proven. Orchestrate `CharPunch`, `SuiPulse`, `TrackBreathe`, `BrandPull`, sentence collapse, `CharRise` in sequence.
9. Build scene 2 (brand hold + tagline expansion). Mostly a `WordSwap` insertion + hold.
10. Wire captures into scenes 3 and 4.
11. Drop in audio. Load the 35 s house track at root. Verify the first drop lands on frame 240, the second drop on frame 1140, the last beat on frame 1980. Drop the `BrandPull` snap accent as a one-shot at frame 240 (doubling the first drop). Re-time visuals to the music if any sync is off by more than 4 frames.
12. Burn captions, export master + square + teaser.
13. QA against the "what would kill this" list, with special focus on the `BrandPull` failure modes.

## Cross-references

- Brand voice and banned words: `plans/15-BRAND.md`.
- Launch sequencing this spot supports: `plans/17-LAUNCH-PLAN.md`.
- Install flow that the capture demonstrates: `plans/03-INSTALL-FLOW.md`.
- Anti-slop framing the thesis pulls from: `plans/12-ANTI-SLOP-FRAMEWORK.md`.
- Skill router the Claude Code capture exercises: `plans/23-SKILL-ROUTER-SPEC.md`.
