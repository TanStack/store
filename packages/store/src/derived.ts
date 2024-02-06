import {Store} from "./store";
import {Listener} from "./types";

interface DerivedOptions<
  TState
> {
  onSubscribe?: (
    listener: Listener,
    derived: Derived<TState>,
  ) => () => void
  onUpdate?: () => void
}

type Deps = Array<Derived<any> | Store<any>>;

export class Derived<
  TState
> {
  listeners = new Set<Listener>()
  state: TState
  options?: DerivedOptions<TState>

  rootStores: Set<Store<unknown>> = new Set();
  deps: Deps;

  // Functions representing the subscriptions. Call a function to cleanup
  _subscriptions: Array<() => void> = [];

  constructor(deps: Deps, fn: () => TState, options?: DerivedOptions<TState>) {
    this.options = options;
    this.deps = deps;
    this.state = fn();
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
    const storeToDerived: Map<Store<unknown>, Set<Derived<unknown>>> = new Map();
    const derivedToStore: Map<Derived<unknown>, Set<Store<unknown>>> = new Map();

    const setLinkedDeps = (store: Store<unknown>, dep: Derived<unknown>) => {
      const prevLinkedDeps = storeToDerived.get(store) || new Set();
      prevLinkedDeps.add(dep);
      storeToDerived.set(store, prevLinkedDeps)
    }
    deps.forEach(dep => {
      if (dep instanceof Derived) {
        derivedToStore.set(dep, dep.rootStores)
        dep.rootStores.forEach(store => {
          this.rootStores.add(store);
          setLinkedDeps(store, dep)
        })
      } else if (dep instanceof Store) {
        this.rootStores.add(dep);
        setLinkedDeps(dep, this as Derived<unknown>)
      }
    })

    let __depsThatHaveWrittenThisTick: Deps = [];

    deps.forEach(dep => {
      let relatedLinkedDerivedVals: null | Set<Derived<unknown>> = null;
      const stores = (dep instanceof Derived ? derivedToStore.get(dep) : new Set([dep])) ?? new Set();
      stores.forEach(store => {
        // Only runs on first loop through the store
        if (!relatedLinkedDerivedVals) relatedLinkedDerivedVals = new Set();
        storeToDerived.get(store)?.forEach(derived => {
          relatedLinkedDerivedVals!.add(derived)
        })
      })

      const unsub = dep.subscribe(() => {
        __depsThatHaveWrittenThisTick.push(dep);
        if (!relatedLinkedDerivedVals || __depsThatHaveWrittenThisTick.length === relatedLinkedDerivedVals.size) {
          // Yay! All deps are resolved - write the value of this derived
          this._setState(fn())
          // Cleanup the deps that have written this tick
          __depsThatHaveWrittenThisTick = [];
          return;
        }
      })

      this._subscriptions.push(unsub)
    })
  }

  cleanup = () => {
    this._subscriptions.forEach(cleanup => cleanup())
  }

  [Symbol.dispose]() {
    this.cleanup();
  }

  subscribe = (listener: Listener) => {
    this.listeners.add(listener)
    const unsub = this.options?.onSubscribe?.(listener, this)
    return () => {
      this.listeners.delete(listener)
      unsub?.()
    }
  }

  _setState = (val: TState) => {
    this.state = val;
    this.options?.onUpdate?.()
    this._flush()
  }

  _flush = () => {
    this.listeners.forEach((listener) => {
      listener()
    })
  }
}
