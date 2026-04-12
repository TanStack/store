import type {
  Atom,
  ReadonlyAtom,
  ReadonlyStore,
  Store,
  StoreActionMap,
} from '@tanstack/store'

export * from '@tanstack/store'

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

/**
 * Subscribes to an atom or store and returns its whole current value through a
 * rune-friendly holder object.
 *
 * @example
 * ```ts
 * const count = useValue(countAtom)
 * console.log(count.current)
 * ```
 *
 * @example
 * ```ts
 * const state = useValue(counterStore)
 * ```
 */
export function useValue<TValue>(
  source:
    | Atom<TValue>
    | ReadonlyAtom<TValue>
    | Store<TValue, any>
    | ReadonlyStore<TValue>,
  options?: UseSelectorOptions<TValue>,
): { readonly current: TValue } {
  return useSelector(source, (value) => value, options)
}

/**
 * Returns a stable setter for a writable atom or store.
 *
 * Writable atoms preserve their native `set` contract. Writable stores
 * preserve their native `setState` contract.
 *
 * @example
 * ```ts
 * const setCount = useSetValue(countAtom)
 * setCount((prev) => prev + 1)
 * ```
 *
 * @example
 * ```ts
 * const setState = useSetValue(counterStore)
 * setState((state) => ({ ...state, count: state.count + 1 }))
 * ```
 */
export function useSetValue<TValue>(source: Atom<TValue>): Atom<TValue>['set']
export function useSetValue<TValue, TActions extends StoreActionMap>(
  source: Store<TValue, TActions>,
): Store<TValue, TActions>['setState']
export function useSetValue<TValue, TActions extends StoreActionMap>(
  source: Atom<TValue> | Store<TValue, TActions>,
) {
  return ((valueOrUpdater: TValue | ((prevVal: TValue) => TValue)) => {
    if ('setState' in source) {
      source.setState(valueOrUpdater as (prevVal: TValue) => TValue)
    } else {
      if (typeof valueOrUpdater === 'function') {
        source.set(valueOrUpdater as (prevVal: TValue) => TValue)
      } else {
        source.set(valueOrUpdater)
      }
    }
  }) as Atom<TValue>['set'] | Store<TValue, TActions>['setState']
}

/**
 * Returns the current atom holder together with a setter.
 *
 * Use this when a component needs to both read and update the same writable
 * atom.
 *
 * @example
 * ```ts
 * const [count, setCount] = useAtom(countAtom)
 * setCount((prev) => prev + 1)
 * console.log(count.current)
 * ```
 */
export function useAtom<TValue>(
  atom: Atom<TValue>,
  options?: UseSelectorOptions<TValue>,
): [{ readonly current: TValue }, Atom<TValue>['set']] {
  const value = useValue(atom, options)
  const setValue = useSetValue(atom)

  return [value, setValue]
}

/**
 * Returns the stable actions bag from a writable store created with actions.
 *
 * Use this when a component only needs to call store actions and should not
 * subscribe to store state.
 *
 * @example
 * ```ts
 * const actions = useStoreActions(counterStore)
 * actions.increment()
 * ```
 */
export function useStoreActions<TValue, TActions extends StoreActionMap>(
  store: Store<TValue, TActions>,
): TActions {
  return store.actions
}

/**
 * Deprecated alias for {@link useSelector}.
 *
 * @example
 * ```ts
 * const count = useStore(counterStore, (state) => state.count)
 * console.log(count.current)
 * ```
 *
 * @deprecated Use `useSelector` instead.
 */
export const useStore = <TState, TSelected = NoInfer<TState>>(
  source:
    | Atom<TState>
    | ReadonlyAtom<TState>
    | Store<TState, any>
    | ReadonlyStore<TState>,
  selector: (state: NoInfer<TState>) => TSelected = (d) => d as any,
  compare?: (a: TSelected, b: TSelected) => boolean,
) => useSelector(source, selector, { compare })

export function shallow<T>(objA: T, objB: T) {
  if (Object.is(objA, objB)) {
    return true
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false
  }

  if (objA instanceof Map && objB instanceof Map) {
    if (objA.size !== objB.size) return false
    for (const [k, v] of objA) {
      if (!objB.has(k) || !Object.is(v, objB.get(k))) return false
    }
    return true
  }

  if (objA instanceof Set && objB instanceof Set) {
    if (objA.size !== objB.size) return false
    for (const v of objA) {
      if (!objB.has(v)) return false
    }
    return true
  }

  if (objA instanceof Date && objB instanceof Date) {
    if (objA.getTime() !== objB.getTime()) return false
    return true
  }

  const keysA = Object.keys(objA)
  if (keysA.length !== Object.keys(objB).length) {
    return false
  }

  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i] as string) ||
      !Object.is(objA[keysA[i] as keyof T], objB[keysA[i] as keyof T])
    ) {
      return false
    }
  }
  return true
}
