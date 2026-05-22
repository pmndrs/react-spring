import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  resolve: {
    alias: {
      '@react-spring/web': path.resolve(
        __dirname,
        '../../../targets/web/src/index.ts'
      ),
    },
  },
  server: {
    port: 3000,
  },
  plugins: [react()],
})
