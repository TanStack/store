import { expectTypeOf, test } from 'vitest'
import { createAtom, createStore } from '@tanstack/store'
import {
  _useStore,
  useAtom,
  useSelector,
  useStore,
} from '../src/index.svelte.js'
import type { Store } from '@tanstack/store'

test('useSelector works with derived state', () => {
  const store = createStore(12)
  const derived = createStore(() => store.state * 2)

  const val = useSelector(derived, (state) => {
    expectTypeOf(state).toEqualTypeOf<number>()
    return state
  })

  expectTypeOf(val).toEqualTypeOf<{ readonly current: number }>()
})

test('useSelector infers value from mutable and readonly sources', () => {
  const writableAtom = createAtom(12)
  const readonlyAtom = createAtom(() => 24)
  const writableStore = createStore(12)
  const readonlyStore = createStore(() => 24)

  expectTypeOf(useSelector(writableAtom)).toEqualTypeOf<{
    readonly current: number
  }>()
  expectTypeOf(useSelector(readonlyAtom)).toEqualTypeOf<{
    readonly current: number
  }>()
  expectTypeOf(useSelector(writableStore)).toEqualTypeOf<{
    readonly current: number
  }>()
  expectTypeOf(useSelector(readonlyStore)).toEqualTypeOf<{
    readonly current: number
  }>()
})

test('useAtom only accepts writable atoms', () => {
  const writableAtom = createAtom(12)
  const readonlyAtom = createAtom(() => 24)

  const [value, setValue] = useAtom(writableAtom)

  expectTypeOf(value).toEqualTypeOf<{ readonly current: number }>()
  expectTypeOf(setValue).toBeFunction()
  // @ts-expect-error readonly atoms cannot be used with useAtom
  useAtom(readonlyAtom)
})

test('useStore matches useSelector types for compatibility', () => {
  const store = createStore(12)
  const selectorValue = useSelector(store, (state) => state)
  const compatValue = useStore(store, (state) => state)

  expectTypeOf(selectorValue).toEqualTypeOf<{ readonly current: number }>()
  expectTypeOf(compatValue).toEqualTypeOf<{ readonly current: number }>()
})

test('_useStore returns selected state and second tuple element for stores with actions', () => {
  const store = createStore({ count: 0 }, ({ setState }) => ({
    inc: () => setState((prev) => ({ count: prev.count + 1 })),
  }))

  const result = _useStore(store, (state) => state.count)

  expectTypeOf(result[0]).toEqualTypeOf<{ readonly current: number }>()
  // The second element should be the actions bag
  expectTypeOf(result).toBeArray()
})

test('_useStore returns setState for plain stores', () => {
  const store = createStore(0)

  const [selected, setState] = _useStore(store, (state) => state)

  expectTypeOf(selected).toEqualTypeOf<{ readonly current: number }>()
  expectTypeOf(setState).toEqualTypeOf<Store<number>['setState']>()
})
