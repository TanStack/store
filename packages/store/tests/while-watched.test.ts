import { describe, expect, test, vi } from 'vitest'
import { createAtom } from '../src'

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
})
