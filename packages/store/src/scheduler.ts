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

function __flush_internals(
  _writingSignal: Store<unknown>,
  relatedVals: Set<Derived<unknown>>,
) {
  try {
    if (__depsThatHaveWrittenThisTick.current.length >= relatedVals.size) {
      return
    }
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
  } finally {
    __depsThatHaveWrittenThisTick.current = []
  }
}

/**
 * @private only to be called from `Store` on write
 */
export function __flush(store: Store<unknown>) {
  try {
    store.listeners.forEach((listener) => listener(0 as never))
    if (__isFlushing) return
    __isFlushing = true
    const derivedVals = __storeToDerived.get(store)
    if (!derivedVals) return
    __depsThatHaveWrittenThisTick.current.push(store)
    __flush_internals(store, derivedVals)
  } finally {
    __isFlushing = false
  }
}
