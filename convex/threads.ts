import { v } from 'convex/values'

import { api, internal } from './_generated/api'
import { action, internalMutation, internalQuery, mutation } from './_generated/server'
import { buildLegacyGroupedReactions } from './engagement'
import { buildLegacyAvatarUrls, buildLegacyMediaUrl, buildLegacyMember, emptyAvatarUrls, formatDate } from './legacy'
import { buildWorkspaceState, generateToken } from './workspace'

const DEFAULT_NOTIFICATION_LEVEL = 'all'
const DELETED_MESSAGE_CONTENT = '<p><em>This message has been deleted.</em></p>'
const TABLE_STORAGE_MODE = 'table' as const

type StoredAttachment = {
  id: string
  filePath: string
  fileType: string
  previewFilePath?: string | null
  name?: string | null
  size?: number | null
  width?: number
  height?: number
  duration?: number
  galleryId?: string | null
  noVideoTrack?: boolean
}

type StoredThread = {
  id: string
  organizationId: string
  organizationSlug: string
  creatorTokenIdentifier: string
  createdAt: number
  updatedAt: number
  title?: string
  imagePath?: string | null
  group: boolean
  integrationDm: boolean
  oauthApplicationIds: string[]
  participantTokenIdentifiers: string[]
  projectId?: any
  callRoomId?: any
  lastMessageAt?: number | null
  latestMessagePublicId?: string | null
  latestMessageTruncated?: string | null
  forceNotificationSentBy: string[]
  discardedAt?: number | null
  storageMode?: typeof TABLE_STORAGE_MODE
}

type StoredThreadMembership = {
  id: string
  threadId: string
  userTokenIdentifier: string
  notificationLevel: 'all' | 'mentions' | 'none'
  unreadCount: number
  manuallyMarkedUnread: boolean
  joinedAt: number
  storageMode?: typeof TABLE_STORAGE_MODE
}

type StoredMessage = {
  id: string
  threadId: string
  senderTokenIdentifier: string
  content: string
  attachments: StoredAttachment[]
  unfurledLink?: string | null
  createdAt: number
  updatedAt: number
  replyToMessageId?: string
  callId?: any
  integrationId?: string | null
  oauthApplicationId?: string | null
  systemSharedPostId?: any
  discardedAt?: number
  storageMode?: typeof TABLE_STORAGE_MODE
}

type OrganizationSnapshot = {
  organization: any
  viewerMembership: any
  user: any
  identity: {
    tokenIdentifier: string
  }
  memberships: any[]
  users: any[]
  favoriteThreadIds: string[]
}

function createError(message: string, code: string) {
  return new Error(`${code}:${message}`)
}

function buildThreadAvatarUrls(imagePath?: string | null) {
  const imageUrl = buildLegacyMediaUrl(imagePath)

  if (!imageUrl) {
    return null
  }

  return {
    xs: imageUrl,
    sm: imageUrl,
    base: imageUrl,
    lg: imageUrl,
    xl: imageUrl,
    xxl: imageUrl
  }
}

function normalizeTitle(value?: string | null) {
  const title = value?.trim()
  return title ? title : undefined
}

