// Dedicated module singleton for the context-delivery resume spec, kept separate from store.ts
// so the two specs never share mutable state. The provider parks { counter: ctxCounterStore };
// the inline value thunk closes over this compiler-registered reference, so the store stays out
// of the serialized payload (the keystone SSR pattern).
import { createStore } from '@tanstack/store'

export const ctxCounterStore = createStore({ count: 5 })

// A second, isolated pair for the multiple-stores-in-one-provider e2e.
export const ctxMultiA = createStore({ count: 5 })
export const ctxMultiB = createStore({ count: 50 })
