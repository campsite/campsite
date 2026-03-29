import { v } from 'convex/values'

import { api, internal } from './_generated/api'
import { action, internalMutation, internalQuery, mutation } from './_generated/server'
import { deleteSubjectPermissionByPublicId, listSubjectPermissions, upsertSubjectPermission } from './accountShell'
import { getLegacyProjectSubscriptionState, hasLegacyFavorite } from './engagement'
import { buildLegacyAvatarUrls, buildLegacyMediaUrl, formatDate, buildLegacyMember, buildLegacyUser } from './legacy'
import { createSubjectAttachment } from './media'
import { buildLegacyUnreadNotificationCounts, createNotificationRecord } from './notifications'
import { paginateByCursor } from './pinsBookmarks'
import { buildLegacyProjectDisplayPreferences } from './projectPreferences'
import { getLegacyResourceMentionsFromHtml } from './resourceMentions'
import { buildWorkspaceState, generateToken } from './workspace'

type StoredPermission = {
  id: string
  userTokenIdentifier: string
  action: 'view' | 'edit'
}

type StoredView = {
  updatedAt: number
  userTokenIdentifier: string
}

type StoredTimelineEvent = {
  action:
    | 'post_visibility_updated'
    | 'subject_pinned'
    | 'subject_project_updated'
    | 'subject_title_updated'
    | 'subject_unpinned'
  createdAt: number
  id: string
  memberActorTokenIdentifier: string
  subjectUpdatedFromProjectId?: string | null
  subjectUpdatedFromProjectName?: string | null
  subjectUpdatedFromProjectPrivate?: boolean | null
  subjectUpdatedToProjectId?: string | null
  subjectUpdatedToProjectName?: string | null
  subjectUpdatedToProjectPrivate?: boolean | null
  subjectUpdatedFromTitle?: string | null
  subjectUpdatedToTitle?: string | null
}

type StoredNoteRecord = {
  descriptionSchemaVersion: number
  descriptionState: string | null
  memberViews: StoredView[]
  nonMemberViewsCount: number
  noteId: string
  originalDigestPublicId?: string | null
  permittedUsers: StoredPermission[]
  projectPinId: string | null
  projectPermission: 'none' | 'view' | 'edit'
  timelineEvents: StoredTimelineEvent[]
}

type StoredNoteFile = {
  _id: any
  name: string
  storageId: any
}

type StoredNoteRecordEntry = {
  file: StoredNoteFile
  record: StoredNoteRecord
}

type AuthorizedContext = {
  organization: any
  viewerMembership: any
  viewerTokenIdentifier: string
}

type MembersSnapshot = {
  memberships: any[]
  users: any[]
}

type NoteSnapshot = {
  comments: any[]
  favorites: any[]
  followUps: any[]
  posts: any[]
  projectMemberships: any[]
  projects: any[]
  reactions: any[]
}

type AccessibleNote = {
  context: AuthorizedContext
  note: any
  record: StoredNoteRecord
}

type NoteCommentsBundle = {
  buildCommentTree: (comment: any) => Promise<any>
  comments: any[]
  context: AuthorizedContext
  membershipsByTokenIdentifier: Map<string, any>
  membersSnapshot: MembersSnapshot
  note: any
  noteAttachmentsById: Map<string, any>
  notePost: any
  usersByTokenIdentifier: Map<string, any>
}

const NOTE_MARKER = 'campsite://note'
const NOTE_RECORD_CONTENT_TYPE = 'application/vnd.campsite.note+json'
const SYNC_GRANT_TTL_MS = 60 * 60 * 1000

function createError(code: string, message: string) {
  return new Error(`${code}:${message}`)
}

function stripHtml(value?: string | null) {
  if (!value) return ''
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function slugify(value?: string | null) {
  const base = (value || 'untitled')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return base || 'untitled'
}

function simpleHash(value: string) {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }

  return Math.abs(hash).toString(16)
}

function noteStorageOwner(organizationId: string) {
  return `note-record:${organizationId}`
}

function buildNotePath(orgSlug: string, noteId: string) {
  return `/${orgSlug}/notes/${noteId}`
}

function buildPublicNotePath(orgSlug: string, noteId: string, title?: string | null) {
  return `/${orgSlug}/p/notes/${slugify(title)}-${noteId}`
}

function buildThumbnailBasePath(orgSlug: string, noteId: string, title?: string | null, descriptionHtml?: string | null) {
  const hash = simpleHash(`${title || ''}:${descriptionHtml || ''}:v1`)
  return `/v1/organizations/${orgSlug}/notes/${noteId}/thumbnail/${hash}`
}

function createRecordId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

function defaultStoredNoteRecord(noteId: string): StoredNoteRecord {
  return {
    noteId,
    descriptionState: null,
    descriptionSchemaVersion: 1,
    originalDigestPublicId: null,
    projectPermission: 'none',
    permittedUsers: [],
    memberViews: [],
    nonMemberViewsCount: 0,
    projectPinId: null,
    timelineEvents: []
  }
}

function normalizeStoredNoteRecord(value: unknown, noteId: string): StoredNoteRecord {
  if (!value || typeof value !== 'object') {
    return defaultStoredNoteRecord(noteId)
  }

  const record = value as Partial<StoredNoteRecord>

  return {
    noteId,
    descriptionState: typeof record.descriptionState === 'string' ? record.descriptionState : null,
    descriptionSchemaVersion:
      typeof record.descriptionSchemaVersion === 'number' ? record.descriptionSchemaVersion : 1,
    originalDigestPublicId: typeof record.originalDigestPublicId === 'string' ? record.originalDigestPublicId : null,
    projectPermission:
      record.projectPermission === 'view' || record.projectPermission === 'edit'
        ? record.projectPermission
        : 'none',
    permittedUsers: Array.isArray(record.permittedUsers)
      ? record.permittedUsers
          .filter((entry): entry is StoredPermission => {
            return (
              !!entry &&
              typeof entry === 'object' &&
              typeof (entry as StoredPermission).id === 'string' &&
              typeof (entry as StoredPermission).userTokenIdentifier === 'string' &&
              ((entry as StoredPermission).action === 'view' || (entry as StoredPermission).action === 'edit')
            )
          })
      : [],
    memberViews: Array.isArray(record.memberViews)
      ? record.memberViews
          .filter((entry): entry is StoredView => {
            return (
              !!entry &&
              typeof entry === 'object' &&
              typeof (entry as StoredView).userTokenIdentifier === 'string' &&
              typeof (entry as StoredView).updatedAt === 'number'
            )
          })
      : [],
    nonMemberViewsCount: typeof record.nonMemberViewsCount === 'number' ? record.nonMemberViewsCount : 0,
    projectPinId: typeof record.projectPinId === 'string' ? record.projectPinId : null,
    timelineEvents: Array.isArray(record.timelineEvents)
      ? record.timelineEvents
          .filter((entry): entry is StoredTimelineEvent => {
            return (
              !!entry &&
              typeof entry === 'object' &&
              typeof (entry as StoredTimelineEvent).id === 'string' &&
              typeof (entry as StoredTimelineEvent).createdAt === 'number' &&
              typeof (entry as StoredTimelineEvent).memberActorTokenIdentifier === 'string' &&
              typeof (entry as StoredTimelineEvent).action === 'string'
            )
          })
      : []
  }
}

async function blobToJson(blob: Blob | null) {
  if (!blob) {
    return null
  }

  try {
    return JSON.parse(await blob.text())
  } catch {
    return null
  }
}

function buildMemberMaps(users: any[], memberships: any[]) {
  const usersByTokenIdentifier = new Map(users.map((user: any) => [user.tokenIdentifier, user]))
  const membershipsByTokenIdentifier = new Map(memberships.map((membership: any) => [membership.userTokenIdentifier, membership]))

  return { usersByTokenIdentifier, membershipsByTokenIdentifier }
}

function buildLegacyMemberFromMaps(
  usersByTokenIdentifier: Map<string, any>,
  membershipsByTokenIdentifier: Map<string, any>,
  tokenIdentifier?: string | null
) {
  if (!tokenIdentifier) {
    return null
  }

  const user = usersByTokenIdentifier.get(tokenIdentifier)
  const membership = membershipsByTokenIdentifier.get(tokenIdentifier)

  if (!user || !membership) {
    return null
  }

  return buildLegacyMember(membership, user)
}

function buildLegacyUserFromMaps(usersByTokenIdentifier: Map<string, any>, tokenIdentifier?: string | null) {
  if (!tokenIdentifier) {
    return null
  }

  const user = usersByTokenIdentifier.get(tokenIdentifier)
  return user ? buildLegacyUser(user) : null
}

function buildPublicOrganization(organization: any) {
  const avatarUrl = buildLegacyMediaUrl(organization.avatarPath ?? organization.avatar_url)

  return {
    id: organization._id,
    avatar_url: avatarUrl || '',
    avatar_urls: buildLegacyAvatarUrls(avatarUrl),
    name: organization.name,
    slug: organization.slug,
    viewer_is_admin: false,
    viewer_can_leave: false
  }
}

async function buildProjectForNote(ctx: any, params: {
  organization: any
  project: any
  projectMemberships: any[]
  notePosts: any[]
  viewerMembership?: any
  viewerIsAdmin: boolean
  viewerIsMember: boolean
}) {
  const { organization, project, projectMemberships, notePosts, viewerMembership, viewerIsAdmin, viewerIsMember } = params
  const [viewerDisplayPreferences, unreadForViewer, subscriptionState, viewerHasFavorited] = await Promise.all([
    viewerMembership
      ? ctx.runQuery(internal.projectPreferences.getProjectDisplayPreferenceRecordInternal, {
          projectId: project._id,
          organizationMembershipId: viewerMembership._id
        })
      : Promise.resolve(null),
    viewerMembership && viewerMembership.userTokenIdentifier
      ? ctx.runQuery(internal.projectViews.getProjectUnreadForViewerInternal, {
          organizationId: organization._id,
          projectId: project._id,
          organizationMembershipId: viewerMembership._id,
          viewerTokenIdentifier: viewerMembership.userTokenIdentifier,
          messageThreadId: project.messageThreadId
        })
      : Promise.resolve(false),
    viewerMembership?.userTokenIdentifier
      ? getLegacyProjectSubscriptionState(ctx, {
          organizationId: organization._id,
          tokenIdentifier: viewerMembership.userTokenIdentifier,
          projectId: project._id
        })
      : Promise.resolve({
          viewer_has_subscribed: false,
          viewer_subscription: 'none'
        }),
    viewerMembership?.userTokenIdentifier
      ? hasLegacyFavorite(ctx, {
          organizationId: organization._id,
          tokenIdentifier: viewerMembership.userTokenIdentifier,
          favoritableType: 'Project',
          favoritableId: project._id
        })
      : Promise.resolve(false)
  ])
  const projectCallRoom = project.messageThreadId
    ? await ctx.runQuery(internal.threads.getThreadCallRoomInfoByPublicId, {
        organizationId: organization._id,
        threadPublicId: project.messageThreadId
      })
    : null
  const projectMembershipCounts = getProjectMembershipCounts(projectMemberships)

  return {
    id: project._id,
    name: project.name,
    description: project.description ?? null,
    created_at: new Date(project.createdAt).toISOString(),
    archived_at: formatDate(project.archivedAt),
    archived: !!project.archivedAt,
    last_activity_at: new Date(project.lastActivityAt).toISOString(),
    slack_channel_id: project.slackChannelId ?? null,
    posts_count: notePosts.length,
    cover_photo_url: buildLegacyMediaUrl(project.coverPhotoPath) ?? null,
    url: `/${organization.slug}/projects/${project._id}`,
    accessory: project.accessory ?? null,
    private: project.private,
    personal: project.personal,
    is_general: project.isGeneral,
    is_default: project.isDefault,
    contributors_count: new Set(notePosts.map((note) => note.authorTokenIdentifier)).size,
    members_and_guests_count: projectMembershipCounts.membersAndGuestsCount,
    members_count: projectMembershipCounts.membersCount,
    guests_count: projectMembershipCounts.guestsCount,
    call_room_url: projectCallRoom ? `/${organization.slug}/calls/join/${projectCallRoom.publicId}` : null,
    message_thread_id: project.messageThreadId ?? null,
    organization_id: organization._id,
    viewer_has_favorited: viewerHasFavorited,
    viewer_can_archive: viewerIsAdmin && !project.isGeneral,
    viewer_can_destroy: viewerIsAdmin && !project.isGeneral,
    viewer_can_unarchive: viewerIsAdmin,
    viewer_can_update: viewerIsAdmin,
    viewer_has_subscribed: subscriptionState.viewer_has_subscribed,
    viewer_subscription: subscriptionState.viewer_subscription,
    viewer_is_member: viewerIsMember,
    unread_for_viewer: unreadForViewer,
    slack_channel: null,
    type_name: 'project',
    viewer_display_preferences: viewerDisplayPreferences ? buildLegacyProjectDisplayPreferences(viewerDisplayPreferences) : null,
    display_preferences: buildLegacyProjectDisplayPreferences(project)
  }
}

function buildAttachmentFlags(fileType: string) {
  const normalized = (fileType || '').toLowerCase()

  return {
    link: normalized === 'link',
    image: normalized.startsWith('image/'),
    video: normalized.startsWith('video/'),
    audio: normalized.startsWith('audio/'),
    origami: normalized.includes('origami'),
    principle: normalized.includes('principle'),
    lottie: normalized.includes('lottie') || normalized.includes('json'),
    stitch: normalized.includes('stitch'),
    gif: normalized.includes('gif')
  }
}

function buildAttachmentImageUrls(attachment: any, flags: ReturnType<typeof buildAttachmentFlags>) {
  if (!flags.image && !flags.gif) {
    return null
  }

  const originalUrl = buildLegacyMediaUrl(attachment.filePath)
  const previewUrl = buildLegacyMediaUrl(attachment.previewFilePath || attachment.filePath)

  return {
    original_url: originalUrl,
    thumbnail_url: previewUrl,
    feed_url: previewUrl,
    email_url: originalUrl,
    slack_url: previewUrl,
    large_url: originalUrl
  }
}

function getProjectMembershipCounts(projectMemberships: any[]) {
  const guestsCount = projectMemberships.filter((membership: any) => membership.role === 'guest').length

  return {
    guestsCount,
    membersAndGuestsCount: projectMemberships.length,
    membersCount: projectMemberships.length - guestsCount
  }
}

