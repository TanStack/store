import { useRef, useSyncExternalStore } from 'react'

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
 * Per-component state, mutated in place. The inputs and the callbacks built
 * for them are written during render; the selection is written by whichever
 * `getSnapshot` closure computed it last and is keyed on that closure.
 */
type Instance<TSource, TSelected> = {
  source?: SelectionSource<TSource>
  selector?: (snapshot: TSource) => TSelected
  compare?: (a: TSelected, b: TSelected) => boolean
  subscribe?: (onStoreChange: () => void) => () => void
  getSnapshot?: () => TSelected
  owner: (() => TSelected) | null
  snapshot?: TSource
  selected?: TSelected
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

  // One ref instead of `useCallback`s. `useSyncExternalStore` re-subscribes
  // whenever `subscribe` changes identity and schedules a passive effect plus
  // a consistency check whenever `getSnapshot` does, so both are only rebuilt
  // when their inputs change. With a stable selector, a re-render that leaves
  // the store untouched costs no allocations and no effects.
  const instanceRef = useRef<Instance<TSource, TSelected> | null>(null)
  const instance =
    instanceRef.current ?? (instanceRef.current = { owner: null })
  const sourceChanged = instance.source !== source

  if (sourceChanged) {
    instance.subscribe = (onStoreChange) => {
      const subscription = source.subscribe(onStoreChange)

      // Call `unsubscribe` on the subscription so sources that rely on `this`
      // keep working.
      return () => subscription.unsubscribe()
    }
  }

  if (
    sourceChanged ||
    instance.selector !== selector ||
    instance.compare !== compare
  ) {
    instance.source = source
    instance.selector = selector
    instance.compare = compare

    // The closure captures its inputs instead of reading them from the
    // instance so that a render which suspends with a different selector
    // cannot change what the committed subscription selects. The selection is
    // keyed on the closure for the same reason.
    const getSnapshot = () => {
      const snapshot = source.get()

      if (instance.owner !== getSnapshot || instance.snapshot !== snapshot) {
        const selected = selector(snapshot)

        // Keep the previous selection's identity when `compare` considers the
        // new one equal so that `useSyncExternalStore` does not re-render the
        // component. Like the former `use-sync-external-store/shim/with-selector`
        // helper, this compares against the previous selection even when the
        // selector identity changed: inline selectors are recreated on every
        // render and must still return the same object when the selection is
        // equal.
        if (
          instance.owner === null ||
          !compare(instance.selected as TSelected, selected)
        ) {
          instance.selected = selected
        }

        instance.owner = getSnapshot
        instance.snapshot = snapshot
      }

      return instance.selected as TSelected
    }

    instance.getSnapshot = getSnapshot
  }

  return useSyncExternalStore(
    instance.subscribe!,
    instance.getSnapshot!,
    instance.getSnapshot,
  )
}
