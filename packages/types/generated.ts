/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export type UserNotificationCounts = {
  inbox: Record<string, number>
  messages: Record<string, number>
  activity: Record<string, number>
  home_inbox: Record<string, number>
}

export type OrganizationActivityViewsPostRequest = {
  last_seen_at: string
}

export type AvatarUrls = {
  xs: string
  sm: string
  base: string
  lg: string
  xl: string
  xxl: string
}

export type User = {
  id: string
  avatar_url: string
  avatar_urls: AvatarUrls
  cover_photo_url: string | null
  email: string
  username: string
  display_name: string
  system: boolean
  integration: boolean
  notifications_paused: boolean
  notification_pause_expires_at: string | null
  timezone: string | null
  logged_in: boolean
  type_name: string
}

export type OrganizationMembershipStatus = {
  message: string
  emoji: string
  expiration_setting: '30m' | '1h' | '4h' | 'today' | 'this_week' | 'custom'
  expires_at: string | null
  pause_notifications: boolean
  expires_in: '30m' | '1h' | '4h' | 'today' | 'this_week' | 'custom'
}

export type OrganizationMember = {
  id: string
  role: 'admin' | 'member' | 'viewer' | 'guest'
  created_at: string
  deactivated: boolean
  is_organization_member: boolean
  user: User
  status: OrganizationMembershipStatus | null
}

export type ImageUrls = {
  original_url: string
  thumbnail_url: string
  feed_url: string
  email_url: string
  slack_url: string
  large_url: string
}

export type Attachment = {
  id: string
  file_type: string
  url: string
  app_url: string
  download_url: string
  preview_url: string | null
  preview_thumbnail_url: string | null
  image_urls: ImageUrls | null
  link: boolean
  image: boolean
  video: boolean
  audio: boolean
  origami: boolean
  principle: boolean
  lottie: boolean
  stitch: boolean
  gif: boolean
  duration: number
  width: number
  height: number
  subject_type: string | null
  name: string | null
  size: number | null
  remote_figma_url: string | null
  no_video_track: boolean
  gallery_id: string | null
  type_name: string
  subject_id: string | null
  is_subject_comment: boolean
  relative_url: string
  preview_relative_url: string | null
  comments_count: number
  key: string | null
  optimistic_id?: string | null
  optimistic_file_path?: string | null
  optimistic_preview_file_path?: string | null
  optimistic_imgix_video_file_path?: string | null
  optimistic_src?: string | null
  optimistic_preview_src?: string | null
  optimistic_ready: boolean
  client_error?: string | null
}

export type OrganizationAttachmentsPostRequest = {
  figma_file_id?: number | null
  file_path: string
  file_type: string
  imgix_video_file_path?: string
  name?: string | null
  preview_file_path?: string | null
  figma_share_url?: string
  remote_figma_node_id?: string | null
  remote_figma_node_name?: string | null
  remote_figma_node_type?: string | null
  duration?: number
  size?: number | null
  height?: number
  width?: number
  no_video_track?: boolean
  gallery_id?: string | null
}

export type BatchedPostViewsPostResponse = object

export type BatchedPostViewsPostRequest = {
  views: {
    member_id?: string | null
    post_id: string
    log_ts: number
    read: boolean
    dwell_time: number
  }[]
}

export type CallPeer = {
  member: OrganizationMember
  active: boolean
  remote_peer_id: string
}

export type CallRecordingSpeaker = {
  name: string
  call_peer: CallPeer
}

export type CallRecordingTranscription = {
  vtt: string | null
  speakers: CallRecordingSpeaker[]
}

export type OrganizationCallRoomInvitationsPostResponse = object

export type OrganizationCallRoomInvitationsPostRequest = {
  member_ids: string[]
}

export type CallRoom = {
  id: string
  channel_name: string
  url: string
  title: string | null
  viewer_token: string | null
  viewer_can_invite_participants: boolean
  active_peers: CallPeer[]
  peers: CallPeer[]
}

export type OrganizationCallRoomsPostRequest = {
  source: 'subject' | 'google_calendar' | 'new_call_button' | 'cal_dot_com'
}

export type OrganizationCallAllRecordingsDeleteResponse = object

export type SlackChannel = {
  id: string
  name: string
  is_private: boolean
}

export type ProjectDisplayPreference = {
  display_reactions: boolean
  display_attachments: boolean
  display_comments: boolean
  display_resolved: boolean
}

export type Project = {
  id: string
  name: string
  description: string | null
  created_at: string
  archived_at: string | null
  archived: boolean
  last_activity_at: string
  slack_channel_id: string | null
  posts_count: number
  cover_photo_url: string | null
  url: string
  accessory: string | null
  private: boolean
  personal: boolean
  is_general: boolean
  is_default: boolean
  contributors_count: number
  members_and_guests_count: number
  members_count: number
  guests_count: number
  call_room_url: string | null
  message_thread_id: string | null
  organization_id: string
  viewer_has_favorited: boolean
  viewer_can_archive: boolean
  viewer_can_destroy: boolean
  viewer_can_unarchive: boolean
  viewer_can_update: boolean
  viewer_has_subscribed: boolean
  viewer_subscription: 'posts_and_comments' | 'new_posts' | 'none'
  viewer_is_member: boolean
  unread_for_viewer: boolean
  slack_channel: SlackChannel | null
  type_name: string
  viewer_display_preferences: ProjectDisplayPreference | null
  display_preferences: ProjectDisplayPreference
}

export type CallRecording = {
  id: string
  url: string | null
  file_path: string | null
  name: string | null
  file_type: string | null
  imgix_video_thumbnail_preview_url: string | null
  size: number | null
  duration: number | null
  max_width: number | null
  max_height: number | null
  transcription_status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
}

export type MessageCall = {
  id: string
  created_at: string
  started_at: string
  stopped_at: string | null
  duration: string | null
  active: boolean
  title: string
  summary_html: string | null
  recordings: CallRecording[]
  peers: CallPeer[]
}

export type MessageThread = {
  id: string
  last_message_at: string | null
  latest_message_truncated: string | null
  image_url: string | null
  avatar_urls: AvatarUrls | null
  group: boolean
  channel_name: string
  organization_slug: string
  path: string
  call_room_url: string | null
  remote_call_room_id: string | null
  integration_dm: boolean
  active_call: MessageCall | null
  deactivated_members: OrganizationMember[]
  type_name: string
  title: string
  project_id: string | null
  unread_count: number
  manually_marked_unread: boolean
  viewer_has_favorited: boolean
  other_members: OrganizationMember[]
  viewer_is_thread_member: boolean
  viewer_can_manage_integrations: boolean
  viewer_can_delete: boolean
  viewer_can_force_notification: boolean
}

export type Favorite = {
  id: string
  position: number
  favoritable_type: 'Project' | 'MessageThread' | 'Note' | 'Post' | 'Call'
  favoritable_id: string
  accessory: string | null
  name: string
  url: string
  private: boolean
  project: Project | null
  message_thread: MessageThread | null
}

export type OrganizationCallFavoriteDeleteResponse = object

export type FollowUpSubject = {
  id: string
  type: string
  body_preview: string
  member: OrganizationMember | null
  title: string | null
}

export type MiniProject = {
  id: string
  name: string
  accessory: string | null
  private: boolean
  archived: boolean
  message_thread_id: string | null
}

export type NotificationTarget = {
  id: string
  type: string
  title: string
  project: MiniProject | null
  resolved: boolean
}

export type SummaryBlock = {
  text?: {
    content: string
    bold?: boolean
    nowrap?: boolean
  }
  img?: {
    src: string
    alt: string
  }
}

export type FollowUp = {
  id: string
  show_at: string
  inbox_key: string
  organization_slug: string
  member: OrganizationMember
  subject: FollowUpSubject
  target: NotificationTarget
  summary_blocks: SummaryBlock[]
  belongs_to_viewer: boolean
  type_name: string
}

export type OrganizationCallFollowUpPostRequest = {
  show_at: string
}

export type PublicOrganization = {
  id: string
  avatar_url: string
  avatar_urls: AvatarUrls
  name: string
  slug: string
  viewer_is_admin: boolean
  viewer_can_leave: boolean
}

export type PostLink = {
  id: string
  name: string
  url: string
}

export type Tag = {
  id: string
  name: string
  posts_count: number
  url: string
  viewer_can_destroy: boolean
}

export type PollOption = {
  id: string
  description: string
  votes_count: number
  votes_percent: number
  viewer_voted: boolean
}

export type Poll = {
  id: string
  description: string
  votes_count: number
  options: PollOption[]
  viewer_voted: boolean
}

export type FeedbackRequest = {
  id: string
  has_replied: boolean
  member: OrganizationMember
}

export type SubjectFollowUp = {
  id: string
  member: OrganizationMember
  show_at: string
  belongs_to_viewer: boolean
}

export type ResolvedComment = {
  id: string
  created_at: string
  body_html: string
  url: string
  viewer_is_author: boolean
  member: OrganizationMember
}

export type SyncCustomReaction = {
  id: string
  name: string
  file_url: string
  created_at: string
}

export type GroupedReaction = {
  viewer_reaction_id: string | null
  emoji: string | null
  tooltip: string
  reactions_count: number
  custom_content: SyncCustomReaction | null
}

export type Commenters = {
  latest_commenters: OrganizationMember[]
}

export type PostResolution = {
  resolved_at: string
  resolved_by: OrganizationMember
  resolved_html: string | null
  resolved_comment: ResolvedComment | null
}

export type ResourceMentionPost = {
  id: string
  title: string
  created_at: string
  published_at: string | null
  url: string
}

export type ResourceMentionCall = {
  id: string
  title: string
  created_at: string
  url: string
}

export type ResourceMentionNote = {
  id: string
  title: string
  created_at: string
  url: string
}

export type ResourceMention = {
  id: string
  post: ResourceMentionPost | null
  call: ResourceMentionCall | null
  note: ResourceMentionNote | null
  type_name: string
}

export type Post = {
  id: string
  title: string
  is_title_from_description: boolean
  created_at: string
  published_at: string | null
  published: boolean
  last_activity_at: string
  comments_count: number
  resolved_comments_count: number
  version: number
  path: string
  channel_name: string
  views_count: number
  non_member_views_count: number
  status: 'none' | 'feedback_requested'
  visibility: 'default' | 'public'
  open_graph_image_url: string | null
  thumbnail_url: string | null
  unfurled_link: string | null
  description_html: string
  truncated_description_html: string
  is_text_content_truncated: boolean
  truncated_description_text: string
  url: string
  type_name: string
  organization: PublicOrganization
  attachments: Attachment[]
  links: PostLink[]
  tags: Tag[]
  poll: Poll | null
  feedback_requests: FeedbackRequest[] | null
  follow_ups: SubjectFollowUp[]
  member: OrganizationMember
  resolved_comment: ResolvedComment | null
  grouped_reactions: GroupedReaction[]
  project: MiniProject
  has_parent: boolean
  has_iterations: boolean
  viewer_is_organization_member: boolean
  viewer_is_author: boolean
  viewer_has_commented: boolean
  preview_commenters: Commenters
  viewer_feedback_status: 'none' | 'viewer_requested' | 'open'
  viewer_has_subscribed: boolean
  viewer_has_viewed: boolean
  viewer_has_favorited: boolean
  unseen_comments_count: number
  viewer_can_resolve: boolean
  viewer_can_favorite: boolean
  viewer_can_edit: boolean
  viewer_can_delete: boolean
  viewer_can_create_issue: boolean
  resolution: PostResolution | null
  latest_comment_preview: string | null
  latest_comment_path: string | null
  viewer_is_latest_comment_author: boolean
  project_pin_id: string | null
  resource_mentions: ResourceMention[]
}

export type Permission = {
  id: string
  user: User
  action: 'view' | 'edit'
}

export type Note = {
  id: string
  title: string
  created_at: string
  last_activity_at: string
  content_updated_at: string
  comments_count: number
  resolved_comments_count: number
  channel_name: string
  presence_channel_name: string
  description_thumbnail_base_url: string | null
  public_visibility: boolean
  non_member_views_count: number
  description_html: string
  description_state: string | null
  project: Project | null
  follow_ups: FollowUp[]
  type_name: string
  url: string
  public_share_url: string
  project_permission: 'none' | 'view' | 'edit'
  member: OrganizationMember
  viewer_is_author: boolean
  viewer_can_comment: boolean
  viewer_can_edit: boolean
  viewer_can_delete: boolean
  viewer_has_favorited: boolean
  latest_commenters: OrganizationMember[]
  permitted_users: Permission[]
  project_pin_id: string | null
  resource_mentions: ResourceMention[]
}

export type Call = {
  id: string
  title: string | null
  summary_html: string | null
  is_edited: boolean
  created_at: string
  started_at: string
  stopped_at: string | null
  duration: string | null
  recordings_duration: string | null
  active: boolean
  project_permission: 'none' | 'view' | 'edit'
  channel_name: string
  peers: CallPeer[]
  project: MiniProject | null
  follow_ups: SubjectFollowUp[]
  type_name: string
  viewer_can_edit: boolean
  viewer_can_destroy_all_recordings: boolean
  viewer_has_favorited: boolean
  processing_generated_title: boolean
  processing_generated_summary: boolean
  project_pin_id: string | null
  url: string
}

export type ProjectPin = {
  id: string
  post: Post | null
  note: Note | null
  call: Call | null
}

export type ProjectPinCreated = {
  pin: ProjectPin
}

export type OrganizationsOrgSlugCallsCallIdProjectPermissionPutRequest = {
  project_id: string
  permission: 'view' | 'edit'
}

export type OrganizationsOrgSlugCallsCallIdProjectPermissionDeleteResponse = object

export type CallRecordingPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: CallRecording[]
}

export type OrganizationCallRecordingsGetRequest = {
  after?: string
  limit?: number
}

export type CallPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: Call[]
}

export type OrganizationCallsGetRequest = {
  filter?: 'joined'
  after?: string
  limit?: number
  q?: string
}

export type OrganizationsOrgSlugCallsIdPutRequest = {
  title: string
  summary: string
}

export type OrganizationsOrgSlugCommentsCommentIdAttachmentsReorderPutResponse = object

export type OrganizationsOrgSlugCommentsCommentIdAttachmentsReorderPutRequest = {
  attachments: {
    id: string
    position: number
  }[]
}

export type OrganizationCommentFollowUpPostRequest = {
  show_at: string
}

export type LinearIssueState = {
  name: string
  type: 'triage' | 'backlog' | 'unstarted' | 'started' | 'completed' | 'canceled'
  color: string
}

export type ExternalRecord = {
  created_at: string
  remote_record_id: string
  remote_record_title: string
  remote_record_url: string
  service: string
  type: string
  linear_issue_identifier: string
  linear_issue_state: LinearIssueState
  linear_identifier: string
  linear_state: LinearIssueState
}

export type CreateLinearIssue = {
  status: 'pending' | 'failed' | 'success'
  external_record: ExternalRecord | null
}

export type OrganizationCommentLinearIssuesPostRequest = {
  team_id: string
  title: string
  description: string
}

export type Reaction = {
  id: string
  content: string | null
  member: OrganizationMember
  custom_content: SyncCustomReaction | null
}

export type OrganizationCommentReactionsPostRequest = {
  content?: string
  custom_content_id?: string
}

export type TimelineEvent = {
  id: string
  created_at: string
  action:
    | 'post_resolved'
    | 'post_unresolved'
    | 'post_visibility_updated'
    | 'post_referenced_in_external_record'
    | 'created_linear_issue_from_post'
    | 'comment_referenced_in_external_record'
    | 'created_linear_issue_from_comment'
    | 'subject_project_updated'
    | 'subject_referenced_in_internal_record'
    | 'subject_pinned'
    | 'subject_unpinned'
    | 'subject_title_updated'
  subject_updated_from_title: string | null
  subject_updated_to_title: string | null
  subject_updated_from_project: MiniProject | null
  subject_updated_to_project: MiniProject | null
  comment_reference_subject_type: string | null
  comment_reference_subject_title: string | null
  member_actor: OrganizationMember | null
  external_reference: ExternalRecord | null
  post_reference: Post | null
  comment_reference: Comment | null
  note_reference: Note | null
}

export type Comment = {
  id: string
  created_at: string
  timestamp: number | null
  x: number | null
  y: number | null
  body_html: string
  note_highlight: string | null
  resolved_at: string | null
  resolved_by: OrganizationMember | null
  type_name: string
  subject_type: string
  subject_id: string
  url: string
  viewer_can_resolve: boolean
  viewer_can_create_issue: boolean
  attachment_id: string | null
  canvas_preview_url: string | null
  attachment_thumbnail_url: string | null
  viewer_is_author: boolean
  viewer_can_edit: boolean
  viewer_can_follow_up: boolean
  viewer_can_react: boolean
  viewer_can_delete: boolean
  member: OrganizationMember
  attachments: Attachment[]
  grouped_reactions: GroupedReaction[]
  replies: Comment[]
  follow_ups: SubjectFollowUp[]
  parent_id: string | null
  is_optimistic: boolean
  optimistic_id: string | null
  timeline_events: TimelineEvent[]
  resource_mentions: ResourceMention[]
}

export type ReplyCreated = {
  reply: Comment
  attachment: Attachment | null
  attachment_commenters: OrganizationMember[] | null
}

export type OrganizationCommentRepliesPostRequest = {
  body_html: string | null
  attachments?: {
    file_path: string
    file_type: string
    preview_file_path?: string | null
    name?: string | null
    size?: number | null
  }[]
}

export type OrganizationsOrgSlugCommentsCommentIdTasksPutRequest = {
  index: number
  checked: boolean
}

export type OrganizationsOrgSlugCommentsIdPutRequest = {
  body_html: string | null
}

export type CustomReactionsPackItem = {
  name: string
  file_url: string
}

export type CustomReactionsPack = {
  name: 'blobs' | 'memes' | 'meows' | 'parrots' | 'llamas'
  installed: boolean
  items: CustomReactionsPackItem[]
}

export type OrganizationsOrgSlugCustomReactionsPacksPostResponse = object

export type OrganizationsOrgSlugCustomReactionsPacksPostRequest = {
  name: 'blobs' | 'memes' | 'meows' | 'parrots' | 'llamas'
}

export type OrganizationCustomReactionsPackDeleteResponse = object

export type CustomReaction = {
  id: string
  name: string
  file_url: string
  created_at: string
  creator: OrganizationMember
}

export type CustomReactionPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: CustomReaction[]
  total_count: number
}

export type OrganizationCustomReactionsGetRequest = {
  after?: string
  limit?: number
}

export type OrganizationsOrgSlugCustomReactionsPostRequest = {
  name: string
  file_path: string
  file_type: string
}

export type OrganizationCustomReactionDeleteResponse = object

export type OrganizationDataExportsPostResponse = object

export type PostDigestNoteMigration = {
  note_url: string | null
}

export type ReorderOrganizationFavoritesPutResponse = object

export type ReorderOrganizationFavoritesPutRequest = {
  favorites: {
    id: string
    position: number
  }[]
}

export type OrganizationFavoriteDeleteResponse = object

export type OrganizationFeedbacksPostResponse = object

export type OrganizationFeedbacksPostRequest = {
  description: string
  feedback_type: 'bug' | 'feature' | 'general'
  screenshot_path?: string
  current_url: string
}

export type PresignedPostFields = {
  acl: string | null
  content_type: string
  expires: string
  key: string
  policy: string
  success_action_status: string
  url: string
  x_amz_algorithm: string
  x_amz_credential: string
  x_amz_date: string
  x_amz_signature: string
}

export type OrganizationFeedbacksPresignedFieldsGetRequest = {
  mime_type: string
}

export type FigmaFile = {
  id: number
  file_key: string
  name: string
}

export type OrganizationFigmaFilesPostRequest = {
  remote_file_key: string
  name: string
}

export type FigmaFileAttachmentDetails = {
  file_path: string
  width: number
  height: number
  size: number
  file_type: string
  figma_file_id: number
  remote_figma_node_id: string
  remote_figma_node_type: string
  remote_figma_node_name: string
  figma_share_url: string
  image_urls: ImageUrls
}

export type OrganizationFigmaFileAttachmentDetailsPostRequest = {
  figma_file_url: string
}

export type FollowUpPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: FollowUp[]
}

export type OrganizationFollowUpsGetRequest = {
  after?: string
  limit?: number
}

export type OrganizationsOrgSlugFollowUpsIdPutRequest = {
  show_at: string
}

export type OrganizationsOrgSlugFollowUpsIdDeleteResponse = object

export type Gif = {
  id: string
  description: string
  url: string
  width: number
  height: number
}

export type GifsPage = {
  data: Gif[]
  next_cursor: string
}

export type OrganizationGifsGetRequest = {
  q?: string
  limit?: number
  after?: string
}

export type ImageUrlsPostRequest = {
  file_path: string
}

export type CalDotComIntegration = {
  installed: boolean
  organization: PublicOrganization
}

export type IntegrationsCalDotComOrganizationPutResponse = object

export type IntegrationsCalDotComOrganizationPutRequest = {
  organization_id: string
}

export type FigmaIntegrationGetResponse = {
  has_figma_integration: boolean
}

export type GoogleCalendarEvent = {
  adminEmail: string
  id: string
  videoUri: string
}

export type IntegrationsGoogleCalendarEventsOrganizationPutResponse = object

export type IntegrationsGoogleCalendarEventsOrganizationPutRequest = {
  organization_id: string
}

export type GoogleCalendarIntegration = {
  installed: boolean
  organization: PublicOrganization
}

export type LinearIntegration = {
  id: string
  provider: string
}

export type OrganizationsOrgSlugIntegrationsLinearInstallationDeleteResponse = object

export type OrganizationIntegrationsLinearTeamSyncsPostResponse = object

export type IntegrationTeam = {
  id: string
  name: string
  private: string
  provider_team_id: string
  key: string
}

export type OrganizationIntegrationsSlackChannelSyncsPostResponse = object

export type SlackChannelPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: SlackChannel[]
}

export type OrganizationIntegrationsSlackChannelsGetRequest = {
  after?: string
  q?: string
  limit?: number
}

export type ZapierComment = {
  id: string
  content: string
  created_at: string
  parent_id: string | null
}

export type ZapierIntegrationCommentsPostRequest = {
  content: string
  post_id?: string
  parent_id?: string
}

export type ZapierMessage = {
  id: string
  content: string
  created_at: string
  updated_at: string
  parent_id: string | null
}

export type ZapierIntegrationMessagesPostRequest = {
  content: string
  thread_id?: string
  parent_id?: string
}

export type ZapierPost = {
  id: string
  title: string
  created_at: string
  published_at: string | null
  url: string
  content: string
  project_id: string
}

export type ZapierIntegrationPostsPostRequest = {
  title?: string
  content: string
  project_id?: string
}

export type ZapierProject = {
  id: string
  name: string
}

export type ZapierProjects = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: ZapierProject[]
}

export type ZapierIntegrationProjectsGetRequest = {
  name?: string
}

export type InvitationUrl = {
  invitation_url: string
}

export type MessageThreadDmResult = {
  dm: MessageThread | null
}

export type OrganizationThreadFavoritesDeleteResponse = object

export type MessageReply = {
  id: string
  content: string
  has_content: boolean
  sender_display_name: string
  viewer_is_sender: boolean
  last_attachment: Attachment | null
}

export type Message = {
  id: string
  content: string
  unfurled_link: string | null
  created_at: string
  updated_at: string
  discarded_at: string | null
  has_content: boolean
  sender: OrganizationMember
  reply: MessageReply | null
  attachments: Attachment[]
  call: MessageCall | null
  viewer_is_sender: boolean
  viewer_can_delete: boolean
  grouped_reactions: GroupedReaction[]
  shared_post_url: string | null
  optimistic_id: string | null
}

export type MessagePage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: Message[]
}

export type OrganizationThreadMessagesGetRequest = {
  after?: string
  limit?: number
}

export type MessageThreadPusher = {
  id: string
  last_message_at: string | null
  latest_message_truncated: string | null
  organization_slug: string
  path: string
  call_room_url: string | null
  remote_call_room_id: string | null
  active_call: MessageCall | null
  viewer_can_force_notification: boolean
  type_name: string
  title: string
  project_id: string | null
  unread_count: number
}

export type PusherInvalidateMessage = {
  message: Message
  message_thread: MessageThreadPusher
  skip_push: boolean
  push_body?: string | null
}

export type OrganizationsOrgSlugThreadsThreadIdMessagesPostRequest = {
  content: string
  reply_to?: string
  attachments: {
    figma_file_id?: number | null
    file_path: string
    file_type: string
    imgix_video_file_path?: string
    name?: string | null
    preview_file_path?: string | null
    figma_share_url?: string
    remote_figma_node_id?: string | null
    remote_figma_node_name?: string | null
    remote_figma_node_type?: string | null
    duration?: number
    size?: number | null
    height?: number
    width?: number
    no_video_track?: boolean
    gallery_id?: string | null
  }[]
}

export type OrganizationsOrgSlugThreadsThreadIdMessagesIdPutResponse = object

export type OrganizationsOrgSlugThreadsThreadIdMessagesIdPutRequest = {
  content: string
}

export type OrganizationsOrgSlugThreadsThreadIdMessagesIdDeleteResponse = object

export type MessageThreadMembership = {
  notification_level: 'all' | 'mentions' | 'none'
}

export type OrganizationsOrgSlugThreadsThreadIdMyMembershipPutRequest = {
  notification_level: 'all' | 'mentions' | 'none'
}

export type OrganizationsOrgSlugThreadsThreadIdMyMembershipDeleteResponse = object

export type OrganizationThreadNotificationForcesPostResponse = object

export type Webhook = {
  id: string
  url: string
  state: string
  secret: string
  event_types: string[]
}

export type OauthApplication = {
  id: string
  name: string
  redirect_uri: string | null
  avatar_path: string | null
  avatar_url: string
  avatar_urls: AvatarUrls
  client_id: string
  last_copied_secret_at: string | null
  client_secret: string | null
  mentionable: boolean
  direct_messageable: boolean
  webhooks: Webhook[]
}

export type OrganizationsOrgSlugThreadsThreadIdOauthApplicationsPostRequest = {
  oauth_application_id: string
}

export type OrganizationThreadOauthApplicationDeleteResponse = object

export type OrganizationsOrgSlugThreadsThreadIdOtherMembershipsListPutRequest = {
  member_ids: string[]
}

export type OrganizationThreadPresignedFieldsGetRequest = {
  mime_type: string
}

export type MessageThreadInbox = {
  threads: MessageThread[]
}

export type OrganizationsOrgSlugThreadsPostRequest = {
  group?: boolean
  title?: string
  member_ids?: string[]
  oauth_application_ids?: string[]
  content?: string
  attachments: {
    file_path: string
    file_type: string
    preview_file_path: string | null
    width?: number
    height?: number
    duration?: number
    name?: string | null
    size?: number | null
  }[]
}

export type OrganizationsOrgSlugThreadsIdPutRequest = {
  title?: string
  image_path?: string | null
}

export type OrganizationsOrgSlugThreadsIdDeleteResponse = object

export type OrganizationMessageAttachmentDeleteResponse = object

export type OrganizationMessageReactionsPostRequest = {
  content?: string
  custom_content_id?: string
}

export type CommentPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: Comment[]
  total_count: number
}

export type OrganizationNoteAttachmentCommentsGetRequest = {
  after?: string
  limit?: number
}

export type OrganizationsOrgSlugNotesNoteIdAttachmentsReorderPutResponse = object

export type OrganizationsOrgSlugNotesNoteIdAttachmentsReorderPutRequest = {
  attachments: {
    id: string
    position: number
  }[]
}

export type OrganizationNoteAttachmentsPostRequest = {
  figma_file_id?: number | null
  file_path: string
  file_type: string
  imgix_video_file_path?: string
  name?: string | null
  preview_file_path?: string | null
  figma_share_url?: string
  remote_figma_node_id?: string | null
  remote_figma_node_name?: string | null
  remote_figma_node_type?: string | null
  duration?: number
  size?: number | null
  height?: number
  width?: number
  no_video_track?: boolean
  gallery_id?: string | null
}

export type OrganizationsOrgSlugNotesNoteIdAttachmentsIdPutRequest = {
  preview_file_path?: string
  width?: number
  height?: number
}

export type OrganizationNoteCommentsGetRequest = {
  after?: string
  limit?: number
}

export type CommentCreated = {
  preview_commenters: Commenters
  post_comment: Comment
  attachment: Attachment | null
  attachment_commenters: OrganizationMember[] | null
}

export type OrganizationsOrgSlugNotesNoteIdCommentsPostRequest = {
  body_html: string | null
  attachments?: {
    file_path: string
    file_type: string
    preview_file_path?: string | null
    width?: number
    height?: number
    duration?: number
    name?: string | null
    size?: number | null
  }[]
  attachment_ids?: string[]
  x?: number | null
  y?: number | null
  file_id?: string | null
  timestamp?: number | null
  note_highlight?: string | null
}

export type OrganizationNoteFavoriteDeleteResponse = object

export type OrganizationNoteFollowUpPostRequest = {
  show_at: string
}

export type OrganizationsOrgSlugNotesNoteIdPermissionsPostRequest = {
  member_ids: string[]
  permission: 'view' | 'edit'
}

export type OrganizationsOrgSlugNotesNoteIdPermissionsIdPutRequest = {
  permission: 'view' | 'edit'
}

export type OrganizationsOrgSlugNotesNoteIdPermissionsIdDeleteResponse = object

export type OrganizationsOrgSlugNotesNoteIdProjectPermissionsPutRequest = {
  project_id: string
  permission: 'view' | 'edit'
}

export type OrganizationsOrgSlugNotesNoteIdProjectPermissionsDeleteResponse = object

export type PublicUser = {
  id: string
  avatar_urls: AvatarUrls
  display_name: string
  username: string
}

export type PublicOrganizationMember = {
  user: PublicUser
}

export type PublicNote = {
  id: string
  title: string
  description_html: string
  created_at: string
  url: string
  og_user_avatar: string
  og_org_avatar: string
  member: PublicOrganizationMember
  organization: PublicOrganization
}

export type NoteSync = {
  id: string
  description_schema_version: number
  description_state: string | null
  description_html: string
}

export type OrganizationsOrgSlugNotesNoteIdSyncStatePutResponse = object

export type OrganizationsOrgSlugNotesNoteIdSyncStatePutRequest = {
  description_html: string
  description_state: string
  description_schema_version: number
}

export type TimelineEventPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: TimelineEvent[]
  total_count: number
}

export type OrganizationNoteTimelineEventsGetRequest = {
  after?: string
  limit?: number
}

export type NoteView = {
  updated_at: string
  member: OrganizationMember
}

export type NoteViewCreated = {
  views: NoteView[]
  notification_counts: UserNotificationCounts
}

export type OrganizationsOrgSlugNotesNoteIdVisibilityPutResponse = object

export type OrganizationsOrgSlugNotesNoteIdVisibilityPutRequest = {
  visibility: 'default' | 'public'
}

export type NotePage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: Note[]
}

export type OrganizationNotesGetRequest = {
  after?: string
  limit?: number
  q?: string
  order?: {
    by: 'created_at' | 'last_activity_at'
    direction: 'asc' | 'desc'
  }
}

export type OrganizationsOrgSlugNotesPostRequest = {
  title?: string
  description_html?: string
  project_id?: string
}

export type OrganizationsOrgSlugNotesIdPutRequest = {
  title?: string
}

export type OrganizationsOrgSlugNotesIdDeleteResponse = object

export type OrganizationNotificationArchiveDeleteResponse = object

export type OrganizationNotificationDeleteAllPostResponse = object

export type OrganizationNotificationDeleteAllPostRequest = {
  home_only?: boolean
  read_only?: boolean
}

export type OrganizationNotificationMarkAllReadPostResponse = object

export type OrganizationNotificationMarkAllReadPostRequest = {
  home_only?: boolean
}

export type OrganizationNotificationReadPostResponse = object

export type OrganizationsOrgSlugMembersMeNotificationsNotificationIdReadDeleteResponse = object

export type NotificationActor = {
  avatar_url: string
  avatar_urls: AvatarUrls
  username: string
  display_name: string
  integration: boolean
}

export type NotificationSubject = {
  id: string
  type: string
}

export type NotificationSubtarget = {
  id: string
  type: string
}

export type NotificationReaction = {
  content: string | null
  custom_content: SyncCustomReaction | null
}

export type NotificationFollowUpSubject = {
  id: string
  type: string
  viewer_follow_up: SubjectFollowUp | null
}

export type Notification = {
  id: string
  inbox_key: string
  is_inbox: boolean
  created_at: string
  summary: string
  read: boolean
  archived: boolean
  organization_slug: string
  preview_url: string | null
  preview_is_canvas: boolean
  reply_to_body_preview: string | null
  body_preview_prefix: string | null
  body_preview_prefix_fallback: string | null
  body_preview: string | null
  summary_blocks: SummaryBlock[]
  activity_seen: boolean
  reason:
    | 'mention'
    | 'parent_subscription'
    | 'author'
    | 'feedback_requested'
    | 'project_subscription'
    | 'permission_granted'
    | 'comment_resolved'
    | 'added'
    | 'subject_archived'
    | 'follow_up'
    | 'post_resolved'
    | 'post_resolved_from_comment'
    | 'processing_complete'
  actor: NotificationActor
  subject: NotificationSubject
  target: NotificationTarget
  subtarget: NotificationSubtarget | null
  reaction: NotificationReaction | null
  follow_up_subject: NotificationFollowUpSubject | null
}

export type NotificationPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: Notification[]
}

export type OrganizationNotificationsGetRequest = {
  unread?: boolean
  filter?: 'home' | 'grouped_home' | 'activity'
  after?: string
  limit?: number
}

export type OrganizationNotificationDeleteResponse = object

export type OrganizationNotificationDeleteRequest = {
  archive_by?: 'id' | 'target'
}

export type OrganizationOauthApplicationPresignedFieldsGetRequest = {
  mime_type: string
}

export type AccessToken = {
  token: string
}

export type OrganizationsOrgSlugOauthApplicationsPostRequest = {
  name: string
  redirect_uri?: string
  avatar_path?: string
  webhooks?: {
    url: string
  }[]
}

export type OrganizationsOrgSlugOauthApplicationsIdPutRequest = {
  name?: string
  redirect_uri?: string
  avatar_path?: string
  webhooks?: {
    id?: string
    url: string
    event_types?: string[]
  }[]
}

export type OrganizationsOrgSlugOauthApplicationsIdDeleteResponse = object

export type OrganizationOnboardProjectsPostResponse = object

export type OrganizationOnboardProjectsPostRequest = {
  general_name: string
  general_accessory?: string
  projects: {
    name: string
    accessory?: string
  }[]
}

export type OpenGraphLink = {
  url: string
  title: string
  image_url: string | null
  favicon_url: string | null
}

export type OpenGraphLinksGetRequest = {
  url: string
}

export type OrganizationInvitationOrgPartial = {
  avatar_url: string
  avatar_urls: AvatarUrls
  name: string
  slug: string
}

export type SimpleProject = {
  id: string
  name: string
  description: string | null
  created_at: string
  archived_at: string | null
  accessory: string | null
  private: boolean
  is_general: boolean
  is_default: boolean
}

export type OrganizationInvitation = {
  id: string
  email: string
  role: string
  expired: boolean | null
  organization?: OrganizationInvitationOrgPartial
  projects: SimpleProject[]
  token?: string
}

export type OrganizationInvitationPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: OrganizationInvitation[]
  total_count: number
}

export type OrganizationInvitationsGetRequest = {
  q?: string
  role_counted?: boolean
  after?: string
}

export type OrganizationsOrgSlugInvitationsPostRequest = {
  invitations: {
    email: string
    role: string
    project_ids?: string[]
  }[]
  onboarding?: boolean
}

export type AcceptInvitationByTokenPostResponse = {
  redirect_path: string
}

export type OrganizationsOrgSlugInvitationsIdDeleteResponse = object

export type OrganizationMemberPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: OrganizationMember[]
  total_count: number
}

export type OrganizationMembersGetRequest = {
  q?: string
  status?: 'deactivated'
  roles?: ('admin' | 'member' | 'viewer' | 'guest')[]
  after?: string
  limit?: number
  order?: {
    by: 'created_at' | 'last_seen_at'
    direction: 'asc' | 'desc'
  }
}

export type PostPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: Post[]
}

export type OrganizationMemberPostsGetRequest = {
  after?: string
  limit?: number
  order?: {
    by: 'last_activity_at' | 'published_at'
    direction: 'asc' | 'desc'
  }
}

export type OrganizationsOrgSlugMembersIdPutRequest = {
  role: string
}

export type OrganizationsOrgSlugMembersIdReactivatePutResponse = object

export type OrganizationsOrgSlugMembersIdDeleteResponse = object

export type OrganizationMembershipRequest = {
  id: string
  created_at: string
  organization_slug: string
  user: User
}

export type OrganizationMembershipRequestPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: OrganizationMembershipRequest[]
}

export type OrganizationMembershipRequestsGetRequest = {
  after?: string
}

export type OrganizationMembershipRequestGetResponse = {
  requested: boolean
}

export type OrganizationApproveMembershipRequestPostResponse = object

export type OrganizationDeclineMembershipRequestPostResponse = object

export type OrganizationMembershipArchivedNotificationsGetRequest = {
  after?: string
  limit?: number
}

export type OrganizationMembershipDataExportPostResponse = object

export type OrganizationMembershipForMeNotesGetRequest = {
  after?: string
  limit?: number
  q?: string
  order?: {
    by: 'created_at' | 'last_activity_at'
    direction: 'asc' | 'desc'
  }
}

