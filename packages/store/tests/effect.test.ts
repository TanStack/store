import { describe, expect, test, vi } from 'vitest'
import { createStore } from '../src'

describe('Effect', () => {
  test('Side effect free', () => {
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

    const fn = vi.fn()
    // effect
    sumDoubleHalfCount.subscribe(fn)

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
    const a = createStore(1)
    const b = createStore(() => a.state)
    const c = createStore(() => a.state)
    const d = createStore(() => b.state)
    const e = createStore(() => b.state)
    const f = createStore(() => c.state)
    const g = createStore(() => d.state + e.state + f.state)

    const fn = vi.fn()
    g.subscribe(fn)

    a.setState(() => 2)

    expect(fn).toHaveBeenNthCalledWith(1, 6)
  })
})