function stripHtml(value?: string | null) {
  if (!value) {
    return ''
  }

  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function buildMessagePreview(content: string, attachments: StoredAttachment[], senderDisplayName: string, viewerIsSender: boolean) {
  const text = stripHtml(content)
  const prefix = viewerIsSender ? 'You: ' : ''

  if (text) {
    return `${prefix}${text}`.trim()
  }

  if (attachments.length === 1) {
    return `${prefix}${viewerIsSender ? 'Sent an attachment' : `${senderDisplayName} sent an attachment`}`.trim()
  }

  if (attachments.length > 1) {
    return `${prefix}${viewerIsSender ? 'Sent attachments' : `${senderDisplayName} sent attachments`}`.trim()
  }

  return null
}

function buildAttachmentTypeFlags(fileType: string) {
  const normalized = fileType.toLowerCase()

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

function buildAttachmentImageUrls(attachment: StoredAttachment, flags: ReturnType<typeof buildAttachmentTypeFlags>) {
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

function buildLegacyAttachment(attachment: StoredAttachment, messageId: string) {
  const url = attachment.previewFilePath || attachment.filePath
  const originalUrl = buildLegacyMediaUrl(attachment.filePath)
  const previewUrl = buildLegacyMediaUrl(attachment.previewFilePath || attachment.filePath)
  const flags = buildAttachmentTypeFlags(attachment.fileType)
  const imageUrls = buildAttachmentImageUrls(attachment, flags)

  return {
    id: attachment.id,
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
    subject_type: 'Message',
    name: attachment.name ?? null,
    size: attachment.size ?? null,
    remote_figma_url: null,
    no_video_track: attachment.noVideoTrack ?? false,
    gallery_id: attachment.galleryId ?? null,
    type_name: 'attachment',
    subject_id: messageId,
    is_subject_comment: false,
    relative_url: attachment.filePath,
    preview_relative_url: attachment.previewFilePath ?? null,
    comments_count: 0,
    key: attachment.filePath,
    optimistic_ready: true
  }
}

function buildPlaceholderOauthApplication(id: string) {
  const label = id.length > 12 ? id.slice(0, 12) : id

  return {
    id,
    name: `Integration ${label}`,
    redirect_uri: null,
    avatar_path: null,
    avatar_url: '',
    avatar_urls: emptyAvatarUrls,
    client_id: id,
    last_copied_secret_at: null,
    client_secret: null,
    mentionable: false,
    direct_messageable: true,
    webhooks: []
  }
}

async function getStoredOauthApplications(ctx: any, organizationId: string, publicIds: string[]) {
  const uniquePublicIds = Array.from(new Set(publicIds.filter(Boolean)))
  const rows = await Promise.all(
    uniquePublicIds.map((publicId) =>
      ctx.db.query('oauthApplications').withIndex('by_public_id', (q: any) => q.eq('publicId', publicId)).unique()
    )
  )

  return new Map(rows.filter((row: any) => row && row.organizationId === organizationId).map((row: any) => [row.publicId, row]))
}

function buildStoredOauthApplication(row: any) {
  const avatarUrl = buildLegacyMediaUrl(row.avatarPath)

  return {
    id: row.publicId,
    name: row.name,
    redirect_uri: row.redirectUri ?? null,
    avatar_path: row.avatarPath ?? null,
    avatar_url: avatarUrl || '',
    avatar_urls: avatarUrl ? buildLegacyAvatarUrls(avatarUrl) : emptyAvatarUrls,
    client_id: row.uid,
    last_copied_secret_at: row.lastCopiedSecretAt ? new Date(row.lastCopiedSecretAt).toISOString() : null,
    client_secret: null,
    mentionable: false,
    direct_messageable: true,
    webhooks: row.webhooks.map((webhook: any) => ({
      id: webhook.id,
      url: webhook.url,
      state: webhook.state,
      event_types: webhook.eventTypes
    }))
  }
}

function buildThreadTitle(thread: StoredThread, otherMembers: any[], oauthApplicationsById: Map<string, any>) {
  const explicitTitle = normalizeTitle(thread.title)

  if (explicitTitle) {
    return explicitTitle
  }

  if (thread.integrationDm && thread.oauthApplicationIds.length > 0) {
    return oauthApplicationsById.get(thread.oauthApplicationIds[0])?.name ?? buildPlaceholderOauthApplication(thread.oauthApplicationIds[0]).name
  }

  if (!thread.group && otherMembers.length === 1) {
    return otherMembers[0].user.display_name
  }

  if (thread.group && otherMembers.length > 0) {
    return otherMembers
      .map((member) => member.user.display_name)
      .slice(0, 3)
      .join(', ')
  }

  return thread.group ? 'Group chat' : 'Conversation'
}

function sortMembers(members: any[]) {
  return [...members].sort((a, b) => a.user.display_name.localeCompare(b.user.display_name))
}

function normalizeStoredAttachments(attachments?: any[]) {
  return (attachments ?? []).map((attachment) => ({
    id: attachment.id || `attachment_${generateToken()}`,
    filePath: attachment.file_path,
    fileType: attachment.file_type,
    previewFilePath: attachment.preview_file_path ?? null,
    name: attachment.name ?? null,
    size: attachment.size ?? null,
    width: attachment.width,
    height: attachment.height,
    duration: attachment.duration,
    noVideoTrack: attachment.no_video_track ?? false
  }))
}

function buildStoredThreadFromRow(row: any): StoredThread {
  return {
    id: row.publicId,
    organizationId: row.organizationId,
    organizationSlug: row.organizationSlug,
    creatorTokenIdentifier: row.creatorTokenIdentifier,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    title: row.title,
    imagePath: row.imagePath ?? null,
    group: row.group,
    integrationDm: row.integrationDm,
    oauthApplicationIds: row.oauthApplicationIds ?? [],
    participantTokenIdentifiers: row.participantTokenIdentifiers ?? [],
    projectId: row.projectId ?? null,
    callRoomId: row.callRoomId ?? null,
    lastMessageAt: row.lastMessageAt ?? null,
    latestMessagePublicId: row.latestMessagePublicId ?? null,
    latestMessageTruncated: row.latestMessageTruncated ?? null,
    forceNotificationSentBy: row.forceNotificationSentBy ?? [],
    discardedAt: row.discardedAt ?? null,
    storageMode: TABLE_STORAGE_MODE
  }
}

function buildStoredThreadMembershipFromRow(row: any, threadPublicId: string): StoredThreadMembership {
  return {
    id: row.publicId,
    threadId: threadPublicId,
    userTokenIdentifier: row.userTokenIdentifier,
    notificationLevel: row.notificationLevel,
    unreadCount: row.unreadCount ?? 0,
    manuallyMarkedUnread: row.manuallyMarkedUnread ?? false,
    joinedAt: row.joinedAt ?? row.createdAt,
    storageMode: TABLE_STORAGE_MODE
  }
}

function buildStoredMessageFromRow(row: any, threadPublicId: string): StoredMessage {
  return {
    id: row.publicId,
    threadId: threadPublicId,
    senderTokenIdentifier: row.senderTokenIdentifier,
    content: row.content,
    attachments: row.attachments ?? [],
    unfurledLink: row.unfurledLink ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    replyToMessageId: row.replyToPublicId,
    callId: row.callId ?? null,
    integrationId: row.integrationId ?? null,
    oauthApplicationId: row.oauthApplicationId ?? null,
    systemSharedPostId: row.systemSharedPostId ?? null,
    discardedAt: row.discardedAt,
    storageMode: TABLE_STORAGE_MODE
  }
}

async function listStoredThreads(ctx: any, organizationId: string) {
  const tableRows = (await ctx.runQuery((internal as any).threads.listMessageThreadRowsByOrganization, {
    organizationId
  })) as any[]

  return tableRows.map(buildStoredThreadFromRow)
}

async function getStoredThread(ctx: any, organizationId: string, threadId: string) {
  const row = (await ctx.runQuery((internal as any).threads.getMessageThreadRowByPublicId, {
    organizationId,
    threadPublicId: threadId
  })) as any | null

  if (row) {
    return buildStoredThreadFromRow(row)
  }

  return null
}

async function saveStoredThread(ctx: any, thread: StoredThread) {
  await ctx.runMutation((internal as any).threads.upsertMessageThreadRow, {
    organizationId: thread.organizationId,
    threadPublicId: thread.id,
    dataJson: JSON.stringify({
      organizationSlug: thread.organizationSlug,
      creatorTokenIdentifier: thread.creatorTokenIdentifier,
      title: thread.title,
      imagePath: thread.imagePath ?? null,
      group: thread.group,
      integrationDm: thread.integrationDm,
      oauthApplicationIds: thread.oauthApplicationIds,
      participantTokenIdentifiers: thread.participantTokenIdentifiers,
      projectId: thread.projectId ?? null,
      callRoomId: thread.callRoomId ?? null,
      forceNotificationSentBy: thread.forceNotificationSentBy,
      lastMessageAt: thread.lastMessageAt ?? null,
      latestMessagePublicId: thread.latestMessagePublicId ?? null,
      latestMessageTruncated: thread.latestMessageTruncated ?? null,
      discardedAt: thread.discardedAt ?? null,
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      membersCount: thread.participantTokenIdentifiers.length
    })
  })
}

async function deleteStoredThread(ctx: any, thread: StoredThread) {
  await ctx.runMutation((internal as any).threads.deleteMessageThreadRowByPublicId, {
    organizationId: thread.organizationId,
    threadPublicId: thread.id
  })
}

async function listThreadMemberships(ctx: any, thread: StoredThread) {
  const rows = (await ctx.runQuery((internal as any).threads.listMessageThreadMembershipRows, {
    organizationId: thread.organizationId,
    threadPublicId: thread.id
  })) as any[]

  return rows.map((row) => buildStoredThreadMembershipFromRow(row, thread.id)).sort((a, b) => a.joinedAt - b.joinedAt)
}

async function getThreadMembership(ctx: any, thread: StoredThread, tokenIdentifier: string) {
  const row = (await ctx.runQuery((internal as any).threads.getMessageThreadMembershipRowByUser, {
    organizationId: thread.organizationId,
    threadPublicId: thread.id,
    tokenIdentifier
  })) as any | null

  return row ? buildStoredThreadMembershipFromRow(row, thread.id) : null
}

async function saveThreadMembership(ctx: any, thread: StoredThread, membership: StoredThreadMembership) {
  await ctx.runMutation((internal as any).threads.upsertMessageThreadMembershipRow, {
    organizationId: thread.organizationId,
    threadPublicId: thread.id,
    tokenIdentifier: membership.userTokenIdentifier,
    dataJson: JSON.stringify({
      publicId: membership.id,
      userTokenIdentifier: membership.userTokenIdentifier,
      notificationLevel: membership.notificationLevel,
      unreadCount: membership.unreadCount,
      manuallyMarkedUnread: membership.manuallyMarkedUnread,
      joinedAt: membership.joinedAt,
      lastReadAt: membership.unreadCount === 0 ? Date.now() : undefined,
      manuallyMarkedUnreadAt: membership.manuallyMarkedUnread ? Date.now() : undefined,
      createdAt: membership.joinedAt,
      updatedAt: Date.now()
    })
  })
}

async function deleteThreadMembership(ctx: any, thread: StoredThread, tokenIdentifier: string) {
  await ctx.runMutation((internal as any).threads.deleteMessageThreadMembershipRowByUser, {
    organizationId: thread.organizationId,
    threadPublicId: thread.id,
    tokenIdentifier
  })
}

async function listThreadMessages(ctx: any, thread: StoredThread) {
  const rows = (await ctx.runQuery((internal as any).threads.listMessageRowsByThread, {
    organizationId: thread.organizationId,
    threadPublicId: thread.id
  })) as any[]

  return rows.map((row) => buildStoredMessageFromRow(row, thread.id)).sort((a, b) => a.createdAt - b.createdAt)
}

async function getThreadMessage(ctx: any, thread: StoredThread, messageId: string) {
  const row = (await ctx.runQuery((internal as any).threads.getMessageRowByPublicId, {
    organizationId: thread.organizationId,
    threadPublicId: thread.id,
    messagePublicId: messageId
  })) as any | null

  return row ? buildStoredMessageFromRow(row, thread.id) : null
}

async function saveThreadMessage(ctx: any, thread: StoredThread, message: StoredMessage) {
  await ctx.runMutation((internal as any).threads.upsertMessageRow, {
    organizationId: thread.organizationId,
    threadPublicId: thread.id,
    messagePublicId: message.id,
    dataJson: JSON.stringify({
      senderTokenIdentifier: message.senderTokenIdentifier,
      content: message.content,
      attachments: message.attachments,
      unfurledLink: message.unfurledLink ?? null,
      replyToPublicId: message.replyToMessageId,
      callId: message.callId ?? null,
      integrationId: message.integrationId ?? null,
      oauthApplicationId: message.oauthApplicationId ?? null,
      systemSharedPostId: message.systemSharedPostId ?? null,
      discardedAt: message.discardedAt,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt
    })
  })
}

async function deleteAllStoredThreadArtifacts(ctx: any, thread: StoredThread) {
  await ctx.runMutation((internal as any).threads.deleteMessageThreadArtifactsByPublicId, {
    organizationId: thread.organizationId,
    threadPublicId: thread.id
  })
}

function buildSnapshotMaps(snapshot: OrganizationSnapshot) {
  const membershipByToken = new Map(snapshot.memberships.map((membership) => [membership.userTokenIdentifier, membership]))
  const userByToken = new Map(snapshot.users.map((user) => [user.tokenIdentifier, user]))
  const favoriteThreadIds = new Set(snapshot.favoriteThreadIds)

  return { membershipByToken, userByToken, favoriteThreadIds }
}

async function requireSnapshot(ctx: any, slug: string) {
  const snapshot = (await ctx.runQuery((internal as any).threads.getOrganizationSnapshot, { slug })) as OrganizationSnapshot | null

  if (!snapshot) {
    throw createError('Organization not found', 'not_found')
  }

  return snapshot
}

async function getThreadByIdOrThrow(ctx: any, organizationId: string, threadId: string) {
  const thread = await getStoredThread(ctx, organizationId, threadId)

  if (!thread) {
    throw createError('Conversation not found', 'not_found')
  }

  return thread
}

async function getLinkedProjectForThread(ctx: any, organizationId: string, thread: StoredThread) {
  if (thread.projectId) {
    const project = await ctx.runQuery((internal as any).threads.getProjectById, { projectId: thread.projectId })

    if (project && project.organizationId === organizationId) {
      return project
    }
  }

  return await ctx.runQuery((internal as any).threads.getProjectByMessageThreadId, {
    organizationId,
    messageThreadId: thread.id
  })
}

async function buildLegacyThread(
  ctx: any,
  snapshot: OrganizationSnapshot,
  thread: StoredThread
): Promise<any> {
  const { membershipByToken, userByToken, favoriteThreadIds } = buildSnapshotMaps(snapshot)
  const viewerTokenIdentifier = snapshot.identity.tokenIdentifier
  const threadMemberships = await listThreadMemberships(ctx, thread)
  const viewerThreadMembership = threadMemberships.find(
    (membership) => membership.userTokenIdentifier === viewerTokenIdentifier
  )

  const otherMembers: any[] = []
  const deactivatedMembers: any[] = []

  for (const tokenIdentifier of thread.participantTokenIdentifiers) {
    if (tokenIdentifier === viewerTokenIdentifier) {
      continue
    }

    const membership = membershipByToken.get(tokenIdentifier)
    const user = userByToken.get(tokenIdentifier)

    if (!membership || !user) {
      continue
    }

    const legacyMember = buildLegacyMember(membership, user)

    if (membership.discardedAt) {
      deactivatedMembers.push(legacyMember)
    } else {
      otherMembers.push(legacyMember)
    }
  }

  const [oauthApplicationsById, callRoom, linkedProject] = await Promise.all([
    getStoredOauthApplications(ctx, snapshot.organization._id, thread.oauthApplicationIds),
    thread.callRoomId ? ctx.db.get(thread.callRoomId) : Promise.resolve(null),
    getLinkedProjectForThread(ctx, snapshot.organization._id, thread)
  ])
  const activeCall =
    callRoom && !thread.discardedAt
      ? await ctx.runQuery((api as any).callsRealtime.getLegacyCallCompatByCallRoomId, {
          slug: snapshot.organization.slug,
          callRoomId: callRoom.publicId
        })
      : null
  const sortedOtherMembers = sortMembers(otherMembers)
  const sortedDeactivatedMembers = sortMembers(deactivatedMembers)
  const title = buildThreadTitle(thread, sortedOtherMembers, oauthApplicationsById)
  const imageUrl = thread.imagePath ?? null
  const otherMember = sortedOtherMembers[0]
  const viewerCanForceNotification =
    !thread.group &&
    !thread.integrationDm &&
    sortedOtherMembers.length === 1 &&
    !!otherMember?.user.notifications_paused &&
    !thread.forceNotificationSentBy.includes(viewerTokenIdentifier)

  return {
    id: thread.id,
    last_message_at: formatDate(thread.lastMessageAt),
    latest_message_truncated: thread.latestMessageTruncated ?? null,
    image_url: imageUrl,
    avatar_urls: buildThreadAvatarUrls(imageUrl),
    group: thread.group,
    channel_name: `thread-${thread.id}`,
    organization_slug: snapshot.organization.slug,
    path: `/${snapshot.organization.slug}/chat/${thread.id}`,
    call_room_url: callRoom ? `/${snapshot.organization.slug}/calls/join/${callRoom.publicId}` : null,
    remote_call_room_id: callRoom?.remoteRoomId ?? null,
    integration_dm: thread.integrationDm,
    active_call: activeCall,
    deactivated_members: sortedDeactivatedMembers,
    type_name: 'message_thread',
    title,
    project_id: linkedProject?._id ?? thread.projectId ?? null,
    unread_count: viewerThreadMembership?.unreadCount ?? 0,
    manually_marked_unread: viewerThreadMembership?.manuallyMarkedUnread ?? false,
    viewer_has_favorited: favoriteThreadIds.has(thread.id),
    other_members: sortedOtherMembers,
    viewer_is_thread_member: !!viewerThreadMembership,
    viewer_can_manage_integrations:
      snapshot.viewerMembership.role === 'admin' || thread.creatorTokenIdentifier === viewerTokenIdentifier,
    viewer_can_delete: thread.creatorTokenIdentifier === viewerTokenIdentifier,
    viewer_can_force_notification: viewerCanForceNotification
  }
}

async function buildLegacyReplyPreview(
  replyToMessageId: string | undefined,
  allMessages: Map<string, StoredMessage>,
  snapshot: OrganizationSnapshot
): Promise<{
  id: string
  content: string
  has_content: boolean
  sender_display_name: string
  viewer_is_sender: boolean
  last_attachment: ReturnType<typeof buildLegacyAttachment> | null
} | null> {
  if (!replyToMessageId) {
    return null
  }

  const reply = allMessages.get(replyToMessageId)

  if (!reply) {
    return null
  }

  const { membershipByToken, userByToken } = buildSnapshotMaps(snapshot)
  const senderMembership = membershipByToken.get(reply.senderTokenIdentifier)
  const senderUser = userByToken.get(reply.senderTokenIdentifier)

  if (!senderMembership || !senderUser) {
    return null
  }

  const lastAttachment = reply.attachments.at(-1)
  const content = reply.discardedAt ? DELETED_MESSAGE_CONTENT : reply.content
  const hasContent = !!stripHtml(content)

  return {
    id: reply.id,
    content,
    has_content: hasContent,
    sender_display_name: senderUser.displayName,
    viewer_is_sender: reply.senderTokenIdentifier === snapshot.identity.tokenIdentifier,
    last_attachment: lastAttachment ? buildLegacyAttachment(lastAttachment, reply.id) : null
  }
}

async function buildLegacyMessage(
  ctx: any,
  snapshot: OrganizationSnapshot,
  message: StoredMessage,
  allMessages: Map<string, StoredMessage>
): Promise<{
  id: string
  content: string
  unfurled_link: string | null
  created_at: string
  updated_at: string
  discarded_at: string | null
  has_content: boolean
  sender: ReturnType<typeof buildLegacyMember>
  reply: Awaited<ReturnType<typeof buildLegacyReplyPreview>>
  attachments: Array<ReturnType<typeof buildLegacyAttachment>>
  call: any
  viewer_is_sender: boolean
  viewer_can_delete: boolean
  grouped_reactions: unknown
  shared_post_url: string | null
  optimistic_id: null
}> {
  const { membershipByToken, userByToken } = buildSnapshotMaps(snapshot)
  const senderMembership = membershipByToken.get(message.senderTokenIdentifier)
  const senderUser = userByToken.get(message.senderTokenIdentifier)

  if (!senderMembership || !senderUser) {
    throw createError('Message sender not found', 'not_found')
  }

  const [callRow, sharedPost] = await Promise.all([
    message.callId ? ctx.db.get(message.callId) : Promise.resolve(null),
    message.systemSharedPostId ? ctx.db.get(message.systemSharedPostId) : Promise.resolve(null)
  ])
  const call =
    callRow && callRow.organizationId === snapshot.organization._id
      ? await ctx.runQuery((api as any).callsRealtime.getLegacyCallCompatById, {
          slug: snapshot.organization.slug,
          callId: callRow.publicId
        })
      : null
  const sharedPostUrl =
    sharedPost && sharedPost.organizationId === snapshot.organization._id
      ? `/${snapshot.organization.slug}/posts/${sharedPost._id}`
      : null

  return {
    id: message.id,
    content: message.discardedAt ? DELETED_MESSAGE_CONTENT : message.content,
    unfurled_link: message.unfurledLink ?? null,
    created_at: new Date(message.createdAt).toISOString(),
    updated_at: new Date(message.updatedAt).toISOString(),
    discarded_at: formatDate(message.discardedAt),
    has_content: !!stripHtml(message.discardedAt ? DELETED_MESSAGE_CONTENT : message.content),
    sender: buildLegacyMember(senderMembership, senderUser),
    reply: await buildLegacyReplyPreview(message.replyToMessageId, allMessages, snapshot),
    attachments: message.attachments.map((attachment) => buildLegacyAttachment(attachment, message.id)),
    call,
    viewer_is_sender: message.senderTokenIdentifier === snapshot.identity.tokenIdentifier,
    viewer_can_delete: message.senderTokenIdentifier === snapshot.identity.tokenIdentifier,
    grouped_reactions: await ctx.runQuery((internal as any).threads.getLegacyMessageGroupedReactions, {
      organizationId: snapshot.organization._id,
      messageId: message.id,
      viewerTokenIdentifier: snapshot.identity.tokenIdentifier
    }),
    shared_post_url: sharedPostUrl,
    optimistic_id: null
  }
}

async function recalculateThreadMetadata(ctx: any, thread: StoredThread) {
  const visibleMessages = (await listThreadMessages(ctx, thread)).filter((message) => !message.discardedAt)
  const lastMessage = visibleMessages.at(-1)

  if (!lastMessage) {
    return {
      ...thread,
      lastMessageAt: null,
      latestMessagePublicId: null,
      latestMessageTruncated: null,
      updatedAt: Date.now()
    }
  }

  const snapshot = await requireSnapshot(ctx, thread.organizationSlug)
  const senderUser = snapshot.users.find((user) => user.tokenIdentifier === lastMessage.senderTokenIdentifier)
  const senderDisplayName = senderUser?.displayName || 'Someone'

  return {
    ...thread,
    lastMessageAt: lastMessage.createdAt,
    latestMessagePublicId: lastMessage.id,
    latestMessageTruncated:
      buildMessagePreview(
        lastMessage.content,
        lastMessage.attachments,
        senderDisplayName,
        lastMessage.senderTokenIdentifier === snapshot.identity.tokenIdentifier
      ) ?? null,
    updatedAt: Date.now()
  }
}

async function updateUnreadCountsForNewMessage(
  ctx: any,
  thread: StoredThread,
  senderTokenIdentifier: string,
  incrementBy: number
) {
  const memberships = await listThreadMemberships(ctx, thread)

  for (const membership of memberships) {
    if (membership.userTokenIdentifier === senderTokenIdentifier) {
      await saveThreadMembership(ctx, thread, {
        ...membership,
        unreadCount: 0,
        manuallyMarkedUnread: false
      })
      continue
    }

    await saveThreadMembership(ctx, thread, {
      ...membership,
      unreadCount: Math.max(0, membership.unreadCount + incrementBy),
      manuallyMarkedUnread: false
    })
  }
}

async function appendMessageToThread(
  ctx: any,
  snapshot: OrganizationSnapshot,
  thread: StoredThread,
  data: {
    content?: string
    replyTo?: string
    attachments?: any[]
  }
) {
  const attachments = normalizeStoredAttachments(data.attachments)
  const hasBody = !!stripHtml(data.content)

  if (!hasBody && attachments.length === 0) {
    return null
  }

  const existingReplyTarget = data.replyTo ? await getThreadMessage(ctx, thread, data.replyTo) : null

  if (data.replyTo && !existingReplyTarget) {
    throw createError('Reply target not found', 'not_found')
  }

  const now = Date.now()
  const message: StoredMessage = {
    id: `message_${generateToken()}`,
    threadId: thread.id,
    senderTokenIdentifier: snapshot.identity.tokenIdentifier,
    content: data.content || '',
    attachments,
    createdAt: now,
    updatedAt: now,
    replyToMessageId: data.replyTo
  }

  await saveThreadMessage(ctx, thread, message)

  const nextThread: StoredThread = {
    ...thread,
    lastMessageAt: now,
    latestMessagePublicId: message.id,
    latestMessageTruncated:
      buildMessagePreview(message.content, attachments, snapshot.user.displayName, true) ?? thread.latestMessageTruncated ?? null,
    updatedAt: now
  }

  await saveStoredThread(ctx, nextThread)
  await updateUnreadCountsForNewMessage(ctx, nextThread, snapshot.identity.tokenIdentifier, 1)

  return {
    thread: nextThread,
    message
  }
}

async function findThreadContainingMessage(ctx: any, organizationId: string, messageId: string) {
  const tableMatch = (await ctx.runQuery((internal as any).threads.getMessageThreadAndMessageByMessagePublicId, {
    organizationId,
    messagePublicId: messageId
  })) as { thread: any; message: any } | null

  if (tableMatch) {
    return {
      thread: buildStoredThreadFromRow(tableMatch.thread),
      message: buildStoredMessageFromRow(tableMatch.message, tableMatch.thread.publicId)
    }
  }

  return null
}

async function buildMergedNotificationCounts(ctx: any) {
  const base = (await ctx.runQuery((api as any).notifications.getLegacyUnreadNotificationCounts, {})) as any
  const organizations = (await ctx.runQuery((internal as any).threads.getViewerOrganizations, {})) as Array<{
    _id: string
    slug: string
  }>
  const snapshot = await ctx.runQuery((internal as any).threads.getViewerIdentityForThreads, {})

  if (!snapshot) {
    return base
  }

  const messageCounts = { ...(base?.messages ?? {}) }

  for (const organization of organizations) {
    const threads = await listStoredThreads(ctx, organization._id)
    let count = 0

    for (const thread of threads) {
      const membership = await getThreadMembership(ctx, thread, snapshot.tokenIdentifier)

      if (!membership) {
        continue
      }

      count += membership.unreadCount
    }

    messageCounts[organization.slug] = count
  }

  return {
    inbox: base?.inbox ?? {},
    home_inbox: base?.home_inbox ?? {},
    activity: base?.activity ?? {},
    messages: messageCounts
  }
}

export const getOrganizationSnapshot = internalQuery({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const state = await buildWorkspaceState(ctx)
    const activeEntry = state.memberships.find(
      (entry: any) => entry.organization?.slug === args.slug && !entry.membership.discardedAt
    )

    if (!activeEntry?.organization) {
      return null
    }

    const memberships = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_id', (q: any) => q.eq('organizationId', activeEntry.organization._id))
      .collect()
    const users = (
      await Promise.all(
        memberships.map((membership: any) =>
          ctx.db
            .query('users')
            .withIndex('by_token_identifier', (q: any) => q.eq('tokenIdentifier', membership.userTokenIdentifier))
            .unique()
        )
      )
    ).filter(Boolean)
    const favorites = await ctx.db
      .query('favorites')
      .withIndex('by_organization_and_user', (q: any) =>
        q.eq('organizationId', activeEntry.organization._id).eq('userTokenIdentifier', state.identity.tokenIdentifier)
      )
      .collect()

    return {
      organization: activeEntry.organization,
      viewerMembership: activeEntry.membership,
      user: state.user,
      identity: {
        tokenIdentifier: state.identity.tokenIdentifier
      },
      memberships,
      users,
      favoriteThreadIds: favorites
        .filter((favorite: any) => favorite.favoritableType === 'MessageThread')
        .map((favorite: any) => favorite.favoritableId)
    }
  }
})

export const getViewerOrganizations = internalQuery({
  args: {},
  handler: async (ctx) => {
    const state = await buildWorkspaceState(ctx)

    return state.memberships
      .filter((entry: any) => entry.organization && !entry.membership.discardedAt)
      .map((entry: any) => ({ _id: entry.organization._id, slug: entry.organization.slug }))
  }
})

export const getViewerIdentityForThreads = internalQuery({
  args: {},
  handler: async (ctx) => {
    const state = await buildWorkspaceState(ctx)

    return {
      tokenIdentifier: state.identity.tokenIdentifier
    }
  }
})

async function getMessageThreadRowByPublicIdForOrg(ctx: any, organizationId: string, threadPublicId: string) {
  const row = await ctx.db
    .query('messageThreads')
    .withIndex('by_public_id', (q: any) => q.eq('publicId', threadPublicId))
    .unique()

  if (!row || row.organizationId !== organizationId) {
    return null
  }

  return row
}

export const listMessageThreadRowsByOrganization = internalQuery({
  args: {
    organizationId: v.string()
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('messageThreads')
      .withIndex('by_organization_id', (q: any) => q.eq('organizationId', args.organizationId))
      .collect()
  }
})

export const getMessageThreadRowByPublicId = internalQuery({
  args: {
    organizationId: v.string(),
    threadPublicId: v.string()
  },
  handler: async (ctx, args) => {
    return await getMessageThreadRowByPublicIdForOrg(ctx, args.organizationId, args.threadPublicId)
  }
})

export const getThreadCallRoomInfoByPublicId = internalQuery({
  args: {
    organizationId: v.string(),
    threadPublicId: v.string()
  },
  handler: async (ctx, args) => {
    const thread = await getMessageThreadRowByPublicIdForOrg(ctx, args.organizationId, args.threadPublicId)

    if (!thread?.callRoomId) {
      return null
    }

    const callRoom: any = await ctx.db.get(thread.callRoomId)

    if (!callRoom || callRoom.organizationId !== args.organizationId) {
      return null
    }

    return {
      publicId: callRoom.publicId,
      remoteRoomId: callRoom.remoteRoomId ?? null
    }
  }
})

export const upsertMessageThreadRow = internalMutation({
  args: {
    organizationId: v.string(),
    threadPublicId: v.string(),
    dataJson: v.string()
  },
  handler: async (ctx, args) => {
    const existing = await getMessageThreadRowByPublicIdForOrg(ctx, args.organizationId, args.threadPublicId)
    const raw = JSON.parse(args.dataJson)
    const data = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== null))
    const callRoom =
      data.callRoomId && typeof data.callRoomId === 'string'
        ? await ctx.db
            .query('callRooms')
            .withIndex('by_public_id', (q: any) => q.eq('publicId', data.callRoomId))
            .unique()
        : null
    const payload = {
      ...data,
      callRoomId: callRoom?._id || undefined
    }

    if (existing) {
      await (ctx.db as any).patch(existing._id, payload)
      return existing._id
    }

    return await (ctx.db as any).insert('messageThreads', {
      organizationId: args.organizationId,
      publicId: args.threadPublicId,
      ...payload
    })
  }
})

