import {
  COLD,
  DIRTY,
  MUTABLE,
  NONE,
  PENDING,
  RECURSED_CHECK,
  WATCHING,
  createReactiveSystem,
} from './alien'

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

interface InternalAtom<T> extends ReactiveNode {
  _snapshot: T
  version: number
  _update: (getValue?: T | ((snapshot: T) => T)) => boolean
  get: () => T
  subscribe: (observerOrFn: Observer<T> | ((value: T) => void)) => Subscription
}

const queuedEffects: Array<Effect | undefined> = []
let cycle = 0
// Only explicit writes advance this epoch; computed changes have local revisions.
let writeVersion = 0
// Utility-only imports can discard the engine when none of its methods are used.
const reactiveSystem = /* @__PURE__ */ createReactiveSystem({
  update(atom: InternalAtom<any>): boolean {
    return atom._update()
  },
  // eslint-disable-next-line no-shadow
  notify(effect: Effect): void {
    queuedEffects[queuedEffectsLength++] = effect
    effect.flags &= ~WATCHING
  },
  unwatched,
})

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
    dep = reactiveSystem.unlink(dep)
  }
}

function unwatched(atom: InternalAtom<any>): void {
  // Restore cold mode even for computeds without dependencies. Mutable atoms
  // may also carry COLD; only subscriber tracking reads this bit.
  if (atom.flags & COLD) {
    return
  }
  atom.flags |= COLD
  // A getter may lose its last subscriber before reading more dependencies.
  atom.runId = ++cycle
  // Preserve pending changes before replacing tracking cycles with snapshots
  // of dependency versions. Detached nodes no longer receive invalidations.
  if (atom.flags & PENDING) {
    atom.flags = (atom.flags & ~PENDING) | DIRTY
  }
  for (let dep: Link | undefined = atom.deps; dep; dep = dep.nextDep) {
    dep.version = (dep.dep as InternalAtom<any>).version
    reactiveSystem.unlink(dep, true)
  }
}

