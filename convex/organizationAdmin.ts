import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { ensureDefaultOrganizationSettings, getOrganizationSettingsMap, recordFriendlySlug } from './accountShell'
import {
  buildLegacyAvatarUrls,
  buildLegacyMediaUrl,
  buildLegacyMember,
  buildLegacyUser,
  formatDate,
  isNotificationsPaused
} from './legacy'
import {
  buildLegacyOrganization,
  ensureOrganizationScaffold,
  getWorkspaceMemberships,
  getViewerIdentity,
  normalizeEmail,
  toSlug
} from './workspace'

const roleValues = [
  v.literal('admin'),
  v.literal('member'),
  v.literal('viewer'),
  v.literal('guest')
] as const

function normalizeString(value?: string | null) {
  const normalized = value?.trim()

  return normalized ? normalized : undefined
}

function getEmailDomain(email?: string | null) {
  return normalizeEmail(email)?.split('@')[1]
}

function createError(message: string, code: string) {
  return new Error(`${code}:${message}`)
}

async function getViewerUser(ctx: any, tokenIdentifier: string) {
  return await ctx.db
    .query('users')
    .withIndex('by_token_identifier', (q: any) => q.eq('tokenIdentifier', tokenIdentifier))
    .unique()
}

async function getOrganizationBySlug(ctx: any, slug: string) {
  return await ctx.db
    .query('organizations')
    .withIndex('by_slug', (q: any) => q.eq('slug', slug))
    .unique()
}

async function getMembership(ctx: any, organizationId: any, userTokenIdentifier: string) {
  return await ctx.db
    .query('organizationMemberships')
    .withIndex('by_organization_and_user', (q: any) =>
      q.eq('organizationId', organizationId).eq('userTokenIdentifier', userTokenIdentifier)
    )
    .unique()
}

async function getOrganizationUsers(ctx: any, memberships: any[]) {
  const uniqueTokenIdentifiers = Array.from(
    new Set(memberships.map((membership: any) => membership.userTokenIdentifier))
  )
  const users = await Promise.all(uniqueTokenIdentifiers.map((tokenIdentifier: string) => getViewerUser(ctx, tokenIdentifier)))

  return new Map(users.filter(Boolean).map((user: any) => [user.tokenIdentifier, user]))
}

async function requireActiveMembership(ctx: any, slug: string) {
  const identity = await getViewerIdentity(ctx)
  const organization = await getOrganizationBySlug(ctx, slug)

  if (!organization) {
    throw createError('Organization not found', 'not_found')
  }

  const membership = await getMembership(ctx, organization._id, identity.tokenIdentifier)

  if (!membership || membership.discardedAt) {
    throw createError('Organization not found', 'not_found')
  }

  const user = await getViewerUser(ctx, identity.tokenIdentifier)

  if (!user) {
    throw createError('Viewer has not been provisioned', 'unauthorized')
  }

  return { identity, membership, organization, user }
}

async function requireAdminMembership(ctx: any, slug: string) {
  const context = await requireActiveMembership(ctx, slug)

  if (context.membership.role !== 'admin') {
    throw createError('Admin access required', 'forbidden')
  }

  return context
}

function buildSyncOrganizationMember(membership: any, user: any) {
  const avatarUrl = buildLegacyMediaUrl(user?.avatarPath ?? user?.avatar_url)

  return {
    id: membership._id,
    role: membership.role,
    deactivated: !!membership.discardedAt,
    last_seen_at: formatDate(membership.lastSeenAt ?? user?.lastSeenAt),
    user: {
      id: user._id,
      avatar_url: avatarUrl || '',
      avatar_urls: buildLegacyAvatarUrls(avatarUrl),
      display_name: user.displayName,
      username: user.username,
      email: user.email || '',
      integration: false,
      notifications_paused: isNotificationsPaused(user)
    }
  }
}

function sortMemberships(memberships: any[], order?: { by?: 'created_at' | 'last_seen_at'; direction?: 'asc' | 'desc' }) {
  const by = order?.by || 'last_seen_at'
  const direction = order?.direction === 'asc' ? 1 : -1

  return [...memberships].sort((a, b) => {
    const left = by === 'created_at' ? a.createdAt : a.lastSeenAt ?? a.createdAt
    const right = by === 'created_at' ? b.createdAt : b.lastSeenAt ?? b.createdAt

    if (left === right) {
      return direction * String(a._id).localeCompare(String(b._id))
    }

    return direction * ((left ?? 0) > (right ?? 0) ? 1 : -1)
  })
}

