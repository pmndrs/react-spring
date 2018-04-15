import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'
import pkg from './package.json'

const getBabelOptions = (modules = false, loose = true) => ({
    babelrc: false,
    presets: [
        ['@babel/preset-env', { loose: true, modules: false }],
        ['@babel/preset-stage-2', { loose: true }],
        '@babel/preset-react',
    ],
    plugins: ['transform-react-remove-prop-types'],
})

const isExternal = id => !id.startsWith('\0') && !id.startsWith('.') && !id.startsWith('/')

const plugins = [
    babel(getBabelOptions()),
    resolve(),
    commonjs(),
    sizeSnapshot()
]

const compress = [
    uglify({
        compress: true,
        mangle: {
            toplevel: true,
        },
    }),
]

const globals = { 'react': 'React', 'prop-types': 'PropTypes' }

export default [
    {
        input: './src/index.js',
        output: [{ file: `${pkg.main}.js`, format: 'cjs' }, { file: `${pkg.module}.js`, format: 'es' }],
        external: isExternal,
        plugins,
    },

    {
        input: './src/index.js',
        output: [{ file: `${pkg.main}.umd.js`, format: 'umd', name: 'ReactSpring', globals }],
        external: [...Object.keys(pkg.peerDependencies || {})],
        plugins: [...plugins, ...compress],
    },

    {
        input: './src/addons/index.js',
        output: [{ file: `dist/addons.cjs.js`, format: 'cjs' }, { file: `dist/addons.js`, format: 'es' }],
        external: isExternal,
        plugins,
    },

    {
        input: './src/addons/index.js',
        output: { file: `dist/addons.umd.js`, format: 'umd', name: 'ReactSpringAddons', globals },
        external: [...Object.keys(pkg.peerDependencies || {})],
        plugins: [...plugins, ...compress],
    },
]
