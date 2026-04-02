import { v } from 'convex/values'

import { mutation, query } from './_generated/server'

export const createUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not signed in')
    }

    return await ctx.storage.generateUploadUrl()
  }
})

export const saveUpload = mutation({
  args: {
    contentType: v.optional(v.string()),
    name: v.string(),
    size: v.optional(v.number()),
    storageId: v.id('_storage')
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      throw new Error('Not signed in')
    }

    const id = await ctx.db.insert('files', {
      contentType: args.contentType,
      createdAt: Date.now(),
      name: args.name,
      ownerTokenIdentifier: identity.tokenIdentifier,
      size: args.size,
      storageId: args.storageId
    })

    const url = await ctx.storage.getUrl(args.storageId)

    if (!url) {
      throw new Error('Upload could not be resolved')
    }

    return {
      id,
      key: url,
      url
    }
  }
})

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      return []
    }

    const files = await ctx.db
      .query('files')
      .withIndex('by_owner', (q) => q.eq('ownerTokenIdentifier', identity.tokenIdentifier))
      .order('desc')
      .collect()

    return await Promise.all(
      files.map(async (file) => ({
        ...file,
        url: await ctx.storage.getUrl(file.storageId)
      }))
    )
  }
})
