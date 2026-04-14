import { useSelector } from './useSelector'
import type { Ref } from 'vue-demi'
import type { Store, StoreActionMap } from '@tanstack/store'
import type { UseSelectorOptions } from './useSelector'

/**
 * Experimental combined read+write hook for stores, mirroring useAtom's tuple
 * pattern.
 *
 * Returns `[selected, actions]` when the store has an actions factory, or
 * `[selected, setState]` for plain stores.
 *
 * @example
 * ```ts
 * // Store with actions
 * const [cats, { addCat }] = _useStore(petStore, (s) => s.cats)
 * console.log(cats.value)
 *
 * // Store without actions
 * const [count, setState] = _useStore(plainStore, (s) => s)
 * setState((prev) => prev + 1)
 * ```
 */
export function _useStore<
  TState,
  TActions extends StoreActionMap,
  TSelected = NoInfer<TState>,
>(
  store: Store<TState, TActions>,
  selector: (state: NoInfer<TState>) => TSelected,
  options?: UseSelectorOptions<TSelected>,
): [
  Readonly<Ref<TSelected>>,
  [TActions] extends [never] ? Store<TState>['setState'] : TActions,
] {
  const selected = useSelector(store, selector, options)
  const actionsOrSetState =
    (store.actions as StoreActionMap | undefined) ?? store.setState

  return [selected, actionsOrSetState] as any
}
