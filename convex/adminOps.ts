import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { buildLegacyMediaUrl } from './legacy'
import { buildWorkspaceState, generateToken } from './workspace'

function createError(code: string, message: string) {
  return new Error(`${code}:${message}`)
}

function stableInvocationKey(prompt: string) {
  let hash = 0

  for (let index = 0; index < prompt.length; index += 1) {
    hash = (hash * 31 + prompt.charCodeAt(index)) >>> 0
  }

  return hash.toString(16).padStart(8, '0')
}

async function getOrganizationContext(ctx: any, slug: string) {
  const state = await buildWorkspaceState(ctx)
  const membershipEntry = state.memberships.find((entry: any) => entry.organization?.slug === slug)

  if (!membershipEntry?.organization || !membershipEntry.membership || membershipEntry.membership.discardedAt) {
    return null
  }

  return {
    ...state,
    organization: membershipEntry.organization,
    viewerMembership: membershipEntry.membership
  }
}

async function getProjectByPublicId(ctx: any, organizationId: any, projectId: string) {
  const project = await ctx.db.get(projectId)

  if (!project || project.organizationId !== organizationId || project.archivedAt) {
    return null
  }

  return project
}

async function getUserByTokenIdentifier(ctx: any, tokenIdentifier: string) {
  return await ctx.db
    .query('users')
    .withIndex('by_token_identifier', (q: any) => q.eq('tokenIdentifier', tokenIdentifier))
    .unique()
}

async function ensureOpsEvent(
  ctx: any,
  params: {
    organizationId?: any
    actorType?: string
    actorId?: string
    subjectType: string
    subjectId: string
    action: string
    metadata?: Record<string, unknown>
    skipNotifications?: boolean
  }
) {
  const now = Date.now()

  await ctx.db.insert('events', {
    organizationId: params.organizationId,
    publicId: generateToken().slice(0, 12),
    actorType: params.actorType,
    actorId: params.actorId,
    subjectType: params.subjectType,
    subjectId: params.subjectId,
    action: params.action,
    metadataJson: params.metadata ? JSON.stringify(params.metadata) : undefined,
    processedAt: undefined,
    skipNotifications: !!params.skipNotifications,
    createdAt: now,
    updatedAt: now
  })
}

async function insertExportResource(
  ctx: any,
  dataExportId: any,
  resourceType: string,
  resourceId?: string,
  resourcePublicId?: string,
  resourceName?: string
) {
  const now = Date.now()

  const existing = await ctx.db
    .query('dataExportResources')
    .withIndex('by_data_export_id', (q: any) => q.eq('dataExportId', dataExportId))
    .collect()

  if (
    existing.some(
      (row: any) =>
        row.resourceType === resourceType &&
        row.resourceId === resourceId &&
        row.resourcePublicId === resourcePublicId
    )
  ) {
    return
  }

  await ctx.db.insert('dataExportResources', {
    dataExportId,
    resourceType,
    resourceId,
    resourcePublicId,
    resourceName,
    status: 'pending',
    completedAt: undefined,
    createdAt: now,
    updatedAt: now
  })
}

async function upsertFlipperFeatureRecord(ctx: any, key: string) {
  const existing = await ctx.db
    .query('flipperFeatures')
    .withIndex('by_key', (q: any) => q.eq('key', key))
    .unique()

  const now = Date.now()

  if (existing) {
    await ctx.db.patch(existing._id, { updatedAt: now })
    return existing._id
  }

  return await ctx.db.insert('flipperFeatures', {
    key,
    createdAt: now,
    updatedAt: now
  })
}

async function queueProjectResources(ctx: any, dataExportId: any, project: any) {
  await insertExportResource(ctx, dataExportId, 'project', project._id, project._id, project.name)

  const [posts, notes, calls] = await Promise.all([
    ctx.db
      .query('posts')
      .withIndex('by_organization_id', (q: any) => q.eq('organizationId', project.organizationId))
      .collect(),
    ctx.db
      .query('notes')
      .withIndex('by_project_id', (q: any) => q.eq('projectId', project._id))
      .collect(),
    ctx.db
      .query('calls')
      .withIndex('by_project_id', (q: any) => q.eq('projectId', project._id))
      .collect()
  ])

  const projectPosts = posts.filter((post: any) => post.projectId === project._id && post.publishedAt && !post.draft)

  for (const post of projectPosts) {
    await insertExportResource(ctx, dataExportId, 'post', post._id, undefined, post.title)
    await queueAttachmentResources(ctx, dataExportId, 'Post', post._id)
    await queueCommentAttachmentResources(ctx, dataExportId, post._id)
  }

  for (const note of notes.filter((row: any) => !row.discardedAt)) {
    await insertExportResource(ctx, dataExportId, 'note', note._id, note.publicId, note.title)
    await queueAttachmentResources(ctx, dataExportId, 'Note', note._id)
  }

  for (const call of calls) {
    await insertExportResource(ctx, dataExportId, 'call', call._id, call.publicId, call.title ?? 'Call')
    await queueRecordingResources(ctx, dataExportId, call._id)
  }
}

