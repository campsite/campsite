import { v } from 'convex/values'

import { api } from './_generated/api'
import { internalQuery, mutation, query } from './_generated/server'
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

async function listCallsByCallRoomId(ctx: any, organizationId: any, callRoomId?: string | null) {
  if (!callRoomId) {
    return []
  }

  const rows = await ctx.db
    .query('calls')
    .withIndex('by_call_room_id', (q: any) => q.eq('callRoomId', callRoomId))
    .collect()

  return rows
    .filter((call: any) => call.organizationId === organizationId)
    .sort((left: any, right: any) => {
      const leftStartedAt = left.startedAt ?? left.createdAt ?? 0
      const rightStartedAt = right.startedAt ?? right.createdAt ?? 0
      return rightStartedAt - leftStartedAt
    })
}

async function getLatestCallByCallRoomId(
  ctx: any,
  organizationId: any,
  callRoomId?: string | null,
  options?: { activeOnly?: boolean }
) {
  const calls = await listCallsByCallRoomId(ctx, organizationId, callRoomId)
  const filtered = options?.activeOnly ? calls.filter((call: any) => !call.stoppedAt) : calls

  return filtered[0] ?? null
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

async function getMembershipById(ctx: any, membershipId: any) {
  if (!membershipId) {
    return null
  }

  return await ctx.db.get(membershipId)
}

async function getCallRecordings(ctx: any, callDbId: any) {
  const rows = await ctx.db
    .query('callRecordings')
    .withIndex('by_call_id', (q: any) => q.eq('callId', callDbId))
    .collect()

  return rows
    .filter((row: any) => !row.discardedAt)
    .sort((left: any, right: any) => (right.startedAt ?? right.createdAt) - (left.startedAt ?? left.createdAt))
}

async function getCallPeers(ctx: any, callDbId: any) {
  const rows = await ctx.db
    .query('callPeers')
    .withIndex('by_call_id', (q: any) => q.eq('callId', callDbId))
    .collect()

  return rows
    .filter((row: any) => !row.discardedAt)
    .sort((left: any, right: any) => (left.joinedAt ?? left.createdAt) - (right.joinedAt ?? right.createdAt))
}

async function getCallRecordingByPublicId(ctx: any, organizationId: any, publicId: string) {
  const row = await ctx.db
    .query('callRecordings')
    .withIndex('by_public_id', (q: any) => q.eq('publicId', publicId))
    .unique()

  if (!row || row.organizationId !== organizationId || row.discardedAt) {
    return null
  }

  return row
}

async function getCallRecordingByRemoteRecordingId(ctx: any, remoteRecordingId: string) {
  return await ctx.db
    .query('callRecordings')
    .withIndex('by_remote_recording_id', (q: any) => q.eq('remoteRecordingId', remoteRecordingId))
    .unique()
}

async function getCallRecordingByRemoteBeamId(ctx: any, remoteBeamId: string) {
  return await ctx.db
    .query('callRecordings')
    .withIndex('by_remote_beam_id', (q: any) => q.eq('remoteBeamId', remoteBeamId))
    .unique()
}

async function getCallRecordingByRemoteTranscriptionId(ctx: any, remoteTranscriptionId: string) {
  return await ctx.db
    .query('callRecordings')
    .withIndex('by_remote_transcription_id', (q: any) => q.eq('remoteTranscriptionId', remoteTranscriptionId))
    .unique()
}

async function getCallRecordingSpeakers(ctx: any, callRecordingId: any) {
  return await ctx.db
    .query('callRecordingSpeakers')
    .withIndex('by_call_recording_id', (q: any) => q.eq('callRecordingId', callRecordingId))
    .collect()
}

async function buildLegacyCallPeer(ctx: any, organizationId: any, peer: any) {
  const membership =
    (peer.organizationMembershipId ? await getMembershipById(ctx, peer.organizationMembershipId) : null) ??
    (peer.userTokenIdentifier ? await getMembership(ctx, organizationId, peer.userTokenIdentifier) : null)

  if (!membership) {
    return null
  }

  const user = await getUserByTokenIdentifier(ctx, membership.userTokenIdentifier)

  if (!user) {
    return null
  }

  return {
    member: buildLegacyMember(membership, user),
    active: !peer.leftAt,
    remote_peer_id: peer.remotePeerId
  }
}

async function buildLegacyCallPeers(ctx: any, organizationId: any, callDbId: any) {
  const peers = await getCallPeers(ctx, callDbId)
  const legacyPeers = await Promise.all(peers.map((peer: any) => buildLegacyCallPeer(ctx, organizationId, peer)))

  return legacyPeers.filter(Boolean)
}

function resolveFileUrl(path?: string | null) {
  if (!path) {
    return null
  }

  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path
  }

  return null
}

