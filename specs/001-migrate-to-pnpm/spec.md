# Feature Specification: Migrate package manager from Yarn 3 Berry to pnpm

**Feature Branch**: `001-migrate-to-pnpm`

**Created**: 2026-05-21

**Status**: Draft

**Input**: User description: "lets migrate the repo over to use pnpm"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Contributor installs and runs the project after migration (Priority: P1)

A contributor (open-source or maintainer) clones the repository on a clean machine, follows the README, and reaches a working development environment using pnpm instead of Yarn. Every common task they previously ran with `yarn <script>` is reachable via `pnpm <script>` with the same outcome.

**Why this priority**: This is the migration. If contributors cannot install, build, test, and develop using pnpm, nothing else matters. Everything downstream — CI, releases, docs — assumes this works.

**Independent Test**: On a fresh clone with no prior `node_modules` or lockfile state, running the documented install command followed by build, type-check, and unit tests succeeds end-to-end. The repository contains a pnpm lockfile and no Yarn 3 Berry artefacts.

**Acceptance Scenarios**:

1. **Given** a fresh clone of the repository, **When** the contributor runs the documented install command, **Then** all workspaces resolve, dependencies install successfully, and a deterministic pnpm lockfile is produced.
2. **Given** a successful install, **When** the contributor runs the build, unit-test, type-check, and lint scripts, **Then** all complete with the same pass/fail outcome they had under Yarn.
3. **Given** a successful install, **When** the contributor runs the docs and demo dev servers, **Then** both start and serve their content as before.
4. **Given** the contributor edits a file in any workspace, **When** the pre-commit hook fires on `git commit`, **Then** Prettier and commitlint enforcement run identically to the Yarn setup.

---

### User Story 2 - CI passes on the supported Node matrix (Priority: P1)

The continuous integration pipeline installs, builds, tests, and (where applicable) publishes the project using pnpm on every supported Node version, with no regressions in pass rate or runtime budget.

**Why this priority**: Without a green CI, no PR can merge. CI is the gate for every change that follows the migration, so it has to land in the same PR as the package-manager swap.

**Independent Test**: A pull request that contains only the migration changes triggers all CI workflows, every job completes successfully on each Node version currently supported (Node 18 and Node 20), and total wall-clock time is at least no worse than the previous yarn-based runs.

**Acceptance Scenarios**:

1. **Given** the migration PR is opened, **When** CI runs, **Then** every job passes on Node 18 and Node 20.
2. **Given** the CI cache is cold, **When** the install step runs, **Then** it completes within the same time budget as the previous yarn cold install (±10%).
3. **Given** the CI cache is warm, **When** the install step runs, **Then** it is at least as fast as the previous yarn warm install.

---

### User Story 3 - Releases continue via the changesets workflow (Priority: P2)

A maintainer can cut a release exactly as before — adding a changeset, bumping versions across the version-locked packages, publishing to npm — using pnpm instead of yarn at every step.

**Why this priority**: Release ability is the second-most critical capability after development. It is P2 only because it can be validated last in the migration PR (dry-run is sufficient before merge), whereas dev and CI must work continuously.

**Independent Test**: A dry-run of the release pipeline (`changeset version` then a build + pack of every package) under pnpm produces tarballs whose contents match the pre-migration baseline (file list, `package.json` exports, bundled output filenames).

**Acceptance Scenarios**:

1. **Given** the migration has landed on `next`, **When** a maintainer runs the documented changeset workflow, **Then** versions bump correctly across all locked packages and a publish dry-run succeeds.
2. **Given** a published package after migration, **When** an end consumer installs it from npm, **Then** they see the same exports, types, and bundle contents they would have seen with the yarn-based release.

---

### User Story 4 - Parallax Cypress E2E suite continues to pass (Priority: P3)

The `@react-spring/parallax` Cypress end-to-end tests, served from a Vite app inside `packages/parallax/test`, run and pass under pnpm.

**Why this priority**: E2E is currently only run locally (the CI job is commented out), so its failure does not block merging. But it covers behaviour no unit test covers, and contributors expect it to work — keeping it green protects against a class of regressions that pnpm's stricter module resolution could otherwise hide.

**Independent Test**: The documented E2E command starts the Vite dev server against `packages/parallax/test`, opens Cypress, and the existing `parallax.cy.ts` spec passes.

