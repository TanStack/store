import { expect, test } from '@playwright/test'

// Example smoke: the page renders, one interaction works, zero client errors.
test('stores: renders, counts a click, and the shallow pair follows', async ({ page }) => {
  // Dev-server noise (HMR websocket handshakes) is not an application error.
  const ignore = (t: string) => t.includes('WebSocket') || t.includes('[vite]')
  const errors: Array<string> = []
  page.on('pageerror', (e) => {
    if (!ignore(e.message)) errors.push('pageerror: ' + e.message)
  })
  page.on('console', (m) => {
    if (m.type() === 'error' && !ignore(m.text())) errors.push('console.error: ' + m.text())
  })

  await page.goto('/')
  await expect(page.getByText('Cats: 0')).toBeVisible()
  await expect(page.getByText('As a pair: 0 cats / 0 dogs')).toBeVisible()
  await page.getByRole('button', { name: 'Add cat' }).click()
  await expect(page.getByText('Cats: 1')).toBeVisible()
  await expect(page.getByText('As a pair: 1 cats / 0 dogs')).toBeVisible()
  expect(errors).toEqual([])
})
