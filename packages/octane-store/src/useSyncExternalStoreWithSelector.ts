// Port of React's `use-sync-external-store/with-selector` shim onto Octane's
// native useSyncExternalStore. The selection is recomputed only when the
// snapshot changes; when `isEqual` accepts the next selection, the previous
// reference is retained so the external-store hook does not re-render.
import { useEffect, useMemo, useRef, useSyncExternalStore } from 'octane'
import { subSlot } from './internal'

export function useSyncExternalStoreWithSelector<TSnapshot, TSelection>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => TSnapshot,
  getServerSnapshot: undefined | null | (() => TSnapshot),
  selector: (snapshot: TSnapshot) => TSelection,
  isEqual?: (a: TSelection, b: TSelection) => boolean,
  slot?: symbol,
): TSelection {
  const instRef = useRef<{
    hasValue: boolean
    value: TSelection | null
  } | null>(null, subSlot(slot, 'ws:inst'))
  let inst: { hasValue: boolean; value: TSelection | null }
  if (instRef.current === null) {
    inst = { hasValue: false, value: null }
    instRef.current = inst
  } else {
    inst = instRef.current
  }

  const [getSelection, getServerSelection] = useMemo(
    () => {
      let hasMemo = false
      let memoizedSnapshot: TSnapshot
      let memoizedSelection: TSelection
      const memoizedSelector = (nextSnapshot: TSnapshot): TSelection => {
        if (!hasMemo) {
          hasMemo = true
          memoizedSnapshot = nextSnapshot
          const nextSelection = selector(nextSnapshot)
          if (isEqual !== undefined && inst.hasValue) {
            const currentSelection = inst.value as TSelection
            if (isEqual(currentSelection, nextSelection)) {
              return (memoizedSelection = currentSelection)
            }
          }
          return (memoizedSelection = nextSelection)
        }
        const currentSelection = memoizedSelection
        if (Object.is(memoizedSnapshot, nextSnapshot)) return currentSelection
        const nextSelection = selector(nextSnapshot)
        if (isEqual !== undefined && isEqual(currentSelection, nextSelection)) {
          memoizedSnapshot = nextSnapshot
          return currentSelection
        }
        memoizedSnapshot = nextSnapshot
        return (memoizedSelection = nextSelection)
      }
      const maybeGetServerSnapshot =
        getServerSnapshot === undefined ? null : getServerSnapshot
      return [
        () => memoizedSelector(getSnapshot()),
        maybeGetServerSnapshot === null
          ? undefined
          : () => memoizedSelector(maybeGetServerSnapshot()),
      ] as const
    },
    [getSnapshot, getServerSnapshot, selector, isEqual],
    subSlot(slot, 'ws:memo'),
  )

  const value = useSyncExternalStore(
    subscribe,
    getSelection,
    getServerSelection ?? getSelection,
    subSlot(slot, 'ws:uses'),
  )

  useEffect(
    () => {
      inst.hasValue = true
      inst.value = value
    },
    [value],
    subSlot(slot, 'ws:eff'),
  )

  return value
}
