# Schema Gap Audit

This file is the table-level audit of the legacy Rails schema versus the current Convex schema.

Use it to answer one specific question:

- have we fully migrated the backend data model off the legacy stack?

The current answer is `not fully in operational terms`.

For the sequenced execution plan, see [docs/convex-migration-plan.md](/Users/declancowen/Documents/GitHub/Campsite/docs/convex-migration-plan.md).
For the explicit all-`94`-tables replication inventory, see [docs/legacy-table-replication-plan.md](/Users/declancowen/Documents/GitHub/Campsite/docs/legacy-table-replication-plan.md).

## Snapshot

- Legacy Rails schema tables in [api/db/schema.rb](/Users/declancowen/Documents/GitHub/Campsite/api/db/schema.rb): `94`
- Current Convex tables in [convex/schema.ts](/Users/declancowen/Documents/GitHub/Campsite/convex/schema.ts): `96`

That means all legacy Rails tables are now represented in first-class Convex storage, with some extra support tables on top. The remaining work is cutover validation and full behavior/service decommission, plus historical backfill only if legacy data must be preserved.

Under the current migration rule, completion means all `94` legacy tables are explicitly replicated or consciously de-scoped by user decision. We are not treating merge/drop assumptions as completion.

## What this means

- A large part of the runtime request path has moved to `Vercel + WorkOS + Convex`
- The existing Campsite UI can already use many same-host `/v1/...` routes instead of the old Rails API
- But the legacy backend has not been fully removed at the schema/business-logic level
- Several domains still rely on compatibility responses, simplified persistence, or are deferred entirely

## Current Convex table set

The current Convex schema includes:

- `files`
- `attachments`
- `subjectViews`
- `noteViews`
- `postViews`
- `nonMemberNoteViews`
- `nonMemberPostViews`
- `users`
- `organizations`
- `tags`
- `organizationMemberships`
- `organizationMembershipStatuses`
- `notificationSchedules`
- `scheduledNotifications`
- `notifications`
- `favorites`
- `subscriptions`
- `followUps`
- `reactions`
- `customReactions`
- `organizationMembershipRequests`
- `projects`
- `projectBookmarks`
- `projectDisplayPreferences`
- `projectPins`
- `projectMemberships`
- `projectViews`
- `organizationInvitations`
- `organizationInvitationProjects`
- `organizationSettings`
- `permissions`
- `posts`
- `postTaggings`
- `polls`
- `pollOptions`
- `pollVotes`
- `postFeedbackRequests`
- `openGraphLinks`
- `postDigests`
- `postDigestBasicPosts`
- `postDigestNotes`
- `postHierarchies`
- `postLinkPreviews`
- `postLinks`
- `notes`
- `comments`
- `calls`
- `callRooms`
- `callRoomInvitations`
- `callPeers`
- `callRecordings`
- `callRecordingChatLinks`
- `callRecordingSpeakers`
- `callRecordingSummarySections`
- `messageThreads`
- `messageThreadMemberships`
- `messageThreadMembershipUpdates`
- `messages`
- `messageNotifications`
- `oauthApplications`
- `oauthAccessTokens`
- `oauthAccessGrants`
- `pushSubscriptions`
- `productLogs`
- `timelineEvents`
- `preferences`
- `userPreferences`
- `emailBounces`
- `friendlyIdSlugs`
- `integrations`
- `integrationTeams`
- `integrationChannels`
- `integrationChannelMembers`
- `integrationData`
- `integrationOrganizationMemberships`
- `integrationOrganizationMembershipData`
- `externalRecords`
- `figmaFiles`
- `figmaKeyPairs`
- `figmaUsers`
- `githubRepositories`
- `webhooks`
- `webhookEvents`
- `webhookDeliveries`
- `console1984Users`
- `console1984Sessions`
- `console1984SensitiveAccesses`
- `console1984Commands`
- `dataExports`
- `dataExportResources`
- `events`
- `feedbacks`
- `flipperFeatures`
- `flipperGates`
- `flipperAuditLogs`
- `llmResponses`

