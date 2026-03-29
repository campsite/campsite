# Decommission Checklist

Use this after the owned-stack build is live and smoke-tested cleanly.

## Keep

- `Vercel` for the web app and same-host API/auth routes
- `WorkOS` for auth
- `Convex` for persistence and storage
- `100ms` for calls
- `Pusher` for realtime

## Remove from active ownership

- Rails API runtime
- PlanetScale
- legacy S3 media ownership
- legacy Imgix media ownership
- legacy sync service ownership
- legacy Elasticsearch/Searchkick ownership

## Remove or leave unset in Vercel

- legacy Rails host env vars
- legacy S3 bucket env vars
- legacy Imgix host env vars
- any old sync/search host env vars that point at Campsite-owned infrastructure

## Final runtime sweep

- verify no live `apps/web`, `packages`, or `convex` code path calls:
  - `api.campsite.com`
  - `auth.campsite.com`
  - `sync.campsite.com`
- verify uploads, previews, and attachment URLs no longer require legacy Imgix behavior
- verify the hosted app works for:
  - sign up / sign in / sign out
  - org create / org settings
  - post / comment
  - note / thread / message
  - call room create / join
  - uploads
  - feedback / export

## Definition of operational completion

- the app works on `Vercel + WorkOS + Convex + 100ms + Pusher`
- legacy Campsite-owned backend services are no longer required for normal product use
