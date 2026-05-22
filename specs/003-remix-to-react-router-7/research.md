# Phase 0 — Research: Remix 2 → React Router 7

**Branch**: `003-remix-to-react-router-7` | **Date**: 2026-05-22

This document captures the technology decisions that resolve every unknown in the plan's Technical Context. There are no remaining `NEEDS CLARIFICATION` markers after Phase 0.

---

## R1. Target framework: React Router 7 framework mode

**Decision**: Migrate to `react-router@^7` in **framework mode** (the SSR-aware mode with a Vite plugin, loaders/actions, route modules, and a CLI), not the client-only routing library mode.

**Rationale**:

- The Remix team merged into React Router. Framework mode of RR7 is the published, supported, direct successor to Remix v2 — the same loader/action model, the same route-module shape, the same server entry conventions.
- The user's intent ("the docs are using remix 2, but it should be using react-router 7") is explicitly to replace the framework, not to drop SSR. Client-only RR7 would lose SSR, which spec FR-005 forbids.
- Every Remix 2 capability the docs depends on (SSR, loaders, actions, meta, links, server-only modules, MDX route modules) maps 1-to-1.

**Alternatives considered**:

- **Stay on Remix 2**: rejected — the user explicitly requested the migration; Remix 2 is no longer the actively-developed line.
- **Switch to Next.js / Astro / TanStack Start**: rejected — out of scope; spec assumes a framework-swap, not a content-pipeline rewrite. Each alternative would require re-authoring the MDX pipeline, the routing, and the deployment integration.
- **Client-only `react-router@7` (drop SSR)**: rejected — violates FR-005 (SSR for SEO) and SC-006 (Lighthouse SEO score).

---

## R2. Package mapping (Remix → RR7)

**Decision**: One-to-one package swap as below. The `@remix-run/*` scope is fully removed.

| Remove                         | Add                    | Notes                                                                                                                  |
| ------------------------------ | ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `@remix-run/react`             | `react-router` (v7)    | The unified package now exports `Links`, `Meta`, `Outlet`, `Scripts`, `useLoaderData`, etc.                            |
| `@remix-run/node`              | `@react-router/node`   | Node runtime polyfill helpers (`createReadableStreamFromReadable`, etc.).                                              |
| `@remix-run/serve`             | `@react-router/serve`  | Only needed if `pnpm start` (local prod serve) is preserved. See R6.                                                   |
| `@remix-run/server-runtime`    | (removed)              | Types now come from `react-router` directly.                                                                           |
| `@remix-run/dev`               | `@react-router/dev`    | Provides the Vite plugin (`reactRouter()`) and CLI (`react-router build`, `react-router dev`, `react-router typegen`). |
| `@vercel/remix`                | `@vercel/react-router` | Vercel's RR7 preset; replaces `vercelPreset()` import source.                                                          |
| `react-router@6.28.1` (direct) | `react-router@^7`      | Same package name; major-version bump. Reconciles the existing direct dep onto v7.                                     |

**Rationale**: This is the canonical mapping documented by the React Router team for the Remix-to-RR7 upgrade. Every API the docs uses appears on both sides of the table.

**Alternatives considered**:

- **Keep `@remix-run/react` via re-export shim**: rejected — leaves the `@remix-run/*` scope in the dep tree, violating SC-002.
- **Replace `react-router@6` with the v6 client-only package and keep RR7 framework separate**: rejected — would result in two majors of `react-router` resolving, violating SC-003.

---

## R3. Route convention: keep Remix v2 flat names via `@react-router/fs-routes`

**Decision**: Add a single new file `docs/app/routes.ts` that delegates to `@react-router/fs-routes`'s `flatRoutes()` helper, configured to read `app/routes/*` with the same Remix v2 flat convention. **No MDX file is renamed.**

```ts
// docs/app/routes.ts
import { flatRoutes } from '@react-router/fs-routes'
import { type RouteConfig } from '@react-router/dev/routes'

export default flatRoutes() satisfies RouteConfig
```