function buildLegacyAttachment(
  attachment: any,
  params: {
    commentsCount?: number
    isSubjectComment: boolean
    subjectId: string
    subjectType: 'Note' | 'Comment'
  }
) {
  const url = attachment.previewFilePath || attachment.filePath
  const originalUrl = buildLegacyMediaUrl(attachment.filePath)
  const previewUrl = buildLegacyMediaUrl(attachment.previewFilePath || attachment.filePath)
  const flags = buildAttachmentFlags(attachment.fileType)
  const id = attachment.publicId ?? attachment.id
  const imageUrls = buildAttachmentImageUrls(attachment, flags)

  return {
    id,
    file_type: attachment.fileType,
    url: buildLegacyMediaUrl(url),
    app_url: originalUrl,
    download_url: originalUrl,
    preview_url: previewUrl,
    preview_thumbnail_url: previewUrl,
    image_urls: imageUrls,
    ...flags,
    duration: attachment.duration ?? 0,
    width: attachment.width ?? 0,
    height: attachment.height ?? 0,
    subject_type: params.subjectType,
    name: attachment.name ?? null,
    size: attachment.size ?? null,
    remote_figma_url: null,
    no_video_track: attachment.noVideoTrack ?? false,
    gallery_id: attachment.galleryId ?? null,
    type_name: 'attachment',
    subject_id: params.subjectId,
    is_subject_comment: params.isSubjectComment,
    relative_url: attachment.filePath,
    preview_relative_url: attachment.previewFilePath ?? null,
    comments_count: params.commentsCount ?? 0,
    key: attachment.filePath,
    optimistic_ready: true
  }
}

function buildLegacyGroupedReactions(
  reactions: any[],
  usersByTokenIdentifier: Map<string, any>,
  membershipsByTokenIdentifier: Map<string, any>,
  viewerTokenIdentifier?: string | null
) {
  const buckets = new Map<string, any[]>()

  for (const reaction of reactions) {
    const key = reaction.customContent ? `custom:${reaction.customContent.id}` : `emoji:${reaction.content || ''}`
    const existing = buckets.get(key) ?? []
    existing.push(reaction)
    buckets.set(key, existing)
  }

  return Array.from(buckets.values()).map((bucket) => {
    const members = bucket
      .map((reaction) =>
        buildLegacyMemberFromMaps(usersByTokenIdentifier, membershipsByTokenIdentifier, reaction.userTokenIdentifier)
      )
      .filter(Boolean)

    const viewerReaction = bucket.find((reaction) => reaction.userTokenIdentifier === viewerTokenIdentifier)
    const first = bucket[0]

    return {
      viewer_reaction_id: viewerReaction?._id ?? null,
      emoji: first.content ?? null,
      tooltip: members.map((member: any) => member.user.display_name).join(', '),
      reactions_count: bucket.length,
      custom_content: first.customContent ?? null
    }
  })
}

function buildLegacyFollowUps(
  followUps: any[],
  usersByTokenIdentifier: Map<string, any>,
  membershipsByTokenIdentifier: Map<string, any>,
  viewerTokenIdentifier?: string | null
) {
  return [...followUps]
    .sort((left, right) => left.showAt - right.showAt)
    .map((followUp) => {
      const member = buildLegacyMemberFromMaps(
        usersByTokenIdentifier,
        membershipsByTokenIdentifier,
        followUp.userTokenIdentifier
      )

      if (!member) {
        return null
      }

      return {
        id: followUp._id,
        member,
        show_at: new Date(followUp.showAt).toISOString(),
        belongs_to_viewer: followUp.userTokenIdentifier === viewerTokenIdentifier
      }
    })
    .filter(Boolean)
}

function buildTimelineEvents(
  events: StoredTimelineEvent[],
  usersByTokenIdentifier: Map<string, any>,
  membershipsByTokenIdentifier: Map<string, any>,
  projectMessageThreadIds: Map<string, string | null> = new Map()
) {
  return [...events]
    .sort((left, right) => right.createdAt - left.createdAt)
    .map((event) => ({
      id: event.id,
      created_at: new Date(event.createdAt).toISOString(),
      action: event.action,
      subject_updated_from_title: event.subjectUpdatedFromTitle ?? null,
      subject_updated_to_title: event.subjectUpdatedToTitle ?? null,
      subject_updated_from_project:
        event.subjectUpdatedFromProjectId && event.subjectUpdatedFromProjectName
          ? {
              id: event.subjectUpdatedFromProjectId,
              name: event.subjectUpdatedFromProjectName,
              accessory: null,
              private: !!event.subjectUpdatedFromProjectPrivate,
              archived: false,
              message_thread_id:
                projectMessageThreadIds.get(event.subjectUpdatedFromProjectId) ?? null
            }
          : null,
      subject_updated_to_project:
        event.subjectUpdatedToProjectId && event.subjectUpdatedToProjectName
          ? {
              id: event.subjectUpdatedToProjectId,
              name: event.subjectUpdatedToProjectName,
              accessory: null,
              private: !!event.subjectUpdatedToProjectPrivate,
              archived: false,
              message_thread_id:
                projectMessageThreadIds.get(event.subjectUpdatedToProjectId) ?? null
            }
          : null,
      comment_reference_subject_type: null,
      comment_reference_subject_title: null,
      member_actor: buildLegacyMemberFromMaps(
        usersByTokenIdentifier,
        membershipsByTokenIdentifier,
        event.memberActorTokenIdentifier
      ),
      external_reference: null,
      post_reference: null,
      comment_reference: null,
      note_reference: null
    }))
}

function canAccessProject(project: any, projectMemberships: any[], viewerMembership: any, viewerTokenIdentifier?: string | null) {
  if (!project) {
    return false
  }

  if (viewerMembership?.role === 'admin') {
    return true
  }

  if (!project.private) {
    return true
  }

  return !!projectMemberships.find((membership) => membership.userTokenIdentifier === viewerTokenIdentifier)
}

function emptyNotificationCounts() {
  return {
    inbox: {},
    messages: {},
    activity: {},
    home_inbox: {}
  }
}

function canViewNote(post: any, record: StoredNoteRecord, params: {
  permissions?: StoredPermission[]
  project: any | null
  projectMemberships: any[]
  viewerMembership: any
  viewerTokenIdentifier?: string | null
}) {
  const { permissions = record.permittedUsers, project, projectMemberships, viewerMembership, viewerTokenIdentifier } = params

  if (!viewerMembership || !viewerTokenIdentifier) {
    return false
  }

  if (viewerMembership.role === 'admin' || post.authorTokenIdentifier === viewerTokenIdentifier) {
    return true
  }

  if (
    permissions.some(
      (permission) =>
        permission.userTokenIdentifier === viewerTokenIdentifier &&
        (permission.action === 'view' || permission.action === 'edit')
    )
  ) {
    return true
  }

  if ((record.projectPermission === 'view' || record.projectPermission === 'edit') && canAccessProject(project, projectMemberships, viewerMembership, viewerTokenIdentifier)) {
    return true
  }

  return false
}

function canEditNote(post: any, record: StoredNoteRecord, params: {
  permissions?: StoredPermission[]
  project: any | null
  projectMemberships: any[]
  viewerMembership: any
  viewerTokenIdentifier?: string | null
}) {
  const { permissions = record.permittedUsers, project, projectMemberships, viewerMembership, viewerTokenIdentifier } = params

  if (!viewerMembership || !viewerTokenIdentifier) {
    return false
  }

  if (viewerMembership.role === 'admin' || post.authorTokenIdentifier === viewerTokenIdentifier) {
    return true
  }

  if (
    permissions.some(
      (permission) => permission.userTokenIdentifier === viewerTokenIdentifier && permission.action === 'edit'
    )
  ) {
    return true
  }

  if (record.projectPermission === 'edit' && canAccessProject(project, projectMemberships, viewerMembership, viewerTokenIdentifier)) {
    return true
  }

  return false
}

function buildLatestCommenters(
  comments: any[],
  usersByTokenIdentifier: Map<string, any>,
  membershipsByTokenIdentifier: Map<string, any>
) {
  const seen = new Set<string>()
  const result = []

  for (const comment of [...comments].sort((left, right) => right.createdAt - left.createdAt)) {
    if (seen.has(comment.authorTokenIdentifier)) {
      continue
    }

    const member = buildLegacyMemberFromMaps(
      usersByTokenIdentifier,
      membershipsByTokenIdentifier,
      comment.authorTokenIdentifier
    )

    if (member) {
      seen.add(comment.authorTokenIdentifier)
      result.push(member)
    }

    if (result.length >= 3) {
      break
    }
  }

  return result
}

function pickThumbnailBaseUrl(orgSlug: string, post: any) {
  if (!post?.descriptionHtml) {
    return null
  }

  return buildThumbnailBasePath(orgSlug, post._id, post.title, post.descriptionHtml)
}

function buildPermissionList(
  permissions: Array<{ id: string; userTokenIdentifier: string; action: 'view' | 'edit' }>,
  usersByTokenIdentifier: Map<string, any>
) {
  return permissions
    .map((permission) => {
      const user = buildLegacyUserFromMaps(usersByTokenIdentifier, permission.userTokenIdentifier)

      if (!user) {
        return null
      }

      return {
        id: permission.id,
        user,
        action: permission.action
      }
    })
    .filter(Boolean)
}

async function getStoredNotePermissionRows(ctx: any, noteId: string) {
  const rows = await listSubjectPermissions(ctx, 'Note', noteId)

  return rows
    .filter((row: any) => row.userTokenIdentifier)
    .map((row: any) => ({
      id: row.publicId ?? row._id,
      userTokenIdentifier: row.userTokenIdentifier,
      action: row.permission as 'view' | 'edit'
    }))
}

async function getEffectiveNotePermissions(ctx: any, noteId: string, record: StoredNoteRecord) {
  const permissions = await getStoredNotePermissionRows(ctx, noteId)
  return permissions.length > 0 ? permissions : record.permittedUsers
}

function buildNoteViews(
  memberViews: StoredView[],
  usersByTokenIdentifier: Map<string, any>,
  membershipsByTokenIdentifier: Map<string, any>,
  viewerTokenIdentifier?: string | null
) {
  return [...memberViews]
    .filter((view) => view.userTokenIdentifier !== viewerTokenIdentifier)
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .map((view) => {
      const member = buildLegacyMemberFromMaps(
        usersByTokenIdentifier,
        membershipsByTokenIdentifier,
        view.userTokenIdentifier
      )

      if (!member) {
        return null
      }

      return {
        updated_at: new Date(view.updatedAt).toISOString(),
        member
      }
    })
    .filter(Boolean)
}

function buildStoredViewsFromRows(rows: any[]): StoredView[] {
  return rows.map((row: any) => ({
    userTokenIdentifier: row.userTokenIdentifier,
    updatedAt: row.updatedAt
  }))
}

async function listDedicatedNoteViews(ctx: any, noteId: string) {
  return await ctx.db.query('noteViews').withIndex('by_note_id', (query: any) => query.eq('noteId', noteId)).collect()
}

async function upsertDedicatedNoteView(
  ctx: any,
  args: {
    organizationId: any
    noteId: string
    organizationMembershipId: any
    userTokenIdentifier: string
  }
) {
  const existing = await ctx.db
    .query('noteViews')
    .withIndex('by_note_and_membership', (query: any) =>
      query.eq('noteId', args.noteId).eq('organizationMembershipId', args.organizationMembershipId)
    )
    .unique()
  const now = Date.now()

  if (existing) {
    await ctx.db.patch(existing._id, {
      userTokenIdentifier: args.userTokenIdentifier,
      updatedAt: now
    })
    return await ctx.db.get(existing._id)
  }

  const rowId = await ctx.db.insert('noteViews', {
    organizationId: args.organizationId,
    publicId: createRecordId('note_view'),
    noteId: args.noteId,
    organizationMembershipId: args.organizationMembershipId,
    userTokenIdentifier: args.userTokenIdentifier,
    createdAt: now,
    updatedAt: now
  })

  return await ctx.db.get(rowId)
}

async function recordNonMemberNoteView(
  ctx: any,
  args: {
    organizationId: any
    noteId: string
    userTokenIdentifier?: string | null
    anonymizedIp: string
    userAgent?: string | null
  }
) {
  const existing = await ctx.db
    .query('nonMemberNoteViews')
    .withIndex('by_note_and_ip_agent', (query: any) =>
      query.eq('noteId', args.noteId).eq('anonymizedIp', args.anonymizedIp).eq('userAgent', args.userAgent ?? undefined)
    )
    .unique()
  const now = Date.now()

  if (existing) {
    await ctx.db.patch(existing._id, {
      userTokenIdentifier: args.userTokenIdentifier ?? existing.userTokenIdentifier,
      updatedAt: now
    })
    return await ctx.db.get(existing._id)
  }

  const rowId = await ctx.db.insert('nonMemberNoteViews', {
    organizationId: args.organizationId,
    noteId: args.noteId,
    userTokenIdentifier: args.userTokenIdentifier ?? undefined,
    anonymizedIp: args.anonymizedIp,
    userAgent: args.userAgent ?? undefined,
    createdAt: now,
    updatedAt: now
  })

  return await ctx.db.get(rowId)
}

function mergeStoredNoteRecordWithRow(record: StoredNoteRecord, row: any | null): StoredNoteRecord {
  if (!row) {
    return record
  }

  return {
    ...record,
    descriptionState: row.descriptionState ?? record.descriptionState,
    descriptionSchemaVersion: row.descriptionSchemaVersion ?? record.descriptionSchemaVersion,
    projectPermission: row.projectPermission ?? record.projectPermission,
    nonMemberViewsCount: row.nonMemberViewsCount ?? record.nonMemberViewsCount
  }
}

