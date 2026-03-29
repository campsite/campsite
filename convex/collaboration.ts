import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { buildLegacyAvatarUrls, buildLegacyMediaUrl, buildLegacyMember, emptyAvatarUrls } from './legacy'
import { buildWorkspaceState, generateToken } from './workspace'
const OAUTH_APP_WEBHOOK_EVENTS = ['post.created', 'comment.created', 'app.mentioned', 'message.created', 'message.dm'] as const

const packCatalog = {
  blobs: [
    {
      name: 'blob-smile-happy',
      file_url: '/img/campsite-avatar-fallback.png',
      file_type: 'image/png'
    },
    {
      name: 'blob-celebrate',
      file_url: '/img/avatar-fallback.png',
      file_type: 'image/png'
    }
  ],
  memes: [
    {
      name: 'meme-party',
      file_url: '/img/services/campsite.png',
      file_type: 'image/png'
    },
    {
      name: 'meme-rage',
      file_url: '/img/services/threads.png',
      file_type: 'image/gif'
    }
  ],
  meows: [
    {
      name: 'party-meow',
      file_url: '/img/services/campsite.png',
      file_type: 'image/png'
    },
    {
      name: 'raging-meow',
      file_url: '/img/services/threads.png',
      file_type: 'image/gif'
    }
  ],
  parrots: [
    {
      name: 'party-parrot',
      file_url: '/img/avatar-fallback.png',
      file_type: 'image/png'
    },
    {
      name: 'typing-parrot',
      file_url: '/img/services/campsite.png',
      file_type: 'image/png'
    }
  ],
  llamas: [
    {
      name: 'llama-hype',
      file_url: '/img/services/campsite.png',
      file_type: 'image/png'
    },
    {
      name: 'llama-wow',
      file_url: '/img/campsite-avatar-fallback.png',
      file_type: 'image/png'
    }
  ]
} as const

type CompatCustomReaction = {
  id: string
  name: string
  file_url: string
  file_type: string
  created_at: string
  pack?: string
  creator: any
}

type CustomReactionRow = {
  _id: any
  organizationId: any
  publicId: string
  name: string
  filePath: string
  fileType: string
  pack?: string
  creatorTokenIdentifier: string
  discardedAt?: number
  createdAt: number
  updatedAt: number
}

type CompatOauthWebhook = {
  id: string
  url: string
  state: 'enabled'
  secret: string
  event_types: string[]
}

type CompatOauthApplication = {
  id: string
  name: string
  redirect_uri: string | null
  avatar_path: string | null
  client_id: string
  client_secret: string
  last_copied_secret_at: string | null
  webhooks: CompatOauthWebhook[]
  project_ids: string[]
  thread_ids: string[]
  created_at: string
}

type OrganizationContext = Awaited<ReturnType<typeof getOrganizationContext>>
type DefinedOrganizationContext = NonNullable<OrganizationContext>

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

function assertOrganizationMember(context: OrganizationContext): asserts context is DefinedOrganizationContext {
  if (!context?.organization || !context.viewerMembership) {
    createError('Organization not found', 'not_found')
  }
}

function assertCanManageCompatResources(context: OrganizationContext): asserts context is DefinedOrganizationContext {
  assertOrganizationMember(context)

  if (context.viewerMembership.role === 'viewer' || context.viewerMembership.role === 'guest') {
    createError('You do not have permission to manage this resource', 'forbidden')
  }
}

function sortNewestFirst<T extends { created_at: string }>(items: T[]) {
  return [...items].sort((left, right) => {
    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
  })
}

function paginateById<T extends { id: string }>(items: T[], limit?: number, after?: string) {
  const safeLimit = Math.max(1, Math.min(limit || 50, 100))
  const startIndex = after ? items.findIndex((item) => item.id === after) + 1 : 0
  const page = items.slice(Math.max(0, startIndex), Math.max(0, startIndex) + safeLimit)

  return {
    data: page,
    next_cursor: startIndex + safeLimit < items.length ? page[page.length - 1]?.id ?? null : null,
    prev_cursor: null,
    total_count: items.length
  }
}

