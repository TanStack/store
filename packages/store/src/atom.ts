import { destroyPlatform } from '@angular/core';
import { ReactiveFlags, createReactiveSystem } from './alien'

import type { Link, ReactiveNode } from './alien'
import type {
  Atom,
  AtomOptions,
  Observer,
  ReadonlyAtom,
  Subscription,
} from './types'

export function toObserver<T>(
  nextHandler?: Observer<T> | ((value: T) => void),
  errorHandler?: (error: any) => void,
  completionHandler?: () => void,
): Observer<T> {
  const isObserver = typeof nextHandler === 'object'
  const self = isObserver ? nextHandler : undefined

  return {
    next: (isObserver ? nextHandler.next : nextHandler)?.bind(self),
    error: (isObserver ? nextHandler.error : errorHandler)?.bind(self),
    complete: (isObserver ? nextHandler.complete : completionHandler)?.bind(
      self,
    ),
  }
}

export type WatchedEffect = () => (() => void) | void | undefined

interface WatchableNode extends ReactiveNode {
  /**
   * Reference count: number of direct subs that are alive
   * When >0, the node is "alive" and its watch effects should be running
   * When =0, the node is "dead", and its watch effects should be stopped
   */
  _watches?: number
  _watchEffects?: Array<WatchedEffect>
  _watchCleanups?:  Array<(() => void) | void | undefined>
}

function isWatched(node: WatchableNode): boolean {
  return !!node._watches
}

function addWatch(node: WatchableNode) {
  node._watches ??= 0
  const prev = node._watches++

  // On first watch, node becomes alive:
  if (prev === 0) {
    // 1. propagate liveness to deps
		// We become alive *after* everything we depend on becomes watched.
		// (set up dependencies first before us, the subscriber.)
		let deps = node.deps
		while (deps !== undefined) {
			addWatch(deps.dep)
			deps = deps.nextDep
		}

    // 2. start/run own watch effects.
    // Assign `_watchCleanups` BEFORE invoking any effect and seed it with
    // packed `undefined` slots (avoid `new Array(len)` which gives a holey
    // SMI array in V8). A re-entrant `whileWatched()` during `ef()` pushes
    // into this same array at `i >= len`, keeping indices aligned with
    // `_watchEffects`; the outer loop writes the pre-reserved slot by index.
    const watchEffects = node._watchEffects
    if (watchEffects?.length) {
      const len = watchEffects.length
      const cleanups: Array<(() => void) | void | undefined> = []
      node._watchCleanups = cleanups
      for (let i = 0; i < len; i++) cleanups.push(undefined)
      for (let i = 0; i < len; i++) {
        const ef = watchEffects[i]
        if (ef) cleanups[i] = ef()
      }
    }
  }
}

function removeWatch(node: WatchableNode) {
  node._watches ??= 0
  const next = --node._watches

  // On last unwatch, node becomes dead:
  if (next === 0) {
    // 1. Clean up effects.
    // Snapshot and clear `_watchCleanups` BEFORE invoking any cleanup, so a
    // re-entrant subscribe during cleanup sees a consistent (empty) state and
    // can rebuild cleanups into a fresh array via addWatch.
    const cleanups = node._watchCleanups
    node._watchCleanups = undefined
    if (cleanups) {
      for (let i = cleanups.length - 1; i >= 0; i--) {
        cleanups[i]?.()
      }
    }

    // 2. propagate unwatch to deps.
    // Capture `prevDep` BEFORE recursing, so cleanups that mutate the dep
    // list can't redirect our traversal.
    let deps = node.depsTail
    while (deps !== undefined) {
      const prev = deps.prevDep
      removeWatch(deps.dep)
      deps = prev
    }
  }
}

/**
 * Causes `fn` to be called when `node` becomes gains its first live subscriber.
 * If `fn` returns a cleanup function, it will be called when `node` loses its last live subscriber.
 */
