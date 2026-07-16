import { expect, test } from '@playwright/test'

// CHARACTERIZATION -- not recommended-pattern tests. These pin how the two naive progressive-fill
// mechanisms behave on resume, which is WHY Phase 3's no-flash data delivery serializes the
// awaited data across the wire instead of relying on a setState inside the await body.
//
// Both assertions are CLIENT-side outcomes and are deterministic regardless of the shared dev
// server's state: a full navigation re-initializes the page's module store, so the client store
// starts at its construction default (0) on every load.

test('render-time setState fill is server-only -- the client store stays at its default', async ({
  page,
}) => {
  await page.goto('/streaming-fill-render')

  await expect(page.getByTestId('a-resumed')).toHaveText('yes')

  // The render-time side effect filled the SERVER store to 99, but it is not replayed on resume,
  // so the live selector reflects the fresh client store: 0, not 99.
  await expect(
    page.getByTestId('a-count'),
    'render-time fill unexpectedly carried to the client store',
  ).toHaveText('0')

  // Still a live subscription: an external mutation moves it (0 -> 1).
  await page.getByTestId('external-inc').click()
  await expect(page.getByTestId('a-count')).toHaveText('1')
})

test('onMount fill is client-only -- the value reaches the client store (with a server flash)', async ({
  page,
}) => {
  await page.goto('/streaming-fill-onmount')

  await expect(page.getByTestId('a-resumed')).toHaveText('yes')

  // onMount ran on the client and filled the store; the live selector shows it: 99. (The server
  // rendered 0 first -- the flash -- which is the trade-off this mechanism makes.)
  await expect(
    page.getByTestId('a-count'),
    'onMount fill did not reach the client store',
  ).toHaveText('99')

  await page.getByTestId('external-inc').click()
  await expect(page.getByTestId('a-count')).toHaveText('100')
})
