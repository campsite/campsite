import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
import {
  buildLegacyMembershipStatusFromRow,
  clearOrganizationMembershipStatus,
  getLatestMembershipStatusRow,
  getUserPreferencesMap,
  upsertOrganizationMembershipStatus,
  upsertUserPreference
} from './accountShell'
import { buildLegacyMember, buildLegacyUser, formatDate } from './legacy'
import { buildWorkspaceState } from './workspace'

const weekdayValues = [
  v.literal('Sunday'),
  v.literal('Monday'),
  v.literal('Tuesday'),
  v.literal('Wednesday'),
  v.literal('Thursday'),
  v.literal('Friday'),
  v.literal('Saturday')
] as const

const statusExpirationValues = [
  v.literal('30m'),
  v.literal('1h'),
  v.literal('4h'),
  v.literal('today'),
  v.literal('this_week'),
  v.literal('custom')
] as const
const RECENT_STATUSES_PREFERENCE_PREFIX = 'recent_statuses:'

function createError(message: string, code: string) {
  return new Error(`${code}:${message}`)
}

function getRecentStatusesPreferenceKey(slug: string) {
  return `${RECENT_STATUSES_PREFERENCE_PREFIX}${slug}`
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

function isNotificationArchived(notification: any) {
  return !!notification.archivedAt
}

function isNotificationRead(notification: any) {
  return !!notification.readAt
}

function buildMiniProject(project: any) {
  if (!project) {
    return null
  }

  return {
    id: project._id,
    name: project.name,
    accessory: project.accessory ?? null,
    private: project.private,
    archived: !!project.archivedAt,
    message_thread_id: project.messageThreadId ?? null
  }
}

async function buildNotificationTarget(ctx: any, notification: any) {
  const project = await getProjectById(ctx, notification.organizationId, notification.targetProjectId)

  return {
    id: notification.targetId,
    type: notification.targetType,
    title: notification.targetTitle,
    project: buildMiniProject(project),
    resolved: notification.targetResolved ?? false
  }
}

async function buildNotificationSubject(notification: any) {
  return {
    id: notification.subjectId,
    type: notification.subjectType,
    title: notification.subjectTitle ?? notification.targetTitle
  }
}

async function buildNotificationSubtarget(notification: any) {
  if (!notification.subtargetId || !notification.subtargetType) {
    return null
  }

  return {
    id: notification.subtargetId,
    type: notification.subtargetType
  }
}

async function buildNotificationActor(ctx: any, notification: any) {
  const actorUser = await getUserByTokenIdentifier(ctx, notification.actorTokenIdentifier)

  if (!actorUser) {
    return null
  }

  return buildLegacyUser(actorUser)
}

async function buildNotificationFollowUpSubject(ctx: any, notification: any) {
  if (!notification.followUpSubjectId || !notification.followUpSubjectType) {
    return null
  }

  const recipientMembership = await getMembership(ctx, notification.organizationId, notification.recipientTokenIdentifier)
  if (!recipientMembership) {
    return null
  }

  const followUps = await ctx.db
    .query('followUps')
    .withIndex('by_subject', (q: any) =>
      q.eq('subjectType', notification.followUpSubjectType).eq('subjectId', notification.followUpSubjectId)
    )
    .collect()

  const viewerFollowUp = followUps.find((followUp: any) => followUp.userTokenIdentifier === notification.recipientTokenIdentifier)

  return {
    id: notification.followUpSubjectId,
    type: notification.followUpSubjectType,
    viewer_follow_up: viewerFollowUp
      ? {
          id: viewerFollowUp._id,
          member: buildLegacyMember(recipientMembership, await getUserByTokenIdentifier(ctx, notification.recipientTokenIdentifier)),
          show_at: new Date(viewerFollowUp.showAt).toISOString(),
          belongs_to_viewer: true
        }
      : null
  }
}

async function buildLegacyNotification(ctx: any, notification: any, organizationSlug: string) {
  const actor = await buildNotificationActor(ctx, notification)
  const target = await buildNotificationTarget(ctx, notification)
  const subject = await buildNotificationSubject(notification)
  const subtarget = await buildNotificationSubtarget(notification)
  const followUpSubject = await buildNotificationFollowUpSubject(ctx, notification)

  return {
    id: notification._id,
    inbox_key: notification.inboxKey,
    is_inbox: notification.isInbox,
    created_at: new Date(notification.createdAt).toISOString(),
    summary: notification.bodyPreviewPrefix
      ? `${notification.bodyPreviewPrefix} ${notification.bodyPreview ?? ''}`.trim()
      : notification.targetTitle,
    read: isNotificationRead(notification),
    archived: isNotificationArchived(notification),
    organization_slug: organizationSlug,
    preview_url: notification.previewUrl ?? null,
    preview_is_canvas: notification.previewIsCanvas ?? false,
    reply_to_body_preview: notification.replyToBodyPreview ?? null,
    body_preview_prefix: notification.bodyPreviewPrefix ?? null,
    body_preview_prefix_fallback: notification.bodyPreviewPrefixFallback ?? null,
    body_preview: notification.bodyPreview ?? null,
    summary_blocks: [{ text: { content: notification.targetTitle } }],
    activity_seen: notification.activitySeen ?? false,
    reason: notification.reason,
    actor,
    subject,
    target,
    subtarget,
    reaction: notification.reactionContent || notification.reactionCustomContent
      ? {
          content: notification.reactionContent ?? null,
          custom_content: notification.reactionCustomContent ?? null
        }
      : null,
    follow_up_subject: followUpSubject
  }
}

async function getOrganizationNotificationsForRecipient(ctx: any, organizationId: any, recipientTokenIdentifier: string) {
  return await ctx.db
    .query('notifications')
    .withIndex('by_organization_and_recipient', (q: any) =>
      q.eq('organizationId', organizationId).eq('recipientTokenIdentifier', recipientTokenIdentifier)
    )
    .collect()
}

export async function buildLegacyUnreadNotificationCounts(
  ctx: any,
  params?: {
    memberships?: any[]
    tokenIdentifier?: string
  }
) {
  const state = await buildWorkspaceState(ctx)
  const memberships = params?.memberships ?? state.memberships
  const tokenIdentifier = params?.tokenIdentifier ?? state.identity.tokenIdentifier

  const threadMemberships = await ctx.db
    .query('messageThreadMemberships')
    .withIndex('by_user_token_identifier', (q: any) => q.eq('userTokenIdentifier', tokenIdentifier))
    .collect()
  const unreadMessageCountByOrganization = new Map<string, number>()

  for (const membership of threadMemberships) {
    if (!membership.organizationId || !membership.unreadCount) {
      continue
    }

    unreadMessageCountByOrganization.set(
      membership.organizationId,
      (unreadMessageCountByOrganization.get(membership.organizationId) ?? 0) + membership.unreadCount
    )
  }

  const counts = {
    inbox: {} as Record<string, number>,
    messages: {} as Record<string, number>,
    activity: {} as Record<string, number>,
    home_inbox: {} as Record<string, number>
  }

  for (const entry of memberships) {
    if (!entry.organization || entry.membership.discardedAt) {
      continue
    }

    const notifications = await getOrganizationNotificationsForRecipient(ctx, entry.organization._id, tokenIdentifier)
    const activeNotifications = notifications.filter((notification: any) => !notification.archivedAt)
    const unreadNotifications = activeNotifications.filter((notification: any) => !notification.readAt)
    const slug = entry.organization.slug

    counts.inbox[slug] = unreadNotifications.length
    counts.home_inbox[slug] = unreadNotifications.filter((notification: any) => notification.isInbox).length
    counts.activity[slug] = unreadNotifications.filter((notification: any) => !notification.isInbox).length
    counts.messages[slug] = unreadMessageCountByOrganization.get(entry.organization._id) ?? 0
  }

  return counts
}

function getActiveStatusPauseExpiresAt(membership: any) {
  if (!membership?.statusPauseNotifications || !membership?.statusExpiresAt) {
    return null
  }

  if ((!membership.statusEmoji && !membership.statusMessage) || membership.statusExpiresAt <= Date.now()) {
    return null
  }

  return membership.statusExpiresAt
}

async function getMaxActiveStatusPauseExpiresAt(ctx: any, tokenIdentifier: string) {
  const memberships = await ctx.db
    .query('organizationMemberships')
    .withIndex('by_user_token_identifier', (q: any) => q.eq('userTokenIdentifier', tokenIdentifier))
    .collect()

  let maxExpiresAt: number | null = null

  for (const membership of memberships) {
    const expiresAt = getActiveStatusPauseExpiresAt(membership)

    if (expiresAt && (!maxExpiresAt || expiresAt > maxExpiresAt)) {
      maxExpiresAt = expiresAt
    }
  }

  return maxExpiresAt
}

async function syncUserNotificationPauseFromStatuses(
  ctx: any,
  tokenIdentifier: string,
  previousStatusPauseExpiresAt?: number | null
) {
  const user = await getUserByTokenIdentifier(ctx, tokenIdentifier)

  if (!user) {
    return
  }

  const now = Date.now()
  const currentPauseExpiresAt =
    user.notificationPauseExpiresAt && user.notificationPauseExpiresAt > now ? user.notificationPauseExpiresAt : null
  const statusPauseExpiresAt = await getMaxActiveStatusPauseExpiresAt(ctx, tokenIdentifier)

  let nextPauseExpiresAt = currentPauseExpiresAt

  if (!nextPauseExpiresAt) {
    nextPauseExpiresAt = statusPauseExpiresAt
  } else if (statusPauseExpiresAt && statusPauseExpiresAt > nextPauseExpiresAt) {
    nextPauseExpiresAt = statusPauseExpiresAt
  } else if (previousStatusPauseExpiresAt && currentPauseExpiresAt === previousStatusPauseExpiresAt) {
    nextPauseExpiresAt = statusPauseExpiresAt
  }

  await ctx.db.patch(user._id, {
    notificationPauseExpiresAt: nextPauseExpiresAt ?? undefined
  })
}

function shouldIncludeNotification(
  notification: any,
  options: {
    archived?: boolean
    unread?: boolean
    filter?: 'home' | 'grouped_home' | 'activity'
    homeOnly?: boolean
  }
) {
  if (options.archived ? !notification.archivedAt : !!notification.archivedAt) {
    return false
  }

  if (options.unread && notification.readAt) {
    return false
  }

  if (options.homeOnly && !notification.isInbox) {
    return false
  }

  if (!options.filter) {
    return true
  }

  if (options.filter === 'home' || options.filter === 'grouped_home') {
    return notification.isInbox
  }

  if (options.filter === 'activity') {
    return !notification.isInbox
  }

  return true
}

async function resolveMembershipStatus(ctx: any, membership: any) {
  const latest = await getLatestMembershipStatusRow(ctx, membership)
  const fromRow = buildLegacyMembershipStatusFromRow(latest)

  if (fromRow) {
    return fromRow
  }

  if (!membership.statusEmoji && !membership.statusMessage) {
    return null
  }

  if (membership.statusExpiresAt && membership.statusExpiresAt <= Date.now()) {
    return null
  }

  const expirationSetting = membership.statusExpirationSetting ?? 'custom'

  return {
    message: membership.statusMessage ?? '',
    emoji: membership.statusEmoji ?? '',
    expiration_setting: expirationSetting,
    expires_at: formatDate(membership.statusExpiresAt),
    pause_notifications: membership.statusPauseNotifications ?? false,
    expires_in: expirationSetting
  }
}

function parseRecentStatuses(preferences: Record<string, string> | undefined, slug: string) {
  const raw = preferences?.[getRecentStatusesPreferenceKey(slug)]

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((entry) => entry && typeof entry === 'object')
  } catch {
    return []
  }
}

