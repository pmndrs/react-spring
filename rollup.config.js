import path from 'path'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'

const root = process.platform === 'win32' ? path.resolve('/') : '/'
const external = id => !id.startsWith('.') && !id.startsWith(root)

const globals = {
  react: 'React',
  'react-dom': 'ReactDOM',
  'prop-types': 'PropTypes',
  'react-spring': 'ReactSpring',
}

const extensions = ['.js', '.jsx', '.ts', '.tsx']
const getBabelOptions = ({ useESModules }) => ({
  extensions,
  exclude: '**/node_modules/**',
  runtimeHelpers: true,
  plugins: [['@babel/transform-runtime', { regenerator: false, useESModules }]],
})

function createConfig(entry, out) {
  return [
    {
      input: `./src/${entry}.js`,
      output: { file: `dist/${out}.js`, format: 'esm' },
      external,
      plugins: [
        babel(getBabelOptions({ useESModules: true })),
        sizeSnapshot(),
        resolve({ extensions }),
      ],
    },
    {
      input: `./src/${entry}.js`,
      output: { file: `dist/${out}.cjs.js`, format: 'cjs' },
      external,
      plugins: [
        babel(getBabelOptions({ useESModules: false })),
        resolve({ extensions }),
      ],
    },
  ]
}

export default [
  ...createConfig('targets/web/index', 'web'),
  ...createConfig('targets/native/index', 'native'),
  ...createConfig('renderprops/targets/web/index', 'renderprops'),
  ...createConfig('renderprops/addons/index', 'renderprops-addons'),
  ...createConfig('renderprops/targets/native/index', 'renderprops-native'),
  ...createConfig(
    'renderprops/targets/universal/index',
    'renderprops-universal'
  ),
  ...createConfig('renderprops/targets/konva/index', 'renderprops-konva'),
]