function validateCustomReactionName(value: string) {
  const normalized = value.trim()

  if (!normalized) {
    createError('Name is required')
  }

  if (!/^[a-z0-9\-_]+$/.test(normalized)) {
    createError('Name must be lowercase and can only contain limited punctuation marks')
  }

  if (normalized.length < 2) {
    createError('Name should be at least 2 characters')
  }

  if (normalized.length > 100) {
    createError('Name should be less than 100 characters')
  }

  return normalized
}

function validateRedirectUri(value?: string | null): string | null {
  if (!value) {
    return null
  }

  if (value === 'urn:ietf:wg:oauth:2.0:oob') {
    return value
  }

  try {
    const parsed = new URL(value)

    if (parsed.protocol !== 'https:') {
      createError('Redirect URI must be an HTTPS URL')
    }

    return value
  } catch {
    createError('Redirect URI must be an HTTPS URL')
  }
}

function validateWebhookUrl(value: string): string {
  try {
    const parsed = new URL(value)

    if (parsed.protocol !== 'https:') {
      createError('Webhook URL must use HTTPS')
    }

    if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
      createError('Webhook URL host is invalid')
    }

    return value
  } catch {
    createError('Invalid webhook URL')
  }
}

function normalizeWebhookEventTypes(eventTypes?: string[]): string[] {
  const normalized = (eventTypes ?? []).filter(Boolean)
  const invalid = normalized.filter((eventType) => !OAUTH_APP_WEBHOOK_EVENTS.includes(eventType as any))

  if (invalid.length > 0) {
    createError(`Unsupported webhook events: ${invalid.join(', ')}`)
  }

  return normalized
}

function buildCompatWebhook(
  input: { id?: string; url: string; event_types?: string[] },
  existing?: CompatOauthWebhook
): CompatOauthWebhook {
  return {
    id: input.id || existing?.id || generateToken(),
    url: validateWebhookUrl(input.url),
    state: 'enabled' as const,
    secret: existing?.secret || generateToken(),
    event_types: normalizeWebhookEventTypes(input.event_types)
  }
}

function buildLegacyOauthApplication(app: CompatOauthApplication, clientSecret: string | null = null) {
  const avatarPath = app.avatar_path || null
  const hasWebhooks = app.webhooks.length > 0

  return {
    id: app.id,
    name: app.name,
    redirect_uri: app.redirect_uri,
    avatar_path: avatarPath,
    avatar_url: avatarPath || '',
    avatar_urls: avatarPath ? buildLegacyAvatarUrls(avatarPath) : emptyAvatarUrls,
    client_id: app.client_id,
    last_copied_secret_at: app.last_copied_secret_at,
    client_secret: clientSecret,
    mentionable: hasWebhooks,
    direct_messageable: app.webhooks.some((webhook) => webhook.event_types.includes('message.dm')),
    webhooks: app.webhooks.map((webhook) => ({
      id: webhook.id,
      url: webhook.url,
      state: webhook.state,
      secret: webhook.secret,
      event_types: webhook.event_types
    }))
  }
}

async function getProjectRecord(ctx: any, organizationId: any, projectId: string) {
  const projects = await ctx.db
    .query('projects')
    .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId))
    .collect()

  return projects.find((project: any) => project._id === projectId) ?? null
}

async function createCreatorSnapshot(ctx: any, organizationId: any, tokenIdentifier: string) {
  const [user, membership] = await Promise.all([
    getUserByTokenIdentifier(ctx, tokenIdentifier),
    ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q: any) =>
        q.eq('organizationId', organizationId).eq('userTokenIdentifier', tokenIdentifier)
      )
      .unique()
  ])

  if (!user || !membership) {
    createError('Creator not found', 'unprocessable')
  }

  return buildLegacyMember(membership, user)
}

async function deleteStoredReactionsForCustomReaction(ctx: any, customReactionId: string) {
  const reactions = await ctx.db.query('reactions').collect()

  for (const reaction of reactions) {
    if (reaction.customContent?.id === customReactionId) {
      await ctx.db.delete(reaction._id)
    }
  }
}

function buildCustomReactionPayload(row: CustomReactionRow, creator: any): CompatCustomReaction {
  return {
    id: row.publicId,
    name: row.name,
    file_url: buildLegacyMediaUrl(row.filePath) ?? row.filePath,
    file_type: row.fileType,
    created_at: new Date(row.createdAt).toISOString(),
    pack: row.pack,
    creator
  }
}

