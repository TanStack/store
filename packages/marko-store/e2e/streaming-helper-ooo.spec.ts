import { expect, test } from '@playwright/test'

// Out-of-order streaming (<try>/<@placeholder>, slow block before a fast one) must still land
// each helper's value correctly with no crash.
test('out-of-order streamed helpers each land correct', async ({ page }) => {
  const errors: Array<string> = []
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()) })

  await page.goto('/ooo')
  await expect(page.getByTestId('resumed')).toHaveText('yes')
  await expect(page.getByTestId('count-fast')).toHaveText('44')
  await expect(page.getByTestId('count-slow')).toHaveText('33')

  const isDevServerNoise = (e: string) => /websocket|ws:\/\/|\[vite\]/i.test(e)
  expect(errors.filter((e) => !isDevServerNoise(e))).toEqual([])
})
