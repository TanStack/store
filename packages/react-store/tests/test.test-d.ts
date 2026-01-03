import { expectTypeOf, test } from 'vitest'
import { createAtom, useSelector } from '../src'

test('useStore works with derived state', () => {
  const store = createAtom(12)
  const derived = createAtom(() => {
    return { val: store.get() * 2 }
  })

  const val = useSelector(derived, (state) => {
    expectTypeOf(state).toMatchObjectType<{ val: number }>()
    return state.val
  })

  expectTypeOf(val).toExtend<number>()
})
