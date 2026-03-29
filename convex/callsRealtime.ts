import { v } from 'convex/values'

import { api } from './_generated/api'
import { mutation, query } from './_generated/server'
import { buildLegacyMember, formatDate } from './legacy'
import { discardActiveProjectPinsForSubject, getActiveProjectPinForSubject, upsertProjectPin } from './pinsBookmarks'
import { buildWorkspaceState, generateToken } from './workspace'

const CALL_PREF_PREFIX = 'compat_call:'

const projectPermissionValues = [v.literal('none'), v.literal('view'), v.literal('edit')] as const

type CallSnapshot = {
  createdAt: number
  startedAt?: number
  stoppedAt?: number | null
  title?: string | null
  summaryHtml?: string | null
  projectId?: string | null
  projectPermission?: 'none' | 'view' | 'edit'
  projectPinId?: string | null
  isEdited?: boolean
}

function createError(message: string, code: string) {
  return new Error(`${code}:${message}`)
}

function callPreferenceKey(slug: string, callId: string) {
  return `${CALL_PREF_PREFIX}${slug}:${callId}`
}

function getPreferenceMap(user: any) {
  return { ...(user.preferences ?? {}) } as Record<string, string>
}

function parseSnapshot(raw?: string | null): CallSnapshot | null {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw)

    if (!parsed || typeof parsed !== 'object' || typeof parsed.createdAt !== 'number') {
      return null
    }

    return parsed as CallSnapshot
  } catch {
    return null
  }
}

function serializeSnapshot(snapshot: CallSnapshot) {
  return JSON.stringify(snapshot)
}

function stripHtml(value?: string | null) {
  if (!value) {
    return ''
  }

  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
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

async function getCallByPublicId(ctx: any, organizationId: any, callId: string) {
  const call = await ctx.db
    .query('calls')
    .withIndex('by_public_id', (q: any) => q.eq('publicId', callId))
    .unique()

  if (!call || call.organizationId !== organizationId) {
    return null
  }

  return call
}

async function getCallByRemoteSessionId(ctx: any, remoteSessionId: string) {
  return await ctx.db
    .query('calls')
    .withIndex('by_remote_session_id', (q: any) => q.eq('remoteSessionId', remoteSessionId))
    .unique()
}

async function getCallRoomByRemoteRoomId(ctx: any, remoteRoomId: string) {
  return await ctx.db
    .query('callRooms')
    .withIndex('by_remote_room_id', (q: any) => q.eq('remoteRoomId', remoteRoomId))
    .unique()
}

async function getCallFavorite(ctx: any, organizationId: any, tokenIdentifier: string, callId: string) {
  return await ctx.db
    .query('favorites')
    .withIndex('by_organization_user_and_favoritable', (q: any) =>
      q
        .eq('organizationId', organizationId)
        .eq('userTokenIdentifier', tokenIdentifier)
        .eq('favoritableType', 'Call')
        .eq('favoritableId', callId)
    )
    .unique()
}

async function getCallFollowUps(ctx: any, organizationId: any, callId: string) {
  const followUps = await ctx.db
    .query('followUps')
    .withIndex('by_subject', (q: any) => q.eq('subjectType', 'Call').eq('subjectId', callId))
    .collect()

  return followUps.filter((followUp: any) => followUp.organizationId === organizationId)
}

async function patchCallFollowUps(
  ctx: any,
  organizationId: any,
  callId: string,
  updater: (followUp: any) => Partial<any>
) {
  const followUps = await getCallFollowUps(ctx, organizationId, callId)

  await Promise.all(
    followUps.map((followUp: any) =>
      ctx.db.patch(followUp._id, {
        ...updater(followUp)
      })
    )
  )
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
    message_thread_id: null
  }
}