async function queueAttachmentResources(ctx: any, dataExportId: any, subjectType: 'Post' | 'Comment' | 'Note' | 'Call', subjectId: string) {
  const attachments = await ctx.db
    .query('attachments')
    .withIndex('by_subject', (q: any) => q.eq('subjectType', subjectType).eq('subjectId', subjectId))
    .collect()

  for (const attachment of attachments.filter((row: any) => !row.discardedAt)) {
    await insertExportResource(ctx, dataExportId, 'attachment', attachment._id, attachment.publicId, attachment.name)
  }
}

async function queueCommentAttachmentResources(ctx: any, dataExportId: any, postId: any) {
  const comments = await ctx.db
    .query('comments')
    .withIndex('by_post_id', (q: any) => q.eq('postId', postId))
    .collect()

  for (const comment of comments) {
    await queueAttachmentResources(ctx, dataExportId, 'Comment', comment._id)
  }
}

async function queueRecordingResources(ctx: any, dataExportId: any, callId: any) {
  const recordings = await ctx.db
    .query('callRecordings')
    .withIndex('by_call_id', (q: any) => q.eq('callId', callId))
    .collect()

  for (const recording of recordings) {
    await insertExportResource(
      ctx,
      dataExportId,
      'call_recording',
      recording._id,
      recording.publicId,
      recording.filePath?.split('/').pop() ?? recording.publicId
    )
  }
}

async function createDataExportRecord(
  ctx: any,
  params: {
    organization: any
    viewerMembership: any
    requesterTokenIdentifier: string
    subjectType: 'Organization' | 'OrganizationMembership' | 'Project'
    subjectId: string
    subjectName?: string
  }
) {
  const now = Date.now()
  const dataExportId = await ctx.db.insert('dataExports', {
    organizationId: params.organization._id,
    publicId: generateToken().slice(0, 12),
    subjectType: params.subjectType,
    subjectId: params.subjectId,
    subjectName: params.subjectName,
    organizationMembershipId: params.viewerMembership._id,
    requesterTokenIdentifier: params.requesterTokenIdentifier,
    zipPath: undefined,
    downloadUrl: undefined,
    status: 'pending',
    completedAt: undefined,
    createdAt: now,
    updatedAt: now
  })

  await ensureOpsEvent(ctx, {
    organizationId: params.organization._id,
    actorType: 'OrganizationMembership',
    actorId: params.viewerMembership._id,
    subjectType: 'DataExport',
    subjectId: dataExportId,
    action: 'created',
    metadata: {
      subject_type: params.subjectType,
      subject_id: params.subjectId
    },
    skipNotifications: true
  })

  return { _id: dataExportId, publicId: (await ctx.db.get(dataExportId))?.publicId }
}

export const createLegacyOrganizationDataExport = mutation({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const exportRecord = await createDataExportRecord(ctx, {
      organization: context.organization,
      viewerMembership: context.viewerMembership,
      requesterTokenIdentifier: context.identity.tokenIdentifier,
      subjectType: 'Organization',
      subjectId: context.organization._id,
      subjectName: context.organization.name
    })

    await insertExportResource(ctx, exportRecord._id, 'users', context.organization._id, context.organization.publicId, 'Users')

    const projects = await ctx.db
      .query('projects')
      .withIndex('by_organization_id', (q: any) => q.eq('organizationId', context.organization._id))
      .collect()

    for (const project of projects.filter((row: any) => !row.private && !row.archivedAt)) {
      await queueProjectResources(ctx, exportRecord._id, project)
    }

    return {}
  }
})

