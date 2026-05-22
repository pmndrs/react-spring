import { vercelPreset } from '@vercel/react-router/vite'
import type { Config } from '@react-router/dev/config'

export default {
  presets: [vercelPreset()],
} satisfies Config
