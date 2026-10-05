import { computed, onScopeDispose, shallowRef, toRaw } from 'vue-demi'
import type { Ref } from 'vue-demi'

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

const unset = Symbol()

/**
 * Selects a slice of state from an atom or store and subscribes the component
 * to that selection.
 *
 * This is the primary Vue read hook for TanStack Store. It returns a readonly
 * ref containing the selected value.
 *
 * Omit the selector to subscribe to the whole value.
 *
 * @example
 * ```ts
 * const count = useSelector(counterStore, (state) => state.count)
 * console.log(count.value)
 * ```
 *
 * @example
 * ```ts
 * const value = useSelector(countAtom)
 * ```
 */
export function useSelector<TSource, TSelected = NoInfer<TSource>>(
  source: SelectionSource<TSource>,
  selector: (snapshot: TSource) => TSelected = (s) => s as unknown as TSelected,
  options?: UseSelectorOptions<TSelected>,
): Readonly<Ref<TSelected>> {
  const compare = options?.compare ?? defaultCompare
  const version = shallowRef(0)

  const unsubscribe = source.subscribe(() => {
    version.value++
  }).unsubscribe

  onScopeDispose(() => {
    unsubscribe()
  })

  // Vue computed has no equals option. Returning the previous reference when
  // compare matches keeps Object.is stable so dependents do not update.
  let previous: TSelected | typeof unset = unset

  return computed(() => {
    version.value
    const next = selector(source.get())
    if (previous !== unset && compare(toRaw(previous), next)) {
      return previous
    }
    previous = next
    return next
  })
}
