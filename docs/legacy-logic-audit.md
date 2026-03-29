# Legacy Logic Audit

This document tracks the business logic that existed in the legacy Rails + PlanetScale stack and how it maps into the new Vercel + Convex stack.

For the sequenced execution plan, see [docs/convex-migration-plan.md](/Users/declancowen/Documents/GitHub/Campsite/docs/convex-migration-plan.md).

For the table-level schema gap audit, see [docs/schema-gap-audit.md](/Users/declancowen/Documents/GitHub/Campsite/docs/schema-gap-audit.md).

## Important finding

The legacy repo does not appear to define database-level MySQL triggers, stored procedures, or SQL functions for the product logic we rely on. The important behavior lives in Rails:

- model callbacks
- validations
- service objects
- serializer assumptions
- background jobs
- search indexing hooks
- realtime broadcast hooks

That means swapping backends is not a schema-only migration. The logic must be reimplemented in Convex mutations/queries and the same-host Vercel compatibility routes.

## Audit summary

| Domain | Legacy source | Current Convex status | Notes |
| --- | --- | --- | --- |
| Auth and user bootstrap | `api/app/models/user.rb` | Partial | Sign in, sign up bootstrap, sign out, profile read, preference write, and first/last-name provisioning are on the new stack. |
| Organizations | `api/app/models/organization.rb`, `api/app/models/organization/create_organization.rb` | Partial | Org creation, slug/domain validation, invite token handling, basic settings updates, delete, default tags, and default projects now run on the new stack. Trial/billing state and Campsite integration creation are still missing. |
| Organization memberships | `api/app/models/organization_membership.rb`, `api/app/models/organization_membership_status.rb` | Partial | Membership bootstrap, invite/join approval, role changes, deactivate/reactivate, and default project rejoin now run on the new stack. Latest status, notification pause coupling, membership reorder, and richer cleanup side effects are still missing. |
| Posts | `api/app/models/post.rb` | Partial | Read/create/update/delete exists, with `lastActivityAt` maintained. Subscriptions, version tree behavior, project contributor counts, workflow events, stale broadcasts, slack cleanup, and search indexing are still missing. |
| Comments | `api/app/models/comment.rb` | Partial | Read/create/update/delete exists, including replies and post `lastActivityAt` updates. Subscription side effects, feedback-request reply state, resolved counts, reply counts, stale broadcasts, and search indexing are still missing. |
| Notifications and inbox | `api/app/models/notification.rb`, `api/app/models/follow_up.rb`, `api/app/models/timeline_event.rb`, `api/app/models/reaction.rb`, `api/app/models/favorite.rb` | Partial | Convex-backed notifications, statuses, reactions, favorites, follow-ups, and subscriptions now exist, but timeline durability and full inbox/realtime parity still need a final pass. |
| Invitations and onboarding | `api/app/models/organization_invitation.rb`, `api/app/models/organization/invite_members.rb` | Partial | Invitation creation/list/delete, accept flow, verified-domain join, and membership-request approval now run through Convex-backed same-host routes. Email delivery and some edge-case onboarding side effects are still missing. |
| Media and attachments | `api/app/models/attachment.rb` | Partial | Same-host upload compatibility routes now exist, and basic attachment metadata can be stored through the Convex layer, but dimensions, previews, Imgix-style transforms, comment counters, and stale broadcasts are not ported yet. |
| Projects | `api/app/models/project.rb` | Partial | Default/general projects, project CRUD, onboarding-project creation, project memberships, and sync-project reads are on the new stack. Favorites, subscriptions, docs/calls/notes coupling, and richer member-management logic are still missing. |
| Notes | `api/app/models/note.rb`, note event processors, note serializers/controllers | Partial | Same-host compatibility routes now exist for note CRUD, permissions, views, public note read, sync-state, and timeline reads. Shared dedicated note persistence and full event parity are still pending. |
| Threads and messages | `api/app/models/message_thread.rb`, `api/app/models/message.rb` and related controllers | Partial | Convex-backed compatibility routes now exist for threads, DMs, memberships, messages, reactions, favorites, and oauth-app hooks. Full realtime/notification parity is still pending. |
| Calls | `api/app/models/call.rb`, call controllers/serializers | Partial | Same-host compatibility routes now exist for call list/read/update, recordings, project permission, favorite, follow-up, and pin flows. Shared dedicated call persistence and deeper call-room/100ms parity are still pending. |
| Search | `api/app/models/post.rb`, `api/app/models/comment.rb`, `api/app/models/project.rb`, `api/config/initializers/searchkick.rb` | Partial | Convex-backed search routes now exist for mixed, posts, and resource mentions. Ranking/index parity with Searchkick is still not complete. |
| Integrations and realtime | multiple Rails models plus Pusher/WebPush codepaths | Partial | Pusher auth, push/product-log replacements, and several collaboration/settings surfaces now have Convex/Vercel replacements, but a final legacy-endpoint sweep is still needed. |

## Legacy behavior checklist

### Users

Legacy Rails behavior:

- downcase email before save
- generate initial username on create
- create default notification schedule after create
- auto-join verified-domain organizations after confirmation
- reindex posts when name or username changes
- update mentions when name or username changes
- Google OAuth bootstrap creates user with email, full name, avatar, and confirmed state

