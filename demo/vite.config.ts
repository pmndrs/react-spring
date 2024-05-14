import path from 'path'
import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

export default defineConfig({
  resolve: {
    alias: {
      '@react-spring/animated': path.resolve(
        __dirname,
        '../packages/animated/src'
      ),
      '@react-spring/core': path.resolve(__dirname, '../packages/core/src'),
      '@react-spring/parallax': path.resolve(
        __dirname,
        '../packages/parallax/src'
      ),
      '@react-spring/rafz': path.resolve(__dirname, '../packages/rafz/src'),
      '@react-spring/shared': path.resolve(__dirname, '../packages/shared/src'),
      '@react-spring/types': path.resolve(__dirname, '../packages/types/src'),
      '@react-spring/web': path.resolve(__dirname, '../targets/web/src'),
      '@react-spring/three': path.resolve(__dirname, '../targets/three/src'),
    },
  },
  server: {
    port: 4000,
  },
  plugins: [reactRefresh()],
})
