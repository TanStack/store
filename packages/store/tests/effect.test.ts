import { describe, expect, test, vi } from 'vitest'
import { Store } from '../src/store'
import { Derived } from '../src/derived'
import { Effect } from '../src/effect'

describe('Effect', () => {
  test('Side effect free', () => {
    const count = new Store(10)

    const halfCount = new Derived({
      deps: [count],
      fn: () => {
        return count.state / 2
      },
    })

    const doubleCount = new Derived({
      deps: [count],
      fn: () => {
        return count.state * 2
      },
    })

    const sumDoubleHalfCount = new Derived({
      deps: [halfCount, doubleCount],
      fn: () => {
        return halfCount.state + doubleCount.state
      },
    })

    const fn = vi.fn()
    new Effect({
      deps: [sumDoubleHalfCount],
      fn: () => fn(sumDoubleHalfCount.state),
    })

    count.setState(() => 20)

    expect(fn).toHaveBeenNthCalledWith(1, 50)

    count.setState(() => 30)

    expect(fn).toHaveBeenNthCalledWith(2, 75)
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
    const c = new Derived({ deps: [a], fn: () => a.state })
    const d = new Derived({ deps: [b], fn: () => b.state })
    const e = new Derived({ deps: [b], fn: () => b.state })
    const f = new Derived({ deps: [c], fn: () => c.state })
    const g = new Derived({
      deps: [d, e, f],
      fn: () => d.state + e.state + f.state,
    })

    const fn = vi.fn()
    new Effect({ deps: [g], fn: () => fn(g.state) })

    a.setState(() => 2)

    expect(fn).toHaveBeenNthCalledWith(1, 6)
  })
})
