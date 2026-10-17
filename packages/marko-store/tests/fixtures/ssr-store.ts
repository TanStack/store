import { createAtom, createStore } from '../../src/index'

// Module singletons so the SSR fixtures' inline thunks close over a stable,
// compiler-registered reference (see ssr.test.ts header for why this matters).
export const counterStore = createStore({ count: 5, other: 0 })
export const countAtom = createAtom(7)
