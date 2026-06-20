import { describe, expect, test, vi } from 'vitest'
import { createExternalStoreAtom } from '../src'

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

describe('createExternalStoreAtom', () => {
  test('initial value is getSnapshot() at creation time', () => {
    const ext = makeExternalStore(42)
    const atom = createExternalStoreAtom(ext.getSnapshot, ext.subscribe)
    expect(atom.get()).toBe(42)
  })

  test('does not subscribe to the external store without subscribers', () => {
    const ext = makeExternalStore(0)
    createExternalStoreAtom(ext.getSnapshot, ext.subscribe)
    expect(ext.listenerCount()).toBe(0)
  })

  test('unobserved .get() does not activate the external subscription', () => {
    const ext = makeExternalStore(7)
    const atom = createExternalStoreAtom(ext.getSnapshot, ext.subscribe)

    expect(atom.get()).toBe(7)
    expect(ext.listenerCount()).toBe(0)

    atom.get()
    atom.get()
    expect(ext.listenerCount()).toBe(0)
  })

  test('unobserved chain read through derived atoms does not activate', async () => {
    const { createAtom } = await import('../src')
    const ext = makeExternalStore(1)
    const a = createExternalStoreAtom(ext.getSnapshot, ext.subscribe)
    const b = createAtom(() => a.get() * 2)
    const c = createAtom(() => `${b.get()} dogs`)

    expect(c.get()).toBe('2 dogs')
    expect(ext.listenerCount()).toBe(0)
  })

  test('subscribes on first atom subscriber; unsubscribes on last', () => {
    const ext = makeExternalStore(0)
    const atom = createExternalStoreAtom(ext.getSnapshot, ext.subscribe)

    const sub = atom.subscribe(() => {})
    expect(ext.listenerCount()).toBe(1)

    sub.unsubscribe()
    expect(ext.listenerCount()).toBe(0)
  })

  test('pulls a fresh snapshot on activation (external changes while nobody watching)', () => {
    const ext = makeExternalStore(0)
    const atom = createExternalStoreAtom(ext.getSnapshot, ext.subscribe)

    ext.set(5)

    const received: Array<number> = []
    const sub = atom.subscribe((v) => received.push(v))
    expect(atom.get()).toBe(5)

    sub.unsubscribe()
  })

  test('notifies subscribers when the external store dispatches changes', () => {
    const ext = makeExternalStore(0)
    const atom = createExternalStoreAtom(ext.getSnapshot, ext.subscribe)

    const fn = vi.fn()
    const sub = atom.subscribe(fn)

    ext.set(1)
    ext.set(2)
    ext.set(3)

    expect(fn).toHaveBeenNthCalledWith(1, 1)
    expect(fn).toHaveBeenNthCalledWith(2, 2)
    expect(fn).toHaveBeenNthCalledWith(3, 3)
    expect(fn).toHaveBeenCalledTimes(3)

    sub.unsubscribe()
  })

  test('multiple subscribers share a single external subscription', () => {
    const ext = makeExternalStore(0)
    const subscribe = vi.fn(ext.subscribe)
    const atom = createExternalStoreAtom(ext.getSnapshot, subscribe)

    const s1 = atom.subscribe(() => {})
    const s2 = atom.subscribe(() => {})
    const s3 = atom.subscribe(() => {})

    expect(subscribe).toHaveBeenCalledTimes(1)
    expect(ext.listenerCount()).toBe(1)

    s1.unsubscribe()
    s2.unsubscribe()
    expect(ext.listenerCount()).toBe(1)

    s3.unsubscribe()
    expect(ext.listenerCount()).toBe(0)
  })

  test('re-subscribing after full teardown re-subscribes to the external store', () => {
    const ext = makeExternalStore(0)
    const subscribe = vi.fn(ext.subscribe)
    const atom = createExternalStoreAtom(ext.getSnapshot, subscribe)

    atom.subscribe(() => {}).unsubscribe()
    expect(ext.listenerCount()).toBe(0)

    atom.subscribe(() => {}).unsubscribe()
    expect(subscribe).toHaveBeenCalledTimes(2)
  })

  test('deduplicates: no notification when external value is Object.is-equal', () => {
    const ext = makeExternalStore({ x: 1 })
    const atom = createExternalStoreAtom(ext.getSnapshot, ext.subscribe)

    const fn = vi.fn()
    const sub = atom.subscribe(fn)

    ext.set(ext.getSnapshot())
    ext.set(ext.getSnapshot())
    expect(fn).not.toHaveBeenCalled()

    ext.set({ x: 1 })
    expect(fn).toHaveBeenCalledTimes(1)

    sub.unsubscribe()
  })

  test('does not infinite-loop when a subscriber triggers another external set', () => {
    const ext = makeExternalStore(0)
    const atom = createExternalStoreAtom(ext.getSnapshot, ext.subscribe)

    const seen: Array<number> = []
    const sub = atom.subscribe((v) => {
      seen.push(v)
      if (v === 1) ext.set(2)
    })

    ext.set(1)

    expect(seen).toEqual([1])
    expect(atom.get()).toBe(2)

    sub.unsubscribe()
  })

  test('works as a dep inside another computed atom', async () => {
    const { createAtom } = await import('../src')
    const ext = makeExternalStore(10)
    const atom = createExternalStoreAtom(ext.getSnapshot, ext.subscribe)
    const doubled = createAtom(() => atom.get() * 2)

    const fn = vi.fn()
    const sub = doubled.subscribe(fn)
    expect(doubled.get()).toBe(20)

    ext.set(7)
    expect(doubled.get()).toBe(14)
    expect(fn).toHaveBeenLastCalledWith(14)

    sub.unsubscribe()
    expect(ext.listenerCount()).toBe(0)
  })
})
