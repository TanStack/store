import { onDestroy } from 'svelte'
import type { Atom, ReadonlyAtom, ReadonlyStore, Store } from '@tanstack/store'

export interface UseSelectorOptions<TSelected> {
  compare?: (a: TSelected, b: TSelected) => boolean
}

function defaultCompare<T>(a: T, b: T) {
  return a === b
}

const unset = Symbol()

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
  let version = $state(0)

  const { unsubscribe } = source.subscribe(() => {
    version += 1
  })
  onDestroy(unsubscribe)

  // $derived has no equals option. Returning the previous reference when
  // compare matches keeps === stable so dependents do not update.
  let previous: TSelected | typeof unset = unset

  const selected = $derived.by(() => {
    void version
    const next = selector(source.get())
    if (previous !== unset && compare(previous, next)) {
      return previous
    }
    previous = next
    return next
  })

  return {
    get current() {
      return selected
    },
  }
}