async function buildCallFollowUps(ctx: any, organizationId: any, callId: string, viewerTokenIdentifier: string) {
  const followUps = await getCallFollowUps(ctx, organizationId, callId)
  const result = []

  for (const followUp of followUps.sort((a: any, b: any) => a.showAt - b.showAt)) {
    const [user, membership] = await Promise.all([
      getUserByTokenIdentifier(ctx, followUp.userTokenIdentifier),
      getMembership(ctx, organizationId, followUp.userTokenIdentifier)
    ])

    if (!user || !membership) {
      continue
    }

    result.push({
      id: followUp._id,
      member: buildLegacyMember(membership, user),
      show_at: new Date(followUp.showAt).toISOString(),
      belongs_to_viewer: followUp.userTokenIdentifier === viewerTokenIdentifier
    })
  }

  return result
}

async function getSnapshotSources(ctx: any, context: any, callId: string) {
  const preferenceMap = getPreferenceMap(context.user)
  const snapshot = parseSnapshot(preferenceMap[callPreferenceKey(context.organization.slug, callId)])
  const favorite = await getCallFavorite(ctx, context.organization._id, context.identity.tokenIdentifier, callId)
  const followUps = await getCallFollowUps(ctx, context.organization._id, callId)

  return { favorite, followUps, snapshot }
}

async function buildCompatCall(
  ctx: any,
  context: any,
  callId: string,
  overrides?: Partial<CallSnapshot>
) {
  const persistedCall = await getCallByPublicId(ctx, context.organization._id, callId)
  const { favorite, followUps, snapshot } = await getSnapshotSources(ctx, context, callId)
  const resolvedSnapshot = {
    createdAt: snapshot?.createdAt ?? persistedCall?.createdAt ?? favorite?.createdAt ?? followUps[0]?.createdAt ?? Date.now(),
    projectId: snapshot?.projectId ?? persistedCall?.projectId ?? followUps[0]?.targetProjectId ?? undefined,
    projectPermission:
      snapshot?.projectPermission ??
      persistedCall?.projectPermission ??
      (snapshot?.projectId || persistedCall?.projectId || followUps[0]?.targetProjectId ? 'view' : 'none'),
    startedAt: snapshot?.startedAt ?? persistedCall?.startedAt ?? snapshot?.createdAt ?? favorite?.createdAt ?? Date.now(),
    stoppedAt: snapshot?.stoppedAt ?? persistedCall?.stoppedAt ?? null,
    title: snapshot?.title ?? persistedCall?.title ?? followUps[0]?.targetTitle ?? null,
    summaryHtml: snapshot?.summaryHtml ?? persistedCall?.summaryHtml ?? null,
    isEdited: snapshot?.isEdited ?? !!(persistedCall?.title || persistedCall?.summaryHtml),
    ...overrides
  } satisfies CallSnapshot
  const [project, activePin] = await Promise.all([
    getProjectById(ctx, context.organization._id, resolvedSnapshot.projectId),
    resolvedSnapshot.projectId
      ? getActiveProjectPinForSubject(ctx, {
          projectId: resolvedSnapshot.projectId,
          subjectType: 'Call',
          subjectId: callId
        })
      : Promise.resolve(null)
  ])

  return {
    id: callId,
    title: resolvedSnapshot.title ?? null,
    summary_html: resolvedSnapshot.summaryHtml ?? null,
    is_edited: !!resolvedSnapshot.isEdited,
    created_at: new Date(resolvedSnapshot.createdAt).toISOString(),
    started_at: new Date(resolvedSnapshot.startedAt ?? resolvedSnapshot.createdAt).toISOString(),
    stopped_at: formatDate(resolvedSnapshot.stoppedAt),
    duration:
      resolvedSnapshot.stoppedAt && resolvedSnapshot.startedAt
        ? Math.max(0, resolvedSnapshot.stoppedAt - resolvedSnapshot.startedAt)
        : null,
    recordings_duration: persistedCall?.recordingsDuration ?? null,
    active: !resolvedSnapshot.stoppedAt,
    project_permission: resolvedSnapshot.projectPermission ?? 'none',
    channel_name: `call-${callId}`,
    peers: [],
    project: buildMiniProject(project),
    follow_ups: await buildCallFollowUps(ctx, context.organization._id, callId, context.identity.tokenIdentifier),
    type_name: 'call',
    viewer_can_edit: true,
    viewer_can_destroy_all_recordings: false,
    viewer_has_favorited: !!favorite,
    processing_generated_title: false,
    processing_generated_summary: false,
    project_pin_id: activePin?.publicId ?? null,
    url: `/${context.organization.slug}/calls/${callId}`
  }
}

