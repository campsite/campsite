import { v } from 'convex/values'

import { api, internal } from './_generated/api'
import { action, internalMutation, internalQuery, mutation, query } from './_generated/server'
import { buildLegacyMember } from './legacy'
import { buildWorkspaceState, generateToken } from './workspace'

const pinSubjectTypeValues = [v.literal('Post'), v.literal('Note'), v.literal('Call')] as const
const TIMELINE_EVENT_ROLLUP_WINDOW_MS = 60 * 1000

type PinSubjectType = 'Post' | 'Note' | 'Call'

type AuthorizedContext = {
  organization: any
  viewerMembership: any
  viewerTokenIdentifier: string
}

type SharedTimelineEventMetadata = {
  subjectUpdatedFromProject?: {
    id: string
    name: string
    accessory?: string | null
    private?: boolean
    archived?: boolean
    messageThreadId?: string | null
  } | null
  subjectUpdatedToProject?: {
    id: string
    name: string
    accessory?: string | null
    private?: boolean
    archived?: boolean
    messageThreadId?: string | null
  } | null
  subjectUpdatedFromTitle?: string | null
  subjectUpdatedToTitle?: string | null
}

function createError(code: string, message: string) {
  return new Error(`${code}:${message}`)
}

function sortBookmarks(bookmarks: any[]) {
  return [...bookmarks].sort((left, right) => left.position - right.position || left.createdAt - right.createdAt)
}

function sortPins(pins: any[]) {
  return [...pins]
    .filter((pin) => !pin.discardedAt)
    .sort((left, right) => left.position - right.position || left.createdAt - right.createdAt)
}

function getNextPosition(rows: { position?: number }[]) {
  return rows.reduce((max, row) => Math.max(max, row.position ?? -1), -1) + 1
}

function buildMiniProject(project?: SharedTimelineEventMetadata['subjectUpdatedFromProject']) {
  if (!project) {
    return null
  }

  return {
    id: project.id,
    name: project.name,
    accessory: project.accessory ?? null,
    private: !!project.private,
    archived: !!project.archived,
    message_thread_id: project.messageThreadId ?? null
  }
}

function parseTimelineEventMetadata(metadataJson?: string | null): SharedTimelineEventMetadata {
  if (!metadataJson) {
    return {}
  }

  try {
    const parsed = JSON.parse(metadataJson)
    return parsed && typeof parsed === 'object' ? (parsed as SharedTimelineEventMetadata) : {}
  } catch {
    return {}
  }
}

