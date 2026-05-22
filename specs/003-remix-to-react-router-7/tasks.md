---
description: 'Task list for the Remix 2 → React Router 7 docs-site migration'
---

# Tasks: Migrate Docs Site from Remix 2 to React Router 7

**Input**: Design documents from `/specs/003-remix-to-react-router-7/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md` (R1–R13), `data-model.md`, `contracts/routes.md`, `quickstart.md`

**Tests**: No new test suite is added — the docs workspace has no Vitest project and adding one is explicitly out of scope (`research.md` §R12). Verification is `pnpm test:ts` + the route-walk script + Lighthouse spot-checks defined in `quickstart.md`.

**Organization**: Tasks are grouped by the four user stories in `spec.md` (US1 framework swap, US2 URL preservation, US3 local-dev DX, US4 Vercel deploy). Setup and Foundational phases come first because every story shares the new config + dependency surface.

## Format: `[ID] [P?] [Story] Description`

- **[P]** — can run in parallel (different files, no dependency on incomplete tasks)
- **[Story]** — `[US1]`, `[US2]`, `[US3]`, `[US4]`
- Paths are repo-relative from the worktree root.

## Path Conventions

- All file paths sit under the `docs/` workspace unless noted otherwise.
- `~/` aliases `docs/app/` in TypeScript (per `docs/tsconfig.json`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Branch hygiene + the dependency swap. Touches `docs/package.json` and the root lockfile only; nothing built or tested yet.

- [x] T001 Confirm working branch is `003-remix-to-react-router-7` and worktree is clean before edits (`git status` reports no uncommitted noise)
- [x] T002 Rewrite the `dependencies` block in `docs/package.json`: remove `@remix-run/node`, `@remix-run/react`, `@remix-run/serve`, `@remix-run/server-runtime`, `@vercel/remix`, `@supabase/supabase-js`; add `@react-router/node@^7`, `@react-router/serve@^7`, `@vercel/react-router@^7`; bump `react-router` from `6.28.1` to `^7` (per `data-model.md` §1)
- [x] T003 Rewrite the `devDependencies` block in `docs/package.json`: remove `@remix-run/dev`; add `@react-router/dev@^7` and `@react-router/fs-routes@^7`
- [x] T004 Run `pnpm install` from repo root to regenerate `pnpm-lock.yaml`; verify no peer-dep warnings about mismatched React Router majors
- [x] T005 Assert post-install invariants: `grep -E '"@remix-run/' pnpm-lock.yaml` returns empty (INV-P1) and `pnpm ls react-router -r --depth -1 --json | jq -r '..|.version? // empty' | grep -E '^[0-9]+' | cut -d. -f1 | sort -u` outputs only `7` (INV-P2); `grep '@supabase/supabase-js' pnpm-lock.yaml` returns empty (INV-P4)

**Checkpoint**: Dependency tree is on RR7. Build still broken (no config rewire yet); type-check still broken (imports still point at removed packages). Expected.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Wire the new framework's config so `react-router build` has a route tree, plugin, and Vercel preset to read. After this phase the build pipeline knows what to do — but the application code still has Remix imports and will fail.

**⚠️ CRITICAL**: All user stories depend on these config files existing. Without them, nothing else builds.

- [x] T006 [P] Create `docs/react-router.config.ts` exporting `{ presets: [vercelPreset()] }` from `@vercel/react-router/vite`, typed via `Config` from `@react-router/dev/config` (per `research.md` §R5)
- [x] T007 [P] Create `docs/app/routes.ts` exporting `flatRoutes({ ignoredRouteFiles: ['**/.*', '**/*.css'] })` from `@react-router/fs-routes`, typed via `RouteConfig` from `@react-router/dev/routes` (per `research.md` §R3)
- [x] T008 [P] Edit `docs/vite.config.mts`: remove `installGlobals()` and its import from `@remix-run/node`; remove the `mdx` `@ts-expect-error`-suppressed call site only if it becomes unnecessary (keep otherwise); replace `import { vitePlugin as remix } from '@remix-run/dev'` with `import { reactRouter } from '@react-router/dev/vite'`; remove `@vercel/remix/vite` import; replace the `remix({ ignoredRouteFiles, presets: [vercelPreset()] })` plugin entry with `reactRouter()` (presets now live in `react-router.config.ts`); leave `mdx(...)`, `vanillaExtractPlugin()`, `tsconfigPaths()` untouched (per `research.md` §R4)
- [x] T009 [P] Edit `docs/tsconfig.json`: add `"./.react-router/types/**/*"` to the `include` array; add `".react-router"` to the `exclude` array
- [x] T010 [P] Edit `docs/env.d.ts`: replace `/// <reference types="@vercel/remix" />` with `/// <reference types="@react-router/node" />`
- [x] T011 [P] Edit `docs/turbo.json`: change `outputs` to `["build/**", ".react-router/**"]` and expand `inputs` to `["app/**", "public/**", "react-router.config.ts", "vite.config.mts"]` (per `research.md` §R9)
- [x] T012 [P] Add `.react-router/` to the root `.gitignore` (immediately under the existing `build/` line, around line 4) so the typegen output isn't committed (per `data-model.md` INV-C2)

**Checkpoint**: Config wired. `react-router typegen` should now succeed (produces `.react-router/types/`). `react-router build` still fails because app code imports `@remix-run/*` and `@vercel/remix`.

---

## Phase 3: User Story 1 — Documentation site renders on RR7 (Priority: P1) 🎯 MVP

**Goal**: Replace every Remix/Vercel-remix runtime import with its RR7 equivalent, remove the Feedback module (FR-019), and update the `docs._index.mdx` copy so the site builds, type-checks, and renders end-to-end on `react-router dev`.

**Independent Test**: `pnpm --filter @react-spring/docs test:ts` exits 0; `pnpm docs:dev` starts on `http://localhost:3000`; the home page and `/docs/components/use-spring` render with correct theme, meta, and content; the browser console reports no hydration warnings.

### Feedback module deletion (FR-019) — do first, removes 4 of the 17 Remix-importing files from the rewrite list

- [x] T013 [US1] Delete `docs/app/components/Feedback/Feedback.tsx`
- [x] T014 [US1] Delete `docs/app/components/Feedback/Feedback.css.ts`
- [x] T015 [US1] Delete the now-empty directory `docs/app/components/Feedback/`
- [x] T016 [US1] Delete `docs/app/routes/api.feedback.ts`
- [x] T017 [US1] Edit `docs/app/routes/docs.tsx`: remove the `import { Feedback } from '~/components/Feedback/Feedback'` line (≈line 18) and the `<Feedback location={activeRoute?.href} />` JSX (≈line 154); leave the rest of the layout intact
- [x] T018 [US1] Edit `docs/app/routes/docs._index.mdx`: rewrite lines around 42–44 that describe the per-page feedback button — keep the GitHub Discussions link as the canonical feedback channel; do not mention a "feedback button" anywhere in the prose

### Server-entry rewire (the highest-risk single file)

- [x] T019 [US1] Rewire `docs/app/root.tsx` imports: replace the `@vercel/remix` block (`MetaFunction`, `LinksFunction`, `json`, `LoaderFunctionArgs`, `ActionFunctionArgs`) with type-only imports from `react-router`; replace the `@remix-run/react` block (`Links`, `Meta`, `Outlet`, `Scripts`, `ScrollRestoration`, `useLoaderData`) with value imports from `react-router`; replace `json(...)` call sites with `Response.json(...)` (or RR7's `data()` helper if type inference benefits); ensure the action/loader signatures and return shapes are unchanged

### Route-file import rewrites (parallel — each file is independent)

- [x] T020 [P] [US1] Rewire `docs/app/routes/$.tsx` imports: replace `@vercel/remix` imports (`json`, `LoaderFunction`, `MetaFunction`, `redirect`) with `react-router` (use type-only imports for the `*Function` types; `redirect` is a value import; replace `json(...)` with `Response.json(...)`)
- [x] T021 [P] [US1] Rewire `docs/app/routes/_index.tsx` imports per `data-model.md` §3
- [x] T022 [P] [US1] Rewire `docs/app/routes/examples.tsx` imports per `data-model.md` §3
- [x] T023 [P] [US1] Rewire `docs/app/routes/docs.tsx` remaining imports (after T017): any `@remix-run/react` value imports → `react-router`; any `@vercel/remix` type imports → type-only from `react-router`

### Component / hook import rewrites (parallel — different files)

- [x] T024 [P] [US1] Rewire imports in `docs/app/components/Buttons/Button.tsx` (`@remix-run/react` → `react-router`)
- [x] T025 [P] [US1] Rewire imports in `docs/app/components/Buttons/NavButton.tsx`
- [x] T026 [P] [US1] Rewire imports in `docs/app/components/Menu/MenuDocs.tsx`
- [x] T027 [P] [US1] Rewire imports in `docs/app/components/Site/SiteThemePicker.tsx`
- [x] T028 [P] [US1] Rewire imports in `docs/app/components/Site/SiteClientHints.tsx`
- [x] T029 [P] [US1] Rewire imports in `docs/app/components/Grids/NavigationGrid.tsx`
- [x] T030 [P] [US1] Rewire imports in `docs/app/components/Text/Anchor.tsx`
- [x] T031 [P] [US1] Rewire imports in `docs/app/components/Header/HeaderSidePanel.tsx`
- [x] T032 [P] [US1] Rewire imports in `docs/app/components/Widgets/WidgetCarbon.tsx`
- [x] T033 [P] [US1] Rewire imports in `docs/app/hooks/useRequestInfo.ts`
- [x] T034 [P] [US1] Rewire imports in `docs/app/hooks/useTheme.ts`

### Verification (sequential — each depends on the previous succeeding)

- [x] T035 [US1] `grep -rE "from '@(remix-run|vercel/remix)" docs/app docs/vite.config.mts docs/env.d.ts` returns empty (INV-T1)
- [x] T036 [US1] `grep -rE 'Feedback|/api/feedback|@supabase' docs/app docs/scripts` returns empty across source files (INV-F1, SC-010)
- [x] T037 [US1] Run `pnpm --filter @react-spring/docs test:ts` and confirm exit code 0 with no errors (FR-017, SC-008, INV-T2)
- [x] T038 [US1] Run `pnpm docs:dev`; load `http://localhost:3000/` and `http://localhost:3000/docs/components/use-spring`; confirm SSR renders correct theme on first paint (no flash, FR-013), no hydration warnings in console, search modal opens, an embedded `<Sandpack>` block renders, and — with DevTools → Network filtered to `_vercel/insights` — a client-side navigation between the two pages triggers at least one analytics beacon (FR-14)

**Checkpoint**: Site builds and renders on RR7 in local dev. The Feedback module is gone. URL surface intact. This is the MVP — the migration is functionally complete after this phase.

---

## Phase 4: User Story 2 — Existing URLs continue to resolve (Priority: P1)

**Goal**: Prove every production URL still resolves on the migrated build, both locally and on a Vercel preview. This is a verification slice over US1's work.

**Independent Test**: Iterate over `contracts/routes.md` C1, hit every path against the local production build (`pnpm --filter @react-spring/docs build && pnpm --filter @react-spring/docs start`), and confirm 200 + non-empty body for each.

- [x] T039 [US2] Run `pnpm --filter @react-spring/docs build` and confirm `docs/build/client/` and `docs/build/server/` exist; `docs/public/build/` is **not** produced (verifies INV-C1 and the Turbo outputs glob from T011)
- [ ] T040 [US2] Run `pnpm --filter @react-spring/docs start` (uses `react-router-serve` per `research.md` §R6); leave it running on its default port for the subsequent route-walk
- [ ] T041 [US2] Walk every path in `specs/003-remix-to-react-router-7/contracts/routes.md` C1 with `curl -s -o /dev/null -w "%{http_code}"` against the local prod-serve URL; every path MUST return 200; capture failures (if any) in PR notes (verifies SC-001, INV-R1)
- [x] T042 [US2] Hit a deliberately-invalid path (e.g. `/this-does-not-exist`) and confirm the splat route renders the 404 page with `<title>` containing `404` (per `contracts/routes.md` C2)
- [x] T043 [US2] Hit `GET /api/feedback` and confirm it returns 404 (the route file is deleted; the splat handles it — verifies INV-R3, SC-010, INV-F2)

**Checkpoint**: Local build serves every contracted URL correctly. Vercel-preview verification waits for US4.

---

## Phase 5: User Story 3 — Local dev workflow preserved (Priority: P2)

**Goal**: Ensure contributors can clone, install, and iterate using documented commands; rename `dev:remix` → `dev:rr` and document the change.

**Independent Test**: A fresh checkout of the branch + `pnpm install --frozen-lockfile && pnpm docs:dev` brings up the site on port 3000 with HMR for both component code and MDX.

- [x] T044 [US3] Update the `scripts` block in `docs/package.json`: `build` → `react-router build`; `dev:remix` → `dev:rr` (value: `react-router dev`); `start` → `react-router-serve ./build/server/index.js`; `test:ts` → `react-router typegen && tsc --noEmit`; update the `dev` script to invoke `pnpm dev:rr` instead of `pnpm dev:remix` (per `research.md` §R11)
- [x] T045 [US3] Update `docs/README.md` to reference the new commands (`pnpm dev`, `pnpm build`, `pnpm start`, `pnpm test:ts`) and mention that the framework is now React Router 7 framework mode; remove any Remix-specific guidance
- [ ] T046 [US3] Verify HMR end-to-end: with `pnpm docs:dev` running, edit `docs/app/routes/docs.getting-started.mdx` (add a trailing space), save, and confirm the change appears in the browser within ~2 seconds without a full server restart (FR-011)
- [ ] T047 [US3] Verify HMR for component code: edit `docs/app/components/Site/SiteFooter.tsx` (add a no-op comment), save, and confirm the change is picked up without losing client state

**Checkpoint**: DX preserved; one renamed script (`dev:remix` → `dev:rr`), one updated README.

---

## Phase 6: User Story 4 — Production deployment on Vercel (Priority: P1)

**Goal**: Push the branch and confirm Vercel produces a successful preview deployment whose URL serves the full site.

**Independent Test**: `git push -u origin 003-remix-to-react-router-7` triggers a Vercel build; the resulting preview URL passes the contract route-walk from US2.

- [x] T048 [US4] Confirm Vercel project settings will auto-detect React Router 7 (no manual framework override needed); document in the PR description that the `@vercel/react-router` preset is wired via `docs/react-router.config.ts` (no `vercel.json` changes required)
- [ ] T049 [US4] Push the branch to remote (only after explicit user confirmation per the repo's "never push without confirmation" rule); record the Vercel preview URL once produced
- [ ] T050 [US4] Re-run the contract route-walk from T041 against the Vercel preview URL; all paths return 200 (SC-001, SC-005)
- [x] T051 [US4] Note in PR notes the manual post-merge cleanup: Vercel project env vars `SUPABASE_URL` and `SUPABASE_ANON_KEY` can be unset (FR-019 follow-up)

**Checkpoint**: Production-equivalent deployment confirmed.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates, performance verification, and the housekeeping items that fall outside any single story.

- [x] T052 [P] Run `pnpm lint` from repo root; confirm clean (Quality Gate)
- [x] T053 [P] Run `pnpm format` from repo root; commit any whitespace fixups (oxfmt — the project moved off Prettier)
- [ ] T054 Run Lighthouse against the Vercel preview's `/` and `/docs/components/use-spring`; compare scores against current `https://www.react-spring.dev/...`; SC-006 requires within 5 points on Performance, SEO, Accessibility; SC-007 requires LCP within 10%
- [ ] T055 [P] Open browser dev-tools on the preview URL across 3 sampled routes (`/`, `/docs/getting-started`, `/docs/components/parallax`); confirm zero console errors and zero hydration warnings (SC-009)
- [x] T055a [P] Assert server-only modules don't leak into the client bundle: after `pnpm --filter @react-spring/docs build`, `grep -rE 'getTheme|setTheme|SUPABASE_|theme\.server' docs/build/client/ 2>/dev/null` returns empty (FR-009)
- [x] T056 Walk the done-criteria checklist in `specs/003-remix-to-react-router-7/quickstart.md` §"Done criteria"; each box ticked
- [x] T057 Update the `CLAUDE.md` `SPECKIT START`/`END` block (already done at plan time — re-verify it still points at `specs/003-remix-to-react-router-7/plan.md`)
- [x] T058 Self-review the diff with `git diff --stat next...003-remix-to-react-router-7` — confirm no library workspace (`packages/*`, `targets/*`, `demo/`) files were touched; only `docs/`, root `pnpm-lock.yaml`, root `.gitignore`, root `CLAUDE.md`, and `specs/003-remix-to-react-router-7/` should appear

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1 (Setup)** — no prerequisites. Must complete before Phase 2.
- **Phase 2 (Foundational)** — depends on Phase 1. All seven tasks (T006–T012) are independent of each other and can run in parallel.
- **Phase 3 (US1)** — depends on Phase 2. The Feedback deletion (T013–T018) and import rewrites (T019–T034) are largely parallel; verification (T035–T038) is sequential and depends on all rewrites.
- **Phase 4 (US2)** — depends on Phase 3. Strictly sequential within the phase (build → start → curl walk → splat test).
- **Phase 5 (US3)** — can begin after Phase 2 in parallel with Phase 3, but T044 edits `docs/package.json` which Phase 1 already wrote; sequence T044 after T002 to avoid merge conflicts. T045–T047 are independent of US1's code edits and can run alongside.
- **Phase 6 (US4)** — depends on Phase 3 (the branch must be in a working state before being pushed) and benefits from Phase 4 (so the route-walk script exists). Push step (T049) requires explicit user confirmation per repo rules.
- **Phase 7 (Polish)** — depends on all prior phases being functionally complete.

### Story dependencies

- **US1 (P1)**: depends on Setup + Foundational. Independently testable via `pnpm docs:dev` and the local navigation checks.
- **US2 (P1)**: depends on US1 producing a working build. Independently testable via the local prod-serve route walk.
- **US3 (P2)**: depends on Setup (for the script rename) but is otherwise orthogonal to US1's app code edits. Independently testable by a fresh-clone install + dev start.
- **US4 (P1)**: depends on US1 producing a working build; reuses US2's route-walk against the preview URL.

### Parallel opportunities

- All Phase 2 foundational config tasks (T006–T012) — different files, no dependencies between them.
- All component/hook import rewrites in US1 (T024–T034) — different files, no shared mutable state.
- Route-file rewrites in US1 (T020–T023) — different files.
- Polish tasks marked [P] (T052, T053, T055) — different concerns.

---

## Parallel Example: Phase 2 (Foundational)

```bash
# All seven foundational config files are independent — fire them concurrently:
Task: "Create docs/react-router.config.ts"                # T006
Task: "Create docs/app/routes.ts with flatRoutes()"       # T007
Task: "Edit docs/vite.config.mts plugin wiring"           # T008
Task: "Edit docs/tsconfig.json include/exclude"           # T009
Task: "Edit docs/env.d.ts triple-slash reference"         # T010
Task: "Edit docs/turbo.json inputs/outputs"               # T011
Task: "Add .react-router/ to root .gitignore"             # T012
```

## Parallel Example: US1 component-import rewrites

```bash
# 11 component/hook files; pure import-line edits — fire all together:
Task: "Rewire imports in docs/app/components/Buttons/Button.tsx"        # T024
Task: "Rewire imports in docs/app/components/Buttons/NavButton.tsx"     # T025
Task: "Rewire imports in docs/app/components/Menu/MenuDocs.tsx"         # T026
Task: "Rewire imports in docs/app/components/Site/SiteThemePicker.tsx"  # T027
Task: "Rewire imports in docs/app/components/Site/SiteClientHints.tsx"  # T028
Task: "Rewire imports in docs/app/components/Grids/NavigationGrid.tsx"  # T029
Task: "Rewire imports in docs/app/components/Text/Anchor.tsx"           # T030
Task: "Rewire imports in docs/app/components/Header/HeaderSidePanel.tsx" # T031
Task: "Rewire imports in docs/app/components/Widgets/WidgetCarbon.tsx"  # T032
Task: "Rewire imports in docs/app/hooks/useRequestInfo.ts"              # T033
Task: "Rewire imports in docs/app/hooks/useTheme.ts"                    # T034
```

---

## Implementation Strategy

### MVP first (US1 only)

1. Phase 1 (Setup) — dependency swap, ≈5 minutes.
2. Phase 2 (Foundational) — six config edits + one .gitignore line, all in parallel, ≈15 minutes.
3. Phase 3 (US1) — Feedback deletion + ≈17 mechanical import rewrites + four verification tasks, ≈45 minutes.
4. **STOP and validate**: `pnpm docs:dev` is green, type-check passes, no console errors. This is a shippable MVP.

### Incremental delivery

After US1 lands locally:

- Add US2 (build + route-walk locally) → confidence that URL surface is intact.
- Add US3 (DX script rename + README) → low-risk parallelisable polish.
- Add US4 (push to remote, Vercel preview, preview-walk) → production-equivalent verification.
- Run Phase 7 polish; open PR.

### Single-developer strategy (recommended)

This migration is small enough — and tightly coupled enough (every story shares `docs/package.json` and `docs/app/*`) — that running it as a single, branch-scoped sequence is simpler than splitting work across people. The parallel markers exist so that within a single working session you can dispatch the [P] file edits in parallel via the Agent tool, not so that multiple humans coordinate.

---

## Notes

- `[P]` = different files, no dependency on incomplete tasks.
- `[US?]` labels trace tasks back to the four user stories in `spec.md`.
- The Vercel push (T049) is the only network-visible action — gate it on explicit user confirmation per the repo's "never push without confirmation" rule.
- The Supabase project itself and its `feedback` table are left intact at the data layer; FR-019 only removes the docs-site integration. Cleanup of the unused Supabase project and its env vars (T051) is post-merge follow-up, not part of this PR.
- Total: **59 tasks** across 7 phases.
