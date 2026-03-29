# Endpoint Inventory

This file is the single place to track the URLs and endpoint roots used by this repo while we migrate away from the original Campsite infrastructure.

Related logic audit:

- see [docs/legacy-logic-audit.md](/Users/declancowen/Documents/GitHub/Campsite/docs/legacy-logic-audit.md) for the Rails callbacks, service objects, and side effects that still need to be carried into Convex
- see [docs/remaining-migration-checklist.md](/Users/declancowen/Documents/GitHub/Campsite/docs/remaining-migration-checklist.md) for the single consolidated list of remaining migration domains

## Current active endpoints

These are the endpoints we currently control and should keep using.

### Web app

- Base app URL:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app`
- Login route:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/login`
- Sign-up route:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/sign-up`
- Callback route:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/callback`
- Logout route:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/logout`

### Internal auth handoff routes

These stay on the same Vercel host, but they are implementation routes rather than pages we link to directly.

- Sign-in handoff:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/auth/login`
- Sign-up handoff:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/auth/sign-up`
- Auth completion handoff:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/auth/complete`
- Logout handoff:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/auth/logout`

### Same-host compatibility API

These are the replacement endpoint families that now live on the same Vercel host as the app.

- Current user:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/users/me`
- Update current user:
  `PATCH https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/users/me`
- Update user preference:
  `PUT https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/users/me/preference`
- Current user org invitations:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/users/me/organization-invitations`
- Current user suggested orgs:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/users/me/suggested-organizations`
- Organization memberships:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organization_memberships`
- Create organization:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations`
- Current organization by slug:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}`
- Update organization:
  `PUT https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}`
- Delete organization:
  `DELETE https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}`
- Public organization by invite token:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organization-by-token/{token}`
- Organization invitation URL:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/invitation_url`
- Reset organization invite token:
  `PATCH https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/reset-invite-token`
- Organization invitations page:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/invitations`
- Create organization invitations:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/invitations`
- Delete organization invitation:
  `DELETE https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/invitations/{id}`
- Bulk invite organization members:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/bulk_invites`
- Join organization by org invite token:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/join/{token}`
- Accept organization invitation by invitation token:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/invitations_by_token/{inviteToken}/accept`
- Join via verified email domain:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/verified_domain_memberships`
- Organization members page:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/members`
- Single organization member:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/members/{memberParam}`
- Member posts:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/members/{memberParam}/posts`
- Reactivate member:
  `PUT https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/members/{memberParam}/reactivate`
- Sync members:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/sync/members`
- Membership request status:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/membership-request`
- Membership requests page:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/membership-requests`
- Create membership request:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/membership-requests`
- Approve membership request:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/membership-requests/{id}/approve`
- Decline membership request:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/membership-requests/{id}/decline`
- Project memberships for current viewer:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/project_memberships`
- Sync projects:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/sync/projects`
- Projects page:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/projects`
- Single project:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/projects/{projectId}`
- Archive project:
  `PATCH https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/projects/{projectId}/archive`
- Unarchive project:
  `PATCH https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/projects/{projectId}/unarchive`
- Onboarding projects:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/onboard_projects`
- Posts index:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/posts`
- Single post:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/posts/{postId}`
- Post comments:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/posts/{postId}/comments`
- Create post comment:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/posts/{postId}/comments2`
- Post canvas comments:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/posts/{postId}/canvas_comments`
- Post timeline events:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/posts/{postId}/timeline_events`
- Post versions:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/posts/{postId}/versions`
- Post SEO info:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/posts/{postId}/seo_info`
- “For me” posts:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/members/me/for_me_posts`
- Viewer posts:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/members/me/viewer_posts`
- Single comment:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/comments/{commentId}`
- Create comment reply:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/comments/{commentId}/replies`
- Attachment commenters:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/attachments/{attachmentId}/commenters`
- Notes page:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/notes`
- Single note:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/notes/{noteId}`
- Note comments:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/notes/{noteId}/comments`
- Note sync state:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/notes/{noteId}/sync_state`
- Note timeline events:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/notes/{noteId}/timeline_events`
- Threads page:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/threads`
- Single thread:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/threads/{threadId}`
- Thread messages:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/threads/{threadId}/messages`
- Calls page:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/calls`
- Single call:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/calls/{callId}`
- Search mixed:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/search/mixed`
- Search posts:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/search/posts`
- Search resource mentions:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/search/resource_mentions`
- User avatar upload:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/users/me/avatar/presigned-fields`
- User cover upload:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/users/me/cover-photo/presigned-fields`
- Organization avatar upload:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/avatar/presigned-fields`
- Project cover upload:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/project/cover-photo/presigned-fields`
- Post upload:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/posts/presigned-fields`
- Thread upload:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/threads/presigned-fields`
- Feedback upload:
  `POST https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/v1/organizations/{orgSlug}/feedback/presigned-fields`

### Shared data-model foundations added by Agent 0

These do not create user-facing routes by themselves, but they are now part of the shared Convex schema so downstream agents can stop inventing ad hoc storage:

- `projectBookmarks`
- `projectPins`
- `timelineEvents`
- dedicated `notes`
- dedicated `calls`

## CRUD migration rule

The migration target is:

- keep the existing Campsite UI and route structure
- replace every create/read/update/delete call that used to hit Rails with either:
  - same-host Vercel compatibility routes under `/v1/...`, or
  - direct Convex-backed server handlers behind those same-host routes
- do not add new product-facing endpoints if an existing Campsite endpoint shape already exists

In practice, this means:

- auth pages and auth handoff stay on the Vercel host
- legacy REST-shaped app endpoints stay on the Vercel host while we preserve frontend compatibility
- the data persistence behind those endpoints moves to Convex
- no live CRUD path should call `https://api.campsite.com`

