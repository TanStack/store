import { expectTypeOf, test } from 'vitest'
import { createAtom, createStore } from '@tanstack/store'
import {
  injectAtom,
  injectSelector,
  injectSetValue,
  injectStore,
  injectStoreActions,
  injectValue,
} from '../src'
import type { Signal } from '@angular/core'
import type { Atom } from '@tanstack/store'

test('injectSelector works with derived state', () => {
  const store = createStore(12)
  const derived = createStore(() => store.state * 2)

  const val = injectSelector(derived, (state) => {
    expectTypeOf(state).toEqualTypeOf<number>()
    return state
  })

  expectTypeOf(val).toEqualTypeOf<Signal<number>>()
})

test('injectValue infers value from mutable and readonly sources', () => {
  const writableAtom = createAtom(12)
  const readonlyAtom = createAtom(() => 24)
  const writableStore = createStore(12)
  const readonlyStore = createStore(() => 24)

  expectTypeOf(injectValue(writableAtom)).toEqualTypeOf<Signal<number>>()
  expectTypeOf(injectValue(readonlyAtom)).toEqualTypeOf<Signal<number>>()
  expectTypeOf(injectValue(writableStore)).toEqualTypeOf<Signal<number>>()
  expectTypeOf(injectValue(readonlyStore)).toEqualTypeOf<Signal<number>>()
})

test('injectSetValue preserves native setter contracts', () => {
  const writableAtom = createAtom(12)
  const readonlyAtom = createAtom(() => 24)
  const writableStore = createStore(12)
  const readonlyStore = createStore(() => 24)

  expectTypeOf(injectSetValue(writableAtom)).toEqualTypeOf<
    Atom<number>['set']
  >()
  expectTypeOf(injectSetValue(writableStore)).toEqualTypeOf<
    typeof writableStore.setState
  >()
  // @ts-expect-error readonly atoms cannot be set
  injectSetValue(readonlyAtom)
  // @ts-expect-error readonly stores cannot be set
  injectSetValue(readonlyStore)
})

test('injectAtom only accepts writable atoms', () => {
  const writableAtom = createAtom(12)
  const readonlyAtom = createAtom(() => 24)

  const [value, setValue] = injectAtom(writableAtom)

  expectTypeOf(value).toEqualTypeOf<Signal<number>>()
  expectTypeOf(setValue).toBeFunction()
  // @ts-expect-error readonly atoms cannot be used with injectAtom
  injectAtom(readonlyAtom)
})

test('injectStore matches injectSelector types for compatibility', () => {
  const store = createStore(12)
  const selectorValue = injectSelector(store, (state) => state)
  const compatValue = injectStore(store, (state) => state)

  expectTypeOf(selectorValue).toEqualTypeOf<Signal<number>>()
  expectTypeOf(compatValue).toEqualTypeOf<Signal<number>>()
})

test('injectStoreActions infers the action bag from writable stores', () => {
  const store = createStore({ count: 0 }, ({ get, set }) => ({
    inc: () => set((prev) => ({ count: prev.count + 1 })),
    current: () => get().count,
  }))

  const actions = injectStoreActions(store)

  expectTypeOf(actions.inc).toBeFunction()
  expectTypeOf(actions.current()).toExtend<number>()

  const plainStore = createStore(12)
  expectTypeOf(injectStoreActions(plainStore)).toEqualTypeOf<never>()

  const readonlyStore = createStore(() => 24)
  // @ts-expect-error readonly stores do not expose actions
  injectStoreActions(readonlyStore)
})
