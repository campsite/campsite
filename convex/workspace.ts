import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
import {
  buildLegacyOrganizationSettings,
  ensureDefaultOrganizationSettings,
  getOrganizationSettingsMap,
  getUserPreferencesMap,
  recordFriendlySlug,
  seedUserPreferences,
  upsertUserPreference
} from './accountShell'
import { buildLegacyAvatarUrls, buildLegacyMediaUrl, formatDate, isNotificationsPaused } from './legacy'

type ViewerIdentity = {
  email?: string | null
  name?: string | null
  nickname?: string | null
  preferredUsername?: string | null
  subject: string
  tokenIdentifier: string
}

type ViewerProfile = {
  email?: string | null
  firstName?: string | null
  lastName?: string | null
  name?: string | null
  nickname?: string | null
  preferredUsername?: string | null
}

type ResolvedViewerProfile = {
  email?: string
  firstName?: string
  lastName?: string
  name?: string
  nickname?: string
  preferredUsername?: string
  subject: string
  tokenIdentifier: string
}

export const defaultPreferences = {
  email_notifications: 'enabled',
  feature_tip_calls_index_integrations: 'false',
  feature_tip_drafts: 'false',
  feature_tip_figma_plugin: 'false',
  feature_tip_interstitial: 'false',
  feature_tip_note_attachment: 'false',
  feature_tip_onboard_install_apps: 'false',
  home_display_attachments: 'true',
  home_display_comments: 'true',
  home_display_reactions: 'true',
  home_display_resolved: 'true',
  layout: 'feed',
  message_email_notifications: 'enabled',
  notes_layout: 'list',
  posts_density: 'comfortable',
  prefers_desktop_app: 'disabled',
  theme: 'system'
}

export const DEFAULT_ORG_TAGS = ['wip', 'shipped', 'a11y', 'rfc', 'feedback', 'prototype'] as const

export const DEFAULT_ORG_PROJECTS = [
  {
    name: 'General',
    description: 'Share updates, work-in-progress, and team announcements.',
    isGeneral: true,
    isDefault: true
  }
] as const

function normalizeString(value?: string | null) {
  const normalized = value?.trim()

  return normalized ? normalized : undefined
}

export function normalizeEmail(value?: string | null) {
  const normalized = normalizeString(value)

  return normalized ? normalized.toLowerCase() : undefined
}

