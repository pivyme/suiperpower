# 13. Convex backend

## Why Convex

- Zero-ops, real-time, generous free tier.
- Single function-call deploy (`npx convex deploy`).
- Same backend pattern as solana-new, validated path.
- We do not need anything Convex does not do (no SQL joins, no complex indexes, no auth flows beyond opt-in telemetry).

## Tables

Two tables. Both write-heavy, read-rare (we read only for our own dashboards, never on the user critical path).

### `telemetry`

```typescript
export default defineSchema({
  telemetry: defineTable({
    skill: v.string(),
    phase: v.string(),               // learn | idea | build | ship | grow | cli
    event: v.union(
      v.literal("started"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("aborted"),
    ),
    durationMs: v.optional(v.number()),
    status: v.optional(v.string()),  // success | error | aborted
    version: v.string(),             // suiperpower CLI version
    platform: v.string(),            // e.g. "Darwin-arm64", "Linux-x86_64"
    tier: v.string(),                // anonymous | community
    category: v.optional(v.string()),// only if tier = community (e.g. "DeFi builder")
    timestamp: v.number(),           // ms since epoch
  }).index("by_skill", ["skill"])
    .index("by_timestamp", ["timestamp"]),
});
```

### `feedback`

```typescript
export default defineSchema({
  feedback: defineTable({
    skill: v.optional(v.string()),   // if feedback is skill-specific
    rating: v.optional(v.number()),  // 1-5, optional
    text: v.string(),                // free-form, no PII expected
    contact: v.optional(v.string()), // email, optional, only if user opts in
    version: v.string(),
    platform: v.string(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),
});
```

## Mutations

### `telemetry:track`

```typescript
export const track = mutation({
  args: {
    skill: v.string(),
    phase: v.string(),
    status: v.string(),
    durationMs: v.optional(v.number()),
    version: v.string(),
    platform: v.string(),
    timestamp: v.number(),
    tier: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("telemetry", {
      skill: args.skill,
      phase: args.phase,
      event: args.status as any,
      durationMs: args.durationMs,
      status: args.status,
      version: args.version,
      platform: args.platform,
      tier: args.tier ?? "anonymous",
      category: args.category,
      timestamp: args.timestamp,
    });
  },
});
```

Called by:

- Skill bash preamble (start event)
- Skill quality gate at end (complete / fail event)
- CLI command wrappers (init, doctor, search, etc.)

Failures (Convex unreachable, network down) buffer to `~/.suiperpower/telemetry.jsonl` and are flushed on next CLI invocation.

### `feedback:submit`

```typescript
export const submit = mutation({
  args: {
    skill: v.optional(v.string()),
    rating: v.optional(v.number()),
    text: v.string(),
    contact: v.optional(v.string()),
    version: v.string(),
    platform: v.string(),
    timestamp: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("feedback", { ...args });
  },
});
```

Called by:

- `suiperpower feedback` CLI command
- End-of-journey prompt in some skills (optional, never auto-submitted)

## Tier model

Three tiers, set in `~/.suiperpower/config.json`:

| Tier | Sent | Why |
|---|---|---|
| `off` | Nothing. Local jsonl still written for the user's own logs. | Privacy-max. User wants no network calls. |
| `anonymous` (default after install if user opts in) | Skill name, phase, status, duration, version, platform string. No PII. | Lets us improve the tool without identifying users. |
| `community` | Anonymous fields plus a self-declared category (e.g. "DeFi builder", "first-timer", "EVM migrant"). | Lets the catalog prioritize what the active community uses. |

Default behavior: `anonymous` if the user opts in during install or first skill use. `off` if they explicitly choose it.

## What is NEVER sent

- File paths
- File contents
- User-typed prompts
- Wallet addresses or any chain-side data
- IP addresses (Convex sees them at the edge, but we do not store them)
- Project names
- Email or contact info (unless explicitly provided in `feedback:submit` with `contact:`)

This is documented prominently in:

- The README
- The install script's telemetry-opt-in prompt
- Every skill's preamble opt-in prompt
- This plan doc

## Schema evolution policy

Adding a column: safe, default optional.
Removing a column: deprecate first, drop after one minor version.
Renaming a column: never, add new + deprecate old.

Convex's schema validation will reject invalid mutations, so we cannot ship a CLI that writes a column the schema does not have. CI runs `npx convex run --dry` against a sample event to catch this.

## Auth

Convex deployment URL is publicly known (it is in `cli/branding.ts` and on the website). The mutation endpoint is open by design (anonymous telemetry). No user can read the data, only insert. We use Convex's default rate-limiting + abuse protections.

If abuse becomes a real problem (someone spamming our table), we add:

- A simple HMAC of `(skill, timestamp, version)` with a rotated secret embedded in the CLI build. Not strong auth, but raises the cost.
- Convex function-side rate limit per IP.

Not in v1, accepted risk.

## Self-hosting

For users / orgs who want to fork suiperpower and point telemetry at their own Convex instance, the `convexUrl` field in `config.json` is overridable. `suiperpower init --convex-url <url>` writes it.

For a hard-airgap install, set `telemetryTier: "off"` and the CLI never attempts a network call.

## Dashboard (post-v1)

Convex provides a query interface. We will build a small read-only dashboard at `suiperpower.dev/stats` showing:

- Skills used in the last 30 days (top 10)
- New installs per day (rough, bounded by tier=anonymous coverage)
- Median journey duration (`find-next-sui-idea` to `submit-to-sui-overflow`)

All counts only, no individual user data. Not in v1 (ship the launch first), v1.1.

## Cost model

Convex free tier: 1M function calls / month, 500MB storage, 1GB bandwidth.

Estimate for v1 launch (rough):

- 1000 active users
- 10 skill invocations / user / week
- = 40k events / week, 160k / month
- Well within free tier

If we exceed free tier, Convex pricing is per 1M function calls. Predictable, low.

## Disaster recovery

Convex handles backups. We export schema + a sample data dump weekly via `npx convex export` to a private bucket. Recovery target: under 1 hour to restore a wiped dataset.

## Privacy posture (user-facing)

The README and the install script include this verbatim:

> Telemetry is opt-in, anonymous by default. We track which skills get used and how long they take. No code, no file paths, no PII. Change anytime in `~/.suiperpower/config.json`. Source: github.com/<your-handle>/suiperpower/blob/main/convex/telemetry.ts

The Convex source is public so anyone can audit exactly what is sent.

## Convex deployment ownership

Owned by the Suiperpower maintainer (TBD, see `19-OPEN-QUESTIONS.md`). Convex project under that account. Forks change `convexUrl` in `branding.ts` to point at their own.

## What about not having a backend at all?

Considered. Rejected because:

- We want to know which skills are actually used, to prioritize maintenance.
- Feedback channel needs an endpoint (vs. asking everyone to open a GitHub issue).
- The opt-in / anonymous model is well-established by solana-new, users have no objection.

If a future maintainer wants a no-backend version: set `telemetryTier: "off"` as default and remove the Convex client dependency. The product still works.
