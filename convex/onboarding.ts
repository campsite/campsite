import { v } from 'convex/values'

import type { Id } from './_generated/dataModel'
import { internal } from './_generated/api'
import { mutation, query } from './_generated/server'
import { getLegacyProjectSubscriptionState, hasLegacyFavorite } from './engagement'
import {
  buildLegacyAvatarUrls,
  buildLegacyMediaUrl,
  buildLegacyMember as buildLegacyMemberRecord,
  formatDate
} from './legacy'
import {
  buildLegacyProjectDisplayPreferences,
  defaultProjectDisplayPreferences,
  deleteProjectDisplayPreference,
  getProjectDisplayPreferenceRecord,
  upsertProjectDisplayPreference
} from './projectPreferences'
import { getProjectUnreadForViewer, markProjectRead, markProjectUnread } from './projectViews'
import {
  ensureDefaultOrganizationSettings,
  getOrganizationInvitationProjectIds,
  getOrganizationSettingsMap,
  syncOrganizationInvitationProjects
} from './accountShell'
import {
  buildLegacyOrganization,
  buildWorkspaceState,
  ensureOrganizationScaffold,
  generateToken,
  getViewerIdentity,
  getWorkspaceMemberships
} from './workspace'

const INVITATION_DURATION_MS = 30 * 24 * 60 * 60 * 1000

function createError(message: string, code: string) {
  return new Error(`${code}:${message}`)
}

function normalizeEmail(value?: string | null) {
  const normalized = value?.trim().toLowerCase()

  return normalized || undefined
}

function getEmailDomain(email?: string | null) {
  const normalized = normalizeEmail(email)

  return normalized?.split('@')[1]
}

async function getUserByTokenIdentifier(ctx: any, tokenIdentifier: string) {
  return await ctx.db
    .query('users')
    .withIndex('by_token_identifier', (q: any) => q.eq('tokenIdentifier', tokenIdentifier))
    .unique()
}

async function getOrganizationBySlug(ctx: any, slug: string) {
  return await ctx.db.query('organizations').withIndex('by_slug', (q: any) => q.eq('slug', slug)).unique()
}

async function getOrganizationByInviteToken(ctx: any, inviteToken: string) {
  return await ctx.db
    .query('organizations')
    .withIndex('by_invite_token', (q: any) => q.eq('inviteToken', inviteToken))
    .unique()
}

async function getOrganizationMembership(ctx: any, organizationId: any, userTokenIdentifier: string) {
  return await ctx.db
    .query('organizationMemberships')
    .withIndex('by_organization_and_user', (q: any) =>
      q.eq('organizationId', organizationId).eq('userTokenIdentifier', userTokenIdentifier)
    )
    .unique()
}

async function getOrganizationContext(ctx: any, slug: string) {
  const state = await buildWorkspaceState(ctx)
  const viewerEntry = state.memberships.find((entry: any) => entry.organization?.slug === slug)

  if (!viewerEntry?.organization) {
    return null
  }

  return {
    ...state,
    organization: viewerEntry.organization,
    viewerMembership: viewerEntry.membership
  }
}

async function getOrganizationProjects(ctx: any, organizationId: any) {
  return await ctx.db.query('projects').withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId)).collect()
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

async function getOrganizationProjectById(ctx: any, organizationId: any, projectId: string) {
  const projects = await getOrganizationProjects(ctx, organizationId)

  return projects.find((project: any) => project._id === projectId) ?? null
}

async function getProjectByInviteToken(ctx: any, inviteToken: string) {
  return await ctx.db
    .query('projects')
    .withIndex('by_invite_token', (q: any) => q.eq('inviteToken', inviteToken))
    .unique()
}

async function getOrganizationInvitationById(ctx: any, organizationId: any, invitationId: string) {
  const invitations = await ctx.db
    .query('organizationInvitations')
    .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId))
    .collect()

  return invitations.find((invitation: any) => invitation._id === invitationId) ?? null
}

async function getProjectsByIds(ctx: any, organizationId: any, projectIds: string[]) {
  const validProjectIds = new Set(projectIds)
  const projects = await getOrganizationProjects(ctx, organizationId)

  return projects.filter((project: any) => validProjectIds.has(project._id))
}

async function getOrganizationMemberships(ctx: any, organizationId: any) {
  return await ctx.db
    .query('organizationMemberships')
    .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId))
    .collect()
}

function getProjectMembershipCounts(projectMemberships: any[]) {
  const guestsCount = projectMemberships.filter((membership: any) => membership.role === 'guest').length

  return {
    guestsCount,
    membersAndGuestsCount: projectMemberships.length,
    membersCount: projectMemberships.length - guestsCount
  }
}

async function getUsersByTokenIdentifiers(ctx: any, tokenIdentifiers: string[]) {
  const uniqueTokenIdentifiers = Array.from(new Set(tokenIdentifiers))
  const users = await Promise.all(uniqueTokenIdentifiers.map((tokenIdentifier) => getUserByTokenIdentifier(ctx, tokenIdentifier)))

  return new Map(users.filter(Boolean).map((user: any) => [user.tokenIdentifier, user]))
}

function paginateItems<T extends { _cursor: string }>(items: T[], limit?: number, after?: string) {
  const safeLimit = Math.max(1, Math.min(limit || 50, 100))
  const startIndex = after ? items.findIndex((item) => item._cursor === after) + 1 : 0
  const normalizedStartIndex = Math.max(0, startIndex)
  const page = items.slice(normalizedStartIndex, normalizedStartIndex + safeLimit)

  return {
    data: page,
    next_cursor: normalizedStartIndex + safeLimit < items.length ? page.at(-1)?._cursor ?? null : null,
    prev_cursor: null
  }
}

function viewerCanManageProject(project: any, viewerMembership: any, viewerTokenIdentifier: string) {
  return viewerMembership.role === 'admin' || project.creatorTokenIdentifier === viewerTokenIdentifier
}

function viewerCanAccessProject(project: any, viewerMembership: any, viewerTokenIdentifier: string, viewerIsMember: boolean) {
  return !project.private || viewerMembership.role === 'admin' || viewerIsMember || project.creatorTokenIdentifier === viewerTokenIdentifier
}

function buildLegacyProjectInvitationUrl(project: any) {
  return {
    invitation_url: project.inviteToken ? `/guest/${project.inviteToken}` : ''
  }
}

function buildLegacyPublicOrganization(organization: any, viewerMembership?: any | null) {
  const avatarUrl = buildLegacyMediaUrl(organization.avatarPath ?? organization.avatar_url)

  return {
    id: organization._id,
    avatar_url: avatarUrl || '',
    avatar_urls: buildLegacyAvatarUrls(avatarUrl),
    name: organization.name,
    slug: organization.slug,
    viewer_is_admin: viewerMembership?.role === 'admin',
    viewer_can_leave: viewerMembership ? viewerMembership.role !== 'admin' : false
  }
}

async function getViewerProjectMembership(ctx: any, projectId: any, viewerTokenIdentifier: string) {
  return await ctx.db
    .query('projectMemberships')
    .withIndex('by_project_and_user', (q: any) => q.eq('projectId', projectId).eq('userTokenIdentifier', viewerTokenIdentifier))
    .unique()
}

async function ensureProjectSubscription(
  ctx: any,
  params: {
    organizationId: any
    projectId: any
    userTokenIdentifier: string
  }
) {
  const existing = await ctx.db
    .query('subscriptions')
    .withIndex('by_organization_user_and_subject', (q: any) =>
      q
        .eq('organizationId', params.organizationId)
        .eq('userTokenIdentifier', params.userTokenIdentifier)
        .eq('subscribableType', 'Project')
        .eq('subscribableId', params.projectId)
    )
    .unique()

  if (!existing) {
    await ctx.db.insert('subscriptions', {
      organizationId: params.organizationId,
      userTokenIdentifier: params.userTokenIdentifier,
      subscribableType: 'Project',
      subscribableId: params.projectId,
      cascade: false,
      createdAt: Date.now()
    })
  }
}

async function deleteProjectSubscription(
  ctx: any,
  params: {
    organizationId: any
    projectId: any
    userTokenIdentifier: string
  }
) {
  const existing = await ctx.db
    .query('subscriptions')
    .withIndex('by_organization_user_and_subject', (q: any) =>
      q
        .eq('organizationId', params.organizationId)
        .eq('userTokenIdentifier', params.userTokenIdentifier)
        .eq('subscribableType', 'Project')
        .eq('subscribableId', params.projectId)
    )
    .unique()

  if (existing) {
    await ctx.db.delete(existing._id)
  }
}