export function generateToken() {
  return `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

export function buildLegacyPreferences(preferences?: Record<string, string>) {
  if (!preferences) {
    return defaultPreferences
  }

  const { timezone: _timezone, ...legacyPreferences } = preferences

  return {
    ...defaultPreferences,
    ...legacyPreferences
  }
}

function getViewerTimezone(preferences?: Record<string, string>) {
  return preferences?.timezone ?? null
}

function joinName(firstName?: string | null, lastName?: string | null) {
  const fullName = [normalizeString(firstName), normalizeString(lastName)].filter(Boolean).join(' ').trim()

  return fullName || undefined
}

export function toSlug(value: string) {
  return (
    value
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  )
}

export function fallbackName(identity: ViewerIdentity | ResolvedViewerProfile) {
  const fullName = identity.name?.trim()

  if (fullName) {
    return fullName
  }

  return (
    identity.nickname ||
    identity.preferredUsername ||
    identity.email?.split('@')[0] ||
    'Campsite User'
  )
}

export function resolveViewerProfile(identity: ViewerIdentity, profile?: ViewerProfile): ResolvedViewerProfile {
  const firstName = normalizeString(profile?.firstName)
  const lastName = normalizeString(profile?.lastName)
  const fullName = joinName(firstName, lastName)
  const name = normalizeString(profile?.name) || fullName || normalizeString(identity.name)

  return {
    email: normalizeEmail(profile?.email) || normalizeEmail(identity.email),
    firstName,
    lastName,
    name,
    nickname: normalizeString(profile?.nickname) || normalizeString(identity.nickname),
    preferredUsername: normalizeString(profile?.preferredUsername) || normalizeString(identity.preferredUsername),
    subject: identity.subject,
    tokenIdentifier: identity.tokenIdentifier
  }
}

export function fallbackUsername(identity: ViewerIdentity | ResolvedViewerProfile) {
  const base = identity.preferredUsername || identity.email?.split('@')[0] || fallbackName(identity)

  return toSlug(base) || 'user'
}

function fallbackWorkspaceSlug(identity: ViewerIdentity) {
  const base = identity.email?.split('@')[0] || identity.preferredUsername || fallbackName(identity)

  return toSlug(base) || 'workspace'
}

export async function getViewerIdentity(ctx: any): Promise<ViewerIdentity> {
  const identity = await ctx.auth.getUserIdentity()

  if (!identity) {
    throw new Error('Not signed in')
  }

  return identity
}

export async function ensureUniqueSlug(ctx: any, desiredSlug: string) {
  let attempt = desiredSlug
  let suffix = 2

  while (true) {
    const existing = await ctx.db.query('organizations').withIndex('by_slug', (q: any) => q.eq('slug', attempt)).unique()

    if (!existing) {
      return attempt
    }

    attempt = `${desiredSlug}-${suffix}`
    suffix += 1
  }
}

export async function getWorkspaceMemberships(ctx: any, tokenIdentifier: string) {
  const memberships = await ctx.db
    .query('organizationMemberships')
    .withIndex('by_user_token_identifier', (q: any) => q.eq('userTokenIdentifier', tokenIdentifier))
    .collect()

  return await Promise.all(
    memberships.map(async (membership: any) => ({
      membership,
      organization: await ctx.db.get(membership.organizationId)
    }))
  )
}

export async function ensureOrganizationScaffold(ctx: any, organization: any, creatorTokenIdentifier: string) {
  const existingTags = await ctx.db
    .query('tags')
    .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organization._id))
    .collect()
  const existingTagNames = new Set(existingTags.map((tag: any) => tag.name))

  for (const tagName of DEFAULT_ORG_TAGS) {
    if (!existingTagNames.has(tagName)) {
      await ctx.db.insert('tags', {
        organizationId: organization._id,
        name: tagName,
        createdAt: Date.now()
      })
    }
  }

  const existingProjects = await ctx.db
    .query('projects')
    .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organization._id))
    .collect()

  for (const defaultProject of DEFAULT_ORG_PROJECTS) {
    let project = existingProjects.find((entry: any) => entry.isGeneral === defaultProject.isGeneral)

    if (!project) {
      const projectId = await ctx.db.insert('projects', {
        organizationId: organization._id,
        creatorTokenIdentifier,
        inviteToken: generateToken(),
        name: defaultProject.name,
        description: defaultProject.description,
        accessory: undefined,
        coverPhotoPath: undefined,
        slackChannelId: undefined,
        private: false,
        personal: false,
        isGeneral: defaultProject.isGeneral,
        isDefault: defaultProject.isDefault,
        archivedAt: undefined,
        lastActivityAt: Date.now(),
        createdAt: Date.now()
      })

      project = await ctx.db.get(projectId)
    }

    if (project) {
      const existingMembership = await ctx.db
        .query('projectMemberships')
        .withIndex('by_project_and_user', (q: any) =>
          q.eq('projectId', project._id).eq('userTokenIdentifier', creatorTokenIdentifier)
        )
        .unique()

      if (!existingMembership) {
        await ctx.db.insert('projectMemberships', {
          organizationId: organization._id,
          projectId: project._id,
          userTokenIdentifier: creatorTokenIdentifier,
          createdAt: Date.now()
        })
      }
    }
  }
}

export async function buildWorkspaceState(ctx: any) {
  const identity = await getViewerIdentity(ctx)
  const user = await ctx.db
    .query('users')
    .withIndex('by_token_identifier', (q: any) => q.eq('tokenIdentifier', identity.tokenIdentifier))
    .unique()

  if (!user) {
    throw new Error('Viewer has not been provisioned')
  }

  const memberships = await getWorkspaceMemberships(ctx, identity.tokenIdentifier)
  const activeMembership = memberships.find((entry) => !!entry.organization && !entry.membership.discardedAt)

  if (!activeMembership?.organization) {
    throw new Error('Viewer has no organization')
  }

  return {
    identity,
    memberships,
    organization: activeMembership.organization,
    user
  }
}

export function buildLegacyOrganization(params: {
  settings?: Record<string, string>
  memberships: Array<{ membership: any; organization: any | null }>
  organization: any
  membership: any
}) {
  const { memberships, organization, membership, settings } = params
  const avatarUrl = buildLegacyMediaUrl(organization.avatarPath ?? organization.avatar_url)

  return {
    avatar_url: avatarUrl || '',
    avatar_urls: buildLegacyAvatarUrls(avatarUrl),
    channel_name: `org-${organization.slug}`,
    created_at: new Date(organization.createdAt).toISOString(),
    email_domain: organization.emailDomain ?? null,
    features: ['my_work'],
    id: organization._id,
    invitation_url: organization.inviteToken ? `/join/${organization.inviteToken}` : '',
    limits: {
      file_size_bytes: null
    },
    member_count: memberships.filter((entry) => entry.organization?._id === organization._id).length,
    name: organization.name,
    onboarded_at: organization.onboardedAt ? new Date(organization.onboardedAt).toISOString() : null,
    paid: false,
    plan_name: 'Starter',
    presence_channel_name: `presence-org-${organization.slug}`,
    settings: buildLegacyOrganizationSettings(settings ?? {}),
    show_upgrade_banner: false,
    slug: organization.slug,
    trial_active: false,
    trial_days_remaining: null,
    trial_expired: false,
    viewer_can_create_custom_reaction: false,
    viewer_can_create_digest: false,
    viewer_can_create_invitation: true,
    viewer_can_create_note: true,
    viewer_can_create_project: true,
    viewer_can_create_tag: membership.role === 'admin',
    viewer_can_leave: membership.role !== 'admin',
    viewer_can_manage_integrations: false,
    viewer_can_post: true,
    viewer_can_see_new_project_button: true,
    viewer_can_see_people_index: true,
    viewer_can_see_projects_index: true,
    viewer_is_admin: membership.role === 'admin',
    viewer_member_id: membership._id
  }
}

export const ensureViewerWorkspace = mutation({
  args: {
    profile: v.optional(
      v.object({
        email: v.optional(v.string()),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        name: v.optional(v.string()),
        nickname: v.optional(v.string()),
        preferredUsername: v.optional(v.string())
      })
    )
  },
  handler: async (ctx, args) => {
    const identity = await getViewerIdentity(ctx)
    const profile = resolveViewerProfile(identity, args.profile)
    const username = fallbackUsername(profile)
    const displayName = fallbackName(profile)
    const now = Date.now()

    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_token_identifier', (q: any) => q.eq('tokenIdentifier', identity.tokenIdentifier))
      .unique()

    let userId = existingUser?._id

    const userFields = {
      displayName,
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      lastSeenAt: now,
      name: profile.name,
      nickname: profile.nickname,
      preferences: existingUser?.preferences || defaultPreferences,
      preferredUsername: profile.preferredUsername,
      subject: profile.subject,
      username
    }

    if (existingUser) {
      await ctx.db.patch(existingUser._id, userFields)
      await seedUserPreferences(ctx, { ...existingUser, ...userFields }, defaultPreferences)
      await recordFriendlySlug(ctx, {
        slug: userFields.username,
        sluggableType: 'User',
        sluggableId: existingUser.publicId ?? existingUser._id
      })
    } else {
      const userPublicId = generateToken().slice(0, 12)
      userId = await ctx.db.insert('users', {
        ...userFields,
        createdAt: now,
        publicId: userPublicId,
        updatedAt: now,
        tokenIdentifier: profile.tokenIdentifier
      })
      await seedUserPreferences(ctx, { _id: userId, ...userFields }, defaultPreferences)
      await recordFriendlySlug(ctx, {
        slug: userFields.username,
        sluggableType: 'User',
        sluggableId: userPublicId
      })
    }

    const existingMemberships = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_user_token_identifier', (q: any) => q.eq('userTokenIdentifier', identity.tokenIdentifier))
      .collect()
    const existingMembership = existingMemberships.find((membership: any) => !membership.discardedAt)

    if (existingMembership) {
      const organization = await ctx.db.get(existingMembership.organizationId)

      if (!organization) {
        throw new Error('Organization not found')
      }

      await ensureOrganizationScaffold(ctx, organization, identity.tokenIdentifier)
      await ensureDefaultOrganizationSettings(ctx, organization._id)

      return {
        organization,
        tokenIdentifier: identity.tokenIdentifier,
        user: await ctx.db.get(userId!)
      }
    }

    const baseSlug = fallbackWorkspaceSlug(identity)
    const slug = await ensureUniqueSlug(ctx, baseSlug)
    const organizationPublicId = generateToken().slice(0, 12)
    const organizationId = await ctx.db.insert('organizations', {
      avatarPath: undefined,
      createdAt: now,
      publicId: organizationPublicId,
      updatedAt: now,
      emailDomain: undefined,
      inviteToken: generateToken(),
      name: `${displayName}'s workspace`,
      onboardedAt: undefined,
      orgSize: undefined,
      ownerTokenIdentifier: identity.tokenIdentifier,
      role: undefined,
      slug,
      source: undefined,
      why: undefined
    })
    await ensureDefaultOrganizationSettings(ctx, organizationId)
    await recordFriendlySlug(ctx, {
      slug,
      sluggableType: 'Organization',
      sluggableId: organizationPublicId
    })

    await ctx.db.insert('organizationMemberships', {
      createdAt: now,
      updatedAt: now,
      discardedAt: undefined,
      lastSeenAt: now,
      lastViewedPostsAt: new Date(now).toISOString(),
      organizationId,
      publicId: generateToken().slice(0, 12),
      role: 'admin',
      userTokenIdentifier: identity.tokenIdentifier
    })

    const organization = await ctx.db.get(organizationId)

    if (!organization) {
      throw new Error('Organization not found')
    }

    await ensureOrganizationScaffold(ctx, organization, identity.tokenIdentifier)

    return {
      organization,
      tokenIdentifier: identity.tokenIdentifier,
      user: await ctx.db.get(userId!)
    }
  }
})

