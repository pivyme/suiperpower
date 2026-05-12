import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Telemetry + feedback only.
// No PII, no file paths, no prompts. Privacy posture documented in
// the README and every skill's preamble.
export default defineSchema({
  telemetry: defineTable({
    skill: v.string(),
    phase: v.string(), // learn | idea | build | ship | grow | cli
    event: v.union(
      v.literal("started"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("aborted"),
    ),
    durationMs: v.optional(v.number()),
    status: v.optional(v.string()),
    version: v.string(),
    platform: v.string(),
    tier: v.string(), // off | anonymous | community
    category: v.optional(v.string()), // only when tier = community
    timestamp: v.number(),
  })
    .index("by_skill", ["skill"])
    .index("by_timestamp", ["timestamp"]),

  feedback: defineTable({
    skill: v.optional(v.string()),
    rating: v.optional(v.number()),
    text: v.string(),
    contact: v.optional(v.string()),
    version: v.string(),
    platform: v.string(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),
});
