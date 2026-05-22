# Feature Specification: Migrate Docs Site from Remix 2 to React Router 7

**Feature Branch**: `003-remix-to-react-router-7`

**Created**: 2026-05-21

**Status**: Draft

**Input**: User description: "the docs are using remix 2, but it should be using react-router 7. I would like us to migrate to this."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Documentation site loads and renders on the modern framework (Priority: P1)

As a visitor to react-spring.dev, I can browse the documentation site exactly as I do today — every page, route, search interaction, theme toggle, and embedded code sandbox continues to work — while the underlying framework has been replaced with the supported successor to Remix 2.

**Why this priority**: This is the entire point of the migration. Remix 2 is now positioned as the prior generation of the framework that succeeds it; the docs must stay on a supported, actively-maintained foundation so security patches, performance improvements, and ecosystem updates remain available. If this story doesn't ship, there is no migration.

**Independent Test**: Visit every documented route on a preview deployment of the migrated site and confirm content renders, navigation works, search returns results, the theme toggle persists across reloads, and embedded sandboxes load — without any HTTP errors, hydration mismatches, or missing assets.

**Acceptance Scenarios**:

1. **Given** the migrated docs are deployed to a preview environment, **When** a visitor navigates to the home page, **Then** the page renders server-side with the correct theme, metadata, and content, matching the current production site.
2. **Given** the migrated docs are deployed, **When** a visitor navigates between any two documentation routes (e.g., `/docs/components/use-spring` to `/docs/advanced/spring-value`), **Then** the destination page renders with the correct content, meta tags, and active-link highlighting.
3. **Given** a visitor lands on a deep link such as `/docs/components/parallax`, **When** the page loads cold (no client navigation), **Then** the response is server-rendered with full content and metadata, and search engines see the same HTML as a user.
4. **Given** the site is deployed, **When** the build pipeline runs, **Then** it succeeds end-to-end (install, build, deploy) using the new framework's CLI and tooling.

---

### User Story 2 - Existing URLs continue to resolve (Priority: P1)

Every URL that resolves on the current production docs site continues to resolve to the same content on the migrated site, with no broken inbound links from search engines, blog posts, or external documentation.

**Why this priority**: The docs are a public, SEO-indexed resource. Breaking URLs would invalidate search rankings, break links from the wider React/animation ecosystem, and damage trust. This is non-negotiable for the migration to be considered complete.

**Independent Test**: Compile a list of all currently-served routes from production (sitemap + route file enumeration), hit each URL on the migrated preview, and confirm every one returns a 200 with content that matches the production page.

**Acceptance Scenarios**:

1. **Given** the list of public routes on production, **When** each route is requested on the migrated site, **Then** every route returns HTTP 200 with semantically-equivalent content.
2. **Given** any sub-route under `/docs/*`, **When** it is requested directly (without prior client-side navigation), **Then** the server returns the correct page without a redirect or 404.

---

### User Story 3 - Local development workflow is preserved (Priority: P2)

A contributor can clone the repo, install dependencies, and run the docs site locally using a familiar single command, with hot module reload, MDX content updates, and the script watcher behaving as they do today.

**Why this priority**: The docs depend on contributors being able to iterate locally. A regression here would slow every future docs PR. It's P2 rather than P1 because the production site can ship even if DX is temporarily slightly different — but the gap should be small and time-boxed.

**Independent Test**: From a clean checkout of the migration branch, run `pnpm install --frozen-lockfile` followed by the docs dev command, edit an MDX file, and verify the change appears in the browser without a manual restart.

**Acceptance Scenarios**:

1. **Given** a fresh clone of the migration branch, **When** a contributor runs the documented install + dev commands, **Then** the dev server starts on the expected port and serves the home page.
2. **Given** the dev server is running, **When** a contributor edits an MDX page under `app/routes/`, **Then** the change appears in the browser within a few seconds without a full server restart.
3. **Given** the dev server is running, **When** a contributor edits a component file, **Then** hot module reload applies the change without losing client state where the framework supports it.

---

### User Story 4 - Production deployment continues to work on the existing host (Priority: P1)

The migrated docs build and deploy on the same hosting provider used today (Vercel), using the host's officially-supported integration for the new framework, with no manual server configuration required outside of the repository.

**Why this priority**: Deployment is the only mechanism by which the migration reaches users. If the deploy target breaks, the migration cannot ship. P1 because it directly gates release.

**Independent Test**: Push the migration branch to a preview branch and confirm Vercel produces a successful preview deployment whose URL serves the full site.

**Acceptance Scenarios**:

1. **Given** the migrated repo is pushed to a feature branch, **When** the hosting provider runs its automatic build, **Then** the build succeeds and a preview URL is produced.
2. **Given** a successful preview deployment, **When** the preview URL is opened, **Then** the site behaves identically to a local production build of the same commit.

