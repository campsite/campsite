import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { buildLegacyMediaUrl } from './legacy'
import { buildWorkspaceState, generateToken } from './workspace'

function createError(
  message: string,
  code: 'forbidden' | 'not_found' | 'unprocessable' | 'unauthorized' = 'unprocessable'
): never {
  throw new Error(`${code}:${message}`)
}

async function getUserByTokenIdentifier(ctx: any, tokenIdentifier: string) {
  return await ctx.db
    .query('users')
    .withIndex('by_token_identifier', (q: any) => q.eq('tokenIdentifier', tokenIdentifier))
    .unique()
}

async function getViewerTokenIdentifier(ctx: any) {
  const identity = await ctx.auth.getUserIdentity()

  if (!identity?.tokenIdentifier) {
    createError('User not found', 'unauthorized')
  }

  return identity.tokenIdentifier
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

function assertOrganizationMember(context: any): asserts context is { organization: any; viewerMembership: any } {
  if (!context?.organization || !context.viewerMembership) {
    createError('Organization not found', 'not_found')
  }
}

function assertOrganizationAdmin(context: any): asserts context is { organization: any; viewerMembership: any } {
  assertOrganizationMember(context)

  if (context.viewerMembership.role !== 'admin') {
    createError('You do not have permission to manage this integration', 'forbidden')
  }
}

async function getCurrentViewer(ctx: any) {
  const user = await getUserByTokenIdentifier(ctx, await getViewerTokenIdentifier(ctx))

  if (!user) {
    createError('User not found', 'unauthorized')
  }

  return user
}

function parseJson<T>(value?: string | null): T | null {
  if (!value) {
    return null
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function stringifyJson(value: unknown) {
  return JSON.stringify(value)
}

function now() {
  return Date.now()
}

function createPublicId(prefix: string) {
  return `${prefix}_${generateToken()}`
}

async function getOrgIntegration(ctx: any, organizationId: any, provider: string) {
  const rows = await ctx.db
    .query('integrations')
    .withIndex('by_organization_and_provider', (q: any) =>
      q.eq('organizationId', organizationId).eq('provider', provider)
    )
    .collect()

  return rows.find((row: any) => !row.discardedAt) ?? null
}

async function getUserIntegration(ctx: any, tokenIdentifier: string, provider: string) {
  const rows = await ctx.db
    .query('integrations')
    .withIndex('by_user_and_provider', (q: any) =>
      q.eq('userTokenIdentifier', tokenIdentifier).eq('provider', provider)
    )
    .collect()

  return rows.find((row: any) => !row.discardedAt) ?? null
}

async function upsertOrgIntegration(
  ctx: any,
  organizationId: any,
  provider: string,
  data: {
    name: string
    providerAccountId?: string
    scopes?: string[]
    metadata?: Record<string, unknown>
  }
) {
  const existing = await getOrgIntegration(ctx, organizationId, provider)
  const timestamp = now()
  const payload = {
    provider,
    name: data.name,
    organizationId,
    userTokenIdentifier: undefined,
    providerAccountId: data.providerAccountId,
    scopes: data.scopes ?? [],
    metadataJson: stringifyJson(data.metadata ?? {}),
    discardedAt: undefined,
    updatedAt: timestamp
  }

  if (existing) {
    await ctx.db.patch(existing._id, payload)
    return (await ctx.db.get(existing._id)) ?? existing
  }

  const rowId = await ctx.db.insert('integrations', {
    publicId: createPublicId(provider),
    accessToken: undefined,
    refreshToken: undefined,
    createdAt: timestamp,
    ...payload
  })

  return await ctx.db.get(rowId)
}

async function upsertUserIntegration(
  ctx: any,
  tokenIdentifier: string,
  provider: string,
  data: {
    name: string
    providerAccountId?: string
    scopes?: string[]
    metadata?: Record<string, unknown>
  }
) {
  const existing = await getUserIntegration(ctx, tokenIdentifier, provider)
  const timestamp = now()
  const payload = {
    provider,
    name: data.name,
    organizationId: undefined,
    userTokenIdentifier: tokenIdentifier,
    providerAccountId: data.providerAccountId,
    scopes: data.scopes ?? [],
    metadataJson: stringifyJson(data.metadata ?? {}),
    discardedAt: undefined,
    updatedAt: timestamp
  }

  if (existing) {
    await ctx.db.patch(existing._id, payload)
    return (await ctx.db.get(existing._id)) ?? existing
  }

  const rowId = await ctx.db.insert('integrations', {
    publicId: createPublicId(provider),
    accessToken: undefined,
    refreshToken: undefined,
    createdAt: timestamp,
    ...payload
  })

  return await ctx.db.get(rowId)
}

async function replaceIntegrationTeams(
  ctx: any,
  integrationId: any,
  organizationId: any,
  teams: Array<{ providerTeamId: string; name: string; key?: string; private?: boolean }>
) {
  const existing = await ctx.db
    .query('integrationTeams')
    .withIndex('by_integration_id', (q: any) => q.eq('integrationId', integrationId))
    .collect()

  for (const row of existing) {
    await ctx.db.delete(row._id)
  }

  const timestamp = now()

  for (const team of teams) {
    await ctx.db.insert('integrationTeams', {
      integrationId,
      organizationId,
      publicId: createPublicId('team'),
      providerTeamId: team.providerTeamId,
      name: team.name,
      key: team.key,
      private: !!team.private,
      metadataJson: undefined,
      createdAt: timestamp,
      updatedAt: timestamp
    })
  }
}

async function replaceIntegrationChannels(
  ctx: any,
  integrationId: any,
  organizationId: any,
  channels: Array<{ providerChannelId: string; name: string; private?: boolean }>
) {
  const existing = await ctx.db
    .query('integrationChannels')
    .withIndex('by_integration_id', (q: any) => q.eq('integrationId', integrationId))
    .collect()

  for (const row of existing) {
    await ctx.db.delete(row._id)
  }

  const timestamp = now()

  for (const channel of channels) {
    await ctx.db.insert('integrationChannels', {
      integrationId,
      organizationId,
      publicId: createPublicId('channel'),
      providerChannelId: channel.providerChannelId,
      name: channel.name,
      private: !!channel.private,
      syncedAt: undefined,
      metadataJson: undefined,
      createdAt: timestamp,
      updatedAt: timestamp
    })
  }
}

async function setIntegrationMembershipNotifications(
  ctx: any,
  integrationId: any,
  organizationMembershipId: any,
  enabled: boolean
) {
  const existing = await ctx.db
    .query('integrationOrganizationMemberships')
    .withIndex('by_integration_and_membership', (q: any) =>
      q.eq('integrationId', integrationId).eq('organizationMembershipId', organizationMembershipId)
    )
    .unique()

  const timestamp = now()

  if (existing) {
    await ctx.db.patch(existing._id, {
      notificationsEnabled: enabled,
      updatedAt: timestamp
    })
    return
  }

  await ctx.db.insert('integrationOrganizationMemberships', {
    integrationId,
    organizationMembershipId,
    providerMemberId: undefined,
    notificationsEnabled: enabled,
    createdAt: timestamp,
    updatedAt: timestamp
  })
}

function buildSlackIntegrationPayload(integration: any, membershipLinked: boolean) {
  const metadata = parseJson<Record<string, any>>(integration?.metadataJson)

  if (!integration) {
    return null
  }

  return {
    id: integration.publicId,
    provider: 'slack',
    has_link_unfurling_scopes: metadata?.hasLinkUnfurlingScopes ?? true,
    only_scoped_for_notifications: metadata?.onlyScopedForNotifications ?? false,
    has_private_channel_scopes: metadata?.hasPrivateChannelScopes ?? true,
    current_organization_membership_is_linked: membershipLinked,
    token: null,
    team_id: metadata?.teamId ?? null
  }
}

function buildLinearIntegrationPayload(integration: any) {
  if (!integration) {
    return null
  }

  return {
    id: integration.publicId,
    provider: 'linear'
  }
}

function buildSlackChannelPayload(channel: any) {
  return {
    id: channel.providerChannelId,
    name: channel.name,
    is_private: !!channel.private
  }
}

function buildLinearTeamPayload(team: any) {
  return {
    id: team.publicId,
    name: team.name,
    private: team.private ? 'true' : 'false',
    provider_team_id: team.providerTeamId,
    key: team.key ?? ''
  }
}

function stableHashNumber(value: string) {
  let hash = 0

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  }

  return hash || 1
}

function parseFigmaFileUrl(value: string) {
  try {
    const url = new URL(value)
    const segments = url.pathname.split('/').filter(Boolean)
    const fileIndex = segments.findIndex((segment) => segment === 'file' || segment === 'design')
    const providerFileId = fileIndex >= 0 ? segments[fileIndex + 1] : segments[segments.length - 1]
    const nodeId = url.searchParams.get('node-id') || '0:1'
    const name = decodeURIComponent(segments[fileIndex + 2] || 'Figma file').replace(/-/g, ' ')

    if (!providerFileId) {
      createError('Invalid Figma file URL')
    }

    return {
      providerFileId,
      nodeId,
      name
    }
  } catch {
    createError('Invalid Figma file URL')
  }
}

export const getLegacySlackIntegration = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)
    const integration = await getOrgIntegration(ctx, context.organization._id, 'slack')
    const membershipLink = integration
      ? await ctx.db
          .query('integrationOrganizationMemberships')
          .withIndex('by_integration_and_membership', (q: any) =>
            q.eq('integrationId', integration._id).eq('organizationMembershipId', context.viewerMembership._id)
          )
          .unique()
      : null

    return buildSlackIntegrationPayload(integration, !!membershipLink)
  }
})

