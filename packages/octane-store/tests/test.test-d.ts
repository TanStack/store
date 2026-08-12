import { expectTypeOf, test } from 'vitest'
import { createAtom, createStore } from '@tanstack/store'
import {
  createStoreContext,
  useAtom,
  useCreateAtom,
  useCreateStore,
  useSelector,
} from '../src'
import * as binding from '../src'
import type { Atom, ReadonlyStore } from '@tanstack/store'

test('omits the upstream experimental _useStore hook', () => {
  expectTypeOf(binding).not.toHaveProperty('_useStore')
})

test('omits the deprecated useStore hook from the new adapter', () => {
  expectTypeOf(binding).not.toHaveProperty('useStore')
})

test('useCreateAtom returns a writable atom for initial values', () => {
  const atom = useCreateAtom(12)

  expectTypeOf(atom.get()).toExtend<number>()
  expectTypeOf(atom.set).toBeFunction()
})

test('useCreateAtom returns a readonly atom for derived values', () => {
  const atom = useCreateAtom(() => 12, {
    compare: (prev, next) => prev === next,
  })

  expectTypeOf(atom.get()).toExtend<number>()
  expectTypeOf(atom).not.toHaveProperty('set')
})

test('useSelector infers value from mutable and readonly atoms', () => {
  const writableAtom = createAtom(12)
  const readonlyAtom = createAtom(() => 24)
  const writableStore = createStore(12)
  const readonlyStore = createStore(() => 24)

  expectTypeOf(useSelector(writableAtom)).toExtend<number>()
  expectTypeOf(useSelector(readonlyAtom)).toExtend<number>()
  expectTypeOf(useSelector(writableStore)).toExtend<number>()
  expectTypeOf(useSelector(readonlyStore)).toExtend<number>()
  expectTypeOf(
    useSelector(writableAtom, undefined, {
      compare: (prev, next) => prev === next,
    }),
  ).toExtend<number>()
})

test('useAtom only accepts writable atoms', () => {
  const writableAtom = createAtom(12)
  const readonlyAtom = createAtom(() => 24)

  const [value, setValue] = useAtom(writableAtom)
  const [valueWithOptions] = useAtom(writableAtom, {
    compare: (prev, next) => prev === next,
  })

  expectTypeOf(value).toExtend<number>()
  expectTypeOf(valueWithOptions).toExtend<number>()
  expectTypeOf(setValue).toBeFunction()
  // @ts-expect-error readonly atoms cannot be used with useAtom
  useAtom(readonlyAtom)
})

test('useCreateStore returns writable and readonly store types', () => {
  const writableStore = useCreateStore(12)
  const writableStoreWithActions = useCreateStore(
    { count: 0 },
    ({ setState }) => ({
      inc: () => setState((prev) => ({ count: prev.count + 1 })),
    }),
  )
  const readonlyStore = useCreateStore(() => 24)

  expectTypeOf(writableStore.state).toExtend<number>()
  expectTypeOf(writableStore.setState).toBeFunction()
  expectTypeOf(writableStoreWithActions.state).toMatchObjectType<{
    count: number
  }>()
  expectTypeOf(writableStoreWithActions.actions.inc).toBeFunction()
  expectTypeOf(readonlyStore.state).toExtend<number>()
  expectTypeOf(readonlyStore).not.toHaveProperty('setState')

  useCreateStore({ count: 0 }, () => ({
    // @ts-expect-error actions must be functions
    invalid: 123,
    inc: () => {},
  }))
})

test('useSelector infers state and selected types for stores', () => {
  const baseStore = createStore(12)
  const derivedStore = createStore(() => {
    return { value: baseStore.state * 2 }
  })

  const value = useSelector(derivedStore, (state) => {
    expectTypeOf(state).toMatchObjectType<{ value: number }>()
    return state.value
  })
  const valueWithOptions = useSelector(derivedStore, (state) => state.value, {
    compare: (prev, next) => prev === next,
  })

  expectTypeOf(value).toExtend<number>()
  expectTypeOf(valueWithOptions).toExtend<number>()
})

test('useSelector infers state and selected types for atoms', () => {
  const atom = createAtom({ value: 12 })

  const value = useSelector(atom, (state) => {
    expectTypeOf(state).toMatchObjectType<{ value: number }>()
    return state.value
  })

  expectTypeOf(value).toExtend<number>()
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
  expectTypeOf(value).toExtend<number>()
  expectTypeOf(setValue).toBeFunction()

  const readonlyStore = contextValue.readonlyStore
  expectTypeOf(readonlyStore).toExtend<ReadonlyStore<{ value: number }>>()
  expectTypeOf(readonlyStore).not.toHaveProperty('setState')

  const selected = useSelector(readonlyStore, (state) => state.value)
  expectTypeOf(selected).toExtend<number>()
})