async function deleteProjectFavorite(
  ctx: any,
  params: {
    organizationId: any
    projectId: any
    userTokenIdentifier: string
  }
) {
  const existing = await ctx.db
    .query('favorites')
    .withIndex('by_organization_user_and_favoritable', (q: any) =>
      q
        .eq('organizationId', params.organizationId)
        .eq('userTokenIdentifier', params.userTokenIdentifier)
        .eq('favoritableType', 'Project')
        .eq('favoritableId', params.projectId)
    )
    .unique()

  if (existing) {
    await ctx.db.delete(existing._id)
  }
}

async function syncProjectThreadMembership(
  ctx: any,
  params: {
    organizationId: any
    threadPublicId?: string | null
    userTokenIdentifier: string
    remove?: boolean
  }
) {
  if (!params.threadPublicId) {
    return
  }

  const threadRow = await ctx.runQuery((internal as any).threads.getMessageThreadRowByPublicId, {
    organizationId: params.organizationId,
    threadPublicId: params.threadPublicId
  })

  if (!threadRow) {
    return
  }

  const memberships = await ctx.runQuery((internal as any).threads.listMessageThreadMembershipRows, {
    organizationId: params.organizationId,
    threadPublicId: params.threadPublicId
  })

  if (params.remove) {
    await ctx.runMutation((internal as any).threads.deleteMessageThreadMembershipRowByUser, {
      organizationId: params.organizationId,
      threadPublicId: params.threadPublicId,
      tokenIdentifier: params.userTokenIdentifier
    })
  } else {
    const now = Date.now()

    await ctx.runMutation((internal as any).threads.upsertMessageThreadMembershipRow, {
      organizationId: params.organizationId,
      threadPublicId: params.threadPublicId,
      tokenIdentifier: params.userTokenIdentifier,
      dataJson: JSON.stringify({
        publicId: `project-thread-membership_${generateToken()}`,
        userTokenIdentifier: params.userTokenIdentifier,
        notificationLevel: 'all',
        unreadCount: 0,
        manuallyMarkedUnread: false,
        joinedAt: now,
        createdAt: now,
        updatedAt: now
      })
    })
  }

  const participantTokenIdentifiers = Array.from(
    new Set(
      (params.remove
        ? memberships
            .filter((membership: any) => membership.userTokenIdentifier && membership.userTokenIdentifier !== params.userTokenIdentifier)
            .map((membership: any) => membership.userTokenIdentifier)
        : [...(threadRow.participantTokenIdentifiers ?? []), params.userTokenIdentifier]
      ).filter(Boolean)
    )
  )

  await ctx.runMutation((internal as any).threads.upsertMessageThreadRow, {
    organizationId: params.organizationId,
    threadPublicId: params.threadPublicId,
    dataJson: JSON.stringify({
      participantTokenIdentifiers,
      membersCount: participantTokenIdentifiers.length,
      updatedAt: Date.now()
    })
  })
}

async function createProjectMembershipRecord(
  ctx: any,
  params: {
    organizationId: any
    project: any
    userTokenIdentifier: string
  }
) {
  const existing = await ctx.db
    .query('projectMemberships')
    .withIndex('by_project_and_user', (q: any) =>
      q.eq('projectId', params.project._id).eq('userTokenIdentifier', params.userTokenIdentifier)
    )
    .unique()

  if (existing) {
    return existing
  }

  const now = Date.now()
  const membershipId = await ctx.db.insert('projectMemberships', {
    organizationId: params.organizationId,
    projectId: params.project._id,
    userTokenIdentifier: params.userTokenIdentifier,
    createdAt: now
  })

  await ensureProjectSubscription(ctx, {
    organizationId: params.organizationId,
    projectId: params.project._id,
    userTokenIdentifier: params.userTokenIdentifier
  })

  await syncProjectThreadMembership(ctx, {
    organizationId: params.organizationId,
    threadPublicId: params.project.messageThreadId,
    userTokenIdentifier: params.userTokenIdentifier
  })

  return await ctx.db.get(membershipId)
}

async function deleteProjectMembershipRecord(
  ctx: any,
  params: {
    organizationId: any
    project: any
    userTokenIdentifier: string
  }
) {
  const existing = await ctx.db
    .query('projectMemberships')
    .withIndex('by_project_and_user', (q: any) =>
      q.eq('projectId', params.project._id).eq('userTokenIdentifier', params.userTokenIdentifier)
    )
    .unique()

  if (!existing) {
    return
  }

  await ctx.db.delete(existing._id)

  await deleteProjectSubscription(ctx, {
    organizationId: params.organizationId,
    projectId: params.project._id,
    userTokenIdentifier: params.userTokenIdentifier
  })

  await deleteProjectFavorite(ctx, {
    organizationId: params.organizationId,
    projectId: params.project._id,
    userTokenIdentifier: params.userTokenIdentifier
  })

  await syncProjectThreadMembership(ctx, {
    organizationId: params.organizationId,
    threadPublicId: params.project.messageThreadId,
    userTokenIdentifier: params.userTokenIdentifier,
    remove: true
  })
}

async function getProjectMembershipPositionForUser(
  ctx: any,
  params: {
    organizationId: any
    userTokenIdentifier: string
    projectId: string
  }
) {
  const [memberships, projects] = await Promise.all([
    ctx.db
      .query('projectMemberships')
      .withIndex('by_organization_and_user', (q: any) =>
        q.eq('organizationId', params.organizationId).eq('userTokenIdentifier', params.userTokenIdentifier)
      )
      .collect(),
    getOrganizationProjects(ctx, params.organizationId)
  ])
  const projectMap = new Map(projects.map((project: any) => [project._id, project]))

  const orderedMemberships = memberships
    .map((membership: any) => ({
      membership,
      project: projectMap.get(membership.projectId)
    }))
    .filter((entry: any) => !!entry.project)
    .sort((left: any, right: any) => {
      if (left.project.isGeneral && !right.project.isGeneral) return -1
      if (!left.project.isGeneral && right.project.isGeneral) return 1
      return left.membership.createdAt - right.membership.createdAt
    })

  return Math.max(
    0,
    orderedMemberships.findIndex((entry: any) => entry.membership.projectId === params.projectId)
  )
}

async function clearPendingAccessRecords(
  ctx: any,
  params: {
    organizationId: any
    userTokenIdentifier: string
    email?: string
  }
) {
  const request = await ctx.db
    .query('organizationMembershipRequests')
    .withIndex('by_organization_and_user', (q: any) =>
      q.eq('organizationId', params.organizationId).eq('userTokenIdentifier', params.userTokenIdentifier)
    )
    .unique()

  if (request) {
    await ctx.db.delete(request._id)
  }

  if (!params.email) {
    return
  }

  const invitations = await ctx.db
    .query('organizationInvitations')
    .withIndex('by_organization_and_email', (q: any) =>
      q.eq('organizationId', params.organizationId).eq('email', params.email)
    )
    .collect()

  for (const invitation of invitations) {
    await ctx.db.delete(invitation._id)
  }
}

async function createOrRestoreOrganizationMembership(
  ctx: any,
  params: {
    organizationId: any
    userTokenIdentifier: string
    role: 'admin' | 'member' | 'viewer' | 'guest'
  }
) {
  const existingMembership = await getOrganizationMembership(ctx, params.organizationId, params.userTokenIdentifier)

  if (existingMembership) {
    const updates: Record<string, any> = {}

    if (existingMembership.role !== params.role) {
      updates.role = params.role
    }

    if (existingMembership.discardedAt) {
      updates.discardedAt = undefined
    }

    if (!existingMembership.lastSeenAt) {
      updates.lastSeenAt = Date.now()
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(existingMembership._id, updates)
    }

    return (await ctx.db.get(existingMembership._id)) || existingMembership
  }

  const membershipId = await ctx.db.insert('organizationMemberships', {
    createdAt: Date.now(),
    discardedAt: undefined,
    lastSeenAt: Date.now(),
    lastViewedPostsAt: new Date().toISOString(),
    organizationId: params.organizationId,
    publicId: generateToken().slice(0, 12),
    role: params.role,
    updatedAt: Date.now(),
    userTokenIdentifier: params.userTokenIdentifier
  })

  const membership = await ctx.db.get(membershipId)

  if (!membership) {
    throw new Error('Organization membership could not be created')
  }

  return membership
}