async function buildNoteFromSnapshot(params: {
  ctx: any
  comments: any[]
  favorites: any[]
  followUps: any[]
  membershipsByTokenIdentifier: Map<string, any>
  organization: any
  post: any
  projectPinId: string | null
  project: any | null
  projectMemberships: any[]
  permissions?: StoredPermission[]
  record: StoredNoteRecord
  usersByTokenIdentifier: Map<string, any>
  viewerMembership: any
  viewerTokenIdentifier?: string | null
}) {
  const {
    ctx,
    comments,
    favorites,
    followUps,
    membershipsByTokenIdentifier,
    organization,
    post,
    projectPinId,
    project,
    projectMemberships,
    permissions,
    record,
    usersByTokenIdentifier,
    viewerMembership,
    viewerTokenIdentifier
  } = params
  const effectivePermissions = permissions ?? record.permittedUsers

  const viewerCanEdit = canEditNote(post, record, {
    permissions: effectivePermissions,
    project,
    projectMemberships,
    viewerMembership,
    viewerTokenIdentifier
  })
  const viewerCanView = canViewNote(post, record, {
    permissions: effectivePermissions,
    project,
    projectMemberships,
    viewerMembership,
    viewerTokenIdentifier
  })
  const viewerHasFavorited = favorites.some(
    (favorite) =>
      favorite.favoritableType === 'Note' &&
      favorite.favoritableId === post._id &&
      favorite.userTokenIdentifier === viewerTokenIdentifier
  )
  const projectNotePosts = project ? [post] : []
  const author = buildLegacyMemberFromMaps(usersByTokenIdentifier, membershipsByTokenIdentifier, post.authorTokenIdentifier)
  const resolvedCommentsCount = comments.filter((comment: any) => !!comment.resolvedAt).length

  if (!author) {
    throw createError('not_found', 'Note author not found')
  }

  return {
    id: post._id,
    title: post.title,
    created_at: new Date(post.createdAt).toISOString(),
    last_activity_at: new Date(post.lastActivityAt).toISOString(),
    content_updated_at: new Date(post.updatedAt).toISOString(),
    comments_count: comments.length,
    resolved_comments_count: resolvedCommentsCount,
    channel_name: `note-${post._id}`,
    presence_channel_name: `presence-note-${post._id}`,
    description_thumbnail_base_url: pickThumbnailBaseUrl(organization.slug, post),
    public_visibility: post.visibility === 'public',
    non_member_views_count: record.nonMemberViewsCount,
    description_html: post.descriptionHtml || '<p></p>',
    description_state: record.descriptionState,
    project:
      project && record.projectPermission !== 'none'
        ? await buildProjectForNote(ctx, {
            organization,
            project,
            projectMemberships,
            notePosts: projectNotePosts,
            viewerMembership,
            viewerIsAdmin: viewerMembership?.role === 'admin',
            viewerIsMember: canAccessProject(project, projectMemberships, viewerMembership, viewerTokenIdentifier)
          })
        : null,
    follow_ups: buildLegacyFollowUps(followUps, usersByTokenIdentifier, membershipsByTokenIdentifier, viewerTokenIdentifier),
    type_name: 'note',
    url: buildNotePath(organization.slug, post._id),
    public_share_url: buildPublicNotePath(organization.slug, post._id, post.title),
    project_permission: record.projectPermission,
    member: author,
    viewer_is_author: post.authorTokenIdentifier === viewerTokenIdentifier,
    viewer_can_comment: viewerCanView,
    viewer_can_edit: viewerCanEdit,
    viewer_can_delete: post.authorTokenIdentifier === viewerTokenIdentifier || viewerMembership?.role === 'admin',
    viewer_has_favorited: viewerHasFavorited,
    latest_commenters: buildLatestCommenters(comments, usersByTokenIdentifier, membershipsByTokenIdentifier),
    permitted_users: buildPermissionList(effectivePermissions, usersByTokenIdentifier),
    project_pin_id: project && record.projectPermission !== 'none' ? projectPinId : null,
    resource_mentions: await getLegacyResourceMentionsFromHtml(ctx, {
      organizationId: organization._id,
      organizationSlug: organization.slug,
      html: post.descriptionHtml
    })
  }
}

async function getStoredNoteFiles(ctx: any, organizationId: string): Promise<StoredNoteFile[]> {
  return await ctx.runQuery(internal.notes.listStorageFilesByOwnerInternal, {
    owner: noteStorageOwner(organizationId)
  })
}

async function queryNoteRowByPublicId(ctx: any, noteId: string) {
  return await ctx.db
    .query('notes')
    .withIndex('by_public_id', (query: any) => query.eq('publicId', noteId))
    .unique()
}

async function queryNoteRowsByPublicIds(ctx: any, noteIds: string[]) {
  return (
    await Promise.all(noteIds.map((noteId) => queryNoteRowByPublicId(ctx, noteId)))
  ).filter(Boolean)
}

async function queryOrganizationMembershipByTokenIdentifier(ctx: any, organizationId: any, tokenIdentifier: string) {
  return await ctx.db
    .query('organizationMemberships')
    .withIndex('by_organization_and_user', (query: any) =>
      query.eq('organizationId', organizationId).eq('userTokenIdentifier', tokenIdentifier)
    )
    .unique()
}

async function getStoredNoteRecord(
  ctx: any,
  organizationId: string,
  noteId: string
): Promise<StoredNoteRecordEntry | null> {
  const files: StoredNoteFile[] = await getStoredNoteFiles(ctx, organizationId)
  const file: StoredNoteFile | undefined = files.find((entry) => entry.name === noteId)

  if (!file) {
    return null
  }

  return {
    file,
    record: normalizeStoredNoteRecord(await blobToJson(await ctx.storage.get(file.storageId)), noteId)
  }
}

async function upsertStoredNoteRecord(
  ctx: any,
  organizationId: string,
  noteId: string,
  updater: (current: StoredNoteRecord) => StoredNoteRecord
) {
  const existing = await getStoredNoteRecord(ctx, organizationId, noteId)
  const next = updater(existing?.record ?? defaultStoredNoteRecord(noteId))
  const storageId = await ctx.storage.store(new Blob([JSON.stringify(next)], { type: NOTE_RECORD_CONTENT_TYPE }))

  if (existing?.file) {
    await ctx.runMutation(internal.notes.updateStorageFileInternal, {
      fileId: existing.file._id,
      storageId
    })
    await ctx.storage.delete(existing.file.storageId)
  } else {
    await ctx.runMutation(internal.notes.createStorageFileInternal, {
      owner: noteStorageOwner(organizationId),
      name: noteId,
      storageId
    })
  }

  return next
}

async function deleteStoredNoteRecord(ctx: any, organizationId: string, noteId: string) {
  const existing = await getStoredNoteRecord(ctx, organizationId, noteId)

  if (!existing?.file) {
    return
  }

  await ctx.runMutation(internal.notes.deleteStorageFileInternal, { fileId: existing.file._id })
  await ctx.storage.delete(existing.file.storageId)
}

async function ensureNoteRowInDb(ctx: any, params: {
  organizationId: any
  noteId: string
  post: any
  record: StoredNoteRecord
}) {
  const existing = await queryNoteRowByPublicId(ctx, params.noteId)

  if (existing) {
    return existing
  }

  const authorMembership = await queryOrganizationMembershipByTokenIdentifier(
    ctx,
    params.organizationId,
    params.post.authorTokenIdentifier
  )

  if (!authorMembership) {
    throw createError('not_found', 'Note author membership not found')
  }

  if (params.record.originalDigestPublicId) {
    let digest = await ctx.db
      .query('postDigests')
      .withIndex('by_public_id', (query: any) => query.eq('publicId', params.record.originalDigestPublicId!))
      .unique()

    if (!digest) {
      const digestId = await ctx.db.insert('postDigests', {
        organizationId: params.organizationId,
        publicId: params.record.originalDigestPublicId,
        creatorTokenIdentifier: params.post.authorTokenIdentifier,
        title: params.post.title || 'Migrated digest',
        description: stripHtml(params.post.descriptionHtml) || undefined,
        publishedAt: params.post.createdAt,
        discardedAt: undefined,
        basic: false,
        createdAt: params.post.createdAt,
        updatedAt: params.post.updatedAt
      })

      digest = await ctx.db.get(digestId)
    }

    if (digest) {
      const existingDigestNote = await ctx.db
        .query('postDigestNotes')
        .withIndex('by_post_and_post_digest', (query: any) =>
          query.eq('postId', params.post._id as any).eq('postDigestId', digest._id)
        )
        .unique()

      if (!existingDigestNote) {
        await ctx.db.insert('postDigestNotes', {
          organizationId: params.organizationId,
          publicId: createRecordId('digest_note'),
          organizationMembershipId: authorMembership._id,
          postId: params.post._id as any,
          postDigestId: digest._id,
          title: params.post.title || 'Migrated digest note',
          content: stripHtml(params.post.descriptionHtml) || undefined,
          contentHtml: params.post.descriptionHtml || undefined,
          discardedAt: undefined,
          createdAt: params.post.createdAt,
          updatedAt: params.post.updatedAt
        })
      }
    }
  }

  const noteRowId = await ctx.db.insert('notes', {
    organizationId: params.organizationId,
    organizationMembershipId: authorMembership._id,
    publicId: params.noteId,
    originalDigestPublicId: params.record.originalDigestPublicId ?? undefined,
    title: params.post.title || undefined,
    descriptionHtml: params.post.descriptionHtml || undefined,
    descriptionState: params.record.descriptionState ?? undefined,
    descriptionSchemaVersion: params.record.descriptionSchemaVersion,
    commentsCount: 0,
    resolvedCommentsCount: 0,
    visibility: params.post.visibility,
    nonMemberViewsCount: params.record.nonMemberViewsCount,
    projectId: params.post.projectId ? (params.post.projectId as any) : undefined,
    projectPermission: params.record.projectPermission,
    discardedAt: undefined,
    lastActivityAt: params.post.lastActivityAt,
    contentUpdatedAt: params.post.updatedAt,
    createdAt: params.post.createdAt,
    updatedAt: params.post.updatedAt
  })

  return await ctx.db.get(noteRowId)
}

async function patchNoteRowInDb(
  ctx: any,
  noteId: string,
  patch: Record<string, unknown>
) {
  const existing = await queryNoteRowByPublicId(ctx, noteId)

  if (!existing) {
    return null
  }

  await ctx.db.patch(existing._id, {
    ...patch,
    updatedAt: Date.now()
  })

  return await ctx.db.get(existing._id)
}

async function getNoteRowByPublicId(ctx: any, noteId: string) {
  return await ctx.runQuery(internal.notes.getNoteRowByPublicIdInternal, { noteId })
}

async function listNoteRowsByPublicIds(ctx: any, noteIds: string[]) {
  return await ctx.runQuery(internal.notes.listNoteRowsByPublicIdsInternal, { noteIds })
}

async function ensureNoteRow(ctx: any, params: {
  organizationId: any
  noteId: string
  post: any
  record: StoredNoteRecord
}) {
  return await ctx.runMutation(internal.notes.ensureNoteRowInternal, params)
}

async function patchNoteRow(
  ctx: any,
  noteId: string,
  patch: {
    descriptionHtml?: string
    descriptionState?: string
    descriptionSchemaVersion?: number
    nonMemberViewsCount?: number
    projectId?: string | null
    projectPermission?: 'none' | 'view' | 'edit'
    contentUpdatedAt?: number
  }
) {
  return await ctx.runMutation(internal.notes.patchNoteRowInternal, {
    noteId,
    descriptionHtml: patch.descriptionHtml,
    descriptionState: patch.descriptionState,
    descriptionSchemaVersion: patch.descriptionSchemaVersion,
    nonMemberViewsCount: patch.nonMemberViewsCount,
    projectId: patch.projectId === undefined ? undefined : patch.projectId,
    projectPermission: patch.projectPermission,
    contentUpdatedAt: patch.contentUpdatedAt
  })
}

async function getAuthorizedContext(ctx: any, slug: string): Promise<AuthorizedContext> {
  const context: AuthorizedContext | null = await ctx.runQuery(internal.notes.resolveAuthorizedContextInternal, { slug })

  if (!context) {
    throw createError('not_found', 'Organization not found')
  }

  return context
}

async function getOrganizationMembersSnapshot(ctx: any, organizationId: string): Promise<MembersSnapshot> {
  return await ctx.runQuery(internal.notes.getOrganizationMembersSnapshotInternal, {
    organizationId: organizationId as any
  })
}

async function getNoteSnapshot(
  ctx: any,
  params: { organizationId: string; noteIds: string[]; viewerTokenIdentifier?: string | null }
): Promise<NoteSnapshot> {
  return await ctx.runQuery(internal.notes.getNoteSnapshotInternal, {
    organizationId: params.organizationId as any,
    noteIds: params.noteIds,
    viewerTokenIdentifier: params.viewerTokenIdentifier ?? undefined
  })
}

