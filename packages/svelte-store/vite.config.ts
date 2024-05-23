import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vitest/config'
import { svelteTesting } from '@testing-library/svelte/vite'

export default defineConfig({
  plugins: [sveltekit(), svelteTesting()],
  test: {
    alias: {
      '@testing-library/svelte': '@testing-library/svelte/svelte5',
    },
    name: 'svelte-store',
    dir: './src',
    watch: false,
    environment: 'jsdom',
    setupFiles: ['test-setup.ts'],
    coverage: {
      // there seems to be some svelte-5 incompatibility so this is disabled for now
      // e.g. https://cloud.nx.app/runs/q2YUKafLGK
      enabled: false,
      provider: 'istanbul',
      include: ['src/**/*']
    },
    typecheck: { enabled: true },
    globals: true,
  },
})
