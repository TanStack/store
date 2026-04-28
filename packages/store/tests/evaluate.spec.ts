import { describe, expect, it, vi } from 'vitest'
import { compare } from '../src/compare'

describe('evaluate', () => {
  it('should test equality between primitives', () => {
    const numbersTrue = compare(1, 1)
    expect(numbersTrue).toEqual(true)

    const stringFalse = compare('uh oh', '')
    expect(stringFalse).toEqual(false)

    const boolTrue = compare(true, true)
    expect(boolTrue).toEqual(true)

    const nullFalse = compare(null, {})
    expect(nullFalse).toEqual(false)

    const undefinedFalse = compare(undefined, null)
    expect(undefinedFalse).toEqual(false)
  })

  it('should return false for runtime cross-type comparisons', () => {
    expect(compare<any>(new Date(), new Map())).toEqual(false)
    expect(compare<any>(new Date(), new Set())).toEqual(false)
    expect(compare<any>(new Map(), new Set())).toEqual(false)
    expect(compare<any>(new Date(), {})).toEqual(false)
    expect(compare<any>(new Map(), {})).toEqual(false)
    expect(compare<any>(new Set(), {})).toEqual(false)
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

    try {
      expect(() => compare(file1, file2)).not.toThrow()
    } finally {
      vi.unstubAllGlobals()
    }
  })

  describe('shallow', () => {
    it('should test equality between arrays', () => {
      expect(compare([], [])).toEqual(true)

      const arrayFalse = compare([], [''])
      expect(arrayFalse).toEqual(false)

      const arrayDeepFalse = compare([[1]], [])
      expect(arrayDeepFalse).toEqual(false)

      const arrayNestedFalse = compare([[1]], [[1]])
      expect(arrayNestedFalse).toEqual(false)

      const arrayComplexFalse = compare([[{ test: 'true' }], null], [[1], {}])
      expect(arrayComplexFalse).toEqual(false)

      const arrayComplexFalse2 = compare(
        [[{ test: 'true' }], null],
        [[{ test: 'true' }], null],
      )
      expect(arrayComplexFalse2).toEqual(false)
    })

    it('should test equality between objects', () => {
      const objTrue = compare({ test: 'same' }, { test: 'same' })
      expect(objTrue).toEqual(true)

      const objFalse = compare({ test: 'not' }, { test: 'same' })
      expect(objFalse).toEqual(false)

      const objDeepFalse = compare({ test: 'not' }, { test: { test: 'same' } })
      expect(objDeepFalse).toEqual(false)

      const objDeepArrFalse = compare({ test: [] }, { test: [[]] })
      expect(objDeepArrFalse).toEqual(false)

      const objNullFalse = compare({ test: '' }, null)
      expect(objNullFalse).toEqual(false)

      const objComplexFalse = compare(
        { test: { testTwo: '' }, arr: [[1]] },
        { test: { testTwo: false }, arr: [[1], [0]] },
      )
      expect(objComplexFalse).toEqual(false)

      const objComplexShallowFalse = compare(
        { test: { testTwo: '' }, arr: [[1]] },
        { test: { testTwo: '' }, arr: [[1]] },
      )
      expect(objComplexShallowFalse).toEqual(false)
    })

    it('should test equality between Date objects', () => {
      const date1 = new Date('2025-01-01T00:00:00.000Z')
      const date2 = new Date('2025-01-01T00:00:00.000Z')
      const date3 = new Date('2025-01-02T00:00:00.000Z')

      expect(compare(date1, date2)).toEqual(true)
      expect(compare(date1, date3)).toEqual(false)

      const dateObjectShallowFalse = compare({ date: date1 }, { date: date2 })
      expect(dateObjectShallowFalse).toEqual(false)

      const dateObjectFalse = compare({ date: date1 }, { date: date3 })
      expect(dateObjectFalse).toEqual(false)
    })

    it('should test equality between Map objects', () => {
      expect(
        compare(
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
      expect(compare(new Map(), new Map())).toEqual(true)
      expect(
        compare(
          new Map([['a', 1]]),
          new Map([
            ['a', 1],
            ['b', 2],
          ]),
        ),
      ).toEqual(false)
      expect(
        compare(
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
        compare(
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
      expect(compare(new Map([['a', obj]]), new Map([['a', obj]]))).toEqual(
        true,
      )
      expect(
        compare(new Map([['a', { x: 1 }]]), new Map([['a', { x: 1 }]])),
      ).toEqual(false)
    })

    it('should test equality between Set objects', () => {
      expect(compare(new Set([1, 2, 3]), new Set([1, 2, 3]))).toEqual(true)
      expect(compare(new Set(), new Set())).toEqual(true)
      expect(compare(new Set([1, 2]), new Set([1, 2, 3]))).toEqual(false)
      expect(compare(new Set([1, 2, 3]), new Set([1, 2, 4]))).toEqual(false)

      const obj = { x: 1 }
      expect(compare(new Set([obj]), new Set([obj]))).toEqual(true)
      expect(compare(new Set([{ x: 1 }]), new Set([{ x: 1 }]))).toEqual(false)
    })

    it('should test equality between File objects', () => {
      const file1 = new File(['hello'], 'hello.txt', {
        type: 'text/plain',
        lastModified: 0,
      })
      const file2 = new File(['hello'], 'hello.txt', {
        type: 'text/plain',
        lastModified: 0,
      })
      const fileDiffName = new File(['hello'], 'world.txt', {
        type: 'text/plain',
        lastModified: 0,
      })
      const fileDiffType = new File(['hello'], 'hello.txt', {
        type: 'text/html',
        lastModified: 0,
      })
      const fileDiffSize = new File(['hello world'], 'hello.txt', {
        type: 'text/plain',
        lastModified: 0,
      })

      expect(compare(file1, file2)).toEqual(true)
      expect(compare(file1, fileDiffName)).toEqual(false)
      expect(compare(file1, fileDiffType)).toEqual(false)
      expect(compare(file1, fileDiffSize)).toEqual(false)

      expect(compare({ file: file1 }, { file: file2 })).toEqual(false)
      expect(compare({ file: file1 }, { file: fileDiffName })).toEqual(false)
    })

    it('should test equality between objects with Symbol keys', () => {
      const sym = Symbol('id')

      expect(
        compare({ [sym]: 1, name: 'foo' }, { [sym]: 1, name: 'foo' }),
      ).toEqual(true)
      expect(
        compare({ [sym]: 1, name: 'foo' }, { [sym]: 2, name: 'foo' }),
      ).toEqual(false)
      expect(compare({ [sym]: 1 } as any, {} as any)).toEqual(false)
      expect(compare({} as any, { [sym]: 1 } as any)).toEqual(false)
    })
  })

  describe('deep', () => {
    it('should test equality between arrays', () => {
      expect(compare([], [], { mode: 'deep' })).toEqual(true)

      const arrayFalse = compare([], [''], { mode: 'deep' })
      expect(arrayFalse).toEqual(false)

      const arrayDeepFalse = compare([[1]], [], { mode: 'deep' })
      expect(arrayDeepFalse).toEqual(false)

      const arrayDeepSearchTrue = compare([[1]], [[1]], { mode: 'deep' })
      expect(arrayDeepSearchTrue).toEqual(true)

      const arrayComplexFalse = compare([[{ test: 'true' }], null], [[1], {}], {
        mode: 'deep',
      })
      expect(arrayComplexFalse).toEqual(false)

      const arrayComplexTrue = compare(
        [[{ test: 'true' }], null],
        [[{ test: 'true' }], null],
        { mode: 'deep' },
      )
      expect(arrayComplexTrue).toEqual(true)
    })

    it('should test equality between objects', () => {
      const objTrue = compare(
        { test: 'same' },
        { test: 'same' },
        { mode: 'deep' },
      )
      expect(objTrue).toEqual(true)

      const objFalse = compare(
        { test: 'not' },
        { test: 'same' },
        { mode: 'deep' },
      )
      expect(objFalse).toEqual(false)

      const objDeepFalse = compare(
        { test: 'not' },
        { test: { test: 'same' } },
        { mode: 'deep' },
      )
      expect(objDeepFalse).toEqual(false)

      const objDeepArrFalse = compare(
        { test: [] },
        { test: [[]] },
        { mode: 'deep' },
      )
      expect(objDeepArrFalse).toEqual(false)

      const objNullFalse = compare({ test: '' }, null, { mode: 'deep' })
      expect(objNullFalse).toEqual(false)

      const objComplexFalse = compare(
        { test: { testTwo: '' }, arr: [[1]] },
        { test: { testTwo: false }, arr: [[1], [0]] },
        { mode: 'deep' },
      )
      expect(objComplexFalse).toEqual(false)

      const objComplexTrue = compare(
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

      expect(compare(date1, date2, { mode: 'deep' })).toEqual(true)
      expect(compare(date1, date3, { mode: 'deep' })).toEqual(false)

      const dateObjectTrue = compare(
        { date: date1 },
        { date: date2 },
        { mode: 'deep' },
      )
      expect(dateObjectTrue).toEqual(true)

      const dateObjectFalse = compare(
        { date: date1 },
        { date: date3 },
        { mode: 'deep' },
      )
      expect(dateObjectFalse).toEqual(false)
    })

    it('should test equality between Map objects', () => {
      expect(
        compare(
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
      expect(compare(new Map(), new Map(), { mode: 'deep' })).toEqual(true)
      expect(
        compare(
          new Map([['a', 1]]),
          new Map([
            ['a', 1],
            ['b', 2],
          ]),
          { mode: 'deep' },
        ),
      ).toEqual(false)
      expect(
        compare(
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
        compare(new Map([['a', { x: 1 }]]), new Map([['a', { x: 1 }]]), {
          mode: 'deep',
        }),
      ).toEqual(true)
      expect(
        compare(new Map([['a', { x: 1 }]]), new Map([['a', { x: 2 }]]), {
          mode: 'deep',
        }),
      ).toEqual(false)
      expect(
        compare(
          new Map([['a', { nested: { x: 1 } }]]),
          new Map([['a', { nested: { x: 1 } }]]),
          { mode: 'deep' },
        ),
      ).toEqual(true)
    })

    it('should test equality between Set objects', () => {
      expect(
        compare(new Set([1, 2, 3]), new Set([1, 2, 3]), { mode: 'deep' }),
      ).toEqual(true)
      expect(compare(new Set(), new Set(), { mode: 'deep' })).toEqual(true)
      expect(
        compare(new Set([1, 2]), new Set([1, 2, 3]), { mode: 'deep' }),
      ).toEqual(false)
      expect(
        compare(new Set([1, 2, 3]), new Set([1, 2, 4]), { mode: 'deep' }),
      ).toEqual(false)

      expect(
        compare(new Set([{ x: 1 }]), new Set([{ x: 1 }]), { mode: 'deep' }),
      ).toEqual(true)
      expect(
        compare(new Set([{ x: 1 }]), new Set([{ x: 2 }]), { mode: 'deep' }),
      ).toEqual(false)
      expect(
        compare(
          new Set([{ nested: { x: 1 } }]),
          new Set([{ nested: { x: 1 } }]),
          { mode: 'deep' },
        ),
      ).toEqual(true)
    })

    it('should test equality between File objects', () => {
      const file1 = new File(['hello'], 'hello.txt', {
        type: 'text/plain',
        lastModified: 0,
      })
      const file2 = new File(['hello'], 'hello.txt', {
        type: 'text/plain',
        lastModified: 0,
      })
      const fileDiffName = new File(['hello'], 'world.txt', {
        type: 'text/plain',
        lastModified: 0,
      })
      const fileDiffType = new File(['hello'], 'hello.txt', {
        type: 'text/html',
        lastModified: 0,
      })
      const fileDiffSize = new File(['hello world'], 'hello.txt', {
        type: 'text/plain',
        lastModified: 0,
      })

      expect(compare(file1, file2, { mode: 'deep' })).toEqual(true)
      expect(compare(file1, fileDiffName, { mode: 'deep' })).toEqual(false)
      expect(compare(file1, fileDiffType, { mode: 'deep' })).toEqual(false)
      expect(compare(file1, fileDiffSize, { mode: 'deep' })).toEqual(false)

      expect(
        compare({ file: file1 }, { file: file2 }, { mode: 'deep' }),
      ).toEqual(true)
      expect(
        compare({ file: file1 }, { file: fileDiffName }, { mode: 'deep' }),
      ).toEqual(false)
    })

    it('should test equality between objects with Symbol keys', () => {
      const sym = Symbol('id')

      expect(
        compare(
          { [sym]: 1, name: 'foo' },
          { [sym]: 1, name: 'foo' },
          { mode: 'deep' },
        ),
      ).toEqual(true)
      expect(
        compare(
          { [sym]: 1, name: 'foo' },
          { [sym]: 2, name: 'foo' },
          { mode: 'deep' },
        ),
      ).toEqual(false)
      expect(
        compare(
          { [sym]: { nested: true } } as any,
          { [sym]: { nested: true } } as any,
          { mode: 'deep' },
        ),
      ).toEqual(true)
      expect(
        compare(
          { [sym]: { nested: true } } as any,
          { [sym]: { nested: false } } as any,
          { mode: 'deep' },
        ),
      ).toEqual(false)
    })

    it('should handle circular references', () => {
      const a: any = { x: 1 }
      a.self = a

      const b: any = { x: 1 }
      b.self = b

      expect(() => compare(a, b, { mode: 'deep' })).not.toThrow()
      expect(compare(a, b, { mode: 'deep' })).toEqual(true)

      const c: any = { x: 2 }
      c.self = c
      expect(compare(a, c, { mode: 'deep' })).toEqual(false)
    })
  })
})
