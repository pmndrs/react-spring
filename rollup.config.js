const path = require('path')
const babel = require('rollup-plugin-babel')
const resolve = require('rollup-plugin-node-resolve')
const { terser } = require('rollup-plugin-terser')
const { ts, dts } = require('rollup-plugin-dts')
const { sizeSnapshot } = require('rollup-plugin-size-snapshot')

const root = process.platform === 'win32' ? path.resolve('/') : '/'
const external = id => !id.startsWith('.') && !id.startsWith(root)

const rewritePaths = path =>
  path.startsWith('shared') ? '@react-spring/' + path : path

export const bundle = ({
  input = 'src/index.ts',
  output = 'dist/index.js',
} = {}) => [
  esmBundle(input, output),
  cjsBundle(input, output),
  dtsBundle(input, output),
]

export const esmBundle = (input, output) => ({
  input,
  output: {
    file: output,
    format: 'esm',
    sourcemap: true,
    paths: rewritePaths,
  },
  external,
  plugins: [
    resolve({
      extensions: ['.ts', '.js'],
    }),
    ts(),
    babel(
      getBabelOptions(
        { useESModules: true },
        '>1%, not dead, not ie 11, not op_mini all'
      )
    ),
    sizeSnapshot(),
    terser(),
  ],
})

export const cjsBundle = (input, output) => ({
  input,
  output: {
    file: output.replace(/\.js$/, '.cjs.js'),
    format: 'cjs',
    sourcemap: true,
    paths: rewritePaths,
  },
  external,
  plugins: [
    resolve({
      extensions: ['.ts', '.js'],
    }),
    ts(),
    babel(getBabelOptions({ useESModules: false })),
    sizeSnapshot(),
    terser(),
  ],
})

export const dtsBundle = (input, output) => ({
  input,
  output: [
    {
      file: output.replace(/\.js$/, '.d.ts'),
      format: 'es',
      paths: rewritePaths,
    },
  ],
  plugins: [dts()],
  external,
})

export const getBabelOptions = ({ useESModules }, targets) => ({
  babelrc: false,
  exclude: '**/node_modules/**',
  runtimeHelpers: true,
  presets: [
    ['@babel/preset-env', { loose: true, modules: false, targets }],
    '@babel/preset-react',
    // TODO: Use this when it can strip re-exported types!
    // '@babel/preset-typescript',
  ],
  plugins: [
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-object-rest-spread', { loose: true }],
    ['@babel/plugin-transform-runtime', { regenerator: false, useESModules }],
  ],
})
