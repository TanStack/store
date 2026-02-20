import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks'
import type { Atom, ReadonlyAtom } from '@tanstack/store'

export * from '@tanstack/store'

type InternalStore = {
  _value: any
  _getSnapshot: () => any
}

type StoreRef = {
  _instance: InternalStore
}

/**
 * This is taken from https://github.com/preactjs/preact/blob/main/compat/src/hooks.js#L8-L54
 * which is taken from https://github.com/facebook/react/blob/main/packages/use-sync-external-store/src/useSyncExternalStoreShimClient.js#L84
 * on a high level this cuts out the warnings, ... and attempts a smaller implementation.
 * This way we don't have to import preact/compat with side effects
 */
function useSyncExternalStore(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => any,
) {
  const value = getSnapshot()

  const [{ _instance }, forceUpdate] = useState<StoreRef>({
    _instance: { _value: value, _getSnapshot: getSnapshot },
  })

  useLayoutEffect(() => {
    _instance._value = value
    _instance._getSnapshot = getSnapshot

    if (didSnapshotChange(_instance)) {
      forceUpdate({ _instance })
    }
  }, [subscribe, value, getSnapshot])

  useEffect(() => {
    if (didSnapshotChange(_instance)) {
      forceUpdate({ _instance })
    }

    return subscribe(() => {
      if (didSnapshotChange(_instance)) {
        forceUpdate({ _instance })
      }
    })
  }, [subscribe])

  return value
}

function didSnapshotChange(inst: {
  _getSnapshot: () => any
  _value: any
}): boolean {
  const latestGetSnapshot = inst._getSnapshot
  const prevValue = inst._value
  try {
    const nextValue = latestGetSnapshot()
    return !Object.is(prevValue, nextValue)
    // eslint-disable-next-line no-unused-vars
  } catch (_error) {
    return true
  }
}

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
  store: Atom<TState> | ReadonlyAtom<TState>,
  selector: (state: NoInfer<TState>) => TSelected = (d) => d as any,
  options: UseStoreOptions<TSelected> = {},
): TSelected {
  const equal = options.equal ?? shallow
  const slice = useSyncExternalStoreWithSelector(
    (onStoreChange) => store.subscribe(onStoreChange).unsubscribe,
    () => store.get(),
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

  const tagA = getToStringTag(objA)
  const tagB = getToStringTag(objB)
  const isTemporal =
    tagA !== undefined &&
    tagB !== undefined &&
    tagA === tagB &&
    tagA.startsWith('Temporal.')

  if (isTemporal && hasEquals(objA) && hasEquals(objB)) {
    try {
      return objA.equals(objB)
    } catch {
      return false
    }
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

function hasEquals<TValue>(
  value: TValue,
): value is TValue & { equals: (other: unknown) => boolean } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'equals' in (value as object) &&
    typeof (value as any).equals === 'function'
  )
}

function getToStringTag(value: unknown): string | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const tag = (value as any)[Symbol.toStringTag]
  return typeof tag === 'string' ? tag : undefined
}

function getOwnKeys(obj: object): Array<string | symbol> {
  return (Object.keys(obj) as Array<string | symbol>).concat(
    Object.getOwnPropertySymbols(obj),
  )
}
