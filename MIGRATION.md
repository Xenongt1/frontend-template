# ChainPilot Migration: testing → develop, into TanStack template

## Context

Two repos are involved.

- **OLD** — `Amali-Tech/ChainPilotFrontend`, local checkout at
  `~/Desktop/chainpilot/ChainPilotFrontend`. Two branches matter:
  - `testing` — the snapshot that was previously ported into the new repo.
  - `develop` — 28 commits ahead of `testing`, includes the backend-URL fixes
    you want.
- **NEW** — `Xenongt1/frontend-template` (this repo). Built on TanStack
  Router (file-based), TanStack Query, Biome, i18next-http-backend, shadcn,
  Geist. Currently mid-migration: still carries `src/app/router.tsx`,
  `src/store/`, and `react-router-dom` in `package.json` alongside the new
  TanStack routes under `src/routes/`.

Goal: bring everything that landed on `develop` after `testing` into this
repo, **without** un-doing the TanStack/Biome scaffolding that the new repo
adds on top.

## What's actually different on develop vs testing

28 commits, 139 files touched (+4593, −10002). Grouped by intent:

### Bucket A — Backend / dev-proxy / API client fixes  (priority 1)

These are the "BE-url" fixes you called out. **None of them are in the new
repo yet** — they're the root cause of the runtime crashes on
`/inventory/catalogue`, `/inventory/stock`, `/iam/roles`.

| Commit | What it does | Lands in (new repo) |
|---|---|---|
| `cf04561` chore: add Vite dev proxy | Adds `server.proxy` for `/api` + `/grades`, env-driven target, port 4030 | `vite.config.ts` |
| `665c58b` drop /inventory proxy rule | Removes a rule that swallowed SPA routes | `vite.config.ts` |
| `dd08506` merge backend-connection fixes | Cumulative; covered by the two above + `client.ts` change | — |
| `57da47b` surface 502 when backend returns SPA fallback HTML | Content-type guard in `apiRequest` to throw `ApiError(502)` instead of crashing later on `.map` | `src/core/api/client.ts` |
| `17fe94b` harden content-type header check | Defensive string check on the same guard | `src/core/api/client.ts` |
| `bfcfb78` auto-bootstrap config in dev, never prompt setup form | Skips the `ConfigSetupForm` in dev | `src/core/config/index.ts` + provider chain |
| `1fa4c8e` / `bdc9dcc` add /api prefix to inventory endpoints | All `inventoryApi` URLs now go through `/api/inventory/*` | `src/core/api/inventory.ts` |

The new repo's `src/core/api/inventory.ts` already has the `/api` prefix
(file was synced from a later snapshot), but `client.ts` is **missing the
502 SPA-fallback guard** — that's the exact bug producing your "Cannot read
properties of undefined" errors. Without the guard, when Vite's SPA
fallback returns `index.html` for a missing API route, `apiRequest` returns
the HTML string and downstream code crashes on `.map` / `.totalItems`.

### Bucket B — Tailwind migration of inline styles  (priority 3)

A long sequence (15 commits) replacing inline `style={{}}` and global CSS
classes with Tailwind utility classes. Spans: sidebar, topbar,
stock-locations, EditStockLocation, EditInventory, StockLocationDetail,
registration steps (BasicInfo, Properties, GradeExpiry, Attributes,
Review), shared form components (Input, Select, Textarea, FormField,
Toast, SuccessToast), EmptyState cluster, ConfigSetupForm.

Almost all of these files exist in the new repo too — they came over with
the testing snapshot. The diff is **per-file**: same component, same
behavior, different styling layer.

### Bucket C — Canonical Button primitive  (priority 2)

| Commit | What |
|---|---|
| `83ba6fe` add canonical Button with Figma states | New `src/shared/components/ui/Button/Button.tsx` (107 LOC) |
| `1678a43` extend Button with all variants/sizes | Variant + size matrix |
| `9b2e957` replace `.btn-primary` global class with `<Button variant="primary">` | Sweep across callsites |

In the new repo, shadcn's `Button` already exists under
`src/components/ui/`. Decision: **prefer shadcn's Button**, not the
hand-rolled one from develop. Only port the variant/size matrix if the
shadcn version is missing a needed variant.

### Bucket D — Roles module restructure  (priority 2)

