import { useCallback } from 'react'
import type { Atom, Store } from '@tanstack/store'

/**
 * Returns a stable setter for a writable atom or store.
 *
 * Writable atoms preserve their native `set` contract, supporting both direct
 * values and updater functions. Writable stores preserve their native
 * `setState` contract, supporting updater functions.
 *
 * @example
 * ```tsx
 * const setCount = useSetValue(countAtom)
 * setCount((prev) => prev + 1)
 * ```
 *
 * @example
 * ```tsx
 * const setState = useSetValue(appStore)
 * setState((prev) => ({ ...prev, count: prev.count + 1 }))
 * ```
 */
export function useSetValue<TValue>(source: Atom<TValue>): Atom<TValue>['set']
export function useSetValue<TValue>(
  source: Store<TValue>,
): Store<TValue>['setState']
export function useSetValue<TValue>(source: Atom<TValue> | Store<TValue>) {
  return useCallback<Atom<TValue>['set'] | Store<TValue>['setState']>(
    (valueOrUpdater: TValue | ((prevVal: TValue) => TValue)) => {
      if ('setState' in source) {
        source.setState(valueOrUpdater as (prevVal: TValue) => TValue)
      } else {
        if (typeof valueOrUpdater === 'function') {
          source.set(valueOrUpdater as (prevVal: TValue) => TValue)
        } else {
          source.set(valueOrUpdater)
        }
      }
    },
    [source],
  )
}
