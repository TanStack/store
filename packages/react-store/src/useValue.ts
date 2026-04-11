import { useSelector } from './useSelector'
import type { Atom, ReadonlyAtom, ReadonlyStore, Store } from '@tanstack/store'
import type { UseSelectorOptions } from './useSelector'

/**
 * Subscribes to an atom or store and returns its current value.
 *
 * This is the whole-value counterpart to {@link useSelector}. Use it when a
 * component needs the entire current value from a writable or readonly atom or
 * store. Pass `options.compare` to suppress rerenders when successive values
 * should be treated as equivalent.
 *
 * @example
 * ```tsx
 * const count = useValue(countAtom)
 * ```
 *
 * @example
 * ```tsx
 * const state = useValue(appStore)
 * ```
 */
export function useValue<TValue>(
  source:
    | Atom<TValue>
    | ReadonlyAtom<TValue>
    | Store<TValue>
    | ReadonlyStore<TValue>,
  options?: UseSelectorOptions<TValue>,
): TValue {
  return useSelector(source, (value) => value, options)
}
