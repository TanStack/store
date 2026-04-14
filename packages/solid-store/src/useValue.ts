import { useSelector } from './useSelector'
import type { Accessor } from 'solid-js'
import type { Atom, ReadonlyAtom, ReadonlyStore, Store } from '@tanstack/store'
import type { UseSelectorOptions } from './useSelector'

/**
 * Subscribes to an atom or store and returns its current value accessor.
 *
 * This is the whole-value counterpart to {@link useSelector}. Use it when the
 * component needs the entire current value from a source.
 *
 * @example
 * ```tsx
 * const count = useValue(countAtom)
 *
 * return <p>{count()}</p>
 * ```
 *
 * @example
 * ```tsx
 * const state = useValue(counterStore)
 * ```
 */
export function useValue<TValue>(
  source:
    | Atom<TValue>
    | ReadonlyAtom<TValue>
    | Store<TValue, any>
    | ReadonlyStore<TValue>,
  options?: UseSelectorOptions<TValue>,
): Accessor<TValue> {
  return useSelector(source, (value) => value, options)
}
