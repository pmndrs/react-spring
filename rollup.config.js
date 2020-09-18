import fs from 'fs-extra'
import path from 'path'
import { crawl } from 'recrawl-sync'

import dts from 'rollup-plugin-dts'
import babel from '@rollup/plugin-babel'
import esbuild from 'rollup-plugin-esbuild'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

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

const getBundleConfig = ({
  input = 'src/index.ts',
  output = 'dist/index.js',
  sourcemap = true,
  sourcemapExcludeSources = true,
  sourceRoot = path.dirname(input),
} = {}) => ({
  input,
  output,
  sourcemap,
  sourcemapExcludeSources,
  sourceRoot,
})

export const bundle = config => {
  config = getBundleConfig(config)
  return [
    esmBundle(config),
    cjsBundle(config),
    dtsBundle(config, 'es'), //
  ]
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
  plugins: [esbuild({ target: 'es2018' })],
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
  plugins: [esbuild({ target: 'es2018' })],
})

// Used for the ".umd" bundle
const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'prop-types': 'PropTypes',
  'react-spring': 'ReactSpring',
}

export const umdBundle = (name, config) => {
  config = getBundleConfig(config)
  return {
    input: config.input,
    output: {
      file: config.output.replace(/\.js$/, '.umd.js'),
      format: 'umd',
      name,
      globals,
    },
    external: Object.keys(globals),
    plugins: [
      resolve({ extensions: ['.js', '.ts', '.tsx'] }),
      commonjs({ include: /node_modules/ }),
      esbuild({ target: 'es2018' }),
      babel({
        presets: [['@babel/env', { targets: 'defaults' }]],
        babelHelpers: 'bundled',
      }),
    ],
  }
}

export const dtsBundle = (config, format) => ({
  input: config.input,
  output: [
    {
      file: config.output.replace(
        /\.js$/,
        (format == 'cjs' ? '.cjs' : '') + '.d.ts'
      ),
      format,
      paths: rewritePaths({
        cjs: format == 'cjs',
      }),
    },
  ],
  plugins: [dts()],
  external,
})

const pkgCache = Object.create(null)
const readPackageJson = dir =>
  pkgCache[dir] ||
  (pkgCache[dir] = fs.readJsonSync(path.join(dir, 'package.json')))

const pkg = fs.readJsonSync(path.resolve('package.json'))
const rewritePaths = (opts = {}) => {
  const deps = pkg.dependencies

  const locals = Object.entries(deps).filter(
    entry => entry[1].startsWith('link:') && (entry[1] = entry[1].slice(5))
  )
  const localPkgs = locals.reduce((pkgs, [name, version]) => {
    pkgs[name] = readPackageJson(path.resolve(version))
    return pkgs
  }, Object.create(null))

  const resolveLocal = modulePath => {
    for (const [name, version] of locals) {
      if (modulePath == name || modulePath.startsWith(name + '/')) {
        const dep = localPkgs[name]
        return modulePath.replace(name, dep.name)
      }
    }
  }

  return modulePath => {
    let depId = resolveLocal(modulePath)
    if (!depId) {
      return modulePath
    }
    if (opts.cjs) {
      const name = packageNames.find(name => name === depId)
      if (name) {
        depId = path.join(name, packages[name].main)
      }
    }
    return depId
  }
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
