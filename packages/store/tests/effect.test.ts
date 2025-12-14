import { describe, expect, test, vi } from 'vitest'
import { createAtom } from '@xstate/store'

describe('Effect', () => {
  test('Side effect free', () => {
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

    const fn = vi.fn()
    // effect
    sumDoubleHalfCount.subscribe(fn)

    count.set(() => 20)

    expect(fn).toHaveBeenNthCalledWith(1, 50)

    count.set(() => 30)

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
    const a = createAtom(1)
    const b = createAtom(() => a.get())
    const c = createAtom(() => a.get())
    const d = createAtom(() => b.get())
    const e = createAtom(() => b.get())
    const f = createAtom(() => c.get())
    const g = createAtom(() => d.get() + e.get() + f.get())

    const fn = vi.fn()
    g.subscribe(fn)

    a.set(() => 2)

    expect(fn).toHaveBeenNthCalledWith(1, 6)
  })
})
