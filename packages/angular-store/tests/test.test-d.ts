import { expectTypeOf, test } from 'vitest'
import { createAtom } from '@xstate/store'
import { injectStore } from '../src'
import type { Signal } from '@angular/core'

test('injectStore works with derived state', () => {
  const store = createAtom(12)
  const derived = createAtom(() => store.get() * 2)

  const val = injectStore(derived, (state) => {
    expectTypeOf(state).toEqualTypeOf<number>()
    return state
  })

  expectTypeOf(val).toEqualTypeOf<Signal<number>>()
})
