# Review: Username field changed to store full email address

## Project context (captured on Turn 1 — not re-detected on subsequent turns)

| Field | Value |
|-------|-------|
| **Repository** | campsite |
| **Remote** | https://github.com/declancowen/campsite.git |
| **Branch** | declancowen/username-set-to-email |
| **Repo type** | monorepo (pnpm + Turbo) |
| **Stack** | Next.js / Convex / TypeScript / WorkOS |
| **Packages affected** | `convex/` (backend), `apps/web/` (consumer routes) |
| **OS** | Darwin 25.4.0 |
| **Package manager** | pnpm 9.7.1 |
| **Node** | v25.8.0 |

## Scope (cumulative — updated each turn as new files are touched)

Files and areas reviewed across all turns:
- `convex/workspace.ts` — added Turn 1
- `convex/users.ts` — added Turn 1
- `convex/onboarding.ts` — added Turn 1
- `convex/content.ts` — added Turn 1
- `convex/threads.ts` — added Turn 1 (read for context — `getLegacyDmByUsername` username comparison)
- `convex/externalPlatforms.ts` — added Turn 1 (read for context — `figmaUsers.handle`)
- `convex/adminOps.ts` — added Turn 1 (read for context — `by_username` index query)
- `convex/content.ts:2188` — added Turn 1 (read for context — username membership lookup)
- `apps/web/app/v1/organizations/[orgSlug]/threads/dms/[username]/route.ts` — added Turn 1

## Review status (updated every turn)

| Field | Value |
|-------|-------|
| **Review started** | 2026-03-30 11:18:29 BST |
| **Last reviewed** | 2026-03-30 11:18:29 BST |
| **Total turns** | 1 |
| **Open findings** | 4 |
| **Resolved findings** | 0 |
| **Accepted findings** | 0 |

---

## Turn 1 — 2026-03-30 11:18:29 BST

| Field | Value |
|-------|-------|
| **Commit** | 6811ba8 |
| **IDE / Agent** | Claude Code (Conductor) |

**Summary:** Four convex files are modified. The core change is `fallbackUsername` in `workspace.ts`, which now returns the full email address (e.g. `declan@cowan.co`) instead of a slug derived from the email local part (e.g. `declan`). Supporting changes wrap this value in `toSlug()` before recording the friendly URL slug and before slicing the `publicId`. Two smaller additions in `onboarding.ts` (missing schema fields) and `content.ts` (auto-project-membership) are also included. The critical risk is that several existing "find user by username" comparison sites in unmodified code now silently receive no matches because they compare against the old slug format.

| Status | Count |
|--------|-------|
| Findings | 4 |

---

### Findings

#### B1-01 [BUG] High — `convex/workspace.ts:159-161` → `convex/threads.ts:1559` — DM lookup broken for all existing users

**What's happening:**
`fallbackUsername` now returns `identity.email?.toLowerCase().trim()` — the full email address — as the `username` value stored on the user record. `getLegacyDmByUsername` (threads.ts:1559) finds the target user with `snapshot.users.find(user => user.username === args.username)`. The caller (Rails API via `/v1/organizations/[orgSlug]/threads/dms/[username]`) passes the URL path segment, which would be the previously-stored slug (e.g. `declan`). That slug no longer matches `declan@cowan.co`, so `targetUser` is always `undefined` and the function returns `{ dm: null }` for every existing user.

**Root cause:**
The change to `fallbackUsername` was not propagated to the callers that look up users by their stored `username` field. The comparison sites in threads.ts, content.ts, and adminOps.ts were written expecting a slug; they now receive an email.

**Codebase implication:**
- DM lookups via the legacy API route are silently broken — no error is thrown, the route returns a null DM.
- `content.ts:2188` — `getMemberByUsername` membership lookup will also return no match.
- `adminOps.ts:625` — admin "find user by username" query (`by_username` index with `.eq('username', args.username)`) will miss unless callers now pass the full email.
- `organizationAdmin.ts:409` — membership lookup by username comparison will return undefined.
- Any existing user whose `username` was a slug in the database will not be found until they re-authenticate and `syncViewer`/`ensureViewerWorkspace` runs to update their record to the email format.

**Solution options:**
1. **Quick fix:** Add a helper alongside `fallbackUsername` — `usernameToSlug(username)` — and update all comparison sites to normalise both sides: `toSlug(user.username) === toSlug(args.username)`. This is backward-compatible during the transition period when some records have slugs and some have emails.
2. **Proper fix:** Decide whether `username` is a display identifier (email) or a URL-safe slug, and separate the concerns. Store the email in `username` and derive the URL slug into a separate `slug` field (which already exists via the friendly slugs table). Update all "find by username" call sites to use email-based lookup consistently.

**Investigate:**
Check whether the Rails API passes a slug or an email to `/threads/dms/[username]`. Run `grep -r "threads/dms" api/ --include="*.rb"` to find the call site and confirm what value is passed as the username segment.

> ```diff
> -  const base = identity.preferredUsername || identity.email?.split('@')[0] || fallbackName(identity)
> -  return toSlug(base) || 'user'
> +  return identity.email?.toLowerCase().trim() || toSlug(identity.preferredUsername || fallbackName(identity)) || 'user'
> ```

---

#### B1-02 [BUG] Medium — `convex/users.ts:65` — `publicId` for new users silently truncates mid-slug

**What's happening:**
`publicId` is computed as `toSlug(fallbackUsername(profile)).slice(0, 12)`. `fallbackUsername` now returns the full email, e.g. `declan@cowan.co`. `toSlug` converts this to `declan-cowan-co`. `.slice(0, 12)` produces `declan-cowan-` — note the trailing hyphen — for emails where the local part is exactly 6 chars. For `declan@reciperoom.io`, it produces `declan-recip`. The result is a hyphen-terminated or semantically meaningless publicId that is exposed in URLs.

