import { expect, test } from '@playwright/test'

// Core proof for the streamed born-with-data helper: an SSR'd <store-async-provider> living
// inside a late <await> must (1) cross the awaited value to the browser so the store rebuilds
// with it, (2) show it with no flash, and (3) stay live after resume. The resume marker is
// store-independent so a stale value can be attributed correctly.
test('streamed helper store crosses, shows no flash, and stays live', async ({ page }) => {
  const errors: Array<string> = []
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console.error: ' + m.text()) })

  // Catch any flash: record every distinct value the count shows from first paint onward.
  const seen: Array<string> = []
  await page.exposeFunction('__record', (v: string) => {
    if (seen.length === 0 || seen[seen.length - 1] !== v) seen.push(v)
  })

  await page.goto('/liveness', { waitUntil: 'commit' })
  // Sample the count tightly while the stream lands, to expose a build-then-patch flash.
  await page.evaluate(async () => {
    for (let i = 0; i < 60; i++) {
      const el = document.querySelector('[data-testid=count]')
      if (el) await (window as unknown as { __record: (v: string) => void }).__record((el.textContent || '').trim())
      await new Promise((r) => setTimeout(r, 16))
    }
  })

  await expect(page.getByTestId('resumed'), 'page did not resume; result inconclusive').toHaveText('yes')
  // The streamed server value is present and correct after resume.
  await expect(page.getByTestId('count')).toHaveText('77')
  // No flash: the only non-empty value ever shown was the final one.
  expect(seen.filter((v) => v !== ''), 'a transient (flash) value appeared before the final value').toEqual(['77'])

  // Live: an external store mutation (outside any tag) propagates to the selection after resume.
  await page.getByTestId('external-inc').click()
  await expect(page.getByTestId('count'), 'selector inert after resume').toHaveText('78')

  const isDevServerNoise = (e: string) => /websocket|ws:\/\/|\[vite\]/i.test(e)
  expect(errors.filter((e) => !isDevServerNoise(e)), 'client errors during resume').toEqual([])
})
