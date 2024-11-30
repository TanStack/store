import { expectTypeOf, test } from 'vitest'
import { Derived, Store, useStore } from '../src'

test('useStore works with derived state', () => {
  const store = new Store(12)
  const derived = new Derived({
    deps: [store],
    fn: () => {
      return { val: store.state * 2 }
    },
  })

  const val = useStore(derived, (state) => {
    expectTypeOf(state).toMatchTypeOf<{ val: number }>()
    return state.val
  })

  expectTypeOf(val).toMatchTypeOf<number>()
})
