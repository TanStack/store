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
 * Omit the selector to subscribe to the whole value.
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
 * const value = useSelector(countAtom)
 * ```
 */
export function useSelector<TSource, TSelected = NoInfer<TSource>>(
  source: SelectionSource<TSource>,
  selector: (snapshot: TSource) => TSelected = (s) => s as unknown as TSelected,
  options?: UseSelectorOptions<TSelected>,
): Accessor<TSelected> {
  const compare = options?.compare ?? defaultCompare
  const initial = selector(source.get())
  // Solid 2 reads a function passed to `createSignal` as a compute function,
  // so a selected function value is wrapped to stay a plain value.
  const [signal, setSignal] = createSignal<TSelected>(
    (typeof initial === 'function' ? () => initial : initial) as any,
    {
      equals: compare,
      // Stores notify synchronously from wherever `setState` runs, which can
      // be inside an owned scope such as an effect.
      ownedWrite: true,
    },
  )

  const unsubscribe = source.subscribe((snapshot) => {
    setSignal(() => selector(snapshot))
  }).unsubscribe

  onCleanup(() => {
    unsubscribe()
  })

  return signal
}
