import { describe, expect, test, vi } from 'vitest'
// import { Store } from '../src/index'
import { createAtom } from '@xstate/store'

describe('store', () => {
  test(`should set the initial value`, () => {
    const store = createAtom(0)

    expect(store.get()).toEqual(0)
  })

  test(`basic subscriptions should work`, () => {
    const store = createAtom(0)

    const subscription = vi.fn()

    const unsub = store.subscribe(subscription).unsubscribe

    store.set(1)

    expect(store.get()).toEqual(1)
    expect(subscription).toHaveBeenCalled()

    unsub()

    store.set(2)

    expect(store.get()).toEqual(2)

    expect(subscription).toHaveBeenCalledTimes(1)
  })

  test(`setState passes previous state`, () => {
    const store = createAtom(3)

    store.set((v) => v + 1)

    expect(store.get()).toEqual(4)
  })

  test(`updateFn acts as state transformer`, () => {
    const store = createAtom('1')
    const derivedStore = createAtom(() => Number(store.get()))

    store.set(() => `${derivedStore.get() + 1}` as never)

    expect(derivedStore.get()).toEqual(2)

    store.set(() => `${derivedStore.get() + 2}` as never)

    expect(derivedStore.get()).toEqual(4)

    expect(typeof derivedStore.get()).toEqual('number')
  })

  test('listeners should receive old and new values', () => {
    const store = createAtom(12)
    const derivedStore = createAtom<{
      prevVal: number | undefined
      currentVal: number
    }>((_, prev) => ({
      prevVal: prev?.currentVal,
      currentVal: store.get(),
    }))
    const fn = vi.fn()
    derivedStore.subscribe(fn)
    store.set(() => 24)
    expect(fn).toBeCalledWith({ prevVal: 12, currentVal: 24 })
  })
})
