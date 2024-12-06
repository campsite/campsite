# README

This is the API that powers https://app.campsite.com

## Dev Environment

1. Install recommended VS Code extensions
2. Install system gems from the root directory `gem install solargraph debug`

### Running the app

The API can be started with `script/server`. The API is accessible on http://api.campsite.test:3001 and the frontend on http://app.campsite.test:3000 (after you've run `vercel dev` in that repo).

### Useful commands & shortcuts

`rails dev:reset_onboarding` - resets the onboarding state for the campsite organization

Add this keyboard shortcut to your `keybindings.json` file to run the current test file using `Ctrl+T`:

```json
[
  {
    "key": "ctrl+t",
    "command": "workbench.action.tasks.runTask",
    "args": "rails test (current file)"
  }
]
```

While developing tests you can add `focus` above a definition to run a single test or group of tests:

```rb
focus
test "works with calls" do
  message = create(:message, content: "", call: create(:call))
  assert_equal "#{message.sender.display_name} started a call", message.preview_truncated
end
```

### Emails

When you invite users in dev, or create new accounts etc you'll send/receive emails. These can be accessed (via the letter_opener_web) gem on http://api.campsite.test:3001/preview-emails
(currently the stylesheet is broken, but you have a list of the emails at the top and then you can view them in an iframe at the bottom). If you're inviting a new user, make sure you log out with your existing user before you
click the link in the email :)

### SAML SSO

To set up SSO for the seeded Campsite organization in development using Auth0 as the identity provider (IdP), follow these steps:

1. From the `api` directory, run `bin/rails dev:setup_sso_user` to set up Campsite and Auth0 users with your Campsite email address.
2. Start the API and client servers with ngrok (`script/dev --ngrok` from the root directory).
3. Visit https://app-dev.campsite.com/campsite/settings using your Campsite email address.
4. Scroll down to "Single Sign-On." Click "Enable." Add the domain "campsite.com" and click "Enable."
5. Click "Configure" and follow the WorkOS Admin Portal prompts to create and connect a SAML2 web app in Auth0.

## Deploying

### Steps

