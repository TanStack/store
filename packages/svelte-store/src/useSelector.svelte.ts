import type { Atom, ReadonlyAtom, ReadonlyStore, Store } from '@tanstack/store'

export interface UseSelectorOptions<TSelected> {
  compare?: (a: TSelected, b: TSelected) => boolean
}

function defaultCompare<T>(a: T, b: T) {
  return a === b
}

/**
 * Selects a slice of state from an atom or store and exposes it through a
 * rune-friendly holder object.
 *
 * Read the selected value from `.current`.
 *
 * @example
 * ```ts
 * const count = useSelector(counterStore, (state) => state.count)
 * console.log(count.current)
 * ```
 *
 * @example
 * ```ts
 * const doubled = useSelector(countAtom, (value) => value * 2)
 * ```
 */
export function useSelector<TState, TSelected = NoInfer<TState>>(
  source:
    | Atom<TState>
    | ReadonlyAtom<TState>
    | Store<TState, any>
    | ReadonlyStore<TState>,
  selector: (state: NoInfer<TState>) => TSelected = (d) => d as any,
  options: UseSelectorOptions<TSelected> = {},
): { readonly current: TSelected } {
  const compare = options.compare ?? defaultCompare
  let slice = $state(selector(source.get()))

  $effect(() => {
    const unsub = source.subscribe((s) => {
      const data = selector(s)
      if (compare(slice, data)) {
        return
      }
      slice = data
    }).unsubscribe

    return unsub
  })

  return {
    get current() {
      return slice
    },
  }
}