function dedupeStatuses(statuses: any[]) {
  const seen = new Set<string>()

  return statuses.filter((status) => {
    const key = JSON.stringify([
      status?.emoji ?? '',
      status?.message ?? '',
      status?.expiration_setting ?? 'custom',
      status?.pause_notifications ?? false
    ])

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

async function storeRecentStatus(ctx: any, tokenIdentifier: string, slug: string, status: any) {
  const user = await getUserByTokenIdentifier(ctx, tokenIdentifier)

  if (!user || !status) {
    return
  }

  const preferences = await getUserPreferencesMap(ctx, user)
  const existing = parseRecentStatuses(preferences, slug)
  const recent = dedupeStatuses([status, ...existing]).slice(0, 8)
  await upsertUserPreference(ctx, user, getRecentStatusesPreferenceKey(slug), JSON.stringify(recent))
}

export async function createNotificationRecord(
  ctx: any,
  params: {
    organizationId: any
    recipientTokenIdentifier: string
    actorTokenIdentifier: string
    reason:
      | 'mention'
      | 'parent_subscription'
      | 'author'
      | 'feedback_requested'
      | 'project_subscription'
      | 'permission_granted'
      | 'comment_resolved'
      | 'added'
      | 'subject_archived'
      | 'follow_up'
      | 'post_resolved'
      | 'post_resolved_from_comment'
      | 'processing_complete'
    inboxKey: string
    subjectType: string
    subjectId: string
    subjectTitle?: string
    targetType: string
    targetId: string
    targetTitle: string
    targetProjectId?: string
    targetResolved?: boolean
    subtargetType?: string
    subtargetId?: string
    reactionContent?: string
    reactionCustomContent?: { id: string; name: string; file_url: string; created_at: string } | null
    followUpSubjectType?: string
    followUpSubjectId?: string
    previewUrl?: string
    previewIsCanvas?: boolean
    replyToBodyPreview?: string
    bodyPreviewPrefix?: string
    bodyPreviewPrefixFallback?: string
    bodyPreview?: string
    isInbox?: boolean
    allowSelf?: boolean
  }
) {
  if (!params.allowSelf && params.actorTokenIdentifier === params.recipientTokenIdentifier) {
    return null
  }

  const existing = await ctx.db
    .query('notifications')
    .withIndex('by_organization_and_recipient', (q: any) =>
      q.eq('organizationId', params.organizationId).eq('recipientTokenIdentifier', params.recipientTokenIdentifier)
    )
    .collect()

  const matching = existing.find(
    (notification: any) =>
      notification.inboxKey === params.inboxKey &&
      notification.targetId === params.targetId &&
      notification.targetType === params.targetType &&
      !notification.archivedAt
  )

  if (matching) {
    await ctx.db.patch(matching._id, {
      actorTokenIdentifier: params.actorTokenIdentifier,
      activitySeen: false,
      archivedAt: undefined,
      bodyPreview: params.bodyPreview,
      bodyPreviewPrefix: params.bodyPreviewPrefix,
      bodyPreviewPrefixFallback: params.bodyPreviewPrefixFallback,
      createdAt: Date.now(),
      followUpSubjectId: params.followUpSubjectId,
      followUpSubjectType: params.followUpSubjectType,
      previewIsCanvas: params.previewIsCanvas,
      previewUrl: params.previewUrl,
      readAt: undefined,
      reactionContent: params.reactionContent,
      reactionCustomContent: params.reactionCustomContent ?? undefined,
      replyToBodyPreview: params.replyToBodyPreview,
      subtargetId: params.subtargetId,
      subtargetType: params.subtargetType,
      subjectId: params.subjectId,
      subjectTitle: params.subjectTitle,
      subjectType: params.subjectType,
      targetProjectId: params.targetProjectId,
      targetResolved: params.targetResolved,
      targetTitle: params.targetTitle
    })

    return matching._id
  }

  return await ctx.db.insert('notifications', {
    organizationId: params.organizationId,
    recipientTokenIdentifier: params.recipientTokenIdentifier,
    actorTokenIdentifier: params.actorTokenIdentifier,
    reason: params.reason,
    inboxKey: params.inboxKey,
    isInbox: params.isInbox !== false,
    activitySeen: false,
    subjectType: params.subjectType,
    subjectId: params.subjectId,
    subjectTitle: params.subjectTitle,
    targetType: params.targetType,
    targetId: params.targetId,
    targetTitle: params.targetTitle,
    targetProjectId: params.targetProjectId,
    targetResolved: params.targetResolved,
    subtargetType: params.subtargetType,
    subtargetId: params.subtargetId,
    reactionContent: params.reactionContent,
    reactionCustomContent: params.reactionCustomContent ?? undefined,
    followUpSubjectType: params.followUpSubjectType,
    followUpSubjectId: params.followUpSubjectId,
    previewUrl: params.previewUrl,
    previewIsCanvas: params.previewIsCanvas,
    replyToBodyPreview: params.replyToBodyPreview,
    bodyPreviewPrefix: params.bodyPreviewPrefix,
    bodyPreviewPrefixFallback: params.bodyPreviewPrefixFallback,
    bodyPreview: params.bodyPreview,
    createdAt: Date.now()
  })
}

export const getLegacyUnreadNotificationCounts = query({
  args: {},
  handler: async (ctx) => {
    return await buildLegacyUnreadNotificationCounts(ctx)
  }
})

export const getLegacyNotificationsPage = query({
  args: {
    slug: v.string(),
    unread: v.optional(v.boolean()),
    filter: v.optional(v.union(v.literal('home'), v.literal('grouped_home'), v.literal('activity'))),
    archived: v.optional(v.boolean()),
    after: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const notifications = await getOrganizationNotificationsForRecipient(
      ctx,
      context.organization._id,
      context.identity.tokenIdentifier
    )

    const filtered = notifications
      .filter((notification: any) =>
        shouldIncludeNotification(notification, {
          archived: args.archived,
          unread: args.unread,
          filter: args.filter
        })
      )
      .sort((a: any, b: any) => b.createdAt - a.createdAt)

    const limit = Math.max(1, Math.min(args.limit ?? 20, 100))
    const startIndex = args.after ? filtered.findIndex((notification: any) => notification._id === args.after) + 1 : 0
    const page = filtered.slice(Math.max(0, startIndex), Math.max(0, startIndex) + limit)

    return {
      data: await Promise.all(page.map((notification: any) => buildLegacyNotification(ctx, notification, args.slug))),
      next_cursor: startIndex + limit < filtered.length ? page[page.length - 1]?._id ?? null : null,
      prev_cursor: null
    }
  }
})

export const markLegacyNotificationRead = mutation({
  args: {
    slug: v.string(),
    notificationId: v.string(),
    read: v.boolean()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const notifications = await getOrganizationNotificationsForRecipient(
      ctx,
      context.organization._id,
      context.identity.tokenIdentifier
    )
    const notification = notifications.find((entry: any) => entry._id === args.notificationId)

    if (!notification) {
      throw createError('Notification not found', 'not_found')
    }

    await ctx.db.patch(notification._id, {
      activitySeen: args.read ? true : notification.activitySeen,
      readAt: args.read ? Date.now() : undefined
    })

    return {}
  }
})

export const markLegacyNotificationsRead = mutation({
  args: {
    slug: v.string(),
    homeOnly: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const notifications = await getOrganizationNotificationsForRecipient(
      ctx,
      context.organization._id,
      context.identity.tokenIdentifier
    )

    for (const notification of notifications) {
      if (
        shouldIncludeNotification(notification, {
          homeOnly: args.homeOnly
        })
      ) {
        await ctx.db.patch(notification._id, {
          activitySeen: true,
          readAt: Date.now()
        })
      }
    }

    return {}
  }
})

export const deleteLegacyNotification = mutation({
  args: {
    slug: v.string(),
    notificationId: v.string(),
    archiveBy: v.optional(v.union(v.literal('id'), v.literal('target')))
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const notifications = await getOrganizationNotificationsForRecipient(
      ctx,
      context.organization._id,
      context.identity.tokenIdentifier
    )
    const notification = notifications.find((entry: any) => entry._id === args.notificationId)

    if (!notification) {
      throw createError('Notification not found', 'not_found')
    }

    const targetNotifications =
      args.archiveBy === 'target'
        ? notifications.filter((entry: any) => entry.inboxKey === notification.inboxKey)
        : [notification]

    for (const entry of targetNotifications) {
      await ctx.db.patch(entry._id, {
        activitySeen: true,
        archivedAt: Date.now(),
        readAt: entry.readAt ?? Date.now()
      })
    }

    return {}
  }
})

export const unarchiveLegacyNotification = mutation({
  args: {
    slug: v.string(),
    notificationId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const notifications = await getOrganizationNotificationsForRecipient(
      ctx,
      context.organization._id,
      context.identity.tokenIdentifier
    )
    const notification = notifications.find((entry: any) => entry._id === args.notificationId)

    if (!notification) {
      throw createError('Notification not found', 'not_found')
    }

    await ctx.db.patch(notification._id, { archivedAt: undefined })

    return {}
  }
})

export const deleteAllLegacyNotifications = mutation({
  args: {
    slug: v.string(),
    readOnly: v.optional(v.boolean()),
    homeOnly: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const notifications = await getOrganizationNotificationsForRecipient(
      ctx,
      context.organization._id,
      context.identity.tokenIdentifier
    )

    for (const notification of notifications) {
      if (
        !shouldIncludeNotification(notification, {
          homeOnly: args.homeOnly
        })
      ) {
        continue
      }

      if (args.readOnly && !notification.readAt) {
        continue
      }

      await ctx.db.patch(notification._id, {
        activitySeen: true,
        archivedAt: Date.now(),
        readAt: notification.readAt ?? Date.now()
      })
    }

    return {}
  }
})

export const getLegacyViewerStatuses = query({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      return []
    }

    const [status, user] = await Promise.all([
      resolveMembershipStatus(ctx, context.viewerMembership),
      getUserByTokenIdentifier(ctx, context.identity.tokenIdentifier)
    ])
    const recent = user ? parseRecentStatuses(await getUserPreferencesMap(ctx, user), args.slug) : []

    return dedupeStatuses([...(status ? [status] : []), ...recent])
  }
})

export const upsertLegacyViewerStatus = mutation({
  args: {
    slug: v.string(),
    emoji: v.optional(v.string()),
    message: v.optional(v.string()),
    expirationSetting: v.optional(v.union(...statusExpirationValues)),
    expiresAt: v.optional(v.union(v.number(), v.null())),
    pauseNotifications: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const previousStatusPauseExpiresAt = getActiveStatusPauseExpiresAt(context.viewerMembership)

    await upsertOrganizationMembershipStatus(ctx, context.viewerMembership, {
      emoji: args.emoji,
      message: args.message,
      expirationSetting: args.expirationSetting,
      expiresAt: args.expiresAt,
      pauseNotifications: args.pauseNotifications
    })

    await syncUserNotificationPauseFromStatuses(
      ctx,
      context.identity.tokenIdentifier,
      previousStatusPauseExpiresAt
    )

    const updatedMembership: any = await ctx.db.get(context.viewerMembership._id)

    if (!updatedMembership) {
      throw createError('Status could not be created', 'unprocessable')
    }

    const status = await resolveMembershipStatus(ctx, updatedMembership)

    if (!status) {
      throw createError('Status could not be created', 'unprocessable')
    }

    await storeRecentStatus(ctx, context.identity.tokenIdentifier, args.slug, status)

    return status
  }
})

export const deleteLegacyViewerStatus = mutation({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const previousStatusPauseExpiresAt = getActiveStatusPauseExpiresAt(context.viewerMembership)

    await clearOrganizationMembershipStatus(ctx, context.viewerMembership)

    await syncUserNotificationPauseFromStatuses(
      ctx,
      context.identity.tokenIdentifier,
      previousStatusPauseExpiresAt
    )

    return {}
  }
})