export function paginateByCursor<T extends { id: string }>(items: T[], after?: string, limit?: number) {
  const safeLimit = Math.max(1, Math.min(limit ?? 200, 200))
  const startIndex = after ? items.findIndex((item) => item.id === after) + 1 : 0
  const normalizedStartIndex = Math.max(0, startIndex)
  const page = items.slice(normalizedStartIndex, normalizedStartIndex + safeLimit)

  return {
    data: page,
    next_cursor: normalizedStartIndex + safeLimit < items.length ? page.at(-1)?.id ?? null : null,
    prev_cursor: null,
    total_count: items.length
  }
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

async function getUserByTokenIdentifier(ctx: any, tokenIdentifier?: string | null) {
  if (!tokenIdentifier) {
    return null
  }

  return await ctx.db
    .query('users')
    .withIndex('by_token_identifier', (query: any) => query.eq('tokenIdentifier', tokenIdentifier))
    .unique()
}

async function getProjectById(ctx: any, organizationId: any, projectId: string) {
  const projects = await ctx.db
    .query('projects')
    .withIndex('by_organization_id', (query: any) => query.eq('organizationId', organizationId))
    .collect()

  return projects.find((project: any) => project._id === projectId) ?? null
}

export function serializeProjectBookmark(bookmark: any) {
  return {
    id: bookmark.publicId,
    title: bookmark.title,
    url: bookmark.url
  }
}

export async function listActiveProjectPinsForProject(ctx: any, projectId: string) {
  const pins = await ctx.db.query('projectPins').withIndex('by_project_id', (query: any) => query.eq('projectId', projectId)).collect()
  return sortPins(pins)
}

export async function getActiveProjectPinForSubject(
  ctx: any,
  params: {
    projectId?: string | null
    subjectType: PinSubjectType
    subjectId: string
  }
) {
  const pins = params.projectId
    ? await ctx.db
        .query('projectPins')
        .withIndex('by_project_and_subject', (query: any) =>
          query.eq('projectId', params.projectId).eq('subjectType', params.subjectType).eq('subjectId', params.subjectId)
        )
        .collect()
    : await ctx.db
        .query('projectPins')
        .withIndex('by_subject', (query: any) => query.eq('subjectType', params.subjectType).eq('subjectId', params.subjectId))
        .collect()

  return (
    [...pins]
      .filter((pin) => !pin.discardedAt)
      .sort((left, right) => right.updatedAt - left.updatedAt || right.createdAt - left.createdAt)[0] ?? null
  )
}

export async function getActiveProjectPinsForSubjects(
  ctx: any,
  subjects: { projectId?: string | null; subjectType: PinSubjectType; subjectId: string }[]
) {
  return await Promise.all(
    subjects.map(async (subject) => {
      const pin = await getActiveProjectPinForSubject(ctx, subject)

      return {
        ...subject,
        pinId: pin?.publicId ?? null
      }
    })
  )
}

async function buildTimelineEventMemberActor(ctx: any, event: any) {
  if (!event.actorMembershipId || !event.actorTokenIdentifier) {
    return null
  }

  const [membership, user] = await Promise.all([
    ctx.db.get(event.actorMembershipId),
    getUserByTokenIdentifier(ctx, event.actorTokenIdentifier)
  ])

  if (!membership || !user) {
    return null
  }

  return buildLegacyMember(membership, user)
}

export async function getSharedTimelineEventsForSubject(
  ctx: any,
  params: {
    subjectType: string
    subjectId: string
  }
) {
  const events = await ctx.db
    .query('timelineEvents')
    .withIndex('by_subject', (query: any) => query.eq('subjectType', params.subjectType).eq('subjectId', params.subjectId))
    .collect()

  const sorted = [...events].sort((left, right) => right.createdAt - left.createdAt || right.updatedAt - left.updatedAt)

  return await Promise.all(
    sorted.map(async (event) => {
      const metadata = parseTimelineEventMetadata(event.metadataJson)

      return {
        id: event.publicId,
        created_at: new Date(event.createdAt).toISOString(),
        action: event.action,
        subject_updated_from_title: metadata.subjectUpdatedFromTitle ?? null,
        subject_updated_to_title: metadata.subjectUpdatedToTitle ?? null,
        subject_updated_from_project: buildMiniProject(metadata.subjectUpdatedFromProject),
        subject_updated_to_project: buildMiniProject(metadata.subjectUpdatedToProject),
        comment_reference_subject_type: null,
        comment_reference_subject_title: null,
        member_actor: await buildTimelineEventMemberActor(ctx, event),
        external_reference: null,
        post_reference: null,
        comment_reference: null,
        note_reference: null
      }
    })
  )
}

async function writePinTimelineEvent(
  ctx: any,
  params: {
    actorMembershipId?: any
    actorTokenIdentifier?: string
    action: 'subject_pinned' | 'subject_unpinned'
    organizationId: any
    referenceId?: string | null
    subjectId: string
    subjectType: PinSubjectType
  }
) {
  if (!params.actorMembershipId || !params.actorTokenIdentifier) {
    return null
  }

  const now = Date.now()
  const recentEvents = await ctx.db
    .query('timelineEvents')
    .withIndex('by_subject', (query: any) => query.eq('subjectType', params.subjectType).eq('subjectId', params.subjectId))
    .collect()
  const oppositeAction = params.action === 'subject_pinned' ? 'subject_unpinned' : 'subject_pinned'
  const recentOpposite = [...recentEvents]
    .filter(
      (event) =>
        event.action === oppositeAction &&
        event.actorTokenIdentifier === params.actorTokenIdentifier &&
        event.createdAt > now - TIMELINE_EVENT_ROLLUP_WINDOW_MS
    )
    .sort((left, right) => right.createdAt - left.createdAt)[0]

  if (recentOpposite) {
    await ctx.db.delete(recentOpposite._id)
    return null
  }

  const timelineEventId = await ctx.db.insert('timelineEvents', {
    organizationId: params.organizationId,
    publicId: generateToken(),
    actorType: 'OrganizationMembership',
    actorTokenIdentifier: params.actorTokenIdentifier,
    actorMembershipId: params.actorMembershipId,
    subjectType: params.subjectType,
    subjectId: params.subjectId,
    referenceType: params.referenceId ? 'ProjectPin' : undefined,
    referenceId: params.referenceId || undefined,
    action: params.action,
    createdAt: now,
    updatedAt: now
  })

  return await ctx.db.get(timelineEventId)
}

export async function upsertProjectPin(
  ctx: any,
  params: {
    actorMembershipId?: any
    actorTokenIdentifier?: string
    organizationId: any
    organizationMembershipId: any
    projectId: string
    recordTimelineEvent?: boolean
    subjectId: string
    subjectType: PinSubjectType
  }
) {
  const [existingPins, activeProjectPins] = await Promise.all([
    ctx.db
      .query('projectPins')
      .withIndex('by_project_and_subject', (query: any) =>
        query.eq('projectId', params.projectId).eq('subjectType', params.subjectType).eq('subjectId', params.subjectId)
      )
      .collect(),
    listActiveProjectPinsForProject(ctx, params.projectId)
  ])

  const activePin =
    [...existingPins].filter((pin) => !pin.discardedAt).sort((left, right) => right.updatedAt - left.updatedAt)[0] ?? null

  if (activePin) {
    return { changed: false, pin: activePin }
  }

  const now = Date.now()
  const position = getNextPosition(activeProjectPins)
  const discardedPin =
    [...existingPins].filter((pin) => !!pin.discardedAt).sort((left, right) => right.updatedAt - left.updatedAt)[0] ?? null

  if (discardedPin) {
    await ctx.db.patch(discardedPin._id, {
      organizationMembershipId: params.organizationMembershipId,
      position,
      discardedAt: undefined,
      updatedAt: now
    })

    const restoredPin = await ctx.db.get(discardedPin._id)

    if (!restoredPin) {
      throw createError('unprocessable', 'Pin could not be restored')
    }

    if (params.recordTimelineEvent) {
      await writePinTimelineEvent(ctx, {
        organizationId: params.organizationId,
        actorMembershipId: params.actorMembershipId,
        actorTokenIdentifier: params.actorTokenIdentifier,
        action: 'subject_pinned',
        referenceId: restoredPin.publicId,
        subjectType: params.subjectType,
        subjectId: params.subjectId
      })
    }

    return { changed: true, pin: restoredPin }
  }

  const pinId = await ctx.db.insert('projectPins', {
    organizationId: params.organizationId,
    projectId: params.projectId,
    organizationMembershipId: params.organizationMembershipId,
    publicId: generateToken(),
    subjectType: params.subjectType,
    subjectId: params.subjectId,
    position,
    createdAt: now,
    updatedAt: now
  })
  const createdPin = await ctx.db.get(pinId)

  if (!createdPin) {
    throw createError('unprocessable', 'Pin could not be created')
  }

  if (params.recordTimelineEvent) {
    await writePinTimelineEvent(ctx, {
      organizationId: params.organizationId,
      actorMembershipId: params.actorMembershipId,
      actorTokenIdentifier: params.actorTokenIdentifier,
      action: 'subject_pinned',
      referenceId: createdPin.publicId,
      subjectType: params.subjectType,
      subjectId: params.subjectId
    })
  }

  return { changed: true, pin: createdPin }
}

async function discardProjectPinRecord(
  ctx: any,
  params: {
    actorMembershipId?: any
    actorTokenIdentifier?: string
    pin: any
    recordTimelineEvent?: boolean
  }
) {
  if (params.pin.discardedAt) {
    return { changed: false, pin: params.pin }
  }

  const now = Date.now()

  await ctx.db.patch(params.pin._id, {
    discardedAt: now,
    updatedAt: now
  })

  const discardedPin = await ctx.db.get(params.pin._id)

  if (!discardedPin) {
    throw createError('unprocessable', 'Pin could not be removed')
  }

  if (params.recordTimelineEvent) {
    await writePinTimelineEvent(ctx, {
      organizationId: discardedPin.organizationId,
      actorMembershipId: params.actorMembershipId,
      actorTokenIdentifier: params.actorTokenIdentifier,
      action: 'subject_unpinned',
      referenceId: discardedPin.publicId,
      subjectType: discardedPin.subjectType,
      subjectId: discardedPin.subjectId
    })
  }

  return { changed: true, pin: discardedPin }
}

export async function discardActiveProjectPinsForSubject(
  ctx: any,
  params: {
    actorMembershipId?: any
    actorTokenIdentifier?: string
    organizationId?: any
    recordTimelineEvent?: boolean
    subjectId: string
    subjectType: PinSubjectType
  }
) {
  const pins = await ctx.db
    .query('projectPins')
    .withIndex('by_subject', (query: any) => query.eq('subjectType', params.subjectType).eq('subjectId', params.subjectId))
    .collect()
  const activePins = pins.filter((pin: any) => {
    if (pin.discardedAt) {
      return false
    }

    if (params.organizationId && String(pin.organizationId) !== String(params.organizationId)) {
      return false
    }

    return true
  })

  return await Promise.all(
    activePins.map((pin: any) =>
      discardProjectPinRecord(ctx, {
        pin,
        actorMembershipId: params.actorMembershipId,
        actorTokenIdentifier: params.actorTokenIdentifier,
        recordTimelineEvent: params.recordTimelineEvent
      })
    )
  )
}

export async function deleteTimelineEventsForSubject(
  ctx: any,
  params: {
    subjectId: string
    subjectType: string
  }
) {
  const events = await ctx.db
    .query('timelineEvents')
    .withIndex('by_subject', (query: any) => query.eq('subjectType', params.subjectType).eq('subjectId', params.subjectId))
    .collect()

  for (const event of events) {
    await ctx.db.delete(event._id)
  }
}

async function buildSerializedProjectPin(ctx: any, slug: string, pin: any): Promise<any | null> {
  if (pin.subjectType === 'Post') {
    const post: any = await ctx.runQuery(api.content.getLegacyPostById, {
      slug,
      postId: pin.subjectId
    })

    if (!post) {
      return null
    }

    return {
      id: pin.publicId,
      post,
      note: null,
      call: null
    }
  }

  if (pin.subjectType === 'Note') {
    const note: any = await ctx.runAction(api.notes.getLegacyNoteById, {
      slug,
      noteId: pin.subjectId
    })

    if (!note) {
      return null
    }

    return {
      id: pin.publicId,
      post: null,
      note,
      call: null
    }
  }

  const call: any = await ctx.runQuery(api.callsRealtime.getLegacyCallCompatById, {
    slug,
    callId: pin.subjectId,
    projectId: pin.projectId
  })

  if (!call) {
    return null
  }

  return {
    id: pin.publicId,
    post: null,
    note: null,
    call
  }
}

async function loadPinSubject(
  ctx: any,
  params: {
    slug: string
    subjectId: string
    subjectType: PinSubjectType
  }
): Promise<{ projectId: string }> {
  if (params.subjectType === 'Post') {
    const post: any = await ctx.runQuery(api.content.getLegacyPostById, {
      slug: params.slug,
      postId: params.subjectId
    })

    if (!post) {
      throw createError('not_found', 'Post not found')
    }

    if (!post.project?.id) {
      throw createError('unprocessable', 'Post must belong to a channel before it can be pinned')
    }

    return {
      projectId: post.project.id
    }
  }

  if (params.subjectType === 'Note') {
    const note: any = await ctx.runAction(api.notes.getLegacyNoteById, {
      slug: params.slug,
      noteId: params.subjectId
    })

    if (!note) {
      throw createError('not_found', 'Note not found')
    }

    if (!note.project?.id) {
      throw createError('unprocessable', 'Note must belong to a channel before it can be pinned')
    }

    if (!note.viewer_can_comment && !note.viewer_can_edit) {
      throw createError('forbidden', 'Not allowed to pin this note')
    }

    return {
      projectId: note.project.id
    }
  }

  const call: any = await ctx.runQuery(api.callsRealtime.getLegacyCallCompatById, {
    slug: params.slug,
    callId: params.subjectId
  })

  if (!call) {
    throw createError('not_found', 'Call not found')
  }

  if (!call.project?.id) {
    throw createError('unprocessable', 'Call must belong to a channel before it can be pinned')
  }

  return {
    projectId: call.project.id
  }
}

async function getAuthorizedContext(ctx: any, slug: string): Promise<AuthorizedContext> {
  const context: AuthorizedContext | null = await ctx.runQuery(internal.pinsBookmarks.resolveAuthorizedContextInternal, {
    slug
  })

  if (!context) {
    throw createError('not_found', 'Organization not found')
  }

  return context
}

export const resolveAuthorizedContextInternal = internalQuery({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const state = await buildWorkspaceState(ctx)
    const membershipEntry = state.memberships.find((entry: any) => entry.organization?.slug === args.slug)

    if (!membershipEntry?.organization || membershipEntry.membership?.discardedAt) {
      return null
    }

    return {
      organization: membershipEntry.organization,
      viewerMembership: membershipEntry.membership,
      viewerTokenIdentifier: state.identity.tokenIdentifier
    }
  }
})

