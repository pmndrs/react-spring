import babel from 'rollup-plugin-babel'
import pkg from './package.json'

export default {
    input: 'src/index.js',
    output: [
        { file: `${pkg.main}.js`, format: 'cjs' },
        { file: `${pkg.module}.js`, format: 'es' },
    ],
    external: [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})],
    plugins: [babel()],
}