export function whileWatched(node: WatchableNode, fn: WatchedEffect) {
  const initialEffects = (node._watchEffects ??= [])
  initialEffects.push(fn)
  if (node._watches) {
    // Node is already watched, start effect immediately
    const cleanups = (node._watchCleanups ??= [])
    cleanups.push(fn())
  }

  return function removeWhileWatched() {
    const stoppableEffects = node._watchEffects
    if (!stoppableEffects) {
      return
    }

    const index = stoppableEffects.indexOf(fn)
    if (index === -1) {
      return
    }

    stoppableEffects.splice(index, 1)

    if (node._watches) {
      // If node is watched when we remove,
      // also clean up the effect immediately
      const watchCleanups = node._watchCleanups
      if (watchCleanups?.length) {
        const cleanup = watchCleanups[index]
        cleanup?.()
        watchCleanups.splice(index, 1)
        if (watchCleanups.length === 0) {
          node._watchCleanups = undefined
        }
      }
    }
  }
}

/**
 * Called when the atom is watched.
 * Returns a cleanup function that will be called when the atom is unwatched.
 */

interface InternalAtom<T> extends ReactiveNode {
  _snapshot: T
  _update: (getValue?: T | ((snapshot: T) => T)) => boolean

  get: () => T
  subscribe: (observerOrFn: Observer<T> | ((value: T) => void)) => Subscription
  /**
   * `effect` will be called while the atom is watched. `effect` may return a
   * cleanup function, which will be called when the atom is unwatched.
   *
   * Returns a `stop` function which cancels the listener.
   */
  whileWatched: (effect: WatchedEffect) => () => void

  _watched: boolean
  _watchedSubs?: Array<WatchedEffect>
  _watchedCleanups?: Array<(() => void) | void | undefined>
}

const queuedEffects: Array<Effect | undefined> = []
let cycle = 0
const { link: _link, unlink: _unlink, propagate, checkDirty, shallowPropagate } =
  createReactiveSystem({
    update(atom: InternalAtom<any>): boolean {
      return atom._update()
    },
    // eslint-disable-next-line no-shadow
    notify(effect: Effect): void {
      queuedEffects[queuedEffectsLength++] = effect
      effect.flags &= ~ReactiveFlags.Watching
    },
    unwatched(atom: InternalAtom<any>): void {
      if (atom.depsTail !== undefined) {
        atom.depsTail = undefined
        atom.flags = ReactiveFlags.Mutable | ReactiveFlags.Dirty
        purgeDeps(atom)
      }
    },
  })

function link(dep: ReactiveNode, sub: ReactiveNode, version: number) {
  const originalTail = dep.subsTail
  _link(dep, sub, version)
  const newTail = dep.subsTail

  if (newTail && newTail !== originalTail && isWatched(sub)) {
    // Propagate watch liveness from sub -> dep
    addWatch(dep)
  }
}


function unlink(
  link: Link,
  // sub must ALWAYS be link.sub, this arg is here for micro-optimization
  sub: ReactiveNode = link.sub
): Link | undefined {
  const dep = link.dep
  if (isWatched(sub)) {
    // Revoke liveness from this sub on dep when unlinked
    removeWatch(dep)
  }
  return _unlink(link, sub)
}

let notifyIndex = 0
let queuedEffectsLength = 0
let activeSub: ReactiveNode | undefined
let batchDepth = 0

export function batch(fn: () => void) {
  try {
    ++batchDepth
    fn()
  } finally {
    if (!--batchDepth) {
      flush()
    }
  }
}

function purgeDeps(sub: ReactiveNode) {
  const depsTail = sub.depsTail
  let dep = depsTail !== undefined ? depsTail.nextDep : sub.deps
  while (dep !== undefined) {
    dep = unlink(dep, sub)
  }
}

export function flush(): void {
  if (batchDepth > 0) {
    return
  }
  while (notifyIndex < queuedEffectsLength) {
    // eslint-disable-next-line no-shadow
    const effect = queuedEffects[notifyIndex]!
    queuedEffects[notifyIndex++] = undefined
    effect.notify()
  }
  notifyIndex = 0
  queuedEffectsLength = 0
}

