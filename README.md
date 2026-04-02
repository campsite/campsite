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

The desktop app is a self-managed Electron wrapper that loads the production web app. No API keys or environment variables are needed — it connects to the hosted app directly.

### Quick install (no dev tools needed)

Download the latest installer for your platform from the [Releases page](https://github.com/declancowen/campsite/releases).

| Platform | File |
|---|---|
| macOS (Apple Silicon) | `Campsite-x.x.x-arm64.dmg` |
| macOS (Intel) | `Campsite-x.x.x-x64.dmg` |
| Windows | `Campsite-Setup-x.x.x.exe` |

### Build from source

Prerequisites: [Node.js](https://nodejs.org/) (v20+) and [pnpm](https://pnpm.io/) installed.

```bash
git clone https://github.com/declancowen/campsite.git
cd campsite
pnpm install
cd apps/desktop
pnpm build
pnpm package
```

The installer is output to `apps/desktop/release/`:
- macOS: `Campsite-x.x.x-arm64.dmg` (or `x64.dmg` on Intel Macs)
- Windows: `Campsite-Setup-x.x.x.exe`

Open the `.dmg` or run the `.exe` to install. On macOS, since the app is unsigned, right-click → Open → Open to bypass Gatekeeper.

### Development mode

To run the desktop app against your local dev server (`localhost:3000`):

```bash
cd apps/desktop
pnpm dev
```

Make sure the web app is running first (`pnpm -F @campsite/web dev`).

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
