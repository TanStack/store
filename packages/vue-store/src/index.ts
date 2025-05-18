import { readonly, ref, toRaw, toValue, watch } from 'vue-demi'
import type { Derived, Store } from '@tanstack/store'
import type { MaybeRefOrGetter, Ref } from 'vue-demi'

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
  store: MaybeRefOrGetter<Store<TState, any>> | MaybeRefOrGetter<Derived<TState, any>>,
  selector: (state: NoInfer<TState>) => TSelected = (d) => d as any,
): Readonly<Ref<TSelected>> {
  const slice = ref<TSelected>(selector(toValue(store).state))

  watch(
    () => toValue(store),
    (value, _oldValue, onCleanup) => {
      const unsub = value.subscribe(() => {
        const data = selector(value.state)
        if (shallow(toRaw(slice.value), data)) {
          return
        }
        slice.value = data
      })

      onCleanup(() => {
        unsub()
      })
    },
    { immediate: true },
  )

  return readonly(slice) as never
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

  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i] as string) ||
      !Object.is(objA[keysA[i] as keyof T], objB[keysA[i] as keyof T])
    ) {
      return false
    }
  }
  return true
}
