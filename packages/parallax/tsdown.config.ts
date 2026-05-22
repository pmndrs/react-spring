import { defineConfig } from 'tsdown'
import { defaultConfig } from '../../tsdown.config.base.mjs'

export default defineConfig(
  defaultConfig({
    entry: 'src/index.tsx',
    name: 'react-spring_parallax',
  })
)
