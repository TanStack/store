import { expectTypeOf, test } from 'vitest'
import { createStore } from '@tanstack/store'
import { useStore } from '../src'

test('useStore works with derived state', () => {
  const store = createStore(12)
  const derived = createStore(() => store.state * 2)

  const val = useStore(derived, (state) => {
    expectTypeOf(state).toEqualTypeOf<number>()
    return state
  })

  expectTypeOf(val).toEqualTypeOf<number>()
})
