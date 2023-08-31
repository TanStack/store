import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'store',
    dir: './src',
    watch: false,
    globals: true,
    coverage: { provider: 'istanbul' },
  },
})
