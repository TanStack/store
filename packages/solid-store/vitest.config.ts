import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'solid-store',
    dir: './src',
    watch: false,
    environment: 'jsdom',
    globals: true,
    coverage: { provider: 'istanbul' },
  },
})
