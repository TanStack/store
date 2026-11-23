import { drainPassiveEffects } from 'octane/internal/client'
import { afterEach } from 'vitest'

afterEach(() => {
  drainPassiveEffects()
  document.body.replaceChildren()
})
