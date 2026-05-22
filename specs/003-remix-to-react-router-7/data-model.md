# Phase 1 — Data Model: Remix 2 → React Router 7

**Branch**: `003-remix-to-react-router-7` | **Date**: 2026-05-22

This is a framework migration, not a feature with persisted entities. The relevant "data model" is the set of static mappings the migration must apply — packages, route files, type imports — and the invariants those mappings must preserve.

---

## 1. Package mapping

The authoritative dependency swap. Every entry on the left must be removed from `docs/package.json` (and the resolved `pnpm-lock.yaml`); every entry on the right must appear.

### Runtime dependencies

| Field      | Before (Remix 2.15.2)       | After (RR7)            | Notes                                                        |
| ---------- | --------------------------- | ---------------------- | ------------------------------------------------------------ |
| dependency | `@remix-run/node`           | `@react-router/node`   | Node runtime helpers                                         |
| dependency | `@remix-run/react`          | (removed)              | Consolidated into `react-router`                             |
| dependency | `@remix-run/serve`          | `@react-router/serve`  | Optional — only for `pnpm start` local prod-serve            |
| dependency | `@remix-run/server-runtime` | (removed)              | Types now exported from `react-router`                       |
| dependency | `@vercel/remix`             | `@vercel/react-router` | Vercel deploy preset                                         |
| dependency | `react-router@6.28.1`       | `react-router@^7`      | Major bump; reconciles the duplicate React Router resolution |
| dependency | `@supabase/supabase-js`     | (removed)              | Sole consumer was the deleted Feedback module (FR-019)       |

### Dev dependencies

| Field         | Before           | After                     | Notes                                           |
| ------------- | ---------------- | ------------------------- | ----------------------------------------------- |
| devDependency | `@remix-run/dev` | `@react-router/dev`       | Vite plugin + CLI                               |
| devDependency | (none)           | `@react-router/fs-routes` | NEW — preserves Remix v2 flat-route file naming |

### Invariants

- **INV-P1**: After migration, `grep -rE '"@remix-run/' docs/package.json pnpm-lock.yaml` returns zero matches. (Verifies SC-002.)
- **INV-P2**: `pnpm ls react-router -r --depth -1 --json` reports exactly one major version (7.x) across the entire workspace. (Verifies SC-003.)
- **INV-P3**: No package version is pinned to an alpha/beta/RC at merge time; only stable `^7.x` ranges are used.
- **INV-P4**: `@supabase/supabase-js` does not appear anywhere in `docs/package.json` or the resolved `pnpm-lock.yaml` lockfile entries scoped to the docs workspace. (Verifies FR-019.) `zod` and `cookie` remain — `zod` is used by `docs/scripts/docs/frontmatter.ts`; `cookie` is used by `theme.server.ts`.

---

## 2. Route file → URL mapping (the public surface)

38 entries in `docs/app/routes/` after `api.feedback.ts` is deleted (FR-019). Names are preserved under `@react-router/fs-routes`; URLs are byte-identical to current production.

