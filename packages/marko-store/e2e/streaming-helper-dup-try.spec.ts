import { expect, test } from '@playwright/test'

// The throw case: two helpers given the SAME key is a programming error. The second build throws
// at render ("Duplicate ... distinct key"). Because the helper runs inside a late <await>, the
// throw surfaces mid-stream; the idiomatic containment is Marko's <try>/<@catch>, which catches
// it and renders the fallback with the message. This proves both that the guard fires and that
// it is containable the same way as any streamed error.
test('duplicate key throws and is caught by <try>/<@catch>', async ({ page }) => {
  await page.goto('/dup-try')
  const caught = page.getByTestId('dup-caught')
  await expect(caught, 'duplicate-key throw was not raised/caught').toBeVisible()
  await expect(caught).toContainText('stream-store-provider')
  await expect(caught).toContainText('distinct key')
})
