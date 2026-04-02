import { v } from 'convex/values'

import { internal } from './_generated/api'
import { internalMutation, mutation, query } from './_generated/server'
import { buildLegacyMediaUrl, buildLegacyMember, formatDate } from './legacy'
import { createNotificationRecord } from './notifications'
import { buildLegacyProjectDisplayPreferences, getProjectDisplayPreferenceRecord } from './projectPreferences'
import { getProjectUnreadForViewer } from './projectViews'
import { buildWorkspaceState } from './workspace'

const favoritableTypeValues = [
  v.literal('Project'),
  v.literal('MessageThread'),
  v.literal('Note'),
  v.literal('Post'),
  v.literal('Call')
] as const

const followUpSubjectTypeValues = [v.literal('Post'), v.literal('Note'), v.literal('Comment'), v.literal('Call')] as const
const reactionSubjectTypeValues = [v.literal('Post'), v.literal('Comment'), v.literal('Message')] as const
const subscriptionTypeValues = [v.literal('Post'), v.literal('Project'), v.literal('Note')] as const

function stripHtml(value?: string | null) {
  if (!value) {
    return ''
  }

  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function createError(message: string, code: string) {
  return new Error(`${code}:${message}`)
}

async function getOrganizationContext(ctx: any, slug: string) {
  const state = await buildWorkspaceState(ctx)
  const membershipEntry = state.memberships.find((entry: any) => entry.organization?.slug === slug)

  if (!membershipEntry?.organization || membershipEntry.membership?.discardedAt) {
    return null
  }

  return {
    ...state,
    organization: membershipEntry.organization,
    viewerMembership: membershipEntry.membership
  }
}

async function getUserByTokenIdentifier(ctx: any, tokenIdentifier: string) {
  return await ctx.db
    .query('users')
    .withIndex('by_token_identifier', (q: any) => q.eq('tokenIdentifier', tokenIdentifier))
    .unique()
}

async function getMembership(ctx: any, organizationId: any, tokenIdentifier: string) {
  return await ctx.db
    .query('organizationMemberships')
    .withIndex('by_organization_and_user', (q: any) =>
      q.eq('organizationId', organizationId).eq('userTokenIdentifier', tokenIdentifier)
    )
    .unique()
}

async function getProjectById(ctx: any, organizationId: any, projectId?: string | null) {
  if (!projectId) {
    return null
  }

  const projects = await ctx.db
    .query('projects')
    .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId))
    .collect()

  return projects.find((project: any) => project._id === projectId) ?? null
}

async function getProjectMemberships(ctx: any, projectId: string) {
  return await ctx.db
    .query('projectMemberships')
    .withIndex('by_project_id', (q: any) => q.eq('projectId', projectId))
    .collect()
}

async function getProjectPosts(ctx: any, organizationId: any, projectId: string) {
  const posts = await ctx.db
    .query('posts')
    .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId))
    .collect()

  return posts.filter((post: any) => post.projectId === projectId)
}

function getProjectMembershipCounts(projectMemberships: any[]) {
  const guestsCount = projectMemberships.filter((membership: any) => membership.role === 'guest').length

  return {
    guestsCount,
    membersAndGuestsCount: projectMemberships.length,
    membersCount: projectMemberships.length - guestsCount
  }
}

async function getProjectCallRoomUrl(ctx: any, organizationSlug: string, organizationId: any, messageThreadId?: string | null) {
  if (!messageThreadId) {
    return null
  }

  const thread = await ctx.db
    .query('messageThreads')
    .withIndex('by_public_id', (q: any) => q.eq('publicId', messageThreadId))
    .unique()

  if (!thread || thread.organizationId !== organizationId || !thread.callRoomId) {
    return null
  }

  const callRoom = await ctx.db.get(thread.callRoomId)

  if (!callRoom || callRoom.organizationId !== organizationId) {
    return null
  }

  return `/${organizationSlug}/calls/join/${callRoom.publicId}`
}

async function getPostById(ctx: any, organizationId: any, postId: string) {
  const posts = await ctx.db
    .query('posts')
    .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId))
    .collect()

  return posts.find((post: any) => post._id === postId) ?? null
}

async function getCommentById(ctx: any, organizationId: any, commentId: string) {
  const comments = await ctx.db
    .query('comments')
    .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId))
    .collect()

  return comments.find((comment: any) => comment._id === commentId) ?? null
}

async function getMessageById(ctx: any, organizationId: any, messageId: string) {
  const message = await ctx.db
    .query('messages')
    .withIndex('by_public_id', (q: any) => q.eq('publicId', messageId))
    .unique()

  if (!message || message.organizationId !== organizationId) {
    return null
  }

  return message
}

async function getSubjectRecord(ctx: any, organizationId: any, subjectType: string, subjectId: string) {
  switch (subjectType) {
    case 'Post':
      return await getPostById(ctx, organizationId, subjectId)
    case 'Comment':
      return await getCommentById(ctx, organizationId, subjectId)
    case 'Message':
      return await getMessageById(ctx, organizationId, subjectId)
    default:
      return null
  }
}

