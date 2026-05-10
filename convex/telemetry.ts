import { mutation, query } from "./_generated/server.js";
import { v } from "convex/values";

const EVENT_VALUES = ["started", "completed", "failed", "aborted"] as const;
type Event = (typeof EVENT_VALUES)[number];

function toEvent(status: string): Event {
  return (EVENT_VALUES as readonly string[]).includes(status)
    ? (status as Event)
    : "completed";
}

// Skill preambles + CLI commands write here. Input field is `status` (matches
// the wire format every SKILL.md preamble sends), persisted as the `event`
// literal column with the raw string echoed in `status` for older readers.
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
      event: toEvent(args.status),
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

export const recentBySkill = query({
  args: { skill: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("telemetry")
      .withIndex("by_skill", (q) => q.eq("skill", args.skill))
      .order("desc")
      .take(args.limit ?? 50);
  },
});

export const recentByTimestamp = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("telemetry")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit ?? 100);
  },
});
