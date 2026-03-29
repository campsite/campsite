# Schema Gap Audit

This file is the table-level audit of the legacy Rails schema versus the current Convex schema.

Use it to answer one specific question:

- have we fully migrated the backend data model off the legacy stack?

The current answer is `no`.

For the sequenced execution plan, see [docs/convex-migration-plan.md](/Users/declancowen/Documents/GitHub/Campsite/docs/convex-migration-plan.md).

## Snapshot

- Legacy Rails schema tables in [api/db/schema.rb](/Users/declancowen/Documents/GitHub/Campsite/api/db/schema.rb): `94`
- Current Convex tables in [convex/schema.ts](/Users/declancowen/Documents/GitHub/Campsite/convex/schema.ts): `32`

That means the app now has a substantial compatibility migration layer, but not full data-model parity.

## What this means

- A large part of the runtime request path has moved to `Vercel + WorkOS + Convex`
- The existing Campsite UI can already use many same-host `/v1/...` routes instead of the old Rails API
- But the legacy backend has not been fully removed at the schema/business-logic level
- Several domains still rely on compatibility responses, simplified persistence, or are deferred entirely

## Current Convex table set

The current Convex schema includes:

- `files`
- `users`
- `organizations`
- `tags`
- `organizationMemberships`
- `notificationSchedules`
- `scheduledNotifications`
- `notifications`
- `favorites`
- `subscriptions`
- `followUps`
- `reactions`
- `organizationMembershipRequests`
- `projects`
- `projectBookmarks`
- `projectPins`
- `projectMemberships`
- `organizationInvitations`
- `posts`
- `notes`
- `comments`
- `calls`
- `callRooms`
- `callRoomInvitations`
- `messageThreads`
- `messageThreadMemberships`
- `messageThreadMembershipUpdates`
- `messages`
- `messageNotifications`
- `pushSubscriptions`
- `productLogs`
- `timelineEvents`

## Category 1: Clearly represented in Convex

These legacy tables now have a direct or near-direct Convex equivalent:

- `users` -> `users`
- `organizations` -> `organizations`
- `organization_memberships` -> `organizationMemberships`
- `organization_membership_requests` -> `organizationMembershipRequests`
- `organization_invitations` -> `organizationInvitations`
- `notification_schedules` -> `notificationSchedules`
- `scheduled_notifications` -> `scheduledNotifications`
- `notifications` -> `notifications`
- `favorites` -> `favorites`
- `follow_ups` -> `followUps`
- `reactions` -> `reactions`
- `projects` -> `projects`
- `project_memberships` -> `projectMemberships`
- `project_pins` -> `projectPins`
- `bookmarks` -> `projectBookmarks`
- `posts` -> `posts`
- `notes` -> `notes`
- `comments` -> `comments`
- `calls` -> `calls`
- `call_rooms` -> `callRooms`
- `call_room_invitations` -> `callRoomInvitations`
- `product_logs` -> `productLogs`
- `timeline_events` -> `timelineEvents`
- `web_push_subscriptions` -> `pushSubscriptions`
- `tags` -> `tags`

Important qualifier:

- direct representation does not mean full behavioral parity
- several of these are still marked `partial` in [docs/crud-migration-matrix.md](/Users/declancowen/Documents/GitHub/Campsite/docs/crud-migration-matrix.md)

## Category 2: Represented, but still simplified or compatibility-only

These domains exist in Convex, but not yet with full legacy parity:

- `files` replacing only part of the old attachment/media stack
- `notes`
  note routes exist, but shared dedicated note persistence is still newer and not yet fully feature-complete
- `calls`
  call routes exist, but recordings/transcripts/100ms lifecycle parity is still incomplete
- `messageThreads`
  dedicated tables now exist, but the compat blob layer in `convex/threads.ts` still needs to be cut over onto them
- `messageThreadMemberships`
  dedicated tables now exist, but unread/read, notification level, and membership update logic still needs to move onto them
- `messages`
  dedicated tables now exist, but message history and notification side effects are still routed through the compatibility layer
- `projectPins`
  shared pin persistence exists, but the old pin/feed behavior was previously compatibility-only and still needs full validation
- `timelineEvents`
  durable table exists, but the old timeline side effects and fan-out behavior are still incomplete