function getCallRecordingTranscriptionStatus(recording: any) {
  if (recording.transcriptionSucceededAt) {
    return 'COMPLETED' as const
  }

  if (recording.transcriptionFailedAt) {
    return 'FAILED' as const
  }

  if (recording.transcriptionStartedAt) {
    return 'IN_PROGRESS' as const
  }

  return 'NOT_STARTED' as const
}

function buildLegacyCallRecording(recording: any) {
  const fileUrl = resolveFileUrl(recording.filePath)

  return {
    id: recording.publicId,
    url: fileUrl,
    file_path: recording.filePath ?? null,
    name: recording.name ?? null,
    file_type: recording.fileType ?? null,
    imgix_video_thumbnail_preview_url: recording.thumbnailUrl ?? null,
    size: recording.size ?? null,
    duration:
      recording.duration ??
      (recording.startedAt && recording.stoppedAt ? Math.max(0, recording.stoppedAt - recording.startedAt) : null),
    max_width: recording.maxWidth ?? null,
    max_height: recording.maxHeight ?? null,
    transcription_status: getCallRecordingTranscriptionStatus(recording)
  }
}

async function buildLegacyCallRecordingTranscription(ctx: any, recording: any) {
  const speakerRows = await getCallRecordingSpeakers(ctx, recording._id)
  const speakers = []

  for (const speaker of speakerRows) {
    const membership = await getMembershipById(ctx, speaker.organizationMembershipId)

    if (!membership) {
      continue
    }

    const user = await getUserByTokenIdentifier(ctx, membership.userTokenIdentifier)

    if (!user) {
      continue
    }

    speakers.push({
      name: speaker.name,
      call_peer: {
        member: buildLegacyMember(membership, user),
        active: false,
        remote_peer_id: speaker.callPeerId ?? speaker.name
      }
    })
  }

  return {
    vtt: recording.transcriptionVtt ?? null,
    speakers
  }
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
    message_thread_id: project.messageThreadId ?? null
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

function buildResolvedCallSnapshot(params: {
  persistedCall?: any | null
  snapshot?: CallSnapshot | null
  favorite?: any | null
  followUps: any[]
  overrides?: Partial<CallSnapshot>
}) {
  const { persistedCall, snapshot, favorite, followUps, overrides } = params

  return {
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
}

async function upsertCompatCallRecord(ctx: any, context: any, callId: string, snapshot: CallSnapshot) {
  const existing = await getCallByPublicId(ctx, context.organization._id, callId)
  const nextStartedAt = snapshot.startedAt ?? snapshot.createdAt

  if (existing) {
    await ctx.db.patch(existing._id, {
      title: snapshot.title ?? undefined,
      summaryHtml: snapshot.summaryHtml ?? undefined,
      startedAt: nextStartedAt,
      stoppedAt: snapshot.stoppedAt ?? undefined,
      projectId: snapshot.projectId ? (snapshot.projectId as any) : undefined,
      projectPermission: snapshot.projectPermission ?? 'none',
      createdAt: snapshot.createdAt,
      updatedAt: Date.now()
    })

    return await ctx.db.get(existing._id)
  }

  const callIdRow = await ctx.db.insert('calls', {
    organizationId: context.organization._id,
    publicId: callId,
    remoteSessionId: `compat:${callId}`,
    callRoomId: undefined,
    creatorTokenIdentifier: context.identity.tokenIdentifier,
    title: snapshot.title ?? undefined,
    summaryHtml: snapshot.summaryHtml ?? undefined,
    generatedTitle: undefined,
    recordingsDuration: undefined,
    startedAt: nextStartedAt,
    stoppedAt: snapshot.stoppedAt ?? undefined,
    projectId: snapshot.projectId ? (snapshot.projectId as any) : undefined,
    projectPermission: snapshot.projectPermission ?? 'none',
    createdAt: snapshot.createdAt,
    updatedAt: Date.now()
  })

  return await ctx.db.get(callIdRow)
}

async function buildCompatCall(
  ctx: any,
  context: any,
  callId: string,
  overrides?: Partial<CallSnapshot>
) {
  const persistedCall = await getCallByPublicId(ctx, context.organization._id, callId)
  const { favorite, followUps, snapshot } = await getSnapshotSources(ctx, context, callId)
  const resolvedSnapshot = buildResolvedCallSnapshot({
    persistedCall,
    snapshot,
    favorite,
    followUps,
    overrides
  })
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
  const recordings = persistedCall ? await getCallRecordings(ctx, persistedCall._id) : []
  const peers = persistedCall ? await buildLegacyCallPeers(ctx, context.organization._id, persistedCall._id) : []

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
    peers,
    project: buildMiniProject(project),
    recordings: recordings.map((recording: any) => buildLegacyCallRecording(recording)),
    follow_ups: await buildCallFollowUps(ctx, context.organization._id, callId, context.identity.tokenIdentifier),
    type_name: 'call',
    viewer_can_edit: true,
    viewer_can_destroy_all_recordings: recordings.length > 0,
    viewer_has_favorited: !!favorite,
    processing_generated_title: false,
    processing_generated_summary: false,
    project_pin_id: activePin?.publicId ?? null,
    url: `/${context.organization.slug}/calls/${callId}`
  }
}

export const getLegacyCallCompatByCallRoomId = query({
  args: {
    slug: v.string(),
    callRoomId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const room = await ctx.db
      .query('callRooms')
      .withIndex('by_public_id', (q: any) => q.eq('publicId', args.callRoomId))
      .unique()

    if (!room || room.organizationId !== context.organization._id) {
      return null
    }

    const activeCall = await getLatestCallByCallRoomId(ctx, context.organization._id, room.publicId, { activeOnly: true })

    if (!activeCall) {
      return null
    }

    return await buildCompatCall(ctx, context, activeCall.publicId)
  }
})

export const getLegacyCallPeersByCallRoomId = internalQuery({
  args: {
    organizationId: v.string(),
    callRoomId: v.string()
  },
  handler: async (ctx, args) => {
    const room = await ctx.db
      .query('callRooms')
      .withIndex('by_public_id', (q: any) => q.eq('publicId', args.callRoomId))
      .unique()

    if (!room || room.organizationId !== args.organizationId) {
      return {
        peers: [],
        activePeers: []
      }
    }

    const activeCall = await getLatestCallByCallRoomId(ctx, args.organizationId, room.publicId, { activeOnly: true })

    if (!activeCall) {
      return {
        peers: [],
        activePeers: []
      }
    }

    const peers = await buildLegacyCallPeers(ctx, args.organizationId, activeCall._id)

    return {
      peers,
      activePeers: peers.filter((peer: any) => peer.active)
    }
  }
})

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

    const nextSnapshot = {
      ...existingSnapshot,
      title: args.title ?? existingSnapshot.title ?? null,
      summaryHtml: args.summaryHtml ?? existingSnapshot.summaryHtml ?? null,
      isEdited: true,
      projectId: existingSnapshot.projectId,
      projectPermission: existingSnapshot.projectPermission ?? 'none'
    } satisfies CallSnapshot

    await saveSnapshot(ctx, context.user, args.slug, args.callId, nextSnapshot)
    await upsertCompatCallRecord(ctx, context, args.callId, nextSnapshot)

    await patchCallFollowUps(ctx, context.organization._id, args.callId, (followUp) => ({
      targetTitle: args.title ?? followUp.targetTitle
    }))

    return await buildCompatCall(ctx, context, args.callId, nextSnapshot)
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

    const call = await getCallByPublicId(ctx, context.organization._id, args.callId)

    if (!call) {
      throw createError('Call not found', 'not_found')
    }

    const recordings = (await getCallRecordings(ctx, call._id)).map((recording: any) => buildLegacyCallRecording(recording))
    const limit = Math.max(1, Math.min(args.limit ?? 20, 100))
    const startIndex = args.after ? recordings.findIndex((recording: any) => recording.id === args.after) + 1 : 0
    const page = recordings.slice(Math.max(0, startIndex), Math.max(0, startIndex) + limit)

    return {
      data: page,
      next_cursor: startIndex + limit < recordings.length ? page.at(-1)?.id ?? null : null,
      prev_cursor: null
    }
  }
})

