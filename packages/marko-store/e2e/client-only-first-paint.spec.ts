import { expect, test } from '@playwright/test'

// The real-browser half of the getter-fed first-paint story (the jsdom test pins the jsdom
// behavior and documents that the blank is real-browser-only). The page toggles a provider +
// getter-fed selector subtree on AFTER mount — a genuine browser-only first paint of the
// subtree — and records every value the consuming interpolation observes into a plain window
// array. Primary assertion: the selector RECOVERS to the correct value (the guarantee that
// matters). Documentation assertion: the recorded history shows the blank first entry when the
// beat occurs. Observed in verification: under the @marko/run PRODUCTION build this toggled
// subtree mounts with no blank at all (history === ['5']) — the beat did not manifest in this
// shape; it remains documented as possible on a pure SPA first paint (the jsdom test's note),
// and this spec stays correct for either shape while pinning the recovery guarantee.
test('a browser-only mounted getter-fed selector recovers to the store value', async ({
  page,
}) => {
  const errors: Array<string> = []
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console.error: ' + m.text())
  })

  await page.goto('/client-only-first-paint')
  await expect(page.getByTestId('resumed')).toHaveText('yes')

  // The guarantee: the built-in recovery lands on the real value.
  await expect(page.getByTestId('count')).toHaveText('5')

  const history = await page.evaluate(
    () => ((globalThis as any).__paintHistory ?? []) as Array<string>,
  )
  // The history always ends at the recovered value; when the first-paint beat occurs it starts
  // with the blank entry. Both shapes are legitimate; a wrong FINAL value never is.
  expect(history[history.length - 1]).toBe('5')
  expect(history.length).toBeGreaterThanOrEqual(1)
  if (history.length > 1) {
    expect(history[0]).toBe('') // the documented blank beat, when observed
  }

  expect(errors).toEqual([])
})