- `subscriptions`
  Convex table exists, but legacy auto-subscribe and notification side effects still need parity verification
- `notifications`
  table and routes exist, but inbox/realtime/status coupling is still only partially complete

## Category 3: Legacy product tables with no current Convex equivalent

These are product-facing legacy tables that do not currently have a first-class Convex table:

### Attachments and media

- `attachments`
- `post_link_previews`
- `open_graph_links`
- `post_views`
- `note_views`
- `non_member_post_views`
- `non_member_note_views`
- `project_views`

Current state:

- uploads and file metadata are partially routed through `files`
- view tracking and attachment-specific counters/previews are not fully modeled in Convex

### Post workflow and content structure

- `polls`
- `poll_options`
- `poll_votes`
- `post_feedback_requests`
- `post_hierarchies`
- `post_links`
- `post_taggings`
- `post_digest_basic_posts`
- `post_digest_notes`
- `post_digests`

Current state:

- posts exist in Convex
- but the richer poll, digest, hierarchy, tagging, and feedback-request model is not fully ported at the schema level

### Membership/status shell

- `organization_membership_statuses`
- `organization_settings`
- `permissions`
- `preferences`
- `user_preferences`

Current state:

- some of this behavior is flattened into `users`, `organizationMemberships`, and preferences maps
- but the legacy data model is not fully recreated

### Call recordings and richer call analytics

- `call_peers`
- `call_recordings`
- `call_recording_chat_links`
- `call_recording_speakers`
- `call_recording_summary_sections`

Current state:

- calls and call rooms exist
- recording/transcript/speaker summary parity is not yet represented in Convex tables

### OAuth and application surfaces

- `oauth_applications`
- `oauth_access_tokens`
- `oauth_access_grants`

Current state:

- same-host oauth app routes exist in the web layer
- but there is no first-class Convex schema family for the legacy Doorkeeper-style model

## Category 4: Legacy integrations and external-system tables still not migrated

These remain legacy/deferred and should not be considered migrated:

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

## Category 5: Admin, operational, or platform tables not migrated

These are not core app CRUD, but they do exist in Rails and are not ported:

- `console1984_commands`
- `console1984_sensitive_accesses`
- `console1984_sessions`
- `console1984_users`
- `flipper_audit_logs`
- `flipper_features`
- `flipper_gates`
- `data_exports`
- `data_export_resources`
- `email_bounces`
- `events`
- `feedbacks`
- `llm_responses`
- `friendly_id_slugs`

These may be acceptable to defer, but they are part of the answer to “have we fully migrated the backend?” The answer remains `no`.

## Bottom line

What is true now:

- core auth and a large amount of app routing no longer depend on the old Campsite-owned API hosts
- many major CRUD families are available through same-host Vercel routes backed by Convex
- the codebase has meaningful migration progress

What is not yet true:

- full Rails schema parity
- full business-logic parity
- full domain-model parity for attachments/views, polls/digests, richer thread/message behavior, recordings, and integrations

## Highest-priority remaining schema gaps

If the goal is a true backend replacement rather than a compatibility layer, the next schema-level priorities are:

1. Thread and message cutover
   - move `convex/threads.ts` off blob-backed compat storage and onto the dedicated Convex tables
2. Attachments and view tracking
   - dedicated attachment records plus post/note/project view tracking
3. Polls and post workflow tables
   - polls, options, votes, feedback-request structure, hierarchy/version helpers
4. Call recordings and summaries
   - recordings, speakers, summary sections, peer/session detail
5. OAuth application storage
   - if those app settings remain in product scope

## Source references

- Legacy schema: [api/db/schema.rb](/Users/declancowen/Documents/GitHub/Campsite/api/db/schema.rb)
- Current Convex schema: [convex/schema.ts](/Users/declancowen/Documents/GitHub/Campsite/convex/schema.ts)
- Endpoint inventory: [docs/endpoint-inventory.md](/Users/declancowen/Documents/GitHub/Campsite/docs/endpoint-inventory.md)
- CRUD matrix: [docs/crud-migration-matrix.md](/Users/declancowen/Documents/GitHub/Campsite/docs/crud-migration-matrix.md)
- Legacy logic audit: [docs/legacy-logic-audit.md](/Users/declancowen/Documents/GitHub/Campsite/docs/legacy-logic-audit.md)
