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
  exclude: '**/node_modules/**',
  runtimeHelpers: true,
  presets: [
    ['@babel/preset-env', { loose: true, modules: false, targets }],
    '@babel/preset-react',
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
      input: `./src/${entry}/index.js`,
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
      input: `./src/${entry}/index.js`,
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

export default [
  ...createConfig('targets/web', 'web'),
  ...createConfig('targets/native', 'native'),
  ...createConfig('targets/universal', 'universal'),
  ...createConfig('renderprops/targets/web', 'renderprops'),
  ...createConfig('renderprops/addons', 'renderprops-addons'),
  ...createConfig('renderprops/targets/native', 'renderprops-native'),
  ...createConfig('renderprops/targets/universal', 'renderprops-universal'),
  ...createConfig('renderprops/targets/konva', 'renderprops-konva'),
]
