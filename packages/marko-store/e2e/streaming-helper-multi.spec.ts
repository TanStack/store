import { expect, test } from '@playwright/test'

// Two streamed helpers with distinct keys must not collide: both resume live and an external
// mutation moves only its own store.
test('multiple streamed helpers with distinct keys stay independent and live', async ({ page }) => {
  const errors: Array<string> = []
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()) })

  await page.goto('/multi')
  await expect(page.getByTestId('resumed')).toHaveText('yes')
  await expect(page.getByTestId('count-a')).toHaveText('11')
  await expect(page.getByTestId('count-b')).toHaveText('22')

  await page.getByTestId('inc-a').click()
  await expect(page.getByTestId('count-a')).toHaveText('12')
  await expect(page.getByTestId('count-b'), 'inc-a leaked into the other store').toHaveText('22')

  await page.getByTestId('inc-b').click()
  await expect(page.getByTestId('count-b')).toHaveText('23')
  await expect(page.getByTestId('count-a'), 'inc-b leaked into the other store').toHaveText('12')

  const isDevServerNoise = (e: string) => /websocket|ws:\/\/|\[vite\]/i.test(e)
  expect(errors.filter((e) => !isDevServerNoise(e))).toEqual([])
})