export const deleteLegacySlackIntegration = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationAdmin(context)
    const integration = await getOrgIntegration(ctx, context.organization._id, 'slack')

    if (!integration) {
      return {}
    }

    await ctx.db.patch(integration._id, {
      discardedAt: now(),
      updatedAt: now()
    })

    return {}
  }
})

export const getLegacySlackChannelsPage = query({
  args: {
    slug: v.string(),
    q: v.optional(v.string()),
    after: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)
    const integration = await getOrgIntegration(ctx, context.organization._id, 'slack')

    if (!integration) {
      return { next_cursor: null, prev_cursor: null, data: [] }
    }

    const rows = await ctx.db
      .query('integrationChannels')
      .withIndex('by_integration_id', (q: any) => q.eq('integrationId', integration._id))
      .collect()
    const filtered = rows
      .filter((row: any) => !args.q || row.name.toLowerCase().includes(args.q.toLowerCase()))
      .sort((a: any, b: any) => a.name.localeCompare(b.name))
    const safeLimit = Math.max(1, Math.min(args.limit ?? 50, 100))
    const startIndex = args.after ? filtered.findIndex((item: any) => item.providerChannelId === args.after) + 1 : 0
    const page = filtered.slice(Math.max(0, startIndex), Math.max(0, startIndex) + safeLimit)

    return {
      next_cursor: startIndex + safeLimit < filtered.length ? page[page.length - 1]?.providerChannelId ?? null : null,
      prev_cursor: null,
      data: page.map(buildSlackChannelPayload)
    }
  }
})