export type OrganizationMembershipForMePostsGetRequest = {
  after?: string
  limit?: number
  q?: string
  hide_resolved?: boolean
  order?: {
    by: 'last_activity_at' | 'published_at'
    direction: 'asc' | 'desc'
  }
}

export type PublicOrganizationMembership = {
  id: string
  last_viewed_posts_at: string
  organization: PublicOrganization
}

export type OrganizationsOrgSlugMembersMeIndexViewsPutRequest = {
  last_viewed_posts_at: string
}

export type OrganizationMembershipPersonalDraftPostsGetRequest = {
  after?: string
  limit?: number
  order?: {
    by: 'last_activity_at'
    direction: 'asc' | 'desc'
  }
}

export type ProjectMembership = {
  id: string
  position: number
  project: Project
}

export type ProjectMembershipList = {
  data: ProjectMembership[]
}

export type OrganizationsOrgSlugMembersMemberUsernameProjectMembershipListPutRequest = {
  add_project_ids: string[]
  remove_project_ids: string[]
}

export type OrganizationMembershipsReorderPutResponse = object

export type OrganizationMembershipsReorderPutRequest = {
  membership_ids: string[]
}

export type OrganizationMembershipSlackNotificationPreferenceGetResponse = {
  enabled: boolean
}

export type OrganizationsOrgSlugMembersMeSlackNotificationPreferencePostResponse = object

export type OrganizationsOrgSlugMembersMeSlackNotificationPreferenceDeleteResponse = object

export type OrganizationsOrgSlugMembersMeStatusesPostRequest = {
  emoji: string
  message: string
  expiration_setting: '30m' | '1h' | '4h' | 'today' | 'this_week' | 'custom'
  expires_at?: string
  pause_notifications?: boolean
}

export type OrganizationsOrgSlugMembersMeStatusesPutRequest = {
  emoji?: string
  message?: string
  expiration_setting?: '30m' | '1h' | '4h' | 'today' | 'this_week' | 'custom'
  expires_at?: string
  pause_notifications?: boolean
}

export type OrganizationsOrgSlugMembersMeStatusesDeleteResponse = object

export type OrganizationMembershipViewerNotesGetRequest = {
  after?: string
  limit?: number
  q?: string
  order?: {
    by: 'last_activity_at' | 'created_at'
    direction: 'asc' | 'desc'
  }
}

export type OrganizationMembershipViewerPostsGetRequest = {
  after?: string
  limit?: number
  q?: string
  order?: {
    by: 'last_activity_at' | 'published_at'
    direction: 'asc' | 'desc'
  }
}

export type OrganizationBulkInvitesPostRequest = {
  comma_separated_emails: string
  project_id?: string
}

export type OrganizationFeaturesGetResponse = {
  features: (
    | 'slack_auto_publish'
    | 'sidebar_dms'
    | 'my_work'
    | 'max_w_chat'
    | 'archive_notifications'
    | 'relative_time'
    | 'firehose'
    | 'grouped_notifications'
    | 'comfy_compact_layout'
    | 'message_email_notifications'
    | 'integration_dms'
    | 'chat_channels'
    | 'channel_split_view'
    | 'no_emoji_accessories'
    | 'export'
    | 'organization_sso'
    | 'api_endpoint_list_members'
    | 'api_endpoint_list_posts'
    | 'multi_org_apps'
    | 'smart_digests'
    | 'sync_members'
    | 'true_up_annual_subscriptions'
  )[]
}

export type OrganizationSsoConfigurationPostResponse = {
  sso_portal_url: string
}

export type OrganizationSettings = {
  enforce_two_factor_authentication: boolean
  enforce_sso_authentication: boolean
}

export type Organization = {
  id: string
  avatar_url: string
  avatar_urls: AvatarUrls
  created_at: string
  onboarded_at: string | null
  name: string
  slug: string
  invitation_url: string
  paid: boolean
  plan_name: string
  sso_enabled: boolean
  show_upgrade_banner: boolean
  trial_expired: boolean
  trial_active: boolean
  trial_days_remaining: number | null
  viewer_can_post: boolean
  viewer_can_create_digest: boolean
  viewer_can_create_project: boolean
  viewer_can_see_new_project_button: boolean
  viewer_can_see_projects_index: boolean
  viewer_can_see_people_index: boolean
  viewer_can_create_tag: boolean
  viewer_can_create_note: boolean
  viewer_can_create_custom_reaction: boolean
  viewer_can_create_invitation: boolean
  viewer_can_manage_integrations: boolean
  viewer_is_admin: boolean
  viewer_member_id: string | null
  viewer_can_leave: boolean
  settings: OrganizationSettings
  billing_email?: string | null
  email_domain?: string | null
  features?: (
    | 'slack_auto_publish'
    | 'sidebar_dms'
    | 'my_work'
    | 'max_w_chat'
    | 'archive_notifications'
    | 'relative_time'
    | 'firehose'
    | 'grouped_notifications'
    | 'comfy_compact_layout'
    | 'message_email_notifications'
    | 'integration_dms'
    | 'chat_channels'
    | 'channel_split_view'
    | 'no_emoji_accessories'
    | 'export'
    | 'organization_sso'
    | 'api_endpoint_list_members'
    | 'api_endpoint_list_posts'
    | 'multi_org_apps'
    | 'smart_digests'
    | 'sync_members'
    | 'true_up_annual_subscriptions'
  )[]
  limits?: {
    file_size_bytes: number | null
  }
  member_count?: number
  channel_name: string
  presence_channel_name: string
}

export type OrganizationSsoPostRequest = {
  domains: string[]
}

export type OrganizationsPostRequest = {
  name: string
  slug: string
  avatar_path?: string | null
  role?: string
  org_size?: string
  source?: string
  why?: string
}

export type OrganizationsOrgSlugPutRequest = {
  name?: string
  slug?: string
  avatar_path?: string | null
  billing_email?: string
  email_domain?: string | null
  slack_channel_id?: string | null
  slack_channel_is_private?: boolean | null
}

export type OrganizationsOrgSlugDeleteResponse = object

export type SuggestedOrganization = {
  id: string
  avatar_url: string
  avatar_urls: AvatarUrls
  name: string
  slug: string
  requested: boolean
  joined?: boolean
}

export type OrganizationAvatarPresignedFieldsGetRequest = {
  mime_type: string
}

export type OrganizationPinDeleteResponse = object

export type OrganizationPostAttachmentCommentsGetRequest = {
  after?: string
  limit?: number
}

export type OrganizationsOrgSlugPostsPostIdAttachmentsReorderPutResponse = object

export type OrganizationsOrgSlugPostsPostIdAttachmentsReorderPutRequest = {
  attachments: {
    id: string
    position: number
  }[]
}

export type OrganizationPostAttachmentsPostRequest = {
  figma_file_id?: number | null
  file_path: string
  file_type: string
  imgix_video_file_path?: string
  name?: string | null
  preview_file_path?: string | null
  figma_share_url?: string
  remote_figma_node_id?: string | null
  remote_figma_node_name?: string | null
  remote_figma_node_type?: string | null
  duration?: number
  size?: number | null
  height?: number
  width?: number
  no_video_track?: boolean
  gallery_id?: string | null
  position: number
}

export type OrganizationsOrgSlugPostsPostIdAttachmentsIdPutRequest = {
  preview_file_path?: string
  width?: number
  height?: number
}

export type OrganizationPostFavoriteDeleteResponse = object

export type OrganizationPostFollowUpPostRequest = {
  show_at: string
}

export type GeneratedHtml = {
  status: 'pending' | 'failed' | 'success'
  html: string | null
  response_id: string | null
}

export type OrganizationPostGeneratedResolutionGetRequest = {
  comment_id?: string
}

export type OrganizationPostLinearIssuesPostRequest = {
  team_id: string
  title: string
  description: string
}

export type OrganizationPostLinearTimelineEventsGetRequest = {
  after?: string
  limit?: number
}

export type OrganizationsOrgSlugPostsPostIdPoll2PostRequest = {
  description: string
  options: {
    description: string
  }[]
}

export type OrganizationsOrgSlugPostsPostIdPoll2PutRequest = {
  description: string
  options: {
    id?: string
    description: string
  }[]
}

export type OrganizationsOrgSlugPostsPostIdPoll2DeleteResponse = object

export type OrganizationPostCommentsGetRequest = {
  after?: string
  limit?: number
}

export type OrganizationPostComments2PostRequest = {
  body_html: string | null
  attachments?: {
    file_path: string
    file_type: string
    preview_file_path?: string | null
    width?: number
    height?: number
    duration?: number
    name?: string | null
    size?: number | null
  }[]
  attachment_ids?: string[]
  x?: number | null
  y?: number | null
  file_id?: string | null
  timestamp?: number | null
  note_highlight?: string | null
}

export type OrganizationPostFeedbackRequestsPostRequest = {
  member_id: string
}

export type OrganizationPostFeedbackRequestDeleteResponse = object

export type OrganizationPostLinksPostRequest = {
  url: string
  name: string
}

export type OrganizationPostReactionsPostRequest = {
  content?: string
  custom_content_id?: string
}

export type PostVersion = {
  id: string
  created_at: string
  published_at: string | null
  comments_count: number
  version: number
}

export type PostView = {
  id: string
  updated_at: string
  member: OrganizationMember
}

export type PostViewPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: PostView[]
}

export type OrganizationPostViewsGetRequest = {
  after?: string
}

export type ProjectUnreadStatus = {
  id: string
  unread_for_viewer: boolean
}

export type PostViewCreated = {
  view: PostView | null
  notification_counts: UserNotificationCounts | null
  project_unread_status: ProjectUnreadStatus | null
}

export type OrganizationsOrgSlugPostsPostIdViewsPostRequest = {
  skip_notifications?: boolean
  read: boolean
  dwell_time?: number
}

export type OrganizationsOrgSlugPostsPostIdResolutionPostRequest = {
  resolve_html: string | null
  comment_id: string | null
}

export type PostSeoInfo = {
  id: string
  seo_title: string
  seo_description: string
  open_graph_image_url: string | null
  open_graph_video_url: string | null
}

export type OrganizationPostSharesPostResponse = object

export type OrganizationPostSharesPostRequest = {
  member_ids?: string[]
  slack_channel_id?: string
}

export type OrganizationsOrgSlugPostsPostIdStatusPutResponse = object

export type OrganizationsOrgSlugPostsPostIdStatusPutRequest = {
  status: 'none' | 'feedback_requested'
}

export type OrganizationsOrgSlugPostsPostIdTasksPutRequest = {
  index: number
  checked: boolean
}

export type OrganizationPostTimelineEventsGetRequest = {
  after?: string
  limit?: number
}

export type OrganizationsOrgSlugPostsPostIdVisibilityPutRequest = {
  visibility: 'default' | 'public'
}

export type OrganizationPostPollOptionVotersGetRequest = {
  after?: string
  limit?: number
}

export type OrganizationPostsGetRequest = {
  after?: string
  limit?: number
  q?: string
  order?: {
    by: 'last_activity_at' | 'published_at'
    direction: 'asc' | 'desc'
  }
}

export type OrganizationsOrgSlugPostsPostRequest = {
  description?: string
  description_html?: string
  project_id?: string
  unfurled_link?: string | null
  parent_id?: string | null
  note?: boolean
  note_id?: string | null
  from_message_id?: string | null
  links: {
    name: string
    url: string
  }[]
  attachment_ids?: string[]
  onboarding_step?: string
  feedback_request_member_ids?: string[]
  poll?: {
    description: string
    options: {
      description: string
    }[]
  }
  status?: 'none' | 'feedback_requested'
  title?: string
  draft?: boolean
  attachments?: {
    figma_file_id?: number | null
    file_path: string
    file_type: string
    imgix_video_file_path?: string
    name?: string | null
    preview_file_path?: string | null
    figma_share_url?: string
    remote_figma_node_id?: string | null
    remote_figma_node_name?: string | null
    remote_figma_node_type?: string | null
    duration?: number
    size?: number | null
    height?: number
    width?: number
    no_video_track?: boolean
    gallery_id?: string | null
  }[]
}

export type OrganizationsOrgSlugPostsPostIdPutRequest = {
  title?: string
  description_html?: string
  project_id?: string | null
  unfurled_link?: string | null
  note?: boolean
  status?: 'none' | 'feedback_requested'
  feedback_request_member_ids?: string[]
  attachment_ids?: string[]
}

export type OrganizationsOrgSlugPostsPostIdDeleteResponse = object

export type OrganizationPostSubscribePostResponse = object

export type OrganizationPostUnsubscribeDeleteResponse = object

export type OrganizationPostPresignedFieldsGetRequest = {
  mime_type: string
}

export type ProductLogsPostResponse = object

export type ProductLogsPostRequest = {
  events: {
    user_id?: string
    org_slug?: string
    name: string
    data?: object
    log_ts?: number
    session_id?: string
  }[]
}

export type OrganizationsOrgSlugProjectMembershipsReorderPutResponse = object

export type OrganizationsOrgSlugProjectMembershipsReorderPutRequest = {
  project_memberships: {
    id: string
    position: number
  }[]
}

export type OrganizationProjectAddableMembersGetRequest = {
  after?: string
  limit?: number
}

export type ProjectBookmark = {
  id: string
  title: string
  url: string
}

export type OrganizationsOrgSlugProjectsProjectIdBookmarksPostRequest = {
  title: string
  url: string
}

export type OrganizationsOrgSlugProjectsProjectIdBookmarksIdPatchRequest = {
  title: string
  url: string
}

export type OrganizationProjectBookmarksReorderPutRequest = {
  bookmarks: {
    id: string
    position: number
  }[]
}

export type OrganizationsOrgSlugProjectsProjectIdBookmarksIdDeleteResponse = object

export type OrganizationProjectCallsGetRequest = {
  after?: string
  limit?: number
  q?: string
}

export type OrganizationProjectDataExportsPostResponse = object

export type OrganizationsOrgSlugProjectsProjectIdDisplayPreferencesPutRequest = {
  display_reactions: boolean
  display_attachments: boolean
  display_comments: boolean
  display_resolved: boolean
}

export type OrganizationProjectFavoritesDeleteResponse = object

export type OrganizationProjectInvitationUrlAcceptancesPostResponse = object

export type OrganizationProjectInvitationUrlAcceptancesPostRequest = {
  token: string
}

export type OrganizationProjectMembersGetRequest = {
  after?: string
  limit?: number
  organization_membership_id?: string
  roles?: ('admin' | 'member' | 'viewer' | 'guest')[]
  exclude_roles?: ('admin' | 'member' | 'viewer' | 'guest')[]
}

export type OrganizationsOrgSlugProjectsProjectIdMembershipsPostRequest = {
  user_id: string
}

export type OrganizationProjectProjectMembershipsDeleteRequest = {
  user_id: string
}

export type OrganizationProjectNotesGetRequest = {
  after?: string
  limit?: number
  q?: string
  order?: {
    by: 'last_activity_at' | 'created_at'
    direction: 'asc' | 'desc'
  }
}

export type OrganizationsOrgSlugProjectsProjectIdOauthApplicationsPostRequest = {
  oauth_application_id: string
}

export type OrganizationProjectOauthApplicationDeleteResponse = object

export type ProjectPinList = {
  data: ProjectPin[]
}

export type OrganizationProjectPostsGetRequest = {
  after?: string
  limit?: number
  q?: string
  hide_resolved?: boolean
  order?: {
    by: 'last_activity_at' | 'published_at'
    direction: 'asc' | 'desc'
  }
}

export type OrganizationsOrgSlugProjectsProjectIdReadsPostResponse = object

export type OrganizationProjectReadsDeleteResponse = object

export type OrganizationsOrgSlugProjectsProjectIdSubscriptionPostRequest = {
  cascade?: boolean
}

export type OrganizationsOrgSlugProjectsProjectIdViewerDisplayPreferencesPutRequest = {
  display_reactions: boolean
  display_attachments: boolean
  display_comments: boolean
  display_resolved: boolean
}

export type ProjectPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: Project[]
  total_count: number
}

export type OrganizationProjectsGetRequest = {
  filter?: string
  after?: string
  limit?: number
  q?: string
}

export type OrganizationsOrgSlugProjectsPostRequest = {
  description?: string
  name: string
  accessory?: string
  cover_photo_path?: string
  slack_channel_id?: string
  slack_channel_is_private?: boolean
  private?: boolean
  member_user_ids?: string[]
  is_default?: boolean | null
  add_everyone?: boolean | null
  onboarding?: boolean | null
  chat_format?: boolean | null
}

export type OrganizationsOrgSlugProjectsProjectIdPutRequest = {
  description?: string
  name?: string
  accessory?: string
  cover_photo_path?: string | null
  slack_channel_id?: string | null
  slack_channel_is_private?: boolean | null
  is_default?: boolean | null
  private?: boolean
}

export type OrganizationsOrgSlugProjectsProjectIdDeleteResponse = object

export type OrganizationProjectCoverPhotoPresignedFieldsGetRequest = {
  mime_type: string
}

export type PublicProject = {
  id: string
  name: string
  accessory: string | null
  organization: PublicOrganization
}

export type OrganizationReactionsDeleteRequest = {
  id: string
}

export type OrganizationResourceMentionsGetRequest = {
  url: string
}

export type SearchPost = {
  id: string
  title: string
  description_html: string
  truncated_description_text: string
  created_at: string
  published_at: string | null
  thumbnail_url: string | null
  member: OrganizationMember
  project: MiniProject
}

export type SearchNote = {
  id: string
  title: string
  created_at: string
  member: OrganizationMember
  project: MiniProject | null
}

export type SearchGroup = {
  tags: Tag[]
  projects: SimpleProject[]
  members: OrganizationMember[]
  posts: SearchPost[]
  calls: Call[]
  notes: SearchNote[]
  posts_total_count: number
}

export type OrganizationSearchGroupsGetRequest = {
  q?: string
  focus?: 'projects' | 'people' | 'tags' | 'posts' | 'calls' | 'notes'
}

export type SearchMixedItem = {
  id: string
  type: 'post' | 'call' | 'note'
  highlights: string[]
  title_highlight: string | null
}

export type SearchCall = {
  id: string
  title: string | null
  created_at: string
}

export type SearchMixed = {
  items: SearchMixedItem[]
  posts: SearchPost[]
  calls: SearchCall[]
  notes: SearchNote[]
}

export type OrganizationSearchMixedIndexGetRequest = {
  q: string
  focus?: 'posts' | 'calls' | 'notes'
}

export type OrganizationSearchPostsGetRequest = {
  q: string
  project_id?: string
  author?: string
  tag?: string
  limit?: number
}

export type ResourceMentionResult = {
  item: ResourceMention
  project: MiniProject | null
}

export type ResourceMentionResults = {
  items: ResourceMentionResult[]
}

export type OrganizationSearchResourceMentionsGetRequest = {
  q: string
}

export type SlackIntegration = {
  id: string
  provider: string
  has_link_unfurling_scopes: boolean
  only_scoped_for_notifications: boolean
  has_private_channel_scopes: boolean
  current_organization_membership_is_linked?: boolean
  token?: string
  team_id: string | null
}

export type OrganizationIntegrationsSlackDeleteResponse = object

export type SyncUser = {
  id: string
  avatar_urls: AvatarUrls
  display_name: string
  username: string
  email: string
  integration: boolean
  notifications_paused: boolean
}

export type SyncOrganizationMember = {
  id: string
  role: 'admin' | 'member' | 'viewer' | 'guest'
  deactivated: boolean
  last_seen_at: string | null
  user: SyncUser
}

export type SyncMessageThread = {
  id: string
  image_url: string | null
  avatar_urls: AvatarUrls | null
  group: boolean
  title: string
  project_id: string | null
  dm_other_member: SyncOrganizationMember | null
}

export type SyncMessageThreads = {
  threads: SyncMessageThread[]
  new_thread_members: OrganizationMember[]
}

export type SyncProject = {
  id: string
  name: string
  accessory: string | null
  private: boolean
  is_general: boolean
  archived: boolean
  guests_count: number
  message_thread_id: string | null
  recent_posts_count: number
}

export type TagPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: Tag[]
  total_count: number
}

export type OrganizationTagsGetRequest = {
  q?: string
  after?: string
  limit?: number
}

export type OrganizationsOrgSlugTagsPostRequest = {
  name: string
}

export type OrganizationsOrgSlugTagsTagNamePatchRequest = {
  name: string
}

export type OrganizationsOrgSlugTagsTagNameDeleteResponse = object

export type OrganizationTagPostsGetRequest = {
  after?: string
  limit?: number
}

export type InternalDesktopSessionPostResponse = object

export type InternalDesktopSessionPostRequest = {
  user: {
    email: string
    token: string
  }
}

export type CurrentUserEditorSyncTokensPostResponse = {
  token: string
}

export type UsersMeNotificationPausePostResponse = object

export type UsersMeNotificationPausePostRequest = {
  expires_at: string
}

export type UsersNotificationPauseDeleteResponse = object

export type CustomNotificationSchedule = {
  days: ('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[]
  start_time: string
  end_time: string
}

export type NotificationSchedule = {
  type: 'none' | 'custom'
  custom: CustomNotificationSchedule | null
}

export type UsersMeNotificationSchedulePutResponse = object

export type UsersMeNotificationSchedulePutRequest = {
  days: ('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[]
  start_time: string
  end_time: string
}

export type UsersMeNotificationScheduleDeleteResponse = object

export type UsersMePreferencePutResponse = {
  preference: string
}

export type UsersMePreferencePutRequest = {
  preference: string
  value: string
}

export type ScheduledNotification = {
  id: string
  name: string
  time_zone: string
  delivery_day: string | null
  delivery_time: string
}

export type UsersMeScheduledNotificationsPostRequest = {
  delivery_day: string | null
  delivery_time: string
  time_zone: string
  name: string
}

export type CurrentUserScheduledNotificationPutRequest = {
  delivery_day?: string | null
  delivery_time: string
  time_zone: string
}

export type UsersMeScheduledNotificationsIdDeleteResponse = object

export type SignOutCurrentUserDeleteResponse = object

export type UsersTimezonePostResponse = object

export type UsersTimezonePostRequest = {
  timezone: string
}

export type CurrentUserTwoFactorAuthenticationPostResponse = {
  two_factor_provisioning_uri: string
}

export type UsersMeTwoFactorAuthenticationPutResponse = {
  two_factor_backup_codes: string[]
}

export type UsersMeTwoFactorAuthenticationPutRequest = {
  password: string
  otp_attempt: string
}

export type UsersMeTwoFactorAuthenticationDeleteResponse = object

export type UsersMeTwoFactorAuthenticationDeleteRequest = {
  password: string
  otp_attempt: string
}

export type UserPreferences = {
  theme?: 'system' | 'light' | 'dark' | null
  email_notifications?: 'enabled' | 'disabled' | null
  message_email_notifications?: 'enabled' | 'disabled' | null
  prefers_desktop_app?: 'enabled' | 'disabled' | null
  layout?: 'grid' | 'feed' | null
  feature_tip_drafts?: 'true' | 'false' | null
  feature_tip_interstitial?: 'true' | 'false' | null
  feature_tip_note_attachment?: 'true' | 'false' | null
  feature_tip_figma_plugin?: 'true' | 'false' | null
  figma_file_preview_mode?: 'embed' | 'image' | null
  notes_layout?: 'grid' | 'list' | null
  feature_tip_onboard_install_apps?: 'true' | 'false' | null
  posts_density?: 'compact' | 'comfortable' | null
  cal_dot_com_organization_id?: string | null
  feature_tip_calls_index_integrations?: 'true' | 'false' | null
  home_display_reactions?: 'true' | 'false' | null
  home_display_attachments?: 'true' | 'false' | null
  home_display_comments?: 'true' | 'false' | null
  home_display_resolved?: 'true' | 'false' | null
  channel_composer_post_suggestions?: 'true' | 'false' | null
}

export type CurrentUser = {
  id: string
  avatar_url: string
  avatar_urls: AvatarUrls
  cover_photo_url: string | null
  email: string
  username: string
  display_name: string
  onboarded_at: string | null
  channel_name: string
  unconfirmed_email: string | null
  created_at: string | null
  timezone: string | null
  email_confirmed: boolean
  managed: boolean
  two_factor_enabled: boolean | null
  staff: boolean
  system: boolean
  integration: boolean
  on_call: boolean
  notifications_paused: boolean
  notification_pause_expires_at: string | null
  features: (
    | 'slack_auto_publish'
    | 'sidebar_dms'
    | 'my_work'
    | 'max_w_chat'
    | 'archive_notifications'
    | 'relative_time'
    | 'firehose'
    | 'grouped_notifications'
    | 'comfy_compact_layout'
    | 'message_email_notifications'
    | 'integration_dms'
    | 'chat_channels'
    | 'channel_split_view'
    | 'no_emoji_accessories'
    | 'export'
    | 'force_dev_slackbot'
  )[]
  logged_in: boolean
  preferences: UserPreferences
}

export type UsersMePatchRequest = {
  avatar_path?: string | null
  cover_photo_path?: string | null
  email?: string
  name?: string
  username?: string
  current_password?: string
  password?: string
  password_confirmation?: string
}

export type SendUserConfirmationInstructionsPostResponse = object

export type UserAvatarPresignedFieldsGetRequest = {
  mime_type: string
}

export type UserCoverPhotoPresignedFieldsGetRequest = {
  mime_type: string
}

export type WebPushSubscriptionsPostResponse = object

export type WebPushSubscriptionsPostRequest = {
  old_endpoint?: string | null
  new_endpoint: string
  p256dh: string
  auth: string
}

export type V2Author = {
  avatar_urls: AvatarUrls
  name: string
  id: string
  type: 'app' | 'member'
}

export type V2Message = {
  id: string
  content: string
  created_at: string
  updated_at: string
  parent_id: string | null
  thread_id: string
  author: V2Author | null
}

export type V2MemberMessagesPostRequest = {
  content_markdown: string
  parent_id?: string
}

export type V2User = {
  id: string
  avatar_urls: AvatarUrls
  email: string
  display_name: string
}

export type V2OrganizationMember = {
  id: string
  role: 'admin' | 'member' | 'viewer' | 'guest'
  created_at: string
  is_deactivated: boolean
  user: V2User
}

export type V2OrganizationMemberPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: V2OrganizationMember[]
  total_count: number
}

export type V2MembersGetRequest = {
  q?: string
  after?: string
  limit?: number
  roles?: 'admin' | 'member' | 'viewer' | 'guest'
  sort?: 'created_at' | 'last_seen_at'
  direction?: 'asc' | 'desc'
}

export type V2Comment = {
  id: string
  content: string
  created_at: string
  replies_count: number
  parent_id: string | null
  subject_id: string
  subject_type: string
  author: V2Author
}

export type V2CommentPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: V2Comment[]
  total_count: number
}

export type V2PostCommentsGetRequest = {
  after?: string
  limit?: number
  parent_id?: string
  sort?: 'created_at'
  direction?: 'asc' | 'desc'
}

export type V2PostsPostIdCommentsPostRequest = {
  /** The comment content in Markdown format. */
  content_markdown: string
  /** The ID of an existing comment to reply to. A single level of nested comments is supported. */
  parent_id?: string
}

export type V2Project = {
  id: string
  name: string
}

export type V2PostResolution = {
  resolved_at: string
  resolved_html: string | null
  resolved_by: V2Author
  resolved_comment: V2Comment | null
}

export type V2Post = {
  id: string
  title: string
  created_at: string
  last_activity_at: string
  url: string
  content: string
  comments_count: number
  channel: V2Project
  author: V2Author
  resolution: V2PostResolution | null
}

export type V2PostsPostIdResolutionPostRequest = {
  content_markdown: string | null
  comment_id: string | null
}

export type V2PostPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: V2Post[]
  total_count: number
}

export type V2PostsGetRequest = {
  after?: string
  limit?: number
  channel_id?: string
  sort?: 'last_activity_at' | 'published_at'
  direction?: 'asc' | 'desc'
}

export type V2PostsPostRequest = {
  title?: string
  /** The post content in Markdown format. */
  content_markdown: string
  /** The ID of the channel to create the post in. */
  channel_id: string
}

export type V2ProjectPage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: V2Project[]
  total_count: number
}

export type V2ChannelsGetRequest = {
  name?: string
  after?: string
  limit?: number
  sort?: 'name' | 'last_activity_at' | 'created_at'
  direction?: 'asc' | 'desc'
}

export type V2MessagePage = {
  next_cursor?: string | null
  prev_cursor?: string | null
  data: V2Message[]
  total_count: number
}

export type V2ThreadMessagesGetRequest = {
  after?: string
  limit?: number
  sort?: 'created_at'
  direction?: 'asc' | 'desc'
}

export type V2ThreadsThreadIdMessagesPostRequest = {
  /** The message content in Markdown format. */
  content_markdown: string
  /** The ID of the parent message. */
  parent_id?: string
}

export type V2MessageThread = {
  id: string
  created_at: string
  updated_at: string
  group: boolean
  last_message_at: string | null
  members_count: number
  avatar_urls: AvatarUrls | null
  title: string
  creator: V2Author
}

export type V2ThreadsPostRequest = {
  title?: string
  member_ids: string[]
}

export type FigmaKeyPair = {
  read_key: string
  write_key: string
}

export type PostActivityViewsData = UserNotificationCounts

export type GetAttachmentsCommentersData = OrganizationMember[]

export type PostAttachmentsData = Attachment

export type GetAttachmentsByIdData = Attachment

export type PostBatchedPostViewsData = BatchedPostViewsPostResponse

export type GetCallRecordingsTranscriptionData = CallRecordingTranscription

export type PostCallRoomsInvitationsData = OrganizationCallRoomInvitationsPostResponse

export type GetCallRoomsByIdData = CallRoom

export type PostCallRoomsData = CallRoom

export type DeleteCallsAllRecordingsData = OrganizationCallAllRecordingsDeleteResponse

export type PostCallsFavoriteData = Favorite

export type DeleteCallsFavoriteData = OrganizationCallFavoriteDeleteResponse

export type PostCallsFollowUpData = FollowUp

export type PostCallsPinData = ProjectPinCreated

export type PutCallsProjectPermissionData = Call

export type DeleteCallsProjectPermissionData = OrganizationsOrgSlugCallsCallIdProjectPermissionDeleteResponse

export type GetCallsRecordingsParams = {
  after?: string
  limit?: number
  orgSlug: string
  callId: string
}

export type GetCallsRecordingsData = CallRecordingPage

export type GetCallsParams = {
  filter?: 'joined'
  after?: string
  limit?: number
  q?: string
  orgSlug: string
}

export type GetCallsData = CallPage

export type GetCallsByIdData = Call

export type PutCallsByIdData = Call

export type PutCommentsAttachmentsReorderData = OrganizationsOrgSlugCommentsCommentIdAttachmentsReorderPutResponse

export type PostCommentsFollowUpData = FollowUp

export type PostCommentsLinearIssuesData = CreateLinearIssue

export type PostCommentsReactionsData = Reaction

export type PostCommentsRepliesData = ReplyCreated

export type PostCommentsResolutionsData = Comment

export type DeleteCommentsResolutionsData = Comment

export type PutCommentsTasksData = Comment

export type GetCommentsByIdData = Comment

export type PutCommentsByIdData = Comment

export type DeleteCommentsByIdData = Commenters

export type GetCustomReactionsPacksData = CustomReactionsPack[]

export type PostCustomReactionsPacksData = OrganizationsOrgSlugCustomReactionsPacksPostResponse

export type DeleteCustomReactionsPacksByNameData = OrganizationCustomReactionsPackDeleteResponse

export type GetCustomReactionsParams = {
  after?: string
  limit?: number
  orgSlug: string
}

export type GetCustomReactionsData = CustomReactionPage

export type PostCustomReactionsData = CustomReaction

export type DeleteCustomReactionsByIdData = OrganizationCustomReactionDeleteResponse

export type PostDataExportsData = OrganizationDataExportsPostResponse

export type GetDigestsMigrationsData = PostDigestNoteMigration

export type PutFavoritesReorderData = ReorderOrganizationFavoritesPutResponse

export type GetFavoritesData = Favorite[]

export type DeleteFavoritesByIdData = OrganizationFavoriteDeleteResponse

export type PostFeedbackData = OrganizationFeedbacksPostResponse

export type GetFeedbackPresignedFieldsParams = {
  mime_type: string
  orgSlug: string
}

export type GetFeedbackPresignedFieldsData = PresignedPostFields

export type PostFigmaFilesData = FigmaFile

export type PostFigmaFileAttachmentDetailsData = FigmaFileAttachmentDetails

export type GetFollowUpsParams = {
  after?: string
  limit?: number
  orgSlug: string
}

export type GetFollowUpsData = FollowUpPage

export type PutFollowUpsByIdData = FollowUp

export type DeleteFollowUpsByIdData = OrganizationsOrgSlugFollowUpsIdDeleteResponse

export type GetGifsParams = {
  q?: string
  limit?: number
  after?: string
  orgSlug: string
}

export type GetGifsData = GifsPage

export type PostImageUrlsData = ImageUrls

export type PostIntegrationsCalDotComCallRoomsData = CallRoom

export type GetIntegrationsCalDotComIntegrationData = CalDotComIntegration

export type PutIntegrationsCalDotComOrganizationData = IntegrationsCalDotComOrganizationPutResponse

export type GetIntegrationsFigmaIntegrationData = FigmaIntegrationGetResponse

export type PostIntegrationsGoogleCalendarEventsData = GoogleCalendarEvent

export type PutIntegrationsGoogleCalendarEventsOrganizationData =
  IntegrationsGoogleCalendarEventsOrganizationPutResponse

export type GetIntegrationsGoogleCalendarIntegrationData = GoogleCalendarIntegration

export type GetIntegrationsLinearInstallationData = LinearIntegration

export type DeleteIntegrationsLinearInstallationData = OrganizationsOrgSlugIntegrationsLinearInstallationDeleteResponse

export type PostIntegrationsLinearTeamSyncsData = OrganizationIntegrationsLinearTeamSyncsPostResponse

export type GetIntegrationsLinearTeamsData = IntegrationTeam[]

export type PostIntegrationsSlackChannelSyncsData = OrganizationIntegrationsSlackChannelSyncsPostResponse

export type GetIntegrationsSlackChannelsParams = {
  after?: string
  q?: string
  limit?: number
  orgSlug: string
}

export type GetIntegrationsSlackChannelsData = SlackChannelPage

export type GetIntegrationsSlackChannelsByProviderChannelIdData = SlackChannel

export type PostIntegrationsZapierCommentsData = ZapierComment

export type PostIntegrationsZapierMessagesData = ZapierMessage

export type PostIntegrationsZapierPostsData = ZapierPost

export type GetIntegrationsZapierProjectsParams = {
  name?: string
}

export type GetIntegrationsZapierProjectsData = ZapierProjects

export type GetInvitationUrlData = InvitationUrl

export type GetThreadsDmsByUsernameData = MessageThreadDmResult

export type PostThreadsFavoritesData = Favorite

export type DeleteThreadsFavoritesData = OrganizationThreadFavoritesDeleteResponse

export type GetThreadsIntegrationDmsByOauthApplicationIdData = MessageThreadDmResult

export type GetThreadsMessagesParams = {
  after?: string
  limit?: number
  orgSlug: string
  threadId: string
}

export type GetThreadsMessagesData = MessagePage

export type PostThreadsMessagesData = PusherInvalidateMessage

export type PutThreadsMessagesByIdData = OrganizationsOrgSlugThreadsThreadIdMessagesIdPutResponse

export type DeleteThreadsMessagesByIdData = OrganizationsOrgSlugThreadsThreadIdMessagesIdDeleteResponse

export type GetThreadsMyMembershipData = MessageThreadMembership

export type PutThreadsMyMembershipData = MessageThreadMembership

export type DeleteThreadsMyMembershipData = OrganizationsOrgSlugThreadsThreadIdMyMembershipDeleteResponse

export type PostThreadsNotificationForcesData = OrganizationThreadNotificationForcesPostResponse

export type GetThreadsOauthApplicationsData = OauthApplication[]

export type PostThreadsOauthApplicationsData = MessageThreadMembership

export type DeleteThreadsOauthApplicationsByIdData = OrganizationThreadOauthApplicationDeleteResponse

export type PutThreadsOtherMembershipsListData = MessageThread

export type GetThreadsPresignedFieldsParams = {
  mime_type: string
  orgSlug: string
}

export type GetThreadsPresignedFieldsData = PresignedPostFields

export type PostThreadsReadsData = UserNotificationCounts

export type DeleteThreadsReadsData = UserNotificationCounts

export type GetThreadsData = MessageThreadInbox

export type PostThreadsData = MessageThread

export type GetThreadsByIdData = MessageThread

export type PutThreadsByIdData = MessageThread

export type DeleteThreadsByIdData = OrganizationsOrgSlugThreadsIdDeleteResponse

export type DeleteMessagesAttachmentsByIdData = OrganizationMessageAttachmentDeleteResponse

export type PostMessagesReactionsData = Reaction

export type GetNotesAttachmentsCommentsParams = {
  after?: string
  limit?: number
  orgSlug: string
  noteId: string
  attachmentId: string
}

export type GetNotesAttachmentsCommentsData = CommentPage

export type PutNotesAttachmentsReorderData = OrganizationsOrgSlugNotesNoteIdAttachmentsReorderPutResponse

export type PostNotesAttachmentsData = Attachment

export type PutNotesAttachmentsByIdData = Attachment

export type DeleteNotesAttachmentsByIdData = Note

export type GetNotesCommentsParams = {
  after?: string
  limit?: number
  orgSlug: string
  noteId: string
}

export type GetNotesCommentsData = CommentPage

export type PostNotesCommentsData = CommentCreated

export type PostNotesFavoriteData = Favorite

