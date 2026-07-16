import { expect, test } from '@playwright/test'

// THE SIDEEFFECTS HYDRATION GATE. A render-only <store-selector> page (no handler calls any
// package function) is exactly the shape a production bundler tree-shakes to death when the
// package manifest carries `"sideEffects": false`: the tag's client module registers its
// renderer and resume effects via module side effects, the shaken bundle never runs them, and
// resume dies on load ("effects[i++] is not a function"). This suite runs against the
// PRODUCTION build, so this spec is the permanent regression test for the
// `"sideEffects": ["**/*.marko"]` manifest fix. Three checks: the page resumes, zero client
// errors, and the render-only selector is genuinely LIVE afterwards (mutated externally via a
// window-exposed store — page code that touches only the store, never the tag).
test('a render-only selector page hydrates and stays live under the production build', async ({
  page,
}) => {
  const errors: Array<string> = []
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console.error: ' + m.text())
  })

  await page.goto('/gate-render-only')
  await expect(page.getByTestId('count')).toHaveText('7') // SSR value present either way
  await expect(
    page.getByTestId('resumed'),
    'page did not resume — with a bad sideEffects manifest this is the failure signature',
  ).toHaveText('yes')

  // Liveness: the tag's subscription must be real, not just painted HTML.
  await page.evaluate(() => {
    ;(globalThis as any).__gateStore.setState((s: any) => ({ count: s.count + 1 }))
  })
  await expect(page.getByTestId('count')).toHaveText('8')

  expect(errors, 'zero client errors expected on the render-only page').toEqual([])
})