async function ensureProjectMemberships(
  ctx: any,
  params: {
    organizationId: any
    userTokenIdentifier: string
    projectIds?: string[]
  }
) {
  const projects = await getOrganizationProjects(ctx, params.organizationId)
  const requested = new Set((params.projectIds ?? []).filter(Boolean))
  const targetProjects = projects.filter((project: any) => project.isDefault || requested.has(project._id))

  for (const project of targetProjects) {
    const existingMembership = await ctx.db
      .query('projectMemberships')
      .withIndex('by_project_and_user', (q: any) =>
        q.eq('projectId', project._id).eq('userTokenIdentifier', params.userTokenIdentifier)
      )
      .unique()

    if (!existingMembership) {
      await ctx.db.insert('projectMemberships', {
        organizationId: params.organizationId,
        projectId: project._id,
        userTokenIdentifier: params.userTokenIdentifier,
        createdAt: Date.now()
      })
    }
  }

  return targetProjects
}

async function buildLegacyMember(ctx: any, organizationId: any, userTokenIdentifier: string) {
  const [user, membership] = await Promise.all([
    getUserByTokenIdentifier(ctx, userTokenIdentifier),
    getOrganizationMembership(ctx, organizationId, userTokenIdentifier)
  ])

  if (!user || !membership) {
    throw new Error('Organization member not found')
  }

  return buildLegacyMemberRecord(membership, user)
}

function buildLegacySuggestedOrganization(params: {
  organization: any
  requested: boolean
  joined?: boolean
}) {
  const { organization, requested, joined } = params
  const avatarUrl = buildLegacyMediaUrl(organization.avatarPath ?? organization.avatar_url)

  return {
    id: organization._id,
    avatar_url: avatarUrl || '',
    avatar_urls: buildLegacyAvatarUrls(avatarUrl),
    name: organization.name,
    slug: organization.slug,
    requested,
    ...(joined === undefined ? {} : { joined })
  }
}

function buildSimpleProject(project: any) {
  return {
    id: project._id,
    name: project.name,
    description: project.description ?? null,
    created_at: new Date(project.createdAt).toISOString(),
    archived_at: formatDate(project.archivedAt),
    accessory: project.accessory ?? null,
    private: project.private,
    is_general: project.isGeneral,
    is_default: project.isDefault
  }
}

async function buildLegacyProject(
  ctx: any,
  params: {
    organization: any
    project: any
    viewerMembership: any
    viewerTokenIdentifier: string
  }
) {
  const { organization, project, viewerMembership, viewerTokenIdentifier } = params
  const [posts, projectMemberships, viewerDisplayPreferences, unreadForViewer] = await Promise.all([
    ctx.db.query('posts').withIndex('by_organization_id', (q: any) => q.eq('organizationId', organization._id)).collect(),
    ctx.db.query('projectMemberships').withIndex('by_project_id', (q: any) => q.eq('projectId', project._id)).collect(),
    getProjectDisplayPreferenceRecord(ctx, {
      projectId: project._id,
      organizationMembershipId: viewerMembership?._id
    }),
    getProjectUnreadForViewer(ctx, {
      organizationId: organization._id,
      projectId: project._id,
      organizationMembershipId: viewerMembership?._id,
      viewerTokenIdentifier,
      messageThreadId: project.messageThreadId
    })
  ])
  const projectPosts = posts.filter((post: any) => post.projectId === project._id)
  const contributorCount = new Set(projectPosts.map((post: any) => post.authorTokenIdentifier)).size
  const viewerIsMember = projectMemberships.some(
    (membership: any) => membership.userTokenIdentifier === viewerTokenIdentifier
  )
  const projectMembershipCounts = getProjectMembershipCounts(projectMemberships)
  const canManage = viewerMembership.role === 'admin'
  const [projectCallRoomUrl, { viewer_has_subscribed, viewer_subscription }, viewer_has_favorited] = await Promise.all([
    getProjectCallRoomUrl(ctx, organization.slug, organization._id, project.messageThreadId),
    getLegacyProjectSubscriptionState(ctx, {
      organizationId: organization._id,
      tokenIdentifier: viewerTokenIdentifier,
      projectId: project._id
    }),
    hasLegacyFavorite(ctx, {
      organizationId: organization._id,
      tokenIdentifier: viewerTokenIdentifier,
      favoritableType: 'Project',
      favoritableId: project._id
    })
  ])

  return {
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
    url: `/${organization.slug}/projects/${project._id}`,
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
    organization_id: organization._id,
    viewer_has_favorited,
    viewer_can_archive: canManage && !project.isGeneral,
    viewer_can_destroy: canManage && !project.isGeneral,
    viewer_can_unarchive: canManage,
    viewer_can_update: canManage || project.creatorTokenIdentifier === viewerTokenIdentifier,
    viewer_has_subscribed,
    viewer_subscription,
    viewer_is_member: viewerIsMember,
    unread_for_viewer: unreadForViewer,
    slack_channel: null,
    type_name: 'project',
    viewer_display_preferences: viewerDisplayPreferences ? buildLegacyProjectDisplayPreferences(viewerDisplayPreferences) : null,
    display_preferences: buildLegacyProjectDisplayPreferences(project)
  }
}

async function buildLegacyProjectMembership(
  ctx: any,
  params: {
    organization: any
    projectMembership: any
    viewerMembership: any
    viewerTokenIdentifier: string
    position: number
  }
) {
  const project = await ctx.db.get(params.projectMembership.projectId)

  if (!project) {
    throw new Error('Project not found')
  }

  return {
    id: params.projectMembership._id,
    position: params.position,
    project: await buildLegacyProject(ctx, {
      organization: params.organization,
      project,
      viewerMembership: params.viewerMembership,
      viewerTokenIdentifier: params.viewerTokenIdentifier
    })
  }
}

async function buildLegacyOrganizationInvitation(ctx: any, invitation: any, includeOwnerFields = false) {
  const organization = await ctx.db.get(invitation.organizationId)

  if (!organization) {
    throw new Error('Organization not found')
  }

  const projects = await getProjectsByIds(ctx, organization._id, await getOrganizationInvitationProjectIds(ctx, invitation))

  return {
    id: invitation._id,
    email: invitation.email,
    role: invitation.role,
    expired: invitation.expiresAt <= Date.now(),
    organization: {
      avatar_url: buildLegacyMediaUrl(organization.avatarPath ?? organization.avatar_url) || '',
      avatar_urls: buildLegacyAvatarUrls(organization.avatarPath ?? organization.avatar_url),
      name: organization.name,
      slug: organization.slug
    },
    projects: projects.map(buildSimpleProject),
    ...(includeOwnerFields ? { token: invitation.inviteToken } : {})
  }
}

function buildInvitationRedirectPath(params: { organizationSlug: string; projects: any[] }) {
  if (params.projects.length === 1) {
    return `/${params.organizationSlug}/projects/${params.projects[0]._id}`
  }

  return `/${params.organizationSlug}`
}

function sortProjects(projects: any[]) {
  return [...projects].sort((left: any, right: any) => {
    if (left.isGeneral && !right.isGeneral) return -1
    if (!left.isGeneral && right.isGeneral) return 1
    if (!!left.archivedAt !== !!right.archivedAt) return left.archivedAt ? 1 : -1
    return right.lastActivityAt - left.lastActivityAt
  })
}

async function createLegacyOrganizationInvitationsInternal(
  ctx: any,
  params: {
    slug: string
    invitations: Array<{
      email: string
      role: string
      project_ids?: string[]
    }>
  }
) {
  const identity = await getViewerIdentity(ctx)
  const context = await getOrganizationContext(ctx, params.slug)

  if (!context) {
    throw new Error('Organization not found')
  }

  if (context.viewerMembership.role !== 'admin') {
    throw new Error('Not allowed to invite members')
  }

  const results = []

  for (const invitation of params.invitations) {
    const email = normalizeEmail(invitation.email)

    if (!email) {
      continue
    }

    const existingInvitation = await ctx.db
      .query('organizationInvitations')
      .withIndex('by_organization_and_email', (q: any) =>
        q.eq('organizationId', context.organization._id).eq('email', email)
      )
      .unique()

    const validProjects = await getProjectsByIds(ctx, context.organization._id, invitation.project_ids ?? [])
    const payload = {
      createdAt: Date.now(),
      email,
      expiresAt: Date.now() + INVITATION_DURATION_MS,
      inviteToken: existingInvitation?.inviteToken || generateToken(),
      organizationId: context.organization._id,
      projectIds: validProjects.map((project: any) => project._id),
      publicId: existingInvitation?.publicId || generateToken().slice(0, 12),
      recipientTokenIdentifier: undefined,
      role:
        invitation.role === 'admin' || invitation.role === 'viewer' || invitation.role === 'guest'
          ? invitation.role
          : 'member',
      senderTokenIdentifier: identity.tokenIdentifier,
      updatedAt: Date.now()
    } as const

    let invitationId = existingInvitation?._id

    if (existingInvitation) {
      await ctx.db.patch(existingInvitation._id, payload)
    } else {
      invitationId = await ctx.db.insert('organizationInvitations', payload)
    }

    const createdInvitation = await ctx.db.get(invitationId!)

    if (createdInvitation) {
      await syncOrganizationInvitationProjects(
        ctx,
        createdInvitation._id,
        validProjects.map((project: any) => project._id)
      )
      results.push(await buildLegacyOrganizationInvitation(ctx, createdInvitation))

      // Send invitation email via Resend
      const sender = await getUserByTokenIdentifier(ctx, identity.tokenIdentifier)
      const senderName = sender?.display_name || sender?.name || identity.name || 'Someone'
      const appUrl = process.env.APP_URL || 'https://campsite-m6ttjz3k3-declans-projects-c9b6a22c.vercel.app'
      const invitationUrl = `${appUrl}/invitation/${createdInvitation.inviteToken}`

      await ctx.scheduler.runAfter(0, (internal as any).email.sendOrganizationInvitation, {
        to: createdInvitation.email,
        senderName,
        organizationName: context.organization.name,
        invitationUrl,
        organizationId: context.organization.publicId
      })
    }
  }

  return results
}