async function getFollowUpSubjectSnapshot(
  ctx: any,
  organizationId: any,
  subjectType: 'Post' | 'Note' | 'Comment' | 'Call',
  subjectId: string
) {
  if (subjectType === 'Post') {
    const post = await getPostById(ctx, organizationId, subjectId)

    if (!post) {
      return null
    }

    const title = post.title || stripHtml(post.descriptionHtml) || 'Post'

    return {
      subjectBodyPreview: title,
      subjectTitle: post.title || title,
      targetId: post._id,
      targetProjectId: post.projectId ?? undefined,
      targetTitle: title,
      targetType: 'Post' as const
    }
  }

  if (subjectType === 'Comment') {
    const comment = await getCommentById(ctx, organizationId, subjectId)

    if (!comment) {
      return null
    }

    const post = await ctx.db.get(comment.postId)
    const targetTitle = post ? post.title || stripHtml(post.descriptionHtml) || 'Post' : 'Post'

    return {
      subjectBodyPreview: stripHtml(comment.bodyHtml) || 'Comment',
      subjectTitle: null,
      targetId: comment.postId,
      targetProjectId: post?.projectId ?? undefined,
      targetTitle,
      targetType: 'Post' as const
    }
  }

  if (subjectType === 'Note') {
    return {
      subjectBodyPreview: 'Note',
      subjectTitle: 'Note',
      targetId: subjectId,
      targetProjectId: undefined,
      targetTitle: 'Note',
      targetType: 'Note' as const
    }
  }

  return {
    subjectBodyPreview: 'Call',
    subjectTitle: 'Call',
    targetId: subjectId,
    targetProjectId: undefined,
    targetTitle: 'Call',
    targetType: 'Call' as const
  }
}

async function getSubjectProjectId(ctx: any, organizationId: any, subjectType: string, subjectId: string) {
  if (subjectType === 'Post') {
    const post = await getPostById(ctx, organizationId, subjectId)
    return post?.projectId ?? undefined
  }

  if (subjectType === 'Comment') {
    const comment = await getCommentById(ctx, organizationId, subjectId)
    if (!comment) return undefined
    const post = await ctx.db.get(comment.postId)
    return post?.projectId ?? undefined
  }

  if (subjectType === 'Message') {
    const message = await getMessageById(ctx, organizationId, subjectId)

    if (!message) {
      return undefined
    }

    const thread = await ctx.db.get(message.threadId)
    return thread?.projectId ?? undefined
  }

  return undefined
}

async function archiveNotificationsByInboxKey(
  ctx: any,
  params: {
    organizationId: any
    recipientTokenIdentifier: string
    inboxKey: string
  }
) {
  const notifications = await ctx.db
    .query('notifications')
    .withIndex('by_organization_and_recipient', (q: any) =>
      q.eq('organizationId', params.organizationId).eq('recipientTokenIdentifier', params.recipientTokenIdentifier)
    )
    .collect()
  const now = Date.now()

  for (const notification of notifications) {
    if (notification.inboxKey !== params.inboxKey || notification.archivedAt) {
      continue
    }

    await ctx.db.patch(notification._id, {
      activitySeen: true,
      archivedAt: now,
      readAt: notification.readAt ?? now
    })
  }
}

async function getFavoritesForUser(ctx: any, organizationId: any, tokenIdentifier: string) {
  return await ctx.db
    .query('favorites')
    .withIndex('by_organization_and_user', (q: any) =>
      q.eq('organizationId', organizationId).eq('userTokenIdentifier', tokenIdentifier)
    )
    .collect()
}

function sortFavorites(favorites: any[]) {
  return [...favorites].sort((a: any, b: any) => a.position - b.position || a.createdAt - b.createdAt)
}

async function normalizeFavoritesForUser(
  ctx: any,
  organizationId: any,
  tokenIdentifier: string,
  orderedFavoriteIds?: string[]
) {
  const favorites = sortFavorites(await getFavoritesForUser(ctx, organizationId, tokenIdentifier))
  const favoriteById = new Map(favorites.map((favorite: any) => [favorite._id, favorite]))
  const preferredOrder = (orderedFavoriteIds ?? []).map((id) => favoriteById.get(id)).filter(Boolean)
  const remaining = favorites.filter((favorite: any) => !preferredOrder.some((entry: any) => entry._id === favorite._id))
  const ordered = [...preferredOrder, ...remaining]

  for (let index = 0; index < ordered.length; index += 1) {
    const favorite = ordered[index]

    if (favorite.position !== index) {
      await ctx.db.patch(favorite._id, { position: index })
    }
  }

  return ordered
}

async function getFollowUpsForUser(ctx: any, organizationId: any, tokenIdentifier: string) {
  return await ctx.db
    .query('followUps')
    .withIndex('by_organization_and_user', (q: any) =>
      q.eq('organizationId', organizationId).eq('userTokenIdentifier', tokenIdentifier)
    )
    .collect()
}

async function getReactionsForSubject(ctx: any, subjectType: 'Post' | 'Comment' | 'Message', subjectId: string) {
  return await ctx.db
    .query('reactions')
    .withIndex('by_subject', (q: any) => q.eq('subjectType', subjectType).eq('subjectId', subjectId))
    .collect()
}

