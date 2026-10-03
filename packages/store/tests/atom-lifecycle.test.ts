import { describe, expect, test, vi } from 'vitest'
import { batch, createAsyncAtom, createAtom } from '../src'

describe('Atom readers across subscription changes', () => {
  test.each([false, true])(
    'an async rejection preserves the cached snapshot across subscription changes (observed: %s)',
    async (observed) => {
      let reject!: (error: unknown) => void
      const request = vi.fn(
        () =>
          new Promise<number>((_resolve, fail) => {
            reject = fail
          }),
      )
      const atom = createAsyncAtom(request)
      const read = atom.get
      const pending = read()
      const observer = vi.fn()
      const subscription = observed ? atom.subscribe(observer) : undefined
      expect(read()).toBe(pending)

      const error = new Error('request failed')
      reject(error)
      await Promise.resolve()
      const snapshot = read()
      expect(snapshot).toEqual({ status: 'error', error })
      expect(request).toHaveBeenCalledTimes(1)
      if (observed) {
        expect(observer).toHaveBeenCalledExactlyOnceWith(snapshot)
      } else {
        expect(observer).not.toHaveBeenCalled()
      }

      subscription?.unsubscribe()
      const nextSubscription = atom.subscribe(observer)
      expect(atom.get).toBe(read)
      expect(read()).toBe(snapshot)
      expect(request).toHaveBeenCalledTimes(1)
      nextSubscription.unsubscribe()
    },
  )

  test('an extracted reader stays current across repeated subscribe and unsubscribe cycles', () => {
    const source = createAtom(0)
    const getter = vi.fn(() => ({ value: source.get() }))
    const derived = createAtom(getter)
    const read = derived.get
    let snapshot = read()

    for (let index = 0; index < 3; index++) {
      const observer = vi.fn()
      const subscription = derived.subscribe(observer)
      expect(derived.get).toBe(read)
      expect(read()).toBe(snapshot)
      source.set(index * 2 + 1)
      snapshot = read()
      expect(snapshot).toEqual({ value: index * 2 + 1 })
      expect(observer).toHaveBeenCalledExactlyOnceWith(snapshot)
      subscription.unsubscribe()
      source.set(index * 2 + 2)
      expect(derived.get).toBe(read)
      snapshot = read()
      expect(snapshot).toEqual({ value: index * 2 + 2 })
      expect(observer).toHaveBeenCalledTimes(1)
    }
    expect(getter).toHaveBeenCalledTimes(7)
  })

  test('a dormant extracted reader notices changes in an observed child', () => {
    const source = createAtom(0)
    const child = createAtom(() => ({ parity: source.get() % 2 }), {
      compare: (previous, next) => previous.parity === next.parity,
    })
    const subscription = child.subscribe(() => {})
    const getter = vi.fn(() => ({ child: child.get() }))
    const parent = createAtom(getter)
    const read = parent.get
    const snapshot = read()

    source.set(2)
    expect(read()).toBe(snapshot)
    expect(getter).toHaveBeenCalledTimes(1)
    source.set(3)
    expect(read()).toEqual({ child: { parity: 1 } })
    expect(getter).toHaveBeenCalledTimes(2)
    subscription.unsubscribe()
    source.set(4)
    expect(read()).toEqual({ child: { parity: 0 } })
    expect(getter).toHaveBeenCalledTimes(3)
  })

  test('an extracted reader retries after a subscribed getter throws and is unsubscribed', () => {
    const source = createAtom(1)
    const derived = createAtom(() => {
      const value = source.get()
      if (value < 0) throw new Error('not ready')
      return value
    })
    const read = derived.get
    expect(read()).toBe(1)
    const subscription = derived.subscribe(() => {})

    batch(() => {
      source.set(-1)
      expect(read).toThrow('not ready')
      subscription.unsubscribe()
    })
    source.set(2)
    expect(read()).toBe(2)
    const observer = vi.fn()
    const nextSubscription = derived.subscribe(observer)
    source.set(3)
    expect(observer).toHaveBeenCalledExactlyOnceWith(3)
    expect(read()).toBe(3)
    nextSubscription.unsubscribe()
  })

  test('a failed dependency check retries the parent getter after equal-output recovery', () => {
    const source = createAtom(1)
    const child = createAtom(() => {
      if (source.get() < 0) throw new Error('not ready')
      return 0
    })
    const parent = createAtom<number>((previous) => {
      child.get()
      return (previous ?? 0) + 1
    })
    const observer = vi.fn()
    const subscription = parent.subscribe(observer)
    expect(parent.get()).toBe(1)

    batch(() => {
      source.set(-1)
      expect(parent.get).toThrow('not ready')
      source.set(2)
      expect(parent.get()).toBe(2)
    })
    expect(observer).toHaveBeenCalledExactlyOnceWith(2)
    subscription.unsubscribe()
  })

  test('a throwing comparison option accessor does not lose a pending dependency change', () => {
    const source = createAtom(1)
    const intermediate = createAtom(() => source.get() * 2)
    let failComparison = false
    const derived = createAtom(() => intermediate.get(), {
      get compare() {
        if (failComparison) throw new Error('comparison not ready')
        return Object.is
      },
    })
    const observer = vi.fn()
    const subscription = derived.subscribe(observer)

    batch(() => {
      source.set(2)
      failComparison = true
      expect(derived.get).toThrow('comparison not ready')
      failComparison = false
      expect(derived.get()).toBe(4)
    })
    expect(observer).toHaveBeenCalledExactlyOnceWith(4)
    subscription.unsubscribe()
  })

  test('extracted constant and async readers preserve snapshots across subscription changes', async () => {
    const constantGetter = vi.fn(() => ({}))
    const constant = createAtom(constantGetter)
    const readConstant = constant.get
    const constantSnapshot = readConstant()
    const request = vi.fn(() => Promise.resolve(42))
    const asyncAtom = createAsyncAtom(request)
    const readAsync = asyncAtom.get
    const pendingSnapshot = readAsync()
    const asyncObserver = vi.fn()
    const firstSubscription = asyncAtom.subscribe(asyncObserver)
    expect(readAsync()).toBe(pendingSnapshot)
    await Promise.resolve()
    const doneSnapshot = readAsync()
    expect(doneSnapshot).toEqual({ status: 'done', data: 42 })
    expect(asyncObserver).toHaveBeenCalledExactlyOnceWith(doneSnapshot)
    firstSubscription.unsubscribe()

    for (let index = 0; index < 3; index++) {
      const constantSubscription = constant.subscribe(() => {})
      const asyncSubscription = asyncAtom.subscribe(() => {})
      expect(constant.get).toBe(readConstant)
      expect(asyncAtom.get).toBe(readAsync)
      expect(readConstant()).toBe(constantSnapshot)
      expect(readAsync()).toBe(doneSnapshot)
      constantSubscription.unsubscribe()
      asyncSubscription.unsubscribe()
      expect(readConstant()).toBe(constantSnapshot)
      expect(readAsync()).toBe(doneSnapshot)
    }
    expect(constantGetter).toHaveBeenCalledTimes(1)
    expect(request).toHaveBeenCalledTimes(1)
  })
})

