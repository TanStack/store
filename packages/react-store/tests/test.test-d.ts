import { expectTypeOf, test } from 'vitest'
import { createAtom, createStore } from '@tanstack/store'
import {
  createStoreContext,
  useAtom,
  useCreateAtom,
  useCreateStore,
  useSelector,
  useSetValue,
  useStore,
  useValue,
} from '../src'
import type { Atom, ReadonlyStore } from '@tanstack/store'

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

test('useValue infers value from mutable and readonly atoms', () => {
  const writableAtom = createAtom(12)
  const readonlyAtom = createAtom(() => 24)
  const writableStore = createStore(12)
  const readonlyStore = createStore(() => 24)

  expectTypeOf(useValue(writableAtom)).toExtend<number>()
  expectTypeOf(useValue(readonlyAtom)).toExtend<number>()
  expectTypeOf(useValue(writableStore)).toExtend<number>()
  expectTypeOf(useValue(readonlyStore)).toExtend<number>()
  expectTypeOf(
    useValue(writableAtom, {
      compare: (prev, next) => prev === next,
    }),
  ).toExtend<number>()
})

test('useSetValue preserves native atom and store setter contracts', () => {
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
  const readonlyStore = useCreateStore(() => 24)

  expectTypeOf(writableStore.state).toExtend<number>()
  expectTypeOf(writableStore.setState).toBeFunction()
  expectTypeOf(readonlyStore.state).toExtend<number>()
  expectTypeOf(readonlyStore).not.toHaveProperty('setState')
})

test('useSelector infers state and selected types for stores', () => {
  const baseStore = createStore(12)
  const derivedStore = createStore(() => {
    return { val: baseStore.state * 2 }
  })

  const val = useSelector(derivedStore, (state) => {
    expectTypeOf(state).toMatchObjectType<{ val: number }>()
    return state.val
  })
  const valWithOptions = useSelector(derivedStore, (state) => state.val, {
    compare: (prev, next) => prev === next,
  })

  expectTypeOf(val).toExtend<number>()
  expectTypeOf(valWithOptions).toExtend<number>()
})

test('useSelector infers state and selected types for atoms', () => {
  const atom = createAtom({ val: 12 })

  const val = useSelector(atom, (state) => {
    expectTypeOf(state).toMatchObjectType<{ val: number }>()
    return state.val
  })

  expectTypeOf(val).toExtend<number>()
})

test('useStore matches useSelector types for compatibility', () => {
  const baseStore = createStore(12)
  const derivedStore = createStore(() => {
    return { val: baseStore.state * 2 }
  })

  const selectorValue = useSelector(derivedStore, (state) => state.val)
  const compatValue = useStore(
    derivedStore,
    (state) => state.val,
    (prev, next) => prev === next,
  )

  expectTypeOf(selectorValue).toExtend<number>()
  expectTypeOf(compatValue).toExtend<number>()
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
  expectTypeOf(useSetValue(contextValue.countAtom)).toBeFunction()

  const [value, setValue] = useAtom(contextValue.countAtom)
  expectTypeOf(value).toExtend<number>()
  expectTypeOf(setValue).toBeFunction()

  const readonlyStore = contextValue.readonlyStore
  expectTypeOf(readonlyStore).toExtend<ReadonlyStore<{ value: number }>>()
  expectTypeOf(readonlyStore).not.toHaveProperty('setState')

  const selected = useSelector(readonlyStore, (state) => state.value)
  expectTypeOf(selected).toExtend<number>()
})