function buildReactionTooltip(members: any[]) {
  const names = members.map((member: any) => member.user.display_name)
  return names.join(', ')
}

export async function buildLegacyGroupedReactions(
  ctx: any,
  params: {
    organizationId: any
    subjectType: 'Post' | 'Comment' | 'Message'
    subjectId: string
    viewerTokenIdentifier: string
  }
) {
  const reactions = await getReactionsForSubject(ctx, params.subjectType, params.subjectId)
  const grouped = new Map<string, any[]>()

  for (const reaction of reactions) {
    const key = reaction.customContent ? `custom:${reaction.customContent.id}` : `emoji:${reaction.content ?? ''}`
    const bucket = grouped.get(key) ?? []
    bucket.push(reaction)
    grouped.set(key, bucket)
  }

  const result = []

  for (const bucket of Array.from(grouped.values())) {
    const members = await Promise.all(
      bucket.map(async (reaction: any) => {
        const [user, membership] = await Promise.all([
          getUserByTokenIdentifier(ctx, reaction.userTokenIdentifier),
          getMembership(ctx, params.organizationId, reaction.userTokenIdentifier)
        ])

        if (!user || !membership) {
          return null
        }

        return buildLegacyMember(membership, user)
      })
    )

    const cleanMembers = members.filter(Boolean)
    const viewerReaction = bucket.find((reaction: any) => reaction.userTokenIdentifier === params.viewerTokenIdentifier)
    const reaction = bucket[0]

    result.push({
      viewer_reaction_id: viewerReaction?._id ?? null,
      emoji: reaction.content ?? null,
      tooltip: buildReactionTooltip(cleanMembers),
      reactions_count: bucket.length,
      custom_content: reaction.customContent ?? null
    })
  }

  return result
}

export async function buildLegacySubjectFollowUps(
  ctx: any,
  params: {
    organizationId: any
    subjectType: 'Post' | 'Note' | 'Comment' | 'Call'
    subjectId: string
    viewerTokenIdentifier: string
  }
) {
  const followUps = await ctx.db
    .query('followUps')
    .withIndex('by_subject', (q: any) => q.eq('subjectType', params.subjectType).eq('subjectId', params.subjectId))
    .collect()

  const result = []

  for (const followUp of followUps.sort((a: any, b: any) => a.showAt - b.showAt)) {
    const [user, membership] = await Promise.all([
      getUserByTokenIdentifier(ctx, followUp.userTokenIdentifier),
      getMembership(ctx, params.organizationId, followUp.userTokenIdentifier)
    ])

    if (!user || !membership) {
      continue
    }

    result.push({
      id: followUp._id,
      member: buildLegacyMember(membership, user),
      show_at: new Date(followUp.showAt).toISOString(),
      belongs_to_viewer: followUp.userTokenIdentifier === params.viewerTokenIdentifier
    })
  }

  return result
}

export async function hasLegacyFavorite(
  ctx: any,
  params: {
    organizationId: any
    tokenIdentifier: string
    favoritableType: 'Project' | 'MessageThread' | 'Note' | 'Post' | 'Call'
    favoritableId: string
  }
) {
  const favorite = await ctx.db
    .query('favorites')
    .withIndex('by_organization_user_and_favoritable', (q: any) =>
      q
        .eq('organizationId', params.organizationId)
        .eq('userTokenIdentifier', params.tokenIdentifier)
        .eq('favoritableType', params.favoritableType)
        .eq('favoritableId', params.favoritableId)
    )
    .unique()

  return !!favorite
}

export async function getLegacyProjectSubscriptionState(
  ctx: any,
  params: {
    organizationId: any
    tokenIdentifier: string
    projectId: string
  }
) {
  const subscription = await ctx.db
    .query('subscriptions')
    .withIndex('by_organization_user_and_subject', (q: any) =>
      q
        .eq('organizationId', params.organizationId)
        .eq('userTokenIdentifier', params.tokenIdentifier)
        .eq('subscribableType', 'Project')
        .eq('subscribableId', params.projectId)
    )
    .unique()

  return {
    viewer_has_subscribed: !!subscription,
    viewer_subscription: subscription ? (subscription.cascade ? 'posts_and_comments' : 'new_posts') : 'none'
  }
}

export async function hasLegacyPostSubscription(
  ctx: any,
  params: {
    organizationId: any
    tokenIdentifier: string
    postId: string
  }
) {
  const subscription = await ctx.db
    .query('subscriptions')
    .withIndex('by_organization_user_and_subject', (q: any) =>
      q
        .eq('organizationId', params.organizationId)
        .eq('userTokenIdentifier', params.tokenIdentifier)
        .eq('subscribableType', 'Post')
        .eq('subscribableId', params.postId)
    )
    .unique()

  return !!subscription
}

function buildFavoriteUrl(slug: string, favorite: any) {
  switch (favorite.favoritableType) {
    case 'Post':
      return `/${slug}/posts/${favorite.favoritableId}`
    case 'Project':
      return `/${slug}/projects/${favorite.favoritableId}`
    case 'Note':
      return `/${slug}/notes/${favorite.favoritableId}`
    case 'MessageThread':
      return `/${slug}/chat/${favorite.favoritableId}`
    case 'Call':
      return `/${slug}/calls/${favorite.favoritableId}`
    default:
      return `/${slug}`
  }
}

