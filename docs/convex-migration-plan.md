# Full-Stack Migration Plan

This is the execution plan for fully replacing the legacy Campsite stack with the new owned stack:

- `Vercel` for the web app and same-host compatibility/API routes
- `WorkOS` for auth
- `Convex` for persistence, file storage, and backend logic
- hosted providers only where they are still intentional:
  - `100ms` for calls
  - `Pusher` for realtime

This plan is not just a Convex plan. It covers the full stack required to remove the legacy runtime path:

- Rails API
- PlanetScale persistence
- S3/Imgix media pipeline
- Elasticsearch/Searchkick
- legacy sync/realtime service assumptions

For the table-level schema gap audit, see [docs/schema-gap-audit.md](/Users/declancowen/Documents/GitHub/Campsite/docs/schema-gap-audit.md). For the remaining domain checklist, see [docs/remaining-migration-checklist.md](/Users/declancowen/Documents/GitHub/Campsite/docs/remaining-migration-checklist.md). For the explicit all-`94`-tables replication inventory, see [docs/legacy-table-replication-plan.md](/Users/declancowen/Documents/GitHub/Campsite/docs/legacy-table-replication-plan.md).

## Objective

Keep the existing Campsite frontend UI, routes, and request contracts wherever practical, while replacing the backend under it with owned infrastructure and provider-backed services we control.

The migration is only complete when:

- the live web app no longer depends on `api.campsite.com`, `auth.campsite.com`, `sync.campsite.com`, legacy S3, legacy Imgix, Elasticsearch, or Rails jobs for normal product use
- core product CRUD and side effects run through same-host Vercel routes plus Convex
- all `94` legacy Rails tables are explicitly accounted for
- no table is treated as implicitly merged/dropped unless the user later makes that de-scope decision explicitly

## Current Status Snapshot

### Recent progress

- Note comment create/reply flows now stay on the same-host note stack with:
  - reply-target persistence on the note comment route
  - note-author and parent-comment author notifications
  - note-subscriber notification fan-out
  - durable shared note-comment timeline-event loading
- Generic comment resolution notifications now target `Note` when the resolved comment belongs to a note container instead of always targeting `Post`.
- Thread message-create responses now return the real current membership unread state from Convex-backed thread memberships instead of hardcoded `unread_count: 0` / `manually_marked_unread: false`.
- Slice 1 foundation moved forward: first-class `organizationMembershipStatuses`, `organizationInvitationProjects`, `organizationSettings`, `permissions`, `preferences`, `userPreferences`, `emailBounces`, and `friendlyIdSlugs` tables now exist, and current user/status/invitation flows now dual-write through the new shell tables instead of relying only on flattened compatibility fields.
- Slice 1 shell/runtime is now complete: the owned stack now has first-class storage and active runtime paths for user preferences, org settings, membership statuses, invitation-project joins, notification schedules, scheduled notifications, inbox routes, product logs, push subscriptions, note permissions, and organization slug-history lookup.
- Slice 2 content/workflow/media/engagement is now complete: first-class `customReactions`, `noteViews`, `postViews`, `nonMemberNoteViews`, `nonMemberPostViews`, `openGraphLinks`, `postDigests`, `postDigestBasicPosts`, `postDigestNotes`, `postHierarchies`, `postLinkPreviews`, and `postLinks` now exist, and the same-host content routes read/write those tables instead of only flattened compatibility fields.

### Done or mostly done

- `Vercel` is now the main web/auth/API compatibility layer
- `WorkOS` auth is the active sign-in/sign-up/sign-out path
- same-host `/v1/...` compatibility routes replace a large part of the old Rails API surface
- core bootstrap domains exist in Convex:
  - users
  - organizations
  - memberships
  - notifications shell
  - favorites / subscriptions / follow-ups / reactions
  - projects
  - posts
  - comments
  - notes
  - calls / call rooms
  - bookmarks / pins
  - push subscriptions / product logs
  - exports / feedback / audit / ops tables
- Pusher and 100ms are now configured as Vercel-side integrations instead of Rails-side ones

