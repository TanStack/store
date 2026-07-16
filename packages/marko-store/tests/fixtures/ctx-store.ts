import { createStore } from '../../src/index'
// Module singleton so the provider's inline value thunk closes over a compiler-registered
// reference; the store stays out of the serialized payload (the keystone SSR pattern).
export const counterStore = createStore({ count: 5 })