**Rationale**:

- RR7 framework mode requires explicit route configuration via `app/routes.ts`, but ships `@react-router/fs-routes` specifically to preserve the Remix v2 flat-route file naming. With this enabled, `docs.components.use-spring.mdx` continues to resolve to `/docs/components/use-spring` exactly as today.
- Renaming ~39 MDX files to the new RR7 nested-folder convention would (a) churn git history pointlessly, (b) risk breaking Algolia DocSearch results until reindexed, and (c) add scope without benefit. fs-routes is the explicit migration off-ramp.
- The `vite.config.mts`'s current `ignoredRouteFiles: ['**/.*', '**/*.css']` filter has an equivalent in `flatRoutes({ ignoredRouteFiles: [...] })`.

**Alternatives considered**:

- **Migrate to RR7's native nested-folder route convention**: rejected — touches 39 files, breaks search index URLs (mitigable but unnecessary), and adds risk to a swap that should be mechanical.
- **Define every route by hand in `routes.ts`**: rejected — verbose and easy to drift out of sync.

---

## R4. Vite plugin: replace `remix()` with `reactRouter()`

**Decision**: In `docs/vite.config.mts`, replace `import { vitePlugin as remix } from '@remix-run/dev'` with `import { reactRouter } from '@react-router/dev/vite'`, and call `reactRouter()` in the plugin array (no arguments needed — config moves to `react-router.config.ts`). Drop the `installGlobals()` call (RR7 + Node 22 has native `fetch`/`Request`/`Response`).

**Rationale**:

- The `reactRouter()` plugin reads `react-router.config.ts` (presets, future flags, SSR toggles, app directory) and `app/routes.ts` (route tree). Plugin-level options are explicitly _not_ passed inline — this is the documented RR7 pattern.
- Node 22 (the project's `.nvmrc`) has native Fetch; `installGlobals()` is a no-op there and is removed in RR7.
- `vanillaExtractPlugin()`, `tsconfigPaths()`, and the MDX plugin block stay in place. Vanilla Extract's Vite plugin is framework-agnostic; it integrates with whatever's running on top.

**Alternatives considered**:

- **Keep `installGlobals()`**: rejected — emits a deprecation warning in RR7 and serves no purpose on Node 22.
- **Move MDX configuration into a custom RR7 plugin**: rejected — `@mdx-js/rollup` runs at the Vite/Rollup layer and is independent of the framework; no migration needed.

---

## R5. Vercel deployment: `@vercel/react-router` preset

**Decision**: Replace the `@vercel/remix/vite` `vercelPreset()` with `@vercel/react-router`'s preset, wired up in `react-router.config.ts`:

```ts
// docs/react-router.config.ts
import { vercelPreset } from '@vercel/react-router/vite'
import type { Config } from '@react-router/dev/config'

export default {
  presets: [vercelPreset()],
} satisfies Config
```

**Rationale**:

- `@vercel/react-router` is Vercel's officially-supported preset for RR7 framework mode. It produces the deployment artefact shape (`.vercel/output/**`) Vercel's runtime expects, in the same way `@vercel/remix` did for Remix.
- The Vercel project itself needs no manual configuration change beyond Vercel auto-detecting the new framework; the preset's job is to emit the correct artefact during `react-router build`.

**Alternatives considered**:

- **Use the default Node adapter + custom `vercel.json`**: rejected — reinvents what the preset provides, and would risk diverging from Vercel's recommended pipeline on future RR7 releases.
- **Switch hosts (Cloudflare, Netlify)**: rejected — explicit non-goal in the spec assumptions.

---

## R6. `pnpm start` (local production serve)

**Decision**: Replace `remix-serve ./build/server/index.js` with `react-router-serve ./build/server/index.js` (the binary `@react-router/serve` provides). Keep the script in `package.json` for parity, but mark its priority as low — production traffic goes through Vercel, not through `react-router-serve`.

**Rationale**: One-to-one functional replacement. Useful for smoke-testing a built artefact locally without the Vercel runtime.

**Alternatives considered**:

- **Drop the `start` script entirely**: rejected — it's a small, useful debug aid; keeping it costs one dep.

---

## R7. Type imports for loaders, actions, and meta

**Decision**: Replace Remix type imports with `react-router` type imports:

| Remix import                                               | RR7 import                                                                       |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `import { LoaderFunctionArgs } from '@remix-run/node'`     | `import type { LoaderFunctionArgs } from 'react-router'`                         |
| `import { ActionFunctionArgs } from '@remix-run/node'`     | `import type { ActionFunctionArgs } from 'react-router'`                         |
| `import { MetaFunction } from '@vercel/remix'`             | `import type { MetaFunction } from 'react-router'`                               |
| `import { LinksFunction } from '@vercel/remix'`            | `import type { LinksFunction } from 'react-router'`                              |
| `import { json } from '@vercel/remix'` / `@remix-run/node` | Drop. Return `Response.json(...)` directly, or use `data()` from `react-router`. |

**Rationale**: RR7 unifies these types under the `react-router` package. `json()` is removed in favour of the native `Response.json()` (or RR7's `data()` helper for type inference). This is a mechanical search-and-replace across ~10 route files (every `loader`, every `action`, the catch-all `$.tsx`, `api.feedback.ts`, and `root.tsx`).

The auto-generated per-route types from `react-router typegen` (under `.react-router/types/`) are available but not required — using the package-level types keeps the diff small. We add `./.react-router/types/**/*` to `tsconfig.json`'s `include` array so future use of generated types Just Works.

**Alternatives considered**:

- **Migrate every route to the auto-generated `Route.LoaderArgs` form**: rejected — adds 39+ file edits for marginal type-inference improvement. Can be done as a follow-up if desired.

---

## R8. Existing `react-router@6` direct usage in components

**Decision**: Audit `docs/app/components/**/*` and `docs/app/hooks/**/*` for direct `react-router` imports (`useNavigate`, `useLocation`, `Link`, `NavLink`, etc.). All of these APIs exist in v7 with the same names and signatures; no code changes are expected. Verification: `pnpm test:ts` post-bump must pass.

**Rationale**: React Router 7 is largely API-compatible with v6.28 for the client-side hooks/components the docs uses. Breaking changes between v6 and v7 mostly affect data routers, future-flag opt-ins (which v6.28 has already been opted into via the Remix data-router internally), and the removal of `unstable_*` prefixes. The docs don't use anything in those categories.

**Alternatives considered**:

- **Pin to `react-router@6.x` and only bump Remix→RR7's internal usage**: rejected — violates SC-003 (exactly one major must resolve).

---

## R9. Build output directory + Turborepo I/O

**Decision**: RR7's default output is `build/client/` (static assets, hashed) + `build/server/` (server bundle). Update `docs/turbo.json`:

```jsonc
{
  "extends": ["//"],
  "tasks": {
    "build": {
      "inputs": [
        "app/**",
        "public/**",
        "react-router.config.ts",
        "vite.config.mts",
      ],
      "outputs": ["build/**", ".react-router/**"],
    },
  },
}
```

**Rationale**:

- Turbo's `outputs` glob needs to match where RR7 writes — `build/**` covers both `build/client` and `build/server` in one glob.
- `.react-router/**` is the typegen output directory; including it in `outputs` lets Turbo cache the generated types between runs (and ignoring it in `inputs` prevents cache invalidation on every typegen).
- The current `inputs: ["app/**"]` misses changes to `public/**` (static assets) and the new config files — fixing the glob is a bonus correctness win included in this migration.

**Alternatives considered**:

- **Leave `outputs: ["build/**", "public/build/**"]`**: rejected — `public/build/**` is the Remix v2 artefact path and no longer produced by RR7. Stale glob would silently miscache.

---

## R10. Server-only modules

**Decision**: The existing `theme.server.ts` and `*.server.ts` naming convention is preserved by RR7 unchanged. Vite's Remix→RR7 plugin continues to honour the `.server.ts` suffix as a server-only barrier. No code changes required to `helpers/theme.server.ts`; only its consumers (in `root.tsx`) update their type imports per R7.

**Rationale**: The `.server.ts` convention pre-dates Remix; both Remix and RR7 honour it identically. This is the lowest-risk path.

**Alternatives considered**:

- **Move to RR7's `route.ts`-level loader-only convention**: rejected — would require splitting `theme.server.ts` into per-route helpers, adding scope.

---

## R11. Scripts in `package.json`

**Decision**: Updated scripts:

| Before                                                            | After                                                          |
| ----------------------------------------------------------------- | -------------------------------------------------------------- |
| `"build": "remix vite:build"`                                     | `"build": "react-router build"`                                |
| `"dev": "concurrently \"pnpm dev:remix\" \"pnpm scripts:watch\""` | `"dev": "concurrently \"pnpm dev:rr\" \"pnpm scripts:watch\""` |
| `"dev:remix": "vite dev"`                                         | `"dev:rr": "react-router dev"`                                 |
| `"start": "remix-serve ./build/server/index.js"`                  | `"start": "react-router-serve ./build/server/index.js"`        |
| `"test:ts": "tsc --noEmit"`                                       | `"test:ts": "react-router typegen && tsc --noEmit"`            |

Root-level scripts that reference docs (`pnpm docs:dev`, `pnpm docs:build` in the root `package.json`) continue to delegate via Turbo and require no edits — Turbo invokes whatever `dev`/`build` resolves to inside the workspace.

**Rationale**:

- `react-router dev` is the supported dev command in framework mode (it wraps Vite with HMR + route-module reloading); `vite dev` directly would skip the framework-mode wiring.
- `react-router typegen` regenerates per-route types before `tsc` reads them. Running it as a `test:ts` prerequisite avoids spurious type errors on a cold checkout.
- The `dev:remix` script name is renamed to `dev:rr` (descriptive of the new framework) — the only contributor-facing script that changes name. The README is updated to match.

**Alternatives considered**:

- **Keep `dev:remix` as the name to minimise the README diff**: rejected — confusing for future contributors; the name change is a small one-time cost.

---

## R12. Verification approach

**Decision**: Verification is manual + automated route-walk, not new test code. Sequence:

1. `pnpm install --frozen-lockfile` from a clean checkout (lockfile regenerated as part of the migration commit).
2. `pnpm test:ts` — must pass (FR-017, SC-008).
3. `pnpm docs:dev` — site loads on `http://localhost:3000`; navigate the home page and one MDX route manually; confirm theme toggle persists and no hydration warning.
4. `pnpm docs:build` — succeeds; `docs/build/client/**` and `docs/build/server/**` produced; `docs/build/**` size sanity-checked against the current Remix output.
5. Vercel preview deploy — automatic on branch push.
6. Route-walk script (`scripts/verify-routes.sh` — written as part of the migration): hit every route in the production sitemap on the preview URL and assert HTTP 200 + non-empty body.
7. Lighthouse run on home + one deep route — within 5 points of production (SC-006).

**Rationale**: The docs workspace has no test suite to extend; adding one is out of scope for this migration. Manual + scripted verification matches what `001-migrate-to-pnpm` and `002-vitest-browser-migration` did for their workspace-level changes.

**Alternatives considered**:

- **Add a Playwright/Vitest browser E2E suite for docs**: rejected — large scope-add, would dominate this PR. Tracked as a follow-up.

---

## R13. Remove the Feedback module

**Decision**: Delete the entire in-page Feedback feature (FR-019) in the same change as the framework migration:

- `docs/app/components/Feedback/Feedback.tsx` — deleted
- `docs/app/components/Feedback/Feedback.css.ts` — deleted
- `docs/app/routes/api.feedback.ts` — deleted
- `docs/app/routes/docs.tsx` — remove `import { Feedback } from '~/components/Feedback/Feedback'` (line 18) and the `<Feedback location={activeRoute?.href} />` JSX (line 154)
- `docs/app/routes/docs._index.mdx` — rewrite lines 42–44 ("each page has it's own feedback button…") so the docs no longer advertise the removed widget; keep the GitHub Discussions link as the canonical feedback channel
- `docs/package.json` — remove `@supabase/supabase-js` from `dependencies`
- Vercel project env vars — `SUPABASE_URL` and `SUPABASE_ANON_KEY` can be unset (manual step, called out in `quickstart.md`)

**Rationale**:

- Bundling the removal with the framework migration avoids paying the migration cost on code that's about to be deleted: no need to rewrite `api.feedback.ts`'s Remix-style action signature into the RR7 form, no need to retype its imports, no need to verify Supabase-on-RR7-on-Vercel works.
- The Discussions link in `docs._index.mdx` already exists as a generic feedback channel, so removing the per-page widget doesn't leave users without a way to give feedback — only without an in-page surface for it.
- `@supabase/supabase-js` is the only dep used _exclusively_ by the Feedback module (`zod` stays — it's also used in `scripts/docs/frontmatter.ts`; `cookie` stays — used by theme). One dep falls out of the runtime tree.

**Alternatives considered**:

- **Migrate the feedback module to RR7 unchanged**: rejected — couples a feature decision to the framework swap. If the user wants to keep feedback, that's a separate addition; the explicit user request here is to remove it.
- **Keep the component but stub the API to return 410 Gone**: rejected — leaves dead code and a confusing UX (button that does nothing useful).
- **Delete the component but leave `api.feedback.ts` as a 404 stub**: rejected — pointless; the default splat 404 already handles unmatched paths.

**Knock-on effects** (also captured in `data-model.md`):

- The route count in `data-model.md` §2 drops from 39 to 38; the public URL contract in `contracts/routes.md` drops the `/api/feedback` row entirely.
- The Supabase data flow disappears from `data-model.md` §5.
- `quickstart.md` no longer asks the verifier to exercise the feedback POST or set Supabase env vars locally.

---

## Summary table — files touched

| Category             | Files                                                                                                                               | Change                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Package manifest     | `docs/package.json`                                                                                                                 | Dep swap, script swap                       |
| Lockfile             | `pnpm-lock.yaml` (repo root)                                                                                                        | Regenerated                                 |
| Vite config          | `docs/vite.config.mts`                                                                                                              | Plugin swap, `installGlobals()` removed     |
| New RR7 config       | `docs/react-router.config.ts`                                                                                                       | NEW                                         |
| New route config     | `docs/app/routes.ts`                                                                                                                | NEW                                         |
| TS config            | `docs/tsconfig.json`                                                                                                                | Add `./.react-router/types/**/*` to include |
| Turbo config         | `docs/turbo.json`                                                                                                                   | Update inputs/outputs globs                 |
| Server entry helpers | `docs/app/root.tsx`, `docs/app/routes/$.tsx`, any other route with `import from '@vercel/remix'` or `@remix-run/*`                  | Mechanical import rewrite (per R7)          |
| Feedback removal     | `docs/app/components/Feedback/**`, `docs/app/routes/api.feedback.ts`, `docs/app/routes/docs.tsx`, `docs/app/routes/docs._index.mdx` | Delete (per R13)                            |
| README               | `docs/README.md`                                                                                                                    | Updated commands                            |
| Project guidance     | `CLAUDE.md` (root) — between SPECKIT markers                                                                                        | Plan reference updated                      |

MDX content files (`docs/app/routes/**/*.mdx`) are **not** modified.

---

## Out of scope (explicit)

- No content changes to any MDX page **except** a 3-line copy update in `docs._index.mdx` made necessary by R13.
- No design / styling changes.
- No Algolia DocSearch reconfiguration (the crawler reindexes itself).
- No introduction of a docs test suite.
- No constitution amendment (the Prettier→oxfmt wording fix is tracked separately).
- No changes to any library workspace (`packages/*`, `targets/*`, `demo`).