export const deleteMessageThreadRowByPublicId = internalMutation({
  args: {
    organizationId: v.string(),
    threadPublicId: v.string()
  },
  handler: async (ctx, args) => {
    const existing = await getMessageThreadRowByPublicIdForOrg(ctx, args.organizationId, args.threadPublicId)

    if (existing) {
      await ctx.db.delete(existing._id)
    }

    return {}
  }
})

export const listMessageThreadMembershipRows = internalQuery({
  args: {
    organizationId: v.string(),
    threadPublicId: v.string()
  },
  handler: async (ctx, args) => {
    const thread = await getMessageThreadRowByPublicIdForOrg(ctx, args.organizationId, args.threadPublicId)

    if (!thread) {
      return []
    }

    return await ctx.db
      .query('messageThreadMemberships')
      .withIndex('by_thread_id', (q: any) => q.eq('threadId', thread._id))
      .collect()
  }
})

export const getMessageThreadMembershipRowByUser = internalQuery({
  args: {
    organizationId: v.string(),
    threadPublicId: v.string(),
    tokenIdentifier: v.string()
  },
  handler: async (ctx, args) => {
    const thread = await getMessageThreadRowByPublicIdForOrg(ctx, args.organizationId, args.threadPublicId)

    if (!thread) {
      return null
    }

    return await ctx.db
      .query('messageThreadMemberships')
      .withIndex('by_thread_and_user', (q: any) => q.eq('threadId', thread._id).eq('userTokenIdentifier', args.tokenIdentifier))
      .unique()
  }
})

