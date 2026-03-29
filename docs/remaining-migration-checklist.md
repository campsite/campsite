# Remaining Migration Checklist

This is the single list of remaining backend-migration work for the Campsite-to-WorkOS/Vercel/Convex rewrite.

For the sequenced full-stack execution plan, see [docs/convex-migration-plan.md](/Users/declancowen/Documents/GitHub/Campsite/docs/convex-migration-plan.md).

For the table-level schema comparison between legacy Rails and current Convex, see [docs/schema-gap-audit.md](/Users/declancowen/Documents/GitHub/Campsite/docs/schema-gap-audit.md).

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

## Coordinator checkpoint

Shared Agent 0 groundwork is now in place for the downstream pins/bookmarks pass:

- Convex schema foundations now exist for:
  - `projectBookmarks`
  - `projectPins`
  - `timelineEvents`
  - dedicated `notes`
  - dedicated `calls`
- The same-host auth/API config now defaults to the Vercel app host instead of legacy `api.campsite.com` / `auth.campsite.com` fallbacks.

What still remains after this checkpoint:

- implement the actual project bookmark and project pin routes against those shared tables
- wire note/call/post pin flows onto the shared `projectPins` persistence instead of the current compatibility-only pin ids
- run the legacy-endpoint QA sweep after that implementation pass

## Remaining checklist

### 1. User and organization media

- User avatar upload and persistence
- User cover photo upload and persistence
- Organization avatar upload and persistence
- Project cover photo upload and persistence
- Route old presigned upload flows to Convex-backed same-host endpoints
- Make legacy serializers return the uploaded image URLs instead of empty strings

### 2. Post, note, thread, and message media

- Post attachment upload parity
- Comment attachment upload parity
- Note attachment upload parity
- Thread/message attachment upload parity
- Feedback screenshot upload parity
- OAuth application avatar upload parity if that settings surface stays enabled
- Attachment preview URL handling
- Attachment metadata persistence:
  - file type
  - name
  - size
  - width
  - height
  - duration

### 3. Notifications and member status logic

- Member status create/update/clear parity
- Notification pause coupling with member status
- Inbox read/unread/archive parity
- Notification counters parity
- Scheduled notification parity
- Latest-status/member-status shell parity
- Notification-side effects tied to comments, mentions, reactions, follow-ups, and subscriptions

### 4. Subscriptions

- Post subscriptions
- Project subscriptions
- Note subscriptions
- Auto-subscribe author/commenter parity
- Parent-subscriber notification parity
- “for me” and viewer feed behavior tied to subscriptions

### 5. Reactions

- Post reactions parity
- Comment reactions parity
- Message reactions parity
- Grouped reaction response parity
- Reaction notification side effects
- Custom reaction parity where still needed in the app surface

### 6. Favorites

- Project favorites parity
- Post favorites parity
- Note favorites parity
- Thread favorites parity
- Call favorites parity
- Favorite ordering/reorder parity

### 7. Follow-ups

- Post follow-ups
- Comment follow-ups
- Note follow-ups
- Call follow-ups
- Follow-up list/update/delete parity
- Follow-up notification side effects

### 8. Posts remaining parity

- Visibility flows
- Resolution/unresolution flows
- Pins:
  - create/list/delete project pins against shared `projectPins`
  - migrate compatibility-only pin ids for posts/notes/calls onto shared persistence
- Poll behavior still expected by the UI
- Timeline event parity
- Version-tree/root/version behavior beyond the current simplified model
- Project contributor count side effects

### 9. Comments remaining parity

- Resolve/unresolve parity
- Reply-count/resolution-count side effects
- Feedback-request reply state
- Timeline and notification side effects tied to comments

### 10. Notes

- Notes list/read/create/update/delete
- Note permissions
- Note project permissions
- Note comments
- Note views
- Note timeline events
- Note public/shared view behavior as needed by the existing app
- Note sync-state compatibility where required by the editor flow
- Migrate compatibility note storage onto shared dedicated `notes` persistence

### 11. Threads and messages

- Threads list/read/create/update/delete
- DM bootstrap
- Thread membership flows
- Thread read/unread flows
- Thread message list/create/update/delete
- Thread oauth-application attachment points if that surface remains enabled
- Thread notification behavior

### 12. Search

- Replace Searchkick/Elasticsearch-backed search with Convex-backed search
- Keep existing search endpoint shapes where the UI already depends on them
- Support the existing Campsite search surfaces at minimum for:
  - posts
  - projects
  - people
  - notes/messages where used in the UI

### 13. Background side effects

- Replace Rails callbacks and jobs that no longer run once Rails is out of the request path
- Recreate key side effects in Convex/Vercel:
  - notification fan-out
  - follow-up scheduling
  - membership cleanup
  - subscription cleanup
  - project/member counters
  - stale/update broadcasts or their replacement behavior
  - search indexing/update behavior

### 14. Realtime, push, and app-shell dependencies

- Remaining Pusher-dependent flows that still expect Rails auth
- Web push/product-log endpoints still tied to the old backend
- Any same-host service-worker endpoints still missing
- Remaining live-update assumptions in the logged-in shell

### 15. Calls / voice core / 100ms

- Call room bootstrap parity
- Call list/detail parity
- Recording list/delete parity
- Call invitations parity
- 100ms-related request paths and tokens still expected by the UI
- Any call-related favorites/follow-ups/subscriptions still missing
- Migrate compatibility call storage onto shared dedicated `calls` persistence

## Explicitly deferred for now

- Slack integration parity
- Linear integration parity
- Figma integration parity
- Zapier/integration marketplace parity
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
