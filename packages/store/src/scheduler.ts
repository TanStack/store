import type { Store } from './store'
import type { Derived } from './derived'

/**
 * This is here to solve the pyramid dependency problem where:
 *       A
 *      / \
 *     B   C
 *      \ /
 *       D
 *
 * Where we deeply traverse this tree, how do we avoid D being recomputed twice; once when B is updated, once when C is.
 *
 * To solve this, we create linkedDeps that allows us to sync avoid writes to the state until all of the deps have been
 * resolved.
 *
 * This is a record of stores, because derived stores are not able to write values to, but stores are
 */
export const __storeToDerived = new WeakMap<
  Store<unknown>,
  Set<Derived<unknown>>
>()
export const __derivedToStore = new WeakMap<
  Derived<unknown>,
  Set<Store<unknown>>
>()

export const __depsThatHaveWrittenThisTick = {
  current: [] as Array<Derived<unknown> | Store<unknown>>,
}

let __isFlushing = false
let __batchDepth = 0
const __pendingUpdates = new Set<Store<unknown>>()

function __flush_internals(
  _writingSignal: Store<unknown>,
  relatedVals: Set<Derived<unknown>>,
) {
  for (const derived of relatedVals) {
    if (__depsThatHaveWrittenThisTick.current.includes(derived)) {
      continue
    }
    
      __depsThatHaveWrittenThisTick.current.push(derived)
      derived.recompute()
      
      const stores = __derivedToStore.get(derived)
      if (stores) {
        for (const store of stores) {
          const relatedLinkedDerivedVals = __storeToDerived.get(store)
          if (!relatedLinkedDerivedVals) continue
          __flush_internals(store, relatedLinkedDerivedVals)
        }
      }
  }
}

/**
 * @private only to be called from `Store` on write
 */
export function __flush(store: Store<unknown>) {
  __pendingUpdates.add(store)
  
  // If we're already in a batch, don't flush yet
  if (__batchDepth > 0) return
  
  if (__isFlushing) return
  
  try {
    __isFlushing = true
    
    // Process all pending updates
    while (__pendingUpdates.size > 0) {
      const stores = Array.from(__pendingUpdates)
      __pendingUpdates.clear()
      
      // First update all derived values
      for (const store of stores) {
        const derivedVals = __storeToDerived.get(store)
        if (!derivedVals) continue
        
        __depsThatHaveWrittenThisTick.current.push(store)
        __flush_internals(store, derivedVals)
      }
      
      // Then notify listeners with updated values
      for (const store of stores) {
        store.listeners.forEach((listener) => listener(store.state as never))
      }
    }
  } finally {
    __isFlushing = false
    __depsThatHaveWrittenThisTick.current = []
  }
}

export function batch(fn: () => void) {
  __batchDepth++
  try {
    fn()
  } finally {
    __batchDepth--
    if (__batchDepth === 0) {
      __flush(Array.from(__pendingUpdates)[0] as Store<unknown>) // Trigger flush of all pending updates
    }
  }
}
