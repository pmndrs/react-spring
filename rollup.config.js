const path = require('path')
const yargs = require('yargs')
const babel = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const { uglify } = require('rollup-plugin-uglify')
const { sizeSnapshot } = require('rollup-plugin-size-snapshot')

const DEFAULT_TARGET = 'web'

const toArray = val => (val == null ? val : Array.isArray(val) ? val : [val])
const isFalse = arg => /^(0|false)$/.test(arg)

// Use the --only and --not flags to control which targets are built.
let targets = ['web', 'native', 'universal', 'konva', 'three']

/**
 * Arguments
 */

const argv = { ...yargs.argv }
for (const key in argv) {
  // Rename any flags ignored by Rollup
  if (key.startsWith('config-')) {
    argv[key.slice(7)] = argv[key]
  }
}

argv.only = toArray(argv.only)
if (argv.only) {
  targets = targets.filter(target => argv.only.includes(target))
}

argv.not = toArray(argv.not)
if (argv.not) {
  targets = targets.filter(target => !argv.not.includes(target))
}

argv.cookbook = !argv.only && !isFalse(argv.cookbook)
argv.renderprops = !argv.only && !isFalse(argv.renderprops)

/**
 * Rollup configuration
 */

const root = process.platform === 'win32' ? path.resolve('/') : '/'
const external = id => !id.startsWith('.') && !id.startsWith(root)
const extensions = ['.js', '.jsx', '.ts', '.tsx']

const getBabelOptions = ({ useESModules }, targets) => ({
  babelrc: false,
  extensions,
  exclude: '**/node_modules/**',
  runtimeHelpers: true,
  presets: [
    ['@babel/preset-env', { loose: true, modules: false, targets }],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { loose: true }],
    ['transform-react-remove-prop-types', { removeImport: true }],
    ['@babel/transform-runtime', { regenerator: false, useESModules }],
  ],
})

function createConfig(entry, out) {
  return [
    {
      input: `./src/${entry}/index`,
      output: { file: `dist/${out}.js`, format: 'esm' },
      external,
      plugins: [
        babel(
          getBabelOptions(
            { useESModules: true },
            '>1%, not dead, not ie 11, not op_mini all'
          )
        ),
        sizeSnapshot(),
        resolve({ extensions }),
      ],
    },
    {
      input: `./src/${entry}/index`,
      output: { file: `dist/${out}.cjs.js`, format: 'cjs' },
      external,
      plugins: [
        babel(getBabelOptions({ useESModules: false })),
        sizeSnapshot(),
        resolve({ extensions }),
      ],
    },
  ]
}

function createLegacyConfig(entry, out) {
  return [
    {
      input: `./src/${entry}/index`,
      output: { file: `dist/${out}.js`, format: 'cjs' },
      external,
      plugins: [
        babel(
          getBabelOptions(
            { useESModules: true },
            '>1%, not dead, not ie 11, not op_mini all'
          )
        ),
        sizeSnapshot(),
        resolve({ extensions }),
      ],
    },
    {
      input: `./src/${entry}/index`,
      output: { file: `dist/${out}.cjs.js`, format: 'cjs' },
      external,
      plugins: [
        babel(getBabelOptions({ useESModules: false })),
        sizeSnapshot(),
        resolve({ extensions }),
      ],
    },
  ]
}

// Apply an array of objects to an `Object.assign` call
const flatten = (arr, out = []) => {
  arr.forEach(val => {
    if (val == null) return
    if (Array.isArray(val)) flatten(val, out)
    else out.push(val)
  })
  return out
}

// Map an array and pass it to `merge`
const flatMap = (arr, mapper) => flatten(arr.map(mapper))

// Filter an array to remove the given values
const without = (arr, ...args) => arr.filter(val => !args.includes(val))

export default [
  ...flatMap(targets, target => createConfig('targets/' + target, target)),
  /**
   * react-spring/renderprops
   */
  ...(argv.renderprops !== false
    ? flatMap(without(targets, 'three').concat('addons'), target =>
        createLegacyConfig(
          'renderprops/' + (target === 'addons' ? '' : 'targets/') + target,
          'renderprops' + (target === DEFAULT_TARGET ? '' : '-' + target)
        )
      )
    : []),
  /**
   * react-spring/cookbook
   */
  ...(argv.cookbook !== false
    ? [
        {
          input: `./src/targets/cookbook/index`,
          output: { file: `dist/cookbook.js`, format: 'esm' },
          external,
          plugins: [
            babel(
              getBabelOptions(
                { useESModules: true },
                '>1%, not dead, not ie 11, not op_mini all'
              )
            ),
            resolve({ extensions }),
          ],
        },
      ]
    : []),
]