### In progress

- full domain-model parity
- full business-logic parity
- background side effects that used to live in Rails callbacks/jobs
- cutover from compatibility storage to shared Convex tables in several domains

### Not done

- cutover validation across the full owned stack
- full decommission of every legacy service dependency
- historical backfill only if legacy data must be preserved

## Target Architecture By Layer

| Layer | Legacy | Target | Current state |
| --- | --- | --- | --- |
| Web hosting | Rails + Vercel split | `apps/web` on Vercel | Mostly done |
| Auth | Rails/Auth endpoints | WorkOS + Vercel auth routes + Convex session bridge | Mostly done |
| API surface | Rails controllers under `/v1` | Same-host Vercel compatibility routes | Partial |
| Persistence | PlanetScale/MySQL | Convex tables + functions | Mostly done |
| File storage | S3 | Convex storage + same-host upload routes | Partial |
| Image/media transforms | Imgix + legacy media helpers | Direct media URLs or owned transform layer | Partial |
| Search | Searchkick / Elasticsearch | Convex-backed search routes | Partial |
| Realtime | Pusher auth in Rails | Pusher auth on Vercel + Convex-backed domain state | Partial |
| Web push | Rails endpoints + service worker | Vercel routes + Convex subscription state | Partial |
| Note sync | legacy sync server | owned sync endpoint or explicit de-scope | Partial |
| Calls / voice | Rails + 100ms coordination | Vercel HMS routes + Convex call persistence | Partial |
| Background jobs | Rails jobs/callbacks | Convex actions/schedulers + Vercel webhooks | Partial |
| Observability | Rails + mixed services | Vercel runtime logs + optional Sentry/Axiom | Partial |
| Legacy service ownership | Campsite-owned domains | fully owned Vercel/Convex/provider config | Partial |

## Migration Rules

1. Keep the existing Campsite UI. Do not redesign product flows to avoid backend work.
2. Prefer same-host compatibility routes under `apps/web/app/v1/...` where the frontend already expects them.
3. Move persistence and business logic into Convex and Vercel route handlers. Do not assume Rails logic still runs.
4. Do not reintroduce runtime dependencies on:
   - `api.campsite.com`
   - `auth.campsite.com`
   - `sync.campsite.com`
   - legacy S3
   - legacy Imgix
   - legacy Elasticsearch
5. Every legacy-backed domain must end in one of three states:
   - migrated to first-class Convex/Vercel ownership
   - intentionally replaced by a provider-backed flow
   - explicitly deferred and disabled, never silently broken
6. For a greenfield deployment, prefer deleting backfill work instead of carrying fake migration complexity.

## Workstreams

### 1. Runtime ownership and environment

Own all runtime configuration in Vercel and Convex.

Includes:

- web URL
- auth URLs
- WorkOS secrets
- Convex URL/auth config
- Pusher keys
- web push keys
- 100ms keys
- sync token secret

Completion criteria:

- no legacy host env vars are required
- the runtime defaults to owned Vercel/Convex/provider config

Status: `mostly done`

### 2. Same-host compatibility API ownership

Keep the existing frontend request shapes, but serve them from Vercel.

Includes:

- `/v1/users/me`
- `/v1/organizations/...`
- `/v1/posts/...`
- `/v1/notes/...`
- `/v1/threads/...`
- `/v1/messages/...`
- `/v1/calls/...`
- `/v1/pusher/auth`
- `/v1/push_subscriptions`
- `/v1/product_logs`

Completion criteria:

- the dashboard and main product flows do not call legacy Campsite-owned API hosts

Status: `in progress`

Recent progress in this workstream now includes:

- real unread DM/thread counts flowing from `messageThreadMemberships` into the global unread-count shell
- message-reaction notifications for message authors on the migrated stack
- durable post-comment resolve/unresolve timeline events

### 3. Shared Convex data-model parity

Replace compatibility-only storage with first-class Convex tables for every core domain that still lacks it.

Highest-priority schema families:

1. backfill, cutover validation, and decommission tables/work

Completion criteria:

- core product domains persist in first-class Convex tables instead of compatibility blobs or flattened placeholders

Status: `done for first-class schema replication`

### 4. Core business-logic parity

Recreate the Rails model/service/job behavior that no longer runs.

Includes:

- notification fan-out
- follow-up scheduling
- subscription side effects
- poll / feedback-request / resolution side effects
- post visibility updates and generated-content fallbacks
- membership cleanup
- project/member counters
- read/unread bookkeeping
- timeline events
- project pin/bookmark side effects
- note/call/thread side effects
- provider webhook handling

Completion criteria:

- product behavior is driven by Convex/Vercel side effects rather than missing Rails callbacks

Status: `in progress`

### 5. Media and upload parity

Replace the old S3/Imgix pipeline with owned upload and media URL handling.

Includes:

- user/org/project media
- post/comment/note/thread/message attachments
- feedback screenshots
- metadata persistence
- preview URL handling
- media URL generation

Completion criteria:

- uploads work without Rails, S3, or Imgix assumptions in the active runtime path

Status: `in progress`

### 6. Search, sync, realtime, and push parity

Replace all interactive platform services that used to be backed by legacy services.

Includes:

- Convex-backed search
- Pusher auth and channel behavior
- web push registration endpoints
- note sync token issuance and sync ownership strategy
- service worker endpoints

Completion criteria:

- search, realtime, push, and note sync use owned infrastructure or are explicitly disabled

Status: `partial`

### 7. Calls and voice parity

Replace legacy call/call-room ownership with Vercel + Convex + 100ms.

Includes:

- call room bootstrap
- invitations
- call detail/list
- 100ms webhook/token ownership
- recordings lifecycle parity
- transcript ingestion and speaker mapping

Completion criteria:

- the app can create/join/manage calls without Rails in the request path

Status: `partial`

### 8. Data migration and backfill

Move legacy persisted data or define what is intentionally not being carried forward.

Includes:

- user/org/profile backfill
- projects/posts/comments/notes/calls/thread data backfill
- attachments/media metadata backfill
- memberships/favorites/follow-ups/subscriptions backfill
- message history backfill

Completion criteria:

- existing users can use the migrated app without losing required historical data

Status: `not started`

### 9. Cutover and decommission

Retire the old stack once the new one is complete.

Includes:

- remove legacy env vars from Vercel
- stop routing production traffic to legacy services
- archive or decommission Rails API infra
- document retained provider dependencies
- capture final smoke/regression checklist

Completion criteria:

- legacy backend/services are not needed for normal product operation

Status: `not started`

## Execution Order From The Current Branch

This is the order to follow from here. Each step depends on the previous foundation existing.

1. Data migration/backfill
   - import existing legacy data into the final Convex model
2. Cutover validation
   - validate newly first-class collaboration, media, and external-platform domains against real data
3. Legacy decommission
   - turn off remaining legacy dependencies

## Current Phase

Slices 1-5 are now represented in first-class Convex storage with owned same-host routes. The remaining execution focus is backfill, cutover validation, and legacy decommission.

## Definition Of Done

The migration is done only when all of the following are true:

- sign in, sign up, sign out, and org bootstrap work on Vercel + WorkOS + Convex
- the existing Campsite dashboard loads without calling legacy Campsite-owned hosts
- core product CRUD resolves against same-host Vercel routes backed by Convex
- uploads/media work without legacy S3/Imgix assumptions
- notifications, subscriptions, reactions, favorites, follow-ups, and timeline behavior are backed by owned logic
- threads/messages, notes, calls, projects, posts, and comments have first-class Convex persistence
- search, sync, realtime, push, and 100ms flows are either owned or explicitly removed
- required historical data is backfilled or intentionally deprecated
- Rails/PlanetScale/S3/Imgix/Elasticsearch are no longer required for normal product operation
- all `94` legacy Rails tables are explicitly replicated or consciously de-scoped by user decision, as tracked in [docs/legacy-table-replication-plan.md](/Users/declancowen/Documents/GitHub/Campsite/docs/legacy-table-replication-plan.md)
