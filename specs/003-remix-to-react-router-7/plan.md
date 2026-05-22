# Implementation Plan: Migrate Docs Site from Remix 2 to React Router 7

**Branch**: `003-remix-to-react-router-7` | **Date**: 2026-05-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-remix-to-react-router-7/spec.md`

## Summary

The `docs/` workspace is a Remix 2.15.2 application served from Vercel via the `@vercel/remix` preset, with MDX content authored under `app/routes/` using Remix v2 flat-route naming, Vanilla Extract styling, and a Vite-based build. The Remix team has merged into React Router 7; framework mode of `react-router@7` is the supported successor and ships under the `react-router` / `@react-router/*` package scope.

The migration is in-place: keep every URL, every MDX file, every component, every loader/action — **with one explicit deletion: the in-page Feedback module** (per-page up/down-vote widget + Supabase-backed `/api/feedback` action) is removed in the same change (FR-019). Replace the Remix runtime, the Remix dev plugin, the Vercel preset, and the route-file convention adapter. Reconcile the existing direct `react-router@6` dependency (currently coexisting with Remix) to a single resolved v7. Update Turborepo I/O paths to the new build output, and update the README + CLAUDE.md so contributors land in the right place.

The library packages (`packages/*`, `targets/*`) are untouched.

## Technical Context

**Language/Version**: TypeScript 5.7.2 on Node 22.15.0 (`.nvmrc`); CI runs Node 18/20 elsewhere in the repo but the docs workspace tracks the root `.nvmrc`.

**Primary Dependencies (target state)**:

- `react-router@^7` (replaces `@remix-run/react` + bumps the existing direct `react-router@6.28.1`)
- `@react-router/dev@^7` (replaces `@remix-run/dev`, provides the Vite plugin and CLI)
- `@react-router/node@^7` (replaces `@remix-run/node`)
- `@react-router/serve@^7` (replaces `@remix-run/serve`; only needed if `pnpm start` is preserved — see research)
- `@react-router/fs-routes@^7` (compatibility helper that preserves Remix v2 flat-route conventions, so we don't have to rename ~39 MDX files)
- `@vercel/react-router` (replaces `@vercel/remix`; Vercel's officially-supported preset for RR7 framework mode)
- Vite 6.x (unchanged), `@mdx-js/rollup` 3.x (unchanged), Vanilla Extract Vite plugin (unchanged), all remark/rehype plugins (unchanged), React 19 (unchanged), `@codesandbox/sandpack-react` (unchanged), `@docsearch/react` (unchanged).

**Storage**: N/A. The Supabase integration is removed (FR-019); `@supabase/supabase-js` and the `SUPABASE_URL` / `SUPABASE_ANON_KEY` env vars exit the docs surface area. The Supabase project itself and its `feedback` table remain at the data layer (out of scope for this PR; cleanup tracked separately).

**Testing**: `pnpm test:ts` (`tsc --noEmit`) for the docs workspace. The docs package does not have unit or E2E tests today and this migration does not add any — verification is the route-walk + Lighthouse + manual checks defined in `quickstart.md`. The root Vitest browser project is unaffected because docs is excluded from `vitest.config.ts`.

**Target Platform**: Vercel (serverless Node functions for SSR + static assets on the edge CDN). Browser support follows React 19's matrix.

**Project Type**: Web application (SSR-rendered marketing/docs site). Single workspace under `docs/` inside a Turborepo + pnpm-workspaces monorepo.

**Performance Goals** (per spec SC-006/SC-007): Lighthouse scores within 5 points of current production; TTFB and LCP within 10% of current production under equivalent network conditions.

**Constraints**:

- URL surface must remain byte-identical to current production (~40 public routes).
- The build must continue to be invoked by Turbo's `docs#build` task; output paths in `docs/turbo.json` must match RR7's actual artefact directory (currently `build/**`, `public/build/**`; RR7 defaults to `build/client/**` + `build/server/**`).
- `pnpm install --frozen-lockfile` must work after the migration — i.e. the lockfile must be regenerated and committed.
- No `@remix-run/*` package may remain in the resolved tree (SC-002).
- Exactly one major of `react-router` must resolve (SC-003).
- Theme cookie + client hints must continue to produce no flash on first paint (FR-013).

**Scale/Scope**: ~39 route files in `docs/app/routes/` (38 after FR-019 deletes `api.feedback.ts`), ~30 React components under `docs/app/components/` (one fewer after the `Feedback/` directory is deleted), one server-only theme helper (`theme.server.ts`), and one catch-all 404 (`$.tsx`). MDX-authored content stays in place except for a 3-line copy update in `docs._index.mdx` that currently advertises the removed per-page feedback widget.

## Constitution Check

The constitution (v1.0.1) governs the library packages and applies to docs work only where docs is part of the same monorepo PR pipeline. Each principle:

- **Principle I — Layered Architecture (NON-NEGOTIABLE)**: ✅ N/A. The migration touches the `docs/` workspace, which sits outside the library layer graph. No package boundary in `rafz → shared → animated → core → targets → umbrella` is crossed.
- **Principle II — Target-Agnostic Core**: ✅ N/A. No core/shared/animated code is modified. Docs already consumes `@react-spring/web` and `@react-spring/rafz` as ordinary workspace deps and will continue to.
- **Principle III — Test-First Animation Behaviour (NON-NEGOTIABLE)**: ✅ N/A. No animation behaviour changes. The docs workspace has no unit-test suite to update.
- **Principle IV — Version-Locked, Changeset-Driven Releases**: ✅ Pass. `docs` is `private: true` and is excluded from publishing; no changeset is required for a docs-only change (this matches prior precedent in `001-migrate-to-pnpm` and `002-vitest-browser-migration`). Verified by `docs/package.json` having `"private": true`.
- **Principle V — Performance Discipline on the Hot Path**: ✅ N/A. No frame-loop, `SpringValue`, or interpolation code is touched. Performance is measured at the page level (Lighthouse, TTFB, LCP — see SC-006/SC-007), not the animation hot path.

**Quality Gates**:

- `pnpm lint` — applies via Turbo's `lint` task. The docs workspace must continue to lint clean under the root oxlint config.
- `pnpm test:ts` — must pass on the migrated docs package (FR-017, SC-008).
- `pnpm format:check` — oxfmt must report no diff (Husky `pre-commit` enforces). The constitution still names `pnpm prettier:check`; the repo migrated to oxfmt under commits `45ece280` (`chore(format): replace prettier with oxfmt`) and `f000df69`. This migration follows the de facto current tooling, not the stale constitution wording. A constitution-amendment PR to update Quality Gates wording is filed separately and out of scope here.
- Conventional Commits — enforced by commitlint; commit messages on this branch use `chore(docs):` or `refactor(docs):` prefixes.

**Verdict**: PASS, no Complexity Tracking entries required.

## Project Structure

### Documentation (this feature)

```text
specs/003-remix-to-react-router-7/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 — technology decisions
├── data-model.md        # Phase 1 — package + route mapping
├── quickstart.md        # Phase 1 — verification recipe
├── contracts/
│   └── routes.md        # Phase 1 — the public URL surface
└── checklists/
    └── requirements.md  # Spec-quality checklist (from /speckit-specify)
```

### Source Code (repository root)

Only the `docs/` workspace changes. Every other workspace is untouched. The post-migration `docs/` tree:

```text
docs/
├── app/
│   ├── components/                  # unchanged
│   ├── data/                        # unchanged
│   ├── helpers/                     # unchanged (theme.server.ts stays server-only)
│   ├── hooks/                       # unchanged
│   ├── routes/                      # unchanged file layout — kept under fs-routes (Remix v2 flat convention); `api.feedback.ts` deleted (FR-019)
│   ├── components/Feedback/         # DELETED (FR-019)
│   ├── styles/                      # unchanged
│   ├── root.tsx                     # imports rewired: @remix-run/react → react-router, @vercel/remix → react-router types
│   └── routes.ts                    # NEW — single-line `flatRoutes()` call from @react-router/fs-routes
├── public/                          # unchanged
├── scripts/                         # unchanged (MDX build/watch scripts)
├── package.json                     # dependency block rewritten; "scripts" updated to react-router CLI
├── react-router.config.ts           # NEW — config (presets: vercelPreset; future-flags as needed)
├── tsconfig.json                    # add ./.react-router/types to include array
├── turbo.json                       # outputs: build/client/**, build/server/**
├── vite.config.mts                  # `reactRouter()` plugin replaces `remix()`; `installGlobals()` removed
├── env.d.ts                         # references updated to react-router types
└── README.md                        # updated commands
```

**Structure Decision**: Single-workspace web application; in-place migration of `docs/` only. No new top-level directories. The only new files are `docs/app/routes.ts` and `docs/react-router.config.ts`. No directory or file is renamed; ~39 MDX route files keep their flat-route names because `@react-router/fs-routes` preserves the Remix v2 convention.

## Complexity Tracking

> No constitution violations. Section intentionally left empty.