async function listStoredCustomReactions(ctx: any, organizationId: any) {
  return (
    await ctx.db
      .query('customReactions')
      .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId))
      .collect()
  ).filter((row: any) => !row.discardedAt)
}

async function listStoredWebhookRowsForApp(ctx: any, oauthApplicationId: any) {
  const rows = await ctx.db
    .query('webhooks')
    .withIndex('by_oauth_application_id', (q: any) => q.eq('oauthApplicationId', oauthApplicationId))
    .collect()

  return rows.filter((row: any) => !row.discardedAt)
}

async function syncStoredWebhookRows(ctx: any, organizationId: any, oauthApplicationId: any, webhooks: any[]) {
  const existingRows = await ctx.db
    .query('webhooks')
    .withIndex('by_oauth_application_id', (q: any) => q.eq('oauthApplicationId', oauthApplicationId))
    .collect()
  const now = Date.now()
  const nextIds = new Set(webhooks.map((webhook: any) => webhook.id))

  for (const row of existingRows) {
    if (!nextIds.has(row.publicId)) {
      await ctx.db.patch(row._id, {
        discardedAt: now,
        updatedAt: now
      })
    }
  }

  for (const webhook of webhooks) {
    const existing = existingRows.find((row: any) => row.publicId === webhook.id)

    if (existing) {
      await ctx.db.patch(existing._id, {
        organizationId,
        provider: 'oauth_application',
        url: webhook.url,
        secret: webhook.secret,
        state: webhook.state,
        eventTypes: webhook.eventTypes ?? [],
        discardedAt: undefined,
        updatedAt: now
      })
      continue
    }

    await ctx.db.insert('webhooks', {
      organizationId,
      oauthApplicationId,
      publicId: webhook.id,
      provider: 'oauth_application',
      url: webhook.url,
      secret: webhook.secret,
      state: webhook.state,
      eventTypes: webhook.eventTypes ?? [],
      discardedAt: undefined,
      createdAt: now,
      updatedAt: now
    })
  }
}

function buildCompatOauthApplicationFromRow(row: any, webhookRows?: any[]): CompatOauthApplication {
  const sourceWebhooks =
    webhookRows && webhookRows.length > 0
      ? webhookRows.map((webhook: any) => ({
          id: webhook.publicId,
          url: webhook.url,
          state: webhook.state,
          secret: webhook.secret,
          eventTypes: webhook.eventTypes ?? []
        }))
      : row.webhooks ?? []

  return {
    id: row.publicId,
    name: row.name,
    redirect_uri: row.redirectUri ?? null,
    avatar_path: row.avatarPath ?? null,
    client_id: row.uid,
    client_secret: row.secret,
    last_copied_secret_at: row.lastCopiedSecretAt ? new Date(row.lastCopiedSecretAt).toISOString() : null,
    webhooks: sourceWebhooks.map((webhook: any) => ({
      id: webhook.id,
      url: webhook.url,
      state: 'enabled' as const,
      secret: webhook.secret,
      event_types: webhook.eventTypes ?? []
    })),
    project_ids: row.projectIds ?? [],
    thread_ids: row.threadIds ?? [],
    created_at: new Date(row.createdAt).toISOString()
  }
}

async function hydrateCompatOauthApplicationFromRow(ctx: any, row: any) {
  return buildCompatOauthApplicationFromRow(row, await listStoredWebhookRowsForApp(ctx, row._id))
}

async function getStoredOauthApplicationRow(ctx: any, organizationId: any, publicId: string) {
  const row = await ctx.db
    .query('oauthApplications')
    .withIndex('by_public_id', (q: any) => q.eq('publicId', publicId))
    .unique()

  if (!row || row.organizationId !== organizationId || row.discardedAt) {
    return null
  }

  return row
}

async function listStoredOauthApplicationRows(ctx: any, organizationId: any) {
  const rows = await ctx.db
    .query('oauthApplications')
    .withIndex('by_organization_id', (q: any) => q.eq('organizationId', organizationId))
    .collect()

  return rows.filter((row: any) => !row.discardedAt)
}