export const createLegacyNotificationPause = mutation({
  args: {
    expiresAt: v.number()
  },
  handler: async (ctx, args) => {
    const { identity, user } = await buildWorkspaceState(ctx)
    const statusPauseExpiresAt = await getMaxActiveStatusPauseExpiresAt(ctx, identity.tokenIdentifier)

    await ctx.db.patch(user._id, {
      notificationPauseExpiresAt: Math.max(args.expiresAt, statusPauseExpiresAt ?? 0) || args.expiresAt
    })

    return {}
  }
})

export const deleteLegacyNotificationPause = mutation({
  args: {},
  handler: async (ctx) => {
    const { identity, user } = await buildWorkspaceState(ctx)
    const statusPauseExpiresAt = await getMaxActiveStatusPauseExpiresAt(ctx, identity.tokenIdentifier)

    await ctx.db.patch(user._id, {
      notificationPauseExpiresAt: statusPauseExpiresAt ?? undefined
    })

    return {}
  }
})

export const getLegacyNotificationSchedule = query({
  args: {},
  handler: async (ctx) => {
    const { identity } = await buildWorkspaceState(ctx)
    const schedule = await ctx.db
      .query('notificationSchedules')
      .withIndex('by_user_token_identifier', (q: any) => q.eq('userTokenIdentifier', identity.tokenIdentifier))
      .unique()

    if (!schedule) {
      return {
        type: 'none',
        custom: null
      }
    }

    return schedule.type === 'custom'
      ? {
          type: 'custom',
          custom: {
            days: schedule.days ?? [],
            start_time: schedule.startTime ?? '09:00',
            end_time: schedule.endTime ?? '17:00'
          }
        }
      : {
          type: 'none',
          custom: null
        }
  }
})

