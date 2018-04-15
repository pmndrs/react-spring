import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'
import { sizeSnapshot } from 'rollup-plugin-size-snapshot'
import pkg from './package.json'

function presets(modules = false, loose = true) {
    return [['@babel/preset-env', { loose, modules }], ['@babel/preset-stage-2', { loose }], '@babel/preset-react']
}

const plugins = [
    babel({
        babelrc: false,
        presets: presets(),
        plugins: ['transform-react-remove-prop-types', 'annotate-pure-calls'],
    }),
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
        input: 'src/index.js',
        output: [{ file: `${pkg.main}.js`, format: 'cjs' }, { file: `${pkg.module}.js`, format: 'es' }],
        external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
        plugins,
    },
    {
        input: 'src/index.js',
        output: [{ file: `${pkg.main}.umd.js`, format: 'umd', name: 'ReactSpring', globals }],
        external: [...Object.keys(pkg.peerDependencies || {})],
        plugins: [...plugins, ...compress],
    },
    {
        input: 'src/addons/index.js',
        output: [{ file: `dist/addons.cjs.js`, format: 'cjs' }, { file: `dist/addons.js`, format: 'es' }],
        external: [...Object.keys(pkg.peerDependencies || {})],
        plugins,
    },
    {
        input: 'src/addons/index.js',
        output: { file: `dist/addons.umd.js`, format: 'umd', name: 'ReactSpringAddons', globals },
        external: [...Object.keys(pkg.peerDependencies || {})],
        plugins: [...plugins, ...compress],
    },
]
