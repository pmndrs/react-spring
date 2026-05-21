# Quickstart — after the pnpm migration

**Feature**: Migrate package manager from Yarn 3 Berry to pnpm

This is the contributor-facing onboarding text that will land in `README.md`
when the migration merges. It is written so a contributor unfamiliar with
react-spring can get from a fresh clone to a green test suite without reading
anything else.

---

## Prerequisites

1. Node **22.15.0** (see `.nvmrc`). With `nvm`: `nvm install && nvm use`.
2. **Corepack enabled** (ships with Node):

   ```sh
   corepack enable
   ```

That's it — pnpm is pinned via the `packageManager` field in `package.json`, so
Corepack will install and use the exact pnpm version on your first command.

## Install

```sh
git clone https://github.com/pmndrs/react-spring.git
cd react-spring
pnpm install
```

The first install will take ~30–60s on a clean machine. A `pnpm-lock.yaml` is
present and committed; do not modify it by hand.

## Day-to-day commands

| Task                      | Command                                           |
| ------------------------- | ------------------------------------------------- |
| Build all packages        | `pnpm build`                                      |
| Watch-build all packages  | `pnpm dev`                                        |
| Run docs dev server       | `pnpm docs:dev`                                   |
| Run demo dev server       | `pnpm demo:dev`                                   |
| Full test suite           | `pnpm test`                                       |
| Unit tests only           | `pnpm test:unit`                                  |
| Single test file          | `pnpm jest packages/core/src/SpringValue.test.ts` |
| Filter unit tests by name | `pnpm jest -t "interpolation"`                    |
| Type-check                | `pnpm test:ts`                                    |
| Cypress E2E (parallax)    | `pnpm test:e2e`                                   |
| Lint                      | `pnpm lint`                                       |
| Format (write)            | `pnpm prettier:write`                             |
| Format (check)            | `pnpm prettier:check`                             |

## Working inside a single workspace

```sh
# Run a script in a specific workspace:
pnpm --filter @react-spring/core test

# Add a dependency to a specific workspace:
pnpm --filter @react-spring/core add some-package

# Add a root dev dependency:
pnpm add -D -w some-package
```

## Strict isolation — what's different from Yarn

react-spring's `node_modules` is now **strictly isolated**: each workspace can
only `import` packages it declares in its own `package.json`. If you see an
error like

> Cannot find module 'foo' or its corresponding type declarations

after pulling in a new dependency, add it to that workspace's `dependencies`
(or `peerDependencies` for plugins/integrations) — do **not** add a hoist rule.

This is intentional. The migration to pnpm chose this mode to surface and fix
the kind of phantom-dependency bugs that the old hoisted Yarn layout silently
hid.

## Validating the migration locally (one-shot)

After cloning and running `pnpm install`, the following pipeline MUST succeed
end-to-end on a clean repo. This is the same shape CI runs:

```sh
pnpm install --frozen-lockfile
pnpm build-ci
pnpm test:ts
pnpm test:unit
pnpm package
pnpm test:e2e   # optional — currently local-only
```

Each step is verifying one acceptance scenario from the spec:

| Step                             | Verifies                                              |
| -------------------------------- | ----------------------------------------------------- |
| `pnpm install --frozen-lockfile` | US1 scenario 1 (clean install) + FR-001 / FR-002      |
| `pnpm build-ci`                  | US1 scenario 2 (build) + FR-005                       |
| `pnpm test:ts`                   | US1 scenario 2 (types) + FR-006                       |
| `pnpm test:unit`                 | US1 scenario 2 (unit) + FR-006                        |
| `pnpm package`                   | US3 scenario 1 (pack reflects publish shape) + FR-015 |
| `pnpm test:e2e`                  | US4 scenario 1 (Cypress parallax) + FR-006            |

## Releasing

The release flow is unchanged in spirit — only the binary name has changed:

```sh
pnpm changeset           # 1. Describe the change
pnpm vers                # 2. Bump versions across all packages
pnpm release             # 3. Clean install, build, type-check, unit test, publish
```

For prereleases:

```sh
pnpm changeset pre enter beta   # or alpha, next
# ...
pnpm changeset pre exit
```

## Troubleshooting

- **`ERR_PNPM_UNSUPPORTED_ENGINE`** — your Node version is outside the supported range. Re-run `nvm use`.
- **`Corepack is about to download …`** — yes, let it. This is Corepack pulling the pinned pnpm version on first install.
- **`Cannot find module '<x>'`** — strict isolation; declare `<x>` in the workspace's `package.json` (`dependencies` or `peerDependencies`).
- **A postinstall script for `<pkg>` was ignored** — pnpm 9 blocks build scripts by default. If `<pkg>` is one we trust (e.g. `@swc/core`, `cypress`, `esbuild`), add it to root `package.json`'s `pnpm.onlyBuiltDependencies` array and run `pnpm install` again.
- **Husky hook didn't fire** — `pnpm install` should have triggered the `prepare` script automatically. If not, run `pnpm exec husky install` manually once.
