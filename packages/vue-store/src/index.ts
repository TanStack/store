import { onWatcherCleanup, shallowRef, toValue, watchEffect } from 'vue'
import type { Derived, Store } from '@tanstack/store'
import type { MaybeRefOrGetter, Ref } from 'vue'

export * from '@tanstack/store'

/**
 * @private
 */
export type NoInfer<T> = [T][T extends any ? 0 : never]

export function useStore<TState, TSelected = NoInfer<TState>>(
  store: MaybeRefOrGetter<Store<TState, any>>,
  selector?: (state: NoInfer<TState>) => TSelected,
): Readonly<Ref<TSelected>>
export function useStore<TState, TSelected = NoInfer<TState>>(
  store: MaybeRefOrGetter<Derived<TState, any>>,
  selector?: (state: NoInfer<TState>) => TSelected,
): Readonly<Ref<TSelected>>
export function useStore<TState, TSelected = NoInfer<TState>>(
  store: MaybeRefOrGetter<Store<TState, any> | Derived<TState, any>>,
  selector: (state: NoInfer<TState>) => TSelected = (d) => d as any,
): Readonly<Ref<TSelected>> {
  const slice = shallowRef() as Ref<TSelected>

  watchEffect(() => {
    const storeValue = toValue(store)
    let sliceRef = selector(storeValue.state)
    slice.value = sliceRef
    const unsub = storeValue.subscribe(() => {
      const newValue = selector(storeValue.state)
      if (shallow(sliceRef, newValue)) return
      sliceRef = newValue
      slice.value = newValue
    })

    onWatcherCleanup(unsub)
  })

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
      if (!objB.has(k) || !Object.is(v, objB.get(k))) return false
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

  for (const keyA of keysA) {
    if (
      !Object.hasOwn(objB, keyA) ||
      !Object.is(objA[keyA as keyof T], objB[keyA as keyof T])
    ) {
      return false
    }
  }
  return true
}