async function buildNotes(ctx: any, params: {
  organization: any
  records: StoredNoteRecord[]
  viewerMembership: any
  viewerTokenIdentifier?: string | null
}): Promise<any[]> {
  if (params.records.length === 0) {
    return []
  }

  const [noteSnapshot, membersSnapshot, noteRows]: [NoteSnapshot, MembersSnapshot, any[]] = await Promise.all([
    getNoteSnapshot(ctx, {
      organizationId: params.organization._id,
      noteIds: params.records.map((record) => record.noteId),
      viewerTokenIdentifier: params.viewerTokenIdentifier
    }),
    getOrganizationMembersSnapshot(ctx, params.organization._id),
    listNoteRowsByPublicIds(
      ctx,
      params.records.map((record) => record.noteId)
    )
  ])

  const { usersByTokenIdentifier, membershipsByTokenIdentifier } = buildMemberMaps(
    membersSnapshot.users,
    membersSnapshot.memberships
  )
  const postsById = new Map<string, any>(noteSnapshot.posts.map((post: any) => [post._id, post]))
  const noteRowsByPublicId = new Map<string, any>(noteRows.map((row: any) => [row.publicId, row]))
  const commentsByPostId = new Map<string, any[]>()
  const projectsById = new Map<string, any>(noteSnapshot.projects.map((project: any) => [project._id, project]))
  const projectMembershipsByProjectId = new Map<string, any[]>()
  const followUpsByKey = new Map<string, any[]>()

  for (const comment of noteSnapshot.comments) {
    const existing = commentsByPostId.get(comment.postId) ?? []
    existing.push(comment)
    commentsByPostId.set(comment.postId, existing)
  }

  for (const membership of noteSnapshot.projectMemberships) {
    const existing = projectMembershipsByProjectId.get(membership.projectId) ?? []
    existing.push(membership)
    projectMembershipsByProjectId.set(membership.projectId, existing)
  }

  for (const followUp of noteSnapshot.followUps) {
    const existing = followUpsByKey.get(`${followUp.subjectType}:${followUp.subjectId}`) ?? []
    existing.push(followUp)
    followUpsByKey.set(`${followUp.subjectType}:${followUp.subjectId}`, existing)
  }

  const pinRecords: { subjectId: string; pinId: string | null }[] = await ctx.runQuery(
    internal.pinsBookmarks.getActivePinsForSubjectsInternal,
    {
    subjects: params.records.map((record) => ({
      projectId: postsById.get(record.noteId)?.projectId ?? null,
      subjectType: 'Note' as const,
      subjectId: record.noteId
    }))
    }
  )
  const pinIdsByNoteId = new Map<string, string | null>(
    pinRecords.map((entry) => [entry.subjectId, entry.pinId ?? null])
  )

  return (await Promise.all(
    params.records.map(async (record) => {
      const post = postsById.get(record.noteId)

      if (!post) {
        return null
      }

      const mergedRecord = mergeStoredNoteRecordWithRow(record, noteRowsByPublicId.get(record.noteId) ?? null)
      const permissions = await getEffectiveNotePermissions(ctx, record.noteId, mergedRecord)

      const project = post.projectId ? projectsById.get(post.projectId) ?? null : null
      const projectMemberships = project ? projectMembershipsByProjectId.get(project._id) ?? [] : []

      if (
        !canViewNote(post, mergedRecord, {
          permissions,
          project,
          projectMemberships,
          viewerMembership: params.viewerMembership,
          viewerTokenIdentifier: params.viewerTokenIdentifier
        })
      ) {
        return null
      }

      return await buildNoteFromSnapshot({
        ctx,
        organization: params.organization,
        post,
        projectPinId: pinIdsByNoteId.get(post._id) ?? null,
        permissions,
        record: mergedRecord,
        project,
        projectMemberships,
        comments: commentsByPostId.get(post._id) ?? [],
        followUps: followUpsByKey.get(`Note:${post._id}`) ?? [],
        favorites: noteSnapshot.favorites,
        usersByTokenIdentifier,
        membershipsByTokenIdentifier,
        viewerMembership: params.viewerMembership,
        viewerTokenIdentifier: params.viewerTokenIdentifier
      })
    })
  )).filter(Boolean)
}

async function getAccessibleNoteForContext(ctx: any, context: AuthorizedContext, noteId: string): Promise<AccessibleNote> {
  const stored: StoredNoteRecordEntry | null = await getStoredNoteRecord(ctx, context.organization._id, noteId)

  if (!stored) {
    throw createError('not_found', 'Note not found')
  }

  const noteSnapshot = await getNoteSnapshot(ctx, {
    organizationId: context.organization._id,
    noteIds: [noteId],
    viewerTokenIdentifier: context.viewerTokenIdentifier
  })
  const post = noteSnapshot.posts.find((entry: any) => entry._id === noteId)

  if (post) {
    await ensureNoteRow(ctx, {
      organizationId: context.organization._id,
      noteId,
      post,
      record: stored.record
    })
  }

  const notes = await buildNotes(ctx, {
    organization: context.organization,
    records: [stored.record],
    viewerMembership: context.viewerMembership,
    viewerTokenIdentifier: context.viewerTokenIdentifier
  })
  const note = notes[0]

  if (!note) {
    throw createError('not_found', 'Note not found')
  }

  return { context, note, record: stored.record }
}

async function getAccessibleNote(ctx: any, slug: string, noteId: string): Promise<AccessibleNote> {
  const context: AuthorizedContext = await getAuthorizedContext(ctx, slug)
  return await getAccessibleNoteForContext(ctx, context, noteId)
}

async function getAuthorizedContextForSyncGrant(
  ctx: any,
  args: { grantId: string; slug: string; noteId: string }
): Promise<AuthorizedContext> {
  const [organization, grant] = await Promise.all([
    ctx.runQuery(internal.notes.getOrganizationBySlugInternal, { slug: args.slug }),
    ctx.db
      .query('syncGrants')
      .withIndex('by_public_id', (query: any) => query.eq('publicId', args.grantId))
      .unique()
  ])

  if (
    !organization ||
    !grant ||
    grant.organizationId !== organization._id ||
    grant.noteId !== args.noteId ||
    grant.resourceType !== 'Note' ||
    grant.expiresAt <= Date.now()
  ) {
    throw createError('unauthorized', 'Invalid sync grant')
  }

  const membership = await queryOrganizationMembershipByTokenIdentifier(ctx, organization._id, grant.userTokenIdentifier)

  if (!membership || membership.discardedAt) {
    throw createError('unauthorized', 'Invalid sync grant')
  }

  return {
    organization,
    viewerMembership: membership,
    viewerTokenIdentifier: grant.userTokenIdentifier
  }
}

async function getNoteCommentsBundle(ctx: any, slug: string, noteId: string): Promise<NoteCommentsBundle> {
  const { context, note } = await getAccessibleNote(ctx, slug, noteId)
  const [noteSnapshot, membersSnapshot, noteAttachmentRows]: [NoteSnapshot, MembersSnapshot, any[]] = await Promise.all([
    getNoteSnapshot(ctx, {
      organizationId: context.organization._id,
      noteIds: [noteId],
      viewerTokenIdentifier: context.viewerTokenIdentifier
    }),
    getOrganizationMembersSnapshot(ctx, context.organization._id),
    ctx.runQuery(internal.media.listSubjectAttachmentsInternal, {
      subjectType: 'Note',
      subjectId: noteId
    })
  ])

  const { usersByTokenIdentifier, membershipsByTokenIdentifier } = buildMemberMaps(
    membersSnapshot.users,
    membersSnapshot.memberships
  )
  const notePost: any = noteSnapshot.posts.find((entry: any) => entry._id === noteId) ?? null
  const noteAttachmentsById = new Map<string, any>(
    (
      noteAttachmentRows.length > 0
        ? noteAttachmentRows
        : (notePost?.attachments ?? [])
    ).map((attachment: any) => [attachment.publicId ?? attachment.id, attachment])
  )
  const comments = noteSnapshot.comments
  const commentIds = new Set(comments.map((comment: any) => comment._id))
  const commentsByParentId = new Map<string, any[]>()
  const followUpsByCommentId = new Map<string, any[]>()
  const reactionsByCommentId = new Map<string, any[]>()

  for (const comment of comments) {
    if (!comment.parentCommentId) {
      continue
    }

    const existing = commentsByParentId.get(comment.parentCommentId) ?? []
    existing.push(comment)
    commentsByParentId.set(comment.parentCommentId, existing)
  }

  for (const followUp of noteSnapshot.followUps) {
    if (followUp.subjectType !== 'Comment' || !commentIds.has(followUp.subjectId)) {
      continue
    }

    const existing = followUpsByCommentId.get(followUp.subjectId) ?? []
    existing.push(followUp)
    followUpsByCommentId.set(followUp.subjectId, existing)
  }

  for (const reaction of noteSnapshot.reactions) {
    const existing = reactionsByCommentId.get(reaction.subjectId) ?? []
    existing.push(reaction)
    reactionsByCommentId.set(reaction.subjectId, existing)
  }

  const buildCommentTree = async (comment: any): Promise<any> => {
    const member = buildLegacyMemberFromMaps(
      usersByTokenIdentifier,
      membershipsByTokenIdentifier,
      comment.authorTokenIdentifier
    )

    if (!member) {
      return null
    }

    const replies = (
      await Promise.all((commentsByParentId.get(comment._id) ?? []).sort((left, right) => left.createdAt - right.createdAt).map(buildCommentTree))
    ).filter(Boolean)
    const resolvedBy = buildLegacyMemberFromMaps(
      usersByTokenIdentifier,
      membershipsByTokenIdentifier,
      comment.resolvedByMembershipId
        ? membersSnapshot.memberships.find((membership: any) => membership._id === comment.resolvedByMembershipId)
            ?.userTokenIdentifier ?? null
        : null
    )
    const timelineEvents = await ctx.runQuery(internal.pinsBookmarks.getSubjectTimelineEventsInternal, {
      subjectType: 'Comment',
      subjectId: comment._id
    })
    const commentPreviewUrl = buildLegacyMediaUrl(
      (comment.attachmentId ? noteAttachmentsById.get(comment.attachmentId)?.previewFilePath : null) ??
        (comment.attachmentId ? noteAttachmentsById.get(comment.attachmentId)?.filePath : null) ??
        comment.attachments[0]?.previewFilePath ??
        comment.attachments[0]?.filePath ??
        null
    )

    return {
      id: comment._id,
      created_at: new Date(comment.createdAt).toISOString(),
      timestamp: comment.timestamp ?? null,
      x: comment.x ?? null,
      y: comment.y ?? null,
      body_html: comment.bodyHtml,
      note_highlight: comment.noteHighlight ?? null,
      resolved_at: formatDate(comment.resolvedAt),
      resolved_by: resolvedBy,
      type_name: 'comment',
      subject_type: 'note',
      subject_id: note.id,
      url: `${note.url}#comment-${comment._id}`,
      viewer_can_resolve: !comment.parentCommentId,
      viewer_can_create_issue: false,
      attachment_id: comment.attachmentId ?? null,
      canvas_preview_url: commentPreviewUrl,
      attachment_thumbnail_url: commentPreviewUrl,
      viewer_is_author: comment.authorTokenIdentifier === context.viewerTokenIdentifier,
      viewer_can_edit: comment.authorTokenIdentifier === context.viewerTokenIdentifier,
      viewer_can_follow_up: true,
      viewer_can_react: true,
      viewer_can_delete:
        comment.authorTokenIdentifier === context.viewerTokenIdentifier || context.viewerMembership.role === 'admin',
      member,
      attachments: comment.attachments.map((attachment: any) =>
        buildLegacyAttachment(attachment, {
          subjectType: 'Comment',
          subjectId: comment._id,
          isSubjectComment: true
        })
      ),
      grouped_reactions: buildLegacyGroupedReactions(
        reactionsByCommentId.get(comment._id) ?? [],
        usersByTokenIdentifier,
        membershipsByTokenIdentifier,
        context.viewerTokenIdentifier
      ),
      replies,
      follow_ups: buildLegacyFollowUps(
        followUpsByCommentId.get(comment._id) ?? [],
        usersByTokenIdentifier,
        membershipsByTokenIdentifier,
        context.viewerTokenIdentifier
      ),
      parent_id: comment.parentCommentId ?? null,
      is_optimistic: false,
      optimistic_id: null,
      timeline_events: timelineEvents,
      resource_mentions: await getLegacyResourceMentionsFromHtml(ctx, {
        organizationId: context.organization._id,
        organizationSlug: context.organization.slug,
        html: comment.bodyHtml
      })
    }
  }

  return {
    context,
    note,
    notePost,
    noteAttachmentsById,
    comments,
    membersSnapshot,
    usersByTokenIdentifier,
    membershipsByTokenIdentifier,
    buildCommentTree
  }
}

function appendTimelineEvent(record: StoredNoteRecord, event: StoredTimelineEvent) {
  return {
    ...record,
    timelineEvents: [...record.timelineEvents, event]
  }
}

async function ensureNoteSubscription(ctx: any, organizationId: any, tokenIdentifier: string, noteId: string) {
  const existing = await ctx.db
    .query('subscriptions')
    .withIndex('by_organization_user_and_subject', (query: any) =>
      query
        .eq('organizationId', organizationId)
        .eq('userTokenIdentifier', tokenIdentifier)
        .eq('subscribableType', 'Note')
        .eq('subscribableId', noteId)
    )
    .unique()

  if (existing) {
    return existing
  }

  const id = await ctx.db.insert('subscriptions', {
    organizationId,
    userTokenIdentifier: tokenIdentifier,
    subscribableType: 'Note',
    subscribableId: noteId,
    createdAt: Date.now()
  })

  return await ctx.db.get(id)
}

async function listNoteSubscriptions(ctx: any, noteId: string) {
  return await ctx.db
    .query('subscriptions')
    .withIndex('by_subject', (query: any) => query.eq('subscribableType', 'Note').eq('subscribableId', noteId))
    .collect()
}

export const listStorageFilesByOwnerInternal = internalQuery({
  args: {
    owner: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('files')
      .withIndex('by_owner', (query) => query.eq('ownerTokenIdentifier', args.owner))
      .collect()
  }
})

export const getNoteRowByPublicIdInternal = internalQuery({
  args: {
    noteId: v.string()
  },
  handler: async (ctx, args) => {
    return await queryNoteRowByPublicId(ctx, args.noteId)
  }
})

export const listNoteRowsByPublicIdsInternal = internalQuery({
  args: {
    noteIds: v.array(v.string())
  },
  handler: async (ctx, args) => {
    return await queryNoteRowsByPublicIds(ctx, args.noteIds)
  }
})

export const ensureNoteRowInternal = internalMutation({
  args: {
    organizationId: v.id('organizations'),
    noteId: v.string(),
    post: v.object({
      _id: v.string(),
      authorTokenIdentifier: v.string(),
      title: v.string(),
      descriptionHtml: v.string(),
      visibility: v.union(v.literal('default'), v.literal('public')),
      projectId: v.optional(v.union(v.string(), v.null())),
      createdAt: v.number(),
      updatedAt: v.number(),
      lastActivityAt: v.number()
    }),
    record: v.object({
      noteId: v.string(),
      descriptionState: v.union(v.string(), v.null()),
      descriptionSchemaVersion: v.number(),
      memberViews: v.array(
        v.object({
          updatedAt: v.number(),
          userTokenIdentifier: v.string()
        })
      ),
      nonMemberViewsCount: v.number(),
      permittedUsers: v.array(
        v.object({
          id: v.string(),
          userTokenIdentifier: v.string(),
          action: v.union(v.literal('view'), v.literal('edit'))
        })
      ),
      projectPinId: v.union(v.string(), v.null()),
      projectPermission: v.union(v.literal('none'), v.literal('view'), v.literal('edit')),
      timelineEvents: v.array(
        v.object({
          action: v.union(
            v.literal('post_visibility_updated'),
            v.literal('subject_pinned'),
            v.literal('subject_project_updated'),
            v.literal('subject_title_updated'),
            v.literal('subject_unpinned')
          ),
          createdAt: v.number(),
          id: v.string(),
          memberActorTokenIdentifier: v.string(),
          subjectUpdatedFromProjectId: v.optional(v.union(v.string(), v.null())),
          subjectUpdatedFromProjectName: v.optional(v.union(v.string(), v.null())),
          subjectUpdatedFromProjectPrivate: v.optional(v.union(v.boolean(), v.null())),
          subjectUpdatedToProjectId: v.optional(v.union(v.string(), v.null())),
          subjectUpdatedToProjectName: v.optional(v.union(v.string(), v.null())),
          subjectUpdatedToProjectPrivate: v.optional(v.union(v.boolean(), v.null())),
          subjectUpdatedFromTitle: v.optional(v.union(v.string(), v.null())),
          subjectUpdatedToTitle: v.optional(v.union(v.string(), v.null()))
        })
      )
    })
  },
  handler: async (ctx, args) => {
    return await ensureNoteRowInDb(ctx, args)
  }
})

