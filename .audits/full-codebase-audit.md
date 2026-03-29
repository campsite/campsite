# Full Codebase Audit

## Audit Metadata

- Scope: Full codebase
- Turn: 1
- Date: 2026-03-29
- Time: 20:58:07 BST
- Repo: Campsite
- Branch: codex/review
- Commit: `590a76284578fb3a2e19e5817809dd3adfccf916`
- Remote: `https://github.com/declancowen/campsite.git`
- Environment:
  - OS: `Darwin 25.4.0`
  - Node: `v25.8.0`
  - pnpm: `9.7.1`

## Audit Status

- Overall: Needs attention
- Open findings: 2
- Severity summary:
  - Critical: 0
  - High: 1
  - Medium: 1

## Codebase Overview

- Monorepo managed with pnpm + Turbo.
- Main runtime stack:
  - `apps/web`: Next.js app
  - `convex/`: application persistence and backend functions
  - `apps/sync-server`: Hocuspocus/Yjs note sync service
  - `apps/styled-text-server`: styled text rendering service
  - `api/`: legacy Rails API still present in-repo
- Supporting providers/services in the current repo shape:
  - WorkOS
  - Convex
  - Pusher
  - 100ms
  - Sentry

## Findings

### S1-01: Sync tokens wrap raw bearer access tokens and the sync service logs them to Sentry

- Severity: Critical
- Status: Resolved in Turn 3
- Area: Security / authentication

#### Why this matters

The note sync token is acting as a signed wrapper around the caller's real bearer access token instead of as a scoped opaque token. The sync service then forwards that bearer token to backend APIs and includes it in Sentry context on error paths. Any leaked sync token or captured Sentry event becomes credential material rather than a limited-purpose editor token.

#### Evidence