async function getMessageThreadForFavorite(ctx: any, organizationId: any, favorite: any) {
  const thread = await ctx.db
    .query('messageThreads')
    .withIndex('by_public_id', (q: any) => q.eq('publicId', favorite.favoritableId))
    .unique()

  if (!thread || thread.organizationId !== organizationId) {
    return null
  }

  const memberships = await ctx.db
    .query('organizationMemberships')
    .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId))
    .collect()

  const membershipByToken = new Map(memberships.map((m: any) => [m.userTokenIdentifier, m]))

  const users = await Promise.all(
    memberships.map((m: any) =>
      ctx.db
        .query('users')
        .withIndex('by_token_identifier', (q: any) => q.eq('tokenIdentifier', m.userTokenIdentifier))
        .unique()
    )
  )

  const userByToken = new Map(users.filter(Boolean).map((u: any) => [u.tokenIdentifier, u]))
  const otherTokens = thread.participantTokenIdentifiers.filter((t: string) => t !== favorite.userTokenIdentifier)
  const otherUsers = otherTokens.map((t: string) => userByToken.get(t)).filter(Boolean)

  const title = thread.title || (otherUsers.length === 1
    ? otherUsers[0].displayName
    : otherUsers.length === 2
      ? otherUsers.map((m: any) => m.displayName).join(' and ')
      : otherUsers.length > 2
        ? `${otherUsers[0].displayName} and ${otherUsers.length - 1} others`
        : 'Chat')

  const otherMembersLegacy = otherTokens.map((tokenIdentifier: string) => {
    const membership = membershipByToken.get(tokenIdentifier)
    const user = userByToken.get(tokenIdentifier)

    if (!membership || !user) {
      return null
    }

    return buildLegacyMember(membership, user)
  }).filter(Boolean)

  return {
    name: title,
    data: {
      id: thread.publicId,
      last_message_at: thread.lastMessageAt ? new Date(thread.lastMessageAt).toISOString() : null,
      latest_message_truncated: thread.latestMessageTruncated ?? null,
      image_url: null,
      avatar_urls: null,
      group: thread.group,
      channel_name: `thread-${thread.publicId}`,
      organization_slug: thread.organizationSlug,
      path: `/${thread.organizationSlug}/chat/${thread.publicId}`,
      call_room_url: null,
      remote_call_room_id: null,
      integration_dm: thread.integrationDm,
      active_call: null,
      deactivated_members: [],
      type_name: 'message_thread',
      title,
      project_id: null,
      unread_count: 0,
      manually_marked_unread: false,
      viewer_has_favorited: true,
      other_members: otherMembersLegacy,
      viewer_is_thread_member: true,
      viewer_can_manage_integrations: false,
      viewer_can_delete: false,
      viewer_can_force_notification: false
    }
  }
}

async function buildLegacyFavorite(ctx: any, slug: string, organizationId: any, favorite: any) {
  const project = favorite.favoritableType === 'Project' ? await getProjectById(ctx, organizationId, favorite.favoritableId) : null
  const messageThread = favorite.favoritableType === 'MessageThread' ? await getMessageThreadForFavorite(ctx, organizationId, favorite) : null
  const viewerMembership = project ? await getMembership(ctx, organizationId, favorite.userTokenIdentifier) : null
  const [projectSubscriptionState, projectViewerDisplayPreferences, unreadForViewer, projectCallRoomUrl, projectMemberships, projectPosts] =
    await Promise.all([
    project
      ? getLegacyProjectSubscriptionState(ctx, {
          organizationId,
          tokenIdentifier: favorite.userTokenIdentifier,
          projectId: project._id
        })
      : null,
    project
      ? getProjectDisplayPreferenceRecord(ctx, {
          projectId: project._id,
          organizationMembershipId: viewerMembership?._id
        })
      : null,
    project
      ? getProjectUnreadForViewer(ctx, {
          organizationId,
          projectId: project._id,
          organizationMembershipId: viewerMembership?._id,
          viewerTokenIdentifier: favorite.userTokenIdentifier,
          messageThreadId: project.messageThreadId
        })
      : false,
    project ? getProjectCallRoomUrl(ctx, slug, organizationId, project.messageThreadId) : null,
    project ? getProjectMemberships(ctx, project._id) : Promise.resolve([]),
    project ? getProjectPosts(ctx, organizationId, project._id) : Promise.resolve([])
  ])
  const viewerProjectMembership = projectMemberships.find(
    (membership: any) => membership.userTokenIdentifier === favorite.userTokenIdentifier
  )
  const projectMembershipCounts = getProjectMembershipCounts(projectMemberships)
  const contributorCount = new Set(projectPosts.map((post: any) => post.authorTokenIdentifier)).size
  const canManage = !!project && !!viewerMembership && viewerMembership.role === 'admin'

  return {
    id: favorite._id,
    position: favorite.position,
    favoritable_type: favorite.favoritableType,
    favoritable_id: favorite.favoritableId,
    accessory: project?.accessory ?? null,
    name:
      project?.name ??
      (favorite.favoritableType === 'Post'
        ? (await getPostById(ctx, organizationId, favorite.favoritableId))?.title || 'Post'
        : favorite.favoritableType === 'MessageThread'
          ? messageThread?.name ?? 'Chat'
          : favorite.favoritableType),
    url: buildFavoriteUrl(slug, favorite),
    private: project?.private ?? false,
    project: project
      ? {
          id: project._id,
          name: project.name,
          description: project.description ?? null,
          created_at: new Date(project.createdAt).toISOString(),
          archived_at: formatDate(project.archivedAt),
          archived: !!project.archivedAt,
          last_activity_at: new Date(project.lastActivityAt).toISOString(),
          slack_channel_id: project.slackChannelId ?? null,
          posts_count: projectPosts.length,
          cover_photo_url: buildLegacyMediaUrl(project.coverPhotoPath) ?? null,
          url: `/${slug}/projects/${project._id}`,
          accessory: project.accessory ?? null,
          private: project.private,
          personal: project.personal,
          is_general: project.isGeneral,
          is_default: project.isDefault,
          contributors_count: contributorCount,
          members_and_guests_count: projectMembershipCounts.membersAndGuestsCount,
          members_count: projectMembershipCounts.membersCount,
          guests_count: projectMembershipCounts.guestsCount,
          call_room_url: projectCallRoomUrl,
          message_thread_id: project.messageThreadId ?? null,
          organization_id: organizationId,
          viewer_has_favorited: true,
          viewer_can_archive: canManage && !project.isGeneral,
          viewer_can_destroy: canManage && !project.isGeneral,
          viewer_can_unarchive: canManage,
          viewer_can_update: canManage || project.creatorTokenIdentifier === favorite.userTokenIdentifier,
          viewer_has_subscribed: projectSubscriptionState?.viewer_has_subscribed ?? false,
          viewer_subscription: projectSubscriptionState?.viewer_subscription ?? 'none',
          viewer_is_member: !!viewerProjectMembership,
          unread_for_viewer: unreadForViewer,
          slack_channel: null,
          type_name: 'project',
          viewer_display_preferences: projectViewerDisplayPreferences
            ? buildLegacyProjectDisplayPreferences(projectViewerDisplayPreferences)
            : null,
          display_preferences: buildLegacyProjectDisplayPreferences(project)
        }
      : null,
    message_thread: messageThread?.data ?? null
  }
}

