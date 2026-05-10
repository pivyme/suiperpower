# Loudness targets

Use a meter. "It sounds about right" is not a loudness measurement.

## Per-channel targets

| Channel | Integrated LUFS | True peak | Notes |
| --- | --- | --- | --- |
| YouTube (long form) | -14 | -1.0 dBTP | YouTube normalizes louder content down |
| YouTube Shorts | -14 | -1.0 dBTP | Same target as long form |
| Twitter / X | -16 | -1.5 dBTP | Slightly quieter to handle aggressive normalization |
| Landing page (web) | -16 to -14 | -1.0 dBTP | Match the rest of the page audio |
| Judges submission (deepsurge) | -16 | -1.5 dBTP | Conservative to handle review playback |

## How to measure

- Use a free LUFS meter: ffmpeg's `ebur128` filter, Loudness Meter inside DaVinci Resolve, or a standalone tool.
- Measure the integrated LUFS over the full video, not a single moment.
- Measure true peak with a true-peak limiter, not just sample peak.

## Common issues and fixes

### Voiceover too quiet relative to music

- Symptom: viewer turns up volume to hear the voice and gets blasted by music in the next cut.
- Fix: duck the music under the voice by 6 to 9 dB. Use sidechain compression or manual keyframes.

### Loudness varies between cuts

- Symptom: one cut is at -16 LUFS, the next is at -10 LUFS.
- Fix: normalize each clip to the target before mixing, then re-measure the integrated value across the full video.

### Hard plosives or sibilance

- Symptom: "p" and "b" sounds pop, "s" sounds hiss.
- Fix: high-pass at 80 to 100 Hz, de-esser with a 5 to 8 kHz target, or re-record the offending phrases.

### Compression artifact whoosh

- Symptom: aggressive compression makes the voice "pump".
- Fix: lower the ratio (3:1 instead of 6:1), raise the threshold, or use a slower attack.