async function listLegacyOauthApplications(ctx: any, organizationId: any) {
  const storedRows = await listStoredOauthApplicationRows(ctx, organizationId)
  return sortNewestFirst(await Promise.all(storedRows.map((row: any) => hydrateCompatOauthApplicationFromRow(ctx, row))))
}

async function getLegacyOauthApplication(ctx: any, organizationId: any, publicId: string) {
  const stored = await getStoredOauthApplicationRow(ctx, organizationId, publicId)

  if (stored) {
    return await hydrateCompatOauthApplicationFromRow(ctx, stored)
  }

  return null
}

export const getLegacyCustomReactionsPage = query({
  args: {
    slug: v.string(),
    after: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)

    const storedRows = await listStoredCustomReactions(ctx, context.organization._id)
    const payloads = await Promise.all(
      storedRows.map(async (row: any) =>
        buildCustomReactionPayload(row, await createCreatorSnapshot(ctx, context.organization._id, row.creatorTokenIdentifier))
      )
    )
    const page = paginateById(sortNewestFirst(payloads), args.limit, args.after)

    return {
      ...page,
      data: page.data.map((reaction) => ({
        id: reaction.id,
        name: reaction.name,
        file_url: reaction.file_url,
        created_at: reaction.created_at,
        creator: reaction.creator
      }))
    }
  }
})

export const getLegacyCustomReactionById = query({
  args: {
    slug: v.string(),
    id: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)

    const stored = await ctx.db
      .query('customReactions')
      .withIndex('by_public_id', (q: any) => q.eq('publicId', args.id))
      .unique()

    if (stored && !stored.discardedAt && stored.organizationId === context.organization._id) {
      return buildCustomReactionPayload(
        stored,
        await createCreatorSnapshot(ctx, context.organization._id, stored.creatorTokenIdentifier)
      )
    }

    return null
  }
})

export const getLegacySyncCustomReactions = query({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)

    const storedRows = await listStoredCustomReactions(ctx, context.organization._id)
    const reactions = sortNewestFirst(
      await Promise.all(
        storedRows.map(async (row: any) =>
          buildCustomReactionPayload(row, await createCreatorSnapshot(ctx, context.organization._id, row.creatorTokenIdentifier))
        )
      )
    )

    return reactions.map((reaction) => ({
      id: reaction.id,
      name: reaction.name,
      file_url: reaction.file_url,
      created_at: reaction.created_at
    }))
  }
})

export const getLegacyCustomReactionPacks = query({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)

    const storedRows = await listStoredCustomReactions(ctx, context.organization._id)
    const installedPacks = new Set(storedRows.map((row: any) => row.pack).filter(Boolean))

    return Object.entries(packCatalog).map(([name, items]) => ({
      name,
      installed: installedPacks.has(name as keyof typeof packCatalog),
      items: items.map((item) => ({
        name: item.name,
        file_url: item.file_url
      }))
    }))
  }
})

export const createLegacyCustomReaction = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    filePath: v.string(),
    fileType: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertCanManageCompatResources(context)

    const name = validateCustomReactionName(args.name)
    const existing = await ctx.db
      .query('customReactions')
      .withIndex('by_organization_and_name', (q: any) => q.eq('organizationId', context.organization._id).eq('name', name))
      .unique()

    if (existing && !existing.discardedAt) {
      createError('Name already exists')
    }

    const creator = await createCreatorSnapshot(ctx, context.organization._id, context.viewerMembership.userTokenIdentifier)
    const now = Date.now()
    const publicId = generateToken()

    await ctx.db.insert('customReactions', {
      organizationId: context.organization._id,
      publicId,
      name,
      filePath: args.filePath,
      fileType: args.fileType,
      creatorTokenIdentifier: context.viewerMembership.userTokenIdentifier,
      createdAt: now,
      updatedAt: now
    })

    return {
      id: publicId,
      name,
      file_url: buildLegacyMediaUrl(args.filePath) ?? args.filePath,
      created_at: new Date(now).toISOString(),
      creator
    }
  }
})

