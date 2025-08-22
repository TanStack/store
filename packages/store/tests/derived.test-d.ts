import { expectTypeOf, test } from 'vitest'
import { Derived, Store } from '../src'

test('dep array inner types work', () => {
  const store = new Store(12)
  new Derived({
    deps: [store],
    fn: ({ currDepVals: [currentStore], prevDepVals }) => {
      expectTypeOf(currentStore).toMatchTypeOf<number>()
      expectTypeOf(prevDepVals).toMatchTypeOf<[number] | undefined>()
    },
  })
})

test('dep array inner types work with derived vals', () => {
  const derived = new Derived({
    fn: () => 123,
    deps: [],
  })

  new Derived({
    // This is an edgecase that might happen when an array is of unknown length, like being drive through `.map`
    deps: [derived] as ReadonlyArray<typeof derived>,
    fn: ({ currDepVals }) => {
      expectTypeOf(currDepVals).toMatchTypeOf<Array<number>>()
    },
  })
})

test('return type inferencing should work', () => {
  const derived = new Derived({
    deps: [],
    fn: ({ prevVal }) => {
      // See comment in `DerivedOptions` for why this is necessary
      expectTypeOf(prevVal).toMatchTypeOf<unknown>()
      return 12 as const
    },
  })

  expectTypeOf(derived).toMatchTypeOf<Derived<12, any>>()
})
