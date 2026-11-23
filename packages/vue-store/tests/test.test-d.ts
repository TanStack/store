import { expectTypeOf, test } from 'vitest'
import { createAtom, createStore } from '@tanstack/store'
import { useAtom, useSelector } from '../src'
import type { Ref } from 'vue'

test('useSelector works with derived state', () => {
  const store = createStore(12)
  const derived = createStore(() => store.state * 2)

  const val = useSelector(derived, (state) => {
    expectTypeOf(state).toEqualTypeOf<number>()
    return state
  })

  expectTypeOf(val).toEqualTypeOf<Readonly<Ref<number>>>()
})

test('useSelector infers value from mutable and readonly sources', () => {
  const writableAtom = createAtom(12)
  const readonlyAtom = createAtom(() => 24)
  const writableStore = createStore(12)
  const readonlyStore = createStore(() => 24)

  expectTypeOf(useSelector(writableAtom)).toEqualTypeOf<Readonly<Ref<number>>>()
  expectTypeOf(useSelector(readonlyAtom)).toEqualTypeOf<Readonly<Ref<number>>>()
  expectTypeOf(useSelector(writableStore)).toEqualTypeOf<
    Readonly<Ref<number>>
  >()
  expectTypeOf(useSelector(readonlyStore)).toEqualTypeOf<
    Readonly<Ref<number>>
  >()
})

test('useAtom only accepts writable atoms', () => {
  const writableAtom = createAtom(12)
  const readonlyAtom = createAtom(() => 24)

  const [value, setValue] = useAtom(writableAtom)

  expectTypeOf(value).toEqualTypeOf<Readonly<Ref<number>>>()
  expectTypeOf(setValue).toBeFunction()
  // @ts-expect-error readonly atoms cannot be used with useAtom
  useAtom(readonlyAtom)
})
