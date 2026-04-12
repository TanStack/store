import { useSelector } from './useSelector'
import type { Atom, ReadonlyAtom, ReadonlyStore, Store } from '@tanstack/store'
// eslint-disable-next-line no-duplicate-imports
import type { UseSelectorOptions } from './useSelector'

/**
 * Subscribes to an atom or store and returns its current value.
 *
 * This is the whole-value counterpart to {@link useSelector}. Use it when the
 * component needs the entire current value from a source.
 *
 * @example
 * ```tsx
 * const count = useValue(countAtom)
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
): TValue {
  return useSelector(source, (value) => value, options)
}
