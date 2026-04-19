import { untracked } from '@angular/core'
import { injectSelector } from './injectSelector'
import type { Signal } from '@angular/core'
import type { Store, StoreActionMap } from '@tanstack/store'
import type { InjectSelectorOptions } from './injectSelector'

type WritableStoreSliceSignal<
  TState,
  TSelected,
  TActions extends StoreActionMap,
> = Signal<TSelected> &
  ([TActions] extends [never]
    ? Pick<Store<TState>, 'setState'>
    : TActions)

/**
 * Experimental combined read+write injection function for stores, mirroring
 * injectAtom's pattern.
 * 
 * Returns a callable slice with methods when the store has an actions factory, or
 * with only the setState method for plain stores.
 *
 * @example
 * ```ts
 * // Store with actions
 * readonly dogs = _injectStore(petStore, (s) => s.dogs)
 * // dogs() and dogs.addDog()
 *
 * // Store without actions
 * readonly value = _injectStore(plainStore, (s) => s)
 * // value() and value.setState(...)
 * ```
 */
export function _injectStore<
  TState,
  TActions extends StoreActionMap,
  TSelected = NoInfer<TState>,
>(
  store: Store<TState, TActions> | (() => Store<TState, TActions>),
  selector: (state: NoInfer<TState>) => TSelected,
  options?: InjectSelectorOptions<TSelected>,
): WritableStoreSliceSignal<TState, TSelected, TActions> {
  const selected = injectSelector(store, selector, options)

  return new Proxy(selected, {
    apply: () => selected(),
    get(_target, prop, receiver) {
      const inst = untracked(() =>
        typeof store === 'function' ? store() : store,
      )

      const actions = inst.actions as StoreActionMap | undefined

      if (actions != null && typeof actions === 'object') {
        const method = Reflect.get(actions, prop, actions)
        if (Object.hasOwn(actions, prop) && typeof method === 'function') {
          return method
        }
      } else if (prop === 'setState' && typeof inst.setState === 'function') {
        return inst.setState
      }

      return Reflect.get(selected, prop, receiver)
    },
  }) as WritableStoreSliceSignal<TState, TSelected, TActions>
}
