import { __flush } from './scheduler'
import { isUpdaterFunction } from './types'
import type { AnyUpdater, Listener, Updater } from './types'

export interface Storage {
  removeItem: (key: string) => void
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export interface PersistOptions<TState> {
  /**
   * Storage key to use when persisting state
   */
  key: string
  /**
   * Storage to use for persistence. Defaults to localStorage
   */
  storage?: Storage
  /**
   * Custom serializer. Defaults to JSON.stringify
   */
  serialize?: (state: TState) => string
  /**
   * Custom deserializer. Defaults to JSON.parse
   */
  deserialize?: (serializedState: string) => TState
}

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
  /**
   * Options for state persistence
   */
  persist?: PersistOptions<TState>
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
    this.options = options

    // Try to load persisted state if persistence is enabled
    if (options?.persist) {
      const persistedState = this.loadPersistedState()
      if (persistedState !== null) {
        this.prevState = persistedState
        this.state = persistedState
        return
      }
    }

    this.prevState = initialState
    this.state = initialState
  }

  private getDefaultStorage(): Storage {
    if (typeof window === 'undefined') {
      return {
        getItem: () => null,
        setItem: () => undefined,
        removeItem: () => undefined,
      }
    }
    return window.localStorage
  }

  private loadPersistedState(): TState | null {
    const { persist } = this.options || {}
    if (!persist) return null

    const deserialize = persist.deserialize || JSON.parse
    const storage = persist.storage || this.getDefaultStorage()

    try {
      const persistedState = storage.getItem(persist.key)
      if (persistedState === null) return null
      return deserialize(persistedState)
    } catch (error) {
      console.error('Failed to load persisted state:', error)
      return null
    }
  }

  private persistState(): void {
    const { persist } = this.options || {}
    if (!persist) return

    const serialize = persist.serialize || JSON.stringify
    const storage = persist.storage || this.getDefaultStorage()

    try {
      const serializedState = serialize(this.state)
      storage.setItem(persist.key, serializedState)
    } catch (error) {
      console.error('Failed to persist state:', error)
    }
  }

  /**
   * Manually persist the current state
   */
  persist(): void {
    this.persistState()
  }

  /**
   * Clear the persisted state
   */
  clearPersistedState(): void {
    const { persist } = this.options || {}
    if (!persist) return

    const storage = persist.storage || this.getDefaultStorage()
    try {
      storage.removeItem(persist.key)
    } catch (error) {
      console.error('Failed to clear persisted state:', error)
    }
  }

  /**
   * Reload the state from persistence
   * @returns true if state was successfully reloaded, false otherwise
   */
  rehydrate(): boolean {
    const persistedState = this.loadPersistedState()
    if (persistedState === null) return false

    this.prevState = this.state
    this.state = persistedState
    __flush(this as never)
    return true
  }

  subscribe = (listener: Listener<TState>) => {
    this.listeners.add(listener)
    const unsub = this.options?.onSubscribe?.(listener, this)
    return () => {
      this.listeners.delete(listener)
      unsub?.()
    }
  }

  /**
   * Update the store state safely with improved type checking
   */
  setState(updater: (prevState: TState) => TState): void
  setState(updater: TState): void
  setState(updater: TUpdater): void
  setState(updater: Updater<TState> | TUpdater): void {
    this.prevState = this.state

    if (this.options?.updateFn) {
      this.state = this.options.updateFn(this.prevState)(updater as TUpdater)
    } else {
      if (isUpdaterFunction(updater)) {
        this.state = updater(this.prevState)
      } else {
        this.state = updater as TState
      }
    }

    // Always run onUpdate, regardless of batching
    this.options?.onUpdate?.()

    // Persist state if enabled
    this.persistState()

    // Attempt to flush
    __flush(this as never)
  }
}