function paginateItems<T extends { _id: string }>(items: T[], limit?: number, after?: string) {
  const safeLimit = Math.max(1, Math.min(limit || 50, 100))
  const startIndex = after ? items.findIndex((item: T) => item._id === after) + 1 : 0
  const page = items.slice(Math.max(0, startIndex), Math.max(0, startIndex) + safeLimit)
  const nextCursor = startIndex + safeLimit < items.length ? page[page.length - 1]?._id ?? null : null

  return {
    data: page,
    next_cursor: nextCursor,
    prev_cursor: null
  }
}

async function getOrganizationMemberships(ctx: any, organizationId: any) {
  return await ctx.db
    .query('organizationMemberships')
    .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId))
    .collect()
}

async function getOrganizationMembershipRequests(ctx: any, organizationId: any) {
  return await ctx.db
    .query('organizationMembershipRequests')
    .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId))
    .collect()
}

async function joinDefaultProjects(ctx: any, organization: any, userTokenIdentifier: string) {
  await ensureOrganizationScaffold(ctx, organization, userTokenIdentifier)
}

async function deleteOrgScopedRows(ctx: any, table: string, index: string, organizationId: any) {
  const rows = await ctx.db.query(table).withIndex(index, (q: any) => q.eq('organizationId', organizationId)).collect()

  for (const row of rows) {
    await ctx.db.delete(row._id)
  }
}

export const updateLegacyOrganization = mutation({
  args: {
    slug: v.string(),
    name: v.optional(v.string()),
    nextSlug: v.optional(v.string()),
    avatarPath: v.optional(v.union(v.string(), v.null())),
    billingEmail: v.optional(v.union(v.string(), v.null())),
    emailDomain: v.optional(v.union(v.string(), v.null())),
    slackChannelId: v.optional(v.union(v.string(), v.null())),
    slackChannelIsPrivate: v.optional(v.union(v.boolean(), v.null()))
  },
  handler: async (ctx, args) => {
    const { organization } = await requireAdminMembership(ctx, args.slug)
    const identity = await getViewerIdentity(ctx)
    const memberships = await getWorkspaceMemberships(ctx, identity.tokenIdentifier)
    const updates: Record<string, any> = {}

    if (typeof args.name === 'string') {
      updates.name = args.name.trim()
    }

    if (args.avatarPath !== undefined) {
      updates.avatarPath = args.avatarPath || undefined
    }

    if (args.billingEmail !== undefined) {
      updates.billingEmail = args.billingEmail || undefined
    }

    if (args.slackChannelId !== undefined) {
      updates.slackChannelId = args.slackChannelId || undefined
      updates.slackChannelIsPrivate = args.slackChannelId ? args.slackChannelIsPrivate === true : undefined
    }

    if (args.nextSlug) {
      const desiredSlug = toSlug(args.nextSlug)

      if (!desiredSlug) {
        throw createError('Organization slug is required', 'unprocessable')
      }

      if (desiredSlug !== organization.slug) {
        const existingOrganization = await getOrganizationBySlug(ctx, desiredSlug)

        if (existingOrganization) {
          throw createError('Organization slug is already taken', 'unprocessable')
        }

        updates.slug = desiredSlug
      }
    }

    if (args.emailDomain !== undefined) {
      const emailDomain = normalizeString(args.emailDomain)

      if (!emailDomain) {
        updates.emailDomain = undefined
      } else {
        const viewerEmailDomain = getEmailDomain((await getViewerUser(ctx, identity.tokenIdentifier))?.email)

        if (viewerEmailDomain !== emailDomain.toLowerCase()) {
          throw createError(
            'The domain provided does not match your email address domain. Please update your email to match the domain and try again.',
            'unprocessable'
          )
        }

        updates.emailDomain = emailDomain.toLowerCase()
      }
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(organization._id, { ...updates, updatedAt: Date.now() })

      if (updates.slug) {
        await recordFriendlySlug(ctx, {
          slug: updates.slug,
          sluggableType: 'Organization',
          sluggableId: organization.publicId ?? organization._id
        })
      }
    }

    const updatedOrganization = await ctx.db.get(organization._id)
    const updatedMembership = await getMembership(ctx, organization._id, identity.tokenIdentifier)

    if (!updatedOrganization || !updatedMembership) {
      throw createError('Organization not found', 'not_found')
    }

    await ensureDefaultOrganizationSettings(ctx, updatedOrganization._id)

    return buildLegacyOrganization({
      memberships,
      membership: updatedMembership,
      organization: updatedOrganization,
      settings: await getOrganizationSettingsMap(ctx, updatedOrganization._id)
    })
  }
})

