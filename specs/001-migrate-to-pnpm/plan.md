# Implementation Plan: Migrate package manager from Yarn 3 Berry to pnpm

**Branch**: `001-migrate-to-pnpm` | **Date**: 2026-05-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-migrate-to-pnpm/spec.md`

## Summary

Replace Yarn 3 Berry (`yarn@3.8.7`, `nodeLinker: node-modules`) with pnpm using strict isolated `node_modules`. Move the workspace manifest from `package.json`'s `workspaces` field to `pnpm-workspace.yaml`, swap the `packageManager` pin, rewrite every yarn-coupled script and CI workflow, and surface/fix any phantom dependencies that strict isolation reveals. Husky, Turborepo, Changesets, the Remix-based docs postinstall, and Cypress E2E must all continue to function. Published package contents stay byte-equivalent.

## Technical Context

**Language/Version**: TypeScript 5.7 across all workspaces. `.nvmrc` is Node 22.15.0. CI matrix is Node 18.x and 20.x (and TS 5.0/5.1/5.2 for the type-check job).

**Primary Dependencies (build-affecting)**: tsup 8, Turborepo 2, Jest 29 + `@swc/jest`, `@swc/core`, Cypress 14, Vite 6, Husky 9, Changesets 2, Remix 2 (docs workspace), Prettier 3, ESLint 8, commitlint 19.

**Storage**: N/A — purely build/test/publish tooling change.

**Testing**: Jest unit tests (`jest`) running against source via `moduleNameMapper`; `tsc --noEmit` for types; Cypress E2E for `@react-spring/parallax` (CI job currently commented out, runs locally via `start-server-and-test`).

**Target Platform**: Local developer machines (macOS / Linux / Windows); GitHub Actions Ubuntu runners. The published packages target browsers (web), React Native, three.js, konva, and zdog renderers — none of those targets care about the package manager.

**Project Type**: TypeScript monorepo (Turborepo + workspace package manager). Single root project with N published workspaces.

**Performance Goals**: Cold install on CI ≤ 110% of pre-migration; warm install ≤ pre-migration (per SC-002, SC-003). Build time + test time should be neutral.

**Constraints**:

- Single PR migration, squash-merged to `next`. No incremental half-state.
- Published package contents must remain functionally identical (SC-005, FR-015).
- All CI jobs currently passing on `next` must still pass on the PR (SC-004).
- Strict isolated `node_modules` is mandatory per the spec's "Resolution mode" section. No global `node-linker=hoisted` shim.

**Scale/Scope**:

- 16 workspaces (9 under `packages/`, 5 under `targets/`, plus `demo` and `docs`; one stale workspace entry to remove).
- ~30 root-level dev dependencies; many internal `workspace:*` references.
- 5 GitHub Actions workflows to migrate (`bundle-size`, `checks`, `experimental`, `nightly`, `tests`).
- 5 downstream consumer fixtures under `.github/publish-ci/<example>/` (cra5, next, vite, node-standard, node-esm) each with their own `yarn.lock`.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

The constitution ([../../.specify/memory/constitution.md](../../.specify/memory/constitution.md)) defines five principles. Evaluation:

| Principle                                            | Status | Notes                                                                                                                                                       |
| ---------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Layered Architecture (NON-NEGOTIABLE)             | Pass   | Migration touches build/install tooling only; no imports across layers.                                                                                     |
| II. Target-Agnostic Core                             | Pass   | No source code in `core`, `animated`, `shared`, or targets is modified by the package-manager change.                                                       |
| III. Test-First Animation Behaviour (NON-NEGOTIABLE) | Pass   | Existing tests must keep passing. Phantom-dep fixes will be code-level `package.json` edits — no test changes other than possibly minor invocation updates. |
| IV. Version-Locked, Changeset-Driven Releases        | Pass   | The release workflow itself is preserved end-to-end (FR-007, SC-005). The migration ships under a single `chore:` changeset.                                |
| V. Performance Discipline on the Hot Path            | Pass   | No runtime code changes; the hot path is untouched.                                                                                                         |

**Quality Gates**: All gates (lint, types, unit, prettier, commitlint) must still pass after migration — that's FR-006 / FR-008 directly. No principle relief requested.

**Gate Result**: PASS (pre-research). No constitution violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-migrate-to-pnpm/
├── plan.md              # This file
├── research.md          # Phase 0 output (this command)
├── data-model.md        # Phase 1 output (this command)
├── quickstart.md        # Phase 1 output (this command)
├── contracts/           # Phase 1 output (this command)
│   ├── developer-commands.md
│   └── ci-commands.md
├── checklists/
│   └── requirements.md  # Spec quality checklist (from /speckit-specify)
└── tasks.md             # Phase 2 output (/speckit-tasks command — not created here)
```