Current Convex/Vercel behavior:

- email is normalized to lowercase during provisioning
- username is generated from preferred username, email local-part, or display name
- WorkOS first and last name are now persisted on the user record
- workspace bootstrap creates a user, org, and membership on first sign-in

Still missing:

- default notification schedule
- verified-domain org auto-join
- name-change mention updates
- search reindex side effects
- avatar import pipeline

### Organizations

Legacy Rails behavior:

- validate reserved slug rules and uniqueness
- generate invite token
- create admin membership for creator
- create default tags
- create default projects, including the general project
- join the creator to default projects
- create the Campsite integration record
- trial/billing bootstrap

Current Convex/Vercel behavior:

- slug uniqueness is enforced
- org creation creates the org and an admin membership
- default tags and default projects are scaffolded
- invite token lifecycle exists and can be reset through same-host routes
- basic org settings updates and org deletion run through Convex-backed routes

Still missing:

- integration bootstrap
- trial and billing fields

### Memberships and statuses

Legacy Rails behavior:

- role-aware permissions and counters
- destroy subscriptions on membership discard
- destroy project memberships on membership discard
- rejoin default projects on undiscard
- update project member counts on role change
- latest status pointer
- notification pause and resume based on active status
- delayed status job

Current Convex/Vercel behavior:

- basic org memberships exist
- admin/member/viewer role shape exists
- deactivate/reactivate and role changes now run on the new stack
- membership requests can be approved or declined
- default projects are rejoined on reactivation

Still missing:

- status model and side effects
- notification pause integration
- membership sorting and reorder behavior

### Posts

Legacy Rails behavior:

- set root/version/last activity before create
- update project contributor counts
- cascade project updates on project change
- broadcast stale content on live fields
- auto-subscribe author
- duplicate parent subscribers
- delete slack mirror on destroy/discard
- maintain workflow state and published timestamps
- search indexing

Current Convex/Vercel behavior:

- create/read/update/delete exists
- published timestamp is set for non-drafts
- post `lastActivityAt` is updated

Still missing:

- subscriptions
- project contributor counts
- parent/version tree behavior
- stale broadcasts
- slack cleanup
- search indexing
- workflow parity beyond simple published/draft fields
- shared durable project-pin persistence
- durable timeline events outside the current compatibility layer

### Comments

Legacy Rails behavior:

- create comments through service object
- subscribe author after create
- mark feedback requests replied
- broadcast stale comments
- search reindex on body/discard changes
- maintain resolved counters and reply counters
- unresolve post when deleting/resolving certain comments

Current Convex/Vercel behavior:

- create/read/update/delete exists
- replies exist
- post `lastActivityAt` updates on create/delete

Still missing:

- author subscriptions
- feedback-request reply state
- resolved state and counters
- reply counters
- stale broadcasts
- search indexing
- post resolution coupling

### Notes

Legacy Rails behavior:

- dedicated note persistence
- note permissions and project permissions
- note timeline events
- shared/public note views
- note pin/follow-up/favorite side effects
- sync/editor compatibility

Current Convex/Vercel behavior:

- same-host note CRUD routes exist
- note permissions, project permissions, views, timeline reads, public note reads, sync-state, and compatibility pin/favorite/follow-up flows exist

Still missing:

- migration from compatibility note storage to the shared dedicated `notes` table
- durable project-pin parity through shared `projectPins`
- durable timeline events through shared `timelineEvents`

### Calls

Legacy Rails behavior:

- dedicated call persistence
- call recordings and project permission
- call favorites/follow-ups/pins
- call room and 100ms coordination

Current Convex/Vercel behavior:

- same-host call compatibility routes exist for list/read/update, recordings, project permission, favorite, follow-up, and pin

Still missing:

- migration from compatibility call storage to the shared dedicated `calls` table
- full call room / 100ms parity
- durable project-pin parity through shared `projectPins`

### Notifications, timeline, reactions, favorites, follow-ups

Legacy Rails behavior:

- broadcast new and stale notifications
- archive/read/unread flows
- follow-up scheduling jobs
- reaction stale broadcasts
- favorites stale broadcasts
- timeline update broadcasts

Current Convex/Vercel behavior:

- not ported yet

### Attachments and media

Legacy Rails behavior:

- validate subject file limits and org ownership
- set dimensions before create when possible
- enqueue dimension job after create
- broadcast attachment stale updates
- attachment comment counters
- preview/download/open-graph/media URL derivation

Current Convex/Vercel behavior:

- attachment metadata can be carried in post/comment payloads

Still missing:

- dimension extraction jobs
- preview generation
- media transforms
- attachment counters
- stale broadcasts

## What is already corrected in the migrated stack

- Auth routes are same-host on Vercel and no longer depend on Campsite-owned auth endpoints.
- Initial user/org bootstrap runs through Convex.
- Google sign-in provisioning now preserves first and last name instead of collapsing everything into a fallback display value.
- Post and comment CRUD for the first migrated slice run through Convex-backed compatibility routes.

## Highest-priority remaining migrations

1. Invitation create/accept flow and org onboarding parity.
2. Organization default project/tag bootstrap.
3. Notifications/inbox shell and membership status side effects.
4. Reactions, favorites, follow-ups, and timeline events.
5. Project CRUD and project membership logic.
6. Search and media parity.
