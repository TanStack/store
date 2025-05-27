import { ReactiveNode, ReactiveFlags } from '../../../../../stackblitz/alien-signals/src/system'
import { setCurrentSub, getCurrentSub } from '../../../../../stackblitz/alien-signals/src/index'
import { unlink, checkDirty, endTracking, startTracking, link, manualUpdate } from './scheduler'
import { Store } from './store'
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

interface DerivedNode<TState> extends ReactiveNode {
  derived: Derived<TState, any>
}

export class Derived<
  TState,
  const TArr extends ReadonlyArray<
    Derived<any> | Store<any>
  > = ReadonlyArray<any>,
> {
  listeners = new Set<Listener<TState>>()
  private _state: TState
  prevState: TState | undefined
  options: DerivedOptions<TState, TArr>

  private _node: DerivedNode<TState>
  private _isMounted = false
  lastSeenDepValues: Array<unknown> = []

  get state(): TState {
    // Auto-link to the current tracking context when state is accessed
    const currentSub = getCurrentSub()
    if (currentSub) {
      link(this._node, currentSub)
    }
    
    const flags = this._node.flags
    
    // Check if we need to recompute
    if (flags & ReactiveFlags.Pending) {
      manualUpdate(this._node)
    } else if (flags & ReactiveFlags.Dirty && this._node.deps) {
      manualUpdate(this._node)
    }
    
    return this._state
  }

  set state(value: TState) {
    this._state = value
  }

  getDepVals = () => {
    const currDepVals = [] as Array<unknown>
    for (const dep of this.options.deps) {
      // Access the state directly - this will establish reactive links during tracking
      currDepVals.push(dep.state)
    }
    return currDepVals
  }

  constructor(options: DerivedOptions<TState, TArr>) {
    this.options = options
    
    // Initialize the reactive node with proper flags
    this._node = {
      derived: this,
      flags: ReactiveFlags.Mutable | ReactiveFlags.Dirty // Mark as mutable and initially dirty
    }
    
    // Initial computation with tracking to establish dependencies
    const prevSub = setCurrentSub(this._node)
    startTracking(this._node)
    
    try {
      // Get dependency values which will auto-link during tracking
      const currDepVals = this.options.deps.map(dep => dep.state) as never
      this.lastSeenDepValues = [...currDepVals]
      
      this._state = options.fn({
        prevDepVals: undefined,
        prevVal: undefined,
        currDepVals,
      })
    } finally {
      setCurrentSub(prevSub)
      endTracking(this._node)
    }
  }

  private unlinkFromDependencies() {
    let deps = this._node.deps
    while (deps) {
      const nextDep = deps.nextDep
      unlink(deps, this._node)
      deps = nextDep
    }
  }

  recompute = () => {
    // Check if any dependencies are dirty and need updating
    if (this._node.deps) {
      if (checkDirty(this._node.deps, this._node)) {
        // The reactive system will handle the update through the update function
        // checkDirty will call our update function if needed
      }
    }
  }

  checkIfRecalculationNeededDeeply = () => {
    // This method is called to check if the derived value needs updating
    // The reactive system handles this automatically, but we can manually check
    if (this._node.deps) {
      checkDirty(this._node.deps, this._node)
    }
  }

  mount = () => {
    if (this._isMounted) {
      return () => {}
    }
    
    this._isMounted = true
    // Mark as watching so it will be included in reactive updates
    this._node.flags |= ReactiveFlags.Watching

    return () => {
      this._isMounted = false
      this._node.flags &= ~ReactiveFlags.Watching
      this.unlinkFromDependencies()
    }
  }

  subscribe = (listener: Listener<TState>) => {
    this.listeners.add(listener)
    
    // Mark as watching when we have listeners
    if (this.listeners.size === 1) {
      this._node.flags |= ReactiveFlags.Watching
    }
    
    const unsub = this.options.onSubscribe?.(listener, this)
    return () => {
      this.listeners.delete(listener)
      
      // Remove watching flag when no more listeners
      if (this.listeners.size === 0) {
        this._node.flags &= ~ReactiveFlags.Watching
      }
      
      unsub?.()
    }
  }

  // For backward compatibility - these methods are no longer needed with reactive system
  registerOnGraph() {
    // No-op: handled by reactive system
  }

  unregisterFromGraph() {
    // No-op: handled by reactive system
  }
}
