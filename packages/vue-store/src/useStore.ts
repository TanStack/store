import { useSelector } from './useSelector'
import type { Ref } from 'vue-demi'

/**
 * Deprecated alias for {@link useSelector}.
 *
 * @example
 * ```ts
 * const count = useStore(counterStore, (state) => state.count)
 * ```
 *
 * @deprecated Use `useSelector` instead.
 */
export const useStore = <TSource, TSelected>(
  source: {
    get: () => TSource
    subscribe: (listener: (value: TSource) => void) => {
      unsubscribe: () => void
    }
  },
  selector: (snapshot: TSource) => TSelected,
  compare?: (a: TSelected, b: TSelected) => boolean,
): Readonly<Ref<TSelected>> => useSelector(source, selector, { compare })
