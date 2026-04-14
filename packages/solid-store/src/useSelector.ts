import { createSignal, onCleanup } from 'solid-js'
import type { Accessor } from 'solid-js'

export interface UseSelectorOptions<TSelected> {
  compare?: (a: TSelected, b: TSelected) => boolean
}

type SelectionSource<T> = {
  get: () => T
  subscribe: (listener: (value: T) => void) => {
    unsubscribe: () => void
  }
}

function defaultCompare<T>(a: T, b: T) {
  return a === b
}

/**
 * Selects a slice of state from an atom or store and subscribes the component
 * to that selection.
 *
 * This is the primary Solid read hook for TanStack Store. It returns a Solid
 * accessor so consumers can read the selected value reactively.
 *
 * @example
 * ```tsx
 * const count = useSelector(counterStore, (state) => state.count)
 *
 * return <p>{count()}</p>
 * ```
 *
 * @example
 * ```tsx
 * const doubled = useSelector(countAtom, (value) => value * 2)
 * ```
 */
export function useSelector<TSource, TSelected>(
  source: SelectionSource<TSource>,
  selector: (snapshot: TSource) => TSelected,
  options?: UseSelectorOptions<TSelected>,
): Accessor<TSelected> {
  const compare = options?.compare ?? defaultCompare
  const [signal, setSignal] = createSignal(selector(source.get()), {
    equals: compare,
  })

  const unsubscribe = source.subscribe((snapshot) => {
    setSignal(() => selector(snapshot))
  }).unsubscribe

  onCleanup(() => {
    unsubscribe()
  })

  return signal
}