export const getLegacyCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const { identity, user } = await buildWorkspaceState(ctx)
    const preferences = await getUserPreferencesMap(ctx, user, defaultPreferences)
    const avatarUrl = buildLegacyMediaUrl(user.avatarPath ?? user.avatar_url)
    const coverPhotoUrl = buildLegacyMediaUrl(user.coverPhotoPath ?? user.cover_photo_url)

    return {
      avatar_url: avatarUrl || '',
      avatar_urls: buildLegacyAvatarUrls(avatarUrl),
      channel_name: `private-user-${user._id}`,
      cover_photo_url: coverPhotoUrl,
      created_at: null,
      display_name: user.displayName,
      email: user.email || identity.email || '',
      email_confirmed: true,
      features: ['my_work'],
      id: user._id,
      integration: false,
      logged_in: true,
      managed: false,
      notification_pause_expires_at: formatDate(user.notificationPauseExpiresAt),
      notifications_paused: isNotificationsPaused(user),
      on_call: false,
      onboarded_at: new Date(user.createdAt).toISOString(),
      preferences: buildLegacyPreferences(preferences),
      staff: false,
      system: false,
      timezone: getViewerTimezone(preferences),
      two_factor_enabled: false,
      unconfirmed_email: null,
      username: user.username
    }
  }
})

