# Campsite Integrations

This project contains integrations for third-party services, such as webhook handlers and our daily standup cron script.

## Running the app

1. Follow the steps in the [main Campsite README](../../README.md) to connect the `apps/integrations` repo to the `campsite-integrations` project on Vercel.

2. Pull environment variables from Vercel

```shell
cd apps/integrations && npx vercel env pull
```

3. Run the app

```shell
pnpm dev
```

This is intended to be a "headless" project, so you shouldn't see any UI, but you can access the project at [http://localhost:3004](http://localhost:3004).
