import { expectTypeOf, test } from 'vitest'
import { createAtom, createStore } from '@tanstack/store'
import {
  useAtom,
  useSelector,
  useSetValue,
  useStore,
  useStoreActions,
  useValue,
} from '../src/index.svelte.js'
import type { Atom } from '@tanstack/store'

test('useSelector works with derived state', () => {
  const store = createStore(12)
  const derived = createStore(() => store.state * 2)

  const val = useSelector(derived, (state) => {
    expectTypeOf(state).toEqualTypeOf<number>()
    return state
  })

  expectTypeOf(val).toEqualTypeOf<{ readonly current: number }>()
})

test('useValue infers value from mutable and readonly sources', () => {
  const writableAtom = createAtom(12)
  const readonlyAtom = createAtom(() => 24)
  const writableStore = createStore(12)
  const readonlyStore = createStore(() => 24)

  expectTypeOf(useValue(writableAtom)).toEqualTypeOf<{
    readonly current: number
  }>()
  expectTypeOf(useValue(readonlyAtom)).toEqualTypeOf<{
    readonly current: number
  }>()
  expectTypeOf(useValue(writableStore)).toEqualTypeOf<{
    readonly current: number
  }>()
  expectTypeOf(useValue(readonlyStore)).toEqualTypeOf<{
    readonly current: number
  }>()
})

test('useSetValue preserves native setter contracts', () => {
  const writableAtom = createAtom(12)
  const readonlyAtom = createAtom(() => 24)
  const writableStore = createStore(12)
  const readonlyStore = createStore(() => 24)

  expectTypeOf(useSetValue(writableAtom)).toEqualTypeOf<Atom<number>['set']>()
  expectTypeOf(useSetValue(writableStore)).toEqualTypeOf<
    typeof writableStore.setState
  >()
  // @ts-expect-error readonly atoms cannot be set
  useSetValue(readonlyAtom)
  // @ts-expect-error readonly stores cannot be set
  useSetValue(readonlyStore)
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

test('useStoreActions infers the action bag from writable stores', () => {
  const store = createStore({ count: 0 }, ({ get, set }) => ({
    inc: () => set((prev) => ({ count: prev.count + 1 })),
    current: () => get().count,
  }))

  const actions = useStoreActions(store)

  expectTypeOf(actions.inc).toBeFunction()
  expectTypeOf(actions.current()).toExtend<number>()

  const plainStore = createStore(12)
  expectTypeOf(useStoreActions(plainStore)).toEqualTypeOf<never>()

  const readonlyStore = createStore(() => 24)
  // @ts-expect-error readonly stores do not expose actions
  useStoreActions(readonlyStore)
})
