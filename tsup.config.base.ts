import type { Options } from 'tsup'
import fs from 'fs'
import path from 'path'

interface BuildOptions {
  format: 'cjs' | 'umd' | 'esm'
  name:
    | 'development'
    | 'production.min'
    | 'legacy-esm'
    | 'modern'
    | 'modern.development'
    | 'modern.production.min'
    | 'umd'
    | 'umd.min'
  minify: boolean
  env: 'development' | 'production' | ''
  target?:
    | 'es2017'
    | 'es2018'
    | 'es2019'
    | 'es2020'
    | 'es2021'
    | 'es2022'
    | 'esnext'
  dts?: boolean
}

const buildTargets: BuildOptions[] = [
  {
    format: 'cjs',
    name: 'development',
    target: 'es2020',
    minify: false,
    env: 'development',
  },
  {
    format: 'cjs',
    name: 'production.min',
    target: 'es2020',
    minify: true,
    env: 'production',
  },
  // ESM, embedded `process`: modern Webpack dev
  {
    format: 'esm',
    name: 'modern',
    target: 'es2020',
    minify: false,
    env: '',
    dts: true,
  },
  // ESM, embedded `process`: fallback for Webpack 4,
  // which doesn't support `exports` field or optional chaining
  {
    format: 'esm',
    name: 'legacy-esm',
    target: 'es2020',
    minify: false,
    env: '',
  },
  // ESM, pre-compiled "dev": browser development
  {
    format: 'esm',
    name: 'modern.development',
    target: 'es2020',
    minify: false,
    env: 'development',
  },
  // ESM, pre-compiled "prod": browser prod
  {
    format: 'esm',
    name: 'modern.production.min',
    target: 'es2020',
    minify: true,
    env: 'production',
  },
]

function writeCommonJSEntry(folder: string, prefix: string) {
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

interface ConfigOptions {
  name: string
  entry: string
}

export const defaultConfig = (
  { name: prefix, entry }: ConfigOptions,
  options: Options
): Options[] => {
  const artifactOptions: Options[] = buildTargets.map(
    ({ format, minify, env, name, target, dts }) => {
      const outputFilename = `${prefix}.${name}`

      const folderSegments = ['dist']
      if (format === 'cjs') {
        folderSegments.push('cjs')
      }

      const outputFolder = path.join(...folderSegments)

      const extension =
        name === 'legacy-esm' ? '.js' : format === 'esm' ? '.mjs' : '.cjs'

      const defineValues: Record<string, string> = {}

      if (env) {
        Object.assign(defineValues, {
          'process.env.NODE_ENV': JSON.stringify(env),
        })
      }

      return {
        entry: {
          [outputFilename]: entry,
        },
        dts,
        format,
        outDir: outputFolder,
        target,
        outExtension: () => ({ js: extension }),
        minify,
        sourcemap: true,
        clean: !options.watch,
        external: [
          'react',
          'react-dom',
          'react-native',
          '@react-three/fiber',
          'three',
          'react-konva',
          'konva',
          'react-zdog',
          'zdog',
        ],
        esbuildOptions(options) {
          // Needed to prevent auto-replacing of process.env.NODE_ENV in all builds
          options.platform = 'neutral'
          // Needed to return to normal lookup behavior when platform: 'neutral'
          options.mainFields = ['browser', 'module', 'main']
          options.conditions = ['browser']
        },

        define: defineValues,
        async onSuccess() {
          if (format === 'cjs' && name === 'production.min') {
            writeCommonJSEntry(outputFolder, prefix)
          }
        },
      }
    }
  )

  return artifactOptions
}