### Source Code (repository root)

This migration is **structural**, not architectural. The package-manager swap touches:

```text
react-spring/
├── package.json                              # Modify: workspaces → remove, packageManager → pnpm, scripts → rewrite, add pnpm.onlyBuiltDependencies
├── pnpm-workspace.yaml                       # NEW: workspace list (replaces package.json `workspaces`)
├── .npmrc                                    # NEW: strict-peer-dependencies, public-hoist patterns if any, registry
├── yarn.lock                                 # REMOVE
├── pnpm-lock.yaml                            # NEW (generated)
├── .yarnrc.yml                               # REMOVE
├── .yarn/                                    # REMOVE (releases + plugins)
├── .gitignore                                # Update: drop yarn-specific patterns, ensure pnpm patterns
├── packages/
│   ├── animated/package.json                 # Possibly: declare phantom deps if any
│   ├── core/package.json                     # Possibly: declare phantom deps if any
│   ├── shared/package.json                   # Possibly: declare phantom deps if any
│   ├── rafz/package.json                     # Possibly: declare phantom deps if any
│   ├── types/package.json                    # Possibly: declare phantom deps if any
│   ├── parallax/package.json                 # Possibly: declare phantom deps if any
│   ├── mock-raf/package.json                 # Possibly: declare phantom deps if any
│   ├── eslint-config/package.json            # Possibly: declare phantom deps if any
│   └── react-spring/package.json             # Umbrella; minimal change
├── targets/{web,native,three,konva,zdog}/package.json  # Possibly: declare phantom peer deps
├── demo/package.json                         # Possibly: declare phantom deps
├── docs/package.json                         # Possibly: declare phantom deps; verify remix postinstall
├── .github/workflows/                        # Rewrite ALL 5 workflows
│   ├── bundle-size.yml
│   ├── checks.yml
│   ├── experimental.yml
│   ├── nightly.yml
│   └── tests.yml
├── .github/publish-ci/<example>/             # Downstream consumer fixtures (decision in research.md R-005)
└── README.md / CLAUDE.md / docs/             # Documentation updates (FR-013)
```

**Structure Decision**: The repository's existing monorepo structure is preserved exactly. The migration only introduces / removes top-level configuration files and edits workspace `package.json` files where strict isolation requires declaring previously-phantom dependencies. No source files in any `src/` tree are expected to change.

## Complexity Tracking

> No constitution violations to justify. Section retained per template, populated only if a deviation is uncovered during Phase 0 / Phase 1.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| _(none)_  | _(n/a)_    | _(n/a)_                              |

## Phase 0 — Research

See [research.md](./research.md). Resolved questions:

- **R-001**: pnpm major version and pin mechanism.
- **R-002**: `pnpm-workspace.yaml` shape (incl. stale entry).
- **R-003**: Postinstall-script policy under pnpm 9+ (`onlyBuiltDependencies`).
- **R-004**: Husky `prepare` script under pnpm.
- **R-005**: Downstream `.github/publish-ci/<example>/` fixtures — keep on yarn, switch to npm, or migrate to pnpm.
- **R-006**: Phantom-dependency surface — which workspaces likely need new `dependencies` / `peerDependencies` declarations.
- **R-007**: Replacement commands for every yarn-specific invocation (`yarn workspace …`, `yarn add typescript@…`, `yarn remove`, `yarn info`, `yarn why`, `yarn install --immutable`).
- **R-008**: CI cache strategy and the `actions/setup-node` `cache: 'yarn'` replacement.

## Phase 1 — Design

See [data-model.md](./data-model.md), [contracts/](./contracts/), and [quickstart.md](./quickstart.md).

- `data-model.md` enumerates the migration's "entities" (lockfile, workspace manifest, package-manager pin, npmrc config, CI cache key) and the validation rules / state transitions for each.
- `contracts/developer-commands.md` and `contracts/ci-commands.md` give the before/after command mapping that downstream code (scripts, workflows, docs) must conform to. These are the user-facing "interface" of the migration.
- `quickstart.md` is the contributor-facing onboarding doc that will replace the relevant section of the README on merge.

## Re-evaluate Constitution Check (post-design)

After Phase 0 + Phase 1 design, no principle requires accommodation. The plan does not introduce:

- new cross-layer imports (Principle I);
- platform code into core (Principle II);
- skipped or weakened tests (Principle III);
- a version-line desync or changeset bypass (Principle IV);
- per-frame work (Principle V).

**Gate Result**: PASS (post-design).

## Next Step

Run `/speckit-tasks` to materialise the dependency-ordered task list (`tasks.md`) from this plan plus the contracts.