`77a8965 refactor(roles): restructure Create/Edit/Detail layouts + wrap
permissions in card` — touches `RoleForm`, `PermissionRow`,
`CreateRolePage`, `EditRolePage`, `RoleDetailPage`, `RolesPagination`.

The new repo already has roles pages copied from testing. This commit
re-lays them out. Port after Bucket A unblocks the API.

### Bucket E — Deletions / dead code removal  (priority 4)

- Auth pages deleted (`SignInPage`, `AcceptInvitePage`, `CompleteProfilePage`,
  `AuthLayout`, `PasswordRequirements`).
- Users module pared down (`MembersTable`, `AddRoleModal`,
  `InviteUserModal`, `UserDetailsPage` deleted; `UsersPage` slimmed 560→
  ~0 LOC).
- `src/store/authApi.ts`, `authSlice.ts`, `usersApi.ts` deleted.
- `src/__mocks__/` deleted.
- `qa/tests/` restructured into `qa/e2e/` with new Playwright config.

Most of these don't exist in the new repo at all, so the deletion is a
no-op. Verify before each batch.

## Complication: the new repo is also mid-migration

The new repo has **both** routing systems checked in:

- TanStack Router: `src/main.tsx`, `src/routes/*.tsx`, `routeTree.gen.ts`,
  `@tanstack/react-router` in deps.
- Old React Router: `src/app/router.tsx`, `react-router-dom` in deps.

Only the TanStack side is wired to `main.tsx`. The `src/app/` folder is
dead code. **Don't accidentally port develop changes into `src/app/`** —
those files are slated for deletion. When a commit on develop touches
`src/app/router.tsx`, ignore it; the routing equivalent lives in
`src/routes/`.

Same story for `src/store/`: develop has Redux slices, but the new repo
has decided on TanStack Query for data-fetching. Port the **data-shape /
endpoint changes** from develop, but use TanStack Query hooks
(`useQuery`/`useMutation`) instead of RTK Query.

Other coexistence issues to handle during the merge:

- `src/i18n.ts` (active) vs `src/core/i18n/index.ts` (dead). Delete the
  dead one; develop's locale-file changes go into `public/locales/*` (the
  active HttpBackend path), not `src/locales/`.
- `api/api.json` (0 bytes, json-server stub) — keep empty or delete; the
  Vite proxy makes it unnecessary.

## Recommended order

Six steps. Each one ends with a green dev server and a commit.

### Step 1 — Vite proxy + 502 SPA-fallback guard  (≈ 30 min)

Unblocks `/inventory/catalogue`, `/inventory/stock`, `/iam/roles`. Highest
ROI move.

**Changes:**

1. `vite.config.ts` — add `server.proxy` for `/api` and `/grades`
   targeting `env.VITE_DEV_PROXY_TARGET || <test ALB>`. Keep TanStack
   Router plugin, devtools, Biome unchanged. Don't copy develop's
   `manualChunks` or `path` aliases — TanStack template uses
   `tsconfigPaths: true` instead.
