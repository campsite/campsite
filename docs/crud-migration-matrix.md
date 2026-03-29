# CRUD Migration Matrix

This file tracks the migration from the legacy Rails API to the new same-host Vercel compatibility routes backed by Convex.

For the sequenced execution plan, see [docs/convex-migration-plan.md](/Users/declancowen/Documents/GitHub/Campsite/docs/convex-migration-plan.md).

For the legacy business-logic audit behind these endpoints, see [docs/legacy-logic-audit.md](/Users/declancowen/Documents/GitHub/Campsite/docs/legacy-logic-audit.md).
For the table-level schema comparison, see [docs/schema-gap-audit.md](/Users/declancowen/Documents/GitHub/Campsite/docs/schema-gap-audit.md).
For the single consolidated remaining-work checklist, see [docs/remaining-migration-checklist.md](/Users/declancowen/Documents/GitHub/Campsite/docs/remaining-migration-checklist.md).

Rule:

- keep the existing Campsite UI
- keep the existing request and response shapes where practical
- move persistence and business logic under those routes to Convex
- treat any live request to `https://api.campsite.com` as migration debt

## Status key

- `done`: routed to same-host Vercel and backed by Convex or an intentional compatibility response
- `partial`: route exists, but behavior is intentionally limited or placeholder
- `todo`: still backed by the old Rails endpoint

## Auth and bootstrap

| Domain | Representative endpoints | Status | Notes |
| --- | --- | --- | --- |
| Session bootstrap | `GET /v1/users/me`, `GET /v1/organization_memberships`, `GET /v1/organizations/{orgSlug}` | `done` | Reads now come from Convex-backed workspace records. |
| Auth routes | `/login`, `/sign-up`, `/callback`, `/logout` | `done` | WorkOS on same-host Vercel routes. |
| Sign out | `/logout`, `/auth/logout` | `done` | No longer calls legacy Rails sign-out. |

## User CRUD

| Domain | Representative endpoints | Status | Notes |
| --- | --- | --- | --- |
| Read current user | `GET /v1/users/me` | `done` | Convex-backed. |
| Update profile basics | `PATCH /v1/users/me` | `partial` | Name and username supported; email/password/avatar/cover are still limited. |
| Update preferences | `PUT /v1/users/me/preference` | `done` | Stored in Convex user preferences. |
| Notifications schedule/pause | `/v1/users/me/notification_*`, `/v1/users/me/scheduled-notifications*` | `partial` | Convex-backed notification schedule and pause/status logic now exists, and the unread-count shell now includes real DM/thread unread counts from `messageThreadMemberships`. The broader inbox + member-status shell still needs deeper realtime/parity testing. |
| Invitations and suggestions | `/v1/users/me/organization-invitations`, `/v1/users/me/suggested-organizations` | `done` | Convex-backed invites and verified-domain suggestions now populate the existing onboarding UI. |

## Organization CRUD

| Domain | Representative endpoints | Status | Notes |
| --- | --- | --- | --- |
| Create organization | `POST /v1/organizations` | `done` | Persists org + admin membership in Convex. |
| Read organization | `GET /v1/organizations/{orgSlug}` | `done` | Convex-backed. |
| Update organization | `PUT /v1/organizations/{orgSlug}` | `done` | Name, slug, avatar path, verified domain, and basic org settings now run through same-host Vercel routes backed by Convex. |
| Delete organization | `DELETE /v1/organizations/{orgSlug}` | `done` | Same-host delete route now removes the org and its Convex-backed scoped records. |
| Invitation URL / invites | `/v1/organizations/{orgSlug}/invitation_url`, `/v1/organizations/{orgSlug}/invitations*` | `done` | Invitation URL, list/create/delete, and bulk invite flows now run through same-host routes backed by Convex. |
| Membership requests / join flows | `/membership-request*`, `/membership-requests*`, `/join/{token}`, `/bulk_invites` | `done` | Org join link, invitation acceptance, membership-request create/show/list/approve/decline, and verified-domain join now run on Convex-backed same-host routes. |
| Organization members | `/v1/organizations/{orgSlug}/members*`, `/sync/members` | `partial` | Member list/show/member-posts, sync members, role changes, deactivate/reactivate, membership-request approval, and the first status/notification-pause logic now run on Convex. Member reorder and deeper cleanup side effects are still pending. |

## Content CRUD