async function buildLegacyFollowUp(ctx: any, slug: string, organizationId: any, followUp: any, viewerTokenIdentifier: string) {
  const [user, membership, subjectSnapshot] = await Promise.all([
    getUserByTokenIdentifier(ctx, followUp.userTokenIdentifier),
    getMembership(ctx, organizationId, followUp.userTokenIdentifier),
    getFollowUpSubjectSnapshot(ctx, organizationId, followUp.subjectType, followUp.subjectId)
  ])

  if (!user || !membership) {
    throw createError('Organization member not found', 'not_found')
  }

  const project = await getProjectById(
    ctx,
    organizationId,
    subjectSnapshot?.targetProjectId ?? followUp.targetProjectId
  )
  const targetTitle = subjectSnapshot?.targetTitle ?? followUp.targetTitle
  const subjectBodyPreview = subjectSnapshot?.subjectBodyPreview ?? followUp.targetTitle
  const subjectTitle = subjectSnapshot?.subjectTitle ?? followUp.targetTitle

  return {
    id: followUp._id,
    show_at: new Date(followUp.showAt).toISOString(),
    inbox_key: `${followUp.subjectType.toLowerCase()}:${followUp.subjectId}:follow_up`,
    organization_slug: slug,
    member: buildLegacyMember(membership, user),
    subject: {
      id: followUp.subjectId,
      type: followUp.subjectType,
      body_preview: subjectBodyPreview,
      member: null,
      title: subjectTitle
    },
    target: {
      id: subjectSnapshot?.targetId ?? followUp.targetId,
      type: subjectSnapshot?.targetType ?? followUp.targetType,
      title: targetTitle,
      project: project
        ? {
            id: project._id,
            name: project.name,
            accessory: project.accessory ?? null,
            private: project.private,
            archived: !!project.archivedAt,
            message_thread_id: project.messageThreadId ?? null
          }
        : null,
      resolved: false
    },
    summary_blocks: [{ text: { content: targetTitle } }],
    belongs_to_viewer: followUp.userTokenIdentifier === viewerTokenIdentifier,
    type_name: 'follow_up'
  }
}

export const getLegacyFavorites = query({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      return []
    }

    const ordered = sortFavorites(await getFavoritesForUser(ctx, context.organization._id, context.identity.tokenIdentifier))

    return await Promise.all(
      ordered.map((favorite: any) => buildLegacyFavorite(ctx, args.slug, context.organization._id, favorite))
    )
  }
})

