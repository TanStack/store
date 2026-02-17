import { describe, expect, test, vi } from 'vitest'
// import { Store } from '../src/index'
import { createStore } from '../src'

describe('store', () => {
  test(`should set the initial value`, () => {
    const store = createStore(0)

    expect(store.state).toEqual(0)
  })

  test(`basic subscriptions should work`, () => {
    const store = createStore(0)

    const subscription = vi.fn()

    const unsub = store.subscribe(subscription).unsubscribe

    store.setState(() => 1)

    expect(store.state).toEqual(1)
    expect(subscription).toHaveBeenCalled()

    unsub()

    store.setState(() => 2)

    expect(store.state).toEqual(2)

    expect(subscription).toHaveBeenCalledTimes(1)
  })

  test(`setState passes previous state`, () => {
    const store = createStore(3)

    store.setState((v) => v + 1)

    expect(store.state).toEqual(4)
  })

  test(`updateFn acts as state transformer`, () => {
    const store = createStore('1')
    const derivedStore = createStore(() => Number(store.state))

    store.setState(() => `${derivedStore.state + 1}` as never)

    expect(derivedStore.state).toEqual(2)

    store.setState(() => `${derivedStore.state + 2}` as never)

    expect(derivedStore.state).toEqual(4)

    expect(typeof derivedStore.state).toEqual('number')
  })

  test('listeners should receive old and new values', () => {
    const store = createStore(12)
    const derivedStore = createStore<{
      prevVal: number | undefined
      currentVal: number
    }>((prev) => ({
      prevVal: prev?.currentVal,
      currentVal: store.state,
    }))
    const fn = vi.fn()
    derivedStore.subscribe(fn)
    store.setState(() => 24)
    expect(fn).toBeCalledWith({ prevVal: 12, currentVal: 24 })
  })
})
