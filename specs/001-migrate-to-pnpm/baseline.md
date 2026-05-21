# Migration baseline — yarn → pnpm

**Captured**: 2026-05-21
**Branch**: `001-migrate-to-pnpm` (pre-migration state, identical to `next` for the purposes of this measurement)
**Node**: v24.12.0 (locally; CI uses 18.x/20.x)
**Yarn**: 3.8.7 (Berry, `nodeLinker: node-modules`)

This file is the comparator for SC-001 / SC-002 / SC-003 / SC-005. It is consumed by tasks.md T033–T035, T055, T059, T063, T064. The `baseline/` directory of tarballs is consumed by T059 and deleted in T065; this file survives the merge as the audit trail.

## Methodology

- **Local measurements** are taken with `/usr/bin/time -p` on `node_modules` deleted but yarn cache (`.yarn/cache/`) warm. This mirrors the day-to-day developer state and matches a CI run with `cache: 'yarn'` warm.
- **CI cold/warm** measurements are captured later (T055, T064) from GitHub Actions wall-clock timings, not from this file.
- Bundle-output diffs (T059) compare the file list and the `name`, `version`, `exports`, `main`, `module`, `types`, `files` fields of each `package.json` inside the tarball. Whitespace and ordering inside generated metadata are tolerated per spec SC-005.

## Published workspaces (12)

| Workspace                | Package name             |
| ------------------------ | ------------------------ |
| `packages/animated/`     | `@react-spring/animated` |
| `packages/core/`         | `@react-spring/core`     |
| `packages/parallax/`     | `@react-spring/parallax` |
| `packages/rafz/`         | `@react-spring/rafz`     |
| `packages/react-spring/` | `react-spring`           |
| `packages/shared/`       | `@react-spring/shared`   |
| `packages/types/`        | `@react-spring/types`    |
| `targets/konva/`         | `@react-spring/konva`    |
| `targets/native/`        | `@react-spring/native`   |
| `targets/three/`         | `@react-spring/three`    |
| `targets/web/`           | `@react-spring/web`      |
| `targets/zdog/`          | `@react-spring/zdog`     |

Private workspaces (excluded from pack diff per FR-015): `eslint-config-react-spring`, `@react-spring/mock-raf`, `@react-spring/demo`, `@react-spring/docs`.

## Local timings (yarn, warm cache)

| Step                                                        | Wall-clock (s) | Command                                     | Notes                                                                                                                                        |
| ----------------------------------------------------------- | -------------- | ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Install (`rm -rf node_modules && yarn install --immutable`) | **16.07**      | `/usr/bin/time -p yarn install --immutable` | Warm yarn cache; cold node_modules. Built deps: `cypress`, `esbuild`, `@swc/core`, `@parcel/watcher`, `es5-ext`, root workspace postinstall. |
| Build (`yarn build-ci`)                                     | **15.97**      | `/usr/bin/time -p yarn build-ci`            | Excludes `@react-spring/docs` per script body. 12 packages, no turbo cache hits.                                                             |
| Type-check (`yarn test:ts`)                                 | **2.81**       | `/usr/bin/time -p yarn test:ts`             | `tsc --noEmit` repo-wide. Likely benefits from a warm tsbuildinfo cache.                                                                     |
| Unit tests (`yarn test:unit`)                               | **5.85**       | `/usr/bin/time -p yarn test:unit`           | Jest, source-mapped via `moduleNameMapper`. 16 suites, 202 tests + 17 snapshots passed.                                                      |

## Local timings (pnpm, warm cache) — populated post-migration