export const deleteLegacyOrganization = mutation({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const { organization } = await requireAdminMembership(ctx, args.slug)
    const invitationRows = await ctx.db
      .query('organizationInvitations')
      .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organization._id))
      .collect()
    const membershipRows = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organization._id))
      .collect()

    await deleteOrgScopedRows(ctx, 'comments', 'by_organization_id', organization._id)
    await deleteOrgScopedRows(ctx, 'posts', 'by_organization_id', organization._id)
    await deleteOrgScopedRows(ctx, 'projectDisplayPreferences', 'by_organization_id', organization._id)
    await deleteOrgScopedRows(ctx, 'projectViews', 'by_organization_id', organization._id)
    await deleteOrgScopedRows(ctx, 'projectMemberships', 'by_organization_id', organization._id)
    await deleteOrgScopedRows(ctx, 'projects', 'by_organization_id', organization._id)
    await deleteOrgScopedRows(ctx, 'organizationSettings', 'by_organization_id', organization._id)
    await deleteOrgScopedRows(ctx, 'organizationMembershipRequests', 'by_organization_id', organization._id)

    for (const invitation of invitationRows) {
      const invitationProjects = await ctx.db
        .query('organizationInvitationProjects')
        .withIndex('by_organization_invitation_id', (q: any) => q.eq('organizationInvitationId', invitation._id))
        .collect()

      for (const row of invitationProjects) {
        await ctx.db.delete(row._id)
      }
    }

    for (const membership of membershipRows) {
      const statuses = await ctx.db
        .query('organizationMembershipStatuses')
        .withIndex('by_organization_membership_id', (q: any) => q.eq('organizationMembershipId', membership._id))
        .collect()

      for (const row of statuses) {
        await ctx.db.delete(row._id)
      }
    }

    await deleteOrgScopedRows(ctx, 'organizationInvitations', 'by_organization_id', organization._id)
    await deleteOrgScopedRows(ctx, 'organizationMemberships', 'by_organization_id', organization._id)
    await deleteOrgScopedRows(ctx, 'tags', 'by_organization_id', organization._id)
    await ctx.db.delete(organization._id)

    return {}
  }
})

export const getLegacyOrganizationMembersPage = query({
  args: {
    slug: v.string(),
    after: v.optional(v.string()),
    limit: v.optional(v.number()),
    q: v.optional(v.string()),
    roles: v.optional(v.array(v.union(...roleValues))),
    status: v.optional(v.literal('deactivated')),
    order: v.optional(
      v.object({
        by: v.union(v.literal('created_at'), v.literal('last_seen_at')),
        direction: v.union(v.literal('asc'), v.literal('desc'))
      })
    )
  },
  handler: async (ctx, args) => {
    const { organization } = await requireActiveMembership(ctx, args.slug)
    const memberships = await getOrganizationMemberships(ctx, organization._id)
    const userMap = await getOrganizationUsers(ctx, memberships)

    const filtered = memberships.filter((membership: any) => {
      const user = userMap.get(membership.userTokenIdentifier)

      if (!user) {
        return false
      }

      if (args.status === 'deactivated') {
        if (!membership.discardedAt) {
          return false
        }
      } else if (membership.discardedAt) {
        return false
      }

      if (args.roles?.length && !args.roles.includes(membership.role)) {
        return false
      }

      if (args.q) {
        const query = args.q.toLowerCase()
        const haystack = `${user.username} ${user.displayName} ${user.email || ''}`.toLowerCase()

        return haystack.includes(query)
      }

      return true
    })

    const sorted = sortMemberships(filtered, args.order)
    const page = paginateItems(sorted, args.limit, args.after)

    return {
      ...page,
      data: page.data.map((membership: any) => buildLegacyMember(membership, userMap.get(membership.userTokenIdentifier))),
      total_count: filtered.length
    }
  }
})