- [`apps/web/lib/auth/syncToken.ts:5`](/Users/declancowen/Documents/GitHub/Campsite/apps/web/lib/auth/syncToken.ts#L5) defines the sync token payload with `accessToken`.
- [`apps/web/lib/auth/syncToken.ts:35`](/Users/declancowen/Documents/GitHub/Campsite/apps/web/lib/auth/syncToken.ts#L35) creates the sync token directly from the bearer token.
- [`apps/web/lib/auth/syncToken.ts:53`](/Users/declancowen/Documents/GitHub/Campsite/apps/web/lib/auth/syncToken.ts#L53) verifies the token and returns the raw `accessToken`.
- [`apps/sync-server/src/database.ts:42`](/Users/declancowen/Documents/GitHub/Campsite/apps/sync-server/src/database.ts#L42) forwards the token as `Authorization: Bearer ...`.
- [`apps/sync-server/src/database.ts:87`](/Users/declancowen/Documents/GitHub/Campsite/apps/sync-server/src/database.ts#L87) and [`apps/sync-server/src/database.ts:136`](/Users/declancowen/Documents/GitHub/Campsite/apps/sync-server/src/database.ts#L136) send `context.token` to Sentry context.
- [`apps/sync-server/src/index.ts:47`](/Users/declancowen/Documents/GitHub/Campsite/apps/sync-server/src/index.ts#L47) stores the raw token in the connection context.
- [`apps/sync-server/src/index.ts:57`](/Users/declancowen/Documents/GitHub/Campsite/apps/sync-server/src/index.ts#L57) sends `data.token` to Sentry context on auth errors.

#### Recommendation

Replace the current sync token design with an opaque short-lived token that contains only the minimal scoped claims required by the sync service, or mint a dedicated sync-specific access token. Remove bearer tokens from all Sentry context/logging paths.

---

### B1-02: The sync service still points at the legacy Rails API topology instead of the migrated same-host/owned backend

- Severity: High
- Status: Resolved in Turn 3
- Area: Correctness / migration architecture

#### Why this matters

The repo's note collaboration path is not fully cut over. Even after the web app migration, the sync service still targets old Campsite API hosts directly. That creates an architecture split where the editor path still depends on legacy infrastructure and is inconsistent with the new Vercel + Convex ownership model.

#### Evidence

- [`apps/sync-server/src/api.ts:3`](/Users/declancowen/Documents/GitHub/Campsite/apps/sync-server/src/api.ts#L3) hardcodes `http://api.campsite.test:3001` for development.
- [`apps/sync-server/src/api.ts:5`](/Users/declancowen/Documents/GitHub/Campsite/apps/sync-server/src/api.ts#L5) switches production to `http://campsite-api.internal:8080`.

#### Recommendation

Cut the sync service over to an owned API surface that matches the migrated stack, or retire the separate sync service if it is no longer part of the target architecture. Until then, the migration is operationally incomplete for note collaboration.

---

### O1-03: The root README is materially outdated and still instructs operators to provision legacy infrastructure

- Severity: High
- Status: Resolved in Turn 3
- Area: Documentation / operations

#### Why this matters

The top-level onboarding document still describes the old architecture as the default operating model. For a greenfield or migrated deployment, this is likely to send operators toward S3, Imgix, Rails credential management, legacy internal hosts, and old webhook endpoints that should no longer be part of the supported path.

#### Evidence

- [`README.md:15`](/Users/declancowen/Documents/GitHub/Campsite/README.md#L15) marks S3 as critical setup.
- [`README.md:36`](/Users/declancowen/Documents/GitHub/Campsite/README.md#L36) marks Imgix as critical setup.
- [`README.md:83`](/Users/declancowen/Documents/GitHub/Campsite/README.md#L83) documents Overmind/Procfile multi-service local dev centered on the old stack.
- [`README.md:135`](/Users/declancowen/Documents/GitHub/Campsite/README.md#L135) tells developers to open `http://app.campsite.test:3000`.
- [`README.md:195`](/Users/declancowen/Documents/GitHub/Campsite/README.md#L195) still explains Rails production credentials as a deployment requirement.
- [`README.md:205`](/Users/declancowen/Documents/GitHub/Campsite/README.md#L205) points 100ms webhooks at `https://api-dev.campsite.com/v1/integrations/hms/events`.

#### Recommendation

Rewrite the root README around the actual supported stack and deployment path. Move legacy Rails/API instructions into an explicitly archived or legacy-only document so operators do not treat them as the source of truth.

---

### O1-04: CI mutates pull request branches by auto-fixing and auto-committing code during validation

- Severity: Medium
- Status: Resolved in Turn 3
- Area: CI/CD / workflow hygiene

#### Why this matters

Several validation workflows are not purely validating. They rewrite code and push commits back to contributor branches during CI. That makes CI behavior stateful, obscures provenance, creates surprising branch mutations, and can complicate fork and review workflows.

#### Evidence

- [`client-build.yml:82`](/Users/declancowen/Documents/GitHub/Campsite/.github/workflows/client-build.yml#L82) runs `pnpm format` and [`client-build.yml:85`](/Users/declancowen/Documents/GitHub/Campsite/.github/workflows/client-build.yml#L85) auto-commits the result.
- [`api-tests.yml:76`](/Users/declancowen/Documents/GitHub/Campsite/.github/workflows/api-tests.yml#L76) runs RuboCop autocorrect and [`api-tests.yml:80`](/Users/declancowen/Documents/GitHub/Campsite/.github/workflows/api-tests.yml#L80) auto-commits the result.
- [`styled-text-server-build.yml:63`](/Users/declancowen/Documents/GitHub/Campsite/.github/workflows/styled-text-server-build.yml#L63) runs lint with `--fix` and [`styled-text-server-build.yml:64`](/Users/declancowen/Documents/GitHub/Campsite/.github/workflows/styled-text-server-build.yml#L64) auto-commits the result.

#### Recommendation

Keep CI validation read-only. Move auto-fixes into local tooling, pre-commit hooks, or dedicated manual maintenance workflows so pull request builds do not mutate developer branches.

## What Is Working Well

- The repo now has a broad same-host web/API surface under `apps/web`.
- Convex has become a substantial first-class persistence layer rather than a narrow add-on.
- The migration work clearly established a modern target stack centered on WorkOS, Convex, and the web app rather than Rails-first ownership.
- Local build/test tooling and monorepo package structure are coherent enough to support continued cleanup.

## Recommended Next Actions

1. Fix `S1-01` before relying on the sync path in production.
2. Decide whether `apps/sync-server` is part of the supported target architecture; if yes, cut it over fully and stop calling legacy API hosts.
3. Replace the root README with a migrated-stack onboarding guide.
4. Stop CI from mutating PR branches during validation.

## Notes

- This Turn 1 audit focused on full-repo structural, security, operational, and migration risks.
- I did not run dependency vulnerability scanners or external service audits in this pass.

---

## Turn 2

### Turn 2 Metadata

- Focus: Migration-closure breadth sweep
- Date: 2026-03-29
- Scope: Whole repo, with emphasis on migrated surfaces, local dev tooling, tests, service entry points, and decommission leftovers
- Files sampled across code, config, docs, workflows, tests, and legacy services: 4500+ candidate files in scope

### Turn 2 Summary

- Turn 1 findings re-checked: resolved in Turn 3
- New findings added this turn: 4
- Net assessment at audit time: the repo had broad migrated ownership, but closure was incomplete because several service and tooling paths still depended on compatibility persistence or legacy topology assumptions

### Additional Findings

### S2-05: The repo contains a hardcoded bearer token for `styled-text-server` in the checked-in Procfile

- Severity: High
- Status: Resolved in Turn 3
- Area: Security / secrets management

#### Why this matters

The local service entry point checks a static bearer token into source control. Even if this is "only dev", it trains the repo toward shared static secrets, makes accidental reuse more likely, and undermines clean secret hygiene during a migration that is supposed to centralize configuration in owned envs.

#### Evidence

- [`Procfile:11`](/Users/declancowen/Documents/GitHub/Campsite/Procfile#L11) hardcodes `AUTHTOKEN=d8c0a2827589659ff292a8999b024f24a185ed82`.
- [`apps/styled-text-server/src/app.ts:28`](/Users/declancowen/Documents/GitHub/Campsite/apps/styled-text-server/src/app.ts#L28) trusts `Authorization: Bearer ${process.env.AUTHTOKEN}` as the whole auth layer.
- [`apps/styled-text-server/README.md:15`](/Users/declancowen/Documents/GitHub/Campsite/apps/styled-text-server/README.md#L15) documents the token contract around that environment variable.

#### Recommendation

Move the token to local env files or secret management only, rotate the checked-in token, and make the Procfile consume the env variable without embedding a value.

---

### O2-06: Local dev and E2E tooling still target the legacy Rails-era host topology, so validation does not exercise the migrated stack end-to-end

- Severity: High
- Status: Resolved in Turn 3
- Area: Tooling / migration validation

#### Why this matters

Even if the production web runtime has mostly moved, local development and automated browser validation still assume the old `app.campsite.test` plus API/auth/sync sidecar topology. That means developer workflows and smoke tests are not validating the supported migrated architecture; they are validating a legacy-shaped environment.

#### Evidence

- [`script/dev:3`](/Users/declancowen/Documents/GitHub/Campsite/script/dev#L3) still runs `api/script/pre-dev` first.
- [`script/dev:21`](/Users/declancowen/Documents/GitHub/Campsite/script/dev#L21) injects `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_AUTH_URL`, and `NEXT_PUBLIC_SYNC_URL` for ngrok-based legacy sidecars.
- [`Procfile:1`](/Users/declancowen/Documents/GitHub/Campsite/Procfile#L1) through [`Procfile:7`](/Users/declancowen/Documents/GitHub/Campsite/Procfile#L7) still boot the Rails API, Sidekiq, Redis, and ngrok services as the default dev stack.
- [`apps/web/playwright/consts.ts:1`](/Users/declancowen/Documents/GitHub/Campsite/apps/web/playwright/consts.ts#L1) hardcodes `http://app.campsite.test:3000`.
- [`apps/web/playwright/auth.setup.ts:15`](/Users/declancowen/Documents/GitHub/Campsite/apps/web/playwright/auth.setup.ts#L15) waits for the old host explicitly.
- [`apps/web/playwright.config.ts:28`](/Users/declancowen/Documents/GitHub/Campsite/apps/web/playwright.config.ts#L28) and [`apps/web/playwright.config.ts:59`](/Users/declancowen/Documents/GitHub/Campsite/apps/web/playwright.config.ts#L59) use that legacy host as both base URL and web-server target.
- [`apps/web/public/meta/manifest-dev.webmanifest:63`](/Users/declancowen/Documents/GitHub/Campsite/apps/web/public/meta/manifest-dev.webmanifest#L63) still points dev installs at `http://app.campsite.test:3000`.

#### Recommendation

Rebase local dev and Playwright on the supported migrated topology. If Rails-side dev is still needed for archaeology, split that into an explicitly legacy workflow rather than keeping it as the default validation path.

---

### B2-07: Collaboration features still persist live data through compatibility payloads stuffed into unrelated tables instead of fully cut-over first-class storage

- Severity: High
- Status: Resolved in Turn 3
- Area: Migration completeness / data model

#### Why this matters

The collaboration slice is not fully decommissioned internally. OAuth applications, custom reactions, and note sync state still have active compatibility persistence paths that encode JSON into unrelated rows and fields. That keeps operational debt alive and makes the schema replication look cleaner than the actual runtime persistence model.

#### Evidence

- [`convex/collaboration.ts:185`](/Users/declancowen/Documents/GitHub/Campsite/convex/collaboration.ts#L185) reads compatibility payloads from `scheduledNotifications`.
- [`convex/collaboration.ts:511`](/Users/declancowen/Documents/GitHub/Campsite/convex/collaboration.ts#L511) through [`convex/collaboration.ts:598`](/Users/declancowen/Documents/GitHub/Campsite/convex/collaboration.ts#L598) still dual-read and promote legacy compat OAuth app records.
- [`convex/collaboration.ts:621`](/Users/declancowen/Documents/GitHub/Campsite/convex/collaboration.ts#L621) and [`convex/collaboration.ts:897`](/Users/declancowen/Documents/GitHub/Campsite/convex/collaboration.ts#L897) still read/delete custom reactions through compat payload rows.
- [`convex/collaboration.ts:919`](/Users/declancowen/Documents/GitHub/Campsite/convex/collaboration.ts#L919) through [`convex/collaboration.ts:977`](/Users/declancowen/Documents/GitHub/Campsite/convex/collaboration.ts#L977) store note sync state in `scheduledNotifications` fields like `name`, `timeZone`, and `deliveryTime`.

#### Recommendation

Finish the cutover by moving these paths onto dedicated first-class storage only, then delete the compat payload scheme and stop overloading unrelated tables.

---

### B2-08: Thread/message persistence still includes live blob-storage fallback and promotion paths, so the cutover is not actually complete

- Severity: Medium
- Status: Resolved in Turn 3
- Area: Migration completeness / operational debt

#### Why this matters

Threads and messages now have first-class tables, but the runtime still actively reads, writes, promotes, and deletes blob-backed `compat:` artifacts. That means the new storage is not the sole source of truth yet, and decommissioning old compatibility persistence would still be risky.

#### Evidence

- [`convex/threads.ts:9`](/Users/declancowen/Documents/GitHub/Campsite/convex/threads.ts#L9) defines `compat:` thread scope prefixes.
- [`convex/threads.ts:403`](/Users/declancowen/Documents/GitHub/Campsite/convex/threads.ts#L403) implements blob document reads.
- [`convex/threads.ts:479`](/Users/declancowen/Documents/GitHub/Campsite/convex/threads.ts#L479) promotes blob-backed threads to table storage on access.

---

## Turn 4

### Turn 4 Metadata

- Focus: Post-migration breadth re-audit across shipped clients and public entrypoints
- Date: 2026-03-29
- Scope: Whole repo, with emphasis on any remaining live legacy host assumptions after Turn 3 fixes

### Turn 4 Summary

- Turn 1 and Turn 2 findings remain resolved.
- New findings added this turn: 2
- Net assessment: the main web runtime is clean, but repo-wide migration closure is still incomplete because the Figma plugin and parts of the public site still depend on legacy Campsite hosts/media.

### Additional Findings

### B4-09: The Figma plugin is still hard-wired to legacy Campsite auth/API/realtime/media infrastructure

- Severity: High
- Status: Resolved in Turn 5
- Area: Migration completeness / shipped client

#### Why this matters

The main web app has been migrated, but the Figma plugin is still a shipped client in this repo and it continues to authenticate against legacy Campsite hosts, call legacy API hosts, and whitelist legacy media domains. That means repo-wide migration closure is not actually complete if the plugin remains supported.

#### Evidence

- [`apps/figma/build-figma-plugin.ui.js:13`](/Users/declancowen/Documents/GitHub/Campsite/apps/figma/build-figma-plugin.ui.js#L13) through [`apps/figma/build-figma-plugin.ui.js:17`](/Users/declancowen/Documents/GitHub/Campsite/apps/figma/build-figma-plugin.ui.js#L17) hardcode legacy `APP_URL`, `AUTH_URL`, `API_URL`, and Pusher keys/clusters into the built plugin UI.
- [`apps/figma/src/api/services/auth.ts:30`](/Users/declancowen/Documents/GitHub/Campsite/apps/figma/src/api/services/auth.ts#L30) and [`apps/figma/src/api/services/auth.ts:39`](/Users/declancowen/Documents/GitHub/Campsite/apps/figma/src/api/services/auth.ts#L39) open the sign-in flow on `window.AUTH_URL`.
- [`apps/figma/src/api/client.ts:4`](/Users/declancowen/Documents/GitHub/Campsite/apps/figma/src/api/client.ts#L4) points all generated API calls at `window.API_URL`.
- [`apps/figma/src/core/pusher.ts:5`](/Users/declancowen/Documents/GitHub/Campsite/apps/figma/src/core/pusher.ts#L5) sends channel authorization to `/v1/pusher/auth` on that same legacy API host.
- [`apps/figma/src/api/services/integrations.ts:16`](/Users/declancowen/Documents/GitHub/Campsite/apps/figma/src/api/services/integrations.ts#L16), [`apps/figma/src/api/services/slack.ts:44`](/Users/declancowen/Documents/GitHub/Campsite/apps/figma/src/api/services/slack.ts#L44), and [`apps/figma/src/components/OrganizationSwitcher.tsx:26`](/Users/declancowen/Documents/GitHub/Campsite/apps/figma/src/components/OrganizationSwitcher.tsx#L26) all build user flows from those legacy-injected base URLs.
- [`apps/figma/package.json:61`](/Users/declancowen/Documents/GitHub/Campsite/apps/figma/package.json#L61) through [`apps/figma/package.json:76`](/Users/declancowen/Documents/GitHub/Campsite/apps/figma/package.json#L76) still whitelist legacy API/auth/S3/Imgix domains.

#### Recommendation

Cut the plugin over to the owned migrated app host and owned realtime/media config the same way the web app was migrated. If the plugin is no longer a supported surface, explicitly archive or remove it so it is not counted as an open migration client.

---

### B4-10: The public marketing site still contains live legacy app/media links outside the redirect layer

- Severity: Medium
- Status: Resolved in Turn 6 with accepted historical asset exception
- Area: Migration completeness / public site

#### Why this matters

The public site redirects are now migrated, but a user can still click through to the old app domain from live homepage/blog content, and the site still depends on legacy Imgix domains to render some public assets. That means the public entry surface is not yet fully decommissioned from the old host/media stack.

#### Evidence

- [`apps/site/components/Home/Manifesto.tsx:309`](/Users/declancowen/Documents/GitHub/Campsite/apps/site/components/Home/Manifesto.tsx#L309) links a homepage example post directly to `https://app.campsite.com/...`.
- [`apps/site/next.config.js:33`](/Users/declancowen/Documents/GitHub/Campsite/apps/site/next.config.js#L33) still allows `campsite.imgix.net` and `campsite-dev.imgix.net` as active image domains.
- Live CMS/blog content under [`apps/site/app/blog/_cms`](/Users/declancowen/Documents/GitHub/Campsite/apps/site/app/blog/_cms) still embeds legacy `app.campsite.com` links and `campsite.imgix.net` images that are rendered on the shipped site.

#### Recommendation

Replace the remaining hardcoded app links with the owned app host, then decide whether old blog/media assets should be mirrored onto the owned media origin or intentionally left as historical external content. If the latter, document that as an explicit exception so the migration boundary is unambiguous.

---

## Turn 5

### Turn 5 Metadata

- Focus: Resolve Turn 4 shipped-client and public-site migration leftovers
- Date: 2026-03-29

### Turn 5 Summary

- `B4-09` resolved: the Figma plugin now targets the owned app host for auth/API/app links and no longer hardcodes legacy Campsite app/auth/API hosts.
- `B4-10` narrowed: live public-site `app.campsite.com` / `api.campsite.com` links were replaced, and the site image allowlist was narrowed to historical production Imgix assets only.
- Remaining repo-level migration exception: a small set of historical blog post images still render from legacy `campsite.imgix.net` URLs, and the site keeps that one allowlist entry to support them.

### Verification

- `pnpm --filter @campsite/config build`
- `pnpm --filter @campsite/figma build`
- `pnpm --filter @campsite/site build`

All three passed.

---

## Turn 6

### Turn 6 Metadata

- Focus: Final breadth-first repo closure audit after Turn 5 fixes
- Date: 2026-03-29

### Turn 6 Summary

- No new shipped-runtime findings were identified.
- The grep sweep across `apps`, `packages`, and `convex` found no remaining `app.campsite.com`, `auth.campsite.com`, `api.campsite.com`, `sync.campsite.com`, `api.campsite.test`, or `auth.campsite.test` references in active runtime code.
- Remaining hits are limited to:
  - historical public blog images still hosted on `campsite.imgix.net`
  - mock/story/test fixture data
  - compatibility alias exports in shared config
- Those are treated as accepted non-blocking exceptions, not open migration defects.

### Verification basis

- Broad grep sweep across shipped/runtime surfaces:
  - `apps/web`
  - `apps/site`
  - `apps/figma`
  - `apps/sync-server`
  - `apps/styled-text-server`
  - `packages`
  - `convex`

### Final assessment

- Open findings: 0
- The migrated repo is clean from a practical runtime migration perspective.
- [`convex/threads.ts:521`](/Users/declancowen/Documents/GitHub/Campsite/convex/threads.ts#L521) and [`convex/threads.ts:546`](/Users/declancowen/Documents/GitHub/Campsite/convex/threads.ts#L546) still dual-read blob threads.
- [`convex/threads.ts:563`](/Users/declancowen/Documents/GitHub/Campsite/convex/threads.ts#L563), [`convex/threads.ts:645`](/Users/declancowen/Documents/GitHub/Campsite/convex/threads.ts#L645), and [`convex/threads.ts:717`](/Users/declancowen/Documents/GitHub/Campsite/convex/threads.ts#L717) still write blob artifacts whenever `storageMode` is blob.

#### Recommendation

Either run an explicit one-time migration and remove blob mode entirely, or keep the compatibility layer but stop describing the domain as fully cut over. Right now it is a partial cutover with live promotion semantics.

---

## Turn 3

### Turn 3 Metadata

- Focus: Remediation pass for Turn 1 and Turn 2 findings
- Date: 2026-03-29
- Scope: Sync auth, sync-server, styled-text-server, README/dev tooling, CI workflows, collaboration persistence, threads persistence

### Turn 3 Summary

- Findings resolved: `S1-01`, `B1-02`, `O1-03`, `O1-04`, `S2-05`, `O2-06`, `B2-07`, `B2-08`
- Net assessment: the audited Turn 1 and Turn 2 issues are fixed in code
- Remaining work: live deployment smoke test and service decommission validation

### Remediation Notes

- `S1-01`: sync tokens are now opaque signed grants. They no longer embed raw bearer access tokens, and sync-server no longer logs token material to Sentry.
- `B1-02`: sync-server now resolves its base URL from the migrated web host instead of legacy Rails API hosts.
- `O1-03`: the root README now documents the migrated stack as the default path, with legacy setup moved behind explicit legacy wording.
- `O1-04`: CI workflows no longer auto-fix and auto-commit back to PR branches during validation.
- `S2-05`: the checked-in styled-text bearer secret was removed from the active Procfile, and the service now treats auth as env-configured rather than source-controlled.
- `O2-06`: local dev, Playwright, and the dev manifest now target the migrated stack by default, with legacy boot preserved only behind explicit `--legacy` usage.
- `B2-07`: collaboration runtime paths now use first-class stored rows for OAuth applications and custom reactions, and note sync state no longer overloads `scheduledNotifications`.
- `B2-08`: thread/message runtime paths now use table-backed storage only; the blob fallback and promotion layer was removed from the active path.

### Verification

- `pnpm exec convex codegen`
- `pnpm --filter @campsite/web build`

Both passed after the remediation pass.

---

## Turn 4

### Turn 4 Metadata

- Focus: Fresh whole-repo re-audit after Turn 3 remediation
- Date: 2026-03-29
- Scope: Full repo, with emphasis on shipped surfaces adjacent to the migrated web runtime

### Turn 4 Summary

- Turn 1 and Turn 2 findings re-checked: still resolved
- New findings added this turn: 2
- Net assessment: the main migrated runtime is in much better shape, but repo-wide migration closure is still incomplete because the Figma plugin and the marketing site still point at legacy Campsite hosts/media origins

### Additional Findings

### B4-09: The Figma plugin still hardcodes legacy API/auth hosts and legacy media domains

- Severity: High
- Status: Open
- Area: Migration completeness / shipped client surfaces

#### Why this matters

The repo-wide migration is not actually closed if a shipped client still authenticates against and talks to the old Campsite backend domains. The plugin build config and manifest still encode legacy API/auth and Imgix hosts directly, so this surface would continue to depend on the old stack even if the main web app is fully cut over.

#### Evidence

- [build-figma-plugin.ui.js:13](/Users/declancowen/Documents/GitHub/Campsite/apps/figma/build-figma-plugin.ui.js#L13) through [build-figma-plugin.ui.js:15](/Users/declancowen/Documents/GitHub/Campsite/apps/figma/build-figma-plugin.ui.js#L15) hardcode `app.campsite.com`, `auth.campsite.com`, and `api.campsite.com` for production.
- [package.json:61](/Users/declancowen/Documents/GitHub/Campsite/apps/figma/package.json#L61) through [package.json:76](/Users/declancowen/Documents/GitHub/Campsite/apps/figma/package.json#L76) still whitelist legacy API/auth/S3/Imgix domains in Figma network access.
- [attachments.ts:94](/Users/declancowen/Documents/GitHub/Campsite/apps/figma/src/api/services/attachments.ts#L94) still assumes Imgix cache warming behavior in the plugin attachment flow.

#### Recommendation

Treat the Figma plugin as a first-class migrated client: move its host configuration to the new owned web/API surface, update allowed domains to the new stack, and remove legacy media assumptions from the plugin attachment flow.

---

### O4-10: The marketing site still sends acquisition traffic and image loading through legacy Campsite hosts

- Severity: Medium
- Status: Open
- Area: Operations / migration closure

#### Why this matters

Even if the main app runtime is migrated, the repo still contains a public-facing site that routes users to legacy Campsite domains for sign-up/community and still allows legacy Imgix media origins. That means the migration is not repo-wide complete from an operator or user-journey perspective.

#### Evidence

- [next.config.js:23](/Users/declancowen/Documents/GitHub/Campsite/apps/site/next.config.js#L23) still whitelists `campsite.imgix.net` and `campsite-dev.imgix.net` as image origins.
- [next.config.js:88](/Users/declancowen/Documents/GitHub/Campsite/apps/site/next.config.js#L88) still redirects `/community` to `https://app.campsite.com/design/join`.
- [next.config.js:94](/Users/declancowen/Documents/GitHub/Campsite/apps/site/next.config.js#L94) still redirects `/start` to `https://auth.campsite.com/sign-up`.

#### Recommendation

Update the marketing site to target the migrated owned app host for acquisition and community flows, and replace legacy media origins with the owned media strategy used by the migrated stack.
