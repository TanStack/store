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

  it('should return false for runtime cross-type comparisons', () => {
    expect(evaluate<any>(new Date(), new Map())).toEqual(false)
    expect(evaluate<any>(new Date(), new Set())).toEqual(false)
    expect(evaluate<any>(new Map(), new Set())).toEqual(false)
    expect(evaluate<any>(new Date(), {})).toEqual(false)
    expect(evaluate<any>(new Map(), {})).toEqual(false)
    expect(evaluate<any>(new Set(), {})).toEqual(false)
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

  describe('shallow', () => {
    it('should test equality between arrays', () => {
      expect(evaluate([], [])).toEqual(true)

      const arrayFalse = evaluate([], [''])
      expect(arrayFalse).toEqual(false)

      const arrayDeepFalse = evaluate([[1]], [])
      expect(arrayDeepFalse).toEqual(false)

      const arrayNestedFalse = evaluate([[1]], [[1]])
      expect(arrayNestedFalse).toEqual(false)

      const arrayComplexFalse = evaluate([[{ test: 'true' }], null], [[1], {}])
      expect(arrayComplexFalse).toEqual(false)

      const arrayComplexFalse2 = evaluate(
        [[{ test: 'true' }], null],
        [[{ test: 'true' }], null],
      )
      expect(arrayComplexFalse2).toEqual(false)
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

      const objComplexShallowFalse = evaluate(
        { test: { testTwo: '' }, arr: [[1]] },
        { test: { testTwo: '' }, arr: [[1]] },
      )
      expect(objComplexShallowFalse).toEqual(false)
    })

    it('should test equality between Date objects', () => {
      const date1 = new Date('2025-01-01T00:00:00.000Z')
      const date2 = new Date('2025-01-01T00:00:00.000Z')
      const date3 = new Date('2025-01-02T00:00:00.000Z')

      expect(evaluate(date1, date2)).toEqual(true)
      expect(evaluate(date1, date3)).toEqual(false)

      const dateObjectShallowFalse = evaluate({ date: date1 }, { date: date2 })
      expect(dateObjectShallowFalse).toEqual(false)

      const dateObjectFalse = evaluate({ date: date1 }, { date: date3 })
      expect(dateObjectFalse).toEqual(false)
    })

    it('should test equality between Map objects', () => {
      expect(
        evaluate(
          new Map([
            ['a', 1],
            ['b', 2],
          ]),
          new Map([
            ['a', 1],
            ['b', 2],
          ]),
        ),
      ).toEqual(true)
      expect(evaluate(new Map(), new Map())).toEqual(true)
      expect(
        evaluate(
          new Map([['a', 1]]),
          new Map([
            ['a', 1],
            ['b', 2],
          ]),
        ),
      ).toEqual(false)
      expect(
        evaluate(
          new Map([
            ['a', 1],
            ['b', 2],
          ]),
          new Map([
            ['a', 1],
            ['c', 2],
          ]),
        ),
      ).toEqual(false)
      expect(
        evaluate(
          new Map([
            ['a', 1],
            ['b', 2],
          ]),
          new Map([
            ['a', 1],
            ['b', 3],
          ]),
        ),
      ).toEqual(false)

      const obj = { x: 1 }
      expect(evaluate(new Map([['a', obj]]), new Map([['a', obj]]))).toEqual(
        true,
      )
      expect(
        evaluate(new Map([['a', { x: 1 }]]), new Map([['a', { x: 1 }]])),
      ).toEqual(false)
    })

    it('should test equality between Set objects', () => {
      expect(evaluate(new Set([1, 2, 3]), new Set([1, 2, 3]))).toEqual(true)
      expect(evaluate(new Set(), new Set())).toEqual(true)
      expect(evaluate(new Set([1, 2]), new Set([1, 2, 3]))).toEqual(false)
      expect(evaluate(new Set([1, 2, 3]), new Set([1, 2, 4]))).toEqual(false)

      const obj = { x: 1 }
      expect(evaluate(new Set([obj]), new Set([obj]))).toEqual(true)
      expect(evaluate(new Set([{ x: 1 }]), new Set([{ x: 1 }]))).toEqual(false)
    })

    it('should test equality between File objects', () => {
      const file1 = new File(['hello'], 'hello.txt', { type: 'text/plain' })
      const file2 = new File(['hello'], 'hello.txt', { type: 'text/plain' })
      const fileDiffName = new File(['hello'], 'world.txt', {
        type: 'text/plain',
      })
      const fileDiffType = new File(['hello'], 'hello.txt', {
        type: 'text/html',
      })
      const fileDiffSize = new File(['hello world'], 'hello.txt', {
        type: 'text/plain',
      })

      expect(evaluate(file1, file2)).toEqual(true)
      expect(evaluate(file1, fileDiffName)).toEqual(false)
      expect(evaluate(file1, fileDiffType)).toEqual(false)
      expect(evaluate(file1, fileDiffSize)).toEqual(false)

      expect(evaluate({ file: file1 }, { file: file2 })).toEqual(false)
      expect(evaluate({ file: file1 }, { file: fileDiffName })).toEqual(false)
    })
  })

  describe('deep', () => {
    it('should test equality between arrays', () => {
      expect(evaluate([], [], { mode: 'deep' })).toEqual(true)

      const arrayFalse = evaluate([], [''], { mode: 'deep' })
      expect(arrayFalse).toEqual(false)

      const arrayDeepFalse = evaluate([[1]], [], { mode: 'deep' })
      expect(arrayDeepFalse).toEqual(false)

      const arrayDeepSearchTrue = evaluate([[1]], [[1]], { mode: 'deep' })
      expect(arrayDeepSearchTrue).toEqual(true)

      const arrayComplexFalse = evaluate(
        [[{ test: 'true' }], null],
        [[1], {}],
        {
          mode: 'deep',
        },
      )
      expect(arrayComplexFalse).toEqual(false)

      const arrayComplexTrue = evaluate(
        [[{ test: 'true' }], null],
        [[{ test: 'true' }], null],
        { mode: 'deep' },
      )
      expect(arrayComplexTrue).toEqual(true)
    })

    it('should test equality between objects', () => {
      const objTrue = evaluate(
        { test: 'same' },
        { test: 'same' },
        { mode: 'deep' },
      )
      expect(objTrue).toEqual(true)

      const objFalse = evaluate(
        { test: 'not' },
        { test: 'same' },
        { mode: 'deep' },
      )
      expect(objFalse).toEqual(false)

      const objDeepFalse = evaluate(
        { test: 'not' },
        { test: { test: 'same' } },
        { mode: 'deep' },
      )
      expect(objDeepFalse).toEqual(false)

      const objDeepArrFalse = evaluate(
        { test: [] },
        { test: [[]] },
        { mode: 'deep' },
      )
      expect(objDeepArrFalse).toEqual(false)

      const objNullFalse = evaluate({ test: '' }, null, { mode: 'deep' })
      expect(objNullFalse).toEqual(false)

      const objComplexFalse = evaluate(
        { test: { testTwo: '' }, arr: [[1]] },
        { test: { testTwo: false }, arr: [[1], [0]] },
        { mode: 'deep' },
      )
      expect(objComplexFalse).toEqual(false)

      const objComplexTrue = evaluate(
        { test: { testTwo: '' }, arr: [[1]] },
        { test: { testTwo: '' }, arr: [[1]] },
        { mode: 'deep' },
      )
      expect(objComplexTrue).toEqual(true)
    })

    it('should test equality between Date objects', () => {
      const date1 = new Date('2025-01-01T00:00:00.000Z')
      const date2 = new Date('2025-01-01T00:00:00.000Z')
      const date3 = new Date('2025-01-02T00:00:00.000Z')

      expect(evaluate(date1, date2, { mode: 'deep' })).toEqual(true)
      expect(evaluate(date1, date3, { mode: 'deep' })).toEqual(false)

      const dateObjectTrue = evaluate(
        { date: date1 },
        { date: date2 },
        { mode: 'deep' },
      )
      expect(dateObjectTrue).toEqual(true)

      const dateObjectFalse = evaluate(
        { date: date1 },
        { date: date3 },
        { mode: 'deep' },
      )
      expect(dateObjectFalse).toEqual(false)
    })

    it('should test equality between Map objects', () => {
      expect(
        evaluate(
          new Map([
            ['a', 1],
            ['b', 2],
          ]),
          new Map([
            ['a', 1],
            ['b', 2],
          ]),
          { mode: 'deep' },
        ),
      ).toEqual(true)
      expect(evaluate(new Map(), new Map(), { mode: 'deep' })).toEqual(true)
      expect(
        evaluate(
          new Map([['a', 1]]),
          new Map([
            ['a', 1],
            ['b', 2],
          ]),
          { mode: 'deep' },
        ),
      ).toEqual(false)
      expect(
        evaluate(
          new Map([
            ['a', 1],
            ['b', 2],
          ]),
          new Map([
            ['a', 1],
            ['b', 3],
          ]),
          { mode: 'deep' },
        ),
      ).toEqual(false)

      expect(
        evaluate(new Map([['a', { x: 1 }]]), new Map([['a', { x: 1 }]]), {
          mode: 'deep',
        }),
      ).toEqual(true)
      expect(
        evaluate(new Map([['a', { x: 1 }]]), new Map([['a', { x: 2 }]]), {
          mode: 'deep',
        }),
      ).toEqual(false)
      expect(
        evaluate(
          new Map([['a', { nested: { x: 1 } }]]),
          new Map([['a', { nested: { x: 1 } }]]),
          { mode: 'deep' },
        ),
      ).toEqual(true)
    })

    it('should test equality between Set objects', () => {
      expect(
        evaluate(new Set([1, 2, 3]), new Set([1, 2, 3]), { mode: 'deep' }),
      ).toEqual(true)
      expect(evaluate(new Set(), new Set(), { mode: 'deep' })).toEqual(true)
      expect(
        evaluate(new Set([1, 2]), new Set([1, 2, 3]), { mode: 'deep' }),
      ).toEqual(false)
      expect(
        evaluate(new Set([1, 2, 3]), new Set([1, 2, 4]), { mode: 'deep' }),
      ).toEqual(false)

      expect(
        evaluate(new Set([{ x: 1 }]), new Set([{ x: 1 }]), { mode: 'deep' }),
      ).toEqual(true)
      expect(
        evaluate(new Set([{ x: 1 }]), new Set([{ x: 2 }]), { mode: 'deep' }),
      ).toEqual(false)
      expect(
        evaluate(
          new Set([{ nested: { x: 1 } }]),
          new Set([{ nested: { x: 1 } }]),
          { mode: 'deep' },
        ),
      ).toEqual(true)
    })

    it('should test equality between File objects', () => {
      const file1 = new File(['hello'], 'hello.txt', { type: 'text/plain' })
      const file2 = new File(['hello'], 'hello.txt', { type: 'text/plain' })
      const fileDiffName = new File(['hello'], 'world.txt', {
        type: 'text/plain',
      })
      const fileDiffType = new File(['hello'], 'hello.txt', {
        type: 'text/html',
      })
      const fileDiffSize = new File(['hello world'], 'hello.txt', {
        type: 'text/plain',
      })

      expect(evaluate(file1, file2, { mode: 'deep' })).toEqual(true)
      expect(evaluate(file1, fileDiffName, { mode: 'deep' })).toEqual(false)
      expect(evaluate(file1, fileDiffType, { mode: 'deep' })).toEqual(false)
      expect(evaluate(file1, fileDiffSize, { mode: 'deep' })).toEqual(false)

      expect(
        evaluate({ file: file1 }, { file: file2 }, { mode: 'deep' }),
      ).toEqual(true)
      expect(
        evaluate({ file: file1 }, { file: fileDiffName }, { mode: 'deep' }),
      ).toEqual(false)
    })
  })
})