export const getLegacyInvitationUrl = query({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    return {
      invitation_url: context.organization.inviteToken ? `/join/${context.organization.inviteToken}` : ''
    }
  }
})

export const resetLegacyOrganizationInviteToken = mutation({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await getViewerIdentity(ctx)
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    if (context.viewerMembership.role !== 'admin') {
      throw new Error('Not allowed to reset invite token')
    }

    const inviteToken = generateToken()
    await ctx.db.patch(context.organization._id, { inviteToken, updatedAt: Date.now() })

    const memberships = await getWorkspaceMemberships(ctx, identity.tokenIdentifier)
    const updatedOrganization = await ctx.db.get(context.organization._id)
    const currentMembership = await getOrganizationMembership(ctx, context.organization._id, identity.tokenIdentifier)

    if (!updatedOrganization || !currentMembership) {
      throw new Error('Organization could not be reloaded')
    }

    await ensureDefaultOrganizationSettings(ctx, context.organization._id)

    return buildLegacyOrganization({
      memberships,
      membership: currentMembership,
      organization: updatedOrganization,
      settings: await getOrganizationSettingsMap(ctx, updatedOrganization._id)
    })
  }
})

export const getLegacyOrganizationInvitationsPage = query({
  args: {
    slug: v.string(),
    q: v.optional(v.string()),
    role_counted: v.optional(v.boolean()),
    after: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    let invitations = await ctx.db
      .query('organizationInvitations')
      .withIndex('by_organization_id', (q: any) => q.eq('organizationId', context.organization._id))
      .collect()

    if (args.q?.trim()) {
      const queryText = args.q.trim().toLowerCase()
      invitations = invitations.filter((invitation: any) => invitation.email.includes(queryText))
    }

    if (args.role_counted) {
      invitations = invitations.filter((invitation: any) => invitation.role === 'admin' || invitation.role === 'member')
    }

    invitations = invitations.sort((left: any, right: any) => right.createdAt - left.createdAt)

    return {
      data: await Promise.all(invitations.map((invitation: any) => buildLegacyOrganizationInvitation(ctx, invitation))),
      next_cursor: null,
      prev_cursor: null,
      total_count: invitations.length
    }
  }
})

export const createLegacyOrganizationInvitations = mutation({
  args: {
    slug: v.string(),
    invitations: v.array(
      v.object({
        email: v.string(),
        role: v.string(),
        project_ids: v.optional(v.array(v.string()))
      })
    )
  },
  handler: async (ctx, args) => await createLegacyOrganizationInvitationsInternal(ctx, args)
})

export const bulkInviteLegacyOrganizationMembers = mutation({
  args: {
    slug: v.string(),
    comma_separated_emails: v.string(),
    project_id: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const invitations = args.comma_separated_emails
      .replace(/\n+/g, ',')
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean)
      .map((email) => ({
        email,
        role: 'member',
        project_ids: args.project_id ? [args.project_id] : []
      }))

    return await createLegacyOrganizationInvitationsInternal(ctx, {
      slug: args.slug,
      invitations
    })
  }
})

export const deleteLegacyOrganizationInvitation = mutation({
  args: {
    slug: v.string(),
    invitationId: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await getViewerIdentity(ctx)
    const viewer = await getUserByTokenIdentifier(ctx, identity.tokenIdentifier)
    const organization = await getOrganizationBySlug(ctx, args.slug)

    if (!viewer || !organization) {
      throw new Error('Invitation not found')
    }

    const invitation = await getOrganizationInvitationById(ctx, organization._id, args.invitationId)

    if (!invitation) {
      throw new Error('Invitation not found')
    }

    const membership = await getOrganizationMembership(ctx, organization._id, identity.tokenIdentifier)

    if (!membership && invitation.email !== normalizeEmail(viewer.email)) {
      throw new Error('Not allowed to remove invitation')
    }

    await ctx.db.delete(invitation._id)

    return {}
  }
})

export const getLegacyViewerOrganizationInvitations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getViewerIdentity(ctx)
    const viewer = await getUserByTokenIdentifier(ctx, identity.tokenIdentifier)
    const email = normalizeEmail(viewer?.email || identity.email)

    if (!email) {
      return []
    }

    const invitations = await ctx.db
      .query('organizationInvitations')
      .withIndex('by_email', (q: any) => q.eq('email', email))
      .collect()

    const sortedInvitations = invitations
      .filter((invitation: any) => invitation.expiresAt > Date.now())
      .sort((left: any, right: any) => right.createdAt - left.createdAt)
      .slice(0, 25)

    return await Promise.all(
      sortedInvitations.map((invitation: any) => buildLegacyOrganizationInvitation(ctx, invitation, true))
    )
  }
})

// Join an organization by its public ID (for users who registered without an invite link)
export const joinOrganizationByPublicId = mutation({
  args: {
    orgId: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await getViewerIdentity(ctx)

    const organization = await ctx.db
      .query('organizations')
      .withIndex('by_public_id', (q: any) => q.eq('publicId', args.orgId))
      .unique()

    if (!organization) {
      throw new Error('Organization not found. Check the Org ID and try again.')
    }

    // Check if already a member
    const existingMembership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_user_token_identifier', (q: any) => q.eq('userTokenIdentifier', identity.tokenIdentifier))
      .collect()

    const alreadyMember = existingMembership.find(
      (m: any) => m.organizationId === organization._id && !m.discardedAt
    )

    if (alreadyMember) {
      return {
        redirect_path: `/${organization.slug}`,
        organization_slug: organization.slug
      }
    }

    await ensureOrganizationScaffold(ctx, organization, organization.ownerTokenIdentifier)

    await createOrRestoreOrganizationMembership(ctx, {
      organizationId: organization._id,
      userTokenIdentifier: identity.tokenIdentifier,
      role: 'viewer'
    })

    return {
      redirect_path: `/${organization.slug}`,
      organization_slug: organization.slug
    }
  }
})

// Look up an organization by its public ID (for the join-by-ID UI)
export const getOrganizationByPublicId = query({
  args: {
    orgId: v.string()
  },
  handler: async (ctx, args) => {
    if (!args.orgId || args.orgId.length < 6) return null

    const organization = await ctx.db
      .query('organizations')
      .withIndex('by_public_id', (q: any) => q.eq('publicId', args.orgId))
      .unique()

    if (!organization) return null

    return {
      id: organization.publicId,
      name: organization.name,
      slug: organization.slug,
      avatar_path: organization.avatarPath
    }
  }
})

