import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'

const isExternal = id => !id.startsWith('.') && !id.startsWith('/')
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

function createConfig(entry, out, name) {
  return [
    {
      input: `./src/${entry}.js`,
      output: { file: `dist/${out}.es.js`, format: 'es' },
      external: isExternal,
      plugins: [babel(getBabelOptions({ useESModules: true })), sizeSnapshot()],
    },
    {
      input: `./src/${entry}.js`,
      output: { file: `dist/${out}.cjs.js`, format: 'cjs' },
      external: isExternal,
      plugins: [babel(getBabelOptions({ useESModules: false }))],
    },
    {
      input: `./src/${entry}.js`,
      output: {
        file: `dist/${out}.umd.js`,
        format: 'umd',
        name,
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'prop-types': 'PropTypes',
          'react-spring': 'ReactSpring',
        },
      },
      external: ['react', 'react-dom', 'prop-types', 'react-spring'],
      plugins: [
        babel(getBabelOptions({ useESModules: false })),
        resolve(),
        commonjs(),
        sizeSnapshot(),
        uglify({ compress: true, mangle: { toplevel: true } }),
      ],
    },
  ]
}

export default [
  ...createConfig('index', 'react-spring', 'ReactSpring'),
  ...createConfig('addons/index', 'addons', 'ReactSpringAddons'),
]
