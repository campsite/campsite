# Campsite

## Local dev setup

To get started, run this command from the workspace root:

```bash
script/setup
```

Campsite requires setting up several services before you can run the basic version locally.

### S3 (critical)

S3 is needed to upload avatars and attachments. We recommend separate buckets for dev and production. For example, we use `campsite-media` and `campsite-media-dev` buckets.

You should setup a IAM user with [these suggested policies](aws-policies.md) (make sure to use your buckets in the policy).

Set your credentials for the API:

```bash
cd api
script/credentials development
```

Configure these under the `aws` key.

We also recommend uploading the contents of the `default_avatars` directory under `static/avatars` in each S3 bucket. [Read more here](default_avatars/readme.md).

### Pusher (critical)

[Pusher](https://pusher.com/) is used to send realtime updates and events. After creating your account, configure this under the `pusher` key in your credentials.

### Imgix (critical)

[Imgix](https://www.imgix.com/) is the CDN powering Campsite. On AWS IAM, you will need to create an imgix user + policy ([see recommended policy](aws-policies.md)).

Then, add S3 as an [Imgix source](https://docs.imgix.com/en-US/getting-started/setup/creating-sources/amazon-s3). If you setup dev and prod S3 buckets, you will need a separate Imgix source for each.

Lastly, create an API Key for Imgix in your account dropdown.

Fill in all of these values in the credentials files:

- `imgix.url` - The S3 sourced image domain. Should look like https://campsite-dev.imgix.net
- `imgix.source_id` - The Imgix source ID (top of the source page or in the URL)
- `imgix.api_key` - The API key you created
- `imgix_video.url` - Same URL as `imgix.url` but with `.video` as the TLD (e.g. https://campsite-dev.imgix.video)

> [!NOTE]
> While here you can also setup [Imgix Web Folders](https://docs.imgix.com/en-US/getting-started/setup/creating-sources/web-folder) and put the URL in `imgix_folder.url`. This is used to cache doc thumbnails, but isn't necessary on local dev. The web folder is needed to host doc thumbnails in prod.

### 100ms

[100ms](https://www.100ms.live/) powers Campsite's video conferencing features. After creating an account, set these values under the `hms` credentials key.

> [!NOTE]
> Video calls with webhooks will only work when using a secure tunnel such as ngrok.

### OpenAI

We use the OpenAI API to generate summaries for calls and posts. You need both an API key and your organization ID (not the name, found in OpenAI platform settings). Add these under the `openai` credentials key.

### Others

There are many other services we use to power Campsite features. Create accounts and set up credentials as needed:

- `aws_ecs` - run data exports on AWS Elastic Container Service
- `cal_dot_com` - the Campsite [Cal.com](https://cal.com/) app
- `figma` - render frames via the [Figma REST API](https://www.figma.com/developers/api)
- `linear` - the Campsite Linear app (see [API docs](https://developers.linear.app/docs))
- `omniauth_google` - Google OAuth
- `plain` - customer feedback (likely not needed)
- `postmark` - sending emails via the [Postmark API](https://postmarkapp.com/developer)
- `sentry` - bug reports, just need the DSN
- `slack` - Campsite Slack app
- `vercel.revalidate_static_cache` - generate your own key to safely revalidate cached docs (ISR)
- `webpush_vapid` - VAPID keys necessary to send web push notifications ([docs](https://github.com/pushpad/web-push#generating-vapid-keys))
- `workos` - SSO (likely wont need this)
- `zapier` - The Campsite Zapier app
- `tenor` - GIF search ([docs](https://tenor.com/gifapi))

## Running Campsite in development

We use [Overmind](https://github.com/DarthSim/overmind) to run all of the services needed to develop Campsite locally. To get started, run `script/setup` to install tmux and Overmind. Then run:

```shell
script/dev
```

Our [Procfile](https://github.com/campsite/campsite/blob/main/Procfile) defines the services Overmind runs. Use `overmind connect` to view the logs of a specific service (e.g. `overmind connect sync-server`).

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

5. Open the app at `http://app.campsite.test:3000` — you will be redirected to the auth page with user credentials pre-filled.

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

## Running the API locally

Are you looking to setup and run the API locally? Checkout the [API README](api/README.md)

✨

## API secrets

Running `script/setup` will generate [Rails custom credential files](https://edgeguides.rubyonrails.org/security.html#custom-credentials) for development and production environments. From the API directory, run `VISUAL="code --wait" bin/rails credentials:edit --environment development` to edit development credentials, or run `VISUAL="code --wait" bin/rails credentials:edit --environment development` to edit production credentials.

When you deploy Campsite, `config/credentials/production.yml.enc` must be present on your production server, and you must set the `RAILS_MASTER_KEY` environment variable equal to the contents of `config/credentials/production.key`. If you deploy from a git repository, you can remove `config/credentials/production.yml.enc` from `.gitignore` and commit the file. Do not remove `config/credentials/production.key` from `.gitignore`, instead share this with your team in a safe place outside of the repository, such as in a password vault.

## Calls in development

To use calls in development, you'll need to treat the `http://app.campsite.test:3000` origin as secure. In a Chromium-based browser, you can do that at chrome://flags/#unsafely-treat-insecure-origin-as-secure.

For any call features that require webhooks (like getting chat bubbles in message threads when calls start), you should [use ngrok](https://github.com/campsite/campsite/tree/main/api#using-ngrok-for-publicly-accessible-https-development-urls). You can enable webhooks in the [developer tab of the 100ms dashboard](https://dashboard.100ms.live/developer). The webhook URL should be set to `https://api-dev.campsite.com/v1/integrations/hms/events`, and there should be a webhook header with the name `X-Passcode` and a value that comes from running `Rails.application.credentials.hms.webhook_passcode` in a development Rails console. Be sure that you configure webhooks in the "Development" workspace and disable them when you're done working in ngrok (webhooks in the "Production" workspace should always be enabled and the configuration shouldn't change).
