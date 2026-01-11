import { expectTypeOf, test } from 'vitest'
import { createStore } from '@tanstack/store'
import { injectStore } from '../src'
import type { Signal } from '@angular/core'

test('injectStore works with derived state', () => {
  const store = createStore(12)
  const derived = createStore(() => store.state * 2)

  const val = injectStore(derived, (state) => {
    expectTypeOf(state).toEqualTypeOf<number>()
    return state
  })

  expectTypeOf(val).toEqualTypeOf<Signal<number>>()
})
