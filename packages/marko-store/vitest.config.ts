import { defineConfig } from 'vitest/config'
import marko from '@marko/vite'
import packageJson from './package.json'

// @marko/vite is an app plugin (it sets up SSR + browser transforms) and is
// used by vitest only — never by the library build (tsdown handles that).
export default defineConfig({
  plugins: [marko() as any],
  test: {
    name: packageJson.name,
    dir: './tests',
    watch: false,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: { enabled: true, provider: 'istanbul', include: ['src/**/*'] },
    typecheck: { enabled: true },
  },
})
