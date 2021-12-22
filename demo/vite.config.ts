import path from 'path'
import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

export default defineConfig({
  resolve: {
    alias: {
      '@react-spring/web': path.resolve('../targets/web/src/index.ts'),
      '@react-spring/parallax': path.resolve(
        '../packages/parallax/src/index.tsx'
      ),
      '@react-spring/three': path.resolve('../targets/three/src/index.ts'),
    },
  },
  server: {
    port: 4000,
  },
  plugins: [reactRefresh()],
})
