import { expect, test } from '@playwright/test'

// Example smoke: the page renders, one interaction works, zero client errors.
test('store-context: renders and a context write propagates', async ({ page }) => {
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
  await expect(page.getByText('Total votes: 0')).toBeVisible()
  await page.getByRole('button', { name: 'Add cat' }).click()
  await expect(page.getByText('Total votes: 1')).toBeVisible()
  expect(errors).toEqual([])
})
