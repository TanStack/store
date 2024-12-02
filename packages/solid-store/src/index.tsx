import { onCleanup } from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import type { Derived, Store } from '@tanstack/store'
import type { Accessor } from 'solid-js'

export * from '@tanstack/store'

/**
 * @private
 */
export type NoInfer<T> = [T][T extends any ? 0 : never]

export function useStore<TState, TSelected = NoInfer<TState>>(
  store: Store<TState, any>,
  selector?: (state: NoInfer<TState>) => TSelected,
): Accessor<TSelected>
export function useStore<TState, TSelected = NoInfer<TState>>(
  store: Derived<TState, any>,
  selector?: (state: NoInfer<TState>) => TSelected,
): Accessor<TSelected>
export function useStore<TState, TSelected = NoInfer<TState>>(
  store: Store<TState, any> | Derived<TState, any>,
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