export type DeleteNotesFavoriteData = OrganizationNoteFavoriteDeleteResponse

export type PostNotesFollowUpData = FollowUp

export type GetNotesPermissionsData = Permission[]

export type PostNotesPermissionsData = Permission[]

export type PutNotesPermissionsByIdData = Permission

export type DeleteNotesPermissionsByIdData = OrganizationsOrgSlugNotesNoteIdPermissionsIdDeleteResponse

export type PostNotesPinData = ProjectPinCreated

export type PutNotesProjectPermissionsData = Note

export type DeleteNotesProjectPermissionsData = OrganizationsOrgSlugNotesNoteIdProjectPermissionsDeleteResponse

export type GetNotesPublicNotesData = PublicNote

export type GetNotesSyncStateData = NoteSync

export type PutNotesSyncStateData = OrganizationsOrgSlugNotesNoteIdSyncStatePutResponse

export type GetNotesTimelineEventsParams = {
  after?: string
  limit?: number
  orgSlug: string
  noteId: string
}

export type GetNotesTimelineEventsData = TimelineEventPage

export type GetNotesViewsData = NoteView[]

export type PostNotesViewsData = NoteViewCreated

export type PutNotesVisibilityData = OrganizationsOrgSlugNotesNoteIdVisibilityPutResponse

export type GetNotesParams = {
  after?: string
  limit?: number
  q?: string
  order?: {
    by: 'created_at' | 'last_activity_at'
    direction: 'asc' | 'desc'
  }
  orgSlug: string
}

export type GetNotesData = NotePage

export type PostNotesData = Note

export type GetNotesByIdData = Note

export type PutNotesByIdData = Note

export type DeleteNotesByIdData = OrganizationsOrgSlugNotesIdDeleteResponse

export type DeleteMembersMeNotificationsArchiveData = OrganizationNotificationArchiveDeleteResponse

export type PostMembersMeNotificationsDeleteAllData = OrganizationNotificationDeleteAllPostResponse

export type PostMembersMeNotificationsMarkAllReadData = OrganizationNotificationMarkAllReadPostResponse

export type PostMembersMeNotificationsReadData = OrganizationNotificationReadPostResponse

export type DeleteMembersMeNotificationsReadData =
  OrganizationsOrgSlugMembersMeNotificationsNotificationIdReadDeleteResponse

export type GetMembersMeNotificationsParams = {
  unread?: boolean
  filter?: 'home' | 'grouped_home' | 'activity'
  after?: string
  limit?: number
  orgSlug: string
}

export type GetMembersMeNotificationsData = NotificationPage

export type DeleteMembersMeNotificationsByIdData = OrganizationNotificationDeleteResponse

export type GetOauthApplicationsPresignedFieldsParams = {
  mime_type: string
  orgSlug: string
}

export type GetOauthApplicationsPresignedFieldsData = PresignedPostFields

export type PostOauthApplicationsSecretRenewalsData = OauthApplication

export type PostOauthApplicationsTokensData = AccessToken

export type GetOauthApplicationsData = OauthApplication[]

export type PostOauthApplicationsData = OauthApplication

export type GetOauthApplicationsByIdData = OauthApplication

export type PutOauthApplicationsByIdData = OauthApplication

export type DeleteOauthApplicationsByIdData = OrganizationsOrgSlugOauthApplicationsIdDeleteResponse

export type PostOnboardProjectsData = OrganizationOnboardProjectsPostResponse

export type GetOpenGraphLinksParams = {
  url: string
}

export type GetOpenGraphLinksData = OpenGraphLink

export type GetInvitationsParams = {
  q?: string
  role_counted?: boolean
  after?: string
  orgSlug: string
}

export type GetInvitationsData = OrganizationInvitationPage

export type PostInvitationsData = OrganizationInvitation[]

export type GetInvitationsByInviteTokenData = OrganizationInvitation

export type PostInvitationsByTokenAcceptData = AcceptInvitationByTokenPostResponse

export type DeleteInvitationsByIdData = OrganizationsOrgSlugInvitationsIdDeleteResponse

export type GetMembersParams = {
  q?: string
  status?: 'deactivated'
  roles?: ('admin' | 'member' | 'viewer' | 'guest')[]
  after?: string
  limit?: number
  order?: {
    by: 'created_at' | 'last_seen_at'
    direction: 'asc' | 'desc'
  }
  orgSlug: string
}

export type GetMembersData = OrganizationMemberPage

export type GetMembersByUsernameData = OrganizationMember

export type GetMembersPostsParams = {
  after?: string
  limit?: number
  order?: {
    by: 'last_activity_at' | 'published_at'
    direction: 'asc' | 'desc'
  }
  orgSlug: string
  username: string
}

export type GetMembersPostsData = PostPage

export type PutMembersByIdData = OrganizationMember

export type DeleteMembersByIdData = OrganizationsOrgSlugMembersIdDeleteResponse

export type PutMembersReactivateData = OrganizationsOrgSlugMembersIdReactivatePutResponse

export type GetMembershipRequestsParams = {
  after?: string
  orgSlug: string
}

export type GetMembershipRequestsData = OrganizationMembershipRequestPage

export type PostMembershipRequestsData = OrganizationMembershipRequest

export type GetMembershipRequestData = OrganizationMembershipRequestGetResponse

export type PostMembershipRequestsApproveData = OrganizationApproveMembershipRequestPostResponse

export type PostMembershipRequestsDeclineData = OrganizationDeclineMembershipRequestPostResponse

export type GetMembersMeArchivedNotificationsParams = {
  after?: string
  limit?: number
  orgSlug: string
}

export type GetMembersMeArchivedNotificationsData = NotificationPage

export type PostMembersMeDataExportData = OrganizationMembershipDataExportPostResponse

export type GetMembersMeForMeNotesParams = {
  after?: string
  limit?: number
  q?: string
  order?: {
    by: 'created_at' | 'last_activity_at'
    direction: 'asc' | 'desc'
  }
  orgSlug: string
}

export type GetMembersMeForMeNotesData = NotePage

export type GetMembersMeForMePostsParams = {
  after?: string
  limit?: number
  q?: string
  hide_resolved?: boolean
  order?: {
    by: 'last_activity_at' | 'published_at'
    direction: 'asc' | 'desc'
  }
  orgSlug: string
}

export type GetMembersMeForMePostsData = PostPage

export type PutMembersMeIndexViewsData = PublicOrganizationMembership

export type GetMembersMePersonalCallRoomData = CallRoom

export type GetMembersMePersonalDraftPostsParams = {
  after?: string
  limit?: number
  order?: {
    by: 'last_activity_at'
    direction: 'asc' | 'desc'
  }
  orgSlug: string
}

export type GetMembersMePersonalDraftPostsData = PostPage

export type PutMembersProjectMembershipListData = ProjectMembershipList

export type GetMembersProjectMembershipsData = ProjectMembershipList

export type PutOrganizationMembershipsReorderData = OrganizationMembershipsReorderPutResponse

export type GetMembersMeSlackNotificationPreferenceData = OrganizationMembershipSlackNotificationPreferenceGetResponse

export type PostMembersMeSlackNotificationPreferenceData =
  OrganizationsOrgSlugMembersMeSlackNotificationPreferencePostResponse

export type DeleteMembersMeSlackNotificationPreferenceData =
  OrganizationsOrgSlugMembersMeSlackNotificationPreferenceDeleteResponse

export type GetMembersMeStatusesData = OrganizationMembershipStatus[]

export type PostMembersMeStatusesData = OrganizationMembershipStatus

export type PutMembersMeStatusesData = OrganizationMembershipStatus

export type DeleteMembersMeStatusesData = OrganizationsOrgSlugMembersMeStatusesDeleteResponse

export type GetMembersMeViewerNotesParams = {
  after?: string
  limit?: number
  q?: string
  order?: {
    by: 'last_activity_at' | 'created_at'
    direction: 'asc' | 'desc'
  }
  orgSlug: string
}

export type GetMembersMeViewerNotesData = NotePage

export type GetMembersMeViewerPostsParams = {
  after?: string
  limit?: number
  q?: string
  order?: {
    by: 'last_activity_at' | 'published_at'
    direction: 'asc' | 'desc'
  }
  orgSlug: string
}

export type GetMembersMeViewerPostsData = PostPage

export type GetOrganizationMembershipsData = PublicOrganizationMembership[]

export type PostBulkInvitesData = OrganizationInvitation[]

export type GetFeaturesData = OrganizationFeaturesGetResponse

export type PostSsoConfigurationData = OrganizationSsoConfigurationPostResponse

export type PostSsoData = Organization

export type DeleteSsoData = Organization

export type PostVerifiedDomainMembershipsData = OrganizationMember

export type GetByOrgSlugData = Organization

export type PutByOrgSlugData = Organization

export type DeleteByOrgSlugData = OrganizationsOrgSlugDeleteResponse

export type PostOrganizationsData = Organization

export type PatchResetInviteTokenData = Organization

export type PostJoinByTokenData = SuggestedOrganization

export type PutOnboardData = Organization

export type GetAvatarPresignedFieldsParams = {
  mime_type: string
  orgSlug: string
}

export type GetAvatarPresignedFieldsData = PresignedPostFields

export type DeletePinsByIdData = OrganizationPinDeleteResponse

export type GetPostsAttachmentsCommentsParams = {
  after?: string
  limit?: number
  orgSlug: string
  postId: string
  attachmentId: string
}

export type GetPostsAttachmentsCommentsData = CommentPage

export type PutPostsAttachmentsReorderData = OrganizationsOrgSlugPostsPostIdAttachmentsReorderPutResponse

export type PostPostsAttachmentsData = Attachment

export type PutPostsAttachmentsByIdData = Attachment

export type DeletePostsAttachmentsByIdData = Post

export type PostPostsFavoriteData = Favorite

export type DeletePostsFavoriteData = OrganizationPostFavoriteDeleteResponse

export type PostPostsFeedbackDismissalsData = FeedbackRequest

export type PostPostsFollowUpData = FollowUp

export type GetPostsGeneratedResolutionParams = {
  comment_id?: string
  orgSlug: string
  postId: string
}

export type GetPostsGeneratedResolutionData = GeneratedHtml

export type GetPostsGeneratedTldrData = GeneratedHtml

export type PostPostsLinearIssuesData = CreateLinearIssue

export type GetPostsLinearTimelineEventsParams = {
  after?: string
  limit?: number
  orgSlug: string
  postId: string
}

export type GetPostsLinearTimelineEventsData = TimelineEventPage

export type PostPostsPinData = ProjectPinCreated

export type PostPostsPoll2OptionsVoteData = Post

export type PostPostsPoll2Data = Post

export type PutPostsPoll2Data = Post

export type DeletePostsPoll2Data = OrganizationsOrgSlugPostsPostIdPoll2DeleteResponse

export type GetPostsCanvasCommentsData = Comment[]

export type GetPostsCommentsParams = {
  after?: string
  limit?: number
  orgSlug: string
  postId: string
}

export type GetPostsCommentsData = CommentPage

export type PostPostsComments2Data = CommentCreated

export type PostPostsFeedbackRequestsData = FeedbackRequest

export type DeletePostsFeedbackRequestsByIdData = OrganizationPostFeedbackRequestDeleteResponse

export type PostPostsFeedbackRequestsDismissalData = FeedbackRequest

export type PostPostsLinksData = PostLink

export type PostPostsReactionsData = Reaction

export type GetPostsVersionsData = PostVersion[]

export type PostPostsVersionsData = Post

export type GetPostsViewsParams = {
  after?: string
  orgSlug: string
  postId: string
}

export type GetPostsViewsData = PostViewPage

export type PostPostsViewsData = PostViewCreated

export type PostPostsPublicationData = Post

export type PostPostsResolutionData = Post

export type DeletePostsResolutionData = Post

export type GetPostsSeoInfoData = PostSeoInfo

export type PostPostsSharesData = OrganizationPostSharesPostResponse

export type PutPostsStatusData = OrganizationsOrgSlugPostsPostIdStatusPutResponse

export type PutPostsTasksData = Post

export type GetPostsTimelineEventsParams = {
  after?: string
  limit?: number
  orgSlug: string
  postId: string
}

export type GetPostsTimelineEventsData = TimelineEventPage

export type GetPostsPollOptionsVotersParams = {
  after?: string
  limit?: number
  orgSlug: string
  postId: string
  pollOptionId: string
}

export type GetPostsPollOptionsVotersData = OrganizationMemberPage

export type GetPostsParams = {
  after?: string
  limit?: number
  q?: string
  order?: {
    by: 'last_activity_at' | 'published_at'
    direction: 'asc' | 'desc'
  }
  orgSlug: string
}

export type GetPostsData = PostPage

export type PostPostsData = Post

export type GetPostsByPostIdData = Post

export type PutPostsByPostIdData = Post

export type DeletePostsByPostIdData = OrganizationsOrgSlugPostsPostIdDeleteResponse

export type PostPostsSubscribeData = OrganizationPostSubscribePostResponse

export type DeletePostsUnsubscribeData = OrganizationPostUnsubscribeDeleteResponse

export type GetPostsPresignedFieldsParams = {
  mime_type: string
  orgSlug: string
}

export type GetPostsPresignedFieldsData = PresignedPostFields

export type PostProductLogsData = ProductLogsPostResponse

export type PutProjectMembershipsReorderData = OrganizationsOrgSlugProjectMembershipsReorderPutResponse

export type GetProjectMembershipsData = ProjectMembership[]

export type GetProjectsAddableMembersParams = {
  after?: string
  limit?: number
  orgSlug: string
  projectId: string
}

export type GetProjectsAddableMembersData = OrganizationMemberPage

export type GetProjectsBookmarksData = ProjectBookmark[]

export type PostProjectsBookmarksData = ProjectBookmark

export type PatchProjectsBookmarksByIdData = ProjectBookmark

export type DeleteProjectsBookmarksByIdData = OrganizationsOrgSlugProjectsProjectIdBookmarksIdDeleteResponse

export type PutProjectsBookmarksReorderData = ProjectBookmark[]

export type GetProjectsCallsParams = {
  after?: string
  limit?: number
  q?: string
  orgSlug: string
  projectId: string
}

export type GetProjectsCallsData = CallPage

export type PostProjectsDataExportsData = OrganizationProjectDataExportsPostResponse

export type PutProjectsDisplayPreferencesData = Project

export type PostProjectsFavoritesData = Favorite

export type DeleteProjectsFavoritesData = OrganizationProjectFavoritesDeleteResponse

export type PostProjectsInvitationUrlAcceptancesData = OrganizationProjectInvitationUrlAcceptancesPostResponse

export type PostProjectsInvitationUrlData = InvitationUrl

export type GetProjectsInvitationUrlData = InvitationUrl

export type GetProjectsMembersParams = {
  after?: string
  limit?: number
  organization_membership_id?: string
  roles?: ('admin' | 'member' | 'viewer' | 'guest')[]
  exclude_roles?: ('admin' | 'member' | 'viewer' | 'guest')[]
  orgSlug: string
  projectId: string
}

export type GetProjectsMembersData = OrganizationMemberPage

export type PostProjectsMembershipsData = ProjectMembership

export type DeleteProjectsMembershipsData = Project

export type GetProjectsNotesParams = {
  after?: string
  limit?: number
  q?: string
  order?: {
    by: 'last_activity_at' | 'created_at'
    direction: 'asc' | 'desc'
  }
  orgSlug: string
  projectId: string
}

export type GetProjectsNotesData = NotePage

export type GetProjectsOauthApplicationsData = OauthApplication[]

export type PostProjectsOauthApplicationsData = ProjectMembership

export type DeleteProjectsOauthApplicationsByIdData = OrganizationProjectOauthApplicationDeleteResponse

export type GetProjectsPinsData = ProjectPinList

export type GetProjectsPostsParams = {
  after?: string
  limit?: number
  q?: string
  hide_resolved?: boolean
  order?: {
    by: 'last_activity_at' | 'published_at'
    direction: 'asc' | 'desc'
  }
  orgSlug: string
  projectId: string
}

export type GetProjectsPostsData = PostPage

export type PostProjectsReadsData = OrganizationsOrgSlugProjectsProjectIdReadsPostResponse

export type DeleteProjectsReadsData = OrganizationProjectReadsDeleteResponse

export type PostProjectsSubscriptionData = Project

export type DeleteProjectsSubscriptionData = Project

export type PutProjectsViewerDisplayPreferencesData = Project

export type DeleteProjectsViewerDisplayPreferencesData = Project

export type PostProjectsViewsData = Project

export type GetProjectsParams = {
  filter?: string
  after?: string
  limit?: number
  q?: string
  orgSlug: string
}

export type GetProjectsData = ProjectPage

export type PostProjectsData = Project

export type GetProjectsByProjectIdData = Project

export type PutProjectsByProjectIdData = Project

export type DeleteProjectsByProjectIdData = OrganizationsOrgSlugProjectsProjectIdDeleteResponse

export type PatchProjectsArchiveData = Project

export type PatchProjectsUnarchiveData = Project

export type GetProjectCoverPhotoPresignedFieldsParams = {
  mime_type: string
  orgSlug: string
}

export type GetProjectCoverPhotoPresignedFieldsData = PresignedPostFields

export type GetOrganizationByTokenData = PublicOrganization

export type GetPublicProjectsByTokenData = PublicProject

export type DeleteReactionsData = CustomReaction

export type GetResourceMentionsParams = {
  url: string
  orgSlug: string
}

export type GetResourceMentionsData = ResourceMention

export type GetSearchGroupsParams = {
  q?: string
  focus?: 'projects' | 'people' | 'tags' | 'posts' | 'calls' | 'notes'
  orgSlug: string
}

export type GetSearchGroupsData = SearchGroup

export type GetSearchMixedParams = {
  q: string
  focus?: 'posts' | 'calls' | 'notes'
  orgSlug: string
}

export type GetSearchMixedData = SearchMixed

export type GetSearchPostsParams = {
  q: string
  project_id?: string
  author?: string
  tag?: string
  limit?: number
  orgSlug: string
}

export type GetSearchPostsData = Post[]

export type GetSearchResourceMentionsParams = {
  q: string
  orgSlug: string
}

export type GetSearchResourceMentionsData = ResourceMentionResults

export type GetIntegrationsSlackData = SlackIntegration

export type DeleteIntegrationsSlackData = OrganizationIntegrationsSlackDeleteResponse

export type GetSyncCustomReactionsData = SyncCustomReaction[]

export type GetSyncMembersData = SyncOrganizationMember[]

export type GetSyncMessageThreadsData = SyncMessageThreads

export type GetSyncProjectsData = SyncProject[]

export type GetSyncTagsData = Tag[]

export type GetTagsParams = {
  q?: string
  after?: string
  limit?: number
  orgSlug: string
}

export type GetTagsData = TagPage

export type PostTagsData = Tag

export type GetTagsByTagNameData = Tag

export type PatchTagsByTagNameData = Tag

export type DeleteTagsByTagNameData = OrganizationsOrgSlugTagsTagNameDeleteResponse

export type GetTagsPostsParams = {
  after?: string
  limit?: number
  orgSlug: string
  tagName: string
}

export type GetTagsPostsData = PostPage

export type PostSignInDesktopData = InternalDesktopSessionPostResponse

export type PostMeSyncTokenData = CurrentUserEditorSyncTokensPostResponse

export type PostMeNotificationPauseData = UsersMeNotificationPausePostResponse

export type DeleteMeNotificationPauseData = UsersNotificationPauseDeleteResponse

export type GetMeNotificationScheduleData = NotificationSchedule

export type PutMeNotificationScheduleData = UsersMeNotificationSchedulePutResponse

export type DeleteMeNotificationScheduleData = UsersMeNotificationScheduleDeleteResponse

export type GetMeNotificationsUnreadAllCountData = UserNotificationCounts

export type GetMeOrganizationInvitationsData = OrganizationInvitation[]

export type PutMePreferenceData = UsersMePreferencePutResponse

export type GetMeScheduledNotificationsData = ScheduledNotification[]

export type PostMeScheduledNotificationsData = ScheduledNotification

export type PutMeScheduledNotificationsByIdData = ScheduledNotification

export type DeleteMeScheduledNotificationsByIdData = UsersMeScheduledNotificationsIdDeleteResponse

export type DeleteMeSignOutData = SignOutCurrentUserDeleteResponse

export type GetMeSuggestedOrganizationsData = SuggestedOrganization[]

export type PostMeTimezoneData = UsersTimezonePostResponse

export type PostMeTwoFactorAuthenticationData = CurrentUserTwoFactorAuthenticationPostResponse

export type PutMeTwoFactorAuthenticationData = UsersMeTwoFactorAuthenticationPutResponse

export type DeleteMeTwoFactorAuthenticationData = UsersMeTwoFactorAuthenticationDeleteResponse

export type GetMeData = CurrentUser

export type PatchMeData = CurrentUser

export type PutMeOnboardData = CurrentUser

export type PostMeSendEmailConfirmationData = SendUserConfirmationInstructionsPostResponse

export type GetMeAvatarPresignedFieldsParams = {
  mime_type: string
}

export type GetMeAvatarPresignedFieldsData = PresignedPostFields

export type GetMeCoverPhotoPresignedFieldsParams = {
  mime_type: string
}

export type GetMeCoverPhotoPresignedFieldsData = PresignedPostFields

export type PostPushSubscriptionsData = WebPushSubscriptionsPostResponse

export type PostMembersMessagesV2Data = V2Message

export type GetMembersV2Params = {
  /** Search by name or email. */
  q?: string
  /** Use with `next_cursor` and `prev_cursor` in the response to paginate through results. */
  after?: string
  /** Specifies how many records to return. The default and maximum is 50. */
  limit?: number
  /** Filter by role. Separate multiple roles with commas. */
  roles?: 'admin' | 'member' | 'viewer' | 'guest'
  sort?: 'created_at' | 'last_seen_at'
  direction?: 'asc' | 'desc'
}

export type GetMembersV2Data = V2OrganizationMemberPage

export type GetPostsCommentsV2Params = {
  /** Use with `next_cursor` and `prev_cursor` in the response to paginate through results. */
  after?: string
  /** Specifies how many records to return. The default and maximum is 50. */
  limit?: number
  /** The ID of the parent comment. */
  parent_id?: string
  sort?: 'created_at'
  direction?: 'asc' | 'desc'
  postId: string
}

export type GetPostsCommentsV2Data = V2CommentPage

export type PostPostsCommentsV2Data = V2Comment

export type PostPostsResolutionV2Data = V2Post

export type DeletePostsResolutionV2Data = V2Post

export type GetPostsV2Params = {
  /** Use with `next_cursor` and `prev_cursor` in the response to paginate through results. */
  after?: string
  /** Specifies how many records to return. The default and maximum is 50. */
  limit?: number
  /** Filters the posts to only include those from a specific channel. */
  channel_id?: string
  sort?: 'last_activity_at' | 'published_at'
  direction?: 'asc' | 'desc'
}

export type GetPostsV2Data = V2PostPage

export type PostPostsV2Data = V2Post

export type GetPostsByIdV2Data = V2Post

export type GetChannelsV2Params = {
  /** When included, filters channels by name. */
  name?: string
  /** Use with `next_cursor` and `prev_cursor` in the response to paginate through results. */
  after?: string
  /** Specifies how many records to return. The default and maximum is 50. */
  limit?: number
  sort?: 'name' | 'last_activity_at' | 'created_at'
  direction?: 'asc' | 'desc'
}

export type GetChannelsV2Data = V2ProjectPage

export type GetThreadsMessagesV2Params = {
  /** Use with `next_cursor` and `prev_cursor` in the response to paginate through results. */
  after?: string
  /** Specifies how many records to return. The default and maximum is 50. */
  limit?: number
  sort?: 'created_at'
  direction?: 'asc' | 'desc'
  threadId: string
}

export type GetThreadsMessagesV2Data = V2MessagePage

export type PostThreadsMessagesV2Data = V2Message

export type PostThreadsV2Data = V2MessageThread

export type PostSignInFigmaData = FigmaKeyPair

export type QueryParamsType = Record<string | number, any>
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>

export enum ApiErrorTypes {
  AuthenticationError = 'AuthenticationError',
  ForbiddenError = 'ForbiddenError',
  NotFoundError = 'NotFoundError',
  UnprocessableError = 'UnprocessableError',
  InternalError = 'InternalError',
  ConnectionError = 'ConnectionError'
}

export class ApiError extends Error {
  status: number
  code: string
  constructor(status: number, message: string, code: string, isConnectionError = false) {
    super(message)
    this.status = status
    this.code = code

    if (isConnectionError) {
      this.name = ApiErrorTypes.ConnectionError
    } else {
      switch (status) {
        case 401:
          this.name = ApiErrorTypes.AuthenticationError
          break
        case 403:
          this.name = ApiErrorTypes.ForbiddenError
          break
        case 404:
          this.name = ApiErrorTypes.NotFoundError
          break
        case 422:
          this.name = ApiErrorTypes.UnprocessableError
          break
        default:
          this.name = ApiErrorTypes.InternalError
      }
    }
  }
}

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean
  /** request path */
  path: string
  /** content type of request body */
  type?: ContentType
  /** query params */
  query?: QueryParamsType
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat
  /** request body */
  body?: unknown
  /** base url */
  baseUrl?: string
  /** request cancellation token */
  cancelToken?: CancelToken
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void
  customFetch?: typeof fetch
}

type CancelToken = Symbol | string | number

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain'
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = 'https://api.campsite.com'
  private securityData: SecurityDataType | null = null
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
  private abortControllers = new Map<CancelToken, AbortController>()
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams)

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
  }

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig)
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data
  }

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key)
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key])
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key]
    return value.map((v: any) => this.encodeQueryParam(`${key}[]`, v)).join('&')
  }

  protected addObjectQueryParam(query: QueryParamsType, key: string) {
    const value = query[key]
    return Object.keys(value)
      .map((subKey) => {
        const subValue = value[subKey]
        return this.encodeQueryParam(`${key}[${subKey}]`, subValue)
      })
      .join('&')
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {}
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key])
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : query[key] === Object(query[key])
            ? this.addObjectQueryParam(query, key)
            : this.addQueryParam(query, key)
      )
      .join('&')
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery)
    return queryString ? `?${queryString}` : ''
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== 'string' ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key]
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
              ? JSON.stringify(property)
              : `${property}`
        )
        return formData
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input)
  }

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {})
      }
    }
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken)
      if (abortController) {
        return abortController.signal
      }
      return void 0
    }

    const abortController = new AbortController()
    this.abortControllers.set(cancelToken, abortController)
    return abortController.signal
  }

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken)

    if (abortController) {
      abortController.abort()
      this.abortControllers.delete(cancelToken)
    }
  }

  public async request<T>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<T> {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {}
    const requestParams = this.mergeRequestParams(params, secureParams)
    const queryString = query && this.toQueryString(query)
    const payloadFormatter = this.contentFormatters[type || ContentType.Json]
    const responseFormat = format || requestParams.format

    return this.customFetch(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {})
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal,
      body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body)
    })
      .then(async (response) => {
        let responseApiError: ApiError | null = null

        const data =
          !responseFormat || response.status == 204
            ? null
            : await response[responseFormat]()
                .then((data) => {
                  if (!response.ok) {
                    responseApiError = new ApiError(response.status, data?.message, data?.code)
                  }
                  return data
                })
                .catch((e) => {
                  responseApiError = new ApiError(response.status, 'Something went wrong', e?.code ?? '')
                })

        if (cancelToken) {
          this.abortControllers.delete(cancelToken)
        }

        if (responseApiError != null) {
          throw responseApiError
        }
        return data
      })
      .catch((e) => {
        if (e.name === 'TypeError' && e.message === 'Failed to fetch') {
          throw new ApiError(0, 'Failed to fetch', 'TypeError', true)
        }

        throw e
      })
  }
}

declare const dataTagSymbol: unique symbol

export type DataTag<Type, Value> = Type & {
  [dataTagSymbol]: Value
}

function dataTaggedQueryKey<TData, TKey extends readonly unknown[] = unknown[]>(key: TKey): TKey & DataTag<TKey, TData>
function dataTaggedQueryKey(key: unknown) {
  return key
}

