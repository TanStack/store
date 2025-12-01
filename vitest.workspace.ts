import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  './packages/store/vite.config.ts',
  './packages/svelte-store/vite.config.ts',
  './packages/solid-store/vite.config.ts',
  './packages/vue-store/vite.config.ts',
  './packages/angular-store/vite.config.ts',
  './packages/react-store/vite.config.ts',
  './packages/preact-store/vite.config.ts',
])