export const patchNoteRowInternal = internalMutation({
  args: {
    noteId: v.string(),
    descriptionHtml: v.optional(v.string()),
    descriptionState: v.optional(v.string()),
    descriptionSchemaVersion: v.optional(v.number()),
    nonMemberViewsCount: v.optional(v.number()),
    projectId: v.optional(v.union(v.string(), v.null())),
    projectPermission: v.optional(v.union(v.literal('none'), v.literal('view'), v.literal('edit'))),
    contentUpdatedAt: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    return await patchNoteRowInDb(ctx, args.noteId, {
      ...(args.descriptionHtml !== undefined ? { descriptionHtml: args.descriptionHtml } : {}),
      ...(args.descriptionState !== undefined ? { descriptionState: args.descriptionState } : {}),
      ...(args.descriptionSchemaVersion !== undefined
        ? { descriptionSchemaVersion: args.descriptionSchemaVersion }
        : {}),
      ...(args.nonMemberViewsCount !== undefined ? { nonMemberViewsCount: args.nonMemberViewsCount } : {}),
      ...(args.projectId !== undefined ? { projectId: args.projectId ? (args.projectId as any) : undefined } : {}),
      ...(args.projectPermission !== undefined ? { projectPermission: args.projectPermission } : {}),
      ...(args.contentUpdatedAt !== undefined ? { contentUpdatedAt: args.contentUpdatedAt } : {})
    })
  }
})

export const createStorageFileInternal = internalMutation({
  args: {
    owner: v.string(),
    name: v.string(),
    storageId: v.id('_storage')
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('files', {
      ownerTokenIdentifier: args.owner,
      storageId: args.storageId,
      name: args.name,
      contentType: NOTE_RECORD_CONTENT_TYPE,
      createdAt: Date.now()
    })
  }
})

export const updateStorageFileInternal = internalMutation({
  args: {
    fileId: v.id('files'),
    storageId: v.id('_storage')
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.fileId, {
      storageId: args.storageId,
      contentType: NOTE_RECORD_CONTENT_TYPE
    })
  }
})

export const deleteStorageFileInternal = internalMutation({
  args: {
    fileId: v.id('files')
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.fileId)
  }
})

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

export const getOrganizationBySlugInternal = internalQuery({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('organizations')
      .withIndex('by_slug', (query) => query.eq('slug', args.slug))
    .unique()
  }
})

export const getProjectByIdInternal = internalQuery({
  args: {
    organizationId: v.id('organizations'),
    projectId: v.string()
  },
  handler: async (ctx, args) => {
    const projects = await ctx.db
      .query('projects')
      .withIndex('by_organization_id', (query) => query.eq('organizationId', args.organizationId))
      .collect()

    return projects.find((project: any) => project._id === args.projectId) ?? null
  }
})

export const getOrganizationMembersSnapshotInternal = internalQuery({
  args: {
    organizationId: v.id('organizations')
  },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_id', (query) => query.eq('organizationId', args.organizationId))
      .collect()

    const tokenIdentifiers = Array.from(new Set(memberships.map((membership: any) => membership.userTokenIdentifier)))
    const users = (
      await Promise.all(
        tokenIdentifiers.map((tokenIdentifier) =>
          ctx.db
            .query('users')
            .withIndex('by_token_identifier', (query) => query.eq('tokenIdentifier', tokenIdentifier))
            .unique()
        )
      )
    ).filter(Boolean)

    return { memberships, users }
  }
})

export const getNoteSnapshotInternal = internalQuery({
  args: {
    organizationId: v.id('organizations'),
    noteIds: v.array(v.string()),
    viewerTokenIdentifier: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const noteIdSet = new Set(args.noteIds)
    const posts = (
      await ctx.db
        .query('posts')
        .withIndex('by_organization_id', (query) => query.eq('organizationId', args.organizationId))
        .collect()
    ).filter((post: any) => noteIdSet.has(post._id))

    const comments = (
      await ctx.db
        .query('comments')
        .withIndex('by_organization_id', (query) => query.eq('organizationId', args.organizationId))
        .collect()
    ).filter((comment: any) => noteIdSet.has(comment.postId))

    const commentIdSet = new Set(comments.map((comment: any) => comment._id))
    const projectIds = Array.from(new Set(posts.map((post: any) => post.projectId).filter(Boolean)))
    const [projects, projectMemberships, followUps, reactions, favorites] = await Promise.all([
      ctx.db
        .query('projects')
        .withIndex('by_organization_id', (query) => query.eq('organizationId', args.organizationId))
        .collect(),
      ctx.db
        .query('projectMemberships')
        .withIndex('by_organization_id', (query) => query.eq('organizationId', args.organizationId))
        .collect(),
      ctx.db.query('followUps').collect(),
      ctx.db.query('reactions').collect(),
      args.viewerTokenIdentifier
        ? ctx.db
            .query('favorites')
            .withIndex('by_organization_and_user', (query) =>
              query.eq('organizationId', args.organizationId).eq('userTokenIdentifier', args.viewerTokenIdentifier!)
            )
            .collect()
        : Promise.resolve([])
    ])

    return {
      posts,
      comments,
      projects: projects.filter((project: any) => projectIds.includes(project._id)),
      projectMemberships: projectMemberships.filter((membership: any) => projectIds.includes(membership.projectId)),
      followUps: followUps.filter((followUp: any) => {
        if (String(followUp.organizationId) !== String(args.organizationId)) {
          return false
        }

        if (followUp.subjectType === 'Note') {
          return noteIdSet.has(followUp.subjectId)
        }

        if (followUp.subjectType === 'Comment') {
          return commentIdSet.has(followUp.subjectId)
        }

        return false
      }),
      reactions: reactions.filter((reaction: any) => {
        return (
          String(reaction.organizationId) === String(args.organizationId) &&
          reaction.subjectType === 'Comment' &&
          commentIdSet.has(reaction.subjectId)
        )
      }),
      favorites
    }
  }
})

export const createNoteContainerPostInternal = internalMutation({
  args: {
    slug: v.string(),
    title: v.optional(v.string()),
    description_html: v.optional(v.string()),
    project_id: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const state = await buildWorkspaceState(ctx)
    const membershipEntry = state.memberships.find((entry: any) => entry.organization?.slug === args.slug)

    if (!membershipEntry?.organization || membershipEntry.membership?.discardedAt) {
      throw createError('not_found', 'Organization not found')
    }

    const now = Date.now()
    const noteId = await ctx.db.insert('posts', {
      organizationId: membershipEntry.organization._id,
      authorTokenIdentifier: state.identity.tokenIdentifier,
      title: args.title ?? '',
      descriptionHtml: args.description_html ?? '<p></p>',
      unfurledLink: NOTE_MARKER,
      status: 'none',
      visibility: 'default',
      projectId: args.project_id || undefined,
      draft: true,
      links: [],
      attachments: [],
      version: 1,
      createdAt: now,
      updatedAt: now,
      lastActivityAt: now
    })

    return {
      noteId,
      organization: membershipEntry.organization,
      viewerMembership: membershipEntry.membership,
      viewerTokenIdentifier: state.identity.tokenIdentifier
    }
  }
})

export const updateNoteContainerPostInternal = internalMutation({
  args: {
    slug: v.string(),
    noteId: v.string(),
    title: v.optional(v.string()),
    description_html: v.optional(v.string()),
    project_id: v.optional(v.union(v.string(), v.null())),
    visibility: v.optional(v.union(v.literal('default'), v.literal('public')))
  },
  handler: async (ctx, args) => {
    const state = await buildWorkspaceState(ctx)
    const membershipEntry = state.memberships.find((entry: any) => entry.organization?.slug === args.slug)

    if (!membershipEntry?.organization) {
      throw createError('not_found', 'Organization not found')
    }

    const post = (
      await ctx.db
        .query('posts')
        .withIndex('by_organization_id', (query) => query.eq('organizationId', membershipEntry.organization._id))
        .collect()
    ).find((entry: any) => entry._id === args.noteId)

    if (!post) {
      throw createError('not_found', 'Note not found')
    }

    const now = Date.now()

    await ctx.db.patch(post._id, {
      ...(args.title !== undefined ? { title: args.title } : {}),
      ...(args.description_html !== undefined ? { descriptionHtml: args.description_html } : {}),
      ...(args.project_id !== undefined ? { projectId: args.project_id || undefined } : {}),
      ...(args.visibility !== undefined ? { visibility: args.visibility } : {}),
      updatedAt: now,
      lastActivityAt: now
    })

    const noteRow = await queryNoteRowByPublicId(ctx, args.noteId)

    if (noteRow) {
      await ctx.db.patch(noteRow._id, {
        ...(args.title !== undefined ? { title: args.title || undefined } : {}),
        ...(args.description_html !== undefined ? { descriptionHtml: args.description_html } : {}),
        ...(args.project_id !== undefined ? { projectId: args.project_id ? (args.project_id as any) : undefined } : {}),
        ...(args.visibility !== undefined ? { visibility: args.visibility } : {}),
        contentUpdatedAt: args.description_html !== undefined ? now : noteRow.contentUpdatedAt,
        lastActivityAt: now,
        updatedAt: now
      })
    }
  }
})

export const appendNoteAttachmentInternal = internalMutation({
  args: {
    slug: v.string(),
    noteId: v.string(),
    attachment: v.object({
      duration: v.optional(v.number()),
      file_path: v.string(),
      file_type: v.string(),
      gallery_id: v.optional(v.union(v.string(), v.null())),
      height: v.optional(v.number()),
      name: v.optional(v.union(v.string(), v.null())),
      no_video_track: v.optional(v.boolean()),
      position: v.number(),
      preview_file_path: v.optional(v.union(v.string(), v.null())),
      size: v.optional(v.union(v.number(), v.null())),
      width: v.optional(v.number())
    })
  },
  handler: async (ctx, args) => {
    const state = await buildWorkspaceState(ctx)
    const membershipEntry = state.memberships.find((entry: any) => entry.organization?.slug === args.slug)

    if (!membershipEntry?.organization) {
      throw createError('not_found', 'Organization not found')
    }

    const post = (
      await ctx.db
        .query('posts')
        .withIndex('by_organization_id', (query) => query.eq('organizationId', membershipEntry.organization._id))
        .collect()
    ).find((entry: any) => entry._id === args.noteId)

    if (!post) {
      throw createError('not_found', 'Note not found')
    }

    const newAttachmentId = `note-attachment-${Date.now()}-${args.attachment.position}`
    const newAttachment = {
      id: newAttachmentId,
      filePath: args.attachment.file_path,
      fileType: args.attachment.file_type,
      previewFilePath: args.attachment.preview_file_path ?? undefined,
      name: args.attachment.name ?? undefined,
      size: args.attachment.size ?? undefined,
      width: args.attachment.width,
      height: args.attachment.height,
      duration: args.attachment.duration
    }
    const attachments = [...post.attachments]
    attachments.splice(args.attachment.position, 0, newAttachment)

    await ctx.db.patch(post._id, {
      attachments,
      updatedAt: Date.now(),
      lastActivityAt: Date.now()
    })

    await createSubjectAttachment(ctx, {
      organizationId: membershipEntry.organization._id,
      subjectType: 'Note',
      subjectId: args.noteId,
      publicId: newAttachmentId,
      filePath: args.attachment.file_path,
      fileType: args.attachment.file_type,
      previewFilePath: args.attachment.preview_file_path ?? null,
      name: args.attachment.name ?? null,
      size: args.attachment.size ?? null,
      width: args.attachment.width,
      height: args.attachment.height,
      duration: args.attachment.duration,
      galleryId: args.attachment.gallery_id ?? null,
      noVideoTrack: args.attachment.no_video_track,
      position: args.attachment.position
    })

    return newAttachment
  }
})