describe('Mutable updates inside reactive getters', () => {
  test('updater and comparison reads remain dependencies of the enclosing getter', () => {
    const updaterSource = createAtom(1)
    const comparisonSource = createAtom(0)
    const target = createAtom(0, {
      compare: (previous, next) => {
        comparisonSource.get()
        return previous === next
      },
    })
    const getter = vi.fn(() => {
      target.set(() => updaterSource.get())
      return target.get()
    })
    const derived = createAtom(getter)
    const observer = vi.fn()
    const subscription = derived.subscribe(observer)

    expect(derived.get()).toBe(1)
    comparisonSource.set(1)
    expect(getter).toHaveBeenCalledTimes(2)
    expect(observer).not.toHaveBeenCalled()
    updaterSource.set(2)
    expect(derived.get()).toBe(2)
    expect(observer).toHaveBeenCalledExactlyOnceWith(2)
    subscription.unsubscribe()
  })

  test('reentrant and throwing updaters preserve nested writes and the captured previous value', () => {
    const atom = createAtom(1)
    const observer = vi.fn()
    const subscription = atom.subscribe(observer)

    atom.set((previous) => {
      atom.set(5)
      return previous + 1
    })
    expect(atom.get()).toBe(2)
    expect(observer.mock.calls).toEqual([[5], [2]])
    expect(() =>
      atom.set(() => {
        atom.set(7)
        throw new Error('update failed')
      }),
    ).toThrow('update failed')
    expect(atom.get()).toBe(7)
    expect(observer.mock.calls).toEqual([[5], [2], [7]])
    subscription.unsubscribe()
  })
})
