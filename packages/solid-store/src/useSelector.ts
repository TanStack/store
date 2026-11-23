import { createMemo, createSignal, onCleanup } from 'solid-js'
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
  // Values are boxed so Solid treats a selected Promise or function as a
  // plain value instead of an async source or a compute function.
  const [snapshot, setSnapshot] = createSignal(
    { value: source.get() },
    {
      // Stores notify synchronously from wherever `setState` runs, which can
      // be inside an owned scope such as an effect.
      ownedWrite: true,
    },
  )
  // Derived from the snapshot, so the selector reruns on every store update
  // and tracks whichever signals it reads on that run.
  const selection = createMemo(() => ({ value: selector(snapshot().value) }), {
    equals: (a, b) => compare(a.value, b.value),
    sync: true,
  })

  const unsubscribe = source.subscribe((value) => {
    setSnapshot({ value })
  }).unsubscribe

  onCleanup(() => {
    unsubscribe()
  })

  return () => selection().value
}
