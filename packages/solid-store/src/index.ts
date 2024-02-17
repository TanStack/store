import { onCleanup } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import type { AnyUpdater, Store } from '@tanstack/store'
import type { Accessor } from 'solid-js'

export * from '@tanstack/store'

export type NoInfer<T> = [T][T extends any ? 0 : never]

export function useStore<
  TState,
  TSelected = NoInfer<TState>,
  TUpdater extends AnyUpdater = AnyUpdater,
>(
  store: Store<TState, TUpdater>,
  selector: (state: NoInfer<TState>) => TSelected = (d) => d as any,
): Accessor<TSelected> {
  const [slice, setSlice] = createStore({
    value: selector(store.state),
  })

  const unsub = store.subscribe(() => {
    const newValue = selector(store.state)
    setSlice('value', reconcile(newValue))
  })

  onCleanup(() => {
    unsub()
  })

  return () => slice.value
}