type AsyncAtomState<TData, TError = unknown> =
  | { status: 'pending' }
  | { status: 'done'; data: TData }
  | { status: 'error'; error: TError }

export function createAsyncAtom<T>(
  getValue: () => Promise<T>,
  options?: AtomOptions<AsyncAtomState<T>>,
): ReadonlyAtom<AsyncAtomState<T>> {
  const ref: { current?: InternalAtom<AsyncAtomState<T>> } = {}
  const atom = createAtom<AsyncAtomState<T>>(() => {
    getValue().then(
      (data) => {
        const internalAtom = ref.current!
        if (internalAtom._update({ status: 'done', data })) {
          const subs = internalAtom.subs
          if (subs !== undefined) {
            propagate(subs)
            shallowPropagate(subs)
            flush()
          }
        }
      },
      (error) => {
        const internalAtom = ref.current!
        if (internalAtom._update({ status: 'error', error })) {
          const subs = internalAtom.subs
          if (subs !== undefined) {
            propagate(subs)
            shallowPropagate(subs)
            flush()
          }
        }
      },
    )

    return { status: 'pending' }
  }, options)
  ref.current = atom as unknown as InternalAtom<AsyncAtomState<T>>

  return atom
}

/**
 * Like React.useSyncExternalStore: pulls external state into an atom.
 * This can be used for interoperating with other state management libraries.
 *
 * ```ts
 * import * as redux from "redux"
 *
 * const reduxStore = redux.createStore((state: number, action: number) => state + action, 0)
 * const atom = createExternalStoreAtom(reduxStore.getState, reduxStore.subscribe)
 *
 * const timesTwo = createAtom(() => atom.get() * 2)
 * timesTwo.subscribe((value) => {
 *   console.log('timesTwo: ', value)
 * })
 *
 * reduxStore.dispatch(1)
 * // timesTwo: 2
 * reduxStore.dispatch(1)
 * // timesTwo: 4
 * ```
 */
export function createExternalStoreAtom<T>(
  getSnapshot: () => T,
  subscribe: (onStoreChange: () => void) => () => void,
  options?: AtomOptions<T>,
): ReadonlyAtom<T> {
  const trigger = createAtom(0)
  const invalidate = () => trigger.set((n) => n + 1)
  const atom = createAtom(() => {
    // Return latest snapshot when `trigger` changes
    trigger.get()
    return getSnapshot()
  }, options)
  // Attach whileWatched to `atom`, not `trigger`. An unobserved `atom.get()`
  // runs the getter with `activeSub = atom`, creating a trigger → atom link and
  // firing `watched(trigger)` — but trigger has no whileWatched callback, so
  // nothing happens. `watched(atom)` only fires when a real subscriber actually
  // links in via subscribe/effect, which is what we want.
  atom.whileWatched(() => subscribe(invalidate))
  return atom
}

