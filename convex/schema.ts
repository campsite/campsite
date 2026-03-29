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
  users: defineTable({
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
    preferences: v.optional(v.record(v.string(), v.string())),
    notificationPauseExpiresAt: v.optional(v.number()),
    createdAt: v.number(),
    lastSeenAt: v.number()
  }).index('by_token_identifier', ['tokenIdentifier']),
  organizations: defineTable({
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
    createdAt: v.number()
  })
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
  organizationMemberships: defineTable({
    organizationId: v.id('organizations'),
    userTokenIdentifier: v.string(),
    role: v.union(v.literal('admin'), v.literal('member'), v.literal('viewer'), v.literal('guest')),
    createdAt: v.number(),
    discardedAt: v.optional(v.number()),
    lastSeenAt: v.optional(v.number()),
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
    .index('by_user_token_identifier', ['userTokenIdentifier'])
    .index('by_organization_id', ['organizationId'])
    .index('by_organization_and_user', ['organizationId', 'userTokenIdentifier']),
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
    archivedAt: v.optional(v.number()),
    lastActivityAt: v.number(),
    createdAt: v.number()
  })
    .index('by_organization_id', ['organizationId'])
    .index('by_organization_and_archived', ['organizationId', 'archivedAt'])
    .index('by_organization_and_general', ['organizationId', 'isGeneral'])
    .index('by_message_thread_id', ['messageThreadId']),
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
    organizationId: v.id('organizations'),
    senderTokenIdentifier: v.string(),
    recipientTokenIdentifier: v.optional(v.string()),
    email: v.string(),
    role: v.union(v.literal('admin'), v.literal('member'), v.literal('viewer'), v.literal('guest')),
    inviteToken: v.string(),
    projectIds: v.array(v.string()),
    createdAt: v.number(),
    expiresAt: v.number()
  })
    .index('by_organization_id', ['organizationId'])
    .index('by_invite_token', ['inviteToken'])
    .index('by_email', ['email'])
    .index('by_organization_and_email', ['organizationId', 'email']),
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
    createdAt: v.number(),
    updatedAt: v.number(),
    lastActivityAt: v.number(),
    publishedAt: v.optional(v.number())
  })
    .index('by_organization_id', ['organizationId'])
    .index('by_organization_and_author', ['organizationId', 'authorTokenIdentifier']),
  notes: defineTable({
    organizationId: v.id('organizations'),
    organizationMembershipId: v.id('organizationMemberships'),
    publicId: v.string(),
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
    .index('by_public_id', ['publicId']),
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
    .index('by_actor_token_identifier', ['actorTokenIdentifier'])
})