**Acceptance Scenarios**:

1. **Given** a fresh install under pnpm, **When** the contributor runs the E2E command, **Then** Cypress launches and the spec passes.

---

### Edge Cases

- **In-flight PRs**: PRs opened against `next` before the migration will have `yarn.lock` changes that conflict with the new pnpm lockfile. The spec assumes maintainers will rebase or re-open these PRs after the migration lands — no migration tooling is provided for them.
- **Phantom dependencies**: pnpm's default strict resolution will surface any package that imports a dependency it does not declare in its own `package.json` (a "phantom" or hoisted dependency from yarn's flat `node-modules` mode). The migration must either declare these dependencies explicitly or configure pnpm to permit the legacy behaviour — see clarification C1.
- **Husky hooks**: Husky installs into `.husky/` and is wired via a `prepare` script. The migration must ensure this still fires under pnpm's install flow.
- **Nested workspace**: `packages/parallax/@react-spring/parallax-demo` is a workspace nested inside another workspace. The new configuration must list it in `pnpm-workspace.yaml` so it continues to participate in the workspace graph.
- **Turborepo cache**: The turbo task graph references package names, not the package manager. Cache invalidation should occur once (because lockfile changes), then settle.
- **Engine pinning**: `.nvmrc` is `22.15.0`; CI runs Node 18/20. The pnpm version must be pinned via `packageManager` in the root `package.json` so contributors and CI converge on the same release.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The repository MUST install all dependencies via pnpm and produce a `pnpm-lock.yaml` that is the canonical lockfile.
- **FR-002**: All current workspaces (`packages/*`, `targets/*`, `demo`, `docs`, and `packages/parallax/@react-spring/parallax-demo`) MUST remain part of the workspace graph after migration.
- **FR-003**: Every top-level script currently invoked as `yarn <script>` MUST be invokable as `pnpm <script>` with equivalent behaviour and exit code.
- **FR-004**: The Turborepo task graph (build dependencies, parallelism, caching keys) MUST continue to function unchanged.
- **FR-005**: Build outputs for every published package MUST include the same set of files (CJS dev + prod.min, ESM legacy + modern + modern.dev + modern.prod.min, plus the CJS entry shim) as the pre-migration outputs. The contents of individual bundle files are produced by `tsup` and are validated end-to-end by FR-006 (tests pass) and FR-015 (tarball equivalence); byte-equivalence of bundle JS is not required.
- **FR-006**: Unit tests (Jest + jsdom + `@swc/jest`), type checks (`tsc --noEmit`), and Cypress E2E (parallax) MUST pass after migration with no test changes other than those required to invoke them via pnpm.
- **FR-007**: The changesets workflow MUST continue to function end-to-end (add changeset, version, publish dry-run) via pnpm-equivalent commands.
- **FR-008**: Husky pre-commit (Prettier check) and commit-msg (commitlint) hooks MUST continue to fire on every commit.
- **FR-009**: All Yarn 3 Berry-specific artefacts (`.yarnrc.yml`, `.yarn/` cache and releases directory, `yarn.lock`, any `.pnp.*` files) MUST be removed from the repository in the migration commit. Any settings encoded there that have a pnpm equivalent MUST be ported.
- **FR-010**: pnpm version MUST be pinned via the `packageManager` field in the root `package.json`, and Corepack-compatible so contributors and CI converge automatically.
- **FR-011**: CI workflows under `.github/workflows/*` MUST be updated to use pnpm (action setup, install command, cache key) and pass on the existing Node matrix (Node 18 and Node 20).
- **FR-012**: The Node engine constraint (`.nvmrc` 22.15.0; CI 18/20) MUST be preserved; the migration MUST NOT change the minimum supported Node version.
- **FR-013**: All documentation that references yarn commands (`README.md`, `CLAUDE.md`, `docs/*`, any internal docs in packages) MUST be updated to reference the pnpm equivalents.
- **FR-014**: Internal workspace references (currently `workspace:*` under Yarn) MUST continue to resolve to the in-repo workspaces and MUST publish to npm with concrete version numbers (no `workspace:*` leakage in published `package.json` files).
- **FR-015**: Published tarball contents MUST match the pre-migration baseline in file list and the `name`, `version`, `exports`, `main`, `module`, `types`, and `files` fields of `package.json`. Whitespace and ordering inside generated metadata are tolerated. Verified via `pnpm pack` against the previous `yarn pack` output for every published workspace (every workspace under `packages/` and `targets/` whose `package.json` does not have `private: true`).

