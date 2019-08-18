import fs from 'fs-extra'
import path from 'path'
import { crawl } from 'recrawl-sync'

import ts from 'rollup-plugin-typescript2'
import dts from 'rollup-plugin-dts'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import { terser } from 'rollup-plugin-terser'

const root = process.platform === 'win32' ? path.resolve('/') : '/'
const external = id => !id.startsWith('.') && !id.startsWith(root)
const extensions = ['.tsx', '.ts', '.js']
const packages = readPackages()
const packageNames = Object.keys(packages)

// Every module in the "input" directory gets its own bundle.
export const multiBundle = ({
  input = 'src',
  output = 'dist',
  ...config
} = {}) =>
  fs.readdirSync(input).reduce(
    (configs, file) =>
      configs.concat(
        bundle({
          input: path.join(input, file),
          output: path.join(output, file.replace(/\.tsx?$/, '.js')),
          ...config,
        })
      ),
    []
  )

export const bundle = ({
  input = 'src/index.ts',
  output = 'dist/index.js',
  minify = false,
  sourcemap = true,
  sourcemapExcludeSources = true,
  sourceRoot = path.dirname(input),
} = {}) => {
  const config = {
    input,
    output,
    minify,
    sourcemap,
    sourcemapExcludeSources,
    sourceRoot,
  }
  return [esmBundle(config), cjsBundle(config), dtsBundle(config)]
}

export const esmBundle = config => ({
  input: config.input,
  output: {
    file: config.output,
    format: 'esm',
    paths: rewritePaths(),
    sourcemap: config.sourcemap,
    sourcemapPathTransform: rewriteSourcePaths(config),
    sourcemapExcludeSources: config.sourcemapExcludeSources,
  },
  external,
  plugins: [
    resolve({ extensions }),
    ts({ check: false }),
    babel(
      getBabelOptions(
        { useESModules: true },
        '>1%, not dead, not ie 11, not op_mini all'
      )
    ),
    config.minify && terser(),
  ],
})

export const cjsBundle = config => ({
  input: config.input,
  output: {
    file: config.output.replace(/\.js$/, '.cjs.js'),
    format: 'cjs',
    paths: rewritePaths({ cjs: true }),
    sourcemap: config.sourcemap,
    sourcemapPathTransform: rewriteSourcePaths(config),
    sourcemapExcludeSources: config.sourcemapExcludeSources,
  },
  external,
  plugins: [
    resolve({ extensions }),
    ts({ check: false }),
    babel(getBabelOptions({ useESModules: false })),
    config.minify && terser(),
  ],
})

export const dtsBundle = config => ({
  input: config.input,
  output: [
    {
      file: config.output.replace(/\.js$/, '.d.ts'),
      format: 'es',
      paths: rewritePaths(),
    },
  ],
  plugins: [dts()],
  external,
})

const babelExtensions = [
  ...require('@babel/core').DEFAULT_EXTENSIONS,
  'ts',
  'tsx',
]

export const getBabelOptions = ({ useESModules }, targets) => ({
  babelrc: false,
  exclude: '**/node_modules/**',
  extensions: babelExtensions,
  runtimeHelpers: true,
  presets: [
    ['@babel/preset-env', { loose: true, modules: false, targets }],
    '@babel/preset-react',
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { loose: true }],
    ['@babel/plugin-transform-runtime', { regenerator: false, useESModules }],
  ],
})

const rewritePaths = (opts = {}) => modulePath => {
  if (modulePath.startsWith('shared')) {
    return '@react-spring/' + modulePath
  }
  if (opts.cjs) {
    const name = packageNames.find(name => name === modulePath)
    if (name) return path.join(name, packages[name].main)
  }
  return modulePath
}

const rewriteSourcePaths = config => {
  const outToIn = path.relative(
    path.dirname(config.output),
    path.dirname(config.input)
  )
  return file =>
    path.join(config.sourceRoot || '', path.relative(outToIn, file))
}

function readPackages() {
  return crawl('.', {
    only: ['dist/package.json'],
    ignore: ['node_modules'],
  }).reduce((packages, jsonPath) => {
    const json = fs.readJsonSync(jsonPath)
    packages[json.name] = json
    return packages
  }, {})
}
