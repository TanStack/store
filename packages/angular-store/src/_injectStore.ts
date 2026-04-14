import { injectSelector } from './injectSelector'
import type { Signal } from '@angular/core'
import type { Store, StoreActionMap } from '@tanstack/store'
import type { InjectSelectorOptions } from './injectSelector'

/**
 * Experimental combined read+write injection function for stores, mirroring
 * injectAtom's pattern.
 *
 * Returns `[signal, actions]` when the store has an actions factory, or
 * `[signal, setState]` for plain stores.
 *
 * @example
 * ```ts
 * // Store with actions
 * readonly result = _injectStore(petStore, (s) => s.cats)
 * // result[0] is Signal<number>, result[1] is actions
 *
 * // Store without actions
 * readonly result = _injectStore(plainStore, (s) => s)
 * // result[0] is Signal<number>, result[1] is setState
 * ```
 */
export function _injectStore<
  TState,
  TActions extends StoreActionMap,
  TSelected = NoInfer<TState>,
>(
  store: Store<TState, TActions>,
  selector: (state: NoInfer<TState>) => TSelected,
  options?: InjectSelectorOptions<TSelected>,
): [
  Signal<TSelected>,
  [TActions] extends [never] ? Store<TState>['setState'] : TActions,
] {
  const selected = injectSelector(store, selector, options)
  const actionsOrSetState =
    (store.actions as StoreActionMap | undefined) ?? store.setState

  return [selected, actionsOrSetState] as any
}