## Category 1: Clearly represented in Convex

These legacy tables now have a direct or near-direct Convex equivalent:

- `users` -> `users`
- `organizations` -> `organizations`
- `organization_memberships` -> `organizationMemberships`
- `organization_membership_requests` -> `organizationMembershipRequests`
- `organization_membership_statuses` -> `organizationMembershipStatuses`
- `organization_invitations` -> `organizationInvitations`
- `organization_invitation_projects` -> `organizationInvitationProjects`
- `organization_settings` -> `organizationSettings`
- `permissions` -> `permissions`
- `notification_schedules` -> `notificationSchedules`
- `scheduled_notifications` -> `scheduledNotifications`
- `notifications` -> `notifications`
- `favorites` -> `favorites`
- `follow_ups` -> `followUps`
- `reactions` -> `reactions`
- `custom_reactions` -> `customReactions`
- `projects` -> `projects`
- `project_memberships` -> `projectMemberships`
- `project_pins` -> `projectPins`
- `project_display_preferences` -> `projectDisplayPreferences`
- `bookmarks` -> `projectBookmarks`
- `project_views` -> `projectViews`
- `posts` -> `posts`
- `post_taggings` -> `postTaggings`
- `polls` -> `polls`
- `poll_options` -> `pollOptions`
- `poll_votes` -> `pollVotes`
- `post_feedback_requests` -> `postFeedbackRequests`
- `open_graph_links` -> `openGraphLinks`
- `post_digests` -> `postDigests`
- `post_digest_basic_posts` -> `postDigestBasicPosts`
- `post_digest_notes` -> `postDigestNotes`
- `post_hierarchies` -> `postHierarchies`
- `post_link_previews` -> `postLinkPreviews`
- `post_links` -> `postLinks`
- `note_views` -> `noteViews`
- `post_views` -> `postViews`
- `non_member_note_views` -> `nonMemberNoteViews`
- `non_member_post_views` -> `nonMemberPostViews`
- `notes` -> `notes`
- `comments` -> `comments`
- `calls` -> `calls`
- `call_rooms` -> `callRooms`
- `call_room_invitations` -> `callRoomInvitations`
- `call_peers` -> `callPeers`
- `call_recordings` -> `callRecordings`
- `call_recording_chat_links` -> `callRecordingChatLinks`
- `call_recording_speakers` -> `callRecordingSpeakers`
- `call_recording_summary_sections` -> `callRecordingSummarySections`
- `oauth_applications` -> `oauthApplications`
- `oauth_access_tokens` -> `oauthAccessTokens`
- `oauth_access_grants` -> `oauthAccessGrants`
- `product_logs` -> `productLogs`
- `timeline_events` -> `timelineEvents`
- `web_push_subscriptions` -> `pushSubscriptions`
- `tags` -> `tags`
- `preferences` -> `preferences`
- `user_preferences` -> `userPreferences`
- `email_bounces` -> `emailBounces`
- `friendly_id_slugs` -> `friendlyIdSlugs`
- `integrations` -> `integrations`
- `integration_teams` -> `integrationTeams`
- `integration_channels` -> `integrationChannels`
- `integration_channel_members` -> `integrationChannelMembers`
- `integration_data` -> `integrationData`
- `integration_organization_memberships` -> `integrationOrganizationMemberships`
- `integration_organization_membership_data` -> `integrationOrganizationMembershipData`
- `external_records` -> `externalRecords`
- `figma_files` -> `figmaFiles`
- `figma_key_pairs` -> `figmaKeyPairs`
- `figma_users` -> `figmaUsers`
- `github_repositories` -> `githubRepositories`
- `webhooks` -> `webhooks`
- `webhook_events` -> `webhookEvents`
- `webhook_deliveries` -> `webhookDeliveries`
- `console1984_users` -> `console1984Users`
- `console1984_sessions` -> `console1984Sessions`
- `console1984_sensitive_accesses` -> `console1984SensitiveAccesses`
- `console1984_commands` -> `console1984Commands`
- `data_exports` -> `dataExports`
- `data_export_resources` -> `dataExportResources`
- `events` -> `events`
- `feedbacks` -> `feedbacks`
- `flipper_features` -> `flipperFeatures`
- `flipper_gates` -> `flipperGates`
- `flipper_audit_logs` -> `flipperAuditLogs`
- `llm_responses` -> `llmResponses`

