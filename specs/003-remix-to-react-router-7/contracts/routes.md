# Contract: Public URL Surface

**Branch**: `003-remix-to-react-router-7` | **Date**: 2026-05-22

The docs site exposes one external contract: the set of URLs it serves. The migration's correctness is defined by this set remaining intact. Anything not in this list is implementation detail.

---

## C1. URL → expected response

For every path below, a `GET` against the migrated preview deployment MUST return:

- HTTP status `200`
- `Content-Type: text/html; charset=utf-8`
- Non-empty HTML body
- HTML containing the expected `<title>` (where listed)

| Path                                           | Expected `<title>` contains |
| ---------------------------------------------- | --------------------------- |
| `/`                                            | `react-spring`              |
| `/docs`                                        | `react-spring`              |
| `/docs/getting-started`                        | `Getting Started`           |
| `/docs/typescript`                             | `TypeScript`                |
| `/docs/advanced`                               | `Advanced`                  |
| `/docs/advanced/async-animations`              | `Async Animations`          |
| `/docs/advanced/config`                        | `Config`                    |
| `/docs/advanced/controller`                    | `Controller`                |
| `/docs/advanced/events`                        | `Events`                    |
| `/docs/advanced/interpolation`                 | `Interpolation`             |
| `/docs/advanced/spring-ref`                    | `SpringRef`                 |
| `/docs/advanced/spring-value`                  | `SpringValue`               |
| `/docs/components`                             | `Components`                |
| `/docs/components/parallax`                    | `Parallax`                  |
| `/docs/components/parallax-layer`              | `ParallaxLayer`             |
| `/docs/components/use-chain`                   | `useChain`                  |
| `/docs/components/use-spring`                  | `useSpring`                 |
| `/docs/components/use-spring-value`            | `useSpringValue`            |
| `/docs/components/use-springs`                 | `useSprings`                |
| `/docs/components/use-trail`                   | `useTrail`                  |
| `/docs/components/use-transition`              | `useTransition`             |
| `/docs/concepts`                               | `Concepts`                  |
| `/docs/concepts/animated-elements`             | `Animated Elements`         |
| `/docs/concepts/controllers-and-springs`       | `Controllers`               |
| `/docs/concepts/imperative-api`                | `Imperative`                |
| `/docs/concepts/targets`                       | `Targets`                   |
| `/docs/guides`                                 | `Guides`                    |
| `/docs/guides/react-three-fiber`               | `React Three Fiber`         |
| `/docs/guides/testing`                         | `Testing`                   |
| `/docs/utilities`                              | `Utilities`                 |
| `/docs/utilities/use-in-view`                  | `useInView`                 |
| `/docs/utilities/use-isomorphic-layout-effect` | `useIsomorphicLayoutEffect` |
| `/docs/utilities/use-reduced-motion`           | `useReducedMotion`          |
| `/docs/utilities/use-resize`                   | `useResize`                 |
| `/docs/utilities/use-scroll`                   | `useScroll`                 |
| `/examples`                                    | `Examples`                  |

> Title fragments are indicative — verifiers should normalise whitespace and casing. The hard requirement is HTTP 200 + non-empty body for every path in this table (FR-004, SC-001, INV-R1).

## C2. Splat (404) behaviour

- `GET /this-path-does-not-exist` MUST return HTTP `404`
- Response body MUST be HTML containing the ASCII-art 404 page rendered by `app/routes/$.tsx` (the `<title>` contains `404`)

## C3. Feedback API — removed (FR-019)

The `/api/feedback` endpoint is **no longer part of the contract** after this migration. Any request to `/api/feedback` (any method) MUST return HTTP 404 (handled by the splat route in §C2). The Supabase-backed write path is removed from the docs surface entirely. Generic feedback now flows through the GitHub Discussions link in `docs._index.mdx`.

## C4. Static assets

- Hashed asset URLs served from `build/client/assets/*.{js,css}` MUST return 200 with `Cache-Control` matching Vercel's default for hashed-immutable assets.
- `/share.jpg`, `/favicon.ico`, anything else under `docs/public/` MUST return 200.

## C5. Server-rendered first paint

For all entries in §C1, the first HTML response MUST already contain:

- The page's `<title>` and OpenGraph meta tags (FR-005)
- The full visible content (no `loading…` skeleton waiting on client hydration)
- The correct theme class on `<html>` based on the `theme` cookie, with no flash on hydration (FR-013)

## Out-of-contract

These are explicitly **not** part of the URL contract and may change without breaking the migration:

- Internal hashed asset filenames (Vite produces new hashes on every build)
- The exact HTML structure inside the body (as long as visible content and meta tags are preserved)
- Cache headers on dynamic HTML responses (Vercel's defaults under the new preset apply)