export const createLegacyViewerDataExport = mutation({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const exportRecord = await createDataExportRecord(ctx, {
      organization: context.organization,
      viewerMembership: context.viewerMembership,
      requesterTokenIdentifier: context.identity.tokenIdentifier,
      subjectType: 'OrganizationMembership',
      subjectId: context.viewerMembership._id,
      subjectName: context.user.displayName ?? context.user.username ?? 'Member export'
    })

    await insertExportResource(
      ctx,
      exportRecord._id,
      'member',
      context.viewerMembership._id,
      context.viewerMembership.publicId,
      context.user.displayName ?? context.user.username ?? 'Member'
    )

    const [posts, projects] = await Promise.all([
      ctx.db
        .query('posts')
        .withIndex('by_organization_and_author', (q: any) =>
          q.eq('organizationId', context.organization._id).eq('authorTokenIdentifier', context.identity.tokenIdentifier)
        )
        .collect(),
      ctx.db
        .query('projects')
        .withIndex('by_organization_id', (q: any) => q.eq('organizationId', context.organization._id))
        .collect()
    ])

    const authoredProjectIds = new Set<string>()

    for (const post of posts.filter((row: any) => row.publishedAt && !row.draft)) {
      await insertExportResource(ctx, exportRecord._id, 'post', post._id, undefined, post.title)
      await queueAttachmentResources(ctx, exportRecord._id, 'Post', post._id)
      await queueCommentAttachmentResources(ctx, exportRecord._id, post._id)
      if (post.projectId) {
        authoredProjectIds.add(post.projectId)
      }
    }

    for (const project of projects.filter((row: any) => authoredProjectIds.has(row._id))) {
      await insertExportResource(ctx, exportRecord._id, 'project', project._id, project._id, project.name)
    }

    return {}
  }
})

export const createLegacyProjectDataExport = mutation({
  args: {
    slug: v.string(),
    projectId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const project = await getProjectByPublicId(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw createError('not_found', 'Project not found')
    }

    const exportRecord = await createDataExportRecord(ctx, {
      organization: context.organization,
      viewerMembership: context.viewerMembership,
      requesterTokenIdentifier: context.identity.tokenIdentifier,
      subjectType: 'Project',
      subjectId: project._id,
      subjectName: project.name
    })

    await queueProjectResources(ctx, exportRecord._id, project)

    return {}
  }
})

export const completeLegacyDataExport = mutation({
  args: {
    publicId: v.string(),
    zipPath: v.string()
  },
  handler: async (ctx, args) => {
    const exportRow = await ctx.db
      .query('dataExports')
      .withIndex('by_public_id', (q: any) => q.eq('publicId', args.publicId))
      .unique()

    if (!exportRow) {
      throw createError('not_found', 'Data export not found')
    }

    const now = Date.now()

    await ctx.db.patch(exportRow._id, {
      zipPath: args.zipPath,
      downloadUrl: buildLegacyMediaUrl(args.zipPath) ?? args.zipPath,
      status: 'completed',
      completedAt: now,
      updatedAt: now
    })

    const resources = await ctx.db
      .query('dataExportResources')
      .withIndex('by_data_export_id', (q: any) => q.eq('dataExportId', exportRow._id))
      .collect()

    for (const resource of resources) {
      await ctx.db.patch(resource._id, {
        status: resource.status === 'error' ? 'error' : 'completed',
        completedAt: resource.completedAt ?? now,
        updatedAt: now
      })
    }

    await ensureOpsEvent(ctx, {
      organizationId: exportRow.organizationId,
      subjectType: 'DataExport',
      subjectId: exportRow._id,
      action: 'completed',
      metadata: {
        public_id: exportRow.publicId
      },
      skipNotifications: true
    })

    return {}
  }
})

export const createLegacyFeedback = mutation({
  args: {
    slug: v.string(),
    description: v.string(),
    feedbackType: v.union(v.literal('bug'), v.literal('feature'), v.literal('general')),
    currentUrl: v.string(),
    screenshotPath: v.optional(v.string()),
    browserInfo: v.optional(v.string()),
    osInfo: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const cleanDescription = args.description.trim()

    if (!cleanDescription) {
      throw createError('unprocessable', 'Feedback description is required')
    }

    const user = await getUserByTokenIdentifier(ctx, context.identity.tokenIdentifier)

    if (!user) {
      throw createError('unauthorized', 'Viewer has not been provisioned')
    }

    const now = Date.now()
    const feedbackId = await ctx.db.insert('feedbacks', {
      organizationId: context.organization._id,
      publicId: generateToken().slice(0, 12),
      userId: user._id,
      userTokenIdentifier: context.identity.tokenIdentifier,
      description: cleanDescription,
      feedbackType: args.feedbackType,
      currentUrl: args.currentUrl,
      browserInfo: args.browserInfo,
      osInfo: args.osInfo,
      screenshotPath: args.screenshotPath,
      postedToLinearAt: undefined,
      sentToPlainAt: undefined,
      createdAt: now,
      updatedAt: now
    })

    await ensureOpsEvent(ctx, {
      organizationId: context.organization._id,
      actorType: 'User',
      actorId: user._id,
      subjectType: 'Feedback',
      subjectId: feedbackId,
      action: 'created',
      metadata: {
        feedback_type: args.feedbackType,
        current_url: args.currentUrl
      },
      skipNotifications: true
    })

    return {}
  }
})