| Route file                                        | Resolved URL                                   | Type                                   |
| ------------------------------------------------- | ---------------------------------------------- | -------------------------------------- |
| `_index.tsx`                                      | `/`                                            | Landing page (homepage)                |
| `$.tsx`                                           | (catch-all 404)                                | Splat route — handles unmatched paths  |
| `docs.tsx`                                        | `/docs` (layout)                               | Pathless layout for `/docs/*` children |
| `docs._index.mdx`                                 | `/docs`                                        | Docs landing                           |
| `docs.getting-started.mdx`                        | `/docs/getting-started`                        | MDX                                    |
| `docs.typescript.mdx`                             | `/docs/typescript`                             | MDX                                    |
| `docs.advanced._index.mdx`                        | `/docs/advanced`                               | Section index                          |
| `docs.advanced.async-animations.mdx`              | `/docs/advanced/async-animations`              | MDX                                    |
| `docs.advanced.config.mdx`                        | `/docs/advanced/config`                        | MDX                                    |
| `docs.advanced.controller.mdx`                    | `/docs/advanced/controller`                    | MDX                                    |
| `docs.advanced.events.mdx`                        | `/docs/advanced/events`                        | MDX                                    |
| `docs.advanced.interpolation.mdx`                 | `/docs/advanced/interpolation`                 | MDX                                    |
| `docs.advanced.spring-ref.mdx`                    | `/docs/advanced/spring-ref`                    | MDX                                    |
| `docs.advanced.spring-value.mdx`                  | `/docs/advanced/spring-value`                  | MDX                                    |
| `docs.components._index.mdx`                      | `/docs/components`                             | Section index                          |
| `docs.components.parallax.mdx`                    | `/docs/components/parallax`                    | MDX                                    |
| `docs.components.parallax-layer.mdx`              | `/docs/components/parallax-layer`              | MDX                                    |
| `docs.components.use-chain.mdx`                   | `/docs/components/use-chain`                   | MDX                                    |
| `docs.components.use-spring.mdx`                  | `/docs/components/use-spring`                  | MDX                                    |
| `docs.components.use-spring-value.mdx`            | `/docs/components/use-spring-value`            | MDX                                    |
| `docs.components.use-springs.mdx`                 | `/docs/components/use-springs`                 | MDX                                    |
| `docs.components.use-trail.mdx`                   | `/docs/components/use-trail`                   | MDX                                    |
| `docs.components.use-transition.mdx`              | `/docs/components/use-transition`              | MDX                                    |
| `docs.concepts._index.mdx`                        | `/docs/concepts`                               | Section index                          |
| `docs.concepts.animated-elements.mdx`             | `/docs/concepts/animated-elements`             | MDX                                    |
| `docs.concepts.controllers-and-springs.mdx`       | `/docs/concepts/controllers-and-springs`       | MDX                                    |
| `docs.concepts.imperative-api.mdx`                | `/docs/concepts/imperative-api`                | MDX                                    |
| `docs.concepts.targets.mdx`                       | `/docs/concepts/targets`                       | MDX                                    |
| `docs.guides._index.mdx`                          | `/docs/guides`                                 | Section index                          |
| `docs.guides.react-three-fiber.mdx`               | `/docs/guides/react-three-fiber`               | MDX                                    |
| `docs.guides.testing.mdx`                         | `/docs/guides/testing`                         | MDX                                    |
| `docs.utilities._index.mdx`                       | `/docs/utilities`                              | Section index                          |
| `docs.utilities.use-in-view.mdx`                  | `/docs/utilities/use-in-view`                  | MDX                                    |
| `docs.utilities.use-isomorphic-layout-effect.mdx` | `/docs/utilities/use-isomorphic-layout-effect` | MDX                                    |
| `docs.utilities.use-reduced-motion.mdx`           | `/docs/utilities/use-reduced-motion`           | MDX                                    |
| `docs.utilities.use-resize.mdx`                   | `/docs/utilities/use-resize`                   | MDX                                    |
| `docs.utilities.use-scroll.mdx`                   | `/docs/utilities/use-scroll`                   | MDX                                    |
| `examples.tsx`                                    | `/examples`                                    | Examples page                          |

### Invariants

- **INV-R1**: For each row above, the URL on the migrated preview returns HTTP 200 (except `$.tsx`, which is exercised by hitting a deliberately-invalid path and asserting the rendered 404 page). Verifies SC-001 and FR-004.
- **INV-R2**: `flatRoutes()` ignores `ignoredRouteFiles: ['**/.*', '**/*.css']` (matching the current Remix config) so dotfiles and CSS-modules colocated next to route files are not turned into routes.
- **INV-R3**: `GET /api/feedback` returns HTTP 404 on the migrated preview (the route file has been deleted; the splat 404 handles unmatched paths). Verifies FR-019 / SC-010.

---

## 3. Type import rewrite

A mechanical search-and-replace, applied across `docs/app/**/*.{ts,tsx}`. No semantic change.

| Symbol                                                                                                                                                 | Old source                          | New source                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------- | --------------------------------------------------- |
| `LoaderFunctionArgs`                                                                                                                                   | `@vercel/remix` / `@remix-run/node` | `react-router` (type-only import)                   |
| `ActionFunctionArgs`                                                                                                                                   | `@vercel/remix` / `@remix-run/node` | `react-router` (type-only import)                   |
| `LoaderFunction`                                                                                                                                       | `@vercel/remix`                     | `react-router` (type-only import)                   |
| `ActionFunction`                                                                                                                                       | `@vercel/remix`                     | `react-router` (type-only import)                   |
| `MetaFunction`                                                                                                                                         | `@vercel/remix`                     | `react-router` (type-only import)                   |
| `LinksFunction`                                                                                                                                        | `@vercel/remix`                     | `react-router` (type-only import)                   |
| `Links`, `Meta`, `Outlet`, `Scripts`, `ScrollRestoration`, `useLoaderData`, `useNavigate`, `Link`, `NavLink`, `Form`, `useFetcher`, `useMatches`, etc. | `@remix-run/react`                  | `react-router` (value import)                       |
| `json`                                                                                                                                                 | `@vercel/remix` / `@remix-run/node` | (removed) — replace usage with `Response.json(...)` |
| `redirect`                                                                                                                                             | `@vercel/remix` / `@remix-run/node` | `react-router` (value import)                       |
| `installGlobals`                                                                                                                                       | `@remix-run/node`                   | (removed; not needed on Node 22)                    |

