import { describe, expect, test, vi } from 'vitest'
import { batch, createAsyncAtom, createAtom } from '../src'
import type { ReactiveNode } from '../src/alien'

function expectUnwatched(atom: unknown) {
  expect((atom as ReactiveNode).subs).toBeUndefined()
  expect((atom as ReactiveNode).subsTail).toBeUndefined()
}

describe('Unobserved computed atoms', () => {
  test('reading an atom does not leave references from its source', () => {
    const source = createAtom(0)
    const derived = createAtom(() => source.get() + 1)

    expect(derived.get()).toBe(1)
    expectUnwatched(source)
    expectUnwatched(derived)
  })

  test('caches snapshots until a dependency changes', () => {
    const source = createAtom(0)
    const unrelated = createAtom(0)
    const getter = vi.fn(() => ({ value: source.get() }))
    const derived = createAtom(getter)
    const snapshot = derived.get()

    unrelated.set(1)
    expect(derived.get()).toBe(snapshot)
    source.set(0)
    expect(derived.get()).toBe(snapshot)
    expect(getter).toHaveBeenCalledTimes(1)
    source.set(1)
    expect(derived.get()).toEqual({ value: 1 })
    expect(getter).toHaveBeenCalledTimes(2)
    expectUnwatched(source)
  })

  test('validates chains without recomputing unchanged intermediate values', () => {
    const source = createAtom(0)
    const parity = createAtom(() => source.get() % 2)
    const getter = vi.fn(() => ({ parity: parity.get() }))
    const derived = createAtom(getter)
    const snapshot = derived.get()

    source.set(2)
    expect(derived.get()).toBe(snapshot)
    expect(getter).toHaveBeenCalledTimes(1)
    source.set(3)
    expect(derived.get()).toEqual({ parity: 1 })
    expectUnwatched(source)
    expectUnwatched(parity)
  })

  test('preserves custom comparisons and previous snapshots', () => {
    const source = createAtom(0)
    const getter = vi.fn((prev?: { parity: number }) => {
      return { parity: source.get() % 2, prev }
    })
    const derived = createAtom(getter, {
      compare: (a, b) => a.parity === b.parity,
    })
    const snapshot = derived.get()

    source.set(2)
    expect(derived.get()).toBe(snapshot)
    source.set(3)
    expect(derived.get()).toEqual({ parity: 1, prev: snapshot })
    expect(getter).toHaveBeenLastCalledWith(snapshot)
    expectUnwatched(source)
  })

  test('validates both branches of a diamond before and after subscribing', () => {
    const source = createAtom(1)
    const left = createAtom(() => source.get() * 2)
    const right = createAtom(() => source.get() * 3)
    const derived = createAtom(() => left.get() + right.get())

    expect(derived.get()).toBe(5)
    source.set(2)
    expect(derived.get()).toBe(10)
    expectUnwatched(source)
    const observer = vi.fn()
    const subscription = derived.subscribe(observer)
    source.set(3)
    expect(observer.mock.calls).toEqual([[15]])
    subscription.unsubscribe()
    expectUnwatched(source)
  })

  test('subscribes to a previously read chain without replacing its snapshot', () => {
    const source = createAtom(0)
    const intermediate = createAtom(() => source.get() + 1)
    const getter = vi.fn(() => ({ value: intermediate.get() }))
    const derived = createAtom(getter)
    const snapshot = derived.get()
    const observer = vi.fn()
    const subscription = derived.subscribe(observer)

    expect(derived.get()).toBe(snapshot)
    expect(getter).toHaveBeenCalledTimes(1)
    source.set(1)
    expect(observer).toHaveBeenLastCalledWith({ value: 2 })
    subscription.unsubscribe()
    expectUnwatched(source)
    expectUnwatched(intermediate)
    source.set(2)
    expect(derived.get()).toEqual({ value: 3 })
    expectUnwatched(source)

    const secondSubscription = derived.subscribe(observer)
    source.set(3)
    expect(observer).toHaveBeenLastCalledWith({ value: 4 })
    secondSubscription.unsubscribe()
    expectUnwatched(source)
  })

  test('tracks changed conditional dependencies when subscribing after a read', () => {
    const condition = createAtom(true)
    const left = createAtom(1)
    const right = createAtom(2)
    const derived = createAtom(() =>
      condition.get() ? left.get() : right.get(),
    )
    expect(derived.get()).toBe(1)
    condition.set(false)
    const observer = vi.fn()
    const subscription = derived.subscribe(observer)

    expect(derived.get()).toBe(2)
    expectUnwatched(left)
    left.set(3)
    expect(observer).not.toHaveBeenCalled()
    right.set(4)
    expect(observer).toHaveBeenLastCalledWith(4)
    subscription.unsubscribe()
    expectUnwatched(condition)
    expectUnwatched(right)
  })

  test('does not retain an unobserved atom through a subscribed dependency', () => {
    const source = createAtom(0)
    const intermediate = createAtom(() => source.get() + 1)
    const observer = vi.fn()
    const subscription = intermediate.subscribe(observer)
    const derived = createAtom(() => intermediate.get() + 1)

    expect(derived.get()).toBe(2)
    expect(
      (intermediate as unknown as ReactiveNode).subs?.nextSub,
    ).toBeUndefined()
    source.set(1)
    expect(observer).toHaveBeenLastCalledWith(2)
    expect(derived.get()).toBe(3)
    subscription.unsubscribe()
    expectUnwatched(source)
  })

  test('preserves pending changes when unsubscribing during a batch', () => {
    const source = createAtom(0)
    const intermediate = createAtom(() => source.get() + 1)
    const derived = createAtom(() => intermediate.get() + 1)
    const subscription = derived.subscribe(() => {})

    batch(() => {
      source.set(1)
      subscription.unsubscribe()
      expect(derived.get()).toBe(3)
    })
    expectUnwatched(source)
  })

  test('releases dependencies when a nested getter throws and can retry', () => {
    const source = createAtom(0)
    const intermediate = createAtom(() => {
      if (source.get() === 0) throw new Error('not ready')
      return source.get()
    })
    const derived = createAtom(() => intermediate.get() + 1)

    expect(() => derived.get()).toThrow('not ready')
    expectUnwatched(source)
    source.set(1)
    expect(derived.get()).toBe(2)
    expectUnwatched(source)
  })

  test('retries after a cached dependency throws while subscribing', () => {
    const stable = createAtom(0)
    const source = createAtom(1)
    const intermediate = createAtom(() => {
      if (source.get() === 0) throw new Error('not ready')
      return source.get()
    })
    const derived = createAtom(() => stable.get() + intermediate.get())

    expect(derived.get()).toBe(1)
    source.set(0)
    expect(() => derived.subscribe(() => {})).toThrow('not ready')
    expectUnwatched(stable)
    expectUnwatched(source)
    source.set(2)
    expect(derived.get()).toBe(2)
    expectUnwatched(source)
  })

  test('reconnects dirty dependencies even when their value stays equal', () => {
    const source = createAtom(0)
    const parity = createAtom(() => source.get() % 2)
    const derived = createAtom(() => ({ parity: parity.get() }))
    const subscription = derived.subscribe(() => {})

    batch(() => {
      source.set(2)
      subscription.unsubscribe()
    })
    const observer = vi.fn()
    const nextSubscription = derived.subscribe(observer)
    expect(derived.get()).toEqual({ parity: 0 })
    source.set(3)
    expect(observer.mock.calls).toEqual([[{ parity: 1 }]])
    nextSubscription.unsubscribe()
    expectUnwatched(source)
  })

  test('detects writes made inside an unobserved getter', () => {
    const source = createAtom(0)
    const derived = createAtom(() => {
      const value = source.get()
      if (value === 1) source.set(2)
      return value
    })

    expect(derived.get()).toBe(0)
    source.set(1)
    expect(derived.get()).toBe(1)
    expect(derived.get()).toBe(2)
    expectUnwatched(source)
  })

  test('preserves constant snapshots across writes and subscriptions', () => {
    const unrelated = createAtom(0)
    const getter = vi.fn(() => ({}))
    const derived = createAtom(getter)
    const snapshot = derived.get()

    unrelated.set(1)
    expect(derived.get()).toBe(snapshot)
    const subscription = derived.subscribe(() => {})
    expect(derived.get()).toBe(snapshot)
    expect(getter).toHaveBeenCalledTimes(1)
    subscription.unsubscribe()
  })

  test('observes async completion without restarting a cached request', async () => {
    const unrelated = createAtom(0)
    const request = vi.fn(() => Promise.resolve(42))
    const asyncAtom = createAsyncAtom(request)
    const derived = createAtom(() => asyncAtom.get().status)

    expect(derived.get()).toBe('pending')
    await Promise.resolve()
    expect(derived.get()).toBe('done')
    unrelated.set(1)
    const subscription = derived.subscribe(() => {})
    expect(derived.get()).toBe('done')
    expect(asyncAtom.get()).toEqual({ status: 'done', data: 42 })
    expect(request).toHaveBeenCalledTimes(1)
    subscription.unsubscribe()
    expectUnwatched(asyncAtom)
  })
})
