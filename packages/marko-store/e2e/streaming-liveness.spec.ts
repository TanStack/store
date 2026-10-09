import { expect, test } from '@playwright/test'

// Phase 3 core proof, in a REAL browser: a store delivered via <store-provider> stays LIVE inside
// progressively-streamed <await> subtrees -- including a LATE subtree (500ms) -- after resume.
// Per-subtree resume markers (a-resumed / b-resumed) confirm each streamed branch's client JS ran
// before we judge liveness, so a stale value is attributed correctly (resumed=yes + stale => the
// branch resumed but the selector is inert, which is the failure we care about).
//
// Bare <await> streams in document order; this spec asserts liveness across that streaming, not
// the order itself (see streaming-out-of-order.spec.ts for order).

test('a store stays live across progressive <await> streaming, including a late subtree', async ({
  page,
}) => {
  const errors: Array<string> = []
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console.error: ' + m.text())
  })

  await page.goto('/streaming-liveness')

  // Each streamed subtree resumed (its client onMount ran), including the late 500ms one.
  await expect(
    page.getByTestId('a-resumed'),
    'await A subtree did not resume',
  ).toHaveText('yes')
  await expect(
    page.getByTestId('b-resumed'),
    'late await B subtree did not resume -- result inconclusive',
  ).toHaveText('yes')

  // The seeded value reached the shell and both await subtrees (createStore({ count: 5 })).
  await expect(page.getByTestId('shell-count')).toHaveText('5')
  await expect(page.getByTestId('a-count')).toHaveText('5')
  await expect(page.getByTestId('b-count')).toHaveText('5')

  // Decisive: a store mutation from OUTSIDE any tag (setState on the module singleton) after full
  // load moves the shell AND the late subtree together -- selectors inside streamed branches are
  // live subscriptions, not inert server snapshots.
  await page.getByTestId('external-inc').click()
  await expect(page.getByTestId('shell-count')).toHaveText('6')
  await expect(
    page.getByTestId('a-count'),
    'await A selector did not react to an external update -- tag inert',
  ).toHaveText('6')
  await expect(
    page.getByTestId('b-count'),
    'late await B selector did not react to an external update -- tag inert',
  ).toHaveText('6')

  // No serialization crash or uncaught client error during render/resume. Vite's dev client opens
  // an HMR WebSocket even with hmr disabled in middleware mode, and there is no WS server in a
  // test, so it logs connection failures; that noise is filtered out. A real tag/serialization
  // error would not match these patterns and would still fail the assertion.
  const isDevServerNoise = (e: string) => /websocket|ws:\/\/|\[vite\]/i.test(e)
  expect(
    errors.filter((e) => !isDevServerNoise(e)),
    'client errors during resume',
  ).toEqual([])
})
