import {
  DestroyRef,
  Injector,
  assertInInjectionContext,
  inject,
  linkedSignal,
  runInInjectionContext,
} from '@angular/core'
import type { CreateSignalOptions, Signal } from '@angular/core'
import type {
  Atom,
  ReadonlyAtom,
  ReadonlyStore,
  Store,
  StoreActionMap,
} from '@tanstack/store'

export * from '@tanstack/store'

export interface InjectSelectorOptions<TSelected> extends Omit<
  CreateSignalOptions<TSelected>,
  'equal'
> {
  compare?: (a: TSelected, b: TSelected) => boolean
  injector?: Injector
}

type CompatibilityInjectStoreOptions<TSelected> =
  CreateSignalOptions<TSelected> & {
    injector?: Injector
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

function resolveInjector(
  fn: (...args: Array<never>) => unknown,
  injector?: Injector,
) {
  if (!injector) {
    assertInInjectionContext(fn)
    return inject(Injector)
  }

  return injector
}

function createReadonlySelectionSignal<TSource, TSelected>(
  source: SelectionSource<TSource>,
  selector: (state: NoInfer<TSource>) => TSelected,
  options?: InjectSelectorOptions<TSelected>,
): Signal<TSelected> {
  const injector = resolveInjector(
    createReadonlySelectionSignal,
    options?.injector,
  )

  return runInInjectionContext(injector, () => {
    const destroyRef = inject(DestroyRef)
    const compare = options?.compare ?? defaultCompare
    const {
      injector: _injector,
      compare: _compare,
      ...signalOptions
    } = options ?? {}
    const slice = linkedSignal(() => selector(source.get()), {
      ...signalOptions,
      equal: compare,
    })

    const { unsubscribe } = source.subscribe((state) => {
      slice.set(selector(state))
    })

    destroyRef.onDestroy(() => {
      unsubscribe()
    })

    return slice.asReadonly()
  })
}

/**
 * Selects a slice of state from an atom or store and returns it as an Angular
 * signal.
 *
 * This is the primary Angular read hook for TanStack Store.
 *
 * @example
 * ```ts
 * readonly count = injectSelector(counterStore, (state) => state.count)
 * ```
 *
 * @example
 * ```ts
 * readonly doubled = injectSelector(countAtom, (value) => value * 2)
 * ```
 */
export function injectSelector<TState, TSelected = NoInfer<TState>>(
  source: SelectionSource<TState>,
  selector: (state: NoInfer<TState>) => TSelected = (d) =>
    d as unknown as TSelected,
  options?: InjectSelectorOptions<TSelected>,
): Signal<TSelected> {
  return createReadonlySelectionSignal(source, selector, options)
}

/**
 * Returns the current value signal for an atom or store.
 *
 * This is the whole-value counterpart to {@link injectSelector}.
 *
 * @example
 * ```ts
 * readonly count = injectValue(countAtom)
 * ```
 *
 * @example
 * ```ts
 * readonly state = injectValue(counterStore)
 * ```
 */
export function injectValue<TValue>(
  source:
    | Atom<TValue>
    | ReadonlyAtom<TValue>
    | Store<TValue, any>
    | ReadonlyStore<TValue>,
  options?: InjectSelectorOptions<TValue>,
): Signal<TValue> {
  return injectSelector(source, (value) => value, options)
}

/**
 * Returns a stable setter for a writable atom or store.
 *
 * Writable atoms preserve their native `set` contract. Writable stores
 * preserve their native `setState` contract.
 *
 * @example
 * ```ts
 * readonly setCount = injectSetValue(countAtom)
 *
 * increment() {
 *   this.setCount((prev) => prev + 1)
 * }
 * ```
 *
 * @example
 * ```ts
 * readonly setState = injectSetValue(counterStore)
 * ```
 */
export function injectSetValue<TValue>(
  source: Atom<TValue>,
): Atom<TValue>['set']
export function injectSetValue<TValue, TActions extends StoreActionMap>(
  source: Store<TValue, TActions>,
): Store<TValue, TActions>['setState']
export function injectSetValue<TValue, TActions extends StoreActionMap>(
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
 * Returns the current atom signal together with a setter.
 *
 * Use this when a component needs to both read and update the same writable
 * atom.
 *
 * @example
 * ```ts
 * readonly atomTuple = injectAtom(countAtom)
 * readonly count = this.atomTuple[0]
 * readonly setCount = this.atomTuple[1]
 * ```
 */
export function injectAtom<TValue>(
  atom: Atom<TValue>,
  options?: InjectSelectorOptions<TValue>,
): [Signal<TValue>, Atom<TValue>['set']] {
  const value = injectValue(atom, options)
  const setValue = injectSetValue(atom)

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
 * readonly actions = injectStoreActions(counterStore)
 *
 * increment() {
 *   this.actions.increment()
 * }
 * ```
 */
export function injectStoreActions<TValue, TActions extends StoreActionMap>(
  store: Store<TValue, TActions>,
): TActions {
  return store.actions
}

/**
 * Deprecated alias for {@link injectSelector}.
 *
 * @example
 * ```ts
 * readonly count = injectStore(counterStore, (state) => state.count)
 * ```
 *
 * @deprecated Use `injectSelector` instead.
 */
export function injectStore<TState, TSelected = NoInfer<TState>>(
  store: SelectionSource<TState>,
  selector?: (state: NoInfer<TState>) => TSelected,
  options?: CompatibilityInjectStoreOptions<TSelected>,
): Signal<TSelected>
export function injectStore<TState, TSelected = NoInfer<TState>>(
  store: SelectionSource<TState>,
  selector: (state: NoInfer<TState>) => TSelected = (d) =>
    d as unknown as TSelected,
  options?: CompatibilityInjectStoreOptions<TSelected>,
): Signal<TSelected> {
  const { equal, injector, ...signalOptions } = options ?? {}

  return injectSelector(store, selector, {
    ...signalOptions,
    compare: equal,
    injector,
  })
}

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

  const keysA = getOwnKeys(objA)
  if (keysA.length !== getOwnKeys(objB).length) {
    return false
  }

  // eslint-disable-next-line @typescript-eslint/prefer-for-of
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

function getOwnKeys(obj: object): Array<string | symbol> {
  return (Object.keys(obj) as Array<string | symbol>).concat(
    Object.getOwnPropertySymbols(obj),
  )
}
