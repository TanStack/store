import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'store',
    watch: false,
    dir: './src',
    environment: 'jsdom',
    globals: true,
    coverage: { provider: 'istanbul' },
  },
})
