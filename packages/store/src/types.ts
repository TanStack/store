import type { ReactiveNode } from './alien';
import { WatchedEffect } from './atom';

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
   * `effect` will be called while the atom is watched. `effect` may return a
   * cleanup function, which will be called when the atom is unwatched.
   * 
   * Returns a `stop` function which cancels the listener.
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
