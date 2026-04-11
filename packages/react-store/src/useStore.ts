import { useSelector } from './useSelector'

/**
 * Deprecated alias for {@link useSelector}.
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
) => useSelector(source, selector, { compare })