2. `src/core/api/client.ts` — port the content-type guard from develop
   (lines surrounding "Bad Gateway: backend returned a non-JSON
   response"). This is the actual fix for the `.map` of undefined crash.
3. `.env.local` (new file, gitignored) — `VITE_DEV_PROXY_TARGET=http://54.229.134.97:8080`
   if you want to mirror your existing ChainPilot dev box.

**Validate:** restart Vite, visit `/inventory/catalogue`, confirm
`/api/inventory/items` returns JSON (200) in DevTools Network and the
page renders rows. If the backend is down, you should see a 502 toast,
not a console crash.

### Step 2 — Fix the `/` route i18n  (≈ 5 min)

Independent of develop. Add `welcome` + `description` top-level keys to
`public/locales/{en,fr,ar}/translation.json` (es already has them).

### Step 3 — Config auto-bootstrap in dev  (≈ 20 min)

Port `bfcfb78`: when running in dev, never show `ConfigSetupForm`; just
fall through with sensible defaults. Touches `src/core/config/` and
whatever wraps it in the provider chain.

### Step 4 — UI primitive parity  (≈ 1 h)

Audit develop's `src/shared/components/ui/{Input,Select,Textarea,FormField,Toast,SuccessToast}/`
versus the new repo. Where the new repo uses shadcn, **keep shadcn** and
update callsites if needed. Where the new repo has no equivalent, copy
develop's Tailwind-migrated version. Skip develop's hand-rolled `Button`
in favor of shadcn.

### Step 5 — Inline-styles → Tailwind sweep  (≈ 2–3 h)

Walk Bucket B file-by-file. For each file in the new repo:
1. `git show origin/develop:<path>` from `~/Desktop/chainpilot/ChainPilotFrontend`.
2. Diff against the current file in the new repo.
3. Apply non-conflicting style changes; preserve any TanStack-flavored
   imports the new repo has added.

Files (in suggested order):

- `src/shared/layout/Sidebar.tsx`, `TopBar.tsx`, `AppLayout.tsx`
- `src/shared/components/EmptyState/*`, `PlaceholderPage.tsx`
- `src/modules/inventory/components/registration/{BasicInfoStep,PropertiesStep,GradeExpiryStep,AttributesSection,ReviewStep}.tsx`
- `src/modules/inventory/components/StockLocationForm.tsx` and the
  inventory pages (`Register…`, `Edit…`, `StockLocations…`,
  `StockLocationDetail…`)
- `src/core/config/ConfigSetupForm.tsx`

### Step 6 — Roles module restructure  (≈ 1 h)

Port `77a8965` once Bucket A has the roles API working. Touches
`src/modules/roles/{components,pages}/`.

### Step 7 — Cleanup pass  (≈ 30 min, do last)

Once everything works:

- Delete `src/app/` (router.tsx, store.ts, providers.tsx — dead code).
- Delete `src/core/i18n/index.ts` (dead duplicate of `src/i18n.ts`).
- Delete `src/locales/` (HttpBackend reads from `public/locales/`).
- Remove `react-router-dom` from `package.json` after grepping there are
  zero remaining imports.
- Remove Redux deps (`@reduxjs/toolkit`, `react-redux`) if no module
  still pulls from `src/store/`.
- Delete or fill `api/api.json` (currently 0 bytes).

## Per-module porting notes

When a develop change touches a file, decide using this table:

| File in develop | New repo location | Action |
|---|---|---|
| `src/app/router.tsx` | n/a (uses `src/routes/`) | Ignore |
| `src/store/*` | n/a (uses TanStack Query) | Ignore the slice, port the endpoint shape into a `useQuery` hook |
| `src/core/api/*` | `src/core/api/*` | Port directly |
| `src/core/config/*` | `src/core/config/*` | Port directly |
| `src/core/i18n/*` | use `src/i18n.ts` | Adapt; HttpBackend, not bundled JSON |
| `src/shared/layout/*` | `src/shared/layout/*` | Port directly |
| `src/shared/components/ui/Button/*` | `src/components/ui/button.tsx` | Use shadcn; only port new variants if missing |
| `src/shared/components/ui/{Input,Select,Textarea,…}/*` | same path | Port if no shadcn equivalent is already wired |
| `src/modules/inventory/*` | `src/modules/inventory/*` | Port directly |
| `src/modules/roles/*` | `src/modules/roles/*` | Port directly |
| `src/locales/*.json` | `public/locales/<lng>/translation.json` | Keys port; file format and path differ |

## Risks to watch

1. **Reviving dead React Router**: develop's commits touch `src/app/`. If
   you blindly copy, you'll re-light a code path that's already
   end-of-life in the new repo. Always check whether the new repo has a
   TanStack equivalent before porting any router/provider change.
2. **CSS regressions**: develop's Tailwind sweep relied on `globals.css`
   tokens and a Tailwind v3 config. The new repo is on Tailwind v4 with
   CSS variables in `styles.css`. Token names may differ — spot-check
   colors after each batch.
3. **i18n key drift**: develop touched `src/locales/{en,fr,ar}.json`
   (bundled). The new repo serves `public/locales/<lng>/translation.json`
   (HTTP). Keys need to land in the public path, and the namespace is
   `translation` (default), not split.
4. **react-router-dom imports in copied modules**: any `useNavigate` /
   `Link` from `react-router-dom` must be swapped for the TanStack
   equivalents during the port.
5. **Test file divergence**: develop drops several test files
   (`UserDetailsPage.test.tsx`, `MembersTable.test.tsx`, etc.). If the
   new repo still carries them, they'll fail. Remove alongside the
   source.