export const getProjectByIdInternal = internalQuery({
  args: {
    organizationId: v.id('organizations'),
    projectId: v.string()
  },
  handler: async (ctx, args) => {
    return await getProjectById(ctx, args.organizationId, args.projectId)
  }
})

export const getActiveProjectPinsByProjectInternal = internalQuery({
  args: {
    projectId: v.string()
  },
  handler: async (ctx, args) => {
    return await listActiveProjectPinsForProject(ctx, args.projectId)
  }
})

export const getActivePinsForSubjectsInternal = internalQuery({
  args: {
    subjects: v.array(
      v.object({
        projectId: v.optional(v.union(v.string(), v.null())),
        subjectType: v.union(...pinSubjectTypeValues),
        subjectId: v.string()
      })
    )
  },
  handler: async (ctx, args) => {
    return await getActiveProjectPinsForSubjects(ctx, args.subjects)
  }
})

export const getSubjectTimelineEventsInternal = internalQuery({
  args: {
    subjectType: v.string(),
    subjectId: v.string()
  },
  handler: async (ctx, args) => {
    return await getSharedTimelineEventsForSubject(ctx, args)
  }
})

export const upsertProjectPinInternal = internalMutation({
  args: {
    organizationId: v.id('organizations'),
    organizationMembershipId: v.id('organizationMemberships'),
    projectId: v.string(),
    subjectType: v.union(...pinSubjectTypeValues),
    subjectId: v.string(),
    actorMembershipId: v.optional(v.id('organizationMemberships')),
    actorTokenIdentifier: v.optional(v.string()),
    recordTimelineEvent: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    return await upsertProjectPin(ctx, args)
  }
})

