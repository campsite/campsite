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
| Notifications schedule/pause | `/v1/users/me/notification_*`, `/v1/users/me/scheduled-notifications*` | `partial` | Convex-backed notification schedule and pause/status logic now exists, but the broader inbox + member-status shell still needs full parity testing. |
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
| Posts | `/v1/organizations/{orgSlug}/posts*` | `partial` | Index, single-read, create, update, delete, SEO, versions, comments, and first engagement side effects now run through same-host Vercel routes backed by Convex. Shared project-pin persistence, richer visibility/resolution logic, poll parity, and timeline durability are still incomplete. |
| Notes | `/v1/organizations/{orgSlug}/notes*` | `partial` | Notes list/read/create/update/delete, permissions, project permissions, comments, public/shared read, sync-state, views, visibility, follow-up/favorite, and compatibility pin routes now exist on the new stack. Shared dedicated note persistence and project-pin parity are still pending. |
| Comments | `/v1/organizations/{orgSlug}/comments*`, `/posts/{postId}/comments*` | `partial` | Post comments list, create, update, delete, reply create, canvas comments, and attachment commenters now run on Convex-backed same-host routes. Resolve counts, richer reactions/follow-ups, and full timeline side effects are still incomplete. |
| Threads and messages | `/v1/organizations/{orgSlug}/threads*`, `/messages*` | `partial` | Thread/message CRUD, DMs, memberships, reads/unreads, favorites, reactions, attachments, and oauth-app hooks now have same-host compatibility routes backed by Convex actions. Realtime parity and some notification behavior are still pending. |
| Projects | `/v1/organizations/{orgSlug}/projects*` | `partial` | Projects list/read/create/update/delete, archive/unarchive, sync-projects, project memberships, member-management basics, and onboarding-project creation now run on Convex-backed same-host routes. Bookmarks and shared project-pin feeds still need the follow-up pass. |
| Calls | `/v1/organizations/{orgSlug}/calls*`, `/call_rooms*` | `partial` | Call list/read/update, recordings, follow-up/favorite/project-permission, and compatibility pin routes now exist. Dedicated call persistence, call-room parity, and deeper 100ms behavior are still pending. |

## Media and files

| Domain | Representative endpoints | Status | Notes |
| --- | --- | --- | --- |
| Convex file storage scaffold | Convex `files` functions | `partial` | Storage base exists and same-host upload routes have been added for the main legacy presigned-field surfaces. |
| User/org avatars and cover photos | `/avatar/presigned-fields`, `/cover-photo/presigned-fields` | `partial` | Same-host upload endpoints exist, but end-to-end persistence and serializer parity still need verification. |
| Post/note/thread attachments | `/attachments*`, `/presigned-fields` | `partial` | Attachment upload compatibility routes now exist, but preview/media-processing parity is still incomplete. |

## Search and integrations

| Domain | Representative endpoints | Status | Notes |
| --- | --- | --- | --- |
| Search | `/search/*` | `partial` | Convex-backed search compatibility routes now exist for mixed/posts/resource-mentions, but ranking and parity with the old Searchkick behavior still need refinement. |
| Slack, Linear, Figma, Zapier | `/integrations/*` | `todo` | Still legacy or deferred. |
| Push/product logs/realtime sync | `/push_subscriptions`, `/product_logs`, `/sync/*` | `partial` | Replacement work is underway, but this still needs a final sweep to confirm no live Rails-only path remains. |

## Next recommended order

1. Pins and bookmarks:
   - project bookmarks
   - project pin list/create/delete
   - pin/feed parity for posts, notes, and calls
2. Final parity gaps:
   - timeline durability
   - richer status/inbox side effects
   - uploads/media polish
   - calls/realtime/push cleanup
3. Final QA:
   - legacy endpoint sweep
   - single final build