// Share dormant validation without allocating a helper for every computed atom.
function validateCold(atom: InternalAtom<any>, observing: boolean): void {
  const deps = atom.deps
  if (observing) {
    atom.flags &= ~COLD
    atom.depsTail = undefined
  }
  if (deps === undefined || atom.flags & DIRTY) return
  const prevSub = activeSub
  activeSub = observing ? atom : undefined
  try {
    for (
      let depLink: Link | undefined = deps;
      depLink;
      depLink = depLink.nextDep
    ) {
      const dep = depLink.dep as InternalAtom<any>
      const version = depLink.version
      dep.get()
      if (dep.version !== version) {
        atom.flags |= DIRTY
        break
      }
    }
  } finally {
    activeSub = prevSub
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
  const atom = createAtom<AsyncAtomState<T>>(() => {
    getValue().then(
      (data) => complete({ status: 'done', data }),
      (error) => complete({ status: 'error', error }),
    )

    return { status: 'pending' }
  }, options) as InternalAtom<AsyncAtomState<T>>

  function complete(state: AsyncAtomState<T>): void {
    if (atom._update(state)) {
      const subs = atom.subs
      if (subs !== undefined) {
        reactiveSystem.propagate(subs)
        reactiveSystem.shallowPropagate(subs)
        flush()
      }
    }
  }

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

    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: MUTABLE,

    get(): T {
      if (activeSub !== undefined) {
        reactiveSystem.link(atom, activeSub, cycle)
      }
      return atom._snapshot
    },

    subscribe(observerOrFn: Observer<T> | ((value: T) => void)) {
      const obs = toObserver(observerOrFn)
      let observed = false
      const e = effect(() => {
        atom.get()
        if (!observed) {
          observed = true
        } else {
          // Observer reads must not become dependencies of the subscription.
          // The enclosing effect restores activeSub in its finally block.
          activeSub = undefined
          obs.next?.(atom._snapshot)
        }
      })

      return {
        unsubscribe: () => {
          e.stop()
        },
      }
    },
    // Mutable atoms install their own updater below, keeping both paths direct.
    _update(getValue?: T | ((snapshot: T) => T)): boolean {
      const prevSub = activeSub
      const compare = options?.compare ?? Object.is
      // Observation transitions choose the mode; updates preserve it.
      const cold = atom.flags & COLD
      activeSub = atom
      ++cycle
      if (cold) atom.runId = cycle
      atom.depsTail = undefined
      atom.flags = MUTABLE | RECURSED_CHECK | cold
      try {
        const oldValue = atom._snapshot
        const newValue =
          getValue === undefined
            ? getter(oldValue)
            : typeof getValue === 'function'
              ? (getValue as (snapshot: T) => T)(oldValue)
              : getValue
        if (oldValue === undefined || !compare(oldValue, newValue)) {
          atom._snapshot = newValue
          ++atom.version
          if (getValue !== undefined) ++writeVersion
          return true
        }
        return false
      } catch (error) {
        atom.flags |= DIRTY
        throw error
      } finally {
        activeSub = prevSub
        atom.flags &= ~RECURSED_CHECK
        purgeDeps(atom)
      }
    },
    version: 0,
    runId: 0,
    lastRead: 0,
  }

  if (isComputed) {
    let checkedVersion = -1
    // A real observer activates tracking before validation or first evaluation.
    atom.flags = MUTABLE | COLD | DIRTY
    // Keep this reader stable across transitions: callers may capture it.
    atom.get = function (): T {
      const cold = atom.flags & COLD
      const startVersion = writeVersion
      try {
        if (cold) {
          const observing = activeSub !== undefined && !(activeSub.flags & COLD)
          if (checkedVersion !== writeVersion || observing) {
            validateCold(atom, observing)
          }
        }
        const flags = atom.flags
        if (
          flags & DIRTY ||
          (flags & PENDING && reactiveSystem.checkDirty(atom.deps!, atom))
        ) {
          if (atom._update()) {
            const subs = atom.subs
            if (subs !== undefined) reactiveSystem.shallowPropagate(subs)
          }
        } else if (flags & PENDING) {
          atom.flags = flags & ~PENDING
        }
        if (activeSub !== undefined) {
          reactiveSystem.link(atom, activeSub, cycle)
        }
        if (cold) checkedVersion = startVersion
        return atom._snapshot
      } catch (error) {
        atom.flags |= DIRTY
        throw error
      } finally {
        if (atom.subs === undefined) unwatched(atom)
      }
    }
  } else {
    // Updater and comparer reads remain dependencies of the enclosing getter.
    atom._update = function (getValue?: T | ((snapshot: T) => T)): boolean {
      const compare = options?.compare ?? Object.is
      if (getValue === undefined) return false
      const oldValue = atom._snapshot
      const newValue =
        typeof getValue === 'function'
          ? (getValue as (snapshot: T) => T)(oldValue)
          : getValue
      if (oldValue === undefined || !compare(oldValue, newValue)) {
        atom._snapshot = newValue
        ++atom.version
        ++writeVersion
        return true
      }
      return false
    }
    ;(atom as unknown as Atom<T>).set = function (
      // eslint-disable-next-line no-shadow
      valueOrFn: T | ((prev: T) => T),
    ): void {
      if (atom._update(valueOrFn)) {
        const subs = atom.subs
        if (subs !== undefined) {
          reactiveSystem.propagate(subs)
          reactiveSystem.shallowPropagate(subs)
          flush()
        }
      }
    }
  }

  return atom as unknown as Atom<T> | ReadonlyAtom<T>
}

interface Effect extends ReactiveNode {
  notify: () => void
  stop: () => void
}

function effect<T>(fn: () => T): Effect {
  const run = (): T => {
    const prevSub = activeSub
    activeSub = effectObj
    ++cycle
    effectObj.depsTail = undefined
    effectObj.flags = WATCHING | RECURSED_CHECK
    try {
      return fn()
    } finally {
      activeSub = prevSub
      effectObj.flags &= ~RECURSED_CHECK
      purgeDeps(effectObj)
    }
  }
  const effectObj: Effect = {
    deps: undefined,
    depsTail: undefined,
    subs: undefined,
    subsTail: undefined,
    flags: WATCHING | RECURSED_CHECK,

    notify(): void {
      const flags = this.flags
      if (
        flags & DIRTY ||
        (flags & PENDING && reactiveSystem.checkDirty(this.deps!, this))
      ) {
        run()
      } else {
        this.flags = WATCHING
      }
    },

    stop(): void {
      this.flags = NONE
      this.depsTail = undefined
      purgeDeps(this)
    },
  }

  run()

  return effectObj
}
