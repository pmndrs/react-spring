# Phase 0 — Research

**Feature**: Migrate package manager from Yarn 3 Berry to pnpm
**Date**: 2026-05-21

---

## R-001: pnpm major version and pin mechanism

**Decision**: Adopt **pnpm 9.x latest stable** at the time the migration PR is opened. Pin via the root `packageManager` field (`"packageManager": "pnpm@9.<x>.<y>"`), activated through Corepack.

**Rationale**:

- pnpm 9 is the current stable line (10 has been released but adoption is still settling); 9 already gives us strict `node-linker=isolated`, deterministic lockfile format v9, and the `onlyBuiltDependencies` allowlist we will rely on (see R-003).
- The `packageManager` field plus Corepack mirrors how Yarn 3 is currently pinned (`"packageManager": "yarn@3.8.7"` + `.yarn/releases/yarn-3.8.7.cjs`). It is the convention every modern Node version supports (`corepack enable`).
- Pinning a single version eliminates the lockfile-drift class of CI flake.

**Alternatives considered**:

- _pnpm 10.x_: more recent, but adoption noise (some integrations still catching up) outweighs the marginal gains for a migration whose goal is "no surprises". Defer to a follow-up upgrade.
- _No `packageManager` pin, rely on `engines.pnpm`_: less reliable across contributor environments; Corepack-aware tooling already keys off `packageManager`.
- _Globally installed pnpm without Corepack_: contributors will drift; the whole point of pinning is reproducibility.

---

## R-002: `pnpm-workspace.yaml` shape

**Decision**: Replace the `workspaces` field in root `package.json` with:

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'targets/*'
  - 'demo'
  - 'docs'
