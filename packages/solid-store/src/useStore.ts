import { useSelector } from './useSelector'
import type { Accessor } from 'solid-js'

/**
 * Deprecated alias for {@link useSelector}.
 *
 * @example
 * ```tsx
 * const count = useStore(counterStore, (state) => state.count)
 * ```
 *
 * @deprecated Use `useSelector` instead.
 */
export const useStore = <TSource, TSelected = NoInfer<TSource>>(
  source: {
    get: () => TSource
    subscribe: (listener: (value: TSource) => void) => {
      unsubscribe: () => void
    }
  },
  selector: (snapshot: TSource) => TSelected = (value) =>
    value as unknown as TSelected,
  compare?: (a: TSelected, b: TSelected) => boolean,
): Accessor<TSelected> => useSelector(source, selector, { compare })
