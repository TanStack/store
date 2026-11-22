import { describe, expect, it, vi } from 'vitest'
import { compareDeep, compareShallow } from '../src/compare'

describe('evaluate', () => {
  it('should test equality between primitives', () => {
    const numbersTrue = compareShallow(1, 1)
    expect(numbersTrue).toEqual(true)

    const stringFalse = compareShallow('uh oh', '')
    expect(stringFalse).toEqual(false)

    const boolTrue = compareShallow(true, true)
    expect(boolTrue).toEqual(true)

    const nullFalse = compareShallow(null, {})
    expect(nullFalse).toEqual(false)

    const undefinedFalse = compareShallow(undefined, null)
    expect(undefinedFalse).toEqual(false)
  })

  it('should return false for runtime cross-type comparisons', () => {
    expect(compareShallow<any>(new Date(), new Map())).toEqual(false)
    expect(compareShallow<any>(new Date(), new Set())).toEqual(false)
    expect(compareShallow<any>(new Map(), new Set())).toEqual(false)
    expect(compareShallow<any>(new Date(), {})).toEqual(false)
    expect(compareShallow<any>(new Map(), {})).toEqual(false)
    expect(compareShallow<any>(new Set(), {})).toEqual(false)
  })

  it('should return false when comparing a subclass instance to a base class instance', () => {
    class ExtendedMap extends Map {}
    class ExtendedSet extends Set {}
    class ExtendedDate extends Date {}

    // subclass vs base class, different prototypes, never equal
    expect(compareShallow<any>(new ExtendedMap(), new Map())).toEqual(false)
    expect(compareShallow<any>(new Map(), new ExtendedMap())).toEqual(false)
    expect(compareShallow<any>(new ExtendedSet(), new Set())).toEqual(false)
    expect(compareShallow<any>(new Set(), new ExtendedSet())).toEqual(false)
    expect(compareShallow<any>(new ExtendedDate(), new Date())).toEqual(false)
    expect(compareShallow<any>(new Date(), new ExtendedDate())).toEqual(false)

    // two instances of the same subclass with equal contents are equal
    expect(compareShallow<any>(new ExtendedMap(), new ExtendedMap())).toEqual(
      true,
    )
    expect(compareShallow<any>(new ExtendedSet(), new ExtendedSet())).toEqual(
      true,
    )

    // same checks hold in deep mode
    expect(compareDeep<any>(new ExtendedMap(), new Map())).toEqual(false)
    expect(compareDeep<any>(new ExtendedSet(), new Set())).toEqual(false)
    expect(compareDeep<any>(new ExtendedDate(), new Date())).toEqual(false)
    expect(compareDeep<any>(new ExtendedMap(), new ExtendedMap())).toEqual(true)
    expect(compareDeep<any>(new ExtendedSet(), new ExtendedSet())).toEqual(true)
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
      expect(() => compareShallow(file1, file2)).not.toThrow()
    } finally {
      vi.unstubAllGlobals()
    }
  })

  describe('shallow', () => {
    it('should test equality between arrays', () => {
      expect(compareShallow([], [])).toEqual(true)

      const arrayFalse = compareShallow([], [''])
      expect(arrayFalse).toEqual(false)

      const arrayDeepFalse = compareShallow([[1]], [])
      expect(arrayDeepFalse).toEqual(false)

      const arrayNestedFalse = compareShallow([[1]], [[1]])
      expect(arrayNestedFalse).toEqual(false)

      const arrayComplexFalse = compareShallow(
        [[{ test: 'true' }], null],
        [[1], {}],
      )
      expect(arrayComplexFalse).toEqual(false)

      const arrayComplexFalse2 = compareShallow(
        [[{ test: 'true' }], null],
        [[{ test: 'true' }], null],
      )
      expect(arrayComplexFalse2).toEqual(false)
    })

    it('should test equality between objects', () => {
      const objTrue = compareShallow({ test: 'same' }, { test: 'same' })
      expect(objTrue).toEqual(true)

      const objFalse = compareShallow({ test: 'not' }, { test: 'same' })
      expect(objFalse).toEqual(false)

      const objDeepFalse = compareShallow(
        { test: 'not' },
        { test: { test: 'same' } },
      )
      expect(objDeepFalse).toEqual(false)

      const objDeepArrFalse = compareShallow({ test: [] }, { test: [[]] })
      expect(objDeepArrFalse).toEqual(false)

      const objNullFalse = compareShallow({ test: '' }, null)
      expect(objNullFalse).toEqual(false)

      const objComplexFalse = compareShallow(
        { test: { testTwo: '' }, arr: [[1]] },
        { test: { testTwo: false }, arr: [[1], [0]] },
      )
      expect(objComplexFalse).toEqual(false)

      const objComplexShallowFalse = compareShallow(
        { test: { testTwo: '' }, arr: [[1]] },
        { test: { testTwo: '' }, arr: [[1]] },
      )
      expect(objComplexShallowFalse).toEqual(false)
    })

    it('should test equality between Date objects', () => {
      const date1 = new Date('2025-01-01T00:00:00.000Z')
      const date2 = new Date('2025-01-01T00:00:00.000Z')
      const date3 = new Date('2025-01-02T00:00:00.000Z')

      expect(compareShallow(date1, date2)).toEqual(true)
      expect(compareShallow(date1, date3)).toEqual(false)

      const dateObjectShallowFalse = compareShallow(
        { date: date1 },
        { date: date2 },
      )
      expect(dateObjectShallowFalse).toEqual(false)

      const dateObjectFalse = compareShallow({ date: date1 }, { date: date3 })
      expect(dateObjectFalse).toEqual(false)
    })

    it('should test equality between Map objects', () => {
      expect(
        compareShallow(
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
      expect(compareShallow(new Map(), new Map())).toEqual(true)
      expect(
        compareShallow(
          new Map([['a', 1]]),
          new Map([
            ['a', 1],
            ['b', 2],
          ]),
        ),
      ).toEqual(false)
      expect(
        compareShallow(
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
        compareShallow(
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
      expect(
        compareShallow(new Map([['a', obj]]), new Map([['a', obj]])),
      ).toEqual(true)
      expect(
        compareShallow(new Map([['a', { x: 1 }]]), new Map([['a', { x: 1 }]])),
      ).toEqual(false)
    })

    it('should test equality between Set objects', () => {
      expect(compareShallow(new Set([1, 2, 3]), new Set([1, 2, 3]))).toEqual(
        true,
      )
      expect(compareShallow(new Set(), new Set())).toEqual(true)
      expect(compareShallow(new Set([1, 2]), new Set([1, 2, 3]))).toEqual(false)
      expect(compareShallow(new Set([1, 2, 3]), new Set([1, 2, 4]))).toEqual(
        false,
      )

      const obj = { x: 1 }
      expect(compareShallow(new Set([obj]), new Set([obj]))).toEqual(true)
      expect(compareShallow(new Set([{ x: 1 }]), new Set([{ x: 1 }]))).toEqual(
        false,
      )
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

      expect(compareShallow(file1, file2)).toEqual(true)
      expect(compareShallow(file1, fileDiffName)).toEqual(false)
      expect(compareShallow(file1, fileDiffType)).toEqual(false)
      expect(compareShallow(file1, fileDiffSize)).toEqual(false)

      expect(compareShallow({ file: file1 }, { file: file2 })).toEqual(false)
      expect(compareShallow({ file: file1 }, { file: fileDiffName })).toEqual(
        false,
      )
    })

    it('should test equality between objects with Symbol keys', () => {
      const sym = Symbol('id')

      expect(
        compareShallow({ [sym]: 1, name: 'foo' }, { [sym]: 1, name: 'foo' }),
      ).toEqual(true)
      expect(
        compareShallow({ [sym]: 1, name: 'foo' }, { [sym]: 2, name: 'foo' }),
      ).toEqual(false)
      expect(compareShallow({ [sym]: 1 } as any, {} as any)).toEqual(false)
      expect(compareShallow({} as any, { [sym]: 1 } as any)).toEqual(false)
    })
  })

  describe('deep', () => {
    it('should test equality between arrays', () => {
      expect(compareDeep([], [])).toEqual(true)

      const arrayFalse = compareDeep([], [''])
      expect(arrayFalse).toEqual(false)

      const arrayDeepFalse = compareDeep([[1]], [])
      expect(arrayDeepFalse).toEqual(false)

      const arrayDeepSearchTrue = compareDeep([[1]], [[1]])
      expect(arrayDeepSearchTrue).toEqual(true)

      const arrayComplexFalse = compareDeep(
        [[{ test: 'true' }], null],
        [[1], {}],
      )
      expect(arrayComplexFalse).toEqual(false)

      const arrayComplexTrue = compareDeep(
        [[{ test: 'true' }], null],
        [[{ test: 'true' }], null],
      )
      expect(arrayComplexTrue).toEqual(true)
    })

    it('should test equality between objects', () => {
      const objTrue = compareDeep({ test: 'same' }, { test: 'same' })
      expect(objTrue).toEqual(true)

      const objFalse = compareDeep({ test: 'not' }, { test: 'same' })
      expect(objFalse).toEqual(false)

      const objDeepFalse = compareDeep(
        { test: 'not' },
        { test: { test: 'same' } },
      )
      expect(objDeepFalse).toEqual(false)

      const objDeepArrFalse = compareDeep({ test: [] }, { test: [[]] })
      expect(objDeepArrFalse).toEqual(false)

      const objNullFalse = compareDeep({ test: '' }, null)
      expect(objNullFalse).toEqual(false)

      const objComplexFalse = compareDeep(
        { test: { testTwo: '' }, arr: [[1]] },
        { test: { testTwo: false }, arr: [[1], [0]] },
      )
      expect(objComplexFalse).toEqual(false)

      const objComplexTrue = compareDeep(
        { test: { testTwo: '' }, arr: [[1]] },
        { test: { testTwo: '' }, arr: [[1]] },
      )
      expect(objComplexTrue).toEqual(true)
    })

    it('should test equality between Date objects', () => {
      const date1 = new Date('2025-01-01T00:00:00.000Z')
      const date2 = new Date('2025-01-01T00:00:00.000Z')
      const date3 = new Date('2025-01-02T00:00:00.000Z')

      expect(compareDeep(date1, date2)).toEqual(true)
      expect(compareDeep(date1, date3)).toEqual(false)

      const dateObjectTrue = compareDeep({ date: date1 }, { date: date2 })
      expect(dateObjectTrue).toEqual(true)

      const dateObjectFalse = compareDeep({ date: date1 }, { date: date3 })
      expect(dateObjectFalse).toEqual(false)
    })

    it('should test equality between Map objects', () => {
      expect(
        compareDeep(
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
      expect(compareDeep(new Map(), new Map())).toEqual(true)
      expect(
        compareDeep(
          new Map([['a', 1]]),
          new Map([
            ['a', 1],
            ['b', 2],
          ]),
        ),
      ).toEqual(false)
      expect(
        compareDeep(
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

      expect(
        compareDeep(new Map([['a', { x: 1 }]]), new Map([['a', { x: 1 }]])),
      ).toEqual(true)
      expect(
        compareDeep(new Map([['a', { x: 1 }]]), new Map([['a', { x: 2 }]])),
      ).toEqual(false)
      expect(
        compareDeep(
          new Map([['a', { nested: { x: 1 } }]]),
          new Map([['a', { nested: { x: 1 } }]]),
        ),
      ).toEqual(true)
    })

    it('should test equality between Set objects', () => {
      expect(compareDeep(new Set([1, 2, 3]), new Set([1, 2, 3]))).toEqual(true)
      expect(compareDeep(new Set(), new Set())).toEqual(true)
      expect(compareDeep(new Set([1, 2]), new Set([1, 2, 3]))).toEqual(false)
      expect(compareDeep(new Set([1, 2, 3]), new Set([1, 2, 4]))).toEqual(false)

      expect(compareDeep(new Set([{ x: 1 }]), new Set([{ x: 1 }]))).toEqual(
        true,
      )
      expect(compareDeep(new Set([{ x: 1 }]), new Set([{ x: 2 }]))).toEqual(
        false,
      )
      expect(
        compareDeep(
          new Set([{ nested: { x: 1 } }]),
          new Set([{ nested: { x: 1 } }]),
        ),
      ).toEqual(true)
    })

    it('should match each Set element at most once', () => {
      expect(
        compareDeep(
          new Set([{ x: 1 }, { x: 1 }]),
          new Set([{ x: 1 }, { x: 2 }]),
        ),
      ).toEqual(false)
      expect(
        compareDeep(
          new Set([{ x: 1 }, { x: 2 }]),
          new Set([{ x: 1 }, { x: 1 }]),
        ),
      ).toEqual(false)
      expect(
        compareDeep(
          new Set([{ x: 2 }, { x: 1 }]),
          new Set([{ x: 1 }, { x: 2 }]),
        ),
      ).toEqual(true)
    })

    it('should not remember failed Set element comparisons as equal', () => {
      const p = { x: 1 }
      const q = { x: 2 }

      // While matching the Sets, `p` is first tried against `q2` and fails.
      // That failed attempt must not make the later `p` vs `q2` check pass.
      const q2 = { x: 2 }
      const p2 = { x: 1 }

      expect(
        compareDeep([new Set([p, q]), p], [new Set([q2, p2]), q2]),
      ).toEqual(false)
    })

    it('should drop provisional results when the ancestor they assumed fails', () => {
      const build = (x: number) => {
        const child: Record<string, unknown> = {}
        const parent = { child, x }
        child.parent = parent
        return { parent, child }
      }
      const a = build(1)
      const a2 = build(1)
      const b = build(2)
      const b2 = build(2)

      // Matching the Sets first tries `a` against `b`. While that pair is in
      // progress, `a.child` vs `b.child` is provisionally equal, and then the
      // pair fails on `x`. The Sets still match (`a` with `a2`, `b2` with `b`),
      // so the comparison goes on to `a.child` vs `b.child`, which must now
      // fail because their parents differ.
      expect(
        compareDeep(
          [new Set([a.parent, b2.parent]), a.child],
          [new Set([b.parent, a2.parent]), b.child],
        ),
      ).toEqual(false)
    })

    it('should drop provisional results when any ancestor they assumed fails', () => {
      const build = (x: number) => {
        const child: Record<string, unknown> = {}
        const parent = { child, x }
        child.parent = parent
        return { parent, child }
      }
      const a = build(1)
      const a2 = build(1)
      const b = build(2)
      const b2 = build(2)
      const left = [new Set([a.parent, b2.parent]), a.child]
      const right = [new Set([b.parent, a2.parent]), b.child]
      // Every child also points to its side's outer array, so the provisional
      // result for `a.child` vs `b.child` depends on both the outer arrays and
      // the failing parents.
      a.child.outer = left
      b2.child.outer = left
      b.child.outer = right
      a2.child.outer = right

      expect(compareDeep(left, right)).toEqual(false)
    })

    it('should not cache a failure that relied on an in-progress pair', () => {
      // While `P` vs `Q` is in progress, Set matching pairs L's `{ parent: P }`
      // with R's `{ parent: Q }` and then fails. That failure must not be
      // reused once `P` vs `Q` is done, because L and R do match one to one.
      const L = new Set<{ parent: unknown }>()
      const R = new Set<{ parent: unknown }>()
      const P = { s: L, x: 1 }
      const Q = { x: 2, s: R }
      L.add({ parent: P }).add({ parent: Q })
      R.add({ parent: Q }).add({ parent: P })

      expect(
        compareDeep([new Set([P, Q]), L], [new Set([Q, { ...P }]), R]),
      ).toEqual(true)
    })

    it('should match Sets of the same references in linear time', () => {
      const items = Array.from({ length: 200000 }, (_, i) => ({ id: i }))
      const reversed = new Set([...items].reverse())

      // a scan per element would take on the order of 2 * 10^10 steps here
      const start = performance.now()
      expect(compareDeep(new Set(items), reversed)).toEqual(true)
      expect(performance.now() - start).toBeLessThan(1000)
    })

    it('should match large Sets of objects in any order', () => {
      const items = (n: number) =>
        Array.from({ length: n }, (_, i) => ({ id: i, tags: [i % 3] }))

      expect(
        compareDeep(new Set(items(1000)), new Set(items(1000).reverse())),
      ).toEqual(true)
      const changed = items(1000).reverse()
      changed[500] = { id: -1, tags: [0] }
      expect(compareDeep(new Set(items(1000)), new Set(changed))).toEqual(false)
    })

    describe('shared children', () => {
      // Each structure doubles its references per level, so 20 levels mean
      // about a million comparisons if a pair is compared more than once.
      const LEVELS = 20

      // A node whose `value` getter counts reads. compareDeep reads it once per
      // side each time it compares the node pair, so 2 reads mean the pair was
      // compared once.
      const createProbe = () => {
        const probe = {
          reads: 0,
          node: (value: number, extra: Record<string, unknown> = {}) =>
            Object.defineProperty(extra, 'value', {
              enumerable: true,
              get: () => {
                probe.reads++
                return value
              },
            }),
        }
        return probe
      }

      it('should compare a shared child only once', () => {
        const probe = createProbe()
        const build = () => {
          let node: object = probe.node(1)
          for (let i = 0; i < LEVELS; i++) node = { left: node, right: node }
          return node
        }

        expect(compareDeep(build(), build())).toEqual(true)
        expect(probe.reads).toEqual(2)
      })

      it('should compare a shared self-referencing child only once', () => {
        const probe = createProbe()
        const build = () => {
          const leaf = probe.node(1)
          leaf.self = leaf
          let node: object = leaf
          for (let i = 0; i < LEVELS; i++) node = { left: node, right: node }
          return node
        }

        expect(compareDeep(build(), build())).toEqual(true)
        expect(probe.reads).toEqual(2)
      })

      it('should compare shared children that point back to an ancestor only once', () => {
        const probe = createProbe()
        const build = (value: number) => {
          const root: Record<string, unknown> = {}
          let node: object = probe.node(value, { root })
          for (let i = 0; i < LEVELS; i++) node = { left: node, right: node }
          root.child = node
          return root
        }

        expect(compareDeep(build(1), build(1))).toEqual(true)
        expect(probe.reads).toEqual(2)

        probe.reads = 0
        expect(compareDeep(build(1), build(2))).toEqual(false)
        expect(probe.reads).toEqual(2)
      })

      it('should not repeat failed comparisons of shared array children', () => {
        const probe = createProbe()
        const build = (value: number) => {
          let node: object = probe.node(value)
          for (let i = 0; i < LEVELS; i++) node = [{ c: node }, { c: node }]
          return node
        }

        expect(compareDeep(build(1), build(2))).toEqual(false)
        expect(probe.reads).toEqual(2)
      })

      it('should not repeat failed comparisons of shared Set children', () => {
        const probe = createProbe()
        const build = (value: number) => {
          let node: Set<unknown> = new Set([probe.node(value)])
          for (let i = 0; i < LEVELS; i++) {
            node = new Set([
              { c: node, t: 1 },
              { c: node, t: 2 },
            ])
          }
          return node
        }

        expect(compareDeep(build(1), build(2))).toEqual(false)
        expect(probe.reads).toEqual(2)
      })
    })

    describe('max depth', () => {
      const nestedArrays = (depth: number) =>
        JSON.parse('['.repeat(depth) + ']'.repeat(depth)) as unknown
      const nestedObjects = (depth: number) =>
        JSON.parse('{"a":'.repeat(depth) + '1' + '}'.repeat(depth)) as unknown

      it('should compare values nested below the max depth', () => {
        expect(compareDeep(nestedArrays(400), nestedArrays(400))).toEqual(true)
        expect(compareDeep(nestedObjects(400), nestedObjects(400))).toEqual(
          true,
        )
      })

      it('should not cache a failure caused by the max depth', () => {
        const wrap = (value: unknown, depth: number) => {
          let node = value
          for (let i = 0; i < depth; i++) node = { a: node }
          return node
        }
        const shared = () => wrap(1, 10)
        const sharedA = shared()
        const sharedB = shared()
        const deepA = wrap(sharedA, 495)
        const e = { y: deepA, x: sharedA }
        const c1 = { y: wrap(sharedB, 495), x: sharedB }
        const c2 = { y: deepA, x: sharedB }

        // `e` is first tried against `c1`, which reaches `sharedA` vs
        // `sharedB` past the max depth and fails. `e` then matches `c2`, which
        // compares the same pair near the top, where it fits.
        expect(compareDeep(new Set([e, c1]), new Set([c1, c2]))).toEqual(true)
      })

      it('should report values nested past the max depth as unequal instead of overflowing the stack', () => {
        expect(() =>
          compareDeep(nestedArrays(20000), nestedArrays(20000)),
        ).not.toThrow()
        expect(compareDeep(nestedArrays(20000), nestedArrays(20000))).toEqual(
          false,
        )
        expect(compareDeep(nestedObjects(20000), nestedObjects(20000))).toEqual(
          false,
        )
      })
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

      expect(compareDeep(file1, file2)).toEqual(true)
      expect(compareDeep(file1, fileDiffName)).toEqual(false)
      expect(compareDeep(file1, fileDiffType)).toEqual(false)
      expect(compareDeep(file1, fileDiffSize)).toEqual(false)

      expect(compareDeep({ file: file1 }, { file: file2 })).toEqual(true)
      expect(compareDeep({ file: file1 }, { file: fileDiffName })).toEqual(
        false,
      )
    })

    it('should test equality between objects with Symbol keys', () => {
      const sym = Symbol('id')

      expect(
        compareDeep({ [sym]: 1, name: 'foo' }, { [sym]: 1, name: 'foo' }),
      ).toEqual(true)
      expect(
        compareDeep({ [sym]: 1, name: 'foo' }, { [sym]: 2, name: 'foo' }),
      ).toEqual(false)
      expect(
        compareDeep(
          { [sym]: { nested: true } } as any,
          { [sym]: { nested: true } } as any,
        ),
      ).toEqual(true)
      expect(
        compareDeep(
          { [sym]: { nested: true } } as any,
          { [sym]: { nested: false } } as any,
        ),
      ).toEqual(false)
    })

    it('should compare Temporal values', () => {
      // @ts-ignore cannot find Temporal - implemented in node v26 but missing from Ts 6 unless target is "ESNext.Temporal"
      const temporalNow = Temporal.Now.instant()
      expect(
        // @ts-ignore cannot find Temporal
        compareDeep(temporalNow, Temporal.Now.instant().add({ seconds: 1 })),
      ).toBe(false)
      expect(compareDeep(temporalNow, temporalNow)).toBe(true)
    })

    it('does not delegate to equals() when only one operand exposes it', () => {
      expect(
        compareDeep({ equals: () => true } as unknown, {} as unknown),
      ).toBe(false)

      expect(
        compareDeep({} as unknown, { equals: () => true } as unknown),
      ).toBe(false)
    })

    it('should handle circular references', () => {
      const a: any = { x: 1 }
      a.self = a

      const b: any = { x: 1 }
      b.self = b

      expect(() => compareDeep(a, b)).not.toThrow()
      expect(compareDeep(a, b)).toEqual(true)

      const c: any = { x: 2 }
      c.self = c
      expect(compareDeep(a, c)).toEqual(false)
    })
  })
})
