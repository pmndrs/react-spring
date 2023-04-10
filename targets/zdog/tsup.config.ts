import { defineConfig } from 'tsup'
import { defaultConfig } from '../../tsup.config.base'

export default defineConfig(opts => {
  return defaultConfig(
    {
      entry: 'src/index.ts',
      name: 'react-spring_zdog',
    },
    opts
  )
})