| Domain | Representative endpoints | Status | Notes |
| --- | --- | --- | --- |
| Posts | `/v1/organizations/{orgSlug}/posts*`, `/tags*`, `/sync/tags`, `/digests/{digestId}/migrations`, `/v1/open_graph_links` | `partial` | Index, single-read, create, update, delete, SEO, versions feed/create route parity, digest-to-note migration lookup, post resolution routes, generated resolution/TLDR routes, post visibility updates, project/viewer/for-me feed filters, project-post feed route, comments, polls, poll votes, poll-option voter pages, feedback-request mutations, tag persistence, tag CRUD/pages, durable title/project/visibility timeline-event writes, persisted `root/version` post-chain semantics, dedicated `postViews` / `nonMemberPostViews`, dedicated `postHierarchies`, dedicated `postLinks` / `postLinkPreviews`, and same-host open-graph lookup now run through Convex-backed routes. Delete now removes the selected post version plus newer descendants to match the existing UI warning. Shared project-pin persistence, richer visibility/resolution edge cases, and full downstream collaboration side effects are still incomplete. |
| Notes | `/v1/organizations/{orgSlug}/notes*` | `partial` | Notes list/read/create/update/delete, permissions, project permissions, comments, public/shared read, sync-state, views, visibility, follow-up/favorite, and compatibility pin routes now exist on the new stack. Dedicated `noteViews` / `nonMemberNoteViews` now back same-host note view routes, digest migration now touches first-class digest rows, and note comments preserve reply targeting, auto-subscribe commenters, notify note authors/replied-to commenters/note subscribers, and load durable shared comment timeline events. Broader note timeline durability, richer editor/sync parity, and project-pin parity are still pending. |
| Comments | `/v1/organizations/{orgSlug}/comments*`, `/posts/{postId}/comments*` | `partial` | Post and note-comment list/create/update/delete, reply create, canvas comments, attachment commenters, and comment resolution routes now run on Convex-backed same-host routes. Recursive nested delete cleanup, reply subscriber/post-author fan-out, comment-resolved notifications, and durable post-comment resolve/unresolve timeline events now exist in the migrated path. Deeper cross-domain side effects and final timeline parity are still incomplete. |
| Threads and messages | `/v1/organizations/{orgSlug}/threads*`, `/messages*` | `done` | Thread/message CRUD, DMs, memberships, reads/unreads, favorites, reactions, attachments, oauth-app hooks, thread project linkage, active-call linkage, message call payloads, shared-post URLs, and real unread-state serialization now run through first-class `messageThreads` / `messageThreadMemberships` / `messages` rows instead of placeholder blob-only behavior. Remaining realtime/backfill validation is tracked as cutover work rather than table parity work. |
| Projects | `/v1/organizations/{orgSlug}/projects*` | `done` | Projects list/read/create/update/delete, archive/unarchive, sync-projects, memberships, invitation URL reset/accept, public guest-token reads, data-export creation, bookmarks, shared project-pin feeds, display-preference routes, read/unread/view routes, and project thread/call linkage now run on first-class Convex-backed same-host routes. Remaining analytics/backfill validation is now cutover work rather than missing project persistence. |
| Calls | `/v1/organizations/{orgSlug}/calls*`, `/call_rooms*`, `/call_recordings/*` | `done` | Call list/read/update, call rooms, active-room peer payloads, thread-linked active calls, recordings pages, transcription reads, follow-up/favorite/project-permission, and compatibility pin routes now run on first-class `calls` / `callRooms` / `callPeers` / recording tables. Remaining 100ms lifecycle verification is operational cutover work rather than missing owned persistence. |

## Media and files

| Domain | Representative endpoints | Status | Notes |
| --- | --- | --- | --- |
| Convex file storage scaffold | Convex `files` functions | `partial` | Storage base exists and same-host upload routes have been added for the main legacy presigned-field surfaces. |
| User/org avatars and cover photos | `/avatar/presigned-fields`, `/cover-photo/presigned-fields` | `partial` | Same-host upload endpoints exist, but end-to-end persistence and serializer parity still need verification. |
| Post/note/thread attachments | `/attachments*`, `/presigned-fields`, `/v1/open_graph_links` | `partial` | Attachment upload compatibility routes plus shared `attachments`/`subjectViews` persistence now exist, and link/open-graph lookups now resolve through first-class `openGraphLinks` / `postLinkPreviews`. Deeper preview/media-processing/backfill parity is still incomplete. |

## Search and integrations

| Domain | Representative endpoints | Status | Notes |
| --- | --- | --- | --- |
| Search | `/search/*` | `partial` | Convex-backed search compatibility routes now exist for mixed/posts/resource-mentions and now run on the owned same-host stack. Remaining work is search-quality tuning and cutover validation rather than missing legacy-host route ownership. |
| Slack, Linear, Figma, Zapier | `/integrations/*` | `done` | Same-host auth/callback/config/channel/team/file routes now exist and persist first-class integration/platform rows on the owned stack. Remaining work is live-provider validation, not legacy-host route ownership. |
| Push/product logs/realtime sync | `/push_subscriptions`, `/product_logs`, `/sync/*` | `partial` | Replacement work is underway, but this still needs a final sweep to confirm no live Rails-only path remains. Deferred Linear timeline event reads now return empty same-host pages instead of 404ing. |

## Next recommended order

1. Backfill and cutover:
   - historical data loading into the first-class Slice 1-5 tables
   - dual-read cleanup where compatibility bridges still exist
   - live smoke validation across content, collaboration, media, and integrations
2. Final decommission:
   - legacy endpoint sweep on the deployed app
   - remove old service assumptions after smoke checks