export const getLegacyOrganizationMemberByUsername = query({
  args: {
    slug: v.string(),
    username: v.string()
  },
  handler: async (ctx, args) => {
    const { organization } = await requireActiveMembership(ctx, args.slug)
    const memberships = await getOrganizationMemberships(ctx, organization._id)
    const userMap = await getOrganizationUsers(ctx, memberships)
    const membership = memberships.find((entry: any) => userMap.get(entry.userTokenIdentifier)?.username === args.username)

    if (!membership) {
      throw createError('Organization member not found', 'not_found')
    }

    const user = userMap.get(membership.userTokenIdentifier)

    if (!user) {
      throw createError('Organization member not found', 'not_found')
    }

    return buildLegacyMember(membership, user)
  }
})

export const getLegacySyncMembers = query({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const { organization } = await requireActiveMembership(ctx, args.slug)
    const memberships = await getOrganizationMemberships(ctx, organization._id)
    const userMap = await getOrganizationUsers(ctx, memberships)

    return sortMemberships(memberships, { by: 'last_seen_at', direction: 'desc' }).map((membership: any) =>
      buildSyncOrganizationMember(membership, userMap.get(membership.userTokenIdentifier))
    )
  }
})

export const updateLegacyOrganizationMemberRole = mutation({
  args: {
    slug: v.string(),
    membershipId: v.string(),
    role: v.union(...roleValues)
  },
  handler: async (ctx, args) => {
    const { identity, organization } = await requireAdminMembership(ctx, args.slug)
    const memberships = await getOrganizationMemberships(ctx, organization._id)
    const membership = memberships.find((entry: any) => entry._id === args.membershipId && !entry.discardedAt)

    if (!membership) {
      throw createError('Organization member not found', 'not_found')
    }

    const activeAdmins = memberships.filter((entry: any) => !entry.discardedAt && entry.role === 'admin')

    if (
      membership.userTokenIdentifier === identity.tokenIdentifier &&
      membership.role === 'admin' &&
      args.role !== 'admin' &&
      activeAdmins.length === 1
    ) {
      throw createError('Role cannot be updated to a member.', 'unprocessable')
    }

    await ctx.db.patch(membership._id, { role: args.role })

    const updatedMembership = await ctx.db.get(membership._id)
    const user = await getViewerUser(ctx, membership.userTokenIdentifier)

    if (!updatedMembership || !user) {
      throw createError('Organization member not found', 'not_found')
    }

    return buildLegacyMember(updatedMembership, user)
  }
})

export const reactivateLegacyOrganizationMember = mutation({
  args: {
    slug: v.string(),
    membershipId: v.string()
  },
  handler: async (ctx, args) => {
    const { organization } = await requireAdminMembership(ctx, args.slug)
    const memberships = await getOrganizationMemberships(ctx, organization._id)
    const membership = memberships.find((entry: any) => entry._id === args.membershipId)

    if (!membership) {
      throw createError('Organization member not found', 'not_found')
    }

    await ctx.db.patch(membership._id, {
      discardedAt: undefined,
      lastSeenAt: membership.lastSeenAt ?? Date.now()
    })

    await joinDefaultProjects(ctx, organization, membership.userTokenIdentifier)

    return {}
  }
})

export const deactivateLegacyOrganizationMember = mutation({
  args: {
    slug: v.string(),
    membershipId: v.string()
  },
  handler: async (ctx, args) => {
    const { identity, organization } = await requireAdminMembership(ctx, args.slug)
    const memberships = await getOrganizationMemberships(ctx, organization._id)
    const membership = memberships.find((entry: any) => entry._id === args.membershipId && !entry.discardedAt)

    if (!membership) {
      throw createError('Organization member not found', 'not_found')
    }

    const activeAdmins = memberships.filter((entry: any) => !entry.discardedAt && entry.role === 'admin')

    if (
      membership.userTokenIdentifier === identity.tokenIdentifier &&
      membership.role === 'admin' &&
      activeAdmins.length === 1
    ) {
      throw createError('You cannot remove the last admin from the organization.', 'unprocessable')
    }

    await ctx.db.patch(membership._id, {
      discardedAt: Date.now()
    })

    const projectMemberships = await ctx.db
      .query('projectMemberships')
      .withIndex('by_organization_and_user', (q: any) =>
        q.eq('organizationId', organization._id).eq('userTokenIdentifier', membership.userTokenIdentifier)
      )
      .collect()

    for (const projectMembership of projectMemberships) {
      await ctx.db.delete(projectMembership._id)
    }

    return {}
  }
})