export const upsertMessageThreadMembershipRow = internalMutation({
  args: {
    organizationId: v.string(),
    threadPublicId: v.string(),
    tokenIdentifier: v.string(),
    dataJson: v.string()
  },
  handler: async (ctx, args) => {
    const thread = await getMessageThreadRowByPublicIdForOrg(ctx, args.organizationId, args.threadPublicId)

    if (!thread) {
      throw createError('Conversation not found', 'not_found')
    }

    const existing = await ctx.db
      .query('messageThreadMemberships')
      .withIndex('by_thread_and_user', (q: any) => q.eq('threadId', thread._id).eq('userTokenIdentifier', args.tokenIdentifier))
      .unique()
    const organizationMembership = await ctx.db
      .query('organizationMemberships')
      .withIndex('by_organization_and_user', (q: any) =>
        q.eq('organizationId', args.organizationId).eq('userTokenIdentifier', args.tokenIdentifier)
      )
      .unique()
    const data = JSON.parse(args.dataJson)
    const payload = {
      ...data,
      organizationId: args.organizationId,
      threadId: thread._id,
      organizationMembershipId: organizationMembership?._id
    }

    if (existing) {
      await (ctx.db as any).patch(existing._id, payload)
      return existing._id
    }

    return await (ctx.db as any).insert('messageThreadMemberships', payload)
  }
})

