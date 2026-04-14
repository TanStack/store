import { injectSelector } from './injectSelector'
import type { Signal } from '@angular/core'
import type { Atom, ReadonlyAtom, ReadonlyStore, Store } from '@tanstack/store'
import type { InjectSelectorOptions } from './injectSelector'

/**
 * Returns the current value signal for an atom or store.
 *
 * This is the whole-value counterpart to {@link injectSelector}.
 *
 * @example
 * ```ts
 * readonly count = injectValue(countAtom)
 * ```
 *
 * @example
 * ```ts
 * readonly state = injectValue(counterStore)
 * ```
 */
export function injectValue<TValue>(
  source:
    | Atom<TValue>
    | ReadonlyAtom<TValue>
    | Store<TValue, any>
    | ReadonlyStore<TValue>,
  options?: InjectSelectorOptions<TValue>,
): Signal<TValue> {
  return injectSelector(source, (value) => value, options)
}
