import codspeedPlugin from '@codspeed/vitest-plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [codspeedPlugin()],
  test: {
    name: '@tanstack/store benchmarks',
    watch: false,
    environment: 'node',
    coverage: { enabled: false },
    typecheck: { enabled: false },
    benchmark: { include: ['tests/benchmarks/**/*.bench.ts'] },
  },
})
