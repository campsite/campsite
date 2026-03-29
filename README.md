# Campsite

This is an open source version of the [Campsite](https://www.campsite.com/) app. This codebase is available **as-is** and is not actively maintained by the Campsite team. We will only consider pull requests and issues regarding self-hosting or critical fixes. The codebase is provided as a reference for those interested in learning how Campsite works. We welcome forks of this repository for use in non-commercial projects.

## Local dev setup

The supported stack is now:

- `apps/web` on Vercel-style Next.js routes
- `convex/` for persistence, storage, and backend logic
- `WorkOS` for auth
- `Pusher` for realtime
- `100ms` for calls
- optional sidecars:
  - `apps/sync-server`
  - `apps/styled-text-server`

The legacy Rails/PlanetScale/S3/Imgix stack is still in the repo for reference, but it is no longer the primary path.

### Getting started

1. Install dependencies from the workspace root:

```bash
pnpm install
```

2. Link the web app to Vercel and pull envs:

```bash
cd apps/web
npx vercel link
npx vercel env pull
```

3. Make sure your required envs are present:

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
- `HMS_WEBHOOK_PASSCODE`
- `HMS_VIEWER_ROLE`

Optional but commonly needed:

- `NEXT_PUBLIC_PUSHER_KEY`
- `NEXT_PUBLIC_PUSHER_APP_CLUSTER`
- `PUSHER_SECRET`
- `NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY`

4. Start the migrated dev stack from the workspace root:

```bash
script/dev
```

This uses the default [Procfile](/Users/declancowen/Documents/GitHub/Campsite/Procfile), which starts the migrated services only.

If you need the old Rails-era stack for archaeology or legacy debugging, run:

```bash
script/dev --legacy
```

That uses [Procfile.legacy](/Users/declancowen/Documents/GitHub/Campsite/Procfile.legacy).

## Running the web app

1. Install npm packages

```shell
pnpm install
```

2. Connect Vercel

```shell
pnpm i -g vercel
```

3. Sign in to your Vercel account

```shell
npx vercel login
```

4. Link the apps to Vercel

```shell
npx vercel link --repo
? Set up and develop “~/<your_path_to_campsite>”? [Y/n] y
? Which scope should contain your project? Campsite
? Found project “campsite/campsite”. Link to it? [Y/n] y
🔗  Linked to campsite/campsite (created .vercel)
```

5. Pull environment variables from Vercel

```shell
cd apps/web && npx vercel env pull
```

6. Run the app

```shell
npx vercel dev
```

7. Open the app at `http://localhost:3000`.

## Running the marketing site

1. Follow the steps above to connect the `apps/site` repo to the `campsite-site` project on Vercel.

2. Pull environment variables from Vercel

```shell
cd apps/site && npx vercel env pull
```

3. Run the site

```shell
pnpm -F @campsite/site dev
```

4. Open the app at `http://localhost:3003`

## Running Storybook

```shell
pnpm -F @campsite/web storybook
```

## Installing new packages

To add new packages, you always install at the root of the repository and pass a filter flag to pnpm. For example, to install Tailwind to the marketing site, you would run:

```shell
pnpm -F @campsite/site i tailwindcss
```

Or to install lodash to the web app, you would run:

```shell
pnpm -F @campsite/web i lodash
```

To find an app or package name, navigate to the `package.json` for each `app/` or `package/` directory.

## Running the Desktop App locally

1. [Download the ToDesktop build macOS App](https://dl.todesktop.com/2108257l5oobyoe).
2. Look for the app switcher in the ToDesktop title bar. If you do not see our org apps here, you may need to create a dummy application.
3. Switch to "Campsite Dev" and click "Run" in the bottom left corner of the app.

<details>
  <summary>View screenshot</summary>

  <img width="927" alt="Screen Shot 2023-01-11 at 15 20 46@2x" src="https://user-images.githubusercontent.com/1923260/211939117-f9a2a6cf-99c2-4220-b732-b109c5c859e9.png">
</details>

## Legacy API

If you explicitly need the archived Rails API, see [api/README.md](/Users/declancowen/Documents/GitHub/Campsite/api/README.md). Treat that as legacy-only documentation, not the default deployment path for this repo.

## Calls in development

To use calls in development, treat `http://localhost:3000` as secure in Chromium-based browsers via `chrome://flags/#unsafely-treat-insecure-origin-as-secure`.

For webhook-driven call features, point 100ms at your current web host, for example:

```text
https://<your-web-host>/v1/integrations/hms/events
```

Configure the `X-Passcode` header to match `HMS_WEBHOOK_PASSCODE`.