export const createLegacyFavorite = mutation({
  args: {
    slug: v.string(),
    favoritableType: v.union(...favoritableTypeValues),
    favoritableId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const existing = await ctx.db
      .query('favorites')
      .withIndex('by_organization_user_and_favoritable', (q: any) =>
        q
          .eq('organizationId', context.organization._id)
          .eq('userTokenIdentifier', context.identity.tokenIdentifier)
          .eq('favoritableType', args.favoritableType)
          .eq('favoritableId', args.favoritableId)
      )
      .unique()

    if (existing) {
      return await buildLegacyFavorite(ctx, args.slug, context.organization._id, existing)
    }

    const currentFavorites = sortFavorites(
      await getFavoritesForUser(ctx, context.organization._id, context.identity.tokenIdentifier)
    )
    const id = await ctx.db.insert('favorites', {
      organizationId: context.organization._id,
      userTokenIdentifier: context.identity.tokenIdentifier,
      favoritableType: args.favoritableType,
      favoritableId: args.favoritableId,
      position: currentFavorites.length ? currentFavorites[currentFavorites.length - 1].position + 1 : 0,
      createdAt: Date.now()
    })

    await normalizeFavoritesForUser(ctx, context.organization._id, context.identity.tokenIdentifier)

    return await buildLegacyFavorite(ctx, args.slug, context.organization._id, await ctx.db.get(id))
  }
})

export const deleteLegacyFavorite = mutation({
  args: {
    slug: v.string(),
    favoriteId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const favorite: any = await ctx.db.get(args.favoriteId as any)

    if (
      !favorite ||
      favorite.organizationId !== context.organization._id ||
      favorite.userTokenIdentifier !== context.identity.tokenIdentifier
    ) {
      throw createError('Favorite not found', 'not_found')
    }

    await ctx.db.delete(favorite._id)
    await normalizeFavoritesForUser(ctx, context.organization._id, context.identity.tokenIdentifier)

    return {}
  }
})

export const reorderLegacyFavorites = mutation({
  args: {
    slug: v.string(),
    favorites: v.array(
      v.object({
        id: v.string(),
        position: v.number()
      })
    )
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const orderedIds = [...args.favorites].sort((a, b) => a.position - b.position).map((favorite) => favorite.id)
    await normalizeFavoritesForUser(ctx, context.organization._id, context.identity.tokenIdentifier, orderedIds)

    return {}
  }
})

export const getLegacyFollowUpsPage = query({
  args: {
    slug: v.string(),
    after: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      return { data: [], next_cursor: null, prev_cursor: null }
    }

    const followUps = await getFollowUpsForUser(ctx, context.organization._id, context.identity.tokenIdentifier)
    const ordered = [...followUps].sort((a: any, b: any) => a.showAt - b.showAt || a.createdAt - b.createdAt)
    const limit = Math.max(1, Math.min(args.limit ?? 10, 100))
    const startIndex = args.after ? ordered.findIndex((followUp: any) => followUp._id === args.after) + 1 : 0
    const page = ordered.slice(Math.max(0, startIndex), Math.max(0, startIndex) + limit)

    return {
      data: await Promise.all(
        page.map((followUp: any) =>
          buildLegacyFollowUp(ctx, args.slug, context.organization._id, followUp, context.identity.tokenIdentifier)
        )
      ),
      next_cursor: startIndex + limit < ordered.length ? page[page.length - 1]?._id ?? null : null,
      prev_cursor: null
    }
  }
})

// Internal mutation: promotes a follow-up into the inbox when its showAt time arrives
export const promoteFollowUpToInbox = internalMutation({
  args: {
    followUpId: v.id('followUps')
  },
  handler: async (ctx, args) => {
    const followUp: any = await ctx.db.get(args.followUpId)
    if (!followUp) return // already deleted

    // Create an inbox notification for the due follow-up
    await createNotificationRecord(ctx, {
      organizationId: followUp.organizationId,
      recipientTokenIdentifier: followUp.userTokenIdentifier,
      actorTokenIdentifier: followUp.userTokenIdentifier,
      reason: 'follow_up',
      inboxKey: `${followUp.subjectType.toLowerCase()}:${followUp.subjectId}:follow_up`,
      subjectType: followUp.subjectType,
      subjectId: followUp.subjectId,
      targetType: followUp.targetType,
      targetId: followUp.targetId,
      targetTitle: followUp.targetTitle,
      targetProjectId: followUp.targetProjectId,
      followUpSubjectType: followUp.subjectType,
      followUpSubjectId: followUp.subjectId,
      bodyPreviewPrefix: 'Follow up due',
      bodyPreview: followUp.targetTitle,
      isInbox: true,
      allowSelf: true
    })
  }
})

