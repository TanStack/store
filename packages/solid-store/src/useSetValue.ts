import type { Atom, Store, StoreActionMap } from '@tanstack/store'

/**
 * Returns a stable setter for a writable atom or store.
 *
 * Writable atoms preserve their native `set` contract. Writable stores
 * preserve their native `setState` contract.
 *
 * @example
 * ```tsx
 * const setCount = useSetValue(countAtom)
 * setCount((prev) => prev + 1)
 * ```
 *
 * @example
 * ```tsx
 * const setState = useSetValue(counterStore)
 * setState((state) => ({ ...state, count: state.count + 1 }))
 * ```
 */
export function useSetValue<TValue>(source: Atom<TValue>): Atom<TValue>['set']
export function useSetValue<TValue, TActions extends StoreActionMap>(
  source: Store<TValue, TActions>,
): Store<TValue, TActions>['setState']
export function useSetValue<TValue, TActions extends StoreActionMap>(
  source: Atom<TValue> | Store<TValue, TActions>,
) {
  return ((valueOrUpdater: TValue | ((prevVal: TValue) => TValue)) => {
    if ('setState' in source) {
      source.setState(valueOrUpdater as (prevVal: TValue) => TValue)
    } else {
      if (typeof valueOrUpdater === 'function') {
        source.set(valueOrUpdater as (prevVal: TValue) => TValue)
      } else {
        source.set(valueOrUpdater)
      }
    }
  }) as Atom<TValue>['set'] | Store<TValue, TActions>['setState']
}
