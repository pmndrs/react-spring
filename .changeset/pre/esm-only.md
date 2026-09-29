---
'@react-spring/web': major
---

refactor!: ship ESM-only builds

Every package now publishes a single modern ESM bundle (`dist/<name>.modern.mjs`) and drops its CommonJS output, the Webpack 4 `legacy-esm` fallback, and the orphaned pre-compiled dev/prod variants.

ESM consumers (Vite, webpack 5, Next, esbuild, Bun, Deno, native Node ESM) are unaffected. CommonJS consumers must migrate to ESM or run on Node ≥22.12, where `require()` of an ESM package is supported. Webpack 4 is no longer supported.
