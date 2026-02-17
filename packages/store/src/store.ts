import { createAtom, toObserver } from './atom'
import type { Atom, Observer, Subscription } from './types'

export class Store<T> {
  private atom: Atom<T>
  constructor(getValue: (prev?: NoInfer<T>) => T)
  constructor(initialValue: T)
  constructor(valueOrFn: T | ((prev?: T) => T)) {
    // createAtom has overloads that return ReadonlyAtom<T> for functions and Atom<T> for values
    // Store always needs Atom<T> for setState, so we assert the return type
    this.atom = createAtom(
      valueOrFn as T | ((prev?: NoInfer<T>) => T),
    ) as Atom<T>
  }
  public setState(updater: (prev: T) => T) {
    this.atom.set(updater)
  }
  public get state() {
    return this.atom.get()
  }
  public get() {
    return this.state
  }
  public subscribe(
    observerOrFn: Observer<T> | ((value: T) => void),
  ): Subscription {
    return this.atom.subscribe(toObserver(observerOrFn))
  }
}

export class ReadonlyStore<T> implements Omit<Store<T>, 'setState'> {
  private atom: Atom<T>
  constructor(getValue: (prev?: NoInfer<T>) => T)
  constructor(initialValue: T)
  constructor(valueOrFn: T | ((prev?: T) => T)) {
    // createAtom has overloads that return ReadonlyAtom<T> for functions and Atom<T> for values
    // Store always needs Atom<T> for setState, so we assert the return type
    this.atom = createAtom(
      valueOrFn as T | ((prev?: NoInfer<T>) => T),
    ) as Atom<T>
  }
  public get state() {
    return this.atom.get()
  }
  public get() {
    return this.state
  }
  public subscribe(
    observerOrFn: Observer<T> | ((value: T) => void),
  ): Subscription {
    return this.atom.subscribe(toObserver(observerOrFn))
  }
}

export function createStore<T>(
  getValue: (prev?: NoInfer<T>) => T,
): ReadonlyStore<T>
export function createStore<T>(initialValue: T): Store<T>
export function createStore<T>(
  valueOrFn: T | ((prev?: T) => T),
): Store<T> | ReadonlyStore<T> {
  if (typeof valueOrFn === 'function') {
    return new ReadonlyStore(valueOrFn as (prev?: NoInfer<T>) => T)
  }
  return new Store(valueOrFn)
}
