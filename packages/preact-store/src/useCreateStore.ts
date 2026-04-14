import { useState } from 'preact/hooks'
import { createStore } from '@tanstack/store'
// eslint-disable-next-line no-duplicate-imports
import type {
  ReadonlyStore,
  Store,
  StoreActionMap,
  StoreActionsFactory,
} from '@tanstack/store'

type NonFunction<T> = T extends (...args: Array<any>) => any ? never : T

/**
 * Creates a stable store instance for the lifetime of the component.
 *
 * Pass an initial value to create a writable store, or a getter function to
 * create a readonly derived store. This mirrors {@link createStore}, but only
 * creates the store once per component mount.
 *
 * @example
 * ```tsx
 * function Counter() {
 *   const counterStore = useCreateStore({ count: 0 })
 *   const count = useSelector(counterStore, (state) => state.count)
 *   const setState = useSetValue(counterStore)
 *
 *   return (
 *     <button
 *       type="button"
 *       onClick={() => setState((state) => ({ ...state, count: state.count + 1 }))}
 *     >
 *       {count}
 *     </button>
 *   )
 * }
 * ```
 */
export function useCreateStore<T>(
  getValue: (prev?: NoInfer<T>) => T,
): ReadonlyStore<T>
export function useCreateStore<T>(initialValue: T): Store<T>
export function useCreateStore<T, TActions extends StoreActionMap>(
  initialValue: NonFunction<T>,
  actions: StoreActionsFactory<T, TActions>,
): Store<T, TActions>
export function useCreateStore<T, TActions extends StoreActionMap>(
  valueOrFn: T | ((prev?: T) => T),
  actions?: StoreActionsFactory<T, TActions>,
): Store<T, TActions> | Store<T> | ReadonlyStore<T> {
  const [store] = useState<Store<T, TActions> | Store<T> | ReadonlyStore<T>>(
    () => {
      if (typeof valueOrFn === 'function') {
        return createStore(valueOrFn as (prev?: NoInfer<T>) => T)
      }

      if (actions) {
        return createStore(valueOrFn as NonFunction<T>, actions)
      }

      return createStore(valueOrFn)
    },
  )

  return store
}
