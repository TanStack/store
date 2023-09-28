import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'shallow',
    dir: './src',
    watch: false,
    globals: true,
    coverage: { provider: 'istanbul' },
  },
})