export const deleteLegacyCustomReaction = mutation({
  args: {
    slug: v.string(),
    id: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertCanManageCompatResources(context)

    const stored = await ctx.db
      .query('customReactions')
      .withIndex('by_public_id', (q: any) => q.eq('publicId', args.id))
      .unique()

    if (stored && stored.organizationId === context.organization._id && !stored.discardedAt) {
      const now = Date.now()
      await ctx.db.patch(stored._id, {
        discardedAt: now,
        updatedAt: now
      })
      await deleteStoredReactionsForCustomReaction(ctx, args.id)
      return {}
    }

    createError('Custom reaction not found', 'not_found')
  }
})

export const installLegacyCustomReactionPack = mutation({
  args: {
    slug: v.string(),
    name: v.union(
      v.literal('blobs'),
      v.literal('memes'),
      v.literal('meows'),
      v.literal('parrots'),
      v.literal('llamas')
    )
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertCanManageCompatResources(context)

    const items = packCatalog[args.name]
    const existingRows = await listStoredCustomReactions(ctx, context.organization._id)
    const existingNames = new Set(existingRows.map((row: any) => row.name))
    const now = Date.now()

    for (const item of items) {
      if (existingNames.has(item.name)) {
        continue
      }

      await ctx.db.insert('customReactions', {
        organizationId: context.organization._id,
        publicId: generateToken(),
        name: item.name,
        filePath: item.file_url,
        fileType: item.file_type,
        pack: args.name,
        creatorTokenIdentifier: context.viewerMembership.userTokenIdentifier,
        createdAt: now,
        updatedAt: now
      })
    }

    return {}
  }
})

export const uninstallLegacyCustomReactionPack = mutation({
  args: {
    slug: v.string(),
    name: v.union(
      v.literal('blobs'),
      v.literal('memes'),
      v.literal('meows'),
      v.literal('parrots'),
      v.literal('llamas')
    )
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertCanManageCompatResources(context)

    const storedRows = await listStoredCustomReactions(ctx, context.organization._id)
    const packRows = storedRows.filter((row: any) => row.pack === args.name)

    if (packRows.length > 0) {
      for (const row of packRows) {
        await ctx.db.patch(row._id, {
          discardedAt: Date.now(),
          updatedAt: Date.now()
        })
        await deleteStoredReactionsForCustomReaction(ctx, row.publicId)
      }

      return {}
    }

    return {}
  }
})

export const getLegacyOauthApplications = query({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)

    return (await listLegacyOauthApplications(ctx, context.organization._id)).map((app) => buildLegacyOauthApplication(app))
  }
})

export const getLegacyOauthApplicationById = query({
  args: {
    slug: v.string(),
    id: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)

    const app = await getLegacyOauthApplication(ctx, context.organization._id, args.id)

    if (!app) {
      createError('Integration not found', 'not_found')
    }

    return buildLegacyOauthApplication(app)
  }
})

export const createLegacyOauthApplication = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    redirectUri: v.optional(v.union(v.string(), v.null())),
    avatarPath: v.optional(v.union(v.string(), v.null())),
    webhooks: v.optional(
      v.array(
        v.object({
          id: v.optional(v.string()),
          url: v.string(),
          event_types: v.optional(v.array(v.string()))
        })
      )
    )
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertCanManageCompatResources(context)

    const rows = await listStoredOauthApplicationRows(ctx, context.organization._id)
    const name = args.name.trim()

    if (!name) {
      createError('Name is required')
    }

    if (rows.some((row: any) => row.name.toLowerCase() === name.toLowerCase())) {
      createError('An integration with that name already exists')
    }

    const createdAt = Date.now()
    const appId = generateToken()
    const nextWebhooks = (args.webhooks ?? []).map((webhook) => {
      const built = buildCompatWebhook(webhook)
      return {
        id: built.id,
        url: built.url,
        state: built.state,
        secret: built.secret,
        eventTypes: built.event_types
      }
    })
    const rowId = await ctx.db.insert('oauthApplications', {
      organizationId: context.organization._id,
      publicId: appId,
      name,
      uid: `camp_${generateToken()}`,
      secret: `camp_secret_${generateToken()}`,
      redirectUri: validateRedirectUri(args.redirectUri) ?? undefined,
      scopes: '',
      confidential: true,
      avatarPath: args.avatarPath || undefined,
      discardedAt: undefined,
      creatorMembershipId: context.viewerMembership._id,
      lastCopiedSecretAt: undefined,
      provider: undefined,
      projectIds: [],
      threadIds: [],
      webhooks: nextWebhooks,
      createdAt,
      updatedAt: createdAt
    })

    const row = await ctx.db.get(rowId)

    if (!row) {
      createError('Integration could not be created')
    }

    await syncStoredWebhookRows(ctx, context.organization._id, row._id, nextWebhooks)

    return buildLegacyOauthApplication(await hydrateCompatOauthApplicationFromRow(ctx, row))
  }
})

