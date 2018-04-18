import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'
import pkg from './package.json'

const getBabelOptions = ({ useESModules }) => ({
  babelrc: false,
  exclude: '**/node_modules/**',
  runtimeHelpers: true,
  presets: [
    ['@babel/preset-env', { loose: true, modules: false }],
    ['@babel/preset-stage-2', { loose: true }],
    '@babel/preset-react',
  ],
  plugins: [
    [
      '@babel/transform-runtime',
      { polyfill: false, useBuiltIns: true, useESModules },
    ],
    ['transform-react-remove-prop-types', { removeImport: true }],
  ],
})

const isExternal = id => !id.startsWith('.') && !id.startsWith('/')

const plugins = [
  babel(getBabelOptions({ useESModules: false })),
  resolve(),
  commonjs(),
  sizeSnapshot(),
  uglify({
    compress: true,
    mangle: {
      toplevel: true,
    },
  }),
]

const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'prop-types': 'PropTypes',
  'react-spring': 'ReactSpring',
}

const external = ['react', 'react-dom', 'prop-types', 'react-spring']

export default [
  {
    input: './src/index.js',
    output: { file: `${pkg.main}.js`, format: 'cjs' },
    external: isExternal,
    plugins: [babel(getBabelOptions({ useESModules: false }))],
  },

  {
    input: './src/index.js',
    output: { file: `${pkg.module}.js`, format: 'es' },
    external: isExternal,
    plugins: [babel(getBabelOptions({ useESModules: true })), sizeSnapshot()],
  },

  {
    input: './src/index.js',
    output: {
      file: `${pkg.main}.umd.js`,
      format: 'umd',
      name: 'ReactSpring',
      globals,
    },
    external,
    plugins,
  },

  {
    input: './src/addons/NumericalSpring.js',
    output: { file: 'dist/NumericalSpring.cjs.js', format: 'cjs' },
    external: isExternal,
    plugins: [babel(getBabelOptions({ useESModules: false })), sizeSnapshot()],
  },

  {
    input: './src/addons/NumericalSpring.js',
    output: { file: 'dist/NumericalSpring.js', format: 'es' },
    external: isExternal,
    plugins: [babel(getBabelOptions({ useESModules: true })), sizeSnapshot()],
  },

  {
    input: './src/addons/NumericalSpring.js',
    output: {
      file: 'dist/NumericalSpring.umd.js',
      format: 'umd',
      name: 'ReactSpringNumerical',
      globals,
    },
    external,
    plugins,
  },

  {
    input: './src/addons/index.js',
    output: { file: `dist/addons.js`, format: 'es' },
    external: isExternal,
    plugins: [babel(getBabelOptions({ useESModules: true })), sizeSnapshot()],
  },

  {
    input: './src/addons/index.js',
    output: { file: `dist/addons.cjs.js`, format: 'cjs' },
    external: isExternal,
    plugins: [babel(getBabelOptions({ useESModules: false }))],
  },

  {
    input: './src/addons/index.js',
    output: {
      file: `dist/addons.umd.js`,
      format: 'umd',
      name: 'ReactSpringAddons',
      globals,
    },
    external,
    plugins,
  },
]
