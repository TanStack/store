export type AnyUpdater = (...args: any[]) => any

export type Listener<T> = (val?: T) => void

interface StoreOptions<
  TState,
  TUpdater extends AnyUpdater = (cb: TState) => TState,
  TListener extends Listener<any> = Listener<void>,
> {
  updateFn?: (previous: TState) => (updater: TUpdater) => TState
  onSubscribe?: (
    listener: TListener,
    store: Store<TState, TUpdater, TListener>,
  ) => () => void
  onUpdate?: () => void
}

export class Store<
  TState,
  TUpdater extends AnyUpdater = (cb: TState) => TState,
  TListener extends Listener<any> = Listener<void>,
> {
  listeners = new Set<TListener>()
  state: TState
  options?: StoreOptions<TState, TUpdater, TListener>
  _batching = false
  _flushing = 0

  constructor(
    initialState: TState,
    options?: StoreOptions<TState, TUpdater, TListener>,
  ) {
    this.state = initialState
    this.options = options
  }

  subscribe = (listener: TListener) => {
    this.listeners.add(listener)
    const unsub = this.options?.onSubscribe?.(listener, this)
    return () => {
      this.listeners.delete(listener)
      unsub?.()
    }
  }

  setState = (updater: TUpdater, listenerVal?: Parameters<TListener>[0]) => {
    const previous = this.state
    this.state = this.options?.updateFn
      ? this.options.updateFn(previous)(updater)
      : (updater as any)(previous)

    // Always run onUpdate, regardless of batching
    this.options?.onUpdate?.()

    // Attempt to flush
    this._flush(listenerVal)
  }

  _flush = (val: Parameters<TListener>[0]) => {
    if (this._batching) return
    const flushId = ++this._flushing
    this.listeners.forEach((listener) => {
      if (this._flushing !== flushId) return
      listener(val)
    })
  }

  batch = (cb: () => void, listenerVal?: Parameters<TListener>[0]) => {
    if (this._batching) return cb()
    this._batching = true
    cb()
    this._batching = false
    this._flush(listenerVal)
  }
}