export const recordLegacyLlmResponse = mutation({
  args: {
    subjectType: v.string(),
    subjectId: v.string(),
    prompt: v.string(),
    response: v.string()
  },
  handler: async (ctx, args) => {
    const invocationKey = stableInvocationKey(args.prompt)
    const existing = await ctx.db
      .query('llmResponses')
      .withIndex('by_invocation_key', (q: any) => q.eq('invocationKey', invocationKey))
      .collect()

    const match = existing.find((row: any) => row.subjectType === args.subjectType && row.subjectId === args.subjectId)

    if (match) {
      return match.publicId
    }

    const now = Date.now()
    const publicId = generateToken().slice(0, 12)

    await ctx.db.insert('llmResponses', {
      publicId,
      subjectType: args.subjectType,
      subjectId: args.subjectId,
      invocationKey,
      prompt: args.prompt,
      response: args.response,
      createdAt: now,
      updatedAt: now
    })

    return publicId
  }
})

export const upsertLegacyFlipperFeature = mutation({
  args: {
    key: v.string()
  },
  handler: async (ctx, args) => await upsertFlipperFeatureRecord(ctx, args.key)
})

export const upsertLegacyFlipperGate = mutation({
  args: {
    featureKey: v.string(),
    key: v.string(),
    value: v.string()
  },
  handler: async (ctx, args) => {
    const featureId = await upsertFlipperFeatureRecord(ctx, args.featureKey)
    const existing = await ctx.db
      .query('flipperGates')
      .withIndex('by_feature_and_key', (q: any) => q.eq('flipperFeatureId', featureId).eq('key', args.key))
      .unique()

    const now = Date.now()

    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value, updatedAt: now })
      return existing._id
    }

    return await ctx.db.insert('flipperGates', {
      flipperFeatureId: featureId,
      key: args.key,
      value: args.value,
      createdAt: now,
      updatedAt: now
    })
  }
})

export const recordLegacyFlipperAuditLog = mutation({
  args: {
    userTokenIdentifier: v.optional(v.string()),
    featureName: v.string(),
    operation: v.string(),
    gateName: v.optional(v.string()),
    thingJson: v.optional(v.string()),
    gateValuesSnapshotJson: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const user = args.userTokenIdentifier ? await getUserByTokenIdentifier(ctx, args.userTokenIdentifier) : null
    const now = Date.now()

    await ctx.db.insert('flipperAuditLogs', {
      publicId: generateToken().slice(0, 12),
      userId: user?._id,
      featureName: args.featureName,
      operation: args.operation,
      gateName: args.gateName,
      thingJson: args.thingJson,
      gateValuesSnapshotJson: args.gateValuesSnapshotJson,
      createdAt: now,
      updatedAt: now
    })

    return {}
  }
})

export const recordConsole1984Session = mutation({
  args: {
    username: v.string(),
    reason: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const now = Date.now()
    let consoleUser = await ctx.db
      .query('console1984Users')
      .withIndex('by_username', (q: any) => q.eq('username', args.username))
      .unique()

    if (!consoleUser) {
      const consoleUserId = await ctx.db.insert('console1984Users', {
        username: args.username,
        createdAt: now,
        updatedAt: now
      })
      consoleUser = await ctx.db.get(consoleUserId)
    }

    if (!consoleUser) {
      throw createError('unprocessable', 'Console user could not be created')
    }

    return await ctx.db.insert('console1984Sessions', {
      console1984UserId: consoleUser._id,
      reason: args.reason,
      createdAt: now,
      updatedAt: now
    })
  }
})

export const recordConsole1984SensitiveAccess = mutation({
  args: {
    console1984SessionId: v.id('console1984Sessions'),
    justification: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    return await ctx.db.insert('console1984SensitiveAccesses', {
      console1984SessionId: args.console1984SessionId,
      justification: args.justification,
      createdAt: now,
      updatedAt: now
    })
  }
})

export const recordConsole1984Command = mutation({
  args: {
    console1984SessionId: v.id('console1984Sessions'),
    console1984SensitiveAccessId: v.optional(v.id('console1984SensitiveAccesses')),
    statements: v.string()
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    return await ctx.db.insert('console1984Commands', {
      console1984SessionId: args.console1984SessionId,
      console1984SensitiveAccessId: args.console1984SensitiveAccessId,
      statements: args.statements,
      createdAt: now,
      updatedAt: now
    })
  }
})

export const getLegacyDataExport = query({
  args: {
    publicId: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('dataExports')
      .withIndex('by_public_id', (q: any) => q.eq('publicId', args.publicId))
      .unique()
  }
})