export const discardPinsForSubjectInternal = internalMutation({
  args: {
    organizationId: v.optional(v.id('organizations')),
    subjectType: v.union(...pinSubjectTypeValues),
    subjectId: v.string(),
    actorMembershipId: v.optional(v.id('organizationMemberships')),
    actorTokenIdentifier: v.optional(v.string()),
    recordTimelineEvent: v.optional(v.boolean()),
    deleteTimelineEvents: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    const discardedPins = await discardActiveProjectPinsForSubject(ctx, args)

    if (args.deleteTimelineEvents) {
      await deleteTimelineEventsForSubject(ctx, {
        subjectType: args.subjectType,
        subjectId: args.subjectId
      })
    }

    return discardedPins
  }
})

export const getProjectBookmarks = query({
  args: {
    slug: v.string(),
    projectId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const project = await getProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw createError('not_found', 'Project not found')
    }

    const bookmarks = await ctx.db
      .query('projectBookmarks')
      .withIndex('by_project_id', (query: any) => query.eq('projectId', project._id))
      .collect()

    return sortBookmarks(bookmarks).map(serializeProjectBookmark)
  }
})

export const createProjectBookmark = mutation({
  args: {
    slug: v.string(),
    projectId: v.string(),
    title: v.string(),
    url: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const project = await getProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw createError('not_found', 'Project not found')
    }

    const title = args.title.trim()
    const url = args.url.trim()

    if (!title || !url) {
      throw createError('unprocessable', 'title and url are required')
    }

    const bookmarks = await ctx.db
      .query('projectBookmarks')
      .withIndex('by_project_id', (query: any) => query.eq('projectId', project._id))
      .collect()
    const now = Date.now()
    const bookmarkId = await ctx.db.insert('projectBookmarks', {
      organizationId: context.organization._id,
      projectId: project._id,
      publicId: generateToken(),
      title,
      url,
      position: getNextPosition(bookmarks),
      createdAt: now,
      updatedAt: now
    })
    const bookmark = await ctx.db.get(bookmarkId)

    if (!bookmark) {
      throw createError('unprocessable', 'Bookmark could not be created')
    }

    return serializeProjectBookmark(bookmark)
  }
})

