import type { Store } from './store'
import type { Derived } from './derived'

/**
 * What store called the current update, if any
 * @private
 */
export const __whatStoreIsCurrentlyInUse = {
  current: null as Store<unknown> | null,
}

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

export const __depsThatHaveWrittenThisTick = [] as Array<
  Derived<unknown> | Store<unknown>
>
