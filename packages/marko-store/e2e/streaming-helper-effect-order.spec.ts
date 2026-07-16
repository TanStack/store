import { expect, test } from '@playwright/test'

// Characterization: within the streamed block the store is built before the selector reads it,
// and exactly once on the client. This is why there is no flash; the bus is the backstop if the
// order ever changed. Asserting it makes a regression in resume effect-ordering visible.
test('store is built before the selector reads, exactly once on the client', async ({ page }) => {
  await page.goto('/effect-order')
  await expect(page.getByTestId('resumed')).toHaveText('yes')
  await expect(page.getByTestId('count-eo')).toHaveText('66')

  const probe = await page.evaluate(() => ({
    log: (window as unknown as { __eolog?: Array<string> }).__eolog ?? null,
    builds: (window as unknown as { __eobuilds?: number }).__eobuilds ?? null,
  }))
  expect(probe.log, 'store was read before it was built (would flash)').toEqual(['build', 'read'])
  expect(probe.builds, 'store built more than once on the client').toBe(1)
})
