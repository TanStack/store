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
