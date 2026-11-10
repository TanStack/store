// Module singletons for the Phase 3 streaming e2e pages. Kept separate from store.ts and
// context-store.ts so these specs never share mutable state with the Phase 2a/2b specs (the same
// isolation rule the existing fixtures follow). The inline value thunks in the pages close over
// these compiler-registered references, so the store stays out of the serialized resume payload
// -- the keystone SSR pattern proved in earlier phases.
import { createStore } from '@tanstack/store'

// Core-liveness + out-of-order pages: a read-only seed, mutated only by the external-inc button,
// so there is no per-request fill to leak across a shared (reuseExistingServer) dev server.
export const streamLivenessStore = createStore({ count: 5 })
export const streamOooStore = createStore({ count: 7 })

// Fill CHARACTERIZATION pages: constructed at 0 so a filled value of 99 is distinguishable from
// the client-side construction default. If a streamed subtree reverted to the empty client store
// it would read 0, not 99 -- that gap is the entire point of the characterization. The specs
// assert CLIENT-side outcomes, which are deterministic regardless of any server-side leak (the
// client store is a fresh module instance per navigation).
export const streamFillRenderStore = createStore({ count: 0 })
export const streamFillOnmountStore = createStore({ count: 0 })
