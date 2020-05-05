import { bundle, umdBundle } from '../../rollup.config'

export default [
  ...bundle(),
  umdBundle('ReactSpring', {
    input: 'dist/index.js',
  }),
]