export const acceptLegacyOrganizationInvitationByToken = mutation({
  args: {
    inviteToken: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await getViewerIdentity(ctx)
    const viewer = await getUserByTokenIdentifier(ctx, identity.tokenIdentifier)
    const email = normalizeEmail(viewer?.email || identity.email)

    if (!email) {
      throw new Error('Your account email is missing')
    }

    const invitation = await ctx.db
      .query('organizationInvitations')
      .withIndex('by_invite_token', (q: any) => q.eq('inviteToken', args.inviteToken))
      .unique()

    if (!invitation) {
      throw new Error('Invitation not found')
    }

    if (invitation.expiresAt <= Date.now()) {
      throw new Error('The invitation has expired')
    }

    if (invitation.email !== email) {
      throw new Error('Your email does not match the email of the invitation.')
    }

    const organization = await ctx.db.get(invitation.organizationId)

    if (!organization) {
      throw new Error('Organization not found')
    }

    await ensureOrganizationScaffold(ctx, organization, organization.ownerTokenIdentifier)

    await createOrRestoreOrganizationMembership(ctx, {
      organizationId: organization._id,
      userTokenIdentifier: identity.tokenIdentifier,
      role: invitation.role as 'admin' | 'member' | 'viewer' | 'guest'
    })

    const joinedProjects = await ensureProjectMemberships(ctx, {
      organizationId: organization._id,
      userTokenIdentifier: identity.tokenIdentifier,
      projectIds: invitation.projectIds
    })

    await clearPendingAccessRecords(ctx, {
      organizationId: organization._id,
      userTokenIdentifier: identity.tokenIdentifier,
      email
    })

    await ctx.db.delete(invitation._id)

    return {
      redirect_path: buildInvitationRedirectPath({
        organizationSlug: organization.slug,
        projects: joinedProjects
      })
    }
  }
})

export const getLegacySuggestedOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getViewerIdentity(ctx)
    const viewer = await getUserByTokenIdentifier(ctx, identity.tokenIdentifier)
    const viewerEmail = normalizeEmail(viewer?.email || identity.email)
    const viewerDomain = getEmailDomain(viewerEmail)

    const [memberships, requests, invitations] = await Promise.all([
      getWorkspaceMemberships(ctx, identity.tokenIdentifier),
      ctx.db
        .query('organizationMembershipRequests')
        .withIndex('by_user_token_identifier', (q: any) => q.eq('userTokenIdentifier', identity.tokenIdentifier))
        .collect(),
      viewerEmail
        ? ctx.db.query('organizationInvitations').withIndex('by_email', (q: any) => q.eq('email', viewerEmail)).collect()
        : []
    ])

    const memberOrganizationIds = new Set(memberships.map((entry: any) => entry.organization?._id).filter(Boolean))
    const invitedOrganizationIds = new Set(invitations.map((invitation: any) => invitation.organizationId))
    const requestedByOrganizationId = new Set(requests.map((request: any) => request.organizationId))

    const suggestedOrganizations = viewerDomain
      ? await ctx.db.query('organizations').withIndex('by_email_domain', (q: any) => q.eq('emailDomain', viewerDomain)).collect()
      : []

    const requestedOrganizations = await Promise.all(requests.map((request: any) => ctx.db.get(request.organizationId)))
    const seen = new Set<string>()
    const results = []

    for (const organization of [...suggestedOrganizations, ...requestedOrganizations].filter(Boolean) as any[]) {
      if (memberOrganizationIds.has(organization._id) || invitedOrganizationIds.has(organization._id) || seen.has(organization._id)) {
        continue
      }

      seen.add(organization._id)
      results.push(
        buildLegacySuggestedOrganization({
          organization,
          requested: requestedByOrganizationId.has(organization._id)
        })
      )
    }

    return results.slice(0, 25)
  }
})

export const createLegacyVerifiedDomainMembership = mutation({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await getViewerIdentity(ctx)
    const viewer = await getUserByTokenIdentifier(ctx, identity.tokenIdentifier)
    const viewerEmail = normalizeEmail(viewer?.email || identity.email)
    const organization = await getOrganizationBySlug(ctx, args.slug)

    if (!viewerEmail || !organization) {
      throw new Error('Organization not found')
    }

    if (!organization.emailDomain || getEmailDomain(viewerEmail) !== organization.emailDomain) {
      throw new Error('Your email domain does not match this organization')
    }

    const existingMembership = await getOrganizationMembership(ctx, organization._id, identity.tokenIdentifier)

    if (existingMembership) {
      throw new Error('User is already a member of this organization.')
    }

    await ensureOrganizationScaffold(ctx, organization, organization.ownerTokenIdentifier)

    await createOrRestoreOrganizationMembership(ctx, {
      organizationId: organization._id,
      userTokenIdentifier: identity.tokenIdentifier,
      role: 'member'
    })

    await ensureProjectMemberships(ctx, {
      organizationId: organization._id,
      userTokenIdentifier: identity.tokenIdentifier
    })

    await clearPendingAccessRecords(ctx, {
      organizationId: organization._id,
      userTokenIdentifier: identity.tokenIdentifier,
      email: viewerEmail
    })

    return await buildLegacyMember(ctx, organization._id, identity.tokenIdentifier)
  }
})

export const getLegacyPublicOrganizationByToken = query({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    const organization = await getOrganizationByInviteToken(ctx, args.token)

    if (!organization) {
      return null
    }

    const identity = await ctx.auth.getUserIdentity()
    const membership = identity
      ? await getOrganizationMembership(ctx, organization._id, identity.tokenIdentifier)
      : null

    const avatarUrl = buildLegacyMediaUrl(organization.avatarPath ?? organization.avatar_url)

    return {
      id: organization._id,
      avatar_url: avatarUrl || '',
      avatar_urls: buildLegacyAvatarUrls(avatarUrl),
      name: organization.name,
      slug: organization.slug,
      viewer_is_admin: membership?.role === 'admin',
      viewer_can_leave: membership ? membership.role !== 'admin' : false
    }
  }
})

export const joinLegacyOrganizationByToken = mutation({
  args: {
    slug: v.string(),
    token: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await getViewerIdentity(ctx)
    const viewer = await getUserByTokenIdentifier(ctx, identity.tokenIdentifier)
    const viewerEmail = normalizeEmail(viewer?.email || identity.email)
    const organization = await getOrganizationByInviteToken(ctx, args.token)

    if (!organization || organization.slug !== args.slug) {
      throw new Error('Organization not found')
    }

    const existingMembership = await getOrganizationMembership(ctx, organization._id, identity.tokenIdentifier)

    if (existingMembership) {
      return buildLegacySuggestedOrganization({
        organization,
        requested: false,
        joined: true
      })
    }

    const viewerDomain = getEmailDomain(viewerEmail)
    const directJoin = organization.slug !== 'design' || (!!organization.emailDomain && viewerDomain === organization.emailDomain)

    if (directJoin) {
      await ensureOrganizationScaffold(ctx, organization, organization.ownerTokenIdentifier)

      await createOrRestoreOrganizationMembership(ctx, {
        organizationId: organization._id,
        userTokenIdentifier: identity.tokenIdentifier,
        role: 'member'
      })

      await ensureProjectMemberships(ctx, {
        organizationId: organization._id,
        userTokenIdentifier: identity.tokenIdentifier
      })

      await clearPendingAccessRecords(ctx, {
        organizationId: organization._id,
        userTokenIdentifier: identity.tokenIdentifier,
        email: viewerEmail
      })

      return buildLegacySuggestedOrganization({
        organization,
        requested: false,
        joined: true
      })
    }

    const existingRequest = await ctx.db
      .query('organizationMembershipRequests')
      .withIndex('by_organization_and_user', (q: any) =>
        q.eq('organizationId', organization._id).eq('userTokenIdentifier', identity.tokenIdentifier)
      )
      .unique()

    if (!existingRequest) {
      await ctx.db.insert('organizationMembershipRequests', {
        organizationId: organization._id,
        userTokenIdentifier: identity.tokenIdentifier,
        createdAt: Date.now()
      })
    }

    return buildLegacySuggestedOrganization({
      organization,
      requested: true,
      joined: false
    })
  }
})

export const getLegacyProjectsPage = query({
  args: {
    slug: v.string(),
    q: v.optional(v.string()),
    filter: v.optional(v.string()),
    after: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    let projects = await getOrganizationProjects(ctx, context.organization._id)
    const queryText = args.q?.trim().toLowerCase()

    if (queryText) {
      projects = projects.filter((project: any) => project.name.toLowerCase().includes(queryText))
    }

    if (args.filter === 'archived') {
      projects = projects.filter((project: any) => !!project.archivedAt)
    } else {
      projects = projects.filter((project: any) => !project.archivedAt)
    }

    projects = sortProjects(projects)

    return {
      data: await Promise.all(
        projects.map((project: any) =>
          buildLegacyProject(ctx, {
            organization: context.organization,
            project,
            viewerMembership: context.viewerMembership,
            viewerTokenIdentifier: context.identity.tokenIdentifier
          })
        )
      ),
      next_cursor: null,
      prev_cursor: null,
      total_count: projects.length
    }
  }
})

