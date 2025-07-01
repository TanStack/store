import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector.js'
import type { Derived, Store } from '@tanstack/store'

export * from '@tanstack/store'

/**
 * @private
 */
export type NoInfer<T> = [T][T extends any ? 0 : never]

export function useStore<TState, TSelected = NoInfer<TState>>(
  store: Store<TState, any>,
  selector?: (state: NoInfer<TState>) => TSelected,
): TSelected
export function useStore<TState, TSelected = NoInfer<TState>>(
  store: Derived<TState, any>,
  selector?: (state: NoInfer<TState>) => TSelected,
): TSelected
export function useStore<TState, TSelected = NoInfer<TState>>(
  store: Store<TState, any> | Derived<TState, any>,
  selector: (state: NoInfer<TState>) => TSelected = (d) => d as any,
): TSelected {
  const slice = useSyncExternalStoreWithSelector(
    store.subscribe,
    () => store.state,
    () => store.state,
    selector,
    shallow,
  )

  return slice
}

export function shallow<T>(objA: T, objB: T) {
  if (Object.is(objA, objB)) {
    return true
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  if (objA instanceof Map && objB instanceof Map) {
    if (objA.size !== objB.size) return false
    for (const [k, v] of objA) {
      const v2 = objB.get(k)
      if (v instanceof Date && v2 instanceof Date) {
        if (v.getTime() !== v2.getTime()) return false
      } else if (!objB.has(k) || !Object.is(v, v2)) {
        return false
      }
    }
    return true
  }

  if (objA instanceof Set && objB instanceof Set) {
    if (objA.size !== objB.size) return false
    for (const v of objA) {
      if (!objB.has(v)) return false
    }
    return true
  }

  const keysA = Object.keys(objA)
  if (keysA.length !== Object.keys(objB).length) {
    return false
  }

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i] as keyof T
    const valA = objA[key]
    const valB = objB[key]

    if (!Object.prototype.hasOwnProperty.call(objB, key as string)) {
      return false
    }

    if (valA instanceof Date && valB instanceof Date) {
      if (valA.getTime() !== valB.getTime()) return false
    } else if (!Object.is(valA, valB)) {
      return false
    }
  }

  return true
}
