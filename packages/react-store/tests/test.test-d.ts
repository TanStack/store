import { expectTypeOf, test } from 'vitest'
import { createStore, useSelector } from '../src'

test('useStore works with derived state', () => {
  const store = createStore(12)
  const derived = createStore(() => {
    return { val: store.state * 2 }
  })

  const val = useSelector(derived, (state) => {
    expectTypeOf(state).toMatchObjectType<{ val: number }>()
    return state.val
  })

  expectTypeOf(val).toExtend<number>()
})
