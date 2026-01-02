import { expectTypeOf, test } from 'vitest'
import { createAtom } from '@tanstack/store'
import { useStore } from '../src'
import type { Accessor } from 'solid-js'

test('useStore works with derived state', () => {
  const store = createAtom(12)
  const derived = createAtom(() => store.get() * 2)

  const val = useStore(derived, (state) => {
    expectTypeOf(state).toEqualTypeOf<number>()
    return state
  })

  expectTypeOf(val).toEqualTypeOf<Accessor<number>>()
})