export const deleteMessageThreadMembershipRowByUser = internalMutation({
  args: {
    organizationId: v.string(),
    threadPublicId: v.string(),
    tokenIdentifier: v.string()
  },
  handler: async (ctx, args) => {
    const thread = await getMessageThreadRowByPublicIdForOrg(ctx, args.organizationId, args.threadPublicId)

    if (!thread) {
      return {}
    }

    const existing = await ctx.db
      .query('messageThreadMemberships')
      .withIndex('by_thread_and_user', (q: any) => q.eq('threadId', thread._id).eq('userTokenIdentifier', args.tokenIdentifier))
      .unique()

    if (existing) {
      await ctx.db.delete(existing._id)
    }

    return {}
  }
})

export const listMessageRowsByThread = internalQuery({
  args: {
    organizationId: v.string(),
    threadPublicId: v.string()
  },
  handler: async (ctx, args) => {
    const thread = await getMessageThreadRowByPublicIdForOrg(ctx, args.organizationId, args.threadPublicId)

    if (!thread) {
      return []
    }

    return await ctx.db
      .query('messages')
      .withIndex('by_thread_id', (q: any) => q.eq('threadId', thread._id))
      .collect()
  }
})

export const getMessageRowByPublicId = internalQuery({
  args: {
    organizationId: v.string(),
    threadPublicId: v.string(),
    messagePublicId: v.string()
  },
  handler: async (ctx, args) => {
    const thread = await getMessageThreadRowByPublicIdForOrg(ctx, args.organizationId, args.threadPublicId)

    if (!thread) {
      return null
    }

    const message = await ctx.db
      .query('messages')
      .withIndex('by_public_id', (q: any) => q.eq('publicId', args.messagePublicId))
      .unique()

    if (!message || message.threadId !== thread._id) {
      return null
    }

    return message
  }
})

export const getMessageThreadAndMessageByMessagePublicId = internalQuery({
  args: {
    organizationId: v.string(),
    messagePublicId: v.string()
  },
  handler: async (ctx, args) => {
    const message = await ctx.db
      .query('messages')
      .withIndex('by_public_id', (q: any) => q.eq('publicId', args.messagePublicId))
      .unique()

    if (!message || message.organizationId !== args.organizationId) {
      return null
    }

    const thread = await ctx.db.get(message.threadId)

    if (!thread || thread.organizationId !== args.organizationId) {
      return null
    }

    return { thread, message }
  }
})

export const upsertMessageRow = internalMutation({
  args: {
    organizationId: v.string(),
    threadPublicId: v.string(),
    messagePublicId: v.string(),
    dataJson: v.string()
  },
  handler: async (ctx, args) => {
    const thread = await getMessageThreadRowByPublicIdForOrg(ctx, args.organizationId, args.threadPublicId)

    if (!thread) {
      throw createError('Conversation not found', 'not_found')
    }

    const existing = await ctx.db
      .query('messages')
      .withIndex('by_public_id', (q: any) => q.eq('publicId', args.messagePublicId))
      .unique()
    const raw = JSON.parse(args.dataJson)
    const data = Object.fromEntries(Object.entries(raw).filter(([, v]) => v !== null))
    const senderMembership = data.senderTokenIdentifier
      ? await ctx.db
          .query('organizationMemberships')
          .withIndex('by_organization_and_user', (q: any) =>
            q.eq('organizationId', args.organizationId).eq('userTokenIdentifier', data.senderTokenIdentifier)
          )
          .unique()
      : null
    const replyTo = data.replyToPublicId
      ? await ctx.db
          .query('messages')
          .withIndex('by_public_id', (q: any) => q.eq('publicId', data.replyToPublicId))
          .unique()
      : null
    const call =
      data.callId && typeof data.callId === 'string'
        ? await ctx.db
            .query('calls')
            .withIndex('by_public_id', (q: any) => q.eq('publicId', data.callId))
            .unique()
        : null
    const payload = {
      ...data,
      organizationId: args.organizationId,
      threadId: thread._id,
      publicId: args.messagePublicId,
      senderMembershipId: senderMembership?._id,
      replyToMessageId: replyTo?._id,
      callId: call?._id || undefined
    }

    if (existing) {
      await (ctx.db as any).patch(existing._id, payload)
      return existing._id
    }

    return await (ctx.db as any).insert('messages', payload)
  }
})

