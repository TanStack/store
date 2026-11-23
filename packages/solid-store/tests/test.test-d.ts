import { expectTypeOf, test } from 'vitest'
import { createAtom, createStore } from '@tanstack/store'
import { createStoreContext, useAtom, useSelector } from '../src'
import type { Accessor } from 'solid-js'
import type { Atom, ReadonlyStore } from '@tanstack/store'

test('useSelector works with derived state', () => {
  const store = createStore(12)
  const derived = createStore(() => store.state * 2)

  const val = useSelector(derived, (state) => {
    expectTypeOf(state).toEqualTypeOf<number>()
    return state
  })

  expectTypeOf(val).toEqualTypeOf<Accessor<number>>()
})

test('useSelector infers value from mutable and readonly sources', () => {
  const writableAtom = createAtom(12)
  const readonlyAtom = createAtom(() => 24)
  const writableStore = createStore(12)
  const readonlyStore = createStore(() => 24)

  expectTypeOf(useSelector(writableAtom)).toEqualTypeOf<Accessor<number>>()
  expectTypeOf(useSelector(readonlyAtom)).toEqualTypeOf<Accessor<number>>()
  expectTypeOf(useSelector(writableStore)).toEqualTypeOf<Accessor<number>>()
  expectTypeOf(useSelector(readonlyStore)).toEqualTypeOf<Accessor<number>>()
})

test('useAtom only accepts writable atoms', () => {
  const writableAtom = createAtom(12)
  const readonlyAtom = createAtom(() => 24)

  const [value, setValue] = useAtom(writableAtom)

  expectTypeOf(value).toEqualTypeOf<Accessor<number>>()
  expectTypeOf(setValue).toBeFunction()
  // @ts-expect-error readonly atoms cannot be used with useAtom
  useAtom(readonlyAtom)
})

test('createStoreContext preserves keyed atom and store types', () => {
  const countAtom = createAtom(12)
  const readonlySource = createStore(() => ({ value: 24 }))
  const storeFactory = createStoreContext<{
    countAtom: typeof countAtom
    readonlyStore: typeof readonlySource
  }>()
  const contextValue = storeFactory.useStoreContext()

  expectTypeOf(contextValue.countAtom).toExtend<Atom<number>>()
  expectTypeOf(contextValue.countAtom.set).toBeFunction()

  const [value, setValue] = useAtom(contextValue.countAtom)
  expectTypeOf(value).toEqualTypeOf<Accessor<number>>()
  expectTypeOf(setValue).toBeFunction()

  const readonlyStore = contextValue.readonlyStore
  expectTypeOf(readonlyStore).toExtend<ReadonlyStore<{ value: number }>>()
  expectTypeOf(readonlyStore).not.toHaveProperty('setState')

  const selected = useSelector(readonlyStore, (state) => state.value)
  expectTypeOf(selected).toEqualTypeOf<Accessor<number>>()
})
