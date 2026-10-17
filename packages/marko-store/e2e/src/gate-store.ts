import { createStore } from '@tanstack/store'

// Module singleton for the render-only hydration gate. Lives in its own module so
// the gate page's ONLY package-adjacent imports are this store and the
// autodiscovered tag — no handler-driven import keeps the tag module alive, which
// is the tree-shaking condition the gate exists to test.
export const gateStore = createStore({ count: 7 })
