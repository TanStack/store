import preact from '@preact/preset-vite'
import { defineConfig } from 'vitest/config'
import packageJson from './package.json'

export default defineConfig({
  plugins: [preact()],
  test: {
    name: packageJson.name,
    dir: './tests',
    watch: false,
    environment: 'jsdom',
    setupFiles: ['./tests/test-setup.ts'],
    coverage: { enabled: true, provider: 'istanbul', include: ['src/**/*'] },
    typecheck: { enabled: true },
  },
})
