import { expect, test } from '@playwright/test'

// Out-of-order streaming proof, in a REAL browser. Content wrapped in <try> with an <@placeholder>
// streams out of document order: the placeholder renders in place now, content after it flushes
// early, and the real content is reordered into place by a client script when its promise
// resolves. (Confirmed at the wire level: the footer, which is after the awaited block in the
// document, arrives in the stream BEFORE the awaited content.) This spec asserts a store delivered
// via <store-provider> stays LIVE inside that reordered subtree after it resumes.

test('a store stays live inside an out-of-order (try/placeholder) reordered subtree', async ({
  page,
}) => {
  const errors: Array<string> = []
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console.error: ' + m.text())
  })

  await page.goto('/streaming-out-of-order')

  // The footer (after the awaited block in the document) is present immediately -- it did not wait
  // for the slow awaited content, which is the out-of-order behavior.
  await expect(page.getByTestId('footer')).toHaveText('FOOTER')

  // The reordered subtree eventually resumes: its client onMount ran after it was moved into place.
  await expect(
    page.getByTestId('x-resumed'),
    'reordered subtree did not resume -- result inconclusive',
  ).toHaveText('yes')
  await expect(page.getByTestId('x-count')).toHaveText('7')

  // Decisive: an external store mutation after full load moves the shell AND the reordered subtree
  // together -- the selector inside the out-of-order branch is a live subscription.
  await page.getByTestId('external-inc').click()
  await expect(page.getByTestId('shell-count')).toHaveText('8')
  await expect(
    page.getByTestId('x-count'),
    'reordered-subtree selector did not react to an external update -- tag inert',
  ).toHaveText('8')

  const isDevServerNoise = (e: string) => /websocket|ws:\/\/|\[vite\]/i.test(e)
  expect(
    errors.filter((e) => !isDevServerNoise(e)),
    'client errors during resume',
  ).toEqual([])
})
