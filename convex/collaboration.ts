import { v } from 'convex/values'

import { mutation, query } from './_generated/server'
import { buildLegacyAvatarUrls, buildLegacyMember, emptyAvatarUrls } from './legacy'
import { buildWorkspaceState, generateToken } from './workspace'

const COMPAT_MARKER = 'compat:collaboration:v1'
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
  pack?: keyof typeof packCatalog
  creator: any
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

function buildOrgScopedKey(kind: string, organizationId: string) {
  return `compat:${kind}:${organizationId}`
}

function buildNoteSyncKey(organizationId: string, noteId: string) {
  return `compat:note-sync:${organizationId}:${noteId}`
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

function parseCompatPayload<T>(row: any, kind: string): T | null {
  if (row.timeZone !== `${COMPAT_MARKER}:${kind}`) {
    return null
  }

  try {
    return JSON.parse(row.deliveryTime) as T
  } catch {
    return null
  }
}

async function listCompatRows<T>(ctx: any, key: string, kind: string) {
  const rows = await ctx.db
    .query('scheduledNotifications')
    .withIndex('by_user_token_identifier', (q: any) => q.eq('userTokenIdentifier', key))
    .collect()

  return rows
    .map((row: any) => {
      const payload = parseCompatPayload<T>(row, kind)

      if (!payload) {
        return null
      }

      return { row, payload }
    })
    .filter(Boolean) as Array<{ row: any; payload: T }>
}

function buildCompatRowFields(kind: string, id: string, label: string, payload: unknown) {
  return {
    name: label,
    timeZone: `${COMPAT_MARKER}:${kind}`,
    deliveryDay: id,
    deliveryTime: JSON.stringify(payload)
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

export const getLegacyCustomReactionsPage = query({
  args: {
    slug: v.string(),
    after: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)

    const key = buildOrgScopedKey('custom-reactions', context.organization._id)
    const rows = await listCompatRows<CompatCustomReaction>(ctx, key, 'custom-reaction')
    const page = paginateById(sortNewestFirst(rows.map(({ payload }) => payload)), args.limit, args.after)

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

    const key = buildOrgScopedKey('custom-reactions', context.organization._id)
    const rows = await listCompatRows<CompatCustomReaction>(ctx, key, 'custom-reaction')

    return rows.find(({ payload }) => payload.id === args.id)?.payload ?? null
  }
})

export const getLegacySyncCustomReactions = query({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)

    const key = buildOrgScopedKey('custom-reactions', context.organization._id)
    const rows = await listCompatRows<CompatCustomReaction>(ctx, key, 'custom-reaction')

    return sortNewestFirst(rows.map(({ payload }) => payload)).map((reaction) => ({
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

    const key = buildOrgScopedKey('custom-reactions', context.organization._id)
    const rows = await listCompatRows<CompatCustomReaction>(ctx, key, 'custom-reaction')
    const installedPacks = new Set(rows.map(({ payload }) => payload.pack).filter(Boolean))

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

    const key = buildOrgScopedKey('custom-reactions', context.organization._id)
    const rows = await listCompatRows<CompatCustomReaction>(ctx, key, 'custom-reaction')
    const name = validateCustomReactionName(args.name)

    if (rows.some(({ payload }) => payload.name === name)) {
      createError('Name already exists')
    }

    const creator = await createCreatorSnapshot(ctx, context.organization._id, context.viewerMembership.userTokenIdentifier)
    const reaction: CompatCustomReaction = {
      id: generateToken(),
      name,
      file_url: args.filePath,
      file_type: args.fileType,
      created_at: new Date().toISOString(),
      creator
    }

    await ctx.db.insert('scheduledNotifications', {
      userTokenIdentifier: key,
      ...buildCompatRowFields('custom-reaction', reaction.id, reaction.name, reaction),
      createdAt: Date.now(),
      updatedAt: Date.now()
    })

    return {
      id: reaction.id,
      name: reaction.name,
      file_url: reaction.file_url,
      created_at: reaction.created_at,
      creator: reaction.creator
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

    const key = buildOrgScopedKey('custom-reactions', context.organization._id)
    const rows = await listCompatRows<CompatCustomReaction>(ctx, key, 'custom-reaction')
    const record = rows.find(({ payload }) => payload.id === args.id)

    if (!record) {
      createError('Custom reaction not found', 'not_found')
    }

    await ctx.db.delete(record.row._id)
    await deleteStoredReactionsForCustomReaction(ctx, args.id)

    return {}
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
    const key = buildOrgScopedKey('custom-reactions', context.organization._id)
    const rows = await listCompatRows<CompatCustomReaction>(ctx, key, 'custom-reaction')
    const existingNames = new Set(rows.map(({ payload }) => payload.name))
    const creator = await createCreatorSnapshot(ctx, context.organization._id, context.viewerMembership.userTokenIdentifier)

    for (const item of items) {
      if (existingNames.has(item.name)) {
        continue
      }

      const reaction: CompatCustomReaction = {
        id: generateToken(),
        name: item.name,
        file_url: item.file_url,
        file_type: item.file_type,
        created_at: new Date().toISOString(),
        pack: args.name,
        creator
      }

      await ctx.db.insert('scheduledNotifications', {
        userTokenIdentifier: key,
        ...buildCompatRowFields('custom-reaction', reaction.id, reaction.name, reaction),
        createdAt: Date.now(),
        updatedAt: Date.now()
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

    const key = buildOrgScopedKey('custom-reactions', context.organization._id)
    const rows = await listCompatRows<CompatCustomReaction>(ctx, key, 'custom-reaction')
    const packRows = rows.filter(({ payload }) => payload.pack === args.name)

    for (const record of packRows) {
      await ctx.db.delete(record.row._id)
      await deleteStoredReactionsForCustomReaction(ctx, record.payload.id)
    }

    return {}
  }
})

export const getLegacyNoteSyncState = query({
  args: {
    slug: v.string(),
    noteId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)

    const key = buildNoteSyncKey(context.organization._id, args.noteId)
    const rows = await ctx.db
      .query('scheduledNotifications')
      .withIndex('by_user_token_identifier', (q: any) => q.eq('userTokenIdentifier', key))
      .collect()

    const record = rows[0]

    return {
      id: args.noteId,
      description_schema_version: record ? Number(record.deliveryTime) || 0 : 0,
      description_state: record?.timeZone || null,
      description_html: record?.name || '<p></p>'
    }
  }
})

export const updateLegacyNoteSyncState = mutation({
  args: {
    slug: v.string(),
    noteId: v.string(),
    descriptionHtml: v.string(),
    descriptionState: v.string(),
    descriptionSchemaVersion: v.number()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)
    assertOrganizationMember(context)

    const key = buildNoteSyncKey(context.organization._id, args.noteId)
    const rows = await ctx.db
      .query('scheduledNotifications')
      .withIndex('by_user_token_identifier', (q: any) => q.eq('userTokenIdentifier', key))
      .collect()

    const record = rows[0]
    const currentVersion = record ? Number(record.deliveryTime) || 0 : 0

    if (args.descriptionSchemaVersion < currentVersion) {
      createError('description_schema_version cannot be older than the stored document')
    }

    if (record) {
      await ctx.db.patch(record._id, {
        name: args.descriptionHtml,
        timeZone: args.descriptionState,
        deliveryTime: `${args.descriptionSchemaVersion}`,
        updatedAt: Date.now()
      })
    } else {
      await ctx.db.insert('scheduledNotifications', {
        userTokenIdentifier: key,
        name: args.descriptionHtml,
        timeZone: args.descriptionState,
        deliveryDay: args.noteId,
        deliveryTime: `${args.descriptionSchemaVersion}`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
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

    const key = buildOrgScopedKey('oauth-applications', context.organization._id)
    const rows = await listCompatRows<CompatOauthApplication>(ctx, key, 'oauth-application')

    return sortNewestFirst(rows.map(({ payload }) => payload)).map((app) => buildLegacyOauthApplication(app))
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

    const key = buildOrgScopedKey('oauth-applications', context.organization._id)
    const rows = await listCompatRows<CompatOauthApplication>(ctx, key, 'oauth-application')
    const app = rows.find(({ payload }) => payload.id === args.id)?.payload

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

    const key = buildOrgScopedKey('oauth-applications', context.organization._id)
    const rows = await listCompatRows<CompatOauthApplication>(ctx, key, 'oauth-application')
    const name = args.name.trim()

    if (!name) {
      createError('Name is required')
    }

    if (rows.some(({ payload }) => payload.name.toLowerCase() === name.toLowerCase())) {
      createError('An integration with that name already exists')
    }

    const app: CompatOauthApplication = {
      id: generateToken(),
      name,
      redirect_uri: validateRedirectUri(args.redirectUri),
      avatar_path: args.avatarPath || null,
      client_id: `camp_${generateToken()}`,
      client_secret: `camp_secret_${generateToken()}`,
      last_copied_secret_at: null,
      webhooks: (args.webhooks ?? []).map((webhook) => buildCompatWebhook(webhook)),
      project_ids: [],
      thread_ids: [],
      created_at: new Date().toISOString()
    }

    await ctx.db.insert('scheduledNotifications', {
      userTokenIdentifier: key,
      ...buildCompatRowFields('oauth-application', app.id, app.name, app),
      createdAt: Date.now(),
      updatedAt: Date.now()
    })

    return buildLegacyOauthApplication(app)
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

    const key = buildOrgScopedKey('oauth-applications', context.organization._id)
    const rows = await listCompatRows<CompatOauthApplication>(ctx, key, 'oauth-application')
    const record = rows.find(({ payload }) => payload.id === args.id)

    if (!record) {
      createError('Integration not found', 'not_found')
    }

    const nextName = args.name === undefined ? record.payload.name : args.name.trim()

    if (!nextName) {
      createError('Name is required')
    }

    if (
      rows.some(({ payload }) => payload.id !== args.id && payload.name.toLowerCase() === nextName.toLowerCase())
    ) {
      createError('An integration with that name already exists')
    }

    const existingWebhooks = new Map(record.payload.webhooks.map((webhook) => [webhook.id, webhook]))
    const nextPayload: CompatOauthApplication = {
      ...record.payload,
      name: nextName,
      redirect_uri: args.redirectUri === undefined ? record.payload.redirect_uri : validateRedirectUri(args.redirectUri),
      avatar_path: args.avatarPath === undefined ? record.payload.avatar_path : args.avatarPath || null,
      webhooks:
        args.webhooks === undefined
          ? record.payload.webhooks
          : args.webhooks.map((webhook) =>
              buildCompatWebhook(webhook, webhook.id ? existingWebhooks.get(webhook.id) : undefined)
            )
    }

    await ctx.db.patch(record.row._id, {
      ...buildCompatRowFields('oauth-application', nextPayload.id, nextPayload.name, nextPayload),
      updatedAt: Date.now()
    })

    return buildLegacyOauthApplication(nextPayload)
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

    const key = buildOrgScopedKey('oauth-applications', context.organization._id)
    const rows = await listCompatRows<CompatOauthApplication>(ctx, key, 'oauth-application')
    const record = rows.find(({ payload }) => payload.id === args.id)

    if (!record) {
      createError('Integration not found', 'not_found')
    }

    await ctx.db.delete(record.row._id)

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

    const key = buildOrgScopedKey('oauth-applications', context.organization._id)
    const rows = await listCompatRows<CompatOauthApplication>(ctx, key, 'oauth-application')
    const record = rows.find(({ payload }) => payload.id === args.id)

    if (!record) {
      createError('Integration not found', 'not_found')
    }

    const secret = `camp_secret_${generateToken()}`
    const nextPayload: CompatOauthApplication = {
      ...record.payload,
      client_secret: secret,
      last_copied_secret_at: new Date().toISOString()
    }

    await ctx.db.patch(record.row._id, {
      ...buildCompatRowFields('oauth-application', nextPayload.id, nextPayload.name, nextPayload),
      updatedAt: Date.now()
    })

    return buildLegacyOauthApplication(nextPayload, secret)
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

    const key = buildOrgScopedKey('oauth-applications', context.organization._id)
    const rows = await listCompatRows<CompatOauthApplication>(ctx, key, 'oauth-application')
    const record = rows.find(({ payload }) => payload.id === args.id)

    if (!record) {
      createError('Integration not found', 'not_found')
    }

    return {
      token: `camp_tok_${generateToken()}`
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

    const key = buildOrgScopedKey('oauth-applications', context.organization._id)
    const rows = await listCompatRows<CompatOauthApplication>(ctx, key, 'oauth-application')

    return sortNewestFirst(rows.map(({ payload }) => payload))
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

    const key = buildOrgScopedKey('oauth-applications', context.organization._id)
    const rows = await listCompatRows<CompatOauthApplication>(ctx, key, 'oauth-application')
    const record = rows.find(({ payload }) => payload.id === args.oauthApplicationId)

    if (!record) {
      createError('Integration not found', 'not_found')
    }

    if (record.payload.project_ids.includes(args.projectId)) {
      return {}
    }

    const nextPayload: CompatOauthApplication = {
      ...record.payload,
      project_ids: [...record.payload.project_ids, args.projectId]
    }

    await ctx.db.patch(record.row._id, {
      ...buildCompatRowFields('oauth-application', nextPayload.id, nextPayload.name, nextPayload),
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

    const key = buildOrgScopedKey('oauth-applications', context.organization._id)
    const rows = await listCompatRows<CompatOauthApplication>(ctx, key, 'oauth-application')
    const record = rows.find(({ payload }) => payload.id === args.id)

    if (!record) {
      createError('Integration not found', 'not_found')
    }

    const nextPayload: CompatOauthApplication = {
      ...record.payload,
      project_ids: record.payload.project_ids.filter((projectId) => projectId !== args.projectId)
    }

    await ctx.db.patch(record.row._id, {
      ...buildCompatRowFields('oauth-application', nextPayload.id, nextPayload.name, nextPayload),
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

    const key = buildOrgScopedKey('oauth-applications', context.organization._id)
    const rows = await listCompatRows<CompatOauthApplication>(ctx, key, 'oauth-application')

    return sortNewestFirst(rows.map(({ payload }) => payload))
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

    const key = buildOrgScopedKey('oauth-applications', context.organization._id)
    const rows = await listCompatRows<CompatOauthApplication>(ctx, key, 'oauth-application')
    const record = rows.find(({ payload }) => payload.id === args.oauthApplicationId)

    if (!record) {
      createError('Integration not found', 'not_found')
    }

    if (record.payload.thread_ids.includes(args.threadId)) {
      return {}
    }

    const nextPayload: CompatOauthApplication = {
      ...record.payload,
      thread_ids: [...record.payload.thread_ids, args.threadId]
    }

    await ctx.db.patch(record.row._id, {
      ...buildCompatRowFields('oauth-application', nextPayload.id, nextPayload.name, nextPayload),
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

    const key = buildOrgScopedKey('oauth-applications', context.organization._id)
    const rows = await listCompatRows<CompatOauthApplication>(ctx, key, 'oauth-application')
    const record = rows.find(({ payload }) => payload.id === args.id)

    if (!record) {
      createError('Integration not found', 'not_found')
    }

    const nextPayload: CompatOauthApplication = {
      ...record.payload,
      thread_ids: record.payload.thread_ids.filter((threadId) => threadId !== args.threadId)
    }

    await ctx.db.patch(record.row._id, {
      ...buildCompatRowFields('oauth-application', nextPayload.id, nextPayload.name, nextPayload),
      updatedAt: Date.now()
    })

    return {}
  }
})
