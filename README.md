# README

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

## Google Calendar add-on

The Google Calendar add-on is based off the [Calendar conferencing quickstart](https://developers.google.com/workspace/add-ons/samples/conferencing-sample).

With the add-on installed, a user can select "Campsite call" from conferencing options on a new calendar event. The add-on makes a request to the Campsite API, which returns data (including a call link) that the Google Apps Script Project uses to build a [conference](https://developers.google.com/apps-script/reference/conference-data/conference-data). It authenticates with an access token stored in [PropertiesService](https://developers.google.com/apps-script/reference/properties/properties-service) that it obtains using Google Apps Script's [OAuth2 library](https://github.com/googleworkspace/apps-script-oauth2). [This demo](https://www.youtube.com/watch?v=knGS3gQLtL0), which we submitted to Google as part of the approval process, shows the happy path.

It requires an `OauthApplication` in our database. The `client_id` and `client_secret`, which we include in the top of our Google Apps Script code in development and production, live in our Rails credentials, and we create the database record in development via `api/seeds.rb`.

The add-on has two different components hosted by Google:

- Google Cloud Project: where we manage our OAuth Consent Screen and our Google Workspace Marketplace configuration
- Google Apps Script Project: where we write the code that's executed in Google Calendar and makes requests to the Campsite API

Making a change to the add-on requires a few steps:

1. Make a code change in our development Google Apps Script Project.
2. Test the code change. Make sure that the `CAMPSITE_API_ROOT_URL`, `CAMPSITE_AUTH_ROOT_URL`, and `CAMPSITE_APP_ROOT_URL` variables are pointed at the correct ngrok URL. Click the "deploy" dropdown in the upper right and select "test deployments." Make sure "test latest code" is selcted. Next to "Application(s): Calendar," click "Install." Verify that your change works as expected.
3. Copy your changes to our production Google Apps Script Project. Test the code change in production using the same process as step 2.
4. Create a new production deployment. Click the "deploy" dropdown in the upper right and select "new deployment." Give the deployment a name like "v0.0.9" (you can see previous names in "manage deployments"). Click "deploy." Copy the Deployment ID.
5. In our [Google Workspace Marketplace App Configuration](https://console.cloud.google.com/apis/api/appsmarket-component.googleapis.com/googleapps_sdk?authuser=0&project=campsite-prod), paste the Deployment ID in the input under App Integration. Scroll to the bottom of the page and click "Save."
6. Make any changes to our [Google Workspace Marketplace Store Listing](https://console.cloud.google.com/apis/api/appsmarket-component.googleapis.com/googleapps_sdk_publish?authuser=0&project=campsite-prod), click "Save," and then click "Publish."
7. As of writing, we haven't needed to update our approved add-on. From [the docs](https://developers.google.com/workspace/marketplace/manage-app-listing), it seems like we won't need another approval from Google unless we make a change to our OAuth scopes. Note that OAuth scopes must be updated in three places:

- [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent/edit?authuser=0&project=campsite-prod) (this requires its own approval separate from our Google Workspace Marketplace listing)
- [appsscript.json](https://script.google.com/u/0/home/projects/1FB3ndx-s0ZhdJT7EHMEhkwcQwbxDSsS8dDL1cE0GmMjVpvwsCG8SoVZr/edit)
- [Google Workspace Marketplace App Configuration](https://console.cloud.google.com/apis/api/appsmarket-component.googleapis.com/googleapps_sdk?authuser=0&project=campsite-prod)

### Development

- [Google Cloud Project](https://console.cloud.google.com/home/dashboard?orgonly=true&project=vibrant-airship-426721-r7&supportedpurview=project)
- [Google Apps Script Project](https://script.google.com/home/projects/1N21RLR-o3P45j84fqjWxDiSB0a34HP8rES5Iq1ZGgTnPUIgPY4VpIJ8E)

### Production

- [Google Cloud Project](https://console.cloud.google.com/home/dashboard?orgonly=true&project=campsite-prod&supportedpurview=project)
  - [OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent?authuser=0&project=campsite-prod)
  - [Google Workspace Marketplace configuration](https://console.cloud.google.com/apis/api/appsmarket-component.googleapis.com/credentials?authuser=0&project=campsite-prod)
- [Google Apps Script Project](https://script.google.com/u/0/home/projects/1FB3ndx-s0ZhdJT7EHMEhkwcQwbxDSsS8dDL1cE0GmMjVpvwsCG8SoVZr)
