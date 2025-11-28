import { useSyncExternalStore } from 'preact/compat'
import { useRef } from 'preact/hooks'
import type { Derived, Store } from '@tanstack/store'

export * from '@tanstack/store'

/**
 * @private
 */
export type NoInfer<T> = [T][T extends any ? 0 : never]
type EqualityFn<T> = (objA: T, objB: T) => boolean
interface UseStoreOptions<T> {
  equal?: EqualityFn<T>
}

function useSyncExternalStoreWithSelector<TSnapshot, TSelected>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => TSnapshot,
  selector: (snapshot: TSnapshot) => TSelected,
  isEqual: (a: TSelected, b: TSelected) => boolean,
): TSelected {
  const selectedSnapshotRef = useRef<TSelected | undefined>()

  const getSelectedSnapshot = () => {
    const snapshot = getSnapshot()
    const selected = selector(snapshot)

    if (
      selectedSnapshotRef.current === undefined ||
      !isEqual(selectedSnapshotRef.current, selected)
    ) {
      selectedSnapshotRef.current = selected
    }

    return selectedSnapshotRef.current
  }

  return useSyncExternalStore(subscribe, getSelectedSnapshot)
}

export function useStore<TState, TSelected = NoInfer<TState>>(
  store: Store<TState, any>,
  selector?: (state: NoInfer<TState>) => TSelected,
  options?: UseStoreOptions<TSelected>,
): TSelected
export function useStore<TState, TSelected = NoInfer<TState>>(
  store: Derived<TState, any>,
  selector?: (state: NoInfer<TState>) => TSelected,
  options?: UseStoreOptions<TSelected>,
): TSelected
export function useStore<TState, TSelected = NoInfer<TState>>(
  store: Store<TState, any> | Derived<TState, any>,
  selector: (state: NoInfer<TState>) => TSelected = (d) => d as any,
  options: UseStoreOptions<TSelected> = {},
): TSelected {
  const equal = options.equal ?? shallow
  const slice = useSyncExternalStoreWithSelector(
    store.subscribe,
    () => store.state,
    selector,
    equal,
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

  const keysA = getOwnKeys(objA)
  if (keysA.length !== getOwnKeys(objB).length) {
    return false
  }

  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, key as string) ||
      !Object.is(objA[key as keyof T], objB[key as keyof T])
    ) {
      return false
    }
  }
  return true
}

function getOwnKeys(obj: object): Array<string | symbol> {
  return (Object.keys(obj) as Array<string | symbol>).concat(
    Object.getOwnPropertySymbols(obj),
  )
}