export const updateLegacyOauthApplication = mutation({
  args: {
    slug: v.string(),
    id: v.string(),
    name: v.optional(v.string()),
    redirectUri: v.optional(v.union(v.string(), v.null())),
    avatarPath: v.optional(v.union(v.string(), v.null())),
    webhooks: v.optional(
      v.array(
        v.object({
          id: v.optional(v.string()),
          url: v.string(),
          event_types: v.optional(v.array(v.string()))
        })
      )
    )
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertCanManageCompatResources(context)

    const rows = await listStoredOauthApplicationRows(ctx, context.organization._id)
    const record = rows.find((row: any) => row.publicId === args.id)

    if (!record) {
      createError('Integration not found', 'not_found')
    }

    const nextName = args.name === undefined ? record.name : args.name.trim()

    if (!nextName) {
      createError('Name is required')
    }

    if (rows.some((row: any) => row.publicId !== args.id && row.name.toLowerCase() === nextName.toLowerCase())) {
      createError('An integration with that name already exists')
    }

    const existingWebhooks = new Map<string, CompatOauthWebhook>(
      (record.webhooks ?? []).map((webhook: any) => [
        webhook.id,
        {
          id: webhook.id,
          url: webhook.url,
          state: 'enabled' as const,
          secret: webhook.secret,
          event_types: webhook.eventTypes ?? []
        }
      ])
    )
    const nextWebhooks =
      args.webhooks === undefined
        ? record.webhooks
        : args.webhooks.map((webhook) => {
            const built = buildCompatWebhook(webhook, webhook.id ? existingWebhooks.get(webhook.id) : undefined)
            return {
              id: built.id,
              url: built.url,
              state: built.state,
              secret: built.secret,
              eventTypes: built.event_types
            }
          })

    await ctx.db.patch(record._id, {
      name: nextName,
      redirectUri: args.redirectUri === undefined ? record.redirectUri : validateRedirectUri(args.redirectUri) ?? undefined,
      avatarPath: args.avatarPath === undefined ? record.avatarPath : args.avatarPath || undefined,
      webhooks: nextWebhooks,
      updatedAt: Date.now()
    })
    await syncStoredWebhookRows(ctx, context.organization._id, record._id, nextWebhooks)

    const nextRow = await ctx.db.get(record._id)

    if (!nextRow) {
      createError('Integration not found', 'not_found')
    }

    return buildLegacyOauthApplication(await hydrateCompatOauthApplicationFromRow(ctx, nextRow))
  }
})

export const deleteLegacyOauthApplication = mutation({
  args: {
    slug: v.string(),
    id: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertCanManageCompatResources(context)

    const record = await getStoredOauthApplicationRow(ctx, context.organization._id, args.id)

    if (!record) {
      createError('Integration not found', 'not_found')
    }

    await ctx.db.patch(record._id, {
      discardedAt: Date.now(),
      updatedAt: Date.now()
    })
    await syncStoredWebhookRows(ctx, context.organization._id, record._id, [])

    return {}
  }
})

export const renewLegacyOauthApplicationSecret = mutation({
  args: {
    slug: v.string(),
    id: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertCanManageCompatResources(context)

    const record = await getStoredOauthApplicationRow(ctx, context.organization._id, args.id)

    if (!record) {
      createError('Integration not found', 'not_found')
    }

    const secret = `camp_secret_${generateToken()}`
    await ctx.db.patch(record._id, {
      secret,
      lastCopiedSecretAt: Date.now(),
      updatedAt: Date.now()
    })

    const nextRow = await ctx.db.get(record._id)

    if (!nextRow) {
      createError('Integration not found', 'not_found')
    }

    return buildLegacyOauthApplication(await hydrateCompatOauthApplicationFromRow(ctx, nextRow), secret)
  }
})

