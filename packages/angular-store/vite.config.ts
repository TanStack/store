import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    name: 'angular-store',
    dir: './tests',
    watch: false,
    environment: 'jsdom',
    setupFiles: ['tests/test-setup.ts'],
    globals: true,
    coverage: { enabled: true, provider: 'istanbul', include: ['src/**/*'] },
    typecheck: { enabled: true },
  },
})
