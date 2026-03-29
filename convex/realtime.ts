import { v } from 'convex/values'

import { mutation } from './_generated/server'

function normalizeLogTimestamp(value: number | undefined, fallback: number) {
  if (!value || !Number.isFinite(value)) {
    return fallback
  }

  if (value > 1_000_000_000_000) {
    return Math.round(value)
  }

  return Math.round(value * 1000)
}

export const recordLegacyProductLogs = mutation({
  args: {
    events: v.array(
      v.object({
        userId: v.optional(v.string()),
        orgSlug: v.optional(v.string()),
        name: v.string(),
        dataJson: v.optional(v.string()),
        logTs: v.optional(v.number()),
        sessionId: v.optional(v.string())
      })
    ),
    metadataJson: v.optional(v.string()),
    userAgent: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()
    const now = Date.now()

    await Promise.all(
      args.events.map((event) =>
        ctx.db.insert('productLogs', {
          userTokenIdentifier: identity?.tokenIdentifier,
          orgSlug: event.orgSlug,
          name: event.name,
          dataJson: event.dataJson,
          logTs: normalizeLogTimestamp(event.logTs, now),
          sessionId: event.sessionId,
          userAgent: args.userAgent,
          metadataJson: args.metadataJson,
          createdAt: now
        })
      )
    )

    return {}
  }
})

export const storeLegacyPushSubscription = mutation({
  args: {
    oldEndpoint: v.optional(v.union(v.string(), v.null())),
    newEndpoint: v.string(),
    p256dh: v.string(),
    auth: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error('unauthorized: Sign in required')
    }

    const candidates = [args.oldEndpoint ?? null, args.newEndpoint].filter(Boolean) as string[]
    let subscription = null

    for (const endpoint of candidates) {
      subscription = await ctx.db
        .query('pushSubscriptions')
        .withIndex('by_endpoint', (q: any) => q.eq('endpoint', endpoint))
        .unique()

      if (subscription) {
        break
      }
    }

    const now = Date.now()

    if (subscription) {
      await ctx.db.patch(subscription._id, {
        endpoint: args.newEndpoint,
        p256dh: args.p256dh,
        auth: args.auth,
        updatedAt: now
      })
    } else {
      await ctx.db.insert('pushSubscriptions', {
        userTokenIdentifier: identity.tokenIdentifier,
        endpoint: args.newEndpoint,
        p256dh: args.p256dh,
        auth: args.auth,
        createdAt: now,
        updatedAt: now
      })
    }

    return {}
  }
})
