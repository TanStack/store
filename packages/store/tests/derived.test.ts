import { afterEach, describe, expect, test, vi } from 'vitest'
import { Store } from '../src/store'
import { Derived } from '../src/derived'
import { batch } from '../src/scheduler'

function viFnSubscribe(subscribable: Store<any> | Derived<any>) {
  const fn = vi.fn()
  const cleanup = subscribable.subscribe(() => fn(subscribable.state))
  afterEach(() => {
    cleanup()
  })
  return fn
}

describe('Derived', () => {
  test('Diamond dep problem', () => {
    const count = new Store(10)

    const halfCount = new Derived({
      deps: [count],
      fn: () => {
        return count.state / 2
      },
    })

    // halfCount.mount()

    const doubleCount = new Derived({
      deps: [count],
      fn: () => {
        return count.state * 2
      },
    })

    // doubleCount.mount() - No longer needed

    const sumDoubleHalfCount = new Derived({
      deps: [halfCount, doubleCount],
      fn: () => {
        return halfCount.state + doubleCount.state
      },
    })

    // sumDoubleHalfCount.mount() - No longer needed

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
    const a = new Store(1)
    const b = new Derived({ deps: [a], fn: () => a.state })
    b.mount()
    const c = new Derived({ deps: [a], fn: () => a.state })
    c.mount()
    const d = new Derived({ deps: [b], fn: () => b.state })
    d.mount()
    const e = new Derived({ deps: [b], fn: () => b.state })
    e.mount()
    const f = new Derived({ deps: [c], fn: () => c.state })
    f.mount()
    const g = new Derived({
      deps: [d, e, f],
      fn: () => d.state + e.state + f.state,
    })
    g.mount()

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
    const count = new Store(10)

    const doubleCount = new Derived({
      deps: [count],
      fn: () => {
        return count.state * 2
      },
    })

    // doubleCount.mount() - No longer needed

    const tripleCount = new Derived({
      deps: [count, doubleCount],
      fn: () => {
        return count.state + doubleCount.state
      },
    })

    // tripleCount.mount() - No longer needed

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
    const store = new Store(12)
    const derived = new Derived({
      deps: [store],
      fn: () => {
        return store.state * 2
      },
    })
    // derived.mount() No longer needed
    const fn = vi.fn()
    derived.subscribe(fn)
    store.setState(() => 24)
    expect(fn).toBeCalledWith({ prevVal: 24, currentVal: 48 })
  })


  test('derivedFn should receive old and new dep values', async () => {
    const count = new Store(12);
    const time = new Store(new Date());

    const fn = vi.fn();

    const derived = new Derived({
      deps: [count, time],
      fn: ({ prevDepVals, currDepVals }) => {
        fn({ prevDepVals, currDepVals });
        return void 0;
      },
    });

    derived.subscribe(() => { });

    // First call should be with initial values
    expect(fn).toHaveBeenCalledWith({
      prevDepVals: undefined,
      currDepVals: [12, time.state],
    });

    count.setState(() => 24);

    // Expect function to be called with updated values
    expect(fn).toHaveBeenCalledWith({
      prevDepVals: [12, time.state],
      currDepVals: [24, time.state],
    });
  });


  test('derivedFn should receive old and new dep values for similar derived values', async () => {
    const count = new Store(12);

    const halfCount = new Derived({
      deps: [count],
      fn: () => count.state / 2,
    });

    // Ensure halfCount subscribes to count
    halfCount.subscribe(() => { });

    const fn = vi.fn();

    const derived = new Derived({
      deps: [count, halfCount],
      fn: ({ prevDepVals, currDepVals }) => {
        fn({ prevDepVals, currDepVals });
        return void 0;
      },
    });

    derived.subscribe(() => { });

    // First call should be with initial values
    expect(fn).toHaveBeenCalledWith({
      prevDepVals: undefined,
      currDepVals: [12, 6], // halfCount = 12 / 2 = 6
    });

    count.setState(() => 24);

    // Expect function to be called with updated values
    expect(fn).toHaveBeenCalledWith({
      prevDepVals: [12, 6],
      currDepVals: [24, 12], // halfCount = 24 / 2 = 12
    });
  });

  test('derivedFn should receive the old value', async () => {
    const count = new Store(12);
    const date = new Date();
    const time = new Store(date);
    const fn = vi.fn();

    const derived = new Derived({
      deps: [count, time],
      fn: ({ prevVal }) => {
        fn(prevVal);
        return count.state;
      },
    });

    // Ensure derived subscribes and tracks changes
    derived.subscribe(() => { });

    // First call should use `undefined`
    expect(fn).toHaveBeenCalledWith(undefined);

    count.setState(() => 24);

    expect(fn).toHaveBeenCalledWith(12);
  });


  test('should update only when subscribed', () => {
    const count = new Store(12)
    const derived = new Derived({
      deps: [count],
      fn: () => count.state * 2,
    })

    const unsubscribe1 = derived.subscribe(() => { })
    unsubscribe1()
    const unsubscribe2 = derived.subscribe(() => { })
    unsubscribe2()

    // Keep at least one active subscription
    const unsubscribe3 = derived.subscribe(() => { })

    count.setState(() => 24)

    expect(count.state).toBe(24)
    expect(derived.state).toBe(48)

    unsubscribe3() // Cleanup
  })



  test('should handle calculating state before the derived state is mounted', () => {
    const count = new Store(12)
    const derived = new Derived({
      deps: [count],
      fn: () => count.state * 2,
    })

    count.setState(() => 24)

    // Force derived to update by subscribing
    const unsubscribe = derived.subscribe(() => { })
    unsubscribe()

    expect(count.state).toBe(24)
    expect(derived.state).toBe(48)
  })


  test('should not recompute more than is needed', () => {
    const fn = vi.fn()
    const count = new Store(12)
    const derived = new Derived({
      deps: [count],
      fn: () => {
        fn('derived')
        return count.state * 2
      },
    })

    count.setState(() => 24)

    const unmount1 = derived.mount()
    unmount1()
    const unmount2 = derived.mount()
    unmount2()
    const unmount3 = derived.mount()
    unmount3()
    // derived.mount() - No longer needed

    expect(count.state).toBe(24)
    expect(derived.state).toBe(48)
    expect(fn).toBeCalledTimes(2)
  })

  test('should be able to mount in the wrong order and still work', () => {
    const count = new Store(12)

    const double = new Derived({
      deps: [count],
      fn: () => count.state * 2,
    })

    const halfDouble = new Derived({
      deps: [double],
      fn: () => double.state / 2,
    })

    // Force computation by subscribing
    const unsubscribe = halfDouble.subscribe(() => { })
    count.setState(() => 24)
    unsubscribe()

    expect(count.state).toBe(24)
    expect(double.state).toBe(48)
    expect(halfDouble.state).toBe(24)
  })


  test('should be able to mount in the wrong order and still work with a derived and a non-derived state', () => {
    const count = new Store(12)

    const double = new Derived({
      deps: [count],
      fn: () => count.state * 2,
    })

    const countPlusDouble = new Derived({
      deps: [count, double],
      fn: () => count.state + double.state,
    })

    // Subscribe to countPlusDouble to trigger the full dependency chain
    const unsubscribe = countPlusDouble.subscribe(() => { })
    count.setState(() => 24)
    unsubscribe()

    expect(count.state).toBe(24)
    expect(double.state).toBe(48)
    expect(countPlusDouble.state).toBe(24 + 48)
  })


  test('should recompute in the right order', () => {
    const count = new Store(12)

    const fn = vi.fn()

    const double = new Derived({
      deps: [count],
      fn: () => {
        fn(2)
        return count.state * 2
      },
    })

    const halfDouble = new Derived({
      deps: [double, count],
      fn: () => {
        fn(3)
        return double.state / 2
      },
    })

    halfDouble.subscribe(() => { })

    // halfDouble.mount() - No longer needed
    // double.mount() - No longer needed

    expect(fn).toHaveBeenLastCalledWith(3)
  })

  test('should receive same prevDepVals and currDepVals during batch', () => {
    const count = new Store(12)
    const fn = vi.fn()
    const derived = new Derived({
      deps: [count],
      fn: ({ prevDepVals, currDepVals }) => {
        fn({ prevDepVals, currDepVals })
        return count.state
      },
    })
    derived.mount()

    // First call when mounting
    expect(fn).toHaveBeenNthCalledWith(1, {
      prevDepVals: undefined,
      currDepVals: [12],
    })

    batch(() => {
      count.setState(() => 23)
      count.setState(() => 24)
      count.setState(() => 25)
    })

    expect(fn).toHaveBeenNthCalledWith(2, {
      prevDepVals: [12],
      currDepVals: [25],
    })
  })
})
