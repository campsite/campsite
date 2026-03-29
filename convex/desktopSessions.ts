import { v } from 'convex/values'

import { mutation } from './_generated/server'
import { generateToken, getViewerIdentity } from './workspace'

const DESKTOP_SESSION_GRANT_TTL_MS = 10 * 60 * 1000

function createError(code: string, message: string) {
  return new Error(`${code}:${message}`)
}

export const createDesktopSessionGrant = mutation({
  args: {
    accessToken: v.string(),
    refreshToken: v.string(),
    userJson: v.string(),
    impersonatorJson: v.optional(v.string()),
    returnTo: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await getViewerIdentity(ctx)
    const now = Date.now()
    const grantId = `desktop_${generateToken()}`

    await ctx.db.insert('desktopSessionGrants', {
      publicId: grantId,
      userTokenIdentifier: identity.tokenIdentifier,
      accessToken: args.accessToken,
      refreshToken: args.refreshToken,
      userJson: args.userJson,
      impersonatorJson: args.impersonatorJson,
      returnTo: args.returnTo,
      expiresAt: now + DESKTOP_SESSION_GRANT_TTL_MS,
      createdAt: now
    })

    return {
      grantId,
      expiresAt: now + DESKTOP_SESSION_GRANT_TTL_MS
    }
  }
})

export const redeemDesktopSessionGrant = mutation({
  args: {
    grantId: v.string()
  },
  handler: async (ctx, args) => {
    const grant = await ctx.db
      .query('desktopSessionGrants')
      .withIndex('by_public_id', (query) => query.eq('publicId', args.grantId))
      .unique()

    if (!grant || grant.consumedAt || grant.expiresAt <= Date.now()) {
      throw createError('unauthorized', 'Invalid desktop session grant')
    }

    await ctx.db.patch(grant._id, {
      consumedAt: Date.now()
    })

    return {
      accessToken: grant.accessToken,
      refreshToken: grant.refreshToken,
      userJson: grant.userJson,
      impersonatorJson: grant.impersonatorJson,
      returnTo: grant.returnTo ?? null
    }
  }
})
