import { Store } from './store'
import type { Listener } from './types'

export interface DerivedOptions<TState> {
  onSubscribe?: (listener: Listener, derived: Derived<TState>) => () => void
  onUpdate?: () => void
  /**
   * Should the value of `Derived` only be computed once it is accessed
   * @default false
   */
  lazy?: boolean
  deps: Array<Derived<any> | Store<any>>
  fn: () => TState
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

  constructor(options: DerivedOptions<TState>) {
    this.options = options
    const initVal = options.lazy
      ? (undefined as ReturnType<typeof options.fn>)
      : options.fn()
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
      this._store.setState(() => this.options.fn())
      return this._store.state
    }
    return this._store.state
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
            this._store.setState(this.options.fn)
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

  subscribe = (listener: Listener) => {
    return this._store.subscribe(listener)
  }
}
