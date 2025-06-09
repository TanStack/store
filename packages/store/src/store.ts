import { __flush } from './scheduler'
import { isUpdaterFunction } from './types'
import type { Listener } from './types'

export interface StoreOptions< TState> {
  /**
   * Replace the default update function with a custom one.
   */
  updateFn?: (previous: TState) => (updater: (prev: TState) => TState) => TState
  /**
   * Called when a listener subscribes to the store.
   *
   * @return a function to unsubscribe the listener
   */
  onSubscribe?: (
    listener: Listener<TState>,
    store: Store<TState>,
  ) => () => void
  /**
   * Called after the state has been updated, used to derive other state.
   */
  onUpdate?: () => void
}

export class Store<TState> {
  listeners = new Set<Listener<TState>>()
  state: TState
  prevState: TState
  options?: StoreOptions<TState>

  constructor(initialState: TState, options?: StoreOptions<TState>) {
    this.prevState = initialState
    this.state = initialState
    this.options = options
  }

  subscribe = (listener: Listener<TState>) => {
    this.listeners.add(listener)
    const unsubscribe = this.options?.onSubscribe?.(listener, this)
    return () => {
      this.listeners.delete(listener)
      unsubscribe?.()
    }
  }

  /**
   * Update the store state safely with improved type checking
   */
  setState(updater: TState | ((prevState: TState) => TState)): void {
    this.prevState = this.state

    if (isUpdaterFunction(updater)) {
      this.state = this.options?.updateFn ? this.options.updateFn(this.prevState)(updater) : updater(this.prevState)
    } else {
      this.state = this.options?.updateFn ? this.options.updateFn(this.prevState)(() => updater) : updater
    }

    // Always run onUpdate, regardless of batching
    this.options?.onUpdate?.()

    // Attempt to flush
    __flush(this as never)
  }
}