export const createLegacyFollowUp = mutation({
  args: {
    slug: v.string(),
    subjectType: v.union(...followUpSubjectTypeValues),
    subjectId: v.string(),
    showAt: v.number()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const subjectSnapshot = await getFollowUpSubjectSnapshot(ctx, context.organization._id, args.subjectType, args.subjectId)
    if (!subjectSnapshot) {
      throw createError('Follow-up subject not found', 'not_found')
    }

    const existing = await ctx.db
      .query('followUps')
      .withIndex('by_organization_user_and_subject', (q: any) =>
        q
          .eq('organizationId', context.organization._id)
          .eq('userTokenIdentifier', context.identity.tokenIdentifier)
          .eq('subjectType', args.subjectType)
          .eq('subjectId', args.subjectId)
      )
      .unique()

    if (existing) {
      // Cancel the old scheduled job if it exists
      if (existing.scheduledJobId) {
        try { await ctx.scheduler.cancel(existing.scheduledJobId) } catch { /* already ran or cancelled */ }
      }
      // Schedule new promotion job
      const jobId = await ctx.scheduler.runAt(args.showAt, internal.engagement.promoteFollowUpToInbox, { followUpId: existing._id })
      await ctx.db.patch(existing._id, { showAt: args.showAt, scheduledJobId: jobId })
      return await buildLegacyFollowUp(
        ctx,
        args.slug,
        context.organization._id,
        (await ctx.db.get(existing._id)) || existing,
        context.identity.tokenIdentifier
      )
    }

    const id = await ctx.db.insert('followUps', {
      organizationId: context.organization._id,
      userTokenIdentifier: context.identity.tokenIdentifier,
      subjectType: args.subjectType,
      subjectId: args.subjectId,
      targetType: subjectSnapshot.targetType,
      targetId: subjectSnapshot.targetId,
      targetTitle: subjectSnapshot.targetTitle,
      targetProjectId: subjectSnapshot.targetProjectId,
      showAt: args.showAt,
      createdAt: Date.now()
    })

    // Schedule the promotion job for when the follow-up is due
    const jobId = await ctx.scheduler.runAt(args.showAt, internal.engagement.promoteFollowUpToInbox, { followUpId: id })
    await ctx.db.patch(id, { scheduledJobId: jobId })

    await createNotificationRecord(ctx, {
      organizationId: context.organization._id,
      recipientTokenIdentifier: context.identity.tokenIdentifier,
      actorTokenIdentifier: context.identity.tokenIdentifier,
      reason: 'follow_up',
      inboxKey: `${args.subjectType.toLowerCase()}:${args.subjectId}:follow_up`,
      subjectType: args.subjectType,
      subjectId: args.subjectId,
      targetType: subjectSnapshot.targetType,
      targetId: subjectSnapshot.targetId,
      targetTitle: subjectSnapshot.targetTitle,
      targetProjectId: subjectSnapshot.targetProjectId,
      followUpSubjectType: args.subjectType,
      followUpSubjectId: args.subjectId,
      bodyPreviewPrefix: 'Follow up',
      bodyPreview: subjectSnapshot.subjectBodyPreview
    })

    return await buildLegacyFollowUp(
      ctx,
      args.slug,
      context.organization._id,
      await ctx.db.get(id),
      context.identity.tokenIdentifier
    )
  }
})

export const updateLegacyFollowUp = mutation({
  args: {
    slug: v.string(),
    id: v.string(),
    showAt: v.number()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const followUp: any = await ctx.db.get(args.id as any)
    if (
      !followUp ||
      followUp.organizationId !== context.organization._id ||
      followUp.userTokenIdentifier !== context.identity.tokenIdentifier
    ) {
      throw createError('Follow-up not found', 'not_found')
    }

    await ctx.db.patch(followUp._id, { showAt: args.showAt })

    // Cancel old scheduled job and schedule a new one
    if (followUp.scheduledJobId) {
      try { await ctx.scheduler.cancel(followUp.scheduledJobId) } catch { /* already ran or cancelled */ }
    }
    const jobId = await ctx.scheduler.runAt(args.showAt, internal.engagement.promoteFollowUpToInbox, { followUpId: followUp._id })
    await ctx.db.patch(followUp._id, { scheduledJobId: jobId })

    return await buildLegacyFollowUp(
      ctx,
      args.slug,
      context.organization._id,
      (await ctx.db.get(followUp._id)) || followUp,
      context.identity.tokenIdentifier
    )
  }
})

export const deleteLegacyFollowUp = mutation({
  args: {
    slug: v.string(),
    id: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const followUp: any = await ctx.db.get(args.id as any)
    if (
      !followUp ||
      followUp.organizationId !== context.organization._id ||
      followUp.userTokenIdentifier !== context.identity.tokenIdentifier
    ) {
      throw createError('Follow-up not found', 'not_found')
    }

    await ctx.db.delete(followUp._id)

    // Cancel the scheduled promotion job
    if (followUp.scheduledJobId) {
      try { await ctx.scheduler.cancel(followUp.scheduledJobId) } catch { /* already ran or cancelled */ }
    }

    await archiveNotificationsByInboxKey(ctx, {
      organizationId: context.organization._id,
      recipientTokenIdentifier: context.identity.tokenIdentifier,
      inboxKey: `${followUp.subjectType.toLowerCase()}:${followUp.subjectId}:follow_up`
    })

    return {}
  }
})

export const createLegacySubscription = mutation({
  args: {
    slug: v.string(),
    subscribableType: v.union(...subscriptionTypeValues),
    subscribableId: v.string(),
    cascade: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const existing = await ctx.db
      .query('subscriptions')
      .withIndex('by_organization_user_and_subject', (q: any) =>
        q
          .eq('organizationId', context.organization._id)
          .eq('userTokenIdentifier', context.identity.tokenIdentifier)
          .eq('subscribableType', args.subscribableType)
          .eq('subscribableId', args.subscribableId)
      )
      .unique()

    if (!existing) {
      await ctx.db.insert('subscriptions', {
        organizationId: context.organization._id,
        userTokenIdentifier: context.identity.tokenIdentifier,
        subscribableType: args.subscribableType,
        subscribableId: args.subscribableId,
        cascade: args.cascade,
        createdAt: Date.now()
      })
    } else if (args.subscribableType === 'Project') {
      await ctx.db.patch(existing._id, { cascade: args.cascade })
    }

    return {}
  }
})

