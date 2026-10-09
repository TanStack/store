import { expect, test } from '@playwright/test'

// Example smoke: the page renders, one interaction works, zero client errors.
test('per-request page: data rebuilds on resume and a context write lands', async ({ page }) => {
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
  await expect(page.getByText('Count: 42', { exact: true })).toBeVisible()
  // The rich slices: a string, a Date, and a shallow-compared array slice, all
  // built from the per-request seed and painted server-side.
  await expect(page.getByText('quarterly report (updated 2026-07-14)')).toBeVisible()
  await expect(page.getByText('Rows: alpha, beta (2)')).toBeVisible()
  await page.getByRole('button', { name: 'inc via context' }).click()
  await expect(page.getByText('Count: 43', { exact: true })).toBeVisible()
  // A write to the nested array lands live through the shallow-compared slice.
  await page.getByRole('button', { name: 'add row' }).click()
  await expect(page.getByText('Rows: alpha, beta, gamma (3)')).toBeVisible()
  expect(errors).toEqual([])
})

test('multi page renders', async ({ page }) => {
  // Dev-server noise (HMR websocket handshakes) is not an application error.
  const ignore = (t: string) => t.includes('WebSocket') || t.includes('[vite]')
  const errors: Array<string> = []
  page.on('pageerror', (e) => {
    if (!ignore(e.message)) errors.push('pageerror: ' + e.message)
  })
  page.on('console', (m) => {
    if (m.type() === 'error' && !ignore(m.text())) errors.push('console.error: ' + m.text())
  })

  await page.goto('/multi')
  await expect(page.locator('h1')).toBeVisible()
  expect(errors).toEqual([])
})
