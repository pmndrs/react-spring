# How to Contribute

Thanks for helping out! This guide covers everything you need to get a local checkout running, send a PR, and (if you have publish access) cut a release.

## Prerequisites

- **Node**: see `.nvmrc` (`nvm use` or `fnm use` picks it up). `engines.node` is the same version.
- **pnpm**: pinned via `packageManager` in the root `package.json`. Enable Corepack so the correct version activates automatically:
  ```sh
  corepack enable
  ```

## Getting started

```sh
git clone https://github.com/pmndrs/react-spring
cd react-spring
pnpm install
pnpm exec playwright install chromium   # one-off, needed for browser-mode Vitest
```

Now you're cooking. 👨🏻‍🍳🥓

## Day-to-day commands

| Task                     | Command                                                 |
| ------------------------ | ------------------------------------------------------- |
| Watch-build all packages | `pnpm dev`                                              |
| Run the docs site        | `pnpm docs:dev`                                         |
| Run the demo hub         | `pnpm demo:dev`                                         |
| Full test suite          | `pnpm test` (types + unit + e2e)                        |
| Unit tests (watch)       | `pnpm vitest --project unit`                            |
| Single test file         | `pnpm vitest run packages/core/src/SpringValue.test.ts` |
| Type-check               | `pnpm test:ts`                                          |
| Lint                     | `pnpm lint`                                             |
| Format                   | `pnpm format`                                           |

Vitest aliases `@react-spring/*` to the package source, so unit tests don't need a prior build. Anything outside Vitest (docs, publishing) does — run `pnpm build` first.

> **pnpm isolation gotcha**: `node_modules` is non-hoisted. If you hit `Cannot find module 'foo'` after adding an import, add `foo` to the workspace's `package.json` — don't add a hoist rule.

## Sending a PR

- **Target branch**: `next` (the active line). `main` may exist but isn't the merge base.
- **Commits**: follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, …). commitlint enforces this on the `commit-msg` hook.
- **Pre-commit**: `oxfmt --check` runs via husky. If it fails, run `pnpm format` and re-commit.
- **Keep PRs small and focused** — easier to review, easier to land.

## Publishing

(Maintainers only — needs npm publish access.) We use [changesets](https://github.com/changesets/changesets). All packages are version-locked.

### Simple release

1. Add a changeset describing the change. With `react-spring` we bump every package to the same version, so flag them all:
   ```sh
   pnpm changeset
   ```
2. Apply the bump (updates package versions and internal deps):
   ```sh
   pnpm vers
   ```
3. Publish. This cleans, installs, builds, type-checks, runs unit tests, and publishes via changesets:
   ```sh
   pnpm release
   ```
   Tags are not pushed automatically (`pnpm release` runs `changeset publish --no-git-tag`). After publishing, draft the GitHub release notes manually and update the changelog on `react-spring.dev`.

### Prerelease

Enter pre-mode first, then follow the simple release flow:

```sh
pnpm changeset pre enter beta   # or alpha, next
```

If you're stuck in pre-mode and need a normal release:

```sh
pnpm changeset pre exit
```
