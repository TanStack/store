import { describe, expect, it, vi } from 'vitest'
import { evaluate } from '../src/evaluate'

describe('evaluate', () => {
  it('should test equality between primitives', () => {
    const numbersTrue = evaluate(1, 1)
    expect(numbersTrue).toEqual(true)

    const stringFalse = evaluate('uh oh', '')
    expect(stringFalse).toEqual(false)

    const boolTrue = evaluate(true, true)
    expect(boolTrue).toEqual(true)

    const nullFalse = evaluate(null, {})
    expect(nullFalse).toEqual(false)

    const undefinedFalse = evaluate(undefined, null)
    expect(undefinedFalse).toEqual(false)
  })

  it('should test equality between arrays', () => {
    const arrayTrue = evaluate([], [])
    expect(arrayTrue).toEqual(true)

    const arrayDeepSearchTrue = evaluate([[1]], [[1]])
    expect(arrayDeepSearchTrue).toEqual(true)

    const arrayFalse = evaluate([], [''])
    expect(arrayFalse).toEqual(false)

    const arrayDeepFalse = evaluate([[1]], [])
    expect(arrayDeepFalse).toEqual(false)

    const arrayComplexFalse = evaluate([[{ test: 'true' }], null], [[1], {}])
    expect(arrayComplexFalse).toEqual(false)

    const arrayComplexTrue = evaluate(
      [[{ test: 'true' }], null],
      [[{ test: 'true' }], null],
    )
    expect(arrayComplexTrue).toEqual(true)
  })

  it('should test equality between objects', () => {
    const objTrue = evaluate({ test: 'same' }, { test: 'same' })
    expect(objTrue).toEqual(true)

    const objFalse = evaluate({ test: 'not' }, { test: 'same' })
    expect(objFalse).toEqual(false)

    const objDeepFalse = evaluate({ test: 'not' }, { test: { test: 'same' } })
    expect(objDeepFalse).toEqual(false)

    const objDeepArrFalse = evaluate({ test: [] }, { test: [[]] })
    expect(objDeepArrFalse).toEqual(false)

    const objNullFalse = evaluate({ test: '' }, null)
    expect(objNullFalse).toEqual(false)

    const objComplexFalse = evaluate(
      { test: { testTwo: '' }, arr: [[1]] },
      { test: { testTwo: false }, arr: [[1], [0]] },
    )
    expect(objComplexFalse).toEqual(false)

    const objComplexTrue = evaluate(
      { test: { testTwo: '' }, arr: [[1]] },
      { test: { testTwo: '' }, arr: [[1]] },
    )
    expect(objComplexTrue).toEqual(true)
  })

  it('should test equality between Date objects', () => {
    const date1 = new Date('2025-01-01T00:00:00.000Z')
    const date2 = new Date('2025-01-01T00:00:00.000Z')
    const date3 = new Date('2025-01-02T00:00:00.000Z')

    const dateTrue = evaluate(date1, date2)
    expect(dateTrue).toEqual(true)

    const dateFalse = evaluate(date1, date3)
    expect(dateFalse).toEqual(false)

    const dateObjectTrue = evaluate({ date: date1 }, { date: date2 })
    expect(dateObjectTrue).toEqual(true)

    const dateObjectFalse = evaluate({ date: date1 }, { date: date3 })
    expect(dateObjectFalse).toEqual(false)
  })

  it('should test equality between Map objects', () => {
    const map1 = new Map([
      ['a', 1],
      ['b', 2],
    ])
    const map2 = new Map([
      ['a', 1],
      ['b', 2],
    ])
    expect(evaluate(map1, map2)).toEqual(true)

    const emptyMap1 = new Map()
    const emptyMap2 = new Map()
    expect(evaluate(emptyMap1, emptyMap2)).toEqual(true)

    const mapSmall = new Map([['a', 1]])
    const mapLarge = new Map([
      ['a', 1],
      ['b', 2],
    ])
    expect(evaluate(mapSmall, mapLarge)).toEqual(false)

    const mapA = new Map([
      ['a', 1],
      ['b', 2],
    ])
    const mapC = new Map([
      ['a', 1],
      ['c', 2],
    ])
    expect(evaluate(mapA, mapC)).toEqual(false)

    const mapVal1 = new Map([
      ['a', 1],
      ['b', 2],
    ])
    const mapVal2 = new Map([
      ['a', 1],
      ['b', 3],
    ])
    expect(evaluate(mapVal1, mapVal2)).toEqual(false)
  })

  it('should test equality between Set objects', () => {
    const set1 = new Set([1, 2, 3])
    const set2 = new Set([1, 2, 3])
    expect(evaluate(set1, set2)).toEqual(true)

    const emptySet1 = new Set()
    const emptySet2 = new Set()
    expect(evaluate(emptySet1, emptySet2)).toEqual(true)

    const setSmall = new Set([1, 2])
    const setLarge = new Set([1, 2, 3])
    expect(evaluate(setSmall, setLarge)).toEqual(false)

    const setA = new Set([1, 2, 3])
    const setB = new Set([1, 2, 4])
    expect(evaluate(setA, setB)).toEqual(false)
  })

  it('should test equality between File objects', () => {
    const file1 = new File(['hello'], 'hello.txt', { type: 'text/plain' })
    const file2 = new File(['hello'], 'hello.txt', { type: 'text/plain' })
    const fileDiffName = new File(['hello'], 'world.txt', {
      type: 'text/plain',
    })
    const fileDiffType = new File(['hello'], 'hello.txt', { type: 'text/html' })
    const fileDiffSize = new File(['hello world'], 'hello.txt', {
      type: 'text/plain',
    })

    expect(evaluate(file1, file2)).toEqual(true)
    expect(evaluate(file1, fileDiffName)).toEqual(false)
    expect(evaluate(file1, fileDiffType)).toEqual(false)
    expect(evaluate(file1, fileDiffSize)).toEqual(false)

    expect(evaluate({ file: file1 }, { file: file2 })).toEqual(true)
    expect(evaluate({ file: file1 }, { file: fileDiffName })).toEqual(false)
  })

  it('should not throw a runtime error when File is undefined in the environment', () => {
    vi.stubGlobal('File', undefined)

    const file1 = {
      name: 'hello.txt',
      size: 5,
      type: 'text/plain',
      lastModified: 0,
    }
    const file2 = {
      name: 'hello.txt',
      size: 5,
      type: 'text/plain',
      lastModified: 0,
    }

    expect(() => evaluate(file1, file2)).not.toThrow()

    vi.unstubAllGlobals()
  })
})
