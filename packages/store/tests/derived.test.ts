import { afterEach, describe, expect, test, vi } from 'vitest'
import { createAtom } from '../src'

import type { AnyAtom } from '../src'

function viFnSubscribe(subscribable: AnyAtom) {
  const fn = vi.fn()
  const cleanup = subscribable.subscribe((s) => fn(s)).unsubscribe
  afterEach(() => {
    cleanup()
  })
  return fn
}

describe('Derived', () => {
  test('Diamond dep problem', () => {
    const count = createAtom(10)

    const halfCount = createAtom(() => {
      return count.get() / 2
    })

    const doubleCount = createAtom(() => {
      return count.get() * 2
    })

    const sumDoubleHalfCount = createAtom(() => {
      return halfCount.get() + doubleCount.get()
    })

    const halfCountFn = viFnSubscribe(halfCount)
    const doubleCountFn = viFnSubscribe(doubleCount)
    const sumDoubleHalfCountFn = viFnSubscribe(sumDoubleHalfCount)

    count.set(() => 20)

    expect(halfCountFn).toHaveBeenNthCalledWith(1, 10)
    expect(doubleCountFn).toHaveBeenNthCalledWith(1, 40)
    expect(sumDoubleHalfCountFn).toHaveBeenNthCalledWith(1, 50)

    count.set(() => 30)

    expect(halfCountFn).toHaveBeenNthCalledWith(2, 15)
    expect(doubleCountFn).toHaveBeenNthCalledWith(2, 60)
    expect(sumDoubleHalfCountFn).toHaveBeenNthCalledWith(2, 75)
  })

  /**
   *         A
   *        / \
   *       B   C
   *      / \  |
   *     D  E  F
   *      \ / |
   *       \ /
   *        G
   */
  test('Complex diamond dep problem', () => {
    const a = createAtom(1)
    const b = createAtom(() => a.get())
    const c = createAtom(() => a.get())
    const d = createAtom(() => b.get())
    const e = createAtom(() => b.get())
    const f = createAtom(() => c.get())
    const g = createAtom(() => d.get() + e.get() + f.get())

    const aFn = viFnSubscribe(a)
    const bFn = viFnSubscribe(b)
    const cFn = viFnSubscribe(c)
    const dFn = viFnSubscribe(d)
    const eFn = viFnSubscribe(e)
    const fFn = viFnSubscribe(f)
    const gFn = viFnSubscribe(g)

    a.set(() => 2)

    expect(aFn).toHaveBeenNthCalledWith(1, 2)
    expect(bFn).toHaveBeenNthCalledWith(1, 2)
    expect(cFn).toHaveBeenNthCalledWith(1, 2)
    expect(dFn).toHaveBeenNthCalledWith(1, 2)
    expect(eFn).toHaveBeenNthCalledWith(1, 2)
    expect(fFn).toHaveBeenNthCalledWith(1, 2)
    expect(gFn).toHaveBeenNthCalledWith(1, 6)
  })

  test('Derive from store and another derived', () => {
    const count = createAtom(10)

    const doubleCount = createAtom(() => {
      return count.get() * 2
    })
    const tripleCount = createAtom(() => {
      return count.get() + doubleCount.get()
    })

    const doubleCountFn = viFnSubscribe(doubleCount)
    const tripleCountFn = viFnSubscribe(tripleCount)

    count.set(() => 20)

    expect(doubleCountFn).toHaveBeenNthCalledWith(1, 40)
    expect(tripleCountFn).toHaveBeenNthCalledWith(1, 60)

    count.set(() => 30)

    expect(doubleCountFn).toHaveBeenNthCalledWith(2, 60)
    expect(tripleCountFn).toHaveBeenNthCalledWith(2, 90)
  })

  test('listeners should receive old and new values', () => {
    const store = createAtom(12)
    const derived = createAtom<{
      prevVal: number | undefined
      currentVal: number
    }>((prevVal) => ({
      prevVal: prevVal?.currentVal,
      currentVal: store.get() * 2,
    }))
    const fn = vi.fn()
    derived.subscribe(fn)
    store.set(() => 24)
    expect(fn).toBeCalledWith({ prevVal: 24, currentVal: 48 })
  })

  test.skip('derivedFn should receive old and new dep values', () => {
    const count = createAtom(12)
    const date = new Date()
    const time = createAtom(date)
    const fn = vi.fn()
    createAtom(() => {
      return count.get() + time.get().getTime()
    })
    expect(fn).toBeCalledWith({
      prevDepVals: undefined,
      currDepVals: [12, date],
    })
    count.set(() => 24)
    expect(fn).toBeCalledWith({
      prevDepVals: [12, date],
      currDepVals: [24, date],
    })
  })

  test('derivedFn should receive old and new dep values for similar derived values', () => {
    const count = createAtom(12)
    const halfCount = createAtom(() => count.get() / 2)
    const derived = createAtom<{
      prevDepVals: [number, number] | undefined
      currDepVals: [number, number]
    }>((prev) => {
      return {
        prevDepVals: prev?.currDepVals,
        currDepVals: [count.get(), halfCount.get()],
      }
    })

    expect(derived.get()).toEqual({
      prevDepVals: undefined,
      currDepVals: [12, 6],
    })
    count.set(() => 24)
    expect(derived.get()).toEqual({
      prevDepVals: [12, 6],
      currDepVals: [24, 12],
    })
  })

  test('derivedFn should receive the old value', () => {
    const count = createAtom(12)
    const atom = createAtom<{
      prevVal: number | undefined
      currentVal: number
    }>((prev) => {
      return {
        prevVal: prev?.currentVal,
        currentVal: count.get(),
      }
    })

    expect(atom.get()).toEqual({ prevVal: undefined, currentVal: 12 })
    count.set(() => 24)
    expect(atom.get()).toEqual({ prevVal: 12, currentVal: 24 })
  })

  test('should be able to mount and unmount correctly repeatly', () => {
    const count = createAtom(12)
    const derived = createAtom(() => count.get() * 2)

    count.set(() => 24)

    expect(count.get()).toBe(24)
    expect(derived.get()).toBe(48)
  })

  test('should handle calculating state before the derived state is mounted', () => {
    const count = createAtom(12)
    const derived = createAtom(() => count.get() * 2)

    count.set(() => 24)

    // derived.mount()

    expect(count.get()).toBe(24)
    expect(derived.get()).toBe(48)
  })

  test('should not recompute more than is needed', () => {
    const fn = vi.fn()
    const count = createAtom(12)
    const derived = createAtom(() => {
      fn('derived')
      return count.get() * 2
    })

    count.set(() => 24)

    // const unmount1 = derived.mount()
    // unmount1()
    // const unmount2 = derived.mount()
    // unmount2()
    // const unmount3 = derived.mount()
    // unmount3()
    // derived.mount()

    expect(count.get()).toBe(24)
    expect(derived.get()).toBe(48)
    // expect(fn).toBeCalledTimes(2)
    expect(fn).toBeCalledTimes(1)
  })

  test('should be able to mount in the wrong order and still work', () => {
    const count = createAtom(12)

    const double = createAtom(() => count.get() * 2)

    const halfDouble = createAtom(() => double.get() / 2)

    // halfDouble.mount()
    // double.mount()

    count.set(() => 24)

    expect(count.get()).toBe(24)
    expect(double.get()).toBe(48)
    expect(halfDouble.get()).toBe(24)
  })

  test('should be able to mount in the wrong order and still work with a derived and a non-derived state', () => {
    const count = createAtom(12)

    const double = createAtom(() => count.get() * 2)

    const countPlusDouble = createAtom(() => count.get() + double.get())

    // countPlusDouble.mount()
    // double.mount()

    count.set(() => 24)

    expect(count.get()).toBe(24)
    expect(double.get()).toBe(48)
    expect(countPlusDouble.get()).toBe(24 + 48)
  })

  // test('should recompute in the right order', () => {
  //   const count = createAtom(12)

  //   const fn = vi.fn()

  //   const double = createAtom(() => {
  //     fn(2)
  //     return count.get() * 2
  //   })

  //   // const halfDouble = new Derived({
  //   //   deps: [double, count],
  //   //   fn: () => {
  //   //     fn(3)
  //   //     return double.state / 2
  //   //   },
  //   // })
  //   const halfDouble = createAtom(() => {
  //     fn(3)
  //     return double.get() / 2
  //   })

  //   halfDouble.get()
  //   double.get()

  //   // halfDouble.mount()
  //   // double.mount()

  //   expect(fn).toHaveBeenLastCalledWith(3)
  // })

  // test('should receive same prevDepVals and currDepVals during batch', () => {
  //   const count = createAtom(12)
  //   const fn = vi.fn()
  //   const derived = new Derived({
  //     deps: [count],
  //     fn: ({ prevDepVals, currDepVals }) => {
  //       fn({ prevDepVals, currDepVals })
  //       return count.state
  //     },
  //   })
  //   derived.mount()

  //   // First call when mounting
  //   expect(fn).toHaveBeenNthCalledWith(1, {
  //     prevDepVals: undefined,
  //     currDepVals: [12],
  //   })

  //   batch(() => {
  //     count.setState(() => 23)
  //     count.setState(() => 24)
  //     count.setState(() => 25)
  //   })

  //   expect(fn).toHaveBeenNthCalledWith(2, {
  //     prevDepVals: [12],
  //     currDepVals: [25],
  //   })
  // })
})
