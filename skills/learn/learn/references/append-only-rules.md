# Append-only rules

`.suiperpower/learnings.md` is append-only. Prior entries are not edited or removed by the `learn` skill. Future skills (and future-you) rely on the full record being intact.

## Rules

1. **Never delete prior entries.** Every entry written by a prior session stays. Even if the entry turned out to be wrong, the historical record matters.

2. **Never rewrite prior bullets.** If a prior entry is now misleading, append a new entry that supersedes it and references the date being superseded. Example:

   ```markdown
   ## Learnings, 2026-05-15T10:04:22Z

   ### Decisions
   - reverse the 2026-05-12 decision to use Walrus for image storage; switching to a CDN; reason: aggregator latency too variable for the demo path.
   ```

3. **Always include a fresh timestamp at the top of the new entry.** Use ISO 8601 in UTC, e.g. `2026-05-11T15:42:01Z`. Match the timestamp format used in existing entries if the file already follows one.

4. **Use the canonical headers in order.** From `skills/data/specs/phase-handoff.md`:
   - `### What we tried`
   - `### What worked`
   - `### What did not work`
   - `### Open questions`
   - `### Decisions`

5. **Skip empty sections cleanly.** If a section has no bullets for this entry, write the header followed by `- (none)`. Do not omit the header; future scanners look for header continuity.

6. **Do not move bullets between sections.** A bullet in `What did not work` from a prior entry stays there even if the user later resolved the issue. The new entry can include the resolution under `What worked` or `Decisions`.

## Safe write procedure

1. Read the existing `.suiperpower/learnings.md` content.
2. If the file does not exist, create it with `# Learnings\n\n` as the file header.
3. Append the new entry, preserving any blank-line conventions already present.
4. Re-read the file and verify the prior content is unchanged byte-for-byte.

## Recovery if a prior entry is accidentally edited

1. Stop. Do not write further entries to this file in this session.
2. If the project is git-tracked and the file is committed, restore from the last commit: ask the user to run `git restore .suiperpower/learnings.md`.
3. If not committed, ask the user if they have a backup. The skill cannot recover deleted history on its own.
4. Once recovered, log the incident under `Open questions` in the next entry so the user knows the file was at risk.

## What this rule is NOT

- Not a ban on the user editing the file directly. The user owns the file. If they want to clean it up, they can. The skill's contract is that it does not destroy prior content.
- Not a versioning system. For deeper history, rely on git, not the file itself.
