# Phase 1 — Data Model

**Feature**: Migrate package manager from Yarn 3 Berry to pnpm
**Date**: 2026-05-21

This migration has no application-level data model. The "entities" are the repository's package-management configuration surfaces. Each row below names a surface, the file(s) that own it, the validation rule, and the state transition this PR performs.

## E1. Lockfile

| Field          | Value                                                                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Owns**       | Resolved dependency graph for the entire workspace.                                                                                                                 |
| **Pre-state**  | `yarn.lock` at repo root, Yarn 3 Berry format.                                                                                                                      |
| **Post-state** | `pnpm-lock.yaml` at repo root, pnpm v9 lockfile format (`lockfileVersion: '9.0'`).                                                                                  |
| **Validation** | (a) `pnpm install --frozen-lockfile` succeeds on a fresh checkout with no `node_modules`. (b) Lockfile is committed and free of `workspace:*` resolution conflicts. |
| **Transition** | `yarn.lock` deleted in the same commit as `pnpm-lock.yaml` is generated. No interim state where both exist.                                                         |

## E2. Workspace manifest

| Field          | Value                                                                                                                                                                                                                                         |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Owns**       | The declarative list of workspaces in the monorepo.                                                                                                                                                                                           |
| **Pre-state**  | `package.json` `workspaces` field, listing four globs plus one stale path.                                                                                                                                                                    |
| **Post-state** | `pnpm-workspace.yaml` at repo root with the four live globs only. `workspaces` field removed from `package.json`.                                                                                                                             |
| **Validation** | (a) `pnpm -r exec true` succeeds for every workspace currently published. (b) `packages/parallax/@react-spring/parallax-demo` no longer appears anywhere. (c) Turborepo's `pnpm exec turbo run build` resolves the same task graph as before. |
| **Transition** | Atomic: `workspaces` removed, `pnpm-workspace.yaml` added, both in the same commit.                                                                                                                                                           |

## E3. Package-manager pin

| Field          | Value                                                                                                                                                                                      |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Owns**       | The mechanism that forces every install to use the same package-manager version.                                                                                                           |
| **Pre-state**  | `"packageManager": "yarn@3.8.7"`, `.yarnrc.yml` (`yarnPath: .yarn/releases/yarn-3.8.7.cjs`), `.yarn/releases/yarn-3.8.7.cjs`, `.yarn/plugins/...`.                                         |
| **Post-state** | `"packageManager": "pnpm@<v9.x.y>"`. `.yarnrc.yml` and `.yarn/` directory deleted.                                                                                                         |
| **Validation** | (a) `corepack prepare pnpm@<v9.x.y> --activate` succeeds on a clean machine. (b) Running `pnpm -v` reports the pinned version. (c) No `.yarn*` files remain in tracked or untracked state. |
| **Transition** | Single-PR swap; no overlap.                                                                                                                                                                |

## E4. Install / hoisting configuration

| Field          | Value                                                                                                                                                                                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Owns**       | How dependencies are resolved and exposed to package code.                                                                                                                                                                                                                                                                            |
| **Pre-state**  | `.yarnrc.yml` `nodeLinker: node-modules` (flat hoisted tree).                                                                                                                                                                                                                                                                         |
| **Post-state** | `.npmrc` at repo root with pnpm-relevant settings (registry, optional `strict-peer-dependencies`, optional `public-hoist-pattern[]` only if forced by an unfixable phantom dep — see research R-006). Default linker is pnpm's strict isolated `node_modules`.                                                                        |
| **Validation** | (a) No workspace can `require()` a package it does not declare in its own `package.json` (verified by `pnpm install` succeeding _without_ setting `node-linker=hoisted`). (b) Every previously-phantom dep that's needed has been promoted to an explicit `dependencies` / `peerDependencies` declaration in the importing workspace. |
| **Transition** | `.yarnrc.yml` deleted; `.npmrc` created. Workspace `package.json` files updated as needed.                                                                                                                                                                                                                                            |

## E5. CI cache key + setup