export const createLegacyProject = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    accessory: v.optional(v.string()),
    cover_photo_path: v.optional(v.string()),
    private: v.optional(v.boolean()),
    is_default: v.optional(v.union(v.boolean(), v.null())),
    onboarding: v.optional(v.union(v.boolean(), v.null()))
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const now = Date.now()
    const projectId = await ctx.db.insert('projects', {
      organizationId: context.organization._id,
      creatorTokenIdentifier: context.identity.tokenIdentifier,
      inviteToken: generateToken(),
      name: args.name.trim(),
      description: args.description?.trim() || undefined,
      accessory: args.accessory?.trim() || undefined,
      coverPhotoPath: args.cover_photo_path || undefined,
      displayReactions: defaultProjectDisplayPreferences.display_reactions,
      displayAttachments: defaultProjectDisplayPreferences.display_attachments,
      displayComments: defaultProjectDisplayPreferences.display_comments,
      displayResolved: defaultProjectDisplayPreferences.display_resolved,
      slackChannelId: undefined,
      private: !!args.private,
      personal: false,
      isGeneral: false,
      isDefault: !!args.is_default && !args.private,
      archivedAt: undefined,
      lastActivityAt: now,
      createdAt: now
    })

    await ctx.db.insert('projectMemberships', {
      organizationId: context.organization._id,
      projectId,
      userTokenIdentifier: context.identity.tokenIdentifier,
      createdAt: now
    })

    if (args.onboarding) {
      await ctx.db.patch(context.organization._id, {
        onboardedAt: context.organization.onboardedAt ?? now
      })
    }

    const project = await ctx.db.get(projectId)

    if (!project) {
      throw new Error('Project could not be created')
    }

    return await buildLegacyProject(ctx, {
      organization: context.organization,
      project,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier
    })
  }
})

export const getLegacyProjectById = query({
  args: {
    slug: v.string(),
    projectId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      return null
    }

    const project = await getOrganizationProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      return null
    }

    return await buildLegacyProject(ctx, {
      organization: context.organization,
      project,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier
    })
  }
})

export const updateLegacyProject = mutation({
  args: {
    slug: v.string(),
    projectId: v.string(),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    accessory: v.optional(v.string()),
    cover_photo_path: v.optional(v.union(v.string(), v.null())),
    private: v.optional(v.boolean()),
    is_default: v.optional(v.union(v.boolean(), v.null()))
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const project = await getOrganizationProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    if (context.viewerMembership.role !== 'admin' && project.creatorTokenIdentifier !== context.identity.tokenIdentifier) {
      throw new Error('Not allowed to update project')
    }

    const updates: Record<string, any> = {
      lastActivityAt: Date.now()
    }

    if (typeof args.name === 'string') {
      updates.name = args.name.trim()
    }

    if (typeof args.description === 'string') {
      updates.description = args.description.trim() || undefined
    }

    if (typeof args.accessory === 'string') {
      updates.accessory = args.accessory.trim() || undefined
    }

    if (args.cover_photo_path !== undefined) {
      updates.coverPhotoPath = args.cover_photo_path || undefined
    }

    if (typeof args.private === 'boolean' && !project.isGeneral) {
      updates.private = args.private
    }

    if (args.is_default !== undefined && !project.isGeneral) {
      updates.isDefault = !!args.is_default && !updates.private && !project.private
    }

    await ctx.db.patch(project._id, updates)
    const updatedProject = await ctx.db.get(project._id)

    return await buildLegacyProject(ctx, {
      organization: context.organization,
      project: updatedProject,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier
    })
  }
})

export const updateLegacyProjectDisplayPreferences = mutation({
  args: {
    slug: v.string(),
    projectId: v.string(),
    display_reactions: v.boolean(),
    display_attachments: v.boolean(),
    display_comments: v.boolean(),
    display_resolved: v.boolean()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const project = await getOrganizationProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    if (context.viewerMembership.role !== 'admin' && project.creatorTokenIdentifier !== context.identity.tokenIdentifier) {
      throw new Error('Not allowed to update project')
    }

    await ctx.db.patch(project._id, {
      displayReactions: args.display_reactions,
      displayAttachments: args.display_attachments,
      displayComments: args.display_comments,
      displayResolved: args.display_resolved,
      lastActivityAt: Date.now()
    })

    await deleteProjectDisplayPreference(ctx, {
      projectId: project._id,
      organizationMembershipId: context.viewerMembership._id
    })

    const updatedProject = await ctx.db.get(project._id)

    if (!updatedProject) {
      throw new Error('Project not found')
    }

    return await buildLegacyProject(ctx, {
      organization: context.organization,
      project: updatedProject,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier
    })
  }
})

export const updateLegacyProjectViewerDisplayPreferences = mutation({
  args: {
    slug: v.string(),
    projectId: v.string(),
    display_reactions: v.boolean(),
    display_attachments: v.boolean(),
    display_comments: v.boolean(),
    display_resolved: v.boolean()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const project = await getOrganizationProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    await upsertProjectDisplayPreference(ctx, {
      organizationId: context.organization._id,
      projectId: project._id,
      organizationMembershipId: context.viewerMembership._id,
      display_reactions: args.display_reactions,
      display_attachments: args.display_attachments,
      display_comments: args.display_comments,
      display_resolved: args.display_resolved
    })

    return await buildLegacyProject(ctx, {
      organization: context.organization,
      project,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier
    })
  }
})

export const deleteLegacyProjectViewerDisplayPreferences = mutation({
  args: {
    slug: v.string(),
    projectId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const project = await getOrganizationProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    await deleteProjectDisplayPreference(ctx, {
      projectId: project._id,
      organizationMembershipId: context.viewerMembership._id
    })

    return await buildLegacyProject(ctx, {
      organization: context.organization,
      project,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier
    })
  }
})

export const markLegacyProjectRead = mutation({
  args: {
    slug: v.string(),
    projectId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const project = await getOrganizationProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    await markProjectRead(ctx, {
      organizationId: context.organization._id,
      projectId: project._id,
      organizationMembershipId: context.viewerMembership._id
    })

    return {}
  }
})

export const markLegacyProjectUnread = mutation({
  args: {
    slug: v.string(),
    projectId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const project = await getOrganizationProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    await markProjectUnread(ctx, {
      organizationId: context.organization._id,
      projectId: project._id,
      organizationMembershipId: context.viewerMembership._id
    })

    return {}
  }
})

export const createLegacyProjectView = mutation({
  args: {
    slug: v.string(),
    projectId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const project = await getOrganizationProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    await markProjectRead(ctx, {
      organizationId: context.organization._id,
      projectId: project._id,
      organizationMembershipId: context.viewerMembership._id
    })

    return await buildLegacyProject(ctx, {
      organization: context.organization,
      project,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier
    })
  }
})

export const deleteLegacyProject = mutation({
  args: {
    slug: v.string(),
    projectId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const project = await getOrganizationProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    if (project.isGeneral) {
      throw new Error('The general project cannot be deleted')
    }

    if (context.viewerMembership.role !== 'admin' && project.creatorTokenIdentifier !== context.identity.tokenIdentifier) {
      throw new Error('Not allowed to delete project')
    }

    const [projectMemberships, posts, projectDisplayPreferences, projectViews] = await Promise.all([
      ctx.db.query('projectMemberships').withIndex('by_project_id', (q: any) => q.eq('projectId', project._id)).collect(),
      ctx.db.query('posts').withIndex('by_organization_id', (q: any) => q.eq('organizationId', context.organization._id)).collect(),
      ctx.db
        .query('projectDisplayPreferences')
        .withIndex('by_project_id', (q: any) => q.eq('projectId', project._id))
        .collect(),
      ctx.db.query('projectViews').withIndex('by_project_id', (q: any) => q.eq('projectId', project._id)).collect()
    ])

    for (const membership of projectMemberships) {
      await ctx.db.delete(membership._id)
    }

    for (const preference of projectDisplayPreferences) {
      await ctx.db.delete(preference._id)
    }

    for (const projectView of projectViews) {
      await ctx.db.delete(projectView._id)
    }

    const projectPosts = posts.filter((post: any) => post.projectId === project._id)

    for (const post of projectPosts) {
      const comments = await ctx.db.query('comments').withIndex('by_post_id', (q: any) => q.eq('postId', post._id)).collect()

      for (const comment of comments) {
        await ctx.db.delete(comment._id)
      }

      await ctx.db.delete(post._id)
    }

    await ctx.db.delete(project._id)

    return {}
  }
})

