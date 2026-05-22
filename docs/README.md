# react-spring docs site

The marketing + documentation site for react-spring, built on
[React Router 7](https://reactrouter.com) in framework mode and deployed to
[Vercel](https://vercel.com).

## Deployment

Vercel auto-detects React Router 7 and runs the build. Pushes to a feature
branch produce a preview deployment; merges to `next` deploy to production
(`react-spring.dev`).

## Development

From the repo root (this workspace uses `pnpm` with strict isolation):

```sh
pnpm install --frozen-lockfile
pnpm docs:dev
```

The site is served at [http://localhost:3000](http://localhost:3000) with HMR
for component code, MDX content, and Vanilla Extract styles.

### Other commands

| Task                           | Command                                    |
| ------------------------------ | ------------------------------------------ |
| Type-check                     | `pnpm --filter @react-spring/docs test:ts` |
| Production build               | `pnpm --filter @react-spring/docs build`   |
| Serve built artefact locally\* | `pnpm --filter @react-spring/docs start`   |

\* `start` uses `react-router-serve` against the default Node build output.
When the `@vercel/react-router` preset is active, `react-router build` emits
the Vercel deployment format under `build/server/nodejs_*/`; for that layout
the canonical local serve is via `vercel dev` or the preview deployment.

## Stack

- **Framework**: React Router 7 (framework mode, SSR)
- **Build**: Vite 6 + `@react-router/dev`
- **Content**: MDX with a remark/rehype pipeline for callouts, slugs, and
  code highlighting (see `vite.config.mts`)
- **Styling**: Vanilla Extract
- **Search**: Algolia DocSearch
- **Routing**: file-based via `@react-router/fs-routes` (Remix v2 flat-route
  convention preserved in `app/routes.ts`)
- **Host**: Vercel (`@vercel/react-router` preset)
