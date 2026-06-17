// @ts-check

/**
 * @typedef {object} ConfigOptions
 * @property {string} name   — e.g. `react-spring_web`; becomes the output file prefix.
 * @property {string} entry  — source entry, e.g. `src/index.ts`.
 */

const sharedExternal = [
  'react',
  'react-dom',
  '@react-three/fiber',
  'three',
]

/**
 * Build the single modern-ESM tsdown {@link import('tsdown').UserConfig} for a
 * package. The library ships ESM only: one `dist/<prefix>.modern.mjs` bundle
 * plus its `.d.mts` types, matching the `exports` map each package pins.
 *
 * `clean` is left `false`; the package-level `build` script clears `dist/`
 * upfront so stale artefacts from a previous build don't linger.
 *
 * @param {ConfigOptions} options
 * @returns {import('tsdown').UserConfig}
 */
export const defaultConfig = ({ name: prefix, entry }) => ({
  name: `${prefix}.modern`,
  entry: { [`${prefix}.modern`]: entry },
  format: 'esm',
  outDir: 'dist',
  platform: 'neutral',
  target: 'es2020',
  minify: false,
  sourcemap: false,
  clean: false,
  hash: false,
  dts: true,
  deps: { neverBundle: sharedExternal },
  outExtensions: () => ({ js: '.mjs', dts: '.d.mts' }),
  report: false,
  // For the modern.mjs entry, rolldown hoists its `__exportAll` runtime helper
  // into a sibling `chunk.mjs`. `codeSplitting: false` does not suppress this in
  // tsdown 0.22 / rolldown 1.0; the chunk ships via each package's
  // `files: ["dist/**/*"]` and resolves as a relative import from the entry, so
  // consumers are unaffected.
  outputOptions: { codeSplitting: false },
})