export const archiveLegacyProject = mutation({
  args: {
    slug: v.string(),
    projectId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const project = await getOrganizationProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    if (project.isGeneral || context.viewerMembership.role !== 'admin') {
      throw new Error('Not allowed to archive project')
    }

    await ctx.db.patch(project._id, {
      archivedAt: Date.now(),
      lastActivityAt: Date.now()
    })

    const archivedProject = await ctx.db.get(project._id)

    return await buildLegacyProject(ctx, {
      organization: context.organization,
      project: archivedProject,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier
    })
  }
})

export const unarchiveLegacyProject = mutation({
  args: {
    slug: v.string(),
    projectId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const project = await getOrganizationProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw new Error('Project not found')
    }

    if (context.viewerMembership.role !== 'admin') {
      throw new Error('Not allowed to unarchive project')
    }

    await ctx.db.patch(project._id, {
      archivedAt: undefined,
      lastActivityAt: Date.now()
    })

    const updatedProject = await ctx.db.get(project._id)

    return await buildLegacyProject(ctx, {
      organization: context.organization,
      project: updatedProject,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier
    })
  }
})

export const getLegacyProjectMembersPage = query({
  args: {
    slug: v.string(),
    projectId: v.string(),
    after: v.optional(v.string()),
    limit: v.optional(v.number()),
    organization_membership_id: v.optional(v.string()),
    roles: v.optional(v.array(v.union(v.literal('admin'), v.literal('member'), v.literal('viewer'), v.literal('guest')))),
    exclude_roles: v.optional(
      v.array(v.union(v.literal('admin'), v.literal('member'), v.literal('viewer'), v.literal('guest')))
    )
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const project = await getOrganizationProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw createError('Project not found', 'not_found')
    }

    const viewerProjectMembership = await getViewerProjectMembership(ctx, project._id, context.identity.tokenIdentifier)

    if (!viewerCanAccessProject(project, context.viewerMembership, context.identity.tokenIdentifier, !!viewerProjectMembership)) {
      throw createError('Project not found', 'not_found')
    }

    const [projectMemberships, organizationMemberships] = await Promise.all([
      ctx.db.query('projectMemberships').withIndex('by_project_id', (q: any) => q.eq('projectId', project._id)).collect(),
      getOrganizationMemberships(ctx, context.organization._id)
    ])
    const activeMemberships = organizationMemberships.filter((membership: any) => !membership.discardedAt)
    const membershipByTokenIdentifier = new Map(
      activeMemberships.map((membership: any) => [membership.userTokenIdentifier, membership])
    )
    const userMap = await getUsersByTokenIdentifiers(
      ctx,
      projectMemberships.map((membership: any) => membership.userTokenIdentifier)
    )

    const filtered = projectMemberships
      .map((projectMembership: any) => ({
        _cursor: projectMembership._id,
        membership: membershipByTokenIdentifier.get(projectMembership.userTokenIdentifier),
        user: userMap.get(projectMembership.userTokenIdentifier)
      }))
      .filter((entry: any) => !!entry.membership && !!entry.user)
      .filter((entry: any) => {
        if (args.organization_membership_id && entry.membership._id !== args.organization_membership_id) {
          return false
        }

        if (args.roles?.length && !args.roles.includes(entry.membership.role)) {
          return false
        }

        if (args.exclude_roles?.length && args.exclude_roles.includes(entry.membership.role)) {
          return false
        }

        return true
      })
      .sort((left: any, right: any) => {
        const byName = left.user.displayName.localeCompare(right.user.displayName)

        if (byName !== 0) {
          return byName
        }

        return left.membership._id.localeCompare(right.membership._id)
      })

    const page = paginateItems(filtered, args.limit, args.after)

    return {
      ...page,
      data: page.data.map((entry: any) => buildLegacyMemberRecord(entry.membership, entry.user)),
      total_count: filtered.length
    }
  }
})

export const getLegacyProjectAddableMembersPage = query({
  args: {
    slug: v.string(),
    projectId: v.string(),
    after: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const project = await getOrganizationProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw createError('Project not found', 'not_found')
    }

    if (!viewerCanManageProject(project, context.viewerMembership, context.identity.tokenIdentifier)) {
      throw createError('Not allowed to invite members', 'forbidden')
    }

    const [projectMemberships, organizationMemberships] = await Promise.all([
      ctx.db.query('projectMemberships').withIndex('by_project_id', (q: any) => q.eq('projectId', project._id)).collect(),
      getOrganizationMemberships(ctx, context.organization._id)
    ])
    const existingProjectMembers = new Set(projectMemberships.map((membership: any) => membership.userTokenIdentifier))
    const candidates = organizationMemberships
      .filter((membership: any) => !membership.discardedAt)
      .filter((membership: any) => !existingProjectMembers.has(membership.userTokenIdentifier))
    const userMap = await getUsersByTokenIdentifiers(
      ctx,
      candidates.map((membership: any) => membership.userTokenIdentifier)
    )

    const filtered = candidates
      .map((membership: any) => ({
        _cursor: membership._id,
        membership,
        user: userMap.get(membership.userTokenIdentifier)
      }))
      .filter((entry: any) => !!entry.user)
      .sort((left: any, right: any) => {
        const byName = left.user.displayName.localeCompare(right.user.displayName)

        if (byName !== 0) {
          return byName
        }

        return left.membership._id.localeCompare(right.membership._id)
      })

    const page = paginateItems(filtered, args.limit, args.after)

    return {
      ...page,
      data: page.data.map((entry: any) => buildLegacyMemberRecord(entry.membership, entry.user)),
      total_count: filtered.length
    }
  }
})

export const createLegacyProjectMembership = mutation({
  args: {
    slug: v.string(),
    projectId: v.string(),
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const [project, targetUser] = await Promise.all([
      getOrganizationProjectById(ctx, context.organization._id, args.projectId),
      ctx.db.get(args.userId as Id<'users'>)
    ])

    if (!project) {
      throw createError('Project not found', 'not_found')
    }

    if (!targetUser || !('tokenIdentifier' in targetUser)) {
      throw createError('Organization member not found', 'not_found')
    }

    const [viewerProjectMembership, targetOrganizationMembership] = await Promise.all([
      getViewerProjectMembership(ctx, project._id, context.identity.tokenIdentifier),
      getOrganizationMembership(ctx, context.organization._id, (targetUser as any).tokenIdentifier)
    ])

    const isSelf = (targetUser as any)._id === context.user._id
    const canManage = viewerCanManageProject(project, context.viewerMembership, context.identity.tokenIdentifier)
    const canSelfJoin =
      isSelf &&
      !project.archivedAt &&
      (!project.private || !!viewerProjectMembership || canManage) &&
      viewerCanAccessProject(project, context.viewerMembership, context.identity.tokenIdentifier, !!viewerProjectMembership)

    if (!canManage && !canSelfJoin) {
      throw createError('Not allowed to update project members', 'forbidden')
    }

    if (!targetOrganizationMembership || targetOrganizationMembership.discardedAt) {
      throw createError('Organization member not found', 'not_found')
    }

    const projectMembership = await createProjectMembershipRecord(ctx, {
      organizationId: context.organization._id,
      project,
      userTokenIdentifier: (targetUser as any).tokenIdentifier
    })

    await markProjectRead(ctx, {
      organizationId: context.organization._id,
      projectId: project._id,
      organizationMembershipId: context.viewerMembership._id
    })

    const position = await getProjectMembershipPositionForUser(ctx, {
      organizationId: context.organization._id,
      userTokenIdentifier: (targetUser as any).tokenIdentifier,
      projectId: project._id
    })

    return await buildLegacyProjectMembership(ctx, {
      organization: context.organization,
      projectMembership,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier,
      position
    })
  }
})

export const deleteLegacyProjectMembership = mutation({
  args: {
    slug: v.string(),
    projectId: v.string(),
    userId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const [project, targetUser] = await Promise.all([
      getOrganizationProjectById(ctx, context.organization._id, args.projectId),
      ctx.db.get(args.userId as Id<'users'>)
    ])

    if (!project) {
      throw createError('Project not found', 'not_found')
    }

    if (!targetUser || !('tokenIdentifier' in targetUser)) {
      throw createError('Organization member not found', 'not_found')
    }

    const viewerProjectMembership = await getViewerProjectMembership(ctx, project._id, context.identity.tokenIdentifier)
    const isSelf = (targetUser as any)._id === context.user._id
    const canManage = viewerCanManageProject(project, context.viewerMembership, context.identity.tokenIdentifier)

    if (!canManage && !(isSelf && viewerCanAccessProject(project, context.viewerMembership, context.identity.tokenIdentifier, !!viewerProjectMembership))) {
      throw createError('Not allowed to update project members', 'forbidden')
    }

    await deleteProjectMembershipRecord(ctx, {
      organizationId: context.organization._id,
      project,
      userTokenIdentifier: (targetUser as any).tokenIdentifier
    })

    const updatedProject = await ctx.db.get(project._id)

    return await buildLegacyProject(ctx, {
      organization: context.organization,
      project: updatedProject || project,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.identity.tokenIdentifier
    })
  }
})

