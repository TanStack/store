import { useSelector } from './useSelector'
import type { Ref } from 'vue-demi'
import type { Atom, ReadonlyAtom, ReadonlyStore, Store } from '@tanstack/store'
import type { UseSelectorOptions } from './useSelector'

/**
 * Subscribes to an atom or store and returns its current value ref.
 *
 * This is the whole-value counterpart to {@link useSelector}. Use it when the
 * component needs the entire current value from a source.
 *
 * @example
 * ```ts
 * const count = useValue(countAtom)
 * console.log(count.value)
 * ```
 *
 * @example
 * ```ts
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
): Readonly<Ref<TValue>> {
  return useSelector(source, (value) => value, options)
}
