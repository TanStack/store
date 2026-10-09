import { expect, test } from '@playwright/test'

// Rich-payload resume: strings, nested arrays of objects, Date, Map and Set crossing through
// the provider thunk channel, plus a Date through the streamed channel — all asserted in the
// server HTML AND live after resume in a real browser under the production build. This is the
// suite's answer to "every store that crosses SSR is a small object of numbers".
test('rich payloads render server-side, resume, and stay live', async ({ page }) => {
  const errors: Array<string> = []
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console.error: ' + m.text())
  })

  await page.goto('/payload')
  await expect(page.getByTestId('resumed')).toHaveText('yes')

  await expect(page.getByTestId('title')).toHaveText('quarterly report')
  await expect(page.getByTestId('rows')).toHaveText(
    JSON.stringify([
      { id: 1, tags: ['a', 'b'] },
      { id: 2, tags: [] },
    ]),
  )
  await expect(page.getByTestId('date')).toHaveText('2026-07-14T00:00:00.000Z')
  await expect(page.getByTestId('map')).toHaveText('alpha')
  await expect(page.getByTestId('set')).toHaveText('true')
  await expect(page.getByTestId('streamed-date')).toHaveText('2026-01-02T03:04:05.000Z')

  // Liveness over the nested-array slice: a write through <store-context> appends a row and the
  // selector re-renders with it.
  await page.getByTestId('add-row').click()
  await expect(page.getByTestId('rows')).toHaveText(
    JSON.stringify([
      { id: 1, tags: ['a', 'b'] },
      { id: 2, tags: [] },
      { id: 3, tags: ['c'] },
    ]),
  )

  expect(errors).toEqual([])
})
