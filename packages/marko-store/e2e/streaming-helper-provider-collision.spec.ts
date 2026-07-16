import { expect, test } from '@playwright/test'

// The shared-sticker proof: <store-provider> and <stream-store-provider> on the SAME key must
// detect each other (they both own one box on the shelf) and throw, rather than silently clobber.
// The provider claims the key during the shell render; the streamed helper, rendering later inside
// the <await>, sees the same "$owner" marker and throws, caught by <try>/<@catch>. The provider's
// own selector keeps working, proving only the colliding streamed branch failed.
test('a stream-store-provider sharing a key with a store-provider is caught', async ({ page }) => {
  await page.goto('/provider-collision')
  await expect(page.getByTestId('resumed')).toHaveText('yes')
  await expect(page.getByTestId('provider-count'), 'the provider itself should be unaffected').toHaveText('5')

  const caught = page.getByTestId('collision-caught')
  await expect(caught, 'provider/helper key collision was not caught').toBeVisible()
  await expect(caught).toContainText('Duplicate')
  await expect(caught).toContainText('distinct key')

  // The colliding streamed branch never rendered its content.
  await expect(page.getByTestId('never')).toHaveCount(0)
})
