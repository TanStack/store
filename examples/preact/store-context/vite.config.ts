import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'

export default defineConfig({
  plugins: [preact()],
  optimizeDeps: {
    exclude: ['@tanstack/preact-store'],
  },
})
