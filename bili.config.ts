import { Config } from 'bili'

const targets = ['web', 'native', 'konva', 'three', 'universal']

const config: Config = {
  input: {
    web: 'src/web/index.js',
  },
  output: {
    format: ['cjs', 'umd', 'esm'],
    moduleName: 'immer',
    sourceMap: true,
    sourceMapExcludeSources: true,
  },
  babel: {
    minimal: true,
  },
  plugins: {
    'size-snapshot': true,
  },
  extendConfig(config, { format }) {
    config.output.fileName = `[name].${format}.js`
    return config
  },
}

export default config