export const updateLegacyNotificationSchedule = mutation({
  args: {
    days: v.array(v.union(...weekdayValues)),
    startTime: v.string(),
    endTime: v.string()
  },
  handler: async (ctx, args) => {
    const { identity } = await buildWorkspaceState(ctx)
    const existing = await ctx.db
      .query('notificationSchedules')
      .withIndex('by_user_token_identifier', (q: any) => q.eq('userTokenIdentifier', identity.tokenIdentifier))
      .unique()

    const payload = {
      userTokenIdentifier: identity.tokenIdentifier,
      type: 'custom' as const,
      days: args.days,
      startTime: args.startTime,
      endTime: args.endTime,
      updatedAt: Date.now()
    }

    if (existing) {
      await ctx.db.patch(existing._id, payload)
    } else {
      await ctx.db.insert('notificationSchedules', payload)
    }

    return {}
  }
})

export const deleteLegacyNotificationSchedule = mutation({
  args: {},
  handler: async (ctx) => {
    const { identity } = await buildWorkspaceState(ctx)
    const existing = await ctx.db
      .query('notificationSchedules')
      .withIndex('by_user_token_identifier', (q: any) => q.eq('userTokenIdentifier', identity.tokenIdentifier))
      .unique()

    if (existing) {
      await ctx.db.delete(existing._id)
    }

    return {}
  }
})

