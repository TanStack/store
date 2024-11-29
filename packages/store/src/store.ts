import { __flush } from './scheduler'
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

export class Store<
  TState,
  TUpdater extends AnyUpdater = (cb: TState) => TState,
> {
  listeners = new Set<Listener<TState>>()
  state: TState
  prevState: TState
  options?: StoreOptions<TState, TUpdater>

  constructor(initialState: TState, options?: StoreOptions<TState, TUpdater>) {
    this.prevState = initialState
    this.state = initialState
    this.options = options
  }

  subscribe = (listener: Listener<TState>) => {
    this.listeners.add(listener)
    const unsub = this.options?.onSubscribe?.(listener, this)
    return () => {
      this.listeners.delete(listener)
      unsub?.()
    }
  }

  setState = (updater: TUpdater) => {
    const previous = this.state
    this.state = this.options?.updateFn
      ? this.options.updateFn(previous)(updater)
      : (updater as any)(previous)

    // Always run onUpdate, regardless of batching
    this.options?.onUpdate?.()

    // Attempt to flush
    __flush(this as never)
  }
}
