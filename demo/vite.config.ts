import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  resolve: {
    alias: {
      '@react-spring/web': path.resolve(__dirname, '../targets/web'),
      '@react-spring/parallax': path.resolve(__dirname, '../packages/parallax'),
      '@react-spring/three': path.resolve(__dirname, '../targets/three'),
    },
  },
  server: {
    port: 4000,
  },
  plugins: [react()],
})
