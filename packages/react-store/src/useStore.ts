import { useCallback } from 'react'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'
import type { AnyAtom } from '@tanstack/store'

type SyncExternalStoreSubscribe = Parameters<
  typeof useSyncExternalStoreWithSelector
>[0]

/** Comparator using Object.is to correctly handle NaN and -0 edge cases. */
function defaultCompare<T>(a: T, b: T) {
  return Object.is(a, b)
}

export function useStore<TAtom extends AnyAtom | undefined, T>(
  atom: TAtom,
  selector: (
    snapshot: TAtom extends { get: () => infer TSnapshot }
      ? TSnapshot
      : undefined,
  ) => T,
  compare: (a: T, b: T) => boolean = defaultCompare,
): T {
  const subscribe: SyncExternalStoreSubscribe = useCallback(
    (handleStoreChange) => {
      if (!atom) {
        return () => {}
      }
      const { unsubscribe } = atom.subscribe(handleStoreChange)
      return unsubscribe
    },
    [atom],
  )

  const boundGetSnapshot = useCallback(() => atom?.get(), [atom])

  const selectedSnapshot = useSyncExternalStoreWithSelector(
    subscribe,
    boundGetSnapshot,
    boundGetSnapshot,
    selector,
    compare,
  )

  return selectedSnapshot
}
