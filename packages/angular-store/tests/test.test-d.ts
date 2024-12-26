import { expectTypeOf, test } from 'vitest'
import { Derived, Store, injectStore } from '../src'
import type { Signal } from '@angular/core'

test('injectStore works with derived state', () => {
  const store = new Store(12)
  const derived = new Derived({
    deps: [store],
    fn: () => {
      return { val: store.state * 2 }
    },
  })

  const val = injectStore(derived, (state) => {
    expectTypeOf(state).toMatchTypeOf<{ val: number }>()
    return state.val
  })

  expectTypeOf(val).toMatchTypeOf<Signal<number>>()
})