---

### Edge Cases

- **Vendored or coupled Remix-only adapters** (e.g., `@vercel/remix`, `@remix-run/serve`): the migration must either replace these with the new framework's equivalents or remove them entirely. Pages must not silently lose features that depend on these adapters (e.g., Vercel analytics, request context).
- **MDX route conventions**: the current docs heavily use Remix v2 flat route file naming (`docs.advanced.spring-value.mdx`, `docs.components.use-spring.mdx`, etc.). Route resolution after migration must produce the same URL tree, even if the file-on-disk convention changes.
- **Server-only modules** (e.g., `getTheme`/`setTheme` in `theme.server.ts`, the feedback API route): server/client code separation must continue to work — server-only modules must not leak into the client bundle, and client hints / cookie handling must continue to function.
- **Existing `react-router` dependency at v6**: the codebase already depends on `react-router@6.28.1` directly (alongside Remix). The migration must reconcile this to a single, consistent version of React Router 7 rather than leaving both installed side-by-side.
- **Build artefacts and asset URLs**: any inbound links to hashed asset paths from external integrations or cached search-engine snippets should either continue to resolve or be acceptably stale; the migration should not silently rename the public asset directory in a way that breaks live caches.
- **Search integration** (`@docsearch/react` + Algolia): the existing search index keys off live URLs; route changes that alter URL structure would silently break search results until the index is rebuilt.
- **Cookie/theme handling across SSR and client**: theme is currently derived from a server-set cookie plus client hints — the migrated framework must preserve this so first paint matches user preference and there's no flash of incorrect theme.
- **Stale links to `/api/feedback`**: after FR-019, the endpoint is gone. Inbound requests (which should be near-zero — it's a form-target, not a documented link) MUST hit the standard 404 page, not produce a 500.
- **MDX copy referencing the feedback button**: `docs._index.mdx` currently advertises the per-page widget. That prose MUST be rewritten in the same change so the docs don't describe a non-existent feature.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The docs application MUST be built and served by React Router 7 (in its framework / SSR mode), replacing the existing Remix 2 framework as the primary application runtime.
- **FR-002**: All `@remix-run/*` runtime packages (`@remix-run/node`, `@remix-run/react`, `@remix-run/serve`, `@remix-run/server-runtime`, `@remix-run/dev`) MUST be removed from the docs package's dependency tree as part of this migration, replaced with the React Router 7 equivalents.
- **FR-003**: The existing `react-router@6.x` direct dependency MUST be upgraded to React Router 7, with only one major version of React Router resolving in the dependency tree.
- **FR-004**: Every URL currently served by the production docs site MUST continue to resolve to the same logical page after migration, returning HTTP 200 with equivalent content.
- **FR-005**: The site MUST continue to be server-rendered for first paint of every public documentation route, preserving current SEO behaviour (meta tags, canonical URLs, OpenGraph/Twitter card data, server-rendered content).
- **FR-006**: Route-level data loading (currently expressed via Remix `loader`/`action` functions, including `LoaderFunctionArgs` and `ActionFunctionArgs`) MUST be preserved with equivalent semantics under React Router 7's loader/action API.
- **FR-007**: MDX-based content authoring MUST continue to work, including the existing remark/rehype plugin pipeline (frontmatter, directives, callouts, code highlighting, slug + autolink headings). Authors MUST NOT need to relearn how to write a docs page.
- **FR-008**: The Vanilla Extract styling pipeline MUST continue to compile and apply styles correctly under the new framework's Vite integration.
- **FR-009**: Server-only code (e.g., theme cookie helpers, the feedback API endpoint) MUST remain server-only after migration — it MUST NOT be bundled into the client.
- **FR-010**: The application MUST continue to deploy to Vercel using Vercel's officially-supported integration for React Router 7, replacing the current `@vercel/remix` preset.
- **FR-011**: The existing `pnpm docs:dev` developer workflow MUST continue to launch a local dev server with hot module reload for both component code and MDX content. The command name MAY change but the behaviour and ergonomics MUST be preserved.
- **FR-012**: The production build command invoked by Turborepo (`docs#build`) MUST produce a deployable artefact for the new framework, with Turbo's input/output paths updated accordingly.
- **FR-013**: Theme handling (server cookie + client hints, light/dark themes via Vanilla Extract classes) MUST continue to work without a flash of incorrect theme on first paint.
- **FR-014**: Analytics integration (`@vercel/analytics`) MUST continue to fire on client-side route changes after migration.
- **FR-015**: Search integration via `@docsearch/react` MUST continue to function, returning results that link to live URLs on the migrated site.
- **FR-016**: Embedded code sandboxes (`@codesandbox/sandpack-react`) MUST continue to load and execute examples without regression.
- **FR-017**: TypeScript type-checking via `pnpm test:ts` MUST continue to pass for the docs package after migration.
- **FR-018**: README / contributor documentation for the docs package MUST be updated to reflect any changed commands or conventions introduced by the migration.
- **FR-019**: The in-page Feedback module (the per-page up/down-vote widget plus its Supabase-backed submission endpoint) MUST be removed in the same change as the framework migration. Specifically: (a) the `<Feedback />` component and its styles MUST be deleted; (b) the `/api/feedback` server action MUST be deleted; (c) the `@supabase/supabase-js` runtime dependency MUST be removed from `docs/package.json`; (d) any MDX prose that describes the per-page feedback widget MUST be updated so the docs no longer advertise a feature that no longer exists; (e) the generic Discussions link (currently in `docs._index.mdx`) MUST remain as the canonical feedback channel.

### Key Entities

- **Route**: A URL-addressable page on the docs site. Has a path (e.g., `/docs/components/use-spring`), a server loader (optional), a server action (optional), a meta function, and a rendered React tree. Routes are currently authored as files under `app/routes/` using Remix flat-route naming and must continue to be authored in a similarly-conventional way after migration.
- **MDX Document**: A documentation page authored in MDX with frontmatter. Its compiled output is consumed by the framework as a route module. The remark/rehype pipeline that transforms it is part of the build configuration and must be carried across unchanged in behaviour.
- **Server-only Module**: A module (e.g., `theme.server.ts`) that must execute only on the server and never be shipped to the client. The convention for marking such modules may change with the new framework and that convention must be applied consistently.
- **Deployment Artefact**: The output of the production build that the hosting provider consumes. Its shape changes between Remix 2 and React Router 7; the host integration must produce the correct shape for Vercel to serve.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of the production routes currently served by the docs return HTTP 200 with semantically-equivalent content on the migrated preview deployment.
- **SC-002**: Zero `@remix-run/*` packages remain in the resolved dependency tree of the docs workspace after migration (verifiable via the lockfile).
- **SC-003**: Exactly one major version of `react-router` (v7) resolves in the docs workspace dependency tree after migration.
- **SC-004**: A first-time contributor following the README can clone, install, and run the docs site locally in under 5 minutes on a typical broadband connection, with no manual steps beyond the documented commands.
- **SC-005**: The production build completes successfully on the hosting provider's CI for every commit on the migration branch, with no manual intervention.
- **SC-006**: Lighthouse performance, SEO, and accessibility scores for the home page and a representative deep documentation page do not regress by more than 5 points compared to the current production site.
- **SC-007**: Time-to-first-byte and largest-contentful-paint for the home page, measured on the migrated preview, are within 10% of the current production site under equivalent network conditions.
- **SC-008**: TypeScript type-checking (`pnpm test:ts`) passes on the migrated docs package with zero new errors introduced by the migration.
- **SC-009**: No new console errors or hydration warnings are emitted in the browser on first load of any of the documented routes.
- **SC-010**: After migration, zero references to the removed Feedback module remain in `docs/app/` source (no imports of `~/components/Feedback`, no `/api/feedback` link, no `@supabase/supabase-js` usage), and `/api/feedback` returns 404 on the preview deployment.

## Assumptions

- The target framework is React Router 7 in its **framework / SSR mode** (the mode that is the direct successor to Remix), not React Router 7 as a client-only library. This matches the user's intent of replacing Remix, not just bumping a router package.
- Vercel remains the hosting provider; the migration uses Vercel's officially-supported integration for React Router 7 rather than introducing a new host.
- The MDX authoring experience and the existing remark/rehype plugin set continue to be the right choice — the migration is a framework swap, not a content-pipeline rewrite.
- Vanilla Extract continues to be the styling solution and integrates with React Router 7's Vite-based build via its existing Vite plugin.
- The `@docsearch/react` Algolia integration continues to be used as-is; no search-backend changes are bundled into this migration.
- URL structure remains identical to today's production site. If any route renaming is unavoidable, it would be handled with explicit redirects and called out as a separate decision rather than absorbed silently.
- The migration is scoped to the `docs/` workspace only. No other workspaces in the monorepo (core, animated, shared, rafz, targets, parallax, demo) are affected.
- React 19 is already in use and is compatible with React Router 7; no React version change is part of this migration.
- The Supabase-backed feedback API route (`api.feedback.ts`) is **removed** as part of this migration (see FR-019), not migrated. The Supabase project itself and the `feedback` table are left intact at the data layer; only the docs-site integration is removed. Future feedback flows the GitHub Discussions link already referenced in `docs._index.mdx`.
- Algolia DocSearch's crawler will reindex the site after deployment; short-term staleness of search results is acceptable during the cutover window.
