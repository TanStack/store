import { useSelector } from './useSelector.svelte.js'
import type { Atom, ReadonlyAtom, ReadonlyStore, Store } from '@tanstack/store'

/**
 * Deprecated alias for {@link useSelector}.
 *
 * @example
 * ```ts
 * const count = useStore(counterStore, (state) => state.count)
 * console.log(count.current)
 * ```
 *
 * @deprecated Use `useSelector` instead.
 */
export const useStore = <TState, TSelected = NoInfer<TState>>(
  source:
    | Atom<TState>
    | ReadonlyAtom<TState>
    | Store<TState, any>
    | ReadonlyStore<TState>,
  selector: (state: NoInfer<TState>) => TSelected = (d) => d as any,
  compare?: (a: TSelected, b: TSelected) => boolean,
) => useSelector(source, selector, { compare })