export const createNoteCommentInternal = internalMutation({
  args: {
    slug: v.string(),
    noteId: v.string(),
    attachment_ids: v.optional(v.array(v.string())),
    attachments: v.optional(
      v.array(
        v.object({
          duration: v.optional(v.number()),
          file_path: v.string(),
          file_type: v.string(),
          height: v.optional(v.number()),
          name: v.optional(v.union(v.string(), v.null())),
          preview_file_path: v.optional(v.union(v.string(), v.null())),
          size: v.optional(v.union(v.number(), v.null())),
          width: v.optional(v.number())
        })
      )
    ),
    body_html: v.optional(v.union(v.string(), v.null())),
    file_id: v.optional(v.union(v.string(), v.null())),
    note_highlight: v.optional(v.union(v.string(), v.null())),
    parent_comment_id: v.optional(v.union(v.string(), v.null())),
    timestamp: v.optional(v.union(v.number(), v.null())),
    x: v.optional(v.union(v.number(), v.null())),
    y: v.optional(v.union(v.number(), v.null()))
  },
  handler: async (ctx, args) => {
    const state = await buildWorkspaceState(ctx)
    const membershipEntry = state.memberships.find((entry: any) => entry.organization?.slug === args.slug)

    if (!membershipEntry?.organization) {
      throw createError('not_found', 'Organization not found')
    }

    const post = (
      await ctx.db
        .query('posts')
        .withIndex('by_organization_id', (query) => query.eq('organizationId', membershipEntry.organization._id))
        .collect()
    ).find((entry: any) => entry._id === args.noteId)

    if (!post) {
      throw createError('not_found', 'Note not found')
    }

    const parentComment: any = args.parent_comment_id
      ? await ctx.db.get(args.parent_comment_id as any)
      : null

    if (parentComment && parentComment.postId !== post._id) {
      throw createError('unprocessable', 'Reply target does not belong to this note')
    }

    const now = Date.now()
    const commentId = await ctx.db.insert('comments', {
      organizationId: membershipEntry.organization._id,
      postId: post._id,
      authorTokenIdentifier: state.identity.tokenIdentifier,
      bodyHtml: args.body_html || '<p></p>',
      parentCommentId: parentComment?._id,
      attachmentId: args.file_id || args.attachment_ids?.[0] || undefined,
      timestamp: args.timestamp ?? undefined,
      x: args.x ?? undefined,
      y: args.y ?? undefined,
      noteHighlight: args.note_highlight ?? undefined,
      attachments: (args.attachments ?? []).map((attachment: any, index: number) => ({
        id: `note-comment-attachment-${now}-${index}`,
        filePath: attachment.file_path,
        fileType: attachment.file_type,
        previewFilePath: attachment.preview_file_path ?? undefined,
        name: attachment.name ?? undefined,
        size: attachment.size ?? undefined,
        width: attachment.width,
        height: attachment.height,
        duration: attachment.duration
      })),
      createdAt: now,
      updatedAt: now
    })

    await ctx.db.patch(post._id, {
      lastActivityAt: now
    })

    await ensureNoteSubscription(ctx, membershipEntry.organization._id, state.identity.tokenIdentifier, post._id)

    const targetTitle = post.title || stripHtml(post.descriptionHtml) || 'Note'
    const bodyPreview = stripHtml(args.body_html) || 'Comment'
    const noteSubscriptions = await listNoteSubscriptions(ctx, post._id)

    await createNotificationRecord(ctx, {
      organizationId: membershipEntry.organization._id,
      recipientTokenIdentifier: post.authorTokenIdentifier,
      actorTokenIdentifier: state.identity.tokenIdentifier,
      reason: 'author',
      inboxKey: `note:${post._id}:comment:${commentId}`,
      subjectType: 'Comment',
      subjectId: commentId,
      targetType: 'Note',
      targetId: post._id,
      targetTitle,
      targetProjectId: post.projectId,
      bodyPreviewPrefix: parentComment ? 'Replied to' : 'Commented on',
      bodyPreview,
      replyToBodyPreview: parentComment ? stripHtml(parentComment.bodyHtml) : undefined
    })

    if (parentComment && parentComment.authorTokenIdentifier !== post.authorTokenIdentifier) {
      await createNotificationRecord(ctx, {
        organizationId: membershipEntry.organization._id,
        recipientTokenIdentifier: parentComment.authorTokenIdentifier,
        actorTokenIdentifier: state.identity.tokenIdentifier,
        reason: 'author',
        inboxKey: `note-comment:${parentComment._id}:reply:${commentId}`,
        subjectType: 'Comment',
        subjectId: commentId,
        targetType: 'Note',
        targetId: post._id,
        targetTitle,
        targetProjectId: post.projectId,
        subtargetType: 'Comment',
        subtargetId: parentComment._id,
        bodyPreviewPrefix: 'Replied to',
        bodyPreview,
        replyToBodyPreview: stripHtml(parentComment.bodyHtml)
      })
    }

    for (const subscription of noteSubscriptions) {
      if (
        subscription.userTokenIdentifier === state.identity.tokenIdentifier ||
        subscription.userTokenIdentifier === post.authorTokenIdentifier ||
        subscription.userTokenIdentifier === parentComment?.authorTokenIdentifier
      ) {
        continue
      }

      await createNotificationRecord(ctx, {
        organizationId: membershipEntry.organization._id,
        recipientTokenIdentifier: subscription.userTokenIdentifier,
        actorTokenIdentifier: state.identity.tokenIdentifier,
        reason: 'parent_subscription',
        inboxKey: `note:${post._id}:comment:${commentId}:subscriber`,
        subjectType: 'Comment',
        subjectId: commentId,
        targetType: 'Note',
        targetId: post._id,
        targetTitle,
        targetProjectId: post.projectId,
        subtargetType: parentComment ? 'Comment' : undefined,
        subtargetId: parentComment?._id,
        bodyPreviewPrefix: parentComment ? 'Replied to' : 'Commented on',
        bodyPreview,
        replyToBodyPreview: parentComment ? stripHtml(parentComment.bodyHtml) : undefined
      })
    }

    return commentId
  }
})

export const deleteNoteContainerPostInternal = internalMutation({
  args: {
    slug: v.string(),
    noteId: v.string()
  },
  handler: async (ctx, args) => {
    const state = await buildWorkspaceState(ctx)
    const membershipEntry = state.memberships.find((entry: any) => entry.organization?.slug === args.slug)

    if (!membershipEntry?.organization) {
      throw createError('not_found', 'Organization not found')
    }

    const post = (
      await ctx.db
        .query('posts')
        .withIndex('by_organization_id', (query) => query.eq('organizationId', membershipEntry.organization._id))
        .collect()
    ).find((entry: any) => entry._id === args.noteId)

    if (!post) {
      throw createError('not_found', 'Note not found')
    }

    const comments = await ctx.db
      .query('comments')
      .withIndex('by_post_id', (query) => query.eq('postId', post._id))
      .collect()

    const commentIds = comments.map((comment: any) => comment._id)

    for (const comment of comments) {
      const commentFollowUps = await ctx.db
        .query('followUps')
        .withIndex('by_subject', (query) => query.eq('subjectType', 'Comment').eq('subjectId', comment._id))
        .collect()
      const commentReactions = await ctx.db
        .query('reactions')
        .withIndex('by_subject', (query) => query.eq('subjectType', 'Comment').eq('subjectId', comment._id))
        .collect()

      for (const followUp of commentFollowUps) {
        await ctx.db.delete(followUp._id)
      }

      for (const reaction of commentReactions) {
        await ctx.db.delete(reaction._id)
      }

      await ctx.db.delete(comment._id)
    }

    const noteFollowUps = await ctx.db
      .query('followUps')
      .withIndex('by_subject', (query) => query.eq('subjectType', 'Note').eq('subjectId', post._id))
      .collect()
    const noteFavorites = await ctx.db
      .query('favorites')
      .withIndex('by_favoritable', (query) => query.eq('favoritableType', 'Note').eq('favoritableId', post._id))
      .collect()

    for (const followUp of noteFollowUps) {
      await ctx.db.delete(followUp._id)
    }

    for (const favorite of noteFavorites) {
      await ctx.db.delete(favorite._id)
    }

    await ctx.db.delete(post._id)

    return { commentIds }
  }
})

export const getLegacyNotesPage = action({
  args: {
    slug: v.string(),
    after: v.optional(v.string()),
    limit: v.optional(v.number()),
    q: v.optional(v.string()),
    order: v.optional(
      v.object({
        by: v.union(v.literal('created_at'), v.literal('last_activity_at')),
        direction: v.union(v.literal('asc'), v.literal('desc'))
      })
    )
  },
  handler: async (ctx, args) => {
    const context = await getAuthorizedContext(ctx, args.slug)
    const files = await getStoredNoteFiles(ctx, context.organization._id)
    const records = (
      await Promise.all(
        files.map(async (file: any) => ({
          file,
          record: normalizeStoredNoteRecord(await blobToJson(await ctx.storage.get(file.storageId)), file.name)
        }))
      )
    ).map((entry) => entry.record)

    let notes = await buildNotes(ctx, {
      organization: context.organization,
      records,
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.viewerTokenIdentifier
    })

    const query = args.q?.trim().toLowerCase()

    if (query) {
      notes = notes.filter((note: any) => {
        const haystack = `${note.title} ${stripHtml(note.description_html)}`.toLowerCase()
        return haystack.includes(query)
      })
    }

    const order = args.order ?? { by: 'last_activity_at' as const, direction: 'desc' as const }

    notes = [...notes].sort((left: any, right: any) => {
      const leftValue = new Date(order.by === 'created_at' ? left.created_at : left.last_activity_at).getTime()
      const rightValue = new Date(order.by === 'created_at' ? right.created_at : right.last_activity_at).getTime()
      return order.direction === 'asc' ? leftValue - rightValue : rightValue - leftValue
    })

    return {
      data: notes.slice(0, Math.max(1, Math.min(args.limit ?? 20, 100))),
      next_cursor: null,
      prev_cursor: null
    }
  }
})

export const getLegacyNoteById = action({
  args: {
    slug: v.string(),
    noteId: v.string()
  },
  handler: async (ctx, args) => {
    const { note } = await getAccessibleNote(ctx, args.slug, args.noteId)
    return note
  }
})

export const createLegacyNote = action({
  args: {
    slug: v.string(),
    title: v.optional(v.string()),
    description_html: v.optional(v.string()),
    project_id: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const created = await ctx.runMutation(internal.notes.createNoteContainerPostInternal, args)

    const record = await upsertStoredNoteRecord(ctx, created.organization._id, created.noteId, () => ({
      ...defaultStoredNoteRecord(created.noteId),
      projectPermission: args.project_id ? 'view' : 'none'
    }))
    await ensureNoteRow(ctx, {
      organizationId: created.organization._id,
      noteId: created.noteId,
      post: {
        _id: created.noteId,
        authorTokenIdentifier: created.viewerTokenIdentifier,
        title: args.title ?? '',
        descriptionHtml: args.description_html ?? '<p></p>',
        visibility: 'default',
        projectId: args.project_id ?? undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastActivityAt: Date.now()
      },
      record
    })

    const notes = await buildNotes(ctx, {
      organization: created.organization,
      records: [record],
      viewerMembership: created.viewerMembership,
      viewerTokenIdentifier: created.viewerTokenIdentifier
    })

    const note = notes[0]

    if (!note) {
      throw createError('unprocessable', 'Note could not be created')
    }

    return note
  }
})

export const updateLegacyNote = action({
  args: {
    slug: v.string(),
    noteId: v.string(),
    title: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { context, note } = await getAccessibleNote(ctx, args.slug, args.noteId)

    if (!note.viewer_can_edit) {
      throw createError('forbidden', 'Not allowed to edit this note')
    }

    await ctx.runMutation(internal.notes.updateNoteContainerPostInternal, {
      slug: args.slug,
      noteId: args.noteId,
      title: args.title
    })

    await upsertStoredNoteRecord(ctx, context.organization._id, args.noteId, (current) => {
      if (args.title === undefined || args.title === note.title) {
        return current
      }

      return appendTimelineEvent(current, {
        id: createRecordId('note_title'),
        action: 'subject_title_updated',
        createdAt: Date.now(),
        memberActorTokenIdentifier: context.viewerTokenIdentifier,
        subjectUpdatedFromTitle: note.title,
        subjectUpdatedToTitle: args.title
      })
    })

    return (await getAccessibleNote(ctx, args.slug, args.noteId)).note
  }
})

export const deleteLegacyNote = action({
  args: {
    slug: v.string(),
    noteId: v.string()
  },
  handler: async (ctx, args) => {
    const { note, context } = await getAccessibleNote(ctx, args.slug, args.noteId)

    if (!note.viewer_can_delete) {
      throw createError('forbidden', 'Not allowed to delete this note')
    }

    await ctx.runMutation(internal.pinsBookmarks.discardPinsForSubjectInternal, {
      organizationId: context.organization._id,
      subjectType: 'Note',
      subjectId: args.noteId,
      deleteTimelineEvents: true
    })
    await ctx.runMutation(internal.notes.deleteNoteContainerPostInternal, args)
    await deleteStoredNoteRecord(ctx, context.organization._id, args.noteId)

    return {}
  }
})

export const getLegacyNoteCommentsPage = action({
  args: {
    slug: v.string(),
    noteId: v.string(),
    after: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const bundle = await getNoteCommentsBundle(ctx, args.slug, args.noteId)
    const topLevel = bundle.comments
      .filter((comment: any) => !comment.parentCommentId)
      .sort((left: any, right: any) => right.createdAt - left.createdAt)
      .slice(0, Math.max(1, Math.min(args.limit ?? 200, 200)))

    return {
      data: (await Promise.all(topLevel.map(bundle.buildCommentTree))).filter(Boolean),
      next_cursor: null,
      prev_cursor: null,
      total_count: bundle.comments.length
    }
  }
})

export const createLegacyNoteComment = action({
  args: {
    slug: v.string(),
    noteId: v.string(),
    attachment_ids: v.optional(v.array(v.string())),
    attachments: v.optional(
      v.array(
        v.object({
          duration: v.optional(v.number()),
          file_path: v.string(),
          file_type: v.string(),
          height: v.optional(v.number()),
          name: v.optional(v.union(v.string(), v.null())),
          preview_file_path: v.optional(v.union(v.string(), v.null())),
          size: v.optional(v.union(v.number(), v.null())),
          width: v.optional(v.number())
        })
      )
    ),
    body_html: v.optional(v.union(v.string(), v.null())),
    file_id: v.optional(v.union(v.string(), v.null())),
    note_highlight: v.optional(v.union(v.string(), v.null())),
    parent_comment_id: v.optional(v.union(v.string(), v.null())),
    timestamp: v.optional(v.union(v.number(), v.null())),
    x: v.optional(v.union(v.number(), v.null())),
    y: v.optional(v.union(v.number(), v.null()))
  },
  handler: async (ctx, args) => {
    const { note } = await getAccessibleNote(ctx, args.slug, args.noteId)

    if (!note.viewer_can_comment) {
      throw createError('forbidden', 'Not allowed to comment on this note')
    }

    const commentId: string = await ctx.runMutation(internal.notes.createNoteCommentInternal, args)
    const bundle = await getNoteCommentsBundle(ctx, args.slug, args.noteId)
    const created: any = bundle.comments.find((comment: any) => comment._id === commentId)

    if (!created) {
      throw createError('unprocessable', 'Comment could not be created')
    }

    const newComment = await bundle.buildCommentTree(created)
    const noteAttachment = created.attachmentId ? bundle.noteAttachmentsById.get(created.attachmentId) : null
    const attachment: any =
      created.attachmentId && noteAttachment
        ? buildLegacyAttachment(noteAttachment, {
            subjectType: 'Note',
            subjectId: args.noteId,
            isSubjectComment: false,
            commentsCount: bundle.comments.filter((comment: any) => comment.attachmentId === created.attachmentId).length
          })
        : null

    return {
      preview_commenters: {
        latest_commenters: buildLatestCommenters(
          bundle.comments,
          bundle.usersByTokenIdentifier,
          bundle.membershipsByTokenIdentifier
        )
      },
      post_comment: newComment,
      attachment,
      attachment_commenters:
        created.attachmentId && newComment?.member
          ? [newComment.member]
          : null
    }
  }
})