export const updateProjectBookmark = mutation({
  args: {
    slug: v.string(),
    projectId: v.string(),
    bookmarkId: v.string(),
    title: v.string(),
    url: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const project = await getProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw createError('not_found', 'Project not found')
    }

    const bookmark = await ctx.db
      .query('projectBookmarks')
      .withIndex('by_public_id', (query: any) => query.eq('publicId', args.bookmarkId))
      .unique()

    if (!bookmark || String(bookmark.projectId) !== String(project._id)) {
      throw createError('not_found', 'Bookmark not found')
    }

    await ctx.db.patch(bookmark._id, {
      title: args.title.trim(),
      url: args.url.trim(),
      updatedAt: Date.now()
    })

    const updatedBookmark = await ctx.db.get(bookmark._id)

    if (!updatedBookmark) {
      throw createError('unprocessable', 'Bookmark could not be updated')
    }

    return serializeProjectBookmark(updatedBookmark)
  }
})

export const deleteProjectBookmark = mutation({
  args: {
    slug: v.string(),
    projectId: v.string(),
    bookmarkId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const project = await getProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw createError('not_found', 'Project not found')
    }

    const bookmark = await ctx.db
      .query('projectBookmarks')
      .withIndex('by_public_id', (query: any) => query.eq('publicId', args.bookmarkId))
      .unique()

    if (!bookmark || String(bookmark.projectId) !== String(project._id)) {
      throw createError('not_found', 'Bookmark not found')
    }

    await ctx.db.delete(bookmark._id)

    return {}
  }
})