export const getLegacyOrganizationMemberships = query({
  args: {},
  handler: async (ctx) => {
    const { memberships } = await buildWorkspaceState(ctx)

    return memberships
      .filter((entry) => !!entry.organization && !entry.membership.discardedAt)
      .map((entry) => ({
        id: entry.membership._id,
        last_viewed_posts_at: entry.membership.lastViewedPostsAt,
        organization: {
          avatar_url: buildLegacyMediaUrl(entry.organization!.avatarPath ?? entry.organization!.avatar_url) || '',
          avatar_urls: buildLegacyAvatarUrls(entry.organization!.avatarPath ?? entry.organization!.avatar_url),
          id: entry.organization!._id,
          name: entry.organization!.name,
          slug: entry.organization!.slug,
          viewer_can_leave: entry.membership.role !== 'admin',
          viewer_is_admin: entry.membership.role === 'admin'
        }
      }))
  }
})

export const getLegacyOrganizationBySlug = query({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const { memberships } = await buildWorkspaceState(ctx)
    let match = memberships.find((entry) => entry.organization?.slug === args.slug)

    if (!match?.organization) {
      const slugRows = await ctx.db
        .query('friendlyIdSlugs')
        .withIndex('by_slug', (q: any) => q.eq('slug', args.slug))
        .collect()
      const organizationSlug = slugRows.find((row: any) => row.sluggableType === 'Organization')

      if (organizationSlug) {
        match =
          memberships.find((entry) => entry.organization?._id === organizationSlug.sluggableId) ?? null
      }
    }

    if (!match?.organization) {
      return null
    }

    const settings = await getOrganizationSettingsMap(ctx, match.organization._id)

    return buildLegacyOrganization({
      memberships,
      membership: match.membership,
      organization: match.organization,
      settings
    })
  }
})