export const getLegacyProjectInvitationUrl = query({
  args: {
    slug: v.string(),
    projectId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const project = await getOrganizationProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw createError('Project not found', 'not_found')
    }

    if (!viewerCanManageProject(project, context.viewerMembership, context.identity.tokenIdentifier)) {
      throw createError('Not allowed to view invitation URL', 'forbidden')
    }

    return buildLegacyProjectInvitationUrl(project)
  }
})

export const resetLegacyProjectInvitationUrl = mutation({
  args: {
    slug: v.string(),
    projectId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const project = await getOrganizationProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw createError('Project not found', 'not_found')
    }

    if (!viewerCanManageProject(project, context.viewerMembership, context.identity.tokenIdentifier)) {
      throw createError('Not allowed to reset invitation URL', 'forbidden')
    }

    const inviteToken = generateToken()

    await ctx.db.patch(project._id, {
      inviteToken,
      lastActivityAt: Date.now()
    })

    return buildLegacyProjectInvitationUrl({
      ...project,
      inviteToken
    })
  }
})

export const acceptLegacyProjectInvitationUrl = mutation({
  args: {
    slug: v.string(),
    projectId: v.string(),
    token: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await getViewerIdentity(ctx)
    const [organization, user] = await Promise.all([
      getOrganizationBySlug(ctx, args.slug),
      getUserByTokenIdentifier(ctx, identity.tokenIdentifier)
    ])

    if (!organization) {
      throw createError('Organization not found', 'not_found')
    }

    const project = await getOrganizationProjectById(ctx, organization._id, args.projectId)

    if (!project || project.inviteToken !== args.token) {
      throw createError('Project not found', 'not_found')
    }

    if (!user) {
      throw createError('Viewer has not been provisioned', 'unauthorized')
    }

    let membership = await getOrganizationMembership(ctx, organization._id, identity.tokenIdentifier)

    if (!membership || membership.discardedAt) {
      membership = await createOrRestoreOrganizationMembership(ctx, {
        organizationId: organization._id,
        userTokenIdentifier: identity.tokenIdentifier,
        role: 'guest'
      })
    }

    await clearPendingAccessRecords(ctx, {
      organizationId: organization._id,
      userTokenIdentifier: identity.tokenIdentifier,
      email: user.email || undefined
    })

    await createProjectMembershipRecord(ctx, {
      organizationId: organization._id,
      project,
      userTokenIdentifier: identity.tokenIdentifier
    })

    await markProjectRead(ctx, {
      organizationId: organization._id,
      projectId: project._id,
      organizationMembershipId: membership._id
    })

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
      throw createError('Organization not found', 'not_found')
    }

    const project = await getOrganizationProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw createError('Project not found', 'not_found')
    }

    const viewerProjectMembership = await getViewerProjectMembership(ctx, project._id, context.identity.tokenIdentifier)

    if (!viewerCanAccessProject(project, context.viewerMembership, context.identity.tokenIdentifier, !!viewerProjectMembership)) {
      throw createError('Project not found', 'not_found')
    }

    return {}
  }
})

export const getLegacyPublicProjectByToken = query({
  args: {
    token: v.string()
  },
  handler: async (ctx, args) => {
    const project = await getProjectByInviteToken(ctx, args.token)

    if (!project || project.archivedAt) {
      return null
    }

    const organization = await ctx.db.get(project.organizationId)

    if (!organization) {
      return null
    }

    const identity = await ctx.auth.getUserIdentity()
    const viewerMembership = identity
      ? await getOrganizationMembership(ctx, organization._id, identity.tokenIdentifier)
      : null

    return {
      id: project._id,
      name: project.name,
      accessory: project.accessory ?? null,
      organization: buildLegacyPublicOrganization(organization, viewerMembership && !viewerMembership.discardedAt ? viewerMembership : null)
    }
  }
})

export const getLegacyProjectMemberships = query({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const memberships = await ctx.db
      .query('projectMemberships')
      .withIndex('by_organization_and_user', (q: any) =>
        q.eq('organizationId', context.organization._id).eq('userTokenIdentifier', context.identity.tokenIdentifier)
      )
      .collect()

    const projects = await Promise.all(memberships.map((membership: any) => ctx.db.get(membership.projectId)))
    const orderedMemberships = memberships
      .map((membership: any, index: number) => ({
        membership,
        project: projects[index]
      }))
      .filter((entry: any) => !!entry.project)
      .sort((left: any, right: any) => {
        if (left.project.isGeneral && !right.project.isGeneral) return -1
        if (!left.project.isGeneral && right.project.isGeneral) return 1
        return left.membership.createdAt - right.membership.createdAt
      })

    return await Promise.all(
      orderedMemberships.map((entry: any, index: number) =>
        buildLegacyProjectMembership(ctx, {
          organization: context.organization,
          projectMembership: entry.membership,
          viewerMembership: context.viewerMembership,
          viewerTokenIdentifier: context.identity.tokenIdentifier,
          position: index
        })
      )
    )
  }
})

export const getLegacySyncProjects = query({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const [projects, viewerProjectMemberships, posts] = await Promise.all([
      getOrganizationProjects(ctx, context.organization._id),
      ctx.db
        .query('projectMemberships')
        .withIndex('by_organization_and_user', (q: any) =>
          q.eq('organizationId', context.organization._id).eq('userTokenIdentifier', context.identity.tokenIdentifier)
        )
        .collect(),
      ctx.db.query('posts').withIndex('by_organization_id', (q: any) => q.eq('organizationId', context.organization._id)).collect()
    ])
    const viewerProjectIds = new Set(viewerProjectMemberships.map((membership: any) => membership.projectId))

    return sortProjects(
      projects.filter((project: any) => !project.private || viewerProjectIds.has(project._id) || context.viewerMembership.role === 'admin')
    ).map((project: any) => {
      const projectMemberships = viewerProjectMemberships.filter((membership: any) => membership.projectId === project._id)
      const projectMembershipCounts = getProjectMembershipCounts(projectMemberships)

      return {
        id: project._id,
        name: project.name,
        accessory: project.accessory ?? null,
        private: project.private,
        is_general: project.isGeneral,
        archived: !!project.archivedAt,
        guests_count: projectMembershipCounts.guestsCount,
        message_thread_id: project.messageThreadId ?? null,
        recent_posts_count: posts.filter((post: any) => post.projectId === project._id).length
      }
    })
  }
})

export const createLegacyOnboardProjects = mutation({
  args: {
    slug: v.string(),
    general_name: v.string(),
    general_accessory: v.optional(v.string()),
    projects: v.array(
      v.object({
        name: v.string(),
        accessory: v.optional(v.string())
      })
    )
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw new Error('Organization not found')
    }

    const generalProject = (
      await ctx.db
        .query('projects')
        .withIndex('by_organization_and_general', (q: any) =>
          q.eq('organizationId', context.organization._id).eq('isGeneral', true)
        )
        .collect()
    )[0]

    if (generalProject) {
      await ctx.db.patch(generalProject._id, {
        name: args.general_name.trim(),
        accessory: args.general_accessory?.trim() || undefined,
        lastActivityAt: Date.now()
      })
    }

    for (const project of args.projects) {
      const projectId = await ctx.db.insert('projects', {
        organizationId: context.organization._id,
        creatorTokenIdentifier: context.identity.tokenIdentifier,
        inviteToken: generateToken(),
        name: project.name.trim(),
        description: undefined,
        accessory: project.accessory?.trim() || undefined,
        coverPhotoPath: undefined,
        slackChannelId: undefined,
        private: false,
        personal: false,
        isGeneral: false,
        isDefault: false,
        archivedAt: undefined,
        lastActivityAt: Date.now(),
        createdAt: Date.now()
      })

      await ctx.db.insert('projectMemberships', {
        organizationId: context.organization._id,
        projectId,
        userTokenIdentifier: context.identity.tokenIdentifier,
        createdAt: Date.now()
      })
    }

    await ctx.db.patch(context.organization._id, {
      onboardedAt: Date.now()
    })

    return {}
  }
})
