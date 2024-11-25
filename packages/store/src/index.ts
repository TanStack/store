/**
 * @private
 */
export type AnyUpdater = (...args: Array<any>) => any

/**
 * @private
 */
export type Listener = () => void

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
    listener: Listener,
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
  listeners = new Set<Listener>()
  state: TState
  options?: StoreOptions<TState, TUpdater>
  /**
   * @private
   */
  _batching = false
  /**
   * @private
   */
  _flushing = 0

  constructor(initialState: TState, options?: StoreOptions<TState, TUpdater>) {
    this.state = initialState
    this.options = options
  }

  subscribe = (listener: Listener) => {
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
    this._flush()
  }

  /**
   * @private
   */
  _flush = () => {
    if (this._batching) return
    const flushId = ++this._flushing
    this.listeners.forEach((listener) => {
      if (this._flushing !== flushId) return
      listener()
    })
  }

  batch = (cb: () => void) => {
    if (this._batching) return cb()
    this._batching = true
    cb()
    this._batching = false
    this._flush()
  }
}
