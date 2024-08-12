import { describe, expect, test, vi } from 'vitest'
import { Store } from '../src/store'
import { Derived } from '../src/derived'
import { Effect } from '../src/effect'

describe('Effect', () => {
  test('Side effect free', () => {
    const count = new Store(10)

    const halfCount = new Derived([count], () => {
      return count.state / 2
    })

    const doubleCount = new Derived([count], () => {
      return count.state * 2
    })

    const sumDoubleHalfCount = new Derived([halfCount, doubleCount], () => {
      return halfCount.state + doubleCount.state
    })

    const fn = vi.fn()
    new Effect([sumDoubleHalfCount], () => fn(sumDoubleHalfCount.state))

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
    const b = new Derived([a], () => a.state)
    const c = new Derived([a], () => a.state)
    const d = new Derived([b], () => b.state)
    const e = new Derived([b], () => b.state)
    const f = new Derived([c], () => c.state)
    const g = new Derived([d, e, f], () => d.state + e.state + f.state)

    const fn = vi.fn()
    new Effect([g], () => fn(g.state))

    a.setState(() => 2)

    expect(fn).toHaveBeenNthCalledWith(1, 6)
  })
})
