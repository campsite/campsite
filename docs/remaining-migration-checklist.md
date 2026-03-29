# Remaining Migration Checklist

This is the single list of remaining backend-migration work for the Campsite-to-WorkOS/Vercel/Convex rewrite.

For the sequenced full-stack execution plan, see [docs/convex-migration-plan.md](/Users/declancowen/Documents/GitHub/Campsite/docs/convex-migration-plan.md).

For the table-level schema comparison between legacy Rails and current Convex, see [docs/schema-gap-audit.md](/Users/declancowen/Documents/GitHub/Campsite/docs/schema-gap-audit.md).
For the explicit all-`94`-tables replication inventory, see [docs/legacy-table-replication-plan.md](/Users/declancowen/Documents/GitHub/Campsite/docs/legacy-table-replication-plan.md).

Rules:

- keep the existing Campsite frontend UI
- replace legacy Rails-backed request paths underneath that UI
- keep same-host `/v1/...` compatibility routes where the frontend already expects them
- move persistence and business logic into Convex and Vercel route handlers
- treat any live dependency on `api.campsite.com`, `auth.campsite.com`, PlanetScale, S3, Imgix, Elasticsearch, or Fly as migration debt unless explicitly deferred

## Current goal

Ship a working Campsite-compatible app on:

- `Vercel` for the web app and same-host auth/API compatibility routes
- `WorkOS` for auth
- `Convex` for database, file storage, and backend logic

## Current checkpoint

The migration now has shared Convex foundations for:

- `projectBookmarks`
- `projectPins`
- `timelineEvents`
- dedicated `notes`
- dedicated `calls`
- dedicated `callPeers`
- dedicated `callRecordings`
- dedicated `callRecordingChatLinks`
- dedicated `callRecordingSpeakers`
- dedicated `callRecordingSummarySections`
- shared `attachments`
- shared `subjectViews`
- shared `organizationMembershipStatuses`
- shared `organizationInvitationProjects`
- shared `organizationSettings`
- shared `permissions`
- shared `preferences`
- shared `userPreferences`
- dedicated `projectDisplayPreferences`
- dedicated `oauthApplications`
- dedicated `oauthAccessTokens`
- dedicated `oauthAccessGrants`
- dedicated `polls`
- dedicated `pollOptions`
- dedicated `pollVotes`
- dedicated `postFeedbackRequests`
- dedicated `postTaggings`

And the same-host auth/API config now defaults to the Vercel app host instead of legacy `api.campsite.com` / `auth.campsite.com` fallbacks.

Recent completed slices now also cover:

- project memberships
- project invitation URL reset/accept flows
- public guest-token project reads
- project data-export creation
- first-class oauth application/token/grant persistence
- same-host call-recording and transcription routes
- first-class call recording / speaker / summary schema foundations
- first-class post poll / vote / feedback-request schema foundations
- first-class post tagging persistence
- same-host post poll, poll voter, feedback-request, tag, and sync-tag routes
- Slice 1 shell/runtime completion:
  - first-class membership-status, invitation-project, org-settings, permissions, preferences, user-preferences, email-bounce, and friendly-slug tables
  - user/org shell flows now read/write those tables
  - note permissions now read the shared permissions table during access/serialization instead of only embedded compatibility state
  - old organization slugs now resolve through friendly slug history
- Slice 2 content/workflow/media/engagement completion:
  - first-class `customReactions`, `noteViews`, `postViews`, `nonMemberNoteViews`, `nonMemberPostViews`, `openGraphLinks`, `postDigests`, `postDigestBasicPosts`, `postDigestNotes`, `postHierarchies`, `postLinkPreviews`, and `postLinks`
  - same-host post/note view routes now dual-write those dedicated view tables
  - same-host `/v1/open_graph_links` now resolves through owned Convex storage
  - custom reactions now read/write first-class Convex rows instead of only compat blobs
  - digest migration now resolves through first-class digest tables as well as migrated notes
  - post create/update/delete now sync dedicated hierarchy/link/preview rows
  - post and SEO serializers now read dedicated link/open-graph/view rows instead of only flattened compat fields
- Slice 3 collaboration/runtime completion:
  - first-class project/thread/message/call/call-room/bookmark/pin tables now back the same-host runtime
- Slice 4 external/platform completion:
  - first-class integration/oauth/webhook/platform tables now back the same-host routes for Slack, Linear, Figma, Zapier, and related auth/callback flows
- Slice 5 operational table replication completion:
  - first-class `console1984*`, `dataExports`, `dataExportResources`, `events`, `feedbacks`, `flipper*`, and `llmResponses`
  - same-host org/member/project export creation routes now exist on the owned stack
  - same-host feedback submission now persists first-class feedback rows instead of missing the route entirely

## Remaining checklist

### 1. Cutover validation

- If this deployment is greenfield, skip historical backfill entirely
- If legacy production data still matters, backfill it into the first-class Convex tables created across Slices 1-5
- Run end-to-end validation on the first-class collaboration, media, and platform domains
- Cut remaining compatibility bridges over to the first-class tables where dual-read paths still exist

### 2. Final decommission

- Run the final legacy-endpoint sweep against the deployed app
- Deploy the final owned-stack build
- Decommission the unused legacy backend/services once smoke testing is clean
- Remove legacy env vars and provider assumptions that are no longer intentionally owned

For the concrete shutdown list, see [docs/decommission-checklist.md](/Users/declancowen/Documents/GitHub/Campsite/docs/decommission-checklist.md).

## Explicitly deferred for now

- Billing/trial/commercial plan parity

## Definition of done

The migration is only done when:

- sign in, sign up, sign out, and org bootstrap work
- the existing Campsite dashboard loads without calling old Campsite-owned APIs
- all core CRUD surfaces used by the current frontend resolve against Vercel + Convex
- uploads and media for users, orgs, projects, posts, notes, threads, and messages work
- notifications/status/subscriptions/reactions/favorites/follow-ups behave consistently enough for normal product use
- search works on the migrated data model
- call/voice flows needed by the UI no longer depend on the old backend
