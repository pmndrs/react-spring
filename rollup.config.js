import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import uglify from 'rollup-plugin-uglify'
import pkg from './package.json'

function presets(modules = false, loose = true) {
    return [['@babel/preset-env', { loose, modules }], ['@babel/preset-stage-2', { loose }], '@babel/preset-react']
}

export default {
    input: 'src/index.js',
    output: [{ file: `${pkg.main}.js`, format: 'cjs' }, { file: `${pkg.module}.js`, format: 'es' }],
    external: [...Object.keys(pkg.peerDependencies || {})],
    plugins: [
        babel({
            babelrc: false,
            presets: presets(),
            plugins: ['transform-flow-strip-types', ['transform-react-remove-prop-types', { mode: 'unsafe-wrap' }], 'annotate-pure-calls'],
            env: { test: { presets: presets('commonjs') } },
            externalHelpersWhitelist: ['classCallCheck', 'extends', 'inheritsLoose', 'possibleConstructorReturn', 'objectWithoutProperties', 'assertThisInitialized']
        }),
        resolve(),
        commonjs(),
        uglify(),
    ],
}
