# Campsite

A team communication app built with Next.js, Convex, WorkOS, and Electron.

## Stack

- `apps/web` — Next.js web app (deployed on Vercel)
- `apps/site` — Marketing site (deployed on Vercel)
- `apps/desktop` — Electron desktop app wrapper
- `convex/` — Backend (database, storage, server functions)
- `packages/ui` — Shared UI components
- `packages/editor` — TipTap editor extensions
- `packages/config` — Shared configuration
- `packages/types` — TypeScript types

Services:
- WorkOS for authentication
- Pusher for realtime events
- 100ms for video calls
- Convex for persistence and backend logic

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Link to Vercel and pull environment variables:

```bash
cd apps/web
npx vercel link
npx vercel env pull
```

3. Required environment variables:

- `NEXT_PUBLIC_WEB_URL`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_WORKOS_CLIENT_ID`
- `NEXT_PUBLIC_WORKOS_REDIRECT_URI`
- `WORKOS_API_KEY`
- `WORKOS_CLIENT_ID`
- `WORKOS_COOKIE_PASSWORD`
- `WORKOS_REDIRECT_URI`
- `SYNC_TOKEN_SECRET`
- `HMS_APP_ACCESS_KEY`
- `HMS_APP_SECRET`

Optional:

- `NEXT_PUBLIC_PUSHER_KEY`
- `NEXT_PUBLIC_PUSHER_APP_CLUSTER`
- `PUSHER_SECRET`

4. Start the dev server:

```bash
script/dev
```

5. Open `http://localhost:3000`

## Desktop App

The desktop app is a self-managed Electron wrapper that loads the web app.

To build:

```bash
cd apps/desktop
pnpm install
pnpm build
pnpm package
```

The `.app` is output to `apps/desktop/release/mac-arm64/Campsite.app` and the `.dmg` to `apps/desktop/release/`.

For development (loads localhost:3000):

```bash
cd apps/desktop
pnpm dev
```

## Marketing Site

```bash
cd apps/site
npx vercel env pull
pnpm -F @campsite/site dev
```

Open `http://localhost:3003`

## Installing Packages

Always install from the workspace root with a filter:

```bash
pnpm -F @campsite/web i <package>
pnpm -F @campsite/site i <package>
```

## Calls in Development

Treat `http://localhost:3000` as secure in Chrome via `chrome://flags/#unsafely-treat-insecure-origin-as-secure`.

Point 100ms webhooks at your web host:

```
https://<your-host>/v1/integrations/hms/events
```

Set the `X-Passcode` header to match `HMS_WEBHOOK_PASSCODE`.