Important qualifier:

- direct representation does not mean full behavioral parity
- the remaining major gaps are now concentrated in backfill, cutover validation, and service decommission rather than missing first-class schema

## Category 2: Represented, but still simplified or compatibility-only

These domains exist in Convex, but not yet with full legacy parity:

- `files` replacing only part of the old attachment/media stack
- `attachments`
  shared attachment rows now exist and back the new same-host attachment routes, but deeper media-processing/backfill parity is still incomplete
- `subjectViews`
  a shared view table still exists for compatibility and generic viewer state, but the legacy content-specific post/note/non-member view tables are now first-class too
- `notes`
  note routes exist, but shared dedicated note persistence is still newer and not yet fully feature-complete
- `calls`
  first-class call rows now back same-host call reads, thread-linked active calls, and call-room peer payloads; remaining 100ms verification is now cutover work rather than a missing table/runtime gap
- `callRecordings`
  dedicated recording rows now exist and same-host recording/transcription routes now read from them, but richer recording-processing parity and chat-link ingestion are still incomplete
- `callRecordingSpeakers`
  dedicated speaker rows now exist, but automatic speaker/member matching and transcript enrichment still need deeper parity
- `messageThreads`
  dedicated thread rows now back same-host thread reads, project linkage, call-room linkage, and active-call serialization; blob promotion remains only as a cutover/backfill bridge
- `messageThreadMemberships`
  dedicated membership rows now back unread counts, read/unread toggles, notification levels, and thread membership state in the live compatibility routes; remaining validation is cutover work
- `messages`
  dedicated message rows now back message reads, replies, attachments, message-call payloads, shared-post URLs, and grouped reactions in the live same-host routes; blob promotion remains only as a cutover/backfill bridge
- `projectPins`
  shared pin persistence exists, but the old pin/feed behavior was previously compatibility-only and still needs full validation
- `projectDisplayPreferences`
  project-level defaults live on `projects` and per-membership overrides live in `projectDisplayPreferences`; remaining validation is no longer a first-class table gap
- `projectViews`
  explicit project view rows back the same-host read/unread/view routes and project/thread unread cross-links; remaining analytics validation is cutover work
- `timelineEvents`
  durable table exists and post resolve/unresolve now writes into it, but the broader old timeline side effects and fan-out behavior are still incomplete
- `subscriptions`
  Convex table exists, but legacy auto-subscribe and notification side effects still need parity verification
- `notifications`
  table and routes exist, but inbox/realtime/status coupling is still only partially complete
- `organizationMembershipStatuses`
  first-class table now exists and viewer-status routes now dual-write through it, but broader historical/status-shell parity is still incomplete
- `organizationSettings`
  first-class table now exists and org serializers now have a real settings source, but only the current enforced-2FA shell is represented so far
- `preferences`
  first-class table now exists and user preference writes now dual-write through it, but broader polymorphic preference parity is still incomplete
- `userPreferences`
  first-class table now exists and current-user preference/state writes now dual-write through it, but broader historical/account shell parity is still incomplete
- `organizationInvitationProjects`
  first-class join table now exists and invitation create/read now sync through it, but wider invitation-project parity still needs validation
- `permissions`
  first-class table now exists, but the existing note/call permission surfaces are not fully cut over to it yet
- `oauthApplications`
  first-class oauth application, token, and grant tables now exist and the same-host oauth app routes read/write them, but deeper Doorkeeper parity and webhook delivery side effects still need validation
