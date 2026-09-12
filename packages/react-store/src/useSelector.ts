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

type Selector<TSource, TSelected> = (snapshot: TSource) => TSelected

type Compare<TSelected> = (a: TSelected, b: TSelected) => boolean

/**
 * The last selection computed for a component, keyed on the selector, the
 * compare function and the source snapshot that produced it.
 */
type Selection<TSource, TSelected> = {
  selector: Selector<TSource, TSelected>
  compare: Compare<TSelected>
  snapshot: TSource
  selected: TSelected
}

/**
 * The callbacks handed to `useSyncExternalStore` together with the inputs they
 * were built for. The selection record is mutated in place and carried over,
 * so every instance of a component shares it.
 */
type Instance<TSource, TSelected> = {
  source: SelectionSource<TSource>
  selector: Selector<TSource, TSelected>
  compare: Compare<TSelected>
  subscribe: (onStoreChange: () => void) => () => void
  getSnapshot: () => TSelected
  selection: Selection<TSource, TSelected> | null
}

function identity<TSource, TSelected>(snapshot: TSource): TSelected {
  return snapshot as unknown as TSelected
}

function defaultCompare<T>(a: T, b: T) {
  return a === b
}

function createInstance<TSource, TSelected>(
  source: SelectionSource<TSource>,
  selector: Selector<TSource, TSelected>,
  compare: Compare<TSelected>,
  previous: Instance<TSource, TSelected> | null,
): Instance<TSource, TSelected> {
  const instance: Instance<TSource, TSelected> = {
    source,
    selector,
    compare,
    selection: previous === null ? null : previous.selection,
    // `useSyncExternalStore` re-subscribes whenever `subscribe` changes
    // identity, so it is only replaced when the source changes.
    subscribe:
      previous?.source === source
        ? previous.subscribe
        : (onStoreChange) => {
            const subscription = source.subscribe(onStoreChange)

            // Call `unsubscribe` on the subscription so sources that rely on
            // `this` keep working.
            return () => subscription.unsubscribe()
          },
    // The closure captures its inputs instead of reading them from the ref so
    // that a render which suspends with a different selector cannot change
    // what the committed subscription selects. The shared selection record is
    // keyed on the selector and compare identities for the same reason.
    getSnapshot: () => {
      const snapshot = source.get()
      const cached = instance.selection

      if (
        cached !== null &&
        cached.selector === selector &&
        cached.compare === compare &&
        cached.snapshot === snapshot
      ) {
        return cached.selected
      }

      const selected = selector(snapshot)

      if (cached === null) {
        instance.selection = { selector, compare, snapshot, selected }
        return selected
      }

      cached.selector = selector
      cached.compare = compare
      cached.snapshot = snapshot

      // Keep the previous selection's identity when `compare` considers the
      // new one equal so that `useSyncExternalStore` does not re-render the
      // component. Like the former `use-sync-external-store/shim/with-selector`
      // helper, this compares against the previous selection even when the
      // selector identity changed: inline selectors are recreated on every
      // render and must still return the same object when the selection is
      // equal.
      if (!compare(cached.selected, selected)) {
        cached.selected = selected
      }

      return cached.selected
    },
  }

  return instance
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
  selector: Selector<TSource, TSelected> = identity,
  options?: UseSelectorOptions<TSelected>,
): TSelected {
  const compare = options?.compare ?? defaultCompare

  // One ref instead of `useCallback`s: React schedules a passive effect and a
  // consistency check whenever `getSnapshot` changes identity, so it is only
  // rebuilt when its inputs change. With a stable selector, a re-render that
  // leaves the store untouched costs no allocations and no effects.
  const instanceRef = useRef<Instance<TSource, TSelected> | null>(null)
  let instance = instanceRef.current

  if (
    instance === null ||
    instance.source !== source ||
    instance.selector !== selector ||
    instance.compare !== compare
  ) {
    instance = instanceRef.current = createInstance(
      source,
      selector,
      compare,
      instance,
    )
  }

  return useSyncExternalStore(
    instance.subscribe,
    instance.getSnapshot,
    instance.getSnapshot,
  )
}