export const getLegacySlackChannelByProviderId = query({
  args: {
    slug: v.string(),
    providerChannelId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)
    const row = await ctx.db
      .query('integrationChannels')
      .withIndex('by_org_and_provider_channel_id', (q: any) =>
        q.eq('organizationId', context.organization._id).eq('providerChannelId', args.providerChannelId)
      )
      .unique()

    if (!row) {
      createError('Slack channel not found', 'not_found')
    }

    return buildSlackChannelPayload(row)
  }
})

export const createLegacySlackChannelSync = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationAdmin(context)
    const integration = await upsertOrgIntegration(ctx, context.organization._id, 'slack', {
      name: 'Slack',
      metadata: {
        teamId: `slack-${context.organization.slug}`,
        hasLinkUnfurlingScopes: true,
        onlyScopedForNotifications: false,
        hasPrivateChannelScopes: true
      }
    })

    await replaceIntegrationChannels(ctx, integration._id, context.organization._id, [
      { providerChannelId: `${context.organization.slug}-general`, name: 'general', private: false },
      { providerChannelId: `${context.organization.slug}-product`, name: 'product', private: false },
      { providerChannelId: `${context.organization.slug}-leadership`, name: 'leadership', private: true }
    ])

    return {}
  }
})

export const completeSlackIntegrationCallback = mutation({
  args: {
    slug: v.string(),
    enableNotifications: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)
    const integration = await upsertOrgIntegration(ctx, context.organization._id, 'slack', {
      name: 'Slack',
      providerAccountId: `slack-${context.organization.slug}`,
      scopes: ['channels:read', 'chat:write', 'links:read'],
      metadata: {
        teamId: `slack-${context.organization.slug}`,
        hasLinkUnfurlingScopes: true,
        onlyScopedForNotifications: false,
        hasPrivateChannelScopes: true
      }
    })

    await replaceIntegrationChannels(ctx, integration._id, context.organization._id, [
      { providerChannelId: `${context.organization.slug}-general`, name: 'general', private: false },
      { providerChannelId: `${context.organization.slug}-product`, name: 'product', private: false },
      { providerChannelId: `${context.organization.slug}-leadership`, name: 'leadership', private: true }
    ])

    await setIntegrationMembershipNotifications(ctx, integration._id, context.viewerMembership._id, !!args.enableNotifications)

    return buildSlackIntegrationPayload(integration, true)
  }
})

