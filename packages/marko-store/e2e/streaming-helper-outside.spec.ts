import { expect, test } from '@playwright/test'

// A selector placed ABOVE the await (before the helper has built its store) cannot have the
// value yet: it shows its default, then updates once the streamed block lands and rings the bus.
// A selector INSIDE the block shows the value immediately (no flash).
test('selector above the await shows default then updates; inside shows no flash', async ({ page }) => {
  const errors: Array<string> = []
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()) })

  await page.goto('/outside', { waitUntil: 'commit' })
  // At first paint the outside selector has no store -> its null-tolerant default.
  await expect(page.getByTestId('before-count')).toHaveText('undef')
  // After the streamed block lands, the outside selector recovers via the bus.
  await expect(page.getByTestId('resumed')).toHaveText('yes')
  await expect(page.getByTestId('inside-count')).toHaveText('55')
  await expect(page.getByTestId('before-count'), 'outside selector never recovered').toHaveText('55')

  const isDevServerNoise = (e: string) => /websocket|ws:\/\/|\[vite\]/i.test(e)
  expect(errors.filter((e) => !isDevServerNoise(e))).toEqual([])
})
