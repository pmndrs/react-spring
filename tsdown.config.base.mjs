// @ts-check
import fs from 'node:fs'
import path from 'node:path'

/**
 * @typedef {'cjs' | 'esm'} BundleFormat
 * @typedef {'development' | 'production.min' | 'legacy-esm' | 'modern' | 'modern.development' | 'modern.production.min'} BundleName
 *
 * @typedef {object} BuildTarget
 * @property {BundleFormat} format
 * @property {BundleName} name
 * @property {boolean} minify
 * @property {'development' | 'production' | ''} env
 * @property {string} target
 * @property {boolean} dts
 *
 * @typedef {object} ConfigOptions
 * @property {string} name   — e.g. `react-spring_web`; becomes the output file prefix.
 * @property {string} entry  — source entry, e.g. `src/index.ts`.
 * @property {BundleName[]=} buildFilter
 */

/** @type {BuildTarget[]} */
const buildTargets = [
  // CJS, embedded `process`: classic webpack dev (carries the cjs `.d.ts`).
  {
    format: 'cjs',
    name: 'development',
    target: 'es2020',
    minify: false,
    env: 'development',
    dts: true,
  },
  {
    format: 'cjs',
    name: 'production.min',
    target: 'es2020',
    minify: true,
    env: 'production',
    dts: false,
  },
  // ESM, embedded `process`: modern Webpack dev (carries the canonical `.d.mts`).
  {
    format: 'esm',
    name: 'modern',
    target: 'es2020',
    minify: false,
    env: '',
    dts: true,
  },
  // ESM fallback for Webpack 4 — no `exports` field, no optional chaining.
  {
    format: 'esm',
    name: 'legacy-esm',
    target: 'es2020',
    minify: false,
    env: '',
    dts: false,
  },
  // ESM, pre-compiled "dev": browser development.
  {
    format: 'esm',
    name: 'modern.development',
    target: 'es2020',
    minify: false,
    env: 'development',
    dts: false,
  },
  // ESM, pre-compiled "prod": browser production.
  {
    format: 'esm',
    name: 'modern.production.min',
    target: 'es2020',
    minify: true,
    env: 'production',
    dts: false,
  },
]

/**
 * @param {string} folder
 * @param {string} prefix
 */
function writeCommonJSEntry(folder, prefix) {
  fs.writeFileSync(
    path.join(folder, 'index.js'),
    `'use strict'
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./${prefix}.production.min.cjs')
} else {
  module.exports = require('./${prefix}.development.cjs')
}`
  )
}

const sharedExternal = [
  'react',
  'react-dom',
  'react-native',
  '@react-three/fiber',
  'three',
  'react-konva',
  'konva',
  'react-zdog',
  'zdog',
]

/**
 * Build an array of tsdown {@link import('tsdown').UserConfig} entries that
 * mirror the artefact layout the public `exports` field of each package
 * already pins (e.g. `dist/react-spring_web.modern.mjs` +
 * `dist/cjs/react-spring_web.development.cjs`).
 *
 * `clean` is intentionally `false` on every entry — tsdown defaults to `true`
 * which would wipe earlier outputs as the next entry runs against the same
 * outDir. The package-level `build` script clears `dist/` upfront instead.
 *
 * @param {ConfigOptions} options
 * @returns {import('tsdown').UserConfig[]}
 */
export const defaultConfig = ({ name: prefix, entry, buildFilter }) =>
  buildTargets
    .filter(target => !buildFilter || buildFilter.includes(target.name))
    .map(({ format, minify, env, name, target, dts }) => {
      const outputFilename = `${prefix}.${name}`
      const outDir = format === 'cjs' ? 'dist/cjs' : 'dist'
      const jsExtension =
        name === 'legacy-esm' ? '.js' : format === 'esm' ? '.mjs' : '.cjs'
      const dtsExtension = format === 'esm' ? '.d.mts' : '.d.ts'

      /** @type {Record<string, string>} */
      const define = env
        ? { 'process.env.NODE_ENV': JSON.stringify(env) }
        : {}

      return {
        name: `${prefix}.${name}`,
        entry: { [outputFilename]: entry },
        format,
        outDir,
        platform: format === 'cjs' ? 'node' : 'neutral',
        target,
        minify,
        sourcemap: false,
        clean: false,
        hash: false,
        dts,
        deps: { neverBundle: sharedExternal },
        define,
        outExtensions: () => ({ js: jsExtension, dts: dtsExtension }),
        report: false,
        // For the modern.mjs entry, rolldown hoists its `__exportAll` runtime
        // helper into a sibling `chunk.mjs`. `codeSplitting: false` does not
        // suppress this in tsdown 0.22 / rolldown 1.0; the chunk is shipped via
        // each package's `files: ["dist/**/*"]` and resolved as a relative
        // import from the entry, so consumers are unaffected.
        outputOptions: { codeSplitting: false },
        async onSuccess() {
          if (format === 'cjs' && name === 'production.min') {
            writeCommonJSEntry(outDir, prefix)
          }
        },
      }
    })