/**
 * @title Campsite API
 * @version 2.0.0
 * @baseUrl https://api.campsite.com
 * @contact <support@campsite.com>
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  organizations = {
    /**
     * No description
     *
     * @name PostActivityViews
     * @request POST:/v1/organizations/{org_slug}/activity_views
     */
    postActivityViews: () => {
      const base = 'POST:/v1/organizations/{org_slug}/activity_views' as const

      return {
        baseKey: dataTaggedQueryKey<PostActivityViewsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostActivityViewsData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationActivityViewsPostRequest, params: RequestParams = {}) =>
          this.request<PostActivityViewsData>({
            path: `/v1/organizations/${orgSlug}/activity_views`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetAttachmentsCommenters
     * @request GET:/v1/organizations/{org_slug}/attachments/{attachment_id}/commenters
     */
    getAttachmentsCommenters: () => {
      const base = 'GET:/v1/organizations/{org_slug}/attachments/{attachment_id}/commenters' as const

      return {
        baseKey: dataTaggedQueryKey<GetAttachmentsCommentersData>([base]),
        requestKey: (orgSlug: string, attachmentId: string) =>
          dataTaggedQueryKey<GetAttachmentsCommentersData>([base, orgSlug, attachmentId]),
        request: (orgSlug: string, attachmentId: string, params: RequestParams = {}) =>
          this.request<GetAttachmentsCommentersData>({
            path: `/v1/organizations/${orgSlug}/attachments/${attachmentId}/commenters`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostAttachments
     * @request POST:/v1/organizations/{org_slug}/attachments
     */
    postAttachments: () => {
      const base = 'POST:/v1/organizations/{org_slug}/attachments' as const

      return {
        baseKey: dataTaggedQueryKey<PostAttachmentsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostAttachmentsData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationAttachmentsPostRequest, params: RequestParams = {}) =>
          this.request<PostAttachmentsData>({
            path: `/v1/organizations/${orgSlug}/attachments`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetAttachmentsById
     * @request GET:/v1/organizations/{org_slug}/attachments/{id}
     */
    getAttachmentsById: () => {
      const base = 'GET:/v1/organizations/{org_slug}/attachments/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<GetAttachmentsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<GetAttachmentsByIdData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<GetAttachmentsByIdData>({
            path: `/v1/organizations/${orgSlug}/attachments/${id}`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetCallRecordingsTranscription
     * @request GET:/v1/organizations/{org_slug}/call_recordings/{call_recording_id}/transcription
     */
    getCallRecordingsTranscription: () => {
      const base = 'GET:/v1/organizations/{org_slug}/call_recordings/{call_recording_id}/transcription' as const

      return {
        baseKey: dataTaggedQueryKey<GetCallRecordingsTranscriptionData>([base]),
        requestKey: (orgSlug: string, callRecordingId: string) =>
          dataTaggedQueryKey<GetCallRecordingsTranscriptionData>([base, orgSlug, callRecordingId]),
        request: (orgSlug: string, callRecordingId: string, params: RequestParams = {}) =>
          this.request<GetCallRecordingsTranscriptionData>({
            path: `/v1/organizations/${orgSlug}/call_recordings/${callRecordingId}/transcription`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostCallRoomsInvitations
     * @request POST:/v1/organizations/{org_slug}/call_rooms/{call_room_id}/invitations
     */
    postCallRoomsInvitations: () => {
      const base = 'POST:/v1/organizations/{org_slug}/call_rooms/{call_room_id}/invitations' as const

      return {
        baseKey: dataTaggedQueryKey<PostCallRoomsInvitationsData>([base]),
        requestKey: (orgSlug: string, callRoomId: string) =>
          dataTaggedQueryKey<PostCallRoomsInvitationsData>([base, orgSlug, callRoomId]),
        request: (
          orgSlug: string,
          callRoomId: string,
          data: OrganizationCallRoomInvitationsPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostCallRoomsInvitationsData>({
            path: `/v1/organizations/${orgSlug}/call_rooms/${callRoomId}/invitations`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetCallRoomsById
     * @request GET:/v1/organizations/{org_slug}/call_rooms/{id}
     */
    getCallRoomsById: () => {
      const base = 'GET:/v1/organizations/{org_slug}/call_rooms/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<GetCallRoomsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<GetCallRoomsByIdData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<GetCallRoomsByIdData>({
            path: `/v1/organizations/${orgSlug}/call_rooms/${id}`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostCallRooms
     * @request POST:/v1/organizations/{org_slug}/call_rooms
     */
    postCallRooms: () => {
      const base = 'POST:/v1/organizations/{org_slug}/call_rooms' as const

      return {
        baseKey: dataTaggedQueryKey<PostCallRoomsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostCallRoomsData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationCallRoomsPostRequest, params: RequestParams = {}) =>
          this.request<PostCallRoomsData>({
            path: `/v1/organizations/${orgSlug}/call_rooms`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteCallsAllRecordings
     * @request DELETE:/v1/organizations/{org_slug}/calls/{call_id}/all_recordings
     */
    deleteCallsAllRecordings: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/calls/{call_id}/all_recordings' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteCallsAllRecordingsData>([base]),
        requestKey: (orgSlug: string, callId: string) =>
          dataTaggedQueryKey<DeleteCallsAllRecordingsData>([base, orgSlug, callId]),
        request: (orgSlug: string, callId: string, params: RequestParams = {}) =>
          this.request<DeleteCallsAllRecordingsData>({
            path: `/v1/organizations/${orgSlug}/calls/${callId}/all_recordings`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostCallsFavorite
     * @request POST:/v1/organizations/{org_slug}/calls/{call_id}/favorite
     */
    postCallsFavorite: () => {
      const base = 'POST:/v1/organizations/{org_slug}/calls/{call_id}/favorite' as const

      return {
        baseKey: dataTaggedQueryKey<PostCallsFavoriteData>([base]),
        requestKey: (orgSlug: string, callId: string) =>
          dataTaggedQueryKey<PostCallsFavoriteData>([base, orgSlug, callId]),
        request: (orgSlug: string, callId: string, params: RequestParams = {}) =>
          this.request<PostCallsFavoriteData>({
            path: `/v1/organizations/${orgSlug}/calls/${callId}/favorite`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteCallsFavorite
     * @request DELETE:/v1/organizations/{org_slug}/calls/{call_id}/favorite
     */
    deleteCallsFavorite: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/calls/{call_id}/favorite' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteCallsFavoriteData>([base]),
        requestKey: (orgSlug: string, callId: string) =>
          dataTaggedQueryKey<DeleteCallsFavoriteData>([base, orgSlug, callId]),
        request: (orgSlug: string, callId: string, params: RequestParams = {}) =>
          this.request<DeleteCallsFavoriteData>({
            path: `/v1/organizations/${orgSlug}/calls/${callId}/favorite`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostCallsFollowUp
     * @request POST:/v1/organizations/{org_slug}/calls/{call_id}/follow_up
     */
    postCallsFollowUp: () => {
      const base = 'POST:/v1/organizations/{org_slug}/calls/{call_id}/follow_up' as const

      return {
        baseKey: dataTaggedQueryKey<PostCallsFollowUpData>([base]),
        requestKey: (orgSlug: string, callId: string) =>
          dataTaggedQueryKey<PostCallsFollowUpData>([base, orgSlug, callId]),
        request: (
          orgSlug: string,
          callId: string,
          data: OrganizationCallFollowUpPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostCallsFollowUpData>({
            path: `/v1/organizations/${orgSlug}/calls/${callId}/follow_up`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostCallsPin
     * @request POST:/v1/organizations/{org_slug}/calls/{call_id}/pin
     */
    postCallsPin: () => {
      const base = 'POST:/v1/organizations/{org_slug}/calls/{call_id}/pin' as const

      return {
        baseKey: dataTaggedQueryKey<PostCallsPinData>([base]),
        requestKey: (orgSlug: string, callId: string) => dataTaggedQueryKey<PostCallsPinData>([base, orgSlug, callId]),
        request: (orgSlug: string, callId: string, params: RequestParams = {}) =>
          this.request<PostCallsPinData>({
            path: `/v1/organizations/${orgSlug}/calls/${callId}/pin`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutCallsProjectPermission
     * @request PUT:/v1/organizations/{org_slug}/calls/{call_id}/project_permission
     */
    putCallsProjectPermission: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/calls/{call_id}/project_permission' as const

      return {
        baseKey: dataTaggedQueryKey<PutCallsProjectPermissionData>([base]),
        requestKey: (orgSlug: string, callId: string) =>
          dataTaggedQueryKey<PutCallsProjectPermissionData>([base, orgSlug, callId]),
        request: (
          orgSlug: string,
          callId: string,
          data: OrganizationsOrgSlugCallsCallIdProjectPermissionPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutCallsProjectPermissionData>({
            path: `/v1/organizations/${orgSlug}/calls/${callId}/project_permission`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteCallsProjectPermission
     * @request DELETE:/v1/organizations/{org_slug}/calls/{call_id}/project_permission
     */
    deleteCallsProjectPermission: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/calls/{call_id}/project_permission' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteCallsProjectPermissionData>([base]),
        requestKey: (orgSlug: string, callId: string) =>
          dataTaggedQueryKey<DeleteCallsProjectPermissionData>([base, orgSlug, callId]),
        request: (orgSlug: string, callId: string, params: RequestParams = {}) =>
          this.request<DeleteCallsProjectPermissionData>({
            path: `/v1/organizations/${orgSlug}/calls/${callId}/project_permission`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetCallsRecordings
     * @request GET:/v1/organizations/{org_slug}/calls/{call_id}/recordings
     */
    getCallsRecordings: () => {
      const base = 'GET:/v1/organizations/{org_slug}/calls/{call_id}/recordings' as const

      return {
        baseKey: dataTaggedQueryKey<GetCallsRecordingsData>([base]),
        requestKey: (params: GetCallsRecordingsParams) => dataTaggedQueryKey<GetCallsRecordingsData>([base, params]),
        request: ({ orgSlug, callId, ...query }: GetCallsRecordingsParams, params: RequestParams = {}) =>
          this.request<GetCallsRecordingsData>({
            path: `/v1/organizations/${orgSlug}/calls/${callId}/recordings`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetCalls
     * @request GET:/v1/organizations/{org_slug}/calls
     */
    getCalls: () => {
      const base = 'GET:/v1/organizations/{org_slug}/calls' as const

      return {
        baseKey: dataTaggedQueryKey<GetCallsData>([base]),
        requestKey: (params: GetCallsParams) => dataTaggedQueryKey<GetCallsData>([base, params]),
        request: ({ orgSlug, ...query }: GetCallsParams, params: RequestParams = {}) =>
          this.request<GetCallsData>({
            path: `/v1/organizations/${orgSlug}/calls`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetCallsById
     * @request GET:/v1/organizations/{org_slug}/calls/{id}
     */
    getCallsById: () => {
      const base = 'GET:/v1/organizations/{org_slug}/calls/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<GetCallsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<GetCallsByIdData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<GetCallsByIdData>({
            path: `/v1/organizations/${orgSlug}/calls/${id}`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutCallsById
     * @request PUT:/v1/organizations/{org_slug}/calls/{id}
     */
    putCallsById: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/calls/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<PutCallsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<PutCallsByIdData>([base, orgSlug, id]),
        request: (
          orgSlug: string,
          id: string,
          data: OrganizationsOrgSlugCallsIdPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutCallsByIdData>({
            path: `/v1/organizations/${orgSlug}/calls/${id}`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutCommentsAttachmentsReorder
     * @request PUT:/v1/organizations/{org_slug}/comments/{comment_id}/attachments/reorder
     */
    putCommentsAttachmentsReorder: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/comments/{comment_id}/attachments/reorder' as const

      return {
        baseKey: dataTaggedQueryKey<PutCommentsAttachmentsReorderData>([base]),
        requestKey: (orgSlug: string, commentId: string) =>
          dataTaggedQueryKey<PutCommentsAttachmentsReorderData>([base, orgSlug, commentId]),
        request: (
          orgSlug: string,
          commentId: string,
          data: OrganizationsOrgSlugCommentsCommentIdAttachmentsReorderPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutCommentsAttachmentsReorderData>({
            path: `/v1/organizations/${orgSlug}/comments/${commentId}/attachments/reorder`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostCommentsFollowUp
     * @request POST:/v1/organizations/{org_slug}/comments/{comment_id}/follow_up
     */
    postCommentsFollowUp: () => {
      const base = 'POST:/v1/organizations/{org_slug}/comments/{comment_id}/follow_up' as const

      return {
        baseKey: dataTaggedQueryKey<PostCommentsFollowUpData>([base]),
        requestKey: (orgSlug: string, commentId: string) =>
          dataTaggedQueryKey<PostCommentsFollowUpData>([base, orgSlug, commentId]),
        request: (
          orgSlug: string,
          commentId: string,
          data: OrganizationCommentFollowUpPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostCommentsFollowUpData>({
            path: `/v1/organizations/${orgSlug}/comments/${commentId}/follow_up`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostCommentsLinearIssues
     * @request POST:/v1/organizations/{org_slug}/comments/{comment_id}/linear_issues
     */
    postCommentsLinearIssues: () => {
      const base = 'POST:/v1/organizations/{org_slug}/comments/{comment_id}/linear_issues' as const

      return {
        baseKey: dataTaggedQueryKey<PostCommentsLinearIssuesData>([base]),
        requestKey: (orgSlug: string, commentId: string) =>
          dataTaggedQueryKey<PostCommentsLinearIssuesData>([base, orgSlug, commentId]),
        request: (
          orgSlug: string,
          commentId: string,
          data: OrganizationCommentLinearIssuesPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostCommentsLinearIssuesData>({
            path: `/v1/organizations/${orgSlug}/comments/${commentId}/linear_issues`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostCommentsReactions
     * @request POST:/v1/organizations/{org_slug}/comments/{comment_id}/reactions
     */
    postCommentsReactions: () => {
      const base = 'POST:/v1/organizations/{org_slug}/comments/{comment_id}/reactions' as const

      return {
        baseKey: dataTaggedQueryKey<PostCommentsReactionsData>([base]),
        requestKey: (orgSlug: string, commentId: string) =>
          dataTaggedQueryKey<PostCommentsReactionsData>([base, orgSlug, commentId]),
        request: (
          orgSlug: string,
          commentId: string,
          data: OrganizationCommentReactionsPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostCommentsReactionsData>({
            path: `/v1/organizations/${orgSlug}/comments/${commentId}/reactions`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostCommentsReplies
     * @request POST:/v1/organizations/{org_slug}/comments/{comment_id}/replies
     */
    postCommentsReplies: () => {
      const base = 'POST:/v1/organizations/{org_slug}/comments/{comment_id}/replies' as const

      return {
        baseKey: dataTaggedQueryKey<PostCommentsRepliesData>([base]),
        requestKey: (orgSlug: string, commentId: string) =>
          dataTaggedQueryKey<PostCommentsRepliesData>([base, orgSlug, commentId]),
        request: (
          orgSlug: string,
          commentId: string,
          data: OrganizationCommentRepliesPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostCommentsRepliesData>({
            path: `/v1/organizations/${orgSlug}/comments/${commentId}/replies`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostCommentsResolutions
     * @request POST:/v1/organizations/{org_slug}/comments/{comment_id}/resolutions
     */
    postCommentsResolutions: () => {
      const base = 'POST:/v1/organizations/{org_slug}/comments/{comment_id}/resolutions' as const

      return {
        baseKey: dataTaggedQueryKey<PostCommentsResolutionsData>([base]),
        requestKey: (orgSlug: string, commentId: string) =>
          dataTaggedQueryKey<PostCommentsResolutionsData>([base, orgSlug, commentId]),
        request: (orgSlug: string, commentId: string, params: RequestParams = {}) =>
          this.request<PostCommentsResolutionsData>({
            path: `/v1/organizations/${orgSlug}/comments/${commentId}/resolutions`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteCommentsResolutions
     * @request DELETE:/v1/organizations/{org_slug}/comments/{comment_id}/resolutions
     */
    deleteCommentsResolutions: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/comments/{comment_id}/resolutions' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteCommentsResolutionsData>([base]),
        requestKey: (orgSlug: string, commentId: string) =>
          dataTaggedQueryKey<DeleteCommentsResolutionsData>([base, orgSlug, commentId]),
        request: (orgSlug: string, commentId: string, params: RequestParams = {}) =>
          this.request<DeleteCommentsResolutionsData>({
            path: `/v1/organizations/${orgSlug}/comments/${commentId}/resolutions`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutCommentsTasks
     * @request PUT:/v1/organizations/{org_slug}/comments/{comment_id}/tasks
     */
    putCommentsTasks: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/comments/{comment_id}/tasks' as const

      return {
        baseKey: dataTaggedQueryKey<PutCommentsTasksData>([base]),
        requestKey: (orgSlug: string, commentId: string) =>
          dataTaggedQueryKey<PutCommentsTasksData>([base, orgSlug, commentId]),
        request: (
          orgSlug: string,
          commentId: string,
          data: OrganizationsOrgSlugCommentsCommentIdTasksPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutCommentsTasksData>({
            path: `/v1/organizations/${orgSlug}/comments/${commentId}/tasks`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetCommentsById
     * @request GET:/v1/organizations/{org_slug}/comments/{id}
     */
    getCommentsById: () => {
      const base = 'GET:/v1/organizations/{org_slug}/comments/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<GetCommentsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<GetCommentsByIdData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<GetCommentsByIdData>({
            path: `/v1/organizations/${orgSlug}/comments/${id}`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutCommentsById
     * @request PUT:/v1/organizations/{org_slug}/comments/{id}
     */
    putCommentsById: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/comments/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<PutCommentsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<PutCommentsByIdData>([base, orgSlug, id]),
        request: (
          orgSlug: string,
          id: string,
          data: OrganizationsOrgSlugCommentsIdPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutCommentsByIdData>({
            path: `/v1/organizations/${orgSlug}/comments/${id}`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteCommentsById
     * @request DELETE:/v1/organizations/{org_slug}/comments/{id}
     */
    deleteCommentsById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/comments/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteCommentsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<DeleteCommentsByIdData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<DeleteCommentsByIdData>({
            path: `/v1/organizations/${orgSlug}/comments/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetCustomReactionsPacks
     * @request GET:/v1/organizations/{org_slug}/custom_reactions/packs
     */
    getCustomReactionsPacks: () => {
      const base = 'GET:/v1/organizations/{org_slug}/custom_reactions/packs' as const

      return {
        baseKey: dataTaggedQueryKey<GetCustomReactionsPacksData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetCustomReactionsPacksData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetCustomReactionsPacksData>({
            path: `/v1/organizations/${orgSlug}/custom_reactions/packs`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostCustomReactionsPacks
     * @request POST:/v1/organizations/{org_slug}/custom_reactions/packs
     */
    postCustomReactionsPacks: () => {
      const base = 'POST:/v1/organizations/{org_slug}/custom_reactions/packs' as const

      return {
        baseKey: dataTaggedQueryKey<PostCustomReactionsPacksData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostCustomReactionsPacksData>([base, orgSlug]),
        request: (
          orgSlug: string,
          data: OrganizationsOrgSlugCustomReactionsPacksPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostCustomReactionsPacksData>({
            path: `/v1/organizations/${orgSlug}/custom_reactions/packs`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteCustomReactionsPacksByName
     * @request DELETE:/v1/organizations/{org_slug}/custom_reactions/packs/{name}
     */
    deleteCustomReactionsPacksByName: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/custom_reactions/packs/{name}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteCustomReactionsPacksByNameData>([base]),
        requestKey: (orgSlug: string, name: string) =>
          dataTaggedQueryKey<DeleteCustomReactionsPacksByNameData>([base, orgSlug, name]),
        request: (orgSlug: string, name: string, params: RequestParams = {}) =>
          this.request<DeleteCustomReactionsPacksByNameData>({
            path: `/v1/organizations/${orgSlug}/custom_reactions/packs/${name}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetCustomReactions
     * @request GET:/v1/organizations/{org_slug}/custom_reactions
     */
    getCustomReactions: () => {
      const base = 'GET:/v1/organizations/{org_slug}/custom_reactions' as const

      return {
        baseKey: dataTaggedQueryKey<GetCustomReactionsData>([base]),
        requestKey: (params: GetCustomReactionsParams) => dataTaggedQueryKey<GetCustomReactionsData>([base, params]),
        request: ({ orgSlug, ...query }: GetCustomReactionsParams, params: RequestParams = {}) =>
          this.request<GetCustomReactionsData>({
            path: `/v1/organizations/${orgSlug}/custom_reactions`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostCustomReactions
     * @request POST:/v1/organizations/{org_slug}/custom_reactions
     */
    postCustomReactions: () => {
      const base = 'POST:/v1/organizations/{org_slug}/custom_reactions' as const

      return {
        baseKey: dataTaggedQueryKey<PostCustomReactionsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostCustomReactionsData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationsOrgSlugCustomReactionsPostRequest, params: RequestParams = {}) =>
          this.request<PostCustomReactionsData>({
            path: `/v1/organizations/${orgSlug}/custom_reactions`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteCustomReactionsById
     * @request DELETE:/v1/organizations/{org_slug}/custom_reactions/{id}
     */
    deleteCustomReactionsById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/custom_reactions/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteCustomReactionsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) =>
          dataTaggedQueryKey<DeleteCustomReactionsByIdData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<DeleteCustomReactionsByIdData>({
            path: `/v1/organizations/${orgSlug}/custom_reactions/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostDataExports
     * @request POST:/v1/organizations/{org_slug}/data_exports
     */
    postDataExports: () => {
      const base = 'POST:/v1/organizations/{org_slug}/data_exports' as const

      return {
        baseKey: dataTaggedQueryKey<PostDataExportsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostDataExportsData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<PostDataExportsData>({
            path: `/v1/organizations/${orgSlug}/data_exports`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetDigestsMigrations
     * @request GET:/v1/organizations/{org_slug}/digests/{digest_id}/migrations
     */
    getDigestsMigrations: () => {
      const base = 'GET:/v1/organizations/{org_slug}/digests/{digest_id}/migrations' as const

      return {
        baseKey: dataTaggedQueryKey<GetDigestsMigrationsData>([base]),
        requestKey: (orgSlug: string, digestId: string) =>
          dataTaggedQueryKey<GetDigestsMigrationsData>([base, orgSlug, digestId]),
        request: (orgSlug: string, digestId: string, params: RequestParams = {}) =>
          this.request<GetDigestsMigrationsData>({
            path: `/v1/organizations/${orgSlug}/digests/${digestId}/migrations`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutFavoritesReorder
     * @request PUT:/v1/organizations/{org_slug}/favorites/reorder
     */
    putFavoritesReorder: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/favorites/reorder' as const

      return {
        baseKey: dataTaggedQueryKey<PutFavoritesReorderData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PutFavoritesReorderData>([base, orgSlug]),
        request: (orgSlug: string, data: ReorderOrganizationFavoritesPutRequest, params: RequestParams = {}) =>
          this.request<PutFavoritesReorderData>({
            path: `/v1/organizations/${orgSlug}/favorites/reorder`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetFavorites
     * @request GET:/v1/organizations/{org_slug}/favorites
     */
    getFavorites: () => {
      const base = 'GET:/v1/organizations/{org_slug}/favorites' as const

      return {
        baseKey: dataTaggedQueryKey<GetFavoritesData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetFavoritesData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetFavoritesData>({
            path: `/v1/organizations/${orgSlug}/favorites`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteFavoritesById
     * @request DELETE:/v1/organizations/{org_slug}/favorites/{id}
     */
    deleteFavoritesById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/favorites/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteFavoritesByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<DeleteFavoritesByIdData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<DeleteFavoritesByIdData>({
            path: `/v1/organizations/${orgSlug}/favorites/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostFeedback
     * @request POST:/v1/organizations/{org_slug}/feedback
     */
    postFeedback: () => {
      const base = 'POST:/v1/organizations/{org_slug}/feedback' as const

      return {
        baseKey: dataTaggedQueryKey<PostFeedbackData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostFeedbackData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationFeedbacksPostRequest, params: RequestParams = {}) =>
          this.request<PostFeedbackData>({
            path: `/v1/organizations/${orgSlug}/feedback`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetFeedbackPresignedFields
     * @request GET:/v1/organizations/{org_slug}/feedback/presigned-fields
     */
    getFeedbackPresignedFields: () => {
      const base = 'GET:/v1/organizations/{org_slug}/feedback/presigned-fields' as const

      return {
        baseKey: dataTaggedQueryKey<GetFeedbackPresignedFieldsData>([base]),
        requestKey: (params: GetFeedbackPresignedFieldsParams) =>
          dataTaggedQueryKey<GetFeedbackPresignedFieldsData>([base, params]),
        request: ({ orgSlug, ...query }: GetFeedbackPresignedFieldsParams, params: RequestParams = {}) =>
          this.request<GetFeedbackPresignedFieldsData>({
            path: `/v1/organizations/${orgSlug}/feedback/presigned-fields`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostFigmaFiles
     * @request POST:/v1/organizations/{org_slug}/figma/files
     */
    postFigmaFiles: () => {
      const base = 'POST:/v1/organizations/{org_slug}/figma/files' as const

      return {
        baseKey: dataTaggedQueryKey<PostFigmaFilesData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostFigmaFilesData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationFigmaFilesPostRequest, params: RequestParams = {}) =>
          this.request<PostFigmaFilesData>({
            path: `/v1/organizations/${orgSlug}/figma/files`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostFigmaFileAttachmentDetails
     * @request POST:/v1/organizations/{org_slug}/figma_file_attachment_details
     */
    postFigmaFileAttachmentDetails: () => {
      const base = 'POST:/v1/organizations/{org_slug}/figma_file_attachment_details' as const

      return {
        baseKey: dataTaggedQueryKey<PostFigmaFileAttachmentDetailsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostFigmaFileAttachmentDetailsData>([base, orgSlug]),
        request: (
          orgSlug: string,
          data: OrganizationFigmaFileAttachmentDetailsPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostFigmaFileAttachmentDetailsData>({
            path: `/v1/organizations/${orgSlug}/figma_file_attachment_details`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetFollowUps
     * @request GET:/v1/organizations/{org_slug}/follow_ups
     */
    getFollowUps: () => {
      const base = 'GET:/v1/organizations/{org_slug}/follow_ups' as const

      return {
        baseKey: dataTaggedQueryKey<GetFollowUpsData>([base]),
        requestKey: (params: GetFollowUpsParams) => dataTaggedQueryKey<GetFollowUpsData>([base, params]),
        request: ({ orgSlug, ...query }: GetFollowUpsParams, params: RequestParams = {}) =>
          this.request<GetFollowUpsData>({
            path: `/v1/organizations/${orgSlug}/follow_ups`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutFollowUpsById
     * @request PUT:/v1/organizations/{org_slug}/follow_ups/{id}
     */
    putFollowUpsById: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/follow_ups/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<PutFollowUpsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<PutFollowUpsByIdData>([base, orgSlug, id]),
        request: (
          orgSlug: string,
          id: string,
          data: OrganizationsOrgSlugFollowUpsIdPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutFollowUpsByIdData>({
            path: `/v1/organizations/${orgSlug}/follow_ups/${id}`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteFollowUpsById
     * @request DELETE:/v1/organizations/{org_slug}/follow_ups/{id}
     */
    deleteFollowUpsById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/follow_ups/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteFollowUpsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<DeleteFollowUpsByIdData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<DeleteFollowUpsByIdData>({
            path: `/v1/organizations/${orgSlug}/follow_ups/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetGifs
     * @request GET:/v1/organizations/{org_slug}/gifs
     */
    getGifs: () => {
      const base = 'GET:/v1/organizations/{org_slug}/gifs' as const

      return {
        baseKey: dataTaggedQueryKey<GetGifsData>([base]),
        requestKey: (params: GetGifsParams) => dataTaggedQueryKey<GetGifsData>([base, params]),
        request: ({ orgSlug, ...query }: GetGifsParams, params: RequestParams = {}) =>
          this.request<GetGifsData>({
            path: `/v1/organizations/${orgSlug}/gifs`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetIntegrationsLinearInstallation
     * @request GET:/v1/organizations/{org_slug}/integrations/linear/installation
     */
    getIntegrationsLinearInstallation: () => {
      const base = 'GET:/v1/organizations/{org_slug}/integrations/linear/installation' as const

      return {
        baseKey: dataTaggedQueryKey<GetIntegrationsLinearInstallationData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetIntegrationsLinearInstallationData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetIntegrationsLinearInstallationData>({
            path: `/v1/organizations/${orgSlug}/integrations/linear/installation`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteIntegrationsLinearInstallation
     * @request DELETE:/v1/organizations/{org_slug}/integrations/linear/installation
     */
    deleteIntegrationsLinearInstallation: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/integrations/linear/installation' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteIntegrationsLinearInstallationData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<DeleteIntegrationsLinearInstallationData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<DeleteIntegrationsLinearInstallationData>({
            path: `/v1/organizations/${orgSlug}/integrations/linear/installation`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostIntegrationsLinearTeamSyncs
     * @request POST:/v1/organizations/{org_slug}/integrations/linear/team_syncs
     */
    postIntegrationsLinearTeamSyncs: () => {
      const base = 'POST:/v1/organizations/{org_slug}/integrations/linear/team_syncs' as const

      return {
        baseKey: dataTaggedQueryKey<PostIntegrationsLinearTeamSyncsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostIntegrationsLinearTeamSyncsData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<PostIntegrationsLinearTeamSyncsData>({
            path: `/v1/organizations/${orgSlug}/integrations/linear/team_syncs`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetIntegrationsLinearTeams
     * @request GET:/v1/organizations/{org_slug}/integrations/linear/teams
     */
    getIntegrationsLinearTeams: () => {
      const base = 'GET:/v1/organizations/{org_slug}/integrations/linear/teams' as const

      return {
        baseKey: dataTaggedQueryKey<GetIntegrationsLinearTeamsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetIntegrationsLinearTeamsData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetIntegrationsLinearTeamsData>({
            path: `/v1/organizations/${orgSlug}/integrations/linear/teams`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostIntegrationsSlackChannelSyncs
     * @request POST:/v1/organizations/{org_slug}/integrations/slack/channel_syncs
     */
    postIntegrationsSlackChannelSyncs: () => {
      const base = 'POST:/v1/organizations/{org_slug}/integrations/slack/channel_syncs' as const

      return {
        baseKey: dataTaggedQueryKey<PostIntegrationsSlackChannelSyncsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostIntegrationsSlackChannelSyncsData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<PostIntegrationsSlackChannelSyncsData>({
            path: `/v1/organizations/${orgSlug}/integrations/slack/channel_syncs`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetIntegrationsSlackChannels
     * @request GET:/v1/organizations/{org_slug}/integrations/slack/channels
     */
    getIntegrationsSlackChannels: () => {
      const base = 'GET:/v1/organizations/{org_slug}/integrations/slack/channels' as const

      return {
        baseKey: dataTaggedQueryKey<GetIntegrationsSlackChannelsData>([base]),
        requestKey: (params: GetIntegrationsSlackChannelsParams) =>
          dataTaggedQueryKey<GetIntegrationsSlackChannelsData>([base, params]),
        request: ({ orgSlug, ...query }: GetIntegrationsSlackChannelsParams, params: RequestParams = {}) =>
          this.request<GetIntegrationsSlackChannelsData>({
            path: `/v1/organizations/${orgSlug}/integrations/slack/channels`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetIntegrationsSlackChannelsByProviderChannelId
     * @request GET:/v1/organizations/{org_slug}/integrations/slack/channels/{provider_channel_id}
     */
    getIntegrationsSlackChannelsByProviderChannelId: () => {
      const base = 'GET:/v1/organizations/{org_slug}/integrations/slack/channels/{provider_channel_id}' as const

      return {
        baseKey: dataTaggedQueryKey<GetIntegrationsSlackChannelsByProviderChannelIdData>([base]),
        requestKey: (orgSlug: string, providerChannelId: string) =>
          dataTaggedQueryKey<GetIntegrationsSlackChannelsByProviderChannelIdData>([base, orgSlug, providerChannelId]),
        request: (orgSlug: string, providerChannelId: string, params: RequestParams = {}) =>
          this.request<GetIntegrationsSlackChannelsByProviderChannelIdData>({
            path: `/v1/organizations/${orgSlug}/integrations/slack/channels/${providerChannelId}`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetInvitationUrl
     * @request GET:/v1/organizations/{org_slug}/invitation_url
     */
    getInvitationUrl: () => {
      const base = 'GET:/v1/organizations/{org_slug}/invitation_url' as const

      return {
        baseKey: dataTaggedQueryKey<GetInvitationUrlData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetInvitationUrlData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetInvitationUrlData>({
            path: `/v1/organizations/${orgSlug}/invitation_url`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetThreadsDmsByUsername
     * @request GET:/v1/organizations/{org_slug}/threads/dms/{username}
     */
    getThreadsDmsByUsername: () => {
      const base = 'GET:/v1/organizations/{org_slug}/threads/dms/{username}' as const

      return {
        baseKey: dataTaggedQueryKey<GetThreadsDmsByUsernameData>([base]),
        requestKey: (orgSlug: string, username: string) =>
          dataTaggedQueryKey<GetThreadsDmsByUsernameData>([base, orgSlug, username]),
        request: (orgSlug: string, username: string, params: RequestParams = {}) =>
          this.request<GetThreadsDmsByUsernameData>({
            path: `/v1/organizations/${orgSlug}/threads/dms/${username}`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostThreadsFavorites
     * @request POST:/v1/organizations/{org_slug}/threads/{thread_id}/favorites
     */
    postThreadsFavorites: () => {
      const base = 'POST:/v1/organizations/{org_slug}/threads/{thread_id}/favorites' as const

      return {
        baseKey: dataTaggedQueryKey<PostThreadsFavoritesData>([base]),
        requestKey: (orgSlug: string, threadId: string) =>
          dataTaggedQueryKey<PostThreadsFavoritesData>([base, orgSlug, threadId]),
        request: (orgSlug: string, threadId: string, params: RequestParams = {}) =>
          this.request<PostThreadsFavoritesData>({
            path: `/v1/organizations/${orgSlug}/threads/${threadId}/favorites`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteThreadsFavorites
     * @request DELETE:/v1/organizations/{org_slug}/threads/{thread_id}/favorites
     */
    deleteThreadsFavorites: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/threads/{thread_id}/favorites' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteThreadsFavoritesData>([base]),
        requestKey: (orgSlug: string, threadId: string) =>
          dataTaggedQueryKey<DeleteThreadsFavoritesData>([base, orgSlug, threadId]),
        request: (orgSlug: string, threadId: string, params: RequestParams = {}) =>
          this.request<DeleteThreadsFavoritesData>({
            path: `/v1/organizations/${orgSlug}/threads/${threadId}/favorites`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetThreadsIntegrationDmsByOauthApplicationId
     * @request GET:/v1/organizations/{org_slug}/threads/integration_dms/{oauth_application_id}
     */
    getThreadsIntegrationDmsByOauthApplicationId: () => {
      const base = 'GET:/v1/organizations/{org_slug}/threads/integration_dms/{oauth_application_id}' as const

      return {
        baseKey: dataTaggedQueryKey<GetThreadsIntegrationDmsByOauthApplicationIdData>([base]),
        requestKey: (orgSlug: string, oauthApplicationId: string) =>
          dataTaggedQueryKey<GetThreadsIntegrationDmsByOauthApplicationIdData>([base, orgSlug, oauthApplicationId]),
        request: (orgSlug: string, oauthApplicationId: string, params: RequestParams = {}) =>
          this.request<GetThreadsIntegrationDmsByOauthApplicationIdData>({
            path: `/v1/organizations/${orgSlug}/threads/integration_dms/${oauthApplicationId}`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetThreadsMessages
     * @request GET:/v1/organizations/{org_slug}/threads/{thread_id}/messages
     */
    getThreadsMessages: () => {
      const base = 'GET:/v1/organizations/{org_slug}/threads/{thread_id}/messages' as const

      return {
        baseKey: dataTaggedQueryKey<GetThreadsMessagesData>([base]),
        requestKey: (params: GetThreadsMessagesParams) => dataTaggedQueryKey<GetThreadsMessagesData>([base, params]),
        request: ({ orgSlug, threadId, ...query }: GetThreadsMessagesParams, params: RequestParams = {}) =>
          this.request<GetThreadsMessagesData>({
            path: `/v1/organizations/${orgSlug}/threads/${threadId}/messages`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostThreadsMessages
     * @request POST:/v1/organizations/{org_slug}/threads/{thread_id}/messages
     */
    postThreadsMessages: () => {
      const base = 'POST:/v1/organizations/{org_slug}/threads/{thread_id}/messages' as const

      return {
        baseKey: dataTaggedQueryKey<PostThreadsMessagesData>([base]),
        requestKey: (orgSlug: string, threadId: string) =>
          dataTaggedQueryKey<PostThreadsMessagesData>([base, orgSlug, threadId]),
        request: (
          orgSlug: string,
          threadId: string,
          data: OrganizationsOrgSlugThreadsThreadIdMessagesPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostThreadsMessagesData>({
            path: `/v1/organizations/${orgSlug}/threads/${threadId}/messages`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutThreadsMessagesById
     * @request PUT:/v1/organizations/{org_slug}/threads/{thread_id}/messages/{id}
     */
    putThreadsMessagesById: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/threads/{thread_id}/messages/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<PutThreadsMessagesByIdData>([base]),
        requestKey: (orgSlug: string, threadId: string, id: string) =>
          dataTaggedQueryKey<PutThreadsMessagesByIdData>([base, orgSlug, threadId, id]),
        request: (
          orgSlug: string,
          threadId: string,
          id: string,
          data: OrganizationsOrgSlugThreadsThreadIdMessagesIdPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutThreadsMessagesByIdData>({
            path: `/v1/organizations/${orgSlug}/threads/${threadId}/messages/${id}`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteThreadsMessagesById
     * @request DELETE:/v1/organizations/{org_slug}/threads/{thread_id}/messages/{id}
     */
    deleteThreadsMessagesById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/threads/{thread_id}/messages/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteThreadsMessagesByIdData>([base]),
        requestKey: (orgSlug: string, threadId: string, id: string) =>
          dataTaggedQueryKey<DeleteThreadsMessagesByIdData>([base, orgSlug, threadId, id]),
        request: (orgSlug: string, threadId: string, id: string, params: RequestParams = {}) =>
          this.request<DeleteThreadsMessagesByIdData>({
            path: `/v1/organizations/${orgSlug}/threads/${threadId}/messages/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetThreadsMyMembership
     * @request GET:/v1/organizations/{org_slug}/threads/{thread_id}/my_membership
     */
    getThreadsMyMembership: () => {
      const base = 'GET:/v1/organizations/{org_slug}/threads/{thread_id}/my_membership' as const

      return {
        baseKey: dataTaggedQueryKey<GetThreadsMyMembershipData>([base]),
        requestKey: (orgSlug: string, threadId: string) =>
          dataTaggedQueryKey<GetThreadsMyMembershipData>([base, orgSlug, threadId]),
        request: (orgSlug: string, threadId: string, params: RequestParams = {}) =>
          this.request<GetThreadsMyMembershipData>({
            path: `/v1/organizations/${orgSlug}/threads/${threadId}/my_membership`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutThreadsMyMembership
     * @request PUT:/v1/organizations/{org_slug}/threads/{thread_id}/my_membership
     */
    putThreadsMyMembership: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/threads/{thread_id}/my_membership' as const

      return {
        baseKey: dataTaggedQueryKey<PutThreadsMyMembershipData>([base]),
        requestKey: (orgSlug: string, threadId: string) =>
          dataTaggedQueryKey<PutThreadsMyMembershipData>([base, orgSlug, threadId]),
        request: (
          orgSlug: string,
          threadId: string,
          data: OrganizationsOrgSlugThreadsThreadIdMyMembershipPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutThreadsMyMembershipData>({
            path: `/v1/organizations/${orgSlug}/threads/${threadId}/my_membership`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteThreadsMyMembership
     * @request DELETE:/v1/organizations/{org_slug}/threads/{thread_id}/my_membership
     */
    deleteThreadsMyMembership: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/threads/{thread_id}/my_membership' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteThreadsMyMembershipData>([base]),
        requestKey: (orgSlug: string, threadId: string) =>
          dataTaggedQueryKey<DeleteThreadsMyMembershipData>([base, orgSlug, threadId]),
        request: (orgSlug: string, threadId: string, params: RequestParams = {}) =>
          this.request<DeleteThreadsMyMembershipData>({
            path: `/v1/organizations/${orgSlug}/threads/${threadId}/my_membership`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostThreadsNotificationForces
     * @request POST:/v1/organizations/{org_slug}/threads/{thread_id}/notification_forces
     */
    postThreadsNotificationForces: () => {
      const base = 'POST:/v1/organizations/{org_slug}/threads/{thread_id}/notification_forces' as const

      return {
        baseKey: dataTaggedQueryKey<PostThreadsNotificationForcesData>([base]),
        requestKey: (orgSlug: string, threadId: string) =>
          dataTaggedQueryKey<PostThreadsNotificationForcesData>([base, orgSlug, threadId]),
        request: (orgSlug: string, threadId: string, params: RequestParams = {}) =>
          this.request<PostThreadsNotificationForcesData>({
            path: `/v1/organizations/${orgSlug}/threads/${threadId}/notification_forces`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetThreadsOauthApplications
     * @request GET:/v1/organizations/{org_slug}/threads/{thread_id}/oauth_applications
     */
    getThreadsOauthApplications: () => {
      const base = 'GET:/v1/organizations/{org_slug}/threads/{thread_id}/oauth_applications' as const

      return {
        baseKey: dataTaggedQueryKey<GetThreadsOauthApplicationsData>([base]),
        requestKey: (orgSlug: string, threadId: string) =>
          dataTaggedQueryKey<GetThreadsOauthApplicationsData>([base, orgSlug, threadId]),
        request: (orgSlug: string, threadId: string, params: RequestParams = {}) =>
          this.request<GetThreadsOauthApplicationsData>({
            path: `/v1/organizations/${orgSlug}/threads/${threadId}/oauth_applications`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostThreadsOauthApplications
     * @request POST:/v1/organizations/{org_slug}/threads/{thread_id}/oauth_applications
     */
    postThreadsOauthApplications: () => {
      const base = 'POST:/v1/organizations/{org_slug}/threads/{thread_id}/oauth_applications' as const

      return {
        baseKey: dataTaggedQueryKey<PostThreadsOauthApplicationsData>([base]),
        requestKey: (orgSlug: string, threadId: string) =>
          dataTaggedQueryKey<PostThreadsOauthApplicationsData>([base, orgSlug, threadId]),
        request: (
          orgSlug: string,
          threadId: string,
          data: OrganizationsOrgSlugThreadsThreadIdOauthApplicationsPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostThreadsOauthApplicationsData>({
            path: `/v1/organizations/${orgSlug}/threads/${threadId}/oauth_applications`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteThreadsOauthApplicationsById
     * @request DELETE:/v1/organizations/{org_slug}/threads/{thread_id}/oauth_applications/{id}
     */
    deleteThreadsOauthApplicationsById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/threads/{thread_id}/oauth_applications/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteThreadsOauthApplicationsByIdData>([base]),
        requestKey: (orgSlug: string, threadId: string, id: string) =>
          dataTaggedQueryKey<DeleteThreadsOauthApplicationsByIdData>([base, orgSlug, threadId, id]),
        request: (orgSlug: string, threadId: string, id: string, params: RequestParams = {}) =>
          this.request<DeleteThreadsOauthApplicationsByIdData>({
            path: `/v1/organizations/${orgSlug}/threads/${threadId}/oauth_applications/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutThreadsOtherMembershipsList
     * @request PUT:/v1/organizations/{org_slug}/threads/{thread_id}/other_memberships_list
     */
    putThreadsOtherMembershipsList: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/threads/{thread_id}/other_memberships_list' as const

      return {
        baseKey: dataTaggedQueryKey<PutThreadsOtherMembershipsListData>([base]),
        requestKey: (orgSlug: string, threadId: string) =>
          dataTaggedQueryKey<PutThreadsOtherMembershipsListData>([base, orgSlug, threadId]),
        request: (
          orgSlug: string,
          threadId: string,
          data: OrganizationsOrgSlugThreadsThreadIdOtherMembershipsListPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutThreadsOtherMembershipsListData>({
            path: `/v1/organizations/${orgSlug}/threads/${threadId}/other_memberships_list`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetThreadsPresignedFields
     * @request GET:/v1/organizations/{org_slug}/threads/presigned-fields
     */
    getThreadsPresignedFields: () => {
      const base = 'GET:/v1/organizations/{org_slug}/threads/presigned-fields' as const

      return {
        baseKey: dataTaggedQueryKey<GetThreadsPresignedFieldsData>([base]),
        requestKey: (params: GetThreadsPresignedFieldsParams) =>
          dataTaggedQueryKey<GetThreadsPresignedFieldsData>([base, params]),
        request: ({ orgSlug, ...query }: GetThreadsPresignedFieldsParams, params: RequestParams = {}) =>
          this.request<GetThreadsPresignedFieldsData>({
            path: `/v1/organizations/${orgSlug}/threads/presigned-fields`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostThreadsReads
     * @request POST:/v1/organizations/{org_slug}/threads/{thread_id}/reads
     */
    postThreadsReads: () => {
      const base = 'POST:/v1/organizations/{org_slug}/threads/{thread_id}/reads' as const

      return {
        baseKey: dataTaggedQueryKey<PostThreadsReadsData>([base]),
        requestKey: (orgSlug: string, threadId: string) =>
          dataTaggedQueryKey<PostThreadsReadsData>([base, orgSlug, threadId]),
        request: (orgSlug: string, threadId: string, params: RequestParams = {}) =>
          this.request<PostThreadsReadsData>({
            path: `/v1/organizations/${orgSlug}/threads/${threadId}/reads`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteThreadsReads
     * @request DELETE:/v1/organizations/{org_slug}/threads/{thread_id}/reads
     */
    deleteThreadsReads: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/threads/{thread_id}/reads' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteThreadsReadsData>([base]),
        requestKey: (orgSlug: string, threadId: string) =>
          dataTaggedQueryKey<DeleteThreadsReadsData>([base, orgSlug, threadId]),
        request: (orgSlug: string, threadId: string, params: RequestParams = {}) =>
          this.request<DeleteThreadsReadsData>({
            path: `/v1/organizations/${orgSlug}/threads/${threadId}/reads`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetThreads
     * @request GET:/v1/organizations/{org_slug}/threads
     */
    getThreads: () => {
      const base = 'GET:/v1/organizations/{org_slug}/threads' as const

      return {
        baseKey: dataTaggedQueryKey<GetThreadsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetThreadsData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetThreadsData>({
            path: `/v1/organizations/${orgSlug}/threads`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostThreads
     * @request POST:/v1/organizations/{org_slug}/threads
     */
    postThreads: () => {
      const base = 'POST:/v1/organizations/{org_slug}/threads' as const

      return {
        baseKey: dataTaggedQueryKey<PostThreadsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostThreadsData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationsOrgSlugThreadsPostRequest, params: RequestParams = {}) =>
          this.request<PostThreadsData>({
            path: `/v1/organizations/${orgSlug}/threads`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetThreadsById
     * @request GET:/v1/organizations/{org_slug}/threads/{id}
     */
    getThreadsById: () => {
      const base = 'GET:/v1/organizations/{org_slug}/threads/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<GetThreadsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<GetThreadsByIdData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<GetThreadsByIdData>({
            path: `/v1/organizations/${orgSlug}/threads/${id}`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutThreadsById
     * @request PUT:/v1/organizations/{org_slug}/threads/{id}
     */
    putThreadsById: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/threads/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<PutThreadsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<PutThreadsByIdData>([base, orgSlug, id]),
        request: (
          orgSlug: string,
          id: string,
          data: OrganizationsOrgSlugThreadsIdPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutThreadsByIdData>({
            path: `/v1/organizations/${orgSlug}/threads/${id}`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteThreadsById
     * @request DELETE:/v1/organizations/{org_slug}/threads/{id}
     */
    deleteThreadsById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/threads/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteThreadsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<DeleteThreadsByIdData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<DeleteThreadsByIdData>({
            path: `/v1/organizations/${orgSlug}/threads/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteMessagesAttachmentsById
     * @request DELETE:/v1/organizations/{org_slug}/messages/{message_id}/attachments/{id}
     */
    deleteMessagesAttachmentsById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/messages/{message_id}/attachments/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteMessagesAttachmentsByIdData>([base]),
        requestKey: (orgSlug: string, messageId: string, id: string) =>
          dataTaggedQueryKey<DeleteMessagesAttachmentsByIdData>([base, orgSlug, messageId, id]),
        request: (orgSlug: string, messageId: string, id: string, params: RequestParams = {}) =>
          this.request<DeleteMessagesAttachmentsByIdData>({
            path: `/v1/organizations/${orgSlug}/messages/${messageId}/attachments/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostMessagesReactions
     * @request POST:/v1/organizations/{org_slug}/messages/{message_id}/reactions
     */
    postMessagesReactions: () => {
      const base = 'POST:/v1/organizations/{org_slug}/messages/{message_id}/reactions' as const

      return {
        baseKey: dataTaggedQueryKey<PostMessagesReactionsData>([base]),
        requestKey: (orgSlug: string, messageId: string) =>
          dataTaggedQueryKey<PostMessagesReactionsData>([base, orgSlug, messageId]),
        request: (
          orgSlug: string,
          messageId: string,
          data: OrganizationMessageReactionsPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostMessagesReactionsData>({
            path: `/v1/organizations/${orgSlug}/messages/${messageId}/reactions`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetNotesAttachmentsComments
     * @request GET:/v1/organizations/{org_slug}/notes/{note_id}/attachments/{attachment_id}/comments
     */
    getNotesAttachmentsComments: () => {
      const base = 'GET:/v1/organizations/{org_slug}/notes/{note_id}/attachments/{attachment_id}/comments' as const

      return {
        baseKey: dataTaggedQueryKey<GetNotesAttachmentsCommentsData>([base]),
        requestKey: (params: GetNotesAttachmentsCommentsParams) =>
          dataTaggedQueryKey<GetNotesAttachmentsCommentsData>([base, params]),
        request: (
          { orgSlug, noteId, attachmentId, ...query }: GetNotesAttachmentsCommentsParams,
          params: RequestParams = {}
        ) =>
          this.request<GetNotesAttachmentsCommentsData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/attachments/${attachmentId}/comments`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutNotesAttachmentsReorder
     * @request PUT:/v1/organizations/{org_slug}/notes/{note_id}/attachments/reorder
     */
    putNotesAttachmentsReorder: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/notes/{note_id}/attachments/reorder' as const

      return {
        baseKey: dataTaggedQueryKey<PutNotesAttachmentsReorderData>([base]),
        requestKey: (orgSlug: string, noteId: string) =>
          dataTaggedQueryKey<PutNotesAttachmentsReorderData>([base, orgSlug, noteId]),
        request: (
          orgSlug: string,
          noteId: string,
          data: OrganizationsOrgSlugNotesNoteIdAttachmentsReorderPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutNotesAttachmentsReorderData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/attachments/reorder`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostNotesAttachments
     * @request POST:/v1/organizations/{org_slug}/notes/{note_id}/attachments
     */
    postNotesAttachments: () => {
      const base = 'POST:/v1/organizations/{org_slug}/notes/{note_id}/attachments' as const

      return {
        baseKey: dataTaggedQueryKey<PostNotesAttachmentsData>([base]),
        requestKey: (orgSlug: string, noteId: string) =>
          dataTaggedQueryKey<PostNotesAttachmentsData>([base, orgSlug, noteId]),
        request: (
          orgSlug: string,
          noteId: string,
          data: OrganizationNoteAttachmentsPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostNotesAttachmentsData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/attachments`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutNotesAttachmentsById
     * @request PUT:/v1/organizations/{org_slug}/notes/{note_id}/attachments/{id}
     */
    putNotesAttachmentsById: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/notes/{note_id}/attachments/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<PutNotesAttachmentsByIdData>([base]),
        requestKey: (orgSlug: string, noteId: string, id: string) =>
          dataTaggedQueryKey<PutNotesAttachmentsByIdData>([base, orgSlug, noteId, id]),
        request: (
          orgSlug: string,
          noteId: string,
          id: string,
          data: OrganizationsOrgSlugNotesNoteIdAttachmentsIdPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutNotesAttachmentsByIdData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/attachments/${id}`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteNotesAttachmentsById
     * @request DELETE:/v1/organizations/{org_slug}/notes/{note_id}/attachments/{id}
     */
    deleteNotesAttachmentsById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/notes/{note_id}/attachments/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteNotesAttachmentsByIdData>([base]),
        requestKey: (orgSlug: string, noteId: string, id: string) =>
          dataTaggedQueryKey<DeleteNotesAttachmentsByIdData>([base, orgSlug, noteId, id]),
        request: (orgSlug: string, noteId: string, id: string, params: RequestParams = {}) =>
          this.request<DeleteNotesAttachmentsByIdData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/attachments/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetNotesComments
     * @request GET:/v1/organizations/{org_slug}/notes/{note_id}/comments
     */
    getNotesComments: () => {
      const base = 'GET:/v1/organizations/{org_slug}/notes/{note_id}/comments' as const

      return {
        baseKey: dataTaggedQueryKey<GetNotesCommentsData>([base]),
        requestKey: (params: GetNotesCommentsParams) => dataTaggedQueryKey<GetNotesCommentsData>([base, params]),
        request: ({ orgSlug, noteId, ...query }: GetNotesCommentsParams, params: RequestParams = {}) =>
          this.request<GetNotesCommentsData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/comments`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostNotesComments
     * @request POST:/v1/organizations/{org_slug}/notes/{note_id}/comments
     */
    postNotesComments: () => {
      const base = 'POST:/v1/organizations/{org_slug}/notes/{note_id}/comments' as const

      return {
        baseKey: dataTaggedQueryKey<PostNotesCommentsData>([base]),
        requestKey: (orgSlug: string, noteId: string) =>
          dataTaggedQueryKey<PostNotesCommentsData>([base, orgSlug, noteId]),
        request: (
          orgSlug: string,
          noteId: string,
          data: OrganizationsOrgSlugNotesNoteIdCommentsPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostNotesCommentsData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/comments`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostNotesFavorite
     * @request POST:/v1/organizations/{org_slug}/notes/{note_id}/favorite
     */
    postNotesFavorite: () => {
      const base = 'POST:/v1/organizations/{org_slug}/notes/{note_id}/favorite' as const

      return {
        baseKey: dataTaggedQueryKey<PostNotesFavoriteData>([base]),
        requestKey: (orgSlug: string, noteId: string) =>
          dataTaggedQueryKey<PostNotesFavoriteData>([base, orgSlug, noteId]),
        request: (orgSlug: string, noteId: string, params: RequestParams = {}) =>
          this.request<PostNotesFavoriteData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/favorite`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteNotesFavorite
     * @request DELETE:/v1/organizations/{org_slug}/notes/{note_id}/favorite
     */
    deleteNotesFavorite: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/notes/{note_id}/favorite' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteNotesFavoriteData>([base]),
        requestKey: (orgSlug: string, noteId: string) =>
          dataTaggedQueryKey<DeleteNotesFavoriteData>([base, orgSlug, noteId]),
        request: (orgSlug: string, noteId: string, params: RequestParams = {}) =>
          this.request<DeleteNotesFavoriteData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/favorite`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostNotesFollowUp
     * @request POST:/v1/organizations/{org_slug}/notes/{note_id}/follow_up
     */
    postNotesFollowUp: () => {
      const base = 'POST:/v1/organizations/{org_slug}/notes/{note_id}/follow_up' as const

      return {
        baseKey: dataTaggedQueryKey<PostNotesFollowUpData>([base]),
        requestKey: (orgSlug: string, noteId: string) =>
          dataTaggedQueryKey<PostNotesFollowUpData>([base, orgSlug, noteId]),
        request: (
          orgSlug: string,
          noteId: string,
          data: OrganizationNoteFollowUpPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostNotesFollowUpData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/follow_up`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetNotesPermissions
     * @request GET:/v1/organizations/{org_slug}/notes/{note_id}/permissions
     */
    getNotesPermissions: () => {
      const base = 'GET:/v1/organizations/{org_slug}/notes/{note_id}/permissions' as const

      return {
        baseKey: dataTaggedQueryKey<GetNotesPermissionsData>([base]),
        requestKey: (orgSlug: string, noteId: string) =>
          dataTaggedQueryKey<GetNotesPermissionsData>([base, orgSlug, noteId]),
        request: (orgSlug: string, noteId: string, params: RequestParams = {}) =>
          this.request<GetNotesPermissionsData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/permissions`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostNotesPermissions
     * @request POST:/v1/organizations/{org_slug}/notes/{note_id}/permissions
     */
    postNotesPermissions: () => {
      const base = 'POST:/v1/organizations/{org_slug}/notes/{note_id}/permissions' as const

      return {
        baseKey: dataTaggedQueryKey<PostNotesPermissionsData>([base]),
        requestKey: (orgSlug: string, noteId: string) =>
          dataTaggedQueryKey<PostNotesPermissionsData>([base, orgSlug, noteId]),
        request: (
          orgSlug: string,
          noteId: string,
          data: OrganizationsOrgSlugNotesNoteIdPermissionsPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostNotesPermissionsData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/permissions`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutNotesPermissionsById
     * @request PUT:/v1/organizations/{org_slug}/notes/{note_id}/permissions/{id}
     */
    putNotesPermissionsById: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/notes/{note_id}/permissions/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<PutNotesPermissionsByIdData>([base]),
        requestKey: (orgSlug: string, noteId: string, id: string) =>
          dataTaggedQueryKey<PutNotesPermissionsByIdData>([base, orgSlug, noteId, id]),
        request: (
          orgSlug: string,
          noteId: string,
          id: string,
          data: OrganizationsOrgSlugNotesNoteIdPermissionsIdPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutNotesPermissionsByIdData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/permissions/${id}`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteNotesPermissionsById
     * @request DELETE:/v1/organizations/{org_slug}/notes/{note_id}/permissions/{id}
     */
    deleteNotesPermissionsById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/notes/{note_id}/permissions/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteNotesPermissionsByIdData>([base]),
        requestKey: (orgSlug: string, noteId: string, id: string) =>
          dataTaggedQueryKey<DeleteNotesPermissionsByIdData>([base, orgSlug, noteId, id]),
        request: (orgSlug: string, noteId: string, id: string, params: RequestParams = {}) =>
          this.request<DeleteNotesPermissionsByIdData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/permissions/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostNotesPin
     * @request POST:/v1/organizations/{org_slug}/notes/{note_id}/pin
     */
    postNotesPin: () => {
      const base = 'POST:/v1/organizations/{org_slug}/notes/{note_id}/pin' as const

      return {
        baseKey: dataTaggedQueryKey<PostNotesPinData>([base]),
        requestKey: (orgSlug: string, noteId: string) => dataTaggedQueryKey<PostNotesPinData>([base, orgSlug, noteId]),
        request: (orgSlug: string, noteId: string, params: RequestParams = {}) =>
          this.request<PostNotesPinData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/pin`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutNotesProjectPermissions
     * @request PUT:/v1/organizations/{org_slug}/notes/{note_id}/project_permissions
     */
    putNotesProjectPermissions: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/notes/{note_id}/project_permissions' as const

      return {
        baseKey: dataTaggedQueryKey<PutNotesProjectPermissionsData>([base]),
        requestKey: (orgSlug: string, noteId: string) =>
          dataTaggedQueryKey<PutNotesProjectPermissionsData>([base, orgSlug, noteId]),
        request: (
          orgSlug: string,
          noteId: string,
          data: OrganizationsOrgSlugNotesNoteIdProjectPermissionsPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutNotesProjectPermissionsData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/project_permissions`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteNotesProjectPermissions
     * @request DELETE:/v1/organizations/{org_slug}/notes/{note_id}/project_permissions
     */
    deleteNotesProjectPermissions: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/notes/{note_id}/project_permissions' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteNotesProjectPermissionsData>([base]),
        requestKey: (orgSlug: string, noteId: string) =>
          dataTaggedQueryKey<DeleteNotesProjectPermissionsData>([base, orgSlug, noteId]),
        request: (orgSlug: string, noteId: string, params: RequestParams = {}) =>
          this.request<DeleteNotesProjectPermissionsData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/project_permissions`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetNotesPublicNotes
     * @request GET:/v1/organizations/{org_slug}/notes/{note_id}/public_notes
     */
    getNotesPublicNotes: () => {
      const base = 'GET:/v1/organizations/{org_slug}/notes/{note_id}/public_notes' as const

      return {
        baseKey: dataTaggedQueryKey<GetNotesPublicNotesData>([base]),
        requestKey: (orgSlug: string, noteId: string) =>
          dataTaggedQueryKey<GetNotesPublicNotesData>([base, orgSlug, noteId]),
        request: (orgSlug: string, noteId: string, params: RequestParams = {}) =>
          this.request<GetNotesPublicNotesData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/public_notes`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetNotesSyncState
     * @request GET:/v1/organizations/{org_slug}/notes/{note_id}/sync_state
     */
    getNotesSyncState: () => {
      const base = 'GET:/v1/organizations/{org_slug}/notes/{note_id}/sync_state' as const

      return {
        baseKey: dataTaggedQueryKey<GetNotesSyncStateData>([base]),
        requestKey: (orgSlug: string, noteId: string) =>
          dataTaggedQueryKey<GetNotesSyncStateData>([base, orgSlug, noteId]),
        request: (orgSlug: string, noteId: string, params: RequestParams = {}) =>
          this.request<GetNotesSyncStateData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/sync_state`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutNotesSyncState
     * @request PUT:/v1/organizations/{org_slug}/notes/{note_id}/sync_state
     */
    putNotesSyncState: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/notes/{note_id}/sync_state' as const

      return {
        baseKey: dataTaggedQueryKey<PutNotesSyncStateData>([base]),
        requestKey: (orgSlug: string, noteId: string) =>
          dataTaggedQueryKey<PutNotesSyncStateData>([base, orgSlug, noteId]),
        request: (
          orgSlug: string,
          noteId: string,
          data: OrganizationsOrgSlugNotesNoteIdSyncStatePutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutNotesSyncStateData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/sync_state`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetNotesTimelineEvents
     * @request GET:/v1/organizations/{org_slug}/notes/{note_id}/timeline_events
     */
    getNotesTimelineEvents: () => {
      const base = 'GET:/v1/organizations/{org_slug}/notes/{note_id}/timeline_events' as const

      return {
        baseKey: dataTaggedQueryKey<GetNotesTimelineEventsData>([base]),
        requestKey: (params: GetNotesTimelineEventsParams) =>
          dataTaggedQueryKey<GetNotesTimelineEventsData>([base, params]),
        request: ({ orgSlug, noteId, ...query }: GetNotesTimelineEventsParams, params: RequestParams = {}) =>
          this.request<GetNotesTimelineEventsData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/timeline_events`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetNotesViews
     * @request GET:/v1/organizations/{org_slug}/notes/{note_id}/views
     */
    getNotesViews: () => {
      const base = 'GET:/v1/organizations/{org_slug}/notes/{note_id}/views' as const

      return {
        baseKey: dataTaggedQueryKey<GetNotesViewsData>([base]),
        requestKey: (orgSlug: string, noteId: string) => dataTaggedQueryKey<GetNotesViewsData>([base, orgSlug, noteId]),
        request: (orgSlug: string, noteId: string, params: RequestParams = {}) =>
          this.request<GetNotesViewsData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/views`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostNotesViews
     * @request POST:/v1/organizations/{org_slug}/notes/{note_id}/views
     */
    postNotesViews: () => {
      const base = 'POST:/v1/organizations/{org_slug}/notes/{note_id}/views' as const

      return {
        baseKey: dataTaggedQueryKey<PostNotesViewsData>([base]),
        requestKey: (orgSlug: string, noteId: string) =>
          dataTaggedQueryKey<PostNotesViewsData>([base, orgSlug, noteId]),
        request: (orgSlug: string, noteId: string, params: RequestParams = {}) =>
          this.request<PostNotesViewsData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/views`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutNotesVisibility
     * @request PUT:/v1/organizations/{org_slug}/notes/{note_id}/visibility
     */
    putNotesVisibility: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/notes/{note_id}/visibility' as const

      return {
        baseKey: dataTaggedQueryKey<PutNotesVisibilityData>([base]),
        requestKey: (orgSlug: string, noteId: string) =>
          dataTaggedQueryKey<PutNotesVisibilityData>([base, orgSlug, noteId]),
        request: (
          orgSlug: string,
          noteId: string,
          data: OrganizationsOrgSlugNotesNoteIdVisibilityPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutNotesVisibilityData>({
            path: `/v1/organizations/${orgSlug}/notes/${noteId}/visibility`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetNotes
     * @request GET:/v1/organizations/{org_slug}/notes
     */
    getNotes: () => {
      const base = 'GET:/v1/organizations/{org_slug}/notes' as const

      return {
        baseKey: dataTaggedQueryKey<GetNotesData>([base]),
        requestKey: (params: GetNotesParams) => dataTaggedQueryKey<GetNotesData>([base, params]),
        request: ({ orgSlug, ...query }: GetNotesParams, params: RequestParams = {}) =>
          this.request<GetNotesData>({
            path: `/v1/organizations/${orgSlug}/notes`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostNotes
     * @request POST:/v1/organizations/{org_slug}/notes
     */
    postNotes: () => {
      const base = 'POST:/v1/organizations/{org_slug}/notes' as const

      return {
        baseKey: dataTaggedQueryKey<PostNotesData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostNotesData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationsOrgSlugNotesPostRequest, params: RequestParams = {}) =>
          this.request<PostNotesData>({
            path: `/v1/organizations/${orgSlug}/notes`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetNotesById
     * @request GET:/v1/organizations/{org_slug}/notes/{id}
     */
    getNotesById: () => {
      const base = 'GET:/v1/organizations/{org_slug}/notes/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<GetNotesByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<GetNotesByIdData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<GetNotesByIdData>({
            path: `/v1/organizations/${orgSlug}/notes/${id}`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutNotesById
     * @request PUT:/v1/organizations/{org_slug}/notes/{id}
     */
    putNotesById: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/notes/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<PutNotesByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<PutNotesByIdData>([base, orgSlug, id]),
        request: (
          orgSlug: string,
          id: string,
          data: OrganizationsOrgSlugNotesIdPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutNotesByIdData>({
            path: `/v1/organizations/${orgSlug}/notes/${id}`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteNotesById
     * @request DELETE:/v1/organizations/{org_slug}/notes/{id}
     */
    deleteNotesById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/notes/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteNotesByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<DeleteNotesByIdData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<DeleteNotesByIdData>({
            path: `/v1/organizations/${orgSlug}/notes/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteMembersMeNotificationsArchive
     * @request DELETE:/v1/organizations/{org_slug}/members/me/notifications/{notification_id}/archive
     */
    deleteMembersMeNotificationsArchive: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/members/me/notifications/{notification_id}/archive' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteMembersMeNotificationsArchiveData>([base]),
        requestKey: (orgSlug: string, notificationId: string) =>
          dataTaggedQueryKey<DeleteMembersMeNotificationsArchiveData>([base, orgSlug, notificationId]),
        request: (orgSlug: string, notificationId: string, params: RequestParams = {}) =>
          this.request<DeleteMembersMeNotificationsArchiveData>({
            path: `/v1/organizations/${orgSlug}/members/me/notifications/${notificationId}/archive`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostMembersMeNotificationsDeleteAll
     * @request POST:/v1/organizations/{org_slug}/members/me/notifications/delete_all
     */
    postMembersMeNotificationsDeleteAll: () => {
      const base = 'POST:/v1/organizations/{org_slug}/members/me/notifications/delete_all' as const

      return {
        baseKey: dataTaggedQueryKey<PostMembersMeNotificationsDeleteAllData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostMembersMeNotificationsDeleteAllData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationNotificationDeleteAllPostRequest, params: RequestParams = {}) =>
          this.request<PostMembersMeNotificationsDeleteAllData>({
            path: `/v1/organizations/${orgSlug}/members/me/notifications/delete_all`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostMembersMeNotificationsMarkAllRead
     * @request POST:/v1/organizations/{org_slug}/members/me/notifications/mark_all_read
     */
    postMembersMeNotificationsMarkAllRead: () => {
      const base = 'POST:/v1/organizations/{org_slug}/members/me/notifications/mark_all_read' as const

      return {
        baseKey: dataTaggedQueryKey<PostMembersMeNotificationsMarkAllReadData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostMembersMeNotificationsMarkAllReadData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationNotificationMarkAllReadPostRequest, params: RequestParams = {}) =>
          this.request<PostMembersMeNotificationsMarkAllReadData>({
            path: `/v1/organizations/${orgSlug}/members/me/notifications/mark_all_read`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostMembersMeNotificationsRead
     * @request POST:/v1/organizations/{org_slug}/members/me/notifications/{notification_id}/read
     */
    postMembersMeNotificationsRead: () => {
      const base = 'POST:/v1/organizations/{org_slug}/members/me/notifications/{notification_id}/read' as const

      return {
        baseKey: dataTaggedQueryKey<PostMembersMeNotificationsReadData>([base]),
        requestKey: (orgSlug: string, notificationId: string) =>
          dataTaggedQueryKey<PostMembersMeNotificationsReadData>([base, orgSlug, notificationId]),
        request: (orgSlug: string, notificationId: string, params: RequestParams = {}) =>
          this.request<PostMembersMeNotificationsReadData>({
            path: `/v1/organizations/${orgSlug}/members/me/notifications/${notificationId}/read`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteMembersMeNotificationsRead
     * @request DELETE:/v1/organizations/{org_slug}/members/me/notifications/{notification_id}/read
     */
    deleteMembersMeNotificationsRead: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/members/me/notifications/{notification_id}/read' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteMembersMeNotificationsReadData>([base]),
        requestKey: (orgSlug: string, notificationId: string) =>
          dataTaggedQueryKey<DeleteMembersMeNotificationsReadData>([base, orgSlug, notificationId]),
        request: (orgSlug: string, notificationId: string, params: RequestParams = {}) =>
          this.request<DeleteMembersMeNotificationsReadData>({
            path: `/v1/organizations/${orgSlug}/members/me/notifications/${notificationId}/read`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMembersMeNotifications
     * @request GET:/v1/organizations/{org_slug}/members/me/notifications
     */
    getMembersMeNotifications: () => {
      const base = 'GET:/v1/organizations/{org_slug}/members/me/notifications' as const

      return {
        baseKey: dataTaggedQueryKey<GetMembersMeNotificationsData>([base]),
        requestKey: (params: GetMembersMeNotificationsParams) =>
          dataTaggedQueryKey<GetMembersMeNotificationsData>([base, params]),
        request: ({ orgSlug, ...query }: GetMembersMeNotificationsParams, params: RequestParams = {}) =>
          this.request<GetMembersMeNotificationsData>({
            path: `/v1/organizations/${orgSlug}/members/me/notifications`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteMembersMeNotificationsById
     * @request DELETE:/v1/organizations/{org_slug}/members/me/notifications/{id}
     */
    deleteMembersMeNotificationsById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/members/me/notifications/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteMembersMeNotificationsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) =>
          dataTaggedQueryKey<DeleteMembersMeNotificationsByIdData>([base, orgSlug, id]),
        request: (
          orgSlug: string,
          id: string,
          data: OrganizationNotificationDeleteRequest,
          params: RequestParams = {}
        ) =>
          this.request<DeleteMembersMeNotificationsByIdData>({
            path: `/v1/organizations/${orgSlug}/members/me/notifications/${id}`,
            method: 'DELETE',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetOauthApplicationsPresignedFields
     * @request GET:/v1/organizations/{org_slug}/oauth_applications/presigned_fields
     */
    getOauthApplicationsPresignedFields: () => {
      const base = 'GET:/v1/organizations/{org_slug}/oauth_applications/presigned_fields' as const

      return {
        baseKey: dataTaggedQueryKey<GetOauthApplicationsPresignedFieldsData>([base]),
        requestKey: (params: GetOauthApplicationsPresignedFieldsParams) =>
          dataTaggedQueryKey<GetOauthApplicationsPresignedFieldsData>([base, params]),
        request: ({ orgSlug, ...query }: GetOauthApplicationsPresignedFieldsParams, params: RequestParams = {}) =>
          this.request<GetOauthApplicationsPresignedFieldsData>({
            path: `/v1/organizations/${orgSlug}/oauth_applications/presigned_fields`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostOauthApplicationsSecretRenewals
     * @request POST:/v1/organizations/{org_slug}/oauth_applications/{oauth_application_id}/secret_renewals
     */
    postOauthApplicationsSecretRenewals: () => {
      const base =
        'POST:/v1/organizations/{org_slug}/oauth_applications/{oauth_application_id}/secret_renewals' as const

      return {
        baseKey: dataTaggedQueryKey<PostOauthApplicationsSecretRenewalsData>([base]),
        requestKey: (orgSlug: string, oauthApplicationId: string) =>
          dataTaggedQueryKey<PostOauthApplicationsSecretRenewalsData>([base, orgSlug, oauthApplicationId]),
        request: (orgSlug: string, oauthApplicationId: string, params: RequestParams = {}) =>
          this.request<PostOauthApplicationsSecretRenewalsData>({
            path: `/v1/organizations/${orgSlug}/oauth_applications/${oauthApplicationId}/secret_renewals`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostOauthApplicationsTokens
     * @request POST:/v1/organizations/{org_slug}/oauth_applications/{oauth_application_id}/tokens
     */
    postOauthApplicationsTokens: () => {
      const base = 'POST:/v1/organizations/{org_slug}/oauth_applications/{oauth_application_id}/tokens' as const

      return {
        baseKey: dataTaggedQueryKey<PostOauthApplicationsTokensData>([base]),
        requestKey: (orgSlug: string, oauthApplicationId: string) =>
          dataTaggedQueryKey<PostOauthApplicationsTokensData>([base, orgSlug, oauthApplicationId]),
        request: (orgSlug: string, oauthApplicationId: string, params: RequestParams = {}) =>
          this.request<PostOauthApplicationsTokensData>({
            path: `/v1/organizations/${orgSlug}/oauth_applications/${oauthApplicationId}/tokens`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetOauthApplications
     * @request GET:/v1/organizations/{org_slug}/oauth_applications
     */
    getOauthApplications: () => {
      const base = 'GET:/v1/organizations/{org_slug}/oauth_applications' as const

      return {
        baseKey: dataTaggedQueryKey<GetOauthApplicationsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetOauthApplicationsData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetOauthApplicationsData>({
            path: `/v1/organizations/${orgSlug}/oauth_applications`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostOauthApplications
     * @request POST:/v1/organizations/{org_slug}/oauth_applications
     */
    postOauthApplications: () => {
      const base = 'POST:/v1/organizations/{org_slug}/oauth_applications' as const

      return {
        baseKey: dataTaggedQueryKey<PostOauthApplicationsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostOauthApplicationsData>([base, orgSlug]),
        request: (
          orgSlug: string,
          data: OrganizationsOrgSlugOauthApplicationsPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostOauthApplicationsData>({
            path: `/v1/organizations/${orgSlug}/oauth_applications`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetOauthApplicationsById
     * @request GET:/v1/organizations/{org_slug}/oauth_applications/{id}
     */
    getOauthApplicationsById: () => {
      const base = 'GET:/v1/organizations/{org_slug}/oauth_applications/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<GetOauthApplicationsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) =>
          dataTaggedQueryKey<GetOauthApplicationsByIdData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<GetOauthApplicationsByIdData>({
            path: `/v1/organizations/${orgSlug}/oauth_applications/${id}`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutOauthApplicationsById
     * @request PUT:/v1/organizations/{org_slug}/oauth_applications/{id}
     */
    putOauthApplicationsById: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/oauth_applications/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<PutOauthApplicationsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) =>
          dataTaggedQueryKey<PutOauthApplicationsByIdData>([base, orgSlug, id]),
        request: (
          orgSlug: string,
          id: string,
          data: OrganizationsOrgSlugOauthApplicationsIdPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutOauthApplicationsByIdData>({
            path: `/v1/organizations/${orgSlug}/oauth_applications/${id}`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteOauthApplicationsById
     * @request DELETE:/v1/organizations/{org_slug}/oauth_applications/{id}
     */
    deleteOauthApplicationsById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/oauth_applications/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteOauthApplicationsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) =>
          dataTaggedQueryKey<DeleteOauthApplicationsByIdData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<DeleteOauthApplicationsByIdData>({
            path: `/v1/organizations/${orgSlug}/oauth_applications/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostOnboardProjects
     * @request POST:/v1/organizations/{org_slug}/onboard_projects
     */
    postOnboardProjects: () => {
      const base = 'POST:/v1/organizations/{org_slug}/onboard_projects' as const

      return {
        baseKey: dataTaggedQueryKey<PostOnboardProjectsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostOnboardProjectsData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationOnboardProjectsPostRequest, params: RequestParams = {}) =>
          this.request<PostOnboardProjectsData>({
            path: `/v1/organizations/${orgSlug}/onboard_projects`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetInvitations
     * @request GET:/v1/organizations/{org_slug}/invitations
     */
    getInvitations: () => {
      const base = 'GET:/v1/organizations/{org_slug}/invitations' as const

      return {
        baseKey: dataTaggedQueryKey<GetInvitationsData>([base]),
        requestKey: (params: GetInvitationsParams) => dataTaggedQueryKey<GetInvitationsData>([base, params]),
        request: ({ orgSlug, ...query }: GetInvitationsParams, params: RequestParams = {}) =>
          this.request<GetInvitationsData>({
            path: `/v1/organizations/${orgSlug}/invitations`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostInvitations
     * @request POST:/v1/organizations/{org_slug}/invitations
     */
    postInvitations: () => {
      const base = 'POST:/v1/organizations/{org_slug}/invitations' as const

      return {
        baseKey: dataTaggedQueryKey<PostInvitationsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostInvitationsData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationsOrgSlugInvitationsPostRequest, params: RequestParams = {}) =>
          this.request<PostInvitationsData>({
            path: `/v1/organizations/${orgSlug}/invitations`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetInvitationsByInviteToken
     * @request GET:/v1/organizations/{org_slug}/invitations/{invite_token}
     */
    getInvitationsByInviteToken: () => {
      const base = 'GET:/v1/organizations/{org_slug}/invitations/{invite_token}' as const

      return {
        baseKey: dataTaggedQueryKey<GetInvitationsByInviteTokenData>([base]),
        requestKey: (orgSlug: string, inviteToken: string) =>
          dataTaggedQueryKey<GetInvitationsByInviteTokenData>([base, orgSlug, inviteToken]),
        request: (orgSlug: string, inviteToken: string, params: RequestParams = {}) =>
          this.request<GetInvitationsByInviteTokenData>({
            path: `/v1/organizations/${orgSlug}/invitations/${inviteToken}`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteInvitationsById
     * @request DELETE:/v1/organizations/{org_slug}/invitations/{id}
     */
    deleteInvitationsById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/invitations/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteInvitationsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<DeleteInvitationsByIdData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<DeleteInvitationsByIdData>({
            path: `/v1/organizations/${orgSlug}/invitations/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMembers
     * @request GET:/v1/organizations/{org_slug}/members
     */
    getMembers: () => {
      const base = 'GET:/v1/organizations/{org_slug}/members' as const

      return {
        baseKey: dataTaggedQueryKey<GetMembersData>([base]),
        requestKey: (params: GetMembersParams) => dataTaggedQueryKey<GetMembersData>([base, params]),
        request: ({ orgSlug, ...query }: GetMembersParams, params: RequestParams = {}) =>
          this.request<GetMembersData>({
            path: `/v1/organizations/${orgSlug}/members`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMembersByUsername
     * @request GET:/v1/organizations/{org_slug}/members/{username}
     */
    getMembersByUsername: () => {
      const base = 'GET:/v1/organizations/{org_slug}/members/{username}' as const

      return {
        baseKey: dataTaggedQueryKey<GetMembersByUsernameData>([base]),
        requestKey: (orgSlug: string, username: string) =>
          dataTaggedQueryKey<GetMembersByUsernameData>([base, orgSlug, username]),
        request: (orgSlug: string, username: string, params: RequestParams = {}) =>
          this.request<GetMembersByUsernameData>({
            path: `/v1/organizations/${orgSlug}/members/${username}`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMembersPosts
     * @request GET:/v1/organizations/{org_slug}/members/{username}/posts
     */
    getMembersPosts: () => {
      const base = 'GET:/v1/organizations/{org_slug}/members/{username}/posts' as const

      return {
        baseKey: dataTaggedQueryKey<GetMembersPostsData>([base]),
        requestKey: (params: GetMembersPostsParams) => dataTaggedQueryKey<GetMembersPostsData>([base, params]),
        request: ({ orgSlug, username, ...query }: GetMembersPostsParams, params: RequestParams = {}) =>
          this.request<GetMembersPostsData>({
            path: `/v1/organizations/${orgSlug}/members/${username}/posts`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutMembersById
     * @request PUT:/v1/organizations/{org_slug}/members/{id}
     */
    putMembersById: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/members/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<PutMembersByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<PutMembersByIdData>([base, orgSlug, id]),
        request: (
          orgSlug: string,
          id: string,
          data: OrganizationsOrgSlugMembersIdPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutMembersByIdData>({
            path: `/v1/organizations/${orgSlug}/members/${id}`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteMembersById
     * @request DELETE:/v1/organizations/{org_slug}/members/{id}
     */
    deleteMembersById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/members/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteMembersByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<DeleteMembersByIdData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<DeleteMembersByIdData>({
            path: `/v1/organizations/${orgSlug}/members/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutMembersReactivate
     * @request PUT:/v1/organizations/{org_slug}/members/{id}/reactivate
     */
    putMembersReactivate: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/members/{id}/reactivate' as const

      return {
        baseKey: dataTaggedQueryKey<PutMembersReactivateData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<PutMembersReactivateData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<PutMembersReactivateData>({
            path: `/v1/organizations/${orgSlug}/members/${id}/reactivate`,
            method: 'PUT',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMembershipRequests
     * @request GET:/v1/organizations/{org_slug}/membership-requests
     */
    getMembershipRequests: () => {
      const base = 'GET:/v1/organizations/{org_slug}/membership-requests' as const

      return {
        baseKey: dataTaggedQueryKey<GetMembershipRequestsData>([base]),
        requestKey: (params: GetMembershipRequestsParams) =>
          dataTaggedQueryKey<GetMembershipRequestsData>([base, params]),
        request: ({ orgSlug, ...query }: GetMembershipRequestsParams, params: RequestParams = {}) =>
          this.request<GetMembershipRequestsData>({
            path: `/v1/organizations/${orgSlug}/membership-requests`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostMembershipRequests
     * @request POST:/v1/organizations/{org_slug}/membership-requests
     */
    postMembershipRequests: () => {
      const base = 'POST:/v1/organizations/{org_slug}/membership-requests' as const

      return {
        baseKey: dataTaggedQueryKey<PostMembershipRequestsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostMembershipRequestsData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<PostMembershipRequestsData>({
            path: `/v1/organizations/${orgSlug}/membership-requests`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMembershipRequest
     * @request GET:/v1/organizations/{org_slug}/membership-request
     */
    getMembershipRequest: () => {
      const base = 'GET:/v1/organizations/{org_slug}/membership-request' as const

      return {
        baseKey: dataTaggedQueryKey<GetMembershipRequestData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetMembershipRequestData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetMembershipRequestData>({
            path: `/v1/organizations/${orgSlug}/membership-request`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostMembershipRequestsApprove
     * @request POST:/v1/organizations/{org_slug}/membership-requests/{id}/approve
     */
    postMembershipRequestsApprove: () => {
      const base = 'POST:/v1/organizations/{org_slug}/membership-requests/{id}/approve' as const

      return {
        baseKey: dataTaggedQueryKey<PostMembershipRequestsApproveData>([base]),
        requestKey: (orgSlug: string, id: string) =>
          dataTaggedQueryKey<PostMembershipRequestsApproveData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<PostMembershipRequestsApproveData>({
            path: `/v1/organizations/${orgSlug}/membership-requests/${id}/approve`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostMembershipRequestsDecline
     * @request POST:/v1/organizations/{org_slug}/membership-requests/{id}/decline
     */
    postMembershipRequestsDecline: () => {
      const base = 'POST:/v1/organizations/{org_slug}/membership-requests/{id}/decline' as const

      return {
        baseKey: dataTaggedQueryKey<PostMembershipRequestsDeclineData>([base]),
        requestKey: (orgSlug: string, id: string) =>
          dataTaggedQueryKey<PostMembershipRequestsDeclineData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<PostMembershipRequestsDeclineData>({
            path: `/v1/organizations/${orgSlug}/membership-requests/${id}/decline`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMembersMeArchivedNotifications
     * @request GET:/v1/organizations/{org_slug}/members/me/archived_notifications
     */
    getMembersMeArchivedNotifications: () => {
      const base = 'GET:/v1/organizations/{org_slug}/members/me/archived_notifications' as const

      return {
        baseKey: dataTaggedQueryKey<GetMembersMeArchivedNotificationsData>([base]),
        requestKey: (params: GetMembersMeArchivedNotificationsParams) =>
          dataTaggedQueryKey<GetMembersMeArchivedNotificationsData>([base, params]),
        request: ({ orgSlug, ...query }: GetMembersMeArchivedNotificationsParams, params: RequestParams = {}) =>
          this.request<GetMembersMeArchivedNotificationsData>({
            path: `/v1/organizations/${orgSlug}/members/me/archived_notifications`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostMembersMeDataExport
     * @request POST:/v1/organizations/{org_slug}/members/me/data_export
     */
    postMembersMeDataExport: () => {
      const base = 'POST:/v1/organizations/{org_slug}/members/me/data_export' as const

      return {
        baseKey: dataTaggedQueryKey<PostMembersMeDataExportData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostMembersMeDataExportData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<PostMembersMeDataExportData>({
            path: `/v1/organizations/${orgSlug}/members/me/data_export`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMembersMeForMeNotes
     * @request GET:/v1/organizations/{org_slug}/members/me/for_me_notes
     */
    getMembersMeForMeNotes: () => {
      const base = 'GET:/v1/organizations/{org_slug}/members/me/for_me_notes' as const

      return {
        baseKey: dataTaggedQueryKey<GetMembersMeForMeNotesData>([base]),
        requestKey: (params: GetMembersMeForMeNotesParams) =>
          dataTaggedQueryKey<GetMembersMeForMeNotesData>([base, params]),
        request: ({ orgSlug, ...query }: GetMembersMeForMeNotesParams, params: RequestParams = {}) =>
          this.request<GetMembersMeForMeNotesData>({
            path: `/v1/organizations/${orgSlug}/members/me/for_me_notes`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMembersMeForMePosts
     * @request GET:/v1/organizations/{org_slug}/members/me/for_me_posts
     */
    getMembersMeForMePosts: () => {
      const base = 'GET:/v1/organizations/{org_slug}/members/me/for_me_posts' as const

      return {
        baseKey: dataTaggedQueryKey<GetMembersMeForMePostsData>([base]),
        requestKey: (params: GetMembersMeForMePostsParams) =>
          dataTaggedQueryKey<GetMembersMeForMePostsData>([base, params]),
        request: ({ orgSlug, ...query }: GetMembersMeForMePostsParams, params: RequestParams = {}) =>
          this.request<GetMembersMeForMePostsData>({
            path: `/v1/organizations/${orgSlug}/members/me/for_me_posts`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutMembersMeIndexViews
     * @request PUT:/v1/organizations/{org_slug}/members/me/index_views
     */
    putMembersMeIndexViews: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/members/me/index_views' as const

      return {
        baseKey: dataTaggedQueryKey<PutMembersMeIndexViewsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PutMembersMeIndexViewsData>([base, orgSlug]),
        request: (
          orgSlug: string,
          data: OrganizationsOrgSlugMembersMeIndexViewsPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutMembersMeIndexViewsData>({
            path: `/v1/organizations/${orgSlug}/members/me/index_views`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMembersMePersonalCallRoom
     * @request GET:/v1/organizations/{org_slug}/members/me/personal_call_room
     */
    getMembersMePersonalCallRoom: () => {
      const base = 'GET:/v1/organizations/{org_slug}/members/me/personal_call_room' as const

      return {
        baseKey: dataTaggedQueryKey<GetMembersMePersonalCallRoomData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetMembersMePersonalCallRoomData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetMembersMePersonalCallRoomData>({
            path: `/v1/organizations/${orgSlug}/members/me/personal_call_room`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMembersMePersonalDraftPosts
     * @request GET:/v1/organizations/{org_slug}/members/me/personal_draft_posts
     */
    getMembersMePersonalDraftPosts: () => {
      const base = 'GET:/v1/organizations/{org_slug}/members/me/personal_draft_posts' as const

      return {
        baseKey: dataTaggedQueryKey<GetMembersMePersonalDraftPostsData>([base]),
        requestKey: (params: GetMembersMePersonalDraftPostsParams) =>
          dataTaggedQueryKey<GetMembersMePersonalDraftPostsData>([base, params]),
        request: ({ orgSlug, ...query }: GetMembersMePersonalDraftPostsParams, params: RequestParams = {}) =>
          this.request<GetMembersMePersonalDraftPostsData>({
            path: `/v1/organizations/${orgSlug}/members/me/personal_draft_posts`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutMembersProjectMembershipList
     * @request PUT:/v1/organizations/{org_slug}/members/{member_username}/project_membership_list
     */
    putMembersProjectMembershipList: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/members/{member_username}/project_membership_list' as const

      return {
        baseKey: dataTaggedQueryKey<PutMembersProjectMembershipListData>([base]),
        requestKey: (orgSlug: string, memberUsername: string) =>
          dataTaggedQueryKey<PutMembersProjectMembershipListData>([base, orgSlug, memberUsername]),
        request: (
          orgSlug: string,
          memberUsername: string,
          data: OrganizationsOrgSlugMembersMemberUsernameProjectMembershipListPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutMembersProjectMembershipListData>({
            path: `/v1/organizations/${orgSlug}/members/${memberUsername}/project_membership_list`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMembersProjectMemberships
     * @request GET:/v1/organizations/{org_slug}/members/{member_username}/project_memberships
     */
    getMembersProjectMemberships: () => {
      const base = 'GET:/v1/organizations/{org_slug}/members/{member_username}/project_memberships' as const

      return {
        baseKey: dataTaggedQueryKey<GetMembersProjectMembershipsData>([base]),
        requestKey: (orgSlug: string, memberUsername: string) =>
          dataTaggedQueryKey<GetMembersProjectMembershipsData>([base, orgSlug, memberUsername]),
        request: (orgSlug: string, memberUsername: string, params: RequestParams = {}) =>
          this.request<GetMembersProjectMembershipsData>({
            path: `/v1/organizations/${orgSlug}/members/${memberUsername}/project_memberships`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMembersMeSlackNotificationPreference
     * @request GET:/v1/organizations/{org_slug}/members/me/slack_notification_preference
     */
    getMembersMeSlackNotificationPreference: () => {
      const base = 'GET:/v1/organizations/{org_slug}/members/me/slack_notification_preference' as const

      return {
        baseKey: dataTaggedQueryKey<GetMembersMeSlackNotificationPreferenceData>([base]),
        requestKey: (orgSlug: string) =>
          dataTaggedQueryKey<GetMembersMeSlackNotificationPreferenceData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetMembersMeSlackNotificationPreferenceData>({
            path: `/v1/organizations/${orgSlug}/members/me/slack_notification_preference`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostMembersMeSlackNotificationPreference
     * @request POST:/v1/organizations/{org_slug}/members/me/slack_notification_preference
     */
    postMembersMeSlackNotificationPreference: () => {
      const base = 'POST:/v1/organizations/{org_slug}/members/me/slack_notification_preference' as const

      return {
        baseKey: dataTaggedQueryKey<PostMembersMeSlackNotificationPreferenceData>([base]),
        requestKey: (orgSlug: string) =>
          dataTaggedQueryKey<PostMembersMeSlackNotificationPreferenceData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<PostMembersMeSlackNotificationPreferenceData>({
            path: `/v1/organizations/${orgSlug}/members/me/slack_notification_preference`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteMembersMeSlackNotificationPreference
     * @request DELETE:/v1/organizations/{org_slug}/members/me/slack_notification_preference
     */
    deleteMembersMeSlackNotificationPreference: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/members/me/slack_notification_preference' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteMembersMeSlackNotificationPreferenceData>([base]),
        requestKey: (orgSlug: string) =>
          dataTaggedQueryKey<DeleteMembersMeSlackNotificationPreferenceData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<DeleteMembersMeSlackNotificationPreferenceData>({
            path: `/v1/organizations/${orgSlug}/members/me/slack_notification_preference`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMembersMeStatuses
     * @request GET:/v1/organizations/{org_slug}/members/me/statuses
     */
    getMembersMeStatuses: () => {
      const base = 'GET:/v1/organizations/{org_slug}/members/me/statuses' as const

      return {
        baseKey: dataTaggedQueryKey<GetMembersMeStatusesData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetMembersMeStatusesData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetMembersMeStatusesData>({
            path: `/v1/organizations/${orgSlug}/members/me/statuses`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostMembersMeStatuses
     * @request POST:/v1/organizations/{org_slug}/members/me/statuses
     */
    postMembersMeStatuses: () => {
      const base = 'POST:/v1/organizations/{org_slug}/members/me/statuses' as const

      return {
        baseKey: dataTaggedQueryKey<PostMembersMeStatusesData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostMembersMeStatusesData>([base, orgSlug]),
        request: (
          orgSlug: string,
          data: OrganizationsOrgSlugMembersMeStatusesPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostMembersMeStatusesData>({
            path: `/v1/organizations/${orgSlug}/members/me/statuses`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutMembersMeStatuses
     * @request PUT:/v1/organizations/{org_slug}/members/me/statuses
     */
    putMembersMeStatuses: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/members/me/statuses' as const

      return {
        baseKey: dataTaggedQueryKey<PutMembersMeStatusesData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PutMembersMeStatusesData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationsOrgSlugMembersMeStatusesPutRequest, params: RequestParams = {}) =>
          this.request<PutMembersMeStatusesData>({
            path: `/v1/organizations/${orgSlug}/members/me/statuses`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteMembersMeStatuses
     * @request DELETE:/v1/organizations/{org_slug}/members/me/statuses
     */
    deleteMembersMeStatuses: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/members/me/statuses' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteMembersMeStatusesData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<DeleteMembersMeStatusesData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<DeleteMembersMeStatusesData>({
            path: `/v1/organizations/${orgSlug}/members/me/statuses`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMembersMeViewerNotes
     * @request GET:/v1/organizations/{org_slug}/members/me/viewer_notes
     */
    getMembersMeViewerNotes: () => {
      const base = 'GET:/v1/organizations/{org_slug}/members/me/viewer_notes' as const

      return {
        baseKey: dataTaggedQueryKey<GetMembersMeViewerNotesData>([base]),
        requestKey: (params: GetMembersMeViewerNotesParams) =>
          dataTaggedQueryKey<GetMembersMeViewerNotesData>([base, params]),
        request: ({ orgSlug, ...query }: GetMembersMeViewerNotesParams, params: RequestParams = {}) =>
          this.request<GetMembersMeViewerNotesData>({
            path: `/v1/organizations/${orgSlug}/members/me/viewer_notes`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMembersMeViewerPosts
     * @request GET:/v1/organizations/{org_slug}/members/me/viewer_posts
     */
    getMembersMeViewerPosts: () => {
      const base = 'GET:/v1/organizations/{org_slug}/members/me/viewer_posts' as const

      return {
        baseKey: dataTaggedQueryKey<GetMembersMeViewerPostsData>([base]),
        requestKey: (params: GetMembersMeViewerPostsParams) =>
          dataTaggedQueryKey<GetMembersMeViewerPostsData>([base, params]),
        request: ({ orgSlug, ...query }: GetMembersMeViewerPostsParams, params: RequestParams = {}) =>
          this.request<GetMembersMeViewerPostsData>({
            path: `/v1/organizations/${orgSlug}/members/me/viewer_posts`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostBulkInvites
     * @request POST:/v1/organizations/{org_slug}/bulk_invites
     */
    postBulkInvites: () => {
      const base = 'POST:/v1/organizations/{org_slug}/bulk_invites' as const

      return {
        baseKey: dataTaggedQueryKey<PostBulkInvitesData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostBulkInvitesData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationBulkInvitesPostRequest, params: RequestParams = {}) =>
          this.request<PostBulkInvitesData>({
            path: `/v1/organizations/${orgSlug}/bulk_invites`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetFeatures
     * @request GET:/v1/organizations/{org_slug}/features
     */
    getFeatures: () => {
      const base = 'GET:/v1/organizations/{org_slug}/features' as const

      return {
        baseKey: dataTaggedQueryKey<GetFeaturesData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetFeaturesData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetFeaturesData>({
            path: `/v1/organizations/${orgSlug}/features`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostSsoConfiguration
     * @request POST:/v1/organizations/{org_slug}/sso/configuration
     */
    postSsoConfiguration: () => {
      const base = 'POST:/v1/organizations/{org_slug}/sso/configuration' as const

      return {
        baseKey: dataTaggedQueryKey<PostSsoConfigurationData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostSsoConfigurationData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<PostSsoConfigurationData>({
            path: `/v1/organizations/${orgSlug}/sso/configuration`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostSso
     * @request POST:/v1/organizations/{org_slug}/sso
     */
    postSso: () => {
      const base = 'POST:/v1/organizations/{org_slug}/sso' as const

      return {
        baseKey: dataTaggedQueryKey<PostSsoData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostSsoData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationSsoPostRequest, params: RequestParams = {}) =>
          this.request<PostSsoData>({
            path: `/v1/organizations/${orgSlug}/sso`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteSso
     * @request DELETE:/v1/organizations/{org_slug}/sso
     */
    deleteSso: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/sso' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteSsoData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<DeleteSsoData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<DeleteSsoData>({
            path: `/v1/organizations/${orgSlug}/sso`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostVerifiedDomainMemberships
     * @request POST:/v1/organizations/{org_slug}/verified_domain_memberships
     */
    postVerifiedDomainMemberships: () => {
      const base = 'POST:/v1/organizations/{org_slug}/verified_domain_memberships' as const

      return {
        baseKey: dataTaggedQueryKey<PostVerifiedDomainMembershipsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostVerifiedDomainMembershipsData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<PostVerifiedDomainMembershipsData>({
            path: `/v1/organizations/${orgSlug}/verified_domain_memberships`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetByOrgSlug
     * @request GET:/v1/organizations/{org_slug}
     */
    getByOrgSlug: () => {
      const base = 'GET:/v1/organizations/{org_slug}' as const

      return {
        baseKey: dataTaggedQueryKey<GetByOrgSlugData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetByOrgSlugData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetByOrgSlugData>({
            path: `/v1/organizations/${orgSlug}`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutByOrgSlug
     * @request PUT:/v1/organizations/{org_slug}
     */
    putByOrgSlug: () => {
      const base = 'PUT:/v1/organizations/{org_slug}' as const

      return {
        baseKey: dataTaggedQueryKey<PutByOrgSlugData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PutByOrgSlugData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationsOrgSlugPutRequest, params: RequestParams = {}) =>
          this.request<PutByOrgSlugData>({
            path: `/v1/organizations/${orgSlug}`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteByOrgSlug
     * @request DELETE:/v1/organizations/{org_slug}
     */
    deleteByOrgSlug: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteByOrgSlugData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<DeleteByOrgSlugData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<DeleteByOrgSlugData>({
            path: `/v1/organizations/${orgSlug}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostOrganizations
     * @request POST:/v1/organizations
     */
    postOrganizations: () => {
      const base = 'POST:/v1/organizations' as const

      return {
        baseKey: dataTaggedQueryKey<PostOrganizationsData>([base]),
        requestKey: () => dataTaggedQueryKey<PostOrganizationsData>([base]),
        request: (data: OrganizationsPostRequest, params: RequestParams = {}) =>
          this.request<PostOrganizationsData>({
            path: `/v1/organizations`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PatchResetInviteToken
     * @request PATCH:/v1/organizations/{org_slug}/reset-invite-token
     */
    patchResetInviteToken: () => {
      const base = 'PATCH:/v1/organizations/{org_slug}/reset-invite-token' as const

      return {
        baseKey: dataTaggedQueryKey<PatchResetInviteTokenData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PatchResetInviteTokenData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<PatchResetInviteTokenData>({
            path: `/v1/organizations/${orgSlug}/reset-invite-token`,
            method: 'PATCH',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostJoinByToken
     * @request POST:/v1/organizations/{org_slug}/join/{token}
     */
    postJoinByToken: () => {
      const base = 'POST:/v1/organizations/{org_slug}/join/{token}' as const

      return {
        baseKey: dataTaggedQueryKey<PostJoinByTokenData>([base]),
        requestKey: (orgSlug: string, token: string) => dataTaggedQueryKey<PostJoinByTokenData>([base, orgSlug, token]),
        request: (orgSlug: string, token: string, params: RequestParams = {}) =>
          this.request<PostJoinByTokenData>({
            path: `/v1/organizations/${orgSlug}/join/${token}`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutOnboard
     * @request PUT:/v1/organizations/{org_slug}/onboard
     */
    putOnboard: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/onboard' as const

      return {
        baseKey: dataTaggedQueryKey<PutOnboardData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PutOnboardData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<PutOnboardData>({
            path: `/v1/organizations/${orgSlug}/onboard`,
            method: 'PUT',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetAvatarPresignedFields
     * @request GET:/v1/organizations/{org_slug}/avatar/presigned-fields
     */
    getAvatarPresignedFields: () => {
      const base = 'GET:/v1/organizations/{org_slug}/avatar/presigned-fields' as const

      return {
        baseKey: dataTaggedQueryKey<GetAvatarPresignedFieldsData>([base]),
        requestKey: (params: GetAvatarPresignedFieldsParams) =>
          dataTaggedQueryKey<GetAvatarPresignedFieldsData>([base, params]),
        request: ({ orgSlug, ...query }: GetAvatarPresignedFieldsParams, params: RequestParams = {}) =>
          this.request<GetAvatarPresignedFieldsData>({
            path: `/v1/organizations/${orgSlug}/avatar/presigned-fields`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeletePinsById
     * @request DELETE:/v1/organizations/{org_slug}/pins/{id}
     */
    deletePinsById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/pins/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeletePinsByIdData>([base]),
        requestKey: (orgSlug: string, id: string) => dataTaggedQueryKey<DeletePinsByIdData>([base, orgSlug, id]),
        request: (orgSlug: string, id: string, params: RequestParams = {}) =>
          this.request<DeletePinsByIdData>({
            path: `/v1/organizations/${orgSlug}/pins/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetPostsAttachmentsComments
     * @request GET:/v1/organizations/{org_slug}/posts/{post_id}/attachments/{attachment_id}/comments
     */
    getPostsAttachmentsComments: () => {
      const base = 'GET:/v1/organizations/{org_slug}/posts/{post_id}/attachments/{attachment_id}/comments' as const

      return {
        baseKey: dataTaggedQueryKey<GetPostsAttachmentsCommentsData>([base]),
        requestKey: (params: GetPostsAttachmentsCommentsParams) =>
          dataTaggedQueryKey<GetPostsAttachmentsCommentsData>([base, params]),
        request: (
          { orgSlug, postId, attachmentId, ...query }: GetPostsAttachmentsCommentsParams,
          params: RequestParams = {}
        ) =>
          this.request<GetPostsAttachmentsCommentsData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/attachments/${attachmentId}/comments`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutPostsAttachmentsReorder
     * @request PUT:/v1/organizations/{org_slug}/posts/{post_id}/attachments/reorder
     */
    putPostsAttachmentsReorder: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/posts/{post_id}/attachments/reorder' as const

      return {
        baseKey: dataTaggedQueryKey<PutPostsAttachmentsReorderData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PutPostsAttachmentsReorderData>([base, orgSlug, postId]),
        request: (
          orgSlug: string,
          postId: string,
          data: OrganizationsOrgSlugPostsPostIdAttachmentsReorderPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutPostsAttachmentsReorderData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/attachments/reorder`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsAttachments
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/attachments
     */
    postPostsAttachments: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts/{post_id}/attachments' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsAttachmentsData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PostPostsAttachmentsData>([base, orgSlug, postId]),
        request: (
          orgSlug: string,
          postId: string,
          data: OrganizationPostAttachmentsPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostPostsAttachmentsData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/attachments`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutPostsAttachmentsById
     * @request PUT:/v1/organizations/{org_slug}/posts/{post_id}/attachments/{id}
     */
    putPostsAttachmentsById: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/posts/{post_id}/attachments/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<PutPostsAttachmentsByIdData>([base]),
        requestKey: (orgSlug: string, postId: string, id: string) =>
          dataTaggedQueryKey<PutPostsAttachmentsByIdData>([base, orgSlug, postId, id]),
        request: (
          orgSlug: string,
          postId: string,
          id: string,
          data: OrganizationsOrgSlugPostsPostIdAttachmentsIdPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutPostsAttachmentsByIdData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/attachments/${id}`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeletePostsAttachmentsById
     * @request DELETE:/v1/organizations/{org_slug}/posts/{post_id}/attachments/{id}
     */
    deletePostsAttachmentsById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/posts/{post_id}/attachments/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeletePostsAttachmentsByIdData>([base]),
        requestKey: (orgSlug: string, postId: string, id: string) =>
          dataTaggedQueryKey<DeletePostsAttachmentsByIdData>([base, orgSlug, postId, id]),
        request: (orgSlug: string, postId: string, id: string, params: RequestParams = {}) =>
          this.request<DeletePostsAttachmentsByIdData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/attachments/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsFavorite
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/favorite
     */
    postPostsFavorite: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts/{post_id}/favorite' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsFavoriteData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PostPostsFavoriteData>([base, orgSlug, postId]),
        request: (orgSlug: string, postId: string, params: RequestParams = {}) =>
          this.request<PostPostsFavoriteData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/favorite`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeletePostsFavorite
     * @request DELETE:/v1/organizations/{org_slug}/posts/{post_id}/favorite
     */
    deletePostsFavorite: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/posts/{post_id}/favorite' as const

      return {
        baseKey: dataTaggedQueryKey<DeletePostsFavoriteData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<DeletePostsFavoriteData>([base, orgSlug, postId]),
        request: (orgSlug: string, postId: string, params: RequestParams = {}) =>
          this.request<DeletePostsFavoriteData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/favorite`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsFeedbackDismissals
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/feedback-dismissals
     */
    postPostsFeedbackDismissals: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts/{post_id}/feedback-dismissals' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsFeedbackDismissalsData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PostPostsFeedbackDismissalsData>([base, orgSlug, postId]),
        request: (orgSlug: string, postId: string, params: RequestParams = {}) =>
          this.request<PostPostsFeedbackDismissalsData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/feedback-dismissals`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsFollowUp
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/follow_up
     */
    postPostsFollowUp: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts/{post_id}/follow_up' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsFollowUpData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PostPostsFollowUpData>([base, orgSlug, postId]),
        request: (
          orgSlug: string,
          postId: string,
          data: OrganizationPostFollowUpPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostPostsFollowUpData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/follow_up`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetPostsGeneratedResolution
     * @request GET:/v1/organizations/{org_slug}/posts/{post_id}/generated_resolution
     */
    getPostsGeneratedResolution: () => {
      const base = 'GET:/v1/organizations/{org_slug}/posts/{post_id}/generated_resolution' as const

      return {
        baseKey: dataTaggedQueryKey<GetPostsGeneratedResolutionData>([base]),
        requestKey: (params: GetPostsGeneratedResolutionParams) =>
          dataTaggedQueryKey<GetPostsGeneratedResolutionData>([base, params]),
        request: ({ orgSlug, postId, ...query }: GetPostsGeneratedResolutionParams, params: RequestParams = {}) =>
          this.request<GetPostsGeneratedResolutionData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/generated_resolution`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetPostsGeneratedTldr
     * @request GET:/v1/organizations/{org_slug}/posts/{post_id}/generated_tldr
     */
    getPostsGeneratedTldr: () => {
      const base = 'GET:/v1/organizations/{org_slug}/posts/{post_id}/generated_tldr' as const

      return {
        baseKey: dataTaggedQueryKey<GetPostsGeneratedTldrData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<GetPostsGeneratedTldrData>([base, orgSlug, postId]),
        request: (orgSlug: string, postId: string, params: RequestParams = {}) =>
          this.request<GetPostsGeneratedTldrData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/generated_tldr`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsLinearIssues
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/linear_issues
     */
    postPostsLinearIssues: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts/{post_id}/linear_issues' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsLinearIssuesData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PostPostsLinearIssuesData>([base, orgSlug, postId]),
        request: (
          orgSlug: string,
          postId: string,
          data: OrganizationPostLinearIssuesPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostPostsLinearIssuesData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/linear_issues`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetPostsLinearTimelineEvents
     * @request GET:/v1/organizations/{org_slug}/posts/{post_id}/linear_timeline_events
     */
    getPostsLinearTimelineEvents: () => {
      const base = 'GET:/v1/organizations/{org_slug}/posts/{post_id}/linear_timeline_events' as const

      return {
        baseKey: dataTaggedQueryKey<GetPostsLinearTimelineEventsData>([base]),
        requestKey: (params: GetPostsLinearTimelineEventsParams) =>
          dataTaggedQueryKey<GetPostsLinearTimelineEventsData>([base, params]),
        request: ({ orgSlug, postId, ...query }: GetPostsLinearTimelineEventsParams, params: RequestParams = {}) =>
          this.request<GetPostsLinearTimelineEventsData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/linear_timeline_events`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsPin
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/pin
     */
    postPostsPin: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts/{post_id}/pin' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsPinData>([base]),
        requestKey: (orgSlug: string, postId: string) => dataTaggedQueryKey<PostPostsPinData>([base, orgSlug, postId]),
        request: (orgSlug: string, postId: string, params: RequestParams = {}) =>
          this.request<PostPostsPinData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/pin`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsPoll2OptionsVote
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/poll2/options/{option_id}/vote
     */
    postPostsPoll2OptionsVote: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts/{post_id}/poll2/options/{option_id}/vote' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsPoll2OptionsVoteData>([base]),
        requestKey: (orgSlug: string, postId: string, optionId: string) =>
          dataTaggedQueryKey<PostPostsPoll2OptionsVoteData>([base, orgSlug, postId, optionId]),
        request: (orgSlug: string, postId: string, optionId: string, params: RequestParams = {}) =>
          this.request<PostPostsPoll2OptionsVoteData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/poll2/options/${optionId}/vote`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsPoll2
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/poll2
     */
    postPostsPoll2: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts/{post_id}/poll2' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsPoll2Data>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PostPostsPoll2Data>([base, orgSlug, postId]),
        request: (
          orgSlug: string,
          postId: string,
          data: OrganizationsOrgSlugPostsPostIdPoll2PostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostPostsPoll2Data>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/poll2`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutPostsPoll2
     * @request PUT:/v1/organizations/{org_slug}/posts/{post_id}/poll2
     */
    putPostsPoll2: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/posts/{post_id}/poll2' as const

      return {
        baseKey: dataTaggedQueryKey<PutPostsPoll2Data>([base]),
        requestKey: (orgSlug: string, postId: string) => dataTaggedQueryKey<PutPostsPoll2Data>([base, orgSlug, postId]),
        request: (
          orgSlug: string,
          postId: string,
          data: OrganizationsOrgSlugPostsPostIdPoll2PutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutPostsPoll2Data>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/poll2`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeletePostsPoll2
     * @request DELETE:/v1/organizations/{org_slug}/posts/{post_id}/poll2
     */
    deletePostsPoll2: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/posts/{post_id}/poll2' as const

      return {
        baseKey: dataTaggedQueryKey<DeletePostsPoll2Data>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<DeletePostsPoll2Data>([base, orgSlug, postId]),
        request: (orgSlug: string, postId: string, params: RequestParams = {}) =>
          this.request<DeletePostsPoll2Data>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/poll2`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetPostsCanvasComments
     * @request GET:/v1/organizations/{org_slug}/posts/{post_id}/canvas_comments
     */
    getPostsCanvasComments: () => {
      const base = 'GET:/v1/organizations/{org_slug}/posts/{post_id}/canvas_comments' as const

      return {
        baseKey: dataTaggedQueryKey<GetPostsCanvasCommentsData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<GetPostsCanvasCommentsData>([base, orgSlug, postId]),
        request: (orgSlug: string, postId: string, params: RequestParams = {}) =>
          this.request<GetPostsCanvasCommentsData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/canvas_comments`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetPostsComments
     * @request GET:/v1/organizations/{org_slug}/posts/{post_id}/comments
     */
    getPostsComments: () => {
      const base = 'GET:/v1/organizations/{org_slug}/posts/{post_id}/comments' as const

      return {
        baseKey: dataTaggedQueryKey<GetPostsCommentsData>([base]),
        requestKey: (params: GetPostsCommentsParams) => dataTaggedQueryKey<GetPostsCommentsData>([base, params]),
        request: ({ orgSlug, postId, ...query }: GetPostsCommentsParams, params: RequestParams = {}) =>
          this.request<GetPostsCommentsData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/comments`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsComments2
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/comments2
     */
    postPostsComments2: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts/{post_id}/comments2' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsComments2Data>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PostPostsComments2Data>([base, orgSlug, postId]),
        request: (
          orgSlug: string,
          postId: string,
          data: OrganizationPostComments2PostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostPostsComments2Data>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/comments2`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsFeedbackRequests
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/feedback_requests
     */
    postPostsFeedbackRequests: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts/{post_id}/feedback_requests' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsFeedbackRequestsData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PostPostsFeedbackRequestsData>([base, orgSlug, postId]),
        request: (
          orgSlug: string,
          postId: string,
          data: OrganizationPostFeedbackRequestsPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostPostsFeedbackRequestsData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/feedback_requests`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeletePostsFeedbackRequestsById
     * @request DELETE:/v1/organizations/{org_slug}/posts/{post_id}/feedback_requests/{id}
     */
    deletePostsFeedbackRequestsById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/posts/{post_id}/feedback_requests/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeletePostsFeedbackRequestsByIdData>([base]),
        requestKey: (orgSlug: string, postId: string, id: string) =>
          dataTaggedQueryKey<DeletePostsFeedbackRequestsByIdData>([base, orgSlug, postId, id]),
        request: (orgSlug: string, postId: string, id: string, params: RequestParams = {}) =>
          this.request<DeletePostsFeedbackRequestsByIdData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/feedback_requests/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsFeedbackRequestsDismissal
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/feedback_requests/{feedback_request_id}/dismissal
     */
    postPostsFeedbackRequestsDismissal: () => {
      const base =
        'POST:/v1/organizations/{org_slug}/posts/{post_id}/feedback_requests/{feedback_request_id}/dismissal' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsFeedbackRequestsDismissalData>([base]),
        requestKey: (orgSlug: string, postId: string, feedbackRequestId: string) =>
          dataTaggedQueryKey<PostPostsFeedbackRequestsDismissalData>([base, orgSlug, postId, feedbackRequestId]),
        request: (orgSlug: string, postId: string, feedbackRequestId: string, params: RequestParams = {}) =>
          this.request<PostPostsFeedbackRequestsDismissalData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/feedback_requests/${feedbackRequestId}/dismissal`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsLinks
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/links
     */
    postPostsLinks: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts/{post_id}/links' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsLinksData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PostPostsLinksData>([base, orgSlug, postId]),
        request: (
          orgSlug: string,
          postId: string,
          data: OrganizationPostLinksPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostPostsLinksData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/links`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsReactions
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/reactions
     */
    postPostsReactions: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts/{post_id}/reactions' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsReactionsData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PostPostsReactionsData>([base, orgSlug, postId]),
        request: (
          orgSlug: string,
          postId: string,
          data: OrganizationPostReactionsPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostPostsReactionsData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/reactions`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetPostsVersions
     * @request GET:/v1/organizations/{org_slug}/posts/{post_id}/versions
     */
    getPostsVersions: () => {
      const base = 'GET:/v1/organizations/{org_slug}/posts/{post_id}/versions' as const

      return {
        baseKey: dataTaggedQueryKey<GetPostsVersionsData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<GetPostsVersionsData>([base, orgSlug, postId]),
        request: (orgSlug: string, postId: string, params: RequestParams = {}) =>
          this.request<GetPostsVersionsData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/versions`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsVersions
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/versions
     */
    postPostsVersions: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts/{post_id}/versions' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsVersionsData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PostPostsVersionsData>([base, orgSlug, postId]),
        request: (orgSlug: string, postId: string, params: RequestParams = {}) =>
          this.request<PostPostsVersionsData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/versions`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetPostsViews
     * @request GET:/v1/organizations/{org_slug}/posts/{post_id}/views
     */
    getPostsViews: () => {
      const base = 'GET:/v1/organizations/{org_slug}/posts/{post_id}/views' as const

      return {
        baseKey: dataTaggedQueryKey<GetPostsViewsData>([base]),
        requestKey: (params: GetPostsViewsParams) => dataTaggedQueryKey<GetPostsViewsData>([base, params]),
        request: ({ orgSlug, postId, ...query }: GetPostsViewsParams, params: RequestParams = {}) =>
          this.request<GetPostsViewsData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/views`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsViews
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/views
     */
    postPostsViews: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts/{post_id}/views' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsViewsData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PostPostsViewsData>([base, orgSlug, postId]),
        request: (
          orgSlug: string,
          postId: string,
          data: OrganizationsOrgSlugPostsPostIdViewsPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostPostsViewsData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/views`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsPublication
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/publication
     */
    postPostsPublication: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts/{post_id}/publication' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsPublicationData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PostPostsPublicationData>([base, orgSlug, postId]),
        request: (orgSlug: string, postId: string, params: RequestParams = {}) =>
          this.request<PostPostsPublicationData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/publication`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsResolution
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/resolution
     */
    postPostsResolution: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts/{post_id}/resolution' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsResolutionData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PostPostsResolutionData>([base, orgSlug, postId]),
        request: (
          orgSlug: string,
          postId: string,
          data: OrganizationsOrgSlugPostsPostIdResolutionPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostPostsResolutionData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/resolution`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeletePostsResolution
     * @request DELETE:/v1/organizations/{org_slug}/posts/{post_id}/resolution
     */
    deletePostsResolution: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/posts/{post_id}/resolution' as const

      return {
        baseKey: dataTaggedQueryKey<DeletePostsResolutionData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<DeletePostsResolutionData>([base, orgSlug, postId]),
        request: (orgSlug: string, postId: string, params: RequestParams = {}) =>
          this.request<DeletePostsResolutionData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/resolution`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetPostsSeoInfo
     * @request GET:/v1/organizations/{org_slug}/posts/{post_id}/seo_info
     */
    getPostsSeoInfo: () => {
      const base = 'GET:/v1/organizations/{org_slug}/posts/{post_id}/seo_info' as const

      return {
        baseKey: dataTaggedQueryKey<GetPostsSeoInfoData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<GetPostsSeoInfoData>([base, orgSlug, postId]),
        request: (orgSlug: string, postId: string, params: RequestParams = {}) =>
          this.request<GetPostsSeoInfoData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/seo_info`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsShares
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/shares
     */
    postPostsShares: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts/{post_id}/shares' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsSharesData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PostPostsSharesData>([base, orgSlug, postId]),
        request: (
          orgSlug: string,
          postId: string,
          data: OrganizationPostSharesPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostPostsSharesData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/shares`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutPostsStatus
     * @request PUT:/v1/organizations/{org_slug}/posts/{post_id}/status
     */
    putPostsStatus: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/posts/{post_id}/status' as const

      return {
        baseKey: dataTaggedQueryKey<PutPostsStatusData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PutPostsStatusData>([base, orgSlug, postId]),
        request: (
          orgSlug: string,
          postId: string,
          data: OrganizationsOrgSlugPostsPostIdStatusPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutPostsStatusData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/status`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutPostsTasks
     * @request PUT:/v1/organizations/{org_slug}/posts/{post_id}/tasks
     */
    putPostsTasks: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/posts/{post_id}/tasks' as const

      return {
        baseKey: dataTaggedQueryKey<PutPostsTasksData>([base]),
        requestKey: (orgSlug: string, postId: string) => dataTaggedQueryKey<PutPostsTasksData>([base, orgSlug, postId]),
        request: (
          orgSlug: string,
          postId: string,
          data: OrganizationsOrgSlugPostsPostIdTasksPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutPostsTasksData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/tasks`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetPostsTimelineEvents
     * @request GET:/v1/organizations/{org_slug}/posts/{post_id}/timeline_events
     */
    getPostsTimelineEvents: () => {
      const base = 'GET:/v1/organizations/{org_slug}/posts/{post_id}/timeline_events' as const

      return {
        baseKey: dataTaggedQueryKey<GetPostsTimelineEventsData>([base]),
        requestKey: (params: GetPostsTimelineEventsParams) =>
          dataTaggedQueryKey<GetPostsTimelineEventsData>([base, params]),
        request: ({ orgSlug, postId, ...query }: GetPostsTimelineEventsParams, params: RequestParams = {}) =>
          this.request<GetPostsTimelineEventsData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/timeline_events`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutPostsVisibility
     * @request PUT:/v1/organizations/{org_slug}/posts/{post_id}/visibility
     */
    putPostsVisibility: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/posts/{post_id}/visibility' as const

      return {
        baseKey: dataTaggedQueryKey<any>([base]),
        requestKey: (orgSlug: string, postId: string) => dataTaggedQueryKey<any>([base, orgSlug, postId]),
        request: (
          orgSlug: string,
          postId: string,
          data: OrganizationsOrgSlugPostsPostIdVisibilityPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<any>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/visibility`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetPostsPollOptionsVoters
     * @request GET:/v1/organizations/{org_slug}/posts/{post_id}/poll_options/{poll_option_id}/voters
     */
    getPostsPollOptionsVoters: () => {
      const base = 'GET:/v1/organizations/{org_slug}/posts/{post_id}/poll_options/{poll_option_id}/voters' as const

      return {
        baseKey: dataTaggedQueryKey<GetPostsPollOptionsVotersData>([base]),
        requestKey: (params: GetPostsPollOptionsVotersParams) =>
          dataTaggedQueryKey<GetPostsPollOptionsVotersData>([base, params]),
        request: (
          { orgSlug, postId, pollOptionId, ...query }: GetPostsPollOptionsVotersParams,
          params: RequestParams = {}
        ) =>
          this.request<GetPostsPollOptionsVotersData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/poll_options/${pollOptionId}/voters`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetPosts
     * @request GET:/v1/organizations/{org_slug}/posts
     */
    getPosts: () => {
      const base = 'GET:/v1/organizations/{org_slug}/posts' as const

      return {
        baseKey: dataTaggedQueryKey<GetPostsData>([base]),
        requestKey: (params: GetPostsParams) => dataTaggedQueryKey<GetPostsData>([base, params]),
        request: ({ orgSlug, ...query }: GetPostsParams, params: RequestParams = {}) =>
          this.request<GetPostsData>({
            path: `/v1/organizations/${orgSlug}/posts`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPosts
     * @request POST:/v1/organizations/{org_slug}/posts
     */
    postPosts: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostPostsData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationsOrgSlugPostsPostRequest, params: RequestParams = {}) =>
          this.request<PostPostsData>({
            path: `/v1/organizations/${orgSlug}/posts`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetPostsByPostId
     * @request GET:/v1/organizations/{org_slug}/posts/{post_id}
     */
    getPostsByPostId: () => {
      const base = 'GET:/v1/organizations/{org_slug}/posts/{post_id}' as const

      return {
        baseKey: dataTaggedQueryKey<GetPostsByPostIdData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<GetPostsByPostIdData>([base, orgSlug, postId]),
        request: (orgSlug: string, postId: string, params: RequestParams = {}) =>
          this.request<GetPostsByPostIdData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutPostsByPostId
     * @request PUT:/v1/organizations/{org_slug}/posts/{post_id}
     */
    putPostsByPostId: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/posts/{post_id}' as const

      return {
        baseKey: dataTaggedQueryKey<PutPostsByPostIdData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PutPostsByPostIdData>([base, orgSlug, postId]),
        request: (
          orgSlug: string,
          postId: string,
          data: OrganizationsOrgSlugPostsPostIdPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutPostsByPostIdData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeletePostsByPostId
     * @request DELETE:/v1/organizations/{org_slug}/posts/{post_id}
     */
    deletePostsByPostId: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/posts/{post_id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeletePostsByPostIdData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<DeletePostsByPostIdData>([base, orgSlug, postId]),
        request: (orgSlug: string, postId: string, params: RequestParams = {}) =>
          this.request<DeletePostsByPostIdData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostPostsSubscribe
     * @request POST:/v1/organizations/{org_slug}/posts/{post_id}/subscribe
     */
    postPostsSubscribe: () => {
      const base = 'POST:/v1/organizations/{org_slug}/posts/{post_id}/subscribe' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsSubscribeData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<PostPostsSubscribeData>([base, orgSlug, postId]),
        request: (orgSlug: string, postId: string, params: RequestParams = {}) =>
          this.request<PostPostsSubscribeData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/subscribe`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeletePostsUnsubscribe
     * @request DELETE:/v1/organizations/{org_slug}/posts/{post_id}/unsubscribe
     */
    deletePostsUnsubscribe: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/posts/{post_id}/unsubscribe' as const

      return {
        baseKey: dataTaggedQueryKey<DeletePostsUnsubscribeData>([base]),
        requestKey: (orgSlug: string, postId: string) =>
          dataTaggedQueryKey<DeletePostsUnsubscribeData>([base, orgSlug, postId]),
        request: (orgSlug: string, postId: string, params: RequestParams = {}) =>
          this.request<DeletePostsUnsubscribeData>({
            path: `/v1/organizations/${orgSlug}/posts/${postId}/unsubscribe`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetPostsPresignedFields
     * @request GET:/v1/organizations/{org_slug}/posts/presigned-fields
     */
    getPostsPresignedFields: () => {
      const base = 'GET:/v1/organizations/{org_slug}/posts/presigned-fields' as const

      return {
        baseKey: dataTaggedQueryKey<GetPostsPresignedFieldsData>([base]),
        requestKey: (params: GetPostsPresignedFieldsParams) =>
          dataTaggedQueryKey<GetPostsPresignedFieldsData>([base, params]),
        request: ({ orgSlug, ...query }: GetPostsPresignedFieldsParams, params: RequestParams = {}) =>
          this.request<GetPostsPresignedFieldsData>({
            path: `/v1/organizations/${orgSlug}/posts/presigned-fields`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutProjectMembershipsReorder
     * @request PUT:/v1/organizations/{org_slug}/project_memberships/reorder
     */
    putProjectMembershipsReorder: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/project_memberships/reorder' as const

      return {
        baseKey: dataTaggedQueryKey<PutProjectMembershipsReorderData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PutProjectMembershipsReorderData>([base, orgSlug]),
        request: (
          orgSlug: string,
          data: OrganizationsOrgSlugProjectMembershipsReorderPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutProjectMembershipsReorderData>({
            path: `/v1/organizations/${orgSlug}/project_memberships/reorder`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetProjectMemberships
     * @request GET:/v1/organizations/{org_slug}/project_memberships
     */
    getProjectMemberships: () => {
      const base = 'GET:/v1/organizations/{org_slug}/project_memberships' as const

      return {
        baseKey: dataTaggedQueryKey<GetProjectMembershipsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetProjectMembershipsData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetProjectMembershipsData>({
            path: `/v1/organizations/${orgSlug}/project_memberships`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetProjectsAddableMembers
     * @request GET:/v1/organizations/{org_slug}/projects/{project_id}/addable_members
     */
    getProjectsAddableMembers: () => {
      const base = 'GET:/v1/organizations/{org_slug}/projects/{project_id}/addable_members' as const

      return {
        baseKey: dataTaggedQueryKey<GetProjectsAddableMembersData>([base]),
        requestKey: (params: GetProjectsAddableMembersParams) =>
          dataTaggedQueryKey<GetProjectsAddableMembersData>([base, params]),
        request: ({ orgSlug, projectId, ...query }: GetProjectsAddableMembersParams, params: RequestParams = {}) =>
          this.request<GetProjectsAddableMembersData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/addable_members`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetProjectsBookmarks
     * @request GET:/v1/organizations/{org_slug}/projects/{project_id}/bookmarks
     */
    getProjectsBookmarks: () => {
      const base = 'GET:/v1/organizations/{org_slug}/projects/{project_id}/bookmarks' as const

      return {
        baseKey: dataTaggedQueryKey<GetProjectsBookmarksData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<GetProjectsBookmarksData>([base, orgSlug, projectId]),
        request: (orgSlug: string, projectId: string, params: RequestParams = {}) =>
          this.request<GetProjectsBookmarksData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/bookmarks`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostProjectsBookmarks
     * @request POST:/v1/organizations/{org_slug}/projects/{project_id}/bookmarks
     */
    postProjectsBookmarks: () => {
      const base = 'POST:/v1/organizations/{org_slug}/projects/{project_id}/bookmarks' as const

      return {
        baseKey: dataTaggedQueryKey<PostProjectsBookmarksData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<PostProjectsBookmarksData>([base, orgSlug, projectId]),
        request: (
          orgSlug: string,
          projectId: string,
          data: OrganizationsOrgSlugProjectsProjectIdBookmarksPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostProjectsBookmarksData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/bookmarks`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PatchProjectsBookmarksById
     * @request PATCH:/v1/organizations/{org_slug}/projects/{project_id}/bookmarks/{id}
     */
    patchProjectsBookmarksById: () => {
      const base = 'PATCH:/v1/organizations/{org_slug}/projects/{project_id}/bookmarks/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<PatchProjectsBookmarksByIdData>([base]),
        requestKey: (orgSlug: string, projectId: string, id: string) =>
          dataTaggedQueryKey<PatchProjectsBookmarksByIdData>([base, orgSlug, projectId, id]),
        request: (
          orgSlug: string,
          projectId: string,
          id: string,
          data: OrganizationsOrgSlugProjectsProjectIdBookmarksIdPatchRequest,
          params: RequestParams = {}
        ) =>
          this.request<PatchProjectsBookmarksByIdData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/bookmarks/${id}`,
            method: 'PATCH',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteProjectsBookmarksById
     * @request DELETE:/v1/organizations/{org_slug}/projects/{project_id}/bookmarks/{id}
     */
    deleteProjectsBookmarksById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/projects/{project_id}/bookmarks/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteProjectsBookmarksByIdData>([base]),
        requestKey: (orgSlug: string, projectId: string, id: string) =>
          dataTaggedQueryKey<DeleteProjectsBookmarksByIdData>([base, orgSlug, projectId, id]),
        request: (orgSlug: string, projectId: string, id: string, params: RequestParams = {}) =>
          this.request<DeleteProjectsBookmarksByIdData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/bookmarks/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutProjectsBookmarksReorder
     * @request PUT:/v1/organizations/{org_slug}/projects/{project_id}/bookmarks/reorder
     */
    putProjectsBookmarksReorder: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/projects/{project_id}/bookmarks/reorder' as const

      return {
        baseKey: dataTaggedQueryKey<PutProjectsBookmarksReorderData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<PutProjectsBookmarksReorderData>([base, orgSlug, projectId]),
        request: (
          orgSlug: string,
          projectId: string,
          data: OrganizationProjectBookmarksReorderPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutProjectsBookmarksReorderData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/bookmarks/reorder`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetProjectsCalls
     * @request GET:/v1/organizations/{org_slug}/projects/{project_id}/calls
     */
    getProjectsCalls: () => {
      const base = 'GET:/v1/organizations/{org_slug}/projects/{project_id}/calls' as const

      return {
        baseKey: dataTaggedQueryKey<GetProjectsCallsData>([base]),
        requestKey: (params: GetProjectsCallsParams) => dataTaggedQueryKey<GetProjectsCallsData>([base, params]),
        request: ({ orgSlug, projectId, ...query }: GetProjectsCallsParams, params: RequestParams = {}) =>
          this.request<GetProjectsCallsData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/calls`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostProjectsDataExports
     * @request POST:/v1/organizations/{org_slug}/projects/{project_id}/data_exports
     */
    postProjectsDataExports: () => {
      const base = 'POST:/v1/organizations/{org_slug}/projects/{project_id}/data_exports' as const

      return {
        baseKey: dataTaggedQueryKey<PostProjectsDataExportsData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<PostProjectsDataExportsData>([base, orgSlug, projectId]),
        request: (orgSlug: string, projectId: string, params: RequestParams = {}) =>
          this.request<PostProjectsDataExportsData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/data_exports`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutProjectsDisplayPreferences
     * @request PUT:/v1/organizations/{org_slug}/projects/{project_id}/display_preferences
     */
    putProjectsDisplayPreferences: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/projects/{project_id}/display_preferences' as const

      return {
        baseKey: dataTaggedQueryKey<PutProjectsDisplayPreferencesData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<PutProjectsDisplayPreferencesData>([base, orgSlug, projectId]),
        request: (
          orgSlug: string,
          projectId: string,
          data: OrganizationsOrgSlugProjectsProjectIdDisplayPreferencesPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutProjectsDisplayPreferencesData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/display_preferences`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostProjectsFavorites
     * @request POST:/v1/organizations/{org_slug}/projects/{project_id}/favorites
     */
    postProjectsFavorites: () => {
      const base = 'POST:/v1/organizations/{org_slug}/projects/{project_id}/favorites' as const

      return {
        baseKey: dataTaggedQueryKey<PostProjectsFavoritesData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<PostProjectsFavoritesData>([base, orgSlug, projectId]),
        request: (orgSlug: string, projectId: string, params: RequestParams = {}) =>
          this.request<PostProjectsFavoritesData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/favorites`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteProjectsFavorites
     * @request DELETE:/v1/organizations/{org_slug}/projects/{project_id}/favorites
     */
    deleteProjectsFavorites: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/projects/{project_id}/favorites' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteProjectsFavoritesData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<DeleteProjectsFavoritesData>([base, orgSlug, projectId]),
        request: (orgSlug: string, projectId: string, params: RequestParams = {}) =>
          this.request<DeleteProjectsFavoritesData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/favorites`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostProjectsInvitationUrlAcceptances
     * @request POST:/v1/organizations/{org_slug}/projects/{project_id}/invitation_url_acceptances
     */
    postProjectsInvitationUrlAcceptances: () => {
      const base = 'POST:/v1/organizations/{org_slug}/projects/{project_id}/invitation_url_acceptances' as const

      return {
        baseKey: dataTaggedQueryKey<PostProjectsInvitationUrlAcceptancesData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<PostProjectsInvitationUrlAcceptancesData>([base, orgSlug, projectId]),
        request: (
          orgSlug: string,
          projectId: string,
          data: OrganizationProjectInvitationUrlAcceptancesPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostProjectsInvitationUrlAcceptancesData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/invitation_url_acceptances`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostProjectsInvitationUrl
     * @request POST:/v1/organizations/{org_slug}/projects/{project_id}/invitation_url
     */
    postProjectsInvitationUrl: () => {
      const base = 'POST:/v1/organizations/{org_slug}/projects/{project_id}/invitation_url' as const

      return {
        baseKey: dataTaggedQueryKey<PostProjectsInvitationUrlData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<PostProjectsInvitationUrlData>([base, orgSlug, projectId]),
        request: (orgSlug: string, projectId: string, params: RequestParams = {}) =>
          this.request<PostProjectsInvitationUrlData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/invitation_url`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetProjectsInvitationUrl
     * @request GET:/v1/organizations/{org_slug}/projects/{project_id}/invitation_url
     */
    getProjectsInvitationUrl: () => {
      const base = 'GET:/v1/organizations/{org_slug}/projects/{project_id}/invitation_url' as const

      return {
        baseKey: dataTaggedQueryKey<GetProjectsInvitationUrlData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<GetProjectsInvitationUrlData>([base, orgSlug, projectId]),
        request: (orgSlug: string, projectId: string, params: RequestParams = {}) =>
          this.request<GetProjectsInvitationUrlData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/invitation_url`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetProjectsMembers
     * @request GET:/v1/organizations/{org_slug}/projects/{project_id}/members
     */
    getProjectsMembers: () => {
      const base = 'GET:/v1/organizations/{org_slug}/projects/{project_id}/members' as const

      return {
        baseKey: dataTaggedQueryKey<GetProjectsMembersData>([base]),
        requestKey: (params: GetProjectsMembersParams) => dataTaggedQueryKey<GetProjectsMembersData>([base, params]),
        request: ({ orgSlug, projectId, ...query }: GetProjectsMembersParams, params: RequestParams = {}) =>
          this.request<GetProjectsMembersData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/members`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostProjectsMemberships
     * @request POST:/v1/organizations/{org_slug}/projects/{project_id}/memberships
     */
    postProjectsMemberships: () => {
      const base = 'POST:/v1/organizations/{org_slug}/projects/{project_id}/memberships' as const

      return {
        baseKey: dataTaggedQueryKey<PostProjectsMembershipsData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<PostProjectsMembershipsData>([base, orgSlug, projectId]),
        request: (
          orgSlug: string,
          projectId: string,
          data: OrganizationsOrgSlugProjectsProjectIdMembershipsPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostProjectsMembershipsData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/memberships`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteProjectsMemberships
     * @request DELETE:/v1/organizations/{org_slug}/projects/{project_id}/memberships
     */
    deleteProjectsMemberships: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/projects/{project_id}/memberships' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteProjectsMembershipsData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<DeleteProjectsMembershipsData>([base, orgSlug, projectId]),
        request: (
          orgSlug: string,
          projectId: string,
          data: OrganizationProjectProjectMembershipsDeleteRequest,
          params: RequestParams = {}
        ) =>
          this.request<DeleteProjectsMembershipsData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/memberships`,
            method: 'DELETE',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetProjectsNotes
     * @request GET:/v1/organizations/{org_slug}/projects/{project_id}/notes
     */
    getProjectsNotes: () => {
      const base = 'GET:/v1/organizations/{org_slug}/projects/{project_id}/notes' as const

      return {
        baseKey: dataTaggedQueryKey<GetProjectsNotesData>([base]),
        requestKey: (params: GetProjectsNotesParams) => dataTaggedQueryKey<GetProjectsNotesData>([base, params]),
        request: ({ orgSlug, projectId, ...query }: GetProjectsNotesParams, params: RequestParams = {}) =>
          this.request<GetProjectsNotesData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/notes`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetProjectsOauthApplications
     * @request GET:/v1/organizations/{org_slug}/projects/{project_id}/oauth_applications
     */
    getProjectsOauthApplications: () => {
      const base = 'GET:/v1/organizations/{org_slug}/projects/{project_id}/oauth_applications' as const

      return {
        baseKey: dataTaggedQueryKey<GetProjectsOauthApplicationsData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<GetProjectsOauthApplicationsData>([base, orgSlug, projectId]),
        request: (orgSlug: string, projectId: string, params: RequestParams = {}) =>
          this.request<GetProjectsOauthApplicationsData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/oauth_applications`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostProjectsOauthApplications
     * @request POST:/v1/organizations/{org_slug}/projects/{project_id}/oauth_applications
     */
    postProjectsOauthApplications: () => {
      const base = 'POST:/v1/organizations/{org_slug}/projects/{project_id}/oauth_applications' as const

      return {
        baseKey: dataTaggedQueryKey<PostProjectsOauthApplicationsData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<PostProjectsOauthApplicationsData>([base, orgSlug, projectId]),
        request: (
          orgSlug: string,
          projectId: string,
          data: OrganizationsOrgSlugProjectsProjectIdOauthApplicationsPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostProjectsOauthApplicationsData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/oauth_applications`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteProjectsOauthApplicationsById
     * @request DELETE:/v1/organizations/{org_slug}/projects/{project_id}/oauth_applications/{id}
     */
    deleteProjectsOauthApplicationsById: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/projects/{project_id}/oauth_applications/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteProjectsOauthApplicationsByIdData>([base]),
        requestKey: (orgSlug: string, projectId: string, id: string) =>
          dataTaggedQueryKey<DeleteProjectsOauthApplicationsByIdData>([base, orgSlug, projectId, id]),
        request: (orgSlug: string, projectId: string, id: string, params: RequestParams = {}) =>
          this.request<DeleteProjectsOauthApplicationsByIdData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/oauth_applications/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetProjectsPins
     * @request GET:/v1/organizations/{org_slug}/projects/{project_id}/pins
     */
    getProjectsPins: () => {
      const base = 'GET:/v1/organizations/{org_slug}/projects/{project_id}/pins' as const

      return {
        baseKey: dataTaggedQueryKey<GetProjectsPinsData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<GetProjectsPinsData>([base, orgSlug, projectId]),
        request: (orgSlug: string, projectId: string, params: RequestParams = {}) =>
          this.request<GetProjectsPinsData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/pins`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetProjectsPosts
     * @request GET:/v1/organizations/{org_slug}/projects/{project_id}/posts
     */
    getProjectsPosts: () => {
      const base = 'GET:/v1/organizations/{org_slug}/projects/{project_id}/posts' as const

      return {
        baseKey: dataTaggedQueryKey<GetProjectsPostsData>([base]),
        requestKey: (params: GetProjectsPostsParams) => dataTaggedQueryKey<GetProjectsPostsData>([base, params]),
        request: ({ orgSlug, projectId, ...query }: GetProjectsPostsParams, params: RequestParams = {}) =>
          this.request<GetProjectsPostsData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/posts`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostProjectsReads
     * @request POST:/v1/organizations/{org_slug}/projects/{project_id}/reads
     */
    postProjectsReads: () => {
      const base = 'POST:/v1/organizations/{org_slug}/projects/{project_id}/reads' as const

      return {
        baseKey: dataTaggedQueryKey<PostProjectsReadsData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<PostProjectsReadsData>([base, orgSlug, projectId]),
        request: (orgSlug: string, projectId: string, params: RequestParams = {}) =>
          this.request<PostProjectsReadsData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/reads`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteProjectsReads
     * @request DELETE:/v1/organizations/{org_slug}/projects/{project_id}/reads
     */
    deleteProjectsReads: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/projects/{project_id}/reads' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteProjectsReadsData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<DeleteProjectsReadsData>([base, orgSlug, projectId]),
        request: (orgSlug: string, projectId: string, params: RequestParams = {}) =>
          this.request<DeleteProjectsReadsData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/reads`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostProjectsSubscription
     * @request POST:/v1/organizations/{org_slug}/projects/{project_id}/subscription
     */
    postProjectsSubscription: () => {
      const base = 'POST:/v1/organizations/{org_slug}/projects/{project_id}/subscription' as const

      return {
        baseKey: dataTaggedQueryKey<PostProjectsSubscriptionData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<PostProjectsSubscriptionData>([base, orgSlug, projectId]),
        request: (
          orgSlug: string,
          projectId: string,
          data: OrganizationsOrgSlugProjectsProjectIdSubscriptionPostRequest,
          params: RequestParams = {}
        ) =>
          this.request<PostProjectsSubscriptionData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/subscription`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteProjectsSubscription
     * @request DELETE:/v1/organizations/{org_slug}/projects/{project_id}/subscription
     */
    deleteProjectsSubscription: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/projects/{project_id}/subscription' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteProjectsSubscriptionData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<DeleteProjectsSubscriptionData>([base, orgSlug, projectId]),
        request: (orgSlug: string, projectId: string, params: RequestParams = {}) =>
          this.request<DeleteProjectsSubscriptionData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/subscription`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutProjectsViewerDisplayPreferences
     * @request PUT:/v1/organizations/{org_slug}/projects/{project_id}/viewer_display_preferences
     */
    putProjectsViewerDisplayPreferences: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/projects/{project_id}/viewer_display_preferences' as const

      return {
        baseKey: dataTaggedQueryKey<PutProjectsViewerDisplayPreferencesData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<PutProjectsViewerDisplayPreferencesData>([base, orgSlug, projectId]),
        request: (
          orgSlug: string,
          projectId: string,
          data: OrganizationsOrgSlugProjectsProjectIdViewerDisplayPreferencesPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutProjectsViewerDisplayPreferencesData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/viewer_display_preferences`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteProjectsViewerDisplayPreferences
     * @request DELETE:/v1/organizations/{org_slug}/projects/{project_id}/viewer_display_preferences
     */
    deleteProjectsViewerDisplayPreferences: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/projects/{project_id}/viewer_display_preferences' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteProjectsViewerDisplayPreferencesData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<DeleteProjectsViewerDisplayPreferencesData>([base, orgSlug, projectId]),
        request: (orgSlug: string, projectId: string, params: RequestParams = {}) =>
          this.request<DeleteProjectsViewerDisplayPreferencesData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/viewer_display_preferences`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostProjectsViews
     * @request POST:/v1/organizations/{org_slug}/projects/{project_id}/views
     */
    postProjectsViews: () => {
      const base = 'POST:/v1/organizations/{org_slug}/projects/{project_id}/views' as const

      return {
        baseKey: dataTaggedQueryKey<PostProjectsViewsData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<PostProjectsViewsData>([base, orgSlug, projectId]),
        request: (orgSlug: string, projectId: string, params: RequestParams = {}) =>
          this.request<PostProjectsViewsData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/views`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetProjects
     * @request GET:/v1/organizations/{org_slug}/projects
     */
    getProjects: () => {
      const base = 'GET:/v1/organizations/{org_slug}/projects' as const

      return {
        baseKey: dataTaggedQueryKey<GetProjectsData>([base]),
        requestKey: (params: GetProjectsParams) => dataTaggedQueryKey<GetProjectsData>([base, params]),
        request: ({ orgSlug, ...query }: GetProjectsParams, params: RequestParams = {}) =>
          this.request<GetProjectsData>({
            path: `/v1/organizations/${orgSlug}/projects`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostProjects
     * @request POST:/v1/organizations/{org_slug}/projects
     */
    postProjects: () => {
      const base = 'POST:/v1/organizations/{org_slug}/projects' as const

      return {
        baseKey: dataTaggedQueryKey<PostProjectsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostProjectsData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationsOrgSlugProjectsPostRequest, params: RequestParams = {}) =>
          this.request<PostProjectsData>({
            path: `/v1/organizations/${orgSlug}/projects`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetProjectsByProjectId
     * @request GET:/v1/organizations/{org_slug}/projects/{project_id}
     */
    getProjectsByProjectId: () => {
      const base = 'GET:/v1/organizations/{org_slug}/projects/{project_id}' as const

      return {
        baseKey: dataTaggedQueryKey<GetProjectsByProjectIdData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<GetProjectsByProjectIdData>([base, orgSlug, projectId]),
        request: (orgSlug: string, projectId: string, params: RequestParams = {}) =>
          this.request<GetProjectsByProjectIdData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutProjectsByProjectId
     * @request PUT:/v1/organizations/{org_slug}/projects/{project_id}
     */
    putProjectsByProjectId: () => {
      const base = 'PUT:/v1/organizations/{org_slug}/projects/{project_id}' as const

      return {
        baseKey: dataTaggedQueryKey<PutProjectsByProjectIdData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<PutProjectsByProjectIdData>([base, orgSlug, projectId]),
        request: (
          orgSlug: string,
          projectId: string,
          data: OrganizationsOrgSlugProjectsProjectIdPutRequest,
          params: RequestParams = {}
        ) =>
          this.request<PutProjectsByProjectIdData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteProjectsByProjectId
     * @request DELETE:/v1/organizations/{org_slug}/projects/{project_id}
     */
    deleteProjectsByProjectId: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/projects/{project_id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteProjectsByProjectIdData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<DeleteProjectsByProjectIdData>([base, orgSlug, projectId]),
        request: (orgSlug: string, projectId: string, params: RequestParams = {}) =>
          this.request<DeleteProjectsByProjectIdData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PatchProjectsArchive
     * @request PATCH:/v1/organizations/{org_slug}/projects/{project_id}/archive
     */
    patchProjectsArchive: () => {
      const base = 'PATCH:/v1/organizations/{org_slug}/projects/{project_id}/archive' as const

      return {
        baseKey: dataTaggedQueryKey<PatchProjectsArchiveData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<PatchProjectsArchiveData>([base, orgSlug, projectId]),
        request: (orgSlug: string, projectId: string, params: RequestParams = {}) =>
          this.request<PatchProjectsArchiveData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/archive`,
            method: 'PATCH',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PatchProjectsUnarchive
     * @request PATCH:/v1/organizations/{org_slug}/projects/{project_id}/unarchive
     */
    patchProjectsUnarchive: () => {
      const base = 'PATCH:/v1/organizations/{org_slug}/projects/{project_id}/unarchive' as const

      return {
        baseKey: dataTaggedQueryKey<PatchProjectsUnarchiveData>([base]),
        requestKey: (orgSlug: string, projectId: string) =>
          dataTaggedQueryKey<PatchProjectsUnarchiveData>([base, orgSlug, projectId]),
        request: (orgSlug: string, projectId: string, params: RequestParams = {}) =>
          this.request<PatchProjectsUnarchiveData>({
            path: `/v1/organizations/${orgSlug}/projects/${projectId}/unarchive`,
            method: 'PATCH',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetProjectCoverPhotoPresignedFields
     * @request GET:/v1/organizations/{org_slug}/project/cover-photo/presigned-fields
     */
    getProjectCoverPhotoPresignedFields: () => {
      const base = 'GET:/v1/organizations/{org_slug}/project/cover-photo/presigned-fields' as const

      return {
        baseKey: dataTaggedQueryKey<GetProjectCoverPhotoPresignedFieldsData>([base]),
        requestKey: (params: GetProjectCoverPhotoPresignedFieldsParams) =>
          dataTaggedQueryKey<GetProjectCoverPhotoPresignedFieldsData>([base, params]),
        request: ({ orgSlug, ...query }: GetProjectCoverPhotoPresignedFieldsParams, params: RequestParams = {}) =>
          this.request<GetProjectCoverPhotoPresignedFieldsData>({
            path: `/v1/organizations/${orgSlug}/project/cover-photo/presigned-fields`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteReactions
     * @request DELETE:/v1/organizations/{org_slug}/reactions
     */
    deleteReactions: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/reactions' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteReactionsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<DeleteReactionsData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationReactionsDeleteRequest, params: RequestParams = {}) =>
          this.request<DeleteReactionsData>({
            path: `/v1/organizations/${orgSlug}/reactions`,
            method: 'DELETE',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetResourceMentions
     * @request GET:/v1/organizations/{org_slug}/resource_mentions
     */
    getResourceMentions: () => {
      const base = 'GET:/v1/organizations/{org_slug}/resource_mentions' as const

      return {
        baseKey: dataTaggedQueryKey<GetResourceMentionsData>([base]),
        requestKey: (params: GetResourceMentionsParams) => dataTaggedQueryKey<GetResourceMentionsData>([base, params]),
        request: ({ orgSlug, ...query }: GetResourceMentionsParams, params: RequestParams = {}) =>
          this.request<GetResourceMentionsData>({
            path: `/v1/organizations/${orgSlug}/resource_mentions`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetSearchGroups
     * @request GET:/v1/organizations/{org_slug}/search/groups
     */
    getSearchGroups: () => {
      const base = 'GET:/v1/organizations/{org_slug}/search/groups' as const

      return {
        baseKey: dataTaggedQueryKey<GetSearchGroupsData>([base]),
        requestKey: (params: GetSearchGroupsParams) => dataTaggedQueryKey<GetSearchGroupsData>([base, params]),
        request: ({ orgSlug, ...query }: GetSearchGroupsParams, params: RequestParams = {}) =>
          this.request<GetSearchGroupsData>({
            path: `/v1/organizations/${orgSlug}/search/groups`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetSearchMixed
     * @request GET:/v1/organizations/{org_slug}/search/mixed
     */
    getSearchMixed: () => {
      const base = 'GET:/v1/organizations/{org_slug}/search/mixed' as const

      return {
        baseKey: dataTaggedQueryKey<GetSearchMixedData>([base]),
        requestKey: (params: GetSearchMixedParams) => dataTaggedQueryKey<GetSearchMixedData>([base, params]),
        request: ({ orgSlug, ...query }: GetSearchMixedParams, params: RequestParams = {}) =>
          this.request<GetSearchMixedData>({
            path: `/v1/organizations/${orgSlug}/search/mixed`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetSearchPosts
     * @request GET:/v1/organizations/{org_slug}/search/posts
     */
    getSearchPosts: () => {
      const base = 'GET:/v1/organizations/{org_slug}/search/posts' as const

      return {
        baseKey: dataTaggedQueryKey<GetSearchPostsData>([base]),
        requestKey: (params: GetSearchPostsParams) => dataTaggedQueryKey<GetSearchPostsData>([base, params]),
        request: ({ orgSlug, ...query }: GetSearchPostsParams, params: RequestParams = {}) =>
          this.request<GetSearchPostsData>({
            path: `/v1/organizations/${orgSlug}/search/posts`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetSearchResourceMentions
     * @request GET:/v1/organizations/{org_slug}/search/resource_mentions
     */
    getSearchResourceMentions: () => {
      const base = 'GET:/v1/organizations/{org_slug}/search/resource_mentions' as const

      return {
        baseKey: dataTaggedQueryKey<GetSearchResourceMentionsData>([base]),
        requestKey: (params: GetSearchResourceMentionsParams) =>
          dataTaggedQueryKey<GetSearchResourceMentionsData>([base, params]),
        request: ({ orgSlug, ...query }: GetSearchResourceMentionsParams, params: RequestParams = {}) =>
          this.request<GetSearchResourceMentionsData>({
            path: `/v1/organizations/${orgSlug}/search/resource_mentions`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetIntegrationsSlack
     * @request GET:/v1/organizations/{org_slug}/integrations/slack
     */
    getIntegrationsSlack: () => {
      const base = 'GET:/v1/organizations/{org_slug}/integrations/slack' as const

      return {
        baseKey: dataTaggedQueryKey<GetIntegrationsSlackData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetIntegrationsSlackData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetIntegrationsSlackData>({
            path: `/v1/organizations/${orgSlug}/integrations/slack`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteIntegrationsSlack
     * @request DELETE:/v1/organizations/{org_slug}/integrations/slack
     */
    deleteIntegrationsSlack: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/integrations/slack' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteIntegrationsSlackData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<DeleteIntegrationsSlackData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<DeleteIntegrationsSlackData>({
            path: `/v1/organizations/${orgSlug}/integrations/slack`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetSyncCustomReactions
     * @request GET:/v1/organizations/{org_slug}/sync/custom_reactions
     */
    getSyncCustomReactions: () => {
      const base = 'GET:/v1/organizations/{org_slug}/sync/custom_reactions' as const

      return {
        baseKey: dataTaggedQueryKey<GetSyncCustomReactionsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetSyncCustomReactionsData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetSyncCustomReactionsData>({
            path: `/v1/organizations/${orgSlug}/sync/custom_reactions`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetSyncMembers
     * @request GET:/v1/organizations/{org_slug}/sync/members
     */
    getSyncMembers: () => {
      const base = 'GET:/v1/organizations/{org_slug}/sync/members' as const

      return {
        baseKey: dataTaggedQueryKey<GetSyncMembersData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetSyncMembersData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetSyncMembersData>({
            path: `/v1/organizations/${orgSlug}/sync/members`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetSyncMessageThreads
     * @request GET:/v1/organizations/{org_slug}/sync/message_threads
     */
    getSyncMessageThreads: () => {
      const base = 'GET:/v1/organizations/{org_slug}/sync/message_threads' as const

      return {
        baseKey: dataTaggedQueryKey<GetSyncMessageThreadsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetSyncMessageThreadsData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetSyncMessageThreadsData>({
            path: `/v1/organizations/${orgSlug}/sync/message_threads`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetSyncProjects
     * @request GET:/v1/organizations/{org_slug}/sync/projects
     */
    getSyncProjects: () => {
      const base = 'GET:/v1/organizations/{org_slug}/sync/projects' as const

      return {
        baseKey: dataTaggedQueryKey<GetSyncProjectsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetSyncProjectsData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetSyncProjectsData>({
            path: `/v1/organizations/${orgSlug}/sync/projects`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetSyncTags
     * @request GET:/v1/organizations/{org_slug}/sync/tags
     */
    getSyncTags: () => {
      const base = 'GET:/v1/organizations/{org_slug}/sync/tags' as const

      return {
        baseKey: dataTaggedQueryKey<GetSyncTagsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<GetSyncTagsData>([base, orgSlug]),
        request: (orgSlug: string, params: RequestParams = {}) =>
          this.request<GetSyncTagsData>({
            path: `/v1/organizations/${orgSlug}/sync/tags`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetTags
     * @request GET:/v1/organizations/{org_slug}/tags
     */
    getTags: () => {
      const base = 'GET:/v1/organizations/{org_slug}/tags' as const

      return {
        baseKey: dataTaggedQueryKey<GetTagsData>([base]),
        requestKey: (params: GetTagsParams) => dataTaggedQueryKey<GetTagsData>([base, params]),
        request: ({ orgSlug, ...query }: GetTagsParams, params: RequestParams = {}) =>
          this.request<GetTagsData>({
            path: `/v1/organizations/${orgSlug}/tags`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostTags
     * @request POST:/v1/organizations/{org_slug}/tags
     */
    postTags: () => {
      const base = 'POST:/v1/organizations/{org_slug}/tags' as const

      return {
        baseKey: dataTaggedQueryKey<PostTagsData>([base]),
        requestKey: (orgSlug: string) => dataTaggedQueryKey<PostTagsData>([base, orgSlug]),
        request: (orgSlug: string, data: OrganizationsOrgSlugTagsPostRequest, params: RequestParams = {}) =>
          this.request<PostTagsData>({
            path: `/v1/organizations/${orgSlug}/tags`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetTagsByTagName
     * @request GET:/v1/organizations/{org_slug}/tags/{tag_name}
     */
    getTagsByTagName: () => {
      const base = 'GET:/v1/organizations/{org_slug}/tags/{tag_name}' as const

      return {
        baseKey: dataTaggedQueryKey<GetTagsByTagNameData>([base]),
        requestKey: (orgSlug: string, tagName: string) =>
          dataTaggedQueryKey<GetTagsByTagNameData>([base, orgSlug, tagName]),
        request: (orgSlug: string, tagName: string, params: RequestParams = {}) =>
          this.request<GetTagsByTagNameData>({
            path: `/v1/organizations/${orgSlug}/tags/${tagName}`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PatchTagsByTagName
     * @request PATCH:/v1/organizations/{org_slug}/tags/{tag_name}
     */
    patchTagsByTagName: () => {
      const base = 'PATCH:/v1/organizations/{org_slug}/tags/{tag_name}' as const

      return {
        baseKey: dataTaggedQueryKey<PatchTagsByTagNameData>([base]),
        requestKey: (orgSlug: string, tagName: string) =>
          dataTaggedQueryKey<PatchTagsByTagNameData>([base, orgSlug, tagName]),
        request: (
          orgSlug: string,
          tagName: string,
          data: OrganizationsOrgSlugTagsTagNamePatchRequest,
          params: RequestParams = {}
        ) =>
          this.request<PatchTagsByTagNameData>({
            path: `/v1/organizations/${orgSlug}/tags/${tagName}`,
            method: 'PATCH',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteTagsByTagName
     * @request DELETE:/v1/organizations/{org_slug}/tags/{tag_name}
     */
    deleteTagsByTagName: () => {
      const base = 'DELETE:/v1/organizations/{org_slug}/tags/{tag_name}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteTagsByTagNameData>([base]),
        requestKey: (orgSlug: string, tagName: string) =>
          dataTaggedQueryKey<DeleteTagsByTagNameData>([base, orgSlug, tagName]),
        request: (orgSlug: string, tagName: string, params: RequestParams = {}) =>
          this.request<DeleteTagsByTagNameData>({
            path: `/v1/organizations/${orgSlug}/tags/${tagName}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetTagsPosts
     * @request GET:/v1/organizations/{org_slug}/tags/{tag_name}/posts
     */
    getTagsPosts: () => {
      const base = 'GET:/v1/organizations/{org_slug}/tags/{tag_name}/posts' as const

      return {
        baseKey: dataTaggedQueryKey<GetTagsPostsData>([base]),
        requestKey: (params: GetTagsPostsParams) => dataTaggedQueryKey<GetTagsPostsData>([base, params]),
        request: ({ orgSlug, tagName, ...query }: GetTagsPostsParams, params: RequestParams = {}) =>
          this.request<GetTagsPostsData>({
            path: `/v1/organizations/${orgSlug}/tags/${tagName}/posts`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    }
  }
  batchedPostViews = {
    /**
     * No description
     *
     * @name PostBatchedPostViews
     * @request POST:/v1/batched_post_views
     */
    postBatchedPostViews: () => {
      const base = 'POST:/v1/batched_post_views' as const

      return {
        baseKey: dataTaggedQueryKey<PostBatchedPostViewsData>([base]),
        requestKey: () => dataTaggedQueryKey<PostBatchedPostViewsData>([base]),
        request: (data: BatchedPostViewsPostRequest, params: RequestParams = {}) =>
          this.request<PostBatchedPostViewsData>({
            path: `/v1/batched_post_views`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    }
  }
  imageUrls = {
    /**
     * No description
     *
     * @name PostImageUrls
     * @request POST:/v1/image_urls
     */
    postImageUrls: () => {
      const base = 'POST:/v1/image_urls' as const

      return {
        baseKey: dataTaggedQueryKey<PostImageUrlsData>([base]),
        requestKey: () => dataTaggedQueryKey<PostImageUrlsData>([base]),
        request: (data: ImageUrlsPostRequest, params: RequestParams = {}) =>
          this.request<PostImageUrlsData>({
            path: `/v1/image_urls`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    }
  }
  integrations = {
    /**
     * No description
     *
     * @name PostIntegrationsCalDotComCallRooms
     * @request POST:/v1/integrations/cal_dot_com/call_rooms
     */
    postIntegrationsCalDotComCallRooms: () => {
      const base = 'POST:/v1/integrations/cal_dot_com/call_rooms' as const

      return {
        baseKey: dataTaggedQueryKey<PostIntegrationsCalDotComCallRoomsData>([base]),
        requestKey: () => dataTaggedQueryKey<PostIntegrationsCalDotComCallRoomsData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<PostIntegrationsCalDotComCallRoomsData>({
            path: `/v1/integrations/cal_dot_com/call_rooms`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetIntegrationsCalDotComIntegration
     * @request GET:/v1/integrations/cal_dot_com/integration
     */
    getIntegrationsCalDotComIntegration: () => {
      const base = 'GET:/v1/integrations/cal_dot_com/integration' as const

      return {
        baseKey: dataTaggedQueryKey<GetIntegrationsCalDotComIntegrationData>([base]),
        requestKey: () => dataTaggedQueryKey<GetIntegrationsCalDotComIntegrationData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<GetIntegrationsCalDotComIntegrationData>({
            path: `/v1/integrations/cal_dot_com/integration`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutIntegrationsCalDotComOrganization
     * @request PUT:/v1/integrations/cal_dot_com/organization
     */
    putIntegrationsCalDotComOrganization: () => {
      const base = 'PUT:/v1/integrations/cal_dot_com/organization' as const

      return {
        baseKey: dataTaggedQueryKey<PutIntegrationsCalDotComOrganizationData>([base]),
        requestKey: () => dataTaggedQueryKey<PutIntegrationsCalDotComOrganizationData>([base]),
        request: (data: IntegrationsCalDotComOrganizationPutRequest, params: RequestParams = {}) =>
          this.request<PutIntegrationsCalDotComOrganizationData>({
            path: `/v1/integrations/cal_dot_com/organization`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetIntegrationsFigmaIntegration
     * @request GET:/v1/integrations/figma_integration
     */
    getIntegrationsFigmaIntegration: () => {
      const base = 'GET:/v1/integrations/figma_integration' as const

      return {
        baseKey: dataTaggedQueryKey<GetIntegrationsFigmaIntegrationData>([base]),
        requestKey: () => dataTaggedQueryKey<GetIntegrationsFigmaIntegrationData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<GetIntegrationsFigmaIntegrationData>({
            path: `/v1/integrations/figma_integration`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostIntegrationsGoogleCalendarEvents
     * @request POST:/v1/integrations/google/calendar_events
     */
    postIntegrationsGoogleCalendarEvents: () => {
      const base = 'POST:/v1/integrations/google/calendar_events' as const

      return {
        baseKey: dataTaggedQueryKey<PostIntegrationsGoogleCalendarEventsData>([base]),
        requestKey: () => dataTaggedQueryKey<PostIntegrationsGoogleCalendarEventsData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<PostIntegrationsGoogleCalendarEventsData>({
            path: `/v1/integrations/google/calendar_events`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutIntegrationsGoogleCalendarEventsOrganization
     * @request PUT:/v1/integrations/google/calendar_events_organization
     */
    putIntegrationsGoogleCalendarEventsOrganization: () => {
      const base = 'PUT:/v1/integrations/google/calendar_events_organization' as const

      return {
        baseKey: dataTaggedQueryKey<PutIntegrationsGoogleCalendarEventsOrganizationData>([base]),
        requestKey: () => dataTaggedQueryKey<PutIntegrationsGoogleCalendarEventsOrganizationData>([base]),
        request: (data: IntegrationsGoogleCalendarEventsOrganizationPutRequest, params: RequestParams = {}) =>
          this.request<PutIntegrationsGoogleCalendarEventsOrganizationData>({
            path: `/v1/integrations/google/calendar_events_organization`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetIntegrationsGoogleCalendarIntegration
     * @request GET:/v1/integrations/google/calendar_integration
     */
    getIntegrationsGoogleCalendarIntegration: () => {
      const base = 'GET:/v1/integrations/google/calendar_integration' as const

      return {
        baseKey: dataTaggedQueryKey<GetIntegrationsGoogleCalendarIntegrationData>([base]),
        requestKey: () => dataTaggedQueryKey<GetIntegrationsGoogleCalendarIntegrationData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<GetIntegrationsGoogleCalendarIntegrationData>({
            path: `/v1/integrations/google/calendar_integration`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostIntegrationsZapierComments
     * @request POST:/v1/integrations/zapier/comments
     */
    postIntegrationsZapierComments: () => {
      const base = 'POST:/v1/integrations/zapier/comments' as const

      return {
        baseKey: dataTaggedQueryKey<PostIntegrationsZapierCommentsData>([base]),
        requestKey: () => dataTaggedQueryKey<PostIntegrationsZapierCommentsData>([base]),
        request: (data: ZapierIntegrationCommentsPostRequest, params: RequestParams = {}) =>
          this.request<PostIntegrationsZapierCommentsData>({
            path: `/v1/integrations/zapier/comments`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostIntegrationsZapierMessages
     * @request POST:/v1/integrations/zapier/messages
     */
    postIntegrationsZapierMessages: () => {
      const base = 'POST:/v1/integrations/zapier/messages' as const

      return {
        baseKey: dataTaggedQueryKey<PostIntegrationsZapierMessagesData>([base]),
        requestKey: () => dataTaggedQueryKey<PostIntegrationsZapierMessagesData>([base]),
        request: (data: ZapierIntegrationMessagesPostRequest, params: RequestParams = {}) =>
          this.request<PostIntegrationsZapierMessagesData>({
            path: `/v1/integrations/zapier/messages`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostIntegrationsZapierPosts
     * @request POST:/v1/integrations/zapier/posts
     */
    postIntegrationsZapierPosts: () => {
      const base = 'POST:/v1/integrations/zapier/posts' as const

      return {
        baseKey: dataTaggedQueryKey<PostIntegrationsZapierPostsData>([base]),
        requestKey: () => dataTaggedQueryKey<PostIntegrationsZapierPostsData>([base]),
        request: (data: ZapierIntegrationPostsPostRequest, params: RequestParams = {}) =>
          this.request<PostIntegrationsZapierPostsData>({
            path: `/v1/integrations/zapier/posts`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetIntegrationsZapierProjects
     * @request GET:/v1/integrations/zapier/projects
     */
    getIntegrationsZapierProjects: () => {
      const base = 'GET:/v1/integrations/zapier/projects' as const

      return {
        baseKey: dataTaggedQueryKey<GetIntegrationsZapierProjectsData>([base]),
        requestKey: (params: GetIntegrationsZapierProjectsParams) =>
          dataTaggedQueryKey<GetIntegrationsZapierProjectsData>([base, params]),
        request: (query: GetIntegrationsZapierProjectsParams, params: RequestParams = {}) =>
          this.request<GetIntegrationsZapierProjectsData>({
            path: `/v1/integrations/zapier/projects`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    }
  }
  openGraphLinks = {
    /**
     * No description
     *
     * @name GetOpenGraphLinks
     * @request GET:/v1/open_graph_links
     */
    getOpenGraphLinks: () => {
      const base = 'GET:/v1/open_graph_links' as const

      return {
        baseKey: dataTaggedQueryKey<GetOpenGraphLinksData>([base]),
        requestKey: (params: GetOpenGraphLinksParams) => dataTaggedQueryKey<GetOpenGraphLinksData>([base, params]),
        request: (query: GetOpenGraphLinksParams, params: RequestParams = {}) =>
          this.request<GetOpenGraphLinksData>({
            path: `/v1/open_graph_links`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    }
  }
  invitationsByToken = {
    /**
     * No description
     *
     * @name PostInvitationsByTokenAccept
     * @request POST:/v1/invitations_by_token/{invite_token}/accept
     */
    postInvitationsByTokenAccept: () => {
      const base = 'POST:/v1/invitations_by_token/{invite_token}/accept' as const

      return {
        baseKey: dataTaggedQueryKey<PostInvitationsByTokenAcceptData>([base]),
        requestKey: (inviteToken: string) => dataTaggedQueryKey<PostInvitationsByTokenAcceptData>([base, inviteToken]),
        request: (inviteToken: string, params: RequestParams = {}) =>
          this.request<PostInvitationsByTokenAcceptData>({
            path: `/v1/invitations_by_token/${inviteToken}/accept`,
            method: 'POST',
            ...params
          })
      }
    }
  }
  organizationMemberships = {
    /**
     * No description
     *
     * @name PutOrganizationMembershipsReorder
     * @request PUT:/v1/organization_memberships/reorder
     */
    putOrganizationMembershipsReorder: () => {
      const base = 'PUT:/v1/organization_memberships/reorder' as const

      return {
        baseKey: dataTaggedQueryKey<PutOrganizationMembershipsReorderData>([base]),
        requestKey: () => dataTaggedQueryKey<PutOrganizationMembershipsReorderData>([base]),
        request: (data: OrganizationMembershipsReorderPutRequest, params: RequestParams = {}) =>
          this.request<PutOrganizationMembershipsReorderData>({
            path: `/v1/organization_memberships/reorder`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetOrganizationMemberships
     * @request GET:/v1/organization_memberships
     */
    getOrganizationMemberships: () => {
      const base = 'GET:/v1/organization_memberships' as const

      return {
        baseKey: dataTaggedQueryKey<GetOrganizationMembershipsData>([base]),
        requestKey: () => dataTaggedQueryKey<GetOrganizationMembershipsData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<GetOrganizationMembershipsData>({
            path: `/v1/organization_memberships`,
            method: 'GET',
            ...params
          })
      }
    }
  }
  productLogs = {
    /**
     * No description
     *
     * @name PostProductLogs
     * @request POST:/v1/product_logs
     */
    postProductLogs: () => {
      const base = 'POST:/v1/product_logs' as const

      return {
        baseKey: dataTaggedQueryKey<PostProductLogsData>([base]),
        requestKey: () => dataTaggedQueryKey<PostProductLogsData>([base]),
        request: (data: ProductLogsPostRequest, params: RequestParams = {}) =>
          this.request<PostProductLogsData>({
            path: `/v1/product_logs`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    }
  }
  organizationByToken = {
    /**
     * No description
     *
     * @name GetOrganizationByToken
     * @request GET:/v1/organization-by-token/{token}
     */
    getOrganizationByToken: () => {
      const base = 'GET:/v1/organization-by-token/{token}' as const

      return {
        baseKey: dataTaggedQueryKey<GetOrganizationByTokenData>([base]),
        requestKey: (token: string) => dataTaggedQueryKey<GetOrganizationByTokenData>([base, token]),
        request: (token: string, params: RequestParams = {}) =>
          this.request<GetOrganizationByTokenData>({
            path: `/v1/organization-by-token/${token}`,
            method: 'GET',
            ...params
          })
      }
    }
  }
  publicProjects = {
    /**
     * No description
     *
     * @name GetPublicProjectsByToken
     * @request GET:/v1/public_projects/{token}
     */
    getPublicProjectsByToken: () => {
      const base = 'GET:/v1/public_projects/{token}' as const

      return {
        baseKey: dataTaggedQueryKey<GetPublicProjectsByTokenData>([base]),
        requestKey: (token: string) => dataTaggedQueryKey<GetPublicProjectsByTokenData>([base, token]),
        request: (token: string, params: RequestParams = {}) =>
          this.request<GetPublicProjectsByTokenData>({
            path: `/v1/public_projects/${token}`,
            method: 'GET',
            ...params
          })
      }
    }
  }
  signIn = {
    /**
     * No description
     *
     * @name PostSignInDesktop
     * @request POST:/v1/sign-in/desktop
     */
    postSignInDesktop: () => {
      const base = 'POST:/v1/sign-in/desktop' as const

      return {
        baseKey: dataTaggedQueryKey<PostSignInDesktopData>([base]),
        requestKey: () => dataTaggedQueryKey<PostSignInDesktopData>([base]),
        request: (data: InternalDesktopSessionPostRequest, params: RequestParams = {}) =>
          this.request<PostSignInDesktopData>({
            path: `/v1/sign-in/desktop`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    }
  }
  users = {
    /**
     * No description
     *
     * @name PostMeSyncToken
     * @request POST:/v1/users/me/sync-token
     */
    postMeSyncToken: () => {
      const base = 'POST:/v1/users/me/sync-token' as const

      return {
        baseKey: dataTaggedQueryKey<PostMeSyncTokenData>([base]),
        requestKey: () => dataTaggedQueryKey<PostMeSyncTokenData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<PostMeSyncTokenData>({
            path: `/v1/users/me/sync-token`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostMeNotificationPause
     * @request POST:/v1/users/me/notification_pause
     */
    postMeNotificationPause: () => {
      const base = 'POST:/v1/users/me/notification_pause' as const

      return {
        baseKey: dataTaggedQueryKey<PostMeNotificationPauseData>([base]),
        requestKey: () => dataTaggedQueryKey<PostMeNotificationPauseData>([base]),
        request: (data: UsersMeNotificationPausePostRequest, params: RequestParams = {}) =>
          this.request<PostMeNotificationPauseData>({
            path: `/v1/users/me/notification_pause`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteMeNotificationPause
     * @request DELETE:/v1/users/me/notification_pause
     */
    deleteMeNotificationPause: () => {
      const base = 'DELETE:/v1/users/me/notification_pause' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteMeNotificationPauseData>([base]),
        requestKey: () => dataTaggedQueryKey<DeleteMeNotificationPauseData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<DeleteMeNotificationPauseData>({
            path: `/v1/users/me/notification_pause`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMeNotificationSchedule
     * @request GET:/v1/users/me/notification_schedule
     */
    getMeNotificationSchedule: () => {
      const base = 'GET:/v1/users/me/notification_schedule' as const

      return {
        baseKey: dataTaggedQueryKey<GetMeNotificationScheduleData>([base]),
        requestKey: () => dataTaggedQueryKey<GetMeNotificationScheduleData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<GetMeNotificationScheduleData>({
            path: `/v1/users/me/notification_schedule`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutMeNotificationSchedule
     * @request PUT:/v1/users/me/notification_schedule
     */
    putMeNotificationSchedule: () => {
      const base = 'PUT:/v1/users/me/notification_schedule' as const

      return {
        baseKey: dataTaggedQueryKey<PutMeNotificationScheduleData>([base]),
        requestKey: () => dataTaggedQueryKey<PutMeNotificationScheduleData>([base]),
        request: (data: UsersMeNotificationSchedulePutRequest, params: RequestParams = {}) =>
          this.request<PutMeNotificationScheduleData>({
            path: `/v1/users/me/notification_schedule`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteMeNotificationSchedule
     * @request DELETE:/v1/users/me/notification_schedule
     */
    deleteMeNotificationSchedule: () => {
      const base = 'DELETE:/v1/users/me/notification_schedule' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteMeNotificationScheduleData>([base]),
        requestKey: () => dataTaggedQueryKey<DeleteMeNotificationScheduleData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<DeleteMeNotificationScheduleData>({
            path: `/v1/users/me/notification_schedule`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMeNotificationsUnreadAllCount
     * @request GET:/v1/users/me/notifications/unread/all_count
     */
    getMeNotificationsUnreadAllCount: () => {
      const base = 'GET:/v1/users/me/notifications/unread/all_count' as const

      return {
        baseKey: dataTaggedQueryKey<GetMeNotificationsUnreadAllCountData>([base]),
        requestKey: () => dataTaggedQueryKey<GetMeNotificationsUnreadAllCountData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<GetMeNotificationsUnreadAllCountData>({
            path: `/v1/users/me/notifications/unread/all_count`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMeOrganizationInvitations
     * @request GET:/v1/users/me/organization-invitations
     */
    getMeOrganizationInvitations: () => {
      const base = 'GET:/v1/users/me/organization-invitations' as const

      return {
        baseKey: dataTaggedQueryKey<GetMeOrganizationInvitationsData>([base]),
        requestKey: () => dataTaggedQueryKey<GetMeOrganizationInvitationsData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<GetMeOrganizationInvitationsData>({
            path: `/v1/users/me/organization-invitations`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutMePreference
     * @request PUT:/v1/users/me/preference
     */
    putMePreference: () => {
      const base = 'PUT:/v1/users/me/preference' as const

      return {
        baseKey: dataTaggedQueryKey<PutMePreferenceData>([base]),
        requestKey: () => dataTaggedQueryKey<PutMePreferenceData>([base]),
        request: (data: UsersMePreferencePutRequest, params: RequestParams = {}) =>
          this.request<PutMePreferenceData>({
            path: `/v1/users/me/preference`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMeScheduledNotifications
     * @request GET:/v1/users/me/scheduled-notifications
     */
    getMeScheduledNotifications: () => {
      const base = 'GET:/v1/users/me/scheduled-notifications' as const

      return {
        baseKey: dataTaggedQueryKey<GetMeScheduledNotificationsData>([base]),
        requestKey: () => dataTaggedQueryKey<GetMeScheduledNotificationsData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<GetMeScheduledNotificationsData>({
            path: `/v1/users/me/scheduled-notifications`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostMeScheduledNotifications
     * @request POST:/v1/users/me/scheduled-notifications
     */
    postMeScheduledNotifications: () => {
      const base = 'POST:/v1/users/me/scheduled-notifications' as const

      return {
        baseKey: dataTaggedQueryKey<PostMeScheduledNotificationsData>([base]),
        requestKey: () => dataTaggedQueryKey<PostMeScheduledNotificationsData>([base]),
        request: (data: UsersMeScheduledNotificationsPostRequest, params: RequestParams = {}) =>
          this.request<PostMeScheduledNotificationsData>({
            path: `/v1/users/me/scheduled-notifications`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutMeScheduledNotificationsById
     * @request PUT:/v1/users/me/scheduled-notifications/{id}
     */
    putMeScheduledNotificationsById: () => {
      const base = 'PUT:/v1/users/me/scheduled-notifications/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<PutMeScheduledNotificationsByIdData>([base]),
        requestKey: (id: string) => dataTaggedQueryKey<PutMeScheduledNotificationsByIdData>([base, id]),
        request: (id: string, data: CurrentUserScheduledNotificationPutRequest, params: RequestParams = {}) =>
          this.request<PutMeScheduledNotificationsByIdData>({
            path: `/v1/users/me/scheduled-notifications/${id}`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteMeScheduledNotificationsById
     * @request DELETE:/v1/users/me/scheduled-notifications/{id}
     */
    deleteMeScheduledNotificationsById: () => {
      const base = 'DELETE:/v1/users/me/scheduled-notifications/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteMeScheduledNotificationsByIdData>([base]),
        requestKey: (id: string) => dataTaggedQueryKey<DeleteMeScheduledNotificationsByIdData>([base, id]),
        request: (id: string, params: RequestParams = {}) =>
          this.request<DeleteMeScheduledNotificationsByIdData>({
            path: `/v1/users/me/scheduled-notifications/${id}`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteMeSignOut
     * @request DELETE:/v1/users/me/sign-out
     */
    deleteMeSignOut: () => {
      const base = 'DELETE:/v1/users/me/sign-out' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteMeSignOutData>([base]),
        requestKey: () => dataTaggedQueryKey<DeleteMeSignOutData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<DeleteMeSignOutData>({
            path: `/v1/users/me/sign-out`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMeSuggestedOrganizations
     * @request GET:/v1/users/me/suggested-organizations
     */
    getMeSuggestedOrganizations: () => {
      const base = 'GET:/v1/users/me/suggested-organizations' as const

      return {
        baseKey: dataTaggedQueryKey<GetMeSuggestedOrganizationsData>([base]),
        requestKey: () => dataTaggedQueryKey<GetMeSuggestedOrganizationsData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<GetMeSuggestedOrganizationsData>({
            path: `/v1/users/me/suggested-organizations`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostMeTimezone
     * @request POST:/v1/users/me/timezone
     */
    postMeTimezone: () => {
      const base = 'POST:/v1/users/me/timezone' as const

      return {
        baseKey: dataTaggedQueryKey<PostMeTimezoneData>([base]),
        requestKey: () => dataTaggedQueryKey<PostMeTimezoneData>([base]),
        request: (data: UsersTimezonePostRequest, params: RequestParams = {}) =>
          this.request<PostMeTimezoneData>({
            path: `/v1/users/me/timezone`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostMeTwoFactorAuthentication
     * @request POST:/v1/users/me/two-factor-authentication
     */
    postMeTwoFactorAuthentication: () => {
      const base = 'POST:/v1/users/me/two-factor-authentication' as const

      return {
        baseKey: dataTaggedQueryKey<PostMeTwoFactorAuthenticationData>([base]),
        requestKey: () => dataTaggedQueryKey<PostMeTwoFactorAuthenticationData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<PostMeTwoFactorAuthenticationData>({
            path: `/v1/users/me/two-factor-authentication`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutMeTwoFactorAuthentication
     * @request PUT:/v1/users/me/two-factor-authentication
     */
    putMeTwoFactorAuthentication: () => {
      const base = 'PUT:/v1/users/me/two-factor-authentication' as const

      return {
        baseKey: dataTaggedQueryKey<PutMeTwoFactorAuthenticationData>([base]),
        requestKey: () => dataTaggedQueryKey<PutMeTwoFactorAuthenticationData>([base]),
        request: (data: UsersMeTwoFactorAuthenticationPutRequest, params: RequestParams = {}) =>
          this.request<PutMeTwoFactorAuthenticationData>({
            path: `/v1/users/me/two-factor-authentication`,
            method: 'PUT',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name DeleteMeTwoFactorAuthentication
     * @request DELETE:/v1/users/me/two-factor-authentication
     */
    deleteMeTwoFactorAuthentication: () => {
      const base = 'DELETE:/v1/users/me/two-factor-authentication' as const

      return {
        baseKey: dataTaggedQueryKey<DeleteMeTwoFactorAuthenticationData>([base]),
        requestKey: () => dataTaggedQueryKey<DeleteMeTwoFactorAuthenticationData>([base]),
        request: (data: UsersMeTwoFactorAuthenticationDeleteRequest, params: RequestParams = {}) =>
          this.request<DeleteMeTwoFactorAuthenticationData>({
            path: `/v1/users/me/two-factor-authentication`,
            method: 'DELETE',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMe
     * @request GET:/v1/users/me
     */
    getMe: () => {
      const base = 'GET:/v1/users/me' as const

      return {
        baseKey: dataTaggedQueryKey<GetMeData>([base]),
        requestKey: () => dataTaggedQueryKey<GetMeData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<GetMeData>({
            path: `/v1/users/me`,
            method: 'GET',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PatchMe
     * @request PATCH:/v1/users/me
     */
    patchMe: () => {
      const base = 'PATCH:/v1/users/me' as const

      return {
        baseKey: dataTaggedQueryKey<PatchMeData>([base]),
        requestKey: () => dataTaggedQueryKey<PatchMeData>([base]),
        request: (data: UsersMePatchRequest, params: RequestParams = {}) =>
          this.request<PatchMeData>({
            path: `/v1/users/me`,
            method: 'PATCH',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PutMeOnboard
     * @request PUT:/v1/users/me/onboard
     */
    putMeOnboard: () => {
      const base = 'PUT:/v1/users/me/onboard' as const

      return {
        baseKey: dataTaggedQueryKey<PutMeOnboardData>([base]),
        requestKey: () => dataTaggedQueryKey<PutMeOnboardData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<PutMeOnboardData>({
            path: `/v1/users/me/onboard`,
            method: 'PUT',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name PostMeSendEmailConfirmation
     * @request POST:/v1/users/me/send-email-confirmation
     */
    postMeSendEmailConfirmation: () => {
      const base = 'POST:/v1/users/me/send-email-confirmation' as const

      return {
        baseKey: dataTaggedQueryKey<PostMeSendEmailConfirmationData>([base]),
        requestKey: () => dataTaggedQueryKey<PostMeSendEmailConfirmationData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<PostMeSendEmailConfirmationData>({
            path: `/v1/users/me/send-email-confirmation`,
            method: 'POST',
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMeAvatarPresignedFields
     * @request GET:/v1/users/me/avatar/presigned-fields
     */
    getMeAvatarPresignedFields: () => {
      const base = 'GET:/v1/users/me/avatar/presigned-fields' as const

      return {
        baseKey: dataTaggedQueryKey<GetMeAvatarPresignedFieldsData>([base]),
        requestKey: (params: GetMeAvatarPresignedFieldsParams) =>
          dataTaggedQueryKey<GetMeAvatarPresignedFieldsData>([base, params]),
        request: (query: GetMeAvatarPresignedFieldsParams, params: RequestParams = {}) =>
          this.request<GetMeAvatarPresignedFieldsData>({
            path: `/v1/users/me/avatar/presigned-fields`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * No description
     *
     * @name GetMeCoverPhotoPresignedFields
     * @request GET:/v1/users/me/cover-photo/presigned-fields
     */
    getMeCoverPhotoPresignedFields: () => {
      const base = 'GET:/v1/users/me/cover-photo/presigned-fields' as const

      return {
        baseKey: dataTaggedQueryKey<GetMeCoverPhotoPresignedFieldsData>([base]),
        requestKey: (params: GetMeCoverPhotoPresignedFieldsParams) =>
          dataTaggedQueryKey<GetMeCoverPhotoPresignedFieldsData>([base, params]),
        request: (query: GetMeCoverPhotoPresignedFieldsParams, params: RequestParams = {}) =>
          this.request<GetMeCoverPhotoPresignedFieldsData>({
            path: `/v1/users/me/cover-photo/presigned-fields`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    }
  }
  pushSubscriptions = {
    /**
     * No description
     *
     * @name PostPushSubscriptions
     * @request POST:/v1/push_subscriptions
     */
    postPushSubscriptions: () => {
      const base = 'POST:/v1/push_subscriptions' as const

      return {
        baseKey: dataTaggedQueryKey<PostPushSubscriptionsData>([base]),
        requestKey: () => dataTaggedQueryKey<PostPushSubscriptionsData>([base]),
        request: (data: WebPushSubscriptionsPostRequest, params: RequestParams = {}) =>
          this.request<PostPushSubscriptionsData>({
            path: `/v1/push_subscriptions`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    }
  }
  members = {
    /**
     * @description Creates a new chat message in a direct message thread with a user.
     *
     * @name PostMembersMessagesV2
     * @summary Create DM
     * @request POST:/v2/members/{member_id}/messages
     */
    postMembersMessagesV2: () => {
      const base = 'POST:/v2/members/{member_id}/messages' as const

      return {
        baseKey: dataTaggedQueryKey<PostMembersMessagesV2Data>([base]),
        requestKey: (memberId: string) => dataTaggedQueryKey<PostMembersMessagesV2Data>([base, memberId]),
        request: (memberId: string, data: V2MemberMessagesPostRequest, params: RequestParams = {}) =>
          this.request<PostMembersMessagesV2Data>({
            path: `/v2/members/${memberId}/messages`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * @description Lists all members of the organization.
     *
     * @name GetMembersV2
     * @summary List members
     * @request GET:/v2/members
     */
    getMembersV2: () => {
      const base = 'GET:/v2/members' as const

      return {
        baseKey: dataTaggedQueryKey<GetMembersV2Data>([base]),
        requestKey: (params: GetMembersV2Params) => dataTaggedQueryKey<GetMembersV2Data>([base, params]),
        request: (query: GetMembersV2Params, params: RequestParams = {}) =>
          this.request<GetMembersV2Data>({
            path: `/v2/members`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    }
  }
  posts = {
    /**
     * @description Lists all comments on a post.
     *
     * @name GetPostsCommentsV2
     * @summary List comments
     * @request GET:/v2/posts/{post_id}/comments
     */
    getPostsCommentsV2: () => {
      const base = 'GET:/v2/posts/{post_id}/comments' as const

      return {
        baseKey: dataTaggedQueryKey<GetPostsCommentsV2Data>([base]),
        requestKey: (params: GetPostsCommentsV2Params) => dataTaggedQueryKey<GetPostsCommentsV2Data>([base, params]),
        request: ({ postId, ...query }: GetPostsCommentsV2Params, params: RequestParams = {}) =>
          this.request<GetPostsCommentsV2Data>({
            path: `/v2/posts/${postId}/comments`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * @description Creates a new comment on a post.
     *
     * @name PostPostsCommentsV2
     * @summary Create comment
     * @request POST:/v2/posts/{post_id}/comments
     */
    postPostsCommentsV2: () => {
      const base = 'POST:/v2/posts/{post_id}/comments' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsCommentsV2Data>([base]),
        requestKey: (postId: string) => dataTaggedQueryKey<PostPostsCommentsV2Data>([base, postId]),
        request: (postId: string, data: V2PostsPostIdCommentsPostRequest, params: RequestParams = {}) =>
          this.request<PostPostsCommentsV2Data>({
            path: `/v2/posts/${postId}/comments`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * @description Resolves a post with an optional message or resolving comment.
     *
     * @name PostPostsResolutionV2
     * @summary Resolve post
     * @request POST:/v2/posts/{post_id}/resolution
     */
    postPostsResolutionV2: () => {
      const base = 'POST:/v2/posts/{post_id}/resolution' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsResolutionV2Data>([base]),
        requestKey: (postId: string) => dataTaggedQueryKey<PostPostsResolutionV2Data>([base, postId]),
        request: (postId: string, data: V2PostsPostIdResolutionPostRequest, params: RequestParams = {}) =>
          this.request<PostPostsResolutionV2Data>({
            path: `/v2/posts/${postId}/resolution`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * @description Unresolves a post.
     *
     * @name DeletePostsResolutionV2
     * @summary Unresolve post
     * @request DELETE:/v2/posts/{post_id}/resolution
     */
    deletePostsResolutionV2: () => {
      const base = 'DELETE:/v2/posts/{post_id}/resolution' as const

      return {
        baseKey: dataTaggedQueryKey<DeletePostsResolutionV2Data>([base]),
        requestKey: (postId: string) => dataTaggedQueryKey<DeletePostsResolutionV2Data>([base, postId]),
        request: (postId: string, params: RequestParams = {}) =>
          this.request<DeletePostsResolutionV2Data>({
            path: `/v2/posts/${postId}/resolution`,
            method: 'DELETE',
            ...params
          })
      }
    },

    /**
     * @description Lists posts.
     *
     * @name GetPostsV2
     * @summary List posts
     * @request GET:/v2/posts
     */
    getPostsV2: () => {
      const base = 'GET:/v2/posts' as const

      return {
        baseKey: dataTaggedQueryKey<GetPostsV2Data>([base]),
        requestKey: (params: GetPostsV2Params) => dataTaggedQueryKey<GetPostsV2Data>([base, params]),
        request: (query: GetPostsV2Params, params: RequestParams = {}) =>
          this.request<GetPostsV2Data>({
            path: `/v2/posts`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * @description Creates a new post.
     *
     * @name PostPostsV2
     * @summary Create post
     * @request POST:/v2/posts
     */
    postPostsV2: () => {
      const base = 'POST:/v2/posts' as const

      return {
        baseKey: dataTaggedQueryKey<PostPostsV2Data>([base]),
        requestKey: () => dataTaggedQueryKey<PostPostsV2Data>([base]),
        request: (data: V2PostsPostRequest, params: RequestParams = {}) =>
          this.request<PostPostsV2Data>({
            path: `/v2/posts`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * @description Gets a post.
     *
     * @name GetPostsByIdV2
     * @summary Get post
     * @request GET:/v2/posts/{id}
     */
    getPostsByIdV2: () => {
      const base = 'GET:/v2/posts/{id}' as const

      return {
        baseKey: dataTaggedQueryKey<GetPostsByIdV2Data>([base]),
        requestKey: (id: string) => dataTaggedQueryKey<GetPostsByIdV2Data>([base, id]),
        request: (id: string, params: RequestParams = {}) =>
          this.request<GetPostsByIdV2Data>({
            path: `/v2/posts/${id}`,
            method: 'GET',
            ...params
          })
      }
    }
  }
  channels = {
    /**
     * @description Lists all channels in your organization.
     *
     * @name GetChannelsV2
     * @summary List channels
     * @request GET:/v2/channels
     */
    getChannelsV2: () => {
      const base = 'GET:/v2/channels' as const

      return {
        baseKey: dataTaggedQueryKey<GetChannelsV2Data>([base]),
        requestKey: (params: GetChannelsV2Params) => dataTaggedQueryKey<GetChannelsV2Data>([base, params]),
        request: (query: GetChannelsV2Params, params: RequestParams = {}) =>
          this.request<GetChannelsV2Data>({
            path: `/v2/channels`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    }
  }
  threads = {
    /**
     * @description Lists all messages in a thread.
     *
     * @name GetThreadsMessagesV2
     * @summary List messages
     * @request GET:/v2/threads/{thread_id}/messages
     */
    getThreadsMessagesV2: () => {
      const base = 'GET:/v2/threads/{thread_id}/messages' as const

      return {
        baseKey: dataTaggedQueryKey<GetThreadsMessagesV2Data>([base]),
        requestKey: (params: GetThreadsMessagesV2Params) =>
          dataTaggedQueryKey<GetThreadsMessagesV2Data>([base, params]),
        request: ({ threadId, ...query }: GetThreadsMessagesV2Params, params: RequestParams = {}) =>
          this.request<GetThreadsMessagesV2Data>({
            path: `/v2/threads/${threadId}/messages`,
            method: 'GET',
            query: query,
            ...params
          })
      }
    },

    /**
     * @description Creates a new chat message.
     *
     * @name PostThreadsMessagesV2
     * @summary Create message
     * @request POST:/v2/threads/{thread_id}/messages
     */
    postThreadsMessagesV2: () => {
      const base = 'POST:/v2/threads/{thread_id}/messages' as const

      return {
        baseKey: dataTaggedQueryKey<PostThreadsMessagesV2Data>([base]),
        requestKey: (threadId: string) => dataTaggedQueryKey<PostThreadsMessagesV2Data>([base, threadId]),
        request: (threadId: string, data: V2ThreadsThreadIdMessagesPostRequest, params: RequestParams = {}) =>
          this.request<PostThreadsMessagesV2Data>({
            path: `/v2/threads/${threadId}/messages`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    },

    /**
     * @description Creates a new thread.
     *
     * @name PostThreadsV2
     * @summary Create thread
     * @request POST:/v2/threads
     */
    postThreadsV2: () => {
      const base = 'POST:/v2/threads' as const

      return {
        baseKey: dataTaggedQueryKey<PostThreadsV2Data>([base]),
        requestKey: () => dataTaggedQueryKey<PostThreadsV2Data>([base]),
        request: (data: V2ThreadsPostRequest, params: RequestParams = {}) =>
          this.request<PostThreadsV2Data>({
            path: `/v2/threads`,
            method: 'POST',
            body: data,
            type: ContentType.Json,
            ...params
          })
      }
    }
  }
  figma = {
    /**
     * No description
     *
     * @name PostSignInFigma
     * @request POST:/sign-in/figma
     */
    postSignInFigma: () => {
      const base = 'POST:/sign-in/figma' as const

      return {
        baseKey: dataTaggedQueryKey<PostSignInFigmaData>([base]),
        requestKey: () => dataTaggedQueryKey<PostSignInFigmaData>([base]),
        request: (params: RequestParams = {}) =>
          this.request<PostSignInFigmaData>({
            path: `/sign-in/figma`,
            method: 'POST',
            ...params
          })
      }
    }
  }
}