async function saveSnapshot(ctx: any, user: any, slug: string, callId: string, snapshot: CallSnapshot) {
  const preferences = getPreferenceMap(user)

  preferences[callPreferenceKey(slug, callId)] = serializeSnapshot(snapshot)

  await ctx.db.patch(user._id, {
    preferences
  })

  const updated = await ctx.db.get(user._id)

  if (!updated) {
    throw createError('Call could not be updated', 'unprocessable')
  }

  return updated
}

async function deleteSnapshotFields(
  ctx: any,
  user: any,
  slug: string,
  callId: string,
  updater: (snapshot: CallSnapshot) => CallSnapshot
) {
  const preferences = getPreferenceMap(user)
  const existing = parseSnapshot(preferences[callPreferenceKey(slug, callId)]) ?? {
    createdAt: Date.now()
  }

  preferences[callPreferenceKey(slug, callId)] = serializeSnapshot(updater(existing))

  await ctx.db.patch(user._id, { preferences })
}

export const getLegacyCallsCompatPage = query({
  args: {
    slug: v.string(),
    filter: v.optional(v.string()),
    after: v.optional(v.string()),
    limit: v.optional(v.number()),
    q: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const preferenceKeys = Object.keys(getPreferenceMap(context.user)).filter((key) =>
      key.startsWith(`${CALL_PREF_PREFIX}${args.slug}:`)
    )
    const favoriteCalls = await ctx.db
      .query('favorites')
      .withIndex('by_organization_and_user', (q: any) =>
        q.eq('organizationId', context.organization._id).eq('userTokenIdentifier', context.identity.tokenIdentifier)
      )
      .collect()
    const followUps = await ctx.db
      .query('followUps')
      .withIndex('by_organization_and_user', (q: any) =>
        q.eq('organizationId', context.organization._id).eq('userTokenIdentifier', context.identity.tokenIdentifier)
      )
      .collect()
    const callIds = new Set<string>()
    const persistedCalls = await ctx.db
      .query('calls')
      .withIndex('by_organization_id', (q: any) => q.eq('organizationId', context.organization._id))
      .collect()

    for (const key of preferenceKeys) {
      callIds.add(key.split(':').at(-1) as string)
    }

    for (const favorite of favoriteCalls) {
      if (favorite.favoritableType === 'Call') {
        callIds.add(favorite.favoritableId)
      }
    }

    for (const followUp of followUps) {
      if (followUp.subjectType === 'Call') {
        callIds.add(followUp.subjectId)
      }
    }

    for (const call of persistedCalls) {
      callIds.add(call.publicId)
    }

    const queryText = args.q?.trim().toLowerCase()
    const calls = await Promise.all(Array.from(callIds).map((callId) => buildCompatCall(ctx, context, callId)))
    const filtered = calls
      .filter((call) => {
        if (!queryText) {
          return true
        }

        return (
          call.id.toLowerCase().includes(queryText) ||
          call.title?.toLowerCase().includes(queryText) ||
          stripHtml(call.summary_html).toLowerCase().includes(queryText)
        )
      })
      .sort((a, b) => Date.parse(b.started_at) - Date.parse(a.started_at))

    const limit = Math.max(1, Math.min(args.limit ?? 20, 100))
    const startIndex = args.after ? filtered.findIndex((call) => call.id === args.after) + 1 : 0
    const page = filtered.slice(Math.max(0, startIndex), Math.max(0, startIndex) + limit)

    return {
      data: page,
      next_cursor: startIndex + limit < filtered.length ? page.at(-1)?.id ?? null : null,
      prev_cursor: null
    }
  }
})

