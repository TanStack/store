import {Store} from "./store";

export type Listener = () => void

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

function _findRootStores(derived: Derived<unknown>) {
  let rootStores: Set<Store<unknown>> = new Set()
  derived.deps.forEach(dep => {
    if (dep instanceof Store) {
      rootStores.add(dep);
    } else {
      const newStores = _findRootStores(dep);
      newStores.forEach(val => rootStores.add(val))
    }
  })
  return rootStores
}

export function findRootStores(derived: Derived<unknown>) {
  return [..._findRootStores(derived)]
}

export class Derived<
  TState
> {
  listeners = new Set<Listener>()
  state: TState
  options?: DerivedOptions<TState>

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
  linkedDeps: Map<Store<unknown>, Array<Derived<unknown>>> = new Map();

  deps: Deps;

  // Functions representing the subscriptions. Call a function to cleanup
  _subscriptions: Array<() => void> = [];

  // Seriously, users of Store, don't mess with this whatever you do
  __depsThatHaveWrittenThisTick: Deps = [];

  constructor(deps: Deps, fn: () => TState, options?: DerivedOptions<TState>) {
    this.options = options;
    this.deps = deps;
    this.state = fn();
    deps.forEach(dep => {
      if (dep instanceof Derived) {
        const rootStores = findRootStores(dep);
        rootStores.forEach(store => {
          const prevLinkedDeps = this.linkedDeps.get(store) || [];
          prevLinkedDeps.push(dep);
          this.linkedDeps.set(store, prevLinkedDeps)
        })
      }
    })

    this.linkedDeps.forEach((derivedValues, key) => {
      if (derivedValues.length >= 2) return;
      this.linkedDeps.delete(key)
    })

    deps.forEach(dep => {
      let relatedLinkedDerivedVals: null | Derived<unknown>[] = null;
      this.linkedDeps.forEach((derivedVals) => {
        if (
          (dep instanceof Derived && derivedVals.includes(dep))
        ) {
          relatedLinkedDerivedVals = derivedVals;
        }
      })

      const unsub = dep.subscribe(() => {
        this.__depsThatHaveWrittenThisTick.push(dep);
        if (!relatedLinkedDerivedVals || this.__depsThatHaveWrittenThisTick.length === relatedLinkedDerivedVals.length) {
          // Yay! All deps are resolved - write the value of this derived
          this._setState(fn())
          return;
        }
      })

      this._subscriptions.push(unsub)
    })
  }

  cleanup = () => {
    this._subscriptions.forEach(cleanup => cleanup())
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
