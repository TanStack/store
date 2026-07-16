import { expect, test } from '@playwright/test'

// SSR-only graceful: with JavaScript disabled the page never resumes, but the streamed value is
// already in the server HTML, so a no-JS visitor still sees it.
test.use({ javaScriptEnabled: false })
test('streamed value is present in server HTML without JavaScript', async ({ page }) => {
  await page.goto('/liveness')
  await expect(page.getByTestId('count')).toHaveText('77')
  // Confirms JS truly did not run (so the value above came from SSR, not resume).
  await expect(page.getByTestId('resumed')).toHaveText('no')
})
