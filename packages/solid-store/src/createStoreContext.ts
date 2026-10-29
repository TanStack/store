import { createComponent, createContext, useContext } from 'solid-js'
import type { Element, ParentProps } from 'solid-js'

/**
 * Creates a typed Solid context for sharing a bundle of atoms and stores with a
 * subtree.
 *
 * The returned `StoreProvider` only transports the provided object through
 * Solid context. Consumers destructure the contextual atoms and stores, then
 * compose them with the existing hooks like {@link useSelector} and
 * {@link useAtom}.
 *
 * The object shape is preserved exactly, so keyed atoms and stores remain fully
 * typed when read back with `useStoreContext()`.
 *
 * @example
 * ```tsx
 * const { StoreProvider, useStoreContext } = createStoreContext<{
 *   countAtom: Atom<number>
 *   totalsStore: Store<{ count: number }>
 * }>()
 *
 * function CountButton() {
 *   const { countAtom, totalsStore } = useStoreContext()
 *   const count = useSelector(countAtom)
 *   const total = useSelector(totalsStore, (state) => state.count)
 *
 *   return (
 *     <button
 *       type="button"
 *       onClick={() =>
 *         totalsStore.setState((state) => ({ ...state, count: state.count + 1 }))
 *       }
 *     >
 *       {count()} / {total()}
 *     </button>
 *   )
 * }
 * ```
 *
 * @throws When `useStoreContext()` is called outside the matching `StoreProvider`.
 */
export function createStoreContext<TValue extends object>(): {
  StoreProvider: (props: ParentProps<{ value: TValue }>) => Element
  useStoreContext: () => TValue
} {
  // `null` default: Solid 2 throws its own error for a default-less context,
  // and this keeps the clearer message below.
  const Context = createContext<TValue | null>(null)

  // Built without JSX so the adapter only depends on `solid-js`, not on the
  // `@solidjs/web` renderer that compiled JSX imports from.
  function StoreProvider(props: ParentProps<{ value: TValue }>) {
    return createComponent(Context, {
      get value() {
        return props.value
      },
      get children() {
        return props.children
      },
    })
  }

  function useStoreContext(): TValue {
    const value = useContext(Context)

    if (value === null) {
      throw new Error('Missing StoreProvider for StoreContext')
    }

    return value
  }

  return {
    StoreProvider,
    useStoreContext,
  }
}