### Invariants

- **INV-T1**: `grep -rE "from '@(remix-run|vercel/remix)" docs/app docs/vite.config.mts docs/env.d.ts` returns zero matches after migration.
- **INV-T2**: `react-router typegen && tsc --noEmit` (i.e. `pnpm test:ts`) returns exit code 0 with zero errors.

---

## 4. Configuration files

### New files

- **`docs/react-router.config.ts`**: framework config (presets, future flags). Initial content:

  ```ts
  import { vercelPreset } from '@vercel/react-router/vite'
  import type { Config } from '@react-router/dev/config'

  export default {
    presets: [vercelPreset()],
  } satisfies Config
  ```

- **`docs/app/routes.ts`**: route tree, delegated to `flatRoutes()` to preserve the v2 flat-route convention:

  ```ts
  import { flatRoutes } from '@react-router/fs-routes'
  import type { RouteConfig } from '@react-router/dev/routes'

  export default flatRoutes({
    ignoredRouteFiles: ['**/.*', '**/*.css'],
  }) satisfies RouteConfig
  ```

### Modified files

- **`docs/vite.config.mts`**: drop `installGlobals()`, replace `remix({...})` with `reactRouter()`, leave MDX/vanilla-extract/tsconfigPaths plugins alone.
- **`docs/tsconfig.json`**: add `./.react-router/types/**/*` to `include`; add `.react-router/` to whichever `exclude`-style ignore is appropriate; ensure `"types": [...]` references `@react-router/node` if currently referencing `@remix-run/node` types.
- **`docs/turbo.json`**: see R9 — `outputs` becomes `["build/**", ".react-router/**"]`; `inputs` gains `public/**`, `react-router.config.ts`, `vite.config.mts`.
- **`docs/env.d.ts`**: replace any `@remix-run/*` triple-slash references with `@react-router/node`.

### Invariants

- **INV-C1**: A fresh `pnpm install --frozen-lockfile && pnpm --filter @react-spring/docs build` produces both `docs/build/client/` and `docs/build/server/` directories.
- **INV-C2**: `.react-router/` is git-ignored (add to root `.gitignore` if not already covered by a parent glob).

---

## 5. Feedback module removal (FR-019)

The following files / lines are deleted in the same change as the framework migration:

| Path                                           | Action                                                                                                                       |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `docs/app/components/Feedback/Feedback.tsx`    | Delete                                                                                                                       |
| `docs/app/components/Feedback/Feedback.css.ts` | Delete                                                                                                                       |
| `docs/app/components/Feedback/`                | Delete (directory empty after the two files above)                                                                           |
| `docs/app/routes/api.feedback.ts`              | Delete                                                                                                                       |
| `docs/app/routes/docs.tsx`                     | Remove `import { Feedback } from '~/components/Feedback/Feedback'` and the `<Feedback location={activeRoute?.href} />` JSX   |
| `docs/app/routes/docs._index.mdx`              | Rewrite the prose advertising the per-page feedback button (currently around lines 42–44); leave the Discussions link intact |
| `docs/package.json`                            | Remove `@supabase/supabase-js` from `dependencies`                                                                           |
| Vercel project env vars                        | (manual) Unset `SUPABASE_URL` and `SUPABASE_ANON_KEY` — out of repo, called out in `quickstart.md`                           |

### Invariants

- **INV-F1**: `grep -rE 'Feedback|/api/feedback|@supabase' docs/app docs/scripts 2>/dev/null` returns zero matches in source files (excluding `docs._index.mdx`'s rewritten prose, which must not mention the deleted feature). Verifies SC-010.
- **INV-F2**: `GET /api/feedback` on the preview returns HTTP 404 (handled by the splat route). Verifies SC-010.
- **INV-F3**: The Supabase project and its `feedback` table are untouched at the data layer; this PR only removes the docs-side integration.

---

## 6. State / data flow (unchanged)

The migration changes **none** of these flows; they are listed to make explicit what must continue to work:

- **Theme**: server cookie (`getTheme`/`setTheme` in `helpers/theme.server.ts`) + client hints (`ClientHintCheck`, `getHints` from `components/Site/SiteClientHints`) → `useTheme` hook → applied as `lightThemeClass` / `darkThemeClass` on `<html>`. First paint must match user preference without flash (FR-013).
- **Search**: `@docsearch/react` widget → Algolia hosted index → results link to live `/docs/*` URLs.
- **Analytics**: `@vercel/analytics` `<Analytics />` component in `root.tsx` → fires page-view on every client-side navigation.
- **Embedded sandboxes**: `@codesandbox/sandpack-react` runs entirely client-side; framework swap doesn't affect it.
