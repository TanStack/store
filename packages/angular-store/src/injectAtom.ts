import { injectSelector } from './injectSelector'
import type { Atom } from '@tanstack/store'
import type { InjectSelectorOptions } from './injectSelector'
import type { Signal } from '@angular/core'

/**
 * A callable signal that reads the current atom value when invoked and
 * exposes a `.set` method matching the atom's native setter contract.
 *
 * This is the Angular-idiomatic return type for {@link injectAtom}. It can
 * be used as a class property and called directly in templates.
 *
 * @example
 * ```ts
 * readonly count = injectAtom(countAtom)
 *
 * // read in template: {{ count() }}
 * // write in class:   this.count.set(5)
 * //                   this.count.set(prev => prev + 1)
 * ```
 */
export interface WritableAtomSignal<T> extends Signal<T> {
  /** Set the atom value (accepts a direct value or an updater function). */
  set: Atom<T>['set']
}

/**
 * Returns a {@link WritableAtomSignal} that reads the current atom value when
 * called and exposes a `.set` method for updates.
 *
 * Use this when a component needs to both read and update the same writable
 * atom.
 *
 * @example
 * ```ts
 * readonly count = injectAtom(countAtom)
 *
 * increment() {
 *   this.count.set((prev) => prev + 1)
 * }
 * ```
 */
export function injectAtom<TValue>(
  atom: Atom<TValue> | (() => Atom<TValue>),
  options?: InjectSelectorOptions<TValue>,
): WritableAtomSignal<TValue> {
  // In the future, this could be updated to use a linkedSignal setter
  // https://github.com/angular/angular/pull/68708
  const value = injectSelector(atom, undefined, options) as WritableAtomSignal<TValue>
  value.set = (
    updaterOrValue: TValue | ((prevVal: TValue) => TValue),
  ): void => {
    const _atom = typeof atom === "function" ? atom() : atom
    _atom.set(updaterOrValue as never)
  }
  return value
}