export function createAtom<T>(
  getValue: (prev?: NoInfer<T>) => T,
  options?: AtomOptions<T>,
): ReadonlyAtom<T>
export function createAtom<T>(
  initialValue: T,
  options?: AtomOptions<T>,
): Atom<T>
export function createAtom<T>(
  valueOrFn: T | ((prev?: T) => T),
  options?: AtomOptions<T>,
): Atom<T> | ReadonlyAtom<T> {
  const isComputed = typeof valueOrFn === 'function'
  const getter = valueOrFn as (prev?: T) => T

  // Create plain object atom
  const atom: InternalAtom<T> = {
    _snapshot: isComputed ? undefined! : valueOrFn,
    _watched: false,

    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: isComputed ? ReactiveFlags.None : ReactiveFlags.Mutable,

    get(): T {
      if (activeSub !== undefined) {
        link(atom, activeSub, cycle)
      }
      return atom._snapshot
    },

    subscribe(observerOrFn: Observer<T> | ((value: T) => void)) {
      const obs = toObserver(observerOrFn)
      const observed = { current: false }
      const e = effect(() => {
        atom.get()
        if (!observed.current) {
          observed.current = true
        } else {
          obs.next?.(atom._snapshot)
        }
      })

      return {
        unsubscribe: () => {
          e.stop()
        },
      }
    },

    whileWatched(listener: WatchedEffect): () => void {
      return whileWatched(this, listener)
    },

    _update(getValue?: T | ((snapshot: T) => T)): boolean {
      const prevSub = activeSub
      const compare = options?.compare ?? Object.is
      if (isComputed) {
        activeSub = atom
        ++cycle
        atom.depsTail = undefined
      } else if (getValue === undefined) {
        // Mutable atoms can be marked dirty by the reactive graph, but they should
        // never be recomputed without an explicit value/updater.
        return false
      }
      if (isComputed) {
        atom.flags = ReactiveFlags.Mutable | ReactiveFlags.RecursedCheck
      }
      try {
        const oldValue = atom._snapshot
        const newValue =
          typeof getValue === 'function'
            ? (getValue as (snapshot: T) => T)(oldValue)
            : getValue === undefined && isComputed
              ? getter(oldValue)
              : getValue!
        if (oldValue === undefined || !compare(oldValue, newValue)) {
          atom._snapshot = newValue
          return true
        }
        return false
      } finally {
        activeSub = prevSub
        if (isComputed) {
          atom.flags &= ~ReactiveFlags.RecursedCheck
        }
        purgeDeps(atom)
      }
    },
  }

  if (isComputed) {
    atom.flags = ReactiveFlags.Mutable | ReactiveFlags.Dirty
    atom.get = function (): T {
      const flags = atom.flags
      if (
        flags & ReactiveFlags.Dirty ||
        (flags & ReactiveFlags.Pending && checkDirty(atom.deps!, atom))
      ) {
        if (atom._update()) {
          const subs = atom.subs
          if (subs !== undefined) {
            shallowPropagate(subs)
          }
        }
      } else if (flags & ReactiveFlags.Pending) {
        atom.flags = flags & ~ReactiveFlags.Pending
      }
      if (activeSub !== undefined) {
        link(atom, activeSub, cycle)
      }
      return atom._snapshot
    }
  } else {
    ;(atom as unknown as Atom<T>).set = function (
      // eslint-disable-next-line no-shadow
      valueOrFn: T | ((prev: T) => T),
    ): void {
      if (atom._update(valueOrFn)) {
        const subs = atom.subs
        if (subs !== undefined) {
          propagate(subs)
          shallowPropagate(subs)
          flush()
        }
      }
    }
  }

  return atom as unknown as Atom<T> | ReadonlyAtom<T>
}

interface Effect extends ReactiveNode {
  _watches: number
  notify: () => void
  stop: () => void
}

function effect<T>(fn: () => T): Effect {
  const run = (): T => {
    const prevSub = activeSub
    activeSub = effectObj
    ++cycle
    effectObj.depsTail = undefined
    effectObj.flags = ReactiveFlags.Watching | ReactiveFlags.RecursedCheck
    try {
      return fn()
    } finally {
      activeSub = prevSub
      effectObj.flags &= ~ReactiveFlags.RecursedCheck
      purgeDeps(effectObj)
    }
  }
  const effectObj: Effect = {
    deps: undefined,
    depsTail: undefined,
    subs: undefined,
    subsTail: undefined,
    flags: ReactiveFlags.Watching | ReactiveFlags.RecursedCheck,
    // Effects are the source of liveness - they are created alive
    _watches: 1,

    notify(): void {
      const flags = this.flags
      if (
        flags & ReactiveFlags.Dirty ||
        (flags & ReactiveFlags.Pending && checkDirty(this.deps!, this))
      ) {
        run()
      } else {
        this.flags = ReactiveFlags.Watching
      }
    },

    stop(): void {
      this.flags = ReactiveFlags.None
      this.depsTail = undefined
      purgeDeps(this)
      removeWatch(this)
    },
  }

  run()

  return effectObj
}
