import { defineConfig } from '@playwright/test'

// PRODUCTION-MODE GATE, deliberately. `marko-run preview` builds the production
// bundle and serves it, so every e2e run exercises what consumers actually get:
// tree-shaking, the hydration registry, minified resume. Dev mode does none of
// that — it's exactly how the sideEffects hydration bug shipped in a sibling
// package with a fully green dev-mode suite. Use `pnpm dev` for interactive
// debugging; the gate stays production.
export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  timeout: 60_000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:5189',
  },
  webServer: {
    command: 'npm run preview -- --port 5189',
    url: 'http://localhost:5189',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 180_000,
  },
})
