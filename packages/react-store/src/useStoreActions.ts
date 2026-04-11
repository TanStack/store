import { useMemo } from 'react'
import type { Store, StoreActionMap } from '@tanstack/store'

/**
 * Returns the stable actions bag from a writable store created with actions.
 *
 * Use this when a component only needs to call store actions and should not
 * subscribe to state changes.
 *
 * @example
 * ```tsx
 * const actions = useStoreActions(counterStore)
 * actions.inc()
 * ```
 */
export function useStoreActions<TValue, TActions extends StoreActionMap>(
  store: Store<TValue, TActions>,
): TActions {
  return useMemo(() => store.actions, [store])
}