export const reorderProjectBookmarks = mutation({
  args: {
    slug: v.string(),
    projectId: v.string(),
    bookmarks: v.array(
      v.object({
        id: v.string(),
        position: v.number()
      })
    )
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const project = await getProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw createError('not_found', 'Project not found')
    }

    const positions = new Map(args.bookmarks.map((bookmark) => [bookmark.id, bookmark.position]))
    const bookmarks = await ctx.db
      .query('projectBookmarks')
      .withIndex('by_project_id', (query: any) => query.eq('projectId', project._id))
      .collect()

    for (const bookmark of bookmarks) {
      const nextPosition = positions.get(bookmark.publicId)

      if (typeof nextPosition === 'number' && bookmark.position !== nextPosition) {
        await ctx.db.patch(bookmark._id, {
          position: nextPosition,
          updatedAt: Date.now()
        })
      }
    }

    const updatedBookmarks = await ctx.db
      .query('projectBookmarks')
      .withIndex('by_project_id', (query: any) => query.eq('projectId', project._id))
      .collect()

    return sortBookmarks(updatedBookmarks).map(serializeProjectBookmark)
  }
})

export const getProjectPins = action({
  args: {
    slug: v.string(),
    projectId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getAuthorizedContext(ctx, args.slug)
    const project = await ctx.runQuery(internal.pinsBookmarks.getProjectByIdInternal, {
      organizationId: context.organization._id,
      projectId: args.projectId
    })

    if (!project) {
      throw createError('not_found', 'Project not found')
    }

    const pins: any[] = await ctx.runQuery(internal.pinsBookmarks.getActiveProjectPinsByProjectInternal, {
      projectId: args.projectId
    })
    const serializedPins: any[] = await Promise.all(
      pins.map((pin: any) => buildSerializedProjectPin(ctx, args.slug, pin))
    )

    return {
      data: serializedPins.filter(Boolean)
    }
  }
})

export const createProjectPin = action({
  args: {
    slug: v.string(),
    subjectType: v.union(...pinSubjectTypeValues),
    subjectId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getAuthorizedContext(ctx, args.slug)
    const subject = await loadPinSubject(ctx, args)
    const upsertedPin = await ctx.runMutation(internal.pinsBookmarks.upsertProjectPinInternal, {
      organizationId: context.organization._id,
      organizationMembershipId: context.viewerMembership._id,
      projectId: subject.projectId,
      subjectType: args.subjectType,
      subjectId: args.subjectId,
      actorMembershipId: context.viewerMembership._id,
      actorTokenIdentifier: context.viewerTokenIdentifier,
      recordTimelineEvent: true
    })
    const pin: any = await buildSerializedProjectPin(ctx, args.slug, upsertedPin.pin)

    if (!pin) {
      throw createError('unprocessable', 'Pin could not be loaded')
    }

    return { pin }
  }
})

export const deleteProjectPin = mutation({
  args: {
    slug: v.string(),
    pinId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('not_found', 'Organization not found')
    }

    const pin = await ctx.db
      .query('projectPins')
      .withIndex('by_public_id', (query: any) => query.eq('publicId', args.pinId))
      .unique()

    if (!pin || String(pin.organizationId) !== String(context.organization._id)) {
      throw createError('not_found', 'Pin not found')
    }

    await discardProjectPinRecord(ctx, {
      pin,
      actorMembershipId: context.viewerMembership._id,
      actorTokenIdentifier: context.identity.tokenIdentifier,
      recordTimelineEvent: true
    })

    return {}
  }
})
