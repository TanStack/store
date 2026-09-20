import { expectTypeOf, test } from 'vitest'
import { createAtom, createStore } from '@tanstack/store'
import {
  _injectStore,
  createStoreContext,
  injectAtom,
  injectSelector,
  injectStore,
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

test('injectSelector infers value from mutable and readonly sources', () => {
  const writableAtom = createAtom(12)
  const readonlyAtom = createAtom(() => 24)
  const writableStore = createStore(12)
  const readonlyStore = createStore(() => 24)

  expectTypeOf(injectSelector(writableAtom)).toEqualTypeOf<Signal<number>>()
  expectTypeOf(injectSelector(readonlyAtom)).toEqualTypeOf<Signal<number>>()
  expectTypeOf(injectSelector(writableStore)).toEqualTypeOf<Signal<number>>()
  expectTypeOf(injectSelector(readonlyStore)).toEqualTypeOf<Signal<number>>()
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

test('_injectStore returns callable slice with actions for stores with actions', () => {
  const store = createStore({ count: 0 }, ({ setState }) => ({
    inc: () => setState((prev) => ({ count: prev.count + 1 })),
  }))

  const slice = _injectStore(store, (state) => state.count)

  expectTypeOf(slice).toEqualTypeOf<
    Signal<number> & { inc: () => void }
  >()
})

test('_injectStore returns callable slice with setState for plain stores', () => {
  const store = createStore(0)

  const slice = _injectStore(store, (state) => state)

  expectTypeOf(slice).toEqualTypeOf<
    Signal<number> & { setState: Store<number>['setState'] }
  >()
})
