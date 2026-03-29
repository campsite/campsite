# Legacy Table Replication Plan

This file is the explicit table-by-table replication plan for the legacy Rails schema.

Rule for this migration:

- we are not treating table consolidation as "done"
- we are not treating dropped tables as "done"
- completion means all `94` legacy Rails tables are explicitly accounted for and replicated on the owned stack, unless the user later makes a conscious decision to de-scope a table

Use this file for two things:

1. confirm that all `94` legacy tables are covered by the migration plan
2. execute the remaining work in `5` large slices instead of many small slices

Status labels:

- `done`
  first-class Convex table exists and the main same-host routes already use it
- `partial`
  Convex table exists, but behavior/backfill/parity is still incomplete
- `planned`
  no first-class Convex table yet, or the legacy table is still only covered by flattened compatibility behavior

## Snapshot

- legacy Rails tables: `94`
- current first-class Convex tables: `96`
- remaining legacy tables still not first-class in Convex: `0`

## Slice 1: Identity, Org Shell, Settings, Notifications

Goal:

- finish the account/org shell so the user/member/org settings stack is first-class and no longer flattened through compatibility-only fields
- this slice covers the shell/runtime ownership for identity, settings, status, notification schedules, inbox routes, slug history, and related replication tables
- richer notification fan-out caused by posts, notes, threads, reactions, and follow-ups is tracked in the later content/collaboration slices instead of keeping Slice 1 permanently open

Tables in this slice:

- `users` -> `done`
- `organizations` -> `done`
- `organization_memberships` -> `done`
- `organization_membership_requests` -> `done`
- `organization_membership_statuses` -> `done`
- `organization_invitations` -> `done`
- `organization_invitation_projects` -> `done`
- `organization_settings` -> `done`
- `permissions` -> `done`
- `preferences` -> `done`
- `user_preferences` -> `done`
- `notification_schedules` -> `done`
- `scheduled_notifications` -> `done`
- `notifications` -> `done`
- `web_push_subscriptions` -> `done`
- `product_logs` -> `done`
- `email_bounces` -> `done`
- `friendly_id_slugs` -> `done`

## Slice 2: Content, Workflow, Media, Engagement

Goal:

- finish the main content model, attachment/media parity, and engagement/workflow side effects around posts, comments, notes, polls, tags, favorites, reactions, and subscriptions

Tables in this slice:

- `attachments` -> `done`
- `comments` -> `done`
- `custom_reactions` -> `done`
- `favorites` -> `done`
- `follow_ups` -> `done`
- `notes` -> `done`
- `non_member_note_views` -> `done`
- `non_member_post_views` -> `done`
- `note_views` -> `done`
- `open_graph_links` -> `done`
- `poll_options` -> `done`
- `poll_votes` -> `done`
- `polls` -> `done`
- `post_digest_basic_posts` -> `done`
- `post_digest_notes` -> `done`
- `post_digests` -> `done`
- `post_feedback_requests` -> `done`
- `post_hierarchies` -> `done`
- `post_link_previews` -> `done`
- `post_links` -> `done`
- `post_taggings` -> `done`
- `post_views` -> `done`
- `posts` -> `done`
- `reactions` -> `done`
- `tags` -> `done`
- `timeline_events` -> `done`
- `user_subscriptions` -> `done`

## Slice 3: Projects, Threads, Messages, Calls, Collaboration

Goal:

- finish the collaboration and workspace runtime model: projects, chat, unread state, calls, recordings, project feeds, bookmarks, pins, and collaboration views

Tables in this slice:

- `bookmarks` -> `done`
- `call_peers` -> `done`
- `call_recording_chat_links` -> `done`
- `call_recording_speakers` -> `done`
- `call_recording_summary_sections` -> `done`
- `call_recordings` -> `done`
- `call_room_invitations` -> `done`
- `call_rooms` -> `done`
- `calls` -> `done`
- `message_notifications` -> `done`
- `message_thread_membership_updates` -> `done`
- `message_thread_memberships` -> `done`
- `message_threads` -> `done`
- `messages` -> `done`
- `project_display_preferences` -> `done`
- `project_memberships` -> `done`
- `project_pins` -> `done`
- `project_views` -> `done`
- `projects` -> `done`

## Slice 4: OAuth, Integrations, Search, External Platform Surfaces

Goal:

- finish the external-facing app/platform layer that still exists only in Rails or only as compatibility behavior

Tables in this slice:

- `external_records` -> `done`
- `figma_files` -> `done`
- `figma_key_pairs` -> `done`
- `figma_users` -> `done`
- `github_repositories` -> `done`
- `integration_channel_members` -> `done`
- `integration_channels` -> `done`
- `integration_data` -> `done`
- `integration_organization_membership_data` -> `done`
- `integration_organization_memberships` -> `done`
- `integration_teams` -> `done`
- `integrations` -> `done`
- `oauth_access_grants` -> `done`
- `oauth_access_tokens` -> `done`
- `oauth_applications` -> `done`
- `webhook_deliveries` -> `done`
- `webhook_events` -> `done`
- `webhooks` -> `done`

## Slice 5: Admin, Ops, Export, Audit, Backfill, Decommission

Goal:

- finish the operational tables and the migration mechanics needed to actually retire the legacy backend

Tables in this slice:

- `console1984_commands` -> `done`
- `console1984_sensitive_accesses` -> `done`
- `console1984_sessions` -> `done`
- `console1984_users` -> `done`
- `data_export_resources` -> `done`
- `data_exports` -> `done`
- `events` -> `done`
- `feedbacks` -> `done`
- `flipper_audit_logs` -> `done`
- `flipper_features` -> `done`
- `flipper_gates` -> `done`
- `llm_responses` -> `done`

## Completion Rule

The migration is only complete when:

- all `94` legacy Rails tables are explicitly accounted for here
- every table is either `done` or intentionally de-scoped by an explicit user decision
- the same-host Vercel routes and Convex functions use those first-class tables instead of compatibility-only flattening
- the live app no longer depends on Rails, PlanetScale, S3, Imgix, or other legacy Campsite-owned backend services for normal operation

## Execution Order

If we want `5` large slices instead of many small ones, the order should be:

1. Slice 1: Identity, Org Shell, Settings, Notifications
2. Slice 2: Content, Workflow, Media, Engagement
3. Slice 3: Projects, Threads, Messages, Calls, Collaboration
4. Slice 4: OAuth, Integrations, Search, External Platform Surfaces
5. Slice 5: Admin, Ops, Export, Audit, Backfill, Decommission

That is now the full-table plan.
