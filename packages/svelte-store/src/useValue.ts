import { useSelector } from './useSelector.svelte.js'
import type { Atom, ReadonlyAtom, ReadonlyStore, Store } from '@tanstack/store'
import type { UseSelectorOptions } from './useSelector.svelte.js'

/**
 * Subscribes to an atom or store and returns its whole current value through a
 * rune-friendly holder object.
 *
 * @example
 * ```ts
 * const count = useValue(countAtom)
 * console.log(count.current)
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
): { readonly current: TValue } {
  return useSelector(source, (value) => value, options)
}
