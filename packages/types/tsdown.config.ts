import { defineConfig } from 'tsdown'
import { defaultConfig } from '../../tsdown.config.base.mjs'

export default defineConfig(
  defaultConfig({
    entry: 'src/index.ts',
    name: 'react-spring_types',
  })
)
