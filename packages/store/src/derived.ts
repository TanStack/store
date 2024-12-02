import { Store } from './store'
import { __derivedToStore, __storeToDerived } from './scheduler'
import type { Listener } from './types'

export type UnwrapDerivedOrStore<T> =
  T extends Derived<infer InnerD>
    ? InnerD
    : T extends Store<infer InnerS>
      ? InnerS
      : never

type UnwrapReadonlyDerivedOrStoreArray<
  TArr extends ReadonlyArray<Derived<any> | Store<any>>,
> = TArr extends readonly [infer Head, ...infer Tail]
  ? Head extends Derived<any> | Store<any>
    ? Tail extends ReadonlyArray<Derived<any> | Store<any>>
      ? [UnwrapDerivedOrStore<Head>, ...UnwrapReadonlyDerivedOrStoreArray<Tail>]
      : []
    : []
  : []

// Can't have currVal, as it's being evaluated from the current derived fn
export interface DerivedFnProps<
  TArr extends ReadonlyArray<Derived<any> | Store<any>> = ReadonlyArray<any>,
  TUnwrappedArr extends
    UnwrapReadonlyDerivedOrStoreArray<TArr> = UnwrapReadonlyDerivedOrStoreArray<TArr>,
> {
  // `undefined` if it's the first run
  /**
   * `undefined` if it's the first run
   * @privateRemarks this also cannot be typed as TState, as it breaks the inferencing of the function's return type when an argument is used - even with `NoInfer` usage
   */
  prevVal: unknown | undefined
  prevDepVals: TUnwrappedArr | undefined
  currDepVals: TUnwrappedArr
}

export interface DerivedOptions<
  TState,
  TArr extends ReadonlyArray<Derived<any> | Store<any>> = ReadonlyArray<any>,
> {
  onSubscribe?: (
    listener: Listener<TState>,
    derived: Derived<TState>,
  ) => () => void
  onUpdate?: () => void
  deps: TArr
  /**
   * Values of the `deps` from before and after the current invocation of `fn`
   */
  fn: (props: DerivedFnProps<TArr>) => TState
}

export class Derived<
  TState,
  const TArr extends ReadonlyArray<
    Derived<any> | Store<any>
  > = ReadonlyArray<any>,
> {
  listeners = new Set<Listener<TState>>()
  state: TState
  prevState: TState | undefined
  options: DerivedOptions<TState, TArr>

  /**
   * Functions representing the subscriptions. Call a function to cleanup
   * @private
   */
  _subscriptions: Array<() => void> = []

  lastSeenDepValues: Array<unknown> = []
  getDepVals = () => {
    const prevDepVals = [] as Array<unknown>
    const currDepVals = [] as Array<unknown>
    for (const dep of this.options.deps) {
      prevDepVals.push(dep.prevState)
      currDepVals.push(dep.state)
    }
    this.lastSeenDepValues = currDepVals
    return {
      prevDepVals,
      currDepVals,
      prevVal: this.prevState ?? undefined,
    }
  }

  constructor(options: DerivedOptions<TState, TArr>) {
    this.options = options
    this.state = options.fn({
      prevDepVals: undefined,
      prevVal: undefined,
      currDepVals: this.getDepVals().currDepVals as never,
    })
  }

  registerOnGraph(
    deps: ReadonlyArray<Derived<any> | Store<any>> = this.options.deps,
  ) {
    for (const dep of deps) {
      if (dep instanceof Derived) {
        // First register the intermediate derived value if it's not already registered
        dep.registerOnGraph()
        // Then register this derived with the dep's underlying stores
        this.registerOnGraph(dep.options.deps)
      } else if (dep instanceof Store) {
        // Register the derived as related derived to the store
        let relatedLinkedDerivedVals = __storeToDerived.get(dep)
        if (!relatedLinkedDerivedVals) {
          relatedLinkedDerivedVals = new Set()
          __storeToDerived.set(dep, relatedLinkedDerivedVals)
        }
        relatedLinkedDerivedVals.add(this as never)

        // Register the store as a related store to this derived
        let relatedStores = __derivedToStore.get(this as never)
        if (!relatedStores) {
          relatedStores = new Set()
          __derivedToStore.set(this as never, relatedStores)
        }
        relatedStores.add(dep)
      }
    }
  }

  unregisterFromGraph(
    deps: ReadonlyArray<Derived<any> | Store<any>> = this.options.deps,
  ) {
    for (const dep of deps) {
      if (dep instanceof Derived) {
        this.unregisterFromGraph(dep.options.deps)
      } else if (dep instanceof Store) {
        const relatedLinkedDerivedVals = __storeToDerived.get(dep)
        if (relatedLinkedDerivedVals) {
          relatedLinkedDerivedVals.delete(this as never)
        }

        const relatedStores = __derivedToStore.get(this as never)
        if (relatedStores) {
          relatedStores.delete(dep)
        }
      }
    }
  }

  recompute = () => {
    this.prevState = this.state
    const { prevDepVals, currDepVals, prevVal } = this.getDepVals()
    this.state = this.options.fn({
      prevDepVals: prevDepVals as never,
      currDepVals: currDepVals as never,
      prevVal,
    })

    this.options.onUpdate?.()
  }

  checkIfRecalculationNeededDeeply = () => {
    for (const dep of this.options.deps) {
      if (dep instanceof Derived) {
        dep.checkIfRecalculationNeededDeeply()
      }
    }
    let shouldRecompute = false
    const lastSeenDepValues = this.lastSeenDepValues
    const { currDepVals } = this.getDepVals()
    for (let i = 0; i < currDepVals.length; i++) {
      if (currDepVals[i] !== lastSeenDepValues[i]) {
        shouldRecompute = true
        break
      }
    }

    if (shouldRecompute) {
      this.recompute()
    }
  }

  mount = () => {
    this.registerOnGraph()
    this.checkIfRecalculationNeededDeeply()

    return () => {
      this.unregisterFromGraph()
      for (const cleanup of this._subscriptions) {
        cleanup()
      }
    }
  }

  subscribe = (listener: Listener<TState>) => {
    this.listeners.add(listener)
    const unsub = this.options.onSubscribe?.(listener, this)
    return () => {
      this.listeners.delete(listener)
      unsub?.()
    }
  }
}