export const createLegacyOauthAccessToken = mutation({
  args: {
    slug: v.string(),
    id: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertCanManageCompatResources(context)

    const record = await getStoredOauthApplicationRow(ctx, context.organization._id, args.id)

    if (!record) {
      createError('Integration not found', 'not_found')
    }

    const token = `camp_tok_${generateToken()}`

    await ctx.db.insert('oauthAccessTokens', {
      organizationId: context.organization._id,
      applicationId: record._id,
      token,
      refreshToken: undefined,
      previousRefreshToken: undefined,
      previousToken: undefined,
      resourceOwnerTokenIdentifier: context.identity.tokenIdentifier,
      resourceOwnerType: 'User',
      scopes: '',
      expiresIn: undefined,
      revokedAt: undefined,
      createdAt: Date.now()
    })

    return {
      token
    }
  }
})

export const getLegacyProjectOauthApplications = query({
  args: {
    slug: v.string(),
    projectId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)

    const project = await getProjectRecord(ctx, context.organization._id, args.projectId)

    if (!project) {
      createError('Project not found', 'not_found')
    }

    return (await listLegacyOauthApplications(ctx, context.organization._id))
      .filter((app) => app.project_ids.includes(args.projectId))
      .map((app) => buildLegacyOauthApplication(app))
  }
})

export const attachLegacyProjectOauthApplication = mutation({
  args: {
    slug: v.string(),
    projectId: v.string(),
    oauthApplicationId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertCanManageCompatResources(context)

    const project = await getProjectRecord(ctx, context.organization._id, args.projectId)

    if (!project) {
      createError('Project not found', 'not_found')
    }

    const record = await getStoredOauthApplicationRow(ctx, context.organization._id, args.oauthApplicationId)

    if (!record) {
      createError('Integration not found', 'not_found')
    }

    if (record.projectIds.includes(args.projectId)) {
      return {}
    }

    await ctx.db.patch(record._id, {
      projectIds: [...record.projectIds, args.projectId],
      updatedAt: Date.now()
    })

    return {}
  }
})

export const detachLegacyProjectOauthApplication = mutation({
  args: {
    slug: v.string(),
    projectId: v.string(),
    id: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertCanManageCompatResources(context)

    const project = await getProjectRecord(ctx, context.organization._id, args.projectId)

    if (!project) {
      createError('Project not found', 'not_found')
    }

    const record = await getStoredOauthApplicationRow(ctx, context.organization._id, args.id)

    if (!record) {
      createError('Integration not found', 'not_found')
    }

    await ctx.db.patch(record._id, {
      projectIds: record.projectIds.filter((projectId: string) => projectId !== args.projectId),
      updatedAt: Date.now()
    })

    return {}
  }
})

export const getLegacyThreadOauthApplications = query({
  args: {
    slug: v.string(),
    threadId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)

    return (await listLegacyOauthApplications(ctx, context.organization._id))
      .filter((app) => app.thread_ids.includes(args.threadId))
      .map((app) => buildLegacyOauthApplication(app))
  }
})

export const attachLegacyThreadOauthApplication = mutation({
  args: {
    slug: v.string(),
    threadId: v.string(),
    oauthApplicationId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertCanManageCompatResources(context)

    const record = await getStoredOauthApplicationRow(ctx, context.organization._id, args.oauthApplicationId)

    if (!record) {
      createError('Integration not found', 'not_found')
    }

    if (record.threadIds.includes(args.threadId)) {
      return {}
    }

    await ctx.db.patch(record._id, {
      threadIds: [...record.threadIds, args.threadId],
      updatedAt: Date.now()
    })

    return {}
  }
})

export const detachLegacyThreadOauthApplication = mutation({
  args: {
    slug: v.string(),
    threadId: v.string(),
    id: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertCanManageCompatResources(context)

    const record = await getStoredOauthApplicationRow(ctx, context.organization._id, args.id)

    if (!record) {
      createError('Integration not found', 'not_found')
    }

    await ctx.db.patch(record._id, {
      threadIds: record.threadIds.filter((threadId: string) => threadId !== args.threadId),
      updatedAt: Date.now()
    })

    return {}
  }
})