export const deleteMessageThreadArtifactsByPublicId = internalMutation({
  args: {
    organizationId: v.string(),
    threadPublicId: v.string()
  },
  handler: async (ctx, args) => {
    const thread = await getMessageThreadRowByPublicIdForOrg(ctx, args.organizationId, args.threadPublicId)

    if (!thread) {
      return {}
    }

    const memberships = await ctx.db
      .query('messageThreadMemberships')
      .withIndex('by_thread_id', (q: any) => q.eq('threadId', thread._id))
      .collect()
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_thread_id', (q: any) => q.eq('threadId', thread._id))
      .collect()

    for (const membership of memberships) {
      const notifications = await ctx.db
        .query('messageNotifications')
        .withIndex('by_thread_membership_id', (q: any) => q.eq('threadMembershipId', membership._id))
        .collect()

      for (const notification of notifications) {
        await ctx.db.delete(notification._id)
      }

      await ctx.db.delete(membership._id)
    }

    for (const message of messages) {
      const notifications = await ctx.db
        .query('messageNotifications')
        .withIndex('by_message_id', (q: any) => q.eq('messageId', message._id))
        .collect()

      for (const notification of notifications) {
        await ctx.db.delete(notification._id)
      }

      await ctx.db.delete(message._id)
    }

    return {}
  }
})

export const getLegacyMessageGroupedReactions = internalQuery({
  args: {
    organizationId: v.string(),
    messageId: v.string(),
    viewerTokenIdentifier: v.string()
  },
  handler: async (ctx, args) => {
    return await buildLegacyGroupedReactions(ctx, {
      organizationId: args.organizationId as any,
      subjectType: 'Message',
      subjectId: args.messageId,
      viewerTokenIdentifier: args.viewerTokenIdentifier
    })
  }
})

export const deleteThreadFavorites = internalMutation({
  args: {
    organizationId: v.string(),
    threadId: v.string()
  },
  handler: async (ctx, args) => {
    const favorites = await ctx.db
      .query('favorites')
      .withIndex('by_favoritable', (q: any) => q.eq('favoritableType', 'MessageThread').eq('favoritableId', args.threadId))
      .collect()

    for (const favorite of favorites) {
      if (favorite.organizationId === args.organizationId) {
        await ctx.db.delete(favorite._id)
      }
    }

    return {}
  }
})

export const deleteViewerThreadFavorite = internalMutation({
  args: {
    organizationId: v.string(),
    threadId: v.string(),
    tokenIdentifier: v.string()
  },
  handler: async (ctx, args) => {
    const favorite = await ctx.db
      .query('favorites')
      .withIndex('by_organization_user_and_favoritable', (q: any) =>
        q
          .eq('organizationId', args.organizationId)
          .eq('userTokenIdentifier', args.tokenIdentifier)
          .eq('favoritableType', 'MessageThread')
          .eq('favoritableId', args.threadId)
      )
      .unique()

    if (favorite) {
      await ctx.db.delete(favorite._id)
    }

    return {}
  }
})

export const deleteMessageReactions = internalMutation({
  args: {
    messageId: v.string()
  },
  handler: async (ctx, args) => {
    const reactions = await ctx.db
      .query('reactions')
      .withIndex('by_subject', (q: any) => q.eq('subjectType', 'Message').eq('subjectId', args.messageId))
      .collect()

    for (const reaction of reactions) {
      await ctx.db.delete(reaction._id)
    }

    return {}
  }
})

export const getProjectById = internalQuery({
  args: { projectId: v.id('projects') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.projectId)
  }
})

export const getProjectByMessageThreadId = internalQuery({
  args: { organizationId: v.string(), messageThreadId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('projects')
      .withIndex('by_message_thread_id', (q: any) => q.eq('messageThreadId', args.messageThreadId))
      .unique()
  }
})

export const promoteLegacyThreadsCompat = mutation({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    await requireSnapshot(ctx, args.slug)

    return {
      promoted: 0,
      total: 0
    }
  }
})

export const getLegacyThreads = action({
  args: {
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const threads = await listStoredThreads(ctx, snapshot.organization._id)
    const visibleThreads: any[] = []

    for (const thread of threads) {
      const membership = await getThreadMembership(ctx, thread, snapshot.identity.tokenIdentifier)

      if (!membership) {
        continue
      }

      visibleThreads.push(await buildLegacyThread(ctx, snapshot, thread))
    }

    visibleThreads.sort((a, b) => {
      const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0
      const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0

      return bTime - aTime
    })

    return {
      threads: visibleThreads
    }
  }
})

export const getLegacyThreadById = action({
  args: {
    slug: v.string(),
    threadId: v.string()
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const thread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, args.threadId)
    const membership = await getThreadMembership(ctx, thread, snapshot.identity.tokenIdentifier)

    if (!membership) {
      throw createError('Conversation not found', 'not_found')
    }

    return await buildLegacyThread(ctx, snapshot, thread)
  }
})

export const getLegacyDmByUsername = action({
  args: {
    slug: v.string(),
    username: v.string()
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const targetUser = snapshot.users.find((user: any) => user.username === args.username)

    if (!targetUser) {
      return { dm: null }
    }

    const viewerTokenIdentifier = snapshot.identity.tokenIdentifier
    const targetTokenIdentifier = targetUser.tokenIdentifier
    const threads = await listStoredThreads(ctx, snapshot.organization._id)
    const targetParticipants = [viewerTokenIdentifier, targetTokenIdentifier].sort().join(':')

    for (const thread of threads) {
      if (thread.group || thread.integrationDm) {
        continue
      }

      const membership = await getThreadMembership(ctx, thread, viewerTokenIdentifier)
      if (!membership) {
        continue
      }

      const participants = [...thread.participantTokenIdentifiers].sort().join(':')

      if (participants === targetParticipants) {
        return { dm: await buildLegacyThread(ctx, snapshot, thread) }
      }
    }

    return { dm: null }
  }
})

export const getLegacyIntegrationDmByOauthApplicationId = action({
  args: {
    slug: v.string(),
    oauthApplicationId: v.string()
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const threads = await listStoredThreads(ctx, snapshot.organization._id)

    for (const thread of threads) {
      if (!thread.integrationDm) {
        continue
      }

      if (!thread.oauthApplicationIds.includes(args.oauthApplicationId)) {
        continue
      }

      const membership = await getThreadMembership(ctx, thread, snapshot.identity.tokenIdentifier)
      if (!membership) {
        continue
      }

      return { dm: await buildLegacyThread(ctx, snapshot, thread) }
    }

    return { dm: null }
  }
})

export const createLegacyThread = action({
  args: {
    slug: v.string(),
    group: v.optional(v.boolean()),
    title: v.optional(v.string()),
    memberIds: v.optional(v.array(v.string())),
    oauthApplicationIds: v.optional(v.array(v.string())),
    content: v.optional(v.string()),
    attachments: v.optional(
      v.array(
        v.object({
          file_path: v.string(),
          file_type: v.string(),
          preview_file_path: v.optional(v.union(v.string(), v.null())),
          name: v.optional(v.union(v.string(), v.null())),
          size: v.optional(v.union(v.number(), v.null())),
          width: v.optional(v.number()),
          height: v.optional(v.number()),
          duration: v.optional(v.number())
        })
      )
    )
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const viewerTokenIdentifier = snapshot.identity.tokenIdentifier
    const membershipIds = new Set(args.memberIds ?? [])
    const participantTokenIdentifiers = snapshot.memberships
      .filter((membership: any) => membershipIds.has(membership._id))
      .filter((membership: any) => !membership.discardedAt)
      .map((membership: any) => membership.userTokenIdentifier)
      .filter((tokenIdentifier: string) => tokenIdentifier !== viewerTokenIdentifier)
    const uniqueParticipantTokenIdentifiers = Array.from(new Set([viewerTokenIdentifier, ...participantTokenIdentifiers]))
    const oauthApplicationIds = Array.from(new Set(args.oauthApplicationIds ?? []))
    const isGroup = !!args.group || uniqueParticipantTokenIdentifiers.length > 2
    const isIntegrationDm =
      !isGroup && participantTokenIdentifiers.length === 0 && oauthApplicationIds.length === 1

    if (!isGroup && !isIntegrationDm && uniqueParticipantTokenIdentifiers.length < 2) {
      throw createError('A direct message needs another member.', 'unprocessable')
    }

    if (!isGroup && !isIntegrationDm) {
      const targetParticipants = [...uniqueParticipantTokenIdentifiers].sort().join(':')
      const threads = await listStoredThreads(ctx, snapshot.organization._id)

      for (const thread of threads) {
        if (thread.group || thread.integrationDm) {
          continue
        }

        const participants = [...thread.participantTokenIdentifiers].sort().join(':')
        if (participants !== targetParticipants) {
          continue
        }

        const membership = await getThreadMembership(ctx, thread, viewerTokenIdentifier)
        if (!membership) {
          continue
        }

        if (args.content || (args.attachments?.length ?? 0) > 0) {
          await appendMessageToThread(ctx, snapshot, thread, {
            content: args.content,
            attachments: args.attachments
          })
        }

        const refreshedThread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, thread.id)
        return await buildLegacyThread(ctx, snapshot, refreshedThread)
      }
    }

    const now = Date.now()
    const thread: StoredThread = {
      id: `thread_${generateToken()}`,
      organizationId: snapshot.organization._id,
      organizationSlug: snapshot.organization.slug,
      creatorTokenIdentifier: viewerTokenIdentifier,
      createdAt: now,
      updatedAt: now,
      title: normalizeTitle(args.title),
      imagePath: null,
      group: isGroup,
      integrationDm: isIntegrationDm,
      oauthApplicationIds,
      participantTokenIdentifiers: uniqueParticipantTokenIdentifiers,
      lastMessageAt: null,
      latestMessageTruncated: null,
      forceNotificationSentBy: []
    }

    await saveStoredThread(ctx, {
      ...thread,
      storageMode: TABLE_STORAGE_MODE
    })

    for (const tokenIdentifier of uniqueParticipantTokenIdentifiers) {
      await saveThreadMembership(ctx, thread, {
        id: `thread_membership_${generateToken()}`,
        threadId: thread.id,
        userTokenIdentifier: tokenIdentifier,
        notificationLevel: DEFAULT_NOTIFICATION_LEVEL,
        unreadCount: 0,
        manuallyMarkedUnread: false,
        joinedAt: now
      })
    }

    if (args.content || (args.attachments?.length ?? 0) > 0) {
      await appendMessageToThread(ctx, snapshot, thread, {
        content: args.content,
        attachments: args.attachments
      })
    }

    const storedThread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, thread.id)
    return await buildLegacyThread(ctx, snapshot, storedThread)
  }
})