export const getLegacyNoteAttachmentCommentsPage = action({
  args: {
    slug: v.string(),
    noteId: v.string(),
    attachmentId: v.string(),
    after: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const bundle = await getNoteCommentsBundle(ctx, args.slug, args.noteId)
    const comments = bundle.comments
      .filter((comment: any) => comment.attachmentId === args.attachmentId)
      .sort((left: any, right: any) => right.createdAt - left.createdAt)
      .slice(0, Math.max(1, Math.min(args.limit ?? 200, 200)))

    return {
      data: (await Promise.all(comments.map(bundle.buildCommentTree))).filter(Boolean),
      next_cursor: null,
      prev_cursor: null,
      total_count: bundle.comments.filter((comment: any) => comment.attachmentId === args.attachmentId).length
    }
  }
})

export const createLegacyNoteAttachment = action({
  args: {
    slug: v.string(),
    noteId: v.string(),
    duration: v.optional(v.number()),
    file_path: v.string(),
    file_type: v.string(),
    gallery_id: v.optional(v.union(v.string(), v.null())),
    height: v.optional(v.number()),
    name: v.optional(v.union(v.string(), v.null())),
    no_video_track: v.optional(v.boolean()),
    position: v.number(),
    preview_file_path: v.optional(v.union(v.string(), v.null())),
    size: v.optional(v.union(v.number(), v.null())),
    width: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const { note } = await getAccessibleNote(ctx, args.slug, args.noteId)

    if (!note.viewer_can_edit) {
      throw createError('forbidden', 'Not allowed to edit this note')
    }

    const attachment: any = await ctx.runMutation(internal.notes.appendNoteAttachmentInternal, {
      slug: args.slug,
      noteId: args.noteId,
      attachment: args
    })

    return buildLegacyAttachment(attachment, {
      subjectType: 'Note',
      subjectId: args.noteId,
      isSubjectComment: false
    })
  }
})

export const getLegacyNotePermissions = action({
  args: {
    slug: v.string(),
    noteId: v.string()
  },
  handler: async (ctx, args) => {
    const { context, note, record } = await getAccessibleNote(ctx, args.slug, args.noteId)

    if (!note.viewer_can_comment && !note.viewer_can_edit) {
      throw createError('forbidden', 'Not allowed to view note permissions')
    }

    const membersSnapshot = await getOrganizationMembersSnapshot(ctx, context.organization._id)
    const { usersByTokenIdentifier } = buildMemberMaps(membersSnapshot.users, membersSnapshot.memberships)

    const permissions = await getStoredNotePermissionRows(ctx, args.noteId)
    return buildPermissionList(permissions.length > 0 ? permissions : record.permittedUsers, usersByTokenIdentifier)
  }
})

export const createLegacyNotePermissions = action({
  args: {
    slug: v.string(),
    noteId: v.string(),
    member_ids: v.array(v.string()),
    permission: v.union(v.literal('view'), v.literal('edit'))
  },
  handler: async (ctx, args) => {
    const { context, note } = await getAccessibleNote(ctx, args.slug, args.noteId)

    if (!note.viewer_can_edit) {
      throw createError('forbidden', 'Not allowed to edit note permissions')
    }

    const membersSnapshot = await getOrganizationMembersSnapshot(ctx, context.organization._id)
    const membershipsById = new Map(membersSnapshot.memberships.map((membership: any) => [membership._id, membership]))
    const { usersByTokenIdentifier } = buildMemberMaps(membersSnapshot.users, membersSnapshot.memberships)
    const newPermissions = args.member_ids
      .map((memberId) => membershipsById.get(memberId))
      .filter(Boolean)
      .map((membership: any) => ({
        id: createRecordId('note_permission'),
        userTokenIdentifier: membership.userTokenIdentifier,
        action: args.permission
      }))

    await upsertStoredNoteRecord(ctx, context.organization._id, args.noteId, (current) => ({
      ...current,
      permittedUsers: [
        ...current.permittedUsers.filter(
          (permission) => !newPermissions.some((entry) => entry.userTokenIdentifier === permission.userTokenIdentifier)
        ),
        ...newPermissions
      ]
    }))

    for (const permission of newPermissions) {
      await upsertSubjectPermission(ctx, {
        publicId: permission.id,
        subjectType: 'Note',
        subjectId: args.noteId,
        userTokenIdentifier: permission.userTokenIdentifier,
        permission: permission.action
      })
    }

    return buildPermissionList(
      newPermissions,
      usersByTokenIdentifier
    )
  }
})

export const updateLegacyNotePermission = action({
  args: {
    slug: v.string(),
    noteId: v.string(),
    permissionId: v.string(),
    permission: v.union(v.literal('view'), v.literal('edit'))
  },
  handler: async (ctx, args) => {
    const { context, note } = await getAccessibleNote(ctx, args.slug, args.noteId)

    if (!note.viewer_can_edit) {
      throw createError('forbidden', 'Not allowed to edit note permissions')
    }

    const record = await upsertStoredNoteRecord(ctx, context.organization._id, args.noteId, (current) => ({
      ...current,
      permittedUsers: current.permittedUsers.map((permission) =>
        permission.id === args.permissionId ? { ...permission, action: args.permission } : permission
      )
    }))
    const membersSnapshot = await getOrganizationMembersSnapshot(ctx, context.organization._id)
    const { usersByTokenIdentifier } = buildMemberMaps(membersSnapshot.users, membersSnapshot.memberships)
    const permission = record.permittedUsers.find((entry) => entry.id === args.permissionId)

    if (!permission) {
      throw createError('not_found', 'Permission not found')
    }

    await upsertSubjectPermission(ctx, {
      publicId: args.permissionId,
      subjectType: 'Note',
      subjectId: args.noteId,
      userTokenIdentifier: permission.userTokenIdentifier,
      permission: args.permission
    })

    return buildPermissionList([permission], usersByTokenIdentifier)[0]
  }
})

export const deleteLegacyNotePermission = action({
  args: {
    slug: v.string(),
    noteId: v.string(),
    permissionId: v.string()
  },
  handler: async (ctx, args) => {
    const { context, note } = await getAccessibleNote(ctx, args.slug, args.noteId)

    if (!note.viewer_can_edit) {
      throw createError('forbidden', 'Not allowed to edit note permissions')
    }

    await upsertStoredNoteRecord(ctx, context.organization._id, args.noteId, (current) => ({
      ...current,
      permittedUsers: current.permittedUsers.filter((permission) => permission.id !== args.permissionId)
    }))
    await deleteSubjectPermissionByPublicId(ctx, args.permissionId)

    return {}
  }
})

export const updateLegacyNoteProjectPermission = action({
  args: {
    slug: v.string(),
    noteId: v.string(),
    project_id: v.string(),
    permission: v.union(v.literal('view'), v.literal('edit'))
  },
  handler: async (ctx, args) => {
    const { context, note } = await getAccessibleNote(ctx, args.slug, args.noteId)

    if (!note.viewer_can_edit) {
      throw createError('forbidden', 'Not allowed to edit this note')
    }

    const previousProject = note.project
    const nextProject = await ctx.runQuery(internal.notes.getProjectByIdInternal, {
      organizationId: context.organization._id,
      projectId: args.project_id
    })
    await ctx.runMutation(internal.notes.updateNoteContainerPostInternal, {
      slug: args.slug,
      noteId: args.noteId,
      project_id: args.project_id
    })
    await upsertStoredNoteRecord(ctx, context.organization._id, args.noteId, (current) =>
      appendTimelineEvent(
        {
          ...current,
          projectPermission: args.permission,
          projectPinId: null
        },
        {
          id: createRecordId('note_project'),
          action: 'subject_project_updated',
          createdAt: Date.now(),
          memberActorTokenIdentifier: context.viewerTokenIdentifier,
          subjectUpdatedFromProjectId: previousProject?.id ?? null,
          subjectUpdatedFromProjectName: previousProject?.name ?? null,
          subjectUpdatedFromProjectPrivate: previousProject?.private ?? null,
          subjectUpdatedToProjectId: args.project_id,
          subjectUpdatedToProjectName: nextProject?.name ?? null,
          subjectUpdatedToProjectPrivate: nextProject?.private ?? null
        }
      )
    )
    await patchNoteRow(ctx, args.noteId, {
      projectId: args.project_id ? (args.project_id as any) : undefined,
      projectPermission: args.permission
    })

    if (note.project_pin_id && previousProject?.id !== args.project_id) {
      await ctx.runMutation(internal.pinsBookmarks.discardPinsForSubjectInternal, {
        organizationId: context.organization._id,
        subjectType: 'Note',
        subjectId: args.noteId,
        actorMembershipId: context.viewerMembership._id,
        actorTokenIdentifier: context.viewerTokenIdentifier,
        recordTimelineEvent: true
      })
    }

    return (await getAccessibleNote(ctx, args.slug, args.noteId)).note
  }
})

export const deleteLegacyNoteProjectPermission = action({
  args: {
    slug: v.string(),
    noteId: v.string()
  },
  handler: async (ctx, args) => {
    const { context, note } = await getAccessibleNote(ctx, args.slug, args.noteId)

    if (!note.viewer_can_edit) {
      throw createError('forbidden', 'Not allowed to edit this note')
    }

    await ctx.runMutation(internal.notes.updateNoteContainerPostInternal, {
      slug: args.slug,
      noteId: args.noteId,
      project_id: null
    })
    await upsertStoredNoteRecord(ctx, context.organization._id, args.noteId, (current) => ({
      ...current,
      projectPermission: 'none',
      projectPinId: null
    }))
    await patchNoteRow(ctx, args.noteId, {
      projectId: null,
      projectPermission: 'none'
    })

    if (note.project_pin_id) {
      await ctx.runMutation(internal.pinsBookmarks.discardPinsForSubjectInternal, {
        organizationId: context.organization._id,
        subjectType: 'Note',
        subjectId: args.noteId,
        actorMembershipId: context.viewerMembership._id,
        actorTokenIdentifier: context.viewerTokenIdentifier,
        recordTimelineEvent: true
      })
    }

    return {}
  }
})

export const getLegacyPublicNote = action({
  args: {
    slug: v.string(),
    noteId: v.string()
  },
  handler: async (ctx, args) => {
    const organization: any = await ctx.runQuery(internal.notes.getOrganizationBySlugInternal, {
      slug: args.slug
    })

    if (!organization) {
      throw createError('not_found', 'Organization not found')
    }

    const stored = await getStoredNoteRecord(ctx, organization._id, args.noteId)

    if (!stored) {
      throw createError('not_found', 'Note not found')
    }

    const snapshot = await getNoteSnapshot(ctx, {
      organizationId: organization._id,
      noteIds: [args.noteId]
    })
    const post = snapshot.posts.find((entry: any) => entry._id === args.noteId)

    if (!post || post.visibility !== 'public') {
      throw createError('not_found', 'Note not found')
    }

    const membersSnapshot = await getOrganizationMembersSnapshot(ctx, organization._id)
    const { usersByTokenIdentifier, membershipsByTokenIdentifier } = buildMemberMaps(
      membersSnapshot.users,
      membersSnapshot.memberships
    )
    const member = buildLegacyMemberFromMaps(usersByTokenIdentifier, membershipsByTokenIdentifier, post.authorTokenIdentifier)

    if (!member) {
      throw createError('not_found', 'Note author not found')
    }

    return {
      id: post._id,
      title: post.title,
      description_html: post.descriptionHtml || '<p></p>',
      created_at: new Date(post.createdAt).toISOString(),
      url: buildPublicNotePath(organization.slug, post._id, post.title),
      og_user_avatar: '',
      og_org_avatar: '',
      member: {
        user: {
          id: member.user.id,
          avatar_urls: member.user.avatar_urls,
          display_name: member.user.display_name,
          username: member.user.username
        }
      },
      organization: buildPublicOrganization(organization)
    }
  }
})

export const getLegacyNoteSyncState = action({
  args: {
    slug: v.string(),
    noteId: v.string()
  },
  handler: async (ctx, args) => {
    const { note, record } = await getAccessibleNote(ctx, args.slug, args.noteId)
    const noteRow = await getNoteRowByPublicId(ctx, args.noteId)
    const mergedRecord = mergeStoredNoteRecordWithRow(record, noteRow)

    return {
      id: note.id,
      description_schema_version: mergedRecord.descriptionSchemaVersion,
      description_state: mergedRecord.descriptionState,
      description_html: note.description_html
    }
  }
})

export const createLegacyNoteSyncGrant = mutation({
  args: {
    slug: v.string(),
    noteId: v.string(),
    resourceType: v.literal('Note')
  },
  handler: async (ctx, args) => {
    const { context } = await getAccessibleNote(ctx, args.slug, args.noteId)
    const now = Date.now()
    const expiresAt = now + SYNC_GRANT_TTL_MS
    const grantId = `sync_${generateToken()}`

    await ctx.db.insert('syncGrants', {
      organizationId: context.organization._id,
      publicId: grantId,
      noteId: args.noteId,
      resourceType: args.resourceType,
      userTokenIdentifier: context.viewerTokenIdentifier,
      expiresAt,
      createdAt: now
    })

    return { grantId, expiresAt }
  }
})

export const getLegacyNoteSyncStateByGrant = action({
  args: {
    grantId: v.string(),
    slug: v.string(),
    noteId: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getAuthorizedContextForSyncGrant(ctx, args)
    const { note, record } = await getAccessibleNoteForContext(ctx, context, args.noteId)
    const noteRow = await getNoteRowByPublicId(ctx, args.noteId)
    const mergedRecord = mergeStoredNoteRecordWithRow(record, noteRow)

    return {
      id: note.id,
      description_schema_version: mergedRecord.descriptionSchemaVersion,
      description_state: mergedRecord.descriptionState,
      description_html: note.description_html
    }
  }
})

