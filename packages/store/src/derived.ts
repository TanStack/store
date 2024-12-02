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

export interface DerivedMountOptions {
  /**
   * Should recompute the value on mount?
   * @default {true}
   */
  recompute?: boolean
}

export class Derived<
  TState,
  const TArr extends ReadonlyArray<
    Derived<any> | Store<any>
  > = ReadonlyArray<any>,
> {
  /**
   * @private
   */
  _store: Store<TState>
  options: DerivedOptions<TState, TArr>

  /**
   * Functions representing the subscriptions. Call a function to cleanup
   * @private
   */
  _subscriptions: Array<() => void> = []

  getDepVals = () => {
    const prevDepVals = [] as Array<unknown>
    const currDepVals = [] as Array<unknown>
    for (const dep of this.options.deps) {
      prevDepVals.push(dep.prevState)
      currDepVals.push(dep.state)
    }
    return {
      prevDepVals: prevDepVals as never,
      currDepVals: currDepVals as never,
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      prevVal: this._store?.prevState ?? undefined,
    }
  }

  constructor(options: DerivedOptions<TState, TArr>) {
    this.options = options
    const initVal = options.fn({
      prevDepVals: undefined,
      prevVal: undefined,
      currDepVals: this.getDepVals().currDepVals,
    })

    this._store = new Store(initVal, {
      onSubscribe: options.onSubscribe?.bind(this) as never,
      onUpdate: options.onUpdate,
    })
  }

  get state() {
    return this._store.state
  }

  set prevState(val: TState) {
    this._store.prevState = val
  }

  get prevState() {
    return this._store.prevState
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
    this._store.setState(() => {
      const { prevDepVals, currDepVals, prevVal } = this.getDepVals()
      return this.options.fn({
        prevDepVals,
        currDepVals,
        prevVal,
      })
    })
  }

  mount = ({ recompute = true }: DerivedMountOptions = {}) => {
    this.registerOnGraph()
    if (recompute) {
      this.recompute()
    }

    return () => {
      this.unregisterFromGraph()
      for (const cleanup of this._subscriptions) {
        cleanup()
      }
    }
  }

  subscribe = (listener: Listener<TState>) => {
    return this._store.subscribe(listener)
  }
}
