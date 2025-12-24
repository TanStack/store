import { createSignal, onCleanup } from 'solid-js'
import type { Accessor } from 'solid-js'
import type { Atom, ReadonlyAtom } from '@xstate/store'

export * from '@tanstack/store'

/**
 * @private
 */
export type NoInfer<T> = [T][T extends any ? 0 : never]
type EqualityFn<T> = (objA: T, objB: T) => boolean
interface UseStoreOptions<T> {
  equal?: EqualityFn<T>
}

export function useStore<TState, TSelected = NoInfer<TState>>(
  store: Atom<TState> | ReadonlyAtom<TState>,
  selector: (state: NoInfer<TState>) => TSelected = (d) => d as any,
  options: UseStoreOptions<TSelected> = {},
): Accessor<TSelected> {
  const [signal, setSignal] = createSignal(selector(store.get()))
  const equal = options.equal ?? shallow

  const unsub = store.subscribe((s) => {
    const data = selector(s)
    if (equal(signal(), data)) {
      return
    }
    setSignal(() => data)
  }).unsubscribe

  onCleanup(() => {
    unsub()
  })

  return signal
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

  if (objA instanceof Date && objB instanceof Date) {
    if (objA.getTime() !== objB.getTime()) return false
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
