import type { AnyUpdater, Store } from '@tanstack/store'
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector.js'

export * from '@tanstack/store'
import { shallow } from '@tanstack/shallow'

export type NoInfer<T> = [T][T extends any ? 0 : never]

export function useStore<
  TState,
  TSelected = NoInfer<TState>,
  TUpdater extends AnyUpdater = AnyUpdater,
>(
  store: Store<TState, TUpdater>,
  selector: (state: NoInfer<TState>) => TSelected = (d) => d as any,
) {
  const slice = useSyncExternalStoreWithSelector(
    store.subscribe,
    () => store.state,
    () => store.state,
    selector,
    shallow,
  )

  return slice
}
