import { expect, test } from '@playwright/test'

// Composition rule: <store-context> grabs the bundle off the shelf AT RENDER and throws if the
// shelf is empty. Placed ABOVE the streamed helper, the box is still empty at that point, so it
// throws during the shell render. The old hand-rolled harness manufactured a clean 500 from that
// throw; @marko/run's node adapter instead fails the request at the transport level (the
// connection is dropped before any bytes flush). This spec asserts the CONSUMER-VISIBLE contract
// either way: the request fails, and the streamed value never reaches a body. The throw itself
// stays pinned handler-independently by the unit fixture
// (ssr-stream-ctx-above → "without a <store-provider> above it").
test('store-context above the streamed helper fails fast', async ({ request }) => {
  let failed = false
  let body = ''
  try {
    const res = await request.get('/context-above')
    body = await res.text()
    failed = res.status() >= 500
  } catch {
    failed = true // transport-level failure (current @marko/run behavior)
  }
  expect(failed, 'the request must fail — no partial success').toBe(true)
  expect(body).not.toContain('88')
})