| Field          | Value                                                                                                                                                                                                                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Owns**       | The GitHub Actions install-step contract: which package manager to bootstrap, what to cache, and what install command to run.                                                                                                                                                                                        |
| **Pre-state**  | Five workflows under `.github/workflows/` use `actions/setup-node@v4` with `cache: 'yarn'` and run `yarn install --immutable`.                                                                                                                                                                                       |
| **Post-state** | Each workflow uses `pnpm/action-setup@v4`, then `actions/setup-node@v4` with `cache: 'pnpm'`, then `pnpm install --frozen-lockfile`. The `tests.yml` `paths-filter` step replaces `yarn.lock` and `.github/publish-ci/**/yarn.lock` with `pnpm-lock.yaml` and `.github/publish-ci/**/package-lock.json` (per R-005). |
| **Validation** | (a) Every workflow passes on the migration PR. (b) Cache hit rate after the second run is comparable to the previous yarn cache hit rate.                                                                                                                                                                            |
| **Transition** | Five workflows rewritten in the same commit.                                                                                                                                                                                                                                                                         |

## E6. Husky hook wiring

| Field          | Value                                                                                                                |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Owns**       | The pre-commit (`prettier:check`) and commit-msg (`commitlint`) hooks.                                               |
| **Pre-state**  | `.husky/pre-commit` and `.husky/commit-msg` scripts; wired via root `"prepare": "husky install"`.                    |
| **Post-state** | **Unchanged.** `prepare` is a standard npm lifecycle and pnpm honours it identically (see research R-004).           |
| **Validation** | (a) Fresh `pnpm install` on a clean clone produces a working `.husky/_/` shim. (b) `git commit` triggers both hooks. |
| **Transition** | No change required.                                                                                                  |

## E7. Downstream consumer fixtures (`.github/publish-ci/<example>/`)

| Field          | Value                                                                                                                                                                                                                       |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Owns**       | The "did our packed artefact install and run for an end consumer?" smoke test.                                                                                                                                              |
| **Pre-state**  | Each of `cra5`, `next`, `vite`, `node-standard`, `node-esm` has a `yarn.lock` and uses yarn commands in CI.                                                                                                                 |
| **Post-state** | Each fixture uses **npm**: `yarn.lock` → `package-lock.json`, all `yarn add` / `yarn remove` / `yarn build` / `yarn test` calls in `tests.yml` rewritten to `npm install` / `npm uninstall` / `npm run build` / `npm test`. |
| **Validation** | (a) `test-published-artifact` job passes for all five matrix entries. (b) `paths-filter` watch pattern updated to track `.github/publish-ci/**/package-lock.json`.                                                          |
| **Transition** | All five fixtures migrated in the same commit. See research R-005 for the rationale (npm, not pnpm).                                                                                                                        |

## E8. Documentation surface

| Field          | Value                                                                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Owns**       | Every contributor-facing string of the form `yarn <something>`.                                                                          |
| **Pre-state**  | `README.md`, `CLAUDE.md`, `docs/**`, and per-package READMEs reference yarn commands throughout.                                         |
| **Post-state** | All instances replaced with pnpm equivalents per `contracts/developer-commands.md`.                                                      |
| **Validation** | `grep -rn "yarn " --include='*.md' .` returns zero results that are not historical references (e.g., a changelog entry pre-migration).   |
| **Transition** | Bulk find-replace in the same commit, then a manual sweep for context (e.g., "ensure yarn is installed" → "ensure corepack is enabled"). |

---

## State diagram (high level)

```text
[yarn-locked state]
  yarn.lock + .yarnrc.yml + .yarn/ + packageManager:yarn@3.8.7
        │
        │ single PR (this feature)
        ▼
[pnpm-locked state]
  pnpm-lock.yaml + pnpm-workspace.yaml + .npmrc + packageManager:pnpm@9.x.y
```

There is no valid intermediate state. The PR either installs cleanly under pnpm with strict isolation (✅) or it doesn't (❌) — and "doesn't" means more workspace `package.json` declarations are required before the PR can land.
