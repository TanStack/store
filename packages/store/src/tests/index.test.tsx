import { describe, test, expect, vi } from 'vitest'
import { Store } from '../index'

describe('store', () => {
  test(`should set the initial value`, () => {
    const store = new Store(0)

    expect(store.state).toEqual(0)
  })

  test(`basic subscriptions should work`, () => {
    const store = new Store(0)

    const subscription = vi.fn()

    const unsub = store.subscribe(subscription)

    store.setState(() => 1)

    expect(store.state).toEqual(1)
    expect(subscription).toHaveBeenCalled()

    unsub()

    store.setState(() => 2)

    expect(store.state).toEqual(2)

    expect(subscription).toHaveBeenCalledTimes(1)
  })

  test(`setState passes previous state`, () => {
    const store = new Store(3)

    store.setState((v) => v + 1)

    expect(store.state).toEqual(4)
  })

  test(`updateFn acts as state transformer`, () => {
    const store = new Store(1, {
      updateFn: (v) => (updater) => Number(updater(v)),
    })

    store.setState((v) => `${v + 1}` as never)

    expect(store.state).toEqual(2)

    store.setState((v) => `${v + 2}` as never)

    expect(store.state).toEqual(4)

    expect(typeof store.state).toEqual('number')
  })

  test('Batch prevents listeners from being called during repeated setStates', () => {
    const store = new Store(0)

    const listener = vi.fn()

    store.subscribe(listener)

    store.batch(() => {
      store.setState(() => 1)
      store.setState(() => 2)
      store.setState(() => 3)
      store.setState(() => 4)
    })

    expect(store.state).toEqual(4)
    // Listener is only called once because of batching
    expect(listener).toHaveBeenCalledTimes(1)

    store.setState(() => 1)
    store.setState(() => 2)
    store.setState(() => 3)
    store.setState(() => 4)

    expect(store.state).toEqual(4)
    // Listener is called 4 times because of a lack of batching
    expect(listener).toHaveBeenCalledTimes(5)
  })

  test('should allow us to pass a flush a value to listeners if we want to', () => {
    const store = new Store<
      number,
      (cb: number) => number,
      (val: number) => void
    >(0)

    const listener = vi.fn()

    store.subscribe(listener)

    store._flush(123)

    expect(listener).toHaveBeenCalledWith(123)
  })

  test('should allow us to pass a batch a value to listeners if we want to', () => {
    const store = new Store<
      number,
      (cb: number) => number,
      (val: number) => void
    >(0)

    const listener = vi.fn()

    store.subscribe(listener)

    store.batch(() => {}, 123)

    expect(listener).toHaveBeenCalledWith(123)
  })

  test('should allow us to pass a setState a value to listeners if we want to', () => {
    const store = new Store<
      number,
      (cb: number) => number,
      (val: number) => void
    >(0)

    const listener = vi.fn()

    store.subscribe(listener)

    store.setState(() => 234, 123)

    expect(listener).toHaveBeenCalledWith(123)
  })
})
