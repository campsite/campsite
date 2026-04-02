import { v } from 'convex/values'

import { internalMutation, internalQuery } from './_generated/server'

type AttachmentSubjectType = 'Post' | 'Comment' | 'Note' | 'Message' | 'Call'
type ViewSubjectType = 'Note' | 'Post' | 'Project'

type AttachmentInput = {
  organizationId: any
  subjectType: AttachmentSubjectType
  subjectId: string
  publicId: string
  filePath: string
  fileType: string
  previewFilePath?: string | null
  name?: string | null
  size?: number | null
  width?: number
  height?: number
  duration?: number
  galleryId?: string | null
  noVideoTrack?: boolean
  position: number
}

export async function listSubjectAttachments(
  ctx: any,
  args: {
    subjectType: AttachmentSubjectType
    subjectId: string
  }
) {
  return (
    await ctx.db
      .query('attachments')
      .withIndex('by_subject_and_position', (query: any) =>
        query.eq('subjectType', args.subjectType).eq('subjectId', args.subjectId)
      )
      .collect()
  ).filter((attachment: any) => !attachment.discardedAt)
}

export const listSubjectAttachmentsInternal = internalQuery({
  args: {
    subjectType: v.union(
      v.literal('Post'),
      v.literal('Comment'),
      v.literal('Note'),
      v.literal('Message'),
      v.literal('Call')
    ),
    subjectId: v.string()
  },
  handler: async (ctx, args) => {
    return await listSubjectAttachments(ctx, args)
  }
})

export async function createSubjectAttachment(ctx: any, args: AttachmentInput) {
  const existing = await listSubjectAttachments(ctx, {
    subjectType: args.subjectType,
    subjectId: args.subjectId
  })

  for (const attachment of existing) {
    if (attachment.position >= args.position) {
      await ctx.db.patch(attachment._id, {
        position: attachment.position + 1,
        updatedAt: Date.now()
      })
    }
  }

  const createdAt = Date.now()

  const attachmentId = await ctx.db.insert('attachments', {
    organizationId: args.organizationId,
    publicId: args.publicId,
    subjectType: args.subjectType,
    subjectId: args.subjectId,
    filePath: args.filePath,
    fileType: args.fileType,
    previewFilePath: args.previewFilePath ?? undefined,
    name: args.name ?? undefined,
    size: args.size ?? undefined,
    width: args.width,
    height: args.height,
    duration: args.duration,
    galleryId: args.galleryId ?? undefined,
    noVideoTrack: args.noVideoTrack,
    position: args.position,
    createdAt,
    updatedAt: createdAt
  })

  return await ctx.db.get(attachmentId)
}

export const createSubjectAttachmentInternal = internalMutation({
  args: {
    organizationId: v.id('organizations'),
    subjectType: v.union(
      v.literal('Post'),
      v.literal('Comment'),
      v.literal('Note'),
      v.literal('Message'),
      v.literal('Call')
    ),
    subjectId: v.string(),
    publicId: v.string(),
    filePath: v.string(),
    fileType: v.string(),
    previewFilePath: v.optional(v.union(v.string(), v.null())),
    name: v.optional(v.union(v.string(), v.null())),
    size: v.optional(v.union(v.number(), v.null())),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    duration: v.optional(v.number()),
    galleryId: v.optional(v.union(v.string(), v.null())),
    noVideoTrack: v.optional(v.boolean()),
    position: v.number()
  },
  handler: async (ctx, args) => {
    return await createSubjectAttachment(ctx, args)
  }
})

export async function listSubjectViews(
  ctx: any,
  args: {
    subjectType: ViewSubjectType
    subjectId: string
  }
) {
  return await ctx.db
    .query('subjectViews')
    .withIndex('by_subject', (query: any) =>
      query.eq('subjectType', args.subjectType).eq('subjectId', args.subjectId)
    )
    .collect()
}

export const listSubjectViewsInternal = internalQuery({
  args: {
    subjectType: v.union(v.literal('Note'), v.literal('Post'), v.literal('Project')),
    subjectId: v.string()
  },
  handler: async (ctx, args) => {
    return await listSubjectViews(ctx, args)
  }
})

export async function upsertSubjectView(
  ctx: any,
  args: {
    organizationId: any
    subjectType: ViewSubjectType
    subjectId: string
    userTokenIdentifier: string
  }
) {
  const existing = await ctx.db
    .query('subjectViews')
    .withIndex('by_subject_and_user', (query: any) =>
      query
        .eq('subjectType', args.subjectType)
        .eq('subjectId', args.subjectId)
        .eq('userTokenIdentifier', args.userTokenIdentifier)
    )
    .unique()

  const now = Date.now()

  if (existing) {
    await ctx.db.patch(existing._id, {
      updatedAt: now
    })

    return await ctx.db.get(existing._id)
  }

  const viewId = await ctx.db.insert('subjectViews', {
    organizationId: args.organizationId,
    subjectType: args.subjectType,
    subjectId: args.subjectId,
    userTokenIdentifier: args.userTokenIdentifier,
    createdAt: now,
    updatedAt: now
  })

  return await ctx.db.get(viewId)
}

export const upsertSubjectViewInternal = internalMutation({
  args: {
    organizationId: v.id('organizations'),
    subjectType: v.union(v.literal('Note'), v.literal('Post'), v.literal('Project')),
    subjectId: v.string(),
    userTokenIdentifier: v.string()
  },
  handler: async (ctx, args) => {
    return await upsertSubjectView(ctx, args)
  }
})