| Step                                                                                                    | Wall-clock (s) | vs yarn (×)                             | Source task | SC verified |
| ------------------------------------------------------------------------------------------------------- | -------------- | --------------------------------------- | ----------- | ----------- |
| Install (`pnpm install --frozen-lockfile`)                                                              | **3.50**       | 0.22×                                   | T031        | SC-001      |
| Build (`pnpm build-ci`)                                                                                 | **7.52** warm  | 0.47×                                   | T033        | SC-001      |
| Build (`pnpm build`, incl. docs)                                                                        | **7.76**       | n/a (yarn baseline excludes docs)       | T058        | SC-001      |
| Type-check (`pnpm test:ts`)                                                                             | **2.76**       | 0.98×                                   | T034        | SC-001      |
| Unit tests (`pnpm test:unit`)                                                                           | **5.85**       | 1.00×                                   | T035        | SC-001      |
| Clean → install → build-ci → ts → unit (full chain)                                                     | **20.6** total | n/a (no yarn-side end-to-end record)    | T058        | SC-001      |
| End-to-end clean-clone: install --frozen-lockfile → build-ci → test:ts → test:unit → package → test:e2e | **52.3** total | n/a (yarn baseline excluded pack + e2e) | T063        | SC-001      |

## CI install timings (populated by T055 / T064)

Job-level wall-clock from GitHub Actions. The yarn baseline is the most recent
green CI run on `next` (commit `61a9853`, 2026-01-23). The pnpm column is the
average of the two most recent green CI runs on this branch (`8149739d` fix-ci
and `ccc333fa` US3+US4).

| Job                            | yarn (warm) | pnpm (warm) | Δ        |
| ------------------------------ | ----------- | ----------- | -------- |
| `Build (20.x)`                 | 107.0s      | 88.0s       | **−18%** |
| `Test:unit (20.x)`             | 97.0s       | 74.5s       | **−23%** |
| `Test:types (TS 5.0)`          | 118.0s      | 86.0s       | **−27%** |
| `Test:types (TS 5.1)`          | 109.0s      | 87.5s       | **−20%** |
| `Test:types (TS 5.2)`          | 119.0s      | 82.5s       | **−31%** |
| `Test:publish (cra5)`          | 79.0s       | 42.5s       | **−46%** |
| `Test:publish (next)`          | 74.0s       | 40.0s       | **−46%** |
| `Test:publish (vite)`          | 52.0s       | 19.0s       | **−63%** |
| `Test:publish (node-standard)` | 22.0s       | 13.5s       | **−39%** |
| `Test:publish (node-esm)`      | 22.0s       | 14.5s       | **−34%** |
| `are-the-types-wrong (18.x)`   | 14.0s       | 12.0s       | **−14%** |
| `Check for changes`            | 6.0s        | 6.5s        | even     |

All pnpm-side jobs are within or under the SC-002 budget (≤ 110% of yarn cold)
and SC-003 budget (≤ yarn warm). The CI install step alone is not separable
from the job total in the GitHub Actions API without parsing per-step
timestamps; the job-level durations above are sufficient evidence for the SCs.

## Per-package pack baseline (populated by T001)

For each published workspace, `yarn pack` is run inside the workspace and the resulting `package.tgz` is copied to `specs/001-migrate-to-pnpm/baseline/<workspace>.tgz`. The tables below record:

- `time(s)` — wall-clock of `yarn pack`.
- `files` — count of files in the tarball.
- `name@version` — from the bundled `package.json`.

| Workspace                | time (s) | files | name@version                    |
| ------------------------ | -------- | ----- | ------------------------------- |
| `packages/animated/`     | 0.24     | 12    | `@react-spring/animated@10.0.3` |
| `packages/core/`         | 0.24     | 12    | `@react-spring/core@10.0.3`     |
| `packages/parallax/`     | 0.21     | 13    | `@react-spring/parallax@10.0.3` |
| `packages/rafz/`         | 0.21     | 12    | `@react-spring/rafz@10.0.3`     |
| `packages/react-spring/` | 0.21     | 12    | `react-spring@10.0.3`           |
| `packages/shared/`       | 0.22     | 12    | `@react-spring/shared@10.0.3`   |
| `packages/types/`        | 0.21     | 11    | `@react-spring/types@10.0.3`    |
| `targets/konva/`         | 0.23     | 12    | `@react-spring/konva@10.0.3`    |
| `targets/native/`        | 0.21     | 7     | `@react-spring/native@10.0.3`   |
| `targets/three/`         | 0.24     | 12    | `@react-spring/three@10.0.3`    |
| `targets/web/`           | 0.20     | 12    | `@react-spring/web@10.0.3`      |
| `targets/zdog/`          | 0.21     | 12    | `@react-spring/zdog@10.0.3`     |

