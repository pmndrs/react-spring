# Contract: Developer commands (yarn → pnpm)

**Feature**: Migrate package manager from Yarn 3 Berry to pnpm

This contract is the canonical mapping every developer-facing script, doc, and
internal note MUST conform to after the migration. Anything still using a yarn
form post-migration is a defect.

## Top-level scripts (root `package.json`)

| Action                        | Pre-migration                           | Post-migration                          |
| ----------------------------- | --------------------------------------- | --------------------------------------- |
| Install (lockfile-respecting) | `yarn install --immutable`              | `pnpm install --frozen-lockfile`        |
| Install (writable lockfile)   | `yarn install` or `yarn`                | `pnpm install`                          |
| Build all                     | `yarn build`                            | `pnpm build`                            |
| Build excluding docs          | `yarn build-ci`                         | `pnpm build-ci`                         |
| Watch-build all               | `yarn dev`                              | `pnpm dev`                              |
| Run docs dev server           | `yarn docs:dev`                         | `pnpm docs:dev`                         |
| Build docs                    | `yarn docs:build`                       | `pnpm docs:build`                       |
| Run demo dev server           | `yarn demo:dev`                         | `pnpm demo:dev`                         |
| Format (write)                | `yarn prettier:write`                   | `pnpm prettier:write`                   |
| Format (check)                | `yarn prettier:check`                   | `pnpm prettier:check`                   |
| Lint all                      | `yarn lint`                             | `pnpm lint`                             |
| Pack all                      | `yarn package`                          | `pnpm package`                          |
| Full test (ts + unit + e2e)   | `yarn test`                             | `pnpm test`                             |
| Unit tests                    | `yarn test:unit`                        | `pnpm test:unit`                        |
| Single test file              | `yarn jest packages/core/src/X.test.ts` | `pnpm jest packages/core/src/X.test.ts` |
| Filter by name                | `yarn jest -t "interpolation"`          | `pnpm jest -t "interpolation"`          |
| Coverage                      | `yarn test:cov`                         | `pnpm test:cov`                         |
| Type-check                    | `yarn test:ts`                          | `pnpm test:ts`                          |
| Cypress E2E                   | `yarn test:e2e`                         | `pnpm test:e2e`                         |
| Clean                         | `yarn clean`                            | `pnpm clean`                            |
| Add changeset                 | `yarn changeset`                        | `pnpm changeset`                        |
| Version (changesets)          | `yarn vers`                             | `pnpm vers`                             |
| Release                       | `yarn release`                          | `pnpm release`                          |

### Required rewrites inside script bodies

The following script _bodies_ embed `yarn` and MUST be rewritten:

| Script       | Pre-migration body                                                                                                   | Post-migration body                                                                                                  |
| ------------ | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `docs:dev`   | `yarn workspace @react-spring/docs dev`                                                                              | `pnpm --filter @react-spring/docs dev`                                                                               |
| `docs:build` | `yarn workspace @react-spring/docs build`                                                                            | `pnpm --filter @react-spring/docs build`                                                                             |
| `demo:dev`   | `yarn workspace @react-spring/demo dev`                                                                              | `pnpm --filter @react-spring/demo dev`                                                                               |
| `test`       | `yarn test:ts && yarn test:unit && yarn test:e2e`                                                                    | `pnpm test:ts && pnpm test:unit && pnpm test:e2e`                                                                    |
| `test:e2e`   | `start-server-and-test 'yarn vite serve packages/parallax/test --host' http-get://localhost:3000 'yarn cypress run'` | `start-server-and-test 'pnpm vite serve packages/parallax/test --host' http-get://localhost:3000 'pnpm cypress run'` |
| `release`    | `yarn clean && yarn && yarn build && yarn test:ts && yarn test:unit && yarn changeset publish --no-git-tag`          | `pnpm clean && pnpm install && pnpm build && pnpm test:ts && pnpm test:unit && pnpm changeset publish --no-git-tag`  |

## Ad-hoc commands

| Action                      | Pre-migration                        | Post-migration                      |
| --------------------------- | ------------------------------------ | ----------------------------------- |
| Add a dep to a workspace    | `yarn workspace <name> add <pkg>`    | `pnpm --filter <name> add <pkg>`    |
| Add a root dev dep          | `yarn add -D -W <pkg>`               | `pnpm add -D -w <pkg>`              |
| Remove a dep                | `yarn workspace <name> remove <pkg>` | `pnpm --filter <name> remove <pkg>` |
| Inspect a package           | `yarn info <pkg>`                    | `pnpm info <pkg>`                   |
| Why is this installed       | `yarn why <pkg>`                     | `pnpm why <pkg>`                    |
| Run a binary                | `yarn <bin>`                         | `pnpm <bin>` (or `pnpm exec <bin>`) |
| Run a script in a workspace | `yarn workspace <name> <script>`     | `pnpm --filter <name> <script>`     |

## Invariants

- Script _names_ MUST NOT change. Only their _bodies_ change. Contributors with muscle memory keep working.
- Every command listed above MUST be exercised at least once during the migration PR's manual verification (see `quickstart.md`).
