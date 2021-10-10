import path from 'path'
import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

export default defineConfig({
  resolve: {
    alias: {
      '@react-spring/web': path.resolve('../../../targets/web/src/index.ts'),
    },
  },
  plugins: [reactRefresh()],
})
