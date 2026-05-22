# Quickstart — Verifying the RR7 Migration

**Branch**: `003-remix-to-react-router-7` | **Date**: 2026-05-22

Use this recipe to confirm the migration is correct end-to-end. Designed to be run by a contributor pulling the branch fresh.

---

## Prerequisites

- Node 22.15.0 (or whatever `.nvmrc` pins). `nvm use` if necessary.
- pnpm 9.15.9 (corepack-pinned via root `package.json`).
- A Vercel project linked to this repo (for §6 only — local checks don't need it).
- No Supabase env vars needed — the Feedback module is removed in this migration (FR-019). `SUPABASE_URL` / `SUPABASE_ANON_KEY` can be unset from the Vercel project as a post-merge cleanup step.

---

## 1. Clean install

```sh
git checkout 003-remix-to-react-router-7
pnpm install --frozen-lockfile
```

**Expected**: install completes in <2 minutes; no peer-dep warnings about React Router majors mismatching; no `@remix-run/*` packages installed (verify with `pnpm ls --filter @react-spring/docs | grep remix-run` → empty).

## 2. Type-check

```sh
pnpm --filter @react-spring/docs test:ts
```

**Expected**: exit code 0, no errors. (Internally this runs `react-router typegen && tsc --noEmit` per R11.) Verifies FR-017 / SC-008.

## 3. Lint + format

```sh
pnpm lint
pnpm format:check
```

**Expected**: both clean. The `docs/` workspace is included in both Turbo pipelines via the root config.

## 4. Dev server

```sh
pnpm docs:dev
```

**Expected**:

- Server starts on `http://localhost:3000`.
- Output mentions `react-router dev` (not `remix vite:build`).
- Visit `/` — page loads SSR, theme is correct on first paint (no flash).
- Visit `/docs/components/use-spring` — MDX page renders with code highlighting + callouts + table of contents.
- Open dev-tools console → no hydration warnings, no React errors, no missing module warnings.
- Edit `docs/app/routes/docs.getting-started.mdx` and save — change appears in the browser within ~2 seconds without a full reload.
- Toggle the theme — preference persists across a hard refresh (`Cmd+Shift+R`).
- Open the search modal (Algolia DocSearch) — results return and link to live URLs.
- Open an embedded `<Sandpack>` block on `/docs/components/use-spring` — example renders and runs.

## 5. Production build

```sh
pnpm --filter @react-spring/docs build
```

**Expected**:

- Exits 0.
- Output mentions `react-router build`.
- `docs/build/client/` and `docs/build/server/` directories exist.
- No `docs/public/build/` (the old Remix output dir) is created.
- Bundle size of `docs/build/client/assets/*.js` is within ±15% of current production (sanity-check, not a hard gate).

Then:

```sh
pnpm --filter @react-spring/docs start
```

**Expected**: serves the built artefact locally via `react-router-serve`; same URLs as §4 work; `/api/feedback` returns 404 (route file has been deleted per FR-019).

## 6. Vercel preview deploy

Push the branch to your fork (or to the repo if you have push access):

```sh
git push -u origin 003-remix-to-react-router-7
```

**Expected**: Vercel produces a preview URL within ~3 minutes. Open it and:

- Walk the route table in [`contracts/routes.md`](./contracts/routes.md). Every URL returns 200 with non-empty body.
- A scripted version of the walk:

  ```sh
  PREVIEW_URL=https://<your-preview>.vercel.app
  while read -r path; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "$PREVIEW_URL$path")
    echo "$code $path"
  done < <(awk -F'|' '/^\| `\// {gsub(/^[ `]+|[ `]+$/, "", $2); print $2}' specs/003-remix-to-react-router-7/contracts/routes.md)
  ```

  All non-splat rows should print `200`.

- Hit any unmatched path (e.g. `/nope`) and confirm the 404 page renders.

## 7. Lighthouse spot-check

Run Lighthouse (Chrome dev-tools or `lighthouse` CLI) against:

- The preview URL `/`
- The preview URL `/docs/components/use-spring`

Compare against the current production site (`https://www.react-spring.dev/...`):

- Performance, SEO, Accessibility scores within 5 points of production (SC-006).
- LCP within 10% of production under the same network throttling profile (SC-007).

## 8. Dependency-tree assertions

```sh
# INV-P1: zero @remix-run/* in the resolved tree
grep -E '"@remix-run/' pnpm-lock.yaml || echo "OK: no @remix-run packages remain"

# INV-P2: exactly one major of react-router
pnpm ls react-router -r --depth -1 --json \
  | jq -r '..|.version? // empty' \
  | grep -E '^[0-9]+' \
  | cut -d. -f1 \
  | sort -u
# expected output: 7
```

---

## Rollback

If any step above fails in a way that can't be quickly diagnosed, revert is one commit:

```sh
git revert <migration-commit-sha>
pnpm install --frozen-lockfile
```

No data migration is involved — the rollback is purely code and lockfile.

---

## Done criteria

The migration is considered verified when:

- [ ] §1–§5 all pass locally.
- [ ] §6 route-walk reports 200 for every URL in `contracts/routes.md`.
- [ ] §7 Lighthouse comparison is within tolerance.
- [ ] §8 dependency-tree assertions both pass.
- [ ] No `@remix-run/*` strings remain anywhere in `docs/` source (verify with `grep -rE '@(remix-run|vercel/remix)' docs/app docs/vite.config.mts docs/env.d.ts` returning empty).
- [ ] No Feedback-module references remain (verify with `grep -rE 'Feedback|/api/feedback|@supabase' docs/app docs/scripts` returning empty; the directory `docs/app/components/Feedback/` no longer exists).
