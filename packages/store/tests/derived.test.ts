import { afterEach, describe, expect, test, vi } from 'vitest'
import { createStore } from '../src'

import { endBatch, startBatch } from '../src/alien'
import type { Store } from '../src'

function viFnSubscribe(subscribable: Store<any>) {
  const fn = vi.fn()
  const cleanup = subscribable.subscribe((s) => fn(s)).unsubscribe
  afterEach(() => {
    cleanup()
  })
  return fn
}

describe('Derived', () => {
  test('Diamond dep problem', () => {
    const count = createStore(10)

    const halfCount = createStore(() => {
      return count.state / 2
    })

    const doubleCount = createStore(() => {
      return count.state * 2
    })

    const sumDoubleHalfCount = createStore(() => {
      return halfCount.state + doubleCount.state
    })

    const halfCountFn = viFnSubscribe(halfCount)
    const doubleCountFn = viFnSubscribe(doubleCount)
    const sumDoubleHalfCountFn = viFnSubscribe(sumDoubleHalfCount)

    count.setState(() => 20)

    expect(halfCountFn).toHaveBeenNthCalledWith(1, 10)
    expect(doubleCountFn).toHaveBeenNthCalledWith(1, 40)
    expect(sumDoubleHalfCountFn).toHaveBeenNthCalledWith(1, 50)

    count.setState(() => 30)

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
    const a = createStore(1)
    const b = createStore(() => a.state)
    const c = createStore(() => a.state)
    const d = createStore(() => b.state)
    const e = createStore(() => b.state)
    const f = createStore(() => c.state)
    const g = createStore(() => d.state + e.state + f.state)

    const aFn = viFnSubscribe(a)
    const bFn = viFnSubscribe(b)
    const cFn = viFnSubscribe(c)
    const dFn = viFnSubscribe(d)
    const eFn = viFnSubscribe(e)
    const fFn = viFnSubscribe(f)
    const gFn = viFnSubscribe(g)

    a.setState(() => 2)

    expect(aFn).toHaveBeenNthCalledWith(1, 2)
    expect(bFn).toHaveBeenNthCalledWith(1, 2)
    expect(cFn).toHaveBeenNthCalledWith(1, 2)
    expect(dFn).toHaveBeenNthCalledWith(1, 2)
    expect(eFn).toHaveBeenNthCalledWith(1, 2)
    expect(fFn).toHaveBeenNthCalledWith(1, 2)
    expect(gFn).toHaveBeenNthCalledWith(1, 6)
  })

  test('Derive from store and another derived', () => {
    const count = createStore(10)

    const doubleCount = createStore(() => {
      return count.state * 2
    })
    const tripleCount = createStore(() => {
      return count.state + doubleCount.state
    })

    const doubleCountFn = viFnSubscribe(doubleCount)
    const tripleCountFn = viFnSubscribe(tripleCount)

    count.setState(() => 20)

    expect(doubleCountFn).toHaveBeenNthCalledWith(1, 40)
    expect(tripleCountFn).toHaveBeenNthCalledWith(1, 60)

    count.setState(() => 30)

    expect(doubleCountFn).toHaveBeenNthCalledWith(2, 60)
    expect(tripleCountFn).toHaveBeenNthCalledWith(2, 90)
  })

  test('listeners should receive old and new values', () => {
    const store = createStore(12)
    const derived = createStore<{
      prevVal: number | undefined
      currentVal: number
    }>((prevVal) => ({
      prevVal: prevVal?.currentVal,
      currentVal: store.state * 2,
    }))
    const fn = vi.fn()
    derived.subscribe(fn)
    store.setState(() => 24)
    expect(fn).toBeCalledWith({ prevVal: 24, currentVal: 48 })
  })

  test.skip('derivedFn should receive old and new dep values', () => {
    const count = createStore(12)
    const date = new Date()
    const time = createStore(date)
    const fn = vi.fn()
    createStore(() => {
      return count.state + time.state.getTime()
    })
    expect(fn).toBeCalledWith({
      prevDepVals: undefined,
      currDepVals: [12, date],
    })
    count.setState(() => 24)
    expect(fn).toBeCalledWith({
      prevDepVals: [12, date],
      currDepVals: [24, date],
    })
  })

  test('derivedFn should receive old and new dep values for similar derived values', () => {
    const count = createStore(12)
    const halfCount = createStore(() => count.state / 2)
    const derived = createStore<{
      prevDepVals: [number, number] | undefined
      currDepVals: [number, number]
    }>((prev) => {
      return {
        prevDepVals: prev?.currDepVals,
        currDepVals: [count.state, halfCount.state],
      }
    })

    expect(derived.state).toEqual({
      prevDepVals: undefined,
      currDepVals: [12, 6],
    })
    count.setState(() => 24)
    expect(derived.state).toEqual({
      prevDepVals: [12, 6],
      currDepVals: [24, 12],
    })
  })

  test('derivedFn should receive the old value', () => {
    const count = createStore(12)
    const atom = createStore<{
      prevVal: number | undefined
      currentVal: number
    }>((prev) => {
      return {
        prevVal: prev?.currentVal,
        currentVal: count.state,
      }
    })

    expect(atom.state).toEqual({ prevVal: undefined, currentVal: 12 })
    count.setState(() => 24)
    expect(atom.state).toEqual({ prevVal: 12, currentVal: 24 })
  })

  test('should be able to mount and unmount correctly repeatly', () => {
    const count = createStore(12)
    const derived = createStore(() => count.state * 2)

    count.setState(() => 24)

    expect(count.state).toBe(24)
    expect(derived.state).toBe(48)
  })

  test('should handle calculating state before the derived state is mounted', () => {
    const count = createStore(12)
    const derived = createStore(() => count.state * 2)

    count.setState(() => 24)

    // derived.mount()

    expect(count.state).toBe(24)
    expect(derived.state).toBe(48)
  })

  test('should not recompute more than is needed', () => {
    const fn = vi.fn()
    const count = createStore(12)
    const derived = createStore(() => {
      fn('derived')
      return count.state * 2
    })

    count.setState(() => 24)

    // const unmount1 = derived.mount()
    // unmount1()
    // const unmount2 = derived.mount()
    // unmount2()
    // const unmount3 = derived.mount()
    // unmount3()
    // derived.mount()

    expect(count.state).toBe(24)
    expect(derived.state).toBe(48)
    // expect(fn).toBeCalledTimes(2)
    expect(fn).toBeCalledTimes(1)
  })

  test('should be able to mount in the wrong order and still work', () => {
    const count = createStore(12)

    const double = createStore(() => count.state * 2)

    const halfDouble = createStore(() => double.state / 2)

    // halfDouble.mount()
    // double.mount()

    count.setState(() => 24)

    expect(count.state).toBe(24)
    expect(double.state).toBe(48)
    expect(halfDouble.state).toBe(24)
  })

  test('should be able to mount in the wrong order and still work with a derived and a non-derived state', () => {
    const count = createStore(12)

    const double = createStore(() => count.state * 2)

    const countPlusDouble = createStore(() => count.state + double.state)

    // countPlusDouble.mount()
    // double.mount()

    count.setState(() => 24)

    expect(count.state).toBe(24)
    expect(double.state).toBe(48)
    expect(countPlusDouble.state).toBe(24 + 48)
  })

  // TODO: fix batching
  test.skip('should receive same prevDepVals and currDepVals during batch', () => {
    const count = createStore(12)
    const fn = vi.fn()
    createStore<{
      prevVal: number | undefined
      currentVal: number
    }>((prev) => {
      const currentVal = count.state
      fn({ prevVal: prev?.currentVal, currentVal })
      return { prevVal: prev?.currentVal, currentVal }
    }).subscribe({})

    // First call when mounting
    expect(fn).toHaveBeenNthCalledWith(1, {
      prevVal: undefined,
      currentVal: 12,
    })

    // batch(() => {
    startBatch()
    count.setState(() => 23)
    count.setState(() => 24)
    count.setState(() => 25)
    endBatch()
    // })

    expect(fn).toHaveBeenNthCalledWith(2, {
      prevVal: 12,
      currentVal: 25,
    })
  })
})
