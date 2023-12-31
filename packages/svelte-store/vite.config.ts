import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [svelte()],
  test: {
    name: 'svelte-store',
    watch: false,
    globals: true,
    coverage: { provider: 'istanbul' },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,ts}'],
    exclude: [
      '**/node_modules/**',
      '**/build/**',
      '**/coverage/**',
      '**/.svelte-kit/**',
    ],
    setupFiles: ['test-setup.ts'],
  },
})
