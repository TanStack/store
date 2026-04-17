import type { WatchedEffect } from './atom'
import type { ReactiveNode } from './alien'

export type Selection<TSelected> = Readable<TSelected>

export interface InteropSubscribable<T> {
  subscribe: (observer: Observer<T>) => Subscription
}

// Based on RxJS types
export type Observer<T> = {
  next?: (value: T) => void
  error?: (err: unknown) => void
  complete?: () => void
}

export interface Subscription {
  unsubscribe: () => void
}

export interface Subscribable<T> extends InteropSubscribable<T> {
  subscribe: ((observer: Observer<T>) => Subscription) &
    ((
      next: (value: T) => void,
      error?: (error: any) => void,
      complete?: () => void,
    ) => Subscription)
}

export interface Readable<T> extends Subscribable<T> {
  get: () => T
}

export interface BaseAtom<T> extends Subscribable<T>, Readable<T> {
  /**
   * `effect` will be called when the first subscriber is added. `effect`
   * may return a cleanup function, which will be called when the atom is
   * unwatched.
   *
   * Returns an `cleanup` function which removes the `whileWatched` listener.
   *
   * This can be used to sync external resources into the atom, similar to
   * `useLayoutEffect` in React.
   *
   * ```ts
   * function createTicker(ms: number) {
   *   const now = createAtom(Date.now())
   *   const refresh = () => now.set(Date.now())
   *   now.whileWatched(() => {
   *     refresh()
   *     const interval = setInterval(refresh, ms)
   *     return () => clearInterval(interval)
   *   })
   *   return createAtom(() => now.get())
   * }
   * const ticker = createTicker(1000)
   * ticker.subscribe(() => {
   *   console.log('current time: ', ticker.get())
   * })
   * ```
   */
  whileWatched: (effect: WatchedEffect) => () => void
}

export interface InternalBaseAtom<T> extends Subscribable<T>, Readable<T> {
  /** @internal */
  _snapshot: T
  /** @internal */
  _update: (getValue?: T | ((snapshot: T) => T)) => boolean
}

export interface Atom<T> extends BaseAtom<T> {
  /** Sets the value of the atom using a function. */
  set: ((fn: (prevVal: T) => T) => void) & ((value: T) => void)
}

export interface AtomOptions<T> {
  compare?: (prev: T, next: T) => boolean
}

export type AnyAtom = BaseAtom<any>

export interface InternalReadonlyAtom<T>
  extends InternalBaseAtom<T>, ReactiveNode {}

/**
 * An atom that is read-only and cannot be set.
 *
 * @example
 *
 * ```ts
 * const atom = createAtom(() => 42);
 * // @ts-expect-error - Cannot set a readonly atom
 * atom.set(43);
 * ```
 */
export interface ReadonlyAtom<T> extends BaseAtom<T> {}