- `polls`
  dedicated poll, option, vote, feedback-request, post-tagging, digest, hierarchy, link-preview, and open-graph tables now exist and the same-host content routes read/write them; the main remaining work is downstream collaboration/backfill, not missing Slice 2 storage
- `posts`
  posts now carry durable `version` and `rootPostId` fields and also sync first-class `post_hierarchies`, `post_links`, `post_link_previews`, `post_views`, and digest rows. Remaining work is broader collaboration/backfill, not missing Slice 2 schema

## Category 3: Remaining legacy product tables still outside Slice 1-4

The main missing first-class tables are now concentrated in Slice 5 rather than the core content/media/platform model:

- admin/audit/export tables
- backfill/decommission support tables

### Membership/status shell

Current state:

- the missing first-class status/settings/preferences tables now exist in Convex
- current user/org/status flows now dual-write through them
- the legacy shell itself is now substantially cut over:
  - settings/preferences/membership status now have first-class shell tables
  - organization slug history now resolves through `friendlyIdSlugs`
  - note permissions now use the shared `permissions` table in active runtime paths
  - the main remaining gaps are deeper cross-domain side effects and the still-missing non-Slice-1 tables

## Category 4: Legacy integrations and external-system tables now first-class

These now have first-class Convex representation and owned same-host runtime coverage:

- `integrations`
- `integration_teams`
- `integration_channels`
- `integration_channel_members`
- `integration_data`
- `integration_organization_memberships`
- `integration_organization_membership_data`
- `github_repositories`
- `figma_files`
- `figma_key_pairs`
- `figma_users`
- `external_records`
- `webhooks`
- `webhook_events`
- `webhook_deliveries`

The remaining work for them is live provider verification/backfill, not missing schema or legacy-host route ownership.

## Category 5: Operational tables are now first-class too

The remaining legacy operational/admin/export tables are now represented in Convex as well:

- `console1984_commands`
- `console1984_sensitive_accesses`
- `console1984_sessions`
- `console1984_users`
- `flipper_audit_logs`
- `flipper_features`
- `flipper_gates`
- `data_exports`
- `data_export_resources`
- `events`
- `feedbacks`
- `llm_responses`

The important remaining work for this category is not schema creation. It is:

- backfilling legacy records where they still matter
- validating the owned export/feedback/audit paths in live use
- removing old service/job assumptions

## Bottom line

What is true now:

- core auth and a large amount of app routing no longer depend on the old Campsite-owned API hosts
- many major CRUD families are available through same-host Vercel routes backed by Convex
- the codebase has meaningful migration progress

What is not yet true:

- full historical-data cutover into the new schema
- full business-logic parity
- full behavior parity for attachments/views, richer thread/message behavior, richer call lifecycle parity, and the operational side effects that used to live in jobs/services

## Highest-priority remaining schema gaps

If the goal is a true backend replacement rather than a compatibility layer, the next schema-level priorities are:

1. Backfill support
   - load historical data into the now-first-class Slice 1-5 tables
2. Cutover validation
   - validate collaboration, platform, and media domains against real migrated data
3. Legacy decommission
   - remove the remaining old-service assumptions after backfill and smoke checks

## Source references

- Legacy schema: [api/db/schema.rb](/Users/declancowen/Documents/GitHub/Campsite/api/db/schema.rb)
- Current Convex schema: [convex/schema.ts](/Users/declancowen/Documents/GitHub/Campsite/convex/schema.ts)
- Endpoint inventory: [docs/endpoint-inventory.md](/Users/declancowen/Documents/GitHub/Campsite/docs/endpoint-inventory.md)
- CRUD matrix: [docs/crud-migration-matrix.md](/Users/declancowen/Documents/GitHub/Campsite/docs/crud-migration-matrix.md)
- Legacy logic audit: [docs/legacy-logic-audit.md](/Users/declancowen/Documents/GitHub/Campsite/docs/legacy-logic-audit.md)