### Key Entities

- **Lockfile**: The single source of truth for dependency versions across the workspace graph. Migration replaces `yarn.lock` with `pnpm-lock.yaml`.
- **Workspace manifest**: The declaration of which directories are workspaces. Migration moves this from the `workspaces` field in `package.json` to `pnpm-workspace.yaml`.
- **Package manager pin**: The mechanism that ensures every contributor and CI environment uses the same package manager version. Migration moves this from `.yarnrc.yml` / `.yarn/releases/` to the `packageManager` field plus Corepack.
- **Hoisting / resolution mode**: The strategy for how dependencies are exposed to package code. Yarn Berry's `nodeLinker: node-modules` gave a flat hoisted tree; the migration adopts pnpm's strict isolated `node_modules` (the pnpm default) so each workspace sees only its declared dependencies.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A fresh clone on a clean machine reaches a green "install → build → unit tests → type-check" pipeline in at most 110% of the pre-migration wall-clock time on the same Node version.
- **SC-002**: The cold-cache install on CI takes no more than 110% of the previous cold yarn install time, on the same runner class and Node version.
- **SC-003**: After warm caches stabilise (within three CI runs of the merged PR), the average warm-cache install is at least as fast as the previous warm yarn install.
- **SC-004**: Every CI job that was passing on `next` immediately prior to the migration is passing on the migration PR before merge, with zero new test failures attributable to the migration.
- **SC-005**: For each published package, the contents produced by the new pack workflow match the pre-migration baseline in file list and key `package.json` fields (`name`, `version`, `exports`, `main`, `module`, `types`, `files`). Acceptable variance is limited to whitespace and ordering inside generated metadata.
- **SC-006**: After the migration lands, contributors report zero workflow-breaking surprises during the first two weeks (measured via the absence of new GitHub issues tagged with the migration label).
- **SC-007**: 100% of repository-level documentation that previously instructed users to run `yarn …` now instructs them to run the pnpm equivalent.

## Assumptions

- The migration ships as a single PR on the `001-migrate-to-pnpm` branch and is squash-merged into `next`. Stacked, intermediate PRs are not required because there is no incremental state in which the repo is usefully half-migrated.
- pnpm will be pinned to the latest stable release at the time the migration PR is opened, via the `packageManager` field on the root `package.json`. Corepack is the activation path; contributors are expected to have it enabled (a one-line note in the README is sufficient).
- The `nodeLinker: node-modules` setting in `.yarnrc.yml` is a Yarn Berry compatibility shim and is **not** replicated. The migration adopts pnpm's strict isolated layout (see "Resolution mode" below).
- The Husky `prepare` script will continue to run on `pnpm install`, identically to `yarn install`. If pnpm's install lifecycle differs in a way that breaks this, the migration will add an explicit post-install step rather than skip the hooks.
- Released packages keep their existing names, version line, and semver policy. The migration is internal-only from a consumer's perspective.
- There is no migration tooling for in-flight PRs. Maintainers will rebase or recreate those PRs after the merge.

## Resolution mode

The migration adopts pnpm's **strict isolated `node_modules`** layout (the pnpm default). Each workspace sees only the dependencies it declares; phantom dependencies that the old hoisted Yarn layout silently provided will surface as install or runtime failures during the migration and MUST be fixed by adding the missing declarations to the relevant `package.json`. No `node-linker=hoisted` or repo-wide `public-hoist-pattern` allowlist is configured up-front. If a specific external constraint (a third-party package that genuinely cannot be fixed) forces a targeted hoist, it is documented inline in `.npmrc` with the reason.

**Rationale**: Adopting strict isolation now realises the largest single correctness benefit of moving off Yarn Berry. Carrying a hoisted shim forward would lock in the existing technical debt and defeat the migration's purpose.

**Implication for FR-001**: A successful install on strict isolation is part of the acceptance criteria — any package currently relying on phantom resolution MUST have its `dependencies` / `peerDependencies` updated as part of this PR.
