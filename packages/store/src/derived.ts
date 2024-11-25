import { Store } from './store'
import type { Listener } from './types'

export interface DerivedOptions<TState> {
  onSubscribe?: (
    listener: Listener<TState>,
    derived: Derived<TState>,
  ) => () => void
  onUpdate?: () => void
  /**
   * Should the value of `Derived` only be computed once it is accessed
   * @default false
   */
  lazy?: boolean
  deps: Array<Derived<any> | Store<any>>
  /**
   * Values of the `deps` from before and after the current invocation of `fn`
   *
   * @todo Improve the typings to match `deps` from above
   */
  fn: (props: {
    // `undefined` if it's the first run
    prevVals: Array<any> | undefined
    currentVals: Array<any>
  }) => TState
}

export class Derived<TState> {
  /**
   * @private
   */
  _store: Store<TState>
  /**
   * @private
   */
  rootStores = new Set<Store<unknown>>()
  options: DerivedOptions<TState>

  /**
   * Functions representing the subscriptions. Call a function to cleanup
   * @private
   */
  _subscriptions: Array<() => void> = []

  /**
   * What store called the current update, if any
   * @private
   */
  _whatStoreIsCurrentlyInUse: Store<unknown> | null = null

  /**
   * This is here to solve the pyramid dependency problem where:
   *       A
   *      / \
   *     B   C
   *      \ /
   *       D
   *
   * Where we deeply traverse this tree, how do we avoid D being recomputed twice; once when B is updated, once when C is.
   *
   * To solve this, we create linkedDeps that allows us to sync avoid writes to the state until all of the deps have been
   * resolved.
   *
   * This is a record of stores, because derived stores are not able to write values to, but stores are
   */
  storeToDerived = new Map<Store<unknown>, Set<Derived<unknown>>>()
  derivedToStore = new Map<Derived<unknown>, Set<Store<unknown>>>()

  getDepVals = () => {
    const prevVals = [] as Array<unknown>
    const currentVals = [] as Array<unknown>
    for (const dep of this.options.deps) {
      prevVals.push(dep.prevState)
      currentVals.push(dep.state)
    }
    return {
      prevVals,
      currentVals,
    }
  }

  constructor(options: DerivedOptions<TState>) {
    this.options = options
    const initVal = options.lazy
      ? (undefined as ReturnType<typeof options.fn>)
      : options.fn({
          prevVals: undefined,
          currentVals: this.getDepVals().currentVals,
        })

    this._store = new Store(initVal, {
      onSubscribe: options.onSubscribe?.bind(this) as never,
      onUpdate: options.onUpdate,
    })

    const updateStoreToDerived = (
      store: Store<unknown>,
      dep: Derived<unknown>,
    ) => {
      const prevDerivesForStore = this.storeToDerived.get(store) || new Set()
      prevDerivesForStore.add(dep)
      this.storeToDerived.set(store, prevDerivesForStore)
    }
    for (const dep of options.deps) {
      if (dep instanceof Derived) {
        this.derivedToStore.set(dep, dep.rootStores)
        for (const store of dep.rootStores) {
          this.rootStores.add(store)
          updateStoreToDerived(store, dep)
        }
      } else if (dep instanceof Store) {
        this.rootStores.add(dep)
        updateStoreToDerived(dep, this as Derived<unknown>)
      }
    }
  }

  get state() {
    if (this.options.lazy && this._store.state === undefined) {
      this.options.lazy = false
      this._store.setState(() => this.options.fn(this.getDepVals()))
      return this._store.state
    }
    return this._store.state
  }

  get prevState() {
    return this._store.prevState
  }

  mount = () => {
    let __depsThatHaveWrittenThisTick: DerivedOptions<unknown>['deps'] = []

    for (const dep of this.options.deps) {
      const isDepAStore = dep instanceof Store
      let relatedLinkedDerivedVals: null | Set<Derived<unknown>> = null

      const unsub = dep.subscribe(() => {
        const store = isDepAStore ? dep : dep._whatStoreIsCurrentlyInUse
        this._whatStoreIsCurrentlyInUse = store
        if (store) {
          relatedLinkedDerivedVals = this.storeToDerived.get(store) ?? null
        }

        __depsThatHaveWrittenThisTick.push(dep)
        if (
          !relatedLinkedDerivedVals ||
          __depsThatHaveWrittenThisTick.length === relatedLinkedDerivedVals.size
        ) {
          // Yay! All deps are resolved - write the value of this derived
          if (!this.options.lazy) {
            this._store.setState(() => this.options.fn(this.getDepVals()))
          }

          // Cleanup the deps that have written this tick
          __depsThatHaveWrittenThisTick = []
          this._whatStoreIsCurrentlyInUse = null
          return
        }
      })

      this._subscriptions.push(unsub)
    }

    return () => {
      for (const cleanup of this._subscriptions) {
        cleanup()
      }
    }
  }

  subscribe = (listener: Listener<TState>) => {
    return this._store.subscribe(listener)
  }
}
