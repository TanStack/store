import { ReactiveNode, ReactiveFlags } from '../../../../../stackblitz/alien-signals/src/system'
import { getCurrentSub } from '../../../../../stackblitz/alien-signals/src/index'
import { link, propagate } from './scheduler'
import type { AnyUpdater, Listener } from './types'

export interface StoreOptions<
  TState,
  TUpdater extends AnyUpdater = (cb: TState) => TState,
> {
  /**
   * Replace the default update function with a custom one.
   */
  updateFn?: (previous: TState) => (updater: TUpdater) => TState
  /**
   * Called when a listener subscribes to the store.
   *
   * @return a function to unsubscribe the listener
   */
  onSubscribe?: (
    listener: Listener<TState>,
    store: Store<TState, TUpdater>,
  ) => () => void
  /**
   * Called after the state has been updated, used to derive other state.
   */
  onUpdate?: () => void
}

interface StoreNode<TState> extends ReactiveNode {
  store: Store<TState, any>
}

export class Store<
  TState,
  TUpdater extends AnyUpdater = (cb: TState) => TState,
> {
  listeners = new Set<Listener<TState>>()
  private _state: TState
  prevState: TState
  options?: StoreOptions<TState, TUpdater>
  
  private _node: StoreNode<TState>

  constructor(initialState: TState, options?: StoreOptions<TState, TUpdater>) {
    this.prevState = initialState
    this._state = initialState
    this.options = options
    
    this._node = {
      store: this,
      flags: ReactiveFlags.Mutable
    }
  }

  get state(): TState {
    // Auto-link to the current tracking context when state is accessed
    const currentSub = getCurrentSub()
    if (currentSub) {
      link(this._node, currentSub)
    }
    return this._state
  }

  set state(value: TState) {
    this._state = value
  }

  subscribe = (listener: Listener<TState>) => {
    this.listeners.add(listener)
    
    // Mark as watching when we have listeners
    if (this.listeners.size === 1) {
      this._node.flags |= ReactiveFlags.Watching
    }
    
    const unsub = this.options?.onSubscribe?.(listener, this)
    return () => {
      this.listeners.delete(listener)
      
      // Remove watching flag when no more listeners
      if (this.listeners.size === 0) {
        this._node.flags &= ~ReactiveFlags.Watching
      }
      
      unsub?.()
    }
  }

  setState = (updater: TUpdater) => {
    this.prevState = this._state
    this._state = this.options?.updateFn
      ? this.options.updateFn(this.prevState)(updater)
      : (updater as any)(this.prevState)

    // Mark the store as dirty and propagate changes to derived values
    this._node.flags = (this._node.flags | ReactiveFlags.Dirty) as ReactiveFlags
    
    // Propagate to all subscribers if there are any
    if (this._node.subs) {
      propagate(this._node.subs)
    }

    // Always run onUpdate, regardless of batching
    this.options?.onUpdate?.()

    // Notify store listeners immediately
    this.listeners.forEach((listener) =>
      listener({
        prevVal: this.prevState as never,
        currentVal: this._state as never,
      }),
    )
  }
  
  // Internal method to get the reactive node for linking
  _getReactiveNode(): StoreNode<TState> {
    return this._node
  }
}