export const getLegacyCallCompatById = query({
  args: {
    slug: v.string(),
    callId: v.string(),
    projectId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    return await buildCompatCall(
      ctx,
      context,
      args.callId,
      args.projectId !== undefined ? { projectId: args.projectId } : undefined
    )
  }
})

export const updateLegacyCallCompat = mutation({
  args: {
    slug: v.string(),
    callId: v.string(),
    title: v.optional(v.union(v.string(), v.null())),
    summaryHtml: v.optional(v.union(v.string(), v.null()))
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const existingSnapshot = parseSnapshot(getPreferenceMap(context.user)[callPreferenceKey(args.slug, args.callId)]) ?? {
      createdAt: Date.now()
    }

    await saveSnapshot(ctx, context.user, args.slug, args.callId, {
      ...existingSnapshot,
      title: args.title ?? existingSnapshot.title ?? null,
      summaryHtml: args.summaryHtml ?? existingSnapshot.summaryHtml ?? null,
      isEdited: true,
      projectId: existingSnapshot.projectId,
      projectPermission: existingSnapshot.projectPermission ?? 'none'
    })

    await patchCallFollowUps(ctx, context.organization._id, args.callId, (followUp) => ({
      targetTitle: args.title ?? followUp.targetTitle
    }))

    return await buildCompatCall(ctx, context, args.callId, {
      ...existingSnapshot,
      title: args.title ?? existingSnapshot.title ?? null,
      summaryHtml: args.summaryHtml ?? existingSnapshot.summaryHtml ?? null,
      isEdited: true
    })
  }
})

export const getLegacyCallCompatRecordingsPage = query({
  args: {
    slug: v.string(),
    callId: v.string(),
    after: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    return {
      data: [],
      next_cursor: null,
      prev_cursor: null
    }
  }
})

export const deleteLegacyCallCompatRecordings = mutation({
  args: {
    slug: v.string(),
    callId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    await deleteSnapshotFields(ctx, context.user, args.slug, args.callId, (snapshot) => ({
      ...snapshot,
      stoppedAt: snapshot.stoppedAt ?? Date.now()
    }))

    return {}
  }
})

export const updateLegacyCallCompatProjectPermission = mutation({
  args: {
    slug: v.string(),
    callId: v.string(),
    projectId: v.string(),
    permission: v.union(...projectPermissionValues.filter((value) => value.value !== 'none'))
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const project = await getProjectById(ctx, context.organization._id, args.projectId)

    if (!project) {
      throw createError('Project not found', 'not_found')
    }

    const existingSnapshot = parseSnapshot(getPreferenceMap(context.user)[callPreferenceKey(args.slug, args.callId)]) ?? {
      createdAt: Date.now()
    }
    const previousProjectId = existingSnapshot.projectId

    await saveSnapshot(ctx, context.user, args.slug, args.callId, {
      ...existingSnapshot,
      projectId: project._id,
      projectPermission: args.permission
    })

    await patchCallFollowUps(ctx, context.organization._id, args.callId, () => ({
      targetProjectId: project._id
    }))

    if (previousProjectId && previousProjectId !== project._id) {
      await discardActiveProjectPinsForSubject(ctx, {
        organizationId: context.organization._id,
        actorMembershipId: context.viewerMembership._id,
        actorTokenIdentifier: context.identity.tokenIdentifier,
        recordTimelineEvent: true,
        subjectType: 'Call',
        subjectId: args.callId
      })
    }

    return await buildCompatCall(ctx, context, args.callId, {
      ...existingSnapshot,
      projectId: project._id,
      projectPermission: args.permission
    })
  }
})

