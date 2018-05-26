import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'

const external = id => !id.startsWith('.') && !id.startsWith('/')

const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'react-native': 'react-native',
  'prop-types': 'PropTypes',
  'react-spring': 'ReactSpring',
}

const getBabelOptions = ({ useESModules }) => ({
  exclude: '**/node_modules/**',
  runtimeHelpers: true,
  plugins: [
    [
      '@babel/transform-runtime',
      { regenerator: false, polyfill: false, useBuiltIns: true, useESModules },
    ],
  ],
})

function createConfig(entry, out, name) {
  return [
    {
      input: `./src/${entry}.js`,
      output: { file: `dist/${out}.js`, format: 'esm' },
      external,
      plugins: [babel(getBabelOptions({ useESModules: true })), sizeSnapshot()],
    },
    {
      input: `./src/${entry}.js`,
      output: { file: `dist/${out}.cjs.js`, format: 'cjs' },
      external,
      plugins: [babel(getBabelOptions({ useESModules: false }))],
    },
    {
      input: `./src/${entry}.js`,
      output: { file: `dist/${out}.umd.js`, format: 'umd', name, globals },
      external: Object.keys(globals),
      plugins: [
        resolve(),
        babel(getBabelOptions({ useESModules: true })),
        commonjs({ include: '**/node_modules/**' }),
        sizeSnapshot(),
        uglify(),
      ],
    },
  ]
}

export default [
  ...createConfig('index', 'index', 'ReactSpring'),
  ...createConfig('native', 'native', 'ReactSpringNative'),
  ...createConfig('addons/index', 'addons', 'ReactSpringAddons'),
]
