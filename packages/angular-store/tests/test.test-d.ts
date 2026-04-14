import { expectTypeOf, test } from 'vitest'
import { createAtom, createStore } from '@tanstack/store'
import {
  _injectStore,
  createStoreContext,
  injectAtom,
  injectSelector,
  injectStore,
  injectValue,
} from '../src'
import type { Signal } from '@angular/core'
import type { Atom, Store } from '@tanstack/store'
import type { WritableAtomSignal } from '../src'

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

test('injectAtom returns a WritableAtomSignal', () => {
  const writableAtom = createAtom(12)
  const readonlyAtom = createAtom(() => 24)

  const atomSignal = injectAtom(writableAtom)

  expectTypeOf(atomSignal).toEqualTypeOf<WritableAtomSignal<number>>()
  expectTypeOf(atomSignal()).toEqualTypeOf<number>()
  expectTypeOf(atomSignal.set).toEqualTypeOf<Atom<number>['set']>()

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

test('createStoreContext preserves typed context shape', () => {
  const { provideStoreContext, injectStoreContext } = createStoreContext<{
    countAtom: Atom<number>
    petStore: Store<{ cats: number }>
  }>()

  expectTypeOf(provideStoreContext).toBeFunction()
  expectTypeOf(injectStoreContext).toBeFunction()

  const ctx = injectStoreContext()

  expectTypeOf(ctx.countAtom).toEqualTypeOf<Atom<number>>()
  expectTypeOf(ctx.petStore).toEqualTypeOf<Store<{ cats: number }>>()
})

test('_injectStore returns actions for stores with actions', () => {
  const store = createStore({ count: 0 }, ({ setState }) => ({
    inc: () => setState((prev) => ({ count: prev.count + 1 })),
  }))

  const [selected, actions] = _injectStore(store, (state) => state.count)

  expectTypeOf(selected).toEqualTypeOf<Signal<number>>()
  expectTypeOf(actions.inc).toBeFunction()
})

test('_injectStore returns setState for plain stores', () => {
  const store = createStore(0)

  const [selected, setState] = _injectStore(store, (state) => state)

  expectTypeOf(selected).toEqualTypeOf<Signal<number>>()
  expectTypeOf(setState).toEqualTypeOf<Store<number>['setState']>()
})
