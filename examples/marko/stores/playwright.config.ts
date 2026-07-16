import { defineConfig } from '@playwright/test'

// Example smoke e2e. Dev-mode webServer on purpose: examples demonstrate, they
// don't gate — the production-mode gate lives in packages/marko-store/e2e.
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: 0,
  workers: 1,
  use: {
    baseURL: 'http://localhost:3070',
  },
  webServer: {
    command: 'npm run dev -- --port 3070',
    url: 'http://localhost:3070',
    reuseExistingServer: !process.env.CI,
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120_000,
  },
})
