import { v } from 'convex/values'

import { internalQuery } from './_generated/server'

export async function getProjectViewRecord(
  ctx: any,
  params: {
    projectId: any
    organizationMembershipId?: any
  }
) {
  if (!params.organizationMembershipId) {
    return null
  }

  return await ctx.db
    .query('projectViews')
    .withIndex('by_project_and_membership', (q: any) =>
      q.eq('projectId', params.projectId).eq('organizationMembershipId', params.organizationMembershipId)
    )
    .unique()
}

export async function getProjectUnreadForViewer(
  ctx: any,
  params: {
    organizationId: any
    projectId: any
    organizationMembershipId?: any
    viewerTokenIdentifier?: string | null
    messageThreadId?: any
  }
) {
  if (!params.organizationMembershipId || !params.viewerTokenIdentifier) {
    return false
  }

  const [projectView, projectPosts, subjectViews, threadMembership] = await Promise.all([
    getProjectViewRecord(ctx, {
      projectId: params.projectId,
      organizationMembershipId: params.organizationMembershipId
    }),
    ctx.db.query('posts').withIndex('by_organization_id', (q: any) => q.eq('organizationId', params.organizationId)).collect(),
    ctx.db
      .query('subjectViews')
      .withIndex('by_user_token_identifier', (q: any) => q.eq('userTokenIdentifier', params.viewerTokenIdentifier))
      .collect(),
    params.messageThreadId
      ? ctx.db
          .query('messageThreadMemberships')
          .withIndex('by_thread_and_user', (q: any) =>
            q.eq('threadId', params.messageThreadId).eq('userTokenIdentifier', params.viewerTokenIdentifier)
          )
          .unique()
      : null
  ])

  if (
    projectView?.manuallyMarkedUnreadAt &&
    (!projectView.lastViewedAt || projectView.manuallyMarkedUnreadAt > projectView.lastViewedAt)
  ) {
    return true
  }

  const lastViewedAt = projectView?.lastViewedAt ?? 0
  const viewedPostIds = new Set(
    subjectViews.filter((view: any) => view.subjectType === 'Post').map((view: any) => view.subjectId)
  )
  const unreadProjectPost = projectPosts.find(
    (post: any) =>
      post.projectId === params.projectId &&
      !!post.publishedAt &&
      post.authorTokenIdentifier !== params.viewerTokenIdentifier &&
      post.createdAt > lastViewedAt &&
      !viewedPostIds.has(post._id)
  )

  if (unreadProjectPost) {
    return true
  }

  return !!threadMembership && (!!threadMembership.manuallyMarkedUnread || threadMembership.unreadCount > 0)
}

export async function markProjectRead(
  ctx: any,
  params: {
    organizationId: any
    projectId: any
    organizationMembershipId: any
  }
) {
  const existing = await getProjectViewRecord(ctx, params)
  const now = Date.now()

  if (existing) {
    await ctx.db.patch(existing._id, {
      lastViewedAt: now,
      manuallyMarkedUnreadAt: undefined,
      updatedAt: now
    })

    return (await ctx.db.get(existing._id)) || existing
  }

  const id = await ctx.db.insert('projectViews', {
    organizationId: params.organizationId,
    projectId: params.projectId,
    organizationMembershipId: params.organizationMembershipId,
    lastViewedAt: now,
    manuallyMarkedUnreadAt: undefined,
    createdAt: now,
    updatedAt: now
  })

  return await ctx.db.get(id)
}

export async function markProjectUnread(
  ctx: any,
  params: {
    organizationId: any
    projectId: any
    organizationMembershipId: any
  }
) {
  const existing = await getProjectViewRecord(ctx, params)
  const now = Date.now()

  if (existing) {
    await ctx.db.patch(existing._id, {
      lastViewedAt: existing.lastViewedAt ?? now,
      manuallyMarkedUnreadAt: now,
      updatedAt: now
    })

    return (await ctx.db.get(existing._id)) || existing
  }

  const id = await ctx.db.insert('projectViews', {
    organizationId: params.organizationId,
    projectId: params.projectId,
    organizationMembershipId: params.organizationMembershipId,
    lastViewedAt: now,
    manuallyMarkedUnreadAt: now,
    createdAt: now,
    updatedAt: now
  })

  return await ctx.db.get(id)
}

export const getProjectUnreadForViewerInternal = internalQuery({
  args: {
    organizationId: v.id('organizations'),
    projectId: v.id('projects'),
    organizationMembershipId: v.optional(v.id('organizationMemberships')),
    viewerTokenIdentifier: v.optional(v.string()),
    messageThreadId: v.optional(v.id('messageThreads'))
  },
  handler: async (ctx, args) => {
    return await getProjectUnreadForViewer(ctx, args)
  }
})
