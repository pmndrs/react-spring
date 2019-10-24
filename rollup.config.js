import path from 'path'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'

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

function createBasicConfig(entry, out, format, sizeSnap = true) {
  return {
    input: `./src/${entry}/index`,
    output: { file: `dist/${out}.js`, format },
    external,
    plugins: [
      babel(
        getBabelOptions(
          { useESModules: true },
          '>1%, not dead, not ie 11, not op_mini all'
        )
      ),
      sizeSnap && sizeSnapshot(),
      resolve({ extensions }),
    ],
  }
}

function createCjsConfig(entry, out) {
  return {
    input: `./src/${entry}/index`,
    output: { file: `dist/${out}.cjs.js`, format: 'cjs' },
    external,
    plugins: [
      babel(getBabelOptions({ useESModules: false })),
      sizeSnapshot(),
      resolve({ extensions }),
    ],
  }
}

function createConfig(entry, out) {
  return [createBasicConfig(entry, out, 'esm'), createCjsConfig(entry, out)]
}

function createCjs(entry, out) {
  return [createBasicConfig(entry, out, 'cjs'), createCjsConfig(entry, out)]
}

export default [
  ...createConfig('targets/web', 'web'),
  ...createConfig('targets/native', 'native'),
  ...createConfig('targets/universal', 'universal'),
  ...createConfig('targets/konva', 'konva'),
  ...createConfig('targets/three', 'three'),
  ...createConfig('targets/zdog', 'zdog'),
  createBasicConfig('targets/cookbook', 'cookbook', 'esm', false),
  ...createCjs('renderprops/targets/web', 'renderprops'),
  ...createCjs('renderprops/addons', 'renderprops-addons'),
  ...createCjs('renderprops/targets/native', 'renderprops-native'),
  ...createCjs('renderprops/targets/universal', 'renderprops-universal'),
  ...createCjs('renderprops/targets/konva', 'renderprops-konva'),
]