export const updateViewerProfile = mutation({
  args: {
    avatarPath: v.optional(v.union(v.string(), v.null())),
    coverPhotoPath: v.optional(v.union(v.string(), v.null())),
    email: v.optional(v.string()),
    name: v.optional(v.string()),
    username: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { user } = await buildWorkspaceState(ctx)
    const updates: Record<string, string | undefined> = {}

    if (typeof args.email === 'string') {
      updates.email = normalizeEmail(args.email) || args.email
    }

    if (typeof args.name === 'string') {
      const [firstName, ...rest] = args.name.trim().split(/\s+/).filter(Boolean)

      updates.displayName = args.name
      updates.name = args.name
      updates.firstName = firstName || undefined
      updates.lastName = rest.length > 0 ? rest.join(' ') : undefined
    }

    if (typeof args.username === 'string') {
      updates.username = toSlug(args.username) || user.username
    }

    if (args.avatarPath !== undefined) {
      updates.avatarPath = args.avatarPath || undefined
    }

    if (args.coverPhotoPath !== undefined) {
      updates.coverPhotoPath = args.coverPhotoPath || undefined
    }

    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(user._id, { ...updates, updatedAt: Date.now() })

      if (updates.username) {
        await recordFriendlySlug(ctx, {
          slug: updates.username,
          sluggableType: 'User',
          sluggableId: user.publicId ?? user._id
        })
      }
    }

    return await ctx.db.get(user._id)
  }
})

export const updateViewerPreference = mutation({
  args: {
    preference: v.string(),
    value: v.string()
  },
  handler: async (ctx, args) => {
    const { user } = await buildWorkspaceState(ctx)
    await upsertUserPreference(ctx, user, args.preference, args.value, defaultPreferences)

    return {
      preference: args.preference
    }
  }
})

export const createOrganization = mutation({
  args: {
    avatarPath: v.optional(v.string()),
    name: v.string(),
    orgSize: v.optional(v.string()),
    role: v.optional(v.string()),
    slug: v.string(),
    source: v.optional(v.string()),
    why: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const identity = await getViewerIdentity(ctx)
    const desiredSlug = toSlug(args.slug)

    if (!desiredSlug) {
      throw new Error('Organization slug is required')
    }

    const existingOrganization = await ctx.db
      .query('organizations')
      .withIndex('by_slug', (q: any) => q.eq('slug', desiredSlug))
      .unique()

    if (existingOrganization) {
      throw new Error('Organization slug is already taken')
    }

    const organizationPublicId = generateToken().slice(0, 12)
    const organizationId = await ctx.db.insert('organizations', {
      avatarPath: args.avatarPath,
      billingEmail: undefined,
      createdAt: Date.now(),
      publicId: organizationPublicId,
      updatedAt: Date.now(),
      emailDomain: undefined,
      inviteToken: generateToken(),
      name: args.name,
      onboardedAt: undefined,
      orgSize: args.orgSize,
      ownerTokenIdentifier: identity.tokenIdentifier,
      role: args.role,
      slackChannelId: undefined,
      slackChannelIsPrivate: undefined,
      slug: desiredSlug,
      source: args.source,
      why: args.why
    })
    await ensureDefaultOrganizationSettings(ctx, organizationId)
    await recordFriendlySlug(ctx, {
      slug: desiredSlug,
      sluggableType: 'Organization',
      sluggableId: organizationPublicId
    })

    const existingMembership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q: any) =>
        q.eq('organizationId', organizationId).eq('userTokenIdentifier', identity.tokenIdentifier)
      )
      .unique()

    let membershipId = existingMembership?._id

    if (!existingMembership) {
      membershipId = await ctx.db.insert('organizationMemberships', {
        createdAt: Date.now(),
        updatedAt: Date.now(),
        discardedAt: undefined,
        lastSeenAt: Date.now(),
        lastViewedPostsAt: new Date().toISOString(),
        organizationId,
        publicId: generateToken().slice(0, 12),
        role: 'admin',
        userTokenIdentifier: identity.tokenIdentifier
      })
    }

    const memberships = await getWorkspaceMemberships(ctx, identity.tokenIdentifier)
    const organization = await ctx.db.get(organizationId)
    const membership = membershipId ? await ctx.db.get(membershipId) : null

    if (!organization || !membership) {
      throw new Error('Organization could not be created')
    }

    await ensureOrganizationScaffold(ctx, organization, identity.tokenIdentifier)

    return buildLegacyOrganization({
      memberships: [
        ...memberships,
        {
          membership,
          organization
        }
      ],
      membership,
      organization,
      settings: await getOrganizationSettingsMap(ctx, organization._id)
    })
  }
})