export const getLegacyCallRecordingTranscription = query({
  args: {
    slug: v.string(),
    callRecordingId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const recording = await getCallRecordingByPublicId(ctx, context.organization._id, args.callRecordingId)

    if (!recording) {
      throw createError('Recording not found', 'not_found')
    }

    return await buildLegacyCallRecordingTranscription(ctx, recording)
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

    const call = await getCallByPublicId(ctx, context.organization._id, args.callId)

    if (call) {
      const recordings = await getCallRecordings(ctx, call._id)

      await Promise.all(
        recordings.map((recording: any) =>
          ctx.db.patch(recording._id, {
            discardedAt: Date.now(),
            updatedAt: Date.now()
          })
        )
      )

      await ctx.db.patch(call._id, {
        recordingsDuration: 0,
        updatedAt: Date.now()
      })
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

    const nextSnapshot = {
      ...existingSnapshot,
      projectId: project._id,
      projectPermission: args.permission
    } satisfies CallSnapshot

    await saveSnapshot(ctx, context.user, args.slug, args.callId, nextSnapshot)
    await upsertCompatCallRecord(ctx, context, args.callId, nextSnapshot)

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

    return await buildCompatCall(ctx, context, args.callId, nextSnapshot)
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

    const nextSnapshot = {
      ...(parseSnapshot(getPreferenceMap(context.user)[callPreferenceKey(args.slug, args.callId)]) ?? {
        createdAt: Date.now()
      }),
      projectId: undefined,
      projectPermission: 'none' as const,
      projectPinId: undefined
    }

    await deleteSnapshotFields(ctx, context.user, args.slug, args.callId, (snapshot) => ({
      ...snapshot,
      projectId: undefined,
      projectPermission: 'none',
      projectPinId: undefined
    }))
    await upsertCompatCallRecord(ctx, context, args.callId, nextSnapshot)

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
    const nextSnapshot = buildResolvedCallSnapshot({
      persistedCall: await getCallByPublicId(ctx, context.organization._id, args.callId),
      snapshot,
      favorite: await getCallFavorite(ctx, context.organization._id, context.identity.tokenIdentifier, args.callId),
      followUps: await getCallFollowUps(ctx, context.organization._id, args.callId)
    })
    await upsertCompatCallRecord(ctx, context, args.callId, nextSnapshot)
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

export const promoteLegacyCallsCompat = mutation({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getOrganizationContext(ctx, args.slug)

    if (!context) {
      throw createError('Organization not found', 'not_found')
    }

    const preferenceKeys = Object.keys(getPreferenceMap(context.user)).filter((key) =>
      key.startsWith(`${CALL_PREF_PREFIX}${args.slug}:`)
    )
    const [favoriteCalls, followUps, persistedCalls] = await Promise.all([
      ctx.db
        .query('favorites')
        .withIndex('by_organization_and_user', (q: any) =>
          q.eq('organizationId', context.organization._id).eq('userTokenIdentifier', context.identity.tokenIdentifier)
        )
        .collect(),
      ctx.db
        .query('followUps')
        .withIndex('by_organization_and_user', (q: any) =>
          q.eq('organizationId', context.organization._id).eq('userTokenIdentifier', context.identity.tokenIdentifier)
        )
        .collect(),
      ctx.db
        .query('calls')
        .withIndex('by_organization_id', (q: any) => q.eq('organizationId', context.organization._id))
        .collect()
    ])

    const callIds = new Set<string>()

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

    let promoted = 0

    for (const callId of Array.from(callIds)) {
      const persistedCall = await getCallByPublicId(ctx, context.organization._id, callId)
      const { favorite, followUps: callFollowUps, snapshot } = await getSnapshotSources(ctx, context, callId)

      if (!persistedCall && !snapshot && !favorite && callFollowUps.length === 0) {
        continue
      }

      const resolvedSnapshot = buildResolvedCallSnapshot({
        persistedCall,
        snapshot,
        favorite,
        followUps: callFollowUps
      })

      await upsertCompatCallRecord(ctx, context, callId, resolvedSnapshot)
      promoted += 1
    }

    return {
      promoted,
      total: callIds.size
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

export const syncLegacyCallRecordingFromHmsEvent = mutation({
  args: {
    remoteSessionId: v.string(),
    remoteRecordingId: v.optional(v.string()),
    remoteBeamId: v.optional(v.string()),
    recordingPath: v.optional(v.string()),
    chatRecordingPath: v.optional(v.string()),
    duration: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    stoppedAt: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const call = await getCallByRemoteSessionId(ctx, args.remoteSessionId)

    if (!call) {
      return { ok: true, ignored: true }
    }

    const existing =
      (args.remoteRecordingId ? await getCallRecordingByRemoteRecordingId(ctx, args.remoteRecordingId) : null) ??
      (args.remoteBeamId ? await getCallRecordingByRemoteBeamId(ctx, args.remoteBeamId) : null)
    const now = Date.now()
    const payload = {
      organizationId: call.organizationId,
      callId: call._id,
      remoteRecordingId: args.remoteRecordingId,
      remoteBeamId: args.remoteBeamId,
      filePath: args.recordingPath,
      chatFilePath: args.chatRecordingPath,
      duration: args.duration,
      startedAt: args.startedAt,
      stoppedAt: args.stoppedAt,
      fileType: args.recordingPath?.endsWith('.mp4') ? 'video/mp4' : undefined,
      updatedAt: now
    }

    let recordingId = existing?._id

    if (existing) {
      await ctx.db.patch(existing._id, payload)
    } else {
      recordingId = await ctx.db.insert('callRecordings', {
        publicId: generateToken().slice(0, 12),
        name: args.recordingPath?.split('/').at(-1) ?? undefined,
        remoteTranscriptionId: undefined,
        transcriptJsonFilePath: undefined,
        transcriptSrtFilePath: undefined,
        transcriptTxtFilePath: undefined,
        transcriptionVtt: undefined,
        thumbnailUrl: undefined,
        size: undefined,
        maxWidth: undefined,
        maxHeight: undefined,
        transcriptionStartedAt: undefined,
        transcriptionSucceededAt: undefined,
        transcriptionFailedAt: undefined,
        discardedAt: undefined,
        createdAt: now,
        ...payload
      })
    }

    await ctx.db.patch(call._id, {
      recordingsDuration: Math.max(call.recordingsDuration ?? 0, args.duration ?? 0),
      updatedAt: now
    })

    return { ok: true, callId: call.publicId, callRecordingId: recordingId }
  }
})

export const syncLegacyCallTranscriptionStartedFromHmsEvent = mutation({
  args: {
    remoteRecordingId: v.optional(v.string()),
    remoteTranscriptionId: v.string(),
    startedAt: v.number()
  },
  handler: async (ctx, args) => {
    const recording =
      (args.remoteRecordingId ? await getCallRecordingByRemoteRecordingId(ctx, args.remoteRecordingId) : null) ??
      (await getCallRecordingByRemoteTranscriptionId(ctx, args.remoteTranscriptionId))

    if (!recording) {
      return { ok: true, ignored: true }
    }

    await ctx.db.patch(recording._id, {
      remoteTranscriptionId: args.remoteTranscriptionId,
      transcriptionStartedAt: args.startedAt,
      updatedAt: Date.now()
    })

    return { ok: true, callRecordingId: recording.publicId }
  }
})

export const syncLegacyCallTranscriptionFromHmsEvent = mutation({
  args: {
    remoteRecordingId: v.optional(v.string()),
    remoteTranscriptionId: v.optional(v.string()),
    transcriptJsonPath: v.optional(v.string()),
    transcriptSrtPath: v.optional(v.string()),
    transcriptTxtPath: v.optional(v.string()),
    transcriptionVtt: v.optional(v.string()),
    succeededAt: v.number()
  },
  handler: async (ctx, args) => {
    const recording =
      (args.remoteTranscriptionId ? await getCallRecordingByRemoteTranscriptionId(ctx, args.remoteTranscriptionId) : null) ??
      (args.remoteRecordingId ? await getCallRecordingByRemoteRecordingId(ctx, args.remoteRecordingId) : null)

    if (!recording) {
      return { ok: true, ignored: true }
    }

    await ctx.db.patch(recording._id, {
      remoteTranscriptionId: args.remoteTranscriptionId ?? recording.remoteTranscriptionId,
      transcriptJsonFilePath: args.transcriptJsonPath ?? recording.transcriptJsonFilePath,
      transcriptSrtFilePath: args.transcriptSrtPath ?? recording.transcriptSrtFilePath,
      transcriptTxtFilePath: args.transcriptTxtPath ?? recording.transcriptTxtFilePath,
      transcriptionVtt: args.transcriptionVtt ?? recording.transcriptionVtt,
      transcriptionSucceededAt: args.succeededAt,
      updatedAt: Date.now()
    })

    return { ok: true, callRecordingId: recording.publicId }
  }
})

export const syncLegacyCallTranscriptionFailureFromHmsEvent = mutation({
  args: {
    remoteRecordingId: v.optional(v.string()),
    remoteTranscriptionId: v.string(),
    failedAt: v.number()
  },
  handler: async (ctx, args) => {
    const recording =
      (args.remoteRecordingId ? await getCallRecordingByRemoteRecordingId(ctx, args.remoteRecordingId) : null) ??
      (await getCallRecordingByRemoteTranscriptionId(ctx, args.remoteTranscriptionId))

    if (!recording) {
      return { ok: true, ignored: true }
    }

    await ctx.db.patch(recording._id, {
      remoteTranscriptionId: args.remoteTranscriptionId,
      transcriptionFailedAt: args.failedAt,
      updatedAt: Date.now()
    })

    return { ok: true, callRecordingId: recording.publicId }
  }
})
