import { createAtom, createStore } from '@tanstack/marko-store'

// Module-level store + atom. The page's inline thunks (() => counterStore) close over these
// stable references, which keeps the live store OUT of the serialized resume payload — the
// store is rebuilt on each side, never serialized.
export const counterStore = createStore({ count: 5 })
export const countAtom = createAtom(7)