```

Remove the existing `packages/parallax/@react-spring/parallax-demo` entry — that directory no longer exists in the repository (`packages/parallax/` contains only `src/`, `test/`, `dist/`, `.turbo/`).

**Rationale**:

- The stale entry is dead weight inherited from a prior layout. Yarn Berry silently tolerated it; pnpm warns/errors on missing workspace paths, so we may as well clean it up.
- The remaining four globs cover every workspace the build currently exercises.

**Alternatives considered**:

- _Keep the stale entry "just in case"_: rejected — it's silent rot, the kind that bites someone in six months.
- _Use explicit per-workspace paths instead of globs_: rejected — the glob form is the same shape Yarn used and we benefit from auto-pickup of new packages.

---

## R-003: Postinstall-script policy under pnpm 9+

**Decision**: Declare the allowlist explicitly via `pnpm.onlyBuiltDependencies` in root `package.json`:

```json
"pnpm": {
  "onlyBuiltDependencies": [
    "@swc/core",
    "cypress",
    "esbuild",
    "@remix-run/dev",
    "@parcel/watcher",
    "core-js",
    "core-js-pure"
  ]
}
```

**Rationale**:

- pnpm 9 blocks dependency install/postinstall scripts by default; without an allowlist, native-build packages (`@swc/core`, `esbuild`, `cypress`) will install but skip their post-build step, producing runtime failures.
- The root has its own `"postinstall": "remix setup node"` script — that's a root-level lifecycle, not a dependency one, and runs regardless. We keep it.
- The list above is a best-guess starter. The actual list will be finalised during install: pnpm 9 prints the exact set of "ignored scripts" warnings, and we add packages until the warning list is empty for packages we genuinely need built.

**Alternatives considered**:

- _`pnpm config set unsafe-perm` or disabling the safety check globally_: rejected — this is exactly the kind of correctness setting we should respect, not bypass.
- _Maintaining a separate `.pnpm-allowlist`_: rejected — `package.json` is the right home (committed, reviewed, scoped to the repo).

---

## R-004: Husky `prepare` script under pnpm

**Decision**: Keep the existing `"prepare": "husky install"` script verbatim. Husky 9 wires hooks into `.husky/` from this `prepare` lifecycle, which pnpm runs on `pnpm install` exactly like yarn did.

**Rationale**:

- `prepare` is a standard npm lifecycle hook (not yarn-specific) and pnpm honours it.
- Husky 9's `husky install` command itself does not depend on the package manager.
- No additional action is needed; the only verification is that pre-commit and commit-msg hooks fire after a fresh `pnpm install`.

**Alternatives considered**:

- _Switch from Husky to `simple-git-hooks` or `lefthook`_: out of scope. The migration's goal is "swap package manager, change nothing else".

---

## R-005: Downstream `.github/publish-ci/<example>/` fixtures

**Decision**: Migrate **each downstream fixture to npm** (not pnpm, not yarn). Each fixture is a self-contained mini-project simulating an end consumer; npm is the lowest-common-denominator and removes the need to pin a second yarn version in CI.

**Rationale**:

- These fixtures install pre-built `package.tgz` artefacts produced by the build job. The package manager used inside the fixture has no bearing on react-spring's correctness — it's purely consumer-side.
- npm is shipped with every Node version we test against, so no separate setup step in CI.
- Each fixture has its own `yarn.lock`; replacing with `package-lock.json` is a one-time mechanical change.
- The `paths-filter` watch list in `tests.yml` currently includes `.github/publish-ci/**/yarn.lock` — that pattern will be updated to `.github/publish-ci/**/package-lock.json` (or removed if irrelevant).

**Alternatives considered**:

- _Keep yarn in fixtures_: rejected — requires the workflow to also pin yarn, doubling the package-manager surface in CI.
- _Use pnpm in fixtures_: rejected — fixtures should simulate the broadest set of end users; pnpm is not yet dominant downstream.

---

## R-006: Phantom-dependency surface

**Decision**: Treat the first `pnpm install` as the discovery step. Expected phantom-dep failures and their likely fixes:

| Workspace                | Likely Missing Declaration                                                       | Hypothesis                                                                                                                         |
| ------------------------ | -------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `targets/three`          | `@react-three/fiber` in `peerDependencies`                                       | Used at module-load time per CLAUDE.md (`addEffect` integration).                                                                  |
| `targets/konva`          | `konva`, `react-konva` in `peerDependencies`                                     | Currently only at root; targets/konva imports them.                                                                                |
| `targets/zdog`           | `zdog`, `react-zdog` in `peerDependencies`                                       | Same pattern.                                                                                                                      |
| `targets/web`            | `react-dom` in `peerDependencies`                                                | Likely already declared, but verify.                                                                                               |
| `targets/native`         | `react-native` in `peerDependencies`                                             | Likely already declared, but verify.                                                                                               |
| `packages/core`          | `react` in `peerDependencies`                                                    | Likely already declared, but verify.                                                                                               |
| `docs`                   | Any Remix loader-time dependency (e.g., `@remix-run/node`)                       | Verify postinstall + dev server.                                                                                                   |
| `demo`                   | `@react-spring/web` (workspace) + React                                          | Likely already declared, but verify.                                                                                               |
| Cypress / Jest dev infra | `@types/jest`, `jest-environment-jsdom` reachable from workspaces that run tests | These live at root; if a workspace's `jest.config.*` references them directly, they need to be declared locally (or root-hoisted). |

**Action**: The phantom-dep fix is part of the migration PR (FR-001 / "Resolution mode" / "Implication for FR-001"). The exact list will be derived empirically — pnpm will surface them as install errors or `tsc` errors.

**Rationale**: Strict isolation's correctness win is realised by making each workspace declare exactly what it imports. Pre-emptively guessing all of them would be hand-wavy; the iterative install-and-fix loop is reliable and bounded (the failure list is finite and visible).

**Alternatives considered**:

- _Add `public-hoist-pattern[]=_`to`.npmrc`\*: rejected — that re-creates the Yarn hoisted layout and defeats the migration.
- _Targeted `public-hoist-pattern[]` for `@types/_` and ESLint plugins\*: deferred — only apply if the bare strict mode produces genuinely unfixable noise. Decide during implementation, not pre-emptively.

---

## R-007: Replacement commands for yarn-specific invocations

**Decision**: Mapping (full list in `contracts/developer-commands.md`):

| Yarn invocation                                         | pnpm equivalent                                                                       |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `yarn install --immutable`                              | `pnpm install --frozen-lockfile`                                                      |
| `yarn` (alias for install)                              | `pnpm install`                                                                        |
| `yarn build` (top-level script)                         | `pnpm build`                                                                          |
| `yarn workspace <name> <cmd>`                           | `pnpm --filter <name> <cmd>`                                                          |
| `yarn add <pkg>`                                        | `pnpm add <pkg>`                                                                      |
| `yarn add <pkg> -W` (root)                              | `pnpm add -w <pkg>`                                                                   |
| `yarn remove <pkg>`                                     | `pnpm remove <pkg>`                                                                   |
| `yarn info <pkg>`                                       | `pnpm info <pkg>` (or `pnpm view <pkg>`)                                              |
| `yarn why <pkg>`                                        | `pnpm why <pkg>`                                                                      |
| `yarn pack` (inside a workspace)                        | `pnpm pack` (inside a workspace)                                                      |
| `yarn cypress ...`, `yarn vite ...` (binary delegation) | `pnpm cypress ...`, `pnpm vite ...` (pnpm resolves binaries from `node_modules/.bin`) |

**Rationale**: pnpm's CLI is mostly drop-in. The notable differences are the filter syntax (`--filter` vs `workspace …`) and the lockfile flag (`--frozen-lockfile` vs `--immutable`).

**Alternatives considered**: none meaningful — these are the canonical pnpm equivalents.

---

## R-008: CI cache strategy

**Decision**: Replace `cache: 'yarn'` in `actions/setup-node@v4` with the dedicated **`pnpm/action-setup`** action plus `cache: 'pnpm'` in `setup-node`. Standard form:

```yaml
- uses: pnpm/action-setup@v4
  # version comes from packageManager in package.json — no `version:` input needed.

- uses: actions/setup-node@v4
  with:
    node-version: ${{ matrix.node }}
    cache: 'pnpm'

- run: pnpm install --frozen-lockfile
```

The cache key is automatically derived from `pnpm-lock.yaml`.

**Rationale**:

- `pnpm/action-setup` is the recommended way to install pnpm in GitHub Actions; it respects the `packageManager` pin automatically, keeping CI and contributors in lock-step.
- `actions/setup-node`'s built-in pnpm cache covers the global store.
- The previous `cache: 'yarn'` is a one-line swap to `cache: 'pnpm'` once the action chain is correct.

**Alternatives considered**:

- _Install pnpm manually via `corepack enable`_: works, but adds one extra step and gives up the `pnpm/action-setup` cache layer.
- _Custom `actions/cache` with a hand-rolled key_: brittle and unnecessary.