export const getLegacyScheduledNotifications = query({
  args: {},
  handler: async (ctx) => {
    const { identity } = await buildWorkspaceState(ctx)
    const rows = await ctx.db
      .query('scheduledNotifications')
      .withIndex('by_user_token_identifier', (q: any) => q.eq('userTokenIdentifier', identity.tokenIdentifier))
      .collect()

    const deduped = new Map<string, any>()

    for (const row of rows.sort((a: any, b: any) => a.createdAt - b.createdAt || a.updatedAt - b.updatedAt)) {
      deduped.set(row.name, row)
    }

    return Array.from(deduped.values())
      .sort((a: any, b: any) => a.createdAt - b.createdAt || a.updatedAt - b.updatedAt)
      .map((row: any) => ({
        id: row._id,
        name: row.name,
        time_zone: row.timeZone,
        delivery_day: row.deliveryDay ?? null,
        delivery_time: row.deliveryTime
      }))
  }
})

export const createLegacyScheduledNotification = mutation({
  args: {
    name: v.string(),
    timeZone: v.string(),
    deliveryDay: v.optional(v.union(v.string(), v.null())),
    deliveryTime: v.string()
  },
  handler: async (ctx, args) => {
    const { identity } = await buildWorkspaceState(ctx)
    const now = Date.now()
    const rows = await ctx.db
      .query('scheduledNotifications')
      .withIndex('by_user_token_identifier', (q: any) => q.eq('userTokenIdentifier', identity.tokenIdentifier))
      .collect()
    const existing = rows.find((row: any) => row.name === args.name)

    if (existing) {
      await ctx.db.patch(existing._id, {
        deliveryDay: args.deliveryDay || undefined,
        deliveryTime: args.deliveryTime,
        timeZone: args.timeZone,
        updatedAt: now
      })
    } else {
      await ctx.db.insert('scheduledNotifications', {
        userTokenIdentifier: identity.tokenIdentifier,
        name: args.name,
        timeZone: args.timeZone,
        deliveryDay: args.deliveryDay || undefined,
        deliveryTime: args.deliveryTime,
        createdAt: now,
        updatedAt: now
      })
    }

    const row: any = existing
      ? await ctx.db.get(existing._id)
      : (
          await ctx.db
            .query('scheduledNotifications')
            .withIndex('by_user_token_identifier', (q: any) => q.eq('userTokenIdentifier', identity.tokenIdentifier))
            .collect()
        )
          .filter((entry: any) => entry.name === args.name)
          .sort((a: any, b: any) => b.updatedAt - a.updatedAt || b.createdAt - a.createdAt)[0]

    if (!row) {
      throw createError('Scheduled notification could not be created', 'unprocessable_entity')
    }

    return {
      id: row._id,
      name: row.name,
      time_zone: row.timeZone,
      delivery_day: row.deliveryDay ?? null,
      delivery_time: row.deliveryTime
    }
  }
})