export const updateLegacyThread = action({
  args: {
    slug: v.string(),
    threadId: v.string(),
    title: v.optional(v.string()),
    imagePath: v.optional(v.union(v.string(), v.null()))
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const thread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, args.threadId)
    const membership = await getThreadMembership(ctx, thread, snapshot.identity.tokenIdentifier)

    if (!membership) {
      throw createError('Conversation not found', 'not_found')
    }

    const nextThread: StoredThread = {
      ...thread,
      title: args.title === undefined ? thread.title : normalizeTitle(args.title),
      imagePath: args.imagePath === undefined ? thread.imagePath ?? null : args.imagePath,
      updatedAt: Date.now()
    }

    await saveStoredThread(ctx, nextThread)

    return await buildLegacyThread(ctx, snapshot, nextThread)
  }
})

export const deleteLegacyThread = action({
  args: {
    slug: v.string(),
    threadId: v.string()
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const thread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, args.threadId)

    if (thread.creatorTokenIdentifier !== snapshot.identity.tokenIdentifier) {
      throw createError('Only the creator can delete this conversation.', 'forbidden')
    }

    const messages = await listThreadMessages(ctx, thread)

    for (const message of messages) {
      await ctx.runMutation((internal as any).threads.deleteMessageReactions, { messageId: message.id })
    }

    await ctx.runMutation((internal as any).threads.deleteThreadFavorites, {
      organizationId: snapshot.organization._id,
      threadId: thread.id
    })
    await deleteAllStoredThreadArtifacts(ctx, thread)
    await deleteStoredThread(ctx, thread)

    return {}
  }
})

export const getLegacyThreadMessagesPage = action({
  args: {
    slug: v.string(),
    threadId: v.string(),
    after: v.optional(v.string()),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const thread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, args.threadId)
    const membership = await getThreadMembership(ctx, thread, snapshot.identity.tokenIdentifier)

    if (!membership) {
      throw createError('Conversation not found', 'not_found')
    }

    const allMessages = await listThreadMessages(ctx, thread)
    const visibleMessages = allMessages.filter((message) => !message.discardedAt).sort((a, b) => b.createdAt - a.createdAt)
    const limit = Math.max(1, Math.min(args.limit ?? 20, 100))
    const startIndex = args.after ? visibleMessages.findIndex((message) => message.id === args.after) + 1 : 0
    const page = visibleMessages.slice(Math.max(0, startIndex), Math.max(0, startIndex) + limit)
    const allMessagesById = new Map(allMessages.map((message) => [message.id, message]))

    return {
      data: await Promise.all(page.map((message) => buildLegacyMessage(ctx, snapshot, message, allMessagesById))),
      next_cursor: startIndex + limit < visibleMessages.length ? page[page.length - 1]?.id ?? null : null,
      prev_cursor: null
    }
  }
})

export const createLegacyThreadMessage = action({
  args: {
    slug: v.string(),
    threadId: v.string(),
    content: v.string(),
    replyTo: v.optional(v.string()),
    attachments: v.optional(
      v.array(
        v.object({
          file_path: v.string(),
          file_type: v.string(),
          preview_file_path: v.optional(v.union(v.string(), v.null())),
          name: v.optional(v.union(v.string(), v.null())),
          size: v.optional(v.union(v.number(), v.null())),
          width: v.optional(v.number()),
          height: v.optional(v.number()),
          duration: v.optional(v.number()),
          no_video_track: v.optional(v.boolean())
        })
      )
    )
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const thread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, args.threadId)
    const membership = await getThreadMembership(ctx, thread, snapshot.identity.tokenIdentifier)

    if (!membership) {
      throw createError('Conversation not found', 'not_found')
    }

    const result = await appendMessageToThread(ctx, snapshot, thread, {
      content: args.content,
      replyTo: args.replyTo,
      attachments: args.attachments
    })

    if (!result) {
      throw createError('Message content is required.', 'unprocessable')
    }

    const allMessages = new Map((await listThreadMessages(ctx, thread)).map((message) => [message.id, message]))
    const legacyThread = await buildLegacyThread(ctx, snapshot, result.thread)

    return {
      message: await buildLegacyMessage(ctx, snapshot, result.message, allMessages),
      message_thread: legacyThread,
      skip_push: true,
      push_body: null
    }
  }
})

export const updateLegacyThreadMessage = action({
  args: {
    slug: v.string(),
    threadId: v.string(),
    messageId: v.string(),
    content: v.string()
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const thread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, args.threadId)
    const membership = await getThreadMembership(ctx, thread, snapshot.identity.tokenIdentifier)

    if (!membership) {
      throw createError('Conversation not found', 'not_found')
    }

    const message = await getThreadMessage(ctx, thread, args.messageId)

    if (!message) {
      throw createError('Message not found', 'not_found')
    }

    if (message.senderTokenIdentifier !== snapshot.identity.tokenIdentifier) {
      throw createError('You cannot edit this message.', 'forbidden')
    }

    const nextMessage: StoredMessage = {
      ...message,
      content: args.content,
      updatedAt: Date.now()
    }

    await saveThreadMessage(ctx, thread, nextMessage)
    const nextThread = await recalculateThreadMetadata(ctx, thread)
    await saveStoredThread(ctx, nextThread)

    return {}
  }
})

export const deleteLegacyThreadMessage = action({
  args: {
    slug: v.string(),
    threadId: v.string(),
    messageId: v.string()
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const thread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, args.threadId)
    const membership = await getThreadMembership(ctx, thread, snapshot.identity.tokenIdentifier)

    if (!membership) {
      throw createError('Conversation not found', 'not_found')
    }

    const message = await getThreadMessage(ctx, thread, args.messageId)

    if (!message) {
      throw createError('Message not found', 'not_found')
    }

    if (message.senderTokenIdentifier !== snapshot.identity.tokenIdentifier) {
      throw createError('You cannot delete this message.', 'forbidden')
    }

    const nextMessage: StoredMessage = {
      ...message,
      content: '',
      attachments: [],
      discardedAt: Date.now(),
      updatedAt: Date.now()
    }

    await saveThreadMessage(ctx, thread, nextMessage)
    await ctx.runMutation((internal as any).threads.deleteMessageReactions, { messageId: message.id })
    const nextThread = await recalculateThreadMetadata(ctx, thread)
    await saveStoredThread(ctx, nextThread)

    return {}
  }
})

export const deleteLegacyMessageAttachment = action({
  args: {
    slug: v.string(),
    messageId: v.string(),
    attachmentId: v.string()
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const match = await findThreadContainingMessage(ctx, snapshot.organization._id, args.messageId)

    if (!match) {
      throw createError('Message not found', 'not_found')
    }

    const membership = await getThreadMembership(ctx, match.thread, snapshot.identity.tokenIdentifier)

    if (!membership) {
      throw createError('Conversation not found', 'not_found')
    }

    if (match.message.senderTokenIdentifier !== snapshot.identity.tokenIdentifier) {
      throw createError('You cannot update this message.', 'forbidden')
    }

    const attachments = match.message.attachments.filter((attachment) => attachment.id !== args.attachmentId)

    if (attachments.length === match.message.attachments.length) {
      throw createError('Attachment not found', 'not_found')
    }

    const nextMessage: StoredMessage = {
      ...match.message,
      attachments,
      updatedAt: Date.now()
    }

    if (attachments.length === 0 && !stripHtml(nextMessage.content)) {
      nextMessage.discardedAt = Date.now()
    }

    await saveThreadMessage(ctx, match.thread, nextMessage)
    if (nextMessage.discardedAt) {
      await ctx.runMutation((internal as any).threads.deleteMessageReactions, { messageId: match.message.id })
    }
    const nextThread = await recalculateThreadMetadata(ctx, match.thread)
    await saveStoredThread(ctx, nextThread)

    return {}
  }
})

