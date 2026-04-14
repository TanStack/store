import { onScopeDispose, readonly, shallowRef, toRaw } from 'vue-demi'
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

/**
 * Selects a slice of state from an atom or store and subscribes the component
 * to that selection.
 *
 * This is the primary Vue read hook for TanStack Store. It returns a readonly
 * ref containing the selected value.
 *
 * @example
 * ```ts
 * const count = useSelector(counterStore, (state) => state.count)
 * console.log(count.value)
 * ```
 *
 * @example
 * ```ts
 * const doubled = useSelector(countAtom, (value) => value * 2)
 * ```
 */
export function useSelector<TSource, TSelected>(
  source: SelectionSource<TSource>,
  selector: (snapshot: TSource) => TSelected,
  options?: UseSelectorOptions<TSelected>,
): Readonly<Ref<TSelected>> {
  const compare = options?.compare ?? defaultCompare
  const slice = shallowRef(selector(source.get())) as Ref<TSelected>
  const unsubscribe = source.subscribe((snapshot) => {
    const selected = selector(snapshot)
    if (compare(toRaw(slice.value), selected)) {
      return
    }
    slice.value = selected
  }).unsubscribe

  onScopeDispose(() => {
    unsubscribe()
  })

  return readonly(slice) as Readonly<Ref<TSelected>>
}
