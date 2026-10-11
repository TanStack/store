import { describe, expect, test } from 'vitest'
import { shallow } from '../src/shallow'

describe('shallow', () => {
  test('returns true for identical primitives and references', () => {
    expect(shallow(1, 1)).toBe(true)
    expect(shallow('test', 'test')).toBe(true)
    expect(shallow(true, true)).toBe(true)
    expect(shallow(null, null)).toBe(true)
    expect(shallow(undefined, undefined)).toBe(true)
    expect(shallow(NaN, NaN)).toBe(true)

    const obj = { a: 1 }
    expect(shallow(obj, obj)).toBe(true)
  })

  test('returns false for mismatched primitives and null/objects', () => {
    expect(shallow(1, 2)).toBe(false)
    expect(shallow('a', 'b')).toBe(false)
    expect(shallow(null, {})).toBe(false)
    expect(shallow({}, null)).toBe(false)
    expect(shallow(undefined, {})).toBe(false)
    expect(shallow(1 as any, {})).toBe(false)
  })

  test('compares shallow objects correctly', () => {
    expect(shallow({ a: 1, b: '2' }, { a: 1, b: '2' })).toBe(true)
    expect(shallow({ a: 1, b: '2' }, { a: 1, b: '3' })).toBe(false)
    expect(shallow({ a: 1 }, { a: 1, b: 2 })).toBe(false)
    expect(shallow({ a: 1, b: 2 }, { a: 1 })).toBe(false)
  })

  test('compares objects with symbol keys', () => {
    const sym = Symbol('key')
    expect(shallow({ [sym]: 1, a: 2 }, { [sym]: 1, a: 2 })).toBe(true)
    expect(shallow({ [sym]: 1, a: 2 }, { [sym]: 2, a: 2 })).toBe(false)
  })

  test('compares arrays shallowly', () => {
    expect(shallow([1, 2, 3], [1, 2, 3])).toBe(true)
    expect(shallow([1, 2, 3], [1, 2, 4])).toBe(false)
    expect(shallow([1, 2], [1, 2, 3])).toBe(false)
  })

  test('compares Map instances', () => {
    const mapA = new Map<string, number>([
      ['a', 1],
      ['b', 2],
    ])
    const mapB = new Map<string, number>([
      ['a', 1],
      ['b', 2],
    ])
    const mapC = new Map<string, number>([
      ['a', 1],
      ['b', 3],
    ])
    const mapD = new Map<string, number>([['a', 1]])

    expect(shallow(mapA, mapB)).toBe(true)
    expect(shallow(mapA, mapC)).toBe(false)
    expect(shallow(mapA, mapD)).toBe(false)
  })

  test('compares Set instances', () => {
    const setA = new Set([1, 2, 3])
    const setB = new Set([1, 2, 3])
    const setC = new Set([1, 2, 4])
    const setD = new Set([1, 2])

    expect(shallow(setA, setB)).toBe(true)
    expect(shallow(setA, setC)).toBe(false)
    expect(shallow(setA, setD)).toBe(false)
  })

  test('compares Date instances', () => {
    const d1 = new Date('2026-01-01T00:00:00.000Z')
    const d2 = new Date('2026-01-01T00:00:00.000Z')
    const d3 = new Date('2026-01-02T00:00:00.000Z')

    expect(shallow(d1, d2)).toBe(true)
    expect(shallow(d1, d3)).toBe(false)
  })
})
