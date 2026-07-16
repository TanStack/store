import { createStore } from '@tanstack/marko-store'

// Two isolated module stores for the multi-store page.
export const a = createStore({ count: 5 })
export const b = createStore({ count: 50 })