Detailed per-tarball file lists and key `package.json` fields are recorded below under "Pack manifests".

## Pack equivalence (populated by T059, post-migration)

| Workspace                | pnpm pack files | Δ vs baseline file list                     | Δ vs baseline key fields | Verdict |
| ------------------------ | --------------- | ------------------------------------------- | ------------------------ | ------- |
| `packages/animated/`     | 12              | match                                       | match                    | ✅ PASS |
| `packages/core/`         | 12              | match                                       | match                    | ✅ PASS |
| `packages/parallax/`     | 12              | −1 / +0 (missing: `package/test/README.md`) | match                    | ⚠️ DIFF |
| `packages/rafz/`         | 12              | match                                       | match                    | ✅ PASS |
| `packages/react-spring/` | 12              | match                                       | match                    | ✅ PASS |
| `packages/shared/`       | 12              | match                                       | match                    | ✅ PASS |
| `packages/types/`        | 11              | match                                       | match                    | ✅ PASS |
| `targets/konva/`         | 12              | match                                       | match                    | ✅ PASS |
| `targets/native/`        | 7               | match                                       | match                    | ✅ PASS |
| `targets/three/`         | 12              | match                                       | match                    | ✅ PASS |
| `targets/web/`           | 12              | match                                       | match                    | ✅ PASS |
| `targets/zdog/`          | 12              | match                                       | match                    | ✅ PASS |

Details: see `baseline/_pack-diff.json` (also committed). The single ⚠️ DIFF for `parallax` is a pre-migration yarn over-inclusion bug: `yarn pack` shipped `package/test/README.md` even though `packages/parallax/package.json` declares `files: ["dist/**/*", "README.md", "LICENSE"]`. `pnpm pack` respects the `files` field strictly and excludes it. Net effect: pnpm ships one fewer file (an internal test doc), no functional change for consumers.

## Pack manifests

_(populated by T001 — full file list + key fields per tarball below)_

---

<!-- T001 will append per-workspace manifest sections here -->

### `packages/animated/` → `baseline/animated.tgz`

**name@version**: `@react-spring/animated@10.0.3`  
**file count**: 12  
**tarball bytes**: 10,003

**Key `package.json` fields**:

```json
{
  "exports": {
    ".": {
      "import": {
        "default": "./dist/react-spring_animated.modern.mjs",
        "types": "./dist/react-spring_animated.modern.d.mts"
      },
      "require": {
        "default": "./dist/cjs/index.js",
        "types": "./dist/cjs/react-spring_animated.development.d.ts"
      }
    },
    "./package.json": "./package.json"
  },
  "files": ["dist/**/*", "README.md", "LICENSE"],
  "main": "./dist/cjs/index.js",
  "module": "./dist/react-spring_animated.legacy-esm.js",
  "name": "@react-spring/animated",
  "types": "./dist/react-spring_animated.modern.d.mts",
  "version": "10.0.3"
}
```

**Files**:

```
package/LICENSE
package/README.md
package/dist/cjs/index.js
package/dist/cjs/react-spring_animated.development.cjs
package/dist/cjs/react-spring_animated.development.d.ts
package/dist/cjs/react-spring_animated.production.min.cjs
package/dist/react-spring_animated.legacy-esm.js
package/dist/react-spring_animated.modern.d.mts
package/dist/react-spring_animated.modern.development.mjs
package/dist/react-spring_animated.modern.mjs
package/dist/react-spring_animated.modern.production.min.mjs
package/package.json
```

---