### Convex

- Convex deployment URL:
  `https://kindred-deer-813.eu-west-1.convex.cloud`

## Current environment variables

These are the variables that currently control the new stack.

### Vercel

- `NEXT_PUBLIC_WEB_URL`
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app`
- `NEXT_PUBLIC_CONVEX_URL`
  `https://kindred-deer-813.eu-west-1.convex.cloud`
- `NEXT_PUBLIC_WORKOS_CLIENT_ID`
  WorkOS public client id
- `NEXT_PUBLIC_WORKOS_REDIRECT_URI`
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/callback`
- `WORKOS_API_KEY`
  WorkOS server API key
- `WORKOS_CLIENT_ID`
  WorkOS server client id
- `WORKOS_COOKIE_PASSWORD`
  WorkOS cookie secret
- `WORKOS_REDIRECT_URI`
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/callback`

### WorkOS

- App homepage URL:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/`
- Redirect URI:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/callback`
- Sign in endpoint:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/login`
- Sign out redirect:
  `https://campsite-declan-2389-declans-projects-c9b6a22c.vercel.app/`

## Legacy Campsite endpoints still in the codebase

These are the old endpoints we do not control. Any live request to them should be treated as a migration bug unless we intentionally keep that integration.

### Old frontend and auth roots

- `https://app.campsite.com`
- `https://auth.campsite.com`
- `https://www.campsite.com`
- `https://sync.campsite.com`

### Old API root

- `https://api.campsite.com`

## Files that still define or consume legacy endpoint roots

These files are the main references we will need to replace as we move more of the app off the old Rails backend.

### Core URL constants

- [packages/config/src/index.ts](/Users/declancowen/Documents/GitHub/Campsite/packages/config/src/index.ts)
  Contains:
  - `WEB_URL_PROD`
  - `SITE_URL_PROD`
  - `SYNC_URL_PROD`
  - same-host `APP_API_URL`
  - same-host `APP_AUTH_URL`

### Old Rails API client

- [apps/web/utils/queryClient.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/utils/queryClient.ts)
  Uses:
  - `APP_API_URL`
  - `APP_AUTH_URL`
  - generated API client rooted at the same-host compatibility API via config

- [packages/types/generated.ts](/Users/declancowen/Documents/GitHub/Campsite/packages/types/generated.ts)
  Generated client still defaults to:
  - `https://api.campsite.com`

### Old auth and user bootstrap

- [apps/web/components/Providers/AuthProvider.tsx](/Users/declancowen/Documents/GitHub/Campsite/apps/web/components/Providers/AuthProvider.tsx)
  Still mounts a large legacy query tree, but those queries are increasingly being redirected to same-host compatibility routes.

- [apps/web/components/Providers/AuthAppProviders.tsx](/Users/declancowen/Documents/GitHub/Campsite/apps/web/components/Providers/AuthAppProviders.tsx)
  Mounts the legacy provider tree that still needs a final QA sweep for stale endpoint assumptions.

### Old real-time and push integrations

- [apps/web/contexts/pusher.tsx](/Users/declancowen/Documents/GitHub/Campsite/apps/web/contexts/pusher.tsx)
  Uses `APP_API_URL` for Pusher auth.

- [apps/web/contexts/WebPush.tsx](/Users/declancowen/Documents/GitHub/Campsite/apps/web/contexts/WebPush.tsx)
  Uses `APP_API_URL` through the service worker.

- [apps/web/public/service_worker.js](/Users/declancowen/Documents/GitHub/Campsite/apps/web/public/service_worker.js)
  Posts to old Rails endpoints for product logs and push subscriptions.

### OAuth and provider callback URLs

- [apps/web/hooks/useIntegrationAuthUrl.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/hooks/useIntegrationAuthUrl.ts)
- [apps/web/hooks/useFigmaAuthorizationUrl.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/hooks/useFigmaAuthorizationUrl.ts)
- [apps/web/hooks/useSlackNotificationsAuthorizationUrl.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/hooks/useSlackNotificationsAuthorizationUrl.ts)
- [apps/web/hooks/useSlackBroadcastsAuthorizationUrl.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/hooks/useSlackBroadcastsAuthorizationUrl.ts)

