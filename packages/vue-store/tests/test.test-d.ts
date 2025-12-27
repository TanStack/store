import { expectTypeOf, test } from 'vitest'
import { createAtom } from '@xstate/store'
import { useStore } from '../src'
import type { Ref } from 'vue-demi'

test('useStore works with derived state', () => {
  const store = createAtom(12)
  const derived = createAtom(() => store.get() * 2)

  const val = useStore(derived, (state) => {
    expectTypeOf(state).toEqualTypeOf<number>()
    return state
  })

  expectTypeOf(val).toEqualTypeOf<Readonly<Ref<number>>>()
})
