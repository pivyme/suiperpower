import { mutation, query } from "./_generated/server.js";
import { v } from "convex/values";

// `suiperpower feedback` writes here. Skill-specific feedback may also flow
// from end-of-journey prompts. `contact` is optional and only present when
// the user explicitly opts in. No PII otherwise.
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

export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("feedback")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit ?? 50);
  },
});
