import { expectTypeOf, test } from 'vitest'
import { createAtom, createStore } from '@tanstack/store'
import { _useStore, useAtom, useSelector, useStore } from '../src'
import type { Accessor } from 'solid-js'
import type { Store } from '@tanstack/store'

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

test('useStore matches useSelector types for compatibility', () => {
  const store = createStore(12)
  const selectorValue = useSelector(store, (state) => state)
  const compatValue = useStore(store, (state) => state)

  expectTypeOf(selectorValue).toEqualTypeOf<Accessor<number>>()
  expectTypeOf(compatValue).toEqualTypeOf<Accessor<number>>()
})

test('_useStore returns actions for stores with actions', () => {
  const store = createStore({ count: 0 }, ({ setState }) => ({
    inc: () => setState((prev) => ({ count: prev.count + 1 })),
  }))

  const [selected, actions] = _useStore(store, (state) => state.count)

  expectTypeOf(selected).toEqualTypeOf<Accessor<number>>()
  expectTypeOf(actions.inc).toBeFunction()
})

test('_useStore returns setState for plain stores', () => {
  const store = createStore(0)

  const [selected, setState] = _useStore(store, (state) => state)

  expectTypeOf(selected).toEqualTypeOf<Accessor<number>>()
  expectTypeOf(setState).toEqualTypeOf<Store<number>['setState']>()
})