export const deleteLegacyCallCompatProjectPermission = mutation({
  args: {
    slug: v.string(),
    callId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    await deleteSnapshotFields(ctx, context.user, args.slug, args.callId, (snapshot) => ({
      ...snapshot,
      projectId: undefined,
      projectPermission: 'none',
      projectPinId: undefined
    }))

    await patchCallFollowUps(ctx, context.organization._id, args.callId, () => ({
      targetProjectId: undefined
    }))

    await discardActiveProjectPinsForSubject(ctx, {
      organizationId: context.organization._id,
      actorMembershipId: context.viewerMembership._id,
      actorTokenIdentifier: context.identity.tokenIdentifier,
      recordTimelineEvent: true,
      subjectType: 'Call',
      subjectId: args.callId
    })

    return {}
  }
})

export const createLegacyCallCompatPin = mutation({
  args: {
    slug: v.string(),
    callId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const existingSnapshot = parseSnapshot(getPreferenceMap(context.user)[callPreferenceKey(args.slug, args.callId)])

    if (!existingSnapshot?.projectId) {
      throw createError('Call must belong to a project before it can be pinned', 'unprocessable')
    }

    const result = await upsertProjectPin(ctx, {
      organizationId: context.organization._id,
      organizationMembershipId: context.viewerMembership._id,
      projectId: existingSnapshot.projectId,
      subjectType: 'Call',
      subjectId: args.callId,
      actorMembershipId: context.viewerMembership._id,
      actorTokenIdentifier: context.identity.tokenIdentifier,
      recordTimelineEvent: true
    })

    return {
      pin: {
        id: result.pin.publicId,
        post: null,
        note: null,
        call: await buildCompatCall(ctx, context, args.callId, existingSnapshot)
      }
    }
  }
})

export const createLegacyCallCompatFollowUp = mutation({
  args: {
    slug: v.string(),
    callId: v.string(),
    showAt: v.number()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const snapshot = parseSnapshot(getPreferenceMap(context.user)[callPreferenceKey(args.slug, args.callId)])
    const targetTitle = snapshot?.title?.trim() || 'Call'
    const existing = await ctx.db
      .query('followUps')
      .withIndex('by_organization_user_and_subject', (q: any) =>
        q
          .eq('organizationId', context.organization._id)
          .eq('userTokenIdentifier', context.identity.tokenIdentifier)
          .eq('subjectType', 'Call')
          .eq('subjectId', args.callId)
      )
      .unique()

    if (existing) {
      await ctx.db.patch(existing._id, {
        showAt: args.showAt,
        targetTitle,
        targetProjectId: snapshot?.projectId || undefined
      })
    } else {
      await ctx.db.insert('followUps', {
        organizationId: context.organization._id,
        userTokenIdentifier: context.identity.tokenIdentifier,
        subjectType: 'Call',
        subjectId: args.callId,
        targetType: 'Call',
        targetId: args.callId,
        targetTitle,
        targetProjectId: snapshot?.projectId || undefined,
        showAt: args.showAt,
        createdAt: Date.now()
      })
    }

    const [user, membership, project] = await Promise.all([
      getUserByTokenIdentifier(ctx, context.identity.tokenIdentifier),
      getMembership(ctx, context.organization._id, context.identity.tokenIdentifier),
      getProjectById(ctx, context.organization._id, snapshot?.projectId || undefined)
    ])

    if (!user || !membership) {
      throw createError('Organization member not found', 'not_found')
    }

    const updated = await ctx.db
      .query('followUps')
      .withIndex('by_organization_user_and_subject', (q: any) =>
        q
          .eq('organizationId', context.organization._id)
          .eq('userTokenIdentifier', context.identity.tokenIdentifier)
          .eq('subjectType', 'Call')
          .eq('subjectId', args.callId)
      )
      .unique()

    if (!updated) {
      throw createError('Follow-up could not be created', 'unprocessable')
    }

    return {
      id: updated._id,
      show_at: new Date(updated.showAt).toISOString(),
      inbox_key: `call:${args.callId}:follow_up`,
      organization_slug: args.slug,
      member: buildLegacyMember(membership, user),
      subject: {
        id: args.callId,
        type: 'Call',
        body_preview: targetTitle,
        member: null,
        title: targetTitle
      },
      target: {
        id: args.callId,
        type: 'Call',
        title: targetTitle,
        project: buildMiniProject(project),
        resolved: false
      },
      summary_blocks: [{ text: { content: targetTitle } }],
      belongs_to_viewer: true,
      type_name: 'follow_up'
    }
  }
})

