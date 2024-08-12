import { Store } from './store'
import type { Listener } from './types'

interface DerivedOptions<TState> {
  onSubscribe?: (listener: Listener, derived: Derived<TState>) => () => void
  onUpdate?: () => void
}

export type Deps = Array<Derived<any> | Store<any>>

export class Derived<TState> {
  _store!: Store<TState>
  rootStores = new Set<Store<unknown>>()
  deps: Deps

  // Functions representing the subscriptions. Call a function to cleanup
  _subscriptions: Array<() => void> = []

  // What store called the current update, if any
  _whatStoreIsCurrentlyInUse: Store<unknown> | null = null

  constructor(deps: Deps, fn: () => TState, options?: DerivedOptions<TState>) {
    this.deps = deps
    this._store = new Store(fn(), {
      onSubscribe: options?.onSubscribe?.bind(this) as never,
      onUpdate: options?.onUpdate,
    })
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
    const storeToDerived = new Map<Store<unknown>, Set<Derived<unknown>>>()
    const derivedToStore = new Map<Derived<unknown>, Set<Store<unknown>>>()

    const updateStoreToDerived = (
      store: Store<unknown>,
      dep: Derived<unknown>,
    ) => {
      const prevDerivesForStore = storeToDerived.get(store) || new Set()
      prevDerivesForStore.add(dep)
      storeToDerived.set(store, prevDerivesForStore)
    }
    for (const dep of deps) {
      if (dep instanceof Derived) {
        derivedToStore.set(dep, dep.rootStores)
        for (const store of dep.rootStores) {
          this.rootStores.add(store)
          updateStoreToDerived(store, dep)
        }
      } else if (dep instanceof Store) {
        this.rootStores.add(dep)
        updateStoreToDerived(dep, this as Derived<unknown>)
      }
    }

    let __depsThatHaveWrittenThisTick: Deps = []

    for (const dep of deps) {
      const isDepAStore = dep instanceof Store
      let relatedLinkedDerivedVals: null | Set<Derived<unknown>> = null

      const unsub = dep.subscribe(() => {
        const store = isDepAStore ? dep : dep._whatStoreIsCurrentlyInUse
        this._whatStoreIsCurrentlyInUse = store
        if (store) {
          relatedLinkedDerivedVals = storeToDerived.get(store) ?? null
        }

        __depsThatHaveWrittenThisTick.push(dep)
        if (
          !relatedLinkedDerivedVals ||
          __depsThatHaveWrittenThisTick.length === relatedLinkedDerivedVals.size
        ) {
          // Yay! All deps are resolved - write the value of this derived
          this._store.setState(fn)
          // Cleanup the deps that have written this tick
          __depsThatHaveWrittenThisTick = []
          this._whatStoreIsCurrentlyInUse = null
          return
        }
      })

      this._subscriptions.push(unsub)
    }
  }

  get state() {
    return this._store.state
  }

  cleanup = () => {
    for (const cleanup of this._subscriptions) {
      cleanup()
    }
  };

  [(Symbol as never as { readonly dispose: unique symbol }).dispose]() {
    this.cleanup()
  }

  subscribe = (listener: Listener) => {
    return this._store.subscribe(listener)
  }
}
