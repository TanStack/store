// Module singletons so the page's inline thunks (() => counterStore, () => countAtom) close
// over stable, compiler-registered references -- the keystone pattern the SSR tests proved
// keeps the store out of the serialized resume payload. createStore/createAtom come straight
// from @tanstack/store (the same module the tags import, so there is a single store instance).
import { createAtom, createStore } from '@tanstack/store'

export const counterStore = createStore({ count: 5 })
export const countAtom = createAtom(7)
