import { describe, expect, test, vi } from 'vitest'
import { createAtom } from '../src'

describe('undefined snapshots', () => {
  test('a computed atom that stays undefined does not notify', () => {
    const source = createAtom(0)
    const derived = createAtom(() =>
      source.get() > 10 ? source.get() : undefined,
    )
    const fn = vi.fn()
    derived.subscribe(fn)

    source.set(1)
    source.set(2)

    expect(fn).not.toHaveBeenCalled()
  })

  test('compare still decides when the previous value is undefined', () => {
    const atom = createAtom<number | undefined>(undefined, {
      compare: () => true,
    })
    const fn = vi.fn()
    atom.subscribe(fn)

    atom.set(1)

    expect(atom.get()).toBeUndefined()
    expect(fn).not.toHaveBeenCalled()
  })

  test('compare is not called before a computed atom first computes', () => {
    const source = createAtom(0)
    const compare = vi.fn(
      (prev: Array<number>, next: Array<number>) => prev.length === next.length,
    )
    const derived = createAtom(() => [source.get()], { compare })

    expect(derived.get()).toEqual([0])
    expect(compare).not.toHaveBeenCalled()
  })
})