export const getLegacyLinearIntegration = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)
    return buildLinearIntegrationPayload(await getOrgIntegration(ctx, context.organization._id, 'linear'))
  }
})

export const deleteLegacyLinearIntegration = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationAdmin(context)
    const integration = await getOrgIntegration(ctx, context.organization._id, 'linear')

    if (integration) {
      await ctx.db.patch(integration._id, {
        discardedAt: now(),
        updatedAt: now()
      })
    }

    return {}
  }
})

export const getLegacyLinearTeams = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)
    const integration = await getOrgIntegration(ctx, context.organization._id, 'linear')

    if (!integration) {
      return []
    }

    const rows = await ctx.db
      .query('integrationTeams')
      .withIndex('by_integration_id', (q: any) => q.eq('integrationId', integration._id))
      .collect()

    return rows.sort((a: any, b: any) => a.name.localeCompare(b.name)).map(buildLinearTeamPayload)
  }
})

export const createLegacyLinearTeamSync = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationAdmin(context)
    const integration = await upsertOrgIntegration(ctx, context.organization._id, 'linear', {
      name: 'Linear',
      providerAccountId: `linear-${context.organization.slug}`,
      scopes: ['issues:create'],
      metadata: {}
    })

    await replaceIntegrationTeams(ctx, integration._id, context.organization._id, [
      { providerTeamId: `${context.organization.slug}-eng`, name: 'Engineering', key: 'ENG', private: false },
      { providerTeamId: `${context.organization.slug}-design`, name: 'Design', key: 'DES', private: false }
    ])

    return {}
  }
})

export const completeLinearIntegrationCallback = mutation({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)
    const integration = await upsertOrgIntegration(ctx, context.organization._id, 'linear', {
      name: 'Linear',
      providerAccountId: `linear-${context.organization.slug}`,
      scopes: ['issues:create'],
      metadata: {}
    })

    await replaceIntegrationTeams(ctx, integration._id, context.organization._id, [
      { providerTeamId: `${context.organization.slug}-eng`, name: 'Engineering', key: 'ENG', private: false },
      { providerTeamId: `${context.organization.slug}-design`, name: 'Design', key: 'DES', private: false }
    ])

    return buildLinearIntegrationPayload(integration)
  }
})

export const getLegacyFigmaIntegration = query({
  args: {},
  handler: async (ctx) => {
    const tokenIdentifier = await getViewerTokenIdentifier(ctx)

    return {
      has_figma_integration: !!(await getUserIntegration(ctx, tokenIdentifier, 'figma'))
    }
  }
})

export const completeFigmaIntegrationCallback = mutation({
  args: {},
  handler: async (ctx) => {
    const tokenIdentifier = await getViewerTokenIdentifier(ctx)

    await upsertUserIntegration(ctx, tokenIdentifier, 'figma', {
      name: 'Figma',
      providerAccountId: `figma-${tokenIdentifier}`,
      scopes: ['files:read', 'file_comments:write', 'webhooks:write'],
      metadata: {}
    })

    const viewer = await getCurrentViewer(ctx)
    const existing = await ctx.db
      .query('figmaUsers')
      .withIndex('by_user_token_identifier', (q: any) => q.eq('userTokenIdentifier', tokenIdentifier))
      .unique()

    if (!existing) {
      await ctx.db.insert('figmaUsers', {
        integrationId: undefined,
        userTokenIdentifier: tokenIdentifier,
        providerUserId: createPublicId('figma_user'),
        handle: viewer.username,
        email: viewer.email,
        createdAt: now(),
        updatedAt: now()
      })
    }

    return { has_figma_integration: true }
  }
})