export const deleteLegacySubscription = mutation({
  args: {
    slug: v.string(),
    subscribableType: v.union(...subscriptionTypeValues),
    subscribableId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const existing = await ctx.db
      .query('subscriptions')
      .withIndex('by_organization_user_and_subject', (q: any) =>
        q
          .eq('organizationId', context.organization._id)
          .eq('userTokenIdentifier', context.identity.tokenIdentifier)
          .eq('subscribableType', args.subscribableType)
          .eq('subscribableId', args.subscribableId)
      )
      .unique()

    if (existing) {
      await ctx.db.delete(existing._id)
    }

    return {}
  }
})

async function createLegacyReactionRecord(
  ctx: any,
  params: {
    organizationId: any
    tokenIdentifier: string
    subjectType: 'Post' | 'Comment' | 'Message'
    subjectId: string
    content?: string
    customContent?: { id: string; name: string; file_url: string; created_at: string } | null
  }
) {
  const existing = await ctx.db
    .query('reactions')
    .withIndex('by_organization_user_and_subject', (q: any) =>
      q
        .eq('organizationId', params.organizationId)
        .eq('userTokenIdentifier', params.tokenIdentifier)
        .eq('subjectType', params.subjectType)
        .eq('subjectId', params.subjectId)
    )
    .unique()

  if (existing) {
    await ctx.db.patch(existing._id, {
      content: params.content,
      customContent: params.customContent ?? undefined,
      createdAt: Date.now()
    })
    return (await ctx.db.get(existing._id)) || existing
  }

  const id = await ctx.db.insert('reactions', {
    organizationId: params.organizationId,
    userTokenIdentifier: params.tokenIdentifier,
    subjectType: params.subjectType,
    subjectId: params.subjectId,
    content: params.content,
    customContent: params.customContent ?? undefined,
    createdAt: Date.now()
  })

  return await ctx.db.get(id)
}

export const createLegacyReaction = mutation({
  args: {
    slug: v.string(),
    subjectType: v.union(...reactionSubjectTypeValues),
    subjectId: v.string(),
    content: v.optional(v.string()),
    customContent: v.optional(
      v.object({
        id: v.string(),
        name: v.string(),
        file_url: v.string(),
        created_at: v.string()
      })
    )
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const reaction = await createLegacyReactionRecord(ctx, {
      organizationId: context.organization._id,
      tokenIdentifier: context.identity.tokenIdentifier,
      subjectType: args.subjectType,
      subjectId: args.subjectId,
      content: args.content,
      customContent: args.customContent ?? null
    })

    if (!reaction) {
      throw createError('Reaction could not be created', 'unprocessable')
    }

    const [user, membership, subject] = await Promise.all([
      getUserByTokenIdentifier(ctx, context.identity.tokenIdentifier),
      getMembership(ctx, context.organization._id, context.identity.tokenIdentifier),
      getSubjectRecord(ctx, context.organization._id, args.subjectType, args.subjectId)
    ])

    const recipientTokenIdentifier = subject?.authorTokenIdentifier ?? subject?.senderTokenIdentifier

    if (recipientTokenIdentifier) {
      const targetTitle =
        args.subjectType === 'Post'
          ? subject.title || stripHtml(subject.descriptionHtml)
          : args.subjectType === 'Comment'
            ? stripHtml(subject.bodyHtml)
            : stripHtml(subject.content) || (subject.attachments?.length ? 'Attachment' : 'Message')
      const projectId = await getSubjectProjectId(ctx, context.organization._id, args.subjectType, args.subjectId)

      await createNotificationRecord(ctx, {
        organizationId: context.organization._id,
        recipientTokenIdentifier,
        actorTokenIdentifier: context.identity.tokenIdentifier,
        reason: 'author',
        inboxKey: `${args.subjectType.toLowerCase()}:${args.subjectId}:reaction`,
        subjectType: args.subjectType,
        subjectId: args.subjectId,
        targetType: args.subjectType,
        targetId: args.subjectId,
        targetTitle,
        targetProjectId: projectId,
        reactionContent: args.content,
        reactionCustomContent: args.customContent ?? null,
        bodyPreviewPrefix: 'Reacted to',
        bodyPreview: targetTitle
      })
    }

    return {
      id: reaction._id,
      content: reaction.content ?? null,
      member: buildLegacyMember(membership, user),
      custom_content: reaction.customContent ?? null
    }
  }
})

export const deleteLegacyReaction = mutation({
  args: {
    slug: v.string(),
    reactionId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const reaction: any = await ctx.db.get(args.reactionId as any)
    if (
      !reaction ||
      reaction.organizationId !== context.organization._id ||
      reaction.userTokenIdentifier !== context.identity.tokenIdentifier
    ) {
      throw createError('Reaction not found', 'not_found')
    }

    await ctx.db.delete(reaction._id)

    return {}
  }
})
