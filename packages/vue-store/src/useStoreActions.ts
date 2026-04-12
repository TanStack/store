import type { Store, StoreActionMap } from '@tanstack/store'

/**
 * Returns the stable actions bag from a writable store created with actions.
 *
 * Use this when a component only needs to call store actions and should not
 * subscribe to store state.
 *
 * @example
 * ```ts
 * const actions = useStoreActions(counterStore)
 * actions.increment()
 * ```
 */
export function useStoreActions<TValue, TActions extends StoreActionMap>(
  store: Store<TValue, TActions>,
): TActions {
  return store.actions
}
