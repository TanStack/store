import { expect, test } from '@playwright/test'

// The Phase 2a proof: in a REAL browser, does an SSR'd page with <store-selector> and
// <store-atom> resume and stay LIVE, or render once on the server and go inert? jsdom cannot
// answer this honestly (it was the reason this round-trip was deferred from the vitest suite),
// so it runs in real Chromium.
//
// A store-independent resume marker (data-testid="resumed") confirms the page resumed before we
// judge the tags: "no" on the server, "yes" after a client onMount. That lets a stale value be
// attributed correctly:
//   resumed=yes + stale value => the page resumed but a tag is inert (the failure we care about)
//   resumed=no                => the page never resumed (setup issue); the result is inconclusive

test("an SSR'd store page resumes and stays live in a real browser", async ({
  page,
}) => {
  const errors: Array<string> = []
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console.error: ' + m.text())
  })

  await page.goto('/')

  // Precondition: the page actually resumed (client JS ran). Auto-waits up to the timeout.
  await expect(
    page.getByTestId('resumed'),
    'page did not resume -- client JS did not run; result inconclusive',
  ).toHaveText('yes')

  // Server-seeded values are present after resume (createStore({ count: 5 }) / createAtom(7)).
  await expect(page.getByTestId('selector-count')).toHaveText('5')
  await expect(page.getByTestId('atom-value')).toHaveText('7')

  // Decisive 1 -- selector subscription is LIVE post-resume: a store mutation triggered from
  // OUTSIDE any tag (setState on the module singleton) propagates to the rendered selection.
  await page.getByTestId('external-inc').click()
  await expect(
    page.getByTestId('selector-count'),
    'selector did not react to an external store update after resume -- tag inert',
  ).toHaveText('6')

  // Decisive 2 -- atom two-way write-back is LIVE post-resume: mutating the bound value flows
  // through the tag's valueChange into countAtom.set and re-renders.
  await page.getByTestId('atom-inc').click()
  await expect(
    page.getByTestId('atom-value'),
    'atom did not write back / re-render after resume -- tag inert',
  ).toHaveText('8')

  // Keystone: no serialization crash or uncaught client error during render/resume.
  // Vite's dev client opens an HMR WebSocket even in middleware mode with hmr disabled, and in
  // a test there is no WS server, so it logs connection failures. That noise is unrelated to
  // store serialization or resume, so it is filtered out before the assertion -- a real tag or
  // serialization error would not match these patterns and would still fail the test.
  const isDevServerNoise = (e: string) => /websocket|ws:\/\/|\[vite\]/i.test(e)
  const realErrors = errors.filter((e) => !isDevServerNoise(e))
  expect(realErrors, 'client errors during resume').toEqual([])
})
