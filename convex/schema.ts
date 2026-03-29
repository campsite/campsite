import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  files: defineTable({
    ownerTokenIdentifier: v.string(),
    storageId: v.id('_storage'),
    name: v.string(),
    contentType: v.optional(v.string()),
    size: v.optional(v.number()),
    createdAt: v.number()
  }).index('by_owner', ['ownerTokenIdentifier']),
  attachments: defineTable({
    organizationId: v.id('organizations'),
    publicId: v.string(),
    subjectType: v.union(
      v.literal('Post'),
      v.literal('Comment'),
      v.literal('Note'),
      v.literal('Message'),
      v.literal('Call')
    ),
    subjectId: v.string(),
    filePath: v.string(),
    fileType: v.string(),
    previewFilePath: v.optional(v.string()),
    name: v.optional(v.string()),
    size: v.optional(v.number()),
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    duration: v.optional(v.number()),
    galleryId: v.optional(v.string()),
    noVideoTrack: v.optional(v.boolean()),
    position: v.number(),
    discardedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_organization_id', ['organizationId'])
    .index('by_subject', ['subjectType', 'subjectId'])
    .index('by_subject_and_position', ['subjectType', 'subjectId', 'position']),
  subjectViews: defineTable({
    organizationId: v.id('organizations'),
    subjectType: v.union(v.literal('Note'), v.literal('Post'), v.literal('Project')),
    subjectId: v.string(),
    userTokenIdentifier: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_organization_id', ['organizationId'])
    .index('by_subject', ['subjectType', 'subjectId'])
    .index('by_subject_and_user', ['subjectType', 'subjectId', 'userTokenIdentifier'])
    .index('by_user_token_identifier', ['userTokenIdentifier']),
  noteViews: defineTable({
    organizationId: v.id('organizations'),
    publicId: v.string(),
    noteId: v.string(),
    organizationMembershipId: v.id('organizationMemberships'),
    userTokenIdentifier: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_note_id', ['noteId'])
    .index('by_organization_membership_id', ['organizationMembershipId'])
    .index('by_note_and_membership', ['noteId', 'organizationMembershipId'])
    .index('by_note_and_user', ['noteId', 'userTokenIdentifier']),
  postViews: defineTable({
    organizationId: v.id('organizations'),
    publicId: v.string(),
    postId: v.string(),
    organizationMembershipId: v.optional(v.id('organizationMemberships')),
    userTokenIdentifier: v.optional(v.string()),
    readAt: v.optional(v.number()),
    dwellTimeTotal: v.number(),
    readsCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_post_id', ['postId'])
    .index('by_organization_membership_id', ['organizationMembershipId'])
    .index('by_post_and_membership', ['postId', 'organizationMembershipId'])
    .index('by_post_and_user', ['postId', 'userTokenIdentifier']),
  nonMemberNoteViews: defineTable({
    organizationId: v.id('organizations'),
    noteId: v.string(),
    userTokenIdentifier: v.optional(v.string()),
    anonymizedIp: v.string(),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_note_id', ['noteId'])
    .index('by_user_token_identifier', ['userTokenIdentifier'])
    .index('by_note_and_user', ['noteId', 'userTokenIdentifier'])
    .index('by_note_and_ip_agent', ['noteId', 'anonymizedIp', 'userAgent']),
  nonMemberPostViews: defineTable({
    organizationId: v.id('organizations'),
    postId: v.string(),
    userTokenIdentifier: v.optional(v.string()),
    anonymizedIp: v.string(),
    userAgent: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_post_id', ['postId'])
    .index('by_user_token_identifier', ['userTokenIdentifier'])
    .index('by_post_and_user', ['postId', 'userTokenIdentifier'])
    .index('by_post_and_ip_agent', ['postId', 'anonymizedIp', 'userAgent']),
  users: defineTable({
    publicId: v.optional(v.string()),
    tokenIdentifier: v.string(),
    subject: v.string(),
    email: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    name: v.optional(v.string()),
    nickname: v.optional(v.string()),
    preferredUsername: v.optional(v.string()),
    username: v.string(),
    displayName: v.string(),
    avatarPath: v.optional(v.string()),
    coverPhotoPath: v.optional(v.string()),
    preferences: v.optional(v.record(v.string(), v.string())),
    notificationPauseExpiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    lastSeenAt: v.number()
  })
    .index('by_token_identifier', ['tokenIdentifier'])
    .index('by_public_id', ['publicId']),
  organizations: defineTable({
    publicId: v.optional(v.string()),
    slug: v.string(),
    name: v.string(),
    avatarPath: v.optional(v.string()),
    billingEmail: v.optional(v.string()),
    emailDomain: v.optional(v.string()),
    inviteToken: v.optional(v.string()),
    onboardedAt: v.optional(v.number()),
    role: v.optional(v.string()),
    orgSize: v.optional(v.string()),
    slackChannelId: v.optional(v.string()),
    slackChannelIsPrivate: v.optional(v.boolean()),
    source: v.optional(v.string()),
    why: v.optional(v.string()),
    ownerTokenIdentifier: v.string(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    planName: v.optional(v.string()),
    memberCount: v.optional(v.number()),
    demo: v.optional(v.boolean()),
    trialEndsAt: v.optional(v.number())
  })
    .index('by_public_id', ['publicId'])
    .index('by_slug', ['slug'])
    .index('by_owner', ['ownerTokenIdentifier'])
    .index('by_email_domain', ['emailDomain'])
    .index('by_invite_token', ['inviteToken']),
  tags: defineTable({
    organizationId: v.id('organizations'),
    name: v.string(),
    createdAt: v.number()
  })
    .index('by_organization_id', ['organizationId'])
    .index('by_organization_and_name', ['organizationId', 'name']),
  postTaggings: defineTable({
    organizationId: v.id('organizations'),
    postId: v.id('posts'),
    tagId: v.id('tags'),
    createdAt: v.number()
  })
    .index('by_organization_id', ['organizationId'])
    .index('by_post_id', ['postId'])
    .index('by_tag_id', ['tagId'])
    .index('by_post_and_tag', ['postId', 'tagId'])
    .index('by_tag_and_post', ['tagId', 'postId']),
  organizationMemberships: defineTable({
    publicId: v.optional(v.string()),
    organizationId: v.id('organizations'),
    userTokenIdentifier: v.string(),
    role: v.union(v.literal('admin'), v.literal('member'), v.literal('viewer'), v.literal('guest')),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    discardedAt: v.optional(v.number()),
    lastSeenAt: v.optional(v.number()),
    latestStatusId: v.optional(v.id('organizationMembershipStatuses')),
    position: v.optional(v.number()),
    homeLastSeenAt: v.optional(v.number()),
    activityLastSeenAt: v.optional(v.number()),
    statusEmoji: v.optional(v.string()),
    statusMessage: v.optional(v.string()),
    statusExpirationSetting: v.optional(
      v.union(
        v.literal('30m'),
        v.literal('1h'),
        v.literal('4h'),
        v.literal('today'),
        v.literal('this_week'),
        v.literal('custom')
      )
    ),
    statusExpiresAt: v.optional(v.number()),
    statusPauseNotifications: v.optional(v.boolean()),
    lastViewedPostsAt: v.string()
  })
    .index('by_public_id', ['publicId'])
    .index('by_user_token_identifier', ['userTokenIdentifier'])
    .index('by_organization_id', ['organizationId'])
    .index('by_organization_and_user', ['organizationId', 'userTokenIdentifier']),
  organizationMembershipStatuses: defineTable({
    organizationMembershipId: v.id('organizationMemberships'),
    message: v.string(),
    emoji: v.string(),
    expiresAt: v.optional(v.number()),
    expirationSetting: v.union(
      v.literal('30m'),
      v.literal('1h'),
      v.literal('4h'),
      v.literal('today'),
      v.literal('this_week'),
      v.literal('custom')
    ),
    pauseNotifications: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_organization_membership_id', ['organizationMembershipId'])
    .index('by_expires_at', ['expiresAt']),
  notificationSchedules: defineTable({
    userTokenIdentifier: v.string(),
    type: v.union(v.literal('none'), v.literal('custom')),
    days: v.optional(
      v.array(
        v.union(
          v.literal('Sunday'),
          v.literal('Monday'),
          v.literal('Tuesday'),
          v.literal('Wednesday'),
          v.literal('Thursday'),
          v.literal('Friday'),
          v.literal('Saturday')
        )
      )
    ),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    updatedAt: v.number()
  }).index('by_user_token_identifier', ['userTokenIdentifier']),
  scheduledNotifications: defineTable({
    userTokenIdentifier: v.string(),
    name: v.string(),
    timeZone: v.string(),
    deliveryDay: v.optional(v.string()),
    deliveryTime: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user_token_identifier', ['userTokenIdentifier']),
  syncGrants: defineTable({
    organizationId: v.id('organizations'),
    publicId: v.string(),
    noteId: v.string(),
    resourceType: v.literal('Note'),
    userTokenIdentifier: v.string(),
    expiresAt: v.number(),
    createdAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_expires_at', ['expiresAt'])
    .index('by_organization_and_note', ['organizationId', 'noteId']),
  desktopSessionGrants: defineTable({
    publicId: v.string(),
    userTokenIdentifier: v.string(),
    accessToken: v.string(),
    refreshToken: v.string(),
    userJson: v.string(),
    impersonatorJson: v.optional(v.string()),
    returnTo: v.optional(v.string()),
    expiresAt: v.number(),
    createdAt: v.number(),
    consumedAt: v.optional(v.number())
  })
    .index('by_public_id', ['publicId'])
    .index('by_expires_at', ['expiresAt'])
    .index('by_user_token_identifier', ['userTokenIdentifier']),
  notifications: defineTable({
    organizationId: v.id('organizations'),
    recipientTokenIdentifier: v.string(),
    actorTokenIdentifier: v.string(),
    reason: v.union(
      v.literal('mention'),
      v.literal('parent_subscription'),
      v.literal('author'),
      v.literal('feedback_requested'),
      v.literal('project_subscription'),
      v.literal('permission_granted'),
      v.literal('comment_resolved'),
      v.literal('added'),
      v.literal('subject_archived'),
      v.literal('follow_up'),
      v.literal('post_resolved'),
      v.literal('post_resolved_from_comment'),
      v.literal('processing_complete')
    ),
    inboxKey: v.string(),
    isInbox: v.boolean(),
    activitySeen: v.boolean(),
    subjectType: v.string(),
    subjectId: v.string(),
    subjectTitle: v.optional(v.string()),
    targetType: v.string(),
    targetId: v.string(),
    targetTitle: v.string(),
    targetProjectId: v.optional(v.string()),
    targetResolved: v.optional(v.boolean()),
    subtargetType: v.optional(v.string()),
    subtargetId: v.optional(v.string()),
    reactionContent: v.optional(v.string()),
    reactionCustomContent: v.optional(
      v.object({
        id: v.string(),
        name: v.string(),
        file_url: v.string(),
        created_at: v.string()
      })
    ),
    followUpSubjectType: v.optional(v.string()),
    followUpSubjectId: v.optional(v.string()),
    previewUrl: v.optional(v.string()),
    previewIsCanvas: v.optional(v.boolean()),
    replyToBodyPreview: v.optional(v.string()),
    bodyPreviewPrefix: v.optional(v.string()),
    bodyPreviewPrefixFallback: v.optional(v.string()),
    bodyPreview: v.optional(v.string()),
    readAt: v.optional(v.number()),
    archivedAt: v.optional(v.number()),
    createdAt: v.number()
  })
    .index('by_recipient', ['recipientTokenIdentifier'])
    .index('by_organization_and_recipient', ['organizationId', 'recipientTokenIdentifier']),
  favorites: defineTable({
    organizationId: v.id('organizations'),
    userTokenIdentifier: v.string(),
    favoritableType: v.union(
      v.literal('Project'),
      v.literal('MessageThread'),
      v.literal('Note'),
      v.literal('Post'),
      v.literal('Call')
    ),
    favoritableId: v.string(),
    position: v.number(),
    createdAt: v.number()
  })
    .index('by_user_token_identifier', ['userTokenIdentifier'])
    .index('by_organization_and_user', ['organizationId', 'userTokenIdentifier'])
    .index('by_favoritable', ['favoritableType', 'favoritableId'])
    .index('by_organization_user_and_favoritable', [
      'organizationId',
      'userTokenIdentifier',
      'favoritableType',
      'favoritableId'
    ]),
  subscriptions: defineTable({
    organizationId: v.id('organizations'),
    userTokenIdentifier: v.string(),
    subscribableType: v.union(v.literal('Post'), v.literal('Project'), v.literal('Note')),
    subscribableId: v.string(),
    cascade: v.optional(v.boolean()),
    createdAt: v.number()
  })
    .index('by_subject', ['subscribableType', 'subscribableId'])
    .index('by_organization_and_user', ['organizationId', 'userTokenIdentifier'])
    .index('by_organization_user_and_subject', [
      'organizationId',
      'userTokenIdentifier',
      'subscribableType',
      'subscribableId'
    ]),
  followUps: defineTable({
    organizationId: v.id('organizations'),
    userTokenIdentifier: v.string(),
    subjectType: v.union(v.literal('Post'), v.literal('Note'), v.literal('Comment'), v.literal('Call')),
    subjectId: v.string(),
    targetType: v.string(),
    targetId: v.string(),
    targetTitle: v.string(),
    targetProjectId: v.optional(v.string()),
    showAt: v.number(),
    createdAt: v.number()
  })
    .index('by_subject', ['subjectType', 'subjectId'])
    .index('by_organization_and_user', ['organizationId', 'userTokenIdentifier'])
    .index('by_organization_user_and_subject', ['organizationId', 'userTokenIdentifier', 'subjectType', 'subjectId']),
  reactions: defineTable({
    organizationId: v.id('organizations'),
    userTokenIdentifier: v.string(),
    subjectType: v.union(v.literal('Post'), v.literal('Comment'), v.literal('Message')),
    subjectId: v.string(),
    content: v.optional(v.string()),
    customContent: v.optional(
      v.object({
        id: v.string(),
        name: v.string(),
        file_url: v.string(),
        created_at: v.string()
      })
    ),
    createdAt: v.number()
  })
    .index('by_subject', ['subjectType', 'subjectId'])
    .index('by_organization_user_and_subject', ['organizationId', 'userTokenIdentifier', 'subjectType', 'subjectId']),
  customReactions: defineTable({
    organizationId: v.id('organizations'),
    publicId: v.string(),
    name: v.string(),
    filePath: v.string(),
    fileType: v.string(),
    pack: v.optional(v.string()),
    creatorTokenIdentifier: v.string(),
    discardedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_organization_id', ['organizationId'])
    .index('by_organization_and_name', ['organizationId', 'name']),
  organizationMembershipRequests: defineTable({
    organizationId: v.id('organizations'),
    userTokenIdentifier: v.string(),
    createdAt: v.number()
  })
    .index('by_organization_id', ['organizationId'])
    .index('by_user_token_identifier', ['userTokenIdentifier'])
    .index('by_organization_and_user', ['organizationId', 'userTokenIdentifier']),
  projects: defineTable({
    organizationId: v.id('organizations'),
    creatorTokenIdentifier: v.string(),
    inviteToken: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    accessory: v.optional(v.string()),
    coverPhotoPath: v.optional(v.string()),
    messageThreadId: v.optional(v.string()),
    slackChannelId: v.optional(v.string()),
    private: v.boolean(),
    personal: v.boolean(),
    isGeneral: v.boolean(),
    isDefault: v.boolean(),
    displayReactions: v.optional(v.boolean()),
    displayAttachments: v.optional(v.boolean()),
    displayComments: v.optional(v.boolean()),
    displayResolved: v.optional(v.boolean()),
    archivedAt: v.optional(v.number()),
    lastActivityAt: v.number(),
    createdAt: v.number()
  })
    .index('by_organization_id', ['organizationId'])
    .index('by_organization_and_archived', ['organizationId', 'archivedAt'])
    .index('by_organization_and_general', ['organizationId', 'isGeneral'])
    .index('by_invite_token', ['inviteToken'])
    .index('by_message_thread_id', ['messageThreadId']),
  projectDisplayPreferences: defineTable({
    organizationId: v.id('organizations'),
    projectId: v.id('projects'),
    organizationMembershipId: v.id('organizationMemberships'),
    displayReactions: v.boolean(),
    displayAttachments: v.boolean(),
    displayComments: v.boolean(),
    displayResolved: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_project_id', ['projectId'])
    .index('by_membership_id', ['organizationMembershipId'])
    .index('by_project_and_membership', ['projectId', 'organizationMembershipId'])
    .index('by_organization_id', ['organizationId']),
  projectBookmarks: defineTable({
    organizationId: v.id('organizations'),
    projectId: v.id('projects'),
    publicId: v.string(),
    title: v.string(),
    url: v.string(),
    position: v.number(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_organization_id', ['organizationId'])
    .index('by_project_id', ['projectId'])
    .index('by_project_and_position', ['projectId', 'position'])
    .index('by_public_id', ['publicId']),
  projectPins: defineTable({
    organizationId: v.id('organizations'),
    projectId: v.id('projects'),
    organizationMembershipId: v.id('organizationMemberships'),
    publicId: v.string(),
    subjectType: v.union(v.literal('Post'), v.literal('Note'), v.literal('Call')),
    subjectId: v.string(),
    position: v.number(),
    discardedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_project_id', ['projectId'])
    .index('by_membership_id', ['organizationMembershipId'])
    .index('by_subject', ['subjectType', 'subjectId'])
    .index('by_project_and_discarded', ['projectId', 'discardedAt'])
    .index('by_project_and_subject', ['projectId', 'subjectType', 'subjectId'])
    .index('by_public_id', ['publicId']),
  projectMemberships: defineTable({
    organizationId: v.id('organizations'),
    projectId: v.id('projects'),
    userTokenIdentifier: v.string(),
    createdAt: v.number()
  })
    .index('by_project_id', ['projectId'])
    .index('by_organization_id', ['organizationId'])
    .index('by_project_and_user', ['projectId', 'userTokenIdentifier'])
    .index('by_organization_and_user', ['organizationId', 'userTokenIdentifier']),
  projectViews: defineTable({
    organizationId: v.id('organizations'),
    projectId: v.id('projects'),
    organizationMembershipId: v.id('organizationMemberships'),
    lastViewedAt: v.number(),
    manuallyMarkedUnreadAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_project_id', ['projectId'])
    .index('by_membership_id', ['organizationMembershipId'])
    .index('by_project_and_membership', ['projectId', 'organizationMembershipId'])
    .index('by_organization_id', ['organizationId']),
  messageThreads: defineTable({
    organizationId: v.id('organizations'),
    organizationSlug: v.string(),
    publicId: v.string(),
    creatorTokenIdentifier: v.string(),
    title: v.optional(v.string()),
    imagePath: v.optional(v.string()),
    group: v.boolean(),
    integrationDm: v.boolean(),
    oauthApplicationIds: v.array(v.string()),
    participantTokenIdentifiers: v.array(v.string()),
    forceNotificationSentBy: v.array(v.string()),
    projectId: v.optional(v.id('projects')),
    callRoomId: v.optional(v.id('callRooms')),
    lastMessageAt: v.optional(v.number()),
    latestMessagePublicId: v.optional(v.string()),
    latestMessageTruncated: v.optional(v.string()),
    membersCount: v.number(),
    discardedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_organization_id', ['organizationId'])
    .index('by_project_id', ['projectId'])
    .index('by_call_room_id', ['callRoomId'])
    .index('by_organization_and_discarded', ['organizationId', 'discardedAt'])
    .index('by_organization_and_last_message_at', ['organizationId', 'lastMessageAt']),
  messageThreadMemberships: defineTable({
    organizationId: v.id('organizations'),
    threadId: v.id('messageThreads'),
    publicId: v.string(),
    organizationMembershipId: v.optional(v.id('organizationMemberships')),
    oauthApplicationId: v.optional(v.string()),
    userTokenIdentifier: v.optional(v.string()),
    notificationLevel: v.union(v.literal('all'), v.literal('mentions'), v.literal('none')),
    lastReadAt: v.optional(v.number()),
    manuallyMarkedUnreadAt: v.optional(v.number()),
    unreadCount: v.number(),
    manuallyMarkedUnread: v.boolean(),
    joinedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_thread_id', ['threadId'])
    .index('by_organization_id', ['organizationId'])
    .index('by_public_id', ['publicId'])
    .index('by_organization_membership_id', ['organizationMembershipId'])
    .index('by_user_token_identifier', ['userTokenIdentifier'])
    .index('by_thread_and_membership', ['threadId', 'organizationMembershipId'])
    .index('by_thread_and_user', ['threadId', 'userTokenIdentifier'])
    .index('by_thread_and_oauth_application', ['threadId', 'oauthApplicationId']),
  messageThreadMembershipUpdates: defineTable({
    organizationId: v.id('organizations'),
    threadId: v.id('messageThreads'),
    actorMembershipId: v.optional(v.id('organizationMemberships')),
    actorTokenIdentifier: v.optional(v.string()),
    addedOrganizationMembershipIds: v.array(v.id('organizationMemberships')),
    removedOrganizationMembershipIds: v.array(v.id('organizationMemberships')),
    addedOauthApplicationIds: v.array(v.string()),
    removedOauthApplicationIds: v.array(v.string()),
    discardedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_thread_id', ['threadId'])
    .index('by_organization_id', ['organizationId'])
    .index('by_actor_membership_id', ['actorMembershipId'])
    .index('by_actor_token_identifier', ['actorTokenIdentifier'])
    .index('by_thread_and_discarded', ['threadId', 'discardedAt']),
  messages: defineTable({
    organizationId: v.id('organizations'),
    threadId: v.id('messageThreads'),
    publicId: v.string(),
    senderMembershipId: v.optional(v.id('organizationMemberships')),
    senderTokenIdentifier: v.optional(v.string()),
    content: v.string(),
    unfurledLink: v.optional(v.string()),
    replyToMessageId: v.optional(v.id('messages')),
    replyToPublicId: v.optional(v.string()),
    callId: v.optional(v.id('calls')),
    integrationId: v.optional(v.string()),
    oauthApplicationId: v.optional(v.string()),
    systemSharedPostId: v.optional(v.id('posts')),
    attachments: v.array(
      v.object({
        id: v.string(),
        filePath: v.string(),
        fileType: v.string(),
        previewFilePath: v.optional(v.string()),
        name: v.optional(v.string()),
        size: v.optional(v.number()),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        duration: v.optional(v.number()),
        noVideoTrack: v.optional(v.boolean())
      })
    ),
    discardedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_thread_id', ['threadId'])
    .index('by_organization_id', ['organizationId'])
    .index('by_sender_membership_id', ['senderMembershipId'])
    .index('by_sender_token_identifier', ['senderTokenIdentifier'])
    .index('by_call_id', ['callId'])
    .index('by_thread_and_created_at', ['threadId', 'createdAt'])
    .index('by_thread_and_discarded', ['threadId', 'discardedAt']),
  messageNotifications: defineTable({
    organizationId: v.id('organizations'),
    threadMembershipId: v.id('messageThreadMemberships'),
    messageId: v.id('messages'),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_thread_membership_id', ['threadMembershipId'])
    .index('by_message_id', ['messageId'])
    .index('by_organization_id', ['organizationId'])
    .index('by_membership_and_message', ['threadMembershipId', 'messageId']),
  organizationInvitations: defineTable({
    publicId: v.optional(v.string()),
    organizationId: v.id('organizations'),
    senderTokenIdentifier: v.string(),
    recipientTokenIdentifier: v.optional(v.string()),
    email: v.string(),
    role: v.union(v.literal('admin'), v.literal('member'), v.literal('viewer'), v.literal('guest')),
    inviteToken: v.string(),
    projectIds: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
    expiresAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_organization_id', ['organizationId'])
    .index('by_invite_token', ['inviteToken'])
    .index('by_email', ['email'])
    .index('by_organization_and_email', ['organizationId', 'email']),
  organizationInvitationProjects: defineTable({
    organizationInvitationId: v.id('organizationInvitations'),
    projectId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_organization_invitation_id', ['organizationInvitationId'])
    .index('by_project_id', ['projectId'])
    .index('by_invitation_and_project', ['organizationInvitationId', 'projectId']),
  organizationSettings: defineTable({
    organizationId: v.id('organizations'),
    key: v.string(),
    value: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_organization_id', ['organizationId'])
    .index('by_organization_and_key', ['organizationId', 'key']),
  permissions: defineTable({
    publicId: v.optional(v.string()),
    subjectType: v.string(),
    subjectId: v.string(),
    userTokenIdentifier: v.optional(v.string()),
    oauthApplicationPublicId: v.optional(v.string()),
    permission: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
    discardedAt: v.optional(v.number())
  })
    .index('by_public_id', ['publicId'])
    .index('by_subject', ['subjectType', 'subjectId'])
    .index('by_subject_and_user', ['subjectType', 'subjectId', 'userTokenIdentifier'])
    .index('by_oauth_application_public_id', ['oauthApplicationPublicId']),
  posts: defineTable({
    organizationId: v.id('organizations'),
    authorTokenIdentifier: v.string(),
    title: v.string(),
    descriptionHtml: v.string(),
    unfurledLink: v.optional(v.string()),
    status: v.union(v.literal('none'), v.literal('feedback_requested')),
    visibility: v.union(v.literal('default'), v.literal('public')),
    projectId: v.optional(v.string()),
    draft: v.boolean(),
    links: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        url: v.string()
      })
    ),
    attachments: v.array(
      v.object({
        id: v.string(),
        filePath: v.string(),
        fileType: v.string(),
        previewFilePath: v.optional(v.string()),
        name: v.optional(v.string()),
        size: v.optional(v.number()),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        duration: v.optional(v.number())
      })
    ),
    parentId: v.optional(v.id('posts')),
    rootPostId: v.optional(v.id('posts')),
    version: v.optional(v.number()),
    resolvedAt: v.optional(v.number()),
    resolvedByMembershipId: v.optional(v.id('organizationMemberships')),
    resolvedHtml: v.optional(v.string()),
    resolvedCommentId: v.optional(v.id('comments')),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastActivityAt: v.number(),
    publishedAt: v.optional(v.number())
  })
    .index('by_organization_id', ['organizationId'])
    .index('by_organization_and_author', ['organizationId', 'authorTokenIdentifier'])
    .index('by_parent_id', ['parentId'])
    .index('by_root_post_id', ['rootPostId']),
  polls: defineTable({
    organizationId: v.id('organizations'),
    postId: v.id('posts'),
    publicId: v.string(),
    description: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_organization_id', ['organizationId'])
    .index('by_post_id', ['postId'])
    .index('by_public_id', ['publicId']),
  pollOptions: defineTable({
    organizationId: v.id('organizations'),
    pollId: v.id('polls'),
    publicId: v.string(),
    description: v.string(),
    position: v.number(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_organization_id', ['organizationId'])
    .index('by_poll_id', ['pollId'])
    .index('by_public_id', ['publicId'])
    .index('by_poll_and_position', ['pollId', 'position']),
  pollVotes: defineTable({
    organizationId: v.id('organizations'),
    pollId: v.id('polls'),
    pollOptionId: v.id('pollOptions'),
    userTokenIdentifier: v.string(),
    createdAt: v.number()
  })
    .index('by_organization_id', ['organizationId'])
    .index('by_poll_id', ['pollId'])
    .index('by_poll_option_id', ['pollOptionId'])
    .index('by_poll_and_user', ['pollId', 'userTokenIdentifier'])
    .index('by_option_and_user', ['pollOptionId', 'userTokenIdentifier']),
  postFeedbackRequests: defineTable({
    organizationId: v.id('organizations'),
    postId: v.id('posts'),
    publicId: v.string(),
    organizationMembershipId: v.id('organizationMemberships'),
    userTokenIdentifier: v.string(),
    hasReplied: v.boolean(),
    discardedAt: v.optional(v.number()),
    dismissedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_organization_id', ['organizationId'])
    .index('by_post_id', ['postId'])
    .index('by_public_id', ['publicId'])
    .index('by_post_and_membership', ['postId', 'organizationMembershipId'])
    .index('by_post_and_user', ['postId', 'userTokenIdentifier']),
  openGraphLinks: defineTable({
    url: v.string(),
    title: v.string(),
    imagePath: v.optional(v.string()),
    faviconPath: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_url', ['url']),
  postDigests: defineTable({
    organizationId: v.id('organizations'),
    publicId: v.string(),
    creatorTokenIdentifier: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
    discardedAt: v.optional(v.number()),
    filterTagIdsJson: v.optional(v.string()),
    filterProjectIdsJson: v.optional(v.string()),
    filterMemberIdsJson: v.optional(v.string()),
    excludePostIdsJson: v.optional(v.string()),
    filterFrom: v.optional(v.string()),
    filterTo: v.optional(v.string()),
    basic: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_organization_id', ['organizationId'])
    .index('by_creator_token_identifier', ['creatorTokenIdentifier']),
  postDigestBasicPosts: defineTable({
    postDigestId: v.id('postDigests'),
    postId: v.id('posts'),
    position: v.number(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_post_digest_id', ['postDigestId'])
    .index('by_post_id', ['postId'])
    .index('by_post_digest_and_position', ['postDigestId', 'position']),
  postDigestNotes: defineTable({
    organizationId: v.id('organizations'),
    publicId: v.string(),
    organizationMembershipId: v.id('organizationMemberships'),
    postId: v.id('posts'),
    postDigestId: v.id('postDigests'),
    title: v.string(),
    content: v.optional(v.string()),
    contentHtml: v.optional(v.string()),
    discardedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_organization_membership_id', ['organizationMembershipId'])
    .index('by_post_digest_id', ['postDigestId'])
    .index('by_post_id', ['postId'])
    .index('by_post_and_post_digest', ['postId', 'postDigestId']),
  postHierarchies: defineTable({
    organizationId: v.id('organizations'),
    ancestorPostId: v.id('posts'),
    descendantPostId: v.id('posts'),
    generations: v.number()
  })
    .index('by_ancestor_id', ['ancestorPostId'])
    .index('by_descendant_id', ['descendantPostId'])
    .index('by_ancestor_descendant_generations', ['ancestorPostId', 'descendantPostId', 'generations']),
  postLinkPreviews: defineTable({
    organizationId: v.id('organizations'),
    publicId: v.string(),
    postId: v.id('posts'),
    url: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    videoUrl: v.optional(v.string()),
    serviceLogo: v.optional(v.string()),
    serviceName: v.string(),
    preview: v.optional(v.boolean()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_post_id', ['postId']),
  postLinks: defineTable({
    organizationId: v.id('organizations'),
    publicId: v.string(),
    postId: v.id('posts'),
    url: v.string(),
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_post_id', ['postId']),
  notes: defineTable({
    organizationId: v.id('organizations'),
    organizationMembershipId: v.id('organizationMemberships'),
    publicId: v.string(),
    originalDigestPublicId: v.optional(v.string()),
    title: v.optional(v.string()),
    descriptionHtml: v.optional(v.string()),
    descriptionState: v.optional(v.string()),
    descriptionSchemaVersion: v.number(),
    commentsCount: v.number(),
    resolvedCommentsCount: v.optional(v.number()),
    visibility: v.union(v.literal('default'), v.literal('public')),
    nonMemberViewsCount: v.number(),
    projectId: v.optional(v.id('projects')),
    projectPermission: v.union(v.literal('none'), v.literal('view'), v.literal('edit')),
    discardedAt: v.optional(v.number()),
    lastActivityAt: v.optional(v.number()),
    contentUpdatedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_organization_id', ['organizationId'])
    .index('by_organization_membership_id', ['organizationMembershipId'])
    .index('by_project_id', ['projectId'])
    .index('by_public_id', ['publicId'])
    .index('by_organization_and_original_digest_public_id', ['organizationId', 'originalDigestPublicId']),
  comments: defineTable({
    organizationId: v.id('organizations'),
    postId: v.id('posts'),
    authorTokenIdentifier: v.string(),
    bodyHtml: v.string(),
    parentCommentId: v.optional(v.id('comments')),
    attachmentId: v.optional(v.string()),
    timestamp: v.optional(v.number()),
    x: v.optional(v.number()),
    y: v.optional(v.number()),
    noteHighlight: v.optional(v.string()),
    attachments: v.array(
      v.object({
        id: v.string(),
        filePath: v.string(),
        fileType: v.string(),
        previewFilePath: v.optional(v.string()),
        name: v.optional(v.string()),
        size: v.optional(v.number()),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        duration: v.optional(v.number())
      })
    ),
    resolvedAt: v.optional(v.number()),
    resolvedByMembershipId: v.optional(v.id('organizationMemberships')),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_organization_id', ['organizationId'])
    .index('by_post_id', ['postId'])
    .index('by_attachment_id', ['attachmentId']),
  calls: defineTable({
    organizationId: v.id('organizations'),
    publicId: v.string(),
    remoteSessionId: v.string(),
    callRoomId: v.optional(v.string()),
    creatorTokenIdentifier: v.optional(v.string()),
    title: v.optional(v.string()),
    summaryHtml: v.optional(v.string()),
    generatedTitle: v.optional(v.string()),
    recordingsDuration: v.optional(v.number()),
    startedAt: v.number(),
    stoppedAt: v.optional(v.number()),
    projectId: v.optional(v.id('projects')),
    projectPermission: v.union(v.literal('none'), v.literal('view'), v.literal('edit')),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_organization_id', ['organizationId'])
    .index('by_project_id', ['projectId'])
    .index('by_public_id', ['publicId'])
    .index('by_call_room_id', ['callRoomId'])
    .index('by_remote_session_id', ['remoteSessionId'])
    .index('by_started_at', ['startedAt']),
  callRooms: defineTable({
    organizationId: v.id('organizations'),
    publicId: v.string(),
    creatorMembershipId: v.optional(v.id('organizationMemberships')),
    personalMembershipId: v.optional(v.id('organizationMemberships')),
    title: v.optional(v.string()),
    source: v.union(v.literal('subject'), v.literal('new_call_button'), v.literal('cal_dot_com'), v.literal('personal')),
    remoteRoomId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_organization_id', ['organizationId'])
    .index('by_remote_room_id', ['remoteRoomId'])
    .index('by_personal_membership_id', ['personalMembershipId'])
    .index('by_organization_and_personal_membership', ['organizationId', 'personalMembershipId']),
  callRoomInvitations: defineTable({
    callRoomId: v.id('callRooms'),
    organizationId: v.id('organizations'),
    creatorMembershipId: v.id('organizationMemberships'),
    inviteeMembershipId: v.id('organizationMemberships'),
    discardedAt: v.optional(v.number()),
    createdAt: v.number()
  })
    .index('by_call_room_id', ['callRoomId'])
    .index('by_invitee_membership_id', ['inviteeMembershipId'])
    .index('by_call_room_and_invitee', ['callRoomId', 'inviteeMembershipId']),
  callPeers: defineTable({
    organizationId: v.id('organizations'),
    callId: v.id('calls'),
    organizationMembershipId: v.optional(v.id('organizationMemberships')),
    userTokenIdentifier: v.optional(v.string()),
    remotePeerId: v.string(),
    name: v.string(),
    joinedAt: v.optional(v.number()),
    leftAt: v.optional(v.number()),
    discardedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_call_id', ['callId'])
    .index('by_remote_peer_id', ['remotePeerId'])
    .index('by_call_and_remote_peer', ['callId', 'remotePeerId'])
    .index('by_membership_id', ['organizationMembershipId']),
  callRecordings: defineTable({
    organizationId: v.id('organizations'),
    callId: v.id('calls'),
    publicId: v.string(),
    remoteRecordingId: v.optional(v.string()),
    remoteBeamId: v.optional(v.string()),
    remoteTranscriptionId: v.optional(v.string()),
    name: v.optional(v.string()),
    filePath: v.optional(v.string()),
    chatFilePath: v.optional(v.string()),
    transcriptJsonFilePath: v.optional(v.string()),
    transcriptSrtFilePath: v.optional(v.string()),
    transcriptTxtFilePath: v.optional(v.string()),
    transcriptionVtt: v.optional(v.string()),
    thumbnailUrl: v.optional(v.string()),
    fileType: v.optional(v.string()),
    size: v.optional(v.number()),
    duration: v.optional(v.number()),
    maxWidth: v.optional(v.number()),
    maxHeight: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    stoppedAt: v.optional(v.number()),
    transcriptionStartedAt: v.optional(v.number()),
    transcriptionSucceededAt: v.optional(v.number()),
    transcriptionFailedAt: v.optional(v.number()),
    discardedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_call_id', ['callId'])
    .index('by_public_id', ['publicId'])
    .index('by_remote_recording_id', ['remoteRecordingId'])
    .index('by_remote_beam_id', ['remoteBeamId'])
    .index('by_remote_transcription_id', ['remoteTranscriptionId'])
    .index('by_call_and_discarded', ['callId', 'discardedAt']),
  callRecordingChatLinks: defineTable({
    organizationId: v.id('organizations'),
    callRecordingId: v.id('callRecordings'),
    remoteMessageId: v.string(),
    message: v.string(),
    sentAt: v.optional(v.number()),
    createdAt: v.number()
  })
    .index('by_call_recording_id', ['callRecordingId'])
    .index('by_remote_message_id', ['remoteMessageId'])
    .index('by_recording_and_remote_message', ['callRecordingId', 'remoteMessageId']),
  callRecordingSpeakers: defineTable({
    organizationId: v.id('organizations'),
    callRecordingId: v.id('callRecordings'),
    callPeerId: v.optional(v.id('callPeers')),
    organizationMembershipId: v.optional(v.id('organizationMemberships')),
    name: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_call_recording_id', ['callRecordingId'])
    .index('by_call_peer_id', ['callPeerId'])
    .index('by_recording_and_name', ['callRecordingId', 'name']),
  callRecordingSummarySections: defineTable({
    organizationId: v.id('organizations'),
    callRecordingId: v.id('callRecordings'),
    key: v.string(),
    title: v.string(),
    summaryHtml: v.optional(v.string()),
    status: v.union(v.literal('pending'), v.literal('success'), v.literal('failed')),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_call_recording_id', ['callRecordingId'])
    .index('by_recording_and_key', ['callRecordingId', 'key'])
    .index('by_status', ['status']),
  oauthApplications: defineTable({
    organizationId: v.id('organizations'),
    publicId: v.string(),
    name: v.string(),
    uid: v.string(),
    secret: v.string(),
    redirectUri: v.optional(v.string()),
    scopes: v.string(),
    confidential: v.boolean(),
    avatarPath: v.optional(v.string()),
    discardedAt: v.optional(v.number()),
    creatorMembershipId: v.optional(v.id('organizationMemberships')),
    lastCopiedSecretAt: v.optional(v.number()),
    provider: v.optional(v.string()),
    projectIds: v.array(v.string()),
    threadIds: v.array(v.string()),
    webhooks: v.array(
      v.object({
        id: v.string(),
        url: v.string(),
        state: v.literal('enabled'),
        secret: v.string(),
        eventTypes: v.array(v.string())
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_uid', ['uid'])
    .index('by_organization_id', ['organizationId'])
    .index('by_creator_membership_id', ['creatorMembershipId'])
    .index('by_organization_and_discarded', ['organizationId', 'discardedAt']),
  oauthAccessTokens: defineTable({
    organizationId: v.id('organizations'),
    applicationId: v.id('oauthApplications'),
    token: v.string(),
    refreshToken: v.optional(v.string()),
    previousRefreshToken: v.optional(v.string()),
    previousToken: v.optional(v.string()),
    resourceOwnerTokenIdentifier: v.optional(v.string()),
    resourceOwnerType: v.string(),
    scopes: v.optional(v.string()),
    expiresIn: v.optional(v.number()),
    revokedAt: v.optional(v.number()),
    createdAt: v.number()
  })
    .index('by_token', ['token'])
    .index('by_refresh_token', ['refreshToken'])
    .index('by_application_id', ['applicationId'])
    .index('by_organization_id', ['organizationId'])
    .index('by_resource_owner', ['resourceOwnerTokenIdentifier', 'resourceOwnerType']),
  oauthAccessGrants: defineTable({
    organizationId: v.id('organizations'),
    applicationId: v.id('oauthApplications'),
    token: v.string(),
    resourceOwnerTokenIdentifier: v.string(),
    resourceOwnerType: v.string(),
    redirectUri: v.string(),
    scopes: v.string(),
    expiresIn: v.number(),
    codeChallenge: v.optional(v.string()),
    codeChallengeMethod: v.optional(v.string()),
    revokedAt: v.optional(v.number()),
    createdAt: v.number()
  })
    .index('by_token', ['token'])
    .index('by_application_id', ['applicationId'])
    .index('by_organization_id', ['organizationId'])
    .index('by_resource_owner', ['resourceOwnerTokenIdentifier', 'resourceOwnerType']),
  integrations: defineTable({
    publicId: v.string(),
    provider: v.string(),
    name: v.string(),
    organizationId: v.optional(v.id('organizations')),
    userTokenIdentifier: v.optional(v.string()),
    providerAccountId: v.optional(v.string()),
    accessToken: v.optional(v.string()),
    refreshToken: v.optional(v.string()),
    scopes: v.array(v.string()),
    metadataJson: v.optional(v.string()),
    discardedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_provider', ['provider'])
    .index('by_organization_and_provider', ['organizationId', 'provider'])
    .index('by_user_and_provider', ['userTokenIdentifier', 'provider']),
  integrationTeams: defineTable({
    integrationId: v.id('integrations'),
    organizationId: v.optional(v.id('organizations')),
    publicId: v.string(),
    providerTeamId: v.string(),
    name: v.string(),
    key: v.optional(v.string()),
    private: v.boolean(),
    metadataJson: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_integration_id', ['integrationId'])
    .index('by_public_id', ['publicId'])
    .index('by_provider_team_id', ['providerTeamId'])
    .index('by_org_and_provider_team_id', ['organizationId', 'providerTeamId']),
  integrationChannels: defineTable({
    integrationId: v.id('integrations'),
    organizationId: v.optional(v.id('organizations')),
    publicId: v.string(),
    providerChannelId: v.string(),
    name: v.string(),
    private: v.boolean(),
    syncedAt: v.optional(v.number()),
    metadataJson: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_integration_id', ['integrationId'])
    .index('by_public_id', ['publicId'])
    .index('by_provider_channel_id', ['providerChannelId'])
    .index('by_org_and_provider_channel_id', ['organizationId', 'providerChannelId']),
  integrationChannelMembers: defineTable({
    integrationChannelId: v.id('integrationChannels'),
    organizationMembershipId: v.optional(v.id('organizationMemberships')),
    userTokenIdentifier: v.optional(v.string()),
    providerMemberId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_channel_id', ['integrationChannelId'])
    .index('by_membership_id', ['organizationMembershipId'])
    .index('by_user_token_identifier', ['userTokenIdentifier']),
  integrationData: defineTable({
    integrationId: v.id('integrations'),
    key: v.string(),
    valueJson: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_integration_id', ['integrationId'])
    .index('by_integration_and_key', ['integrationId', 'key']),
  integrationOrganizationMemberships: defineTable({
    integrationId: v.id('integrations'),
    organizationMembershipId: v.id('organizationMemberships'),
    providerMemberId: v.optional(v.string()),
    notificationsEnabled: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_integration_id', ['integrationId'])
    .index('by_membership_id', ['organizationMembershipId'])
    .index('by_integration_and_membership', ['integrationId', 'organizationMembershipId']),
  integrationOrganizationMembershipData: defineTable({
    integrationOrganizationMembershipId: v.id('integrationOrganizationMemberships'),
    key: v.string(),
    valueJson: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_integration_membership_id', ['integrationOrganizationMembershipId'])
    .index('by_integration_membership_and_key', ['integrationOrganizationMembershipId', 'key']),
  externalRecords: defineTable({
    organizationId: v.optional(v.id('organizations')),
    provider: v.string(),
    subjectType: v.string(),
    subjectPublicId: v.string(),
    externalId: v.string(),
    dataJson: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_provider', ['provider'])
    .index('by_subject', ['subjectType', 'subjectPublicId'])
    .index('by_provider_and_external_id', ['provider', 'externalId']),
  figmaFiles: defineTable({
    organizationId: v.optional(v.id('organizations')),
    integrationId: v.optional(v.id('integrations')),
    publicId: v.string(),
    providerFileId: v.string(),
    name: v.string(),
    shareUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_provider_file_id', ['providerFileId'])
    .index('by_organization_id', ['organizationId'])
    .index('by_integration_id', ['integrationId']),
  figmaKeyPairs: defineTable({
    userTokenIdentifier: v.string(),
    publicKey: v.string(),
    privateKey: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_user_token_identifier', ['userTokenIdentifier']),
  figmaUsers: defineTable({
    integrationId: v.optional(v.id('integrations')),
    userTokenIdentifier: v.optional(v.string()),
    providerUserId: v.string(),
    handle: v.optional(v.string()),
    email: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_integration_id', ['integrationId'])
    .index('by_user_token_identifier', ['userTokenIdentifier'])
    .index('by_provider_user_id', ['providerUserId']),
  githubRepositories: defineTable({
    organizationId: v.optional(v.id('organizations')),
    integrationId: v.optional(v.id('integrations')),
    providerRepositoryId: v.string(),
    owner: v.string(),
    name: v.string(),
    fullName: v.string(),
    htmlUrl: v.optional(v.string()),
    defaultBranch: v.optional(v.string()),
    private: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_provider_repository_id', ['providerRepositoryId'])
    .index('by_integration_id', ['integrationId'])
    .index('by_organization_id', ['organizationId']),
  webhooks: defineTable({
    organizationId: v.optional(v.id('organizations')),
    oauthApplicationId: v.optional(v.id('oauthApplications')),
    publicId: v.string(),
    provider: v.optional(v.string()),
    url: v.string(),
    secret: v.string(),
    state: v.string(),
    eventTypes: v.array(v.string()),
    discardedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_oauth_application_id', ['oauthApplicationId'])
    .index('by_organization_id', ['organizationId']),
  webhookEvents: defineTable({
    organizationId: v.optional(v.id('organizations')),
    webhookId: v.id('webhooks'),
    publicId: v.string(),
    eventType: v.string(),
    payloadJson: v.string(),
    status: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_webhook_id', ['webhookId'])
    .index('by_organization_id', ['organizationId']),
  webhookDeliveries: defineTable({
    organizationId: v.optional(v.id('organizations')),
    webhookId: v.id('webhooks'),
    webhookEventId: v.id('webhookEvents'),
    responseStatus: v.optional(v.number()),
    responseBody: v.optional(v.string()),
    attemptedAt: v.number(),
    deliveredAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_webhook_id', ['webhookId'])
    .index('by_webhook_event_id', ['webhookEventId'])
    .index('by_organization_id', ['organizationId']),
  pushSubscriptions: defineTable({
    userTokenIdentifier: v.string(),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_endpoint', ['endpoint'])
    .index('by_user_token_identifier', ['userTokenIdentifier'])
    .index('by_user_and_endpoint', ['userTokenIdentifier', 'endpoint']),
  productLogs: defineTable({
    userTokenIdentifier: v.optional(v.string()),
    orgSlug: v.optional(v.string()),
    name: v.string(),
    dataJson: v.optional(v.string()),
    logTs: v.number(),
    sessionId: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    metadataJson: v.optional(v.string()),
    createdAt: v.number()
  })
    .index('by_user_token_identifier', ['userTokenIdentifier'])
    .index('by_name', ['name'])
    .index('by_session_id', ['sessionId']),
  timelineEvents: defineTable({
    organizationId: v.optional(v.id('organizations')),
    publicId: v.string(),
    actorType: v.optional(v.string()),
    actorTokenIdentifier: v.optional(v.string()),
    actorMembershipId: v.optional(v.id('organizationMemberships')),
    subjectType: v.string(),
    subjectId: v.string(),
    referenceType: v.optional(v.string()),
    referenceId: v.optional(v.string()),
    action: v.string(),
    metadataJson: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_action', ['action'])
    .index('by_subject', ['subjectType', 'subjectId'])
    .index('by_reference', ['referenceType', 'referenceId'])
    .index('by_actor_token_identifier', ['actorTokenIdentifier']),
  preferences: defineTable({
    subjectType: v.string(),
    subjectId: v.string(),
    key: v.string(),
    value: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_key', ['key'])
    .index('by_subject', ['subjectType', 'subjectId'])
    .index('by_subject_and_key', ['subjectType', 'subjectId', 'key']),
  userPreferences: defineTable({
    userId: v.id('users'),
    key: v.string(),
    value: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_key', ['key'])
    .index('by_user_id', ['userId'])
    .index('by_user_id_and_key', ['userId', 'key']),
  emailBounces: defineTable({
    email: v.string(),
    reason: v.optional(v.string()),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    bouncedAt: v.optional(v.number())
  }).index('by_email', ['email']),
  friendlyIdSlugs: defineTable({
    slug: v.string(),
    sluggableType: v.string(),
    sluggableId: v.string(),
    createdAt: v.number()
  })
    .index('by_slug', ['slug'])
    .index('by_sluggable', ['sluggableType', 'sluggableId']),
  console1984Users: defineTable({
    username: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_username', ['username']),
  console1984Sessions: defineTable({
    console1984UserId: v.id('console1984Users'),
    reason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_console1984_user_id', ['console1984UserId'])
    .index('by_console1984_user_and_created_at', ['console1984UserId', 'createdAt']),
  console1984SensitiveAccesses: defineTable({
    console1984SessionId: v.id('console1984Sessions'),
    justification: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_console1984_session_id', ['console1984SessionId']),
  console1984Commands: defineTable({
    console1984SessionId: v.id('console1984Sessions'),
    console1984SensitiveAccessId: v.optional(v.id('console1984SensitiveAccesses')),
    statements: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_console1984_session_id', ['console1984SessionId'])
    .index('by_session_created_and_sensitive', ['console1984SessionId', 'createdAt', 'console1984SensitiveAccessId']),
  dataExports: defineTable({
    organizationId: v.id('organizations'),
    publicId: v.string(),
    subjectType: v.string(),
    subjectId: v.string(),
    subjectName: v.optional(v.string()),
    organizationMembershipId: v.id('organizationMemberships'),
    requesterTokenIdentifier: v.string(),
    zipPath: v.optional(v.string()),
    downloadUrl: v.optional(v.string()),
    status: v.union(v.literal('pending'), v.literal('processing'), v.literal('completed'), v.literal('error')),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_organization_id', ['organizationId'])
    .index('by_subject', ['subjectType', 'subjectId'])
    .index('by_membership_id', ['organizationMembershipId']),
  dataExportResources: defineTable({
    dataExportId: v.id('dataExports'),
    resourceType: v.string(),
    resourceId: v.optional(v.string()),
    resourcePublicId: v.optional(v.string()),
    resourceName: v.optional(v.string()),
    status: v.union(v.literal('pending'), v.literal('completed'), v.literal('error')),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_data_export_id', ['dataExportId'])
    .index('by_resource_type_and_id', ['resourceType', 'resourceId']),
  events: defineTable({
    organizationId: v.optional(v.id('organizations')),
    publicId: v.string(),
    actorType: v.optional(v.string()),
    actorId: v.optional(v.string()),
    subjectType: v.string(),
    subjectId: v.string(),
    action: v.string(),
    metadataJson: v.optional(v.string()),
    processedAt: v.optional(v.number()),
    skipNotifications: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_organization_id', ['organizationId'])
    .index('by_subject', ['subjectType', 'subjectId'])
    .index('by_actor', ['actorType', 'actorId']),
  feedbacks: defineTable({
    organizationId: v.optional(v.id('organizations')),
    publicId: v.string(),
    userId: v.id('users'),
    userTokenIdentifier: v.string(),
    description: v.string(),
    feedbackType: v.union(v.literal('bug'), v.literal('feature'), v.literal('general')),
    currentUrl: v.string(),
    browserInfo: v.optional(v.string()),
    osInfo: v.optional(v.string()),
    screenshotPath: v.optional(v.string()),
    postedToLinearAt: v.optional(v.number()),
    sentToPlainAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_organization_id', ['organizationId'])
    .index('by_user_id', ['userId']),
  flipperFeatures: defineTable({
    key: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  }).index('by_key', ['key']),
  flipperGates: defineTable({
    flipperFeatureId: v.id('flipperFeatures'),
    key: v.string(),
    value: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_flipper_feature_id', ['flipperFeatureId'])
    .index('by_feature_and_key', ['flipperFeatureId', 'key']),
  flipperAuditLogs: defineTable({
    publicId: v.string(),
    userId: v.optional(v.id('users')),
    featureName: v.string(),
    operation: v.string(),
    gateName: v.optional(v.string()),
    thingJson: v.optional(v.string()),
    gateValuesSnapshotJson: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_feature_name', ['featureName'])
    .index('by_user_id', ['userId']),
  llmResponses: defineTable({
    publicId: v.string(),
    subjectType: v.string(),
    subjectId: v.string(),
    invocationKey: v.string(),
    prompt: v.string(),
    response: v.string(),
    createdAt: v.number(),
    updatedAt: v.number()
  })
    .index('by_public_id', ['publicId'])
    .index('by_invocation_key', ['invocationKey'])
    .index('by_subject', ['subjectType', 'subjectId'])
})