export const syncLegacyCallFromHmsSessionOpen = mutation({
  args: {
    remoteRoomId: v.string(),
    remoteSessionId: v.string(),
    sessionStartedAt: v.number()
  },
  handler: async (ctx, args) => {
    const room = await getCallRoomByRemoteRoomId(ctx, args.remoteRoomId)

    if (!room) {
      return { ok: true, ignored: true }
    }

    const existing = await getCallByRemoteSessionId(ctx, args.remoteSessionId)
    const creatorMembership = room.creatorMembershipId ? ((await ctx.db.get(room.creatorMembershipId)) as any) : null
    const now = Date.now()

    if (existing) {
      await ctx.db.patch(existing._id, {
        callRoomId: room.publicId,
        stoppedAt: undefined,
        startedAt: args.sessionStartedAt,
        updatedAt: now
      })

      return { ok: true, callId: existing.publicId }
    }

    const callId = await ctx.db.insert('calls', {
      organizationId: room.organizationId,
      publicId: generateToken().slice(0, 12),
      remoteSessionId: args.remoteSessionId,
      callRoomId: room.publicId,
      creatorTokenIdentifier: creatorMembership?.userTokenIdentifier,
      startedAt: args.sessionStartedAt,
      projectPermission: 'none',
      createdAt: args.sessionStartedAt,
      updatedAt: now
    })
    const created = await ctx.db.get(callId)

    return { ok: true, callId: created?.publicId ?? null }
  }
})

export const syncLegacyCallFromHmsSessionClose = mutation({
  args: {
    remoteRoomId: v.string(),
    remoteSessionId: v.string(),
    sessionStartedAt: v.number(),
    sessionStoppedAt: v.number()
  },
  handler: async (ctx, args) => {
    const room = await getCallRoomByRemoteRoomId(ctx, args.remoteRoomId)
    let call = await getCallByRemoteSessionId(ctx, args.remoteSessionId)

    if (!call && room) {
      const created = await ctx.runMutation(api.callsRealtime.syncLegacyCallFromHmsSessionOpen, {
        remoteRoomId: args.remoteRoomId,
        remoteSessionId: args.remoteSessionId,
        sessionStartedAt: args.sessionStartedAt
      })

      if (created.callId) {
        call = await getCallByPublicId(ctx, room.organizationId, created.callId)
      }
    }

    if (call) {
      await ctx.db.patch(call._id, {
        stoppedAt: args.sessionStoppedAt,
        updatedAt: Date.now()
      })
    }

    if (room) {
      const invitations = await ctx.db
        .query('callRoomInvitations')
        .withIndex('by_call_room_id', (q: any) => q.eq('callRoomId', room._id))
        .collect()

      await Promise.all(
        invitations
          .filter((invitation: any) => !invitation.discardedAt)
          .map((invitation: any) =>
            ctx.db.patch(invitation._id, {
              discardedAt: args.sessionStoppedAt
            })
          )
      )
    }

    return { ok: true, callId: call?.publicId ?? null }
  }
})

export const syncLegacyCallRecordingDurationFromHmsEvent = mutation({
  args: {
    remoteSessionId: v.string(),
    duration: v.number()
  },
  handler: async (ctx, args) => {
    const call = await getCallByRemoteSessionId(ctx, args.remoteSessionId)

    if (!call) {
      return { ok: true, ignored: true }
    }

    await ctx.db.patch(call._id, {
      recordingsDuration: Math.max(call.recordingsDuration ?? 0, args.duration),
      updatedAt: Date.now()
    })

    return { ok: true, callId: call.publicId }
  }
})