export const getLegacyThreadMembership = action({
  args: {
    slug: v.string(),
    threadId: v.string()
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const thread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, args.threadId)
    const membership = await getThreadMembership(ctx, thread, snapshot.identity.tokenIdentifier)

    if (!membership) {
      throw createError('Conversation not found', 'not_found')
    }

    return {
      notification_level: membership.notificationLevel
    }
  }
})

export const updateLegacyThreadMembership = action({
  args: {
    slug: v.string(),
    threadId: v.string(),
    notificationLevel: v.union(v.literal('all'), v.literal('mentions'), v.literal('none'))
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const thread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, args.threadId)
    const membership = await getThreadMembership(ctx, thread, snapshot.identity.tokenIdentifier)

    if (!membership) {
      throw createError('Conversation not found', 'not_found')
    }

    await saveThreadMembership(ctx, thread, {
      ...membership,
      notificationLevel: args.notificationLevel
    })

    return {
      notification_level: args.notificationLevel
    }
  }
})

export const leaveLegacyThread = action({
  args: {
    slug: v.string(),
    threadId: v.string()
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const thread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, args.threadId)
    const viewerTokenIdentifier = snapshot.identity.tokenIdentifier
    const membership = await getThreadMembership(ctx, thread, viewerTokenIdentifier)

    if (!membership) {
      throw createError('Conversation not found', 'not_found')
    }

    const participantTokenIdentifiers = thread.participantTokenIdentifiers.filter(
      (tokenIdentifier) => tokenIdentifier !== viewerTokenIdentifier
    )

    await deleteThreadMembership(ctx, thread, viewerTokenIdentifier)
    await ctx.runMutation((internal as any).threads.deleteViewerThreadFavorite, {
      organizationId: snapshot.organization._id,
      threadId: thread.id,
      tokenIdentifier: viewerTokenIdentifier
    })
    await saveStoredThread(ctx, {
      ...thread,
      participantTokenIdentifiers,
      updatedAt: Date.now()
    })

    return {}
  }
})

export const markLegacyThreadRead = action({
  args: {
    slug: v.string(),
    threadId: v.string()
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const thread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, args.threadId)
    const membership = await getThreadMembership(ctx, thread, snapshot.identity.tokenIdentifier)

    if (!membership) {
      throw createError('Conversation not found', 'not_found')
    }

    await saveThreadMembership(ctx, thread, {
      ...membership,
      unreadCount: 0,
      manuallyMarkedUnread: false
    })

    return await buildMergedNotificationCounts(ctx)
  }
})

export const markLegacyThreadUnread = action({
  args: {
    slug: v.string(),
    threadId: v.string()
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const thread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, args.threadId)
    const membership = await getThreadMembership(ctx, thread, snapshot.identity.tokenIdentifier)

    if (!membership) {
      throw createError('Conversation not found', 'not_found')
    }

    await saveThreadMembership(ctx, thread, {
      ...membership,
      unreadCount: Math.max(1, membership.unreadCount),
      manuallyMarkedUnread: true
    })

    return await buildMergedNotificationCounts(ctx)
  }
})

export const forceLegacyThreadNotification = action({
  args: {
    slug: v.string(),
    threadId: v.string()
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const thread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, args.threadId)
    const membership = await getThreadMembership(ctx, thread, snapshot.identity.tokenIdentifier)

    if (!membership) {
      throw createError('Conversation not found', 'not_found')
    }

    if (!thread.forceNotificationSentBy.includes(snapshot.identity.tokenIdentifier)) {
      await saveStoredThread(ctx, {
        ...thread,
        forceNotificationSentBy: [...thread.forceNotificationSentBy, snapshot.identity.tokenIdentifier],
        updatedAt: Date.now()
      })
    }

    return {}
  }
})

export const getLegacyThreadOauthApplications = action({
  args: {
    slug: v.string(),
    threadId: v.string()
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const thread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, args.threadId)
    const membership = await getThreadMembership(ctx, thread, snapshot.identity.tokenIdentifier)

    if (!membership) {
      throw createError('Conversation not found', 'not_found')
    }

    const oauthApplicationsById = await getStoredOauthApplications(ctx, snapshot.organization._id, thread.oauthApplicationIds)

    return thread.oauthApplicationIds.map((id) => {
      const oauthApplication = oauthApplicationsById.get(id)

      return oauthApplication ? buildStoredOauthApplication(oauthApplication) : buildPlaceholderOauthApplication(id)
    })
  }
})

export const createLegacyThreadOauthApplication = action({
  args: {
    slug: v.string(),
    threadId: v.string(),
    oauthApplicationId: v.string()
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const thread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, args.threadId)
    const membership = await getThreadMembership(ctx, thread, snapshot.identity.tokenIdentifier)

    if (!membership) {
      throw createError('Conversation not found', 'not_found')
    }

    if (!thread.oauthApplicationIds.includes(args.oauthApplicationId)) {
      await saveStoredThread(ctx, {
        ...thread,
        oauthApplicationIds: [...thread.oauthApplicationIds, args.oauthApplicationId],
        updatedAt: Date.now()
      })
    }

    return {
      notification_level: membership.notificationLevel
    }
  }
})

export const deleteLegacyThreadOauthApplication = action({
  args: {
    slug: v.string(),
    threadId: v.string(),
    oauthApplicationId: v.string()
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const thread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, args.threadId)
    const membership = await getThreadMembership(ctx, thread, snapshot.identity.tokenIdentifier)

    if (!membership) {
      throw createError('Conversation not found', 'not_found')
    }

    await saveStoredThread(ctx, {
      ...thread,
      oauthApplicationIds: thread.oauthApplicationIds.filter((id) => id !== args.oauthApplicationId),
      updatedAt: Date.now()
    })

    return {}
  }
})

export const updateLegacyThreadOtherMembers = action({
  args: {
    slug: v.string(),
    threadId: v.string(),
    memberIds: v.array(v.string())
  },
  handler: async (ctx, args) => {
    const snapshot = await requireSnapshot(ctx, args.slug)
    const thread = await getThreadByIdOrThrow(ctx, snapshot.organization._id, args.threadId)
    const membership = await getThreadMembership(ctx, thread, snapshot.identity.tokenIdentifier)

    if (!membership) {
      throw createError('Conversation not found', 'not_found')
    }

    const viewerTokenIdentifier = snapshot.identity.tokenIdentifier
    const nextParticipantTokens = snapshot.memberships
      .filter((orgMembership: any) => args.memberIds.includes(orgMembership._id))
      .filter((orgMembership: any) => !orgMembership.discardedAt)
      .map((orgMembership: any) => orgMembership.userTokenIdentifier)
      .filter((tokenIdentifier: string) => tokenIdentifier !== viewerTokenIdentifier)
    const desiredParticipantTokens = Array.from(new Set([viewerTokenIdentifier, ...nextParticipantTokens]))
    const existingMemberships = await listThreadMemberships(ctx, thread)

    for (const threadMembership of existingMemberships) {
      if (!desiredParticipantTokens.includes(threadMembership.userTokenIdentifier)) {
        await deleteThreadMembership(ctx, thread, threadMembership.userTokenIdentifier)
      }
    }

    const now = Date.now()

    for (const tokenIdentifier of desiredParticipantTokens) {
      const existing = existingMemberships.find((threadMembership) => threadMembership.userTokenIdentifier === tokenIdentifier)

      if (!existing) {
        await saveThreadMembership(ctx, thread, {
          id: `thread_membership_${generateToken()}`,
          threadId: thread.id,
          userTokenIdentifier: tokenIdentifier,
          notificationLevel: DEFAULT_NOTIFICATION_LEVEL,
          unreadCount: 0,
          manuallyMarkedUnread: false,
          joinedAt: now
        })
      }
    }

    const nextThread: StoredThread = {
      ...thread,
      participantTokenIdentifiers: desiredParticipantTokens,
      group: desiredParticipantTokens.length > 2 || thread.group,
      updatedAt: Date.now()
    }

    await saveStoredThread(ctx, nextThread)

    return await buildLegacyThread(ctx, snapshot, nextThread)
  }
})