**Root cause:**
`publicId` was designed to be a short opaque token derived from the username slug. Now that the slug is email-derived and longer, the 12-char slice hits mid-word and sometimes ends on a separator.

**Codebase implication:**
Affects user profile URLs and any public-facing link containing the publicId. The `ensureViewerWorkspace` path already uses `generateToken().slice(0, 12)` which is fully opaque — so the two code paths are now inconsistent. `syncViewer` (users.ts) uses the email-derived publicId; `ensureViewerWorkspace` (workspace.ts:402) uses a random token.

**Solution options:**
1. **Quick fix:** In `syncViewer`, switch to `generateToken().slice(0, 12)` to match what `ensureViewerWorkspace` does — fully opaque, no semantic leakage.
2. **Proper fix:** Unify the publicId generation strategy across both paths to use a shared helper that always produces a random opaque token.

**Investigate:**
Check whether `syncViewer` and `ensureViewerWorkspace` can be called for the same user, and if so, which one sets the `publicId` first. If `syncViewer` always runs before `ensureViewerWorkspace`, the email-derived publicId will already be committed before the workspace path generates a random one — but `ensureViewerWorkspace` only sets it on insert, not patch, so the first value wins.

> ```diff
> -  publicId: fallbackUsername(profile).slice(0, 12),
> +  publicId: toSlug(fallbackUsername(profile)).slice(0, 12),
> ```

---

#### F1-03 [FLAG] Medium — `convex/externalPlatforms.ts:655` — `figmaUsers.handle` now stores full email instead of slug

**What's happening:**
`figmaUsers` is inserted with `handle: viewer.username`. `viewer.username` was previously a slug (e.g. `declan-cowan`); it is now the full email (`declan@cowan.co`). The `handle` field is not in the diff — this is a side-effect of the username change. It is unclear whether `handle` is meant to be the user's Figma-side display handle (which would come from the Figma OAuth profile, not the Campsite username) or the Campsite-internal identifier for the user.

**Root cause:**
`handle` derives its value from `viewer.username`, which has changed meaning without this specific insertion site being reviewed for correctness.

**Codebase implication:**
If `handle` is used downstream to match against Figma's API (e.g. to look up comment authors), storing an email instead of a Figma handle will cause mismatches. If it's just a display label, the impact is cosmetic.

**Solution options:**
1. **Quick fix:** Change `handle: viewer.username` to `handle: toSlug(viewer.username)` to restore the slug behaviour.
2. **Proper fix:** Confirm what `handle` semantically represents — if it should be the Figma-provided handle from the OAuth profile, source it from the Figma auth callback args instead.

**Investigate:**
Search for `figmaUsers` reads in the codebase to see how `handle` is consumed: `grep -rn "figmaUsers\|\.handle" convex/ apps/web/ --include="*.ts"`. Confirm with the team whether `handle` maps to the Figma username or is a Campsite-internal label.

> ```ts
> handle: viewer.username,   // was: slug like "declan-cowan", now: email "declan@cowan.co"
> ```

---

#### O1-04 [OBSERVATION] Low — `convex/onboarding.ts:568-571` — `publicId` and `updatedAt` added to membership insert

**What's happening:**
`createOrRestoreOrganizationMembership` now inserts `publicId: generateToken().slice(0, 12)` and `updatedAt: Date.now()` alongside the existing fields. These were previously absent from this specific insert path.

**Root cause:**
Schema alignment — these fields are likely required or expected by consumers of the `organizationMemberships` table but were missing from this code path.

**Codebase implication:**
Low risk. Membership records created via this path will now have the fields other paths already provide. Absence of these fields on pre-existing records (created before this change) is the more relevant operational concern — confirm whether existing records without `publicId` cause issues in any query or serialisation path.

**Solution options:**
1. **Verify:** Check if existing membership records in the dev database are missing `publicId` / `updatedAt` and run a migration if needed.

**Investigate:**
In the Convex dev dashboard, query `organizationMemberships` and check whether any rows lack `publicId`. If so, a backfill migration is needed for consistency.

> ```diff
> +    publicId: generateToken().slice(0, 12),
>      role: params.role,
> +    updatedAt: Date.now(),
> ```

---

### Recommendations

1. **Fix first — B1-01:** The broken DM lookup is the highest-priority issue. It silently returns null rather than erroring, which means it could already be failing in dev without a visible exception. Before pushing, determine whether the callers pass slugs or emails and either update the comparison sites or add slug-normalisation to both sides of the equality check.

2. **Fix next — B1-02:** The `publicId` truncation issue won't cause failures but will produce ugly public-facing IDs. Switch `syncViewer` to `generateToken().slice(0, 12)` to match `ensureViewerWorkspace` — a one-line fix.

3. **Confirm — F1-03:** Spend 5 minutes checking how `figmaUsers.handle` is consumed. If it's only a display label, accept the finding. If it maps to a Figma-side handle, fix it.

4. **Patterns noticed:** The change to `fallbackUsername` has cascading effects across multiple unmodified files because `username` is used both as a stored identifier and as a lookup key. The underlying tension is that an email address is a good unique identifier but a poor URL slug and a poor display handle. Consider whether `username` should remain the stored value used for lookups (and callers updated to pass emails), or whether a separate `slug` field should be used for URL routing and human-readable references.

5. **Suggested approach:** Fix B1-01 first — it directly breaks a user-facing flow. Then B1-02 (trivial). Then investigate F1-03. The O1-04 addition is clean and can go as-is.