export const updateLegacyScheduledNotification = mutation({
  args: {
    id: v.string(),
    timeZone: v.string(),
    deliveryDay: v.optional(v.union(v.string(), v.null())),
    deliveryTime: v.string()
  },
  handler: async (ctx, args) => {
    const { identity } = await buildWorkspaceState(ctx)
    const row: any = await ctx.db.get(args.id as any)

    if (!row || row.userTokenIdentifier !== identity.tokenIdentifier) {
      throw createError('Scheduled notification not found', 'not_found')
    }

    await ctx.db.patch(row._id, {
      timeZone: args.timeZone,
      deliveryDay: args.deliveryDay || undefined,
      deliveryTime: args.deliveryTime,
      updatedAt: Date.now()
    })

    const updated: any = await ctx.db.get(row._id)

    if (!updated) {
      throw createError('Scheduled notification not found', 'not_found')
    }

    return {
      id: updated._id,
      name: updated.name,
      time_zone: updated.timeZone,
      delivery_day: updated.deliveryDay ?? null,
      delivery_time: updated.deliveryTime
    }
  }
})

export const deleteLegacyScheduledNotification = mutation({
  args: {
    id: v.string()
  },
  handler: async (ctx, args) => {
    const { identity } = await buildWorkspaceState(ctx)
    const row: any = await ctx.db.get(args.id as any)

    if (!row || row.userTokenIdentifier !== identity.tokenIdentifier) {
      throw createError('Scheduled notification not found', 'not_found')
    }

    await ctx.db.delete(row._id)

    return {}
  }
})

export const cleanupCallRoomNotifications = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query('notifications').collect()
    let count = 0

    for (const notification of all) {
      if (notification.targetType === 'CallRoom') {
        await ctx.db.delete(notification._id)
        count += 1
      }
    }

    return { deleted: count }
  }
})
