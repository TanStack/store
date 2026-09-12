import { useCallback, useRef, useSyncExternalStore } from 'react'

export interface UseSelectorOptions<TSelected> {
  compare?: (a: TSelected, b: TSelected) => boolean
}

type SelectionSource<T> = {
  get: () => T
  subscribe: (listener: (value: T) => void) => {
    unsubscribe: () => void
  }
}

/**
 * The last selection computed for a component, keyed on the selector and the
 * source snapshot that produced it.
 */
type Selection<TSource, TSelected> = {
  selector: (snapshot: TSource) => TSelected
  snapshot: TSource
  selected: TSelected
}

function identity<TSource, TSelected>(snapshot: TSource): TSelected {
  return snapshot as unknown as TSelected
}

function defaultCompare<T>(a: T, b: T) {
  return a === b
}

/**
 * Selects a slice of state from an atom or store and subscribes the component
 * to that selection.
 *
 * This is the primary React read hook for TanStack Store. It works with any
 * source that exposes `get()` and `subscribe()`, including atoms, readonly
 * atoms, stores, and readonly stores.
 *
 * Omit the selector to subscribe to the whole value.
 *
 * @example
 * ```tsx
 * const count = useSelector(counterStore, (state) => state.count)
 * ```
 *
 * @example
 * ```tsx
 * const value = useSelector(countAtom)
 * ```
 */
export function useSelector<TSource, TSelected = NoInfer<TSource>>(
  source: SelectionSource<TSource>,
  selector: (snapshot: TSource) => TSelected = identity,
  options?: UseSelectorOptions<TSelected>,
): TSelected {
  const compare = options?.compare ?? defaultCompare

  // `useSyncExternalStore` re-subscribes in a passive effect whenever
  // `subscribe` changes identity, so it is the one callback worth memoizing.
  // The cleanup calls `unsubscribe` on the subscription object so that sources
  // whose `unsubscribe` relies on `this` keep working.
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const subscription = source.subscribe(onStoreChange)

      return () => {
        subscription.unsubscribe()
      }
    },
    [source],
  )

  const selectionRef = useRef<Selection<TSource, TSelected> | null>(null)

  // `getSnapshot` is a plain closure: it must read this render's `selector` and
  // `compare`, which are usually inline and would defeat a `useCallback`
  // anyway. React only compares it to decide whether to re-check the store
  // after commit, so a fresh identity per render is cheap.
  //
  // The memo is keyed on the selector identity as well as the snapshot so that
  // a render that suspends with a different selector cannot poison the
  // selection of the committed selector, which stays subscribed meanwhile.
  const getSnapshot = () => {
    const snapshot = source.get()
    const cached = selectionRef.current

    if (
      cached !== null &&
      cached.selector === selector &&
      cached.snapshot === snapshot
    ) {
      return cached.selected
    }

    const selected = selector(snapshot)

    if (cached === null) {
      selectionRef.current = { selector, snapshot, selected }
      return selected
    }

    cached.selector = selector
    cached.snapshot = snapshot

    // Keep the previous selection's identity when `compare` considers the new
    // one equal so that `useSyncExternalStore` does not re-render the component.
    // Like the former `use-sync-external-store/shim/with-selector` helper, this
    // compares against the previous selection even when the selector identity
    // changed: inline selectors are recreated on every render and must still
    // return the same object when the selection is equal.
    if (!compare(cached.selected, selected)) {
      cached.selected = selected
    }

    return cached.selected
  }

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
