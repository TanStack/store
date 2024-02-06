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

  rootStores: Array<Store<unknown>> = [];
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
    const linkedDeps: Map<Store<unknown>, Array<Derived<unknown>>> = new Map();

    const setLinkedDeps = (store: Store<unknown>, dep: Derived<unknown>) => {
      const prevLinkedDeps = linkedDeps.get(store) || [];
      prevLinkedDeps.push(dep);
      linkedDeps.set(store, prevLinkedDeps)
    }
    deps.forEach(dep => {
      if (dep instanceof Derived) {
        dep.rootStores.forEach(store => {
          setLinkedDeps(store, dep)
        })
      } else if (dep instanceof Store) {
        this.rootStores.push(dep);
        setLinkedDeps(dep, this as Derived<unknown>)
      }
    })

    let __depsThatHaveWrittenThisTick: Deps = [];

    deps.forEach(dep => {
      let relatedLinkedDerivedVals: null | Derived<unknown>[] = null;
      linkedDeps.forEach((derivedVals, store) => {
        if (derivedVals.length < 2) return;
        if (
          (dep instanceof Derived && derivedVals.includes(dep)) ||
          (dep instanceof Store && dep === store)
        ) {
          relatedLinkedDerivedVals = derivedVals;
        }
      })

      const unsub = dep.subscribe(() => {
        __depsThatHaveWrittenThisTick.push(dep);
        if (!relatedLinkedDerivedVals || __depsThatHaveWrittenThisTick.length === relatedLinkedDerivedVals.length) {
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