export const getLegacyOrganizationMembershipRequestsPage = query({
  args: {
    slug: v.string(),
    after: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { organization } = await requireAdminMembership(ctx, args.slug)
    const requests = await getOrganizationMembershipRequests(ctx, organization._id)
    const sorted = [...requests].sort((a, b) => b.createdAt - a.createdAt || String(b._id).localeCompare(String(a._id)))
    const page = paginateItems(sorted, 50, args.after)
    const users = await Promise.all(page.data.map((request: any) => getViewerUser(ctx, request.userTokenIdentifier)))

    return {
      ...page,
      data: page.data.map((request: any, index: number) => ({
        id: request._id,
        created_at: new Date(request.createdAt).toISOString(),
        organization_slug: organization.slug,
        user: buildLegacyUser(users[index])
      }))
    }
  }
})

export const getLegacyMembershipRequest = query({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await getViewerIdentity(ctx)
    const organization = await getOrganizationBySlug(ctx, args.slug)

    if (!organization) {
      throw createError('Organization not found', 'not_found')
    }

    const request = await ctx.db
      .query('organizationMembershipRequests')
      .withIndex('by_organization_and_user', (q: any) =>
        q.eq('organizationId', organization._id).eq('userTokenIdentifier', identity.tokenIdentifier)
      )
      .unique()

    return {
      requested: !!request
    }
  }
})

export const createLegacyMembershipRequest = mutation({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const identity = await getViewerIdentity(ctx)
    const organization = await getOrganizationBySlug(ctx, args.slug)

    if (!organization) {
      throw createError('Organization not found', 'not_found')
    }

    const existingMembership = await getMembership(ctx, organization._id, identity.tokenIdentifier)

    if (existingMembership && !existingMembership.discardedAt) {
      throw createError('You are already a member of this organization.', 'unprocessable')
    }

    const existingRequest = await ctx.db
      .query('organizationMembershipRequests')
      .withIndex('by_organization_and_user', (q: any) =>
        q.eq('organizationId', organization._id).eq('userTokenIdentifier', identity.tokenIdentifier)
      )
      .unique()

    if (existingRequest) {
      throw createError('Membership already requested', 'unprocessable')
    }

    const requestId = await ctx.db.insert('organizationMembershipRequests', {
      organizationId: organization._id,
      userTokenIdentifier: identity.tokenIdentifier,
      createdAt: Date.now()
    })

    const request = await ctx.db.get(requestId)
    const user = await getViewerUser(ctx, identity.tokenIdentifier)

    if (!request || !user) {
      throw createError('Membership request could not be created', 'unprocessable')
    }

    return {
      id: request._id,
      created_at: new Date(request.createdAt).toISOString(),
      organization_slug: organization.slug,
      user: buildLegacyUser(user)
    }
  }
})

export const approveLegacyMembershipRequest = mutation({
  args: {
    slug: v.string(),
    requestId: v.string()
  },
  handler: async (ctx, args) => {
    const { organization } = await requireAdminMembership(ctx, args.slug)
    const request = (await getOrganizationMembershipRequests(ctx, organization._id)).find(
      (entry: any) => entry._id === args.requestId
    )

    if (!request) {
      throw createError('Membership request not found', 'not_found')
    }

    await ctx.db.delete(request._id)

    await ensureOrganizationScaffold(ctx, organization, request.userTokenIdentifier)

    const existingMembership = await getMembership(ctx, organization._id, request.userTokenIdentifier)

    if (existingMembership) {
      await ctx.db.patch(existingMembership._id, {
        discardedAt: undefined,
        lastSeenAt: existingMembership.lastSeenAt ?? Date.now(),
        role: existingMembership.role === 'guest' ? 'viewer' : existingMembership.role
      })
    } else {
      await ctx.db.insert('organizationMemberships', {
        createdAt: Date.now(),
        discardedAt: undefined,
        lastSeenAt: Date.now(),
        lastViewedPostsAt: new Date().toISOString(),
        organizationId: organization._id,
        role: 'viewer',
        userTokenIdentifier: request.userTokenIdentifier
      })
    }

    await joinDefaultProjects(ctx, organization, request.userTokenIdentifier)

    return {}
  }
})

export const declineLegacyMembershipRequest = mutation({
  args: {
    slug: v.string(),
    requestId: v.string()
  },
  handler: async (ctx, args) => {
    const { organization } = await requireAdminMembership(ctx, args.slug)
    const request = (await getOrganizationMembershipRequests(ctx, organization._id)).find(
      (entry: any) => entry._id === args.requestId
    )

    if (!request) {
      throw createError('Membership request not found', 'not_found')
    }

    await ctx.db.delete(request._id)

    return {}
  }
})