### `packages/core/` → `baseline/core.tgz`

**name@version**: `@react-spring/core@10.0.3`  
**file count**: 12  
**tarball bytes**: 119,760

**Key `package.json` fields**:

```json
{
  "exports": {
    ".": {
      "import": {
        "default": "./dist/react-spring_core.modern.mjs",
        "types": "./dist/react-spring_core.modern.d.mts"
      },
      "require": {
        "default": "./dist/cjs/index.js",
        "types": "./dist/cjs/react-spring_core.development.d.ts"
      }
    },
    "./package.json": "./package.json"
  },
  "files": ["dist/**/*", "README.md", "LICENSE"],
  "main": "./dist/cjs/index.js",
  "module": "./dist/react-spring_core.legacy-esm.js",
  "name": "@react-spring/core",
  "types": "./dist/react-spring_core.modern.d.mts",
  "version": "10.0.3"
}
```

**Files**:

```
package/LICENSE
package/README.md
package/dist/cjs/index.js
package/dist/cjs/react-spring_core.development.cjs
package/dist/cjs/react-spring_core.development.d.ts
package/dist/cjs/react-spring_core.production.min.cjs
package/dist/react-spring_core.legacy-esm.js
package/dist/react-spring_core.modern.d.mts
package/dist/react-spring_core.modern.development.mjs
package/dist/react-spring_core.modern.mjs
package/dist/react-spring_core.modern.production.min.mjs
package/package.json
```

---

### `packages/parallax/` → `baseline/parallax.tgz`

**name@version**: `@react-spring/parallax@10.0.3`  
**file count**: 13  
**tarball bytes**: 10,665

**Key `package.json` fields**:

```json
{
  "exports": {
    ".": {
      "import": {
        "default": "./dist/react-spring_parallax.modern.mjs",
        "types": "./dist/react-spring_parallax.modern.d.mts"
      },
      "require": {
        "default": "./dist/cjs/index.js",
        "types": "./dist/cjs/react-spring_parallax.development.d.ts"
      }
    },
    "./package.json": "./package.json"
  },
  "files": ["dist/**/*", "README.md", "LICENSE"],
  "main": "./dist/cjs/index.js",
  "module": "./dist/react-spring_parallax.legacy-esm.js",
  "name": "@react-spring/parallax",
  "types": "./dist/react-spring_parallax.modern.d.mts",
  "version": "10.0.3"
}
```

**Files**:

```
package/LICENSE
package/README.md
package/dist/cjs/index.js
package/dist/cjs/react-spring_parallax.development.cjs
package/dist/cjs/react-spring_parallax.development.d.ts
package/dist/cjs/react-spring_parallax.production.min.cjs
package/dist/react-spring_parallax.legacy-esm.js
package/dist/react-spring_parallax.modern.d.mts
package/dist/react-spring_parallax.modern.development.mjs
package/dist/react-spring_parallax.modern.mjs
package/dist/react-spring_parallax.modern.production.min.mjs
package/package.json
package/test/README.md
```

---

### `packages/rafz/` → `baseline/rafz.tgz`

**name@version**: `@react-spring/rafz@10.0.3`  
**file count**: 12  
**tarball bytes**: 6,912

**Key `package.json` fields**:

```json
{
  "exports": {
    ".": {
      "import": {
        "default": "./dist/react-spring_rafz.modern.mjs",
        "types": "./dist/react-spring_rafz.modern.d.mts"
      },
      "require": {
        "default": "./dist/cjs/index.js",
        "types": "./dist/cjs/react-spring_rafz.development.d.ts"
      }
    },
    "./package.json": "./package.json"
  },
  "files": ["dist/**/*", "README.md", "LICENSE"],
  "main": "./dist/cjs/index.js",
  "module": "./dist/react-spring_rafz.legacy-esm.js",
  "name": "@react-spring/rafz",
  "types": "./dist/react-spring_rafz.modern.d.mts",
  "version": "10.0.3"
}
```

**Files**:

```
package/LICENSE
package/README.md
package/dist/cjs/index.js
package/dist/cjs/react-spring_rafz.development.cjs
package/dist/cjs/react-spring_rafz.development.d.ts
package/dist/cjs/react-spring_rafz.production.min.cjs
package/dist/react-spring_rafz.legacy-esm.js
package/dist/react-spring_rafz.modern.d.mts
package/dist/react-spring_rafz.modern.development.mjs
package/dist/react-spring_rafz.modern.mjs
package/dist/react-spring_rafz.modern.production.min.mjs
package/package.json
```

---

### `packages/react-spring/` → `baseline/react-spring.tgz`

**name@version**: `react-spring@10.0.3`  
**file count**: 12  
**tarball bytes**: 3,841

**Key `package.json` fields**:

```json
{
  "exports": {
    ".": {
      "import": {
        "default": "./dist/react-spring.modern.mjs",
        "types": "./dist/react-spring.modern.d.mts"
      },
      "require": {
        "default": "./dist/cjs/index.js",
        "types": "./dist/cjs/react-spring.development.d.ts"
      }
    },
    "./package.json": "./package.json"
  },
  "files": ["dist/**/*", "README.md", "LICENSE"],
  "main": "./dist/cjs/index.js",
  "module": "./dist/react-spring.legacy-esm.js",
  "name": "react-spring",
  "types": "./dist/react-spring.modern.d.mts",
  "version": "10.0.3"
}
```

**Files**:

```
package/LICENSE
package/README.md
package/dist/cjs/index.js
package/dist/cjs/react-spring.development.cjs
package/dist/cjs/react-spring.development.d.ts
package/dist/cjs/react-spring.production.min.cjs
package/dist/react-spring.legacy-esm.js
package/dist/react-spring.modern.d.mts
package/dist/react-spring.modern.development.mjs
package/dist/react-spring.modern.mjs
package/dist/react-spring.modern.production.min.mjs
package/package.json
```

---

### `packages/shared/` → `baseline/shared.tgz`

**name@version**: `@react-spring/shared@10.0.3`  
**file count**: 12  
**tarball bytes**: 59,568

**Key `package.json` fields**:

```json
{
  "exports": {
    ".": {
      "import": {
        "default": "./dist/react-spring_shared.modern.mjs",
        "types": "./dist/react-spring_shared.modern.d.mts"
      },
      "require": {
        "default": "./dist/cjs/index.js",
        "types": "./dist/cjs/react-spring_shared.development.d.ts"
      }
    },
    "./package.json": "./package.json"
  },
  "files": ["dist/**/*", "README.md", "LICENSE"],
  "main": "./dist/cjs/index.js",
  "module": "./dist/react-spring_shared.legacy-esm.js",
  "name": "@react-spring/shared",
  "types": "./dist/react-spring_shared.modern.d.mts",
  "version": "10.0.3"
}
```

**Files**:

```
package/LICENSE
package/README.md
package/dist/cjs/index.js
package/dist/cjs/react-spring_shared.development.cjs
package/dist/cjs/react-spring_shared.development.d.ts
package/dist/cjs/react-spring_shared.production.min.cjs
package/dist/react-spring_shared.legacy-esm.js
package/dist/react-spring_shared.modern.d.mts
package/dist/react-spring_shared.modern.development.mjs
package/dist/react-spring_shared.modern.mjs
package/dist/react-spring_shared.modern.production.min.mjs
package/package.json
```

---

### `packages/types/` → `baseline/types.tgz`

**name@version**: `@react-spring/types@10.0.3`  
**file count**: 11  
**tarball bytes**: 4,673

**Key `package.json` fields**:

```json
{
  "exports": {
    ".": {
      "import": {
        "default": "./dist/react-spring_types.modern.mjs",
        "types": "./dist/react-spring_types.modern.d.mts"
      },
      "require": {
        "default": "./dist/cjs/index.js",
        "types": "./dist/cjs/react-spring_types.development.d.ts"
      }
    },
    "./package.json": "./package.json"
  },
  "files": ["dist/**/*", "README.md", "LICENSE"],
  "main": "./dist/cjs/index.js",
  "module": "./dist/react-spring_types.legacy-esm.js",
  "name": "@react-spring/types",
  "types": "./dist/react-spring_types.modern.d.mts",
  "version": "10.0.3"
}
```

**Files**:

```
package/LICENSE
package/dist/cjs/index.js
package/dist/cjs/react-spring_types.development.cjs
package/dist/cjs/react-spring_types.development.d.ts
package/dist/cjs/react-spring_types.production.min.cjs
package/dist/react-spring_types.legacy-esm.js
package/dist/react-spring_types.modern.d.mts
package/dist/react-spring_types.modern.development.mjs
package/dist/react-spring_types.modern.mjs
package/dist/react-spring_types.modern.production.min.mjs
package/package.json
```

---

### `targets/konva/` → `baseline/konva.tgz`

**name@version**: `@react-spring/konva@10.0.3`  
**file count**: 12  
**tarball bytes**: 3,844

**Key `package.json` fields**:

```json
{
  "exports": {
    ".": {
      "import": {
        "default": "./dist/react-spring_konva.modern.mjs",
        "types": "./dist/react-spring_konva.modern.d.mts"
      },
      "require": {
        "default": "./dist/cjs/index.js",
        "types": "./dist/cjs/react-spring_konva.development.d.ts"
      }
    },
    "./package.json": "./package.json"
  },
  "files": ["dist/**/*", "README.md", "LICENSE"],
  "main": "./dist/cjs/index.js",
  "module": "./dist/react-spring_konva.legacy-esm.js",
  "name": "@react-spring/konva",
  "types": "./dist/react-spring_konva.modern.d.mts",
  "version": "10.0.3"
}
```

**Files**:

```
package/LICENSE
package/README.md
package/dist/cjs/index.js
package/dist/cjs/react-spring_konva.development.cjs
package/dist/cjs/react-spring_konva.development.d.ts
package/dist/cjs/react-spring_konva.production.min.cjs
package/dist/react-spring_konva.legacy-esm.js
package/dist/react-spring_konva.modern.d.mts
package/dist/react-spring_konva.modern.development.mjs
package/dist/react-spring_konva.modern.mjs
package/dist/react-spring_konva.modern.production.min.mjs
package/package.json
```

---

### `targets/native/` → `baseline/native.tgz`

**name@version**: `@react-spring/native@10.0.3`  
**file count**: 7  
**tarball bytes**: 4,328

**Key `package.json` fields**:

```json
{
  "exports": {
    ".": {
      "default": "./dist/cjs/index.js",
      "types": "./dist/cjs/react-spring_native.development.d.ts"
    },
    "./package.json": "./package.json"
  },
  "files": ["dist/**/*", "README.md", "LICENSE"],
  "main": "./dist/cjs/index.js",
  "module": "./dist/react-spring_native.legacy-esm.js",
  "name": "@react-spring/native",
  "types": "./dist/react-spring_native.modern.d.mts",
  "version": "10.0.3"
}
```

**Files**:

```
package/LICENSE
package/README.md
package/dist/cjs/index.js
package/dist/cjs/react-spring_native.development.cjs
package/dist/cjs/react-spring_native.development.d.ts
package/dist/cjs/react-spring_native.production.min.cjs
package/package.json
```

---

### `targets/three/` → `baseline/three.tgz`

**name@version**: `@react-spring/three@10.0.3`  
**file count**: 12  
**tarball bytes**: 4,221

**Key `package.json` fields**:

```json
{
  "exports": {
    ".": {
      "import": {
        "default": "./dist/react-spring_three.modern.mjs",
        "types": "./dist/react-spring_three.modern.d.mts"
      },
      "require": {
        "default": "./dist/cjs/index.js",
        "types": "./dist/cjs/react-spring_three.development.d.ts"
      }
    },
    "./package.json": "./package.json"
  },
  "files": ["dist/**/*", "README.md", "LICENSE"],
  "main": "./dist/cjs/index.js",
  "module": "./dist/react-spring_three.legacy-esm.js",
  "name": "@react-spring/three",
  "types": "./dist/react-spring_three.modern.d.mts",
  "version": "10.0.3"
}
```

**Files**:

```
package/LICENSE
package/README.md
package/dist/cjs/index.js
package/dist/cjs/react-spring_three.development.cjs
package/dist/cjs/react-spring_three.development.d.ts
package/dist/cjs/react-spring_three.production.min.cjs
package/dist/react-spring_three.legacy-esm.js
package/dist/react-spring_three.modern.d.mts
package/dist/react-spring_three.modern.development.mjs
package/dist/react-spring_three.modern.mjs
package/dist/react-spring_three.modern.production.min.mjs
package/package.json
```

---

### `targets/web/` → `baseline/web.tgz`

**name@version**: `@react-spring/web@10.0.3`  
**file count**: 12  
**tarball bytes**: 10,130

**Key `package.json` fields**:

```json
{
  "exports": {
    ".": {
      "import": {
        "default": "./dist/react-spring_web.modern.mjs",
        "types": "./dist/react-spring_web.modern.d.mts"
      },
      "require": {
        "default": "./dist/cjs/index.js",
        "types": "./dist/cjs/react-spring_web.development.d.ts"
      }
    },
    "./package.json": "./package.json"
  },
  "files": ["dist/**/*", "README.md", "LICENSE"],
  "main": "./dist/cjs/index.js",
  "module": "./dist/react-spring_web.legacy-esm.js",
  "name": "@react-spring/web",
  "types": "./dist/react-spring_web.modern.d.mts",
  "version": "10.0.3"
}
```

**Files**:

```
package/LICENSE
package/README.md
package/dist/cjs/index.js
package/dist/cjs/react-spring_web.development.cjs
package/dist/cjs/react-spring_web.development.d.ts
package/dist/cjs/react-spring_web.production.min.cjs
package/dist/react-spring_web.legacy-esm.js
package/dist/react-spring_web.modern.d.mts
package/dist/react-spring_web.modern.development.mjs
package/dist/react-spring_web.modern.mjs
package/dist/react-spring_web.modern.production.min.mjs
package/package.json
```

---

### `targets/zdog/` → `baseline/zdog.tgz`

**name@version**: `@react-spring/zdog@10.0.3`  
**file count**: 12  
**tarball bytes**: 4,121

**Key `package.json` fields**:

```json
{
  "exports": {
    ".": {
      "import": {
        "default": "./dist/react-spring_zdog.modern.mjs",
        "types": "./dist/react-spring_zdog.modern.d.mts"
      },
      "require": {
        "default": "./dist/cjs/index.js",
        "types": "./dist/cjs/react-spring_zdog.development.d.ts"
      }
    },
    "./package.json": "./package.json"
  },
  "files": ["dist/**/*", "README.md", "LICENSE"],
  "main": "./dist/cjs/index.js",
  "module": "./dist/react-spring_zdog.legacy-esm.js",
  "name": "@react-spring/zdog",
  "types": "./dist/react-spring_zdog.modern.d.mts",
  "version": "10.0.3"
}
```

**Files**:

```
package/LICENSE
package/README.md
package/dist/cjs/index.js
package/dist/cjs/react-spring_zdog.development.cjs
package/dist/cjs/react-spring_zdog.development.d.ts
package/dist/cjs/react-spring_zdog.production.min.cjs
package/dist/react-spring_zdog.legacy-esm.js
package/dist/react-spring_zdog.modern.d.mts
package/dist/react-spring_zdog.modern.development.mjs
package/dist/react-spring_zdog.modern.mjs
package/dist/react-spring_zdog.modern.production.min.mjs
package/package.json
```

---
