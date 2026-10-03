import { describe, expect, test, vi } from 'vitest'
import { batch, createAsyncAtom, createAtom } from '../src'
import type { ReadonlyAtom } from '../src'
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

  test.each([32, 128])(
    'validates and recomputes a dormant chain of depth %i with linear reads',
    (depth) => {
      const source = createAtom(0)
      const atoms: Array<ReadonlyAtom<number>> = [source]
      const getterCalls = Array<number>(depth).fill(0)
      for (let index = 0; index < depth; index++) {
        const dependency = atoms[index]!
        atoms.push(
          createAtom(() => {
            getterCalls[index] = getterCalls[index]! + 1
            return dependency.get() + 1
          }),
        )
      }
      const reads = atoms.map((atom) => vi.spyOn(atom, 'get'))
      const derived = atoms[depth]!
      expect(derived.get()).toBe(depth)
      for (const read of reads) read.mockClear()
      getterCalls.fill(0)

      source.set(1)
      expect(derived.get()).toBe(depth + 1)
      // One validation read and one getter read per dependency, plus the root.
      expect(
        reads.reduce((total, read) => total + read.mock.calls.length, 0),
      ).toBeLessThanOrEqual(2 * depth + 1)
      expect(getterCalls).toEqual(Array<number>(depth).fill(1))
      for (const atom of atoms) expectUnwatched(atom)
    },
  )

  test('reading a dormant getter never adds it to a source subscriber list', () => {
    const source = createAtom(0)
    const derived = createAtom(() => {
      const value = source.get()
      expectUnwatched(source)
      return value + 1
    })

    expect(derived.get()).toBe(1)
    source.set(1)
    expect(derived.get()).toBe(2)
    expectUnwatched(source)
  })

  test('reuses retained links when a dormant getter recomputes', () => {
    const source = createAtom(0)
    const derived = createAtom(() => source.get() + 1)
    derived.get()
    const link = (derived as unknown as ReactiveNode).deps

    source.set(1)
    expect(derived.get()).toBe(2)
    expect((derived as unknown as ReactiveNode).deps).toBe(link)
    expectUnwatched(source)
  })

  test('creating a subscription inside a dormant getter isolates observer reads', () => {
    const source = createAtom(0)
    const own = createAtom(0)
    const unrelated = createAtom(0)
    const hot = createAtom(() => source.get() + 1)
    const seen: Array<number> = []
    let subscription: ReturnType<typeof hot.subscribe> | undefined
    const getter = vi.fn(() => {
      own.get()
      subscription ??= hot.subscribe((value) => {
        unrelated.get()
        seen.push(value)
      })
      return { value: own.get() }
    })
    const derived = createAtom(getter)
    const snapshot = derived.get()

    source.set(1)
    unrelated.set(1)
    expect(seen).toEqual([2])
    expect(derived.get()).toBe(snapshot)
    expect(getter).toHaveBeenCalledTimes(1)
    own.set(1)
    expect(derived.get()).toEqual({ value: 1 })
    subscription!.unsubscribe()
    expectUnwatched(source)
    expectUnwatched(own)
  })

  test('a caught nested getter error preserves the enclosing dependencies', () => {
    const trigger = createAtom(0)
    const source = createAtom(0)
    const nested = createAtom(() => {
      const value = source.get()
      if (value === 0) throw new Error('not ready')
      return value
    })
    const getter = vi.fn(() => {
      trigger.get()
      try {
        return { value: nested.get() }
      } catch {
        return { value: -1 }
      }
    })
    const derived = createAtom(getter)
    const fallback = derived.get()

    source.set(2)
    expect(derived.get()).toBe(fallback)
    expect(getter).toHaveBeenCalledTimes(1)
    trigger.set(1)
    expect(derived.get()).toEqual({ value: 2 })
    expectUnwatched(source)
    expectUnwatched(trigger)
  })

  test('discarding the subscription handle keeps the subscription live', () => {
    const source = createAtom(0)
    const derived = createAtom(() => source.get() + 1)
    const observer = vi.fn()
    derived.subscribe(observer)

    source.set(1)
    source.set(2)
    expect(observer.mock.calls).toEqual([[2], [3]])
    expect((source as unknown as ReactiveNode).subs).toBeDefined()
    expect((derived as unknown as ReactiveNode).subs).toBeDefined()
  })

  test('repeated non-consecutive cold reads retain one link per dependency', () => {
    const first = createAtom(0)
    const second = createAtom(1)
    const derived = createAtom(() => {
      let total = 0
      for (let index = 0; index < 1000; index++) {
        total += first.get() + second.get()
      }
      return total
    })

    const expectTwoDependencies = () => {
      const node = derived as unknown as ReactiveNode
      expect(node.deps?.dep).toBe(first)
      expect(node.deps?.nextDep?.dep).toBe(second)
      expect(node.deps?.nextDep?.nextDep).toBeUndefined()
    }
    expect(derived.get()).toBe(1000)
    expectTwoDependencies()
    first.set(1)
    expect(derived.get()).toBe(2000)
    expectTwoDependencies()
    expectUnwatched(first)
    expectUnwatched(second)
  })

  test('a nested cold read does not suppress its enclosing direct dependency', () => {
    const source = createAtom(1)
    const intermediate = createAtom(() => {
      source.get()
      return 0
    })
    const derived = createAtom(() => intermediate.get() + source.get())

    expect(derived.get()).toBe(1)
    const node = derived as unknown as ReactiveNode
    expect(node.deps?.dep).toBe(intermediate)
    expect(node.deps?.nextDep?.dep).toBe(source)
    source.set(2)
    expect(derived.get()).toBe(2)
    expectUnwatched(source)
    expectUnwatched(intermediate)
  })

  test('retains new dependencies when the last subscription stops inside a getter', () => {
    const source = createAtom(0)
    const nextSource = createAtom(10)
    let stopDuringGetter = false
    const derived = createAtom(() => {
      const value = source.get()
      if (stopDuringGetter) subscription.unsubscribe()
      return value + (stopDuringGetter ? nextSource.get() : 0)
    })
    const read = derived.get
    const subscription = derived.subscribe(() => {})
    stopDuringGetter = true

    batch(() => {
      source.set(1)
      expect(read()).toBe(11)
    })
    expectUnwatched(source)
    expectUnwatched(nextSource)
    nextSource.set(20)
    expect(read()).toBe(21)
    expectUnwatched(source)
    expectUnwatched(nextSource)
  })

  test('detaches a new child when its getter stops the enclosing subscription', () => {
    const chooseChild = createAtom(false)
    const source = createAtom(7)
    let stopDuringChildGetter = false
    const child = createAtom(() => {
      const value = source.get()
      if (stopDuringChildGetter) subscription.unsubscribe()
      return value
    })
    const parent = createAtom(() => (chooseChild.get() ? child.get() : 0))
    const subscription = parent.subscribe(() => {})
    stopDuringChildGetter = true

    batch(() => {
      chooseChild.set(true)
      expect(parent.get()).toBe(7)
    })
    expectUnwatched(chooseChild)
    expectUnwatched(source)
    expectUnwatched(child)
    source.set(9)
    expect(parent.get()).toBe(9)
    expectUnwatched(source)
    expectUnwatched(child)
  })

  test('detaches cached child dependencies when activation stops the enclosing subscription', () => {
    const chooseChild = createAtom(false)
    const source = createAtom(7)
    const trigger = createAtom(0)
    let stopDuringValidation = false
    const intermediate = createAtom(() => {
      trigger.get()
      if (stopDuringValidation) subscription.unsubscribe()
      return 0
    })
    const getter = vi.fn(() => source.get() + intermediate.get())
    const child = createAtom(getter)
    expect(child.get()).toBe(7)
    const parent = createAtom(() => (chooseChild.get() ? child.get() : 0))
    const subscription = parent.subscribe(() => {})
    stopDuringValidation = true

    batch(() => {
      chooseChild.set(true)
      trigger.set(1)
      expect(parent.get()).toBe(7)
    })
    expect(getter).toHaveBeenCalledTimes(1)
    expectUnwatched(chooseChild)
    expectUnwatched(source)
    expectUnwatched(trigger)
    expectUnwatched(intermediate)
    expectUnwatched(child)
    source.set(9)
    expect(parent.get()).toBe(9)
    expectUnwatched(source)
    expectUnwatched(trigger)
  })

  test('a subscription failing before any dependency read can recover without becoming observed', () => {
    const source = createAtom(1)
    let ready = false
    const derived = createAtom(() => {
      if (!ready) throw new Error('not ready')
      return source.get()
    })

    expect(() => derived.subscribe(() => {})).toThrow('not ready')
    ready = true
    expect(derived.get()).toBe(1)
    expectUnwatched(source)
    expectUnwatched(derived)
    source.set(2)
    expect(derived.get()).toBe(2)
    expectUnwatched(source)
  })

  test('an observer can read a computing child after its enclosing subscription stops', () => {
    const chooseChild = createAtom(false)
    const source = createAtom(1)
    const nextSource = createAtom(10)
    const notification = createAtom(0)
    let stopDuringChildGetter = false
    const child = createAtom(() => {
      const value = source.get()
      if (!stopDuringChildGetter) return value
      parentSubscription.unsubscribe()
      notification.set(1)
      return value + nextSource.get()
    })
    const readChild = child.get
    expect(readChild()).toBe(1)
    const seen: Array<number> = []
    const notificationSubscription = notification.subscribe(() => {
      seen.push(readChild())
    })
    const parent = createAtom(() => (chooseChild.get() ? readChild() : 0))
    const driverSubscription = chooseChild.subscribe(() => {
      parent.get()
    })
    const parentSubscription = parent.subscribe(() => {})
    stopDuringChildGetter = true
    source.set(2)

    chooseChild.set(true)
    expect(parent.get()).toBe(12)
    expect(seen).toEqual([1])
    expectUnwatched(source)
    expectUnwatched(nextSource)
    expectUnwatched(child)
    source.set(3)
    expect(parent.get()).toBe(13)
    expectUnwatched(source)
    expectUnwatched(nextSource)
    driverSubscription.unsubscribe()
    notificationSubscription.unsubscribe()
  })

  test('activation preserves the snapshot when a pending dependency recovers with an equal output', () => {
    const chooseChild = createAtom(false)
    const source = createAtom(0)
    const trigger = createAtom(0)
    const parity = createAtom(() => source.get() % 2)
    let stopDuringValidation = false
    const intermediate = createAtom(() => {
      trigger.get()
      if (stopDuringValidation) {
        subscription.unsubscribe()
        source.set(2)
      }
      return 0
    })
    const child = createAtom<number>((previous) => {
      parity.get()
      intermediate.get()
      return (previous ?? 0) + 1
    })
    expect(child.get()).toBe(1)
    const parent = createAtom(() => (chooseChild.get() ? child.get() : 0))
    const subscription = parent.subscribe(() => {})
    stopDuringValidation = true

    batch(() => {
      chooseChild.set(true)
      trigger.set(1)
      expect(parent.get()).toBe(1)
    })
    expectUnwatched(source)
    expectUnwatched(trigger)
    expectUnwatched(parity)
    expectUnwatched(child)
  })
})
