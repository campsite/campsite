import { mutation, query } from './_generated/server'
import { seedUserPreferences } from './accountShell'
import { fallbackName, fallbackUsername, getViewerIdentity, resolveViewerProfile, defaultPreferences } from './workspace'

export const viewer = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      return null
    }

    const profile = await ctx.db
      .query('users')
      .withIndex('by_token_identifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique()

    return {
      identity: {
        email: identity.email ?? null,
        name: identity.name ?? identity.nickname ?? identity.preferredUsername ?? null,
        subject: identity.subject,
        tokenIdentifier: identity.tokenIdentifier
      },
      profile
    }
  }
})

export const syncViewer = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await getViewerIdentity(ctx)
    const profile = resolveViewerProfile(identity)

    const existing = await ctx.db
      .query('users')
      .withIndex('by_token_identifier', (q) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique()

    const fields = {
      displayName: fallbackName(profile),
      subject: profile.subject,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      name: profile.name,
      nickname: profile.nickname,
      preferences: existing?.preferences || defaultPreferences,
      preferredUsername: profile.preferredUsername,
      username: fallbackUsername(profile),
      lastSeenAt: Date.now()
    }

    if (existing) {
      await ctx.db.patch(existing._id, { ...fields, updatedAt: Date.now() })
      await seedUserPreferences(ctx, { ...existing, ...fields }, defaultPreferences)
      return await ctx.db.get(existing._id)
    }

    const userId = await ctx.db.insert('users', {
      ...fields,
      createdAt: Date.now(),
      publicId: fallbackUsername(profile).slice(0, 12),
      updatedAt: Date.now(),
      tokenIdentifier: profile.tokenIdentifier
    })
    await seedUserPreferences(ctx, { _id: userId, ...fields }, defaultPreferences)

    return await ctx.db.get(userId)
  }
})
