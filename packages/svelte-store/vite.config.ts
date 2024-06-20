import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig } from 'vitest/config'
import { svelteTesting } from '@testing-library/svelte/vite'

export default defineConfig({
  plugins: [svelte(), svelteTesting()],
  test: {
    alias: {
      // This is needed for svelte-5 support
      // https://github.com/testing-library/svelte-testing-library?tab=readme-ov-file#svelte-5-support
      '@testing-library/svelte': '@testing-library/svelte/svelte5',
    },
    name: 'svelte-store',
    dir: './tests',
    watch: false,
    environment: 'jsdom',
    setupFiles: ['test-setup.ts'],
    coverage: {
      // There seems to be some svelte-5 incompatibility so this is disabled for now
      // e.g. https://cloud.nx.app/runs/q2YUKafLGK
      enabled: false,
      provider: 'istanbul',
      include: ['src/**/*'],
    },
    typecheck: { enabled: true },
  },
})