export const createLegacyFigmaFileAttachmentDetails = mutation({
  args: {
    slug: v.string(),
    figmaFileUrl: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)
    const tokenIdentifier = await getViewerTokenIdentifier(ctx)
    const userIntegration = await getUserIntegration(ctx, tokenIdentifier, 'figma')

    if (!userIntegration) {
      createError('Figma integration not found', 'not_found')
    }

    const parsed = parseFigmaFileUrl(args.figmaFileUrl)
    const filePath = buildLegacyMediaUrl(`/api/figma/${parsed.providerFileId}.png`) ?? `/api/figma/${parsed.providerFileId}.png`
    const existing = await ctx.db
      .query('figmaFiles')
      .withIndex('by_provider_file_id', (q: any) => q.eq('providerFileId', parsed.providerFileId))
      .unique()
    const timestamp = now()

    if (!existing) {
      await ctx.db.insert('figmaFiles', {
        organizationId: context.organization._id,
        integrationId: userIntegration._id,
        publicId: createPublicId('figma_file'),
        providerFileId: parsed.providerFileId,
        name: parsed.name,
        shareUrl: args.figmaFileUrl,
        thumbnailUrl: filePath,
        imageUrl: filePath,
        createdAt: timestamp,
        updatedAt: timestamp
      })
    }

    return {
      file_path: filePath,
      width: 1920,
      height: 1080,
      size: 0,
      file_type: 'image/png',
      figma_file_id: stableHashNumber(parsed.providerFileId),
      remote_figma_node_id: parsed.nodeId,
      remote_figma_node_type: 'FRAME',
      remote_figma_node_name: parsed.name,
      figma_share_url: args.figmaFileUrl,
      image_urls: {
        original_url: filePath,
        thumbnail_url: filePath,
        feed_url: filePath,
        email_url: filePath,
        slack_url: filePath,
        large_url: filePath
      }
    }
  }
})

export const getLegacyCalDotComIntegration = query({
  args: {},
  handler: async (ctx) => {
    const integration = await getUserIntegration(ctx, await getViewerTokenIdentifier(ctx), 'cal_dot_com')
    const metadata = parseJson<Record<string, any>>(integration?.metadataJson)

    return {
      installed: !!integration,
      organization:
        metadata?.organization ??
        {
          id: '',
          name: '',
          slug: '',
          avatar_url: '',
          avatar_urls: {
            xs: '',
            sm: '',
            base: '',
            lg: '',
            xl: '',
            xxl: ''
          },
          viewer_is_admin: false,
          viewer_can_leave: false
        }
    }
  }
})

export const updateLegacyCalDotComOrganization = mutation({
  args: { organizationId: v.string() },
  handler: async (ctx, args) => {
    const state = await buildWorkspaceState(ctx)
    const membershipEntry = state.memberships.find((entry: any) => entry.organization?._id === args.organizationId)

    if (!membershipEntry?.organization) {
      createError('Organization not found', 'not_found')
    }

    const tokenIdentifier = await getViewerTokenIdentifier(ctx)

    await upsertUserIntegration(ctx, tokenIdentifier, 'cal_dot_com', {
      name: 'Cal.com',
      providerAccountId: `cal-${tokenIdentifier}`,
      metadata: {
        organization: {
          id: membershipEntry.organization._id,
          name: membershipEntry.organization.name,
          slug: membershipEntry.organization.slug,
          avatar_url: buildLegacyMediaUrl(membershipEntry.organization.avatarPath ?? '') ?? '',
          avatar_urls: {
            xs: buildLegacyMediaUrl(membershipEntry.organization.avatarPath ?? '') ?? '',
            sm: buildLegacyMediaUrl(membershipEntry.organization.avatarPath ?? '') ?? '',
            base: buildLegacyMediaUrl(membershipEntry.organization.avatarPath ?? '') ?? '',
            lg: buildLegacyMediaUrl(membershipEntry.organization.avatarPath ?? '') ?? '',
            xl: buildLegacyMediaUrl(membershipEntry.organization.avatarPath ?? '') ?? '',
            xxl: buildLegacyMediaUrl(membershipEntry.organization.avatarPath ?? '') ?? ''
          },
          viewer_is_admin: membershipEntry.membership?.role === 'admin',
          viewer_can_leave: membershipEntry.membership?.role !== 'admin'
        }
      }
    })

    return {}
  }
})
