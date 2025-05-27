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

    halfCount.mount()

    const doubleCount = new Derived({
      deps: [count],
      fn: () => {
        return count.state * 2
      },
    })

    doubleCount.mount()

    const sumDoubleHalfCount = new Derived({
      deps: [halfCount, doubleCount],
      fn: () => {
        return halfCount.state + doubleCount.state
      },
    })

    sumDoubleHalfCount.mount()

    const fn = vi.fn()
    const effect = new Effect({
      fn: () => fn(sumDoubleHalfCount.state),
    })
    effect.mount()

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

    const fn = vi.fn()
    const effect = new Effect({ fn: () => fn(g.state) })
    effect.mount()

    a.setState(() => 2)

    expect(fn).toHaveBeenNthCalledWith(1, 6)
  })
})
