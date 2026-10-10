import { describe, expect, test } from 'vitest'
import { shallow } from '../src/shallow'

describe('shallow', () => {
  test('returns true for identical primitives and references', () => {
    expect(shallow(1, 1)).toBe(true)
    expect(shallow('a', 'a')).toBe(true)
    expect(shallow(true, true)).toBe(true)
    expect(shallow(null, null)).toBe(true)
    expect(shallow(undefined, undefined)).toBe(true)
    expect(shallow(NaN, NaN)).toBe(true)

    const obj = { a: 1 }
    expect(shallow(obj, obj)).toBe(true)
  })

  test('returns false for different primitives or nullish mismatches', () => {
    expect(shallow(1, 2)).toBe(false)
    expect(shallow('a', 'b')).toBe(false)
    expect(shallow(true, false)).toBe(false)
    expect(shallow(null, undefined)).toBe(false)
    expect(shallow({}, null)).toBe(false)
    expect(shallow(null, {})).toBe(false)
  })

  test('compares plain objects by shallow keys and values', () => {
    expect(shallow({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toBe(true)
    expect(shallow({ a: 1, b: 'x' }, { a: 1, b: 'y' })).toBe(false)
    expect(shallow({ a: 1 }, { a: 1, b: 2 })).toBe(false)
  })

  test('compares arrays by element shallow equality', () => {
    expect(shallow([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(shallow([1, 2], [1, 2, 3])).toBe(false)
    expect(shallow([1, 'a'], [1, 'b'])).toBe(false)
  })

  test('compares Dates correctly, including invalid dates and mismatched types', () => {
    const d1 = new Date(1700000000000)
    const d2 = new Date(1700000000000)
    const d3 = new Date(1700000000001)

    expect(shallow(d1, d2)).toBe(true)
    expect(shallow(d1, d3)).toBe(false)

    const invalid1 = new Date('invalid')
    const invalid2 = new Date('invalid')
    expect(shallow(invalid1, invalid2)).toBe(true)
    expect(shallow(d1, invalid1)).toBe(false)

    expect(shallow(d1, {} as unknown as Date)).toBe(false)
    expect(shallow({} as unknown as Date, d1)).toBe(false)
  })

  test('compares Maps correctly and rejects mismatched types', () => {
    const m1 = new Map([['a', 1], ['b', 2]])
    const m2 = new Map([['a', 1], ['b', 2]])
    const m3 = new Map([['a', 1], ['b', 3]])

    expect(shallow(m1, m2)).toBe(true)
    expect(shallow(m1, m3)).toBe(false)

    expect(shallow(m1, {} as unknown as Map<string, number>)).toBe(false)
    expect(shallow({} as unknown as Map<string, number>, m1)).toBe(false)
  })

  test('compares Sets correctly and rejects mismatched types', () => {
    const s1 = new Set([1, 2, 3])
    const s2 = new Set([1, 2, 3])
    const s3 = new Set([1, 2, 4])

    expect(shallow(s1, s2)).toBe(true)
    expect(shallow(s1, s3)).toBe(false)

    expect(shallow(s1, {} as unknown as Set<number>)).toBe(false)
    expect(shallow({} as unknown as Set<number>, s1)).toBe(false)
  })

  test('returns false when comparing distinct collection types against each other', () => {
    expect(shallow(new Date(), new Map() as unknown as Date)).toBe(false)
    expect(shallow(new Map(), new Set() as unknown as Map<unknown, unknown>)).toBe(false)
    expect(shallow(new Set(), new Date() as unknown as Set<unknown>)).toBe(false)
  })
})
