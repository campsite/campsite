# Review: Onboarding — Org Join Flow Rework

## Project context (captured on Turn 1)

| Field | Value |
|-------|-------|
| **Repository** | campsite |
| **Remote** | https://github.com/declancowen/campsite.git |
| **Branch** | onboarding |
| **Repo type** | monorepo (pnpm workspaces + turbo) |
| **Stack** | Next.js / Convex / WorkOS / TypeScript |
| **Packages affected** | apps/web, convex/ |
| **OS** | macOS 25.4.0 |
| **Package manager** | pnpm 9.7.1 |
| **Node** | v25.8.0 |

## Scope (cumulative)

- `apps/web/app/auth/complete/route.ts` — Turn 1
- `apps/web/app/v1/organizations/join/route.ts` — Turn 1 (new file)
- `apps/web/app/v1/organizations/lookup/route.ts` — Turn 1 (new file)
- `apps/web/components/Home/HomeSidebar.tsx` — Turn 1
- `apps/web/components/NavigationSidebar/OrganizationSwitcher.tsx` — Turn 1
- `apps/web/pages/new/index.tsx` — Turn 1, Turn 2 (fixes)
- `convex/email.ts` — Turn 1
- `convex/onboarding.ts` — Turn 1
- `convex/workspace.ts` — Turn 1

## Review status

| Field | Value |
|-------|-------|
| **Review started** | 2026-04-02 |
| **Last reviewed** | 2026-04-02 |
| **Total turns** | 3 |
| **Open findings** | 1 |
| **Resolved findings** | 3 |
| **Accepted findings** | 2 |

---