These still build callback URLs via `APP_API_URL` / `APP_AUTH_URL`, which are now configured to prefer the same-host Vercel app.

### CSP, preconnect, and metadata

- [apps/web/next.config.js](/Users/declancowen/Documents/GitHub/Campsite/apps/web/next.config.js)
  Still allows several legacy Campsite domains in CSP and should be checked in the final QA sweep.

- [apps/web/pages/_document.tsx](/Users/declancowen/Documents/GitHub/Campsite/apps/web/pages/_document.tsx)
  Now preconnects Convex rather than `api.campsite.com`.

- [apps/web/sentry.client.config.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/sentry.client.config.ts)
  Trace targets now use env-driven web/Convex origins rather than `api.campsite.com`.

## Files already moved to the new stack

These are already using the new Vercel + WorkOS + Convex flow.

- [apps/web/app/auth/login/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/auth/login/route.ts)
- [apps/web/app/auth/sign-up/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/auth/sign-up/route.ts)
- [apps/web/app/callback/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/callback/route.ts)
- [apps/web/app/auth/logout/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/auth/logout/route.ts)
- [apps/web/app/logout/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/logout/route.ts)
- [apps/web/app/auth/complete/page.tsx](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/auth/complete/page.tsx)
- [apps/web/app/v1/users/me/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/users/me/route.ts)
- [apps/web/app/v1/organization_memberships/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organization_memberships/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/route.ts)
- [apps/web/app/v1/organization-by-token/[token]/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organization-by-token/[token]/route.ts)
- [apps/web/app/v1/invitations_by_token/[inviteToken]/accept/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/invitations_by_token/[inviteToken]/accept/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/invitation_url/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/invitation_url/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/invitations/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/invitations/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/invitations/[id]/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/invitations/[id]/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/bulk_invites/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/bulk_invites/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/join/[token]/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/join/[token]/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/verified_domain_memberships/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/verified_domain_memberships/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/project_memberships/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/project_memberships/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/sync/projects/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/sync/projects/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/projects/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/projects/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/projects/[projectId]/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/projects/[projectId]/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/projects/[projectId]/archive/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/projects/[projectId]/archive/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/projects/[projectId]/unarchive/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/projects/[projectId]/unarchive/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/onboard_projects/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/onboard_projects/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/posts/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/posts/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/posts/[postId]/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/posts/[postId]/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/posts/[postId]/comments/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/posts/[postId]/comments/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/posts/[postId]/comments2/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/posts/[postId]/comments2/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/posts/[postId]/canvas_comments/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/posts/[postId]/canvas_comments/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/posts/[postId]/timeline_events/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/posts/[postId]/timeline_events/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/posts/[postId]/versions/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/posts/[postId]/versions/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/posts/[postId]/seo_info/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/posts/[postId]/seo_info/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/members/me/for_me_posts/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/members/me/for_me_posts/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/members/me/viewer_posts/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/members/me/viewer_posts/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/comments/[commentId]/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/comments/[commentId]/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/comments/[commentId]/replies/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/comments/[commentId]/replies/route.ts)
- [apps/web/app/v1/organizations/[orgSlug]/attachments/[attachmentId]/commenters/route.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/app/v1/organizations/[orgSlug]/attachments/[attachmentId]/commenters/route.ts)
- [convex/onboarding.ts](/Users/declancowen/Documents/GitHub/Campsite/convex/onboarding.ts)
- [convex/content.ts](/Users/declancowen/Documents/GitHub/Campsite/convex/content.ts)
- [apps/web/pages/index.tsx](/Users/declancowen/Documents/GitHub/Campsite/apps/web/pages/index.tsx)

## Recommended custom-domain mapping later

When you move to a domain you own, use this shape.

- App:
  `https://app.yourdomain.com`
- Login:
  `https://app.yourdomain.com/login`
- Sign-up:
  `https://app.yourdomain.com/sign-up`
- Callback:
  `https://app.yourdomain.com/callback`
- Logout:
  `https://app.yourdomain.com/logout`

Do not create `api.yourdomain.com` unless we deliberately add a separate API compatibility layer.

For the current migration, the data backend should stay on Convex and the auth routes should stay on the main Vercel app domain.

## Next replacement targets

These are the highest-value places to update next.

1. Finish posts parity behind the same-host routes:
   - reactions
   - subscriptions
   - pins
   - resolution
2. Finish comments parity:
   - resolve/unresolve
   - reactions
   - follow-ups
   - richer attachment handling
3. Replace the remaining old Rails client usage in [apps/web/utils/queryClient.ts](/Users/declancowen/Documents/GitHub/Campsite/apps/web/utils/queryClient.ts) screen by screen with Convex-backed data access.
4. Remove or defer integrations that still require the Rails API until they are rebuilt.
