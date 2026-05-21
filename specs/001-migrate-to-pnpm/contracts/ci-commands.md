# Contract: CI commands (yarn → pnpm)

**Feature**: Migrate package manager from Yarn 3 Berry to pnpm

This contract specifies the exact GitHub Actions step-shape every workflow MUST
adopt post-migration. It is the source of truth for `bundle-size.yml`,
`checks.yml`, `experimental.yml`, `nightly.yml`, and `tests.yml`.

## Standard install block (replaces every `cache: 'yarn'` + `yarn install --immutable` pair)

```yaml
- name: Checkout repo
  uses: actions/checkout@v4

- name: Setup pnpm
  uses: pnpm/action-setup@v4
  # No `version:` input — pnpm/action-setup reads `packageManager` from root package.json.

- name: Setup node ${{ matrix.node || '20' }}
  uses: actions/setup-node@v4
  with:
    node-version: ${{ matrix.node || '20' }}
    cache: 'pnpm'

- name: Install
  run: pnpm install --frozen-lockfile
```

The `Setup pnpm` step MUST appear **before** `Setup node`, because
`actions/setup-node`'s `cache: 'pnpm'` requires pnpm to be on PATH already.

## Per-command rewrites inside workflows

| Workflow                              | Step                       | Pre-migration `run:`                                                                                                               | Post-migration `run:`                                                                                                                 |
| ------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `bundle-size.yml`                     | Build packages             | `yarn build --filter=!@react-spring/docs`                                                                                          | `pnpm build --filter=!@react-spring/docs`                                                                                             |
| `checks.yml`                          | Lint                       | `yarn lint`                                                                                                                        | `pnpm lint`                                                                                                                           |
| `checks.yml`                          | Format                     | `yarn prettier:check`                                                                                                              | `pnpm prettier:check`                                                                                                                 |
| `experimental.yml`                    | Build                      | `yarn build-ci`                                                                                                                    | `pnpm build-ci`                                                                                                                       |
| `nightly.yml`                         | Build                      | `yarn build-ci`                                                                                                                    | `pnpm build-ci`                                                                                                                       |
| `tests.yml` (build job)               | Build                      | `yarn build-ci --filter=!@react-spring/docs`                                                                                       | `pnpm build-ci --filter=!@react-spring/docs`                                                                                          |
| `tests.yml` (build job)               | Pack                       | `yarn package`                                                                                                                     | `pnpm package`                                                                                                                        |
| `tests.yml` (test-unit)               | Build                      | `yarn build-ci`                                                                                                                    | `pnpm build-ci`                                                                                                                       |
| `tests.yml` (test-unit)               | Test                       | `yarn test:unit`                                                                                                                   | `pnpm test:unit`                                                                                                                      |
| `tests.yml` (test-types)              | Install TS pin             | `yarn add typescript@${{ matrix.ts }}`                                                                                             | `pnpm add -w typescript@${{ matrix.ts }}`                                                                                             |
| `tests.yml` (test-types)              | Build                      | `yarn build-ci`                                                                                                                    | `pnpm build-ci`                                                                                                                       |
| `tests.yml` (test-types)              | Test                       | `yarn tsc --version` && `yarn test:ts`                                                                                             | `pnpm tsc --version` && `pnpm test:ts`                                                                                                |
| `tests.yml` (test-published-artifact) | Remove `@react-spring/web` | `yarn remove @react-spring/web`                                                                                                    | `npm uninstall @react-spring/web` _(fixture is now npm — see R-005)_                                                                  |
| `tests.yml` (test-published-artifact) | Install tarballs           | `yarn add ./web/package.tgz ./animated/package.tgz ./core/package.tgz ./rafz/package.tgz ./shared/package.tgz ./types/package.tgz` | `npm install ./web/package.tgz ./animated/package.tgz ./core/package.tgz ./rafz/package.tgz ./shared/package.tgz ./types/package.tgz` |
| `tests.yml` (test-published-artifact) | Inspect                    | `yarn info @react-spring/web && yarn why @react-spring/web`                                                                        | `npm info @react-spring/web && npm ls @react-spring/web`                                                                              |
| `tests.yml` (test-published-artifact) | Build example              | `yarn build`                                                                                                                       | `npm run build`                                                                                                                       |
| `tests.yml` (test-published-artifact) | Test example               | `yarn test`                                                                                                                        | `npm test`                                                                                                                            |

## `paths-filter` watch list (in `tests.yml` `changes` job)

| Path              | Pre-migration                     | Post-migration                            |
| ----------------- | --------------------------------- | ----------------------------------------- |
| Root lockfile     | `yarn.lock`                       | `pnpm-lock.yaml`                          |
| Fixture lockfiles | `.github/publish-ci/**/yarn.lock` | `.github/publish-ci/**/package-lock.json` |

All other entries in the filter (`packages/**`, `targets/**`, `cypress/**`, `.github/workflows/*.yml`, `package.json`) remain unchanged.

## Cache-key invariants

- `actions/setup-node`'s `cache: 'pnpm'` derives its key from the SHA of `pnpm-lock.yaml`. No manual `key:` field is required.
- pnpm's global store lives at `~/.local/share/pnpm/store/v3` on Linux runners; `setup-node` handles caching it.
- Bundle-size action (`preactjs/compressed-size-action@v2`) is package-manager-agnostic — no change needed beyond the install block.

## Required workflow rewrite order

The five workflows MUST be migrated together in the same PR, but they should be re-read in this order while iterating:

1. **`checks.yml`** — smallest surface; sanity-check the install block first.
2. **`bundle-size.yml`** — exercises a real build.
3. **`tests.yml`** — largest surface; covers unit, types, publish-artefact, and `paths-filter`.
4. **`experimental.yml`** and **`nightly.yml`** — same install + build shape as `tests.yml`'s build job; trivially follow the pattern once `tests.yml` is in shape.

## Invariants

- Every workflow MUST pass on the migration PR before merge (FR-011, SC-004).
- The CI Node matrix (18.x, 20.x) MUST NOT change as a side effect (FR-012).
- The TS matrix (`5.0`, `5.1`, `5.2`) in `test-types` MUST NOT change.