1. Open a PR, get an approval, merge to `main`.
2. Merge your approved PR to `main` and the [Deploy](https://github.com/campsite/campsite-api/actions/workflows/deploy.yml) action will deploy to production.
3. Monitor Skylight for performance regressions and Sentry for exceptions.

### Rolling back

1. Open a PR to revert the change, get an approval, merge to `main`.
2. Merge your approved revert PR to `main` and the [Deploy](https://github.com/campsite/campsite-api/actions/workflows/deploy.yml) action will deploy to production.

### Manual deploys

If we ever run into any issues that involve quickly deploying to production, the [manual deploy](https://github.com/campsite/campsite-api/actions/workflows/deploy.yml) workflow can be used to deploy to production.

1. Navigate to [manual deploy](https://github.com/campsite/campsite-api/actions/workflows/production.yml) workflow
2. Select `main` for the first input, enter the name of the branch you'd like to deploy for the second input.
3. Run the workflow

## Using ngrok for publicly accessible HTTPS development URLs

Sometimes, we need our development instance of Campsite to be accessible to the public internet with HTTPS URLs. For example, we may be building an integration with another application, and we'd like that other application to make a request to the Campsite API in development. We use ngrok to expose our development applications to the internet.

1. Log in to the Campsite team on ngrok and follow the [Getting Started instructions](https://dashboard.ngrok.com/get-started/setup) to add your authtoken to your local ngrok configuration file.
2. Add domains to ngrok. Go to [https://dashboard.ngrok.com/cloud-edge/domains](https://dashboard.ngrok.com/cloud-edge/domains) and add a new `api-dev-${YOUR_NAME}.campsite.com` domain. Go to [Route 53 hosted zones](https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones?region=us-east-1#ListRecordSets/Z0722829AYLFQUFAX444) and add a CNAME record following ngrok's instructions. Repeat for `app-dev-${YOUR_NAME}.campsite.com` and `sync-dev-${YOUR_NAME}.campsite.com`.
3. From the root of this repo, run `script/ngrok-domains` and follow the prompts to set your ngrok domains in .env.development.local.
4. From the root of the repo, run `script/dev --ngrok`. The Campsite API will be available at the domains you created.
5. You can confirm that ngrok is running by visiting [http://localhost:4040/status](http://localhost:4040/status). Only one developer will be able to use these ngrok URLs at a time, so be sure to end these processes when you're done using them.

## Feature flags

We use [Flipper](https://github.com/jnunemaker/flipper) for feature flagging. The [Flipper features docs](https://www.flippercloud.io/docs/features) are a good overview of how we can programmatically check and enable feature flags in our Ruby code.

Once you're logged in as [a staff user](https://github.com/campsite/campsite-api/blob/59f0ac37d16dd267a70f0b2e118d925d2e986a60/app/models/user.rb#L102-L104), our Features UI is accessible at [https://admin.campsite.com/admin/features](https://admin.campsite.com/admin/features) (or [http://admin.campsite.test:3001/admin/features](http://admin.campsite.test:3001/admin/features) in development).

Depending on how we check if a flag is enabled in code, an actor could be any kind of ActiveRecord model. Often, we'll check flags against users, like this:

```ruby
Flipper.enabled?(:my_feature, user)
```

In that case, to enable `my_feature` for Gomez through the UI, we'd add a feature called `my_feature`, type `gomez@campsite.com` in the "Add user by email" box, and click enable.

For flags checked against users, we can staff ship by enabling a feature for the "staff" group. We consider a user "staff" if they have a confirmed `campsite.com` email address per [this logic](https://github.com/campsite/campsite-api/blob/59f0ac37d16dd267a70f0b2e118d925d2e986a60/app/models/user.rb#L102-L104).

We can also check flags against other kinds of actors. In this example, we'll check a feature flag for an organization:

```ruby
Flipper.enabled?(:my_org_feature, organization)
```

In that case, to enable `my_org_feature` for the Campsite organization through the UI, we'd add a creature called `my_org_feature`, type `campsite` in the "Add organization by slug" box, and click enable.

### Frontend feature flags

Checking if a feature flag is enabled for the current user involves two steps:

1. In the API, add the feature flag to [the `User::FRONTEND_FEATURES` array](https://github.com/campsite/campsite-api/blob/59f0ac37d16dd267a70f0b2e118d925d2e986a60/app/models/user.rb#L15-L18). We only want to expose a subset of features to the frontend for performance reasons.
2. In the web app, use the `useCurrentUserHasFeature` hook ([example](https://github.com/campsite/campsite/blob/cf68347bb8ef3b09b0b45d70f0d14e471e040771/apps/web/components/OrgSettings/ConnectSlackButton.tsx#L13-L24)) to check if the current user has the feature enabled.

## Database migrations

Make the changes:

1. Make your database change in the `api` folder with `bin/rails g migration add_field_to_table field:integer`
2. Run the migration against your local database `bin/rails db:migrate`
3. Create a pull request with the migrations and the changes to the `db/schema.rb`
4. Your pull request will automatically get blocked with `Migrations pending`

Deploy the changes to the database:

1. A Deploy Request will be created automatically for your PR. Follow the PlanetScale link in the comment generated by the github-actions bot.
2. Click "Deploy changes" to deploy your database changes.

Merge your PR

1. Remove the label on your Pull request and it should be rechecked
2. Once you have approvals, merge your PR, if you can

PlanetScale will not pick up changes made to your PR after opening it. If you make changes, follow these steps to re-generate the deploy request:

1. Follow the Deploy Request link to the PlanetScale dashboard and click on your branch name.
2. Click "Delete branch".
3. Go to the PlanetScale action on your PR and click "Re-run all jobs" to regenerate the latest schema changes.

## Profiling

We use [rack-mini-profiler](https://github.com/MiniProfiler/rack-mini-profiler) to profile staff user API requests in development and production. Add `?pp=flamegraph` to the end of a URL to view a flamegraph of a request. In development, you can also make an API request and then visit http://localhost:3001/rack-mini-profiler/requests for additional profiling data. (This page isn't accessible in production yet due to https://github.com/MiniProfiler/rack-mini-profiler/issues/462#issuecomment-909141515.)
