import { test, expectTypeOf } from 'vitest'
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