export const updateLegacyNoteSyncState = action({
  args: {
    slug: v.string(),
    noteId: v.string(),
    description_html: v.string(),
    description_schema_version: v.number(),
    description_state: v.string()
  },
  handler: async (ctx, args) => {
    const { context, note, record } = await getAccessibleNote(ctx, args.slug, args.noteId)

    if (!note.viewer_can_edit) {
      throw createError('forbidden', 'Not allowed to edit this note')
    }

    if (args.description_schema_version < record.descriptionSchemaVersion) {
      throw createError('unprocessable', 'description_schema_version cannot be older than the stored document')
    }

    await ctx.runMutation(internal.notes.updateNoteContainerPostInternal, {
      slug: args.slug,
      noteId: args.noteId,
      description_html: args.description_html
    })
    await upsertStoredNoteRecord(ctx, context.organization._id, args.noteId, (current) => ({
      ...current,
      descriptionState: args.description_state,
      descriptionSchemaVersion: args.description_schema_version
    }))
    await patchNoteRow(ctx, args.noteId, {
      descriptionHtml: args.description_html,
      descriptionState: args.description_state,
      descriptionSchemaVersion: args.description_schema_version,
      contentUpdatedAt: Date.now()
    })

    return {}
  }
})

export const updateLegacyNoteSyncStateByGrant = action({
  args: {
    grantId: v.string(),
    slug: v.string(),
    noteId: v.string(),
    description_html: v.string(),
    description_schema_version: v.number(),
    description_state: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getAuthorizedContextForSyncGrant(ctx, args)
    const { note, record } = await getAccessibleNoteForContext(ctx, context, args.noteId)

    if (!note.viewer_can_edit) {
      throw createError('forbidden', 'Not allowed to edit this note')
    }

    if (args.description_schema_version < record.descriptionSchemaVersion) {
      throw createError('unprocessable', 'description_schema_version cannot be older than the stored document')
    }

    await ctx.runMutation(internal.notes.updateNoteContainerPostInternal, {
      slug: args.slug,
      noteId: args.noteId,
      description_html: args.description_html
    })
    await upsertStoredNoteRecord(ctx, context.organization._id, args.noteId, (current) => ({
      ...current,
      descriptionState: args.description_state,
      descriptionSchemaVersion: args.description_schema_version
    }))
    await patchNoteRow(ctx, args.noteId, {
      descriptionHtml: args.description_html,
      descriptionState: args.description_state,
      descriptionSchemaVersion: args.description_schema_version,
      contentUpdatedAt: Date.now()
    })

    return {}
  }
})

export const promoteLegacyNotesCompat = mutation({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const context = await getAuthorizedContext(ctx, args.slug)
    const files = await getStoredNoteFiles(ctx, context.organization._id)

    if (files.length === 0) {
      return {
        promoted: 0,
        total: 0
      }
    }

    const noteIds = files.map((file) => file.name)
    const snapshot = await getNoteSnapshot(ctx, {
      organizationId: context.organization._id,
      noteIds,
      viewerTokenIdentifier: context.viewerTokenIdentifier
    })

    let promoted = 0

    for (const noteId of noteIds) {
      const post = snapshot.posts.find((entry: any) => entry._id === noteId)

      if (!post) {
        continue
      }

      const stored = await getStoredNoteRecord(ctx, context.organization._id, noteId)

      if (!stored) {
        continue
      }

      await ensureNoteRow(ctx, {
        organizationId: context.organization._id,
        noteId,
        post,
        record: stored.record
      })
      await patchNoteRow(ctx, noteId, {
        descriptionHtml: post.descriptionHtml || '<p></p>',
        descriptionState: stored.record.descriptionState ?? undefined,
        descriptionSchemaVersion: stored.record.descriptionSchemaVersion,
        nonMemberViewsCount: stored.record.nonMemberViewsCount,
        projectId: post.projectId ?? null,
        projectPermission: stored.record.projectPermission,
        contentUpdatedAt: post.updatedAt
      })
      promoted += 1
    }

    return {
      promoted,
      total: noteIds.length
    }
  }
})

export const getLegacyNoteTimelineEventsPage = action({
  args: {
    slug: v.string(),
    noteId: v.string(),
    after: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const { context, record } = await getAccessibleNote(ctx, args.slug, args.noteId)
    const membersSnapshot = await getOrganizationMembersSnapshot(ctx, context.organization._id)
    const projects = await ctx.runQuery(api.onboarding.getLegacySyncProjects, {
      slug: args.slug
    })
    const { usersByTokenIdentifier, membershipsByTokenIdentifier } = buildMemberMaps(
      membersSnapshot.users,
      membersSnapshot.memberships
    )
    const projectMessageThreadIds = new Map<string, string | null>(
      projects.map((project: any) => [project.id, project.message_thread_id ?? null] as const)
    )
    const storedTimelineEvents = buildTimelineEvents(
      record.timelineEvents.filter(
        (event) => event.action !== 'subject_pinned' && event.action !== 'subject_unpinned'
      ),
      usersByTokenIdentifier,
      membershipsByTokenIdentifier,
      projectMessageThreadIds
    )
    const sharedTimelineEvents: any[] = await ctx.runQuery(internal.pinsBookmarks.getSubjectTimelineEventsInternal, {
      subjectType: 'Note',
      subjectId: args.noteId
    })
    const allTimelineEvents: any[] = [...storedTimelineEvents, ...sharedTimelineEvents].sort(
      (left, right) => Date.parse(right.created_at) - Date.parse(left.created_at)
    )

    return paginateByCursor(allTimelineEvents, args.after, args.limit)
  }
})

export const getLegacyNoteViews = action({
  args: {
    slug: v.string(),
    noteId: v.string()
  },
  handler: async (ctx, args): Promise<ReturnType<typeof buildNoteViews>> => {
    const { context, record } = await getAccessibleNote(ctx, args.slug, args.noteId)
    const [dedicatedViewRows, subjectViewRows] = await Promise.all([
      listDedicatedNoteViews(ctx, args.noteId),
      ctx.runQuery(internal.media.listSubjectViewsInternal, {
        subjectType: 'Note',
        subjectId: args.noteId
      })
    ])
    const membersSnapshot = await getOrganizationMembersSnapshot(ctx, context.organization._id)
    const { usersByTokenIdentifier, membershipsByTokenIdentifier } = buildMemberMaps(
      membersSnapshot.users,
      membersSnapshot.memberships
    )
    const memberViews =
      dedicatedViewRows.length > 0
        ? buildStoredViewsFromRows(dedicatedViewRows)
        : subjectViewRows.length > 0
          ? buildStoredViewsFromRows(subjectViewRows)
          : [...record.memberViews]

    return buildNoteViews(
      memberViews,
      usersByTokenIdentifier,
      membershipsByTokenIdentifier,
      context.viewerTokenIdentifier
    )
  }
})

export const createLegacyNoteView = action({
  args: {
    slug: v.string(),
    noteId: v.string(),
    anonymized_ip: v.optional(v.string()),
    user_agent: v.optional(v.string())
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    views: ReturnType<typeof buildNoteViews>
    notification_counts: ReturnType<typeof emptyNotificationCounts>
  }> => {
    const organization: any = await ctx.runQuery(internal.notes.getOrganizationBySlugInternal, {
      slug: args.slug
    })

    if (!organization) {
      throw createError('not_found', 'Organization not found')
    }

    const stored = await getStoredNoteRecord(ctx, organization._id, args.noteId)

    if (!stored) {
      throw createError('not_found', 'Note not found')
    }

    const snapshot = await getNoteSnapshot(ctx, {
      organizationId: organization._id,
      noteIds: [args.noteId]
    })
    const post = snapshot.posts.find((entry: any) => entry._id === args.noteId)

    if (!post) {
      throw createError('not_found', 'Note not found')
    }

    await ensureNoteRow(ctx, {
      organizationId: organization._id,
      noteId: args.noteId,
      post,
      record: stored.record
    })

    const identity = await ctx.auth.getUserIdentity()

    if (!identity) {
      if (post.visibility !== 'public') {
        throw createError('forbidden', 'Not allowed to view this note')
      }

      await upsertStoredNoteRecord(ctx, organization._id, args.noteId, (current) => ({
        ...current,
        nonMemberViewsCount: current.nonMemberViewsCount + 1
      }))
      const noteRow = await getNoteRowByPublicId(ctx, args.noteId)
      if (args.anonymized_ip) {
        await recordNonMemberNoteView(ctx, {
          organizationId: organization._id,
          noteId: args.noteId,
          anonymizedIp: args.anonymized_ip,
          userAgent: args.user_agent ?? null
        })
      }
      await patchNoteRow(ctx, args.noteId, {
        nonMemberViewsCount: (noteRow?.nonMemberViewsCount ?? stored.record.nonMemberViewsCount) + 1
      })

      return {
        views: [],
        notification_counts: emptyNotificationCounts()
      }
    }

    const context: AuthorizedContext | null = await ctx.runQuery(internal.notes.resolveAuthorizedContextInternal, {
      slug: args.slug
    })

    if (!context) {
      if (post.visibility !== 'public') {
        throw createError('forbidden', 'Not allowed to view this note')
      }

      await upsertStoredNoteRecord(ctx, organization._id, args.noteId, (current) => ({
        ...current,
        nonMemberViewsCount: current.nonMemberViewsCount + 1
      }))
      const noteRow = await getNoteRowByPublicId(ctx, args.noteId)
      if (args.anonymized_ip) {
        await recordNonMemberNoteView(ctx, {
          organizationId: organization._id,
          noteId: args.noteId,
          userTokenIdentifier: identity.tokenIdentifier,
          anonymizedIp: args.anonymized_ip,
          userAgent: args.user_agent ?? null
        })
      }
      await patchNoteRow(ctx, args.noteId, {
        nonMemberViewsCount: (noteRow?.nonMemberViewsCount ?? stored.record.nonMemberViewsCount) + 1
      })

      return {
        views: [],
        notification_counts: emptyNotificationCounts()
      }
    }

    const notes = await buildNotes(ctx, {
      organization,
      records: [stored.record],
      viewerMembership: context.viewerMembership,
      viewerTokenIdentifier: context.viewerTokenIdentifier
    })
    const note = notes[0]

    if (!note?.viewer_can_comment && !note?.viewer_can_edit) {
      throw createError('forbidden', 'Not allowed to view this note')
    }

    const updatedRecord = await upsertStoredNoteRecord(ctx, organization._id, args.noteId, (current) => ({
      ...current,
      memberViews: [
        {
          userTokenIdentifier: context.viewerTokenIdentifier,
          updatedAt: Date.now()
        },
        ...current.memberViews.filter((view) => view.userTokenIdentifier !== context.viewerTokenIdentifier)
      ]
    }))
    await Promise.all([
      upsertDedicatedNoteView(ctx, {
        organizationId: organization._id,
        noteId: args.noteId,
        organizationMembershipId: context.viewerMembership._id,
        userTokenIdentifier: context.viewerTokenIdentifier
      }),
      ctx.runMutation(internal.media.upsertSubjectViewInternal, {
        organizationId: organization._id,
        subjectType: 'Note',
        subjectId: args.noteId,
        userTokenIdentifier: context.viewerTokenIdentifier
      })
    ])
    const membersSnapshot = await getOrganizationMembersSnapshot(ctx, organization._id)
    const { usersByTokenIdentifier, membershipsByTokenIdentifier } = buildMemberMaps(
      membersSnapshot.users,
      membersSnapshot.memberships
    )
    const [dedicatedViewRows, subjectViewRows] = await Promise.all([
      listDedicatedNoteViews(ctx, args.noteId),
      ctx.runQuery(internal.media.listSubjectViewsInternal, {
        subjectType: 'Note',
        subjectId: args.noteId
      })
    ])

    return {
      views: buildNoteViews(
        dedicatedViewRows.length > 0
          ? buildStoredViewsFromRows(dedicatedViewRows)
          : subjectViewRows.length > 0
            ? buildStoredViewsFromRows(subjectViewRows)
            : updatedRecord.memberViews,
        usersByTokenIdentifier,
        membershipsByTokenIdentifier,
        context.viewerTokenIdentifier
      ),
      notification_counts:
        (await buildLegacyUnreadNotificationCounts(ctx, {
          tokenIdentifier: context.viewerTokenIdentifier
        })) ??
        emptyNotificationCounts()
    }
  }
})

export const updateLegacyNoteVisibility = action({
  args: {
    slug: v.string(),
    noteId: v.string(),
    visibility: v.union(v.literal('default'), v.literal('public'))
  },
  handler: async (ctx, args) => {
    const { context, note } = await getAccessibleNote(ctx, args.slug, args.noteId)

    if (!note.viewer_can_edit) {
      throw createError('forbidden', 'Not allowed to edit this note')
    }

    await ctx.runMutation(internal.notes.updateNoteContainerPostInternal, {
      slug: args.slug,
      noteId: args.noteId,
      visibility: args.visibility
    })
    await upsertStoredNoteRecord(ctx, context.organization._id, args.noteId, (current) =>
      appendTimelineEvent(current, {
        id: createRecordId('note_visibility'),
        action: 'post_visibility_updated',
        createdAt: Date.now(),
        memberActorTokenIdentifier: context.viewerTokenIdentifier
      })
    )

    return {}
  }
})

export const createLegacyNotePin = action({
  args: {
    slug: v.string(),
    noteId: v.string()
  },
  handler: async (ctx, args) => {
    const { context, note } = await getAccessibleNote(ctx, args.slug, args.noteId)

    if (!note.viewer_can_comment && !note.viewer_can_edit) {
      throw createError('forbidden', 'Not allowed to pin this note')
    }

    if (!note.project) {
      throw createError('unprocessable', 'Note must belong to a channel before it can be pinned')
    }

    const result: { pin: { publicId: string } } = await ctx.runMutation(internal.pinsBookmarks.upsertProjectPinInternal, {
      organizationId: context.organization._id,
      organizationMembershipId: context.viewerMembership._id,
      projectId: note.project.id,
      subjectType: 'Note',
      subjectId: args.noteId,
      actorMembershipId: context.viewerMembership._id,
      actorTokenIdentifier: context.viewerTokenIdentifier,
      recordTimelineEvent: true
    })
    const pinnedNote = (await getAccessibleNote(ctx, args.slug, args.noteId)).note

    return {
      pin: {
        id: result.pin.publicId,
        post: null,
        note: pinnedNote,
        call: null
      }
    }
  }
})
