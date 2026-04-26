import { describe, expect, test, vi } from 'vitest'
import { createAtom, createExternalStoreAtom } from '../src'

function makeExternalStore<T>(initial: T) {
  let value = initial
  const listeners = new Set<() => void>()
  return {
    getSnapshot: () => value,
    set(next: T) {
      value = next
      listeners.forEach((l) => l())
    },
    subscribe(cb: () => void) {
      listeners.add(cb)
      return () => {
        listeners.delete(cb)
      }
    },
    listenerCount: () => listeners.size,
  }
}

describe('whileWatched', () => {
  test('does not fire before any subscriber', () => {
    const atom = createAtom(0)
    const effect = vi.fn()
    atom.whileWatched(effect)

    expect(effect).not.toHaveBeenCalled()
  })

  test('fires on first subscribe; cleanup runs on last unsubscribe', () => {
    const atom = createAtom(0)
    const cleanup = vi.fn()
    const effect = vi.fn(() => cleanup)
    atom.whileWatched(effect)

    const sub = atom.subscribe(() => {})
    expect(effect).toHaveBeenCalledTimes(1)
    expect(cleanup).not.toHaveBeenCalled()

    sub.unsubscribe()
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  test('is ref-counted: multiple subscribers fire effect exactly once', () => {
    const atom = createAtom(0)
    const cleanup = vi.fn()
    const effect = vi.fn(() => cleanup)
    atom.whileWatched(effect)

    const sub1 = atom.subscribe(() => {})
    const sub2 = atom.subscribe(() => {})
    const sub3 = atom.subscribe(() => {})
    expect(effect).toHaveBeenCalledTimes(1)

    sub1.unsubscribe()
    sub2.unsubscribe()
    expect(cleanup).not.toHaveBeenCalled()

    sub3.unsubscribe()
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  test('re-fires on each 0→1 transition and cleans up on each 1→0', () => {
    const atom = createAtom(0)
    const cleanup = vi.fn()
    const effect = vi.fn(() => cleanup)
    atom.whileWatched(effect)

    atom.subscribe(() => {}).unsubscribe()
    atom.subscribe(() => {}).unsubscribe()
    atom.subscribe(() => {}).unsubscribe()

    expect(effect).toHaveBeenCalledTimes(3)
    expect(cleanup).toHaveBeenCalledTimes(3)
  })

  test('registering while already watched fires immediately', () => {
    const atom = createAtom(0)
    const sub = atom.subscribe(() => {})

    const cleanup = vi.fn()
    const effect = vi.fn(() => cleanup)
    atom.whileWatched(effect)

    expect(effect).toHaveBeenCalledTimes(1)
    expect(cleanup).not.toHaveBeenCalled()

    sub.unsubscribe()
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  test('multiple handlers all fire and all clean up', () => {
    const atom = createAtom(0)
    const cleanupA = vi.fn()
    const cleanupB = vi.fn()
    const effectA = vi.fn(() => cleanupA)
    const effectB = vi.fn(() => cleanupB)
    atom.whileWatched(effectA)
    atom.whileWatched(effectB)

    const sub = atom.subscribe(() => {})
    expect(effectA).toHaveBeenCalledTimes(1)
    expect(effectB).toHaveBeenCalledTimes(1)

    sub.unsubscribe()
    expect(cleanupA).toHaveBeenCalledTimes(1)
    expect(cleanupB).toHaveBeenCalledTimes(1)
  })

  test('effect returning void does not throw on unwatch', () => {
    const atom = createAtom(0)
    atom.whileWatched(() => {
      // no cleanup
    })

    const sub = atom.subscribe(() => {})
    expect(() => sub.unsubscribe()).not.toThrow()
  })

  test('stop() prevents future activations', () => {
    const atom = createAtom(0)
    const effect = vi.fn()
    const stop = atom.whileWatched(effect)

    atom.subscribe(() => {}).unsubscribe()
    expect(effect).toHaveBeenCalledTimes(1)

    stop()

    atom.subscribe(() => {}).unsubscribe()
    expect(effect).toHaveBeenCalledTimes(1)
  })

  test('stop() is idempotent', () => {
    const atom = createAtom(0)
    const stop = atom.whileWatched(() => {})
    expect(() => {
      stop()
      stop()
    }).not.toThrow()
  })

  test('works on computed atoms', () => {
    const source = createAtom(1)
    const derived = createAtom(() => source.get() * 2)

    const cleanup = vi.fn()
    const effect = vi.fn(() => cleanup)
    derived.whileWatched(effect)

    const sub = derived.subscribe(() => {})
    expect(effect).toHaveBeenCalledTimes(1)

    sub.unsubscribe()
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  test('cascades through computed deps: watching a derived atom watches its sources', () => {
    const source = createAtom(1)
    const derived = createAtom(() => source.get() * 2)

    const sourceCleanup = vi.fn()
    const sourceEffect = vi.fn(() => sourceCleanup)
    source.whileWatched(sourceEffect)

    const sub = derived.subscribe(() => {})
    expect(sourceEffect).toHaveBeenCalledTimes(1)
    expect(sourceCleanup).not.toHaveBeenCalled()

    sub.unsubscribe()
    expect(sourceCleanup).toHaveBeenCalledTimes(1)
  })

  test('subscribing directly to the source does not double-fire when a derived is also subscribed', () => {
    const source = createAtom(1)
    const derived = createAtom(() => source.get() * 2)

    const effect = vi.fn()
    source.whileWatched(effect)

    const subDerived = derived.subscribe(() => {})
    const subSource = source.subscribe(() => {})
    expect(effect).toHaveBeenCalledTimes(1)

    subDerived.unsubscribe()
    subSource.unsubscribe()
  })

  test('long chain sub/unsub cycles do not drift _watches', () => {
    const ext = makeExternalStore(1)
    const a = createExternalStoreAtom(ext.getSnapshot, ext.subscribe)
    const b = createAtom(() => a.get() * 2)
    const c = createAtom(() => `${b.get()} dogs`)

    const effect = vi.fn()
    const cleanup = vi.fn()
    a.whileWatched(() => {
      effect()
      return cleanup
    })

    for (let i = 0; i < 10; i++) {
      const sub = c.subscribe(() => {})
      expect(ext.listenerCount()).toBe(1)
      sub.unsubscribe()
      expect(ext.listenerCount()).toBe(0)
    }

    expect(effect).toHaveBeenCalledTimes(10)
    expect(cleanup).toHaveBeenCalledTimes(10)
  })

  test('conditional deps: dropped branch cleanup fires on recompute', () => {
    const cond = createAtom(true)
    const a = createAtom(1)
    const b = createAtom(10)
    const pick = createAtom(() => (cond.get() ? a.get() : b.get()))

    const aCleanup = vi.fn()
    const bCleanup = vi.fn()
    const aEffect = vi.fn(() => aCleanup)
    const bEffect = vi.fn(() => bCleanup)
    a.whileWatched(aEffect)
    b.whileWatched(bEffect)

    const sub = pick.subscribe(() => {})
    expect(aEffect).toHaveBeenCalledTimes(1)
    expect(bEffect).not.toHaveBeenCalled()

    cond.set(false)
    expect(aCleanup).toHaveBeenCalledTimes(1)
    expect(bEffect).toHaveBeenCalledTimes(1)
    expect(bCleanup).not.toHaveBeenCalled()

    cond.set(true)
    expect(bCleanup).toHaveBeenCalledTimes(1)
    expect(aEffect).toHaveBeenCalledTimes(2)

    sub.unsubscribe()
    expect(aCleanup).toHaveBeenCalledTimes(2)
    expect(bCleanup).toHaveBeenCalledTimes(1)
  })

  test('diamond graph: shared source counted once per activation', () => {
    const ext = makeExternalStore(1)
    const source = createExternalStoreAtom(ext.getSnapshot, ext.subscribe)
    const left = createAtom(() => source.get() + 1)
    const right = createAtom(() => source.get() + 2)

    const subL = left.subscribe(() => {})
    expect(ext.listenerCount()).toBe(1)
    const subR = right.subscribe(() => {})
    expect(ext.listenerCount()).toBe(1)

    subL.unsubscribe()
    expect(ext.listenerCount()).toBe(1)
    subR.unsubscribe()
    expect(ext.listenerCount()).toBe(0)

    // Re-activation cycle works
    const subL2 = left.subscribe(() => {})
    expect(ext.listenerCount()).toBe(1)
    subL2.unsubscribe()
    expect(ext.listenerCount()).toBe(0)
  })

  test('stop() while watched runs cleanup immediately and only once', () => {
    const atom = createAtom(0)
    const cleanup = vi.fn()
    const stop = atom.whileWatched(() => cleanup)

    const sub = atom.subscribe(() => {})
    expect(cleanup).not.toHaveBeenCalled()

    stop()
    expect(cleanup).toHaveBeenCalledTimes(1)

    sub.unsubscribe()
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  test('re-entrant subscribe during cleanup leaves graph consistent', () => {
    const ext = makeExternalStore(0)
    const atom = createExternalStoreAtom(ext.getSnapshot, ext.subscribe)

    const activate = vi.fn()
    let reenter = true

    atom.whileWatched(() => {
      activate()
      return () => {
        if (reenter) {
          reenter = false
          // briefly resubscribe during cleanup — activates a second cycle
          const innerSub = atom.subscribe(() => {})
          innerSub.unsubscribe()
        }
      }
    })

    const sub = atom.subscribe(() => {})
    expect(activate).toHaveBeenCalledTimes(1)
    expect(ext.listenerCount()).toBe(1)

    sub.unsubscribe()
    // The re-entry created a 2nd activation, then cleaned up.
    expect(activate).toHaveBeenCalledTimes(2)
    // After all unwinding, external store must have zero listeners.
    expect(ext.listenerCount()).toBe(0)

    // _watches must not be stuck: a fresh subscribe re-activates.
    const sub2 = atom.subscribe(() => {})
    expect(activate).toHaveBeenCalledTimes(3)
    expect(ext.listenerCount()).toBe(1)
    sub2.unsubscribe()
    expect(ext.listenerCount()).toBe(0)
  })

  test('adding a whileWatched during another effect runs it immediately', () => {
    const atom = createAtom(0)
    const outerEffect = vi.fn()
    const lateEffect = vi.fn()
    const lateCleanup = vi.fn()

    atom.whileWatched(() => {
      outerEffect()
      atom.whileWatched(() => {
        lateEffect()
        return lateCleanup
      })
    })

    // whileWatched should not have started the effect immediately
    expect(outerEffect).not.toHaveBeenCalled()
    expect(lateEffect).not.toHaveBeenCalled()

    const sub = atom.subscribe(() => {})
    expect(outerEffect).toHaveBeenCalledTimes(1)
    expect(lateEffect).toHaveBeenCalledTimes(1)
    expect(lateCleanup).not.toHaveBeenCalled()

    sub.unsubscribe()
    expect(lateCleanup).toHaveBeenCalledTimes(1)
  })

  test('many subscribers release source exactly when the last one leaves', () => {
    const ext = makeExternalStore(0)
    const atom = createExternalStoreAtom(ext.getSnapshot, ext.subscribe)

    const subs = Array.from({ length: 20 }, () => atom.subscribe(() => {}))
    expect(ext.listenerCount()).toBe(1)

    for (let i = 0; i < subs.length - 1; i++) {
      subs[i].unsubscribe()
      expect(ext.listenerCount()).toBe(1)
    }

    subs[subs.length - 1].unsubscribe()
    expect(ext.listenerCount()).toBe(0)
  })
})
